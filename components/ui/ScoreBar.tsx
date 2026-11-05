import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { T } from './Typography';
import { palette, radius, space } from '@/theme/tokens';

type ScoreBarPlayer = { id: string; name: string; score: number; color?: string; jokerUsed?: boolean };

type PlayerBadgeProps = {
  player: ScoreBarPlayer;
  active?: boolean;
  compact?: boolean;
};

export function PlayerBadge({ player, active, compact }: PlayerBadgeProps) {
  const color = player.color ?? palette.primary;
  return (
    <View
      style={[
        styles.badge,
        compact && styles.compact,
        { borderColor: active ? color : palette.border, backgroundColor: active ? palette.surface : palette.surfaceAlt },
        active && styles.active,
      ]}
    >
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={styles.texts}>
        <T variant="caption" color={palette.textMuted} numberOfLines={1} style={styles.name}>
          {player.name}
        </T>
        <T variant="heading" numeric style={styles.score}>
          {player.score}
        </T>
      </View>
      {player.jokerUsed !== undefined && (
        <Feather
          name="award"
          size={13}
          color={player.jokerUsed ? palette.textFaint : palette.gold}
          accessibilityLabel={player.jokerUsed ? 'Joker utilisé' : 'Joker disponible'}
        />
      )}
    </View>
  );
}

// Bandeau des scores : une pastille par joueur, le joueur actif est mis en
// avant. Défile horizontalement au-delà de 5 joueurs.
export function ScoreBar({ players, activeId }: { players: ScoreBarPlayer[]; activeId?: string }) {
  const { width } = useWindowDimensions();
  // Défile dès que les pastilles ne tiennent plus côte à côte (petit écran ou > 5 joueurs).
  const scrolls = players.length > 5 || players.length * 84 + space.lg * 2 > width;
  const content = players.map((p) => (
    <View key={p.id} style={scrolls ? undefined : styles.cell}>
      <PlayerBadge player={p} active={p.id === activeId} compact={!scrolls && players.length > 3} />
    </View>
  ));
  if (scrolls) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {content}
      </ScrollView>
    );
  }
  return <View style={styles.strip}>{content}</View>;
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm },
  cell: { flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.button,
    borderWidth: 1.5,
    paddingVertical: space.sm,
    paddingRight: space.md,
    overflow: 'hidden',
    minWidth: 76,
  },
  compact: { paddingRight: space.sm },
  active: { shadowColor: '#1A1A1F', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  bar: { width: 5, alignSelf: 'stretch', marginRight: 2 },
  texts: { flex: 1 },
  name: { fontSize: 12, lineHeight: 15 },
  score: { fontSize: 20, lineHeight: 24 },
});
