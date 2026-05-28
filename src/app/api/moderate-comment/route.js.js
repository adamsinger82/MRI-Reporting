// src/app/api/moderate-comment/route.js
// Ultra-minimal moderation endpoint — uses claude-haiku-4-5 only.
// Input:  { text: string }
// Output: { blocked: bool, reason?: string }
// Typical cost: ~$0.0001 per call (negligible).

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) return Response.json({ blocked: true, reason: 'Empty comment.' });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 20,   // Only needs to say PASS or BLOCK:reason
        system: `You are a content moderator for a professional MSK radiology journal club.
Reply with exactly one of:
PASS
BLOCK:<short reason>

Block if the comment contains: profanity, personal attacks, hate speech, spam, commercial promotion, medical misinformation, or content entirely unrelated to radiology/medicine.
Allow: methodology criticism, disagreement with conclusions, clinical questions, alternative interpretations, study limitations.`,
        messages: [{ role: 'user', content: text.slice(0, 500) }],
      }),
    });

    const data = await res.json();
    const verdict = data?.content?.[0]?.text?.trim() || 'PASS';

    if (verdict.startsWith('BLOCK')) {
      const reason = verdict.slice(6).trim() || 'Comment does not meet community guidelines.';
      return Response.json({ blocked: true, reason });
    }
    return Response.json({ blocked: false });
  } catch (err) {
    // On any error, allow the comment through (fail open — don't punish users for server errors)
    console.error('Moderation error:', err);
    return Response.json({ blocked: false });
  }
}
