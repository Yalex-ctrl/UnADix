import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { bootstrapProfiles, deleteProfilePhoto, newPlayerId, saveProfiles, storeProfilePhoto } from '@/lib/profileStore';
import { PLAYER_COLORS } from '@/theme/tokens';
import { PlayerProfile } from '@/types/profile';

type NewProfile = { name: string; color?: string; photoSourceUri?: string; avatarEmoji?: string };
type ProfilePatch = Partial<Pick<PlayerProfile, 'name' | 'color' | 'avatarEmoji'>> & {
  photoSourceUri?: string; // nouvelle photo à enregistrer
  removePhoto?: boolean;
};

type ProfilesContextValue = {
  ready: boolean;
  profiles: PlayerProfile[]; // hors profils archivés
  allProfiles: PlayerProfile[];
  getProfile: (id?: string) => PlayerProfile | undefined;
  createProfile: (input: NewProfile) => Promise<PlayerProfile>;
  updateProfile: (id: string, patch: ProfilePatch) => Promise<void>;
  archiveProfile: (id: string, archived?: boolean) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  touchPlayed: (ids: string[]) => Promise<void>;
};

const Ctx = createContext<ProfilesContextValue | null>(null);

export function ProfilesProvider({ children }: { children: React.ReactNode }) {
  const [all, setAll] = useState<PlayerProfile[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bootstrapProfiles().then((list) => {
      setAll(list);
      setReady(true);
    });
  }, []);

  const commit = useCallback(async (next: PlayerProfile[]) => {
    setAll(next);
    await saveProfiles(next);
  }, []);

  const createProfile = useCallback(
    async (input: NewProfile) => {
      const id = newPlayerId(new Set(all.map((p) => p.id)));
      const photoUri = input.photoSourceUri ? await storeProfilePhoto(id, input.photoSourceUri).catch(() => undefined) : undefined;
      const profile: PlayerProfile = {
        id,
        name: input.name.trim(),
        color: input.color ?? PLAYER_COLORS[all.length % PLAYER_COLORS.length],
        photoUri,
        avatarEmoji: input.avatarEmoji,
        createdAt: Date.now(),
      };
      await commit([...all, profile]);
      return profile;
    },
    [all, commit]
  );

  const updateProfile = useCallback(
    async (id: string, patch: ProfilePatch) => {
      const current = all.find((p) => p.id === id);
      if (!current) return;
      let photoUri = current.photoUri;
      if (patch.photoSourceUri) {
        const stored = await storeProfilePhoto(id, patch.photoSourceUri).catch(() => undefined);
        if (stored) {
          deleteProfilePhoto(current.photoUri);
          photoUri = stored;
        }
      } else if (patch.removePhoto) {
        deleteProfilePhoto(current.photoUri);
        photoUri = undefined;
      }
      const { photoSourceUri: _a, removePhoto: _b, ...rest } = patch;
      await commit(all.map((p) => (p.id === id ? { ...p, ...rest, name: rest.name?.trim() || p.name, photoUri } : p)));
    },
    [all, commit]
  );

  const archiveProfile = useCallback(
    (id: string, archived = true) => commit(all.map((p) => (p.id === id ? { ...p, archived } : p))),
    [all, commit]
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      deleteProfilePhoto(all.find((p) => p.id === id)?.photoUri);
      await commit(all.filter((p) => p.id !== id));
    },
    [all, commit]
  );

  const touchPlayed = useCallback(
    (ids: string[]) => commit(all.map((p) => (ids.includes(p.id) ? { ...p, lastPlayedAt: Date.now() } : p))),
    [all, commit]
  );

  const getProfile = useCallback((id?: string) => (id ? all.find((p) => p.id === id) : undefined), [all]);

  const value = useMemo<ProfilesContextValue>(
    () => ({
      ready,
      profiles: all.filter((p) => !p.archived),
      allProfiles: all,
      getProfile,
      createProfile,
      updateProfile,
      archiveProfile,
      deleteProfile,
      touchPlayed,
    }),
    [ready, all, getProfile, createProfile, updateProfile, archiveProfile, deleteProfile, touchPlayed]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfiles() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProfiles must be used within a ProfilesProvider');
  return ctx;
}
