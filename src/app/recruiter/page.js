'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';

const RECRUITER_PLANS = [
  { id:'single',   label:'Single Post',   price:149,  posts:1,  days:30, highlight:false, badge:'' },
  { id:'triple',   label:'3-Pack',        price:349,  posts:3,  days:30, highlight:true,  badge:'Most Popular' },
  { id:'bundle',   label:'6-Pack Bundle', price:599,  posts:6,  days:45, highlight:false, badge:'Best Value' },
];

export default function RecruiterPage() {
  const [view, setView]           = useState('landing');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [company, setCompany]     = useState('');
  const [contactName, setContact] = useState('');
  const [authErr, setAuthErr]     = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [recruiter, setRecruiter] = useState(null);
  const [postings, setPostings]   = useState([]);
  const [credits, setCredits]     = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('triple');
  const [postForm, setPostForm]   = useState({ title:'', specialty:'', location:'', job_type:'Full-Time', salary_range:'', description:'', apply_link:'' });
  const [postErr, setPostErr]     = useState('');
  const [postOk, setPostOk]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sbH = () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = recruiter?.access_token || key;
    return { 'Content-Type':'application/json', 'apikey': key, 'Authorization': `Bearer ${token}` };
  };
  const sbU  = (p) => `${SUPABASE_URL}/rest/v1/${p}`;
  const authU = (p) => `${SUPABASE_URL}/auth/v1/${p}`;

  const login = async () => {
    setAuthErr(''); setAuthLoading(true);
    try {
      const res  = await fetch(authU('token?grant_type=password'), {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error || !data.access_token) {
        setAuthErr(data.error_description || data.error || 'Login failed.');
        setAuthLoading(false); return;
      }
      const profile = await fetch(
        sbU(`recruiter_profiles?user_id=eq.${data.user.id}&select=*`),
        { headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${data.access_token}` } }
      );
      const prof = await profile.json();
      if (!Array.isArray(prof) || prof.length === 0) {
        setAuthErr('No recruiter account found for this email.');
        setAuthLoading(false); return;
      }
      setRecruiter({ ...data, profile: prof[0] });
      await loadDashboard(data, prof[0]);
      setView('dashboard');
    } catch(e) { setAuthErr('Login error. Please try again.'); }
    setAuthLoading(false);
  };

  const signup = async () => {
    setAuthErr(''); setAuthLoading(true);
    if (!company.trim())     { setAuthErr('Company name is required.');  setAuthLoading(false); return; }
    if (!contactName.trim()) { setAuthErr('Contact name is required.');  setAuthLoading(false); return; }
    if (!email.trim())       { setAuthErr('Email is required.');         setAuthLoading(false); return; }
    if (password.length < 8) { setAuthErr('Password must be at least 8 characters.'); setAuthLoading(false); return; }
    try {
      // Step 1: Create auth user
      const res = await fetch(authU('signup'), {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password, data: {}, gotrue_meta_security: {} })
      });
      const data = await res.json();
      if (data.error) { setAuthErr(data.error_description || data.error); setAuthLoading(false); return; }

      // Step 2: Store recruiter details for callback to pick up after email confirmation
      if (data.user?.id) {
        localStorage.setItem('pending_recruiter', JSON.stringify({
          user_id: data.user.id,
          company_name: company,
          contact_name: contactName,
          email,
        }));

        // Step 3: Use the access_token from signup directly — avoids email confirmation requirement
        if (data.access_token) {
          const profile = { user_id: data.user.id, company_name: company, contact_name: contactName, email, post_credits: 0 };
          setRecruiter({ ...data, profile });
          await loadDashboard(data, profile);
          setView('dashboard');
          setAuthLoading(false);
          return;
        }

        // With email confirmation ON, auto-login won't work yet — tell them to confirm
        setView('login');
        setPassword('');
        setAuthErr('Account created! Please check your email and click the confirmation link to complete setup.');
        setAuthLoading(false);
        return;
      }

      setAuthErr('Signup failed. Please try again.');
    } catch(e) { setAuthErr('Signup error. Please try again.'); }
    setAuthLoading(false);
  };

  const loadDashboard = async (session, profile) => {
    try {
      const key     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const token   = session.access_token || key;
      const headers = { 'apikey': key, 'Authorization': `Bearer ${token}` };
      const r1 = await fetch(sbU(`job_posts?select=*&user_id=eq.${session.user.id}&order=created_at.desc`), { headers });
      const d1 = await r1.json();
      setPostings(Array.isArray(d1) ? d1 : []);
      const r2 = await fetch(sbU(`recruiter_profiles?user_id=eq.${session.user.id}&select=post_credits`), { headers });
      const d2 = await r2.json();
      setCredits(Array.isArray(d2) && d2.length > 0 ? d2[0].post_credits : 0);
    } catch(e) { console.error('loadDashboard error', e); }
  };

  const submitPost = async () => {
    setPostErr(''); setPostOk('');
    if (credits < 1)                   return setPostErr('No post credits remaining. Please purchase a package.');
    if (!postForm.title.trim())        return setPostErr('Job title is required.');
    if (!postForm.description.trim())  return setPostErr('Description is required.');
    if (!postForm.apply_link.trim())   return setPostErr('Application link or email is required.');
    setSubmitting(true);
    try {
      const expires = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
      const res = await fetch(sbU('job_posts'), {
        method: 'POST',
        headers: { ...sbH(), 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...postForm, user_id: recruiter.user.id, status:'pending', expires_at: expires, source:'recruiter_portal' })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetch(sbU(`recruiter_profiles?user_id=eq.${recruiter.user.id}`), {
        method: 'PATCH', headers: { ...sbH(), 'Prefer':'return=minimal' },
        body: JSON.stringify({ post_credits: credits - 1 })
      });
      setCredits(c => c - 1);
      setPostOk('Post submitted for review! It will go live once approved (usually within 24 hours).');
      setPostForm({ title:'', specialty:'', location:'', job_type:'Full-Time', salary_range:'', description:'', apply_link:'' });
      await loadDashboard(recruiter, recruiter.profile);
    } catch(e) { setPostErr('Submission failed. Please try again.'); }
    setSubmitting(false);
  };

  const plan = RECRUITER_PLANS.find(p => p.id === selectedPlan) || RECRUITER_PLANS[1];
  const inp  = { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:9, color:'#e2e8f0', fontSize:14, padding:'11px 14px', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' };
  const lbl  = { color:'#90cdf4', fontSize:12, fontWeight:700, letterSpacing:'0.04em', display:'block', marginBottom:5 };
  const btn  = (accent='#90cdf4', bg='rgba(99,179,237,0.12)') => ({ padding:'12px 28px', background:bg, border:`1px solid ${accent}44`, borderRadius:10, color:accent, fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s', width:'100%' });

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#060d18,#0c1a2e)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'32px 16px', fontFamily:'system-ui, -apple-system, sans-serif' }}>

      {/* HEADER */}
      <div style={{ width:'100%', maxWidth:700, marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:26 }}>💼</span>
            <div>
              <div style={{ color:'white', fontWeight:800, fontSize:17, letterSpacing:'0.08em' }}>LUCIDMSK RECRUITER PORTAL</div>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginTop:2 }}>Reach MSK radiologists nationwide</div>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN CARD */}
      <div style={{ background:'linear-gradient(160deg,#0a1628,#0f2a4a)', borderRadius:20, width:'100%', maxWidth:700, border:'1px solid rgba(99,179,237,0.15)', boxShadow:'0 40px 100px rgba(0,0,0,0.8)', overflow:'hidden' }}>

        {/* Top bar */}
        <div style={{ background:'rgba(99,179,237,0.05)', borderBottom:'1px solid rgba(99,179,237,0.12)', padding:'14px 24px' }}>
          <div style={{ color:'#90cdf4', fontSize:11, fontWeight:700, letterSpacing:'0.08em' }}>
            {view === 'landing'   && 'POST A JOB'}
            {view === 'login'     && 'RECRUITER LOGIN'}
            {view === 'signup'    && 'CREATE ACCOUNT'}
            {view === 'dashboard' && `DASHBOARD — ${recruiter?.profile?.company_name?.toUpperCase() || 'RECRUITER'}`}
            {view === 'checkout'  && 'PURCHASE CREDITS'}
          </div>
        </div>

        <div style={{ padding:'32px 28px 40px' }}>

          {/* LANDING */}
          {view === 'landing' && (
            <div>
              <div style={{ textAlign:'center', marginBottom:32 }}>
                <div style={{ color:'#e2e8f0', fontSize:22, fontWeight:800, lineHeight:1.3, marginBottom:10 }}>
                  Post MSK Radiology Jobs<br/>
                  <span style={{ color:'#90cdf4' }}>to a Targeted Specialist Audience</span>
                </div>
                <div style={{ color:'#64748b', fontSize:14, lineHeight:1.6, maxWidth:460, margin:'0 auto' }}>
                  LucidMSK is the clinical and educational platform for MSK radiologists. Your listing goes directly to practicing subspecialists.
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
                {[
                  { icon:'🎯', title:'Subspecialty Targeted', desc:'100% MSK radiology audience — no general job board noise' },
                  { icon:'⚡', title:'Live in 24 Hours',      desc:'Posts go live after a quick content review' },
                  { icon:'📊', title:'30–45 Day Visibility',  desc:'Extended exposure with easy renewal options' },
                ].map(v => (
                  <div key={v.title} style={{ background:'rgba(99,179,237,0.04)', border:'1px solid rgba(99,179,237,0.1)', borderRadius:12, padding:'16px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>{v.icon}</div>
                    <div style={{ color:'#e2e8f0', fontSize:12, fontWeight:700, marginBottom:5 }}>{v.title}</div>
                    <div style={{ color:'#4a5568', fontSize:11, lineHeight:1.5 }}>{v.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:28 }}>
                <div style={{ color:'#90cdf4', fontSize:12, fontWeight:700, letterSpacing:'0.06em', marginBottom:12 }}>POSTING PACKAGES</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {RECRUITER_PLANS.map(p => (
                    <div key={p.id} style={{ background: p.highlight ? 'linear-gradient(135deg,rgba(99,179,237,0.12),rgba(99,179,237,0.05))' : 'rgba(255,255,255,0.02)', border:`1px solid ${p.highlight ? 'rgba(99,179,237,0.4)' : 'rgba(99,179,237,0.1)'}`, borderRadius:12, padding:'18px 14px', textAlign:'center', position:'relative' }}>
                      {p.badge && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background: p.highlight ? '#3b82f6' : '#059669', color:'white', borderRadius:20, padding:'3px 12px', fontSize:10, fontWeight:800, whiteSpace:'nowrap' }}>{p.badge}</div>}
                      <div style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, marginBottom:6 }}>{p.label}</div>
                      <div style={{ color:p.highlight ? '#90cdf4':'#e2e8f0', fontSize:26, fontWeight:800, marginBottom:4 }}>${p.price}</div>
                      <div style={{ color:'#4a5568', fontSize:11, marginBottom:4 }}>{p.posts} listing{p.posts>1?'s':''} · {p.days} days each</div>
                      <div style={{ color:'#374151', fontSize:10 }}>${Math.round(p.price/p.posts)}/listing</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <button onClick={() => { setView('signup'); setAuthErr(''); }} style={btn('#90cdf4','rgba(99,179,237,0.12)')}>Create Recruiter Account →</button>
                <button onClick={() => { setView('login');  setAuthErr(''); }} style={btn('#a78bfa','rgba(139,92,246,0.1)')}>Log In to Existing Account</button>
              </div>
            </div>
          )}

          {/* LOGIN */}
          {view === 'login' && (
            <div style={{ maxWidth:420, margin:'0 auto' }}>
              <div style={{ color:'#e2e8f0', fontSize:18, fontWeight:800, marginBottom:6 }}>Recruiter Login</div>
              <div style={{ color:'#4a5568', fontSize:13, marginBottom:24 }}>Access your posting dashboard.</div>
              {authErr && (
                <div style={{ color: authErr.startsWith('Account') ? '#68d391' : '#fc8181', background: authErr.startsWith('Account') ? 'rgba(104,211,145,0.08)' : 'rgba(245,101,101,0.08)', border:`1px solid ${authErr.startsWith('Account') ? 'rgba(104,211,145,0.25)' : 'rgba(245,101,101,0.2)'}`, borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }}>
                  {authErr}
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div><label style={lbl}>Email</label><input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourcompany.com" /></div>
                <div><label style={lbl}>Password</label><input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key==='Enter' && login()} /></div>
                <button onClick={login} disabled={authLoading} style={btn()}>{authLoading ? '⏳ Logging in...' : 'Log In →'}</button>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <button onClick={() => { setView('signup'); setAuthErr(''); }} style={{ background:'none', border:'none', color:'#90cdf4', cursor:'pointer', fontSize:12 }}>Create an account</button>
                  <button onClick={() => setView('landing')} style={{ background:'none', border:'none', color:'#4a5568', cursor:'pointer', fontSize:12 }}>← Back</button>
                </div>
              </div>
            </div>
          )}

          {/* SIGNUP */}
          {view === 'signup' && (
            <div style={{ maxWidth:460, margin:'0 auto' }}>
              <div style={{ color:'#e2e8f0', fontSize:18, fontWeight:800, marginBottom:6 }}>Create a Recruiter Account</div>
              <div style={{ color:'#4a5568', fontSize:13, marginBottom:24 }}>Free to register. Pay only when you post.</div>
              {authErr && <div style={{ color:'#fc8181', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }}>{authErr}</div>}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label style={lbl}>Company / Institution *</label><input style={inp} value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Health System" /></div>
                  <div><label style={lbl}>Your Name *</label><input style={inp} value={contactName} onChange={e => setContact(e.target.value)} placeholder="Jane Smith" /></div>
                </div>
                <div><label style={lbl}>Work Email *</label><input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@acmehealth.com" /></div>
                <div>
                  <label style={lbl}>Password * <span style={{ color:'#374151', fontWeight:400 }}>(min 8 characters)</span></label>
                  <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <button onClick={signup} disabled={authLoading} style={btn()}>{authLoading ? '⏳ Creating account...' : 'Create Account →'}</button>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <button onClick={() => { setView('login'); setAuthErr(''); }} style={{ background:'none', border:'none', color:'#90cdf4', cursor:'pointer', fontSize:12 }}>Already have an account</button>
                  <button onClick={() => setView('landing')} style={{ background:'none', border:'none', color:'#4a5568', cursor:'pointer', fontSize:12 }}>← Back</button>
                </div>
                <p style={{ color:'#374151', fontSize:11, lineHeight:1.5, margin:0 }}>
                  By creating an account you agree to our <span style={{ color:'#4a5568' }}>Terms of Service</span>. Recruiter accounts are separate from LucidMSK clinical accounts and can only access the job posting portal.
                </p>
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {view === 'dashboard' && recruiter && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:10 }}>
                <div>
                  <div style={{ color:'#e2e8f0', fontSize:16, fontWeight:800 }}>Welcome, {recruiter.profile?.contact_name?.split(' ')[0] || 'Recruiter'}</div>
                  <div style={{ color:'#4a5568', fontSize:12, marginTop:2 }}>{recruiter.profile?.company_name}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ background: credits > 0 ? 'rgba(104,211,145,0.1)' : 'rgba(245,101,101,0.08)', border:`1px solid ${credits > 0 ? 'rgba(104,211,145,0.25)' : 'rgba(245,101,101,0.2)'}`, borderRadius:8, padding:'6px 14px', color: credits > 0 ? '#68d391' : '#fc8181', fontSize:12, fontWeight:700 }}>
                    🎫 {credits} post credit{credits !== 1 ? 's' : ''} remaining
                  </div>
                  <button onClick={() => setView('checkout')} style={{ padding:'7px 16px', background:'rgba(99,179,237,0.1)', border:'1px solid rgba(99,179,237,0.25)', borderRadius:8, color:'#90cdf4', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Buy Credits</button>
                  <button onClick={() => { setRecruiter(null); setView('landing'); }} style={{ padding:'7px 14px', background:'none', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#4a5568', fontSize:12, cursor:'pointer' }}>Log Out</button>
                </div>
              </div>

              {/* New post form */}
              <div style={{ background:'rgba(99,179,237,0.04)', border:'1px solid rgba(99,179,237,0.12)', borderRadius:12, padding:'18px 20px', marginBottom:20 }}>
                <div style={{ color:'#90cdf4', fontSize:13, fontWeight:700, marginBottom:14 }}>
                  ➕ New Job Posting {credits === 0 && <span style={{ color:'#fc8181', fontWeight:400, fontSize:11 }}>— purchase credits below to post</span>}
                </div>
                {postErr && <div style={{ color:'#fc8181', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:12 }}>{postErr}</div>}
                {postOk  && <div style={{ color:'#68d391', background:'rgba(104,211,145,0.08)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:12 }}>{postOk}</div>}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div><label style={lbl}>Job Title *</label><input style={inp} value={postForm.title} onChange={e => setPostForm(f=>({...f,title:e.target.value}))} placeholder="MSK Radiologist — Academic" /></div>
                  <div><label style={lbl}>Institution *</label><input style={inp} value={postForm.specialty} onChange={e => setPostForm(f=>({...f,specialty:e.target.value}))} placeholder="Hospital / Health System" /></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
                  <div><label style={lbl}>Location *</label><input style={inp} value={postForm.location} onChange={e => setPostForm(f=>({...f,location:e.target.value}))} placeholder="City, State" /></div>
                  <div>
                    <label style={lbl}>Type</label>
                    <select style={inp} value={postForm.job_type} onChange={e => setPostForm(f=>({...f,job_type:e.target.value}))}>
                      {['Full-Time','Part-Time','Locum Tenens','Fellowship','Research','Industry'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Salary Range</label><input style={inp} value={postForm.salary_range} onChange={e => setPostForm(f=>({...f,salary_range:e.target.value}))} placeholder="$400k–$500k / Competitive" /></div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={lbl}>Description *</label>
                  <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} value={postForm.description} onChange={e => setPostForm(f=>({...f,description:e.target.value}))} placeholder="Role overview, qualifications, benefits, call schedule..." />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={lbl}>Apply Link or Email *</label>
                  <input style={inp} value={postForm.apply_link} onChange={e => setPostForm(f=>({...f,apply_link:e.target.value}))} placeholder="https://careers.org/job or hr@org.com" />
                </div>
                <button onClick={submitPost} disabled={submitting || credits < 1}
                  style={{ padding:'11px 26px', background: credits > 0 ? 'linear-gradient(135deg,rgba(99,179,237,0.2),rgba(99,179,237,0.08))' : 'rgba(255,255,255,0.03)', border:`1px solid ${credits > 0 ? 'rgba(99,179,237,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius:10, color: credits > 0 ? '#90cdf4':'#374151', fontSize:13, fontWeight:700, cursor: credits > 0 ? 'pointer':'not-allowed' }}>
                  {submitting ? '⏳ Submitting...' : '📤 Submit Post (uses 1 credit)'}
                </button>
              </div>

              {/* Existing posts */}
              <div style={{ color:'#64748b', fontSize:12, fontWeight:700, letterSpacing:'0.05em', marginBottom:10 }}>YOUR POSTINGS ({postings.length})</div>
              {postings.length === 0 && (
                <div style={{ color:'#374151', fontSize:13, textAlign:'center', padding:'28px', background:'rgba(255,255,255,0.02)', borderRadius:10 }}>
                  No postings yet. Submit your first post above.
                </div>
              )}
              {postings.map(p => (
                <div key={p.id} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(99,179,237,0.08)', borderRadius:10, padding:'14px 16px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
                  <div>
                    <div style={{ color:'#e2e8f0', fontSize:13, fontWeight:700 }}>{p.title}</div>
                    <div style={{ color:'#4a5568', fontSize:11, marginTop:3 }}>📍 {p.location} · Expires {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : '—'}</div>
                  </div>
                  <span style={{ background: p.status==='approved' ? 'rgba(104,211,145,0.1)' : p.status==='pending' ? 'rgba(245,189,64,0.1)' : 'rgba(245,101,101,0.08)', color: p.status==='approved' ? '#68d391' : p.status==='pending' ? '#f6bd40' : '#fc8181', border:`1px solid ${p.status==='approved' ? 'rgba(104,211,145,0.25)' : p.status==='pending' ? 'rgba(245,189,64,0.3)' : 'rgba(245,101,101,0.2)'}`, borderRadius:6, padding:'3px 10px', fontSize:10, fontWeight:700, flexShrink:0 }}>
                    {p.status?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CHECKOUT */}
          {view === 'checkout' && (
            <div style={{ maxWidth:480, margin:'0 auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div style={{ color:'#e2e8f0', fontSize:17, fontWeight:800 }}>Purchase Posting Credits</div>
                <button onClick={() => setView(recruiter ? 'dashboard' : 'landing')} style={{ background:'none', border:'none', color:'#4a5568', cursor:'pointer', fontSize:12 }}>← Back</button>
              </div>
              <div style={{ marginBottom:20 }}>
                {RECRUITER_PLANS.map(p => (
                  <div key={p.id} onClick={() => setSelectedPlan(p.id)}
                    style={{ background: selectedPlan===p.id ? 'rgba(99,179,237,0.1)' : 'rgba(255,255,255,0.02)', border:`2px solid ${selectedPlan===p.id ? 'rgba(99,179,237,0.5)' : 'rgba(99,179,237,0.1)'}`, borderRadius:12, padding:'14px 18px', marginBottom:8, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all 0.15s' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ color:'#e2e8f0', fontSize:14, fontWeight:700 }}>{p.label}</div>
                        {p.badge && <span style={{ background:'#3b82f6', color:'white', borderRadius:20, padding:'2px 8px', fontSize:9, fontWeight:800 }}>{p.badge}</span>}
                      </div>
                      <div style={{ color:'#4a5568', fontSize:11, marginTop:3 }}>{p.posts} listing{p.posts>1?'s':''} · active for {p.days} days each · ${Math.round(p.price/p.posts)}/listing</div>
                    </div>
                    <div style={{ color: selectedPlan===p.id ? '#90cdf4':'#e2e8f0', fontSize:20, fontWeight:800 }}>${p.price}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(99,179,237,0.1)', borderRadius:12, padding:'16px 18px', marginBottom:20 }}>
                <div style={{ color:'#64748b', fontSize:11, fontWeight:700, letterSpacing:'0.05em', marginBottom:12 }}>ORDER SUMMARY</div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#a0aec0', marginBottom:6 }}>
                  <span>{plan.label} — {plan.posts} post credit{plan.posts>1?'s':''}</span>
                  <span>${plan.price}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#a0aec0', marginBottom:12 }}>
                  <span>Each listing active for {plan.days} days</span>
                  <span style={{ color:'#4a5568' }}>${Math.round(plan.price/plan.posts)}/each</span>
                </div>
                <div style={{ borderTop:'1px solid rgba(99,179,237,0.1)', paddingTop:12, display:'flex', justifyContent:'space-between', color:'#e2e8f0', fontSize:15, fontWeight:800 }}>
                  <span>Total</span>
                  <span style={{ color:'#90cdf4' }}>${plan.price}</span>
                </div>
              </div>
              <div style={{ background:'rgba(245,189,64,0.05)', border:'1px solid rgba(245,189,64,0.15)', borderRadius:10, padding:'14px 16px', marginBottom:20, color:'#a0aec0', fontSize:12, lineHeight:1.6 }}>
                <span style={{ color:'#f6bd40', fontWeight:700 }}>💳 Secure Payment</span> — You'll be redirected to our payment processor (Stripe) to complete your purchase. Credits are added to your account instantly upon confirmation.
              </div>
              <button
                onClick={() => alert(`Checkout coming soon!\n\nPlan: ${plan.label}\nTotal: $${plan.price}\n\nContact admin@lucidmsk.com to arrange direct billing.`)}
                style={{ ...btn('#90cdf4','linear-gradient(135deg,rgba(99,179,237,0.2),rgba(99,179,237,0.08))'), fontSize:15, padding:'14px' }}>
                Proceed to Payment →
              </button>
              <p style={{ color:'#374151', fontSize:11, textAlign:'center', marginTop:10 }}>Secured by Stripe · No subscription · Credits never expire</p>
            </div>
          )}

        </div>
      </div>

      <div style={{ marginTop:28, color:'#1e293b', fontSize:11, textAlign:'center' }}>
        © {new Date().getFullYear()} LucidMSK · <a href="/privacy" style={{ color:'#1e293b', textDecoration:'none' }}>Privacy</a> · <a href="/terms" style={{ color:'#1e293b', textDecoration:'none' }}>Terms</a>
      </div>

    </div>
  );
}
