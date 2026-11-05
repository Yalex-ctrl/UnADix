import { describe, expect, it } from 'vitest';
import {
  Action,
  allInTargetsFor,
  canAllIn,
  initialState,
  migrateState,
  reducer,
  validAllInChallengers,
} from '@/lib/gameReducer';
import { evaluateRoundTrophies } from '@/lib/trophies';
import { GameState } from '@/types';

const run = (state: GameState, ...actions: Action[]) => actions.reduce(reducer, state);

function newGame(n = 3, opts = { thiefMode: true, tvHost: true }, rounds = 10): GameState {
  return reducer(initialState(), {
    type: 'START_GAME',
    players: Array.from({ length: n }, (_, i) => ({ name: `J${i + 1}` })),
    totalRounds: rounds,
    connectionMode: 'solo',
    options: opts,
  });
}

// Joue la sélection des niveaux : chaque joueur prend un niveau distinct.
function toFirstQuestion(state: GameState, levels = [5, 6, 7, 8, 9, 3, 2, 1, 4, 10]): GameState {
  let s = run(state, { type: 'BEGIN_LEVEL_SELECT' });
  if (s.phase === 'auction-bid') throw new Error('auction round: use a different seed');
  let i = 0;
  while (s.phase === 'level-select') {
    s = reducer(s, { type: 'CHOOSE_LEVEL', playerId: s.turnOrder[s.currentTurnIndex], level: levels[i++] });
  }
  return s;
}

// Une partie dont la manche 1 n'est pas une manche d'enchères.
function gameWithoutAuctionFirst(n = 3, opts = { thiefMode: true, tvHost: true }, rounds = 10): GameState {
  for (let i = 0; i < 50; i++) {
    const g = newGame(n, opts, rounds);
    if (!g.auctionRounds.includes(1)) return g;
  }
  throw new Error('no suitable game');
}

describe('niveaux', () => {
  it('refuse un niveau déjà pris par un autre joueur', () => {
    let s = run(gameWithoutAuctionFirst(), { type: 'BEGIN_LEVEL_SELECT' });
    const first = s.turnOrder[0];
    s = reducer(s, { type: 'CHOOSE_LEVEL', playerId: first, level: 7 });
    const same = reducer(s, { type: 'CHOOSE_LEVEL', playerId: s.turnOrder[1], level: 7 });
    expect(same).toBe(s);
  });
});

describe('Mode Voleur', () => {
  it('ouvre une phase de vol après une mauvaise réponse, sans révéler la réponse', () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst());
    const victim = s.turnOrder[0];
    s = run(s, { type: 'REVEAL_ANSWER' }, { type: 'JUDGE', judgement: 'incorrect' });
    expect(s.phase).toBe('thief-offer');
    expect(s.currentTurnIndex).toBe(0);
    expect(s.players.find((p) => p.id === victim)!.score).toBe(0);
  });

  it('vol réussi : +niveau pour le voleur, puis révélation avant le joueur suivant', () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst());
    const victim = s.turnOrder[0];
    const level = s.levelChoices[victim];
    const thief = s.turnOrder[1];
    s = run(
      s,
      { type: 'REVEAL_ANSWER' },
      { type: 'JUDGE', judgement: 'incorrect' },
      { type: 'START_THIEF', candidateIds: [thief] },
      { type: 'THIEF_JUDGE', judgement: 'correct' }
    );
    expect(s.players.find((p) => p.id === thief)!.score).toBe(level);
    expect(s.phase).toBe('thief-reveal');
    s = reducer(s, { type: 'CONTINUE_AFTER_STEAL' });
    expect(s.phase).toBe('question');
    expect(s.currentTurnIndex).toBe(1);
  });

  it('vol raté : -2, candidat suivant, aucune tentative en double', () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst());
    const [victim, a, b] = s.turnOrder;
    s = run(
      s,
      { type: 'REVEAL_ANSWER' },
      { type: 'JUDGE', judgement: 'incorrect' },
      { type: 'START_THIEF', candidateIds: [a, b, a, victim] }
    );
    expect(s.thiefCandidates.sort()).toEqual([a, b].sort());
    const first = s.thiefCandidates[0];
    s = reducer(s, { type: 'THIEF_JUDGE', judgement: 'incorrect' });
    expect(s.players.find((p) => p.id === first)!.score).toBe(-2);
    expect(s.phase).toBe('thief-attempt');
    expect(s.thiefCandidates).toHaveLength(1);
    s = reducer(s, { type: 'THIEF_JUDGE', judgement: 'incorrect' });
    expect(s.phase).toBe('thief-reveal');
    expect(s.players.filter((p) => p.score === -2)).toHaveLength(2);
  });

  it('personne ne vole : révélation puis joueur suivant', () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst());
    s = run(s, { type: 'REVEAL_ANSWER' }, { type: 'JUDGE', judgement: 'incorrect' }, { type: 'START_THIEF', candidateIds: [] });
    expect(s.phase).toBe('thief-reveal');
  });

  it('option désactivée : passage direct au joueur suivant', () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst(3, { thiefMode: false, tvHost: true }));
    s = run(s, { type: 'REVEAL_ANSWER' }, { type: 'JUDGE', judgement: 'incorrect' });
    expect(s.phase).toBe('question');
    expect(s.currentTurnIndex).toBe(1);
  });
});

