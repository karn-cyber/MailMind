import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPrefs } from '../types';
import { DEFAULT_PREFS } from '../constants/config';

const PREFS_KEY = '@mailmind/prefs';

export async function getPrefs(): Promise<UserPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function savePrefs(prefs: UserPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
