import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/constants/theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
};

export function Card({ children, style, borderColor = colors.border }: CardProps) {
  return <View style={[styles.card, { borderColor }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
});
