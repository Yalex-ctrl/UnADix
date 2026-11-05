import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { gameStyles } from './gameStyles';

type LeaderboardProps = {
  players: {
    id: string;
    name: string;
    score: number;
    color?: string;
    played?: number;
    correct?: number;
    jokerUsed?: boolean;
  }[];
};

const MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard({ players }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <View style={gameStyles.leaderboard}>
      {sorted.map((p, idx) => {
        const rank = idx > 0 && sorted[idx - 1].score === p.score ? null : idx;
        const detailed = p.played !== undefined && p.correct !== undefined;
        const rate = detailed && p.played! > 0 ? Math.round((p.correct! / p.played!) * 100) : null;
        return (
          <View key={p.id} style={gameStyles.leaderboardRow}>
            <Text style={gameStyles.leaderboardRank}>{rank !== null && rank < 3 ? MEDALS[rank] : `${idx + 1}.`}</Text>
            {p.color && <View style={[styles.dot, { backgroundColor: p.color }]} />}
            <View style={styles.nameCol}>
              <Text style={gameStyles.leaderboardName}>{p.name}</Text>
              {detailed && (
                <Text style={styles.detail}>
                  {p.correct}/{p.played} bonnes · {rate === null ? '–' : `${rate} %`} · joker {p.jokerUsed ? '❌' : '✅'}
                </Text>
              )}
            </View>
            <Text style={gameStyles.leaderboardScore}>{p.score} pts</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  nameCol: { flex: 1 },
  detail: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
