import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { Player } from '@/types';
import { gameStyles } from '../gameStyles';

type AllInSetupProps = {
  players: Player[];
  onStart: (challengerId: string, targetId: string) => void;
  onCancel: () => void;
};

export function AllInSetup({ players, onStart, onCancel }: AllInSetupProps) {
  const [challengerId, setChallengerId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const challenger = players.find((p) => p.id === challengerId);
  const targets = challenger ? players.filter((p) => p.id !== challenger.id && p.score >= challenger.score) : [];
  const target = players.find((p) => p.id === targetId);

  return (
    <View style={gameStyles.centerContent}>
      <Text style={[gameStyles.eyebrow, { color: colors.auction }]}>🎲 DUEL ALL-IN</Text>
      <Text style={styles.rule}>
        Le challenger mise la totalité de ses points. Le joueur défié doit en avoir au moins autant. Le gagnant
        récupère la mise. Aucun joker, pas de vol.
      </Text>

      <Text style={styles.label}>Qui lance le défi ?</Text>
      <View style={styles.list}>
        {players
          .filter((p) => p.score > 0)
          .map((p) => (
            <Pressable
              key={p.id}
              onPress={() => {
                setChallengerId(p.id);
                setTargetId(null);
                setAccepted(false);
              }}
              style={[styles.chip, challengerId === p.id && styles.chipOn]}
            >
              <Text style={styles.chipText}>
                {p.name} ({p.score})
              </Text>
            </Pressable>
          ))}
      </View>

      {challenger && (
        <>
          <Text style={styles.label}>Qui est défié ?</Text>
          {targets.length === 0 ? (
            <Text style={styles.rule}>Personne n’a assez de points pour accepter cette mise.</Text>
          ) : (
            <View style={styles.list}>
              {targets.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setTargetId(p.id);
                    setAccepted(false);
                  }}
                  style={[styles.chip, targetId === p.id && styles.chipOn]}
                >
                  <Text style={styles.chipText}>
                    {p.name} ({p.score})
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}

      {challenger && target && (
        <>
          <Text style={styles.stake}>MISE : {challenger.score} POINTS</Text>
          <Pressable onPress={() => setAccepted((v) => !v)} style={[styles.chip, accepted && styles.chipOn]}>
            <Text style={styles.chipText}>
              {accepted ? '✅' : '⬜'} {challenger.name} et {target.name} acceptent
            </Text>
          </Pressable>
          <Button label="Lancer le duel" variant="auction" disabled={!accepted} onPress={() => onStart(challenger.id, target.id)} />
        </>
      )}
      <Button label="Annuler" variant="ghost" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  rule: { color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 12 },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  list: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: { borderWidth: 2, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  chipOn: { borderColor: colors.auction, backgroundColor: colors.surfaceAlt },
  chipText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  stake: { color: colors.auction, fontSize: 22, fontWeight: '800' },
});
