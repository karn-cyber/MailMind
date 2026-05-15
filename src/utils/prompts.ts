import { ToneType } from '../types';

export const TONE_FRAGMENTS: Record<ToneType, string> = {
  formal:
    'Use formal business English. Avoid all contractions (use "I am" not "I\'m"). ' +
    'Use "I would be happy to" not "I\'d be happy to". ' +
    'Maintain a respectful, structured tone throughout.',
  'semi-formal':
    'Use professional but natural English. Contractions are acceptable. ' +
    'Be direct, clear, and warm. This is the default professional register.',
  friendly:
    'Use a warm, approachable tone. First-name basis is fine if used in the original. ' +
    'Be conversational yet still professional. Avoid overly stiff phrasing.',
};

export function buildSummarisePrompt(emailText: string): string {
  return (
    `Summarise the following email into 3–5 concise bullet points.\n\n` +
    `Focus on:\n` +
    `1. Who sent it and the main topic\n` +
    `2. What action or response is required from the recipient\n` +
    `3. Any deadlines, dates, or urgency\n\n` +
    `Rules:\n` +
    `- Each bullet must be ≤20 words\n` +
    `- Use plain, clear language\n` +
    `- Do not include greetings or sign-offs\n` +
    `- If no action is required, state that explicitly in the last bullet\n` +
    `- Return ONLY the bullet points, each on its own line starting with "•"\n` +
    `- No preamble, no headers, no extra commentary\n\n` +
    `Email:\n${emailText}`
  );
}

export function buildFormalisePrompt(
  originalEmail: string,
  casualDraft: string,
  tone: ToneType,
  signature: string,
): string {
  const toneFragment = TONE_FRAGMENTS[tone];
  const signaturePart = signature.trim()
    ? `\n\nEnd the email with this signature:\n${signature.trim()}`
    : '';

  return (
    `You are a professional email writing assistant.\n\n` +
    `The user is replying to this email:\n` +
    `---\n${originalEmail}\n---\n\n` +
    `Their intended reply (informal): "${casualDraft}"\n\n` +
    `Tone instruction: ${toneFragment}\n\n` +
    `Rules:\n` +
    `- Do NOT add any information not present in the casual draft\n` +
    `- Do NOT include a subject line\n` +
    `- Include an appropriate professional opening and closing\n` +
    `- Keep it concise — under 120 words unless the draft genuinely requires more\n` +
    `- Return ONLY the email body. No preamble, no "Here is the reply:", no commentary\n` +
    signaturePart
  );
}
