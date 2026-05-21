// src/app/api/generate/route.js
// Minimal version — model routing + Anthropic call, no Supabase dependency
// Rate limiting can be added once SUPABASE_SERVICE_ROLE_KEY is configured

const MODEL_ROUTER = {
  report: 'claude-sonnet-4-6',
  ddx:    'claude-haiku-4-5-20251001',
};

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      system,
      messages,
      max_tokens = 1000,
      feature = 'report',
    } = body;

    // Auto-select model based on feature
    const model = MODEL_ROUTER[feature] || MODEL_ROUTER.report;
    const useCache = model.includes('sonnet');

    // Prompt caching for Sonnet (saves tokens on repeated calls)
    const systemPayload = useCache
      ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
      : system;

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
        messages,
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
      _meta: { model, feature, cached: useCache },
    });

  } catch (err) {
    console.error('API route error:', err);
    return Response.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
