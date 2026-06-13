'use client';
// TemplatesPanel.jsx — LucidMSK Custom Dictation Templates
// Save, load, delete, and share report templates per body part + modality.
// Props:
//   authUser         — { id, access_token }
//   generatedReport  — string (Col 2 content)
//   selectedBodyPart — string
//   modality         — 'MRI' | 'CT' | 'XR'
//   onLoad(content)  — callback: sets generatedReport in parent
//   onClose()        — callback: hides the panel
//   dm               — dark mode boolean

import { useState, useEffect, useCallback, useRef } from 'react';
import { TEMPLATES_TABLE, MAX_TEMPLATES_PER_USER } from './templateData';
import { cleanupTemplateDictation } from './templateUtils';

// formatReport — local copy of the Col 2 report formatter (FINDINGS/IMPRESSION
// color-coding). Duplicated here intentionally, per LucidMSK architecture note,
// to avoid any edits to page.js. Keep in sync if Col 2's formatter changes.
function formatReport(txt, colors = {}) {
  if (!txt) return null;
  const cleaned = txt
    .replace(/\bunremarkable\b/gi, 'intact')
    .replace(/\*\*/g, '')
    .replace(/^---+$/gm, '')
    .replace(/^\s*[-•]\s+/gm, '');

  let inImpression = false;
  let inReferences = false;
  let inFootnote = false;
  let inPatientSummary = false;

  const negColor  = colors.neg  || '#6b7280';
  const posColor  = colors.pos  || '#dc2626';
  const lblColor  = colors.lbl  || '#1e293b';
  const bodyColor = colors.body || '#1e293b';
  const posWeight = colors.posW || 600;

  return cleaned.split('\n').map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{ height: 5 }} />;

    // UNDERSTANDING YOUR RESULTS — plain-language patient section, always last
    if (/^UNDERSTANDING YOUR RESULTS:?$/i.test(t)) {
      inPatientSummary = true; inImpression = false; inReferences = false; inFootnote = false;
      return (
        <div key={i} style={{ marginTop:32, borderTop:'2px solid #bfdbfe', paddingTop:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:15 }}>🧑‍🏫</span>
            <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.12em', color:'#1d4ed8' }}>UNDERSTANDING YOUR RESULTS</span>
          </div>
          <div style={{ fontSize:10, color:'#64748b', fontStyle:'italic', marginBottom:10, paddingLeft:2 }}>A plain-language explanation of your imaging — the formal report above remains the official medical record</div>
        </div>
      );
    }
    if (inPatientSummary) {
      if (t === 'PROVIDER_LINK' || t.includes('PROVIDER_LINK') || t.includes('<a href=')) {
        return (
          <div key={i} style={{ marginTop:14, paddingBottom:8 }}>
            <a href="https://mri-reporting.vercel.app/providers" target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:8,background:'linear-gradient(135deg,#2563eb,#4f46e5)',color:'white',fontSize:12,fontWeight:700,textDecoration:'none',boxShadow:'0 2px 8px rgba(37,99,235,0.3)' }}>
              🔍 Find a local specialist who treats these conditions →
            </a>
          </div>
        );
      }
      return <div key={i} style={{ fontSize:13, color:'#1e3a5f', lineHeight:1.9, paddingLeft:4, borderLeft:'3px solid #bfdbfe', marginBottom:4 }}>{t}</div>;
    }

    // FOOTNOTE / REFERENCES — small grey section below impression
    if (/^FOOTNOTE:?$/i.test(t)) {
      inFootnote = true; inImpression = false; inReferences = false;
      return <div key={i} style={{ marginTop:16, borderTop:'1px solid '+(colors.border||'#e2e8f0'), paddingTop:8, marginBottom:4 }}><span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#94a3b8', textTransform:'uppercase' }}>Footnotes</span></div>;
    }
    if (inFootnote) return <div key={i} style={{ fontSize:9, color:'#94a3b8', lineHeight:1.6, paddingLeft:4, marginBottom:2 }}>{t}</div>;

    if (/^REFERENCES:?$/i.test(t)) {
      inReferences = true; inImpression = false;
      return <div key={i} style={{ marginTop:16, borderTop:'1px solid '+(colors.border||'#e2e8f0'), paddingTop:8, marginBottom:4 }}><span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#94a3b8', textTransform:'uppercase' }}>References</span></div>;
    }
    if (inReferences) return <div key={i} style={{ fontSize:9, color:'#94a3b8', lineHeight:1.6, paddingLeft:4, marginBottom:2 }}>{t}</div>;

    const isHeader = /^(TECHNIQUE|FINDINGS|IMPRESSION|LEVELS):?$/.test(t);
    const isMetaLine = /^(HISTORY|COMPARISON):?/.test(t);
    const isExamHeading = /^(MRI|CT|RADIOGRAPHS)\b/.test(t) && t === t.toUpperCase() && t.length > 3;
    if (isExamHeading) return <div key={i} style={{ marginBottom:10 }}><span style={{ fontSize:13, fontWeight:900, letterSpacing:'0.1em', color:colors.hdr||'#1e3a5f' }}>{t}</span></div>;
    if (isMetaLine) return <div key={i} style={{ marginTop: i > 0 ? 16 : 0, marginBottom:4, fontSize:12, fontWeight:700, letterSpacing:'0.08em', color:colors.hdr||'#1e3a5f' }}>{t}</div>;
    if (isHeader) {
      inImpression = t.startsWith('IMPRESSION');
      return (
        <div key={i} style={{ marginTop: i > 0 ? 20 : 0, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: colors.hdr || '#1e3a5f', display: 'inline-block' }}>{t}</span>
        </div>
      );
    }

    const isNumbered = /^\d+\./.test(t);
    if (isNumbered || inImpression) {
      const num = t.match(/^\d+\./)?.[0];
      return (
        <div key={i} style={{ marginTop: 5, paddingLeft: 4, fontSize: 13, lineHeight: 1.7, display: 'flex', gap: 6 }}>
          {num && <span style={{ fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>{num}</span>}
          <span style={{ color: bodyColor, fontWeight: 400 }}>{num ? t.slice(num.length).trim() : t}</span>
        </div>
      );
    }

    const colonIdx = t.indexOf(':');
    const isSubheader = colonIdx > 0 && colonIdx < 60 && /^[A-Z]/.test(t);
    if (isSubheader) {
      const label = t.slice(0, colonIdx + 1);
      const value = t.slice(colonIdx + 1).trim();
      const isAbsent = /^absent\.?$/i.test(value);
      const isAllNeg = isAbsent ||
        /^intact\.?$/i.test(value) ||
        /^no significant canal or foraminal narrowing\.?$/i.test(value) ||
        /^no fracture or contusion\. no osteonecrosis\. no marrow infiltration or bone lesion\.?$/i.test(value) ||
        /^no fracture or cortical disruption\. no osteonecrosis\. no aggressive osseous lesion\.?$/i.test(value);
      const isBones = /^bones/i.test(label);
      if (isBones && !isAllNeg) {
        const sentences = value.match(/[^.!?]+[.!?]*/g) || [value];
        const negPattern = /^(no fracture|no osteonecrosis|no marrow|no avascular|no bone lesion|no aggressive|no cortical)/i;
        return (
          <div key={i} style={{ marginTop: 8, paddingLeft: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: lblColor }}>{label} </span>
            {sentences.map((s, si) => {
              const st = s.trim();
              const sentNeg = negPattern.test(st);
              return <span key={si} style={{ fontSize: 13, color: sentNeg ? negColor : posColor, fontWeight: sentNeg ? 400 : posWeight }}>{st}{si < sentences.length - 1 ? ' ' : ''}</span>;
            })}
          </div>
        );
      }
      return (
        <div key={i} style={{ marginTop: 8, paddingLeft: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: lblColor }}>{label} </span>
          <span style={{ fontSize: 13, color: isAllNeg ? negColor : posColor, fontWeight: isAllNeg ? 400 : posWeight }}>{value}</span>
        </div>
      );
    }

    return <div key={i} style={{ fontSize: 13, color: inImpression ? bodyColor : posColor, fontWeight: inImpression ? 400 : posWeight, lineHeight: 1.8, paddingLeft: 4 }}>{t}</div>;
  });
}

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function supaHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    apikey: getAnonKey(),
    Authorization: `Bearer ${accessToken}`,
    Prefer: 'return=representation',
  };
}

