import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';

export default function HomeScreen() {
  const router = useRouter();
  const { state, hydrated } = useGame();
  const canResume = hydrated && state.phase !== 'idle';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>1 à 10</Text>
        <Text style={styles.subtitle}>Le quiz où tu choisis ta difficulté</Text>
      </View>

      <View style={styles.actions}>
        {canResume && <Button label="▶️ Reprendre la partie" variant="auction" onPress={() => router.push('/game')} />}
        <Text style={styles.sectionLabel}>Comment jouez-vous ?</Text>
        <Button
          label="📱 Un seul téléphone"
          onPress={() => router.push({ pathname: '/setup/players', params: { mode: 'solo' } })}
        />
        <Button label="📡 Multi-téléphones" variant="voleur" onPress={() => router.push('/multiplayer')} />

        <Button label="📊 Statistiques" variant="secondary" onPress={() => router.push('/stats' as never)} />
        <Button label="Comment jouer ?" variant="ghost" onPress={() => router.push('/how-to-play')} style={styles.howToPlay} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  hero: {
    marginTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    gap: 14,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 2,
  },
  howToPlay: {
    marginTop: 8,
  },
});
