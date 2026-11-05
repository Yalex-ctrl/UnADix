import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { T } from '@/components/ui/Typography';
import { clearHistory, FinishedGame, loadHistory } from '@/lib/storage';
import { palette } from '@/theme/tokens';

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
      const s =
        map.get(key) ??
        { name: p.name, games: 0, wins: 0, points: 0, played: 0, correct: 0, bestStreak: 0, maxLevel: 0, levelSum: 0, levelCount: 0, steals: 0, jokers: 0, trophies: 0 };
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: '30%', flex: 1, gap: 2 }}>
      <T variant="caption" color={palette.textMuted}>
        {label}
      </T>
      <T variant="heading" numeric>
        {value}
      </T>
    </View>
  );
}

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
    <Screen
      header={<Header title="Statistiques" onBack={() => router.back()} />}
      gap={12}
      bottom={history.length > 0 ? <Button label="Effacer l’historique" variant="danger" onPress={handleClear} /> : undefined}
    >
      {history.length === 0 ? (
        <T variant="body" color={palette.textMuted} center style={{ marginVertical: 48 }}>
          Aucune partie terminée pour le moment.
        </T>
      ) : (
        <>
          <SectionTitle>Joueurs</SectionTitle>
          {stats.map((s) => (
            <Card key={s.name} style={{ gap: 12 }}>
              <T variant="heading">{s.name}</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <Stat label="Parties" value={String(s.games)} />
                <Stat label="Victoires" value={`${s.wins} · ${pct(s.wins, s.games)}`} />
                <Stat label="Points" value={String(s.points)} />
                <Stat label="Réussite" value={pct(s.correct, s.played)} />
                <Stat label="Niveau moyen" value={s.levelCount > 0 ? (s.levelSum / s.levelCount).toFixed(1) : '–'} />
                <Stat label="Meilleur niveau" value={s.maxLevel ? String(s.maxLevel) : '–'} />
                <Stat label="Meilleure série" value={String(s.bestStreak)} />
                <Stat label="Vols réussis" value={String(s.steals)} />
                <Stat label="Jokers utilisés" value={String(s.jokers)} />
              </View>
              <T variant="caption" color={palette.textMuted}>
                {s.trophies} trophée{s.trophies > 1 ? 's' : ''}
              </T>
            </Card>
          ))}

          <SectionTitle>Historique</SectionTitle>
          {history.map((g) => (
            <Card key={g.id} style={{ gap: 4 }}>
              <T variant="body" style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
                {g.winnerName} l’emporte · {g.rounds} manches
              </T>
              <T variant="caption" color={palette.textMuted}>
                {new Date(g.date).toLocaleDateString('fr-FR')}
              </T>
              <T variant="caption" color={palette.textMuted} numeric>
                {[...g.players]
                  .sort((a, b) => b.score - a.score)
                  .map((p) => `${p.name} ${p.score}`)
                  .join(' · ')}
              </T>
              {g.themes?.length > 0 && (
                <T variant="caption" color={palette.textFaint}>
                  Thèmes : {g.themes.join(', ')}
                </T>
              )}
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
