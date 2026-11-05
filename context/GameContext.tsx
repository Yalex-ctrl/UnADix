import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { CATEGORIES } from '@/data/categories';
import { PLAYER_COLORS } from '@/constants/theme';
import { pickAnyQuestion, pickChallengeAuctionRound, pickQuestion, shuffle, computeAuctionRounds } from '@/lib/gameEngine';
import { buildCommentary, buildFinalCommentary } from '@/lib/commentary';
import { evaluateFinalTrophies, evaluateRoundTrophies, grantTrophy, rankOf } from '@/lib/trophies';
import { clearSavedGame, loadSavedGame, saveFinishedGame, saveGame } from '@/lib/storage';
import { ConnectionMode, GamePhase, GameState, Judgement, Player, Question } from '@/types';

const DEFAULT_ROUNDS = 10;
const CHALLENGE_MAX_ROUNDS = 5;
const BONUS_POINTS = 10;
const STEAL_PENALTY = 2;

function initialState(): GameState {
  return {
    phase: 'idle',
    mode: 'classic',
    connectionMode: 'solo',
    players: [],
    round: 1,
    totalRounds: DEFAULT_ROUNDS,
    categoryOrder: [],
    turnOrder: [],
    levelChoices: {},
    currentTurnIndex: 0,
    currentQuestion: null,
    askedQuestionIds: [],
    lastJudgement: null,
    playerCategories: {},
    challengeRound: 1,
    challengeLevels: [],
    thiefModeEnabled: true,
    tvHost: true,
    thiefCandidates: [],
    braqueursUsed: [],
    braquage: null,
    auctionRounds: [],
    challengeAuctionRound: null,
    auctionWinnerId: null,
    auctionLevel: null,
    bonusDoneRound: 0,
    bonusQuestion: null,
    killer: null,
    finalWinnerId: null,
    challengeTotal: CHALLENGE_MAX_ROUNDS,
    roundCorrectIds: [],
    tenChosenBy: null,
    newTrophies: [],
    commentary: null,
    usedCommentaryIds: [],
    lastRanks: {},
    lastSteal: null,
    prevState: null,
  };
}

type StartOptions = { thiefMode: boolean; tvHost: boolean };

type Action =
  | { type: 'START_GAME'; players: { name: string }[]; totalRounds: number; connectionMode: ConnectionMode; options: StartOptions }
  | { type: 'BEGIN_LEVEL_SELECT' }
  | { type: 'CHOOSE_LEVEL'; playerId: string; level: number }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'JUDGE'; judgement: Judgement }
  | { type: 'BEGIN_BRAQUAGE'; braqueurId: string }
  | { type: 'START_THIEF'; candidateIds: string[] }
  | { type: 'THIEF_JUDGE'; judgement: Judgement }
  | { type: 'SKIP_THIEF' }
  | { type: 'CONTINUE_AFTER_STEAL' }
  | { type: 'RESOLVE_AUCTION'; playerId: string | null; level: number | null }
  | { type: 'NEXT_ROUND' }
  | { type: 'START_CHALLENGE'; rounds: number }
  | { type: 'CHOOSE_CHALLENGE_CATEGORY'; playerId: string; categoryId: string }
  | { type: 'BEGIN_CHALLENGE_ROUND' }
  | { type: 'NEXT_CHALLENGE_ROUND' }
  | { type: 'USE_JOKER' }
  | { type: 'REPLACE_QUESTION' }
  | { type: 'RESOLVE_BONUS'; correctIds: string[] }
  | { type: 'RESOLVE_KILLER'; correctIds: string[] }
  | { type: 'OPEN_ALLIN' }
  | { type: 'START_ALLIN'; challengerId: string; targetId: string }
  | { type: 'CANCEL_ALLIN' }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'UNDO' }
  | { type: 'LOAD'; state: GameState }
  | { type: 'RESET' };

const UNDOABLE = new Set<Action['type']>([
  'CHOOSE_LEVEL',
  'JUDGE',
  'BEGIN_BRAQUAGE',
  'START_THIEF',
  'THIEF_JUDGE',
  'SKIP_THIEF',
  'RESOLVE_AUCTION',
  'USE_JOKER',
  'REPLACE_QUESTION',
  'RESOLVE_BONUS',
  'RESOLVE_KILLER',
]);

