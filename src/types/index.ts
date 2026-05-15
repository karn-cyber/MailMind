// ─── Tone ────────────────────────────────────────────────────────────────────
export type ToneType = 'formal' | 'semi-formal' | 'friendly';

export interface ToneOption {
  key: ToneType;
  label: string;
  description: string;
  emoji: string;
}

// ─── App State ───────────────────────────────────────────────────────────────
export type AppScreen =
  | 'INIT'
  | 'NO_KEY'
  | 'IDLE'
  | 'SUMMARISING'
  | 'SUMMARISED'
  | 'COMPOSING'
  | 'FORMALISING'
  | 'REVIEW'
  | 'REGENERATING'
  | 'ERROR';

export interface UserPrefs {
  defaultTone: ToneType;
  signature: string;
}

export interface AppState {
  apiKey: string | null;
  prefs: UserPrefs;
  currentEmail: string;
  emailSummary: string[];
  casualReply: string;
  formalReply: string;
  selectedTone: ToneType;
  isLoading: boolean;
  loadingMessage: string;
  error: AppError | null;
}

// ─── Error ───────────────────────────────────────────────────────────────────
export type ErrorCode =
  | 'NO_KEY'
  | 'INVALID_KEY'
  | 'RATE_LIMIT'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'MALFORMED'
  | 'UNKNOWN';

export interface AppError {
  code: ErrorCode;
  message: string;
  retryable: boolean;
  navigateToSettings?: boolean;
}

// ─── Navigation ──────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Home: undefined;
  Summary: undefined;
  Compose: undefined;
  Review: undefined;
  Settings: { fromOnboarding?: boolean };
};
