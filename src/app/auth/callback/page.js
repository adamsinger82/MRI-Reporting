'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';

export default function AuthCallback() {
  const [status, setStatus] = useState('Confirming your account...');

  useEffect(() => {
    const handle = async () => {
      try {
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Supabase can put the token in either the hash or query params depending on flow
        const hash        = window.location.hash;
        const queryParams = new URLSearchParams(window.location.search);
        const hashParams  = new URLSearchParams(hash.replace('#', ''));

        const accessToken  = hashParams.get('access_token');
        const tokenHash    = queryParams.get('token_hash');
        const type         = hashParams.get('type') || queryParams.get('type') || 'signup';

        // --- Flow A: token_hash in query string (new Supabase email template format) ---
        if (tokenHash) {
          setStatus('Verifying your email...');
          const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': key },
            body: JSON.stringify({ token_hash: tokenHash, type: 'signup' }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.error || !verifyData.access_token) {
            setStatus('Confirmation link is invalid or expired. Please request a new one.');
            return;
          }

          await finishSetup(verifyData.access_token, verifyData.user?.id, key);
          return;
        }

        // --- Flow B: access_token in hash (legacy Supabase format) ---
        if (accessToken) {
          await finishSetup(accessToken, null, key);
          return;
        }

        setStatus('Invalid confirmation link. Please try signing up again.');
      } catch (e) {
        console.error('Auth callback error:', e);
        setStatus('Something went wrong. Please try logging in directly.');
      }
    };

    const finishSetup = async (accessToken, userId, key) => {
      // Check if there's a pending recruiter profile to create
      const pendingRaw = localStorage.getItem('pending_recruiter');

      if (pendingRaw) {
        setStatus('Setting up your recruiter account...');
        try {
          const pending = JSON.parse(pendingRaw);

          // Create the recruiter profile via server-side API route
          const profileRes = await fetch('/api/create-recruiter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pending),
          });

          if (profileRes.ok) {
            localStorage.removeItem('pending_recruiter');
            setStatus('Account confirmed! Redirecting to Recruiter Portal...');
            setTimeout(() => { window.location.href = '/recruiter'; }, 1000);
            return;
          } else {
            console.error('Profile create failed:', await profileRes.text());
          }
        } catch (e) {
          console.error('Recruiter profile setup error:', e);
        }
      }

      // No pending recruiter — check if they already have a recruiter_profiles row
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/recruiter_profiles?select=user_id&limit=1`,
        { headers: { 'apikey': key, 'Authorization': `Bearer ${accessToken}` } }
      );
      const profiles = await profileRes.json();

      if (Array.isArray(profiles) && profiles.length > 0) {
        setStatus('Account confirmed! Redirecting to Recruiter Portal...');
        setTimeout(() => { window.location.href = '/recruiter'; }, 1000);
      } else {
        setStatus('Account confirmed! Redirecting to LucidMSK...');
        setTimeout(() => { window.location.href = '/'; }, 1000);
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
        maxWidth: 420,
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