describe('joker et signalement', () => {
  it('le joker change la question une seule fois', () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst());
    const before = s.currentQuestion!.id;
    const player = s.turnOrder[0];
    s = reducer(s, { type: 'USE_JOKER' });
    expect(s.currentQuestion!.id).not.toBe(before);
    expect(s.currentQuestion!.level).toBe(s.levelChoices[player]);
    expect(s.players.find((p) => p.id === player)!.jokerUsed).toBe(true);
    const again = reducer(s, { type: 'USE_JOKER' });
    expect(again).toBe(s);
  });

  it('signaler une question ne consomme pas le joker', () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst());
    const before = s.currentQuestion!.id;
    s = reducer(s, { type: 'REPLACE_QUESTION' });
    expect(s.currentQuestion!.id).not.toBe(before);
    expect(s.players.every((p) => !p.jokerUsed)).toBe(true);
  });
});

describe('All-In', () => {
  const players = (scores: number[]) =>
    scores.map((score, i) => ({ ...newGame(scores.length).players[i], score }));

  it('impossible si tout le monde est à 0', () => {
    expect(canAllIn(players([0, 0, 0]))).toBe(false);
  });
  it('impossible si le seul joueur avec des points est le meilleur', () => {
    expect(canAllIn(players([10, 0, 0]))).toBe(false);
  });
  it('possible quand un adversaire a au moins autant de points', () => {
    const p = players([20, 27, 0]);
    expect(canAllIn(p)).toBe(true);
    expect(validAllInChallengers(p).map((x) => x.score)).toEqual([20]);
    expect(allInTargetsFor(p, p[0].id).map((x) => x.score)).toEqual([27]);
  });
  it("OPEN_ALLIN est refusé quand le duel est impossible", () => {
    const s = { ...newGame(3), phase: 'round-summary' as const };
    expect(reducer(s, { type: 'OPEN_ALLIN' })).toBe(s);
  });
  it('le gagnant ramasse la mise du perdant', () => {
    const base = newGame(3);
    const [a, b, c] = base.players;
    let s: GameState = {
      ...base,
      phase: 'round-summary',
      players: [
        { ...a, score: 20 },
        { ...b, score: 27 },
        { ...c, score: 0 },
      ],
    };
    s = run(s, { type: 'OPEN_ALLIN' }, { type: 'START_ALLIN', challengerId: a.id, targetId: b.id });
    expect(s.phase).toBe('killer');
    expect(s.killer!.stake).toBe(20);
    // Les deux trouvent : nouvelle question, rien ne change.
    s = reducer(s, { type: 'RESOLVE_KILLER', correctIds: [a.id, b.id] });
    expect(s.phase).toBe('killer');
    s = reducer(s, { type: 'RESOLVE_KILLER', correctIds: [b.id] });
    expect(s.phase).toBe('round-summary');
    expect(s.players.find((p) => p.id === a.id)!.score).toBe(0);
    expect(s.players.find((p) => p.id === b.id)!.score).toBe(47);
  });
  it('un défi vers un joueur trop pauvre est refusé', () => {
    const base = newGame(3);
    const [a, b] = base.players;
    let s: GameState = { ...base, phase: 'round-summary', players: [{ ...a, score: 20 }, { ...b, score: 10 }, base.players[2]] };
    expect(validAllInChallengers(s.players).map((p) => p.id)).toEqual([b.id]); // 20 n'a aucun adversaire à >= 20
    s = run(s, { type: 'OPEN_ALLIN' });
    expect(s.phase).toBe('allin-setup');
    const refused = reducer(s, { type: 'START_ALLIN', challengerId: a.id, targetId: b.id });
    expect(refused).toBe(s);
  });
});

