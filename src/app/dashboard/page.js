'use client';
import { useState, useRef, useEffect } from 'react';
import { JOINT_DATA, DIAGRAM_SVGS } from './referenceData';

const BODY_PARTS = ['knee','shoulder','hip','wrist','elbow','ankle','spine','pelvis','foot'];
const BILATERAL = ['spine','pelvis'];

const ANATOMY = {
  knee: 'Medial Meniscus, Lateral Meniscus, Anterior Cruciate Ligament, Posterior Cruciate Ligament, Medial Collateral Ligament Complex, Lateral Collateral Ligament Complex, Patellar Tendon, Quadriceps Tendon, Medial Compartment Articular Cartilage, Lateral Compartment Articular Cartilage, Patellofemoral Articular Cartilage, Bones, Joint Effusion, Baker Cyst, Soft Tissues',
  shoulder: 'Supraspinatus Tendon, Infraspinatus Tendon, Subscapularis Tendon, Teres Minor Tendon, Biceps Tendon Long Head, Acromioclavicular Joint, Glenohumeral Joint, Glenoid Labrum, Articular Cartilage, Bones, Joint Effusion, Soft Tissues',
  hip: 'Acetabular Labrum, Articular Cartilage, Iliopsoas Tendon, Gluteus Medius Tendon, Gluteus Minimus Tendon, Proximal Hamstring Tendons, Bones, Joint Effusion, Soft Tissues',
  wrist: 'Triangular Fibrocartilage Complex, Scapholunate Ligament, Lunotriquetral Ligament, Extrinsic Ligaments, Flexor Tendons, Extensor Tendons, Median Nerve, Articular Cartilage, Bones, Soft Tissues',
  elbow: 'Ulnar Collateral Ligament, Radial Collateral Ligament Complex, Common Flexor Tendon, Common Extensor Tendon, Distal Biceps Tendon, Triceps Tendon, Ulnar Nerve, Articular Cartilage, Bones, Joint Effusion, Soft Tissues',
  ankle: 'Anterior Talofibular Ligament, Calcaneofibular Ligament, Posterior Talofibular Ligament, Deltoid Ligament Complex, Syndesmosis, Achilles Tendon, Posterior Tibial Tendon, Peroneal Tendons, Flexor Hallucis Longus Tendon, Plantar Fascia, Articular Cartilage, Bones, Joint Effusion, Soft Tissues',
  spine: 'Vertebral Alignment, Vertebral Bodies, Intervertebral Discs (each level), Spinal Canal, Neural Foramina, Facet Joints, Paraspinal Soft Tissues',
  pelvis: 'Sacroiliac Joints, Pubic Symphysis, Hip Joints, Iliopsoas Muscles, Gluteal Muscles, Proximal Hamstring Tendons, Pelvic Bones, Soft Tissues',
  foot: 'Plantar Fascia, Achilles Tendon Insertion, Peroneal Tendons, Posterior Tibial Tendon, Lisfranc Ligament Complex, Plantar Plate, Articular Cartilage, Bones, Soft Tissues',
};

function buildPrompt(part, lat, con, spineRegion) {
  return `You are a subspecialty MSK radiologist generating a structured MRI report.

ANATOMY TO COVER for ${part}: ${ANATOMY[part]}
Generate a subheading for EVERY structure listed above.

FINDINGS RULES:
1. Structures not mentioned in dictation: write "intact" only.
2. Structures mentioned as normal: write "intact."
3. Positive findings: use ONLY the exact words dictated. No added morphology, signal, measurements, tear type, grade, or any unstated detail.
4. No clinical recommendations.

IMPRESSION RULES:
- Synthesize positive findings into a clinically meaningful, concise impression.
- Group related findings under a unifying diagnosis where appropriate (e.g. multiple findings from a pivot shift injury grouped together, impingement syndrome findings grouped, etc).
- Number each impression item. Most important first.
- Use concise MSK radiology impression language.
- If entirely normal: "No significant MRI findings of the ${lat ? lat + ' ' : ''}${part}."

FORMAT:

TECHNIQUE:
Multiplanar multisequence MRI of the ${lat ? lat + ' ' : ''}${part} ${con} IV contrast.

FINDINGS:
[Title Case subheading: finding]
${part === 'spine' ? `
LEVELS:
List each relevant intervertebral level on its own line in format "L1-L2:" or "C3-C4:" or "T6-T7:" etc.
- If a level is NOT specifically mentioned in the dictation: write "No significant canal or foraminal narrowing."
- If a positive finding IS mentioned for a level: write ONLY exactly what was dictated, nothing more.
- Cover all levels appropriate for the ${spineRegion} spine.
` : ''}
IMPRESSION:
[Synthesized numbered list]`;
}

