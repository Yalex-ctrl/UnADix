import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useRoom } from '@/context/RoomContext';

export default function CreateRoomScreen() {
  const router = useRouter();
  const { createRoom } = useRoom();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Nom manquant', 'Entre ton nom pour créer le salon.');
      return;
    }
    setLoading(true);
    try {
      await createRoom(name);
      router.push('/multiplayer/lobby');
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le salon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créer un salon</Text>
        <Text style={styles.subtitle}>Tu seras l&apos;hôte de la partie.</Text>
        <TextInput
          style={styles.input}
          placeholder="Ton nom"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          maxLength={20}
          autoFocus
        />
      </View>
      <Button label={loading ? 'Création...' : 'Créer le salon'} onPress={handleCreate} disabled={loading} />
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
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 24,
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
});
