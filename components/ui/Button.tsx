import { ComponentProps } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { haptic } from '@/lib/haptics';
import { fonts, palette, radius } from '@/theme/tokens';

// 'voleur', 'braquage' et 'auction' sont conservés pour la compatibilité avec
// le mode multi-téléphones ; ils se rabattent sur les variantes du design system.
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'gold'
  | 'voleur'
  | 'braquage'
  | 'auction';

type IconName = ComponentProps<typeof Feather>['name'];

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  size?: 'm' | 'l';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

type Look = { bg: string; fg: string; border?: string };

const LOOKS: Record<Exclude<ButtonVariant, 'voleur' | 'braquage' | 'auction'>, Look> = {
  primary: { bg: palette.primary, fg: palette.onPrimary },
  secondary: { bg: palette.surface, fg: palette.text, border: palette.border },
  ghost: { bg: 'transparent', fg: palette.textMuted },
  danger: { bg: palette.dangerSoft, fg: palette.danger },
  success: { bg: palette.success, fg: '#FFFFFF' },
  gold: { bg: palette.goldSoft, fg: palette.gold, border: palette.gold },
};

const ALIASES = { voleur: 'primary', braquage: 'danger', auction: 'gold' } as const;

export function Button({ label, variant = 'primary', size = 'm', icon, style, disabled, onPress, ...rest }: ButtonProps) {
  const key = variant in ALIASES ? ALIASES[variant as keyof typeof ALIASES] : (variant as keyof typeof LOOKS);
  const look = LOOKS[key];
  const large = size === 'l';
  const isGhost = key === 'ghost';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={(e) => {
        if (key === 'success') haptic.success();
        else if (key === 'danger') haptic.error();
        else haptic.select();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        large ? styles.large : styles.medium,
        {
          backgroundColor: look.bg,
          borderColor: look.border ?? 'transparent',
          borderWidth: look.border ? 1.5 : 0,
        },
        isGhost && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <View style={styles.row}>
        {icon && <Feather name={icon} size={large ? 20 : 18} color={look.fg} />}
        <Text style={[styles.label, large && styles.labelLarge, { color: look.fg }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medium: { minHeight: 48, paddingVertical: 12 },
  large: { minHeight: 56, paddingVertical: 14 },
  ghost: { minHeight: 40, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: fonts.bold, fontSize: 16, textAlign: 'center' },
  labelLarge: { fontSize: 17 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.4 },
});
