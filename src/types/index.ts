// ─── Tone ────────────────────────────────────────────────────────────────────
export type ToneType = 'formal' | 'semi-formal' | 'friendly';

export interface ToneOption {
  key: ToneType;
  label: string;
  description: string;
  emoji: string;
}

// ─── Database Models ─────────────────────────────────────────────────────────
export interface Sender {
  _id: string;
  name: string;
  email: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
}

export type MessageType = 'email_in' | 'reply_out';

export interface Message {
  _id: string;
  senderId: string;
  type: MessageType;
  content: string;        // raw email text (email_in) or formal reply (reply_out)
  summary: string[];      // bullet points (email_in only)
  casualDraft: string;    // user's casual text (reply_out only)
  tone: string;           // tone used for formalisation (reply_out only)
  createdAt: string;
}

// ─── User Preferences ───────────────────────────────────────────────────────
export interface UserPrefs {
  defaultTone: ToneType;
  signature: string;
}

// ─── App State ───────────────────────────────────────────────────────────────
export interface AppState {
  apiKey: string | null;
  prefs: UserPrefs;
  // New: Inbox & Chat state
  senders: Sender[];
  sendersLoading: boolean;
  currentSender: Sender | null;
  messages: Message[];
  messagesLoading: boolean;
  // Legacy: Kept for backward compatibility with Groq/Settings
  currentEmail?: string;
  emailSummary?: string[];
  casualReply?: string;
  formalReply?: string;
  selectedTone?: ToneType;
  // Shared: AI flow & errors
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
  Inbox: undefined;
  Chat: { senderId: string; senderName: string; senderEmail: string };
  NewEmail: { senderId?: string; senderName?: string; senderEmail?: string };
  Settings: { fromOnboarding?: boolean };
};
