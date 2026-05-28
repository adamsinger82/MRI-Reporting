// src/app/api/moderate-comment/route.js
// Moderation endpoint using claude-haiku-4-5 — minimal token use.
// Input:  { text: string }
// Output: { blocked: bool, reason?: string }
// Fails CLOSED — if anything goes wrong, comment is blocked (not passed through).

export async function POST(req) {
  let text = '';
  try {
    const body = await req.json();
    text = body?.text?.trim() || '';
    if (!text) return Response.json({ blocked: true, reason: 'Empty comment.' });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 20,
        system: `You are a content moderator for a professional MSK radiology journal club.
Reply with exactly one of:
PASS
BLOCK:<short reason>

Block if the comment contains: profanity, personal attacks, hate speech, spam, commercial promotion, medical misinformation, or content entirely unrelated to radiology/medicine.
Allow: methodology criticism, disagreement with conclusions, clinical questions, alternative interpretations, study limitations.`,
        messages: [{ role: 'user', content: text.slice(0, 500) }],
      }),
    });

    if (!res.ok) {
      console.error('Anthropic API error:', res.status);
      return Response.json({ blocked: true, reason: 'Moderation service error. Please try again.' });
    }

    const data = await res.json();
    const verdict = data?.content?.[0]?.text?.trim() || '';

    if (!verdict) {
      return Response.json({ blocked: true, reason: 'Moderation service error. Please try again.' });
    }

    if (verdict.startsWith('BLOCK')) {
      const reason = verdict.slice(6).trim() || 'Comment does not meet community guidelines.';
      return Response.json({ blocked: true, reason });
    }

    return Response.json({ blocked: false });

  } catch (err) {
    // Fail CLOSED — block comment if anything goes wrong
    console.error('Moderation error:', err);
    return Response.json({ blocked: true, reason: 'Moderation service unavailable. Please try again.' });
  }
}