function currentCategoryId(state: GameState): string {
  return state.categoryOrder[state.round - 1];
}

function categoryIdForPlayer(state: GameState, playerId: string): string {
  return state.mode === 'challenge' ? state.playerCategories[playerId] : currentCategoryId(state);
}

function levelForPlayer(state: GameState, playerId: string): number {
  return state.mode === 'challenge' ? state.challengeLevels[state.challengeRound - 1] : state.levelChoices[playerId];
}

function activePlayerId(state: GameState): string | undefined {
  if (state.phase === 'thief-attempt') return state.thiefCandidates[0];
  if (state.auctionWinnerId) return state.auctionWinnerId;
  if (state.braquage) return state.braquage.braqueurId;
  return state.turnOrder[state.currentTurnIndex];
}

function mapPlayer(players: Player[], id: string, fn: (p: Player) => Player): Player[] {
  return players.map((p) => (p.id === id ? fn(p) : p));
}

function scoreAnswer(p: Player, level: number, correct: boolean): Player {
  if (!correct) return { ...p, played: p.played + 1, streak: 0, jokerPending: false };
  const streak = p.streak + 1;
  return {
    ...p,
    score: p.score + level,
    played: p.played + 1,
    correct: p.correct + 1,
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    maxLevelWon: Math.max(p.maxLevelWon, level),
    jokerWon: p.jokerWon || p.jokerPending,
    jokerPending: false,
  };
}

// Never leaves a turn without a question: if the category has none at the
// requested level, falls back to another category at the SAME level.
function pickQuestionOrFallback(categoryId: string, level: number, asked: string[]): Question | null {
  return pickQuestion(categoryId, level, asked) ?? pickAnyQuestion(level, asked);
}

function killerQuestion(asked: string[]): Question | null {
  return pickAnyQuestion(10, asked) ?? pickAnyQuestion(9, asked);
}

function startTurn(state: GameState, playerId: string): GameState {
  const question = pickQuestionOrFallback(
    categoryIdForPlayer(state, playerId),
    levelForPlayer(state, playerId),
    state.askedQuestionIds
  );
  return { ...state, phase: 'question', currentQuestion: question, thiefCandidates: [], braquage: null };
}

function goToSummary(state: GameState): GameState {
  const summaryPhase: GamePhase = state.mode === 'challenge' ? 'challenge-round-summary' : 'round-summary';
  const { players, events } = evaluateRoundTrophies(state.players, state.newTrophies, state.roundCorrectIds, state.lastRanks);
  const comment = state.tvHost
    ? buildCommentary({
        players,
        lastRanks: state.lastRanks,
        lastSteal: state.lastSteal,
        roundCorrectIds: state.roundCorrectIds,
        usedIds: state.usedCommentaryIds,
      })
    : null;
  return {
    ...state,
    players,
    newTrophies: events,
    phase: summaryPhase,
    currentQuestion: null,
    thiefCandidates: [],
    braquage: null,
    auctionWinnerId: null,
    auctionLevel: null,
    commentary: comment?.text ?? null,
    usedCommentaryIds: comment ? [...state.usedCommentaryIds, comment.id].slice(-3) : state.usedCommentaryIds,
    lastRanks: rankOf(players),
  };
}

function advanceTurn(state: GameState): GameState {
  const nextIndex = state.currentTurnIndex + 1;
  if (nextIndex >= state.turnOrder.length) {
    return goToSummary(state);
  }
  return startTurn({ ...state, currentTurnIndex: nextIndex }, state.turnOrder[nextIndex]);
}

// In thief mode the answer stays secret until every steal attempt is done:
// a dedicated reveal step follows before moving on.
function finishTurn(state: GameState): GameState {
  if (state.thiefModeEnabled && state.currentQuestion) {
    return { ...state, phase: 'thief-reveal', thiefCandidates: [] };
  }
  return advanceTurn(state);
}

