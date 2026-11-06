import { Button } from '@/components/ui/Button';
import { ModeTitleCard } from '@/components/ui/ModeTitleCard';
import { Roulette } from '@/components/ui/Roulette';
import { ScreenBody } from '@/components/ui/Screen';
import { palette } from '@/theme/tokens';

type RoundIntroProps = {
  round: number;
  total: number;
  categoryId: string;
  categoryDescription: string;
  isAuctionRound: boolean;
  onStart: () => void;
};

export function RoundIntro({ round, total, categoryId, categoryDescription, isAuctionRound, onStart }: RoundIntroProps) {
  if (isAuctionRound) {
    return (
      <ModeTitleCard
        color="#FF9F1C"
        icon="trending-up"
        kicker={`Manche ${round} sur ${total}`}
        title="Enchères !"
        rule="Annoncez à voix haute le niveau auquel vous pensez pouvoir répondre. Le plus audacieux gagne l’enchère."
        mood="hype"
        cta="Lancer l’enchère"
        onStart={onStart}
      />
    );
  }
  return (
    <ScreenBody center bottom={<Button label="Choisir les niveaux" size="xl" onPress={onStart} />}>
      <Roulette categoryId={categoryId} description={categoryDescription} round={round} total={total} />
    </ScreenBody>
  );
}

export const roundIntroInk = palette.ink;
