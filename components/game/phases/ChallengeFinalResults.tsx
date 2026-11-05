import { Player } from '@/types';
import { FinalResults } from './FinalResults';

type ChallengeFinalResultsProps = {
  players: Player[];
  winnerId: string | null;
  commentary: string | null;
  onReplay: () => void;
};

export function ChallengeFinalResults(props: ChallengeFinalResultsProps) {
  return <FinalResults {...props} isChallenge />;
}
