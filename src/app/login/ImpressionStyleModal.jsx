'use client';
// ImpressionStyleModal.jsx — LucidMSK Impression Style Preview
// Opened from ReportPreferencesPanel. Generates the IMPRESSION section for
// a single fixed, fictional sample shoulder MRI (sampleShoulderCase.js) in
// several style variants, using the exact same rule text the real report
// generator uses (reportStyleRules.js via impressionPreviewUtils.js) — so
// what the user previews here is exactly what they'll get in real reports.
//
// Props:
//   dm            — dark mode boolean
//   onApply(patch)— callback: merges the chosen style's preference patch
//                   into the parent's draft preferences (caller still needs
//                   to hit Save in ReportPreferencesPanel to persist it)
//   onClose()     — callback: hides the modal

import { useState } from 'react';
import { SAMPLE_SHOULDER_FINDINGS } from './sampleShoulderCase';
import { generateImpressionPreview } from './impressionPreviewUtils';

const CARDS = [
  { id: 'concise',   label: 'Concise',              desc: 'Brief — most critical finding only',            lengthKey: 'concise',  styleKey: 'standard', negatives: false, patch: { impressionLength: 'concise' } },
  { id: 'verbose',   label: 'Verbose',               desc: 'Fuller explanatory phrasing per item',           lengthKey: 'detailed', styleKey: 'standard', negatives: false, patch: { impressionLength: 'detailed' } },
  { id: 'grading',   label: 'Grading-Scale Focus',   desc: 'States the formal grade/type where one applies', lengthKey: 'standard', styleKey: 'gradingFocus', negatives: false, patch: { impressionStyle: 'gradingFocus' } },
  { id: 'itemized',  label: 'Itemized, Numbered',    desc: 'Every damaged structure gets its own line',      lengthKey: 'standard', styleKey: 'itemizedNumbered', negatives: false, patch: { impressionStyle: 'itemizedNumbered' } },
  { id: 'lumped',    label: 'Lumped by Mechanism',   desc: 'Groups cuff tendons, labrum/biceps, etc.',       lengthKey: 'standard', styleKey: 'lumpedByMechanism', negatives: false, patch: { impressionStyle: 'lumpedByMechanism' } },
  { id: 'negatives', label: '+ Pertinent Negatives', desc: 'Adds one line of key negative findings',         lengthKey: 'standard', styleKey: 'standard', negatives: true, patch: { includePertinentNegatives: true } },
];

export default function ImpressionStyleModal({ dm, onApply, onClose }) {
  const [results, setResults] = useState({}); // id -> { status: 'idle'|'loading'|'done'|'error', text, error }
  const [running, setRunning] = useState(false);
  const [showSample, setShowSample] = useState(false);

  const c = {
    bg:     dm ? '#0f172a' : '#ffffff',
    bgCard: dm ? '#1e293b' : '#f8fafc',
    border: dm ? '#334155' : '#e2e8f0',
    txt:    dm ? '#e2e8f0' : '#1e293b',
    sub:    dm ? '#94a3b8' : '#64748b',
    accent: '#2563eb',
    green:  dm ? '#4ade80' : '#16a34a',
    red:    dm ? '#f87171' : '#dc2626',
  };

  const handleGenerateAll = async () => {
    setRunning(true);
    setResults(Object.fromEntries(CARDS.map(card => [card.id, { status: 'loading' }])));
    await Promise.all(CARDS.map(async card => {
      try {
        const text = await generateImpressionPreview({ lengthKey: card.lengthKey, styleKey: card.styleKey, includeNegatives: card.negatives });
        setResults(r => ({ ...r, [card.id]: { status: 'done', text } }));
      } catch (e) {
        setResults(r => ({ ...r, [card.id]: { status: 'error', error: e?.message || 'Generation failed.' } }));
      }
    }));
    setRunning(false);
  };

  const handleUseStyle = (card) => {
    onApply(card.patch);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:c.bg, borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,0.4)', width:'100%', maxWidth:640, maxHeight:'88vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'14px 16px', borderBottom:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>🔍</span>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:'white', letterSpacing:'0.02em' }}>Impression Style Preview</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>Same fixed sample shoulder MRI, rendered in each style</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, width:30, height:30, color:'white', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:'12px 16px', overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:10 }}>

          <div style={{ fontSize:11, color:c.sub, background:c.bgCard, borderRadius:8, padding:'8px 12px', border:`1px solid ${c.border}` }}>
            This uses a fixed, fictional sample case — not your dictation or any patient data — purely so you can compare styles side by side.
          </div>

          <button onClick={() => setShowSample(s => !s)}
            style={{ alignSelf:'flex-start', background:'transparent', border:'none', color:c.accent, fontSize:11, fontWeight:600, cursor:'pointer', padding:0 }}>
            {showSample ? '▾ Hide sample FINDINGS' : '▸ Show sample FINDINGS'}
          </button>
          {showSample && (
            <div style={{ fontSize:11, color:c.sub, background:c.bgCard, border:`1px solid ${c.border}`, borderRadius:8, padding:'10px 12px', whiteSpace:'pre-wrap', lineHeight:1.6, fontFamily:'ui-monospace, monospace' }}>
              {SAMPLE_SHOULDER_FINDINGS}
            </div>
          )}

          <button onClick={handleGenerateAll} disabled={running}
            style={{ padding:'10px 0', borderRadius:9, border:'none', background: running ? (dm?'#1e293b':'#e2e8f0') : 'linear-gradient(135deg,#2563eb,#4f46e5)', color: running ? (dm?'#475569':'#94a3b8') : 'white', fontSize:13, fontWeight:700, cursor: running ? 'not-allowed' : 'pointer', boxShadow: running ? 'none' : '0 4px 12px rgba(37,99,235,0.3)' }}>
            {running ? 'Generating examples…' : Object.keys(results).length ? '↻ Regenerate Examples' : '✨ Generate Examples'}
          </button>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {CARDS.map(card => {
              const r = results[card.id] || { status: 'idle' };
              return (
                <div key={card.id} style={{ background:c.bgCard, border:`1px solid ${c.border}`, borderRadius:10, padding:'10px 12px', display:'flex', flexDirection:'column', gap:6 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:c.txt }}>{card.label}</div>
                      <div style={{ fontSize:11, color:c.sub }}>{card.desc}</div>
                    </div>
                    <button onClick={() => handleUseStyle(card)} disabled={r.status !== 'done'}
                      style={{ flexShrink:0, padding:'5px 10px', borderRadius:7, border:`1px solid ${r.status==='done' ? c.accent : c.border}`, background:'transparent', color: r.status==='done' ? c.accent : c.sub, fontSize:11, fontWeight:700, cursor: r.status==='done' ? 'pointer' : 'not-allowed', opacity: r.status==='done' ? 1 : 0.5 }}>
                      Use This Style
                    </button>
                  </div>
                  {r.status === 'loading' && <div style={{ fontSize:12, color:c.sub, fontStyle:'italic' }}>Generating…</div>}
                  {r.status === 'error' && <div style={{ fontSize:12, color:c.red }}>{r.error}</div>}
                  {r.status === 'done' && (
                    <div style={{ fontSize:12, color:c.txt, whiteSpace:'pre-wrap', lineHeight:1.7, borderTop:`1px solid ${c.border}`, paddingTop:6 }}>
                      {r.text}
                    </div>
                  )}
                  {r.status === 'idle' && <div style={{ fontSize:11, color:c.sub, fontStyle:'italic' }}>Click "Generate Examples" above to preview.</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
