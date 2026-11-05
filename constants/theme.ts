export const colors = {
  background: '#0A0B14',
  backgroundElevated: '#12131F',
  surface: '#171827',
  surfaceAlt: '#20223A',
  border: '#2C2E4A',
  text: '#F4F5FF',
  textMuted: '#9295B8',

  // General CTA
  primary: '#8B5CF6',
  primaryDark: '#6D28D9',
  accent: '#FFD23D',

  // Voleur du tour
  voleur: '#22D3EE',
  voleurDark: '#0E7490',

  // Braqueur / interruption
  braquage: '#FF3D5A',
  braquageAlt: '#FF7A3D',

  // Round Enchères
  auction: '#FFD23D',
  auctionDark: '#B8860B',

  joker: '#F472B6',

  success: '#39FF88',
  danger: '#FF5C7A',
  warning: '#FFC13D',
};

export const levelColor = (level: number) => {
  if (level <= 3) return colors.success;
  if (level <= 6) return colors.warning;
  return colors.danger;
};

export const PLAYER_COLORS = ['#8B5CF6', '#22D3EE', '#FF7A3D', '#39FF88', '#F472B6', '#FFD23D', '#60A5FA', '#FB7185', '#A3E635', '#C084FC'];
