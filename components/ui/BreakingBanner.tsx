import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { playSound } from '@/lib/sounds';
import { T } from './Typography';
import { OUTLINE, palette } from '@/theme/tokens';

// Bandeau « BRAQUAGE ! » qui traverse l'écran en diagonale, façon breaking news.
export function BreakingBanner({ text, trigger }: { text: string; trigger: number }) {
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const x = useSharedValue(-width * 1.2);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    const show = setTimeout(() => setVisible(true), 0);
    playSound('steal');
    x.set(-width * 1.2);
    x.set(
      withSequence(
        withTiming(0, { duration: reduced ? 1 : 350, easing: Easing.out(Easing.back(1.4)) }),
        withDelay(700, withTiming(width * 1.2, { duration: reduced ? 1 : 300 }))
      )
    );
    const t = setTimeout(() => setVisible(false), 1500);
    return () => {
      clearTimeout(show);
      clearTimeout(t);
    };
  }, [trigger, width, reduced, x]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { rotate: '-8deg' }] }));
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View style={[styles.banner, style]}>
        <T variant="display" color={palette.white} center numberOfLines={1} adjustsFontSizeToFit>
          {text}
        </T>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center' },
  banner: {
    backgroundColor: palette.bad,
    borderTopWidth: OUTLINE + 1,
    borderBottomWidth: OUTLINE + 1,
    borderColor: palette.line,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
});
