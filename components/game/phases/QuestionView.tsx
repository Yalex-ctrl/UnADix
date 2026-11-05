import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors, levelColor } from '@/constants/theme';
import { ConnectionMode } from '@/types';
import { BraquageButton } from '../BraquageButton';
import { gameStyles } from '../gameStyles';

type QuestionViewProps = {
  categoryName: string;
  level: number;
  playerName: string;
  questionText: string;
  braquage?: { braqueurName: string; victimName: string } | null;
  isAuction: boolean;
  eligibleBraqueurs: { id: string; name: string }[];
  connectionMode: ConnectionMode;
  jokerAvailable?: boolean;
  onJoker?: () => void;
  onReport?: () => void;
  onReveal: () => void;
  onBraquage: (braqueurId: string) => void;
};

export function QuestionView({
  categoryName,
  level,
  playerName,
  questionText,
  braquage,
  isAuction,
  eligibleBraqueurs,
  connectionMode,
  jokerAvailable,
  onJoker,
  onReport,
  onReveal,
  onBraquage,
}: QuestionViewProps) {
  return (
    <View style={gameStyles.centerContent}>
      <Text style={gameStyles.eyebrow}>{categoryName.toUpperCase()}</Text>
      <View style={gameStyles.levelBadgeWrap}>
        <Badge label={`Niveau ${level} · ${level} pts`} color={levelColor(level)} />
      </View>

      {braquage ? (
        <View style={styles.braquageBanner}>
          <Text style={styles.braquageBannerText}>
            🔴 {braquage.braqueurName} BRAQUE {braquage.victimName} !
          </Text>
        </View>
      ) : (
        <Text style={styles.playerLabel}>AU TOUR DE {playerName.toUpperCase()}</Text>
      )}

      <Text style={styles.question}>{questionText}</Text>
      <Button label="Voir la réponse" onPress={onReveal} />

      {!braquage && !isAuction && onJoker && (
        <Button
          label={jokerAvailable ? '🎟️ Utiliser mon joker' : '🎟️ Joker déjà utilisé'}
          variant="secondary"
          disabled={!jokerAvailable}
          onPress={onJoker}
        />
      )}

      {!braquage && !isAuction && (
        <BraquageButton eligiblePlayers={eligibleBraqueurs} connectionMode={connectionMode} onBraquage={onBraquage} />
      )}

      {onReport && <Button label="🚩 Signaler / remplacer la question" variant="ghost" onPress={onReport} />}
    </View>
  );
}

const styles = StyleSheet.create({
  playerLabel: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  question: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 14,
    paddingHorizontal: 8,
    lineHeight: 32,
  },
  braquageBanner: {
    marginTop: 6,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.braquage,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  braquageBannerText: {
    color: colors.braquage,
    fontSize: 15,
    fontWeight: '800',
  },
});
