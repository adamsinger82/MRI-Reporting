import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const expires = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];

    const { error } = await supabase
      .from('job_posts')
      .insert({ ...body, status: 'pending', expires_at: expires });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('recruiter_profiles')
      .select('credits_balance')
      .eq('user_id', body.user_id)
      .single();

    const newBalance = (profile?.credits_balance || 1) - 1;
    await supabase
      .from('recruiter_profiles')
      .update({ credits_balance: newBalance })
      .eq('user_id', body.user_id);

    return NextResponse.json({ ok: true, newBalance });
  } catch (e) {
    console.error('create-job-post error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}