import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { gameStyles } from '../gameStyles';

type RoundIntroProps = {
  categoryName: string;
  categoryDescription: string;
  isAuctionRound: boolean;
  onStart: () => void;
};

export function RoundIntro({ categoryName, categoryDescription, isAuctionRound, onStart }: RoundIntroProps) {
  return (
    <View style={gameStyles.centerContent}>
      <Text style={gameStyles.eyebrow}>{isAuctionRound ? 'ROUND ENCHÈRES' : 'CATÉGORIE'}</Text>
      <Text style={gameStyles.categoryName}>{categoryName}</Text>
      <Text style={gameStyles.categoryDescription}>{categoryDescription}</Text>
      {isAuctionRound && (
        <Text style={gameStyles.promptSub}>
          Les joueurs enchérissent à voix haute sur le niveau (1 à 10) auquel ils pensent pouvoir répondre.
        </Text>
      )}
      <Button label={isAuctionRound ? "Lancer l'enchère" : 'Choisir les niveaux'} onPress={onStart} />
    </View>
  );
}
