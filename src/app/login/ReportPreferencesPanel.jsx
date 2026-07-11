'use client';
// ReportPreferencesPanel.jsx — LucidMSK Report Style Preferences
// Two tabs:
//   Checklist     — every toggle/select preference, explicit per-field control
//   Report Styles — pick a starting point by reading static example reports
// Deliberately has NO free-text input anywhere — every control is a
// button/select from a fixed list — so there is no field a user could
// accidentally paste or dictate patient information into.
//
// CONFLICT RULE: if a user has explicitly changed a field on the Checklist
// tab, picking a Report Style that would touch that same field leaves it
// alone — Checklist choices always win. See touchedRef below.
//
// Props:
//   dm           — dark mode boolean
//   prefs        — current preferences object (from reportPreferencesUtils.loadReportPrefs)
//   onSave(prefs)— async callback: persists the updated preferences (Supabase)
//   onClose()    — callback: hides the panel

import { useState, useRef } from 'react';
import {
  NORMAL_TERM_OPTIONS,
  DEFAULT_REPORT_PREFS,
} from './reportPreferencesData';
import {
  IMPRESSION_LENGTH_OPTIONS, IMPRESSION_STYLE_OPTIONS, DIGIT_NAMING_OPTIONS, HEDGING_LANGUAGE_OPTIONS,
  NERVE_LISTING_OPTIONS, SPINE_CANAL_TERM_OPTIONS, GRADING_SYSTEMS_OPTIONS, IMPRESSION_NUMBERING_OPTIONS,
} from './reportStyleRules';
import { SAMPLE_SHOULDER_FINDINGS, REPORT_STYLE_EXAMPLES } from './sampleReportExamples';

