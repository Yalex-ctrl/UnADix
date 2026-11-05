import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES } from '@/data/categories';
import { migrateState, STATE_VERSION } from '@/lib/gameReducer';
import { GameState } from '@/types';

const SAVED_GAME_KEY = 'unadix:savedGame';
const HISTORY_KEY = 'unadix:history';
const MAX_HISTORY = 100;

export type FinishedPlayer = {
  name: string;
  score: number;
  played: number;
  correct: number;
  jokerUsed: boolean;
  bestStreak: number;
  maxLevelWon: number;
  levelSum: number;
  levelCount: number;
  stealWins: number;
  trophies: string[];
};

export type FinishedGame = {
  id: string;
  date: string;
  winnerName: string;
  rounds: number;
  themes: string[];
  players: FinishedPlayer[];
};

export async function saveGame(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVED_GAME_KEY, JSON.stringify({ v: STATE_VERSION, state }));
  } catch {}
}

export async function loadSavedGame(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Anciennes sauvegardes : l'état était stocké directement, sans enveloppe.
    return migrateState(parsed && typeof parsed === 'object' && 'state' in parsed ? parsed.state : parsed);
  } catch {
    return null;
  }
}

export async function clearSavedGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVED_GAME_KEY);
  } catch {}
}

export async function loadHistory(): Promise<FinishedGame[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as FinishedGame[]) : [];
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {}
}

// Idempotent: the game id is derived from the first player's id, which embeds
// the creation timestamp, so re-saving the same game replaces its entry.
export async function saveFinishedGame(state: GameState): Promise<void> {
  if (state.players.length === 0) return;
  try {
    const id = state.players[0].id;
    const history = await loadHistory();
    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    const game: FinishedGame = {
      id,
      date: new Date().toISOString(),
      winnerName: state.players.find((p) => p.id === state.finalWinnerId)?.name ?? sorted[0].name,
      rounds: state.totalRounds,
      themes: state.categoryOrder.map((id) => CATEGORIES.find((c) => c.id === id)?.name ?? id),
      players: state.players.map((p) => ({
        name: p.name,
        score: p.score,
        played: p.played,
        correct: p.correct,
        jokerUsed: p.jokerUsed,
        bestStreak: p.bestStreak,
        maxLevelWon: p.maxLevelWon,
        levelSum: p.levelSum,
        levelCount: p.levelCount,
        stealWins: p.stealWins,
        trophies: p.trophies,
      })),
    };
    // Même partie rejouée en mode Challenger : on met à jour l'entrée existante.
    const others = history.filter((g) => g.id !== id);
    const previous = history.find((g) => g.id === id);
    await AsyncStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([previous ? { ...game, date: previous.date } : game, ...others].slice(0, MAX_HISTORY))
    );
  } catch {}
}
