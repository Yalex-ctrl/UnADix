import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { T } from '@/components/ui/Typography';
import { useGame } from '@/context/GameContext';
import { loadHistory } from '@/lib/storage';
import { fonts, palette, PLAYER_COLORS, radius } from '@/theme/tokens';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const PRESETS = [5, 10];

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

  const trimmed = names.map((n) => n.trim());
  const filled = trimmed.filter((n) => n.length > 0);
  const lower = filled.map((n) => n.toLowerCase());
  const duplicates = lower.length !== new Set(lower).size;
  const canStart = filled.length >= MIN_PLAYERS && !duplicates;
  const hint = filled.length < MIN_PLAYERS
    ? `Il faut au moins ${MIN_PLAYERS} prénoms.`
    : duplicates
    ? 'Deux joueurs ont le même prénom.'
    : null;

  const addKnown = (name: string) =>
    setNames((prev) => {
      if (prev.some((n) => n.trim().toLowerCase() === name.toLowerCase())) return prev;
      const emptyIdx = prev.findIndex((n) => n.trim() === '');
      if (emptyIdx >= 0) return prev.map((n, i) => (i === emptyIdx ? name : n));
      return prev.length < MAX_PLAYERS ? [...prev, name] : prev;
    });

  const start = () => {
    startGame(filled.map((name) => ({ name })), totalRounds, 'solo', { thiefMode, tvHost });
    router.push('/game');
  };

  return (
    <Screen
      header={<Header title="Nouvelle partie" onBack={() => router.back()} />}
      gap={12}
      bottom={
        <>
          {hint && (
            <T variant="caption" color={palette.textMuted} center>
              {hint}
            </T>
          )}
          <Button label="Continuer" size="l" disabled={!canStart} onPress={start} />
        </>
      }
    >
      <SectionTitle>{`Joueurs (${names.length}/${MAX_PLAYERS})`}</SectionTitle>

      {knownNames.length > 0 && (
        <View style={styles.wrap}>
          {knownNames.map((n) => (
            <Chip key={n} label={n} onPress={() => addKnown(n)} />
          ))}
        </View>
      )}

      {names.map((name, index) => (
        <View key={index} style={styles.playerRow}>
          <View style={[styles.dot, { backgroundColor: PLAYER_COLORS[index % PLAYER_COLORS.length] }]} />
          <TextInput
            style={styles.input}
            placeholder={`Joueur ${index + 1}`}
            placeholderTextColor={palette.textFaint}
            value={name}
            onChangeText={(v) => setNames((prev) => prev.map((n, i) => (i === index ? v : n)))}
            maxLength={20}
            accessibilityLabel={`Prénom du joueur ${index + 1}`}
          />
          {names.length > MIN_PLAYERS && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Retirer le joueur ${index + 1}`}
              onPress={() => setNames((prev) => prev.filter((_, i) => i !== index))}
              style={styles.remove}
              hitSlop={6}
            >
              <Feather name="x" size={18} color={palette.textFaint} />
            </Pressable>
          )}
        </View>
      ))}

      {names.length < MAX_PLAYERS && (
        <Pressable style={styles.add} onPress={() => setNames((prev) => [...prev, ''])} accessibilityRole="button">
          <Feather name="plus" size={18} color={palette.textMuted} />
          <T variant="body" color={palette.textMuted} style={{ fontFamily: fonts.semibold }}>
            Ajouter un joueur
          </T>
        </Pressable>
      )}

      <SectionTitle>Durée</SectionTitle>
      <Card style={{ gap: 12 }}>
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Une manche de moins"
            onPress={() => setTotalRounds((n) => Math.max(1, n - 1))}
            style={styles.stepButton}
          >
            <Feather name="minus" size={22} color={palette.text} />
          </Pressable>
          <View style={{ alignItems: 'center', minWidth: 90 }}>
            <T variant="display" numeric>
              {totalRounds}
            </T>
            <T variant="caption" color={palette.textMuted}>
              manche{totalRounds > 1 ? 's' : ''}
            </T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Une manche de plus"
            onPress={() => setTotalRounds((n) => Math.min(10, n + 1))}
            style={styles.stepButton}
          >
            <Feather name="plus" size={22} color={palette.text} />
          </Pressable>
        </View>
        <View style={[styles.wrap, { justifyContent: 'center' }]}>
          {PRESETS.map((n) => (
            <Chip key={n} label={n === 5 ? 'Rapide · 5' : 'Classique · 10'} selected={totalRounds === n} onPress={() => setTotalRounds(n)} />
          ))}
        </View>
      </Card>

      <SectionTitle>Options</SectionTitle>
      <SwitchRow
        title="Mode Voleur"
        description="Après une mauvaise réponse, les autres peuvent tenter de voler les points (−2 s’ils se trompent)."
        value={thiefMode}
        onValueChange={setThiefMode}
      />
      <SwitchRow
        title="Présentateur TV"
        description="Un commentaire dynamique à la fin de chaque manche."
        value={tvHost}
        onValueChange={setTvHost}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  input: {
    flex: 1,
    minHeight: 52,
    backgroundColor: palette.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: palette.text,
  },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  add: {
    minHeight: 52,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
