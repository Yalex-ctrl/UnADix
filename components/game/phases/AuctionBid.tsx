import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { LevelGrid } from '@/components/ui/LevelGrid';
import { ScreenBody } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type AuctionBidProps = {
  categoryName?: string;
  players: { id: string; name: string; score: number; color?: string }[];
  onResolve: (playerId: string | null, level: number | null) => void;
};

export function AuctionBid({ categoryName, players, onResolve }: AuctionBidProps) {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [level, setLevel] = useState<number | null>(null);

  return (
    <ScreenBody
      bottom={
        <>
          <Button
            label="Valider l’enchère"
            size="l"
            disabled={!winnerId || !level}
            onPress={() => onResolve(winnerId, level)}
          />
          <Button label="Personne ne mise" variant="ghost" onPress={() => onResolve(null, null)} />
        </>
      }
    >
      <View style={{ gap: 4 }}>
        <T variant="caption" color={palette.gold} style={{ letterSpacing: 1 }}>
          {categoryName ? `ENCHÈRES · ${categoryName.toUpperCase()}` : 'ENCHÈRES'}
        </T>
        <T variant="title">Qui remporte l’enchère ?</T>
        <T variant="body" color={palette.textMuted}>
          {categoryName ? 'Choisis le gagnant, puis le niveau annoncé.' : 'Il répondra dans son propre thème.'}
        </T>
      </View>

      <SectionTitle>Gagnant</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {players.map((p) => (
          <Chip key={p.id} label={p.name} color={p.color} selected={winnerId === p.id} onPress={() => setWinnerId(p.id)} />
        ))}
      </View>

      <SectionTitle>Niveau annoncé</SectionTitle>
      <LevelGrid selected={level} onChoose={setLevel} />
    </ScreenBody>
  );
}
