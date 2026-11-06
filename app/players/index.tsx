import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PopCard } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { T } from '@/components/ui/Typography';
import { useProfiles } from '@/context/ProfilesContext';
import { loadHistory } from '@/lib/storage';
import { computePlayerStats } from '@/lib/profileLogic';
import { palette, PLAYER_COLORS } from '@/theme/tokens';
import { FinishedGame } from '@/types/history';

export default function PlayersScreen() {
  const router = useRouter();
  const { profiles, allProfiles, createProfile } = useProfiles();
  const [history, setHistory] = useState<FinishedGame[]>([]);
  const [editor, setEditor] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setHistory);
    }, [])
  );

  const archived = allProfiles.filter((p) => p.archived);
  const open = (id: string) => router.push(`/players/${id}` as never);

  return (
    <Screen
      header={<Header title="Joueurs" onBack={() => router.back()} />}
      gap={12}
      bottom={<Button label="Nouveau joueur" icon="user-plus" size="l" onPress={() => setEditor(true)} />}
    >
      {profiles.length === 0 ? (
        <T variant="body" color={palette.inkSoft} center style={{ marginVertical: 48 }}>
          Aucun joueur pour le moment. Crée le premier !
        </T>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {profiles.map((p) => {
            const s = computePlayerStats(history, p.id);
            return (
              <Pressable key={p.id} onPress={() => open(p.id)} style={{ width: '47.5%' }} accessibilityRole="button" accessibilityLabel={`Profil de ${p.name}`}>
                <PopCard style={{ alignItems: 'center', gap: 6, paddingVertical: 14 }}>
                  <Avatar name={p.name} color={p.color} profileId={p.id} size={72} />
                  <T variant="heading" numberOfLines={1}>
                    {p.name}
                  </T>
                  <T variant="caption" color={palette.inkSoft} numeric>
                    {s.games} partie{s.games > 1 ? 's' : ''} · {s.wins} victoire{s.wins > 1 ? 's' : ''}
                  </T>
                </PopCard>
              </Pressable>
            );
          })}
        </View>
      )}

      {archived.length > 0 && (
        <>
          <SectionTitle>Archivés</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {archived.map((p) => (
              <Pressable key={p.id} onPress={() => open(p.id)} style={{ alignItems: 'center', gap: 4, opacity: 0.6, width: 76 }}>
                <Avatar name={p.name} color={p.color} profileId={p.id} size={52} />
                <T variant="caption" numberOfLines={1}>
                  {p.name}
                </T>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <ProfileEditor
        visible={editor}
        title="Nouveau joueur"
        submitLabel="Créer le joueur"
        defaultColor={PLAYER_COLORS[profiles.length % PLAYER_COLORS.length]}
        onClose={() => setEditor(false)}
        onSubmit={async (d) => {
          await createProfile({ name: d.name, color: d.color, photoSourceUri: d.photoSourceUri });
          setEditor(false);
        }}
      />
    </Screen>
  );
}
