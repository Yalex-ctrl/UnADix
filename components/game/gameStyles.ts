import { StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

// Shared layout tokens for the game-phase views in components/game/phases/*.
// Extracted because most phases share the same "centered content column with
// an eyebrow label" shape.
export const gameStyles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 24,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  prompt: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  promptSub: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryName: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
  },
  categoryDescription: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  leaderboard: {
    width: '100%',
    gap: 8,
    marginVertical: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboardRank: {
    color: colors.textMuted,
    fontWeight: '700',
    width: 28,
  },
  leaderboardName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  leaderboardScore: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  winnerText: {
    color: colors.auction,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 8,
  },
  judgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  levelBadgeWrap: {
    marginTop: 8,
  },
});
