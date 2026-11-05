import { View, StyleSheet } from 'react-native';
import { T } from './Typography';
import { palette } from '@/theme/tokens';

export function SectionTitle({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={styles.wrap}>
      <T variant="caption" color={palette.textMuted} style={styles.title}>
        {children.toUpperCase()}
      </T>
      {hint && (
        <T variant="caption" color={palette.textFaint}>
          {hint}
        </T>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2, marginTop: 8, marginBottom: 4 },
  title: { letterSpacing: 0.8 },
});
