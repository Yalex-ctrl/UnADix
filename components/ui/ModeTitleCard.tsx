import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { Button } from './Button';
import { FloatingShapes } from './FloatingShapes';
import { Lulu, LuluMood } from './Lulu';
import { ScreenBody } from './Screen';
import { T } from './Typography';
import { OUTLINE, palette, space } from '@/theme/tokens';

type ModeTitleCardProps = {
  color: string; // couleur du mode (fond)
  ink?: string; // texte lisible sur cette couleur
  icon: React.ComponentProps<typeof Feather>['name'];
  kicker: string;
  title: string;
  rule: string; // règle en une phrase
  mood?: LuluMood;
  cta: string;
  onStart: () => void;
};

// Écran-titre façon générique télé : fond de la couleur du mode, nom du mode
// en très grand qui arrive avec un rebond, règle en une phrase, Lulu qui commente.
export function ModeTitleCard({ color, ink = palette.ink, icon, kicker, title, rule, mood = 'hype', cta, onStart }: ModeTitleCardProps) {
  const reduced = useReducedMotion();
  return (
    <View style={[styles.root, { backgroundColor: color }]}>
      <FloatingShapes />
      <ScreenBody
        center
        gap={space.lg}
        bottom={<Button label={cta} size="xl" variant="brand" onPress={onStart} />}
      >
        <View style={{ alignItems: 'center', gap: space.md }}>
          <Animated.View entering={reduced ? FadeIn : ZoomIn.springify().damping(10)} style={styles.badge}>
            <Feather name={icon} size={36} color={palette.ink} />
          </Animated.View>
          <T variant="caption" color={ink} style={{ letterSpacing: 2 }}>
            {kicker.toUpperCase()}
          </T>
          <Animated.View entering={reduced ? FadeIn : ZoomIn.springify().damping(8).delay(120)}>
            <T variant="hero" center color={ink} style={{ fontSize: 48, lineHeight: 52 }}>
              {title}
            </T>
          </Animated.View>
          <T variant="body" center color={ink} style={{ fontFamily: 'Nunito_800ExtraBold' }}>
            {rule}
          </T>
          <Lulu mood={mood} size={72} />
        </View>
      </ScreenBody>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  badge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: palette.surface,
    borderWidth: OUTLINE + 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
