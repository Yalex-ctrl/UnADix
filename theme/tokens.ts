// Design tokens — direction « Studio Pop » : crème lumineuse, contours encre,
// couleurs vives à usage réservé. Voir docs/decisions.md pour les choix.
export const palette = {
  // Fonds
  bg: '#FFF8EE',
  bgDeep: '#FFEFD6',
  surface: '#FFFFFF',
  surfaceAlt: '#FFEFD6',
  // Encre : texte et contours
  ink: '#1B1530',
  inkSoft: '#5E5873',
  inkFaint: '#A9A3B8',
  line: '#1B1530',
  border: '#E9DFCB',
  text: '#1B1530',
  textMuted: '#5E5873',
  textFaint: '#8E88A0',

  // Marque
  brand: '#6C3BFF',
  brandDeep: '#4B22D1',
  brandSoft: '#EEE7FF',
  primary: '#6C3BFF',
  primarySoft: '#EEE7FF',
  onPrimary: '#FFFFFF',

  // Sens (réservés à leur usage)
  good: '#22C55E',
  goodDeep: '#15803D',
  goodSoft: '#E6F9EE',
  bad: '#FF4D5E',
  badDeep: '#C81E33',
  badSoft: '#FFE8EA',
  gold: '#FFC233',
  goldDeep: '#D99A00',
  goldSoft: '#FFF4D1',
  steal: '#00B3FF',
  stealDeep: '#0084C2',
  stealSoft: '#DDF3FF',

  // Alias conservés pour les écrans existants et le multi-téléphones.
  success: '#15803D', // texte « juste » lisible sur fond clair
  successSoft: '#E6F9EE',
  danger: '#C81E33', // texte « faux » lisible sur fond clair
  dangerSoft: '#FFE8EA',
} as const;

// Du facile/frais au difficile/chaud.
export const LEVEL_COLORS = [
  '#3DDC97',
  '#22C55E',
  '#84CC16',
  '#C3D500',
  '#FFC233',
  '#FF9F1C',
  '#FF7A3D',
  '#FF4D5E',
  '#E5246F',
  '#9B1BFF',
];

// Texte lisible sur chaque couleur de niveau (contraste AA).
export const levelInk = (level: number) => (level >= 8 ? '#FFFFFF' : palette.ink);

export const PLAYER_COLORS = [
  '#6C3BFF',
  '#00B3FF',
  '#22C55E',
  '#FFC233',
  '#FF4D5E',
  '#FF5FC8',
  '#FF9F1C',
  '#14C8B8',
  '#9B1BFF',
  '#3D5AFE',
];

// Grille de 4.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 } as const;

export const radius = { button: 14, card: 24, chip: 999 } as const;

export const OUTLINE = 2; // épaisseur des contours « pop »
export const POP_OFFSET = 4; // décalage des ombres pleines

export const fonts = {
  regular: 'Nunito_600SemiBold',
  semibold: 'Nunito_700Bold',
  bold: 'Nunito_800ExtraBold',
  extrabold: 'BricolageGrotesque_800ExtraBold',
  display: 'BricolageGrotesque_800ExtraBold',
} as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 56, lineHeight: 60 },
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#1B1530',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

export const motion = { ui: 200, scene: 900 } as const;

export const tabular = { fontVariant: ['tabular-nums' as const] };

// Couleur d'un niveau (1 à 10).
export const levelColor = (level: number) => LEVEL_COLORS[Math.min(Math.max(level, 1), 10) - 1];
