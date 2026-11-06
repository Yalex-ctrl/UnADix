import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn, BounceInUp } from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';
import { playSound } from '@/lib/sounds';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { TROPHIES } from '@/lib/trophies';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Confetti } from './Confetti';
import { TrophyBadge } from './TrophyBadge';
import { T } from './Typography';
import { OUTLINE, palette, POP_OFFSET, radius, space } from '@/theme/tokens';
import { Player, TrophyEvent } from '@/types';

type TrophyQueueProps = {
  events: TrophyEvent[];
  players: Player[];
  onDone: () => void;
};

// Trophées débloqués, un par un, en plein écran : le badge tombe et rebondit,
// on tape pour continuer.
export function TrophyQueue({ events, players, onDone }: TrophyQueueProps) {
  const reduced = useReducedMotion();
  // Trophée inconnu ou joueur retiré : ignoré sans bloquer la file.
  const queue = events.filter((e) => TROPHIES[e.trophyId] && players.some((p) => p.id === e.playerId));
  const [index, setIndex] = useState(0);
  const current = queue[index];
  const trophy = current ? TROPHIES[current.trophyId] : undefined;
  const player = current ? players.find((p) => p.id === current.playerId) : undefined;
  const last = index + 1 >= queue.length;
  const next = () => (last ? onDone() : setIndex(index + 1));

  useEffect(() => {
    if (!current) {
      onDone();
      return;
    }
    haptic.success();
    playSound('trophy');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!current || !trophy || !player) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={next}>
      <Pressable style={styles.backdrop} onPress={next} accessibilityLabel="Continuer">
        <Confetti gold />
        <Animated.View entering={reduced ? FadeIn : ZoomIn.springify().damping(12)} style={styles.cardWrap}>
          <View style={styles.shadow} />
          <View style={styles.card}>
            <T variant="caption" color={palette.goldDeep} style={styles.kicker}>
              NOUVEAU TROPHÉE
            </T>
            <Animated.View entering={reduced ? FadeIn : BounceInUp.delay(150).duration(700)}>
              <TrophyBadge id={current.trophyId} emoji={trophy.emoji} size={112} />
            </Animated.View>
            <T variant="title" center>
              {trophy.name}
            </T>
            <View style={styles.who}>
              <Avatar name={player.name} color={player.color} profileId={player.profileId} size={36} />
              <T variant="body" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
                {player.name}
              </T>
            </View>
            <T variant="body" color={palette.inkSoft} center>
              {trophy.description}
            </T>
            <Button label={last ? 'Super !' : 'Suivant'} variant="gold" size="l" onPress={next} style={{ alignSelf: 'stretch', marginTop: space.sm }} />
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(27,21,48,0.55)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  cardWrap: { width: '100%', maxWidth: 380, paddingRight: POP_OFFSET, paddingBottom: POP_OFFSET },
  shadow: { position: 'absolute', top: POP_OFFSET, left: POP_OFFSET, right: 0, bottom: 0, borderRadius: radius.card, backgroundColor: palette.ink },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.card,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    padding: space.xl,
    alignItems: 'center',
    gap: space.sm,
  },
  kicker: { letterSpacing: 1.4 },
  who: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
