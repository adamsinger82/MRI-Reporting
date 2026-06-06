import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  try {
    const { user_id, company_name, contact_name, email } = await request.json();

    if (!user_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/recruiter_profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ user_id, company_name, contact_name, email, post_credits: 0 }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('recruiter_profiles insert error:', err);
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('create-recruiter error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
