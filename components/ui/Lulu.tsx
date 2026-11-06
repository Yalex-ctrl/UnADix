import { ReactElement } from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { palette } from '@/theme/tokens';

export type LuluMood = 'neutral' | 'hype' | 'shocked' | 'smug';

// « Lulu », micro rétro original : tête-grille dorée, deux yeux, des sourcils
// expressifs. Quatre humeurs, formes simples et très lisibles.
export function Lulu({ mood = 'neutral', size = 72 }: { mood?: LuluMood; size?: number }) {
  const ink = palette.ink;
  const brows: Record<LuluMood, string[]> = {
    neutral: ['M24 30 L36 30', 'M52 30 L64 30'],
    hype: ['M23 27 Q30 21 37 27', 'M51 27 Q58 21 65 27'],
    shocked: ['M23 24 Q30 18 37 26', 'M51 26 Q58 18 65 24'],
    smug: ['M23 32 L37 27', 'M51 30 L65 30'],
  };
  const mouth: Record<LuluMood, ReactElement> = {
    neutral: <Path d="M36 56 Q44 60 52 56" stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none" />,
    hype: <Path d="M32 52 Q44 70 56 52 Z" stroke={ink} strokeWidth={3} strokeLinejoin="round" fill={palette.bad} />,
    shocked: <Circle cx={44} cy={58} r={6} fill={ink} />,
    smug: <Path d="M34 56 Q46 62 56 52" stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none" />,
  };
  const pupilY = mood === 'smug' ? 40 : 38;
  const eyeR = mood === 'shocked' ? 7 : 6;

  return (
    <Svg width={size} height={size * 1.35} viewBox="0 0 88 120" accessibilityLabel="Lulu, le présentateur">
      {/* manche */}
      <Rect x={36} y={78} width={16} height={34} rx={7} fill={palette.brand} stroke={ink} strokeWidth={3} />
      <Rect x={32} y={74} width={24} height={9} rx={4} fill={palette.brandDeep} stroke={ink} strokeWidth={3} />
      {/* tête-grille */}
      <Circle cx={44} cy={42} r={36} fill={palette.gold} stroke={ink} strokeWidth={3} />
      <G stroke={ink} strokeOpacity={0.18} strokeWidth={2}>
        <Line x1={14} y1={28} x2={74} y2={28} />
        <Line x1={10} y1={48} x2={78} y2={48} />
        <Line x1={16} y1={66} x2={72} y2={66} />
      </G>
      {/* yeux */}
      <Circle cx={31} cy={40} r={9} fill={palette.white} stroke={ink} strokeWidth={2.5} />
      <Circle cx={57} cy={40} r={9} fill={palette.white} stroke={ink} strokeWidth={2.5} />
      <Circle cx={31} cy={pupilY} r={eyeR - 2} fill={ink} />
      <Circle cx={57} cy={pupilY} r={eyeR - 2} fill={ink} />
      {brows[mood].map((d) => (
        <Path key={d} d={d} stroke={ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      ))}
      {mouth[mood]}
    </Svg>
  );
}
