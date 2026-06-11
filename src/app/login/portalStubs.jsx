'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ClinicianPage — stub (Session 2 will build the full portal)
// ─────────────────────────────────────────────────────────────────────────────
export function ClinicianPage({ currentUser, onSignOut }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a1a0f 0%,#0f2a1a 50%,#0a1a0f 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:480, padding:40 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🩺</div>
        <h1 style={{ color:'#34d399', fontSize:28, fontWeight:800, marginBottom:8, letterSpacing:'0.02em' }}>
          Clinician Portal
        </h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.7, marginBottom:32 }}>
          Coming soon — AI-assisted tools for ordering providers including appropriateness criteria, requisition guidance, ICD-10 generator, modality selection, and radiology glossary.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'center' }}>
          <div style={{ padding:'14px 24px', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:12, color:'rgba(255,255,255,0.6)', fontSize:13, width:'100%', maxWidth:320, textAlign:'left' }}>
            <div style={{ color:'#34d399', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Planned tools</div>
            {['ACR Appropriateness Criteria guide', 'Requisition writing assistant', 'ICD-10 code generator', 'Which modality? decision tool', 'Radiology glossary'].map(t => (
              <div key={t} style={{ fontSize:12, color:'rgba(255,255,255,0.5)', padding:'3px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>→ {t}</div>
            ))}
          </div>
          <button onClick={onSignOut}
            style={{ padding:'10px 28px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:13, cursor:'pointer', marginTop:8 }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IndustryDashboard — stub (Session 3 will build the full dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export function IndustryDashboard({ currentUser, onSignOut }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#1a1000 0%,#2a1a00 50%,#1a1000 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:480, padding:40 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🏭</div>
        <h1 style={{ color:'#fbbf24', fontSize:28, fontWeight:800, marginBottom:8, letterSpacing:'0.02em' }}>
          Industry Portal
        </h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.7, marginBottom:32 }}>
          Coming soon — share new MSK imaging products, research papers, and technology with the LucidMSK radiologist community. All submissions require admin approval. No intrusive advertising.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'center' }}>
          <div style={{ padding:'14px 24px', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:12, color:'rgba(255,255,255,0.6)', fontSize:13, width:'100%', maxWidth:340, textAlign:'left' }}>
            <div style={{ color:'#fbbf24', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Planned features</div>
            {['Submit product posts, papers, and images', 'Manage your submissions (edit / delete)', 'Track admin approval status', 'Radiologists browse in MSK Hub → New Tech', 'No ads — informational posts only'].map(t => (
              <div key={t} style={{ fontSize:12, color:'rgba(255,255,255,0.5)', padding:'3px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>→ {t}</div>
            ))}
          </div>
          <div style={{ padding:'10px 16px', background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:8, fontSize:12, color:'rgba(251,191,36,0.7)', maxWidth:340, width:'100%' }}>
            ⏳ Your account is pending admin approval. You will receive an email when access is granted.
          </div>
          <button onClick={onSignOut}
            style={{ padding:'10px 28px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:13, cursor:'pointer', marginTop:8 }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
