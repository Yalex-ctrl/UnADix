import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { clearHistory, FinishedGame, loadHistory } from '@/lib/storage';

type PlayerStats = {
  name: string;
  games: number;
  wins: number;
  points: number;
  played: number;
  correct: number;
  bestStreak: number;
  maxLevel: number;
  levelSum: number;
  levelCount: number;
  steals: number;
  jokers: number;
  trophies: number;
};

function computeStats(history: FinishedGame[]): PlayerStats[] {
  const map = new Map<string, PlayerStats>();
  for (const game of history) {
    for (const p of game.players) {
      const key = p.name.trim().toLowerCase();
      const s = map.get(key) ?? { name: p.name, games: 0, wins: 0, points: 0, played: 0, correct: 0, bestStreak: 0, maxLevel: 0, levelSum: 0, levelCount: 0, steals: 0, jokers: 0, trophies: 0 };
      s.games += 1;
      s.wins += p.name === game.winnerName ? 1 : 0;
      s.points += p.score;
      s.played += p.played;
      s.correct += p.correct;
      s.bestStreak = Math.max(s.bestStreak, p.bestStreak ?? 0);
      s.maxLevel = Math.max(s.maxLevel, p.maxLevelWon ?? 0);
      s.levelSum += p.levelSum ?? 0;
      s.levelCount += p.levelCount ?? 0;
      s.steals += p.stealWins ?? 0;
      s.jokers += p.jokerUsed ? 1 : 0;
      s.trophies += p.trophies?.length ?? 0;
      map.set(key, s);
    }
  }
  return [...map.values()].sort((a, b) => b.wins - a.wins || b.points - a.points);
}

const pct = (a: number, b: number) => (b === 0 ? '–' : `${Math.round((a / b) * 100)} %`);

export default function StatsScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<FinishedGame[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setHistory);
    }, [])
  );

  const stats = computeStats(history);

  const handleClear = () =>
    Alert.alert("Effacer l'historique ?", 'Toutes les statistiques seront supprimées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Effacer',
        style: 'destructive',
        onPress: () => {
          clearHistory();
          setHistory([]);
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Statistiques</Text>

        {history.length === 0 ? (
          <Text style={styles.empty}>Aucune partie terminée pour le moment.</Text>
        ) : (
          <>
            <Text style={styles.section}>Joueurs</Text>
            {stats.map((s) => (
              <View key={s.name} style={styles.card}>
                <Text style={styles.cardTitle}>{s.name}</Text>
                <Text style={styles.cardLine}>
                  {s.games} partie{s.games > 1 ? 's' : ''} · {s.wins} victoire{s.wins > 1 ? 's' : ''} ({pct(s.wins, s.games)})
                </Text>
                <Text style={styles.cardLine}>
                  {s.points} points · {pct(s.correct, s.played)} de bonnes réponses
                </Text>
                <Text style={styles.cardLine}>
                  Niveau moyen choisi : {s.levelCount > 0 ? (s.levelSum / s.levelCount).toFixed(1) : '–'} · plus haut
                  niveau réussi : {s.maxLevel || '–'}
                </Text>
                <Text style={styles.cardLine}>
                  Meilleure série : {s.bestStreak} · vols réussis : {s.steals} · jokers utilisés : {s.jokers} · trophées :{' '}
                  {s.trophies}
                </Text>
              </View>
            ))}

            <Text style={styles.section}>Historique</Text>
            {history.map((g) => (
              <View key={g.id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  🏆 {g.winnerName} · {g.rounds} manches
                </Text>
                <Text style={styles.cardLine}>{new Date(g.date).toLocaleDateString('fr-FR')}</Text>
                {g.themes?.length > 0 && <Text style={styles.cardLine}>Thèmes : {g.themes.join(', ')}</Text>}
                <Text style={styles.cardLine}>
                  {[...g.players]
                    .sort((a, b) => b.score - a.score)
                    .map((p) => `${p.name} ${p.score}`)
                    .join(' · ')}
                </Text>
              </View>
            ))}
            <Button label="Effacer l'historique" variant="danger" onPress={handleClear} style={styles.clear} />
          </>
        )}

        <Button label="Retour" variant="secondary" onPress={() => router.back()} style={styles.clear} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 10 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  empty: { color: colors.textMuted, fontSize: 15, marginVertical: 24, textAlign: 'center' },
  section: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 10 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.accent, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardLine: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  clear: { marginTop: 12 },
});
