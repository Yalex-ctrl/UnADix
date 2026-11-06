import { StyleSheet, View } from 'react-native';
import { T } from './Typography';
import { OUTLINE, palette } from '@/theme/tokens';

// Couleur propre à chaque trophée, pour que les badges se distinguent d'un coup d'œil.
const TROPHY_COLORS: Record<string, string> = {
  aventurier: '#FF9F1C',
  sage: '#6C3BFF',
  sniper: '#FF4D5E',
  phenix: '#FF7A3D',
  toutOuRien: '#9B1BFF',
  chanceux: '#22C55E',
  roiDuTheme: '#FFC233',
  braqueur: '#3D5AFE',
  kamikaze: '#E5246F',
  survivant: '#14C8B8',
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
          <T variant="caption" color="#FFFFFF" style={{ fontSize: 12, lineHeight: 14 }}>
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
