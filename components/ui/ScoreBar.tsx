import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { T } from './Typography';
import { palette, space } from '@/theme/tokens';

type ScoreBarPlayer = {
  id: string;
  name: string;
  score: number;
  color?: string;
  profileId?: string;
  jokerUsed?: boolean;
};

type CellProps = { player: ScoreBarPlayer; active?: boolean; showName: boolean };

function Cell({ player, active, showName }: CellProps) {
  // Petit rebond quand le score change.
  const bump = useSharedValue(1);
  useEffect(() => {
    bump.set(withSequence(withTiming(1.25, { duration: 120 }), withSpring(1)));
  }, [player.score, bump]);
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));
  const size = active ? 52 : 40;

  return (
    <View style={styles.cell}>
      <View>
        <Avatar name={player.name} color={player.color} profileId={player.profileId} size={size} ring={active} />
        {player.jokerUsed !== undefined && (
          <View style={styles.joker}>
            <Feather name="award" size={11} color={player.jokerUsed ? palette.inkFaint : palette.ink} />
          </View>
        )}
      </View>
      <Animated.View style={scoreStyle}>
        <T variant="heading" numeric style={active ? styles.scoreActive : undefined}>
          {player.score}
        </T>
      </Animated.View>
      {(showName || active) && (
        <T variant="caption" color={active ? palette.ink : palette.inkSoft} numberOfLines={1} style={styles.name}>
          {player.name}
        </T>
      )}
    </View>
  );
}

// Bandeau des scores : avatar rond + score en gros ; le joueur actif est
// agrandi avec un anneau de sa couleur. Le prénom (12 px minimum) est montré
// sous chaque joueur quand la place le permet, et toujours pour le joueur actif.
export function ScoreBar({ players, activeId }: { players: ScoreBarPlayer[]; activeId?: string }) {
  const { width } = useWindowDimensions();
  const scrolls = players.length * 64 + space.lg * 2 > width;
  const showNames = players.length <= 6;
  const cells = players.map((p) => <Cell key={p.id} player={p} active={p.id === activeId} showName={showNames} />);

  if (scrolls) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {cells}
      </ScrollView>
    );
  }
  return <View style={[styles.strip, { justifyContent: 'space-around' }]}>{cells}</View>;
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, paddingBottom: space.sm, alignItems: 'flex-end' },
  cell: { alignItems: 'center', minWidth: 56, gap: 2 },
  scoreActive: { fontSize: 24, lineHeight: 28 },
  name: { fontSize: 12, lineHeight: 15, maxWidth: 72 },
  joker: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.gold,
    borderWidth: 1.5,
    borderColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
