import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useRoom } from '@/context/RoomContext';
import { RoomPlayerStatus } from '@/types/room';

const STATUS_LABEL: Record<RoomPlayerStatus, string> = {
  connecting: 'Connexion...',
  ready: 'Prêt',
  'not-ready': 'Pas prêt',
};

const STATUS_COLOR: Record<RoomPlayerStatus, string> = {
  connecting: colors.textMuted,
  ready: colors.success,
  'not-ready': colors.warning,
};

export default function LobbyScreen() {
  const router = useRouter();
  const { room, isHost, selfId, startGame, leaveRoom } = useRoom();

  useEffect(() => {
    if (!room) {
      router.replace('/multiplayer');
    }
  }, [room, router]);

  if (!room) return null;

  const readyCount = room.players.filter((p) => p.status === 'ready').length;
  const canStart = readyCount >= 2;

  const handleStart = async () => {
    await startGame();
    router.push({ pathname: '/setup/players', params: { mode: 'multiplayer', fromRoom: '1' } });
  };

  const handleLeave = async () => {
    await leaveRoom();
    router.replace('/multiplayer');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SALON</Text>
        <Text style={styles.code}>{room.code}</Text>
        <Text style={styles.codeHint}>Partage ce code avec les autres joueurs</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {room.players.map((p) => (
          <Card key={p.id} style={styles.playerRow}>
            <Text style={styles.playerName}>
              {p.name} {p.id === selfId && '(toi)'} {p.isHost && '👑'}
            </Text>
            <Badge label={STATUS_LABEL[p.status]} color={STATUS_COLOR[p.status]} textColor={colors.background} />
          </Card>
        ))}
      </ScrollView>

      <Text style={styles.notice}>
        Le jeu se joue ensuite sur cet appareil — la synchronisation multi-écrans arrivera plus tard.
      </Text>

      {isHost ? (
        <Button
          label={canStart ? 'Lancer la partie' : `En attente de joueurs (${readyCount}/2 min.)`}
          onPress={handleStart}
          disabled={!canStart}
        />
      ) : (
        <Text style={styles.waitingText}>En attente que l&apos;hôte lance la partie...</Text>
      )}
      <Button label="Quitter le salon" variant="ghost" onPress={handleLeave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  code: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 8,
    marginTop: 6,
  },
  codeHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  notice: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  waitingText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
