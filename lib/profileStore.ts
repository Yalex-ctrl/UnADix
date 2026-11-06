import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomBytes } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { generatePlayerId } from '@/lib/playerId';
import { migrateLegacy } from '@/lib/profileLogic';
import { PlayerProfile } from '@/types/profile';
import { FinishedGame } from '@/types/history';

const PROFILES_KEY = 'players:v1';
const HISTORY_KEY = 'unadix:history';
const SAVED_GAME_KEY = 'unadix:savedGame';

export const newPlayerId = (existing?: ReadonlySet<string>) => generatePlayerId(getRandomBytes, existing);

export async function loadProfiles(): Promise<PlayerProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(PROFILES_KEY);
    return raw ? (JSON.parse(raw) as PlayerProfile[]) : [];
  } catch {
    return [];
  }
}

export async function saveProfiles(profiles: PlayerProfile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {}
}

// --- Photo ------------------------------------------------------------------

const avatarsDir = () => new Directory(Paths.document, 'avatars');

// Redimensionne à 512×512, compresse en JPEG 0,8 et COPIE le fichier dans le
// dossier de l'appli (l'URI temporaire du sélecteur n'est jamais conservée).
export async function storeProfilePhoto(profileId: string, sourceUri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 512, height: 512 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  const dir = avatarsDir();
  dir.create({ idempotent: true });
  // Nom unique par photo : change d'URI à chaque remplacement (cache d'image).
  const dest = new File(dir, `${profileId}-${Date.now()}.jpg`);
  new File(result.uri).copy(dest);
  return dest.uri;
}

export function deleteProfilePhoto(uri?: string) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {}
}

// --- Migration de l'existant (idempotente) ----------------------------------

let bootstrap: Promise<PlayerProfile[]> | null = null;

// Crée un profil par prénom trouvé dans l'historique et la partie en cours,
// réécrit les deux avec les ids. À attendre avant de lire l'un ou l'autre.
export function bootstrapProfiles(): Promise<PlayerProfile[]> {
  if (!bootstrap) {
    bootstrap = (async () => {
      const profiles = await loadProfiles();
      let history: FinishedGame[] = [];
      let savedEnvelope: { v?: number; state?: { players?: { name: string; profileId?: string; color?: string }[] } } | null = null;
      let savedIsRaw = false;
      try {
        const rawHistory = await AsyncStorage.getItem(HISTORY_KEY);
        history = rawHistory ? JSON.parse(rawHistory) : [];
        const rawSaved = await AsyncStorage.getItem(SAVED_GAME_KEY);
        if (rawSaved) {
          const parsed = JSON.parse(rawSaved);
          if (parsed && typeof parsed === 'object' && 'state' in parsed) savedEnvelope = parsed;
          else {
            savedEnvelope = { state: parsed };
            savedIsRaw = true;
          }
        }
      } catch {
        return profiles;
      }
      const savedPlayers = savedEnvelope?.state?.players ?? null;
      const result = migrateLegacy({ profiles, history, savedPlayers }, (existing) => newPlayerId(existing));
      if (result.changed) {
        await saveProfiles(result.profiles);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(result.history));
        if (savedEnvelope && result.savedPlayers && savedEnvelope.state) {
          savedEnvelope.state.players = result.savedPlayers;
          await AsyncStorage.setItem(SAVED_GAME_KEY, JSON.stringify(savedIsRaw ? savedEnvelope.state : savedEnvelope));
        }
      }
      return result.profiles;
    })();
  }
  return bootstrap;
}