export default function TemplatesPanel({ authUser, generatedReport, selectedBodyPart, modality, onLoad, onClose, dm }) {
  const [tab, setTab] = useState('load'); // 'load' | 'save'
  const [templates, setTemplates] = useState([]);
  const [communityTemplates, setCommunityTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null); // id being deleted
  const [confirmDelete, setConfirmDelete] = useState(null); // id awaiting confirm
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Save form state — content starts empty; user dictates, types, or imports the current report
  const [saveName, setSaveName] = useState('');
  const [saveContent, setSaveContent] = useState('');
  const [saveShared, setSaveShared] = useState(false);

  // ── Standalone dictation for the Create Template tab ───────────────────────
  // Self-contained per LucidMSK architecture note — does not touch page.js's dictation state.
  const [isDictating, setIsDictating] = useState(false);
  const [micError, setMicError] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // true = formatted/locked preview, like Col 2
  const recognitionRef = useRef(null);
  const keepaliveRef = useRef(null);
  const graceRef = useRef(false);
  const graceTimerRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const userId = authUser?.id;
  const accessToken = authUser?.access_token;

  // ── Fetch user's own templates + community templates for this body part + modality ──
  const fetchTemplates = useCallback(async () => {
    if (!userId || !accessToken) return;
    setLoading(true);
    setError('');
    try {
      // Own templates — all body parts (user can browse)
      const ownRes = await fetch(
        `${SUPA_URL}/rest/v1/${TEMPLATES_TABLE}?user_id=eq.${userId}&order=created_at.desc`,
        { headers: supaHeaders(accessToken) }
      );
      const ownData = ownRes.ok ? await ownRes.json() : [];

      // Community templates — filtered by body_part + modality, not own
      const commRes = await fetch(
        `${SUPA_URL}/rest/v1/${TEMPLATES_TABLE}?is_shared=eq.true&body_part=eq.${selectedBodyPart}&modality=eq.${modality}&user_id=neq.${userId}&order=created_at.desc`,
        { headers: supaHeaders(accessToken) }
      );
      const commData = commRes.ok ? await commRes.json() : [];

      setTemplates(Array.isArray(ownData) ? ownData : []);
      setCommunityTemplates(Array.isArray(commData) ? commData : []);
    } catch (e) {
      setError('Failed to load templates.');
    }
    setLoading(false);
  }, [userId, accessToken, selectedBodyPart, modality]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // Stop dictation if user navigates away from the Create tab
  useEffect(() => {
    if (tab !== 'save' && isDictating) {
      stopDictKeepalive();
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setIsDictating(false);
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => () => {
    stopDictKeepalive();
    try { recognitionRef.current?.stop(); } catch {}
  }, []);

  const startDictKeepalive = () => {
    stopDictKeepalive();
    keepaliveRef.current = setInterval(() => {
      if (graceRef.current) return; // final result just landed — let it finish
      const rec = recognitionRef.current;
      if (!rec) { stopDictKeepalive(); return; }
      try { rec.stop(); } catch {}
    }, 4000);
  };

  const stopDictKeepalive = () => {
    if (keepaliveRef.current) { clearInterval(keepaliveRef.current); keepaliveRef.current = null; }
    if (graceTimerRef.current) { clearTimeout(graceTimerRef.current); graceTimerRef.current = null; }
    graceRef.current = false;
  };

  // Standalone dictation directly into the template content textarea.
  // Appends to whatever is already in saveContent (typed text or an imported report).
  const toggleDictation = () => {
    if (isDictating) {
      stopDictKeepalive();
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setIsDictating(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    if (!SR) { setMicError('Speech recognition not supported. Please use Chrome or Edge.'); return; }
    setMicError('');
    // Seed with existing content so dictation appends rather than overwrites
    const existing = saveContent.trim();
    finalTranscriptRef.current = existing ? existing + ' ' : '';

    const makeRecognition = () => {
      const rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US'; rec.maxAlternatives = 1;
      rec.onstart = () => setIsDictating(true);
      rec.onaudiostart = () => setIsDictating(true);
      rec.onresult = (event) => {
        let interim = '';
        let gotFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) { finalTranscriptRef.current += t + ' '; gotFinal = true; }
          else interim += t;
        }
        if (gotFinal) {
          graceRef.current = true;
          if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
          graceTimerRef.current = setTimeout(() => { graceRef.current = false; graceTimerRef.current = null; }, 2500);
        }
        setSaveContent(finalTranscriptRef.current + interim);
      };
      rec.onerror = (event) => {
        if (event.error === 'not-allowed') { stopDictKeepalive(); setMicError('Microphone access denied. Click the lock icon in your address bar.'); setIsDictating(false); }
        // no-speech: silence timeout — onend fires next and restarts automatically
      };
      rec.onend = () => {
        if (recognitionRef.current !== rec) return;
        setTimeout(() => {
          if (recognitionRef.current !== rec) return;
          try {
            const next = makeRecognition();
            next.start();
            recognitionRef.current = next;
          } catch { stopDictKeepalive(); setIsDictating(false); }
        }, 150);
      };
      return rec;
    };

    try {
      const recognition = makeRecognition();
      recognition.start();
      recognitionRef.current = recognition;
      startDictKeepalive();
    } catch (err) { setIsDictating(false); setMicError('Could not start microphone: ' + err.message); }
  };

  // Pull the currently generated report (Col 2) into the template content — additive, not destructive
  const handleImportReport = () => {
    const report = (generatedReport || '').trim();
    if (!report) return;
    setSaveContent(prev => prev.trim() ? prev.trim() + '\n\n' + report : report);
  };

  // Toggle between Type Edit (plain textarea) and Dictate Edit (formatted preview
  // + dictation/import/cleanup controls). Stops any active dictation when leaving
  // Dictate Edit mode.
  const toggleEditMode = () => {
    if (isLocked && isDictating) {
      stopDictKeepalive();
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setIsDictating(false);
    }
    setIsLocked(l => !l);
  };

  // Send raw dictated text through AI cleanup: fixes "period"/"comma"/"new paragraph"
  // and corrects phonetic mis-transcriptions of MSK terminology (same kind of pass
  // Col 1 → Generate does for reports).
  const handleCleanup = async () => {
    const raw = saveContent.trim();
    if (!raw) return;
    setIsCleaning(true); setError(''); setSuccess('');
    try {
      const cleaned = await cleanupTemplateDictation(raw);
      setSaveContent(cleaned.trim());
      finalTranscriptRef.current = cleaned.trim() + ' ';
      setIsLocked(true);
    } catch (e) {
      setError('Cleanup failed: ' + (e?.message || 'network error') + '. You can edit the text manually.');
    }
    setIsCleaning(false);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!saveName.trim()) { setError('Please enter a template name.'); return; }
    if (!saveContent.trim()) { setError('Template content is empty — dictate, type, or import a report.'); return; }
    if (templates.length >= MAX_TEMPLATES_PER_USER) {
      setError(`Template limit reached (${MAX_TEMPLATES_PER_USER}). Delete one to add more.`); return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${TEMPLATES_TABLE}`, {
        method: 'POST',
        headers: supaHeaders(accessToken),
        body: JSON.stringify({
          user_id: userId,
          name: saveName.trim(),
          body_part: selectedBodyPart,
          modality,
          content: saveContent.trim(),
          is_shared: saveShared,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSuccess('Template saved!');
      setSaveName('');
      setSaveShared(false);
      await fetchTemplates();
      setTimeout(() => { setSuccess(''); setTab('load'); }, 1200);
    } catch {
      setError('Failed to save template.');
    }
    setSaving(false);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(id); setError('');
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${TEMPLATES_TABLE}?id=eq.${id}&user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: supaHeaders(accessToken),
      });
      if (!res.ok) throw new Error('Delete failed');
      setTemplates(t => t.filter(x => x.id !== id));
      setConfirmDelete(null);
    } catch {
      setError('Failed to delete template.');
    }
    setDeleting(null);
  };

  // ── Filtered own templates by current body part + modality ────────────────
  const filteredOwn = templates.filter(t => t.body_part === selectedBodyPart && t.modality === modality);
  const otherOwn = templates.filter(t => !(t.body_part === selectedBodyPart && t.modality === modality));

  // ── Styling helpers ───────────────────────────────────────────────────────
  const c = {
    bg:     dm ? '#0f172a' : '#ffffff',
    bgCard: dm ? '#1e293b' : '#f8fafc',
    border: dm ? '#334155' : '#e2e8f0',
    txt:    dm ? '#e2e8f0' : '#1e293b',
    sub:    dm ? '#94a3b8' : '#64748b',
    accent: '#2563eb',
    green:  dm ? '#4ade80' : '#16a34a',
    red:    dm ? '#f87171' : '#dc2626',
    inp:    { background: dm ? '#0f172a' : '#ffffff', color: dm ? '#e2e8f0' : '#1e293b', border: `1px solid ${dm ? '#334155' : '#dde3ed'}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, width: '100%', outline: 'none', boxSizing: 'border-box' },
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={() => { setTab(id); setError(''); setSuccess(''); }}
      style={{ flex:1, padding:'8px 0', border:'none', borderRadius:8, background: tab===id ? c.accent : 'transparent', color: tab===id ? 'white' : c.sub, fontWeight: tab===id ? 700 : 500, fontSize:13, cursor:'pointer', transition:'all 0.12s' }}>
      {label}
    </button>
  );

  const TemplateCard = ({ t, isCommunity }) => {
    const isConfirming = confirmDelete === t.id;
    return (
      <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius:10, padding:'10px 12px', display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:c.txt, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</div>
            <div style={{ display:'flex', gap:6, marginTop:3, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, fontWeight:600, background: dm?'#1e3a5f':'#dbeafe', color: dm?'#93c5fd':'#1d4ed8', borderRadius:4, padding:'2px 6px' }}>{t.body_part}</span>
              <span style={{ fontSize:10, fontWeight:600, background: dm?'#0e3a2f':'#dcfce7', color: dm?'#4ade80':'#15803d', borderRadius:4, padding:'2px 6px' }}>{t.modality}</span>
              {t.is_shared && <span style={{ fontSize:10, fontWeight:600, background: dm?'#2d1f5e':'#ede9fe', color: dm?'#c4b5fd':'#7c3aed', borderRadius:4, padding:'2px 6px' }}>🌐 Shared</span>}
              {isCommunity && <span style={{ fontSize:10, fontWeight:600, background: dm?'#3b1f00':'#fff7ed', color: dm?'#fb923c':'#c2410c', borderRadius:4, padding:'2px 6px' }}>Community</span>}
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0, alignItems:'center' }}>
            <button onClick={() => { onLoad(t.content); onClose(); }}
              style={{ padding:'5px 10px', borderRadius:7, border:`1px solid ${c.accent}`, background:'transparent', color:c.accent, fontSize:12, fontWeight:700, cursor:'pointer' }}>
              Load
            </button>
            {!isCommunity && (
              isConfirming ? (
                <div style={{ display:'flex', gap:4 }}>
                  <button onClick={() => handleDelete(t.id)} disabled={deleting===t.id}
                    style={{ padding:'5px 8px', borderRadius:7, border:'none', background:c.red, color:'white', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    {deleting===t.id ? '…' : 'Yes'}
                  </button>
                  <button onClick={() => setConfirmDelete(null)}
                    style={{ padding:'5px 8px', borderRadius:7, border:`1px solid ${c.border}`, background:'transparent', color:c.sub, fontSize:11, cursor:'pointer' }}>
                    No
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(t.id)}
                  style={{ padding:'5px 8px', borderRadius:7, border:`1px solid ${c.border}`, background:'transparent', color:c.sub, fontSize:12, cursor:'pointer' }}
                  title="Delete template">
                  🗑
                </button>
              )
            )}
          </div>
        </div>
        <div style={{ fontSize:11, color:c.sub, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.5 }}>
          {t.content}
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:c.bg, borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,0.35)', width:'100%', maxWidth:520, maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'14px 16px', borderBottom:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>📂</span>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:'white', letterSpacing:'0.02em' }}>Report Templates</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>{selectedBodyPart} · {modality} · {templates.length}/{MAX_TEMPLATES_PER_USER} saved</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, width:30, height:30, color:'white', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ padding:'10px 16px 0', borderBottom:`1px solid ${c.border}`, flexShrink:0 }}>
          <div style={{ display:'flex', gap:4, background:c.bgCard, borderRadius:10, padding:3 }}>
            <TabBtn id="load" label="📂 Load Template" />
            <TabBtn id="save" label="✨ Create Template" />
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
          {error && <div style={{ fontSize:12, color:c.red, background:dm?'rgba(248,113,113,0.1)':'#fef2f2', border:`1px solid ${dm?'#991b1b':'#fca5a5'}`, borderRadius:8, padding:'8px 12px' }}>{error}</div>}
          {success && <div style={{ fontSize:12, color:c.green, background:dm?'rgba(74,222,128,0.1)':'#f0fdf4', border:`1px solid ${dm?'#166534':'#86efac'}`, borderRadius:8, padding:'8px 12px' }}>{success}</div>}

          {/* ── LOAD TAB ── */}
          {tab === 'load' && (
            <>
              {loading ? (
                <div style={{ textAlign:'center', padding:'30px 0', color:c.sub, fontSize:13 }}>Loading templates…</div>
              ) : (
                <>
                  {/* Current body part + modality matches */}
                  {filteredOwn.length > 0 && (
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:c.sub, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
                        Your Templates — {selectedBodyPart} {modality}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {filteredOwn.map(t => <TemplateCard key={t.id} t={t} />)}
                      </div>
                    </div>
                  )}

                  {/* Community templates */}
                  {communityTemplates.length > 0 && (
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:c.sub, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
                        🌐 Community — {selectedBodyPart} {modality}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {communityTemplates.map(t => <TemplateCard key={t.id} t={t} isCommunity />)}
                      </div>
                    </div>
                  )}

                  {/* Other own templates (different body part / modality) */}
                  {otherOwn.length > 0 && (
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:c.sub, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
                        Your Other Templates
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {otherOwn.map(t => <TemplateCard key={t.id} t={t} />)}
                      </div>
                    </div>
                  )}

                  {filteredOwn.length === 0 && communityTemplates.length === 0 && otherOwn.length === 0 && (
                    <div style={{ textAlign:'center', padding:'30px 0', color:c.sub, fontSize:13, lineHeight:1.8 }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                      No templates yet.<br />Tap <strong style={{ color:c.txt }}>✨ Create Template</strong> to dictate, type, or import one.
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── CREATE TEMPLATE TAB ── */}
          {tab === 'save' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:12, color:c.sub, lineHeight:1.6 }}>
                Build a new template here — separate from your current report. Type it directly, or switch to <strong style={{ color:c.txt }}>🎤 Dictate Edit</strong> to dictate, import your last report, and clean up dictation errors.
              </div>

              <div style={{ fontSize:12, color:c.sub, background:c.bgCard, borderRadius:8, padding:'8px 12px', border:`1px solid ${c.border}` }}>
                Will be saved for: <strong style={{ color:c.txt }}>{selectedBodyPart}</strong> · <strong style={{ color:c.txt }}>{modality}</strong>
              </div>

              {micError && <div style={{ fontSize:12, color:c.red, background:dm?'rgba(248,113,113,0.1)':'#fef2f2', border:`1px solid ${dm?'#991b1b':'#fca5a5'}`, borderRadius:8, padding:'8px 12px' }}>{micError}</div>}

              {isLocked && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={toggleDictation}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px 0', borderRadius:9, border:`1.5px solid ${isDictating ? '#fca5a5' : c.border}`, background:isDictating ? (dm?'rgba(239,68,68,0.12)':'#fef2f2') : c.bgCard, color:isDictating ? '#dc2626' : c.txt, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:isDictating ? '#ef4444' : '#94a3b8', boxShadow:isDictating ? '0 0 8px #ef4444' : 'none', flexShrink:0, transition:'all 0.3s' }} />
                    {isDictating ? '⏹ Stop Dictation' : '🎤 Dictate Template'}
                  </button>
                  <button onClick={handleImportReport} disabled={!generatedReport?.trim() || isDictating}
                    title={generatedReport?.trim() ? 'Add your current generated report into this template' : 'No report generated yet'}
                    style={{ flex:1, padding:'10px 0', borderRadius:9, border:`1.5px solid ${c.border}`, background:c.bgCard, color:(!generatedReport?.trim()||isDictating) ? c.sub : c.txt, fontSize:13, fontWeight:600, cursor:(!generatedReport?.trim()||isDictating) ? 'not-allowed' : 'pointer', opacity:(!generatedReport?.trim()||isDictating) ? 0.55 : 1, transition:'all 0.15s' }}>
                    📋 Import Report
                  </button>
                </div>
              )}

              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:c.sub }}>Template Name *</label>
                </div>
                <input value={saveName} onChange={e => setSaveName(e.target.value)}
                  placeholder={`e.g. Normal ${selectedBodyPart} ${modality}`}
                  style={c.inp} maxLength={80} />
              </div>

              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:c.sub }}>
                    Template Content {isLocked && <span style={{ fontWeight:400, color:c.sub }}>· Dictate Mode</span>}
                  </label>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <button onClick={toggleEditMode}
                      style={{ fontSize:11, color:c.accent, background:'transparent', border:'none', cursor:'pointer', fontWeight:600 }}>
                      {isLocked ? '✏️ Type Edit' : '🎤 Dictate Edit'}
                    </button>
                    {saveContent.trim() && (
                      <button onClick={() => { setSaveContent(''); finalTranscriptRef.current = ''; setIsLocked(false); }}
                        style={{ fontSize:11, color:c.sub, background:'transparent', border:'none', cursor:'pointer', textDecoration:'underline' }}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {isLocked ? (
                  <div style={{ background:c.bgCard, border:`1px solid ${c.border}`, borderRadius:8, padding:'14px 16px', minHeight:180, maxHeight:320, overflowY:'auto', fontFamily:"Georgia,'Times New Roman',serif" }}>
                    {saveContent.trim()
                      ? formatReport(saveContent, dm ? {
                          neg:'#cbd5e1', pos:'#cbd5e1', lbl:'#94a3b8', body:'#cbd5e1', posW:400, border:'#334155', hdr:'#93c5fd'
                        } : {
                          neg:'#1e293b', pos:'#1e293b', lbl:'#1e293b', body:'#1e293b', posW:400, border:'#e2e8f0', hdr:'#1e3a5f'
                        })
                      : <div style={{ color:c.sub, fontStyle:'italic', fontSize:13, fontFamily:'inherit' }}>Tap 🎤 Dictate Template above to start dictating…</div>
                    }
                  </div>
                ) : (
                  <textarea value={saveContent} onChange={e => setSaveContent(e.target.value)}
                    style={{ ...c.inp, minHeight:180, resize:'vertical', lineHeight:1.6, fontFamily:'Georgia,"Times New Roman",serif', fontSize:12 }}
                    placeholder="Type your template content here, or switch to 🎤 Dictate Edit…" />
                )}
              </div>

              {isLocked && (
                <button onClick={handleCleanup} disabled={isCleaning || isDictating || !saveContent.trim()}
                  title="Fix dictated punctuation (period/comma/new paragraph) and correct misheard MSK terminology"
                  style={{ width:'100%', padding:'10px 0', borderRadius:9, border:'none', background:(isCleaning||isDictating||!saveContent.trim())?'#9ca3af':'linear-gradient(135deg,#7c3aed,#2563eb)', color:'white', fontSize:13, fontWeight:700, cursor:(isCleaning||isDictating||!saveContent.trim())?'not-allowed':'pointer', boxShadow:(isCleaning||isDictating||!saveContent.trim())?'none':'0 4px 16px rgba(124,58,237,0.3)', transition:'all 0.12s' }}>
                  {isCleaning ? '⏳ Cleaning up…' : '✨ Clean Up & Format Dictation'}
                </button>
              )}

              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'8px 12px', borderRadius:8, border:`1px solid ${saveShared?(dm?'#4f46e5':'#c4b5fd'):(c.border)}`, background:saveShared?(dm?'#1e1b4b':'#f5f3ff'):'transparent', transition:'all 0.12s' }}>
                <input type="checkbox" checked={saveShared} onChange={e => setSaveShared(e.target.checked)} style={{ width:15, height:15, accentColor:'#4f46e5', cursor:'pointer' }}/>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:saveShared?(dm?'#c4b5fd':'#6d28d9'):c.sub }}>🌐 Share with community</div>
                  <div style={{ fontSize:10, color:c.sub }}>Other radiologists can load this template for {selectedBodyPart} {modality}</div>
                </div>
              </label>

              <div style={{ fontSize:11, color:c.sub, textAlign:'right' }}>{templates.length} / {MAX_TEMPLATES_PER_USER} templates used</div>

              <button onClick={handleSave} disabled={saving || !saveName.trim() || !saveContent.trim()}
                style={{ width:'100%', padding:'11px 0', borderRadius:9, border:'none', background:(saving||!saveName.trim()||!saveContent.trim())?'#9ca3af':'linear-gradient(135deg,#2563eb,#4f46e5)', color:'white', fontSize:14, fontWeight:700, cursor:(saving||!saveName.trim()||!saveContent.trim())?'not-allowed':'pointer', boxShadow:saving?'none':'0 4px 16px rgba(37,99,235,0.35)', transition:'all 0.12s' }}>
                {saving ? '⏳ Saving…' : '💾 Save Template'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
