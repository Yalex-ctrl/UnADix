import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { haptic } from '@/lib/haptics';
import { T } from './Typography';
import { levelColor, palette, radius, space } from '@/theme/tokens';

type LevelGridProps = {
  // Niveau -> joueur qui l'a déjà pris : la case est grisée et non cliquable.
  takenBy?: Record<number, { name: string; color: string }>;
  selected?: number | null;
  onChoose: (level: number) => void;
};

const GAP = space.sm;
const SIDE = space.lg;

export function LevelGrid({ takenBy = {}, selected, onChoose }: LevelGridProps) {
  const { width, fontScale } = useWindowDimensions();
  const inner = width - SIDE * 2;
  // 5 colonnes si les cases restent assez grosses (>= 64 pt), sinon 4.
  const fiveWide = (inner - GAP * 4) / 5;
  const cols = fiveWide >= 64 && fontScale <= 1.3 ? 5 : 4;
  const size = Math.floor((inner - GAP * (cols - 1)) / cols);
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {levels.map((level) => {
          const taker = takenBy[level];
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
              style={({ pressed }) => [
                styles.cell,
                { width: size, height: Math.max(size, 64) },
                taker
                  ? styles.taken
                  : { backgroundColor: palette.surface, borderColor: isSelected ? palette.primary : palette.border },
                isSelected && { backgroundColor: palette.primarySoft },
                pressed && !taker && { opacity: 0.8 },
              ]}
            >
              <T variant="title" numeric color={taker ? palette.textFaint : palette.text}>
                {level}
              </T>
              {taker ? (
                <View style={[styles.owner, { backgroundColor: taker.color }]}>
                  <T variant="caption" color="#FFFFFF" style={styles.ownerText} numberOfLines={1}>
                    {taker.name.slice(0, 1).toUpperCase()}
                  </T>
                </View>
              ) : (
                <View style={[styles.line, { backgroundColor: levelColor(level) }]} />
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendBar}>
          <View style={[styles.legendSeg, { backgroundColor: palette.success }]} />
          <View style={[styles.legendSeg, { backgroundColor: palette.gold }]} />
          <View style={[styles.legendSeg, { backgroundColor: palette.danger }]} />
        </View>
        <T variant="caption" color={palette.textMuted} center>
          Plus le niveau est haut, plus c’est difficile — et plus ça rapporte.
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'center' },
  cell: {
    borderRadius: radius.button,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  taken: { backgroundColor: palette.surfaceAlt, borderColor: palette.surfaceAlt },
  line: { width: 20, height: 3, borderRadius: 2 },
  owner: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  ownerText: { fontSize: 11, lineHeight: 14 },
  legend: { gap: space.sm, alignItems: 'center' },
  legendBar: { flexDirection: 'row', width: 120, height: 4, borderRadius: 2, overflow: 'hidden' },
  legendSeg: { flex: 1 },
});
