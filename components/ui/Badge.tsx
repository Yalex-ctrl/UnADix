import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type BadgeProps = {
  label: string;
  color?: string;
  textColor?: string;
  outline?: boolean;
};

export function Badge({ label, color = colors.primary, textColor, outline = false }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        outline
          ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color }
          : { backgroundColor: color },
      ]}
    >
      <Text style={[styles.text, { color: textColor ?? (outline ? color : colors.background) }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
