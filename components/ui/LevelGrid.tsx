import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';
import { Avatar } from './Avatar';
import { T } from './Typography';
import { levelColor, levelInk, OUTLINE, palette, radius, space } from '@/theme/tokens';

type Taker = { name: string; color: string; profileId?: string };

type LevelWallProps = {
  // Niveau -> joueur qui l'a pris : la tuile se retourne et montre son avatar.
  takenBy?: Record<number, Taker>;
  selected?: number | null;
  onChoose: (level: number) => void;
};

const GAP = space.sm;
const SIDE = space.lg;
const DEPTH = 5;

// « Le Mur » : tuiles 3D colorées selon l'échelle des niveaux.
export function LevelWall({ takenBy = {}, selected, onChoose }: LevelWallProps) {
  const { width, fontScale } = useWindowDimensions();
  const inner = width - SIDE * 2;
  const fiveWide = (inner - GAP * 4) / 5;
  const cols = fiveWide >= 60 && fontScale <= 1.3 ? 5 : 4;
  const size = Math.floor((inner - GAP * (cols - 1)) / cols);
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {levels.map((level) => {
          const taker = takenBy[level];
          const color = levelColor(level);
          const isSelected = selected === level;
          return (
            <Pressable
              key={level}
              disabled={!!taker}
              accessibilityRole="button"
              accessibilityLabel={taker ? `Niveau ${level}, pris par ${taker.name}` : `Niveau ${level}`}
              accessibilityState={{ disabled: !!taker, selected: isSelected }}
              onPress={() => {
                haptic.select();
                onChoose(level);
              }}
              style={{ width: size }}
            >
              {({ pressed }) => (
                <View style={{ height: Math.max(size, 64) + DEPTH }}>
                  <View
                    style={[
                      styles.socle,
                      { backgroundColor: taker ? palette.bgDeep : palette.ink, height: Math.max(size, 64) },
                    ]}
                  />
                  <View
                    style={[
                      styles.face,
                      {
                        height: Math.max(size, 64),
                        backgroundColor: taker ? palette.bgDeep : color,
                        borderColor: taker ? palette.inkFaint : palette.line,
                        transform: [{ translateY: pressed && !taker ? DEPTH - 1 : 0 }],
                      },
                      isSelected && { borderWidth: 4 },
                    ]}
                  >
                    {taker ? (
                      <Animated.View entering={ZoomIn.springify()} style={styles.takerWrap}>
                        <T variant="caption" color={palette.inkFaint} numeric style={styles.smallNumber}>
                          {level}
                        </T>
                        <Avatar name={taker.name} color={taker.color} profileId={taker.profileId} size={Math.min(size - 20, 40)} />
                      </Animated.View>
                    ) : (
                      <Animated.View entering={FadeIn}>
                        <T variant="display" numeric color={levelInk(level)}>
                          {level}
                        </T>
                      </Animated.View>
                    )}
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      <T variant="caption" color={palette.inkSoft} center>
        Plus le niveau est haut, plus c’est difficile — et plus ça rapporte.
      </T>
    </View>
  );
}

// Ancien nom, conservé pour les écrans qui l'utilisent.
export const LevelGrid = LevelWall;

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'center' },
  socle: { position: 'absolute', left: 0, right: 0, top: DEPTH, borderRadius: radius.button },
  face: { borderRadius: radius.button, borderWidth: OUTLINE, alignItems: 'center', justifyContent: 'center' },
  takerWrap: { alignItems: 'center', gap: 2 },
  smallNumber: { fontSize: 11, lineHeight: 13 },
});
