// DESTINATION: src/app/api/msk-consult/route.js
// (Next.js App Router route handler. Do NOT put this in src/app/login/.)
//
// Server-side enforcement for MSK-Consult:
//  - Verifies the caller's Supabase access token (so user_id can't be spoofed).
//  - Reads/writes the daily budget ledger with the SERVICE ROLE key, bypassing RLS,
//    so a user can never edit their own "spent" value from the browser.
//  - Calls Anthropic directly (server-side) — the API key never reaches the client.
//
// ENV VARS REQUIRED (Vercel project settings):
//   ANTHROPIC_API_KEY            - already set for /api/generate, reused here
//   NEXT_PUBLIC_SUPABASE_URL     - already set
//   NEXT_PUBLIC_SUPABASE_ANON_KEY- already set (used only to validate the user's token)
//   SUPABASE_SERVICE_ROLE_KEY    - NEW. Get from Supabase project settings > API.
//                                  Server-only. Never prefix with NEXT_PUBLIC_.

import {
  MSK_CONSULT_MODEL,
  MSK_CONSULT_SYSTEM_PROMPT,
  DAILY_LIMIT_USD,
  calcCostUsd,
  localDateStr,
} from '../../login/mskConsultPrompt';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAX_TOKENS = 1024;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Validate the bearer token against Supabase Auth and return { id, email } or null.
async function getUserFromToken(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user?.id ? user : null;
  } catch (_e) {
    return null;
  }
}

// Service-role Supabase REST helpers (bypass RLS — server only).
function svcHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    ...extra,
  };
}

async function getUsageRow(userId, dateStr) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/msk_consult_usage?user_id=eq.${userId}&usage_date=eq.${dateStr}&select=*`,
    { headers: svcHeaders() }
  );
  if (!res.ok) throw new Error('Failed to read usage row');
  const rows = await res.json();
  return rows?.[0] || null;
}

function usagePayload(spent) {
  const remaining = Math.max(0, DAILY_LIMIT_USD - spent);
  const pctUsed = Math.min(100, (spent / DAILY_LIMIT_USD) * 100);
  return {
    spent,
    remaining,
    limit: DAILY_LIMIT_USD,
    pctUsed,
    locked: spent >= DAILY_LIMIT_USD,
  };
}

// ── GET: fetch today's usage (called on MSK-Consult panel mount) ──────────────
export async function GET(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const user = await getUserFromToken(token);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { searchParams } = new URL(req.url);
  const timezone = searchParams.get('timezone');
  const dateStr = localDateStr(timezone);

  try {
    const row = await getUsageRow(user.id, dateStr);
    const spent = row ? Number(row.spent_usd) : 0;
    return json({ date: dateStr, ...usagePayload(spent) });
  } catch (e) {
    console.error('msk-consult GET usage error:', e);
    return json({ error: 'Failed to load usage' }, 500);
  }
}

// ── POST: send a consult message ───────────────────────────────────────────────
export async function POST(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const user = await getUserFromToken(token);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  let body;
  try {
    body = await req.json();
  } catch (_e) {
    return json({ error: 'Invalid request body' }, 400);
  }
  const { message, history, timezone, conversationId } = body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return json({ error: 'Message is required' }, 400);
  }

  const dateStr = localDateStr(timezone);

  // 1) Check budget BEFORE calling Anthropic — server-side lockout.
  let existingRow;
  try {
    existingRow = await getUsageRow(user.id, dateStr);
  } catch (e) {
    console.error('msk-consult usage lookup error:', e);
    return json({ error: 'Failed to check usage' }, 500);
  }
  const spentSoFar = existingRow ? Number(existingRow.spent_usd) : 0;

  if (spentSoFar >= DAILY_LIMIT_USD) {
    return json(
      {
        error: 'LIMIT_REACHED',
        message: 'Daily consultation limit reached. Resets at midnight.',
        ...usagePayload(spentSoFar),
      },
      403
    );
  }

  // 2) Build full message history (multi-turn context preserved).
  const priorTurns = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content }))
    : [];
  const messages = [...priorTurns, { role: 'user', content: message }];

  // 3) Call Anthropic (server-side — key never exposed to client).
  let anthropicData;
  try {
    const aRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MSK_CONSULT_MODEL,
        max_tokens: MAX_TOKENS,
        system: MSK_CONSULT_SYSTEM_PROMPT,
        messages,
      }),
    });
    anthropicData = await aRes.json();
    if (!aRes.ok) {
      console.error('Anthropic API error:', JSON.stringify(anthropicData));
      return json({ error: 'AI request failed. Please try again.' }, 502);
    }
  } catch (e) {
    console.error('msk-consult Anthropic fetch error:', e);
    return json({ error: 'Network error contacting AI service.' }, 502);
  }

  const replyText = anthropicData?.content?.[0]?.text || '';
  const inputTokens = anthropicData?.usage?.input_tokens || 0;
  const outputTokens = anthropicData?.usage?.output_tokens || 0;
  const turnCost = calcCostUsd(inputTokens, outputTokens);
  const newSpent = spentSoFar + turnCost;

  // 4) Upsert the daily ledger (service role — client cannot write this table).
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/msk_consult_usage?on_conflict=user_id,usage_date`,
      {
        method: 'POST',
        headers: svcHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify([
          {
            user_id: user.id,
            usage_date: dateStr,
            spent_usd: newSpent,
            input_tokens: (existingRow?.input_tokens || 0) + inputTokens,
            output_tokens: (existingRow?.output_tokens || 0) + outputTokens,
            message_count: (existingRow?.message_count || 0) + 1,
            updated_at: new Date().toISOString(),
          },
        ]),
      }
    );
  } catch (e) {
    console.error('msk-consult usage upsert error:', e);
    // Reply already generated — don't fail the request over ledger write issues,
    // but log loudly since this is the enforcement mechanism.
  }

  // 5) Log both turns to Supabase (chat clears client-side, but is retained here).
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/msk_consult_messages`, {
      method: 'POST',
      headers: svcHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify([
        {
          user_id: user.id,
          conversation_id: conversationId || null,
          role: 'user',
          content: message,
          input_tokens: null,
          output_tokens: null,
          cost_usd: null,
        },
        {
          user_id: user.id,
          conversation_id: conversationId || null,
          role: 'assistant',
          content: replyText,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_usd: turnCost,
        },
      ]),
    });
  } catch (e) {
    console.error('msk-consult message log error:', e);
  }

  return json({
    reply: replyText,
    turnCost,
    ...usagePayload(newSpent),
  });
}
