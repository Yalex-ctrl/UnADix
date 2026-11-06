import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { CATEGORIES } from '@/data/categories';
import { haptic } from '@/lib/haptics';
import { playSound } from '@/lib/sounds';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { categoryStyle } from '@/theme/categories';
import { PopCard } from './Card';
import { T } from './Typography';
import { OUTLINE, palette, space } from '@/theme/tokens';

type RouletteProps = {
  categoryId: string; // thème tiré (déjà décidé par le moteur)
  description: string;
  round: number;
  total: number;
  onSettled?: () => void;
};

// « La Roulette » : les cartes de thèmes défilent en ralentissant, puis
// s'arrêtent sur le thème tiré, qui s'agrandit. Tic-tic à chaque carte,
// vibration à l'arrêt. Avec « Réduire les animations » : le thème apparaît direct.
export function Roulette({ categoryId, description, round, total, onSettled }: RouletteProps) {
  const reduced = useReducedMotion();
  const target = CATEGORIES.find((c) => c.id === categoryId);
  const [sequence] = useState(() => {
    const others = CATEGORIES.filter((c) => c.id !== categoryId);
    const picks: string[] = [];
    for (let i = 0; i < 14; i++) picks.push(others[Math.floor(Math.random() * others.length)].id);
    return [...picks, categoryId];
  });
  const [stepState, setStep] = useState(0);
  // « Réduire les animations » : le thème apparaît directement.
  const step = reduced ? sequence.length - 1 : stepState;
  const done = step >= sequence.length - 1;
  const settledRef = useRef(false);

  useEffect(() => {
    if (reduced || step >= sequence.length - 1) return;
    // Ralentit : 70 ms au début, jusqu'à ~400 ms pour les dernières cartes.
    const delay = 70 + Math.pow(step / (sequence.length - 1), 3) * 380;
    const t = setTimeout(() => {
      playSound('tick');
      haptic.select();
      setStep((s) => s + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [step, sequence, reduced]);

  useEffect(() => {
    if (done && !settledRef.current) {
      settledRef.current = true;
      haptic.heavy();
      playSound('reveal');
      onSettled?.();
    }
  }, [done, onSettled]);

  const shownId = sequence[Math.min(step, sequence.length - 1)];
  const shown = CATEGORIES.find((c) => c.id === shownId) ?? target;
  const style = categoryStyle(shownId);

  return (
    <View style={{ gap: space.lg, alignItems: 'center' }}>
      <T variant="caption" color={palette.inkSoft} style={{ letterSpacing: 1.5 }}>
        {done ? `MANCHE ${round} SUR ${total}` : 'TIRAGE DU THÈME…'}
      </T>
      <Animated.View key={done ? 'done' : 'spin'} entering={done && !reduced ? ZoomIn.springify().damping(9) : FadeIn.duration(60)} style={{ width: '100%' }}>
        <PopCard color={style.color} style={styles.card}>
          <View style={styles.icon}>
            <Feather name={style.icon} size={done ? 44 : 32} color={palette.ink} />
          </View>
          <T variant={done ? 'display' : 'title'} center numberOfLines={3} color={palette.ink} adjustsFontSizeToFit>
            {shown?.name}
          </T>
          {done && (
            <T variant="body" center color={palette.ink} style={{ fontFamily: 'Nunito_700Bold' }}>
              {description}
            </T>
          )}
        </PopCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: space.md, paddingVertical: space.xl, minHeight: 220, justifyContent: 'center' },
  icon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: palette.surface,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
