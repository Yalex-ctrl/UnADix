import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { Judgement } from '@/types';
import { gameStyles } from '../gameStyles';

type ThiefAttemptProps = {
  thiefName: string;
  level: number;
  remaining: number;
  question: { question: string; answer: string; acceptedAnswers: string[] };
  onJudge: (judgement: Judgement) => void;
  onSkip: () => void;
};

export function ThiefAttempt({ thiefName, level, remaining, question, onJudge, onSkip }: ThiefAttemptProps) {
  const [peek, setPeek] = useState(false);
  return (
    <View style={gameStyles.centerContent}>
      <Text style={[gameStyles.eyebrow, styles.eyebrow]}>🕵️ TENTATIVE DE VOL</Text>
      <Text style={gameStyles.prompt}>{thiefName} tente de voler les points</Text>
      <Text style={styles.risk}>
        Réussite : +{level} points · Échec : −2 points
      </Text>
      <Text style={gameStyles.categoryDescription}>{question.question}</Text>
      {remaining > 1 && <Text style={styles.remaining}>{remaining - 1} autre(s) candidat(s) ensuite</Text>}

      {peek ? (
        <Text style={styles.answer}>
          {question.answer}
          {question.acceptedAnswers.length > 1
            ? ` (aussi : ${question.acceptedAnswers.filter((a) => a !== question.answer).join(', ')})`
            : ''}
        </Text>
      ) : (
        <Button label="👁 Organisateur : voir la réponse" variant="secondary" onPress={() => setPeek(true)} />
      )}

      <View style={gameStyles.judgeRow}>
        <Button label="✅ Bonne réponse" variant="success" onPress={() => onJudge('correct')} />
        <Button label="❌ Mauvaise réponse" variant="danger" onPress={() => onJudge('incorrect')} />
      </View>
      <Button label="⚖️ Accepter quand même" variant="secondary" onPress={() => onJudge('accepted-anyway')} />
      <Button label="Ce candidat renonce" variant="ghost" onPress={onSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.voleur },
  risk: { color: colors.warning, fontSize: 14, fontWeight: '700' },
  remaining: { color: colors.textMuted, fontSize: 13 },
  answer: { color: colors.success, fontSize: 18, fontWeight: '800', textAlign: 'center', paddingHorizontal: 12 },
});
