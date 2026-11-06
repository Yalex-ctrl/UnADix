// Identifiant de profil : 20 caractères base62, aléatoire cryptographique,
// JAMAIS affiché dans l'interface ni dans les exports lisibles.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 20;
// 248 = 62 × 4 : on rejette les octets >= 248 pour qu'aucun caractère ne soit
// favorisé (un simple `% 62` sur 256 valeurs serait biaisé).
const LIMIT = 248;

export type RandomBytes = (count: number) => Uint8Array;

export function generatePlayerId(randomBytes: RandomBytes, existing?: ReadonlySet<string>): string {
  for (;;) {
    let id = '';
    while (id.length < ID_LENGTH) {
      const bytes = randomBytes(ID_LENGTH * 2);
      for (let i = 0; i < bytes.length && id.length < ID_LENGTH; i++) {
        if (bytes[i] < LIMIT) id += ALPHABET[bytes[i] % ALPHABET.length];
      }
    }
    if (!existing || !existing.has(id)) return id;
  }
}

export const PLAYER_ID_PATTERN = /^[A-Za-z0-9]{20}$/;
