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
      style={({ pressed }) => [styles.icon, pressed && { backgroundColor: palette.bgDeep }]}
    >
      <Feather name={icon} size={22} color={disabled ? palette.inkFaint : palette.ink} />
    </Pressable>
  );
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  // Barre de progression segmentée (manche en cours sur le total).
  progress?: { current: number; total: number };
  onUndo?: () => void;
  undoDisabled?: boolean;
  onMenu?: () => void;
  onClose?: () => void;
  onBack?: () => void;
};

// En-tête fixe : titre à gauche ; annuler (toujours présent, grisé si rien à
// annuler), menu ⋯ (réglages, quitter) et fermeture à droite.
export function Header({ title, subtitle, progress, onUndo, undoDisabled, onMenu, onClose, onBack }: HeaderProps) {
  return (
    <View>
      <View style={styles.row}>
        {onBack && <IconButton icon="arrow-left" label="Retour" onPress={onBack} />}
        <View style={styles.titles}>
          <T variant="heading" numberOfLines={1}>
            {title}
          </T>
          {subtitle && (
            <T variant="caption" color={palette.inkSoft}>
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
      {progress && progress.total > 0 && (
        <View style={styles.progress} accessibilityLabel={`Manche ${progress.current} sur ${progress.total}`}>
          {Array.from({ length: progress.total }, (_, i) => (
            <View
              key={i}
              style={[styles.segment, { backgroundColor: i < progress.current ? palette.brand : palette.bgDeep }]}
            />
          ))}
        </View>
      )}
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
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: space.lg, paddingBottom: space.sm },
  segment: { flex: 1, height: 6, borderRadius: 3, borderWidth: 1, borderColor: palette.ink },
});
