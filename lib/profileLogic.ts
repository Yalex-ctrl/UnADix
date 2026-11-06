// Logique pure des profils : migration de l'existant (prénoms → profils) et
// statistiques calculées depuis l'historique, par id.
import { PLAYER_COLORS } from '@/theme/tokens';
import { FinishedGame } from '@/types/history';
import { PlayerProfile } from '@/types/profile';

export const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

type MakeId = (existing: ReadonlySet<string>) => string;

type LegacyInput = {
  profiles: PlayerProfile[];
  history: FinishedGame[];
  // `players` d'une partie sauvegardée, si elle existe.
  savedPlayers?: { name: string; profileId?: string; color?: string }[] | null;
};

type LegacyResult = {
  profiles: PlayerProfile[];
  history: FinishedGame[];
  savedPlayers: { name: string; profileId?: string; color?: string }[] | null;
  changed: boolean;
};

// Un profil est créé par prénom distinct (insensible à la casse et aux espaces)
// trouvé dans l'historique et la partie en cours ; chaque entrée est réécrite
// avec les ids. Idempotente : relancée, elle ne change plus rien.
export function migrateLegacy({ profiles, history, savedPlayers }: LegacyInput, makeId: MakeId, now = Date.now()): LegacyResult {
  const list = [...profiles];
  const ids = new Set(list.map((p) => p.id));
  const byName = new Map<string, PlayerProfile>();
  for (const p of list) if (!byName.has(normalizeName(p.name))) byName.set(normalizeName(p.name), p);
  let changed = false;

  const resolve = (name: string, color?: string): PlayerProfile => {
    const key = normalizeName(name);
    const found = byName.get(key);
    if (found) return found;
    const id = makeId(ids);
    ids.add(id);
    const profile: PlayerProfile = {
      id,
      name: name.trim(),
      color: color ?? PLAYER_COLORS[list.length % PLAYER_COLORS.length],
      createdAt: now,
    };
    list.push(profile);
    byName.set(key, profile);
    changed = true;
    return profile;
  };

  const newHistory = history.map((game) => {
    let touched = false;
    const players = game.players.map((p) => {
      if (p.profileId) return p;
      touched = true;
      return { ...p, profileId: resolve(p.name).id };
    });
    let winnerId = game.winnerId;
    if (!winnerId) {
      winnerId = players.find((p) => normalizeName(p.name) === normalizeName(game.winnerName))?.profileId;
      if (winnerId) touched = true;
    }
    if (!touched) return game;
    changed = true;
    return { ...game, players, winnerId };
  });

  let newSaved = savedPlayers ?? null;
  if (savedPlayers) {
    newSaved = savedPlayers.map((p) => {
      if (p.profileId) return p;
      changed = true;
      return { ...p, profileId: resolve(p.name, p.color).id };
    });
  }

  return { profiles: list, history: newHistory, savedPlayers: newSaved, changed };
}

// --- Statistiques -----------------------------------------------------------

export type PlayerStats = {
  games: number;
  wins: number;
  winRate: number; // 0..1
  totalPoints: number;
  bestScore: number;
  avgLevel: number | null;
  rateByLevel: { level: number; played: number; correct: number; rate: number | null }[];
  bestTheme: { id: string; rate: number; played: number } | null;
  worstTheme: { id: string; rate: number; played: number } | null;
  stealAttempts: number;
  stealWins: number;
  jokersUsed: number;
  trophies: Record<string, number>;
  rival: { profileId: string; name: string; games: number; wins: number; losses: number } | null;
  recent: FinishedGame[];
};

const cache = new WeakMap<FinishedGame[], Map<string, PlayerStats>>();

// Calculé depuis l'historique, par id ; mémoïsé par (historique, id).
export function computePlayerStats(history: FinishedGame[], profileId: string): PlayerStats {
  let perHistory = cache.get(history);
  if (!perHistory) {
    perHistory = new Map();
    cache.set(history, perHistory);
  }
  const hit = perHistory.get(profileId);
  if (hit) return hit;

  const mine = history.filter((g) => g.players.some((p) => p.profileId === profileId));
  let wins = 0;
  let totalPoints = 0;
  let bestScore = 0;
  let levelSum = 0;
  let levelCount = 0;
  let stealAttempts = 0;
  let stealWins = 0;
  let jokersUsed = 0;
  const trophies: Record<string, number> = {};
  const levels = Array.from({ length: 10 }, (_, i) => ({ level: i + 1, played: 0, correct: 0 }));
  const themes = new Map<string, { played: number; correct: number }>();
  const opponents = new Map<string, { name: string; games: number; wins: number; losses: number }>();

  for (const g of mine) {
    const me = g.players.find((p) => p.profileId === profileId)!;
    if (g.winnerId === profileId) wins++;
    totalPoints += me.score;
    bestScore = Math.max(bestScore, me.score);
    levelSum += me.levelSum ?? 0;
    levelCount += me.levelCount ?? 0;
    stealAttempts += me.stealAttempts ?? 0;
    stealWins += me.stealWins ?? 0;
    jokersUsed += me.jokerUsed ? 1 : 0;
    for (const t of me.trophies ?? []) trophies[t] = (trophies[t] ?? 0) + 1;
    for (const [lvl, b] of Object.entries(me.levelStats ?? {})) {
      const slot = levels[Number(lvl) - 1];
      if (slot) {
        slot.played += b.played;
        slot.correct += b.correct;
      }
    }
    for (const [id, b] of Object.entries(me.themeStats ?? {})) {
      const cur = themes.get(id) ?? { played: 0, correct: 0 };
      themes.set(id, { played: cur.played + b.played, correct: cur.correct + b.correct });
    }
    for (const other of g.players) {
      if (!other.profileId || other.profileId === profileId) continue;
      const o = opponents.get(other.profileId) ?? { name: other.name, games: 0, wins: 0, losses: 0 };
      o.games++;
      o.name = other.name;
      if (me.score > other.score) o.wins++;
      else if (me.score < other.score) o.losses++;
      opponents.set(other.profileId, o);
    }
  }

  // Meilleur / pire thème : au moins 2 questions jouées pour être significatif.
  const rated = [...themes.entries()]
    .filter(([, b]) => b.played >= 2)
    .map(([id, b]) => ({ id, played: b.played, rate: b.correct / b.played }))
    .sort((a, b) => b.rate - a.rate || b.played - a.played);

  let rival: PlayerStats['rival'] = null;
  for (const [id, o] of opponents) {
    if (!rival || o.games > rival.games) rival = { profileId: id, ...o };
  }

  const stats: PlayerStats = {
    games: mine.length,
    wins,
    winRate: mine.length ? wins / mine.length : 0,
    totalPoints,
    bestScore,
    avgLevel: levelCount > 0 ? levelSum / levelCount : null,
    rateByLevel: levels.map((l) => ({ ...l, rate: l.played > 0 ? l.correct / l.played : null })),
    bestTheme: rated[0] ?? null,
    worstTheme: rated.length > 1 ? rated[rated.length - 1] : null,
    stealAttempts,
    stealWins,
    jokersUsed,
    trophies,
    rival,
    recent: [...mine].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
  };
  perHistory.set(profileId, stats);
  return stats;
}
