import { View } from 'react-native';
import { LevelGrid } from '@/components/ui/LevelGrid';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type LevelSelectProps = {
  player: { name: string; color: string };
  // Niveau -> joueur qui l'a pris dans cette manche.
  takenBy: Record<number, { name: string; color: string }>;
  onChoose: (level: number) => void;
};

export function LevelSelect({ player, takenBy, onChoose }: LevelSelectProps) {
  return (
    <ScreenBody gap={24}>
      <View style={{ gap: 4, alignItems: 'center' }}>
        <T variant="caption" color={palette.textMuted} style={{ letterSpacing: 1 }}>
          CHOIX DU NIVEAU
        </T>
        <T variant="title" center color={player.color}>
          À toi, {player.name}
        </T>
        <T variant="body" color={palette.textMuted} center>
          Quel niveau choisis-tu ?
        </T>
      </View>
      <LevelGrid takenBy={takenBy} onChoose={onChoose} />
    </ScreenBody>
  );
}
