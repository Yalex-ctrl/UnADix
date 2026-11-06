import { useState } from 'react';
import { View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SoftCard } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Pill } from '@/components/ui/Pill';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type Person = { id: string; name: string; color: string; profileId?: string };

type ThiefOfferProps = {
  victim: Person | undefined;
  level: number;
  candidates: Person[];
  onStart: (candidateIds: string[]) => void;
};

// Ambiance « vol » (bleu) : qui veut voler les points de la victime ?
export function ThiefOffer({ victim, level, candidates, onStart }: ThiefOfferProps) {
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
            variant="steal"
            size="xl"
            disabled={selected.length === 0}
            onPress={() => onStart(selected)}
          />
          <Button label="Personne ne tente" variant="ghost" onPress={() => onStart([])} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 10 }}>
        <Pill label="Mauvaise réponse" color={palette.badSoft} ink={palette.danger} />
        {victim && <Avatar name={victim.name} color={victim.color} profileId={victim.profileId} size={72} />}
        <T variant="title" center>
          Qui veut voler les points de {victim?.name} ?
        </T>
        <T variant="body" color={palette.inkSoft} center>
          La réponse n’est pas révélée avant la fin des tentatives.
        </T>
      </View>
      <SoftCard tone="soft" style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}>
          <T variant="caption" color={palette.inkSoft}>
            Réussite
          </T>
          <T variant="title" color={palette.success} numeric>
            +{level} pts
          </T>
        </View>
        <View style={{ alignItems: 'center' }}>
          <T variant="caption" color={palette.inkSoft}>
            Échec
          </T>
          <T variant="title" color={palette.danger} numeric>
            −2 pts
          </T>
        </View>
      </SoftCard>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {candidates.map((c) => (
          <Chip key={c.id} label={c.name} color={palette.stealDeep} selected={selected.includes(c.id)} onPress={() => toggle(c.id)} />
        ))}
      </View>
    </ScreenBody>
  );
}
