import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { FlipCard } from '@/components/ui/FlipCard';
import { PopCard, SoftCard } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { questionFontSize } from '@/components/ui/QuestionCard';
import { playSound } from '@/lib/sounds';
import { palette } from '@/theme/tokens';
import { Judgement } from '@/types';

type AnswerRevealProps = {
  questionText: string;
  // « Question d'Arnaud · Niveau 5 · 5 pts »
  context: string;
  question: { answer: string; acceptedAnswers: string[]; explanation: string; anecdote?: string };
  // En mode Voleur la réponse ne doit pas être lue par la tablée avant la fin
  // des tentatives de vol : l'organisateur doit l'afficher volontairement.
  secret?: boolean;
  onJudge: (judgement: Judgement) => void;
};

// « Le Retournement » : la carte question pivote pour montrer la réponse.
export function AnswerReveal({ questionText, context, question, secret, onJudge }: AnswerRevealProps) {
  const [flipped, setFlipped] = useState(false);
  const [shown, setShown] = useState(!secret);
  const others = question.acceptedAnswers.filter((a) => a !== question.answer);

  useEffect(() => {
    const t = setTimeout(() => {
      setFlipped(true);
      playSound('reveal');
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const front = (
    <PopCard>
      <T variant="title" center style={questionFontSize(questionText)}>
        {questionText}
      </T>
    </PopCard>
  );

  const back = (
    <PopCard tone="soft" style={{ gap: 10, alignItems: 'center' }}>
      <T variant="caption" color={palette.inkSoft} style={{ letterSpacing: 1.2 }}>
        RÉPONSE ATTENDUE
      </T>
      {shown ? (
        <>
          <T variant="display" center color={palette.ink} adjustsFontSizeToFit numberOfLines={3}>
            {question.answer}
          </T>
          {others.length > 0 && (
            <T variant="caption" color={palette.inkSoft} center>
              Aussi accepté : {others.join(', ')}
            </T>
          )}
          {!secret && (
            <SoftCard style={{ gap: 6, alignSelf: 'stretch' }}>
              <T variant="body">{question.explanation}</T>
              {question.anecdote ? (
                <T variant="caption" color={palette.inkSoft}>
                  {question.anecdote}
                </T>
              ) : null}
            </SoftCard>
          )}
        </>
      ) : (
        <>
          <T variant="body" color={palette.inkSoft} center>
            Mode Voleur : la réponse reste cachée à la tablée.
          </T>
          <Button label="Organisateur : voir la réponse" icon="eye" variant="secondary" onPress={() => setShown(true)} />
        </>
      )}
    </PopCard>
  );

  return (
    <ScreenBody
      center
      bottom={
        <>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button label="Faux" icon="x" variant="bad" size="xl" style={{ flex: 1 }} onPress={() => onJudge('incorrect')} />
            <Button label="Juste" icon="check" variant="good" size="xl" style={{ flex: 1 }} onPress={() => onJudge('correct')} />
          </View>
          <Button label="Accepter quand même" variant="ghost" onPress={() => onJudge('accepted-anyway')} />
        </>
      }
    >
      <Pill label={context} />
      <FlipCard flipped={flipped} front={front} back={back} />
    </ScreenBody>
  );
}
