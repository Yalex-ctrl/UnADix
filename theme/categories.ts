import { LEVEL_COLORS, PLAYER_COLORS } from '@/theme/tokens';

// Chaque catégorie reçoit une icône et une couleur stables (déduites de son id)
// pour que les thèmes se reconnaissent d'une manche à l'autre. Les catégories
// ajoutées plus tard sont couvertes sans toucher à ce fichier.
const ICONS = [
  'star', 'zap', 'globe', 'music', 'film', 'book', 'coffee', 'compass', 'cpu', 'feather',
  'heart', 'key', 'map', 'moon', 'sun', 'umbrella', 'anchor', 'award', 'camera', 'gift',
  'headphones', 'flag', 'scissors', 'shield', 'target', 'truck', 'tv', 'watch',
] as const;

export type CategoryIcon = (typeof ICONS)[number];

const COLORS = [PLAYER_COLORS[0], PLAYER_COLORS[1], PLAYER_COLORS[2], PLAYER_COLORS[3], PLAYER_COLORS[4], PLAYER_COLORS[5], PLAYER_COLORS[6], PLAYER_COLORS[7], LEVEL_COLORS[5], LEVEL_COLORS[8]];

function hash(id: string) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) >>> 0;
  return h;
}

export function categoryStyle(id: string): { icon: CategoryIcon; color: string } {
  const h = hash(id);
  return { icon: ICONS[h % ICONS.length], color: COLORS[(h >>> 5) % COLORS.length] };
}
