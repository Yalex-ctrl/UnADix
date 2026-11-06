import { describe, expect, it } from 'vitest';
import { Action, canAllIn, initialState, migrateState, reducer, validAllInChallengers } from '@/lib/gameReducer';
import { computePlayerStats } from '@/lib/profileLogic';
import { GameState } from '@/types';
import { FinishedGame } from '@/types/history';

// Parcours complet sur la logique pure : 3 joueurs dont 2 issus de profils,
// Mode Voleur, braquage, enchère, All-In possible et impossible, bonus,
// égalité avec Killer Question, undo à plusieurs endroits, fermeture/reprise.

const start = (rounds: number): GameState =>
  reducer(initialState(), {
    type: 'START_GAME',
    players: [
      { name: 'Ana', profileId: 'PROFILEANAAAAAAAAAAA' },
      { name: 'Ben', profileId: 'PROFILEBENBBBBBBBBBB' },
      { name: 'Invité' },
    ],
    totalRounds: rounds,
    connectionMode: 'solo',
    options: { thiefMode: true, tvHost: true },
  });

const run = (s: GameState, ...a: Action[]) => a.reduce(reducer, s);

// Resume : sérialisation JSON (comme AsyncStorage) puis migration.
const reopen = (s: GameState) => migrateState(JSON.parse(JSON.stringify({ v: 2, state: s })).state)!;

type Hooks = { onStep?: (s: GameState, a: Action | null) => void };

// Un « bot » qui joue n'importe quelle phase avec une politique simple.
function nextAction(s: GameState, tick: number): Action | null {
  const ids = s.players.map((p) => p.id);
  switch (s.phase) {
    case 'round-intro':
      return { type: 'BEGIN_LEVEL_SELECT' };
    case 'auction-bid':
      return { type: 'RESOLVE_AUCTION', playerId: ids[tick % ids.length], level: 5 + (tick % 4) };
    case 'level-select': {
      const taken = new Set(Object.values(s.levelChoices));
      const level = [5, 6, 7, 8, 9, 10, 4, 3, 2, 1].find((l) => !taken.has(l))!;
      return { type: 'CHOOSE_LEVEL', playerId: s.turnOrder[s.currentTurnIndex], level };
    }
    case 'question':
      // Un braquage de temps en temps.
      if (tick % 7 === 0 && !s.braquage && !s.auctionWinnerId) {
        const braqueur = ids.find((id) => id !== s.turnOrder[s.currentTurnIndex] && !s.braqueursUsed.includes(id));
        if (braqueur) return { type: 'BEGIN_BRAQUAGE', braqueurId: braqueur };
      }
      return { type: 'REVEAL_ANSWER' };
    case 'answer-reveal':
      return { type: 'JUDGE', judgement: tick % 3 === 0 ? 'incorrect' : 'correct' };
    case 'thief-offer':
      return { type: 'START_THIEF', candidateIds: ids.filter((id) => id !== s.turnOrder[s.currentTurnIndex]) };
    case 'thief-attempt':
      return { type: 'THIEF_JUDGE', judgement: tick % 2 === 0 ? 'correct' : 'incorrect' };
    case 'thief-reveal':
      return { type: 'CONTINUE_AFTER_STEAL' };
    case 'round-summary':
      return { type: 'NEXT_ROUND' };
    case 'challenge-round-summary':
      return { type: 'NEXT_CHALLENGE_ROUND' };
    case 'bonus-question':
      return { type: 'RESOLVE_BONUS', correctIds: [ids[0], ids[1]] };
    case 'killer':
      return { type: 'RESOLVE_KILLER', correctIds: [s.killer!.contenders[0]] };
    default:
      return null;
  }
}

function playToEnd(s: GameState, { onStep }: Hooks = {}) {
  let tick = 0;
  for (let i = 0; i < 2000; i++) {
    const a = nextAction(s, tick++);
    if (!a) return s;
    s = reducer(s, a);
    onStep?.(s, a);
  }
  throw new Error('la partie ne se termine pas');
}

