// Moteur de jeu pur (aucune dépendance React / UI) : l'état, les actions et le
// réducteur. Testé dans __tests__/.
import { CATEGORIES } from '@/data/categories';
import { PLAYER_COLORS } from '@/theme/tokens';
import {
  computeAuctionRounds,
  pickAnyQuestion,
  pickChallengeAuctionRound,
  pickFreshAny,
  pickFreshQuestion,
  pickQuestion,
  shuffle,
} from '@/lib/gameEngine';
import { buildCommentary, buildFinalCommentary } from '@/lib/commentary';
import { evaluateFinalTrophies, evaluateRoundTrophies, grantTrophy, rankOf } from '@/lib/trophies';
import { ConnectionMode, GamePhase, GameState, Judgement, Player, Question } from '@/types';

export const STATE_VERSION = 2;
const DEFAULT_ROUNDS = 10;
export const CHALLENGE_MAX_ROUNDS = 5;
export const BONUS_POINTS = 10;
export const STEAL_PENALTY = 2;

export function initialState(): GameState {
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
    roundAttemptIds: [],
    tenChosenBy: null,
    newTrophies: [],
    commentary: null,
    usedCommentaryIds: [],
    lastRanks: {},
    rankDeltas: {},
    lastSteal: null,
    prevState: null,
  };
}

export type StartOptions = { thiefMode: boolean; tvHost: boolean };

export type Action =
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
  | { type: 'ACK_TROPHIES' }
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
  'CONTINUE_AFTER_STEAL',
  'RESOLVE_AUCTION',
  'USE_JOKER',
  'REPLACE_QUESTION',
  'RESOLVE_BONUS',
  'RESOLVE_KILLER',
]);

// --- Sélecteurs -------------------------------------------------------------

function currentCategoryId(state: GameState): string {
  return state.categoryOrder[state.round - 1];
}

export function categoryIdForPlayer(state: GameState, playerId: string): string {
  return state.mode === 'challenge' ? state.playerCategories[playerId] : currentCategoryId(state);
}

export function levelForPlayer(state: GameState, playerId: string): number {
  return state.mode === 'challenge' ? state.challengeLevels[state.challengeRound - 1] : state.levelChoices[playerId];
}

export function activePlayerId(state: GameState): string | undefined {
  if (state.phase === 'thief-attempt') return state.thiefCandidates[0];
  if (state.auctionWinnerId) return state.auctionWinnerId;
  if (state.braquage) return state.braquage.braqueurId;
  return state.turnOrder[state.currentTurnIndex];
}

// Un duel All-In n'est possible que si un joueur a des points à miser ET qu'un
// adversaire en a au moins autant pour accepter.
export function validAllInChallengers(players: Player[]): Player[] {
  return players.filter((c) => c.score > 0 && players.some((t) => t.id !== c.id && t.score >= c.score));
}

export function allInTargetsFor(players: Player[], challengerId: string): Player[] {
  const challenger = players.find((p) => p.id === challengerId);
  if (!challenger || challenger.score <= 0) return [];
  return players.filter((p) => p.id !== challenger.id && p.score >= challenger.score);
}

export function canAllIn(players: Player[]): boolean {
  return validAllInChallengers(players).length > 0;
}

// --- Aides ------------------------------------------------------------------

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

// Ne laisse jamais un tour sans question. Ordre : inédite dans la catégorie,
// inédite au même niveau dans une autre catégorie, puis (dernier recours) une
// question déjà vue. Le niveau demandé n'est jamais modifié.
function pickQuestionOrFallback(categoryId: string, level: number, asked: string[]): Question | null {
  return (
    pickFreshQuestion(categoryId, level, asked) ??
    pickFreshAny(level, asked) ??
    pickQuestion(categoryId, level, asked) ??
    pickAnyQuestion(level, asked)
  );
}

function killerQuestion(asked: string[]): Question | null {
  return pickFreshAny(10, asked) ?? pickAnyQuestion(10, asked) ?? pickFreshAny(9, asked) ?? pickAnyQuestion(9, asked);
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
  const { players, events } = evaluateRoundTrophies(
    state.players,
    state.newTrophies,
    state.roundCorrectIds,
    state.roundAttemptIds,
    state.lastRanks
  );
  const newRanks = rankOf(players);
  const rankDeltas: Record<string, number> = {};
  for (const p of players) rankDeltas[p.id] = (state.lastRanks[p.id] ?? newRanks[p.id]) - newRanks[p.id];
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
    lastRanks: newRanks,
    rankDeltas,
  };
}

function advanceTurn(state: GameState): GameState {
  const nextIndex = state.currentTurnIndex + 1;
  if (nextIndex >= state.turnOrder.length) {
    return goToSummary(state);
  }
  return startTurn({ ...state, currentTurnIndex: nextIndex }, state.turnOrder[nextIndex]);
}

