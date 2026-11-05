import { Player, TrophyEvent } from '@/types';

export const TROPHIES: Record<string, { emoji: string; name: string; description: string }> = {
  aventurier: { emoji: '🧗', name: "L'Aventurier", description: 'Premier à choisir le niveau 10' },
  sage: { emoji: '🦉', name: 'Le Sage', description: 'Trois bonnes réponses consécutives' },
  sniper: { emoji: '🎯', name: 'Le Sniper', description: '100 % de réussite après au moins 3 questions' },
  phenix: { emoji: '🔥', name: 'Le Phénix', description: 'Passe de la dernière à la première place' },
  toutOuRien: { emoji: '🎰', name: 'Le Tout ou Rien', description: 'Réussit une question de niveau 9 ou 10' },
  chanceux: { emoji: '🍀', name: 'Le Chanceux', description: 'Utilise son joker puis réussit sa nouvelle question' },
  roiDuTheme: { emoji: '👑', name: 'Le Roi du thème', description: 'Seul à répondre juste pendant une manche' },
  braqueur: { emoji: '🥷', name: 'Le Braqueur', description: 'Vole une question de niveau 8 ou plus' },
  kamikaze: { emoji: '💣', name: 'Le Kamikaze', description: 'Tente plusieurs vols sans en réussir aucun' },
  survivant: { emoji: '🛟', name: 'Le Survivant', description: "Gagne avec un seul point d'avance" },
};

export function rankOf(players: { id: string; score: number }[]): Record<string, number> {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const ranks: Record<string, number> = {};
  sorted.forEach((p, i) => {
    ranks[p.id] = i > 0 && sorted[i - 1].score === p.score ? ranks[sorted[i - 1].id] : i + 1;
  });
  return ranks;
}

type Result = { players: Player[]; events: TrophyEvent[] };

export function grantTrophy(players: Player[], events: TrophyEvent[], playerId: string, trophyId: string): Result {
  const target = players.find((p) => p.id === playerId);
  if (!target || target.trophies.includes(trophyId)) return { players, events };
  return {
    players: players.map((p) => (p.id === playerId ? { ...p, trophies: [...p.trophies, trophyId] } : p)),
    events: [...events, { playerId, trophyId }],
  };
}

// Evaluated at the end of each round from the stats accumulated on players.
export function evaluateRoundTrophies(
  players: Player[],
  events: TrophyEvent[],
  roundCorrectIds: string[],
  lastRanks: Record<string, number>
): Result {
  let current: Result = { players, events };
  const give = (id: string, trophyId: string) => {
    current = grantTrophy(current.players, current.events, id, trophyId);
  };
  for (const p of players) {
    if (p.streak >= 3) give(p.id, 'sage');
    if (p.played >= 3 && p.correct === p.played) give(p.id, 'sniper');
    if (p.maxLevelWon >= 9) give(p.id, 'toutOuRien');
    if (p.jokerWon) give(p.id, 'chanceux');
    if (p.maxStolen >= 8) give(p.id, 'braqueur');
    if (p.stealAttempts >= 2 && p.stealWins === 0) give(p.id, 'kamikaze');
  }
  if (players.length >= 3 && roundCorrectIds.length === 1) give(roundCorrectIds[0], 'roiDuTheme');
  if (players.length >= 3) {
    const ranks = rankOf(players);
    const lastRank = Math.max(...Object.values(lastRanks), 0);
    const leaders = players.filter((x) => ranks[x.id] === 1);
    for (const p of players) {
      if (lastRank > 1 && lastRanks[p.id] === lastRank && leaders.length === 1 && leaders[0].id === p.id) {
        give(p.id, 'phenix');
      }
    }
  }
  return current;
}

export function evaluateFinalTrophies(players: Player[], events: TrophyEvent[], winnerId: string | null): Result {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  if (sorted.length >= 2 && winnerId && sorted[0].id === winnerId && sorted[0].score - sorted[1].score === 1) {
    return grantTrophy(players, events, winnerId, 'survivant');
  }
  return { players, events };
}
