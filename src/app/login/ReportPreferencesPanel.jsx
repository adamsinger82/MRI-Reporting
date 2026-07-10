'use client';
// ReportPreferencesPanel.jsx — LucidMSK Report Style Preferences
// Toggle-only settings panel for per-user report generation style.
// Deliberately has NO free-text input anywhere — every control is a
// button/select from a fixed list — so there is no field a user could
// accidentally paste or dictate patient information into.
//
// Props:
//   dm           — dark mode boolean
//   prefs        — current preferences object (from reportPreferencesUtils.loadReportPrefs)
//   onSave(prefs)— callback: persists + applies the updated preferences in the parent
//   onClose()    — callback: hides the panel

import { useState } from 'react';
import {
  NORMAL_TERM_OPTIONS,
  DEFAULT_MASS_MODE_OPTIONS,
  DEFAULT_LAY_SUMMARY_OPTIONS,
  DEFAULT_REPORT_PREFS,
} from './reportPreferencesData';
import { IMPRESSION_LENGTH_OPTIONS, IMPRESSION_STYLE_OPTIONS, DIGIT_NAMING_OPTIONS, HEDGING_LANGUAGE_OPTIONS } from './reportStyleRules';
import ImpressionStyleModal from './ImpressionStyleModal';

export default function ReportPreferencesPanel({ dm, prefs, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...DEFAULT_REPORT_PREFS, ...prefs });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const c = {
    bg:     dm ? '#0f172a' : '#ffffff',
    bgCard: dm ? '#1e293b' : '#f8fafc',
    border: dm ? '#334155' : '#e2e8f0',
    txt:    dm ? '#e2e8f0' : '#1e293b',
    sub:    dm ? '#94a3b8' : '#64748b',
    accent: '#2563eb',
    green:  dm ? '#4ade80' : '#16a34a',
  };

  const set = (key, val) => { setDraft(d => ({ ...d, [key]: val })); setSaved(false); setSaveError(''); };

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

  const handleReset = () => setDraft({ ...DEFAULT_REPORT_PREFS });

  // ── Reusable button-group control ───────────────────────────────────────
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

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:c.bg, borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,0.35)', width:'100%', maxWidth:480, maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'14px 16px', borderBottom:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>⚙️</span>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:'white', letterSpacing:'0.02em' }}>Report Style Preferences</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>Applies to every report you generate on this device</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, width:30, height:30, color:'white', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:'4px 16px', overflowY:'auto', flex:1 }}>
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

          <button onClick={() => setShowPreview(true)}
            style={{ padding:'9px 0', borderRadius:9, border:`1.5px solid ${c.accent}`, background:'transparent', color:c.accent, fontSize:12, fontWeight:700, cursor:'pointer', margin:'10px 0 4px' }}>
            🔍 Preview Impression Styles on a Sample Case
          </button>

          <Section title="Include differential for indeterminate findings" hint="Beyond mass/tumor cases, which already include a differential when appropriate.">
            <ButtonGroup
              options={[{ val:false, label:'Off' }, { val:true, label:'On' }]}
              value={draft.alwaysDifferential}
              onChange={v => set('alwaysDifferential', v)}
            />
          </Section>

          <Section title="Default: patient-friendly summary" hint="Sets the starting state of the “Understanding Your Results” checkbox — you can still toggle it per report.">
            <ButtonGroup options={DEFAULT_LAY_SUMMARY_OPTIONS} value={draft.defaultLayPersonSummary} onChange={v => set('defaultLayPersonSummary', v)} />
          </Section>

          <Section title="Default: mass / tumor case type" hint="Sets the starting selection — still changeable per report.">
            <ButtonGroup options={DEFAULT_MASS_MODE_OPTIONS} value={draft.defaultMassMode} onChange={v => set('defaultMassMode', v)} />
          </Section>
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
      {showPreview && (
        <ImpressionStyleModal
          dm={dm}
          onApply={patch => { setDraft(d => ({ ...d, ...patch })); setSaved(false); }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