describe('trophées', () => {
  const [a, b, c] = newGame(3).players;

  it('Roi du thème : refusé quand un seul joueur a tenté (enchère)', () => {
    const r = evaluateRoundTrophies([a, b, c], [], [a.id], [a.id], {});
    expect(r.players.find((p) => p.id === a.id)!.trophies).not.toContain('roiDuTheme');
  });
  it('Roi du thème : accordé quand deux joueurs ont tenté et un seul a trouvé', () => {
    const r = evaluateRoundTrophies([a, b, c], [], [a.id], [a.id, b.id, c.id], {});
    expect(r.players.find((p) => p.id === a.id)!.trophies).toContain('roiDuTheme');
  });
  it('Phénix : pas en début de partie (tous à égalité)', () => {
    const r = evaluateRoundTrophies([{ ...a, score: 5 }, b, c], [], [], [], { [a.id]: 1, [b.id]: 1, [c.id]: 1 });
    expect(r.events).toHaveLength(0);
  });
  it('Phénix : pas depuis une dernière place partagée', () => {
    const players = [{ ...a, score: 9 }, { ...b, score: 4 }, { ...c, score: 4 }];
    // avant : a=0 (dernier ex æquo avec b), c=5 → rangs 2,2,1
    const r = evaluateRoundTrophies(players, [], [], [], { [a.id]: 2, [b.id]: 2, [c.id]: 1 });
    expect(r.players.find((p) => p.id === a.id)!.trophies).not.toContain('phenix');
  });
  it('Phénix : dernier strict → premier seul', () => {
    const players = [{ ...a, score: 12 }, { ...b, score: 8 }, { ...c, score: 4 }];
    const r = evaluateRoundTrophies(players, [], [], [], { [a.id]: 3, [b.id]: 2, [c.id]: 1 });
    expect(r.players.find((p) => p.id === a.id)!.trophies).toContain('phenix');
  });
  it("un trophée n'est « nouveau » qu'à la première obtention", () => {
    const sage = { ...a, streak: 3 };
    const first = evaluateRoundTrophies([sage, b, c], [], [], [], {});
    expect(first.events.filter((e) => e.trophyId === 'sage')).toHaveLength(1);
    const second = evaluateRoundTrophies(first.players, [], [], [], {});
    expect(second.events.filter((e) => e.trophyId === 'sage')).toHaveLength(0);
  });
  it('ACK_TROPHIES vide les nouveaux trophées', () => {
    const s = { ...newGame(3), newTrophies: [{ playerId: a.id, trophyId: 'sage' }] };
    expect(reducer(s, { type: 'ACK_TROPHIES' }).newTrophies).toEqual([]);
  });
});

describe('braquage et statistiques', () => {
  it("compte la question comme tentée par le braqueur, pas par le braqué", () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst());
    const [victim, braqueur] = s.turnOrder;
    const level = s.levelChoices[victim];
    s = run(
      s,
      { type: 'BEGIN_BRAQUAGE', braqueurId: braqueur },
      { type: 'REVEAL_ANSWER' },
      { type: 'JUDGE', judgement: 'correct' }
    );
    const b = s.players.find((p) => p.id === braqueur)!;
    const v = s.players.find((p) => p.id === victim)!;
    expect(b.played).toBe(1);
    expect(b.correct).toBe(1);
    expect(b.score).toBe(level);
    expect(b.stealWins).toBe(1);
    expect(v.played).toBe(0);
    expect(v.score).toBe(0);
  });
  it('braqueur qui se trompe : le braqué récupère les points', () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst());
    const [victim, braqueur] = s.turnOrder;
    const level = s.levelChoices[victim];
    s = run(s, { type: 'BEGIN_BRAQUAGE', braqueurId: braqueur }, { type: 'REVEAL_ANSWER' }, { type: 'JUDGE', judgement: 'incorrect' });
    expect(s.players.find((p) => p.id === victim)!.score).toBe(level);
    expect(s.players.find((p) => p.id === braqueur)!.played).toBe(1);
  });
});

describe('annulation', () => {
  it('revient à la validation précédente', () => {
    let s = toFirstQuestion(gameWithoutAuctionFirst(3, { thiefMode: false, tvHost: true }));
    const player = s.turnOrder[0];
    s = run(s, { type: 'REVEAL_ANSWER' }, { type: 'JUDGE', judgement: 'correct' });
    expect(s.players.find((p) => p.id === player)!.score).toBeGreaterThan(0);
    s = reducer(s, { type: 'UNDO' });
    expect(s.phase).toBe('answer-reveal');
    expect(s.players.find((p) => p.id === player)!.score).toBe(0);
    expect(s.prevState).toBeNull();
  });
  it("ne fait rien s'il n'y a rien à annuler", () => {
    const s = newGame();
    expect(reducer(s, { type: 'UNDO' })).toBe(s);
  });
});

