import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { T } from './Typography';
import { OUTLINE, palette, radius } from '@/theme/tokens';

type PillProps = {
  label: string;
  color?: string;
  ink?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  outlined?: boolean;
};

// Pastille d'information (niveau, points, mode). La couleur est un fond clair ou
// vif, le texte reste encre pour le contraste.
export function Pill({ label, color = palette.surface, ink = palette.ink, icon, outlined = true }: PillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: color, borderColor: outlined ? palette.line : 'transparent' }]}>
      {icon && <Feather name={icon} size={14} color={ink} />}
      <T variant="caption" color={ink} style={{ fontFamily: 'Nunito_800ExtraBold' }}>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    borderRadius: radius.chip,
    borderWidth: OUTLINE,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
});
