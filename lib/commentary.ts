import { Player } from '@/types';
import { rankOf } from '@/lib/trophies';

type Ctx = {
  players: Player[];
  lastRanks: Record<string, number>;
  lastSteal: { thiefId: string; victimId: string; level: number } | null;
  roundCorrectIds: string[];
  usedIds: string[];
};

type Candidate = { id: string; templates: string[] };

const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

// Contextual presenter lines, no AI needed. Returns the line and the situation
// id so the caller can avoid repeating the same kind of line round after round.
export function buildCommentary(ctx: Ctx): { id: string; text: string } {
  const { players, lastRanks, lastSteal, roundCorrectIds, usedIds } = ctx;
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const leader = sorted[0];
  const second = sorted[1];
  const gap = second ? leader.score - second.score : 0;
  const prevLeaderId = Object.keys(lastRanks).find((id) => lastRanks[id] === 1);
  const prevLeader = players.find((p) => p.id === prevLeaderId);
  const ranks = rankOf(players);
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? '';

  const vars: Record<string, string | number> = {
    leader: leader.name,
    second: second?.name ?? '',
    ecart: gap,
    pts: gap > 1 ? 'points' : 'point',
    ancien: prevLeader?.name ?? '',
  };

  const candidates: Candidate[] = [];

  if (lastSteal) {
    vars.voleur = nameOf(lastSteal.thiefId);
    vars.victime = nameOf(lastSteal.victimId);
    vars.niveau = lastSteal.level;
    candidates.push({
      id: 'steal',
      templates: [
        'Braquage ! {voleur} vient de voler {niveau} points à {victime} !',
        "{voleur} ne se laisse pas impressionner : {niveau} points dérobés à {victime} !",
        'Quel culot ! {voleur} repart avec les {niveau} points de {victime} !',
      ],
    });
  }
  if (prevLeader && prevLeader.id !== leader.id && ranks[leader.id] === 1 && gap > 0) {
    candidates.push({
      id: 'leader-change',
      templates: [
        'Incroyable ! {leader} vient de prendre la tête devant {ancien} !',
        "Changement de leader : {leader} s'empare de la première place !",
        '{ancien} cède sa place : {leader} est désormais en tête !',
      ],
    });
  }
  const hot = players.find((p) => p.streak >= 3);
  if (hot) {
    vars.joueur = hot.name;
    vars.serie = hot.streak;
    candidates.push({
      id: 'streak',
      templates: [
        '{joueur} vient de réussir sa {serie}e question consécutive !',
        "{joueur} est en feu : {serie} bonnes réponses d'affilée !",
      ],
    });
  }
  const flawless = players.find((p) => p.played >= 3 && p.correct === p.played);
  if (flawless) {
    vars.joueur = flawless.name;
    candidates.push({
      id: 'flawless',
      templates: [
        '{joueur} réalise un sans-faute depuis le début de la partie !',
        'Toujours aucune erreur pour {joueur} : le sans-faute continue !',
      ],
    });
  }
  if (second && gap <= 3) {
    candidates.push({
      id: gap === 0 ? 'tie' : 'close',
      templates:
        gap === 0
          ? ['Égalité parfaite entre {leader} et {second} !', '{leader} et {second} sont au coude-à-coude, rien ne les sépare !']
          : [
              'Attention, seulement {ecart} {pts} séparent les deux premiers !',
              '{second} revient à seulement {ecart} {pts} de {leader} !',
              'Le suspense est total : {ecart} {pts} entre {leader} et {second} !',
            ],
    });
  }
  if (second && gap > 3) {
    candidates.push({
      id: 'lead',
      templates: [
        '{leader} conserve la première place avec {ecart} points d’avance.',
        '{leader} creuse l’écart : {ecart} points devant {second} !',
      ],
    });
  }
  if (roundCorrectIds.length === 0) {
    candidates.push({
      id: 'nobody',
      templates: ["Personne n'a trouvé cette manche ! Les scores ne bougent pas.", 'Manche difficile : aucun point marqué !'],
    });
  }
  if (candidates.length === 0) {
    candidates.push({ id: 'default', templates: ['La partie continue, tout peut encore arriver !'] });
  }

  const fresh = candidates.filter((c) => !usedIds.includes(c.id));
  // Priority order is the insertion order: steal > leader change > streak > ...
  const chosen = fresh.length > 0 ? fresh[0] : candidates[0];
  const tpl = chosen.templates[Math.floor(Math.random() * chosen.templates.length)];
  return { id: chosen.id, text: fill(tpl, vars) };
}

export function buildFinalCommentary(players: Player[], winnerId: string | null): string {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = players.find((p) => p.id === winnerId) ?? sorted[0];
  const runner = sorted.find((p) => p.id !== winner.id);
  const gap = runner ? winner.score - runner.score : 0;
  if (runner && gap <= 3) {
    return `Quelle partie ! ${winner.name} s'impose avec ${winner.score} points après un duel particulièrement serré contre ${runner.name} !`;
  }
  if (runner && gap >= 15) {
    return `Une démonstration ! ${winner.name} termine avec ${winner.score} points, loin devant ${runner.name} !`;
  }
  return `Bravo ${winner.name} ! Victoire avec ${winner.score} points.`;
}
