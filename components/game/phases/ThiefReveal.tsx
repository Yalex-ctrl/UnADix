import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type ThiefRevealProps = {
  question: { answer: string; acceptedAnswers: string[]; explanation: string; anecdote?: string };
  onContinue: () => void;
};

// Affiché une fois toutes les tentatives de vol terminées : la réponse est
// enfin révélée, avec l'explication.
export function ThiefReveal({ question, onContinue }: ThiefRevealProps) {
  const others = question.acceptedAnswers.filter((a) => a !== question.answer);
  return (
    <ScreenBody center bottom={<Button label="Continuer" size="l" onPress={onContinue} />}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <T variant="caption" color={palette.textMuted} style={{ letterSpacing: 1 }}>
          LA RÉPONSE ÉTAIT
        </T>
      </View>
      <T variant="display" center color={palette.success}>
        {question.answer}
      </T>
      {others.length > 0 && (
        <T variant="caption" color={palette.textMuted} center>
          Aussi accepté : {others.join(', ')}
        </T>
      )}
      <Card tone="soft" style={{ gap: 8 }}>
        <T variant="body">{question.explanation}</T>
        {question.anecdote ? (
          <T variant="caption" color={palette.textMuted}>
            {question.anecdote}
          </T>
        ) : null}
      </Card>
    </ScreenBody>
  );
}
