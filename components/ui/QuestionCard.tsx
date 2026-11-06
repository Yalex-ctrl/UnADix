import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { Avatar } from './Avatar';
import { PopCard } from './Card';
import { T } from './Typography';
import { fonts, levelColor, levelInk, OUTLINE, palette, space } from '@/theme/tokens';

type QuestionCardProps = {
  player: { name: string; color: string; profileId?: string };
  level: number;
  categoryName: string;
  text: string;
  banner?: string; // ex. « Dédé braque Tom »
};

// Taille adaptative : la question reste lisible à 1 m, même quand elle est longue.
export function questionFontSize(text: string): { fontSize: number; lineHeight: number } {
  const n = text.length;
  const fontSize = n <= 60 ? 30 : n <= 110 ? 26 : n <= 170 ? 23 : 20;
  return { fontSize, lineHeight: Math.round(fontSize * 1.25) };
}

// « Sous les projecteurs » : halo derrière la carte, photo et couleur du joueur
// en haut, niveau en gros chiffre dans une pastille colorée.
export function QuestionCard({ player, level, categoryName, text, banner }: QuestionCardProps) {
  const reduced = useReducedMotion();
  const size = questionFontSize(text);
  return (
    <View>
      <View pointerEvents="none" style={styles.spot}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="spot" cx="50%" cy="45%" r="60%">
              <Stop offset="0%" stopColor={palette.goldSoft} stopOpacity={1} />
              <Stop offset="100%" stopColor={palette.bg} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#spot)" />
        </Svg>
      </View>
      <Animated.View entering={reduced ? undefined : FadeInDown.springify().damping(14)}>
        <PopCard style={styles.card}>
          <View style={styles.top}>
            <Avatar name={player.name} color={player.color} profileId={player.profileId} size={44} />
            <View style={{ flex: 1 }}>
              <T variant="caption" color={palette.inkSoft} numberOfLines={1}>
                {categoryName}
              </T>
              <T variant="heading" color={palette.ink} numberOfLines={1}>
                {banner ?? `Au tour de ${player.name}`}
              </T>
            </View>
            <View style={[styles.level, { backgroundColor: levelColor(level) }]}>
              <T variant="display" numeric color={levelInk(level)} style={{ fontSize: 30, lineHeight: 34 }}>
                {level}
              </T>
              <T variant="caption" color={levelInk(level)} style={{ fontSize: 11, lineHeight: 12 }}>
                {level} pts
              </T>
            </View>
          </View>
          <T variant="title" center style={[{ fontFamily: fonts.bold }, size, styles.question]}>
            {text}
          </T>
        </PopCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  spot: { position: 'absolute', top: -40, bottom: -40, left: -24, right: -24 },
  card: { gap: space.lg, paddingVertical: space.lg },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  level: {
    minWidth: 58,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    alignItems: 'center',
  },
  question: { paddingVertical: space.sm },
});
