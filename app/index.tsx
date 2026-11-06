import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AvatarStack } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { PopCard } from '@/components/ui/Card';
import { FloatingShapes } from '@/components/ui/FloatingShapes';
import { IconButton } from '@/components/ui/Header';
import { Lulu } from '@/components/ui/Lulu';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { T } from '@/components/ui/Typography';
import { useGame } from '@/context/GameContext';
import { hapticsEnabled, setHapticsEnabled } from '@/lib/haptics';
import { setSoundEnabled, soundEnabled } from '@/lib/sounds';
import { fonts, LEVEL_COLORS, palette, space } from '@/theme/tokens';

// Logo : « 1 à 10 », chaque chiffre dans la couleur de son niveau.
function Logo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }} accessibilityLabel="1 à 10">
      <T variant="hero" color={LEVEL_COLORS[1]} style={{ fontSize: 72, lineHeight: 76, textShadowColor: palette.ink, textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 }}>
        1
      </T>
      <T variant="display" color={palette.ink}>
        à
      </T>
      <T variant="hero" color={LEVEL_COLORS[9]} style={{ fontSize: 72, lineHeight: 76, textShadowColor: palette.ink, textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 }}>
        10
      </T>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { state, hydrated } = useGame();
  const [settings, setSettings] = useState(false);
  const [haptics, setHaptics] = useState(hapticsEnabled());
  const [sound, setSound] = useState(soundEnabled());
  const finished = state.phase === 'final-results' || state.phase === 'challenge-final-results';
  const canResume = hydrated && state.phase !== 'idle' && !finished;
  const roundLabel =
    state.mode === 'challenge' ? `Défi ${state.challengeRound} / ${state.challengeTotal}` : `Manche ${state.round} / ${state.totalRounds}`;

  const link = (icon: React.ComponentProps<typeof Feather>['name'], label: string, to: string) => (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(to as never)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}
    >
      <Feather name={icon} size={16} color={palette.inkSoft} />
      <T variant="caption" color={palette.inkSoft} style={{ fontFamily: fonts.bold }}>
        {label}
      </T>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <FloatingShapes />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ alignItems: 'flex-end', paddingHorizontal: space.md }}>
          <IconButton icon="settings" label="Réglages" onPress={() => setSettings(true)} />
        </View>
        <View style={{ flex: 1, paddingHorizontal: space.xl, paddingBottom: space.xl, justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', gap: space.sm, marginTop: space.lg }}>
            <Logo />
            <T variant="body" color={palette.inkSoft} center style={{ fontFamily: fonts.bold }}>
              Le quiz où tu choisis ta difficulté
            </T>
            <Lulu mood="hype" size={84} />
          </View>

          <View style={{ gap: space.md }}>
            {canResume && (
              <PopCard tone="primary" style={{ gap: space.sm }}>
                <T variant="caption" color={palette.brandDeep} style={{ letterSpacing: 1.2 }}>
                  PARTIE EN COURS
                </T>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <T variant="heading">{roundLabel}</T>
                  <AvatarStack players={state.players} />
                </View>
                <Button label="Reprendre la partie" icon="play" variant="brand" onPress={() => router.push('/game')} />
              </PopCard>
            )}
            <Button label="Nouvelle partie" icon="play-circle" size="xl" onPress={() => router.push('/setup/players')} />
            <Button label="Multi-téléphones" icon="users" variant="secondary" size="l" onPress={() => router.push('/multiplayer')} />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.lg }}>
              {link('smile', 'Joueurs', '/players')}
              {link('bar-chart-2', 'Statistiques', '/stats')}
              {link('help-circle', 'Comment jouer ?', '/how-to-play')}
            </View>
          </View>
        </View>
      </SafeAreaView>

      <BottomSheet visible={settings} title="Réglages" onClose={() => setSettings(false)}>
        <SwitchRow
          title="Retours haptiques"
          description="Vibrations sur les réponses et les choix."
          value={haptics}
          onValueChange={(v) => {
            setHaptics(v);
            setHapticsEnabled(v);
          }}
        />
        <SwitchRow
          title="Sons"
          description="Effets sonores courts (coupés si le téléphone est en silencieux)."
          value={sound}
          onValueChange={(v) => {
            setSound(v);
            setSoundEnabled(v);
          }}
        />
        <Button label="Fermer" variant="ghost" onPress={() => setSettings(false)} />
      </BottomSheet>
    </View>
  );
}
