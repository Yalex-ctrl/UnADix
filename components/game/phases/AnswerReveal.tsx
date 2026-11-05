import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { Judgement } from '@/types';
import { gameStyles } from '../gameStyles';

type AnswerRevealProps = {
  answeringLabel: string;
  question: { answer: string; acceptedAnswers: string[]; explanation: string };
  // In thief mode the answer must not be visible to the table until every
  // steal attempt is over, so the organiser has to opt in to see it.
  secret?: boolean;
  onJudge: (judgement: Judgement) => void;
};

export function AnswerReveal({ answeringLabel, question, secret, onJudge }: AnswerRevealProps) {
  const [shown, setShown] = useState(!secret);
  return (
    <View style={gameStyles.centerContent}>
      <Text style={gameStyles.eyebrow}>RÉPONSE</Text>
      <Text style={styles.answeringLabel}>{answeringLabel}</Text>
      {shown ? (
        <>
          <Text style={styles.answerText}>{question.answer}</Text>
          {question.acceptedAnswers.length > 1 && (
            <Text style={styles.acceptedText}>
              Aussi accepté : {question.acceptedAnswers.filter((a) => a !== question.answer).join(', ')}
            </Text>
          )}
          {!secret && <Text style={gameStyles.categoryDescription}>{question.explanation}</Text>}
        </>
      ) : (
        <Button label="👁 Organisateur : voir la réponse" variant="secondary" onPress={() => setShown(true)} />
      )}

      <View style={gameStyles.judgeRow}>
        <Button label="✅ Bonne réponse" variant="success" onPress={() => onJudge('correct')} />
        <Button label="❌ Mauvaise réponse" variant="danger" onPress={() => onJudge('incorrect')} />
      </View>
      <Button label="⚖️ Accepter quand même" variant="secondary" onPress={() => onJudge('accepted-anyway')} style={styles.acceptAnyway} />
    </View>
  );
}

const styles = StyleSheet.create({
  answeringLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  answerText: {
    color: colors.success,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
  acceptedText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },
  acceptAnyway: {
    marginTop: 4,
  },
});
