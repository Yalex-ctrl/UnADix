import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { colors } from '@/constants/theme';

// Border-flash used for tension moments (a braquage declared, a high-stakes
// reveal). Call `flash(color)` from an event handler, render <overlay/> as the
// last child of the screen.
export function useScreenFlash() {
  const opacity = useSharedValue(0);
  const [color, setColor] = useState<string>(colors.braquage);

  const flash = useCallback(
    (flashColor: string = colors.braquage) => {
      setColor(flashColor);
      opacity.set(withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 550 })));
    },
    [opacity]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    borderColor: color,
  }));

  const overlay = <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay, animatedStyle]} />;

  return { flash, overlay };
}

const styles = StyleSheet.create({
  overlay: {
    borderWidth: 6,
    borderRadius: 0,
  },
});
