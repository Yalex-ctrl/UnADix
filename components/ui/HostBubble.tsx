import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { Lulu, LuluMood } from './Lulu';
import { T } from './Typography';
import { OUTLINE, palette, POP_OFFSET, radius, space } from '@/theme/tokens';

// Humeur de Lulu déduite du type de commentaire (id de situation).
export function moodForCommentary(id: string | null | undefined): LuluMood {
  switch (id) {
    case 'leader-change':
    case 'streak':
    case 'steal':
      return 'hype';
    case 'close':
    case 'tie':
      return 'shocked';
    case 'lead':
    case 'nobody':
      return 'smug';
    default:
      return 'neutral';
  }
}

type Props = { text: string | null; mood?: LuluMood; duration?: number };

// Bulle du présentateur : glisse depuis le haut, reste 3 secondes, repart.
// Jamais bloquante ; touchable pour la fermer.
export function HostBubble({ text, mood = 'neutral', duration = 3000 }: Props) {
  const reduced = useReducedMotion();
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => setDismissed(text), duration);
    return () => clearTimeout(t);
  }, [text, duration]);

  if (!text || dismissed === text) return null;
  return (
    <Animated.View
      entering={reduced ? FadeIn : SlideInUp.springify().damping(15)}
      exiting={reduced ? FadeOut : SlideOutUp}
      style={styles.wrap}
    >
      <Pressable onPress={() => setDismissed(text)} accessibilityLabel="Fermer le commentaire" style={styles.row}>
        <Lulu mood={mood} size={44} />
        <View style={styles.bubbleWrap}>
          <View style={styles.shadow} />
          <View style={styles.bubble}>
            <T variant="body" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
              {text}
            </T>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  bubbleWrap: { flex: 1, paddingRight: POP_OFFSET, paddingBottom: POP_OFFSET },
  shadow: {
    position: 'absolute',
    top: POP_OFFSET,
    left: POP_OFFSET,
    right: 0,
    bottom: 0,
    borderRadius: radius.card,
    backgroundColor: palette.ink,
  },
  bubble: {
    backgroundColor: palette.surface,
    borderRadius: radius.card,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    padding: space.md,
  },
});
