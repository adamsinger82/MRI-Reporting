'use client';
import { useState, useRef, useEffect } from 'react';

const ANATOMY = {
  knee: 'Medial Meniscus, Lateral Meniscus, Anterior Cruciate Ligament, Posterior Cruciate Ligament, Medial Collateral Ligament Complex, Lateral Collateral Ligament Complex, Patellar Tendon, Quadriceps Tendon, Medial Compartment Articular Cartilage, Lateral Compartment Articular Cartilage, Patellofemoral Articular Cartilage, Bones, Joint Effusion, Baker Cyst, Soft Tissues',
  shoulder: 'Supraspinatus Tendon, Infraspinatus Tendon, Subscapularis Tendon, Teres Minor Tendon, Biceps Tendon Long Head, Acromioclavicular Joint, Glenohumeral Joint, Glenoid Labrum, Articular Cartilage, Bones, Joint Effusion, Soft Tissues',
  hip: 'Acetabular Labrum, Articular Cartilage, Iliopsoas Tendon, Gluteus Medius Tendon, Gluteus Minimus Tendon, Proximal Hamstring Tendons, Bones, Joint Effusion, Soft Tissues',
  wrist: 'Triangular Fibrocartilage Complex, Scapholunate Ligament, Lunotriquetral Ligament, Extrinsic Ligaments, Flexor Tendons, Extensor Tendons, Median Nerve, Articular Cartilage, Bones, Soft Tissues',
  elbow: 'Ulnar Collateral Ligament, Radial Collateral Ligament Complex, Common Flexor Tendon, Common Extensor Tendon, Distal Biceps Tendon, Triceps Tendon, Ulnar Nerve, Articular Cartilage, Bones, Joint Effusion, Soft Tissues',
  ankle: 'Anterior Talofibular Ligament, Calcaneofibular Ligament, Posterior Talofibular Ligament, Deltoid Ligament Complex, Syndesmosis, Achilles Tendon, Posterior Tibial Tendon, Peroneal Tendons, Flexor Hallucis Longus Tendon, Plantar Fascia, Articular Cartilage, Bones, Joint Effusion, Soft Tissues',
  spine: 'Vertebral Alignment, Vertebral Bodies, Intervertebral Discs, Spinal Canal, Conus Medullaris, Neural Foramina, Facet Joints, Paraspinal Soft Tissues',
  pelvis: 'Sacroiliac Joints, Pubic Symphysis, Hip Joints, Iliopsoas Muscles, Gluteal Muscles, Proximal Hamstring Tendons, Pelvic Bones, Soft Tissues',
  foot: 'Plantar Fascia, Achilles Tendon Insertion, Peroneal Tendons, Posterior Tibial Tendon, Lisfranc Ligament Complex, Plantar Plate, Articular Cartilage, Bones, Soft Tissues',
};

const BODY_PARTS = ['knee','shoulder','hip','wrist','elbow','ankle','spine','pelvis','foot'];
const BILATERAL = ['spine','pelvis'];

function buildPrompt(part, lat, con) {
  return `You are a subspecialty MSK radiologist generating a structured MRI report.

ANATOMY TO COVER for ${part}: ${ANATOMY[part]}
Generate a subheading for EVERY structure listed above.

RULES:
1. Structures not mentioned in dictation: write "intact" only.
2. Structures mentioned as normal: write "intact."
3. Positive findings: use ONLY the exact words dictated. Do not add morphology, signal, measurements, tear type, grade, or any detail not stated.
4. No recommendations or clinical suggestions.

FORMAT — exact headers on their own lines:

TECHNIQUE:
Multiplanar multisequence MRI of the ${lat ? lat + ' ' : ''}${part} ${con} IV contrast.

FINDINGS:
[Title Case subheading: finding — one line per structure]

IMPRESSION:
[Numbered list, most important first. If normal: "No significant MRI findings of the ${lat ? lat + ' ' : ''}${part}."]`;
}