describe('parcours complet', () => {
  it('une partie entière se termine, avec un vainqueur unique et des invariants respectés', () => {
    for (let game = 0; game < 25; game++) {
      const rounds = 3 + (game % 3); // 3 à 5 manches → au moins un bonus
      let sawBonus = false;
      const s = playToEnd(start(rounds), {
        onStep: (st) => {
          expect(st.players).toHaveLength(3);
          for (const p of st.players) {
            expect(Number.isFinite(p.score)).toBe(true);
            expect(p.trophies).toEqual([...new Set(p.trophies)]); // un trophée une seule fois
          }
          if (st.phase === 'bonus-question') sawBonus = true;
          if (['question', 'answer-reveal', 'thief-attempt', 'thief-reveal'].includes(st.phase)) {
            expect(st.currentQuestion).not.toBeNull(); // jamais de question vide
          }
          // Deux joueurs ne prennent jamais le même niveau dans une manche classique.
          const levels = Object.values(st.levelChoices);
          expect(new Set(levels).size).toBe(levels.length);
          // L'All-In n'est ouvrable que s'il est possible.
          expect(canAllIn(st.players)).toBe(validAllInChallengers(st.players).length > 0);
        },
      });
      expect(s.phase).toBe('final-results');
      expect(s.finalWinnerId).not.toBeNull();
      expect(sawBonus).toBe(true);
    }
  });

  it('l’All-In est impossible au départ puis possible quand les scores le permettent', () => {
    const s = start(3);
    expect(canAllIn(s.players)).toBe(false);
    const withScores: GameState = {
      ...s,
      phase: 'round-summary',
      players: s.players.map((p, i) => ({ ...p, score: [12, 12, 5][i] })),
    };
    expect(canAllIn(withScores.players)).toBe(true);
    const opened = reducer(withScores, { type: 'OPEN_ALLIN' });
    expect(opened.phase).toBe('allin-setup');
    const blocked = reducer({ ...withScores, players: withScores.players.map((p, i) => ({ ...p, score: [9, 0, 0][i] })) }, { type: 'OPEN_ALLIN' });
    expect(blocked.phase).toBe('round-summary');
  });

  it('égalité en tête à la fin : Killer Question, puis vainqueur unique', () => {
    let s = start(3);
    s = { ...s, round: 3, bonusDoneRound: 3, phase: 'round-summary', players: s.players.map((p, i) => ({ ...p, score: i < 2 ? 20 : 4 })) };
    s = reducer(s, { type: 'NEXT_ROUND' });
    expect(s.phase).toBe('killer');
    expect(s.killer!.context).toBe('final');
    s = reducer(s, { type: 'RESOLVE_KILLER', correctIds: [] }); // personne : nouvelle question
    expect(s.phase).toBe('killer');
    s = reducer(s, { type: 'RESOLVE_KILLER', correctIds: s.killer!.contenders }); // deux : nouvelle question
    expect(s.phase).toBe('killer');
    const winner = s.killer!.contenders[1];
    s = reducer(s, { type: 'RESOLVE_KILLER', correctIds: [winner] });
    expect(s.phase).toBe('final-results');
    expect(s.finalWinnerId).toBe(winner);
  });
});

describe('annulation à plusieurs endroits', () => {
  // Joue jusqu'à la première phase demandée.
  const until = (s: GameState, phase: GameState['phase']) => {
    let tick = 1; // tick 1 : bonnes réponses, pas de braquage
    for (let i = 0; i < 200 && s.phase !== phase; i++) {
      const a = nextAction(s, tick++);
      if (!a) break;
      s = reducer(s, a);
    }
    return s;
  };

  const base = () => {
    for (let i = 0; i < 40; i++) {
      const s = start(5);
      if (!s.auctionRounds.includes(1)) return s;
    }
    throw new Error('seed');
  };

  it('annule le choix d’un niveau', () => {
    let s = reducer(base(), { type: 'BEGIN_LEVEL_SELECT' });
    const first = s.turnOrder[0];
    const after = reducer(s, { type: 'CHOOSE_LEVEL', playerId: first, level: 6 });
    expect(after.levelChoices[first]).toBe(6);
    s = reducer(after, { type: 'UNDO' });
    expect(s.levelChoices[first]).toBeUndefined();
    expect(s.currentTurnIndex).toBe(0);
  });

  it('annule un verdict puis le rejoue autrement', () => {
    let s = until(base(), 'answer-reveal');
    const player = s.turnOrder[s.currentTurnIndex];
    const judged = reducer(s, { type: 'JUDGE', judgement: 'correct' });
    expect(judged.players.find((p) => p.id === player)!.score).toBeGreaterThan(0);
    s = reducer(judged, { type: 'UNDO' });
    expect(s.phase).toBe('answer-reveal');
    expect(s.players.find((p) => p.id === player)!.score).toBe(0);
    const again = reducer(s, { type: 'JUDGE', judgement: 'incorrect' });
    expect(again.phase).toBe('thief-offer');
  });

  it('annule une tentative de vol', () => {
    let s = until(base(), 'answer-reveal');
    s = reducer(s, { type: 'JUDGE', judgement: 'incorrect' });
    const others = s.players.map((p) => p.id).filter((id) => id !== s.turnOrder[s.currentTurnIndex]);
    s = reducer(s, { type: 'START_THIEF', candidateIds: others });
    const thief = s.thiefCandidates[0];
    const judged = reducer(s, { type: 'THIEF_JUDGE', judgement: 'incorrect' });
    expect(judged.players.find((p) => p.id === thief)!.score).toBe(-2);
    const undone = reducer(judged, { type: 'UNDO' });
    expect(undone.players.find((p) => p.id === thief)!.score).toBe(0);
    expect(undone.phase).toBe('thief-attempt');
  });

  it('annule la résolution de la question bonus', () => {
    let s: GameState = { ...base(), round: 3, phase: 'round-summary' };
    s = reducer(s, { type: 'NEXT_ROUND' });
    expect(s.phase).toBe('bonus-question');
    const resolved = reducer(s, { type: 'RESOLVE_BONUS', correctIds: [s.players[0].id] });
    expect(resolved.players[0].score).toBe(10);
    const undone = reducer(resolved, { type: 'UNDO' });
    expect(undone.phase).toBe('bonus-question');
    expect(undone.players[0].score).toBe(0);
  });
});

