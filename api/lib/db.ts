import { neon } from '@neondatabase/serverless';

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

function getSql() {
  if (!connectionString) {
    throw new Error('Missing POSTGRES_URL or DATABASE_URL');
  }
  return neon(connectionString);
}

const ENTRIES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT,
    food TEXT NOT NULL,
    mood SMALLINT NOT NULL
  );
`;

const NIGHT_PAIN_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS night_pain (
    date TEXT PRIMARY KEY,
    pain BOOLEAN NOT NULL,
    notes TEXT
  );
`;

let initDone = false;

export async function ensureTable(): Promise<void> {
  if (initDone) return;
  const sql = getSql();
  await sql.query(ENTRIES_TABLE_SQL);
  await sql.query(NIGHT_PAIN_TABLE_SQL);
  initDone = true;
}

export { getSql };
