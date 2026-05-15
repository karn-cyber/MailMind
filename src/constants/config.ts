import { ToneOption } from '../types';

export const TONES: ToneOption[] = [
  {
    key: 'formal',
    label: 'Formal',
    description: 'Business formal. No contractions. Structured.',
    emoji: '',
  },
  {
    key: 'semi-formal',
    label: 'Semi-formal',
    description: 'Professional but natural. The default.',
    emoji: '',
  },
  {
    key: 'friendly',
    label: 'Friendly',
    description: 'Warm and approachable. Still professional.',
    emoji: '',
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
