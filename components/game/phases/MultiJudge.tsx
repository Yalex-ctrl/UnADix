import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { Question } from '@/types';
import { gameStyles } from '../gameStyles';

type MultiJudgeProps = {
  eyebrow: string;
  title?: string;
  subtitle?: string;
  accent?: string;
  question: Question | null;
  contenders: { id: string; name: string; color: string }[];
  submitLabel: string;
  onSubmit: (correctIds: string[]) => void;
  onCancel?: () => void;
};

// Shared screen for questions answered by several players at once (bonus,
// killer, all-in): everybody answers in secret, the organiser reveals the
// answer and ticks who got it right.
export function MultiJudge({
  eyebrow,
  title,
  subtitle,
  accent = colors.auction,
  question,
  contenders,
  submitLabel,
  onSubmit,
  onCancel,
}: MultiJudgeProps) {
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState<string[]>([]);
  const toggle = (id: string) =>
    setCorrect((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = () => {
    onSubmit(correct);
    setRevealed(false);
    setCorrect([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[gameStyles.eyebrow, { color: accent }]}>{eyebrow}</Text>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {question ? (
        <>
          <Text style={styles.question}>{question.question}</Text>
          {!revealed ? (
            <>
              <Text style={styles.hint}>
                Chacun note sa réponse en secret (papier ou à voix basse), puis l’organisateur révèle.
              </Text>
              <Button label="Révéler la réponse" onPress={() => setRevealed(true)} />
            </>
          ) : (
            <>
              <Text style={styles.answer}>{question.answer}</Text>
              {question.acceptedAnswers.length > 1 && (
                <Text style={styles.hint}>
                  Aussi accepté : {question.acceptedAnswers.filter((a) => a !== question.answer).join(', ')}
                </Text>
              )}
              <Text style={styles.hint}>{question.explanation}</Text>
              <Text style={styles.sectionLabel}>Qui a trouvé ?</Text>
              <View style={styles.list}>
                {contenders.map((c) => {
                  const on = correct.includes(c.id);
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => toggle(c.id)}
                      style={[styles.chip, { borderColor: c.color }, on && { backgroundColor: c.color }]}
                    >
                      <Text style={[styles.chipText, on && { color: colors.background }]}>
                        {on ? '✅ ' : ''}
                        {c.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Button label={submitLabel} onPress={submit} />
            </>
          )}
        </>
      ) : (
        <Text style={styles.hint}>Aucune question disponible.</Text>
      )}
      {!question && <Button label={submitLabel} onPress={() => onSubmit([])} />}
      {onCancel && <Button label="Annuler" variant="ghost" onPress={onCancel} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
  question: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center', marginVertical: 8 },
  hint: { color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 12 },
  answer: { color: colors.success, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  sectionLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  list: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  chipText: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
