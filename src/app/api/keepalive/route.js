// src/app/api/keepalive/route.js
// LucidMSK — Supabase keep-alive ping.
// Called on a schedule by Vercel Cron (see vercel.json).
// READ-ONLY: a single GET with limit=1. Never writes or alters any data.
// /api/ routes are already allowed through middleware.js without auth.

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Optional protection: if CRON_SECRET is set in Vercel, Vercel Cron sends it automatically.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return Response.json({ ok: false, error: 'Missing Supabase env vars' }, { status: 500 });
  }

  try {
    const res = await fetch(`${url}/rest/v1/cme_modules?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });
    return Response.json({ ok: res.ok, status: res.status, at: new Date().toISOString() });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
