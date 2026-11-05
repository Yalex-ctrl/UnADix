import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { T } from '@/components/ui/Typography';
import { useGame } from '@/context/GameContext';
import { palette, space } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { state, hydrated } = useGame();
  const finished = state.phase === 'final-results' || state.phase === 'challenge-final-results';
  const canResume = hydrated && state.phase !== 'idle' && !finished;
  const roundLabel =
    state.mode === 'challenge'
      ? `Défi ${state.challengeRound} / ${state.challengeTotal}`
      : `Manche ${state.round} / ${state.totalRounds}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={{ flex: 1, paddingHorizontal: space.xl, paddingVertical: space.xl, justifyContent: 'space-between' }}>
        <View style={{ marginTop: space.huge, alignItems: 'center', gap: space.sm }}>
          <T variant="display" style={{ fontSize: 56, lineHeight: 64 }} color={palette.primary}>
            1 à 10
          </T>
          <T variant="body" color={palette.textMuted} center>
            Le quiz où tu choisis ta difficulté
          </T>
        </View>

        <View style={{ gap: space.md }}>
          {canResume && (
            <Card tone="primary" borderColor={palette.primary} style={{ gap: space.sm }}>
              <T variant="caption" color={palette.primary} style={{ letterSpacing: 1 }}>
                PARTIE EN COURS
              </T>
              <T variant="heading">{roundLabel}</T>
              <T variant="body" color={palette.textMuted} numberOfLines={2}>
                {state.players.map((p) => p.name).join(', ')}
              </T>
              <Button label="Reprendre la partie" icon="play" onPress={() => router.push('/game')} />
            </Card>
          )}
          <Button
            label="Un seul téléphone"
            icon="smartphone"
            size="l"
            onPress={() => router.push({ pathname: '/setup/players', params: { mode: 'solo' } })}
          />
          <Button label="Multi-téléphones" icon="users" variant="secondary" size="l" onPress={() => router.push('/multiplayer')} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.lg, marginTop: space.xs }}>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/stats' as never)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}
            >
              <Feather name="bar-chart-2" size={16} color={palette.textMuted} />
              <T variant="caption" color={palette.textMuted}>
                Statistiques
              </T>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/how-to-play')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}
            >
              <Feather name="help-circle" size={16} color={palette.textMuted} />
              <T variant="caption" color={palette.textMuted}>
                Comment jouer ?
              </T>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