function finishGame(state: GameState, finalPhase: GamePhase): GameState {
  const ranks = rankOf(state.players);
  const winnerId = state.finalWinnerId ?? state.players.find((p) => ranks[p.id] === 1)?.id ?? null;
  const { players, events } = evaluateFinalTrophies(state.players, state.newTrophies, winnerId);
  return {
    ...state,
    players,
    newTrophies: events,
    finalWinnerId: winnerId,
    killer: null,
    phase: finalPhase,
    currentQuestion: null,
    commentary: buildFinalCommentary(players, winnerId),
  };
}

function endGame(state: GameState, finalPhase: GamePhase): GameState {
  const ranks = rankOf(state.players);
  const top = state.players.filter((p) => ranks[p.id] === 1);
  if (top.length >= 2 && !state.finalWinnerId) {
    return {
      ...state,
      phase: 'killer',
      currentQuestion: null,
      killer: {
        contenders: top.map((p) => p.id),
        question: killerQuestion(state.askedQuestionIds),
        context: 'final',
        stake: 0,
        returnPhase: finalPhase,
      },
    };
  }
  return finishGame(state, finalPhase);
}

function coreReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const stamp = Date.now();
      const players: Player[] = action.players.map((p, idx) => ({
        id: `player-${idx}-${stamp}`,
        name: p.name.trim() || `Joueur ${idx + 1}`,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
        score: 0,
        jokerUsed: false,
        jokerPending: false,
        jokerWon: false,
        played: 0,
        correct: 0,
        streak: 0,
        bestStreak: 0,
        levelSum: 0,
        levelCount: 0,
        maxLevelWon: 0,
        stealAttempts: 0,
        stealWins: 0,
        maxStolen: 0,
        trophies: [],
      }));
      const totalRounds = action.totalRounds;
      const playerIds = players.map((p) => p.id);
      return {
        ...initialState(),
        phase: 'round-intro',
        connectionMode: action.connectionMode,
        players,
        totalRounds,
        categoryOrder: shuffle(CATEGORIES.map((c) => c.id)).slice(0, totalRounds),
        turnOrder: shuffle(playerIds),
        auctionRounds: computeAuctionRounds(totalRounds),
        thiefModeEnabled: action.options.thiefMode,
        tvHost: action.options.tvHost,
        lastRanks: rankOf(players),
      };
    }
    case 'BEGIN_LEVEL_SELECT': {
      const base = { ...state, roundCorrectIds: [], newTrophies: [], lastSteal: null, commentary: null };
      if (state.auctionRounds.includes(state.round)) {
        return { ...base, phase: 'auction-bid', auctionWinnerId: null, auctionLevel: null };
      }
      return { ...base, phase: 'level-select', levelChoices: {}, currentTurnIndex: 0 };
    }
    case 'CHOOSE_LEVEL': {
      let players = mapPlayer(state.players, action.playerId, (p) => ({
        ...p,
        levelSum: p.levelSum + action.level,
        levelCount: p.levelCount + 1,
      }));
      let events = state.newTrophies;
      let tenChosenBy = state.tenChosenBy;
      if (action.level === 10 && !tenChosenBy) {
        tenChosenBy = action.playerId;
        ({ players, events } = grantTrophy(players, events, action.playerId, 'aventurier'));
      }
      const levelChoices = { ...state.levelChoices, [action.playerId]: action.level };
      const next = { ...state, players, newTrophies: events, tenChosenBy, levelChoices };
      if (state.currentTurnIndex < state.turnOrder.length - 1) {
        return { ...next, currentTurnIndex: state.currentTurnIndex + 1 };
      }
      return startTurn({ ...next, currentTurnIndex: 0 }, state.turnOrder[0]);
    }
    case 'REVEAL_ANSWER': {
      return { ...state, phase: 'answer-reveal' };
    }
    case 'BEGIN_BRAQUAGE': {
      if (state.phase !== 'question' || state.braquage || state.auctionWinnerId) return state;
      const targetId = state.turnOrder[state.currentTurnIndex];
      if (action.braqueurId === targetId) return state;
      if (state.braqueursUsed.includes(action.braqueurId)) return state;
      return {
        ...state,
        braquage: { braqueurId: action.braqueurId, targetId },
        braqueursUsed: [...state.braqueursUsed, action.braqueurId],
      };
    }
    case 'JUDGE': {
      const askedQuestionIds = state.currentQuestion
        ? [...state.askedQuestionIds, state.currentQuestion.id]
        : state.askedQuestionIds;
      const correct = action.judgement !== 'incorrect';

      if (state.auctionWinnerId) {
        const level = state.auctionLevel ?? 0;
        const players = mapPlayer(state.players, state.auctionWinnerId, (p) => scoreAnswer(p, level, correct));
        const roundCorrectIds = correct ? [...state.roundCorrectIds, state.auctionWinnerId] : state.roundCorrectIds;
        return goToSummary({ ...state, players, askedQuestionIds, roundCorrectIds, lastJudgement: action.judgement });
      }

      if (state.braquage) {
        const level = levelForPlayer(state, state.braquage.targetId);
        const winnerId = correct ? state.braquage.braqueurId : state.braquage.targetId;
        const players = state.players.map((p) => (p.id === winnerId ? { ...p, score: p.score + level } : p));
        return advanceTurn({ ...state, players, askedQuestionIds, lastJudgement: action.judgement, braquage: null });
      }

      const playerId = state.turnOrder[state.currentTurnIndex];
      const level = levelForPlayer(state, playerId);
      const players = mapPlayer(state.players, playerId, (p) => scoreAnswer(p, level, correct));
      const roundCorrectIds = correct ? [...state.roundCorrectIds, playerId] : state.roundCorrectIds;
      const next = { ...state, players, askedQuestionIds, roundCorrectIds, lastJudgement: action.judgement };

      if (!correct && state.thiefModeEnabled && state.players.length > 1) {
        return { ...next, phase: 'thief-offer', thiefCandidates: [] };
      }
      return finishTurn(next);
    }
    case 'START_THIEF': {
      const candidates = shuffle(action.candidateIds);
      if (candidates.length === 0) return finishTurn(state);
      return { ...state, phase: 'thief-attempt', thiefCandidates: candidates };
    }
    case 'THIEF_JUDGE': {
      const thiefId = state.thiefCandidates[0];
      if (!thiefId) return finishTurn(state);
      const victimId = state.turnOrder[state.currentTurnIndex];
      const level = levelForPlayer(state, victimId);
      if (action.judgement !== 'incorrect') {
        const players = mapPlayer(state.players, thiefId, (p) => ({
          ...p,
          score: p.score + level,
          stealAttempts: p.stealAttempts + 1,
          stealWins: p.stealWins + 1,
          maxStolen: Math.max(p.maxStolen, level),
        }));
        return finishTurn({ ...state, players, lastSteal: { thiefId, victimId, level } });
      }
      const players = mapPlayer(state.players, thiefId, (p) => ({
        ...p,
        score: p.score - STEAL_PENALTY,
        stealAttempts: p.stealAttempts + 1,
      }));
      const rest = state.thiefCandidates.slice(1);
      if (rest.length === 0) return finishTurn({ ...state, players });
      return { ...state, players, thiefCandidates: rest };
    }
    case 'SKIP_THIEF': {
      const rest = state.thiefCandidates.slice(1);
      if (rest.length === 0) return finishTurn(state);
      return { ...state, thiefCandidates: rest };
    }
    case 'CONTINUE_AFTER_STEAL': {
      return advanceTurn(state);
    }
    case 'RESOLVE_AUCTION': {
      if (!action.playerId || !action.level) {
        return goToSummary(state);
      }
      const level = action.level;
      const question = pickQuestionOrFallback(categoryIdForPlayer(state, action.playerId), level, state.askedQuestionIds);
      return {
        ...state,
        players: mapPlayer(state.players, action.playerId, (p) => ({
          ...p,
          levelSum: p.levelSum + level,
          levelCount: p.levelCount + 1,
        })),
        phase: 'question',
        currentQuestion: question,
        auctionWinnerId: action.playerId,
        auctionLevel: level,
      };
    }
    case 'USE_JOKER': {
      if (state.phase !== 'question' || state.braquage || state.auctionWinnerId || !state.currentQuestion) return state;
      const playerId = state.turnOrder[state.currentTurnIndex];
      const player = state.players.find((p) => p.id === playerId);
      if (!player || player.jokerUsed) return state;
      const asked = [...state.askedQuestionIds, state.currentQuestion.id];
      const replacement = pickQuestionOrFallback(categoryIdForPlayer(state, playerId), levelForPlayer(state, playerId), asked);
      if (!replacement || asked.includes(replacement.id)) return state;
      return {
        ...state,
        players: mapPlayer(state.players, playerId, (p) => ({ ...p, jokerUsed: true, jokerPending: true })),
        currentQuestion: replacement,
        askedQuestionIds: asked,
      };
    }
    case 'REPLACE_QUESTION': {
      // Reports a faulty question: swaps it for another at the same level
      // without consuming the joker. The flagged question is excluded.
      if (state.phase !== 'question' || !state.currentQuestion) return state;
      const ownerId = state.auctionWinnerId ?? state.turnOrder[state.currentTurnIndex];
      const level = state.auctionLevel ?? levelForPlayer(state, state.turnOrder[state.currentTurnIndex]);
      const asked = [...state.askedQuestionIds, state.currentQuestion.id];
      const replacement = pickQuestionOrFallback(categoryIdForPlayer(state, ownerId), level, asked);
      if (!replacement || asked.includes(replacement.id)) return state;
      return { ...state, currentQuestion: replacement, askedQuestionIds: asked };
    }
    case 'NEXT_ROUND': {
      if (state.round % 3 === 0 && state.bonusDoneRound !== state.round) {
        return {
          ...state,
          phase: 'bonus-question',
          bonusDoneRound: state.round,
          bonusQuestion: killerQuestion(state.askedQuestionIds),
        };
      }
      if (state.round >= state.totalRounds) {
        return endGame(state, 'final-results');
      }
      return {
        ...state,
        phase: 'round-intro',
        round: state.round + 1,
        turnOrder: shuffle(state.players.map((p) => p.id)),
        levelChoices: {},
        currentTurnIndex: 0,
        currentQuestion: null,
        braquage: null,
        auctionWinnerId: null,
        auctionLevel: null,
      };
    }
    case 'RESOLVE_BONUS': {
      const asked = state.bonusQuestion ? [...state.askedQuestionIds, state.bonusQuestion.id] : state.askedQuestionIds;
      const base = { ...state, askedQuestionIds: asked, bonusQuestion: null };
      if (action.correctIds.length === 0) return { ...base, phase: 'round-summary' };
      if (action.correctIds.length === 1) {
        return {
          ...base,
          phase: 'round-summary',
          players: mapPlayer(state.players, action.correctIds[0], (p) => ({ ...p, score: p.score + BONUS_POINTS })),
        };
      }
      return {
        ...base,
        phase: 'killer',
        killer: {
          contenders: action.correctIds,
          question: killerQuestion(asked),
          context: 'bonus',
          stake: BONUS_POINTS,
          returnPhase: 'round-summary',
        },
      };
    }
    case 'RESOLVE_KILLER': {
      const k = state.killer;
      if (!k) return state;
      const asked = k.question ? [...state.askedQuestionIds, k.question.id] : state.askedQuestionIds;
      const correct = action.correctIds.filter((id) => k.contenders.includes(id));
      if (correct.length !== 1) {
        return { ...state, askedQuestionIds: asked, killer: { ...k, question: killerQuestion(asked) } };
      }
      const winnerId = correct[0];
      const base = { ...state, askedQuestionIds: asked, killer: null };
      if (k.context === 'final') {
        return finishGame({ ...base, finalWinnerId: winnerId }, k.returnPhase);
      }
      if (k.context === 'bonus') {
        return {
          ...base,
          phase: k.returnPhase,
          players: mapPlayer(state.players, winnerId, (p) => ({ ...p, score: p.score + k.stake })),
        };
      }
      const loserId = k.contenders.find((id) => id !== winnerId);
      const players = state.players.map((p) =>
        p.id === winnerId ? { ...p, score: p.score + k.stake } : p.id === loserId ? { ...p, score: p.score - k.stake } : p
      );
      return { ...base, players, phase: k.returnPhase, lastRanks: rankOf(players) };
    }
    case 'OPEN_ALLIN': {
      if (state.phase !== 'round-summary' && state.phase !== 'challenge-round-summary') return state;
      return {
        ...state,
        phase: 'allin-setup',
        killer: { contenders: [], question: null, context: 'allin', stake: 0, returnPhase: state.phase },
      };
    }
    case 'START_ALLIN': {
      const k = state.killer;
      const challenger = state.players.find((p) => p.id === action.challengerId);
      const target = state.players.find((p) => p.id === action.targetId);
      if (!k || !challenger || !target || challenger.score <= 0 || target.score < challenger.score) return state;
      const level = 8 + Math.floor(Math.random() * 3);
      return {
        ...state,
        phase: 'killer',
        killer: {
          ...k,
          contenders: [challenger.id, target.id],
          stake: challenger.score,
          question: pickAnyQuestion(level, state.askedQuestionIds) ?? killerQuestion(state.askedQuestionIds),
        },
      };
    }
    case 'CANCEL_ALLIN': {
      if (!state.killer) return state;
      return { ...state, phase: state.killer.returnPhase, killer: null };
    }
    case 'REMOVE_PLAYER': {
      if (state.phase !== 'round-summary' && state.phase !== 'challenge-round-summary') return state;
      if (state.players.length <= 2) return state;
      const players = state.players.filter((p) => p.id !== action.playerId);
      const turnOrder = state.turnOrder.filter((id) => id !== action.playerId);
      const lastRanks = { ...state.lastRanks };
      delete lastRanks[action.playerId];
      const levelChoices = { ...state.levelChoices };
      delete levelChoices[action.playerId];
      return {
        ...state,
        players,
        turnOrder,
        levelChoices,
        lastRanks,
        currentTurnIndex: Math.min(state.currentTurnIndex, Math.max(turnOrder.length - 1, 0)),
        roundCorrectIds: state.roundCorrectIds.filter((id) => id !== action.playerId),
        newTrophies: state.newTrophies.filter((t) => t.playerId !== action.playerId),
      };
    }
    case 'START_CHALLENGE': {
      const playerIds = state.players.map((p) => p.id);
      const rounds = Math.min(Math.max(action.rounds, 1), CHALLENGE_MAX_ROUNDS);
      return {
        ...state,
        mode: 'challenge',
        phase: 'challenge-category-select',
        playerCategories: {},
        turnOrder: shuffle(playerIds),
        currentTurnIndex: 0,
        challengeRound: 1,
        challengeTotal: rounds,
        // Same level (5-10) for everybody during a challenge round.
        challengeLevels: Array.from({ length: rounds }, () => 5 + Math.floor(Math.random() * 6)),
        challengeAuctionRound: pickChallengeAuctionRound(rounds),
        currentQuestion: null,
        braqueursUsed: [],
        braquage: null,
        auctionWinnerId: null,
        auctionLevel: null,
        finalWinnerId: null,
        killer: null,
        commentary: null,
        newTrophies: [],
      };
    }
    case 'CHOOSE_CHALLENGE_CATEGORY': {
      const playerCategories = { ...state.playerCategories, [action.playerId]: action.categoryId };
      if (state.currentTurnIndex < state.turnOrder.length - 1) {
        return { ...state, playerCategories, currentTurnIndex: state.currentTurnIndex + 1 };
      }
      return {
        ...state,
        playerCategories,
        phase: 'challenge-round-intro',
        currentTurnIndex: 0,
        turnOrder: shuffle(state.players.map((p) => p.id)),
      };
    }
    case 'BEGIN_CHALLENGE_ROUND': {
      const base = { ...state, roundCorrectIds: [], newTrophies: [], lastSteal: null, commentary: null };
      if (state.challengeAuctionRound === state.challengeRound) {
        return { ...base, phase: 'auction-bid', currentTurnIndex: 0, auctionWinnerId: null, auctionLevel: null };
      }
      return startTurn({ ...base, currentTurnIndex: 0 }, state.turnOrder[0]);
    }
    case 'NEXT_CHALLENGE_ROUND': {
      if (state.challengeRound >= state.challengeTotal) {
        return endGame(state, 'challenge-final-results');
      }
      return {
        ...state,
        phase: 'challenge-round-intro',
        challengeRound: state.challengeRound + 1,
        turnOrder: shuffle(state.players.map((p) => p.id)),
        currentTurnIndex: 0,
        currentQuestion: null,
        braquage: null,
        auctionWinnerId: null,
        auctionLevel: null,
      };
    }
    case 'LOAD': {
      return action.state;
    }
    case 'RESET': {
      return initialState();
    }
    default:
      return state;
  }
}

