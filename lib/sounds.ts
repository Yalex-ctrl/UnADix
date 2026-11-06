import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const KEY = 'unadix:sound';
let enabled = true;

const SOURCES = {
  tick: require('../assets/sounds/tick.wav'),
  reveal: require('../assets/sounds/reveal.wav'),
  correct: require('../assets/sounds/correct.wav'),
  wrong: require('../assets/sounds/wrong.wav'),
  steal: require('../assets/sounds/steal.wav'),
  trophy: require('../assets/sounds/trophy.wav'),
  win: require('../assets/sounds/win.wav'),
};

export type SoundName = keyof typeof SOURCES;

const players: Partial<Record<SoundName, AudioPlayer>> = {};

export async function loadSoundSetting(): Promise<boolean> {
  try {
    enabled = (await AsyncStorage.getItem(KEY)) !== 'off';
    // Respecte le mode silencieux du téléphone : pas de son forcé.
    await setAudioModeAsync({ playsInSilentMode: false });
  } catch {}
  return enabled;
}

export const soundEnabled = () => enabled;

export async function setSoundEnabled(value: boolean) {
  enabled = value;
  try {
    await AsyncStorage.setItem(KEY, value ? 'on' : 'off');
  } catch {}
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  try {
    let player = players[name];
    if (!player) {
      player = createAudioPlayer(SOURCES[name]);
      players[name] = player;
    }
    player.seekTo(0);
    player.play();
  } catch {}
}
