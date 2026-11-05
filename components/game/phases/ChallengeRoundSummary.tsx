import { ComponentProps } from 'react';
import { RoundSummary } from './RoundSummary';

type Props = Omit<ComponentProps<typeof RoundSummary>, 'isChallenge'>;

export function ChallengeRoundSummary(props: Props) {
  return <RoundSummary {...props} isChallenge />;
}
