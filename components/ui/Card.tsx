import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { palette, radius, shadow } from '@/theme/tokens';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  tone?: 'default' | 'soft' | 'gold' | 'primary';
};

const TONES = {
  default: palette.surface,
  soft: palette.surfaceAlt,
  gold: palette.goldSoft,
  primary: palette.primarySoft,
} as const;

export function Card({ children, style, borderColor = palette.border, tone = 'default' }: CardProps) {
  return <View style={[styles.card, { borderColor, backgroundColor: TONES[tone] }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 16,
    ...shadow.card,
  },
});
