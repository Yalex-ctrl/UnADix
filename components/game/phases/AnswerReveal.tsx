import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';
import { Judgement } from '@/types';

type AnswerRevealProps = {
  // « Question d'Arnaud · Niveau 5 · 5 pts »
  context: string;
  question: { answer: string; acceptedAnswers: string[]; explanation: string; anecdote?: string };
  // En mode Voleur la réponse ne doit pas être lue par la tablée avant la fin
  // des tentatives de vol : l'organisateur doit l'afficher volontairement.
  secret?: boolean;
  onJudge: (judgement: Judgement) => void;
};

export function AnswerReveal({ context, question, secret, onJudge }: AnswerRevealProps) {
  const [shown, setShown] = useState(!secret);
  const others = question.acceptedAnswers.filter((a) => a !== question.answer);

  return (
    <ScreenBody
      center
      bottom={
        <>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button label="Faux" icon="x" variant="danger" size="l" style={{ flex: 1 }} onPress={() => onJudge('incorrect')} />
            <Button label="Juste" icon="check" variant="success" size="l" style={{ flex: 1 }} onPress={() => onJudge('correct')} />
          </View>
          <Button label="Accepter quand même" variant="ghost" onPress={() => onJudge('accepted-anyway')} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 4 }}>
        <T variant="caption" color={palette.textMuted} style={{ letterSpacing: 1 }}>
          RÉPONSE ATTENDUE
        </T>
        <T variant="caption" color={palette.textMuted}>
          {context}
        </T>
      </View>

      {shown ? (
        <>
          <T variant="display" center color={palette.success}>
            {question.answer}
          </T>
          {others.length > 0 && (
            <T variant="caption" color={palette.textMuted} center>
              Aussi accepté : {others.join(', ')}
            </T>
          )}
          {!secret && (
            <Card tone="soft" style={{ gap: 8 }}>
              <T variant="body">{question.explanation}</T>
              {question.anecdote ? (
                <T variant="caption" color={palette.textMuted}>
                  {question.anecdote}
                </T>
              ) : null}
            </Card>
          )}
        </>
      ) : (
        <Card tone="soft" style={{ alignItems: 'center', gap: 12 }}>
          <T variant="body" color={palette.textMuted} center>
            Mode Voleur : la réponse reste cachée à la tablée.
          </T>
          <Button label="Organisateur : voir la réponse" icon="eye" variant="secondary" onPress={() => setShown(true)} />
        </Card>
      )}
    </ScreenBody>
  );
}
