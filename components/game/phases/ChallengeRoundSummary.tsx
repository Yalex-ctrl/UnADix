import { Player, TrophyEvent } from '@/types';
import { RoundSummary } from './RoundSummary';

type ChallengeRoundSummaryProps = {
  players: Player[];
  commentary: string | null;
  newTrophies: TrophyEvent[];
  isLastRound: boolean;
  onNext: () => void;
  onAllIn: () => void;
  onRemovePlayer: (id: string) => void;
};

export function ChallengeRoundSummary(props: ChallengeRoundSummaryProps) {
  return <RoundSummary {...props} isChallenge />;
}
