import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';
import { Judgement } from '@/types';

type ThiefAttemptProps = {
  thief: { name: string; color: string };
  level: number;
  remaining: number;
  question: { question: string; answer: string; acceptedAnswers: string[] };
  onJudge: (judgement: Judgement) => void;
  onSkip: () => void;
};

export function ThiefAttempt({ thief, level, remaining, question, onJudge, onSkip }: ThiefAttemptProps) {
  const [peek, setPeek] = useState(false);
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
          <Button label="Ce candidat renonce" variant="ghost" onPress={onSkip} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 6 }}>
        <T variant="caption" color={palette.primary} style={{ letterSpacing: 1 }}>
          TENTATIVE DE VOL
        </T>
        <T variant="title" center color={thief.color}>
          {thief.name} tente le vol
        </T>
        <T variant="body" color={palette.textMuted} center numeric>
          Réussite +{level} pts · Échec −2 pts
        </T>
        {remaining > 1 && (
          <T variant="caption" color={palette.textFaint}>
            {remaining - 1} autre{remaining > 2 ? 's' : ''} candidat{remaining > 2 ? 's' : ''} ensuite
          </T>
        )}
      </View>

      <T variant="heading" center style={{ paddingVertical: 8 }}>
        {question.question}
      </T>

      {peek ? (
        <Card tone="soft" style={{ alignItems: 'center', gap: 4 }}>
          <T variant="caption" color={palette.textMuted}>
            Pour l’organisateur uniquement
          </T>
          <T variant="heading" color={palette.success} center>
            {question.answer}
          </T>
          {others.length > 0 && (
            <T variant="caption" color={palette.textMuted} center>
              Aussi accepté : {others.join(', ')}
            </T>
          )}
        </Card>
      ) : (
        <Button label="Organisateur : voir la réponse" icon="eye" variant="secondary" onPress={() => setPeek(true)} />
      )}
    </ScreenBody>
  );
}
