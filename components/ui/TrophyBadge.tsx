import { StyleSheet, View } from 'react-native';
import { T } from './Typography';
import { OUTLINE, palette } from '@/theme/tokens';

// Couleur propre à chaque trophée, pour que les badges se distinguent d'un coup d'œil.
const TROPHY_COLORS: Record<string, string> = {
  aventurier: palette.orange,
  sage: palette.brand,
  sniper: palette.bad,
  phenix: palette.ember,
  toutOuRien: palette.purple,
  chanceux: palette.good,
  roiDuTheme: palette.gold,
  braqueur: palette.indigo,
  kamikaze: palette.rose,
  survivant: palette.teal,
};

export const trophyColor = (id: string) => TROPHY_COLORS[id] ?? palette.gold;

// Badge illustré : médaillon coloré cerclé d'encre avec l'émoji du trophée.
export function TrophyBadge({ id, emoji, size = 72, count }: { id: string; emoji: string; size?: number; count?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.medal,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: trophyColor(id) },
        ]}
      >
        <T variant="heading" style={{ fontSize: size * 0.46, lineHeight: size * 0.56 }}>
          {emoji}
        </T>
      </View>
      {count && count > 1 ? (
        <View style={styles.count}>
          <T variant="caption" color={palette.white} style={{ fontSize: 12, lineHeight: 14 }}>
            ×{count}
          </T>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  medal: { borderWidth: OUTLINE + 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  count: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: palette.ink,
    borderRadius: 10,
    paddingHorizontal: 6,
    minWidth: 24,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
