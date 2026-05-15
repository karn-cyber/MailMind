import * as SecureStore from 'expo-secure-store';

const KEY = 'mailmind_api_key';

export async function getApiKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(KEY, key.trim());
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
