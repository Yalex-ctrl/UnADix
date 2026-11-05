import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GameProvider } from '@/context/GameContext';
import { RoomProvider } from '@/context/RoomContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <RoomProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="how-to-play" />
          <Stack.Screen name="setup/players" />
          <Stack.Screen name="game" />
          <Stack.Screen name="stats" />
          <Stack.Screen name="multiplayer/index" />
          <Stack.Screen name="multiplayer/create" />
          <Stack.Screen name="multiplayer/join" />
          <Stack.Screen name="multiplayer/lobby" />
        </Stack>
      </GameProvider>
    </RoomProvider>
  );
}
