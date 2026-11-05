import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { TROPHIES } from '@/lib/trophies';
import { Player } from '@/types';
import { Leaderboard } from '../Leaderboard';
import { gameStyles } from '../gameStyles';

type FinalResultsProps = {
  players: Player[];
  winnerId: string | null;
  commentary: string | null;
  isChallenge?: boolean;
  onReplay: () => void;
  onStartChallenge?: (rounds: number) => void;
};

export function FinalResults({ players, winnerId, commentary, isChallenge, onReplay, onStartChallenge }: FinalResultsProps) {
  const [challengeRounds, setChallengeRounds] = useState(5);
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = players.find((p) => p.id === winnerId) ?? sorted[0];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={gameStyles.eyebrow}>{isChallenge ? 'DÉFI TERMINÉ' : 'FIN DE PARTIE !'}</Text>
      <Text style={gameStyles.winnerText}>🏆 {winner?.name}</Text>
      <Text style={styles.winnerScore}>{winner?.score} points</Text>
      {commentary && <Text style={styles.commentary}>« {commentary} »</Text>}

      <Leaderboard players={players} />

      <Text style={styles.sectionLabel}>Statistiques finales</Text>
      {sorted.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.cardTitle}>{p.name}</Text>
          <Text style={styles.cardLine}>
            {p.correct}/{p.played} bonnes réponses ({p.played > 0 ? Math.round((p.correct / p.played) * 100) : 0} %)
          </Text>
          <Text style={styles.cardLine}>
            Niveau moyen choisi : {p.levelCount > 0 ? (p.levelSum / p.levelCount).toFixed(1) : '–'} · plus haut niveau
            réussi : {p.maxLevelWon || '–'}
          </Text>
          <Text style={styles.cardLine}>
            Vols réussis : {p.stealWins}/{p.stealAttempts} · meilleure série : {p.bestStreak}
          </Text>
          {p.trophies.length > 0 && (
            <Text style={styles.trophies}>
              {p.trophies.map((t) => `${TROPHIES[t]?.emoji ?? ''} ${TROPHIES[t]?.name ?? t}`).join('  ·  ')}
            </Text>
          )}
        </View>
      ))}

      <Button label="Rejouer" onPress={onReplay} />

      {onStartChallenge && (
        <View style={styles.challengeCard}>
          <Text style={styles.challengeCardTitle}>🔥 Mode Challenger</Text>
          <Text style={styles.challengeCardBody}>
            Prolongez la partie : chaque joueur choisit son propre thème, le niveau (5 à 10) est tiré au sort et
            identique pour tous. Les scores continuent et les jokers non utilisés restent disponibles.
          </Text>
          <View style={styles.stepper}>
            <Button label="−" variant="secondary" onPress={() => setChallengeRounds((n) => Math.max(1, n - 1))} />
            <Text style={styles.stepperValue}>{challengeRounds} manche(s)</Text>
            <Button label="+" variant="secondary" onPress={() => setChallengeRounds((n) => Math.min(5, n + 1))} />
          </View>
          <Button
            label="Activer le mode Challenger"
            variant="auction"
            onPress={() => onStartChallenge(challengeRounds)}
            style={styles.challengeButton}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: 10, paddingVertical: 20 },
  winnerScore: { color: colors.textMuted, fontSize: 16, fontWeight: '700' },
  commentary: { color: colors.text, fontSize: 16, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 12 },
  sectionLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', alignSelf: 'flex-start' },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  cardLine: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  trophies: { color: colors.text, fontSize: 13, marginTop: 6 },
  challengeCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeCardTitle: { color: colors.auction, fontSize: 17, fontWeight: '800' },
  challengeCardBody: { color: colors.textMuted, fontSize: 14, marginTop: 6, lineHeight: 20 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 },
  stepperValue: { color: colors.text, fontSize: 16, fontWeight: '700' },
  challengeButton: { marginTop: 14 },
});
