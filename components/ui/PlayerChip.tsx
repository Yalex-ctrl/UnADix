import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type PlayerChipProps = {
  name: string;
  score?: number;
  selected?: boolean;
  disabled?: boolean;
  accentColor?: string;
  onPress?: () => void;
};

export function PlayerChip({ name, score, selected = false, disabled = false, accentColor = colors.primary, onPress }: PlayerChipProps) {
  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && { borderColor: accentColor, backgroundColor: colors.surfaceAlt },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      {score !== undefined && <Text style={styles.score}>{score} pts</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  score: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.75,
  },
});
