import { openDB, type IDBPDatabase } from 'idb';
import type { Entry } from './types';

const DB_NAME = 'essens-kalender-db';
const STORE_NAME = 'entries';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<{ entries: Entry }>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<{ entries: Entry }>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-date', 'date');
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllEntries(): Promise<Entry[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function getEntriesByDate(date: string): Promise<Entry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_NAME, 'by-date', date);
  return all.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
}

export async function getDatesWithEntries(): Promise<Set<string>> {
  const entries = await getAllEntries();
  return new Set(entries.map((e) => e.date));
}

export async function addEntry(entry: Entry): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, entry);
}

export async function updateEntry(entry: Entry): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, entry);
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
