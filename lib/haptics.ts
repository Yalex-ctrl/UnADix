import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const KEY = 'unadix:haptics';
let enabled = true;

export async function loadHapticsSetting(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    enabled = raw !== 'off';
  } catch {}
  return enabled;
}

export function hapticsEnabled() {
  return enabled;
}

export async function setHapticsEnabled(value: boolean) {
  enabled = value;
  try {
    await AsyncStorage.setItem(KEY, value ? 'on' : 'off');
  } catch {}
}

const safe = (fn: () => Promise<void>) => {
  if (!enabled) return;
  fn().catch(() => {});
};

export const haptic = {
  select: () => safe(() => Haptics.selectionAsync()),
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  heavy: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
};
