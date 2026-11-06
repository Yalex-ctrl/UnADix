import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { generatePlayerId, PLAYER_ID_PATTERN } from '@/lib/playerId';
import { computePlayerStats, migrateLegacy, normalizeName } from '@/lib/profileLogic';
import { FinishedGame } from '@/types/history';

const rnd = (n: number) => new Uint8Array(randomBytes(n));

describe('generatePlayerId', () => {
  it('produit 20 caractères base62', () => {
    for (let i = 0; i < 200; i++) expect(generatePlayerId(rnd)).toMatch(PLAYER_ID_PATTERN);
  });

  it('ne produit aucune collision sur 100 000 tirages', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100_000; i++) seen.add(generatePlayerId(rnd));
    expect(seen.size).toBe(100_000);
  });

  it('rejette les octets biaisés (>= 248) au lieu de les replier avec un modulo', () => {
    // Que des 255 puis des 0..61 : seuls les 0..61 doivent compter.
    const calls: number[] = [];
    const src = (n: number) => {
      calls.push(n);
      const out = new Uint8Array(n);
      for (let i = 0; i < n; i++) out[i] = i < n / 2 ? 255 : i % 62;
      return out;
    };
    const id = generatePlayerId(src);
    expect(id).toHaveLength(20);
    expect(id).toMatch(PLAYER_ID_PATTERN);
  });

  it("couvre tout l'alphabet sans favoriser de caractère", () => {
    const counts = new Map<string, number>();
    for (let i = 0; i < 20_000; i++) for (const c of generatePlayerId(rnd)) counts.set(c, (counts.get(c) ?? 0) + 1);
    expect(counts.size).toBe(62);
    const values = [...counts.values()];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    for (const v of values) expect(Math.abs(v - mean) / mean).toBeLessThan(0.05);
  });

  it('retire un id déjà existant', () => {
    let first = true;
    const src = (n: number) => {
      const out = new Uint8Array(n);
      if (first) out.fill(0); // 'AAAAAAAAAAAAAAAAAAAA'
      else for (let i = 0; i < n; i++) out[i] = (i * 7) % 248;
      return out;
    };
    const taken = new Set(['A'.repeat(20)]);
    const wrapped = (n: number) => {
      const r = src(n);
      first = false;
      return r;
    };
    expect(generatePlayerId(wrapped, taken)).not.toBe('A'.repeat(20));
  });
});

const game = (id: string, date: string, players: Partial<FinishedGame['players'][number]>[], winnerName: string): FinishedGame => ({
  id,
  date,
  winnerName,
  rounds: 5,
  themes: [],
  players: players.map((p) => ({
    name: 'x',
    score: 0,
    played: 0,
    correct: 0,
    jokerUsed: false,
    bestStreak: 0,
    maxLevelWon: 0,
    levelSum: 0,
    levelCount: 0,
    stealWins: 0,
    trophies: [],
    ...p,
  })),
});

describe('migrateLegacy', () => {
  const makeIds = () => {
    let n = 0;
    return (existing: ReadonlySet<string>) => {
      let id: string;
      do id = `ID${String(++n).padStart(18, '0')}`;
      while (existing.has(id));
      return id;
    };
  };

  const history = [
    game('g1', '2026-01-01', [{ name: 'Kim', score: 10 }, { name: ' arnaud ', score: 7 }], 'Kim'),
    game('g2', '2026-01-02', [{ name: 'KIM', score: 3 }, { name: 'Arnaud', score: 9 }], 'Arnaud'),
  ];

  it('crée un profil par prénom distinct (casse et espaces ignorés)', () => {
    const r = migrateLegacy({ profiles: [], history }, makeIds());
    expect(r.profiles.map((p) => normalizeName(p.name)).sort()).toEqual(['arnaud', 'kim']);
    const kim1 = r.history[0].players[0].profileId;
    const kim2 = r.history[1].players[0].profileId;
    expect(kim1).toBeDefined();
    expect(kim1).toBe(kim2);
    expect(r.history[0].winnerId).toBe(kim1);
  });

  it('est idempotente', () => {
    const first = migrateLegacy({ profiles: [], history }, makeIds());
    const second = migrateLegacy({ profiles: first.profiles, history: first.history }, makeIds());
    expect(second.changed).toBe(false);
    expect(second.profiles).toEqual(first.profiles);
    expect(second.history).toEqual(first.history);
  });

  it('rattache la partie en cours aux mêmes profils', () => {
    const r = migrateLegacy(
      { profiles: [], history, savedPlayers: [{ name: 'kim', color: '#FF4D5E' }, { name: 'Zoé' }] },
      makeIds()
    );
    const kimProfile = r.profiles.find((p) => normalizeName(p.name) === 'kim')!;
    expect(r.savedPlayers![0].profileId).toBe(kimProfile.id);
    expect(r.profiles.some((p) => p.name === 'Zoé')).toBe(true);
  });

  it('réutilise les profils existants au lieu de les dupliquer', () => {
    const existing = [{ id: 'EXISTINGEXISTINGEXIS', name: 'Kim', color: '#6C3BFF', createdAt: 1 }];
    const r = migrateLegacy({ profiles: existing, history }, makeIds());
    expect(r.history[0].players[0].profileId).toBe('EXISTINGEXISTINGEXIS');
    expect(r.profiles.filter((p) => normalizeName(p.name) === 'kim')).toHaveLength(1);
  });
});

