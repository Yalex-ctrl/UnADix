import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useRoom } from '@/context/RoomContext';

export default function JoinRoomScreen() {
  const router = useRouter();
  const { joinRoom } = useRoom();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!name.trim()) {
      Alert.alert('Nom manquant', 'Entre ton nom pour rejoindre le salon.');
      return;
    }
    if (!code.trim()) {
      Alert.alert('Code manquant', 'Entre le code du salon.');
      return;
    }
    setLoading(true);
    try {
      await joinRoom(code, name);
      router.push('/multiplayer/lobby');
    } catch (error) {
      Alert.alert('Salon introuvable', error instanceof Error ? error.message : 'Vérifie le code et réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rejoindre un salon</Text>
        <Text style={styles.subtitle}>Entre le code partagé par l&apos;hôte.</Text>
        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="CODE"
          placeholderTextColor={colors.textMuted}
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          maxLength={5}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Ton nom"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          maxLength={20}
        />
      </View>
      <Button label={loading ? 'Connexion...' : 'Rejoindre'} onPress={handleJoin} disabled={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  content: {
    marginTop: 40,
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 6,
    fontSize: 22,
    fontWeight: '800',
  },
});
