// ============================================================
// LucidMSK — Admin Notification API Route
// File: app/api/notify-admin/route.js
//
// This handles sending the admin notification email when a
// new job post is submitted.
//
// SETUP: This uses Resend (free tier = 3,000 emails/mo).
//   1. Sign up at resend.com
//   2. Add your domain (lucidmsk.com) and verify it
//   3. Get your API key
//   4. Add to Vercel env vars: RESEND_API_KEY=re_xxxx
//
// Alternative: If you already have a Supabase email setup,
// you can replace the fetch below with a Supabase edge function call.
// ============================================================

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    // ── Send via Resend ──────────────────────────────────────
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'LucidMSK <noreply@lucidmsk.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Email send failed' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Notify admin error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}