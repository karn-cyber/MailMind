import { AppError, ToneType } from '../types';
import { GROQ_ENDPOINT } from '../constants/config';
import { buildSummarisePrompt, buildFormalisePrompt } from '../utils/prompts';
import { parseSummaryBullets } from '../utils/emailParser';

// ─── Error Factory ────────────────────────────────────────────────────────────
function makeError(status: number | null, message?: string): AppError {
  if (status === 401) {
    return {
      code: 'INVALID_KEY',
      message: 'Your Groq API key was rejected. Tap here to update it in Settings.',
      retryable: false,
      navigateToSettings: true,
    };
  }
  if (status === 429) {
    return {
      code: 'RATE_LIMIT',
      message: "You've hit the Groq rate limit. Please wait a moment and try again.",
      retryable: true,
    };
  }
  if (status !== null && status >= 500) {
    return {
      code: 'SERVER_ERROR',
      message: 'Groq servers are having issues. Please try again shortly.',
      retryable: true,
    };
  }
  return {
    code: 'UNKNOWN',
    message: message ?? 'Something went wrong.',
    retryable: true,
  };
}

// ─── Core Groq API Call ───────────────────────────────────────────────────────
async function callGroq(
  apiKey: string,
  userMessage: string,
  signal: AbortSignal,
): Promise<string> {
  const isGroq = typeof apiKey === 'string' && apiKey.startsWith('gsk_');

  if (!isGroq) {
    throw {
      code: 'INVALID_KEY',
      message: 'Invalid API key. Please enter a valid Groq API key starting with "gsk_".',
      retryable: false,
      navigateToSettings: true,
    } as AppError;
  }

  // Primary model + fast fallback
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  let lastErr: any = null;

  for (const model of models) {
    try {
      console.log(`Trying Groq model: ${model}`);

      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
          temperature: 0.7,
        }),
        signal,
      });

      // Handle specific HTTP errors before reading body
      if (response.status === 401) {
        throw makeError(401);
      }
      if (response.status === 429) {
        throw makeError(429);
      }
      if (!response.ok) {
        let errorBody = '';
        try { errorBody = await response.text(); } catch {}
        console.log(`Groq API error: status=${response.status}, body=${errorBody}`);
        lastErr = {
          code: 'UNKNOWN',
          message: `Groq API error (${response.status}): ${errorBody || 'Unknown error'}`,
          retryable: true,
        } as AppError;
        continue; // try next model
      }

      const data = await response.json();
      console.log('Groq response received for model:', model);

      const text: string | undefined = data?.choices?.[0]?.message?.content;

      if (!text || typeof text !== 'string') {
        lastErr = {
          code: 'MALFORMED',
          message: 'Malformed Groq response: missing message content.',
          retryable: true,
        } as AppError;
        continue; // try next model
      }

      return text.trim();
    } catch (err: any) {
      console.log('Groq model', model, 'failed:', err?.message || err);

      // If it's a definitive auth/key error, don't bother with fallback
      if (err?.code === 'INVALID_KEY') {
        throw err;
      }

      // If it's already an AppError (has code property), keep it
      if (err?.code && err?.message) {
        lastErr = err;
      } else if (err?.name === 'AbortError') {
        // Request was aborted (timeout or user cancel)
        throw {
          code: 'TIMEOUT',
          message: 'Request timed out. Please try again.',
          retryable: true,
        } as AppError;
      } else {
        // Network error or other unknown error — wrap it
        lastErr = {
          code: 'NETWORK',
          message: 'Network error. Check your internet connection and try again.',
          retryable: true,
        } as AppError;
      }

      continue;
    }
  }

  // All models failed
  if (lastErr) throw lastErr;
  throw makeError(null, 'All Groq models failed.');
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function summarizeEmail(
  apiKey: string,
  emailText: string,
  signal: AbortSignal,
): Promise<string[]> {
  const prompt = buildSummarisePrompt(emailText);
  const raw = await callGroq(apiKey, prompt, signal);
  return parseSummaryBullets(raw);
}

export async function formalizeReply(
  apiKey: string,
  originalEmail: string,
  casualDraft: string,
  tone: ToneType,
  signature: string,
  signal: AbortSignal,
): Promise<string> {
  const prompt = buildFormalisePrompt(originalEmail, casualDraft, tone, signature);
  return callGroq(apiKey, prompt, signal);
}
