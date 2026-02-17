import { neon } from '@neondatabase/serverless';

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

function getSql() {
  if (!connectionString) {
    throw new Error('Missing POSTGRES_URL or DATABASE_URL');
  }
  return neon(connectionString);
}

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT,
    food TEXT NOT NULL,
    mood SMALLINT NOT NULL
  );
`;

let initDone = false;

export async function ensureTable(): Promise<void> {
  if (initDone) return;
  const sql = getSql();
  await sql.query(INIT_SQL);
  initDone = true;
}

export { getSql };
