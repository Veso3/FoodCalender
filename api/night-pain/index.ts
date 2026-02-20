import { ensureTable, getSql } from '../lib/db.js';
import { jsonResponse, errorResponse, corsHeaders } from '../lib/cors.js';

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request): Promise<Response> {
  try {
    await ensureTable();
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    if (!date) return errorResponse('Missing date', 400);
    const sql = getSql();
    const rows = await sql.query('SELECT date, pain, notes FROM night_pain WHERE date = $1', [date]);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return errorResponse('Not found', 404);
    const r = row as { date: string; pain: boolean; notes: string | null };
    return jsonResponse({ date: r.date, pain: r.pain, notes: r.notes ?? '' });
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : 'Server error', 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    await ensureTable();
    const body = (await request.json()) as { date?: string; pain?: boolean; notes?: string };
    const { date, pain, notes } = body;
    if (!date || pain === undefined) return errorResponse('Missing date or pain', 400);
    const sql = getSql();
    await sql.query(
      `INSERT INTO night_pain (date, pain, notes) VALUES ($1, $2, $3)
       ON CONFLICT (date) DO UPDATE SET pain = EXCLUDED.pain, notes = EXCLUDED.notes`,
      [date, Boolean(pain), notes ?? null]
    );
    return jsonResponse({ date, pain: Boolean(pain), notes: notes ?? '' }, 201);
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : 'Server error', 500);
  }
}
