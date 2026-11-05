import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { PulseGlow } from '@/components/ui/PulseGlow';

type ThiefBadgeProps = {
  thiefName: string;
};

// Always-visible indicator of who this turn's designated "Voleur du tour" is
// (visible from the start of the turn, not just when a steal is attempted).
export function ThiefBadge({ thiefName }: ThiefBadgeProps) {
  return (
    <PulseGlow color={colors.voleur} style={styles.wrap}>
      <View style={styles.inner}>
        <Text style={styles.label}>🕵️ VOLEUR DU TOUR</Text>
        <Text style={styles.name}>{thiefName}</Text>
      </View>
    </PulseGlow>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inner: {
    alignItems: 'center',
  },
  label: {
    color: colors.voleur,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
});
