import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { haptic } from '@/lib/haptics';
import { T } from './Typography';
import { palette, space } from '@/theme/tokens';

type IconButtonProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function IconButton({ icon, label, onPress, disabled }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => {
        haptic.select();
        onPress?.();
      }}
      style={({ pressed }) => [styles.icon, pressed && { backgroundColor: palette.surfaceAlt }]}
    >
      <Feather name={icon} size={20} color={disabled ? palette.textFaint : palette.text} />
    </Pressable>
  );
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  onUndo?: () => void;
  undoDisabled?: boolean;
  onMenu?: () => void;
  onClose?: () => void;
  onBack?: () => void;
};

// En-tête fixe des écrans de jeu : manche à gauche ; annuler (toujours là,
// grisé quand il n'y a rien à annuler), menu et fermeture à droite.
export function Header({ title, subtitle, onUndo, undoDisabled, onMenu, onClose, onBack }: HeaderProps) {
  return (
    <View style={styles.row}>
      {onBack && <IconButton icon="arrow-left" label="Retour" onPress={onBack} />}
      <View style={styles.titles}>
        <T variant="heading" numberOfLines={1}>
          {title}
        </T>
        {subtitle && (
          <T variant="caption" color={palette.textMuted}>
            {subtitle}
          </T>
        )}
      </View>
      <View style={styles.actions}>
        {onUndo && <IconButton icon="rotate-ccw" label="Annuler la dernière action" onPress={onUndo} disabled={undoDisabled} />}
        {onMenu && <IconButton icon="more-horizontal" label="Menu de la partie" onPress={onMenu} />}
        {onClose && <IconButton icon="x" label="Quitter la partie" onPress={onClose} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.sm,
    minHeight: 52,
  },
  titles: { flex: 1, paddingRight: space.sm },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
