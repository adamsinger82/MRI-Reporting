// src/app/api/generate/route.js
// Smart API route: auto-routes to Haiku vs Sonnet, prompt caching, rate limiting

import { createClient } from '@supabase/supabase-js';

// ─── SUPABASE CLIENT FACTORY ─────────────────────────────────────────────────
// Function (not module-level const) so env vars are available at request time
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// ─── MODEL ROUTING ──────────────────────────────────────────────────────────
const MODEL_ROUTER = {
  report: 'claude-sonnet-4-6',
  ddx:    'claude-haiku-4-5-20251001',
};

// ─── DAILY LIMITS BY TIER ───────────────────────────────────────────────────
const TIER_LIMITS = {
  trial:     { report: 10,  ddx: 5  },
  resident:  { report: 30,  ddx: 15 },
  attending: { report: 75,  ddx: 40 },
  power:     { report: 150, ddx: 75 },
};

// ─── RATE LIMIT CHECK ───────────────────────────────────────────────────────
async function checkRateLimit(supabase, userId, feature, tier = 'trial') {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', todayStart.toISOString());

  if (error) throw new Error('Usage check failed: ' + error.message);

  const limits = TIER_LIMITS[tier] || TIER_LIMITS.trial;
  const limit  = limits[feature] || 10;

  if (count >= limit) {
    return { allowed: false, count, limit, tier };
  }

  await supabase.from('api_usage').insert({ user_id: userId, feature });
  return { allowed: true, count: count + 1, limit, tier };
}

// ─── CLEAN DDx PROMPT — strip empty fields to save tokens ───────────────────
function cleanPrompt(text) {
  return text
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      if (/^[A-Za-z\s\/()]+:\s*$/.test(trimmed)) return false;
      if (/x10-3 mm2\/s$/.test(trimmed) && !/\d/.test(trimmed.split(':')[1] || '')) return false;
      return trimmed.length > 0;
    })
    .join('\n');
}

// ─── MAIN HANDLER ───────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    // Create Supabase client here — env vars available at request time
    const supabase = getSupabase();

    const body = await request.json();
    const {
      system,
      messages,
      max_tokens = 1000,
      feature = 'report',
    } = body;

    // ── Auth ─────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let userId = 'anonymous';
    let userTier = 'trial';

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', userId)
          .single();
        userTier = profile?.tier || 'trial';
      }
    }

    // ── Rate limit ───────────────────────────────────────────────────────
    const usage = await checkRateLimit(supabase, userId, feature, userTier);

    if (!usage.allowed) {
      return Response.json({
        error: `Daily limit reached — ${usage.count}/${usage.limit} ${feature} calls used today (${usage.tier} plan). Resets at midnight UTC.`,
        rateLimited: true,
        usage,
      }, { status: 429 });
    }

    // ── Model routing ────────────────────────────────────────────────────
    const model = MODEL_ROUTER[feature] || MODEL_ROUTER.report;
    const useCache = model.includes('sonnet');

    // ── Prompt caching for Sonnet ────────────────────────────────────────
    const systemPayload = useCache
      ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
      : system;

    // ── Strip empty DDx fields ───────────────────────────────────────────
    const cleanedMessages = feature === 'ddx'
      ? messages.map(m => ({
          ...m,
          content: typeof m.content === 'string' ? cleanPrompt(m.content) : m.content
        }))
      : messages;

    // ── Call Anthropic API ───────────────────────────────────────────────
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system: systemPayload,
        messages: cleanedMessages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return Response.json(
        { error: data?.error?.message || 'Anthropic API error' },
        { status: anthropicRes.status }
      );
    }

    return Response.json({
      ...data,
      _meta: {
        model,
        feature,
        callsToday: usage.count,
        dailyLimit: usage.limit,
        tier: userTier,
        cached: useCache,
      },
    });

  } catch (err) {
    console.error('API route error:', err);
    return Response.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
