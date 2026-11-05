// Design tokens — thème clair. Chaque couleur a un sens :
// primary = action principale, success/danger = juste/faux, gold = points et
// récompenses, couleur du joueur = identification. Rien d'autre n'est coloré.
export const palette = {
  bg: '#F7F6F3',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEDE8',
  border: '#E4E1DA',
  text: '#1A1A1F',
  textMuted: '#6B6A70',
  textFaint: '#A3A1A8',

  primary: '#4F46E5',
  primarySoft: '#EEF0FF',
  onPrimary: '#FFFFFF',

  success: '#16A34A',
  successSoft: '#E8F7EE',
  danger: '#DC2626',
  dangerSoft: '#FDECEC',
  gold: '#C8930A',
  goldSoft: '#FFF6DC',
} as const;

export const PLAYER_COLORS = [
  '#4F46E5',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
  '#64748B',
];

// Grille de 4.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 } as const;

export const radius = { button: 12, card: 20, chip: 999 } as const;

export const fonts = {
  regular: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const type = {
  display: { fontFamily: fonts.extrabold, fontSize: 40, lineHeight: 46 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 28 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#1A1A1F',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

export const tabular = { fontVariant: ['tabular-nums' as const] };

// Couleur du liseré de niveau : vert (facile) → rouge (difficile).
export const levelColor = (level: number) => {
  if (level <= 3) return palette.success;
  if (level <= 6) return palette.gold;
  return palette.danger;
};
