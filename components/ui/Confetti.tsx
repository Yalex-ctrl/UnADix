import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LEVEL_COLORS, palette } from '@/theme/tokens';

type PieceProps = { x: number; delay: number; color: string; size: number; drift: number; fall: number; spin: number };

function Piece({ x, delay, color, size, drift, fall, spin }: PieceProps) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) })));
  }, [delay, t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.85 ? 1 : (1 - t.value) / 0.15,
    transform: [
      { translateX: drift * t.value },
      { translateY: fall * t.value - 40 * (1 - t.value) },
      { rotate: `${spin * t.value}deg` },
    ],
  }));
  return <Animated.View style={[{ position: 'absolute', left: x, top: 0, width: size, height: size * 0.6, backgroundColor: color, borderRadius: 2 }, style]} />;
}

// Confettis maison (Reanimated) : aucun fichier externe, fonctionne hors ligne.
// Avec « Réduire les animations », rien ne bouge.
export function Confetti({ count = 36, gold = false }: { count?: number; gold?: boolean }) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  // Tirage unique au montage (lazy init), pas à chaque rendu.
  const [pieces] = useState(() => {
    const colors = gold ? [palette.gold, palette.goldDeep, '#FFFFFF', palette.brand] : [...LEVEL_COLORS, palette.brand];
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      x: Math.random() * width,
      delay: Math.random() * 300,
      color: colors[i % colors.length],
      size: 8 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 160,
      fall: height * (0.45 + Math.random() * 0.4),
      spin: (Math.random() - 0.5) * 720,
    }));
  });

  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map(({ key, ...p }) => (
        <Piece key={key} {...p} />
      ))}
    </View>
  );
}
