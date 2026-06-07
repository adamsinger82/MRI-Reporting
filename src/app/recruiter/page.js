'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL || 'https://lucidmsk.com';

const sbHeaders = (token) => ({
  'Content-Type':  'application/json',
  'apikey':        SUPABASE_ANON,
  'Authorization': `Bearer ${token || SUPABASE_ANON}`,
});
const sbUrl = (path) => `${SUPABASE_URL}/rest/v1/${path}`;

// ── Stripe credit packages ───────────────────────────────────────────────────
const PACKAGES = [
  { id: 'starter', credits: 1, price: '$149', label: '1 job post',  perPost: '$149' },
  { id: 'value',   credits: 3, price: '$399', label: '3 job posts', perPost: '$133', badge: 'Popular' },
  { id: 'pro',     credits: 5, price: '$599', label: '5 job posts', perPost: '$120', badge: 'Best value' },
];

const JOB_TYPES = [
  'Full-Time Clinical',
  'Part-Time / PRN',
  'Academic / Research',
  'Fellowship',
  'Locum Tenens',
  'Industry / Non-Clinical',
  'International',
];

const emptyForm = {
  title: '', specialty: '', location: '', job_type: 'Full-Time Clinical',
  salary_range: '', apply_link: '', description: '',
};

// ── Shared styles ────────────────────────────────────────────────────────────
const s = {
  page:    { minHeight:'100vh', background:'#060e1a', fontFamily:'system-ui,-apple-system,sans-serif', color:'#e2e8f0' },
  card:    { background:'#0f172a', border:'1px solid rgba(99,179,237,0.12)', borderRadius:16, padding:'32px' },
  inp:     { background:'#1a2332', border:'1px solid rgba(99,179,237,0.2)', borderRadius:8, color:'#e2e8f0', fontSize:13, padding:'10px 14px', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' },
  lbl:     { color:'#90cdf4', fontSize:11, fontWeight:700, letterSpacing:'0.06em', display:'block', marginBottom:5, textTransform:'uppercase' },
  btn:     { padding:'12px 28px', background:'linear-gradient(135deg,rgba(99,179,237,0.25),rgba(99,179,237,0.1))', border:'1px solid rgba(99,179,237,0.4)', borderRadius:10, color:'#90cdf4', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s', display:'inline-block' },
  btnGray: { padding:'10px 22px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#94a3b8', fontSize:13, fontWeight:600, cursor:'pointer' },
  err:     { color:'#fc8181', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 },
  ok:      { color:'#68d391', background:'rgba(104,211,145,0.08)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 },
};

// ── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ fontSize:22 }}>🩻</span>
      <span style={{ fontFamily:'Rajdhani, system-ui, sans-serif', fontWeight:700, fontSize:20, color:'white', letterSpacing:'0.06em' }}>LucidMSK</span>
      <span style={{ background:'rgba(99,179,237,0.1)', border:'1px solid rgba(99,179,237,0.25)', color:'#90cdf4', fontSize:10, fontWeight:700, borderRadius:6, padding:'2px 8px', letterSpacing:'0.05em' }}>RECRUITER</span>
    </div>
  );
}

// ── LANDING VIEW ─────────────────────────────────────────────────────────────
function LandingView({ onSignup, onLogin }) {
  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'64px 24px', textAlign:'center' }}>
      <div style={{ marginBottom:40 }}>
        <Logo />
      </div>
      <h1 style={{ fontSize:36, fontWeight:800, color:'white', margin:'0 0 16px', lineHeight:1.2 }}>
        Reach MSK Radiology's<br/>Most Engaged Audience
      </h1>
      <p style={{ color:'#718096', fontSize:16, lineHeight:1.7, maxWidth:480, margin:'0 auto 40px' }}>
        Post open roles directly to LucidMSK — a platform built specifically for MSK and orthopedic radiologists.
      </p>
      <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:56 }}>
        <button style={s.btn} onClick={onSignup}>Get started →</button>
        <button style={s.btnGray} onClick={onLogin}>Sign in</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, textAlign:'left' }}>
        {[
          { icon:'🎯', title:'MSK-specific audience', body:'Every subscriber is an MSK or orthopedic radiologist.' },
          { icon:'⚡', title:'Live within 24 hours', body:'Posts reviewed and approved by our admin team quickly.' },
          { icon:'📅', title:'30-day listings', body:'Your post stays live for a full month per credit used.' },
        ].map(f => (
          <div key={f.title} style={{ ...s.card, padding:'20px 24px' }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{f.icon}</div>
            <div style={{ color:'#e2e8f0', fontWeight:700, fontSize:14, marginBottom:6 }}>{f.title}</div>
            <div style={{ color:'#718096', fontSize:13, lineHeight:1.6 }}>{f.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SIGNUP VIEW ───────────────────────────────────────────────────────────────
function SignupView({ onBack }) {
  const [form, setForm] = useState({ email:'', password:'', org:'', contact_name:'' });
  const [err,  setErr]  = useState('');
  const [ok,   setOk]   = useState('');
  const [busy, setBusy] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(''); setOk('');
    if (!form.email || !form.password || !form.org || !form.contact_name)
      return setErr('All fields are required.');
    if (form.password.length < 8)
      return setErr('Password must be at least 8 characters.');
    setBusy(true);
    try {
      const res = await fetch('/api/create-recruiter', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          email:        form.email,
          password:     form.password,
          org_name:     form.org,
          contact_name: form.contact_name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setOk('Account created! Check your email to confirm, then sign in.');
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth:480, margin:'0 auto', padding:'48px 24px' }}>
      <button onClick={onBack} style={{ ...s.btnGray, marginBottom:28, fontSize:12 }}>← Back</button>
      <div style={s.card}>
        <div style={{ color:'#90cdf4', fontWeight:800, fontSize:18, marginBottom:4 }}>Create recruiter account</div>
        <div style={{ color:'#4a5568', fontSize:13, marginBottom:24 }}>Free to join — pay per job post</div>
        {err && <div style={s.err}>{err}</div>}
        {ok  && <div style={s.ok}>{ok}</div>}
        {!ok && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div><label style={s.lbl}>Contact name *</label><input style={s.inp} value={form.contact_name} onChange={set('contact_name')} placeholder="Dr. Jane Smith" /></div>
            <div><label style={s.lbl}>Organization *</label><input style={s.inp} value={form.org} onChange={set('org')} placeholder="Mayo Clinic / Stryker / etc." /></div>
            <div><label style={s.lbl}>Email *</label><input style={s.inp} type="email" value={form.email} onChange={set('email')} placeholder="you@organization.com" /></div>
            <div><label style={s.lbl}>Password *</label><input style={s.inp} type="password" value={form.password} onChange={set('password')} placeholder="8+ characters" /></div>
            <button style={{ ...s.btn, alignSelf:'flex-start', marginTop:4 }} onClick={submit} disabled={busy}>
              {busy ? 'Creating account...' : 'Create account →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LOGIN VIEW ────────────────────────────────────────────────────────────────
function LoginView({ onBack, onLoggedIn }) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr('');
    if (!email || !password) return setErr('Email and password required.');
    setBusy(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'apikey': SUPABASE_ANON },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error_description || data.error || 'Login failed');

      // Fetch recruiter profile
      const profRes = await fetch(
        sbUrl(`recruiter_profiles?user_id=eq.${data.user.id}&select=*`),
        { headers: sbHeaders(data.access_token) }
      );
      const profiles = await profRes.json();
      if (!Array.isArray(profiles) || profiles.length === 0)
        throw new Error('No recruiter profile found. Please sign up first.');

      onLoggedIn({ ...data, profile: profiles[0] });
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth:440, margin:'0 auto', padding:'48px 24px' }}>
      <button onClick={onBack} style={{ ...s.btnGray, marginBottom:28, fontSize:12 }}>← Back</button>
      <div style={s.card}>
        <div style={{ color:'#90cdf4', fontWeight:800, fontSize:18, marginBottom:24 }}>Recruiter sign in</div>
        {err && <div style={s.err}>{err}</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div><label style={s.lbl}>Email</label><input style={s.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@organization.com" /></div>
          <div><label style={s.lbl}>Password</label><input style={s.inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&submit()} /></div>
          <button style={{ ...s.btn, alignSelf:'flex-start', marginTop:4 }} onClick={submit} disabled={busy}>
            {busy ? 'Signing in...' : 'Sign in →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD HEADER ──────────────────────────────────────────────────────────
function DashHeader({ profile, credits, onPost, onBuy, onLogout }) {
  return (
    <div style={{ background:'#0c1829', borderBottom:'1px solid rgba(99,179,237,0.1)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
      <Logo />
      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        {/* Credit badge */}
        <div style={{ background:'rgba(99,179,237,0.06)', border:'1px solid rgba(99,179,237,0.15)', borderRadius:10, padding:'6px 14px', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:'#90cdf4', fontSize:13, fontWeight:700 }}>{credits}</span>
          <span style={{ color:'#4a5568', fontSize:12 }}>credit{credits !== 1 ? 's' : ''}</span>
        </div>
        <button style={{ ...s.btn, padding:'8px 18px', fontSize:13 }} onClick={onPost} disabled={credits < 1} title={credits < 1 ? 'Buy credits to post' : ''}>
          ✍️ Post a job
        </button>
        <button style={{ ...s.btn, padding:'8px 18px', fontSize:13, background:'linear-gradient(135deg,rgba(104,211,145,0.2),rgba(104,211,145,0.08))', borderColor:'rgba(104,211,145,0.4)', color:'#68d391' }} onClick={onBuy}>
          💳 Buy credits
        </button>
        <button style={s.btnGray} onClick={onLogout}>Sign out</button>
      </div>
    </div>
  );
}

// ── MY POSTS LIST ─────────────────────────────────────────────────────────────
function MyPosts({ session }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          sbUrl(`job_posts?user_id=eq.${session.user.id}&order=created_at.desc&select=*`),
          { headers: sbHeaders(session.access_token) }
        );
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch(e) { console.error('MyPosts load error:', e); }
      setLoading(false);
    };
    load();
  }, [session]);

  if (loading) return <p style={{ color:'#4a5568', fontSize:13 }}>Loading your posts...</p>;
  if (posts.length === 0) return (
    <div style={{ textAlign:'center', color:'#4a5568', padding:'48px 24px' }}>
      <div style={{ fontSize:36, marginBottom:12 }}>🩻</div>
      <div style={{ fontSize:14 }}>No posts yet. Use "Post a job" above to create your first listing.</div>
    </div>
  );

  const statusColor = s => ({ approved:'#68d391', pending:'#f6bd40', removed:'#fc8181' }[s] || '#718096');
  const statusBg    = s => ({ approved:'rgba(104,211,145,0.08)', pending:'rgba(246,189,64,0.08)', removed:'rgba(245,101,101,0.08)' }[s] || '');

  return (
    <div>
      {posts.map(p => (
        <div key={p.id} style={{ background:'#0f172a', border:'1px solid rgba(99,179,237,0.08)', borderRadius:12, padding:'18px 20px', marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap' }}>
            <div style={{ color:'#e2e8f0', fontSize:15, fontWeight:700 }}>{p.title}</div>
            <span style={{ background:statusBg(p.status), color:statusColor(p.status), borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:700, border:`1px solid ${statusColor(p.status)}40` }}>
              {p.status}
            </span>
          </div>
          <div style={{ color:'#718096', fontSize:12, marginTop:6 }}>
            🏥 {p.institution} · 📍 {p.location} · 💼 {p.job_type}
          </div>
          {p.status === 'pending' && (
            <div style={{ color:'#4a5568', fontSize:12, marginTop:8 }}>⏳ Awaiting admin review — usually within 24 hours</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── POST A JOB VIEW ───────────────────────────────────────────────────────────
function PostJobView({ session, credits, onSuccess, onBack }) {
  const [form, setForm] = useState(emptyForm);
  const [err,  setErr]  = useState('');
  const [ok,   setOk]   = useState('');
  const [busy, setBusy] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(''); setOk('');
    if (!form.title.trim())       return setErr('Job title is required.');
    if (!form.specialty.trim())   return setErr('Institution is required.');
    if (!form.location.trim())    return setErr('Location is required.');
    if (!form.apply_link.trim())  return setErr('Application link or email is required.');
    if (!form.description.trim()) return setErr('Description is required.');
    if (credits < 1)              return setErr('You have no credits. Please buy credits first.');

    setBusy(true);
    try {
      // ── Submit via server-side API (bypasses RLS using service role key) ──
      const postRes = await fetch('/api/create-job-post', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, user_id: session.user.id }),
      });
      if (!postRes.ok) {
        const e = await postRes.json();
        throw new Error(e.error || 'Submission failed');
      }
      const { newBalance } = await postRes.json();

      onSuccess(newBalance);

    } catch(e) {
      console.error('submitJob error:', e);
      setErr('Submission failed. Please try again.');
    }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'32px 24px' }}>
      <button onClick={onBack} style={{ ...s.btnGray, marginBottom:24, fontSize:12 }}>← Back to dashboard</button>
      <div style={s.card}>
        <div style={{ color:'#90cdf4', fontWeight:800, fontSize:18, marginBottom:4 }}>Post a job</div>
        <p style={{ color:'#4a5568', fontSize:13, marginBottom:24 }}>
          MSK radiology roles only. Posts are reviewed within 24 hours. <b style={{ color:'#90cdf4' }}>1 credit will be deducted</b> when submitted.
        </p>

        {err && <div style={s.err}>{err}</div>}
        {ok  && <div style={s.ok}>{ok}</div>}

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={s.lbl}>Job title *</label><input style={s.inp} value={form.title} onChange={set('title')} placeholder="MSK Radiologist — Academic Practice" /></div>
            <div><label style={s.lbl}>Institution / Organization *</label><input style={s.inp} value={form.specialty} onChange={set('specialty')} placeholder="Mayo Clinic" /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={s.lbl}>Location *</label><input style={s.inp} value={form.location} onChange={set('location')} placeholder="City, State / Remote" /></div>
            <div>
              <label style={s.lbl}>Job type *</label>
              <select style={s.inp} value={form.job_type} onChange={set('job_type')}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={s.lbl}>Salary range <span style={{ color:'#374151', fontWeight:400, textTransform:'none' }}>(optional)</span></label><input style={s.inp} value={form.salary_range} onChange={set('salary_range')} placeholder="$400k–$500k / Competitive" /></div>
            <div><label style={s.lbl}>Application link or email *</label><input style={s.inp} value={form.apply_link} onChange={set('apply_link')} placeholder="https://careers.org/job or hr@org.com" /></div>
          </div>
          <div>
            <label style={s.lbl}>Job description *</label>
            <textarea style={{ ...s.inp, minHeight:120, resize:'vertical' }} value={form.description} onChange={set('description')} placeholder="Describe the role, responsibilities, qualifications..." />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <button onClick={submit} disabled={busy || credits < 1} style={{ ...s.btn, opacity:(busy || credits < 1)?0.5:1, cursor:(busy || credits < 1)?'not-allowed':'pointer' }}>
              {busy ? '⏳ Submitting...' : `📤 Submit for review (uses 1 credit — ${credits} remaining)`}
            </button>
            {credits < 1 && <span style={{ color:'#fc8181', fontSize:12 }}>⚠️ No credits remaining — buy credits first</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BUY CREDITS VIEW ──────────────────────────────────────────────────────────
function BuyCreditsView({ session, onBack }) {
  const [busy, setBusy] = useState(null); // tracks which package is being purchased

  const checkout = async (pkg) => {
    setBusy(pkg.id);
    try {
      const res = await fetch('/api/create-checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          packageId:      pkg.id,
          recruiterId:    session.profile.id,
          recruiterEmail: session.user.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url; // redirect to Stripe
    } catch(e) {
      alert('Checkout error: ' + e.message);
    }
    setBusy(null);
  };

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'32px 24px' }}>
      <button onClick={onBack} style={{ ...s.btnGray, marginBottom:28, fontSize:12 }}>← Back to dashboard</button>
      <div style={{ color:'#90cdf4', fontWeight:800, fontSize:22, marginBottom:6 }}>Buy job post credits</div>
      <p style={{ color:'#4a5568', fontSize:14, marginBottom:32, lineHeight:1.6 }}>
        Each credit = one 30-day job listing on LucidMSK. Posts go live after admin review (usually within 24 hours). Credits never expire.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:16, marginBottom:32 }}>
        {PACKAGES.map(pkg => (
          <div key={pkg.id} style={{ background:'#0f172a', border:`1px solid ${pkg.badge ? 'rgba(99,179,237,0.35)' : 'rgba(99,179,237,0.1)'}`, borderRadius:16, padding:'28px 24px', position:'relative', display:'flex', flexDirection:'column', gap:8 }}>
            {pkg.badge && (
              <span style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'rgba(99,179,237,0.15)', border:'1px solid rgba(99,179,237,0.4)', color:'#90cdf4', fontSize:10, fontWeight:700, borderRadius:20, padding:'3px 12px', whiteSpace:'nowrap' }}>
                {pkg.badge}
              </span>
            )}
            <div style={{ color:'#e2e8f0', fontSize:28, fontWeight:800 }}>{pkg.price}</div>
            <div style={{ color:'#90cdf4', fontSize:15, fontWeight:700 }}>{pkg.label}</div>
            <div style={{ color:'#4a5568', fontSize:12 }}>{pkg.perPost} per post</div>
            <button
              onClick={() => checkout(pkg)}
              disabled={busy !== null}
              style={{ ...s.btn, marginTop:12, textAlign:'center', padding:'10px 16px', fontSize:13, opacity:busy !== null ? 0.6 : 1, cursor:busy !== null ? 'wait' : 'pointer' }}>
              {busy === pkg.id ? '⏳ Redirecting...' : 'Buy now →'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ ...s.card, background:'rgba(99,179,237,0.03)', padding:'18px 22px' }}>
        <div style={{ color:'#90cdf4', fontSize:13, fontWeight:700, marginBottom:6 }}>🔒 Secure checkout via Stripe</div>
        <div style={{ color:'#4a5568', fontSize:12, lineHeight:1.7 }}>
          You'll be redirected to Stripe's hosted checkout. We never store your card details. Credits appear in your account automatically after payment is confirmed.
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD VIEW ────────────────────────────────────────────────────────────
function DashboardView({ session, credits, onCreditsChange }) {
  const [view, setView] = useState('home'); // home | post | buy

  const handlePostSuccess = (newBalance) => {
    onCreditsChange(newBalance);
    setView('home');
  };

  if (view === 'post') return <PostJobView session={session} credits={credits} onSuccess={handlePostSuccess} onBack={() => setView('home')} />;
  if (view === 'buy')  return <BuyCreditsView session={session} onBack={() => setView('home')} />;

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'32px 24px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ color:'#e2e8f0', fontWeight:800, fontSize:18 }}>
            Welcome, {session.profile?.contact_name || session.user.email}
          </div>
          <div style={{ color:'#4a5568', fontSize:13, marginTop:2 }}>{session.profile?.org_name}</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button style={{ ...s.btn, padding:'9px 18px', fontSize:13, opacity: credits < 1 ? 0.5 : 1 }} onClick={() => setView('post')} disabled={credits < 1}>
            ✍️ Post a job
          </button>
          <button style={{ ...s.btn, padding:'9px 18px', fontSize:13, background:'linear-gradient(135deg,rgba(104,211,145,0.2),rgba(104,211,145,0.08))', borderColor:'rgba(104,211,145,0.4)', color:'#68d391' }} onClick={() => setView('buy')}>
            💳 Buy credits
          </button>
        </div>
      </div>

      {credits < 1 && (
        <div style={{ background:'rgba(246,189,64,0.06)', border:'1px solid rgba(246,189,64,0.2)', borderRadius:10, padding:'14px 18px', marginBottom:20, color:'#f6bd40', fontSize:13 }}>
          💳 You have no credits. <button style={{ color:'#f6bd40', background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:0, fontSize:13 }} onClick={() => setView('buy')}>Buy credits →</button> to post a job.
        </div>
      )}

      <div style={{ color:'#90cdf4', fontWeight:700, fontSize:15, marginBottom:14, paddingBottom:10, borderBottom:'1px solid rgba(99,179,237,0.08)' }}>
        Your job posts
      </div>
      <MyPosts session={session} />
    </div>
  );
}

// ── ROOT PAGE COMPONENT ───────────────────────────────────────────────────────
export default function RecruiterPage() {
  const [view,    setView]    = useState('landing'); // landing | signup | login | dashboard
  const [session, setSession] = useState(null);
  const [credits, setCredits] = useState(0);

  // Handle Stripe redirect back (success / cancelled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const co = params.get('checkout');
    if (co === 'success') {
      const c = parseInt(params.get('credits') || '0', 10);
      alert(`✅ Payment successful! ${c} credit${c !== 1 ? 's' : ''} added to your account.`);
      // Clean up URL
      window.history.replaceState({}, '', '/recruiter');
    } else if (co === 'cancelled') {
      window.history.replaceState({}, '', '/recruiter');
    }
  }, []);

  // Persist session in sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('recruiter_session');
      if (stored) {
        const sess = JSON.parse(stored);
        setSession(sess);
        setCredits(sess.profile?.credits_balance ?? 0);
        setView('dashboard');
      }
    } catch(_) {}
  }, []);

  const handleLoggedIn = (sess) => {
    sessionStorage.setItem('recruiter_session', JSON.stringify(sess));
    setSession(sess);
    setCredits(sess.profile?.credits_balance ?? 0);
    setView('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('recruiter_session');
    setSession(null);
    setView('landing');
  };

  // Refresh credits from DB after a post is submitted
  const refreshCredits = async () => {
    if (!session) return;
    try {
      const res = await fetch(
        sbUrl(`recruiter_profiles?user_id=eq.${session.user.id}&select=credits_balance`),
        { headers: sbHeaders(session.access_token) }
      );
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const fresh = data[0].credits_balance ?? 0;
        setCredits(fresh);
        const updated = { ...session, profile: { ...session.profile, credits_balance: fresh } };
        setSession(updated);
        sessionStorage.setItem('recruiter_session', JSON.stringify(updated));
      }
    } catch(e) { console.error('refreshCredits error:', e); }
  };

  // After Stripe success redirect, refresh credits from DB
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success' && session) {
      // Give webhook a moment to process, then refresh
      setTimeout(refreshCredits, 1500);
    }
  }, [session]);

  return (
    <div style={s.page}>
      {/* Rajdhani font for logo */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');`}</style>

      {/* Top nav (shown only when logged in) */}
      {view === 'dashboard' && session && (
        <DashHeader
          profile={session.profile}
          credits={credits}
          onPost={() => {}} // handled inside DashboardView
          onBuy={() => {}}
          onLogout={handleLogout}
        />
      )}

      {/* Views */}
      {view === 'landing'   && <LandingView   onSignup={() => setView('signup')} onLogin={() => setView('login')} />}
      {view === 'signup'    && <SignupView     onBack={() => setView('landing')} />}
      {view === 'login'     && <LoginView      onBack={() => setView('landing')} onLoggedIn={handleLoggedIn} />}
      {view === 'dashboard' && session && (
        <DashboardView
          session={session}
          credits={credits}
          onCreditsChange={(newBalance) => {
            setCredits(newBalance);
            const updated = { ...session, profile: { ...session.profile, credits_balance: newBalance } };
            setSession(updated);
            sessionStorage.setItem('recruiter_session', JSON.stringify(updated));
          }}
        />
      )}
    </div>
  );
}