describe('bonus, Killer Question et fin de partie', () => {
  it('une question bonus suit la manche 3', () => {
    let s: GameState = { ...gameWithoutAuctionFirst(3, { thiefMode: false, tvHost: true }), round: 3, phase: 'round-summary' };
    s = reducer(s, { type: 'NEXT_ROUND' });
    expect(s.phase).toBe('bonus-question');
    expect(s.bonusQuestion).not.toBeNull();
    s = reducer(s, { type: 'RESOLVE_BONUS', correctIds: [s.players[0].id] });
    expect(s.phase).toBe('round-summary');
    expect(s.players[0].score).toBe(10);
    s = reducer(s, { type: 'NEXT_ROUND' });
    expect(s.phase).toBe('round-intro');
    expect(s.round).toBe(4);
  });
  it('plusieurs bonnes réponses au bonus : Killer Question, 10 points au gagnant', () => {
    let s: GameState = { ...newGame(3), round: 3, phase: 'round-summary' };
    s = reducer(s, { type: 'NEXT_ROUND' });
    s = reducer(s, { type: 'RESOLVE_BONUS', correctIds: [s.players[0].id, s.players[1].id] });
    expect(s.phase).toBe('killer');
    s = reducer(s, { type: 'RESOLVE_KILLER', correctIds: [] }); // personne : nouvelle question
    expect(s.phase).toBe('killer');
    s = reducer(s, { type: 'RESOLVE_KILLER', correctIds: [s.players[1].id] });
    expect(s.phase).toBe('round-summary');
    expect(s.players[1].score).toBe(10);
  });
  it('égalité en tête à la fin : Killer Question jusqu’à un vainqueur unique', () => {
    let s: GameState = { ...newGame(3, { thiefMode: false, tvHost: true }, 5), round: 5, phase: 'round-summary' };
    s = { ...s, players: s.players.map((p, i) => ({ ...p, score: i < 2 ? 10 : 3 })) };
    s = reducer(s, { type: 'NEXT_ROUND' });
    expect(s.phase).toBe('killer');
    expect(s.killer!.contenders).toHaveLength(2);
    s = reducer(s, { type: 'RESOLVE_KILLER', correctIds: s.killer!.contenders });
    expect(s.phase).toBe('killer');
    const winner = s.killer!.contenders[0];
    s = reducer(s, { type: 'RESOLVE_KILLER', correctIds: [winner] });
    expect(s.phase).toBe('final-results');
    expect(s.finalWinnerId).toBe(winner);
  });
});

describe('Mode Challenger', () => {
  it('au plus 5 manches, niveaux entre 5 et 10', () => {
    const s = reducer({ ...newGame(3), phase: 'final-results' }, { type: 'START_CHALLENGE', rounds: 9 });
    expect(s.challengeTotal).toBe(5);
    expect(s.challengeLevels).toHaveLength(5);
    expect(s.challengeLevels.every((l) => l >= 5 && l <= 10)).toBe(true);
    expect(s.players.every((p) => !p.jokerUsed)).toBe(true);
  });
});

describe('retrait d’un joueur', () => {
  it('retire le joueur entre deux manches, jamais sous 2 joueurs', () => {
    let s: GameState = { ...newGame(3), phase: 'round-summary' };
    s = reducer(s, { type: 'REMOVE_PLAYER', playerId: s.players[0].id });
    expect(s.players).toHaveLength(2);
    expect(reducer(s, { type: 'REMOVE_PLAYER', playerId: s.players[0].id })).toBe(s);
  });
  it('est refusé en pleine question', () => {
    const s = toFirstQuestion(gameWithoutAuctionFirst());
    expect(reducer(s, { type: 'REMOVE_PLAYER', playerId: s.players[0].id })).toBe(s);
  });
});

describe('migration des sauvegardes', () => {
  it('complète une ancienne sauvegarde (joueurs sans statistiques)', () => {
    const old = {
      phase: 'question',
      mode: 'classic',
      players: [
        { id: 'a', name: 'A', score: 3 },
        { id: 'b', name: 'B', score: 1, jokerUsed: true },
      ],
      round: 2,
      totalRounds: 5,
      turnOrder: ['a', 'b'],
      levelChoices: { a: 4, b: 6 },
      currentTurnIndex: 0,
      categoryOrder: ['x', 'y'],
    };
    const s = migrateState(old)!;
    expect(s.players[0].trophies).toEqual([]);
    expect(s.players[0].played).toBe(0);
    expect(s.players[1].jokerUsed).toBe(true);
    expect(s.thiefModeEnabled).toBe(true);
    expect(s.round).toBe(2);
    expect(s.prevState).toBeNull();
  });
  it('convertit un vol « voleur du tour » en cours', () => {
    const s = migrateState({ phase: 'thief-attempt', players: [{ id: 'a', name: 'A', score: 0 }], thiefOfTurnId: 'a' })!;
    expect(s.thiefCandidates).toEqual(['a']);
  });
  it('rejette un contenu invalide', () => {
    expect(migrateState(null)).toBeNull();
    expect(migrateState({ foo: 1 })).toBeNull();
  });
});
