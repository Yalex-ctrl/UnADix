import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { BreakingBanner } from '@/components/ui/BreakingBanner';
import { Button, ButtonVariant } from '@/components/ui/Button';
import { PopCard, SoftCard } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Confetti } from '@/components/ui/Confetti';
import { Header } from '@/components/ui/Header';
import { HostBubble } from '@/components/ui/HostBubble';
import { LevelWall } from '@/components/ui/LevelGrid';
import { Lulu } from '@/components/ui/Lulu';
import { Pill } from '@/components/ui/Pill';
import { Podium } from '@/components/ui/Podium';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { Screen } from '@/components/ui/Screen';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { TrophyBadge } from '@/components/ui/TrophyBadge';
import { T } from '@/components/ui/Typography';
import { Roulette } from '@/components/ui/Roulette';
import { TROPHIES } from '@/lib/trophies';
import { palette, PLAYER_COLORS } from '@/theme/tokens';

const VARIANTS: ButtonVariant[] = ['brand', 'good', 'bad', 'gold', 'steal', 'secondary', 'ghost'];
const PLAYERS = ['Tom', 'Jean-Baptiste', 'Léa', 'Kim', 'Enzo', 'Margaux'].map((name, i) => ({
  id: `p${i}`,
  name,
  score: (6 - i) * 7,
  color: PLAYER_COLORS[i],
  jokerUsed: i % 2 === 0,
}));

// Écran caché (développement uniquement) : tous les composants du design
// system et leurs variantes, pour les captures d'écran et les revues.
export default function Playground() {
  const router = useRouter();
  const [burst, setBurst] = useState(0);
  const [banner, setBanner] = useState(0);
  if (!__DEV__) return null;

  return (
    <View style={{ flex: 1 }}>
      <Screen header={<Header title="Playground" onBack={() => router.back()} onUndo={() => {}} undoDisabled onMenu={() => {}} progress={{ current: 3, total: 10 }} />} gap={14}>
        <SectionTitle>Boutons 3D</SectionTitle>
        {VARIANTS.map((v) => (
          <Button key={v} label={`Bouton ${v}`} variant={v} size="l" icon="star" />
        ))}
        <Button label="Désactivé" disabled />
        <Button label="XL — Voir la réponse" size="xl" />

        <SectionTitle>Cartes, pastilles, chips</SectionTitle>
        <PopCard>
          <T variant="heading">PopCard</T>
          <T variant="body" color={palette.inkSoft}>Contour encre 2 px, ombre pleine décalée.</T>
        </PopCard>
        <SoftCard>
          <T variant="body">SoftCard — éléments secondaires</T>
        </SoftCard>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Pill label="Niveau 7" color={palette.goldSoft} />
          <Pill label="Vol" color={palette.steal} icon="unlock" />
          <Chip label="Chip" />
          <Chip label="Sélectionné" selected />
        </View>

        <SectionTitle>Avatars et scores</SectionTitle>
        <AvatarStack players={PLAYERS} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Avatar name="Tom" color={PLAYER_COLORS[0]} size={64} />
          <Avatar name="Léa" color={PLAYER_COLORS[2]} size={64} ring />
        </View>
        <ScoreBar players={PLAYERS} activeId="p1" />

        <SectionTitle>Lulu</SectionTitle>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['neutral', 'hype', 'shocked', 'smug'] as const).map((m) => (
            <Lulu key={m} mood={m} size={64} />
          ))}
        </View>
        <HostBubble text="Incroyable ! Kim vient de prendre la tête !" mood="hype" duration={600000} />

        <SectionTitle>Le Mur des niveaux</SectionTitle>
        <LevelWall takenBy={{ 3: { name: 'Tom', color: PLAYER_COLORS[0] }, 8: { name: 'Léa', color: PLAYER_COLORS[2] } }} onChoose={() => {}} />

        <SectionTitle>Question</SectionTitle>
        <QuestionCard player={PLAYERS[0]} level={7} categoryName="Cinéma" text="Quel film de 1976 réalisé par Martin Scorsese met en scène Travis Bickle ?" />

        <SectionTitle>Roulette</SectionTitle>
        <Roulette categoryId="chocolat" description="De la fève à la tablette." round={3} total={10} />

        <SectionTitle>Podium et trophées</SectionTitle>
        <Podium players={PLAYERS.slice(0, 3)} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {Object.entries(TROPHIES).map(([id, t]) => (
            <TrophyBadge key={id} id={id} emoji={t.emoji} size={56} />
          ))}
        </View>

        <SectionTitle>Effets</SectionTitle>
        <Button label="Confettis" variant="gold" onPress={() => setBurst((b) => b + 1)} />
        <Button label="Bandeau BRAQUAGE" variant="bad" onPress={() => setBanner((b) => b + 1)} />
      </Screen>
      {burst > 0 && <Confetti key={burst} />}
      <BreakingBanner text="BRAQUAGE !" trigger={banner} />
    </View>
  );
}
