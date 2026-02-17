import { ensureTable, getSql } from '../lib/db';
import { jsonResponse, errorResponse, corsHeaders } from '../lib/cors';

interface Entry {
  id: string;
  date: string;
  time?: string;
  food: string;
  mood: number;
}

function entryFromRow(row: { id: string; date: string; time: string | null; food: string; mood: number }): Entry {
  return {
    id: row.id,
    date: row.date,
    time: row.time ?? undefined,
    food: row.food,
    mood: row.mood,
  };
}

export async function GET(request: Request): Promise<Response> {
  try {
    await ensureTable();
    const sql = getSql();
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (date) {
      const rows = await sql.query(
        'SELECT id, date, time, food, mood FROM entries WHERE date = $1 ORDER BY time ASC NULLS LAST',
        [date]
      );
      const entries = Array.isArray(rows) ? rows.map((r: { id: string; date: string; time: string | null; food: string; mood: number }) => entryFromRow(r)) : [];
      return jsonResponse(entries);
    }

    const rows = await sql.query('SELECT id, date, time, food, mood FROM entries ORDER BY date DESC, time ASC NULLS LAST');
    const entries = Array.isArray(rows) ? rows.map((r: { id: string; date: string; time: string | null; food: string; mood: number }) => entryFromRow(r)) : [];
    return jsonResponse(entries);
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : 'Server error', 500);
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request): Promise<Response> {
  try {
    await ensureTable();
    const body = (await request.json()) as Entry;
    const { id, date, time, food, mood } = body;
    if (!id || !date || !food || mood == null) {
      return errorResponse('Missing id, date, food or mood', 400);
    }
    const sql = getSql();
    await sql.query(
      'INSERT INTO entries (id, date, time, food, mood) VALUES ($1, $2, $3, $4, $5)',
      [id, date, time ?? null, food, mood]
    );
    return jsonResponse({ id }, 201);
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : 'Server error', 500);
  }
}
