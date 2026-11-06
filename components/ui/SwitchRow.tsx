import { StyleSheet, Switch, View } from 'react-native';
import { T } from './Typography';
import { palette, radius, space, fonts } from '@/theme/tokens';

type SwitchRowProps = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function SwitchRow({ title, description, value, onValueChange }: SwitchRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <T variant="body" style={styles.title}>
          {title}
        </T>
        {description && (
          <T variant="caption" color={palette.textMuted}>
            {description}
          </T>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.border, true: palette.primary }}
        thumbColor={palette.white}
        ios_backgroundColor={palette.border}
        accessibilityLabel={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: palette.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: palette.border,
    padding: space.md,
  },
  texts: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bold },
});
