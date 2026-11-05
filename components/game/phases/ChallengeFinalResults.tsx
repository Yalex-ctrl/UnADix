import { ComponentProps } from 'react';
import { FinalResults } from './FinalResults';

type Props = Omit<ComponentProps<typeof FinalResults>, 'isChallenge' | 'onStartChallenge'>;

export function ChallengeFinalResults(props: Props) {
  return <FinalResults {...props} isChallenge />;
}
