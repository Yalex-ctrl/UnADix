import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { SoftCard } from '@/components/ui/Card';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { T } from '@/components/ui/Typography';
import { useGame } from '@/context/GameContext';
import { useProfiles } from '@/context/ProfilesContext';
import { normalizeName } from '@/lib/profileLogic';
import { fonts, OUTLINE, palette, PLAYER_COLORS, radius } from '@/theme/tokens';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const PRESETS = [5, 10];

export default function PlayersSetupScreen() {
  const router = useRouter();
  const { startGame } = useGame();
  const { profiles, createProfile, touchPlayed } = useProfiles();
  const [selected, setSelected] = useState<string[]>([]); // ids de profils, dans l'ordre
  const [query, setQuery] = useState('');
  const [guest, setGuest] = useState('');
  const [editor, setEditor] = useState(false);
  const [totalRounds, setTotalRounds] = useState(10);
  const [thiefMode, setThiefMode] = useState(true);
  const [tvHost, setTvHost] = useState(true);

  const sorted = useMemo(
    () => [...profiles].sort((a, b) => (b.lastPlayedAt ?? b.createdAt) - (a.lastPlayedAt ?? a.createdAt)),
    [profiles]
  );
  const shown = query.trim() ? sorted.filter((p) => normalizeName(p.name).includes(normalizeName(query))) : sorted;
  const chosen = selected.map((id) => profiles.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);

  // Deux joueurs de la partie avec le même prénom : autorisé, mais signalé.
  const names = chosen.map((p) => normalizeName(p.name));
  const hasDuplicateName = names.length !== new Set(names).size;
  const canStart = chosen.length >= MIN_PLAYERS && chosen.length <= MAX_PLAYERS;
  const hint = chosen.length < MIN_PLAYERS ? `Choisis au moins ${MIN_PLAYERS} joueurs.` : null;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_PLAYERS ? prev : [...prev, id]));

  const addGuest = async () => {
    const name = guest.trim();
    if (!name || selected.length >= MAX_PLAYERS) return;
    // Un invité crée quand même un profil (réutilisable ensuite).
    const profile = await createProfile({ name, color: PLAYER_COLORS[profiles.length % PLAYER_COLORS.length] });
    setSelected((prev) => [...prev, profile.id]);
    setGuest('');
  };

  const start = async () => {
    startGame(
      chosen.map((p) => ({ name: p.name, profileId: p.id, color: p.color })),
      totalRounds,
      'solo',
      { thiefMode, tvHost }
    );
    touchPlayed(chosen.map((p) => p.id));
    router.push('/game');
  };

  return (
    <Screen
      header={<Header title="Nouvelle partie" onBack={() => router.back()} />}
      gap={12}
      bottom={
        <>
          {hint && (
            <T variant="caption" color={palette.inkSoft} center>
              {hint}
            </T>
          )}
          <Button label={chosen.length ? `Continuer (${chosen.length} joueurs)` : 'Continuer'} size="xl" disabled={!canStart} onPress={start} />
        </>
      }
    >
      <SectionTitle>{`Joueurs habituels (${chosen.length}/${MAX_PLAYERS})`}</SectionTitle>

      {profiles.length > 12 && (
        <View style={styles.search}>
          <Feather name="search" size={18} color={palette.inkFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Chercher un joueur"
            placeholderTextColor={palette.inkFaint}
            style={styles.searchInput}
            accessibilityLabel="Chercher un joueur"
          />
        </View>
      )}

      <View style={styles.grid}>
        {shown.map((p) => {
          const on = selected.includes(p.id);
          return (
            <Pressable
              key={p.id}
              onPress={() => toggle(p.id)}
              accessibilityRole="button"
              accessibilityLabel={p.name}
              accessibilityState={{ selected: on }}
              style={styles.tile}
            >
              <View>
                <Avatar name={p.name} color={p.color} profileId={p.id} size={64} ring={on} />
                {on && (
                  <Animated.View entering={ZoomIn.springify()} style={styles.check}>
                    <Feather name="check" size={14} color={palette.ink} />
                  </Animated.View>
                )}
              </View>
              <T variant="caption" numberOfLines={1} color={on ? palette.ink : palette.inkSoft} style={{ maxWidth: 76 }}>
                {p.name}
              </T>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setEditor(true)} accessibilityRole="button" accessibilityLabel="Nouveau joueur" style={styles.tile}>
          <View style={styles.plus}>
            <Feather name="plus" size={28} color={palette.ink} />
          </View>
          <T variant="caption" color={palette.inkSoft}>
            Nouveau
          </T>
        </Pressable>
      </View>

      {profiles.length === 0 && (
        <SoftCard tone="soft">
          <T variant="body" color={palette.inkSoft} center>
            Pas encore de joueur : crée le premier avec « Nouveau », ou ajoute un invité ci-dessous.
          </T>
        </SoftCard>
      )}

      <View style={styles.guestRow}>
        <TextInput
          value={guest}
          onChangeText={setGuest}
          placeholder="Ajouter un invité (prénom)"
          placeholderTextColor={palette.inkFaint}
          maxLength={20}
          onSubmitEditing={addGuest}
          returnKeyType="done"
          style={styles.guestInput}
          accessibilityLabel="Prénom de l'invité"
        />
        <Button label="Ajouter" variant="secondary" disabled={!guest.trim() || selected.length >= MAX_PLAYERS} onPress={addGuest} />
      </View>

      {hasDuplicateName && (
        <SoftCard tone="gold" borderColor={palette.goldDeep}>
          <T variant="caption" color={palette.ink}>
            Deux joueurs ont le même prénom : reconnais-les à leur couleur et leur photo.
          </T>
        </SoftCard>
      )}

      {chosen.length > 0 && (
        <>
          <SectionTitle>Dans la partie</SectionTitle>
          <View style={styles.wrap}>
            {chosen.map((p) => (
              <Chip key={p.id} label={p.name} color={p.color} selected onPress={() => toggle(p.id)} />
            ))}
          </View>
        </>
      )}

      <SectionTitle>Durée</SectionTitle>
      <SoftCard style={{ gap: 12 }}>
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Une manche de moins"
            onPress={() => setTotalRounds((n) => Math.max(1, n - 1))}
            style={styles.stepButton}
          >
            <Feather name="minus" size={22} color={palette.ink} />
          </Pressable>
          <View style={{ alignItems: 'center', minWidth: 90 }}>
            <T variant="display" numeric>
              {totalRounds}
            </T>
            <T variant="caption" color={palette.inkSoft}>
              manche{totalRounds > 1 ? 's' : ''}
            </T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Une manche de plus"
            onPress={() => setTotalRounds((n) => Math.min(10, n + 1))}
            style={styles.stepButton}
          >
            <Feather name="plus" size={22} color={palette.ink} />
          </Pressable>
        </View>
        <View style={[styles.wrap, { justifyContent: 'center' }]}>
          {PRESETS.map((n) => (
            <Chip key={n} label={n === 5 ? 'Rapide · 5' : 'Classique · 10'} selected={totalRounds === n} onPress={() => setTotalRounds(n)} />
          ))}
        </View>
      </SoftCard>

      <SectionTitle>Options</SectionTitle>
      <SwitchRow
        title="Mode Voleur"
        description="Après une mauvaise réponse, les autres peuvent tenter de voler les points (−2 s’ils se trompent)."
        value={thiefMode}
        onValueChange={setThiefMode}
      />
      <SwitchRow title="Présentateur TV" description="Lulu commente la partie à la fin de chaque manche." value={tvHost} onValueChange={setTvHost} />

      <ProfileEditor
        visible={editor}
        title="Nouveau joueur"
        submitLabel="Créer le joueur"
        defaultColor={PLAYER_COLORS[profiles.length % PLAYER_COLORS.length]}
        onClose={() => setEditor(false)}
        onSubmit={async (draft) => {
          const profile = await createProfile({ name: draft.name, color: draft.color, photoSourceUri: draft.photoSourceUri });
          setSelected((prev) => (prev.length >= MAX_PLAYERS ? prev : [...prev, profile.id]));
          setEditor(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tile: { alignItems: 'center', gap: 4, width: 76, minHeight: 44 },
  plus: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: OUTLINE,
    borderStyle: 'dashed',
    borderColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  check: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.good,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.surface,
    borderRadius: radius.button,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  searchInput: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: palette.ink },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guestInput: {
    flex: 1,
    minHeight: 52,
    backgroundColor: palette.surface,
    borderRadius: radius.button,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    paddingHorizontal: 14,
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: palette.ink,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.bgDeep,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
