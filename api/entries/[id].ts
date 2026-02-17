import { ensureTable, getSql } from '../lib/db.js';
import { jsonResponse, errorResponse, corsHeaders } from '../lib/cors.js';

interface Entry {
  id: string;
  date: string;
  time?: string;
  food: string;
  mood: number;
}

function getIdFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const idSegment = segments[segments.length - 1];
  return idSegment && idSegment !== 'entries' ? idSegment : null;
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

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request): Promise<Response> {
  const id = getIdFromRequest(request);
  if (!id) return errorResponse('Missing id', 400);
  try {
    await ensureTable();
    const sql = getSql();
    const rows = await sql.query('SELECT id, date, time, food, mood FROM entries WHERE id = $1', [id]);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return errorResponse('Not found', 404);
    return jsonResponse(entryFromRow(row as { id: string; date: string; time: string | null; food: string; mood: number }));
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : 'Server error', 500);
  }
}

export async function PUT(request: Request): Promise<Response> {
  const id = getIdFromRequest(request);
  if (!id) return errorResponse('Missing id', 400);
  try {
    await ensureTable();
    const body = (await request.json()) as Entry;
    const { date, time, food, mood } = body;
    if (!date || !food || mood == null) return errorResponse('Missing date, food or mood', 400);
    const sql = getSql();
    const result = await sql.query(
      'UPDATE entries SET date = $1, time = $2, food = $3, mood = $4 WHERE id = $5 RETURNING id',
      [date, time ?? null, food, mood, id]
    );
    if (!Array.isArray(result) || result.length === 0) return errorResponse('Not found', 404);
    return jsonResponse({ id });
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : 'Server error', 500);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const id = getIdFromRequest(request);
  if (!id) return errorResponse('Missing id', 400);
  try {
    await ensureTable();
    const sql = getSql();
    const result = await sql.query('DELETE FROM entries WHERE id = $1 RETURNING id', [id]);
    if (!Array.isArray(result) || result.length === 0) return errorResponse('Not found', 404);
    return new Response(null, { status: 204, headers: corsHeaders() });
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : 'Server error', 500);
  }
}
