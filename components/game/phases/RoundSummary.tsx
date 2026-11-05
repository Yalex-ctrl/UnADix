import { View, Text, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Player, TrophyEvent } from '@/types';
import { Leaderboard } from '../Leaderboard';
import { RoundExtras } from '../RoundExtras';
import { gameStyles } from '../gameStyles';

type RoundSummaryProps = {
  players: Player[];
  commentary: string | null;
  newTrophies: TrophyEvent[];
  isLastRound: boolean;
  isChallenge?: boolean;
  onNext: () => void;
  onAllIn: () => void;
  onRemovePlayer: (id: string) => void;
};

export function RoundSummary({
  players,
  commentary,
  newTrophies,
  isLastRound,
  isChallenge,
  onNext,
  onAllIn,
  onRemovePlayer,
}: RoundSummaryProps) {
  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', gap: 12, paddingVertical: 16 }}>
      <Text style={gameStyles.eyebrow}>{isChallenge ? 'FIN DE DÉFI' : 'FIN DE MANCHE'}</Text>
      <Leaderboard players={players} />
      <RoundExtras
        players={players}
        commentary={commentary}
        newTrophies={newTrophies}
        onAllIn={onAllIn}
        onRemovePlayer={onRemovePlayer}
      />
      <View style={{ width: '100%' }}>
        <Button
          label={isLastRound ? 'Voir les résultats' : isChallenge ? 'Défi suivant' : 'Manche suivante'}
          onPress={onNext}
        />
      </View>
    </ScrollView>
  );
}
