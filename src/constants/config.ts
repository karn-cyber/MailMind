import { ToneOption } from '../types';
import Constants from 'expo-constants';

export const TONES: ToneOption[] = [
  {
    key: 'formal',
    label: 'Formal',
    description: 'No contractions. Structured business language.',
    emoji: '🏛️',
  },
  {
    key: 'semi-formal',
    label: 'Semi-formal',
    description: 'Professional but natural. The default.',
    emoji: '💼',
  },
  {
    key: 'friendly',
    label: 'Friendly',
    description: 'Warm and approachable. Still professional.',
    emoji: '😊',
  },
];

export const DEFAULT_PREFS = {
  defaultTone: 'semi-formal' as const,
  signature: '',
};

export const MAX_EMAIL_LENGTH = 8000;
export const MIN_EMAIL_LENGTH = 10;
export const MIN_REPLY_LENGTH = 3;
export const API_TIMEOUT_MS = 30000;
export const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any)?.manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3001`;
  }

  if (typeof window !== 'undefined') {
    return 'http://localhost:3001';
  }

  return 'http://10.165.73.197:3001';
}

export const API_BASE_URL = resolveApiBaseUrl();
