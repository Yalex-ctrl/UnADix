import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';
import { TROPHIES } from '@/lib/trophies';
import { Button } from './Button';
import { T } from './Typography';
import { palette, radius, space } from '@/theme/tokens';
import { Player, TrophyEvent } from '@/types';

type TrophyQueueProps = {
  events: TrophyEvent[];
  players: Player[];
  onDone: () => void;
};

// Affiche les trophées débloqués un par un, dans une modale animée.
export function TrophyQueue({ events, players, onDone }: TrophyQueueProps) {
  const [index, setIndex] = useState(0);
  const current = events[index];

  useEffect(() => {
    if (current) haptic.success();
  }, [current]);

  if (!current) return null;
  const trophy = TROPHIES[current.trophyId];
  const player = players.find((p) => p.id === current.playerId);
  if (!trophy || !player) {
    // Trophée inconnu ou joueur retiré : on passe au suivant sans bloquer.
    return <Skip onSkip={() => (index + 1 < events.length ? setIndex(index + 1) : onDone())} />;
  }
  const last = index + 1 >= events.length;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => (last ? onDone() : setIndex(index + 1))}>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.card}>
          <T variant="caption" color={palette.gold} style={styles.kicker}>
            NOUVEAU TROPHÉE
          </T>
          <Animated.Text entering={FadeIn.delay(150)} style={styles.emoji}>
            {trophy.emoji}
          </Animated.Text>
          <T variant="title" center>
            {trophy.name}
          </T>
          <T variant="body" color={palette.textMuted} center>
            {player.name} — {trophy.description}
          </T>
          <Button
            label={last ? 'Super !' : 'Suivant'}
            size="l"
            onPress={() => (last ? onDone() : setIndex(index + 1))}
            style={styles.button}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

function Skip({ onSkip }: { onSkip: () => void }) {
  useEffect(() => {
    onSkip();
  }, [onSkip]);
  return null;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(26,26,31,0.4)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: palette.surface,
    borderRadius: radius.card,
    padding: space.xl,
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 2,
    borderColor: palette.gold,
  },
  kicker: { letterSpacing: 1.2 },
  emoji: { fontSize: 64, lineHeight: 80 },
  button: { alignSelf: 'stretch', marginTop: space.md },
});
