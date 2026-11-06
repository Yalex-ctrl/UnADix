import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { SoftCard } from '@/components/ui/Card';
import { Confetti } from '@/components/ui/Confetti';
import { Lulu } from '@/components/ui/Lulu';
import { Podium } from '@/components/ui/Podium';
import { ScreenBody } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { TrophyBadge } from '@/components/ui/TrophyBadge';
import { T } from '@/components/ui/Typography';
import { playSound } from '@/lib/sounds';
import { TROPHIES } from '@/lib/trophies';
import { fonts, OUTLINE, palette, radius, space } from '@/theme/tokens';
import { Player } from '@/types';
import { Leaderboard } from '../Leaderboard';

type FinalResultsProps = {
  players: Player[];
  winnerId: string | null;
  commentary?: string | null;
  isChallenge?: boolean;
  onReplay: () => void;
  onHome: () => void;
  onStartChallenge?: (rounds: number) => void;
};

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, minWidth: '30%', backgroundColor: palette.surface, borderRadius: radius.button, borderWidth: OUTLINE, borderColor: palette.line, padding: 12 }}>
      <T variant="caption" color={palette.inkSoft}>
        {label}
      </T>
      <T variant="heading" numeric>
        {value}
      </T>
    </View>
  );
}

export function FinalResults({ players, winnerId, commentary, isChallenge, onReplay, onHome, onStartChallenge }: FinalResultsProps) {
  const [challengeRounds, setChallengeRounds] = useState(5);
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = players.find((p) => p.id === winnerId) ?? sorted[0];
  // Le vainqueur (Killer Question comprise) passe en tête du podium.
  const ranked = winner ? [winner, ...sorted.filter((p) => p.id !== winner.id)] : sorted;

  useEffect(() => {
    playSound('win');
  }, []);

  const totalPlayed = players.reduce((n, p) => n + p.played, 0);
  const totalCorrect = players.reduce((n, p) => n + p.correct, 0);
  const levelCount = players.reduce((n, p) => n + p.levelCount, 0);
  const levelSum = players.reduce((n, p) => n + p.levelSum, 0);
  const steals = players.reduce((n, p) => n + p.stealWins, 0);
  const trophies = players.flatMap((p) => p.trophies.map((t) => ({ player: p, id: t })));

  return (
    <View style={{ flex: 1 }}>
      <ScreenBody
        gap={space.lg}
        bottom={
          <>
            <Button label="Rejouer avec la même équipe" size="xl" onPress={onReplay} />
            <Button label="Accueil" variant="ghost" onPress={onHome} />
          </>
        }
      >
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Lulu mood="hype" size={64} />
          <T variant="caption" color={palette.goldDeep} style={{ letterSpacing: 1.5 }}>
            {isChallenge ? 'DÉFI TERMINÉ' : 'FIN DE PARTIE'}
          </T>
          <T variant="hero" center adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 48, lineHeight: 52 }}>
            {winner?.name}
          </T>
          {commentary ? (
            <T variant="body" center color={palette.inkSoft} style={{ fontFamily: fonts.bold }}>
              {commentary}
            </T>
          ) : null}
        </View>

        <Podium players={ranked.map((p) => ({ id: p.id, name: p.name, score: p.score, color: p.color, profileId: p.profileId }))} />

        {ranked.length > 3 && <Leaderboard players={ranked.slice(3)} />}

        <SectionTitle>Statistiques</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Tile label="Réussite" value={totalPlayed > 0 ? `${Math.round((totalCorrect / totalPlayed) * 100)} %` : '–'} />
          <Tile label="Niveau moyen choisi" value={levelCount > 0 ? (levelSum / levelCount).toFixed(1) : '–'} />
          <Tile label="Vols réussis" value={String(steals)} />
        </View>

        {sorted.map((p) => (
          <SoftCard key={p.id} style={{ gap: 2 }}>
            <T variant="body" style={{ fontFamily: fonts.bold }}>
              {p.name}
            </T>
            <T variant="caption" color={palette.inkSoft}>
              {p.played > 0 ? `${p.correct}/${p.played} justes (${Math.round((p.correct / p.played) * 100)} %)` : 'Aucune question personnelle'} · niveau
              moyen {p.levelCount > 0 ? (p.levelSum / p.levelCount).toFixed(1) : '–'} · plus haut niveau réussi {p.maxLevelWon || '–'}
            </T>
            <T variant="caption" color={palette.inkSoft}>
              Vols réussis {p.stealWins}/{p.stealAttempts} · meilleure série {p.bestStreak}
            </T>
          </SoftCard>
        ))}

        {trophies.length > 0 && (
          <>
            <SectionTitle>Trophées</SectionTitle>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {trophies.map(({ player, id }) => (
                <View key={`${player.id}-${id}`} style={{ width: '30%', alignItems: 'center', gap: 4 }}>
                  <TrophyBadge id={id} emoji={TROPHIES[id]?.emoji ?? '🏆'} size={64} />
                  <T variant="caption" center style={{ fontFamily: fonts.bold }} numberOfLines={2}>
                    {TROPHIES[id]?.name}
                  </T>
                  <T variant="caption" color={palette.inkSoft} numberOfLines={1}>
                    {player.name}
                  </T>
                </View>
              ))}
            </View>
          </>
        )}

        {onStartChallenge && (
          <SoftCard tone="gold" borderColor={palette.goldDeep} style={{ gap: 8 }}>
            <T variant="heading">Mode Challenger</T>
            <T variant="body" color={palette.inkSoft}>
              Prolongez la partie : chacun choisit son thème, le niveau (5 à 10) est tiré au sort. Les scores et les jokers non utilisés continuent.
            </T>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Button label="−" variant="secondary" onPress={() => setChallengeRounds((n) => Math.max(1, n - 1))} />
              <T variant="heading" numeric>
                {challengeRounds} manche{challengeRounds > 1 ? 's' : ''}
              </T>
              <Button label="+" variant="secondary" onPress={() => setChallengeRounds((n) => Math.min(5, n + 1))} />
            </View>
            <Button label="Activer le mode Challenger" variant="gold" onPress={() => onStartChallenge(challengeRounds)} />
          </SoftCard>
        )}
      </ScreenBody>
      <Confetti gold count={50} />
    </View>
  );
}
