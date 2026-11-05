import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { PlayerChip } from '@/components/ui/PlayerChip';
import { gameStyles } from '../gameStyles';

type AuctionBidProps = {
  categoryName?: string;
  players: { id: string; name: string; score: number }[];
  onResolve: (playerId: string | null, level: number | null) => void;
};

export function AuctionBid({ categoryName, players, onResolve }: AuctionBidProps) {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <View style={gameStyles.centerContent}>
      <Text style={gameStyles.eyebrow}>{categoryName ? `ENCHÈRES · ${categoryName.toUpperCase()}` : 'ENCHÈRES'}</Text>
      <Text style={gameStyles.promptSub}>
        {categoryName
          ? "Qui remporte l'enchère, et à quel niveau ?"
          : "Qui remporte l'enchère et à quel niveau ? Il répondra dans son propre thème."}
      </Text>

      <Text style={styles.sectionLabel}>Gagnant</Text>
      <View style={styles.playerList}>
        {players.map((p) => (
          <PlayerChip
            key={p.id}
            name={p.name}
            score={p.score}
            selected={winnerId === p.id}
            accentColor={colors.auction}
            onPress={() => setWinnerId(p.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Niveau annoncé</Text>
      <View style={styles.levelGrid}>
        {levels.map((l) => (
          <Pressable
            key={l}
            onPress={() => setLevel(l)}
            style={[styles.levelButton, level === l && styles.levelButtonSelected]}
          >
            <Text style={[styles.levelButtonText, level === l && styles.levelButtonTextSelected]}>{l}</Text>
          </Pressable>
        ))}
      </View>

      <Button
        label="Valider l'enchère"
        variant="auction"
        disabled={!winnerId || !level}
        onPress={() => onResolve(winnerId, level)}
        style={styles.confirmButton}
      />
      <Button label="Personne ne mise" variant="ghost" onPress={() => onResolve(null, null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  playerList: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  levelButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelButtonSelected: {
    borderColor: colors.auction,
    backgroundColor: colors.surfaceAlt,
  },
  levelButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
  levelButtonTextSelected: {
    color: colors.auction,
  },
  confirmButton: {
    marginTop: 20,
  },
});
