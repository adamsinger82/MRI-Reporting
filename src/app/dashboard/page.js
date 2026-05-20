'use client';
import { useState, useRef, useEffect } from 'react';
import { JOINT_DATA, DIAGRAM_SVGS } from './referenceData';

const BODY_PARTS = ['knee','shoulder','hip','wrist','elbow','ankle','spine','pelvis','foot'];
const BILATERAL = ['spine','pelvis'];

// Structures that should read "absent" when not mentioned
const ABSENT_STRUCTURES = [
  'joint effusion','effusion','baker cyst','bursa','bursitis',
  'soft tissue mass','mass','ganglion','cyst','lipoma','hematoma',
  'loose body','loose bodies','synovitis','plicae','plica',
];

const ANATOMY = {
  knee:'Medial Meniscus, Lateral Meniscus, Anterior Cruciate Ligament, Posterior Cruciate Ligament, Medial Collateral Ligament Complex, Lateral Collateral Ligament Complex, Patellar Tendon, Quadriceps Tendon, Medial Compartment Articular Cartilage, Lateral Compartment Articular Cartilage, Patellofemoral Articular Cartilage, Bones, Joint Effusion, Baker Cyst, Soft Tissues',
  shoulder:'Supraspinatus Tendon, Infraspinatus Tendon, Subscapularis Tendon, Teres Minor Tendon, Biceps Tendon Long Head, Acromioclavicular Joint, Glenohumeral Joint, Glenoid Labrum, Articular Cartilage, Bones, Joint Effusion, Soft Tissues',
  hip:'Acetabular Labrum, Articular Cartilage, Iliopsoas Tendon, Gluteus Medius Tendon, Gluteus Minimus Tendon, Proximal Hamstring Tendons, Bones, Joint Effusion, Soft Tissues',
  wrist:'Triangular Fibrocartilage Complex, Scapholunate Ligament, Lunotriquetral Ligament, Extrinsic Ligaments, Flexor Tendons, Extensor Tendons, Median Nerve, Articular Cartilage, Bones, Soft Tissues',
  elbow:'Ulnar Collateral Ligament, Radial Collateral Ligament Complex, Common Flexor Tendon, Common Extensor Tendon, Distal Biceps Tendon, Triceps Tendon, Ulnar Nerve, Articular Cartilage, Bones, Joint Effusion, Soft Tissues',
  ankle:'Anterior Talofibular Ligament, Calcaneofibular Ligament, Posterior Talofibular Ligament, Deltoid Ligament Complex, Syndesmosis, Achilles Tendon, Posterior Tibial Tendon, Peroneal Tendons, Flexor Hallucis Longus Tendon, Plantar Fascia, Articular Cartilage, Bones, Joint Effusion, Soft Tissues',
  spine:'Vertebral Alignment, Vertebral Bodies, Intervertebral Discs (each level), Spinal Canal, Neural Foramina, Facet Joints, Paraspinal Soft Tissues',
  pelvis:'Sacroiliac Joints, Pubic Symphysis, Hip Joints, Iliopsoas Muscles, Gluteal Muscles, Proximal Hamstring Tendons, Pelvic Bones, Soft Tissues',
  foot:'Plantar Fascia, Achilles Tendon Insertion, Peroneal Tendons, Posterior Tibial Tendon, Lisfranc Ligament Complex, Plantar Plate, Articular Cartilage, Bones, Soft Tissues',
};

function buildPrompt(part, lat, con, spineRegion, modality) {
  const isCT = modality === 'CT';
  const modalityName = isCT ? 'CT' : 'MRI';
  const techniqueText = isCT
    ? `CT scan of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part} ${con} IV contrast. Multiplanar reformats were created. One or more of the following dose optimizing techniques were utilized for this exam: automated exposure control, adjustment of the mA and/or kV according to patient size, and/or use of iterative reconstruction technique.`
    : `Multiplanar multisequence MRI of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part} ${con} IV contrast.`;

  const findingsRules = isCT
    ? `FINDINGS RULES (CT): 1. Not mentioned: write "intact." EXCEPTION: Joint Effusion, Baker Cyst, bursae, soft tissue masses write "absent." 2. Positive: exact dictated words only. 3. CT language only: attenuation, cortical integrity, trabecular pattern. No T1/T2/STIR/marrow signal language. 4. BONES RULE — address all three: Fracture/cortical disruption (or "No fracture or cortical disruption."), Osteonecrosis (or "No osteonecrosis."), Osseous lesion (or "No aggressive osseous lesion.") — three sentences on same line.`
    : `FINDINGS RULES: 1. Not mentioned: write "intact." EXCEPTION: Joint Effusion, Baker Cyst, bursae, soft tissue masses — write "absent" not "intact." 2. Positive: exact dictated words only, no added morphology/signal/measurements. 3. BONES RULE — address all three: Fracture/contusion (or "No fracture or contusion."), Osteonecrosis (or "No osteonecrosis."), Marrow signal (or "No marrow infiltration or bone lesion.") — three sentences on same line. Example: "Bones: No fracture or contusion. No osteonecrosis. No marrow infiltration or bone lesion."`;

  const normalImpressionText = isCT
    ? `If entirely normal: "No significant CT findings of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part}."`
    : `If entirely normal: "No significant MRI findings of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part}."`;

  return `You are a subspecialty MSK radiologist generating a structured ${modalityName} report.

CRITICAL FORMATTING RULES:
- NEVER use markdown. No asterisks, no bold, no dashes, no bullet points.
- Section headers (TECHNIQUE, FINDINGS, LEVELS, IMPRESSION) on their own line in ALL CAPS with colon.
- Subheadings: "Structure Name: finding text" — Title Case, colon, finding on same line.

ANATOMY TO COVER for ${part}: ${ANATOMY[part]}
Generate a subheading for EVERY structure listed above.
${findingsRules}
IMPRESSION RULES:
- Synthesize positive findings into clinically meaningful impression.
- Number each item. Most important first.
- ${normalImpressionText}

FORMAT:
TECHNIQUE:
${techniqueText}

FINDINGS:
Structure Name: finding
${part === 'spine' ? `
LEVELS:
List each intervertebral level as: "L1-L2: finding" — one per line.
If not mentioned write: "No significant canal or foraminal narrowing."
Cover all levels for the ${spineRegion} spine.
` : ''}
IMPRESSION:
1. Finding one
2. Finding two`;
}

function isAbsentStructure(label) {
  const l = label.toLowerCase().replace(':','').trim();
  return ABSENT_STRUCTURES.some(s => l.includes(s));
}

