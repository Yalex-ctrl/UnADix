import { useCallback, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SoftCard } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { TrophyBadge } from '@/components/ui/TrophyBadge';
import { T } from '@/components/ui/Typography';
import { CATEGORIES } from '@/data/categories';
import { useProfiles } from '@/context/ProfilesContext';
import { computePlayerStats } from '@/lib/profileLogic';
import { loadHistory } from '@/lib/storage';
import { TROPHIES } from '@/lib/trophies';
import { fonts, levelColor, palette } from '@/theme/tokens';
import { FinishedGame } from '@/types/history';

const pct = (v: number | null | undefined) => (v === null || v === undefined ? '–' : `${Math.round(v * 100)} %`);
const themeName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? id;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: '30%', flex: 1, gap: 2 }}>
      <T variant="caption" color={palette.inkSoft}>
        {label}
      </T>
      <T variant="heading" numeric>
        {value}
      </T>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProfile, updateProfile, archiveProfile, deleteProfile } = useProfiles();
  const profile = getProfile(id);
  const [history, setHistory] = useState<FinishedGame[]>([]);
  const [editor, setEditor] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setHistory);
    }, [])
  );

  const stats = useMemo(() => (profile ? computePlayerStats(history, profile.id) : null), [history, profile]);

  if (!profile || !stats) {
    return (
      <Screen header={<Header title="Profil" onBack={() => router.back()} />} center>
        <T variant="body" color={palette.inkSoft} center>
          Ce joueur n’existe plus.
        </T>
      </Screen>
    );
  }

  const confirmDelete = () =>
    Alert.alert(`Supprimer ${profile.name} ?`, 'Le profil et sa photo sont supprimés définitivement. Ses parties restent dans l’historique, sans lien avec un profil.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteProfile(profile.id);
          router.back();
        },
      },
    ]);

  const maxPlayed = Math.max(1, ...stats.rateByLevel.map((l) => l.played));

  return (
    <Screen header={<Header title={profile.name} onBack={() => router.back()} />} gap={12}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar name={profile.name} color={profile.color} profileId={profile.id} size={120} />
        <T variant="title">{profile.name}</T>
        {profile.archived && (
          <T variant="caption" color={palette.inkSoft}>
            Archivé — n’apparaît plus dans les choix
          </T>
        )}
        <Button label="Modifier" icon="edit-2" variant="secondary" onPress={() => setEditor(true)} />
      </View>

      <SectionTitle>Résultats</SectionTitle>
      <SoftCard style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        <Stat label="Parties" value={String(stats.games)} />
        <Stat label="Victoires" value={String(stats.wins)} />
        <Stat label="Taux de victoire" value={stats.games ? pct(stats.winRate) : '–'} />
        <Stat label="Points totaux" value={String(stats.totalPoints)} />
        <Stat label="Meilleur score" value={stats.games ? String(stats.bestScore) : '–'} />
        <Stat label="Niveau moyen" value={stats.avgLevel === null ? '–' : stats.avgLevel.toFixed(1)} />
      </SoftCard>

      <SectionTitle hint="Part de bonnes réponses sur les questions personnelles">Réussite par niveau</SectionTitle>
      <SoftCard>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 4 }}>
          {stats.rateByLevel.map((l) => (
            <View key={l.level} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <T variant="caption" color={palette.inkSoft} numeric style={{ fontSize: 10, lineHeight: 12 }}>
                {l.rate === null ? '' : Math.round(l.rate * 100)}
              </T>
              <View
                style={{
                  width: '80%',
                  height: l.rate === null ? 4 : Math.max(4, l.rate * 80),
                  backgroundColor: l.rate === null ? palette.border : levelColor(l.level),
                  borderWidth: l.rate === null ? 0 : 1.5,
                  borderColor: palette.line,
                  borderRadius: 4,
                  opacity: l.played === 0 ? 1 : 0.55 + 0.45 * (l.played / maxPlayed),
                }}
              />
              <T variant="caption" numeric style={{ fontFamily: fonts.bold }}>
                {l.level}
              </T>
            </View>
          ))}
        </View>
      </SoftCard>

      <SectionTitle>Thèmes</SectionTitle>
      <SoftCard style={{ gap: 6 }}>
        <T variant="body">
          Meilleur : {stats.bestTheme ? `${themeName(stats.bestTheme.id)} (${pct(stats.bestTheme.rate)})` : '–'}
        </T>
        <T variant="body">
          Pire : {stats.worstTheme ? `${themeName(stats.worstTheme.id)} (${pct(stats.worstTheme.rate)})` : '–'}
        </T>
        <T variant="caption" color={palette.inkFaint}>
          Calculé à partir d’au moins 2 questions par thème.
        </T>
      </SoftCard>

      <SectionTitle>Vols et jokers</SectionTitle>
      <SoftCard style={{ flexDirection: 'row', gap: 14 }}>
        <Stat label="Vols tentés" value={String(stats.stealAttempts)} />
        <Stat label="Vols réussis" value={String(stats.stealWins)} />
        <Stat label="Jokers utilisés" value={String(stats.jokersUsed)} />
      </SoftCard>

      <SectionTitle>Trophées</SectionTitle>
      {Object.keys(stats.trophies).length === 0 ? (
        <T variant="body" color={palette.inkSoft}>
          Aucun trophée pour l’instant.
        </T>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {Object.entries(stats.trophies).map(([tid, count]) => (
            <View key={tid} style={{ width: '30%', alignItems: 'center', gap: 4 }}>
              <TrophyBadge id={tid} emoji={TROPHIES[tid]?.emoji ?? '🏆'} size={64} count={count} />
              <T variant="caption" center numberOfLines={2} style={{ fontFamily: fonts.bold }}>
                {TROPHIES[tid]?.name ?? tid}
              </T>
            </View>
          ))}
        </View>
      )}

      <SectionTitle>Rival</SectionTitle>
      {stats.rival ? (
        <SoftCard style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={stats.rival.name} profileId={stats.rival.profileId} color={getProfile(stats.rival.profileId)?.color} size={48} />
          <View style={{ flex: 1 }}>
            <T variant="heading">{stats.rival.name}</T>
            <T variant="caption" color={palette.inkSoft} numeric>
              {stats.rival.games} parties ensemble · {stats.rival.wins} victoire{stats.rival.wins > 1 ? 's' : ''} contre {stats.rival.losses}
            </T>
          </View>
        </SoftCard>
      ) : (
        <T variant="body" color={palette.inkSoft}>
          Pas encore de rival.
        </T>
      )}

      <SectionTitle>Dernières parties</SectionTitle>
      {stats.recent.length === 0 ? (
        <T variant="body" color={palette.inkSoft}>
          Aucune partie terminée.
        </T>
      ) : (
        stats.recent.map((g) => {
          const me = g.players.find((p) => p.profileId === profile.id);
          return (
            <SoftCard key={g.id} style={{ gap: 2 }}>
              <T variant="body" style={{ fontFamily: fonts.bold }}>
                {g.winnerId === profile.id ? 'Victoire' : `${g.winnerName} l’emporte`} · {me?.score ?? 0} pts
              </T>
              <T variant="caption" color={palette.inkSoft}>
                {new Date(g.date).toLocaleDateString('fr-FR')} · {g.rounds} manches
              </T>
            </SoftCard>
          );
        })
      )}

      <View style={{ gap: 8, marginTop: 12 }}>
        <Button
          label={profile.archived ? 'Désarchiver' : 'Archiver ce joueur'}
          icon="archive"
          variant="secondary"
          onPress={() => archiveProfile(profile.id, !profile.archived)}
        />
        <Button label="Supprimer définitivement" icon="trash-2" variant="bad" onPress={confirmDelete} />
      </View>

      <ProfileEditor
        visible={editor}
        title="Modifier le joueur"
        initial={profile}
        submitLabel="Enregistrer"
        onClose={() => setEditor(false)}
        onSubmit={async (d) => {
          await updateProfile(profile.id, { name: d.name, color: d.color, photoSourceUri: d.photoSourceUri, removePhoto: d.removePhoto });
          setEditor(false);
        }}
      />
    </Screen>
  );
}
