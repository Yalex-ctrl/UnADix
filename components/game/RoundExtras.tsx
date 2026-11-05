import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { TROPHIES } from '@/lib/trophies';
import { Player, TrophyEvent } from '@/types';

type RoundExtrasProps = {
  players: Player[];
  commentary: string | null;
  newTrophies: TrophyEvent[];
  onAllIn?: () => void;
  onRemovePlayer?: (id: string) => void;
};

// Shared block shown under the leaderboard at the end of a round: presenter
// line, trophies just unlocked, All-In challenge and player removal.
export function RoundExtras({ players, commentary, newTrophies, onAllIn, onRemovePlayer }: RoundExtrasProps) {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? '';

  const confirmRemove = (p: Player) =>
    Alert.alert(`Retirer ${p.name} ?`, 'Le joueur quitte la partie et le classement est recalculé.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => onRemovePlayer?.(p.id) },
    ]);

  return (
    <View style={styles.wrap}>
      {commentary && (
        <View style={styles.tv}>
          <Text style={styles.tvLabel}>🎙️ LE PRÉSENTATEUR</Text>
          <Text style={styles.tvText}>{commentary}</Text>
        </View>
      )}

      {newTrophies.map((t) => {
        const trophy = TROPHIES[t.trophyId];
        if (!trophy) return null;
        return (
          <View key={`${t.playerId}-${t.trophyId}`} style={styles.trophy}>
            <Text style={styles.trophyLabel}>🏆 NOUVEAU TROPHÉE</Text>
            <Text style={styles.trophyName}>
              {trophy.emoji} {trophy.name.toUpperCase()}
            </Text>
            <Text style={styles.trophyText}>
              {nameOf(t.playerId)} : {trophy.description}
            </Text>
          </View>
        );
      })}

      {onAllIn && <Button label="🎲 DÉFIER UN JOUEUR — ALL-IN" variant="auction" onPress={onAllIn} />}

      {onRemovePlayer && players.length > 2 && (
        <View style={styles.removeRow}>
          <Text style={styles.removeLabel}>Retirer un joueur :</Text>
          {players.map((p) => (
            <Pressable key={p.id} onPress={() => confirmRemove(p)} style={styles.removeChip}>
              <Text style={styles.removeChipText}>{p.name} ✕</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 10 },
  tv: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tvLabel: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  tvText: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4, lineHeight: 22 },
  trophy: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.auction,
    alignItems: 'center',
  },
  trophyLabel: { color: colors.auction, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  trophyName: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 2 },
  trophyText: { color: colors.textMuted, fontSize: 13, marginTop: 2, textAlign: 'center' },
  removeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 4 },
  removeLabel: { color: colors.textMuted, fontSize: 12 },
  removeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  removeChipText: { color: colors.textMuted, fontSize: 12 },
});
