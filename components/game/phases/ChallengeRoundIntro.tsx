import { ModeTitleCard } from '@/components/ui/ModeTitleCard';
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
    <ModeTitleCard
      color={isAuctionRound ? palette.orange : palette.steal}
      icon={isAuctionRound ? 'trending-up' : 'flag'}
      kicker={`Défi ${round} sur ${total}`}
      title={isAuctionRound ? 'Enchères !' : `Niveau ${level}`}
      rule={
        isAuctionRound
          ? 'Les joueurs enchérissent sur le niveau. Le gagnant répond dans son propre thème.'
          : `Tout le monde reçoit une question de niveau ${level}, dans le thème qu’il a choisi. ${level} points par bonne réponse.`
      }
      mood="hype"
      cta={isAuctionRound ? 'Lancer l’enchère' : 'Commencer'}
      onStart={onStart}
    />
  );
}
