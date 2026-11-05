import { useState } from 'react';
import { View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type QuestionViewProps = {
  categoryName: string;
  level: number;
  player: { name: string; color: string };
  questionText: string;
  braquage?: { braqueurName: string; victimName: string } | null;
  isAuction: boolean;
  eligibleBraqueurs: { id: string; name: string; color: string }[];
  jokerAvailable?: boolean;
  onJoker?: () => void;
  onReport?: () => void;
  onReveal: () => void;
  onBraquage: (braqueurId: string) => void;
};

export function QuestionView({
  categoryName,
  level,
  player,
  questionText,
  braquage,
  isAuction,
  eligibleBraqueurs,
  jokerAvailable,
  onJoker,
  onReport,
  onReveal,
  onBraquage,
}: QuestionViewProps) {
  const [sheet, setSheet] = useState(false);
  const canBraquer = !braquage && !isAuction && eligibleBraqueurs.length > 0;

  return (
    <ScreenBody
      center
      gap={20}
      bottom={
        <>
          <Button label="Voir la réponse" size="l" onPress={onReveal} />
          {!braquage && !isAuction && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              {onJoker && (
                <Button
                  label={jokerAvailable ? 'Joker' : 'Joker utilisé'}
                  icon="refresh-cw"
                  variant="ghost"
                  disabled={!jokerAvailable}
                  onPress={onJoker}
                />
              )}
              {canBraquer && <Button label="Braquage" icon="crosshair" variant="ghost" onPress={() => setSheet(true)} />}
              {onReport && <Button label="Signaler" icon="flag" variant="ghost" onPress={onReport} />}
            </View>
          )}
          {isAuction && onReport && (
            <Button label="Signaler" icon="flag" variant="ghost" onPress={onReport} />
          )}
        </>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        <T variant="caption" color={palette.textMuted}>
          {categoryName} · Niveau {level}
        </T>
        <Badge label={`${level} pts`} color={palette.goldSoft} textColor={palette.gold} />
      </View>

      {braquage ? (
        <View style={{ alignItems: 'center' }}>
          <Badge label={`${braquage.braqueurName} braque ${braquage.victimName}`} color={palette.dangerSoft} textColor={palette.danger} />
        </View>
      ) : (
        <T variant="heading" center color={player.color}>
          Au tour de {player.name}
        </T>
      )}

      <T variant="title" center style={{ paddingVertical: 8 }}>
        {questionText}
      </T>

      <BottomSheet
        visible={sheet}
        title={`Qui braque ${player.name} ?`}
        subtitle="Le braqueur répond à sa place. Un seul braquage par joueur."
        onClose={() => setSheet(false)}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {eligibleBraqueurs.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              color={p.color}
              onPress={() => {
                setSheet(false);
                onBraquage(p.id);
              }}
            />
          ))}
        </View>
        <Button label="Retour" variant="ghost" onPress={() => setSheet(false)} />
      </BottomSheet>
    </ScreenBody>
  );
}
