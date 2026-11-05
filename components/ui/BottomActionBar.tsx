import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, space } from '@/theme/tokens';

// Zone d'action fixée en bas de l'écran : le bouton principal ne passe jamais
// sous le bord, la zone sûre est respectée.
export function BottomActionBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.md) + space.xs }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: palette.bg,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: space.md,
    paddingHorizontal: space.lg,
    gap: space.sm,
  },
});
