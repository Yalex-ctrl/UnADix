import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';
import { Player } from '@/types';
import { Leaderboard } from '../Leaderboard';

type RoundSummaryProps = {
  players: Player[];
  deltas: Record<string, number>;
  isLastRound: boolean;
  isChallenge?: boolean;
  allInPossible: boolean;
  onNext: () => void;
  onAllIn: () => void;
};

export function RoundSummary({ players, deltas, isLastRound, isChallenge, allInPossible, onNext, onAllIn }: RoundSummaryProps) {
  return (
    <ScreenBody
      bottom={
        <>
          <Button
            label={isLastRound ? 'Voir les résultats' : isChallenge ? 'Défi suivant' : 'Manche suivante'}
            size="l"
            onPress={onNext}
          />
        </>
      }
    >
      <View style={{ gap: 4 }}>
        <T variant="caption" color={palette.textMuted} style={{ letterSpacing: 1 }}>
          {isChallenge ? 'FIN DU DÉFI' : 'FIN DE MANCHE'}
        </T>
        <T variant="title">Classement</T>
      </View>
      <Leaderboard players={players} deltas={deltas} />
      {allInPossible && (
        <Button label="Défier un joueur — All-In" icon="zap" variant="gold" onPress={onAllIn} />
      )}
    </ScreenBody>
  );
}
