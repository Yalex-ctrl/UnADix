import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ScreenBody } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { T } from '@/components/ui/Typography';
import { allInTargetsFor, validAllInChallengers } from '@/lib/gameReducer';
import { palette } from '@/theme/tokens';
import { Player } from '@/types';

type AllInSetupProps = {
  players: Player[];
  onStart: (challengerId: string, targetId: string) => void;
  onCancel: () => void;
};

export function AllInSetup({ players, onStart, onCancel }: AllInSetupProps) {
  const [challengerId, setChallengerId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  // Seuls les challengers pour lesquels un duel est possible sont proposés.
  const challengers = validAllInChallengers(players);
  const challenger = players.find((p) => p.id === challengerId);
  const targets = challengerId ? allInTargetsFor(players, challengerId) : [];
  const target = targets.find((p) => p.id === targetId);

  return (
    <ScreenBody
      bottom={
        <>
          <Button
            label="Lancer le duel"
            icon="zap"
            size="l"
            disabled={!challenger || !target || !accepted}
            onPress={() => challenger && target && onStart(challenger.id, target.id)}
          />
          <Button label="Retour" variant="ghost" onPress={onCancel} />
        </>
      }
    >
      <View style={{ gap: 4 }}>
        <T variant="caption" color={palette.gold} style={{ letterSpacing: 1 }}>
          DUEL ALL-IN
        </T>
        <T variant="title">Tout ou rien</T>
        <T variant="body" color={palette.textMuted}>
          Le challenger mise tous ses points. Le joueur défié doit en avoir au moins autant. Même question pour les deux :
          le gagnant ramasse la mise. Pas de joker, pas de vol.
        </T>
      </View>

      <SectionTitle>Qui lance le défi ?</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {challengers.map((p) => (
          <Chip
            key={p.id}
            label={`${p.name} · ${p.score}`}
            color={p.color}
            selected={challengerId === p.id}
            onPress={() => {
              setChallengerId(p.id);
              setTargetId(null);
              setAccepted(false);
            }}
          />
        ))}
      </View>

      {challenger && (
        <>
          <SectionTitle>Qui est défié ?</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {targets.map((p) => (
              <Chip
                key={p.id}
                label={`${p.name} · ${p.score}`}
                color={p.color}
                selected={targetId === p.id}
                onPress={() => {
                  setTargetId(p.id);
                  setAccepted(false);
                }}
              />
            ))}
          </View>
        </>
      )}

      {challenger && target && (
        <>
          <Card tone="gold" borderColor={palette.gold} style={{ alignItems: 'center' }}>
            <T variant="caption" color={palette.gold}>
              MISE
            </T>
            <T variant="display" color={palette.gold} numeric>
              {challenger.score} pts
            </T>
          </Card>
          <SwitchRow
            title="Les deux joueurs acceptent"
            description={`${challenger.name} et ${target.name} confirment le duel.`}
            value={accepted}
            onValueChange={setAccepted}
          />
        </>
      )}
    </ScreenBody>
  );
}