// Wraps the core reducer with a one-step undo: every undoable action stores
// the state it started from, any other action clears it.
function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'UNDO') {
    return state.prevState ? { ...state.prevState, prevState: null } : state;
  }
  const next = coreReducer(state, action);
  if (next === state) return state;
  if (UNDOABLE.has(action.type)) return { ...next, prevState: { ...state, prevState: null } };
  return { ...next, prevState: null };
}

type GameContextValue = {
  state: GameState;
  hydrated: boolean;
  startGame: (
    players: { name: string }[],
    totalRounds: number,
    connectionMode: ConnectionMode,
    options?: Partial<StartOptions>
  ) => void;
  beginLevelSelect: () => void;
  chooseLevel: (playerId: string, level: number) => void;
  revealAnswer: () => void;
  judge: (judgement: Judgement) => void;
  beginBraquage: (braqueurId: string) => void;
  startThief: (candidateIds: string[]) => void;
  thiefJudge: (judgement: Judgement) => void;
  skipThief: () => void;
  continueAfterSteal: () => void;
  resolveAuction: (playerId: string | null, level: number | null) => void;
  nextRound: () => void;
  startChallenge: (rounds: number) => void;
  chooseChallengeCategory: (playerId: string, categoryId: string) => void;
  beginChallengeRound: () => void;
  nextChallengeRound: () => void;
  playJoker: () => void;
  replaceQuestion: () => void;
  resolveBonus: (correctIds: string[]) => void;
  resolveKiller: (correctIds: string[]) => void;
  openAllIn: () => void;
  startAllIn: (challengerId: string, targetId: string) => void;
  cancelAllIn: () => void;
  removePlayer: (playerId: string) => void;
  undo: () => void;
  reset: () => void;
  currentCategory: () => (typeof CATEGORIES)[number] | undefined;
  currentPlayer: () => Player | undefined;
  currentPlayerCategory: () => (typeof CATEGORIES)[number] | undefined;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadSavedGame().then((saved) => {
      if (saved && saved.players?.[0]?.trophies) dispatch({ type: 'LOAD', state: saved });
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (state.phase === 'idle') {
      clearSavedGame();
    } else if (state.phase === 'final-results' || state.phase === 'challenge-final-results') {
      saveFinishedGame(state);
      clearSavedGame();
    } else {
      saveGame(state);
    }
  }, [state, hydrated]);

  const startGame = useCallback<GameContextValue['startGame']>(
    (players, totalRounds, connectionMode, options) =>
      dispatch({
        type: 'START_GAME',
        players,
        totalRounds,
        connectionMode,
        options: { thiefMode: options?.thiefMode ?? true, tvHost: options?.tvHost ?? true },
      }),
    []
  );
  const beginLevelSelect = useCallback(() => dispatch({ type: 'BEGIN_LEVEL_SELECT' }), []);
  const chooseLevel = useCallback(
    (playerId: string, level: number) => dispatch({ type: 'CHOOSE_LEVEL', playerId, level }),
    []
  );
  const revealAnswer = useCallback(() => dispatch({ type: 'REVEAL_ANSWER' }), []);
  const judge = useCallback((judgement: Judgement) => dispatch({ type: 'JUDGE', judgement }), []);
  const beginBraquage = useCallback((braqueurId: string) => dispatch({ type: 'BEGIN_BRAQUAGE', braqueurId }), []);
  const startThief = useCallback((candidateIds: string[]) => dispatch({ type: 'START_THIEF', candidateIds }), []);
  const thiefJudge = useCallback((judgement: Judgement) => dispatch({ type: 'THIEF_JUDGE', judgement }), []);
  const skipThief = useCallback(() => dispatch({ type: 'SKIP_THIEF' }), []);
  const continueAfterSteal = useCallback(() => dispatch({ type: 'CONTINUE_AFTER_STEAL' }), []);
  const resolveAuction = useCallback(
    (playerId: string | null, level: number | null) => dispatch({ type: 'RESOLVE_AUCTION', playerId, level }),
    []
  );
  const nextRound = useCallback(() => dispatch({ type: 'NEXT_ROUND' }), []);
  const startChallenge = useCallback((rounds: number) => dispatch({ type: 'START_CHALLENGE', rounds }), []);
  const chooseChallengeCategory = useCallback(
    (playerId: string, categoryId: string) => dispatch({ type: 'CHOOSE_CHALLENGE_CATEGORY', playerId, categoryId }),
    []
  );
  const beginChallengeRound = useCallback(() => dispatch({ type: 'BEGIN_CHALLENGE_ROUND' }), []);
  const nextChallengeRound = useCallback(() => dispatch({ type: 'NEXT_CHALLENGE_ROUND' }), []);
  const playJoker = useCallback(() => dispatch({ type: 'USE_JOKER' }), []);
  const replaceQuestion = useCallback(() => dispatch({ type: 'REPLACE_QUESTION' }), []);
  const resolveBonus = useCallback((correctIds: string[]) => dispatch({ type: 'RESOLVE_BONUS', correctIds }), []);
  const resolveKiller = useCallback((correctIds: string[]) => dispatch({ type: 'RESOLVE_KILLER', correctIds }), []);
  const openAllIn = useCallback(() => dispatch({ type: 'OPEN_ALLIN' }), []);
  const startAllIn = useCallback(
    (challengerId: string, targetId: string) => dispatch({ type: 'START_ALLIN', challengerId, targetId }),
    []
  );
  const cancelAllIn = useCallback(() => dispatch({ type: 'CANCEL_ALLIN' }), []);
  const removePlayer = useCallback((playerId: string) => dispatch({ type: 'REMOVE_PLAYER', playerId }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const currentCategory = useCallback(
    () => CATEGORIES.find((c) => c.id === state.categoryOrder[state.round - 1]),
    [state.categoryOrder, state.round]
  );
  const currentPlayer = useCallback(() => state.players.find((p) => p.id === activePlayerId(state)), [state]);
  const currentPlayerCategory = useCallback(() => {
    const playerId = activePlayerId(state);
    return CATEGORIES.find((c) => c.id === state.playerCategories[playerId ?? '']);
  }, [state]);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      hydrated,
      startGame,
      beginLevelSelect,
      chooseLevel,
      revealAnswer,
      judge,
      beginBraquage,
      startThief,
      thiefJudge,
      skipThief,
      continueAfterSteal,
      resolveAuction,
      nextRound,
      startChallenge,
      chooseChallengeCategory,
      beginChallengeRound,
      nextChallengeRound,
      playJoker,
      replaceQuestion,
      resolveBonus,
      resolveKiller,
      openAllIn,
      startAllIn,
      cancelAllIn,
      removePlayer,
      undo,
      reset,
      currentCategory,
      currentPlayer,
      currentPlayerCategory,
    }),
    [
      state,
      hydrated,
      startGame,
      beginLevelSelect,
      chooseLevel,
      revealAnswer,
      judge,
      beginBraquage,
      startThief,
      thiefJudge,
      skipThief,
      continueAfterSteal,
      resolveAuction,
      nextRound,
      startChallenge,
      chooseChallengeCategory,
      beginChallengeRound,
      nextChallengeRound,
      playJoker,
      replaceQuestion,
      resolveBonus,
      resolveKiller,
      openAllIn,
      startAllIn,
      cancelAllIn,
      removePlayer,
      undo,
      reset,
      currentCategory,
      currentPlayer,
      currentPlayerCategory,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
