import { Pressable, Text, StyleSheet, PressableProps, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'voleur' | 'braquage' | 'auction' | 'success' | 'danger' | 'ghost';

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: colors.text },
  secondary: { bg: 'transparent', text: colors.textMuted, border: colors.border },
  voleur: { bg: colors.voleur, text: colors.background },
  braquage: { bg: colors.braquage, text: colors.text },
  auction: { bg: colors.auction, text: colors.background },
  success: { bg: colors.success, text: colors.background },
  danger: { bg: colors.danger, text: colors.background },
  ghost: { bg: 'transparent', text: colors.textMuted },
};

export function Button({ label, variant = 'primary', style, disabled, ...rest }: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border ?? 'transparent', borderWidth: v.border ? 1 : 0 },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
});
