// Couche de compatibilité : conserve les anciens noms de couleurs (utilisés
// notamment par le mode multi-téléphones) en les faisant pointer vers les
// nouveaux jetons du design system dans theme/tokens.ts.
import { palette, PLAYER_COLORS, levelColor } from '@/theme/tokens';

export const colors = {
  background: palette.bg,
  backgroundElevated: palette.surface,
  surface: palette.surface,
  surfaceAlt: palette.surfaceAlt,
  border: palette.border,
  text: palette.text,
  textMuted: palette.textMuted,

  primary: palette.primary,
  primaryDark: palette.primary,
  accent: palette.gold,

  voleur: palette.primary,
  voleurDark: palette.primary,

  braquage: palette.danger,
  braquageAlt: palette.danger,

  auction: palette.gold,
  auctionDark: palette.gold,

  joker: palette.primary,

  success: palette.success,
  danger: palette.danger,
  warning: palette.gold,
};

export { PLAYER_COLORS, levelColor };
