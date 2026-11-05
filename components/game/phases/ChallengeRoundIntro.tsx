import { View, Text } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors, levelColor } from '@/constants/theme';
import { gameStyles } from '../gameStyles';

type ChallengeRoundIntroProps = {
  round: number;
  total: number;
  level: number;
  isAuctionRound: boolean;
  onStart: () => void;
};

export function ChallengeRoundIntro({ round, total, level, isAuctionRound, onStart }: ChallengeRoundIntroProps) {
  return (
    <View style={gameStyles.centerContent}>
      <Text style={gameStyles.eyebrow}>
        {isAuctionRound ? `ENCHÈRES · DÉFI ${round} / ${total}` : `DÉFI ${round} / ${total}`}
      </Text>
      {isAuctionRound ? (
        <Badge label="Round Enchères" color={colors.auction} textColor={colors.background} />
      ) : (
        <View style={gameStyles.levelBadgeWrap}>
          <Badge label={`Niveau ${level} · ${level} pts`} color={levelColor(level)} />
        </View>
      )}
      <Text style={gameStyles.categoryDescription}>
        {isAuctionRound
          ? 'Les joueurs enchérissent sur le niveau auquel ils pensent pouvoir répondre, chacun dans son propre thème.'
          : 'Chaque joueur répond dans son propre thème, au même niveau de difficulté.'}
      </Text>
      <Button label="Commencer" onPress={onStart} />
    </View>
  );
}