// En mode Voleur la réponse reste secrète jusqu'à la fin des tentatives de vol :
// une étape de révélation dédiée précède le joueur suivant.
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

// --- Réducteur --------------------------------------------------------------

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
      const base = { ...state, roundCorrectIds: [], roundAttemptIds: [], newTrophies: [], lastSteal: null, commentary: null };
      if (state.auctionRounds.includes(state.round)) {
        return { ...base, phase: 'auction-bid', auctionWinnerId: null, auctionLevel: null };
      }
      return { ...base, phase: 'level-select', levelChoices: {}, currentTurnIndex: 0 };
    }
    case 'CHOOSE_LEVEL': {
      // Deux joueurs ne peuvent jamais avoir le même niveau dans une manche.
      const takenByOther = Object.entries(state.levelChoices).some(
        ([id, lvl]) => id !== action.playerId && lvl === action.level
      );
      if (takenByOther || action.level < 1 || action.level > 10) return state;
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
        return goToSummary({
          ...state,
          players,
          askedQuestionIds,
          roundCorrectIds: correct ? [...state.roundCorrectIds, state.auctionWinnerId] : state.roundCorrectIds,
          roundAttemptIds: [...state.roundAttemptIds, state.auctionWinnerId],
          lastJudgement: action.judgement,
        });
      }

      if (state.braquage) {
        // La question braquée compte comme tentée par le braqueur, pas par le
        // braqué. Si le braqueur se trompe, le braqué récupère les points.
        const { braqueurId, targetId } = state.braquage;
        const level = levelForPlayer(state, targetId);
        let players = mapPlayer(state.players, braqueurId, (p) => ({
          ...scoreAnswer(p, level, correct),
          stealAttempts: p.stealAttempts + 1,
          stealWins: p.stealWins + (correct ? 1 : 0),
          maxStolen: correct ? Math.max(p.maxStolen, level) : p.maxStolen,
        }));
        if (!correct) players = mapPlayer(players, targetId, (p) => ({ ...p, score: p.score + level }));
        return advanceTurn({
          ...state,
          players,
          askedQuestionIds,
          roundCorrectIds: correct ? [...state.roundCorrectIds, braqueurId] : state.roundCorrectIds,
          roundAttemptIds: [...state.roundAttemptIds, braqueurId],
          lastSteal: correct ? { thiefId: braqueurId, victimId: targetId, level } : state.lastSteal,
          lastJudgement: action.judgement,
          braquage: null,
        });
      }

      const playerId = state.turnOrder[state.currentTurnIndex];
      const level = levelForPlayer(state, playerId);
      const players = mapPlayer(state.players, playerId, (p) => scoreAnswer(p, level, correct));
      const next = {
        ...state,
        players,
        askedQuestionIds,
        roundCorrectIds: correct ? [...state.roundCorrectIds, playerId] : state.roundCorrectIds,
        roundAttemptIds: [...state.roundAttemptIds, playerId],
        lastJudgement: action.judgement,
      };

      if (!correct && state.thiefModeEnabled && state.players.length > 1) {
        return { ...next, phase: 'thief-offer', thiefCandidates: [] };
      }
      return finishTurn(next);
    }
    case 'START_THIEF': {
      if (state.phase !== 'thief-offer') return state;
      const victimId = state.turnOrder[state.currentTurnIndex];
      const valid = action.candidateIds.filter((id) => id !== victimId && state.players.some((p) => p.id === id));
      const candidates = shuffle(Array.from(new Set(valid)));
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
      if (state.phase !== 'thief-reveal') return state;
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
      const level = levelForPlayer(state, playerId);
      const replacement =
        pickFreshQuestion(categoryIdForPlayer(state, playerId), level, asked) ?? pickFreshAny(level, asked);
      if (!replacement) return state;
      return {
        ...state,
        players: mapPlayer(state.players, playerId, (p) => ({ ...p, jokerUsed: true, jokerPending: true })),
        currentQuestion: replacement,
        askedQuestionIds: asked,
      };
    }
    case 'REPLACE_QUESTION': {
      // Question signalée : remplacée par une autre du même niveau, sans
      // consommer le joker. La question signalée est exclue.
      if (state.phase !== 'question' || !state.currentQuestion) return state;
      const ownerId = state.auctionWinnerId ?? state.turnOrder[state.currentTurnIndex];
      const level = state.auctionLevel ?? levelForPlayer(state, state.turnOrder[state.currentTurnIndex]);
      const asked = [...state.askedQuestionIds, state.currentQuestion.id];
      const replacement = pickFreshQuestion(categoryIdForPlayer(state, ownerId), level, asked) ?? pickFreshAny(level, asked);
      if (!replacement) return state;
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
      const base = { ...state, askedQuestionIds: asked, bonusQuestion: null, newTrophies: [] };
      if (action.correctIds.length === 0) return { ...base, phase: 'round-summary' };
      if (action.correctIds.length === 1) {
        const players = mapPlayer(state.players, action.correctIds[0], (p) => ({ ...p, score: p.score + BONUS_POINTS }));
        return { ...base, phase: 'round-summary', players, lastRanks: rankOf(players) };
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
      const base = { ...state, askedQuestionIds: asked, killer: null, newTrophies: [] };
      if (k.context === 'final') {
        return finishGame({ ...base, finalWinnerId: winnerId }, k.returnPhase);
      }
      if (k.context === 'bonus') {
        const players = mapPlayer(state.players, winnerId, (p) => ({ ...p, score: p.score + k.stake }));
        return { ...base, players, phase: k.returnPhase, lastRanks: rankOf(players) };
      }
      const loserId = k.contenders.find((id) => id !== winnerId);
      const players = state.players.map((p) =>
        p.id === winnerId ? { ...p, score: p.score + k.stake } : p.id === loserId ? { ...p, score: p.score - k.stake } : p
      );
      return { ...base, players, phase: k.returnPhase, lastRanks: rankOf(players) };
    }
    case 'OPEN_ALLIN': {
      if (state.phase !== 'round-summary' && state.phase !== 'challenge-round-summary') return state;
      if (!canAllIn(state.players)) return state;
      return {
        ...state,
        phase: 'allin-setup',
        killer: { contenders: [], question: null, context: 'allin', stake: 0, returnPhase: state.phase },
      };
    }
    case 'START_ALLIN': {
      const k = state.killer;
      if (!k || state.phase !== 'allin-setup') return state;
      const challenger = state.players.find((p) => p.id === action.challengerId);
      const target = allInTargetsFor(state.players, action.challengerId).find((p) => p.id === action.targetId);
      if (!challenger || !target) return state;
      const level = 8 + Math.floor(Math.random() * 3);
      return {
        ...state,
        phase: 'killer',
        killer: {
          ...k,
          contenders: [challenger.id, target.id],
          stake: challenger.score,
          question: pickFreshAny(level, state.askedQuestionIds) ?? killerQuestion(state.askedQuestionIds),
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
        roundAttemptIds: state.roundAttemptIds.filter((id) => id !== action.playerId),
        newTrophies: state.newTrophies.filter((t) => t.playerId !== action.playerId),
        braqueursUsed: state.braqueursUsed.filter((id) => id !== action.playerId),
      };
    }
    case 'ACK_TROPHIES': {
      return state.newTrophies.length === 0 ? state : { ...state, newTrophies: [] };
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
        // Même niveau (5 à 10) pour tout le monde pendant une manche Challenger.
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
      const base = { ...state, roundCorrectIds: [], roundAttemptIds: [], newTrophies: [], lastSteal: null, commentary: null };
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

// Ajoute l'annulation d'une étape : chaque action annulable mémorise l'état
// dont elle part ; toute autre action efface cette mémoire.
export function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'UNDO') {
    return state.prevState ? { ...state.prevState, prevState: null } : state;
  }
  const next = coreReducer(state, action);
  if (next === state) return state;
  if (UNDOABLE.has(action.type)) return { ...next, prevState: { ...state, prevState: null } };
  return { ...next, prevState: null };
}

// --- Migration des sauvegardes ---------------------------------------------

const PLAYER_DEFAULTS = {
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
};

// Remet une sauvegarde (de n'importe quelle version précédente) à la forme
// actuelle : champs manquants complétés, anciens champs convertis.
export function migrateState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw as Record<string, unknown> & { players?: Record<string, unknown>[] };
  if (!Array.isArray(src.players) || typeof src.phase !== 'string') return null;

  const base = initialState();
  const players = src.players.map((p, idx) => ({
    ...PLAYER_DEFAULTS,
    color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
    trophies: [] as string[],
    ...p,
  })) as unknown as Player[];

  const migrated: GameState = { ...base, ...(src as unknown as Partial<GameState>), players, prevState: null };

  // Ancien « voleur du tour » : le voleur désigné devient l'unique candidat.
  const legacyThief = (src as { thiefOfTurnId?: string | null }).thiefOfTurnId;
  if (migrated.phase === 'thief-attempt' && migrated.thiefCandidates.length === 0) {
    if (legacyThief) migrated.thiefCandidates = [legacyThief];
    else migrated.phase = 'thief-reveal';
  }
  if (typeof (src as { thiefModeEnabled?: unknown }).thiefModeEnabled !== 'boolean') migrated.thiefModeEnabled = true;
  if (!Array.isArray(migrated.roundAttemptIds)) migrated.roundAttemptIds = [];
  if (!migrated.rankDeltas || typeof migrated.rankDeltas !== 'object') migrated.rankDeltas = {};
  return migrated;
}
