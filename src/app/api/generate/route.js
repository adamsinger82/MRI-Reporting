// src/app/api/generate/route.js
// Smart API route: auto-routes to Haiku vs Sonnet, prompt caching, rate limiting

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// ─── CLIENTS ────────────────────────────────────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // server-side only — never expose this
);

// ─── MODEL ROUTING ──────────────────────────────────────────────────────────
// DDx uses Haiku (10x cheaper, quality is fine for pattern-matching DDx)
// Reports use Sonnet (needs nuanced language generation)
const MODEL_ROUTER = {
  report: 'claude-sonnet-4-6',
  ddx:    'claude-haiku-4-5-20251001',
};

// ─── DAILY LIMITS BY SUBSCRIPTION TIER ─────────────────────────────────────
// Store user tier in Supabase profiles table as: trial | resident | attending | power
const TIER_LIMITS = {
  trial:     { report: 10,  ddx: 5  },
  resident:  { report: 30,  ddx: 15 },
  attending: { report: 75,  ddx: 40 },
  power:     { report: 150, ddx: 75 },
};

// ─── RATE LIMIT CHECK ───────────────────────────────────────────────────────
async function checkRateLimit(userId, feature, tier = 'trial') {
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

  // Log this call
  await supabase.from('api_usage').insert({ user_id: userId, feature });

  return { allowed: true, count: count + 1, limit, tier };
}

// ─── CLEAN DDx PROMPT — strip empty fields ──────────────────────────────────
// Removes blank lines from DDx prompts so we don't waste tokens on empty fields
function cleanPrompt(text) {
  return text
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      // Remove lines that are just "Label: " with nothing after the colon
      if (/^[A-Za-z\s\/()]+:\s*$/.test(trimmed)) return false;
      // Remove lines with placeholder-only content
      if (/x10-3 mm2\/s$/.test(trimmed) && !/\d/.test(trimmed.split(':')[1] || '')) return false;
      return trimmed.length > 0;
    })
    .join('\n');
}

// ─── MAIN HANDLER ───────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      system,
      messages,
      max_tokens = 1000,
      feature = 'report',   // 'report' | 'ddx'
    } = body;

    // ── Auth ──────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let userId = 'anonymous';
    let userTier = 'trial';

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;

        // Fetch subscription tier from your profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', userId)
          .single();

        userTier = profile?.tier || 'trial';
      }
    }

    // ── Rate limit check ─────────────────────────────────────────────────
    const usage = await checkRateLimit(userId, feature, userTier);

    if (!usage.allowed) {
      return Response.json({
        error: `Daily limit reached — ${usage.count}/${usage.limit} ${feature} calls used today (${usage.tier} plan). Resets at midnight UTC.`,
        rateLimited: true,
        usage,
      }, { status: 429 });
    }

    // ── Model routing ────────────────────────────────────────────────────
    const model = MODEL_ROUTER[feature] || MODEL_ROUTER.report;

    // ── Prompt caching (Sonnet only — Haiku doesn't need it) ─────────────
    // Cache saves ~90% on repeated system prompt tokens within a 5-min window
    // Most valuable for radiologists generating multiple reports in one sitting
    const useCache = model.includes('sonnet');

    const systemPayload = useCache
      ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
      : system;

    // ── Clean prompt for DDx (strip empty fields) ────────────────────────
    const cleanedMessages = feature === 'ddx'
      ? messages.map(m => ({
          ...m,
          content: typeof m.content === 'string' ? cleanPrompt(m.content) : m.content
        }))
      : messages;

    // ── Call Anthropic ───────────────────────────────────────────────────
    const response = await anthropic.messages.create({
      model,
      max_tokens,
      system: systemPayload,
      messages: cleanedMessages,
    });

    // ── Return response + usage metadata ─────────────────────────────────
    return Response.json({
      ...response,
      _meta: {
        model,
        feature,
        callsToday: usage.count,
        dailyLimit: usage.limit,
        tier: userTier,
        cached: useCache,
      }
    });

  } catch (err) {
    console.error('API route error:', err);
    return Response.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