function formatReport(txt) {
  if (!txt) return null;
  const cleaned = txt.replace(/\bunremarkable\b/gi, 'intact');
  return cleaned.split('\n').map((line, i) => {
    const t = line.trim();
    const isHeader = /^(TECHNIQUE|FINDINGS|IMPRESSION|LEVELS):?$/.test(t);
    const colonIdx = t.indexOf(':');
    const isSubheader = !isHeader && colonIdx > 0 && colonIdx < 60 && /^[A-Z]/.test(t) && t.length < 100;
    const isNumbered = /^\d+\./.test(t);
    if (isHeader) return (
      <div key={i} style={{ marginTop: i > 0 ? 20 : 0, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#1e3a5f', borderBottom: '2px solid #2563eb', paddingBottom: 3, display: 'inline-block' }}>{t}</span>
      </div>
    );
    if (isSubheader) {
      const label = t.slice(0, colonIdx + 1);
      const value = t.slice(colonIdx + 1).trim();
      const isNeg = /^intact\.?$/i.test(value);
      return (
        <div key={i} style={{ marginTop: 8, paddingLeft: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{label} </span>
          <span style={{ fontSize: 13, color: isNeg ? '#6b7280' : '#dc2626', fontWeight: isNeg ? 400 : 600 }}>{value}</span>
        </div>
      );
    }
    if (isNumbered) {
      const num = t.match(/^\d+\./)[0];
      return (
        <div key={i} style={{ marginTop: 5, paddingLeft: 4, fontSize: 13, lineHeight: 1.7, display: 'flex', gap: 6 }}>
          <span style={{ fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>{num}</span>
          <span style={{ color: '#dc2626', fontWeight: 500 }}>{t.slice(num.length).trim()}</span>
        </div>
      );
    }
    if (!t) return <div key={i} style={{ height: 5 }} />;
    return <div key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, paddingLeft: 4 }}>{t}</div>;
  });
}

function ReferencePanel({ selectedBodyPart }) {
  const jointData = JOINT_DATA[selectedBodyPart];
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');
  useEffect(() => { setSelectedMeasurementId(''); }, [selectedBodyPart]);
  const selectedMeasurement = jointData?.measurements?.find(m => m.id === selectedMeasurementId);
  const accent = '#0891b2';
  if (!jointData) return <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>Select a body part.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, margin: 0 }}>{jointData.label} — Measurements</p>
        <select style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: 'white', cursor: 'pointer', color: '#1e293b', boxSizing: 'border-box' }}
          value={selectedMeasurementId} onChange={e => setSelectedMeasurementId(e.target.value)}>
          <option value="">— Select a measurement —</option>
          {jointData.measurements.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        {selectedMeasurement ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ display: 'inline-block', padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: 999, fontSize: 11, fontWeight: 600, width: 'fit-content' }}>{selectedMeasurement.plane}</span>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{selectedMeasurement.description}</p>
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: '#fafbfc', padding: 8 }}>
              {DIAGRAM_SVGS[selectedMeasurement.diagram] || <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>Diagram coming soon</div>}
            </div>
          </div>
        ) : (
          <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, color: '#64748b', fontSize: 12, textAlign: 'center', border: '1px dashed #bae6fd' }}>Select a measurement to see the technique diagram</div>
        )}
      </div>
      <div style={{ height: 1, background: 'linear-gradient(to right,transparent,#e2e8f0,transparent)', margin: '14px 0', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, margin: 0 }}>📊 Normal Values</p>
        {selectedMeasurement ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <tbody>
              {selectedMeasurement.normalValues.map((nv, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '5px 4px', color: '#64748b', width: '45%', verticalAlign: 'top' }}>{nv.label}</td>
                  <td style={{ padding: '5px 4px', color: '#1e293b', fontWeight: 600, fontFamily: "'Courier New',monospace" }}>{nv.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto', maxHeight: 320 }}>
            {jointData.measurements.map(m => (
              <div key={m.id} onClick={() => setSelectedMeasurementId(m.id)}
                style={{ padding: '7px 10px', background: '#f8fafc', borderRadius: 7, border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0891b2' }}>{m.label}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{m.normalValues[0]?.label}: {m.normalValues[0]?.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [selectedBodyPart, setSelectedBodyPart] = useState('knee');
  const [side, setSide] = useState('left');
  const [contrast, setContrast] = useState('without');
  const [dictationText, setDictationText] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [micError, setMicError] = useState('');
  const [spineRegion, setSpineRegion] = useState('lumbar');
  const recognitionRef = useRef(null);

  const showSide = !BILATERAL.includes(selectedBodyPart);
  const technique = `Multiplanar multisequence MRI of the${showSide ? ' ' + side : ''}${selectedBodyPart === 'spine' ? ' ' + spineRegion : ''} ${selectedBodyPart} ${contrast} IV contrast.`;

  const generateReport = async () => {
    if (!dictationText.trim()) return;
    setIsGenerating(true);
    setGeneratedReport('');
    const lat = showSide ? side : '';
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: buildPrompt(selectedBodyPart, lat, contrast, spineRegion),
          messages: [{ role: 'user', content: `Dictated findings:\n\n${dictationText}` }],
        }),
      });
      const data = await res.json();
      if (data?.error) setGeneratedReport('Error: ' + data.error);
      else setGeneratedReport(data?.content?.[0]?.text || 'Error generating report.');
    } catch (err) {
      setGeneratedReport('Network error. Please try again.');
    }
    setIsGenerating(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    if (!SpeechRecognitionAPI) { alert('Speech recognition not supported. Please use Chrome or Edge.'); return; }
    setMicError('');
    const finalTranscriptRef = { current: '' };
    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListening(true);
      recognition.onaudiostart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscriptRef.current += t + ' ';
          else interim += t;
        }
        setDictationText(finalTranscriptRef.current + interim);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') { setMicError('Microphone access denied. Click the lock icon in your address bar.'); setIsListening(false); }
      };
      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          setTimeout(() => {
            if (recognitionRef.current !== recognition) return;
            const SR2 = window.webkitSpeechRecognition || window.SpeechRecognition;
            try {
              const rec2 = new SR2();
              rec2.continuous = true; rec2.interimResults = true; rec2.lang = 'en-US'; rec2.maxAlternatives = 1;
              rec2.onstart = recognition.onstart; rec2.onaudiostart = recognition.onaudiostart;
              rec2.onresult = recognition.onresult; rec2.onerror = recognition.onerror; rec2.onend = recognition.onend;
              rec2.start(); recognitionRef.current = rec2;
            } catch (e) { setIsListening(false); }
          }, 150);
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) { setIsListening(false); setMicError('Could not start microphone: ' + err.message); }
  };

  const stopListening = () => { const rec = recognitionRef.current; recognitionRef.current = null; try { rec?.stop(); } catch (e) {} setIsListening(false); };
  useEffect(() => () => { recognitionRef.current?.stop(); }, []);
  const copyToClipboard = () => { if (!generatedReport) return; navigator.clipboard.writeText(generatedReport).then(() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2500); }); };

  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #dde3ed', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', color: '#1e293b', outline: 'none', background: 'white' };
  const lbl = { fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d1b2a 0%,#1a3a5c 45%,#0d1b2a 100%)', fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

      <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🦴</div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: '0.02em' }}>MSK MRI Reporting</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Advanced MSK Radiology Tools</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 999, padding: '4px 10px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
          <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, padding: 16, boxSizing: 'border-box' }}>

        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>📝</span><span style={{ color: 'white', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Dictation Input</span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 2 }}><label style={lbl}>Body Part</label>
                <select style={inp} value={selectedBodyPart} onChange={e => setSelectedBodyPart(e.target.value)}>
                  {BODY_PARTS.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
                </select>
              </div>
              {showSide && <div style={{ flex: 1 }}><label style={lbl}>Side</label>
                <select style={inp} value={side} onChange={e => setSide(e.target.value)}>
                  <option value="left">Left</option><option value="right">Right</option><option value="bilateral">Bilateral</option>
                </select>
              </div>}
              {selectedBodyPart === 'spine' && <div style={{ flex: 1 }}><label style={lbl}>Region</label>
                <select style={inp} value={spineRegion} onChange={e => setSpineRegion(e.target.value)}>
                  <option value="cervical">Cervical</option>
                  <option value="thoracic">Thoracic</option>
                  <option value="lumbar">Lumbar</option>
                </select>
              </div>}
            </div>
            <div><label style={lbl}>Contrast</label>
              <select style={inp} value={contrast} onChange={e => setContrast(e.target.value)}>
                <option value="without">Without IV contrast</option><option value="with">With IV contrast</option><option value="with and without">With and without IV contrast</option>
              </select>
            </div>
            <div style={{ padding: '9px 12px', background: 'linear-gradient(135deg,#eff6ff,#f0f9ff)', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 12, color: '#1d4ed8', fontStyle: 'italic', lineHeight: 1.5 }}>{technique}</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><label style={lbl}>Findings</label>
              <textarea style={{ ...inp, flex: 1, minHeight: 160, resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit', border: isListening ? '1.5px solid #ef4444' : '1px solid #dde3ed', boxShadow: isListening ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none', transition: 'all 0.15s' }}
                value={dictationText} onChange={e => setDictationText(e.target.value)} placeholder="Type or dictate findings here…" />
            </div>
            {micError && <div style={{ fontSize: 11, color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 7, padding: '7px 10px', lineHeight: 1.5 }}>{micError}</div>}
            <button onClick={isListening ? stopListening : toggleListening}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 10, borderRadius: 9, border: '1.5px solid ' + (isListening ? '#fca5a5' : '#dde3ed'), background: isListening ? '#fef2f2' : '#f8fafc', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: isListening ? '#dc2626' : '#475569', transition: 'all 0.15s' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isListening ? '#ef4444' : '#94a3b8', boxShadow: isListening ? '0 0 8px #ef4444' : 'none', flexShrink: 0, transition: 'all 0.3s' }} />
              {isListening ? '⏹ Stop Recording' : '🎤 Start Dictation'}
            </button>
            <button onClick={generateReport} disabled={isGenerating || !dictationText.trim()}
              style={{ width: '100%', padding: 12, borderRadius: 9, border: 'none', background: (isGenerating || !dictationText.trim()) ? '#e2e8f0' : 'linear-gradient(135deg,#2563eb,#4f46e5)', color: (isGenerating || !dictationText.trim()) ? '#94a3b8' : 'white', fontSize: 14, fontWeight: 700, cursor: (isGenerating || !dictationText.trim()) ? 'not-allowed' : 'pointer', boxShadow: (isGenerating || !dictationText.trim()) ? 'none' : '0 4px 16px rgba(37,99,235,0.35)', letterSpacing: '0.02em' }}>
              {isGenerating ? '⏳ Generating…' : '✨ Generate Report'}
            </button>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'linear-gradient(135deg,#5b21b6,#7c3aed)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>📄</span><span style={{ color: 'white', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Generated Report</span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ flex: 1, padding: '14px 16px', border: '1px solid #e8edf5', borderRadius: 10, overflowY: 'auto', minHeight: 340, maxHeight: '65vh', background: generatedReport ? 'white' : '#f8fafc' }}>
              {isGenerating
                ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>{[55,80,65,90,50,72,60].map((w,i) => <div key={i} style={{ height: 9, background: `rgba(37,99,235,${0.06+i*0.02})`, borderRadius: 4, width: w+'%' }} />)}</div>
                : generatedReport
                  ? <div style={{ fontFamily: "Georgia,'Times New Roman',serif" }}>{formatReport(generatedReport)}</div>
                  : <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 13, textAlign: 'center', paddingTop: 40, lineHeight: 1.8 }}><div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>Report will appear here after generation.</div>
              }
            </div>
            <button onClick={copyToClipboard} disabled={!generatedReport}
              style={{ width: '100%', padding: 10, borderRadius: 9, border: '1.5px solid ' + (copySuccess ? '#86efac' : '#e2e8f0'), background: copySuccess ? '#f0fdf4' : (!generatedReport ? '#f8fafc' : 'white'), fontSize: 13, fontWeight: 600, cursor: !generatedReport ? 'not-allowed' : 'pointer', color: copySuccess ? '#16a34a' : '#475569', transition: 'all 0.2s' }}>
              {copySuccess ? '✓ Copied to Clipboard' : '📋 Copy for PowerScribe'}
            </button>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'linear-gradient(135deg,#0e7490,#0891b2)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>📐</span><span style={{ color: 'white', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Reference Panel</span>
          </div>
          <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
            <ReferencePanel selectedBodyPart={selectedBodyPart} />
          </div>
        </div>

      </div>
      <style>{`@media(max-width:900px){div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
