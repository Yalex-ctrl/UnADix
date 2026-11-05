import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type ThiefOfferProps = {
  victimName: string;
  level: number;
  candidates: { id: string; name: string; color: string }[];
  onStart: (candidateIds: string[]) => void;
};

export function ThiefOffer({ victimName, level, candidates, onStart }: ThiefOfferProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <ScreenBody
      center
      bottom={
        <>
          <Button
            label={selected.length > 0 ? `Tenter le vol (${selected.length})` : 'Tenter le vol'}
            icon="unlock"
            size="l"
            disabled={selected.length === 0}
            onPress={() => onStart(selected)}
          />
          <Button label="Personne ne tente" variant="ghost" onPress={() => onStart([])} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        <T variant="caption" color={palette.danger} style={{ letterSpacing: 1 }}>
          MAUVAISE RÉPONSE
        </T>
        <T variant="title" center>
          Qui veut voler les points de {victimName} ?
        </T>
        <T variant="body" color={palette.textMuted} center>
          La réponse n’est pas révélée avant la fin des tentatives.
        </T>
      </View>
      <Card tone="soft" style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}>
          <T variant="caption" color={palette.textMuted}>
            Réussite
          </T>
          <T variant="heading" color={palette.success} numeric>
            +{level} pts
          </T>
        </View>
        <View style={{ alignItems: 'center' }}>
          <T variant="caption" color={palette.textMuted}>
            Échec
          </T>
          <T variant="heading" color={palette.danger} numeric>
            −2 pts
          </T>
        </View>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {candidates.map((c) => (
          <Chip key={c.id} label={c.name} color={c.color} selected={selected.includes(c.id)} onPress={() => toggle(c.id)} />
        ))}
      </View>
    </ScreenBody>
  );
}
