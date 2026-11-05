import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { CATEGORIES } from '@/data/categories';
import { activePlayerId, initialState, reducer, StartOptions } from '@/lib/gameReducer';
import { clearSavedGame, loadSavedGame, saveFinishedGame, saveGame } from '@/lib/storage';
import { ConnectionMode, GameState, Judgement, Player } from '@/types';

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
  ackTrophies: () => void;
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
      if (saved) dispatch({ type: 'LOAD', state: saved });
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
  const ackTrophies = useCallback(() => dispatch({ type: 'ACK_TROPHIES' }), []);
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
      ackTrophies,
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
      ackTrophies,
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
