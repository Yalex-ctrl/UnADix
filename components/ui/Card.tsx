import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { OUTLINE, palette, POP_OFFSET, radius, shadow } from '@/theme/tokens';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  tone?: 'default' | 'soft' | 'gold' | 'primary';
};

const TONES = {
  default: palette.surface,
  soft: palette.bgDeep,
  gold: palette.goldSoft,
  primary: palette.brandSoft,
} as const;

// Carte douce, sans contour : pour tout ce qui n'est pas « important ».
export function SoftCard({ children, style, borderColor = palette.border, tone = 'default' }: CardProps) {
  return <View style={[styles.soft, { borderColor, backgroundColor: TONES[tone] }, style]}>{children}</View>;
}

// Carte pop : contour encre 2 px et ombre pleine décalée. Réservée aux
// éléments importants (question, carte joueur, trophée).
export function PopCard({ children, style, tone = 'default', color }: CardProps & { color?: string }) {
  return (
    <View style={{ paddingRight: POP_OFFSET, paddingBottom: POP_OFFSET }}>
      <View style={styles.shadow} />
      <View style={[styles.pop, { backgroundColor: color ?? TONES[tone] }, style]}>{children}</View>
    </View>
  );
}

// Compatibilité (multi-téléphones, anciens écrans) : carte douce.
export const Card = SoftCard;

const styles = StyleSheet.create({
  soft: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 16,
    ...shadow.card,
  },
  shadow: {
    position: 'absolute',
    top: POP_OFFSET,
    left: POP_OFFSET,
    right: 0,
    bottom: 0,
    borderRadius: radius.card,
    backgroundColor: palette.ink,
  },
  pop: {
    borderRadius: radius.card,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    padding: 16,
  },
});
