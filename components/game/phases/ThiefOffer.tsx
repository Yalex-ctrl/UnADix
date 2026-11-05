import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { gameStyles } from '../gameStyles';

type ThiefOfferProps = {
  victimName: string;
  level: number;
  candidates: { id: string; name: string; color: string }[];
  onStart: (candidateIds: string[]) => void;
};

export function ThiefOffer({ victimName, level, candidates, onStart }: ThiefOfferProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <View style={gameStyles.centerContent}>
      <Text style={[gameStyles.eyebrow, { color: colors.danger }]}>MAUVAISE RÉPONSE !</Text>
      <Text style={gameStyles.prompt}>Quelqu’un veut-il tenter de voler les points de {victimName} ?</Text>
      <Text style={styles.risk}>
        Réussite : +{level} points · Échec : −2 points
      </Text>
      <View style={styles.list}>
        {candidates.map((c) => {
          const on = selected.includes(c.id);
          return (
            <Pressable
              key={c.id}
              onPress={() => toggle(c.id)}
              style={[styles.chip, { borderColor: c.color }, on && { backgroundColor: c.color }]}
            >
              <Text style={[styles.chipText, on && { color: colors.background }]}>
                {on ? '🕵️ ' : ''}
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Button
        label={selected.length > 0 ? `Tenter le vol (${selected.length})` : 'Tenter le vol'}
        variant="voleur"
        disabled={selected.length === 0}
        onPress={() => onStart(selected)}
      />
      <Button label="Passer" variant="ghost" onPress={() => onStart([])} />
    </View>
  );
}

const styles = StyleSheet.create({
  risk: { color: colors.warning, fontSize: 15, fontWeight: '700' },
  list: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginVertical: 8 },
  chip: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  chipText: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
