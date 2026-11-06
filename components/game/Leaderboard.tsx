import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { T } from '@/components/ui/Typography';
import { fonts, OUTLINE, palette, radius, space } from '@/theme/tokens';

type LeaderboardPlayer = {
  id: string;
  name: string;
  score: number;
  color?: string;
  profileId?: string;
  played?: number;
  correct?: number;
  jokerUsed?: boolean;
};

type LeaderboardProps = {
  players: LeaderboardPlayer[];
  // Places gagnées (+) ou perdues (−) depuis la manche précédente.
  deltas?: Record<string, number>;
};

// « 2/3 justes · 67 % », ou « – » quand le joueur n'a encore répondu à aucune
// question personnelle (par ex. question braquée par un adversaire).
export function formatRate(correct: number, played: number): string {
  if (played <= 0) return '–';
  return `${correct}/${played} justes · ${Math.round((correct / played) * 100)} %`;
}

export function Leaderboard({ players, deltas }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <View style={styles.list}>
      {sorted.map((p, idx) => {
        const rank = idx > 0 && sorted[idx - 1].score === p.score ? null : idx + 1;
        const delta = deltas?.[p.id] ?? 0;
        const detailed = p.played !== undefined && p.correct !== undefined;
        return (
          <View key={p.id} style={[styles.row, idx === 0 && p.score > 0 && styles.leader]}>
            <T variant="heading" color={palette.textMuted} numeric style={styles.rank}>
              {rank ?? '='}
            </T>
            <Avatar name={p.name} color={p.color} profileId={p.profileId} size={36} />
            <View style={styles.names}>
              <T variant="body" style={styles.name} numberOfLines={1}>
                {p.name}
              </T>
              {detailed && (
                <T variant="caption" color={palette.textMuted}>
                  {formatRate(p.correct!, p.played!)}
                </T>
              )}
            </View>
            {delta !== 0 && (
              <View style={styles.delta}>
                <Feather
                  name={delta > 0 ? 'arrow-up' : 'arrow-down'}
                  size={13}
                  color={delta > 0 ? palette.success : palette.danger}
                />
                <T variant="caption" color={delta > 0 ? palette.success : palette.danger} numeric>
                  {Math.abs(delta)}
                </T>
              </View>
            )}
            {p.jokerUsed !== undefined && (
              <Feather
                name="award"
                size={16}
                color={p.jokerUsed ? palette.textFaint : palette.gold}
                accessibilityLabel={p.jokerUsed ? 'Joker utilisé' : 'Joker disponible'}
              />
            )}
            <T variant="title" color={palette.ink} numeric style={styles.score}>
              {p.score}
            </T>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm, width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.button,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderWidth: OUTLINE,
    borderColor: palette.line,
  },
  leader: { backgroundColor: palette.goldSoft },
  rank: { width: 24, textAlign: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  names: { flex: 1 },
  name: { fontFamily: fonts.bold },
  delta: { flexDirection: 'row', alignItems: 'center' },
  score: { minWidth: 36, textAlign: 'right' },
});
