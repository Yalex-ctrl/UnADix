import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { GameProvider } from '@/context/GameContext';
import { RoomProvider } from '@/context/RoomContext';
import { loadHapticsSetting } from '@/lib/haptics';
import { palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    loadHapticsSetting();
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <RoomProvider>
      <GameProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.bg },
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
