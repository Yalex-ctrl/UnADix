import { useState } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ScreenBody } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';
import { Question } from '@/types';

type MultiJudgeProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  kicker: string; // « Question bonus », « Killer Question », « Duel All-In »
  title: string;
  rule: string; // règle en une phrase, affichée sur l'écran d'intro
  gold?: boolean; // accent doré pour signaler l'événement
  question: Question | null;
  contenders: { id: string; name: string; color: string }[];
  onSubmit: (correctIds: string[]) => void;
};

// Gabarit commun aux modes spéciaux (bonus, Killer Question, All-In) :
// intro → question → révélation et choix de ceux qui ont trouvé.
export function MultiJudge({ icon, kicker, title, rule, gold = true, question, contenders, onSubmit }: MultiJudgeProps) {
  const [stage, setStage] = useState<'intro' | 'question' | 'judge'>('intro');
  const [correct, setCorrect] = useState<string[]>([]);
  const accent = gold ? palette.gold : palette.primary;
  const soft = gold ? palette.goldSoft : palette.primarySoft;
  const toggle = (id: string) => setCorrect((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = () => {
    onSubmit(correct);
    // Nouvelle question possible (égalité) : on repart de l'écran de question.
    setStage('question');
    setCorrect([]);
  };

  if (stage === 'intro') {
    return (
      <ScreenBody center bottom={<Button label="C’est parti" size="l" onPress={() => setStage('question')} />}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: soft, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={icon} size={32} color={accent} />
          </View>
          <T variant="caption" color={accent} style={{ letterSpacing: 1 }}>
            {kicker.toUpperCase()}
          </T>
          <T variant="title" center>
            {title}
          </T>
          <T variant="body" color={palette.textMuted} center>
            {rule}
          </T>
        </View>
      </ScreenBody>
    );
  }

  if (!question) {
    return (
      <ScreenBody center bottom={<Button label="Continuer" size="l" onPress={() => onSubmit([])} />}>
        <T variant="body" center color={palette.textMuted}>
          Aucune question disponible.
        </T>
      </ScreenBody>
    );
  }

  const others = question.acceptedAnswers.filter((a) => a !== question.answer);

  return (
    <ScreenBody
      center={stage === 'question'}
      bottom={
        stage === 'question' ? (
          <Button label="Révéler la réponse" size="l" onPress={() => setStage('judge')} />
        ) : (
          <Button label="Valider" size="l" onPress={submit} />
        )
      }
    >
      <T variant="caption" color={accent} center style={{ letterSpacing: 1 }}>
        {kicker.toUpperCase()}
      </T>
      <T variant="title" center>
        {question.question}
      </T>
      {stage === 'question' ? (
        <T variant="caption" color={palette.textMuted} center>
          Chacun note sa réponse en secret (papier ou à voix basse), puis l’organisateur révèle.
        </T>
      ) : (
        <>
          <Card tone="soft" style={{ gap: 6, alignItems: 'center' }}>
            <T variant="caption" color={palette.textMuted}>
              Réponse attendue
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
          <SectionTitle>Qui a trouvé ?</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {contenders.map((c) => (
              <Chip key={c.id} label={c.name} color={c.color} selected={correct.includes(c.id)} onPress={() => toggle(c.id)} />
            ))}
          </View>
        </>
      )}
    </ScreenBody>
  );
}