describe('fermeture puis reprise', () => {
  it('reprend exactement au même endroit, à chaque étape de la partie', () => {
    let s = start(4);
    let tick = 1;
    for (let i = 0; i < 400; i++) {
      const a = nextAction(s, tick++);
      if (!a) break;
      s = reducer(s, a);
      // Fermeture accidentelle : sérialisation puis migration.
      const resumed = reopen(s);
      expect(resumed.phase).toBe(s.phase);
      expect(resumed.round).toBe(s.round);
      expect(resumed.players.map((p) => [p.id, p.profileId, p.score])).toEqual(s.players.map((p) => [p.id, p.profileId, p.score]));
      expect(resumed.currentQuestion?.id).toBe(s.currentQuestion?.id);
      s = resumed; // on continue la partie depuis l'état repris
    }
    expect(s.phase).toBe('final-results');
  });

  it('une sauvegarde sans profil (ancienne version) se reprend et se rattache plus tard', () => {
    const s = start(3);
    const legacy = JSON.parse(JSON.stringify(s));
    for (const p of legacy.players) delete p.profileId;
    const resumed = migrateState(legacy)!;
    expect(resumed.players.map((p) => p.name)).toEqual(['Ana', 'Ben', 'Invité']);
    expect(resumed.phase).toBe(s.phase);
  });
});

describe('statistiques cohérentes avec la partie', () => {
  it('le profil retrouve ses parties et ses victoires dans l’historique', () => {
    const s = playToEnd(start(3));
    const winnerProfile = s.players.find((p) => p.id === s.finalWinnerId)!.profileId;
    const finished: FinishedGame = {
      id: s.players[0].id,
      date: new Date().toISOString(),
      winnerName: s.players.find((p) => p.id === s.finalWinnerId)!.name,
      winnerId: winnerProfile,
      rounds: s.totalRounds,
      themes: [],
      players: s.players.map((p) => ({
        profileId: p.profileId,
        name: p.name,
        score: p.score,
        played: p.played,
        correct: p.correct,
        jokerUsed: p.jokerUsed,
        bestStreak: p.bestStreak,
        maxLevelWon: p.maxLevelWon,
        levelSum: p.levelSum,
        levelCount: p.levelCount,
        stealAttempts: p.stealAttempts,
        stealWins: p.stealWins,
        trophies: p.trophies,
        levelStats: p.levelStats,
        themeStats: p.themeStats,
      })),
    };
    const history = [finished];
    for (const profileId of ['PROFILEANAAAAAAAAAAA', 'PROFILEBENBBBBBBBBBB']) {
      const st = computePlayerStats(history, profileId);
      expect(st.games).toBe(1);
      expect(st.wins).toBe(winnerProfile === profileId ? 1 : 0);
      const me = s.players.find((p) => p.profileId === profileId)!;
      expect(st.totalPoints).toBe(me.score);
      // La réussite par niveau est cohérente avec le compteur global.
      const played = st.rateByLevel.reduce((n, l) => n + l.played, 0);
      expect(played).toBe(me.played);
    }
  });
});
