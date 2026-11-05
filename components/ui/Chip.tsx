import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { haptic } from '@/lib/haptics';
import { fonts, palette, radius } from '@/theme/tokens';

type ChipProps = {
  label: string;
  selected?: boolean;
  color?: string; // couleur du joueur ou de l'état
  disabled?: boolean;
  onPress?: () => void;
};

// Pastille sélectionnable (candidats au vol, joueurs, options).
export function Chip({ label, selected, color = palette.primary, disabled, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        haptic.select();
        onPress?.();
      }}
      style={[
        styles.chip,
        { borderColor: selected ? color : palette.border, backgroundColor: selected ? color : palette.surface },
        disabled && { opacity: 0.4 },
      ]}
    >
      <View style={styles.row}>
        {selected && <Feather name="check" size={16} color="#FFFFFF" />}
        <Text style={[styles.label, { color: selected ? '#FFFFFF' : palette.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderRadius: radius.chip,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontFamily: fonts.bold, fontSize: 15 },
});
