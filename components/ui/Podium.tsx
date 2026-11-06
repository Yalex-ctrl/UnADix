import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { Avatar } from './Avatar';
import { T } from './Typography';
import { OUTLINE, palette, space } from '@/theme/tokens';

type PodiumPlayer = { id: string; name: string; score: number; color: string; profileId?: string };

// Podium 3D des trois premiers : marches à contour encre, avatars posés dessus.
export function Podium({ players }: { players: PodiumPlayer[] }) {
  const reduced = useReducedMotion();
  const top = players.slice(0, 3);
  const order = [top[1], top[0], top[2]].filter(Boolean);
  const heights = [96, 128, 72];
  const colors = [palette.bgDeep, palette.gold, palette.peach];

  return (
    <View style={styles.row}>
      {order.map((p) => {
        const rank = top.indexOf(p);
        const slot = rank === 0 ? 1 : rank === 1 ? 0 : 2;
        return (
          <Animated.View
            key={p.id}
            entering={reduced ? undefined : FadeInUp.delay((2 - rank) * 220).springify().damping(13)}
            style={styles.col}
          >
            <Avatar name={p.name} color={p.color} profileId={p.profileId} size={rank === 0 ? 64 : 52} />
            <T variant="body" numberOfLines={1} style={{ fontFamily: 'Nunito_800ExtraBold' }}>
              {p.name}
            </T>
            <View style={[styles.step, { height: heights[slot], backgroundColor: colors[rank] }]}>
              <T variant="display" numeric>
                {rank + 1}
              </T>
              <T variant="caption" color={palette.ink} numeric>
                {p.score} pts
              </T>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: space.sm },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  step: {
    width: '100%',
    borderWidth: OUTLINE,
    borderColor: palette.line,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
