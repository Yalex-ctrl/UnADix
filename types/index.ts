export type Question = {
  id: string;
  categoryId: string;
  level: number; // 1 to 10
  question: string;
  answer: string;
  acceptedAnswers: string[];
  explanation: string;
};

export type Category = {
  id: string;
  name: string;
  shortDescription: string;
};

export type Player = {
  id: string;
  name: string;
  color: string;
  score: number;
  jokerUsed: boolean;
  jokerPending: boolean; // joker used on the current question, result not yet known
  jokerWon: boolean; // succeeded a question after using the joker
  played: number; // personal questions played (joker-replaced ones excluded)
  correct: number;
  streak: number;
  bestStreak: number;
  levelSum: number; // sum of chosen/assigned levels, for the average
  levelCount: number;
  maxLevelWon: number;
  stealAttempts: number;
  stealWins: number;
  maxStolen: number; // highest level stolen
  trophies: string[];
};

export type Judgement = 'correct' | 'incorrect' | 'accepted-anyway';

export type GamePhase =
  | 'idle'
  | 'round-intro'
  | 'level-select'
  | 'auction-bid'
  | 'question'
  | 'answer-reveal'
  | 'thief-attempt'
  | 'round-summary'
  | 'final-results'
  | 'challenge-category-select'
  | 'challenge-round-intro'
  | 'challenge-round-summary'
  | 'challenge-final-results'
  | 'thief-offer'
  | 'thief-reveal'
  | 'bonus-question'
  | 'killer'
  | 'allin-setup';

export type GameMode = 'classic' | 'challenge';

export type ConnectionMode = 'solo' | 'multiplayer';

export type Braquage = {
  braqueurId: string;
  targetId: string;
};

export type GameState = {
  phase: GamePhase;
  mode: GameMode;
  connectionMode: ConnectionMode;
  players: Player[];
  round: number; // 1-based
  totalRounds: number;
  categoryOrder: string[]; // category ids in play order (classic mode)
  turnOrder: string[]; // player ids, shuffled each round
  levelChoices: Record<string, number>; // playerId -> level chosen this round (classic mode)
  currentTurnIndex: number; // index into turnOrder for level-select and question phases
  currentQuestion: Question | null;
  askedQuestionIds: string[];
  lastJudgement: Judgement | null;
  playerCategories: Record<string, string>; // playerId -> categoryId chosen (challenge mode)
  challengeRound: number; // 1-based, up to CHALLENGE_TOTAL_ROUNDS
  challengeLevels: number[]; // difficulty level for each challenge round (6-10)

  // Mode Voleur
  thiefModeEnabled: boolean;
  tvHost: boolean; // Mode Présentateur TV
  thiefCandidates: string[]; // remaining steal candidates, in the order they answer

  // Braqueur (interruption)
  braqueursUsed: string[]; // player ids who have already declared a braquage this (sub-)game
  braquage: Braquage | null; // active interruption on the current turn

  // Round Enchères
  auctionRounds: number[]; // classic mode: 1-based round numbers that are auction rounds
  challengeAuctionRound: number | null; // challenge mode: which of 1..3 is the auction round
  auctionWinnerId: string | null; // set once an auction resolves with a winner
  auctionLevel: number | null; // winning bid level

  // Bonus / Killer / All-In
  bonusDoneRound: number;
  bonusQuestion: Question | null;
  killer: Killer | null;
  finalWinnerId: string | null;

  // Mode Challenger
  challengeTotal: number; // 1..5

  // Trophées, présentateur, annulation
  roundCorrectIds: string[];
  roundAttemptIds: string[]; // players who answered a personal question this round
  tenChosenBy: string | null;
  newTrophies: TrophyEvent[];
  commentary: string | null;
  usedCommentaryIds: string[];
  lastRanks: Record<string, number>;
  lastSteal: { thiefId: string; victimId: string; level: number } | null;
  prevState: GameState | null;
};

export type KillerContext = 'bonus' | 'final' | 'allin';

export type Killer = {
  contenders: string[];
  question: Question | null;
  context: KillerContext;
  stake: number;
  returnPhase: GamePhase;
};

export type TrophyEvent = { playerId: string; trophyId: string };
