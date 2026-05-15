import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { AppState, AppError, ToneType, UserPrefs, ErrorCode } from '../types';
import { DEFAULT_PREFS, API_TIMEOUT_MS } from '../constants/config';
import { getApiKey } from '../services/storage';
import { getPrefs } from '../services/prefs';
import { summarizeEmail, formalizeReply } from '../services/groq';
import { stripHtml, truncateEmail } from '../utils/emailParser';

// ─── State & Actions ──────────────────────────────────────────────────────────
type Action =
  | { type: 'INIT_DONE'; apiKey: string | null; prefs: UserPrefs }
  | { type: 'SET_API_KEY'; apiKey: string }
  | { type: 'CLEAR_API_KEY' }
  | { type: 'SET_PREFS'; prefs: UserPrefs }
  | { type: 'SET_EMAIL'; email: string }
  | { type: 'SET_LOADING'; loading: boolean; message?: string }
  | { type: 'SET_SUMMARY'; bullets: string[] }
  | { type: 'SET_CASUAL_REPLY'; text: string }
  | { type: 'SET_TONE'; tone: ToneType }
  | { type: 'SET_FORMAL_REPLY'; text: string }
  | { type: 'SET_ERROR'; error: AppError | null }
  | { type: 'RESET' };

const initialState: AppState = {
  apiKey: null,
  prefs: { ...DEFAULT_PREFS },
  currentEmail: '',
  emailSummary: [],
  casualReply: '',
  formalReply: '',
  selectedTone: DEFAULT_PREFS.defaultTone,
  isLoading: false,
  loadingMessage: '',
  error: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT_DONE':
      return {
        ...state,
        apiKey: action.apiKey,
        prefs: action.prefs,
        selectedTone: action.prefs.defaultTone,
      };
    case 'SET_API_KEY':
      return { ...state, apiKey: action.apiKey };
    case 'CLEAR_API_KEY':
      return { ...state, apiKey: null };
    case 'SET_PREFS':
      return { ...state, prefs: action.prefs };
    case 'SET_EMAIL':
      return { ...state, currentEmail: action.email, emailSummary: [], error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading, loadingMessage: action.message ?? '', error: null };
    case 'SET_SUMMARY':
      return { ...state, emailSummary: action.bullets, isLoading: false };
    case 'SET_CASUAL_REPLY':
      return { ...state, casualReply: action.text };
    case 'SET_TONE':
      return { ...state, selectedTone: action.tone };
    case 'SET_FORMAL_REPLY':
      return { ...state, formalReply: action.text, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };
    case 'RESET':
      return {
        ...initialState,
        apiKey: state.apiKey,
        prefs: state.prefs,
        selectedTone: state.prefs.defaultTone,
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  isInitialised: boolean;
  runSummarise: () => Promise<boolean>;
  runFormalise: () => Promise<boolean>;
  cancelCurrentRequest: () => void;
  setEmail: (email: string) => void;
  setCasualReply: (text: string) => void;
  setTone: (tone: ToneType) => void;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  setPrefs: (prefs: UserPrefs) => void;
  setFormalReply: (text: string) => void;
  clearError: () => void;
  reset: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isInitialised, setIsInitialised] = React.useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [apiKey, prefs] = await Promise.all([getApiKey(), getPrefs()]);
      dispatch({ type: 'INIT_DONE', apiKey, prefs });
      setIsInitialised(true);
    })();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function abort() {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  }

  function setEmail(email: string) {
    const clean = stripHtml(email);
    dispatch({ type: 'SET_EMAIL', email: clean });
  }

  function setCasualReply(text: string) {
    dispatch({ type: 'SET_CASUAL_REPLY', text });
  }

  function setTone(tone: ToneType) {
    dispatch({ type: 'SET_TONE', tone });
  }

  function setApiKey(key: string) {
    dispatch({ type: 'SET_API_KEY', apiKey: key });
  }

  function clearApiKey() {
    dispatch({ type: 'CLEAR_API_KEY' });
  }

  function setPrefs(prefs: UserPrefs) {
    dispatch({ type: 'SET_PREFS', prefs });
  }

  function setFormalReply(text: string) {
    dispatch({ type: 'SET_FORMAL_REPLY', text });
  }

  function clearError() {
    dispatch({ type: 'SET_ERROR', error: null });
  }

  function reset() {
    abortRef.current?.abort();
    dispatch({ type: 'RESET' });
  }

  function cancelCurrentRequest() {
    abortRef.current?.abort();
    dispatch({ type: 'SET_LOADING', loading: false, message: '' });
  }

  // ── Error helper ───────────────────────────────────────────────────────────
  function toAppError(err: any): AppError {
    // Already an AppError shape
    if (err && typeof err.code === 'string' && typeof err.message === 'string') {
      return err as AppError;
    }
    // Abort / timeout
    if (err?.name === 'AbortError') {
      return { code: 'TIMEOUT', message: 'Request timed out. Please try again.', retryable: true };
    }
    // Network error
    if (err?.message?.includes('Network request failed') || err?.message?.includes('fetch')) {
      return { code: 'NETWORK', message: 'Network error. Check your internet connection and try again.', retryable: true };
    }
    // Fallback
    return {
      code: 'UNKNOWN' as ErrorCode,
      message: err?.message || 'Something went wrong. Please try again.',
      retryable: true,
    };
  }

  // ── AI: Summarise ──────────────────────────────────────────────────────────
  async function runSummarise() {
    if (!state.apiKey) {
      dispatch({
        type: 'SET_ERROR',
        error: { code: 'NO_KEY', message: 'Add your Groq API key in Settings to continue.', retryable: false, navigateToSettings: true },
      });
      return false;
    }

    const signal = abort();
    const timeoutId = setTimeout(() => abortRef.current?.abort(), API_TIMEOUT_MS);
    dispatch({ type: 'SET_LOADING', loading: true, message: 'Summarising email…' });

    try {
      const { text, wasTruncated } = truncateEmail(state.currentEmail);
      const bullets = await summarizeEmail(state.apiKey, text, signal);
      dispatch({ type: 'SET_SUMMARY', bullets });
      if (wasTruncated) {
        // surface as a soft warning — not an error
        dispatch({
          type: 'SET_ERROR',
          error: {
            code: 'UNKNOWN',
            message: 'Email was trimmed to 8,000 characters for processing.',
            retryable: false,
          },
        });
      }
      return true;
    } catch (err: any) {
      if (signal.aborted) {
        dispatch({ type: 'SET_LOADING', loading: false, message: '' });
        return false;
      }
      console.log('Summarise error:', JSON.stringify(err));
      dispatch({ type: 'SET_ERROR', error: toAppError(err) });
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ── AI: Formalise ──────────────────────────────────────────────────────────
  async function runFormalise() {
    if (!state.apiKey) {
      dispatch({
        type: 'SET_ERROR',
        error: { code: 'NO_KEY', message: 'Add your Groq API key in Settings to continue.', retryable: false, navigateToSettings: true },
      });
      return false;
    }

    const signal = abort();
    const timeoutId = setTimeout(() => abortRef.current?.abort(), API_TIMEOUT_MS);
    dispatch({ type: 'SET_LOADING', loading: true, message: 'Writing your reply…' });

    try {
      const formal = await formalizeReply(
        state.apiKey,
        state.currentEmail,
        state.casualReply,
        state.selectedTone,
        state.prefs.signature,
        signal,
      );
      dispatch({ type: 'SET_FORMAL_REPLY', text: formal });
      return true;
    } catch (err: any) {
      if (signal.aborted) {
        dispatch({ type: 'SET_LOADING', loading: false, message: '' });
        return false;
      }
      console.log('Formalise error:', JSON.stringify(err));
      dispatch({ type: 'SET_ERROR', error: toAppError(err) });
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return (
    <AppContext.Provider
      value={{
        state,
        isInitialised,
        runSummarise,
        runFormalise,
        setEmail,
        setCasualReply,
        setTone,
        setApiKey,
        clearApiKey,
        setPrefs,
        setFormalReply,
        clearError,
        cancelCurrentRequest,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
