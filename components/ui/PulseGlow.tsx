import { useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type PulseGlowProps = {
  children: React.ReactNode;
  color: string;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Looping glow used for sustained-tension indicators (e.g. "à qui le tour",
// "voleur du tour"). Uses a bordered/opacity glow rather than shadow/elevation,
// which render inconsistently on Android.
export function PulseGlow({ children, color, active = true, style }: PulseGlowProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      progress.value = withTiming(0, { duration: 300 });
    }
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: color,
    borderWidth: 2,
    shadowColor: color,
    opacity: 0.6 + progress.value * 0.4,
    transform: [{ scale: 1 + progress.value * 0.02 }],
  }));

  return (
    <Animated.View style={[styles.base, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
  },
});
