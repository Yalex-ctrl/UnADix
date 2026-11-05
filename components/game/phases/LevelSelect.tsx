import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, levelColor } from '@/constants/theme';
import { gameStyles } from '../gameStyles';

type LevelSelectProps = {
  playerName: string;
  takenLevels: number[];
  onChoose: (level: number) => void;
};

export function LevelSelect({ playerName, takenLevels, onChoose }: LevelSelectProps) {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <View style={gameStyles.centerContent}>
      <Text style={gameStyles.prompt}>À toi de choisir, {playerName}.</Text>
      <Text style={gameStyles.promptSub}>Quel niveau veux-tu ?</Text>
      <View style={styles.grid}>
        {levels.map((level) => {
          const taken = takenLevels.includes(level);
          return (
            <Pressable
              key={level}
              disabled={taken}
              style={[styles.button, { borderColor: levelColor(level) }, taken && styles.taken]}
              onPress={() => onChoose(level)}
            >
              <Text style={[styles.buttonText, taken && styles.buttonTextTaken]}>{level}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  taken: {
    opacity: 0.25,
  },
  buttonText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  buttonTextTaken: {
    color: colors.textMuted,
  },
});