function formatReport(txt) {
  if (!txt) return null;
  const cleaned = txt.replace(/\bunremarkable\b/gi, 'intact');
  return cleaned.split('\n').map((line, i) => {
    const t = line.trim();
    const isHeader = /^(TECHNIQUE|FINDINGS|IMPRESSION):?$/.test(t);
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
  const recognitionRef = useRef(null);

  const showSide = !BILATERAL.includes(selectedBodyPart);
  const technique = `Multiplanar multisequence MRI of the${showSide ? ' ' + side : ''} ${selectedBodyPart} ${contrast} IV contrast.`;

  // ── Generate report via /api/generate ────────────────────────────────────
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
          system: buildPrompt(selectedBodyPart, lat, contrast),
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

  // ── Microphone — this exact implementation worked previously ─────────────
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // webkit must come first — window.SpeechRecognition is broken in Edge
    const SpeechRecognitionAPI =
      window.webkitSpeechRecognition ||
      window.SpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setMicError('');
    const finalTranscriptRef = { current: '' };

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onaudiostart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        setDictationText(finalTranscriptRef.current + interim);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicError('Microphone access denied. Click the lock icon in your address bar and allow microphone access.');
          setIsListening(false);
        }
        // network / no-speech / audio-capture are non-fatal — onend will restart
      };

      recognition.onend = () => {
        // Must create a NEW instance — cannot call .start() on an ended recognition
        // Small delay required for Edge before creating new instance
        if (recognitionRef.current === recognition) {
          setTimeout(() => {
          if (recognitionRef.current !== recognition) return; // stopped during delay
          const SpeechRecognitionAPI2 =
            window.webkitSpeechRecognition ||
            window.SpeechRecognition ||
            window.mozSpeechRecognition ||
            window.msSpeechRecognition;
          try {
            const rec2 = new SpeechRecognitionAPI2();
            rec2.continuous = true;
            rec2.interimResults = true;
            rec2.lang = 'en-US';
            rec2.maxAlternatives = 1;
            rec2.onstart = recognition.onstart;
            rec2.onaudiostart = recognition.onaudiostart;
            rec2.onresult = recognition.onresult;
            rec2.onerror = recognition.onerror;
            rec2.onend = recognition.onend;
            rec2.start();
            recognitionRef.current = rec2;
          } catch (e) {
            setIsListening(false);
          }
          }, 150); // end setTimeout
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setMicError('Could not start microphone: ' + err.message);
    }
  };

  const stopListening = () => {
    const rec = recognitionRef.current;
    recognitionRef.current = null; // clear ref so onend doesn't restart
    try { rec?.stop(); } catch (e) {}
    setIsListening(false);
  };

  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  const copyToClipboard = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', padding: '16px', minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)', fontFamily: "'Segoe UI',system-ui,sans-serif", boxSizing: 'border-box' };
  const col = () => ({ background: 'white', borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' });
  const hdr = (c) => ({ background: `linear-gradient(135deg,${c}ee,${c}aa)`, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '8px' });
  const htxt = { color: 'white', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 };
  const bod = { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 };
  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', color: '#1e293b', outline: 'none', background: 'white' };
  const lbl = { fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 };

  return (
    <div style={grid}>

      {/* ── COL 1: INPUT ── */}
      <div style={col()}>
        <div style={hdr('#1d4ed8')}><span style={{ fontSize: 16 }}>📝</span><p style={htxt}>Dictation Input</p></div>
        <div style={bod}>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 2 }}>
              <label style={lbl}>Body Part</label>
              <select style={inp} value={selectedBodyPart} onChange={e => setSelectedBodyPart(e.target.value)}>
                {BODY_PARTS.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
              </select>
            </div>
            {showSide && (
              <div style={{ flex: 1 }}>
                <label style={lbl}>Side</label>
                <select style={inp} value={side} onChange={e => setSide(e.target.value)}>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="bilateral">Bilateral</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label style={lbl}>Contrast</label>
            <select style={inp} value={contrast} onChange={e => setContrast(e.target.value)}>
              <option value="without">Without IV contrast</option>
              <option value="with">With IV contrast</option>
              <option value="with and without">With and without IV contrast</option>
            </select>
          </div>

          <div style={{ padding: '8px 10px', background: '#f0f9ff', borderRadius: 7, border: '1px solid #bae6fd', fontSize: 11, color: '#0369a1', fontStyle: 'italic', lineHeight: 1.5 }}>
            {technique}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={lbl}>Findings</label>
            <textarea
              style={{ ...inp, flex: 1, minHeight: 160, resize: 'vertical', lineHeight: 1.65, fontFamily: 'inherit', border: isListening ? '1.5px solid #ef4444' : '1px solid #e2e8f0', boxShadow: isListening ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none', transition: 'border 0.15s' }}
              value={dictationText}
              onChange={e => setDictationText(e.target.value)}
              placeholder="Type or dictate findings here…"
            />
          </div>

          {micError && (
            <div style={{ fontSize: 11, color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '6px 10px', lineHeight: 1.5 }}>
              {micError}
            </div>
          )}

          <button
            onClick={isListening ? stopListening : toggleListening}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid ' + (isListening ? '#fca5a5' : '#e2e8f0'), background: isListening ? '#fef2f2' : 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: isListening ? '#dc2626' : '#475569', transition: 'all 0.15s' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isListening ? '#ef4444' : '#94a3b8', boxShadow: isListening ? '0 0 8px #ef4444' : 'none', transition: 'all 0.3s', flexShrink: 0 }} />
            {isListening ? '⏹ Stop Recording' : '🎤 Start Dictation'}
          </button>

          <button
            onClick={generateReport}
            disabled={isGenerating || !dictationText.trim()}
            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: 'none', background: (isGenerating || !dictationText.trim()) ? '#cbd5e1' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', fontSize: '14px', fontWeight: 700, cursor: (isGenerating || !dictationText.trim()) ? 'not-allowed' : 'pointer', boxShadow: (isGenerating || !dictationText.trim()) ? 'none' : '0 4px 14px rgba(37,99,235,0.35)', letterSpacing: '0.02em' }}>
            {isGenerating ? 'Generating…' : '✨ Generate Report'}
          </button>

        </div>
      </div>

      {/* ── COL 2: REPORT ── */}
      <div style={col()}>
        <div style={hdr('#6d28d9')}><span style={{ fontSize: 16 }}>📄</span><p style={htxt}>Generated Report</p></div>
        <div style={bod}>
          <div style={{ flex: 1, padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', overflowY: 'auto', minHeight: 340, maxHeight: '68vh', background: generatedReport ? 'white' : '#f8fafc' }}>
            {isGenerating
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
                  {[60, 85, 70, 90, 55, 75].map((w, i) => (<div key={i} style={{ height: 10, background: '#e2e8f0', borderRadius: 4, width: w + '%' }} />))}
                </div>
              : generatedReport
                ? <div style={{ fontFamily: "Georgia,'Times New Roman',serif" }}>{formatReport(generatedReport)}</div>
                : <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 13, paddingTop: 4, lineHeight: 1.7 }}>Report will appear here after generation.</div>
            }
          </div>
          <button
            onClick={copyToClipboard}
            disabled={!generatedReport}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid ' + (copySuccess ? '#86efac' : '#e2e8f0'), background: copySuccess ? '#f0fdf4' : (!generatedReport ? '#f8fafc' : 'white'), fontSize: '13px', fontWeight: 600, cursor: !generatedReport ? 'not-allowed' : 'pointer', color: copySuccess ? '#16a34a' : '#475569', transition: 'all 0.2s' }}>
            {copySuccess ? '✓ Copied to Clipboard' : '📋 Copy for PowerScribe'}
          </button>
        </div>
      </div>

      {/* ── COL 3: REFERENCE ── */}
      <div style={col()}>
        <div style={hdr('#0e7490')}><span style={{ fontSize: 16 }}>📐</span><p style={htxt}>Reference Panel</p></div>
        <div style={bod}>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.6 }}>Measurement diagrams and normal values by joint — coming in next update.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
            {['Knee', 'Shoulder', 'Hip', 'Wrist', 'Elbow', 'Ankle', 'Spine', 'Pelvis', 'Foot'].map(j => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#f0f9ff', borderRadius: 7, border: '1px solid #e0f2fe', fontSize: 12, color: '#0369a1', fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0891b2', flexShrink: 0 }} />
                {j}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
