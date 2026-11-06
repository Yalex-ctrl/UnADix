export type PlayerProfile = {
  id: string; // 20 caractères, aléatoire, JAMAIS affiché
  name: string; // deux profils peuvent avoir le même prénom
  color: string; // une des 10 couleurs joueur
  photoUri?: string; // fichier local copié dans le dossier de l'appli
  avatarEmoji?: string; // repli si pas de photo
  createdAt: number;
  lastPlayedAt?: number;
  archived?: boolean; // suppression « douce » : les stats restent dans l'historique
};
