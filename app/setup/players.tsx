import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { loadHistory } from '@/lib/storage';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

export default function PlayersSetupScreen() {
  const router = useRouter();
  const { startGame } = useGame();
  const [names, setNames] = useState<string[]>(['', '']);
  const [totalRounds, setTotalRounds] = useState<number>(10);
  const [thiefMode, setThiefMode] = useState(true);
  const [tvHost, setTvHost] = useState(true);
  const [knownNames, setKnownNames] = useState<string[]>([]);

  useEffect(() => {
    loadHistory().then((history) => {
      const seen = new Set<string>();
      for (const g of history) for (const p of g.players) seen.add(p.name);
      setKnownNames([...seen]);
    });
  }, []);

  const addKnown = (name: string) => {
    setNames((prev) => {
      if (prev.some((n) => n.trim().toLowerCase() === name.toLowerCase())) return prev;
      const emptyIdx = prev.findIndex((n) => n.trim() === '');
      if (emptyIdx >= 0) return prev.map((n, i) => (i === emptyIdx ? name : n));
      return prev.length < MAX_PLAYERS ? [...prev, name] : prev;
    });
  };

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const addPlayer = () => {
    if (names.length >= MAX_PLAYERS) return;
    setNames((prev) => [...prev, '']);
  };

  const removePlayer = (index: number) => {
    if (names.length <= MIN_PLAYERS) return;
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    const trimmed = names.map((n) => n.trim()).filter((n) => n.length > 0);
    if (trimmed.length < MIN_PLAYERS) {
      Alert.alert('Pas assez de joueurs', `Il faut au moins ${MIN_PLAYERS} joueurs pour commencer.`);
      return;
    }
    startGame(
      trimmed.map((name) => ({ name })),
      totalRounds,
      'solo',
      { thiefMode, tvHost }
    );
    router.push('/game');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nouvelle partie</Text>
        <Text style={styles.sectionLabel}>Joueurs ({names.length}/{MAX_PLAYERS})</Text>
        {knownNames.length > 0 && (
          <View style={styles.knownRow}>
            {knownNames.map((n) => (
              <Pressable key={n} style={styles.knownChip} onPress={() => addKnown(n)}>
                <Text style={styles.knownChipText}>+ {n}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {names.map((name, index) => (
          <View key={index} style={styles.playerRow}>
            <TextInput
              style={styles.input}
              placeholder={`Joueur ${index + 1}`}
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={(v) => updateName(index, v)}
              maxLength={20}
            />
            {names.length > MIN_PLAYERS && (
              <Pressable onPress={() => removePlayer(index)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
            )}
          </View>
        ))}

        {names.length < MAX_PLAYERS && (
          <Pressable style={styles.addButton} onPress={addPlayer}>
            <Text style={styles.addButtonText}>+ Ajouter un joueur</Text>
          </Pressable>
        )}

        <Text style={styles.sectionLabel}>Format de la partie</Text>
        <View style={styles.formatRow}>
          <Pressable
            style={[styles.formatCard, totalRounds === 5 && styles.formatCardSelected]}
            onPress={() => setTotalRounds(5)}
          >
            <Text style={styles.formatTitle}>⚡ Partie rapide</Text>
            <Text style={styles.formatSubtitle}>5 manches</Text>
          </Pressable>
          <Pressable
            style={[styles.formatCard, totalRounds === 10 && styles.formatCardSelected]}
            onPress={() => setTotalRounds(10)}
          >
            <Text style={styles.formatTitle}>🏆 Partie longue</Text>
            <Text style={styles.formatSubtitle}>10 manches</Text>
          </Pressable>
        </View>

        <View style={styles.stepperRow}>
          <Text style={styles.stepperLabel}>Manches : {totalRounds}</Text>
          <Pressable style={styles.stepperButton} onPress={() => setTotalRounds((n) => Math.max(1, n - 1))}>
            <Text style={styles.stepperButtonText}>−</Text>
          </Pressable>
          <Pressable style={styles.stepperButton} onPress={() => setTotalRounds((n) => Math.min(10, n + 1))}>
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Options</Text>
        <Pressable style={styles.optionRow} onPress={() => setThiefMode((v) => !v)}>
          <Text style={styles.optionText}>🕵️ Mode Voleur (vol après une mauvaise réponse)</Text>
          <Text style={styles.optionState}>{thiefMode ? 'Activé' : 'Désactivé'}</Text>
        </Pressable>
        <Pressable style={styles.optionRow} onPress={() => setTvHost((v) => !v)}>
          <Text style={styles.optionText}>🎙️ Présentateur TV</Text>
          <Text style={styles.optionState}>{tvHost ? 'Activé' : 'Désactivé'}</Text>
        </Pressable>
      </ScrollView>

      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continuer</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  knownRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  knownChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  knownChipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  stepperLabel: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700' },
  stepperButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  stepperButtonText: { color: colors.text, fontSize: 22, fontWeight: '700' },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  optionText: { color: colors.text, fontSize: 14, flex: 1, paddingRight: 8 },
  optionState: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  formatRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formatCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  formatCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  formatTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  formatSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  continueButton: {
    marginVertical: 16,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