function formatReport(txt) {
  if (!txt) return null;
  const cleaned = txt
    .replace(/\bunremarkable\b/gi, 'intact')
    .replace(/\*\*/g, '')
    .replace(/^---+$/gm, '')
    .replace(/^\s*[-•]\s+/gm, '');

  let inImpression = false;

  return cleaned.split('\n').map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{ height: 5 }} />;

    const isHeader = /^(TECHNIQUE|FINDINGS|IMPRESSION|LEVELS):?$/.test(t);
    if (isHeader) {
      inImpression = t.startsWith('IMPRESSION');
      return (
        <div key={i} style={{ marginTop: i > 0 ? 20 : 0, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#1e3a5f', borderBottom: '2px solid #2563eb', paddingBottom: 3, display: 'inline-block' }}>{t}</span>
        </div>
      );
    }

    const isNumbered = /^\d+\./.test(t);
    if (isNumbered || inImpression) {
      const num = t.match(/^\d+\./)?.[0];
      return (
        <div key={i} style={{ marginTop: 5, paddingLeft: 4, fontSize: 13, lineHeight: 1.7, display: 'flex', gap: 6 }}>
          {num && <span style={{ fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>{num}</span>}
          <span style={{ color: '#1e293b', fontWeight: 400 }}>{num ? t.slice(num.length).trim() : t}</span>
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
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{label} </span>
            {sentences.map((s, si) => {
              const st = s.trim();
              const sentNeg = negPattern.test(st);
              return <span key={si} style={{ fontSize: 13, color: sentNeg ? '#6b7280' : '#dc2626', fontWeight: sentNeg ? 400 : 600 }}>{st}{si < sentences.length - 1 ? ' ' : ''}</span>;
            })}
          </div>
        );
      }
      return (
        <div key={i} style={{ marginTop: 8, paddingLeft: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{label} </span>
          <span style={{ fontSize: 13, color: isAllNeg ? '#6b7280' : '#dc2626', fontWeight: isAllNeg ? 400 : 600 }}>{value}</span>
        </div>
      );
    }

    return <div key={i} style={{ fontSize: 13, color: inImpression ? '#1e293b' : '#dc2626', fontWeight: inImpression ? 400 : 500, lineHeight: 1.8, paddingLeft: 4 }}>{t}</div>;
  });
}

// ─── ANATOMY ATLAS DATA ────────────────────────────────────────────────────
const ATLAS_REGIONS = {
  'Upper Extremity': {
    shoulder: {
      label: 'Shoulder',
      layers: {
        bones: { color: '#c8d8e8', stroke: '#4a7fa5', label: 'Bones' },
        tendons: { color: '#8bb8a8', stroke: '#2d7a5a', label: 'Tendons' },
        muscles: { color: '#f0c0a0', stroke: '#c07040', label: 'Muscles' },
        nerves: { color: '#fde68a', stroke: '#d97706', label: 'Nerves' },
        arteries: { color: '#fca5a5', stroke: '#dc2626', label: 'Arteries' },
        veins: { color: '#c4b5fd', stroke: '#7c3aed', label: 'Veins' },
      },
      svgFn: (layers) => (
        <svg viewBox="0 0 400 380" style={{width:'100%',height:'100%'}}>
          {layers.bones && <>
            <ellipse cx="220" cy="180" rx="85" ry="80" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="220" y="183" textAnchor="middle" fontSize="11" fill="#2a5a7a">Humeral head</text>
            <ellipse cx="90" cy="175" rx="22" ry="65" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="90" y="178" textAnchor="middle" fontSize="9" fill="#2a5a7a">Glenoid</text>
            <rect x="55" y="60" width="180" height="28" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="145" y="78" textAnchor="middle" fontSize="10" fill="#2a5a7a">Acromion / Clavicle</text>
            <rect x="290" y="130" width="80" height="25" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2" transform="rotate(15 290 130)"/>
            <text x="330" y="145" textAnchor="middle" fontSize="8" fill="#2a5a7a">Coracoid</text>
          </>}
          {layers.tendons && <>
            <path d="M113 115 Q160 100 225 110 L225 128 Q160 115 113 130 Z" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5" opacity="0.85"/>
            <text x="170" y="122" textAnchor="middle" fontSize="9" fill="#1a4a3a">Supraspinatus</text>
            <path d="M113 130 Q160 122 225 128 L225 145 Q160 138 113 145 Z" fill="#6a9888" stroke="#2d7a5a" strokeWidth="1.5" opacity="0.85"/>
            <text x="170" y="140" textAnchor="middle" fontSize="8" fill="#1a4a3a">Infraspinatus</text>
            <path d="M113 200 Q145 195 175 200 L175 215 Q145 210 113 215 Z" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5" opacity="0.8"/>
            <text x="145" y="210" textAnchor="middle" fontSize="8" fill="#1a4a3a">Subscapularis</text>
            <path d="M180 88 L195 155" stroke="#8bb8a8" strokeWidth="7" strokeLinecap="round" opacity="0.85"/>
            <text x="205" y="122" fontSize="8" fill="#1a4a3a">Biceps LHT</text>
          </>}
          {layers.muscles && <>
            <ellipse cx="220" cy="310" rx="70" ry="35" fill="#f0c0a0" stroke="#c07040" strokeWidth="1.5" opacity="0.7"/>
            <text x="220" y="313" textAnchor="middle" fontSize="9" fill="#7a4020">Deltoid</text>
            <path d="M55 100 Q70 150 65 220" fill="none" stroke="#c07040" strokeWidth="12" strokeLinecap="round" opacity="0.5"/>
            <text x="42" y="165" fontSize="8" fill="#7a4020" transform="rotate(-10 42 165)">Trap</text>
          </>}
          {layers.nerves && <>
            <path d="M310 120 Q290 160 275 220" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="6 3" opacity="0.9"/>
            <text x="315" y="170" fontSize="8" fill="#d97706">Ax. n.</text>
            <path d="M270 140 Q255 200 250 270" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.9"/>
            <text x="258" y="210" fontSize="8" fill="#d97706">Radial n.</text>
          </>}
          {layers.arteries && <>
            <path d="M295 100 Q280 150 270 230" fill="none" stroke="#dc2626" strokeWidth="3" opacity="0.8"/>
            <text x="300" y="145" fontSize="8" fill="#dc2626">Ax. a.</text>
          </>}
          {layers.veins && <>
            <path d="M285 100 Q272 152 262 232" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.7"/>
            <text x="262" y="148" fontSize="8" fill="#7c3aed">Ax. v.</text>
          </>}
          <text x="200" y="368" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Shoulder — Coronal oblique</text>
        </svg>
      ),
    },
    knee: {
      label: 'Knee',
      layers: {
        bones: { color: '#c8d8e8', stroke: '#4a7fa5', label: 'Bones' },
        tendons: { color: '#8bb8a8', stroke: '#2d7a5a', label: 'Tendons / Ligaments' },
        muscles: { color: '#f0c0a0', stroke: '#c07040', label: 'Muscles' },
        nerves: { color: '#fde68a', stroke: '#d97706', label: 'Nerves' },
        arteries: { color: '#fca5a5', stroke: '#dc2626', label: 'Arteries' },
        veins: { color: '#c4b5fd', stroke: '#7c3aed', label: 'Veins' },
      },
      svgFn: (layers) => (
        <svg viewBox="0 0 400 400" style={{width:'100%',height:'100%'}}>
          {layers.bones && <>
            <rect x="140" y="20" width="120" height="140" rx="12" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="200" y="95" textAnchor="middle" fontSize="11" fill="#2a5a7a">Femur</text>
            <ellipse cx="162" cy="165" rx="45" ry="30" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2"/>
            <ellipse cx="238" cy="165" rx="45" ry="30" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2"/>
            <rect x="140" y="195" width="120" height="130" rx="10" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="200" y="265" textAnchor="middle" fontSize="11" fill="#2a5a7a">Tibia</text>
            <ellipse cx="200" cy="120" rx="22" ry="18" fill="#e8f0e0" stroke="#6a9060" strokeWidth="1.5"/>
            <text x="200" y="123" textAnchor="middle" fontSize="8" fill="#3a5030">Patella</text>
          </>}
          {layers.tendons && <>
            <path d="M165 190 Q200 175 235 190 L238 210 Q200 195 162 210 Z" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5" opacity="0.85"/>
            <text x="200" y="204" textAnchor="middle" fontSize="8" fill="#1a4a3a">Med/Lat Menisci</text>
            <line x1="178" y1="165" x2="222" y2="195" stroke="#2d7a5a" strokeWidth="4" opacity="0.9"/>
            <text x="188" y="185" fontSize="8" fill="#1a4a3a">ACL</text>
            <line x1="222" y1="165" x2="178" y2="195" stroke="#1a5a3a" strokeWidth="4" opacity="0.9"/>
            <text x="214" y="178" fontSize="8" fill="#1a4a3a">PCL</text>
            <path d="M195" y="138 L198 195" stroke="#8bb8a8" strokeWidth="8" strokeLinecap="round" opacity="0.85"/>
            <text x="210" y="165" fontSize="8" fill="#1a4a3a">Pat. ten.</text>
            <line x1="118" y1="155" x2="118" y2="215" stroke="#2d7a5a" strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
            <text x="88" y="188" fontSize="8" fill="#1a4a3a">MCL</text>
            <line x1="282" y1="155" x2="282" y2="215" stroke="#2d7a5a" strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
            <text x="287" y="188" fontSize="8" fill="#1a4a3a">LCL</text>
          </>}
          {layers.muscles && <>
            <rect x="60" y="20" width="55" height="140" rx="10" fill="#f0c0a0" stroke="#c07040" strokeWidth="1.5" opacity="0.7"/>
            <text x="87" y="92" textAnchor="middle" fontSize="8" fill="#7a4020">Quad</text>
            <rect x="285" y="20" width="55" height="140" rx="10" fill="#f0c0a0" stroke="#c07040" strokeWidth="1.5" opacity="0.7"/>
            <text x="312" y="92" textAnchor="middle" fontSize="8" fill="#7a4020">Hamstring</text>
          </>}
          {layers.nerves && <>
            <path d="M325 80 Q320 165 318 270" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="6 3" opacity="0.9"/>
            <text x="330" y="175" fontSize="8" fill="#d97706">Peroneal n.</text>
            <path d="M75" y="80 Q78 165 80 270" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="6 3" opacity="0.9"/>
            <text x="40" y="175" fontSize="8" fill="#d97706">Tib. n.</text>
          </>}
          {layers.arteries && <>
            <path d="M200" y="20 L200 380" stroke="#dc2626" strokeWidth="3" opacity="0.7"/>
            <text x="207" y="185" fontSize="8" fill="#dc2626">Pop. a.</text>
          </>}
          {layers.veins && <>
            <path d="M193" y="20 L193 380" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.7"/>
            <text x="168" y="185" fontSize="8" fill="#7c3aed">Pop. v.</text>
          </>}
          <text x="200" y="392" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Knee — Coronal view</text>
        </svg>
      ),
    },
  },
  'Lower Extremity': {
    hip: {
      label: 'Hip',
      layers: {
        bones: { color: '#c8d8e8', stroke: '#4a7fa5', label: 'Bones' },
        tendons: { color: '#8bb8a8', stroke: '#2d7a5a', label: 'Tendons' },
        muscles: { color: '#f0c0a0', stroke: '#c07040', label: 'Muscles' },
        nerves: { color: '#fde68a', stroke: '#d97706', label: 'Nerves' },
        arteries: { color: '#fca5a5', stroke: '#dc2626', label: 'Arteries' },
        veins: { color: '#c4b5fd', stroke: '#7c3aed', label: 'Veins' },
      },
      svgFn: (layers) => (
        <svg viewBox="0 0 400 380" style={{width:'100%',height:'100%'}}>
          {layers.bones && <>
            <path d="M55 50 Q200 20 340 50 L340 160 Q290 185 200 188 Q110 185 55 160 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="200" y="105" textAnchor="middle" fontSize="10" fill="#2a5a7a">Acetabulum / Ilium</text>
            <circle cx="200" cy="175" r="55" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="200" y="178" textAnchor="middle" fontSize="11" fill="#2a5a7a">Femoral head</text>
            <path d="M242 205 L290 300" stroke="#4a7fa5" strokeWidth="18" strokeLinecap="round" fill="none"/>
            <text x="280" y="260" fontSize="9" fill="#2a5a7a">Fem. neck</text>
          </>}
          {layers.tendons && <>
            <path d="M120 122 Q160 112 200 120 Q200 120 200 138 Q160 128 120 138 Z" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5" opacity="0.85"/>
            <text x="160" y="132" textAnchor="middle" fontSize="8" fill="#1a4a3a">Labrum</text>
            <path d="M55 200 Q80 220 100 250" fill="none" stroke="#8bb8a8" strokeWidth="7" strokeLinecap="round" opacity="0.85"/>
            <text x="55" y="235" fontSize="8" fill="#1a4a3a">Iliopsoas</text>
            <path d="M310 160 Q330 200 335 250" fill="none" stroke="#6a9888" strokeWidth="6" strokeLinecap="round" opacity="0.8"/>
            <text x="338" y="210" fontSize="8" fill="#1a4a3a">Glut. med.</text>
          </>}
          {layers.muscles && <>
            <path d="M55 80 Q75 160 70 250" fill="none" stroke="#c07040" strokeWidth="14" strokeLinecap="round" opacity="0.5"/>
            <text x="38" y="168" fontSize="8" fill="#7a4020">Iliopsoas m.</text>
            <path d="M340 80 Q320 160 325 250" fill="none" stroke="#c07040" strokeWidth="14" strokeLinecap="round" opacity="0.5"/>
            <text x="330" y="168" fontSize="8" fill="#7a4020">Glut. m.</text>
          </>}
          {layers.nerves && <>
            <path d="M90 170 Q110 230 115 310" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="6 3" opacity="0.9"/>
            <text x="95" y="250" fontSize="8" fill="#d97706">Femoral n.</text>
            <path d="M270 170 Q260 240 255 310" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="6 3" opacity="0.9"/>
            <text x="262" y="250" fontSize="8" fill="#d97706">Sciatic n.</text>
          </>}
          {layers.arteries && <>
            <path d="M100 160 Q108 235 110 310" fill="none" stroke="#dc2626" strokeWidth="3" opacity="0.8"/>
            <text x="112" y="238" fontSize="8" fill="#dc2626">Fem. a.</text>
          </>}
          {layers.veins && <>
            <path d="M92 160 Q100 235 102 310" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.7"/>
            <text x="72" y="238" fontSize="8" fill="#7c3aed">Fem. v.</text>
          </>}
          <text x="200" y="368" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Hip — Coronal view</text>
        </svg>
      ),
    },
    ankle: {
      label: 'Ankle',
      layers: {
        bones: { color: '#c8d8e8', stroke: '#4a7fa5', label: 'Bones' },
        tendons: { color: '#8bb8a8', stroke: '#2d7a5a', label: 'Tendons / Ligaments' },
        muscles: { color: '#f0c0a0', stroke: '#c07040', label: 'Muscles' },
        nerves: { color: '#fde68a', stroke: '#d97706', label: 'Nerves' },
        arteries: { color: '#fca5a5', stroke: '#dc2626', label: 'Arteries' },
        veins: { color: '#c4b5fd', stroke: '#7c3aed', label: 'Veins' },
      },
      svgFn: (layers) => (
        <svg viewBox="0 0 400 380" style={{width:'100%',height:'100%'}}>
          {layers.bones && <>
            <rect x="130" y="20" width="90" height="140" rx="8" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="175" y="92" textAnchor="middle" fontSize="10" fill="#2a5a7a">Tibia</text>
            <rect x="238" y="35" width="45" height="128" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="260" y="98" textAnchor="middle" fontSize="8" fill="#2a5a7a">Fibula</text>
            <path d="M115 160 Q175 150 260 160 L255 220 Q195 235 140 220 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="190" y="195" textAnchor="middle" fontSize="10" fill="#2a5a7a">Talus</text>
            <ellipse cx="148" cy="270" rx="60" ry="35" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="148" y="273" textAnchor="middle" fontSize="9" fill="#2a5a7a">Calcaneus</text>
          </>}
          {layers.tendons && <>
            <path d="M155" y="20 L158 160" stroke="#8bb8a8" strokeWidth="10" strokeLinecap="round" opacity="0.85"/>
            <text x="130" y="88" fontSize="8" fill="#1a4a3a">Tib. post.</text>
            <path d="M175 20 L178 160" stroke="#8bb8a8" strokeWidth="8" strokeLinecap="round" opacity="0.8"/>
            <text x="182" y="88" fontSize="8" fill="#1a4a3a">FHL</text>
            <path d="M238 30 Q225 100 220 165" fill="none" stroke="#6a9888" strokeWidth="8" strokeLinecap="round" opacity="0.85"/>
            <text x="225" y="60" fontSize="8" fill="#1a4a3a">Peroneal</text>
            <path d="M120 130 Q160 148 220 135" fill="none" stroke="#2d7a5a" strokeWidth="5" opacity="0.8"/>
            <text x="158" y="130" fontSize="8" fill="#1a4a3a">ATFL</text>
            <path d="M170 300 Q200 310 240 300" fill="none" stroke="#2d7a5a" strokeWidth="7" strokeLinecap="round" opacity="0.85"/>
            <text x="200" y="325" textAnchor="middle" fontSize="9" fill="#1a4a3a">Achilles</text>
          </>}
          {layers.nerves && <>
            <path d="M163 20 Q165 100 162 165" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.9"/>
            <text x="120" y="115" fontSize="8" fill="#d97706">Tib. n.</text>
          </>}
          {layers.arteries && <>
            <path d="M170 20 Q172 100 168 165" fill="none" stroke="#dc2626" strokeWidth="2.5" opacity="0.8"/>
            <text x="175" y="115" fontSize="8" fill="#dc2626">Post. tib. a.</text>
          </>}
          {layers.veins && <>
            <path d="M178 20 Q180 100 176 165" fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4 2" opacity="0.7"/>
          </>}
          <text x="200" y="368" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Ankle — Sagittal / lateral view</text>
        </svg>
      ),
    },
  },
  'Pelvis & Spine': {
    pelvis: {
      label: 'Pelvis',
      layers: {
        bones: { color: '#c8d8e8', stroke: '#4a7fa5', label: 'Bones' },
        tendons: { color: '#8bb8a8', stroke: '#2d7a5a', label: 'Tendons / Ligaments' },
        muscles: { color: '#f0c0a0', stroke: '#c07040', label: 'Muscles' },
        nerves: { color: '#fde68a', stroke: '#d97706', label: 'Nerves' },
        arteries: { color: '#fca5a5', stroke: '#dc2626', label: 'Arteries' },
        veins: { color: '#c4b5fd', stroke: '#7c3aed', label: 'Veins' },
      },
      svgFn: (layers) => (
        <svg viewBox="0 0 400 380" style={{width:'100%',height:'100%'}}>
          {layers.bones && <>
            <path d="M55 80 Q200 40 345 80 L355 180 Q280 230 200 235 Q120 230 45 180 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="200" y="130" textAnchor="middle" fontSize="10" fill="#2a5a7a">Ilium / Acetabulum</text>
            <path d="M155 175 L170 175 L165 220 L160 220 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
            <path d="M230 175 L245 175 L240 220 L235 220 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
            <ellipse cx="170" cy="230" rx="28" ry="28" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
            <ellipse cx="230" cy="230" rx="28" ry="28" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="170" y="233" textAnchor="middle" fontSize="8" fill="#2a5a7a">FH</text>
            <text x="230" y="233" textAnchor="middle" fontSize="8" fill="#2a5a7a">FH</text>
            <path d="M160 195 L240 195 L240 210 L160 210 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5" rx="4"/>
            <text x="200" y="206" textAnchor="middle" fontSize="8" fill="#2a5a7a">Pubic symphysis</text>
            <ellipse cx="200" cy="100" rx="35" ry="50" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="2"/>
            <text x="200" y="103" textAnchor="middle" fontSize="9" fill="#2a5a7a">Sacrum</text>
          </>}
          {layers.tendons && <>
            <path d="M80 155 Q120 148 155 155" fill="none" stroke="#2d7a5a" strokeWidth="5" opacity="0.8"/>
            <text x="112" y="148" fontSize="7" fill="#1a4a3a">SI lig.</text>
            <path d="M165 210 Q200 215 235 210" fill="none" stroke="#2d7a5a" strokeWidth="4" opacity="0.8"/>
            <text x="200" y="225" textAnchor="middle" fontSize="7" fill="#1a4a3a">Pub. sym.</text>
          </>}
          {layers.muscles && <>
            <ellipse cx="110" cy="148" rx="42" ry="30" fill="#f0c0a0" stroke="#c07040" strokeWidth="1.5" opacity="0.6"/>
            <text x="110" y="151" textAnchor="middle" fontSize="8" fill="#7a4020">Iliopsoas</text>
            <ellipse cx="290" cy="148" rx="42" ry="30" fill="#f0c0a0" stroke="#c07040" strokeWidth="1.5" opacity="0.6"/>
            <text x="290" y="151" textAnchor="middle" fontSize="8" fill="#7a4020">Gluteus</text>
          </>}
          {layers.nerves && <>
            <path d="M150 160 Q148 240 145 310" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="6 3" opacity="0.9"/>
            <text x="118" y="240" fontSize="8" fill="#d97706">Femoral n.</text>
            <path d="M250 160 Q252 240 255 310" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="6 3" opacity="0.9"/>
            <text x="258" y="240" fontSize="8" fill="#d97706">Sciatic n.</text>
          </>}
          {layers.arteries && <>
            <path d="M200" y="50 L205 150" stroke="#dc2626" strokeWidth="3" opacity="0.8"/>
            <path d="M205 150 Q175 165 155 190" stroke="#dc2626" strokeWidth="2.5" opacity="0.8" fill="none"/>
            <path d="M205 150 Q225 165 245 190" stroke="#dc2626" strokeWidth="2.5" opacity="0.8" fill="none"/>
            <text x="215" y="138" fontSize="8" fill="#dc2626">Iliac a.</text>
          </>}
          {layers.veins && <>
            <path d="M195 50 L192 150" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.7"/>
            <text x="168" y="138" fontSize="8" fill="#7c3aed">Iliac v.</text>
          </>}
          <text x="200" y="368" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Pelvis — Coronal view</text>
        </svg>
      ),
    },
  },
};

// ─── ANATOMY ATLAS MODAL ───────────────────────────────────────────────────
function AtlasModal({ onClose }) {
  const [selectedRegion, setSelectedRegion] = useState('Upper Extremity');
  const [selectedJoint, setSelectedJoint] = useState('shoulder');
  const [layers, setLayers] = useState({ bones:true, tendons:true, muscles:true, nerves:true, arteries:true, veins:true });

  const regionJoints = ATLAS_REGIONS[selectedRegion] || {};
  const jointData = regionJoints[selectedJoint] || Object.values(regionJoints)[0];

  useEffect(() => {
    const keys = Object.keys(ATLAS_REGIONS[selectedRegion] || {});
    if (keys.length > 0) setSelectedJoint(keys[0]);
  }, [selectedRegion]);

  const toggleLayer = (k) => setLayers(prev => ({ ...prev, [k]: !prev[k] }));
  const allOn = Object.values(layers).every(Boolean);
  const toggleAll = () => { const v = !allOn; setLayers({bones:v,tendons:v,muscles:v,nerves:v,arteries:v,veins:v}); };

  const layerColors = { bones:'#4a7fa5', tendons:'#2d7a5a', muscles:'#c07040', nerves:'#d97706', arteries:'#dc2626', veins:'#7c3aed' };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'white',borderRadius:16,width:'min(92vw,900px)',maxHeight:'90vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 25px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ background:'linear-gradient(135deg,#1e3a5f,#2563eb)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:20 }}>🫁</span>
            <span style={{ color:'white',fontWeight:800,fontSize:15,letterSpacing:'0.06em' }}>MSK ANATOMY ATLAS</span>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)',border:'none',color:'white',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:600 }}>✕ Close</button>
        </div>
        <div style={{ display:'flex',flex:1,overflow:'hidden',minHeight:0 }}>
          {/* Col 1 — region/joint selector */}
          <div style={{ width:160,borderRight:'1px solid #e2e8f0',padding:14,display:'flex',flexDirection:'column',gap:8,overflowY:'auto',background:'#f8fafc',flexShrink:0 }}>
            <p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>Region</p>
            <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
              style={{ width:'100%',padding:'7px 8px',border:'1px solid #e2e8f0',borderRadius:7,fontSize:12,background:'white',color:'#1e293b' }}>
              {Object.keys(ATLAS_REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'8px 0 0' }}>Joint / Region</p>
            {Object.entries(regionJoints).map(([k, v]) => (
              <button key={k} onClick={() => setSelectedJoint(k)}
                style={{ padding:'8px 10px',borderRadius:8,border:'1px solid ' + (selectedJoint===k ? '#2563eb' : '#e2e8f0'),background:selectedJoint===k ? '#eff6ff' : 'white',color:selectedJoint===k ? '#2563eb' : '#475569',fontSize:12,fontWeight:selectedJoint===k ? 700 : 400,cursor:'pointer',textAlign:'left' }}>
                {v.label}
              </button>
            ))}
          </div>
          {/* Col 2 — SVG anatomy image */}
          <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:16,overflowY:'auto',background:'white' }}>
            {jointData ? jointData.svgFn(layers) : <div style={{ color:'#94a3b8',fontSize:13 }}>Select a joint</div>}
          </div>
          {/* Col 3 — layer toggles */}
          <div style={{ width:148,borderLeft:'1px solid #e2e8f0',padding:14,display:'flex',flexDirection:'column',gap:8,background:'#f8fafc',flexShrink:0 }}>
            <p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>Layers</p>
            <button onClick={toggleAll}
              style={{ padding:'7px 10px',borderRadius:8,border:'1px solid #e2e8f0',background:allOn ? '#1e293b' : 'white',color:allOn ? 'white' : '#475569',fontSize:11,fontWeight:700,cursor:'pointer' }}>
              {allOn ? '⊗ All Off' : '⊕ All On'}
            </button>
            {Object.entries(layers).map(([k, on]) => (
              <button key={k} onClick={() => toggleLayer(k)}
                style={{ padding:'8px 10px',borderRadius:8,border:'2px solid ' + (on ? layerColors[k] : '#e2e8f0'),background:on ? layerColors[k]+'18' : 'white',color:on ? layerColors[k] : '#94a3b8',fontSize:11,fontWeight:on ? 700 : 400,cursor:'pointer',textAlign:'left',transition:'all 0.15s' }}>
                {on ? '● ' : '○ '}{k.charAt(0).toUpperCase()+k.slice(1)}
              </button>
            ))}
            <div style={{ marginTop:'auto',padding:'10px 8px',background:'#f0f9ff',borderRadius:8,border:'1px solid #bae6fd' }}>
              <p style={{ fontSize:9,color:'#0369a1',margin:0,lineHeight:1.5 }}>Toggle layers to isolate anatomy. More joints coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MSK DDx MODAL ─────────────────────────────────────────────────────────
function DdxModal({ onClose }) {
  const [tissueType, setTissueType] = useState('bone');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [boneLocation, setBoneLocation] = useState('epiphysis');
  const [depth, setDepth] = useState('deep');
  const [ctLytic, setCtLytic] = useState(false);
  const [ctSclerotic, setCtSclerotic] = useState(false);
  const [ctGroundGlass, setCtGroundGlass] = useState(false);
  const [ctChondroid, setCtChondroid] = useState(false);
  const [mriT1, setMriT1] = useState('');
  const [mriT2, setMriT2] = useState('');
  const [mriContrast, setMriContrast] = useState('');
  const [adcValue, setAdcValue] = useState('');
  const [ddxResult, setDdxResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const inp = { width:'100%',padding:'8px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,color:'#1e293b',background:'white',boxSizing:'border-box' };
  const lbl = { fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4 };

  const generateDdx = async () => {
    setIsGenerating(true);
    setDdxResult('');
    const ctFindings = [ctLytic&&'lytic',ctSclerotic&&'sclerotic/blastic',ctGroundGlass&&'ground glass',ctChondroid&&'chondroid matrix'].filter(Boolean).join(', ');
    const prompt = `You are a subspecialty MSK radiologist. Generate a prioritized differential diagnosis.

Patient: Age ${age||'unknown'}, Location: ${location||'not specified'}
Tissue type: ${tissueType}
${tissueType==='bone' ? `Bone location (epiphysis/metaphysis/diaphysis): ${boneLocation}` : `Depth: ${depth} to fascia`}
${ctFindings ? `CT matrix/density: ${ctFindings}` : ''}
${mriT1 ? `MRI T1: ${mriT1}` : ''}
${mriT2 ? `MRI T2: ${mriT2}` : ''}
${mriContrast ? `MRI enhancement: ${mriContrast}` : ''}
${adcValue ? `ADC value: ${adcValue} x10-3 mm2/s` : ''}

Provide:
1. TOP 5 DIFFERENTIAL DIAGNOSES in order of likelihood with brief rationale for each
2. KEY DISTINGUISHING FEATURES for the top diagnosis
3. RECOMMENDED NEXT STEPS (additional imaging or biopsy guidance)
4. RED FLAGS that would suggest malignancy

Format clearly with headers. Be concise and clinically actionable. Use established MSK radiology criteria (WHO classification, Kransdorf/Murphey, ACR criteria).`;

    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:1200,
          system:'You are a subspecialty MSK radiologist expert in bone and soft tissue tumor imaging. Provide evidence-based differential diagnoses using WHO 2020 bone tumor classification and established MSK radiology criteria.',
          messages:[{role:'user',content:prompt}],
        }),
      });
      const data = await res.json();
      setDdxResult(data?.content?.[0]?.text || 'Error generating DDx.');
    } catch { setDdxResult('Network error. Please try again.'); }
    setIsGenerating(false);
  };

  const tog = (val, setter, current) => (
    <button onClick={() => setter(current === val ? '' : val)}
      style={{ padding:'6px 12px',borderRadius:7,border:'1px solid '+(current===val?'#2563eb':'#e2e8f0'),background:current===val?'#eff6ff':'white',color:current===val?'#2563eb':'#64748b',fontSize:12,fontWeight:current===val?700:400,cursor:'pointer',whiteSpace:'nowrap' }}>
      {val}
    </button>
  );

  const chk = (label, val, setter) => (
    <label style={{ display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:12,color:val?'#1e293b':'#64748b' }}>
      <input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)} style={{ width:14,height:14,accentColor:'#2563eb' }}/>
      {label}
    </label>
  );

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'white',borderRadius:16,width:'min(95vw,820px)',maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 25px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:20 }}>🔬</span>
            <span style={{ color:'white',fontWeight:800,fontSize:15,letterSpacing:'0.06em' }}>MSK LESION DDx GENERATOR</span>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)',border:'none',color:'white',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:600 }}>✕ Close</button>
        </div>
        <div style={{ display:'flex',flex:1,overflow:'hidden',minHeight:0 }}>
          {/* Left — inputs */}
          <div style={{ width:320,borderRight:'1px solid #e2e8f0',padding:16,overflowY:'auto',flexShrink:0,display:'flex',flexDirection:'column',gap:12 }}>
            {/* Tissue type toggle */}
            <div>
              <label style={lbl}>Tissue Type</label>
              <div style={{ display:'flex',gap:6 }}>
                {['bone','soft tissue'].map(t => (
                  <button key={t} onClick={() => setTissueType(t)}
                    style={{ flex:1,padding:'8px 0',borderRadius:8,border:'2px solid '+(tissueType===t?'#2563eb':'#e2e8f0'),background:tissueType===t?'#eff6ff':'white',color:tissueType===t?'#2563eb':'#64748b',fontSize:13,fontWeight:tissueType===t?700:400,cursor:'pointer' }}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Patient Age</label>
              <input style={inp} type="number" placeholder="e.g. 45" value={age} onChange={e=>setAge(e.target.value)}/>
            </div>
            <div>
              <label style={lbl}>Anatomic Location</label>
              <input style={inp} placeholder="e.g. distal femur, thigh" value={location} onChange={e=>setLocation(e.target.value)}/>
            </div>
            {tissueType === 'bone' ? (
              <div>
                <label style={lbl}>Location in Bone</label>
                <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                  {['epiphysis','metaphysis','diaphysis','epiphysis/metaphysis','metadiaphysis'].map(v => tog(v, setBoneLocation, boneLocation))}
                </div>
              </div>
            ) : (
              <div>
                <label style={lbl}>Depth</label>
                <div style={{ display:'flex',gap:6 }}>
                  {['superficial (above fascia)','deep (below fascia)'].map(v => tog(v, setDepth, depth))}
                </div>
              </div>
            )}
            <div>
              <label style={lbl}>CT Matrix / Density</label>
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                {chk('Lytic', ctLytic, setCtLytic)}
                {chk('Sclerotic / blastic', ctSclerotic, setCtSclerotic)}
                {chk('Ground glass', ctGroundGlass, setCtGroundGlass)}
                {chk('Chondroid matrix', ctChondroid, setCtChondroid)}
              </div>
            </div>
            <div>
              <label style={lbl}>MRI T1 Signal</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {['Low','Intermediate','High','Heterogeneous'].map(v => tog(v, setMriT1, mriT1))}
              </div>
            </div>
            <div>
              <label style={lbl}>MRI T2 Signal</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {['Low','Intermediate','High','Heterogeneous'].map(v => tog(v, setMriT2, mriT2))}
              </div>
            </div>
            <div>
              <label style={lbl}>MRI Contrast Enhancement</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {['None','Peripheral','Septal','Avid homogeneous','Heterogeneous'].map(v => tog(v, setMriContrast, mriContrast))}
              </div>
            </div>
            <div>
              <label style={lbl}>ADC Value (×10⁻³ mm²/s)</label>
              <input style={inp} placeholder="e.g. 0.8 (low) or 1.8 (high)" value={adcValue} onChange={e=>setAdcValue(e.target.value)}/>
            </div>
            <button onClick={generateDdx} disabled={isGenerating || (!age && !location)}
              style={{ width:'100%',padding:12,borderRadius:10,border:'none',background:(isGenerating||(!age&&!location))?'#e2e8f0':'linear-gradient(135deg,#4f46e5,#7c3aed)',color:(isGenerating||(!age&&!location))?'#94a3b8':'white',fontSize:14,fontWeight:700,cursor:(isGenerating||(!age&&!location))?'not-allowed':'pointer',letterSpacing:'0.02em',boxShadow:(isGenerating||(!age&&!location))?'none':'0 4px 16px rgba(124,58,237,0.35)' }}>
              {isGenerating ? '⏳ Generating DDx…' : '🔬 Generate DDx'}
            </button>
          </div>
          {/* Right — results */}
          <div style={{ flex:1,padding:16,overflowY:'auto',background:'#f8fafc' }}>
            {ddxResult ? (
              <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif",fontSize:13,lineHeight:1.7,color:'#1e293b',whiteSpace:'pre-wrap' }}>
                {ddxResult.split('\n').map((line, i) => {
                  const isH = /^#{1,3}\s|^[A-Z][A-Z\s]+:/.test(line.trim());
                  const isNum = /^\d+\./.test(line.trim());
                  return (
                    <div key={i} style={{ marginTop: isH ? 14 : isNum ? 8 : 2 }}>
                      {isH ? <span style={{ fontSize:12,fontWeight:800,color:'#4f46e5',textTransform:'uppercase',letterSpacing:'0.08em',borderBottom:'1px solid #e0e7ff',display:'block',paddingBottom:3 }}>{line.replace(/^#+\s/,'')}</span>
                           : isNum ? <span style={{ color:'#1e293b',fontWeight:600 }}>{line}</span>
                           : <span style={{ color:'#374151' }}>{line}</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12,color:'#94a3b8' }}>
                <div style={{ fontSize:48 }}>🦴</div>
                <div style={{ fontSize:14,fontWeight:600 }}>Enter patient details and imaging findings</div>
                <div style={{ fontSize:12,textAlign:'center',maxWidth:220,lineHeight:1.6 }}>Fill in age, location, and at least one imaging characteristic, then click Generate DDx</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REFERENCE PANEL ──────────────────────────────────────────────────────
function ReferencePanel({ selectedBodyPart }) {
  const jointData = JOINT_DATA[selectedBodyPart];
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');
  useEffect(() => { setSelectedMeasurementId(''); }, [selectedBodyPart]);
  const selectedMeasurement = jointData?.measurements?.find(m => m.id === selectedMeasurementId);
  const accent = '#0891b2';
  if (!jointData) return <div style={{ color:'#94a3b8',fontSize:13,textAlign:'center',padding:20 }}>Select a body part.</div>;
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:0,height:'100%' }}>
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <p style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:accent,margin:0 }}>{jointData.label} — Measurements</p>
        <select style={{ width:'100%',padding:'8px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white',cursor:'pointer',color:'#1e293b',boxSizing:'border-box' }}
          value={selectedMeasurementId} onChange={e => setSelectedMeasurementId(e.target.value)}>
          <option value="">— Select a measurement —</option>
          {jointData.measurements.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        {selectedMeasurement ? (
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
              <span style={{ display:'inline-block',padding:'2px 8px',background:'#e0f2fe',color:'#0369a1',borderRadius:999,fontSize:11,fontWeight:600,width:'fit-content' }}>{selectedMeasurement.plane}</span>
              <p style={{ fontSize:12,color:'#64748b',margin:0,lineHeight:1.5 }}>{selectedMeasurement.description}</p>
            </div>
            <div style={{ border:'1px solid #e2e8f0',borderRadius:8,overflow:'hidden',background:'#fafbfc',padding:8 }}>
              {DIAGRAM_SVGS[selectedMeasurement.diagram] || <div style={{ padding:24,textAlign:'center',color:'#94a3b8',fontSize:12 }}>Diagram coming soon</div>}
            </div>
            {selectedMeasurement.citations && (
              <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                <p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',margin:0 }}>📚 References</p>
                {selectedMeasurement.citations.map((c,i) => (
                  <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11,color:'#2563eb',textDecoration:'none',lineHeight:1.5,display:'block',padding:'4px 8px',background:'#eff6ff',borderRadius:6,border:'1px solid #bfdbfe' }}>
                    📄 {c.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding:12,background:'#f0f9ff',borderRadius:8,color:'#64748b',fontSize:12,textAlign:'center',border:'1px dashed #bae6fd' }}>Select a measurement to see the diagram and references</div>
        )}
      </div>
      <div style={{ height:1,background:'linear-gradient(to right,transparent,#e2e8f0,transparent)',margin:'14px 0',flexShrink:0 }} />
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <p style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:accent,margin:0 }}>📊 Normal Values</p>
        {selectedMeasurement ? (
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
            <tbody>
              {selectedMeasurement.normalValues.map((nv,i) => (
                <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'5px 4px',color:'#64748b',width:'45%',verticalAlign:'top' }}>{nv.label}</td>
                  <td style={{ padding:'5px 4px',color:'#1e293b',fontWeight:600,fontFamily:"'Courier New',monospace" }}>{nv.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:5,overflowY:'auto',maxHeight:320 }}>
            {jointData.measurements.map(m => (
              <div key={m.id} onClick={() => setSelectedMeasurementId(m.id)}
                style={{ padding:'7px 10px',background:'#f8fafc',borderRadius:7,border:'1px solid #f1f5f9',cursor:'pointer' }}>
                <div style={{ fontSize:12,fontWeight:600,color:'#0891b2' }}>{m.label}</div>
                <div style={{ fontSize:11,color:'#64748b' }}>{m.normalValues[0]?.label}: {m.normalValues[0]?.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [selectedBodyPart, setSelectedBodyPart] = useState('knee');
  const [side, setSide] = useState('left');
  const [contrast, setContrast] = useState('without');
  const [modality, setModality] = useState('MRI');
  const [dictationText, setDictationText] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [micError, setMicError] = useState('');
  const [spineRegion, setSpineRegion] = useState('lumbar');
  const [showAtlas, setShowAtlas] = useState(false);
  const [showDdx, setShowDdx] = useState(false);
  const recognitionRef = useRef(null);

  const showSide = !BILATERAL.includes(selectedBodyPart);
  const isCT = modality === 'CT';
  const partLabel = selectedBodyPart === 'spine' ? `${spineRegion} spine` : selectedBodyPart;
  const sideLabel = showSide ? `${side} ` : '';
  const contrastLabel = contrast === 'without' ? 'without' : contrast === 'with' ? 'with' : 'with and without';

  const technique = isCT
    ? `CT scan of the ${sideLabel}${partLabel} ${contrastLabel} IV contrast. Multiplanar reformats were created. One or more of the following dose optimizing techniques were utilized for this exam: automated exposure control, adjustment of the mA and/or kV according to patient size, and/or use of iterative reconstruction technique.`
    : `Multiplanar multisequence MRI of the ${sideLabel}${partLabel} ${contrastLabel} IV contrast.`;

  const generateReport = async () => {
    if (!dictationText.trim()) return;
    setIsGenerating(true);
    setGeneratedReport('');
    const lat = showSide ? side : '';
    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:1500,
          system: buildPrompt(selectedBodyPart, lat, contrast, spineRegion, modality),
          messages:[{role:'user',content:`Dictated findings:\n\n${dictationText}`}],
        }),
      });
      const data = await res.json();
      if (data?.error) setGeneratedReport('Error: ' + data.error);
      else setGeneratedReport(data?.content?.[0]?.text || 'Error generating report.');
    } catch { setGeneratedReport('Network error. Please try again.'); }
    setIsGenerating(false);
  };

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Please use Chrome or Edge.'); return; }
    setMicError('');
    const finalTranscriptRef = { current: '' };
    try {
      const recognition = new SR();
      recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US'; recognition.maxAlternatives = 1;
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
            } catch { setIsListening(false); }
          }, 150);
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) { setIsListening(false); setMicError('Could not start microphone: ' + err.message); }
  };

  const stopListening = () => { const rec = recognitionRef.current; recognitionRef.current = null; try { rec?.stop(); } catch {} setIsListening(false); };
  useEffect(() => () => { recognitionRef.current?.stop(); }, []);
  const copyToClipboard = () => { if (!generatedReport) return; navigator.clipboard.writeText(generatedReport).then(() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2500); }); };

  const inp = { width:'100%',padding:'9px 12px',border:'1px solid #dde3ed',borderRadius:8,fontSize:14,boxSizing:'border-box',color:'#1e293b',outline:'none',background:'white' };
  const lbl = { fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:5 };

  const colHdr = (gradient, icon, title) => (
    <div style={{ background:gradient,padding:'15px 18px',display:'flex',alignItems:'center',gap:10 }}>
      <span style={{ fontSize:18,filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>{icon}</span>
      <span style={{ color:'white',fontWeight:800,fontSize:13,textTransform:'uppercase',letterSpacing:'0.14em',textShadow:'0 1px 3px rgba(0,0,0,0.2)' }}>{title}</span>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(160deg,#0d1b2a 0%,#1a3a5c 45%,#0d1b2a 100%)',fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {showAtlas && <AtlasModal onClose={() => setShowAtlas(false)} />}
      {showDdx && <DdxModal onClose={() => setShowDdx(false)} />}

      {/* ── HEADER ── */}
      <div style={{ background:'rgba(255,255,255,0.04)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap' }}>
        {/* Left: logo + title */}
        <div style={{ display:'flex',alignItems:'center',gap:10,flexShrink:0 }}>
          <div style={{ width:36,height:36,background:'linear-gradient(135deg,#2563eb,#7c3aed)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>🦴</div>
          <div>
            <div style={{ color:'white',fontWeight:700,fontSize:16,letterSpacing:'0.02em' }}>MSK Reporting</div>
            <div style={{ color:'rgba(255,255,255,0.45)',fontSize:11 }}>Advanced MSK Radiology Tools</div>
          </div>
        </div>

        {/* Center: MRI/CT toggle + tool buttons */}
        <div style={{ display:'flex',alignItems:'center',gap:10,margin:'0 auto' }}>
          {/* MRI/CT toggle */}
          <div style={{ display:'flex',alignItems:'center',background:'rgba(255,255,255,0.08)',borderRadius:10,padding:3,gap:2 }}>
            {['MRI','CT'].map(m => (
              <button key={m} onClick={() => setModality(m)}
                style={{ padding:'6px 18px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:700,letterSpacing:'0.06em',transition:'all 0.2s',
                  background:modality===m?(m==='CT'?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#1d4ed8,#4f46e5)'):'transparent',
                  color:modality===m?'white':'rgba(255,255,255,0.45)',
                  boxShadow:modality===m?'0 2px 8px rgba(0,0,0,0.25)':'none' }}>
                {m}
              </button>
            ))}
          </div>

          {/* Atlas button */}
          <button onClick={() => setShowAtlas(true)}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',color:'white',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)' }}>
            <span>🫁</span> MRI Anatomy Atlas
          </button>

          {/* DDx button */}
          <button onClick={() => setShowDdx(true)}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(124,58,237,0.5)',background:'rgba(124,58,237,0.15)',color:'#c4b5fd',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)' }}>
            <span>🔬</span> MSK Lesion DDx
          </button>
        </div>

        {/* Right: user + logout */}
        <div style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0,marginLeft:'auto' }}>
          <div style={{ display:'flex',alignItems:'center',gap:7,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'6px 12px' }}>
            <div style={{ width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'white',fontWeight:700 }}>A</div>
            <span style={{ color:'rgba(255,255,255,0.8)',fontSize:12,fontWeight:600 }}>adamsinger82</span>
          </div>
          <button style={{ padding:'7px 13px',borderRadius:8,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:600,cursor:'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── THREE COLUMN GRID ── */}
      <div className="msk-grid">

        {/* Col 1 — Dictation */}
        <div style={{ background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr(isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#1d4ed8,#2563eb)', isCT?'🔬':'📝', isCT?'CT Dictation Input':'MRI Dictation Input')}
          <div style={{ padding:16,display:'flex',flexDirection:'column',gap:12,flex:1 }}>
            <div style={{ display:'flex',gap:8 }}>
              <div style={{ flex:2 }}><label style={lbl}>Body Part</label>
                <select style={inp} value={selectedBodyPart} onChange={e => setSelectedBodyPart(e.target.value)}>
                  {BODY_PARTS.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase()+b.slice(1)}</option>)}
                </select>
              </div>
              {showSide && <div style={{ flex:1 }}><label style={lbl}>Side</label>
                <select style={inp} value={side} onChange={e => setSide(e.target.value)}>
                  <option value="left">Left</option><option value="right">Right</option><option value="bilateral">Bilateral</option>
                </select>
              </div>}
              {selectedBodyPart === 'spine' && <div style={{ flex:1 }}><label style={lbl}>Region</label>
                <select style={inp} value={spineRegion} onChange={e => setSpineRegion(e.target.value)}>
                  <option value="cervical">Cervical</option><option value="thoracic">Thoracic</option><option value="lumbar">Lumbar</option>
                </select>
              </div>}
            </div>
            <div><label style={lbl}>Contrast</label>
              <select style={inp} value={contrast} onChange={e => setContrast(e.target.value)}>
                <option value="without">Without IV contrast</option>
                <option value="with">With IV contrast</option>
                <option value="with and without">With and without IV contrast</option>
              </select>
            </div>
            <div style={{ padding:'9px 12px',background:isCT?'linear-gradient(135deg,#ecfeff,#f0f9ff)':'linear-gradient(135deg,#eff6ff,#f0f9ff)',borderRadius:8,border:isCT?'1px solid #a5f3fc':'1px solid #bfdbfe',fontSize:12,color:isCT?'#0e7490':'#1d4ed8',fontStyle:'italic',lineHeight:1.6 }}>
              {technique}
            </div>
            <div style={{ flex:1,display:'flex',flexDirection:'column' }}><label style={lbl}>Findings</label>
              <textarea className="msk-textarea" style={{ ...inp,flex:1,minHeight:160,resize:'vertical',lineHeight:1.7,fontFamily:'inherit',border:isListening?'1.5px solid #ef4444':'1px solid #dde3ed',boxShadow:isListening?'0 0 0 3px rgba(239,68,68,0.1)':'none',transition:'all 0.15s' }}
                value={dictationText} onChange={e => setDictationText(e.target.value)} placeholder={`Type or dictate ${isCT?'CT':'MRI'} findings here…`} />
            </div>
            {micError && <div style={{ fontSize:11,color:'#dc2626',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:7,padding:'7px 10px',lineHeight:1.5 }}>{micError}</div>}
            <button onClick={isListening ? stopListening : toggleListening}
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:10,borderRadius:9,border:'1.5px solid '+(isListening?'#fca5a5':'#dde3ed'),background:isListening?'#fef2f2':'#f8fafc',fontSize:14,fontWeight:600,cursor:'pointer',color:isListening?'#dc2626':'#475569',transition:'all 0.15s' }}>
              <span style={{ width:8,height:8,borderRadius:'50%',background:isListening?'#ef4444':'#94a3b8',boxShadow:isListening?'0 0 8px #ef4444':'none',flexShrink:0,transition:'all 0.3s' }} />
              {isListening ? '⏹ Stop Recording' : '🎤 Start Dictation'}
            </button>
            <button onClick={generateReport} disabled={isGenerating || !dictationText.trim()}
              style={{ width:'100%',padding:12,borderRadius:9,border:'none',background:(isGenerating||!dictationText.trim())?'#e2e8f0':(isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#2563eb,#4f46e5)'),color:(isGenerating||!dictationText.trim())?'#94a3b8':'white',fontSize:14,fontWeight:700,cursor:(isGenerating||!dictationText.trim())?'not-allowed':'pointer',boxShadow:(isGenerating||!dictationText.trim())?'none':'0 4px 16px rgba(37,99,235,0.35)',letterSpacing:'0.02em' }}>
              {isGenerating ? '⏳ Generating…' : `✨ Generate ${isCT?'CT':'MRI'} Report`}
            </button>
          </div>
        </div>

        {/* Col 2 — Report */}
        <div style={{ background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr('linear-gradient(135deg,#5b21b6,#7c3aed)', '📄', 'Generated Report')}
          <div style={{ padding:16,display:'flex',flexDirection:'column',gap:12,flex:1 }}>
            <div className="msk-report-box" style={{ flex:1,padding:'14px 16px',border:'1px solid #e8edf5',borderRadius:10,overflowY:'auto',minHeight:340,maxHeight:'65vh',background:generatedReport?'white':'#f8fafc' }}>
              {isGenerating
                ? <div style={{ display:'flex',flexDirection:'column',gap:10,paddingTop:4 }}>{[55,80,65,90,50,72,60].map((w,i) => <div key={i} style={{ height:9,background:`rgba(37,99,235,${0.06+i*0.02})`,borderRadius:4,width:w+'%' }} />)}</div>
                : generatedReport
                  ? <div style={{ fontFamily:"Georgia,'Times New Roman',serif" }}>{formatReport(generatedReport)}</div>
                  : <div style={{ color:'#94a3b8',fontStyle:'italic',fontSize:13,textAlign:'center',paddingTop:40,lineHeight:1.8 }}><div style={{ fontSize:32,marginBottom:10 }}>📋</div>Report will appear here after generation.</div>
              }
            </div>
            <button onClick={copyToClipboard} disabled={!generatedReport}
              style={{ width:'100%',padding:10,borderRadius:9,border:'1.5px solid '+(copySuccess?'#86efac':'#e2e8f0'),background:copySuccess?'#f0fdf4':(!generatedReport?'#f8fafc':'white'),fontSize:13,fontWeight:600,cursor:!generatedReport?'not-allowed':'pointer',color:copySuccess?'#16a34a':'#475569',transition:'all 0.2s' }}>
              {copySuccess ? '✓ Copied to Clipboard' : '📋 Copy for PowerScribe'}
            </button>
          </div>
        </div>

        {/* Col 3 — Reference */}
        <div style={{ background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr('linear-gradient(135deg,#0e7490,#0891b2)', '📐', 'Reference Panel')}
          <div className="msk-ref-panel" style={{ padding:16,flex:1,overflowY:'auto' }}>
            <ReferencePanel selectedBodyPart={selectedBodyPart} />
          </div>
        </div>

      </div>

      <style>{`
        .msk-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:16px; box-sizing:border-box; }
        @media (max-width:900px) {
          .msk-grid { grid-template-columns:1fr !important; gap:12px; padding:10px; }
          .msk-report-box { min-height:200px !important; max-height:50vh !important; }
          .msk-textarea { min-height:120px !important; }
          .msk-ref-panel { max-height:400px; overflow-y:auto; }
        }
      `}</style>
    </div>
  );
}
