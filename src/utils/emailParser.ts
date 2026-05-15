import { MAX_EMAIL_LENGTH } from '../constants/config';

/**
 * Strip basic HTML tags from pasted email content.
 * Handles common mail client HTML artifacts.
 */
export function stripHtml(raw: string): string {
  return raw
    // Remove full HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Collapse multiple whitespace/newlines into max 2 newlines
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * Truncate email to the max allowed length with a notice appended.
 */
export function truncateEmail(text: string): { text: string; wasTruncated: boolean } {
  if (text.length <= MAX_EMAIL_LENGTH) {
    return { text, wasTruncated: false };
  }
  return {
    text: text.slice(0, MAX_EMAIL_LENGTH),
    wasTruncated: true,
  };
}

/**
 * Parse the bullet-point response from the summarisation API call.
 * Handles both "• bullet" and "- bullet" and plain lines.
 */
export function parseSummaryBullets(raw: string): string[] {
  return raw
    .split('\n')
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(line => line.length > 0);
}

/**
 * Validate Groq API key format.
 * Groq keys start with "gsk_"
 */
export function isValidKeyFormat(key: string): boolean {
  const trimmed = key.trim();
  return trimmed.startsWith('gsk_') && trimmed.length >= 8;
}

/**
 * Mask API key for display: show first 10 + "••••••••" + last 4
 */
export function maskApiKey(key: string): string {
  if (key.length <= 14) return '••••••••••••••••';
  return key.slice(0, 10) + '••••••••' + key.slice(-4);
}
