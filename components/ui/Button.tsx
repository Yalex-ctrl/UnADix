import { ComponentProps } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { haptic } from '@/lib/haptics';
import { fonts, OUTLINE, palette, radius } from '@/theme/tokens';

// Alias conservés pour le mode multi-téléphones et les anciens écrans.
export type ButtonVariant =
  | 'brand'
  | 'good'
  | 'bad'
  | 'gold'
  | 'steal'
  | 'ghost'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'voleur'
  | 'braquage'
  | 'auction';

type Core = 'brand' | 'good' | 'bad' | 'gold' | 'steal' | 'ghost' | 'white';

const ALIAS: Record<ButtonVariant, Core> = {
  brand: 'brand',
  good: 'good',
  bad: 'bad',
  gold: 'gold',
  steal: 'steal',
  ghost: 'ghost',
  primary: 'brand',
  secondary: 'white',
  danger: 'bad',
  success: 'good',
  voleur: 'steal',
  braquage: 'bad',
  auction: 'gold',
};

// Texte encre sur les couleurs claires (vert, jaune, cyan), blanc sur violet et rouge.
const LOOKS: Record<Core, { face: string; deep: string; fg: string }> = {
  brand: { face: palette.brand, deep: palette.brandDeep, fg: palette.white },
  good: { face: palette.good, deep: palette.goodDeep, fg: palette.ink },
  bad: { face: palette.bad, deep: palette.badDeep, fg: palette.white },
  gold: { face: palette.gold, deep: palette.goldDeep, fg: palette.ink },
  steal: { face: palette.steal, deep: palette.stealDeep, fg: palette.ink },
  white: { face: palette.surface, deep: palette.ink, fg: palette.ink },
  ghost: { face: 'transparent', deep: 'transparent', fg: palette.inkSoft },
};

type IconName = ComponentProps<typeof Feather>['name'];

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: 'm' | 'l' | 'xl';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

const DEPTH = 5;
const SIZES = {
  m: { minHeight: 48, font: 16, icon: 18, padH: 18 },
  l: { minHeight: 56, font: 18, icon: 20, padH: 22 },
  xl: { minHeight: 68, font: 22, icon: 24, padH: 24 },
} as const;

// Bouton « 3D » : face colorée, contour encre et socle. À l'appui, la face
// descend sur le socle.
export function Button({ label, variant = 'brand', size = 'm', icon, style, disabled, onPress, ...rest }: ButtonProps) {
  const core = ALIAS[variant];
  const look = LOOKS[core];
  const sz = SIZES[size];
  const ghost = core === 'ghost';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={(e) => {
        if (core === 'good') haptic.success();
        else if (core === 'bad') haptic.error();
        else haptic.select();
        onPress?.(e);
      }}
      style={style}
      {...rest}
    >
      {({ pressed }) => (
        <View style={[disabled && styles.disabled]}>
          {!ghost && (
            <View
              style={[
                styles.socle,
                { backgroundColor: look.deep, borderColor: palette.line, top: DEPTH, minHeight: sz.minHeight },
              ]}
            />
          )}
          <View
            style={[
              styles.face,
              {
                backgroundColor: look.face,
                borderColor: ghost ? 'transparent' : palette.line,
                borderWidth: ghost ? 0 : OUTLINE,
                minHeight: ghost ? 40 : sz.minHeight,
                paddingHorizontal: sz.padH,
                marginBottom: ghost ? 0 : DEPTH,
                transform: [{ translateY: pressed && !ghost ? DEPTH - 1 : 0 }],
              },
            ]}
          >
            <View style={styles.row}>
              {icon && <Feather name={icon} size={sz.icon} color={look.fg} />}
              <Text style={[styles.label, { fontSize: sz.font, color: look.fg }]} numberOfLines={2}>
                {label}
              </Text>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export { Button as Button3D };

const styles = StyleSheet.create({
  socle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.button,
    borderWidth: OUTLINE,
  },
  face: {
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: fonts.bold, textAlign: 'center' },
  disabled: { opacity: 0.4 },
});
