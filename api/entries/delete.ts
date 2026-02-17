import { ensureTable, getSql } from '../lib/db.js';
import { errorResponse, corsHeaders } from '../lib/cors.js';

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request): Promise<Response> {
  try {
    await ensureTable();
    const body = (await request.json()) as { id?: string };
    const id = body.id;
    if (!id) return errorResponse('Missing id', 400);
    const sql = getSql();
    const result = await sql.query('DELETE FROM entries WHERE id = $1 RETURNING id', [id]);
    if (!Array.isArray(result) || result.length === 0) return errorResponse('Not found', 404);
    return new Response(null, { status: 204, headers: corsHeaders() });
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : 'Server error', 500);
  }
}
