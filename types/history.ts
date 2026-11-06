import { StatBucket } from '@/types';

export type FinishedPlayer = {
  profileId?: string; // profil persistant (jamais affiché)
  name: string;
  score: number;
  played: number;
  correct: number;
  jokerUsed: boolean;
  bestStreak: number;
  maxLevelWon: number;
  levelSum: number;
  levelCount: number;
  stealAttempts?: number;
  stealWins: number;
  trophies: string[];
  levelStats?: Record<number, StatBucket>;
  themeStats?: Record<string, StatBucket>;
};

export type FinishedGame = {
  id: string;
  date: string;
  winnerName: string;
  winnerId?: string; // profil du vainqueur
  rounds: number;
  themes: string[];
  players: FinishedPlayer[];
};
