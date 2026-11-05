import { Text, TextProps } from 'react-native';
import { palette, tabular, type } from '@/theme/tokens';

export type TypeVariant = keyof typeof type;

type TProps = TextProps & {
  variant?: TypeVariant;
  color?: string;
  center?: boolean;
  numeric?: boolean; // chiffres tabulaires (scores, compteurs)
};

// Seul composant de texte du design system : échelle typographique unique.
export function T({ variant = 'body', color = palette.text, center, numeric, style, ...rest }: TProps) {
  return (
    <Text
      {...rest}
      style={[type[variant], { color }, center && { textAlign: 'center' }, numeric && tabular, style]}
    />
  );
}