export default function ReportPreferencesPanel({ dm, prefs, onSave, onClose }) {
  const initial = { ...DEFAULT_REPORT_PREFS, ...prefs };
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tab, setTab] = useState('checklist'); // 'checklist' | 'styles'
  const [showSample, setShowSample] = useState(false);
  const [appliedStyleId, setAppliedStyleId] = useState(null);
  const [skippedNote, setSkippedNote] = useState('');

  // Fields the user has explicitly set via the Checklist tab THIS session,
  // plus anything already non-default when the panel opened (best-effort —
  // we can't know whether a saved non-default value originally came from a
  // Checklist edit or a prior style pick, so we protect it either way).
  const touchedRef = useRef(new Set(
    Object.keys(DEFAULT_REPORT_PREFS).filter(k => initial[k] !== DEFAULT_REPORT_PREFS[k])
  ));

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

  const set = (key, val) => {
    touchedRef.current.add(key);
    setDraft(d => ({ ...d, [key]: val }));
    setSaved(false); setSaveError('');
  };

  const handleUseStyle = (card) => {
    const applied = {};
    const skipped = [];
    Object.entries(card.patch).forEach(([key, val]) => {
      if (touchedRef.current.has(key)) skipped.push(key);
      else applied[key] = val;
    });
    setDraft(d => ({ ...d, ...applied }));
    setAppliedStyleId(card.id);
    setSaved(false); setSaveError('');
    setSkippedNote(skipped.length
      ? `Kept your Checklist setting for ${skipped.join(', ')} — everything else from "${card.label}" was applied.`
      : '');
  };

  const handleSave = async () => {
    setSaving(true); setSaveError(''); setSaved(false);
    try {
      await onSave(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    } catch (e) {
      setSaveError(e?.message || 'Failed to save preferences. Check your connection and try again.');
    }
    setSaving(false);
  };

  const handleReset = () => {
    touchedRef.current = new Set();
    setDraft({ ...DEFAULT_REPORT_PREFS });
    setAppliedStyleId(null);
    setSkippedNote('');
  };

  // ── Reusable controls ─────────────────────────────────────────────────
  const ButtonGroup = ({ options, value, onChange }) => (
    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
      {options.map(opt => {
        const active = value === opt.val;
        return (
          <button key={String(opt.val)} onClick={() => onChange(opt.val)}
            title={opt.desc || undefined}
            style={{
              padding:'6px 12px', borderRadius:7,
              border:`1.5px solid ${active ? c.accent : c.border}`,
              background: active ? (dm ? '#1e3a5f' : '#eff6ff') : 'transparent',
              color: active ? (dm ? '#93c5fd' : c.accent) : c.sub,
              fontSize:12, fontWeight: active ? 700 : 500, cursor:'pointer', transition:'all 0.12s',
            }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  const Section = ({ title, hint, children }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:6, padding:'12px 0', borderBottom:`1px solid ${c.border}` }}>
      <div style={{ fontSize:12, fontWeight:700, color:c.txt }}>{title}</div>
      {hint && <div style={{ fontSize:11, color:c.sub, lineHeight:1.5, marginBottom:2 }}>{hint}</div>}
      {children}
    </div>
  );

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)}
      style={{ flex:1, padding:'8px 0', border:'none', borderRadius:8, background: tab===id ? c.accent : 'transparent', color: tab===id ? 'white' : c.sub, fontWeight: tab===id ? 700 : 500, fontSize:13, cursor:'pointer', transition:'all 0.12s' }}>
      {label}
    </button>
  );

  // ── Checklist tab ─────────────────────────────────────────────────────
  const ChecklistTab = () => (
    <>
      <div style={{ fontSize:11, color:c.sub, background:c.bgCard, borderRadius:8, padding:'8px 12px', margin:'10px 0', border:`1px solid ${c.border}` }}>
        All settings here are fixed toggles — there's no text field, so there's no way to accidentally enter patient information.
      </div>

      <Section title="Normal / negative finding wording">
        <ButtonGroup options={NORMAL_TERM_OPTIONS} value={draft.normalTerm} onChange={v => set('normalTerm', v)} />
      </Section>

      <Section title="Impression length" hint="Standard follows the built-in report rules as-is.">
        <ButtonGroup options={IMPRESSION_LENGTH_OPTIONS} value={draft.impressionLength} onChange={v => set('impressionLength', v)} />
      </Section>

      <Section title="Impression structure style">
        <ButtonGroup options={IMPRESSION_STYLE_OPTIONS} value={draft.impressionStyle} onChange={v => set('impressionStyle', v)} />
      </Section>

      <Section title="Pertinent negatives in impression" hint="By default, negative findings stay in FINDINGS only. This adds one brief negatives line to the impression too.">
        <ButtonGroup
          options={[{ val:false, label:'Off' }, { val:true, label:'On' }]}
          value={draft.includePertinentNegatives}
          onChange={v => set('includePertinentNegatives', v)}
        />
      </Section>

      <Section title="Closing impression line" hint={'Adds "Please see above for additional observations." as the final impression item.'}>
        <ButtonGroup
          options={[{ val:false, label:'Off' }, { val:true, label:'On' }]}
          value={draft.appendSeeAboveLine}
          onChange={v => set('appendSeeAboveLine', v)}
        />
      </Section>

      <Section title="Finger naming" hint="How individual fingers are referred to in descriptive finding text.">
        <ButtonGroup options={DIGIT_NAMING_OPTIONS} value={draft.digitNaming} onChange={v => set('digitNaming', v)} />
      </Section>

      <Section title="Ambiguous / hedging language" hint={'Controls phrases like "cannot exclude," "unclear," "clinical correlation recommended."'}>
        <ButtonGroup options={HEDGING_LANGUAGE_OPTIONS} value={draft.hedgingLanguage} onChange={v => set('hedgingLanguage', v)} />
      </Section>

      <Section title="Include differential for indeterminate findings" hint="Beyond mass/tumor cases, which already include a differential when appropriate.">
        <ButtonGroup
          options={[{ val:false, label:'Off' }, { val:true, label:'On' }]}
          value={draft.alwaysDifferential}
          onChange={v => set('alwaysDifferential', v)}
        />
      </Section>

      <Section title="Nerve listing" hint="Lumped keeps the default single Regional Neurovascular Structures heading; Separate gives each nerve its own heading.">
        <ButtonGroup options={NERVE_LISTING_OPTIONS} value={draft.nerveListing} onChange={v => set('nerveListing', v)} />
      </Section>

      <Section title="Spine canal / foraminal terminology" hint="Applies to cervical, thoracic, and lumbar spine — MRI and CT.">
        <ButtonGroup options={SPINE_CANAL_TERM_OPTIONS} value={draft.spineCanalForaminalTerm} onChange={v => set('spineCanalForaminalTerm', v)} />
      </Section>

      <Section title="Named grading systems" hint="E.g. Goutallier, Kellgren-Lawrence, Outerbridge. Disabled describes findings descriptively instead.">
        <ButtonGroup options={GRADING_SYSTEMS_OPTIONS} value={draft.useGradingSystems} onChange={v => set('useGradingSystems', v)} />
      </Section>

      <Section title="Impression numbering style">
        <ButtonGroup options={IMPRESSION_NUMBERING_OPTIONS} value={draft.impressionNumbering} onChange={v => set('impressionNumbering', v)} />
      </Section>
    </>
  );

  // ── Report Styles tab ─────────────────────────────────────────────────
  const StylesTab = () => (
    <>
      <div style={{ fontSize:11, color:c.sub, background:c.bgCard, borderRadius:8, padding:'8px 12px', margin:'10px 0', border:`1px solid ${c.border}` }}>
        These are the same fixed, fictional sample case (not your dictation or any patient data) written out once in each style — pick whichever reads closest to how you write.
      </div>

      <button onClick={() => setShowSample(s => !s)}
        style={{ alignSelf:'flex-start', background:'transparent', border:'none', color:c.accent, fontSize:11, fontWeight:600, cursor:'pointer', padding:0, marginBottom:8 }}>
        {showSample ? '▾ Hide sample FINDINGS' : '▸ Show sample FINDINGS'}
      </button>
      {showSample && (
        <div style={{ fontSize:11, color:c.sub, background:c.bgCard, border:`1px solid ${c.border}`, borderRadius:8, padding:'10px 12px', whiteSpace:'pre-wrap', lineHeight:1.6, fontFamily:'ui-monospace, monospace', marginBottom:10 }}>
          {SAMPLE_SHOULDER_FINDINGS}
        </div>
      )}

      {skippedNote && (
        <div style={{ fontSize:11, color:dm?'#fb923c':'#c2410c', background:dm?'#3b0f02':'#fff7ed', border:`1px solid ${dm?'#7c2d12':'#fed7aa'}`, borderRadius:8, padding:'8px 12px', marginBottom:10 }}>
          {skippedNote}
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10, paddingBottom:8 }}>
        {REPORT_STYLE_EXAMPLES.map(card => {
          const isApplied = appliedStyleId === card.id;
          return (
            <div key={card.id} style={{ background:c.bgCard, border:`1px solid ${isApplied ? c.accent : c.border}`, borderRadius:10, padding:'10px 12px', display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:c.txt }}>{card.label}</div>
                  <div style={{ fontSize:11, color:c.sub }}>{card.desc}</div>
                </div>
                <button onClick={() => handleUseStyle(card)}
                  style={{ flexShrink:0, padding:'5px 10px', borderRadius:7, border:`1px solid ${c.accent}`, background: isApplied ? c.accent : 'transparent', color: isApplied ? 'white' : c.accent, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  {isApplied ? '✓ Applied' : 'Use This Style'}
                </button>
              </div>
              <div style={{ fontSize:12, color:c.txt, whiteSpace:'pre-wrap', lineHeight:1.7, borderTop:`1px solid ${c.border}`, paddingTop:6 }}>
                {card.impressionText}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:c.bg, borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,0.35)', width:'100%', maxWidth:520, maxHeight:'88vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'14px 16px', borderBottom:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>⚙️</span>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:'white', letterSpacing:'0.02em' }}>Report Style Preferences</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>Syncs to your account across devices</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, width:30, height:30, color:'white', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ padding:'10px 16px 0', borderBottom:`1px solid ${c.border}`, flexShrink:0 }}>
          <div style={{ display:'flex', gap:4, background:c.bgCard, borderRadius:10, padding:3 }}>
            <TabBtn id="checklist" label="✅ Checklist" />
            <TabBtn id="styles" label="📋 Report Styles" />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'4px 16px', overflowY:'auto', flex:1 }}>
          {tab === 'checklist' ? <ChecklistTab /> : <StylesTab />}
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 16px', borderTop:`1px solid ${c.border}`, display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
          {saveError && <div style={{ fontSize:11, color:'#dc2626', background:dm?'rgba(239,68,68,0.1)':'#fef2f2', border:`1px solid ${dm?'#991b1b':'#fca5a5'}`, borderRadius:8, padding:'6px 10px' }}>{saveError}</div>}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleReset} disabled={saving}
              style={{ padding:'9px 14px', borderRadius:9, border:`1.5px solid ${c.border}`, background:'transparent', color:c.sub, fontSize:12, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              Reset to defaults
            </button>
            <div style={{ flex:1 }} />
            {saved && <span style={{ fontSize:12, color:c.green, fontWeight:600, alignSelf:'center' }}>✓ Saved</span>}
            <button onClick={handleSave} disabled={saving}
              style={{ padding:'9px 18px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'white', fontSize:13, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow:'0 4px 12px rgba(37,99,235,0.3)' }}>
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
