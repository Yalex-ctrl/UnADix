import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { palette } from '@/theme/tokens';

type ShapeKind = 'star' | 'circle' | 'bolt';

function Shape({ kind, color, size }: { kind: ShapeKind; color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {kind === 'circle' && <Circle cx={20} cy={20} r={15} fill={color} stroke={palette.ink} strokeWidth={3} />}
      {kind === 'star' && (
        <Polygon
          points="20,3 25,14 37,15 28,23 31,35 20,29 9,35 12,23 3,15 15,14"
          fill={color}
          stroke={palette.ink}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      )}
      {kind === 'bolt' && <Path d="M23 3 L8 23 H19 L16 37 L32 15 H21 Z" fill={color} stroke={palette.ink} strokeWidth={3} strokeLinejoin="round" />}
    </Svg>
  );
}

function Floating({ kind, color, size, x, y, delay }: { kind: ShapeKind; color: string; size: number; x: number; y: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withRepeat(withSequence(withTiming(1, { duration: 3200 + delay, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 3200 + delay, easing: Easing.inOut(Easing.sin) })), -1));
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -14 * t.value }, { rotate: `${(t.value - 0.5) * 24}deg` }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y }, style]}>
      <Shape kind={kind} color={color} size={size} />
    </Animated.View>
  );
}

// Décor : formes qui flottent lentement. Réservé aux écrans « temps fort » et
// à l'accueil, jamais derrière le texte de la question.
export function FloatingShapes() {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const items: { kind: ShapeKind; color: string; size: number; x: number; y: number; delay: number }[] = [
    { kind: 'star', color: palette.gold, size: 34, x: width * 0.08, y: height * 0.1, delay: 0 },
    { kind: 'circle', color: palette.steal, size: 26, x: width * 0.82, y: height * 0.08, delay: 300 },
    { kind: 'bolt', color: palette.bad, size: 30, x: width * 0.86, y: height * 0.32, delay: 600 },
    { kind: 'circle', color: palette.good, size: 22, x: width * 0.04, y: height * 0.36, delay: 900 },
    { kind: 'star', color: palette.brand, size: 24, x: width * 0.78, y: height * 0.62, delay: 450 },
  ];
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((it, i) => (
        <Floating key={i} {...it} />
      ))}
    </View>
  );
}
