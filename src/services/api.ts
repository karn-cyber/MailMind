import { API_BASE_URL } from '../constants/config';
import { Sender, Message } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${body}`);
    }
    return res.json();
  } catch (err: any) {
    if (err?.message?.includes('Network request failed')) {
      throw new Error('Cannot reach backend server. Make sure it is running.');
    }
    throw err;
  }
}

// ─── Senders ─────────────────────────────────────────────────────────────────
export async function fetchSenders(): Promise<Sender[]> {
  return request<Sender[]>('/senders');
}

export async function createSender(name: string, email: string): Promise<Sender> {
  return request<Sender>('/senders', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
}

export async function deleteSender(id: string): Promise<void> {
  await request<{ success: boolean }>(`/senders/${id}`, {
    method: 'DELETE',
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────
export async function fetchMessages(senderId: string): Promise<Message[]> {
  return request<Message[]>(`/messages?senderId=${senderId}`);
}

export async function createMessage(data: {
  senderId: string;
  type: 'email_in' | 'reply_out';
  content: string;
  summary?: string[];
  casualDraft?: string;
  tone?: string;
}): Promise<Message> {
  return request<Message>('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
