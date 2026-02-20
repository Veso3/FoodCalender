import type { Entry, NightPain } from './types';

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? '';

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  }
  return res;
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get('Content-Type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    const preview = text.slice(0, 50).replace(/\s+/g, ' ');
    throw new Error(
      `API hat keine JSON-Antwort zurückgegeben (z. B. falsche URL oder Rewrite). Erste Zeichen: ${preview}…`
    );
  }
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Ungültige JSON-Antwort von der API. Bitte API-URL und Vercel-Rewrites prüfen.`
    );
  }
}

export async function getAllEntries(): Promise<Entry[]> {
  const res = await apiFetch('/api/entries');
  const data = await parseJsonResponse(res);
  return Array.isArray(data) ? data : [];
}

export async function getEntriesByDate(date: string): Promise<Entry[]> {
  const res = await apiFetch(`/api/entries?date=${encodeURIComponent(date)}`);
  const data = await parseJsonResponse(res);
  const entries = Array.isArray(data) ? data : [];
  return entries.sort((a: Entry, b: Entry) => (a.time || '').localeCompare(b.time || ''));
}

export async function getDatesWithEntries(): Promise<Set<string>> {
  const entries = await getAllEntries();
  return new Set(entries.map((e) => e.date));
}

export async function addEntry(entry: Entry): Promise<void> {
  await apiFetch('/api/entries', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export async function updateEntry(entry: Entry): Promise<void> {
  await apiFetch('/api/entries', {
    method: 'POST',
    body: JSON.stringify({ action: 'update', ...entry }),
  });
}

export async function deleteEntry(id: string): Promise<void> {
  await apiFetch('/api/entries', {
    method: 'POST',
    body: JSON.stringify({ action: 'delete', id }),
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getNightPain(date: string): Promise<NightPain | null> {
  try {
    const res = await apiFetch(`/api/night-pain?date=${encodeURIComponent(date)}`);
    if (res.status === 404) return null;
    const data = await parseJsonResponse(res);
    if (data && typeof data === 'object' && 'date' in data && 'pain' in data) {
      const d = data as { date: string; pain: boolean; notes?: string };
      return { date: d.date, pain: d.pain, notes: d.notes ?? '' };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveNightPain(payload: NightPain): Promise<void> {
  const res = await fetch(`${API_BASE}/api/night-pain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
}