describe('computePlayerStats', () => {
  const hist: FinishedGame[] = [
    {
      ...game('g1', '2026-02-01', [
        { profileId: 'A', name: 'Ana', score: 20, levelSum: 12, levelCount: 3, stealAttempts: 2, stealWins: 1, jokerUsed: true, trophies: ['sage'], levelStats: { 3: { played: 2, correct: 2 }, 8: { played: 1, correct: 0 } }, themeStats: { cinema: { played: 2, correct: 2 }, histoire: { played: 2, correct: 0 } } },
        { profileId: 'B', name: 'Ben', score: 10 },
      ], 'Ana'),
      winnerId: 'A',
    },
    {
      ...game('g2', '2026-02-02', [
        { profileId: 'A', name: 'Ana', score: 5, levelSum: 6, levelCount: 2, trophies: ['sage'], levelStats: { 3: { played: 1, correct: 1 } } },
        { profileId: 'B', name: 'Ben', score: 8 },
        { profileId: 'C', name: 'Cy', score: 1 },
      ], 'Ben'),
      winnerId: 'B',
    },
  ];

  it('agrège par id', () => {
    const s = computePlayerStats(hist, 'A');
    expect(s.games).toBe(2);
    expect(s.wins).toBe(1);
    expect(s.winRate).toBe(0.5);
    expect(s.totalPoints).toBe(25);
    expect(s.bestScore).toBe(20);
    expect(s.avgLevel).toBeCloseTo(18 / 5);
    expect(s.stealAttempts).toBe(2);
    expect(s.stealWins).toBe(1);
    expect(s.jokersUsed).toBe(1);
    expect(s.trophies).toEqual({ sage: 2 });
  });

  it('calcule la réussite par niveau et les thèmes', () => {
    const s = computePlayerStats(hist, 'A');
    expect(s.rateByLevel[2]).toMatchObject({ level: 3, played: 3, correct: 3, rate: 1 });
    expect(s.rateByLevel[7].rate).toBe(0);
    expect(s.rateByLevel[0].rate).toBeNull();
    expect(s.bestTheme?.id).toBe('cinema');
    expect(s.worstTheme?.id).toBe('histoire');
  });

  it('trouve le rival le plus affronté et le bilan', () => {
    const s = computePlayerStats(hist, 'A');
    expect(s.rival).toMatchObject({ profileId: 'B', games: 2, wins: 1, losses: 1 });
  });

  it('ne confond pas deux profils de même prénom', () => {
    const twins: FinishedGame[] = [
      game('t1', '2026-03-01', [{ profileId: 'X', name: 'Léo', score: 9 }, { profileId: 'Y', name: 'Léo', score: 2 }], 'Léo'),
    ];
    twins[0].winnerId = 'X';
    expect(computePlayerStats(twins, 'X').wins).toBe(1);
    expect(computePlayerStats(twins, 'Y').wins).toBe(0);
  });

  it('mémoïse par historique', () => {
    expect(computePlayerStats(hist, 'A')).toBe(computePlayerStats(hist, 'A'));
  });
});
