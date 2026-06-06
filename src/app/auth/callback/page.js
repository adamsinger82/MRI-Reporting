'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';

export default function AuthCallback() {
  const [status, setStatus] = useState('Confirming your account...');

  useEffect(() => {
    const handle = async () => {
      try {
        // Supabase puts the token in the URL hash after confirmation
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken  = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type         = params.get('type'); // 'signup' or 'recovery'

        if (!accessToken) {
          setStatus('Invalid or expired confirmation link.');
          return;
        }

        // Check if this user has a recruiter_profiles row
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const profileRes = await fetch(
          `${SUPABASE_URL}/rest/v1/recruiter_profiles?select=user_id&limit=1`,
          { headers: { 'apikey': key, 'Authorization': `Bearer ${accessToken}` } }
        );
        const profiles = await profileRes.json();

        if (Array.isArray(profiles) && profiles.length > 0) {
          // Recruiter — send to recruiter portal
          setStatus('Account confirmed! Redirecting to Recruiter Portal...');
          window.location.href = '/recruiter';
        } else {
          // Main app user — send to main login
          setStatus('Account confirmed! Redirecting to LucidMSK...');
          window.location.href = '/';
        }
      } catch (e) {
        console.error('Auth callback error:', e);
        setStatus('Something went wrong. Please try logging in directly.');
      }
    };

    handle();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#060d18,#0c1a2e)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      gap: 20,
    }}>
      <div style={{ color: 'white', fontWeight: 800, fontSize: 20, letterSpacing: '0.08em' }}>
        Lucid<span style={{ color: '#5b9ef7' }}>MSK</span>
      </div>
      <div style={{
        background: 'rgba(99,179,237,0.06)',
        border: '1px solid rgba(99,179,237,0.2)',
        borderRadius: 12,
        padding: '28px 36px',
        textAlign: 'center',
        maxWidth: 400,
      }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>✉️</div>
        <div style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
          {status}
        </div>
        <div style={{ color: '#4a5568', fontSize: 12, marginTop: 12 }}>
          You will be redirected automatically.
        </div>
      </div>
    </div>
  );
}
