import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/useReducedMotion';

type FlipCardProps = {
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
};

// « Le Retournement » : la carte pivote sur son axe vertical (rotation Y). Avec
// « Réduire les animations », simple fondu entre les deux faces.
export function FlipCard({ flipped, front, back }: FlipCardProps) {
  const reduced = useReducedMotion();
  const t = useSharedValue(flipped ? 1 : 0);
  // Le conteneur prend la hauteur de la face visible (les deux faces se superposent).
  const [hFront, setHFront] = useState(0);
  const [hBack, setHBack] = useState(0);

  useEffect(() => {
    t.set(withTiming(flipped ? 1 : 0, { duration: reduced ? 150 : 550 }));
  }, [flipped, reduced, t]);

  const frontStyle = useAnimatedStyle(() => ({
    opacity: reduced ? 1 - t.value : t.value < 0.5 ? 1 : 0,
    transform: reduced ? [] : [{ perspective: 900 }, { rotateY: `${interpolate(t.value, [0, 1], [0, 180])}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: reduced ? t.value : t.value >= 0.5 ? 1 : 0,
    transform: reduced ? [] : [{ perspective: 900 }, { rotateY: `${interpolate(t.value, [0, 1], [180, 360])}deg` }],
  }));

  return (
    <View style={hFront && hBack ? { height: flipped ? hBack : hFront } : undefined}>
      <Animated.View onLayout={(e) => setHFront(e.nativeEvent.layout.height)} style={frontStyle} pointerEvents={flipped ? 'none' : 'auto'}>
        {front}
      </Animated.View>
      <Animated.View onLayout={(e) => setHBack(e.nativeEvent.layout.height)} style={[styles.overlay, backStyle]} pointerEvents={flipped ? 'auto' : 'none'}>
        {back}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
});
