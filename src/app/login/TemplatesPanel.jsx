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

import { useState, useEffect, useCallback } from 'react';
import { TEMPLATES_TABLE, MAX_TEMPLATES_PER_USER } from './templateData';

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

  // Save form state
  const [saveName, setSaveName] = useState('');
  const [saveContent, setSaveContent] = useState(generatedReport || '');
  const [saveShared, setSaveShared] = useState(false);

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

  // Pre-fill save content when generatedReport changes or tab switches to save
  useEffect(() => {
    if (tab === 'save') setSaveContent(generatedReport || '');
  }, [tab, generatedReport]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!saveName.trim()) { setError('Please enter a template name.'); return; }
    if (!saveContent.trim()) { setError('No content to save — generate a report first.'); return; }
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
            <TabBtn id="save" label="💾 Save New Template" />
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
                      No templates yet.<br />Generate a report, then save it as a template.
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── SAVE TAB ── */}
          {tab === 'save' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:12, color:c.sub, background:c.bgCard, borderRadius:8, padding:'8px 12px', border:`1px solid ${c.border}` }}>
                Saving as: <strong style={{ color:c.txt }}>{selectedBodyPart}</strong> · <strong style={{ color:c.txt }}>{modality}</strong>
              </div>

              <div>
                <label style={{ fontSize:12, fontWeight:600, color:c.sub, display:'block', marginBottom:4 }}>Template Name *</label>
                <input value={saveName} onChange={e => setSaveName(e.target.value)}
                  placeholder={`e.g. Normal ${selectedBodyPart} ${modality}`}
                  style={c.inp} maxLength={80} />
              </div>

              <div>
                <label style={{ fontSize:12, fontWeight:600, color:c.sub, display:'block', marginBottom:4 }}>Content (editable before saving)</label>
                <textarea value={saveContent} onChange={e => setSaveContent(e.target.value)}
                  style={{ ...c.inp, minHeight:180, resize:'vertical', lineHeight:1.6, fontFamily:'Georgia,"Times New Roman",serif', fontSize:12 }}
                  placeholder="Generate a report in Col 2 first — it will appear here automatically." />
              </div>

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
