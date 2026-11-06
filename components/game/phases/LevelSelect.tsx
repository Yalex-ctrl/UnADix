import { View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { LevelWall } from '@/components/ui/LevelGrid';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette } from '@/theme/tokens';

type Person = { name: string; color: string; profileId?: string };

type LevelSelectProps = {
  player: Person;
  // Niveau -> joueur qui l'a pris dans cette manche.
  takenBy: Record<number, Person>;
  onChoose: (level: number) => void;
};

export function LevelSelect({ player, takenBy, onChoose }: LevelSelectProps) {
  return (
    <ScreenBody gap={24}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar name={player.name} color={player.color} profileId={player.profileId} size={84} ring />
        <T variant="title" center>
          À toi, {player.name} !
        </T>
        <T variant="body" color={palette.inkSoft} center>
          Quel niveau choisis-tu ?
        </T>
      </View>
      <LevelWall takenBy={takenBy} onChoose={onChoose} />
    </ScreenBody>
  );
}
