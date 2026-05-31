// src/app/api/notify-admin/route.js

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;

    // Log key presence (not the value) for debugging
    console.log('RESEND_API_KEY present:', !!apiKey);
    console.log('RESEND_API_KEY length:', apiKey?.length);
    console.log('Sending to:', to);

    if (!apiKey) {
      console.error('RESEND_API_KEY is missing from environment');
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'LucidMSK <noreply@lucidmsk.com>',
        to: [to],
        subject,
        html,
      }),
    });

    const responseText = await response.text();
    console.log('Resend status:', response.status);
    console.log('Resend response:', responseText);

    if (!response.ok) {
      console.error('Resend rejected:', response.status, responseText);
      return new Response(JSON.stringify({ error: 'Email send failed', detail: responseText }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('notify-admin exception:', error.message);
    return new Response(JSON.stringify({ error: 'Internal error', detail: error.message }), { status: 500 });
  }
}