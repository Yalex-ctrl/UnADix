import { View, Text, StyleSheet } from 'react-native';
import { fonts, palette } from '@/theme/tokens';

type BadgeProps = {
  label: string;
  color?: string;
  textColor?: string;
  outline?: boolean;
};

export function Badge({ label, color = palette.primary, textColor, outline = false }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        outline ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color } : { backgroundColor: color },
      ]}
    >
      <Text style={[styles.text, { color: textColor ?? (outline ? color : palette.onPrimary) }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'center',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
