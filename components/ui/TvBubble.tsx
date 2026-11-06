import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { T } from './Typography';
import { palette, radius, space, fonts } from '@/theme/tokens';

// Bulle du présentateur TV : apparaît, puis disparaît seule sans bloquer le jeu.
export function TvBubble({ text, duration = 6000 }: { text: string | null; duration?: number }) {
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => setDismissed(text), duration);
    return () => clearTimeout(t);
  }, [text, duration]);

  if (!text || dismissed === text) return null;
  return (
    <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOutUp.duration(200)} style={styles.wrap} pointerEvents="box-none">
      <Pressable onPress={() => setDismissed(text)} accessibilityLabel="Fermer le commentaire" style={styles.bubble}>
        <View style={styles.icon}>
          <Feather name="mic" size={16} color={palette.onPrimary} />
        </View>
        <T variant="body" style={styles.text}>
          {text}
        </T>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: palette.primarySoft,
    borderRadius: radius.card,
    padding: space.md,
  },
  icon: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, fontFamily: fonts.semibold },
});
