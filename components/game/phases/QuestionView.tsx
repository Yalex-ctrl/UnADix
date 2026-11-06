import { useState } from 'react';
import { View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type Person = { id: string; name: string; color: string; profileId?: string };

type QuestionViewProps = {
  categoryName: string;
  level: number;
  player: { name: string; color: string; profileId?: string };
  questionText: string;
  braquage?: { braqueurName: string; victimName: string } | null;
  isAuction: boolean;
  eligibleBraqueurs: Person[];
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
          <Button label="Voir la réponse" size="xl" onPress={onReveal} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            {!braquage && !isAuction && onJoker && (
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
        </>
      }
    >
      <QuestionCard
        player={player}
        level={level}
        categoryName={categoryName}
        text={questionText}
        banner={braquage ? `${braquage.braqueurName} braque ${braquage.victimName}` : undefined}
      />

      <BottomSheet
        visible={sheet}
        title={`Qui braque ${player.name} ?`}
        subtitle="Le braqueur répond à sa place. Un seul braquage par joueur."
        onClose={() => setSheet(false)}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {eligibleBraqueurs.map((p) => (
            <View key={p.id} style={{ alignItems: 'center', gap: 4 }}>
              <Button
                label={p.name}
                variant="bad"
                onPress={() => {
                  setSheet(false);
                  onBraquage(p.id);
                }}
              />
              <Avatar name={p.name} color={p.color} profileId={p.profileId} size={36} />
            </View>
          ))}
        </View>
        <T variant="caption" color={palette.inkSoft} center>
          Touche un joueur pour lancer le braquage.
        </T>
        <Button label="Retour" variant="ghost" onPress={() => setSheet(false)} />
      </BottomSheet>
    </ScreenBody>
  );
}
