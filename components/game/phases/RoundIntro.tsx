import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type RoundIntroProps = {
  round: number;
  total: number;
  categoryName: string;
  categoryDescription: string;
  isAuctionRound: boolean;
  onStart: () => void;
};

export function RoundIntro({ round, total, categoryName, categoryDescription, isAuctionRound, onStart }: RoundIntroProps) {
  return (
    <ScreenBody
      center
      bottom={<Button label={isAuctionRound ? "Lancer l'enchère" : 'Choisir les niveaux'} size="l" onPress={onStart} />}
    >
      <Card tone={isAuctionRound ? 'gold' : 'default'} borderColor={isAuctionRound ? palette.gold : palette.border}>
        <View style={{ gap: 12, alignItems: 'center', paddingVertical: 16 }}>
          <T variant="caption" color={isAuctionRound ? palette.gold : palette.primary} style={{ letterSpacing: 1 }}>
            {isAuctionRound ? `MANCHE ${round} · ENCHÈRES` : `MANCHE ${round} SUR ${total}`}
          </T>
          <T variant="display" center>
            {categoryName}
          </T>
          <T variant="body" color={palette.textMuted} center>
            {categoryDescription}
          </T>
          {isAuctionRound && (
            <T variant="caption" color={palette.gold} center>
              Les joueurs enchérissent à voix haute sur le niveau (1 à 10) auquel ils pensent pouvoir répondre.
            </T>
          )}
        </View>
      </Card>
    </ScreenBody>
  );
}
