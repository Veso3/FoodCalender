import { ensureTable, getSql } from '../lib/db.js';
import { jsonResponse, errorResponse, corsHeaders } from '../lib/cors.js';

interface Entry {
  id: string;
  date: string;
  time?: string;
  food: string;
  mood: number;
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request): Promise<Response> {
  try {
    await ensureTable();
    const body = (await request.json()) as Entry;
    const { id, date, time, food, mood } = body;
    if (!id || !date || !food || mood == null) return errorResponse('Missing id, date, food or mood', 400);
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
