import { View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type ChallengeRoundIntroProps = {
  round: number;
  total: number;
  level: number;
  isAuctionRound: boolean;
  onStart: () => void;
};

export function ChallengeRoundIntro({ round, total, level, isAuctionRound, onStart }: ChallengeRoundIntroProps) {
  return (
    <ScreenBody center bottom={<Button label={isAuctionRound ? "Lancer l'enchère" : 'Commencer'} size="l" onPress={onStart} />}>
      <Card tone={isAuctionRound ? 'gold' : 'default'} borderColor={isAuctionRound ? palette.gold : palette.border}>
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 16 }}>
          <T variant="caption" color={palette.gold} style={{ letterSpacing: 1 }}>
            {isAuctionRound ? `DÉFI ${round} / ${total} · ENCHÈRES` : `DÉFI ${round} / ${total}`}
          </T>
          {isAuctionRound ? (
            <T variant="title" center>
              Round Enchères
            </T>
          ) : (
            <>
              <T variant="display" numeric>
                Niveau {level}
              </T>
              <Badge label={`${level} pts par bonne réponse`} color={palette.goldSoft} textColor={palette.gold} />
            </>
          )}
          <T variant="body" color={palette.textMuted} center>
            {isAuctionRound
              ? 'Les joueurs enchérissent sur le niveau. Le gagnant répond dans son propre thème.'
              : 'Tout le monde reçoit une question de ce niveau, dans le thème qu’il a choisi.'}
          </T>
        </View>
      </Card>
    </ScreenBody>
  );
}
