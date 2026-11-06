import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenBody } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { T } from '@/components/ui/Typography';
import { TROPHIES } from '@/lib/trophies';
import { palette, radius, shadow, fonts } from '@/theme/tokens';
import { Player } from '@/types';
import { Leaderboard } from '../Leaderboard';

type FinalResultsProps = {
  players: Player[];
  winnerId: string | null;
  isChallenge?: boolean;
  onReplay: () => void;
  onHome: () => void;
  onStartChallenge?: (rounds: number) => void;
};

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, minWidth: '30%', backgroundColor: palette.surface, borderRadius: radius.button, padding: 12, ...shadow.card }}>
      <T variant="caption" color={palette.textMuted}>
        {label}
      </T>
      <T variant="heading" numeric>
        {value}
      </T>
    </View>
  );
}

export function FinalResults({ players, winnerId, isChallenge, onReplay, onHome, onStartChallenge }: FinalResultsProps) {
  const [challengeRounds, setChallengeRounds] = useState(5);
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = players.find((p) => p.id === winnerId) ?? sorted[0];
  const podium = [sorted[1], sorted[0], sorted[2]].filter(Boolean) as Player[];
  const heights: Record<number, number> = { 0: 96, 1: 72, 2: 56 };

  const totalPlayed = players.reduce((n, p) => n + p.played, 0);
  const totalCorrect = players.reduce((n, p) => n + p.correct, 0);
  const levelCount = players.reduce((n, p) => n + p.levelCount, 0);
  const levelSum = players.reduce((n, p) => n + p.levelSum, 0);
  const steals = players.reduce((n, p) => n + p.stealWins, 0);
  const trophies = players.flatMap((p) => p.trophies.map((t) => ({ player: p, id: t })));

  return (
    <ScreenBody
      gap={16}
      bottom={
        <>
          <Button label="Rejouer avec les mêmes joueurs" size="l" onPress={onReplay} />
          <Button label="Accueil" variant="ghost" onPress={onHome} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 4 }}>
        <T variant="caption" color={palette.gold} style={{ letterSpacing: 1 }}>
          {isChallenge ? 'DÉFI TERMINÉ' : 'FIN DE PARTIE'}
        </T>
        <T variant="display" center>
          {winner?.name}
        </T>
        <T variant="heading" color={palette.gold} numeric>
          {winner?.score} points
        </T>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
        {podium.map((p) => {
          const rank = sorted.indexOf(p);
          return (
            <View key={p.id} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <T variant="body" style={{ fontFamily: fonts.bold }} numberOfLines={1}>
                {p.name}
              </T>
              <View
                style={{
                  width: '100%',
                  height: heights[rank],
                  backgroundColor: rank === 0 ? palette.goldSoft : palette.surfaceAlt,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  borderBottomWidth: 4,
                  borderBottomColor: p.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <T variant="title" numeric color={rank === 0 ? palette.gold : palette.textMuted}>
                  {rank + 1}
                </T>
              </View>
              <T variant="caption" color={palette.textMuted} numeric>
                {p.score} pts
              </T>
            </View>
          );
        })}
      </View>

      {sorted.length > 3 && <Leaderboard players={sorted.slice(3)} />}

      <SectionTitle>Statistiques</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Tile label="Réussite" value={totalPlayed > 0 ? `${Math.round((totalCorrect / totalPlayed) * 100)} %` : '–'} />
        <Tile label="Niveau moyen choisi" value={levelCount > 0 ? (levelSum / levelCount).toFixed(1) : '–'} />
        <Tile label="Vols réussis" value={String(steals)} />
      </View>

      {sorted.map((p) => (
        <Card key={p.id} style={{ gap: 2 }}>
          <T variant="body" color={p.color} style={{ fontFamily: fonts.bold }}>
            {p.name}
          </T>
          <T variant="caption" color={palette.textMuted}>
            {p.played > 0 ? `${p.correct}/${p.played} justes (${Math.round((p.correct / p.played) * 100)} %)` : 'Aucune question personnelle'} ·
            niveau moyen {p.levelCount > 0 ? (p.levelSum / p.levelCount).toFixed(1) : '–'} · plus haut niveau réussi{' '}
            {p.maxLevelWon || '–'}
          </T>
          <T variant="caption" color={palette.textMuted}>
            Vols réussis {p.stealWins}/{p.stealAttempts} · meilleure série {p.bestStreak}
          </T>
        </Card>
      ))}

      {trophies.length > 0 && (
        <>
          <SectionTitle>Trophées</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {trophies.map(({ player, id }) => (
              <View
                key={`${player.id}-${id}`}
                style={{ width: '48%', backgroundColor: palette.goldSoft, borderRadius: radius.button, padding: 12, gap: 2 }}
              >
                <T variant="heading">{TROPHIES[id]?.emoji}</T>
                <T variant="caption" style={{ fontFamily: fonts.bold }}>
                  {TROPHIES[id]?.name}
                </T>
                <T variant="caption" color={palette.textMuted}>
                  {player.name}
                </T>
              </View>
            ))}
          </View>
        </>
      )}

      {onStartChallenge && (
        <Card tone="gold" borderColor={palette.gold} style={{ gap: 8 }}>
          <T variant="heading">Mode Challenger</T>
          <T variant="body" color={palette.textMuted}>
            Prolongez la partie : chacun choisit son thème, le niveau (5 à 10) est tiré au sort. Les scores et les jokers
            non utilisés continuent.
          </T>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Button label="−" variant="secondary" onPress={() => setChallengeRounds((n) => Math.max(1, n - 1))} />
            <T variant="heading" numeric>
              {challengeRounds} manche{challengeRounds > 1 ? 's' : ''}
            </T>
            <Button label="+" variant="secondary" onPress={() => setChallengeRounds((n) => Math.min(5, n + 1))} />
          </View>
          <Button label="Activer le mode Challenger" variant="gold" onPress={() => onStartChallenge(challengeRounds)} />
        </Card>
      )}
    </ScreenBody>
  );
}
