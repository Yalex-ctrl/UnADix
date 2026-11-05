import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { gameStyles } from '../gameStyles';

type ThiefRevealProps = {
  question: { answer: string; acceptedAnswers: string[]; explanation: string };
  onContinue: () => void;
};

// Shown once every steal attempt is over: the answer is finally revealed
// along with the educational explanation.
export function ThiefReveal({ question, onContinue }: ThiefRevealProps) {
  return (
    <View style={gameStyles.centerContent}>
      <Text style={gameStyles.eyebrow}>LA RÉPONSE ÉTAIT</Text>
      <Text style={styles.answer}>{question.answer}</Text>
      {question.acceptedAnswers.length > 1 && (
        <Text style={styles.accepted}>
          Aussi accepté : {question.acceptedAnswers.filter((a) => a !== question.answer).join(', ')}
        </Text>
      )}
      <Text style={gameStyles.categoryDescription}>{question.explanation}</Text>
      <Button label="Continuer" onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  answer: { color: colors.success, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  accepted: { color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 12 },
});
