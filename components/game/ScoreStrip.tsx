import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type ScoreStripProps = {
  players: { id: string; name: string; score: number; color?: string; jokerUsed?: boolean }[];
};

export function ScoreStrip({ players }: ScoreStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      {players.map((p) => (
        <View key={p.id} style={[styles.chip, p.color ? { borderColor: p.color } : null]}>
          <Text style={styles.name} numberOfLines={1}>
            {p.name} {p.jokerUsed === undefined ? '' : p.jokerUsed ? '' : '🎟️'}
          </Text>
          <Text style={styles.value}>{p.score}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 72,
    alignItems: 'center',
  },
  name: {
    color: colors.textMuted,
    fontSize: 12,
    maxWidth: 90,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});
