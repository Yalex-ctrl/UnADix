import { ALL_QUESTIONS, getQuestionsForLevel } from '@/data/questions';
import { Question } from '@/types';

export function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function pickQuestion(categoryId: string, level: number, askedIds: string[]): Question | null {
  const all = getQuestionsForLevel(categoryId, level);
  if (all.length === 0) return null;
  const unseen = all.filter((q) => !askedIds.includes(q.id));
  const pool = unseen.length > 0 ? unseen : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Picks a random question at the given level from any category (bonus, killer,
// all-in, fallback when a category lacks a question). Prefers unseen questions.
export function pickAnyQuestion(level: number, askedIds: string[]): Question | null {
  const all = ALL_QUESTIONS.filter((q) => q.level === level);
  if (all.length === 0) return null;
  const unseen = all.filter((q) => !askedIds.includes(q.id));
  const pool = unseen.length > 0 ? unseen : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Splits 1..totalRounds into groups of ~3 and picks one auction round per
// group, avoiding two auction rounds landing back-to-back across a group
// boundary when the group offers another option. A trailing group smaller
// than 3 (e.g. a lone final round) may not be able to honor the
// no-adjacency guarantee — accepted edge case.
export function computeAuctionRounds(totalRounds: number): number[] {
  const groups: number[][] = [];
  for (let start = 1; start <= totalRounds; start += 3) {
    const end = Math.min(start + 2, totalRounds);
    const group: number[] = [];
    for (let r = start; r <= end; r++) group.push(r);
    groups.push(group);
  }

  const chosen: number[] = [];
  let previousChosen: number | null = null;
  for (const group of groups) {
    let pool = group;
    if (previousChosen !== null && group[0] === previousChosen + 1 && group.length > 1) {
      pool = group.filter((r) => r !== group[0]);
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    chosen.push(pick);
    previousChosen = pick;
  }
  return chosen;
}

export function pickChallengeAuctionRound(totalChallengeRounds: number): number {
  return 1 + Math.floor(Math.random() * totalChallengeRounds);
}

// Unseen question for a category + level, or null when every one was asked.
export function pickFreshQuestion(categoryId: string, level: number, askedIds: string[]): Question | null {
  const unseen = getQuestionsForLevel(categoryId, level).filter((q) => !askedIds.includes(q.id));
  return unseen.length > 0 ? unseen[Math.floor(Math.random() * unseen.length)] : null;
}

// Unseen question at a level, from any category, or null.
export function pickFreshAny(level: number, askedIds: string[]): Question | null {
  const unseen = ALL_QUESTIONS.filter((q) => q.level === level && !askedIds.includes(q.id));
  return unseen.length > 0 ? unseen[Math.floor(Math.random() * unseen.length)] : null;
}
