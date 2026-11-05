import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

export default function MultiplayerHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Multi-téléphones</Text>
        <Text style={styles.subtitle}>Un salon, un code à 5 caractères, une partie à plusieurs écrans.</Text>
      </View>

      <View style={styles.actions}>
        <Button label="Créer un salon" onPress={() => router.push('/multiplayer/create')} />
        <Button label="Rejoindre avec un code" variant="secondary" onPress={() => router.push('/multiplayer/join')} />
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
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  actions: {
    gap: 16,
  },
});
