import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SoftCard } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';
import { Judgement } from '@/types';

type ThiefAttemptProps = {
  thief: { name: string; color: string; profileId?: string };
  level: number;
  remaining: number;
  question: { question: string; answer: string; acceptedAnswers: string[] };
  onJudge: (judgement: Judgement) => void;
  onSkip: () => void;
};

export function ThiefAttempt({ thief, level, remaining, question, onJudge, onSkip }: ThiefAttemptProps) {
  const others = question.acceptedAnswers.filter((a) => a !== question.answer);

  return (
    <ScreenBody
      center
      bottom={
        <>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button label="Faux" icon="x" variant="bad" size="xl" style={{ flex: 1 }} onPress={() => onJudge('incorrect')} />
            <Button label="Juste" icon="check" variant="good" size="xl" style={{ flex: 1 }} onPress={() => onJudge('correct')} />
          </View>
          <Button label="Ce candidat renonce" variant="ghost" onPress={onSkip} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Pill label="Tentative de vol" color={palette.steal} />
        <Avatar name={thief.name} color={thief.color} profileId={thief.profileId} size={84} ring />
        <T variant="title" center>
          {thief.name} tente le vol
        </T>
        <T variant="body" color={palette.inkSoft} center numeric>
          Réussite +{level} pts · Échec −2 pts
        </T>
        {remaining > 1 && (
          <T variant="caption" color={palette.inkSoft}>
            {remaining - 1} autre{remaining > 2 ? 's' : ''} candidat{remaining > 2 ? 's' : ''} ensuite
          </T>
        )}
      </View>

      <T variant="heading" center style={{ paddingVertical: 8 }}>
        {question.question}
      </T>

      <HoldToPeek answer={question.answer} others={others} />
    </ScreenBody>
  );
}


// Zone « organisateur uniquement » : la réponse n'est visible que tant que le
// doigt reste appuyé, pour que la tablée ne la voie pas.
function HoldToPeek({ answer, others }: { answer: string; others: string[] }) {
  const [holding, setHolding] = useState(false);
  return (
    <Pressable
      onPressIn={() => setHolding(true)}
      onPressOut={() => setHolding(false)}
      accessibilityRole="button"
      accessibilityLabel="Maintenir pour voir la réponse (organisateur)"
    >
      <SoftCard tone="soft" style={{ alignItems: 'center', gap: 4, minHeight: 72, justifyContent: 'center' }}>
        {holding ? (
          <>
            <T variant="heading" center>
              {answer}
            </T>
            {others.length > 0 && (
              <T variant="caption" color={palette.inkSoft} center>
                Aussi accepté : {others.join(', ')}
              </T>
            )}
          </>
        ) : (
          <T variant="caption" color={palette.inkSoft} center>
            Organisateur : maintiens appuyé pour lire la réponse
          </T>
        )}
      </SoftCard>
    </Pressable>
  );
}
