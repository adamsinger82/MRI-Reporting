'use client';
export const dynamic = 'force-dynamic'; // v2026-05-22 03:00
import { useState, useRef, useEffect } from 'react';
import { JOINT_DATA, DIAGRAM_SVGS } from './referenceData';
import CopyButton from './CopyButton';

const BODY_PARTS = ['knee','shoulder','hip','wrist','elbow','ankle','spine','pelvis','foot'];
const BILATERAL = ['spine','pelvis'];

// Structures that should read "absent" when not mentioned
const ABSENT_STRUCTURES = [
  'joint effusion','effusion','baker cyst','bursa','bursitis',
  'soft tissue mass','mass','ganglion','cyst','lipoma','hematoma',
  'loose body','loose bodies','synovitis','plicae','plica',
];

// MRI anatomy — full soft tissue detail
const ANATOMY_MRI = {
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

// CT anatomy — bone/joint/soft tissue only, no tendons/ligaments/labrum
const ANATOMY_CT = {
  knee:'Bones, Joint Effusion, Dislocation or Subluxation, Joint Space (medial compartment, lateral compartment, patellofemoral), Soft Tissues',
  shoulder:'Bones, Joint Effusion, Dislocation or Subluxation, Acromioclavicular Joint, Glenohumeral Joint Space, Soft Tissues',
  hip:'Bones, Joint Effusion, Dislocation or Subluxation, Joint Space, Soft Tissues',
  wrist:'Bones, Dislocation or Subluxation, Radiocarpal Joint Space, Midcarpal Joint Space, Soft Tissues',
  elbow:'Bones, Joint Effusion, Dislocation or Subluxation, Joint Space, Soft Tissues',
  ankle:'Bones, Joint Effusion, Dislocation or Subluxation, Tibiotalar Joint Space, Subtalar Joint Space, Soft Tissues',
  spine:'Vertebral Alignment, Vertebral Bodies, Disc Spaces, Spinal Canal, Neural Foramina, Facet Joints, Soft Tissues',
  pelvis:'Pelvic Ring, Sacroiliac Joints, Pubic Symphysis, Hip Joints, Acetabula, Soft Tissues',
  foot:'Bones, Lisfranc Joint Complex, Dislocation or Subluxation, Joint Spaces, Soft Tissues',
};

const ANATOMY = ANATOMY_MRI; // backward compat
function getAnatomy(part, isCT) {
  return isCT ? (ANATOMY_CT[part] || ANATOMY_MRI[part]) : (ANATOMY_MRI[part] || '');
}


// ─── GRADING CONTEXT BUILDER ─────────────────────────────────────────────────
// Extracts grading scales from JOINT_DATA and formats them for Claude.
// Only includes entries marked isGradingScale:true — skips pure measurements.
function buildGradingContext(part) {
  const jointData = JOINT_DATA[part];
  if (!jointData?.measurements?.length) return '';
  const scales = jointData.measurements.filter(m => m.isGradingScale);
  if (!scales.length) return '';
  return scales.map(m => {
    const grades = m.normalValues.map(v => `  ${v.label}: ${v.value}`).join('\n');
    return `${m.label}:\n${grades}`;
  }).join('\n\n');
}

function buildPrompt(part, lat, con, spineRegion, modality) {
  const isCT = modality === 'CT';
  const modalityName = isCT ? 'CT' : 'MRI';
  const techniqueText = isCT
    ? `CT scan of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part} ${con} IV contrast. Multiplanar reformats were created. One or more of the following dose optimizing techniques were utilized for this exam: automated exposure control, adjustment of the mA and/or kV according to patient size, and/or use of iterative reconstruction technique.`
    : `Multiplanar multisequence MRI of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part} ${con} IV contrast.`;

  const findingsRules = isCT
    ? `FINDINGS RULES (CT): 1. Not mentioned: write "intact." EXCEPTION: Joint Effusion, Dislocation or Subluxation — write "absent." Soft Tissues — write "No acute soft tissue abnormality." 2. Positive: exact dictated words only. 3. CT language only: attenuation, cortical integrity, trabecular pattern, osteophytes, subchondral cysts, chondrocalcinosis. No T1/T2/STIR language. 4. BONES RULE — all three on same line: Fracture/cortical disruption (or "No fracture or cortical disruption."), Osteonecrosis (or "No osteonecrosis."), Osseous lesion (or "No aggressive osseous lesion."). 5. JOINT SPACE RULE — for each joint space: address narrowing, osteophytes, subchondral cysts, chondrocalcinosis — or write "Preserved joint space without osteophytes, subchondral cysts, or chondrocalcinosis."`
    : `FINDINGS RULES: 1. Not mentioned: write "intact." EXCEPTION: Joint Effusion, Baker Cyst, bursae, soft tissue masses — write "absent" not "intact." 2. Positive: exact dictated words only, no added morphology/signal/measurements. 3. BONES RULE — address all three: Fracture/contusion (or "No fracture or contusion."), Osteonecrosis (or "No osteonecrosis."), Marrow signal (or "No marrow infiltration or bone lesion.") — three sentences on same line. Example: "Bones: No fracture or contusion. No osteonecrosis. No marrow infiltration or bone lesion."`;

  const normalImpressionText = isCT
    ? `If entirely normal: "No significant CT findings of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part}."`
    : `If entirely normal: "No significant MRI findings of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part}."`;

  const gradingContext = buildGradingContext(part);
  const gradingBlock = gradingContext
    ? `\n\nGRADING SCALES IN USE FOR THIS JOINT (apply these when grading is mentioned in dictation):\n${gradingContext}`
    : '';

  return `You are a subspecialty MSK radiologist generating a structured ${modalityName} report.

CRITICAL FORMATTING RULES:
- NEVER use markdown. No asterisks, no bold, no dashes, no bullet points.
- Section headers (TECHNIQUE, FINDINGS, LEVELS, IMPRESSION) on their own line in ALL CAPS with colon.
- Subheadings: "Structure Name: finding text" — Title Case, colon, finding on same line.

ANATOMY TO COVER for ${part}: ${getAnatomy(part, isCT)}
Generate a subheading for EVERY structure listed above.
${findingsRules}
IMPRESSION RULES:
- Synthesize positive findings into clinically meaningful impression.
- Number each item. Most important first.
- ${normalImpressionText}
- CARTILAGE / OA RULE (knee only): If Modified Outerbridge grading is mentioned in 2 or more compartments (medial, lateral, patellofemoral), do NOT list each compartment separately in the impression. Instead write a single impression line: "Osteoarthrosis, most notable in the [worst compartment] compartment with grade [X] chondromalacia, and [mild/moderate] involvement of the [other compartments] as above." If only 1 compartment involved, report it normally.
- OSTEOCHONDRAL EXCEPTION: If an osteochondral lesion, OCD, or subchondral fracture is present, list it separately by name regardless of the OA rule above.${gradingBlock}

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

  const negColor  = colors.neg  || '#6b7280';
  const posColor  = colors.pos  || '#dc2626';
  const lblColor  = colors.lbl  || '#1e293b';
  const bodyColor = colors.body || '#1e293b';
  const posWeight = colors.posW || 600;

  return cleaned.split('\n').map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{ height: 5 }} />;

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
    if (isHeader) {
      inImpression = t.startsWith('IMPRESSION');
      return (
        <div key={i} style={{ marginTop: i > 0 ? 20 : 0, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: colors.hdr || '#1e3a5f', borderBottom: '2px solid #2563eb', paddingBottom: 3, display: 'inline-block' }}>{t}</span>
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

// ─── PERMANENT PELVIS ATLAS LABELS (T1 sequence) ────────────────────────────
// 39 labels across 29 slices — accurately placed with new label editor
const PELVIS_LABELS = {
  9: [
    [68.5, 49.3, "lateral femoral cutaneous nerve"],
  ],
  11: [
    [69.7, 49.5, "lateral femoral cutaneous nerve"],
  ],
  14: [
    [72.7, 46.8, "lateral femoral cutaneous nerve"],
  ],
  15: [
    [64.4, 46.3, "psoas muscle"],
  ],
  16: [
    [74.2, 44.6, "lateral femoral cutaneous nerve"],
  ],
  18: [
    [68.8, 47.7, "femoral nerve"],
    [76.1, 41.4, "lateral femoral cutaneous nerve"],
  ],
  20: [
    [63.9, 53.1, "obturator nerve"],
  ],
  21: [
    [76.7, 35.3, "lateral femoral cutaneous nerve"],
  ],
  22: [
    [70, 44.6, "femoral nerve"],
  ],
  23: [
    [65, 53.6, "obturator nerve"],
    [77, 32.8, "lateral femoral cutaneous nerve"],
  ],
  25: [
    [71.1, 41.9, "femoral nerve"],
  ],
  28: [
    [67.6, 61, "sciatic nerve"],
    [66.7, 53.5, "obturator nerve"],
    [71.2, 40.2, "femoral nerve"],
  ],
  31: [
    [66.8, 52, "obturator nerve"],
    [71.7, 38.2, "femoral nerve"],
  ],
  32: [
    [68.3, 61.7, "sciatic nerve"],
  ],
  35: [
    [66.5, 51.5, "obturator nerve"],
    [72, 36.6, "femoral nerve"],
  ],
  39: [
    [71.7, 63.5, "sciatic nerve"],
    [65.3, 49.1, "obturator nerve"],
    [71.8, 35.1, "femoral nerve"],
    [80.2, 28.3, "lateral femoral cutaneous nerve"],
  ],
  42: [
    [71.8, 34.4, "femoral nerve"],
  ],
  43: [
    [64.1, 47.5, "obturator nerve"],
  ],
  44: [
    [76.4, 63.2, "sciatic nerve"],
  ],
  46: [
    [72.3, 35.1, "femoral nerve"],
  ],
  47: [
    [64.1, 46.6, "obturator nerve"],
  ],
  49: [
    [78.2, 63.4, "sciatic nerve"],
    [63.8, 44.8, "obturator nerve"],
  ],
  51: [
    [63.5, 44.1, "obturator nerve"],
  ],
  52: [
    [72.7, 36.6, "femoral nerve"],
  ],
  53: [
    [80.6, 63.2, "sciatic nerve"],
  ],
  58: [
    [80.8, 62.6, "sciatic nerve"],
  ],
  65: [
    [80.5, 62.8, "sciatic nerve"],
  ],
  77: [
    [80.8, 63.2, "sciatic nerve"],
  ],
  86: [
    [80, 61.6, "sciatic nerve"],
  ],
};

// ─── ANATOMY ATLAS DATA (Visible Human Project) ──────────────────────────────
const VHP_BASE = 'https://data.lhncbc.nlm.nih.gov/public/Visible-Human/Male-Images/PNG_format';

// Each joint defines: folder, slices array (axial cross-sections), 
// view label, and label overlays per anatomy layer
const ATLAS_JOINTS = {
  shoulder: {
    label: 'Shoulder',
    region: 'Upper Extremity',
    folder: 'thorax',
    slices: [1388, 1393, 1398, 1403, 1408, 1413],
    defaultSlice: 1398,
    view: 'Axial cryosection — glenohumeral joint level',
    // SVG overlay labels [x%, y%, text, layerKey, color]
    labels: {
      bones:    [[72,44,'Humeral head','#1e3a8a'],[27,44,'Glenoid','#1e3a8a'],[50,20,'Clavicle','#1e3a8a'],[50,60,'Scapula','#1e3a8a']],
      tendons:  [[62,38,'Supraspinatus','#14532d'],[68,55,'Infraspinatus','#14532d'],[38,52,'Subscapularis','#14532d']],
      muscles:  [[78,38,'Deltoid','#7c2d12'],[20,38,'Trap/Rhomboid','#7c2d12']],
      nerves:   [[82,62,'Brachial plexus','#92400e']],
      arteries: [[80,55,'Axillary a.','#991b1b']],
      veins:    [[78,60,'Axillary v.','#4c1d95']],
    },
  },
  elbow: {
    label: 'Elbow',
    region: 'Upper Extremity',
    folder: 'thorax',
    slices: [1668, 1673, 1678, 1683, 1688],
    defaultSlice: 1678,
    view: 'Axial cryosection — distal arm / elbow region',
    labels: {
      bones:    [[65,50,'Humerus','#1e3a8a'],[25,50,'Humerus (L)','#1e3a8a']],
      tendons:  [[70,40,'Biceps tendon','#14532d'],[60,60,'Triceps tendon','#14532d']],
      muscles:  [[78,50,'Brachialis','#7c2d12'],[22,50,'Brachialis (L)','#7c2d12']],
      nerves:   [[72,65,'Ulnar n.','#92400e'],[68,35,'Radial n.','#92400e']],
      arteries: [[67,52,'Brachial a.','#991b1b']],
      veins:    [[65,55,'Brachial v.','#4c1d95']],
    },
  },
  hip: {
    label: 'Hip',
    region: 'Lower Extremity',
    folder: 'pelvis',
    slices: [1760, 1770, 1780, 1790, 1800, 1810],
    defaultSlice: 1780,
    view: 'Axial cryosection — femoral head level',
    labels: {
      bones:    [[70,50,'Femoral head','#1e3a8a'],[30,50,'Femoral head (L)','#1e3a8a'],[50,30,'Sacrum','#1e3a8a'],[22,38,'Ilium (L)','#1e3a8a'],[78,38,'Ilium (R)','#1e3a8a']],
      tendons:  [[65,60,'Iliopsoas tendon','#14532d'],[35,60,'Iliopsoas (L)','#14532d'],[72,45,'Labrum','#14532d']],
      muscles:  [[80,50,'Gluteus max','#7c2d12'],[20,50,'Gluteus max (L)','#7c2d12'],[65,42,'Gluteus med','#7c2d12']],
      nerves:   [[62,68,'Sciatic n.','#92400e'],[38,68,'Sciatic n. (L)','#92400e'],[67,35,'Femoral n.','#92400e']],
      arteries: [[68,56,'Femoral a.','#991b1b'],[32,56,'Femoral a. (L)','#991b1b']],
      veins:    [[70,60,'Femoral v.','#4c1d95'],[30,60,'Femoral v. (L)','#4c1d95']],
    },
  },
  knee: {
    label: 'Knee',
    region: 'Lower Extremity',
    folder: 'thighs',
    slices: [2095, 2105, 2115, 2125, 2135, 2145],
    defaultSlice: 2115,
    view: 'Axial cryosection — distal femur / knee joint',
    labels: {
      bones:    [[68,50,'Distal femur','#1e3a8a'],[32,50,'Distal femur (L)','#1e3a8a'],[72,38,'Patella','#1e3a8a']],
      tendons:  [[74,35,'Patellar tendon','#14532d'],[55,55,'ACL/PCL','#14532d'],[65,62,'Meniscus','#14532d']],
      muscles:  [[80,40,'Biceps fem.','#7c2d12'],[74,55,'Gastroc.','#7c2d12'],[20,40,'Biceps fem. (L)','#7c2d12']],
      nerves:   [[78,55,'Peroneal n.','#92400e'],[78,65,'Tibial n.','#92400e']],
      arteries: [[62,65,'Popliteal a.','#991b1b']],
      veins:    [[64,68,'Popliteal v.','#4c1d95']],
    },
  },
  ankle: {
    label: 'Ankle',
    region: 'Lower Extremity',
    folder: 'legs',
    slices: [2680, 2690, 2700, 2710, 2720],
    defaultSlice: 2700,
    view: 'Axial cryosection — tibiotalar / ankle level',
    labels: {
      bones:    [[65,45,'Tibia','#1e3a8a'],[35,45,'Tibia (L)','#1e3a8a'],[72,50,'Fibula','#1e3a8a'],[28,50,'Fibula (L)','#1e3a8a']],
      tendons:  [[60,35,'Post. tibial t.','#14532d'],[68,38,'FHL','#14532d'],[72,40,'Peroneal t.','#14532d'],[65,60,'Achilles','#14532d']],
      muscles:  [[62,28,'Ant. compart.','#7c2d12'],[78,38,'Peroneal m.','#7c2d12']],
      nerves:   [[63,35,'Post. tibial n.','#92400e'],[62,32,'Sural n.','#92400e']],
      arteries: [[64,33,'Post. tibial a.','#991b1b']],
      veins:    [[66,36,'Post. tibial v.','#4c1d95']],
    },
  },
  pelvis: {
    label: 'Pelvis / SI',
    region: 'Pelvis & Spine',
    folder: 'pelvis',
    slices: Array.from({length:100},(_,i)=>i+1),
    defaultSlice: 35,
    useLocalMRI: true,
    localPath: '/atlas/pelvis/pelvis_', localExt: '.webp',
    sequences: {
      t1: { label:'T1', path:'/atlas/pelvis/pelvis_', slices:Array.from({length:100},(_,i)=>i+1), ext:'.webp', permanentLabels: PELVIS_LABELS },
      dess: { label:'DESS', path:'/atlas/pelvis_dess/dess_', slices:Array.from({length:206},(_,i)=>i+25), ext:'.webp' },
    },
    view: 'Axial MRI — pelvis without contrast',
    labels: {
      bones:    [[50,32,'Sacrum','#1e3a8a'],[22,40,'Ilium (L)','#1e3a8a'],[78,40,'Ilium (R)','#1e3a8a'],[70,55,'Acetabulum (R)','#1e3a8a'],[30,55,'Acetabulum (L)','#1e3a8a'],[68,58,'Femoral head (R)','#1e3a8a'],[32,58,'Femoral head (L)','#1e3a8a']],
      tendons:  [[50,48,'SI ligaments','#14532d'],[55,68,'Inguinal lig.','#14532d'],[66,62,'Iliopsoas t. (R)','#14532d'],[34,62,'Iliopsoas t. (L)','#14532d']],
      muscles:  [[65,42,'Iliacus (R)','#7c2d12'],[35,42,'Iliacus (L)','#7c2d12'],[74,52,'Piriformis (R)','#7c2d12'],[26,52,'Piriformis (L)','#7c2d12'],[80,60,'Gluteus max (R)','#7c2d12'],[20,60,'Gluteus max (L)','#7c2d12']],
      nerves:   [[64,65,'Sciatic n. (R)','#92400e'],[36,65,'Sciatic n. (L)','#92400e'],[68,38,'Femoral n. (R)','#92400e']],
      arteries: [[63,45,'Iliac a. (R)','#991b1b'],[37,45,'Iliac a. (L)','#991b1b']],
      veins:    [[61,48,'Iliac v. (R)','#4c1d95'],[39,48,'Iliac v. (L)','#4c1d95']],
    },
  },
};

// Group joints by region for the dropdown
const ATLAS_REGIONS_MAP = {};
Object.entries(ATLAS_JOINTS).forEach(([k, v]) => {
  if (!ATLAS_REGIONS_MAP[v.region]) ATLAS_REGIONS_MAP[v.region] = {};
  ATLAS_REGIONS_MAP[v.region][k] = v;
});

// ─── ANATOMY ATLAS MODAL ───────────────────────────────────────────────────
// Rebuilt with split layout: image on left (dots only), labels sidebar on right
// Label editor uses imgRef.getBoundingClientRect() to record clicks relative
// to the ACTUAL image pixels — not the container — fixing coordinate drift.
function AtlasModal({ onClose }) {
  const [selectedRegion, setSelectedRegion] = useState('Pelvis & Spine');
  const [selectedJoint, setSelectedJoint] = useState('pelvis');
  const [sliceIdx, setSliceIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [renderTick, setRenderTick] = useState(0);
  const [sequence, setSequence] = useState('t1');
  const sequenceRef = useRef('t1');
  const [labelMode, setLabelMode] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({ nerves:true, muscles:true, arteries:true, veins:true, bones:true, ligaments:true });
  const [userLabels, setUserLabels] = useState({});
  const [pendingClick, setPendingClick] = useState(null);
  const [pendingText, setPendingText] = useState('');
  const imgRef = useRef(null);
  const imgContainerRef = useRef(null);
  const imgAreaRef = useRef(null); // ref to the image area div (excludes bars)

  const regionJoints = ATLAS_REGIONS_MAP[selectedRegion] || {};
  const jointData = ATLAS_JOINTS[selectedJoint];

  useEffect(() => {
    const keys = Object.keys(ATLAS_REGIONS_MAP[selectedRegion] || {});
    if (keys.length > 0) {
      setSelectedJoint(keys[0]);
      const j = ATLAS_JOINTS[keys[0]];
      const idx = j ? (j.useLocalMRI ? j.defaultSlice-1 : j.slices.indexOf(j.defaultSlice)) : 0;
      setSliceIdx(Math.max(0, idx));
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (jointData) {
      const idx = jointData.useLocalMRI ? jointData.defaultSlice-1 : jointData.slices.indexOf(jointData.defaultSlice);
      setSliceIdx(Math.max(0, idx));
      setImgLoaded(false); setImgError(false);
    }
  }, [selectedJoint]);

  // Wheel scroll — throttled to 80ms for smooth but controlled navigation
  const wheelThrottleRef = useRef(0);
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (!jointData) return;
      const now = Date.now();
      if (now - wheelThrottleRef.current < 80) return; // throttle
      wheelThrottleRef.current = now;
      setSliceIdx(i => {
        const sq = jointData?.sequences?.[sequenceRef.current] || null;
        const slices = sq ? sq.slices : jointData.slices;
        const next = e.deltaY > 0 ? Math.min(slices.length-1, i+1) : Math.max(0, i-1);
        if (next !== i) {
          // Only show loading spinner if image isn't already cached
          // (cached images load in <10ms so this prevents unnecessary flicker)
          setImgLoaded(false);
        }
        return next;
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [jointData]);

  // Smart preload — load nearby slices first for fast initial scroll
  useEffect(() => {
    if (!jointData) return;
    const sq = jointData?.sequences?.[sequenceRef.current] || null;
    const src = sq || (jointData.useLocalMRI ? jointData : null);
    if (!src) return;
    const sliceArr = sq ? sq.slices : jointData.slices;
    const pathFn = sq
      ? (i) => `${sq.path}${String(sliceArr[i]).padStart(3,'0')}${sq.ext}`
      : (i) => `${jointData.localPath}${String(sliceArr[i]).padStart(3,'0')}${jointData.localExt||'.webp'}`;
    const center = sliceIdx || Math.floor(sliceArr.length / 2);
    // Priority 1: load ±30 slices around current position immediately
    const near = [];
    const far = [];
    sliceArr.forEach((_, i) => {
      if (Math.abs(i - center) <= 30) near.push(i);
      else far.push(i);
    });
    near.forEach(i => { const img = new Image(); img.src = pathFn(i); });
    // Priority 2: load the rest after 500ms
    setTimeout(() => {
      far.forEach(i => { const img = new Image(); img.src = pathFn(i); });
    }, 500);
  }, [selectedJoint, sequence]);

  useEffect(() => { setSliceIdx(0); setImgLoaded(false); setImgError(false); }, [sequence]);

  const seqData = jointData?.sequences?.[sequence] || null;
  const activeSlices = seqData ? seqData.slices : (jointData ? jointData.slices : []);
  const currentSlice = activeSlices[sliceIdx] ?? null;
  const imgUrl = jointData && currentSlice
    ? seqData
      ? `${seqData.path}${String(currentSlice).padStart(3,'0')}${seqData.ext}`
      : jointData.useLocalMRI
        ? `${jointData.localPath}${String(currentSlice).padStart(3,'0')}${jointData.localExt||'.webp'}`
        : `${VHP_BASE}/${jointData.folder}/a_vm${currentSlice}.png`
    : null;

  // ── Label click handler — coords relative to ACTUAL image pixels ──────────
  const handleImageClick = (e) => {
    if (!labelMode || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    // Record as % of actual image dimensions (not container)
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
    // Clamp to 0-100
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    setPendingClick({ x, y });
    setPendingText('');
  };

  const saveLabel = () => {
    if (!pendingClick || !pendingText.trim()) { setPendingClick(null); return; }
    const key = `${selectedJoint}_${currentSlice}`;
    setUserLabels(prev => ({ ...prev, [key]: [...(prev[key] || []), [pendingClick.x, pendingClick.y, pendingText.trim()]] }));
    setPendingClick(null); setPendingText('');
  };

  const deleteLabel = (key, i) => {
    setUserLabels(prev => { const arr = [...(prev[key] || [])]; arr.splice(i, 1); return { ...prev, [key]: arr }; });
  };

  const exportLabels = () => {
    const blob = new Blob([JSON.stringify(userLabels, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'atlas_labels.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const currentLabelKey = `${selectedJoint}_${currentSlice}`;
  const currentLabels = userLabels[currentLabelKey] || [];
  const totalLabels = Object.values(userLabels).reduce((s, arr) => s + arr.length, 0);

  // Permanent baked-in labels — T1 pelvis only
  const allPermanentLabels = (seqData?.permanentLabels && currentSlice != null)
    ? (seqData.permanentLabels[currentSlice] || []) : [];

  const getLabelLayer = (name) => {
    const n = name.toLowerCase();
    if (/nerve|plexus|nvb|ganglion/.test(n)) return 'nerves';
    if (/artery|femoral art|iliac a|common femoral a|superficial femoral a/.test(n)) return 'arteries';
    if (/vein|saphenous|femoral vein|iliac v|superficial femoral v/.test(n)) return 'veins';
    if (/muscle|maximus|medius|minimus|psoas|iliacus|iliopsoas|sartorius|rectus fem|gracilis|semi|biceps|tensor|piriform|obturator int|hamstring|adductor/.test(n)) return 'muscles';
    if (/sacrum|ilium|femur|acetabulum|trochanter|coccyx|symphysis|ramus|tubercle|asis|aiis|spine|intertrochanteric|pubic/.test(n)) return 'bones';
    if (/ligament|ligamentous|synovial|sacrospinous|sacrotuberous/.test(n)) return 'ligaments';
    return 'muscles';
  };

  const colorMap = { nerves:'#facc15', muscles:'#f97316', arteries:'#ef4444', veins:'#60a5fa', bones:'#ffffff', ligaments:'#9ca3af' };

  const permanentLabels = allPermanentLabels.filter(([,,name]) => visibleLayers[getLabelLayer(name)]);

  // Sort labels by Y position for vertical alignment with dots
  const sidebarLabels = permanentLabels.slice().sort((a, b) => a[1] - b[1]);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'#0f172a',borderRadius:16,width:'min(98vw,1200px)',maxHeight:'94vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#1e3a5f,#1d4ed8)',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:16 }}>🔬</span>
            <span style={{ color:'white',fontWeight:800,fontSize:13,letterSpacing:'0.08em' }}>ANATOMY ATLAS — MRI</span>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',borderRadius:8,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:600 }}>✕</button>
        </div>

        <div style={{ display:'flex',flex:1,overflow:'hidden',minHeight:0 }}>

          {/* Col 1 — joint selector */}
          <div style={{ width:140,borderRight:'1px solid #1e293b',padding:10,display:'flex',flexDirection:'column',gap:5,overflowY:'auto',background:'#0f172a',flexShrink:0 }}>
            <p style={{ fontSize:9,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 3px' }}>Region</p>
            <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
              style={{ width:'100%',padding:'5px 7px',border:'1px solid #334155',borderRadius:5,fontSize:10,background:'#1e293b',color:'#e2e8f0' }}>
              {Object.keys(ATLAS_REGIONS_MAP).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <p style={{ fontSize:9,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'8px 0 3px' }}>Joint</p>
            {Object.entries(regionJoints).map(([k, v]) => (
              <button key={k} onClick={() => setSelectedJoint(k)}
                style={{ padding:'6px 8px',borderRadius:6,border:'1px solid '+(selectedJoint===k?'#3b82f6':'#334155'),background:selectedJoint===k?'#1e3a5f':'#1e293b',color:selectedJoint===k?'#93c5fd':'#94a3b8',fontSize:11,fontWeight:selectedJoint===k?700:400,cursor:'pointer',textAlign:'left' }}>
                {v.label}
              </button>
            ))}

            {/* Layer toggles */}
            <p style={{ fontSize:9,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'12px 0 3px' }}>Labels</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:3 }}>
              <button onClick={() => setVisibleLayers({ nerves:true,muscles:true,arteries:true,veins:true,bones:true,ligaments:true })}
                style={{ padding:'2px 6px',borderRadius:4,fontSize:8,fontWeight:700,border:'1px solid #475569',background:'#1e293b',color:'#94a3b8',cursor:'pointer' }}>All On</button>
              <button onClick={() => setVisibleLayers({ nerves:false,muscles:false,arteries:false,veins:false,bones:false,ligaments:false })}
                style={{ padding:'2px 6px',borderRadius:4,fontSize:8,fontWeight:700,border:'1px solid #475569',background:'#1e293b',color:'#94a3b8',cursor:'pointer' }}>All Off</button>
              {[
                {key:'nerves',label:'Nerves',color:'#facc15'},
                {key:'muscles',label:'Muscles',color:'#f97316'},
                {key:'arteries',label:'Arteries',color:'#ef4444'},
                {key:'veins',label:'Veins',color:'#60a5fa'},
                {key:'bones',label:'Bones',color:'#e2e8f0'},
                {key:'ligaments',label:'Ligaments',color:'#9ca3af'},
              ].map(({key,label,color}) => (
                <button key={key} onClick={() => setVisibleLayers(prev => ({...prev,[key]:!prev[key]}))}
                  style={{ padding:'2px 6px',borderRadius:4,fontSize:8,fontWeight:700,border:'1px solid '+color,background:visibleLayers[key]?color+'33':'transparent',color:visibleLayers[key]?color:'#475569',cursor:'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 2+3 — IMAGE + SIDEBAR in a shared flex row with SVG leader lines */}
          <div style={{ flex:1,display:'flex',flexDirection:'row',overflow:'hidden',position:'relative' }}>

          {/* Col 2 — IMAGE */}
          <div ref={imgContainerRef}
            style={{ flex:'0 0 auto',width:'60%',display:'flex',flexDirection:'column',background:'#020617',overflow:'hidden',position:'relative' }}>

            {/* Sequence toggle */}
            {jointData?.sequences && (
              <div style={{ display:'flex',gap:4,padding:'5px 12px',background:'#0a0f1a',borderBottom:'1px solid #1e293b',flexShrink:0 }}>
                <span style={{ fontSize:9,color:'#475569',fontWeight:600,alignSelf:'center',marginRight:4 }}>SEQUENCE:</span>
                {Object.entries(jointData.sequences).map(([key, sq]) => (
                  <button key={key} onClick={() => { setSequence(key); sequenceRef.current = key; }}
                    style={{ padding:'3px 10px',borderRadius:5,border:'1px solid '+(sequence===key?'#3b82f6':'#334155'),background:sequence===key?'#1d4ed8':'#1e293b',color:sequence===key?'white':'#64748b',fontSize:10,fontWeight:sequence===key?700:400,cursor:'pointer' }}>
                    {sq.label}
                  </button>
                ))}
              </div>
            )}

            {/* Slice navigator */}
            {jointData && (
              <div style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',background:'#0f172a',borderBottom:'1px solid #1e293b',flexShrink:0 }}>
                <button onClick={() => { setSliceIdx(i => Math.max(0,i-1)); setImgLoaded(false); }} disabled={sliceIdx===0}
                  style={{ background:sliceIdx===0?'#1e293b':'#1d4ed8',border:'none',color:'white',borderRadius:5,width:24,height:24,cursor:sliceIdx===0?'default':'pointer',fontSize:14,fontWeight:700,opacity:sliceIdx===0?0.4:1,flexShrink:0 }}>‹</button>
                <div style={{ flex:1,display:'flex',alignItems:'center',gap:6 }}>
                  <input type="range" min={0} max={activeSlices.length-1} value={sliceIdx}
                    onChange={e => { setSliceIdx(Number(e.target.value)); setImgLoaded(false); }}
                    style={{ flex:1,accentColor:'#3b82f6',cursor:'pointer' }} />
                  <span style={{ color:'#93c5fd',fontSize:10,fontWeight:700,whiteSpace:'nowrap',background:'#1e293b',padding:'2px 7px',borderRadius:4,border:'1px solid #3b82f6',minWidth:52,textAlign:'center' }}>
                    {sliceIdx+1} / {activeSlices.length}
                  </span>
                </div>
                <button onClick={() => { setSliceIdx(i => Math.min(activeSlices.length-1,i+1)); setImgLoaded(false); }} disabled={sliceIdx===activeSlices.length-1}
                  style={{ background:sliceIdx===activeSlices.length-1?'#1e293b':'#1d4ed8',border:'none',color:'white',borderRadius:5,width:24,height:24,cursor:sliceIdx===activeSlices.length-1?'default':'pointer',fontSize:14,fontWeight:700,opacity:sliceIdx===activeSlices.length-1?0.4:1,flexShrink:0 }}>›</button>
              </div>
            )}

            {/* Image area — click handler here so coords are relative to image area only */}
            <div ref={imgAreaRef} onClick={handleImageClick}
              style={{ flex:1,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:labelMode?'crosshair':'default' }}>
              {!imgLoaded && !imgError && (
                <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,color:'#475569',zIndex:2 }}>
                  <div style={{ width:32,height:32,border:'3px solid #1d4ed8',borderTop:'3px solid transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>
                  <span style={{ fontSize:11 }}>Loading…</span>
                </div>
              )}
              {imgError && (
                <div style={{ color:'#ef4444',fontSize:12,textAlign:'center',padding:16 }}>
                  <div style={{ fontSize:28,marginBottom:6 }}>⚠️</div>
                  <div>Image unavailable — Slice {currentSlice}</div>
                </div>
              )}
              {imgUrl && (
                <img key={imgUrl} src={imgUrl} ref={imgRef}
                  onLoad={() => { setImgLoaded(true); requestAnimationFrame(() => setRenderTick(t => t+1)); }}
                  onError={() => { setImgError(true); setImgLoaded(false); }}
                  style={{ maxWidth:'100%',maxHeight:'100%',objectFit:'contain',display:imgLoaded?'block':'none',borderRadius:4,userSelect:'none' }}
                  loading="eager"
                  decoding="async"
                  alt={`Slice ${currentSlice}`}
                />
              )}

              {/* DOTS ONLY on image — no text labels */}
              {/* Single SVG overlay — dots + lines + labels all in one coordinate space */}
              {imgLoaded && imgRef.current && imgAreaRef.current && renderTick >= 0 && (() => {
                const ir = imgRef.current.getBoundingClientRect();
                const ar = imgAreaRef.current.getBoundingClientRect();
                const ol = ir.left - ar.left;
                const ot = ir.top  - ar.top;
                const ow = ir.width;
                const oh = ir.height;
                // SVG viewBox matches image pixel dimensions exactly
                return (
                  <svg style={{ position:'absolute', left:ol, top:ot, width:ow, height:oh, pointerEvents:'none', overflow:'visible' }}
                    viewBox={`0 0 ${ow} ${oh}`}>

                    {/* Permanent labels */}
                    {permanentLabels.map(([x, y, name], li) => {
                      const col = colorMap[getLabelLayer(name)] || '#ffffff';
                      const px = (x / 100) * ow;
                      const py = (y / 100) * oh;
                      // Text in black area on LEFT, line goes right to dot
                      const textX = 10; // left side of image
                      const lineStartX = textX + (name.length * 7.2 + 4); // right edge of text
                      const textAnchor = 'start';
                      const fontSize = Math.max(10, Math.min(13, ow / 60));
                      return (
                        <g key={'p'+li}>
                          {/* Dot */}
                          <circle cx={px} cy={py} r="4" fill={col} opacity="0.95"
                            stroke="rgba(0,0,0,0.7)" strokeWidth="1"/>
                          {/* Leader line */}
                          <line x1={lineStartX} y1={py} x2={px-5} y2={py}
                            stroke={col} strokeWidth="1" opacity="0.7"/>
                          {/* Text with black shadow for readability */}
                          <text x={textX} y={py} fontSize={fontSize} fill="rgba(0,0,0,0.85)"
                            fontFamily="system-ui,sans-serif" fontWeight="700"
                            textAnchor="start" dominantBaseline="middle" dx="1" dy="1">{name}</text>
                          <text x={textX} y={py} fontSize={fontSize} fill={col}
                            fontFamily="system-ui,sans-serif" fontWeight="700"
                            textAnchor="start" dominantBaseline="middle">{name}</text>
                          {/* Vertical tick at text end */}
                        </g>
                      );
                    })}

                    {/* User label dots */}
                    {currentLabels.map(([x, y, text], li) => {
                      const px = (x / 100) * ow;
                      const py = (y / 100) * oh;
                      const textXu = 10; const lineStartXu = textXu + (text.length * 7.2 + 4);
                      const fontSize = Math.max(10, Math.min(13, ow / 60));
                      return (
                        <g key={'u'+li}>
                          <circle cx={px} cy={py} r="5" fill="#facc15" opacity="0.95"
                            stroke="rgba(0,0,0,0.7)" strokeWidth="1.5"/>
                          <line x1={lineStartXu} y1={py} x2={px-5} y2={py}
                            stroke="#facc15" strokeWidth="1" opacity="0.7"/>
                          <text x={textXu} y={py} fontSize={fontSize} fill="rgba(0,0,0,0.85)"
                            fontFamily="system-ui,sans-serif" fontWeight="700"
                            textAnchor="start" dominantBaseline="middle" dx="1" dy="1">{text}</text>
                          <text x={textXu} y={py} fontSize={fontSize} fill="#facc15"
                            fontFamily="system-ui,sans-serif" fontWeight="700"
                            textAnchor="start" dominantBaseline="middle">{text}</text>
                        </g>
                      );
                    })}

                    {/* Pending click dot */}
                    {pendingClick && (
                      <circle
                        cx={(pendingClick.x/100)*ow}
                        cy={(pendingClick.y/100)*oh}
                        r="6" fill="#facc15" opacity="0.95"
                        stroke="white" strokeWidth="2"/>
                    )}
                  </svg>
                );
              })()}

              {labelMode && imgLoaded && !pendingClick && (
                <div style={{ position:'absolute',bottom:6,left:'50%',transform:'translateX(-50%)',background:'rgba(250,204,21,0.15)',border:'1px solid #facc15',borderRadius:5,padding:'3px 8px',pointerEvents:'none' }}>
                  <span style={{ fontSize:9,color:'#facc15',fontWeight:600 }}>Click a structure to label it</span>
                </div>
              )}

{/* Label input moved to sidebar — no overlap with image */}
            </div>

            {/* Bottom bar */}
            <div style={{ padding:'5px 12px',background:'#0f172a',borderTop:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
              <span style={{ fontSize:9,color:'#64748b',fontStyle:'italic' }}>{jointData?.view || ''}</span>
              <div style={{ display:'flex',gap:6 }}>
                <button onClick={() => { setLabelMode(m => !m); setPendingClick(null); }}
                  style={{ padding:'3px 9px',borderRadius:5,border:'1px solid '+(labelMode?'#facc15':'#334155'),background:labelMode?'rgba(250,204,21,0.12)':'transparent',color:labelMode?'#facc15':'#64748b',fontSize:9,fontWeight:700,cursor:'pointer' }}>
                  {labelMode ? '✏️ Labeling ON' : '✏️ Label'}
                </button>
                {totalLabels > 0 && (
                  <button onClick={exportLabels}
                    style={{ padding:'3px 9px',borderRadius:5,border:'1px solid #22c55e',background:'rgba(34,197,94,0.1)',color:'#22c55e',fontSize:9,fontWeight:700,cursor:'pointer' }}>
                    Export JSON ({totalLabels})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Col 3 — LABEL SIDEBAR with Y-aligned labels + leader lines */}
          <div style={{ flex:1,background:'#000000',borderLeft:'none',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative' }}>

            {/* Label input at top when in label mode */}
            {pendingClick && (
              <div style={{ padding:'8px 10px',background:'#1e3a5f',borderBottom:'2px solid #3b82f6',flexShrink:0,zIndex:10 }}>
                <p style={{ margin:'0 0 5px',fontSize:10,color:'#93c5fd',fontWeight:700 }}>
                  📍 Name this structure
                </p>
                <input autoFocus value={pendingText} onChange={e => setPendingText(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter') saveLabel(); if (e.key==='Escape') setPendingClick(null); }}
                  placeholder="e.g. sciatic nerve"
                  style={{ width:'100%',padding:'5px 8px',background:'#0f172a',border:'1px solid #3b82f6',borderRadius:5,color:'#e2e8f0',fontSize:11,outline:'none',boxSizing:'border-box',marginBottom:5 }}/>
                <div style={{ display:'flex',gap:4 }}>
                  <button onClick={saveLabel} style={{ flex:1,padding:'4px',background:'#1d4ed8',border:'none',borderRadius:4,color:'white',fontSize:10,fontWeight:700,cursor:'pointer' }}>Save</button>
                  <button onClick={() => setPendingClick(null)} style={{ flex:1,padding:'4px',background:'#334155',border:'none',borderRadius:4,color:'#94a3b8',fontSize:10,cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Labels drawn on image — sidebar just shows count + delete for user labels */}
            <div style={{ flex:1,overflowY:'auto',padding:'4px 0' }}>
              {sidebarLabels.length > 0 && (
                <div style={{ padding:'6px 10px',color:'#334155',fontSize:9 }}>
                  {sidebarLabels.length} structure{sidebarLabels.length!==1?'s':''} labeled
                </div>
              )}
              {currentLabels.map(([x,y,text], i) => (
                <div key={'u'+i} style={{ display:'flex',alignItems:'center',gap:6,padding:'3px 10px' }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:'#facc15',flexShrink:0 }}/>
                  <span style={{ flex:1,fontSize:10,color:'#facc15',fontWeight:500 }}>{text}</span>
                  <button onClick={() => deleteLabel(currentLabelKey, i)}
                    style={{ background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:10,padding:0 }}>✕</button>
                </div>
              ))}
            </div>

            {/* Export button at bottom */}
            {totalLabels > 0 && (
              <div style={{ padding:'6px 10px',borderTop:'1px solid #1e293b',flexShrink:0 }}>
                <button onClick={exportLabels}
                  style={{ width:'100%',padding:'4px',borderRadius:5,border:'1px solid #22c55e',background:'rgba(34,197,94,0.1)',color:'#22c55e',fontSize:9,fontWeight:700,cursor:'pointer' }}>
                  Export JSON ({totalLabels})
                </button>
              </div>
            )}
          </div>

          </div>{/* end Col 2+3 wrapper */}

        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  const [gender, setGender] = useState('');
  const [ctDensity, setCtDensity] = useState('');
  const [macroFat, setMacroFat] = useState(false);
  const [ddxResult, setDdxResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const inp = { width:'100%',padding:'8px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,color:'#1e293b',background:'white',boxSizing:'border-box' };
  const lbl = { fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4 };

  const generateDdx = async () => {
    setIsGenerating(true);
    setDdxResult('');
    const ctFindings = [ctLytic&&'lytic',ctSclerotic&&'sclerotic/blastic',ctGroundGlass&&'ground glass',ctChondroid&&'chondroid matrix'].filter(Boolean).join(', ');
    const prompt = `You are a subspecialty MSK radiologist. Generate a prioritized differential diagnosis.

Patient: Age ${age||'unknown'}, Gender: ${gender||'not specified'}, Location: ${location||'not specified'}
Tissue type: ${tissueType}
${tissueType==='bone' ? `Bone location (epiphysis/metaphysis/diaphysis): ${boneLocation}` : `Depth: ${depth} to fascia`}
${ctFindings ? `CT matrix/density: ${ctFindings}` : ''}
${ctDensity ? `CT density relative to muscle: ${ctDensity}` : ''}
${macroFat ? 'Macroscopic fat present (T1 bright, drops on fat-sat)' : ''}
${mriT1 ? `MRI T1: ${mriT1}` : ''}
${mriT2 ? `MRI T2: ${mriT2}` : ''}
${mriContrast ? `MRI enhancement: ${mriContrast}` : ''}
${adcValue ? `ADC value: ${adcValue} x10-3 mm2/s` : ''}

Provide a ranked differential with CONFIDENCE LEVELS:

TOP DIFFERENTIAL DIAGNOSES (ranked by likelihood):
For each diagnosis provide:
- Diagnosis name
- Confidence level: HIGH / MODERATE / LOW
- Key supporting features from the given data
- Distinguishing features from next diagnosis

Then provide:
KEY DISTINGUISHING FEATURES for top diagnosis
RECOMMENDED NEXT STEPS
RED FLAGS suggesting malignancy

Be concise and clinically actionable. Use WHO 2020 bone tumor classification, Kransdorf/Murphey criteria.`;

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
            <div style={{ display:'flex',gap:8 }}>
              <div style={{ flex:1 }}>
                <label style={lbl}>Age</label>
                <input style={inp} type="number" placeholder="e.g. 45" value={age} onChange={e=>setAge(e.target.value)}/>
              </div>
              <div style={{ flex:1 }}>
                <label style={lbl}>Gender</label>
                <div style={{ display:'flex',gap:5 }}>
                  {['M','F'].map(g => (
                    <button key={g} onClick={() => setGender(gender===g?'':g)}
                      style={{ flex:1,padding:'8px 0',borderRadius:8,border:'2px solid '+(gender===g?'#2563eb':'#e2e8f0'),background:gender===g?'#eff6ff':'white',color:gender===g?'#2563eb':'#64748b',fontSize:13,fontWeight:gender===g?700:400,cursor:'pointer' }}>
                      {g==='M'?'Male':'Female'}
                    </button>
                  ))}
                </div>
              </div>
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
              <label style={lbl}>CT Matrix / Morphology</label>
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                {chk('Lytic', ctLytic, setCtLytic)}
                {chk('Sclerotic / blastic', ctSclerotic, setCtSclerotic)}
                {chk('Ground glass', ctGroundGlass, setCtGroundGlass)}
                {chk('Chondroid matrix', ctChondroid, setCtChondroid)}
              </div>
            </div>
            <div>
              <label style={lbl}>CT Density (vs Muscle)</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {['Hypodense','Isodense','Hyperdense'].map(v => tog(v, setCtDensity, ctDensity))}
              </div>
            </div>
            <div>
              <label style={lbl}>Macroscopic Fat</label>
              <div style={{ display:'flex',gap:6 }}>
                {chk('Fat present (T1 bright / CT -50 to -150 HU)', macroFat, setMacroFat)}
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
              <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif",fontSize:13,lineHeight:1.7,color:'#1e293b' }}>
                {ddxResult.split('\n').map((line, i) => {
                  const t = line.trim();
                  const isH = /^#{1,3}\s|^[A-Z][A-Z\s]{2,}:/.test(t);
                  const isNum = /^\d+\./.test(t);
                  const isHigh = /\bHIGH\b/.test(t);
                  const isMod = /\bMODERATE\b/.test(t);
                  const isLow = /\bLOW\b/.test(t);
                  const confColor = isHigh ? '#dc2626' : isMod ? '#d97706' : isLow ? '#6b7280' : null;
                  return (
                    <div key={i} style={{ marginTop: isH ? 14 : isNum ? 8 : 2 }}>
                      {isH
                        ? <span style={{ fontSize:11,fontWeight:800,color:'#4f46e5',textTransform:'uppercase',letterSpacing:'0.08em',borderBottom:'1px solid #e0e7ff',display:'block',paddingBottom:3 }}>{t.replace(/^#+\s/,'')}</span>
                        : isNum
                          ? <span style={{ color:'#1e293b',fontWeight:700 }}>{t}</span>
                          : confColor
                            ? <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:6,background:isHigh?'#fef2f2':isMod?'#fffbeb':'#f9fafb',color:confColor,fontWeight:700,fontSize:11,marginBottom:2 }}>{t}</span>
                            : <span style={{ color:'#374151' }}>{t}</span>
                      }
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
function ReferencePanel({ selectedBodyPart, darkMode = false }) {
  const jointData = JOINT_DATA[selectedBodyPart];
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');
  useEffect(() => { setSelectedMeasurementId(''); }, [selectedBodyPart]);
  const selectedMeasurement = jointData?.measurements?.find(m => m.id === selectedMeasurementId);
  const accent = '#0891b2';
  const dm = darkMode;
  if (!jointData) return <div style={{ color:'#94a3b8',fontSize:13,textAlign:'center',padding:20 }}>Select a body part.</div>;
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:0,height:'100%' }}>
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <p style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:accent,margin:0 }}>{jointData.label} — Measurements</p>
        <select style={{ width:'100%',padding:'8px 10px',border:'1px solid '+(dm?'#334155':'#e2e8f0'),borderRadius:8,fontSize:13,background:dm?'#0f172a':'white',cursor:'pointer',color:dm?'#e2e8f0':'#1e293b',boxSizing:'border-box' }}
          value={selectedMeasurementId} onChange={e => setSelectedMeasurementId(e.target.value)}>
          <option value="">— Select a measurement —</option>
          {jointData.measurements.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        {selectedMeasurement ? (
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
              <span style={{ display:'inline-block',padding:'2px 8px',background:dm?'#0c4a6e':'#e0f2fe',color:dm?'#7dd3fc':'#0369a1',borderRadius:999,fontSize:11,fontWeight:600,width:'fit-content' }}>{selectedMeasurement.plane}</span>
              <p style={{ fontSize:12,color:dm?'#94a3b8':'#64748b',margin:0,lineHeight:1.5 }}>{selectedMeasurement.description}</p>
            </div>
            <div style={{ border:'1px solid '+(dm?'#334155':'#e2e8f0'),borderRadius:8,overflow:'hidden',background:dm?'#0f172a':'#fafbfc',padding:8 }}>
              {DIAGRAM_SVGS[selectedMeasurement.diagram] || <div style={{ padding:24,textAlign:'center',color:'#94a3b8',fontSize:12 }}>Diagram coming soon</div>}
            </div>
            {selectedMeasurement.citations && (
              <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                <p style={{ fontSize:10,fontWeight:700,color:dm?'#64748b':'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',margin:0 }}>📚 References</p>
                {selectedMeasurement.citations.map((c,i) => (
                  <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11,color:'#60a5fa',textDecoration:'none',lineHeight:1.5,display:'block',padding:'4px 8px',background:dm?'#1e3a5f':'#eff6ff',borderRadius:6,border:'1px solid '+(dm?'#1d4ed8':'#bfdbfe') }}>
                    📄 {c.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding:12,background:dm?'#0f172a':'#f0f9ff',borderRadius:8,color:dm?'#475569':'#64748b',fontSize:12,textAlign:'center',border:'1px dashed '+(dm?'#334155':'#bae6fd') }}>Select a measurement to see the diagram and references</div>
        )}
      </div>
      <div style={{ height:1,background:dm?'#334155':'linear-gradient(to right,transparent,#e2e8f0,transparent)',margin:'14px 0',flexShrink:0 }} />
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <p style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:accent,margin:0 }}>📊 Normal Values</p>
        {selectedMeasurement ? (
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
            <tbody>
              {selectedMeasurement.normalValues.map((nv,i) => (
                <tr key={i} style={{ borderBottom:'1px solid '+(dm?'#334155':'#f1f5f9') }}>
                  <td style={{ padding:'5px 4px',color:dm?'#94a3b8':'#64748b',width:'45%',verticalAlign:'top' }}>{nv.label}</td>
                  <td style={{ padding:'5px 4px',color:dm?'#e2e8f0':'#1e293b',fontWeight:600,fontFamily:"'Courier New',monospace" }}>{nv.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:5,overflowY:'auto',maxHeight:320 }}>
            {jointData.measurements.map(m => (
              <div key={m.id} onClick={() => setSelectedMeasurementId(m.id)}
                style={{ padding:'7px 10px',background:dm?'#0f172a':'#f8fafc',borderRadius:7,border:'1px solid '+(dm?'#334155':'#f1f5f9'),cursor:'pointer' }}>
                <div style={{ fontSize:12,fontWeight:600,color:'#0891b2' }}>{m.label}</div>
                <div style={{ fontSize:11,color:dm?'#94a3b8':'#64748b' }}>{m.normalValues[0]?.label}: {m.normalValues[0]?.value}</div>
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
  const [micError, setMicError] = useState('');
  const [spineRegion, setSpineRegion] = useState('lumbar');
  const [showAtlas, setShowAtlas] = useState(false);
  const [showDdx, setShowDdx] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;
  const recognitionRef = useRef(null);

  // ── Incidental findings state ──────────────────────────────────────────────
  // Fleischner (lung nodule)
  const [noduleType, setNoduleType] = useState('');       // 'solid'|'ggo'|'partsolid'
  const [noduleSize, setNoduleSize] = useState('');       // size bucket string
  // GU incidentals
  const [renalFinding, setRenalFinding] = useState('');
  const [gynFinding, setGynFinding] = useState('');
  const [aortaFinding, setAortaFinding] = useState('');
  // Patient demographics (for GYN menopausal logic)
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState('');

  const showSide = !BILATERAL.includes(selectedBodyPart);
  const isCT = modality === 'CT';
  const partLabel = selectedBodyPart === 'spine' ? `${spineRegion} spine` : selectedBodyPart;
  const sideLabel = showSide ? `${side} ` : '';
  const contrastLabel = contrast === 'without' ? 'without' : contrast === 'with' ? 'with' : 'with and without';

  const technique = isCT
    ? `CT scan of the ${sideLabel}${partLabel} ${contrastLabel} IV contrast. Multiplanar reformats were created. One or more of the following dose optimizing techniques were utilized for this exam: automated exposure control, adjustment of the mA and/or kV according to patient size, and/or use of iterative reconstruction technique.`
    : `Multiplanar multisequence MRI of the ${sideLabel}${partLabel} ${contrastLabel} IV contrast.`;


  // ── Incidental trigger logic ──────────────────────────────────────────────
  const showLungWarning = isCT && (
    selectedBodyPart === 'shoulder' ||
    (selectedBodyPart === 'spine' && ['cervical','thoracic'].includes(spineRegion))
  );
  const showGUWarning = (
    selectedBodyPart === 'hip' ||
    selectedBodyPart === 'pelvis' ||
    (selectedBodyPart === 'spine' && spineRegion === 'lumbar')
  );

  // Menopausal status inference
  const age = parseInt(patientAge) || null;
  const isPostmenopausal = patientSex === 'F' && age !== null ? age >= 51 : null;
  // null = unknown (show both tiers)

  // Build incidental findings text for injection into prompt
  const buildIncidentalBlock = () => {
    const lines = [];

    // Fleischner
    if (showLungWarning && noduleType && noduleSize) {
      const fleischner = getFleischnerRec(noduleType, noduleSize);
      if (fleischner) {
        lines.push(`INCIDENTAL PULMONARY NODULE — ${noduleType.toUpperCase()} — ${noduleSize}:`);
        lines.push(`Low-risk patient: ${fleischner.low}`);
        lines.push(`High-risk patient: ${fleischner.high}`);
        lines.push(`Citation: MacMahon H et al. Guidelines for Management of Incidental Pulmonary Nodules Detected on CT Images: From the Fleischner Society 2017. Radiology 2017;284(1):228-243.`);
      }
    }

    // Renal
    if (showGUWarning && renalFinding) {
      const renal = getRenalRec(renalFinding);
      if (renal) {
        lines.push(`INCIDENTAL RENAL FINDING — ${renalFinding}:`);
        lines.push(renal.rec);
        lines.push(`Citation: Herts BR et al. ACR Incidental Findings Committee Recommendation for CT and MRI of the Kidney. J Am Coll Radiol 2018;15(2):264-273.`);
      }
    }

    // GYN
    if (showGUWarning && gynFinding) {
      const gyn = getGynRec(gynFinding, isPostmenopausal);
      if (gyn) {
        lines.push(`INCIDENTAL GYNECOLOGIC FINDING — ${gynFinding}:`);
        if (isPostmenopausal === null) {
          lines.push(`If premenopausal: ${gyn.pre}`);
          lines.push(`If postmenopausal: ${gyn.post}`);
        } else {
          lines.push(isPostmenopausal ? gyn.post : gyn.pre);
        }
        lines.push(`Citation: Patel MD et al. ACR Appropriateness Criteria / SRU Consensus Guidelines on Management of Adnexal Cysts. J Am Coll Radiol 2020.`);
      }
    }

    // Aorta
    if (showGUWarning && aortaFinding) {
      const aorta = getAortaRec(aortaFinding);
      if (aorta) {
        lines.push(`INCIDENTAL AORTIC FINDING — ${aortaFinding}:`);
        lines.push(aorta.rec);
        lines.push(`Citation: Khosa F et al. ACR Incidental Findings Committee Recommendations for Abdominal Aortic Aneurysm. J Am Coll Radiol 2013;10(8):575-579.`);
      }
    }

    return lines.length ? lines.join('\n') : '';
  };

  // Reset incidentals when body part / modality / spine region changes
  const resetIncidentals = () => {
    setNoduleType(''); setNoduleSize('');
    setRenalFinding(''); setGynFinding('');
    setAortaFinding('');
  };

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
          messages:[{role:'user',content:`Dictated findings:\n\n${dictationText}${buildIncidentalBlock() ? '\n\nINCIDENTAL FINDINGS TO ADD TO IMPRESSION AND REFERENCES:\n' + buildIncidentalBlock() : ''}`}],
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

  const inp = { width:'100%',padding:'9px 12px',border:'1px solid '+(dm?'#334155':'#dde3ed'),borderRadius:8,fontSize:14,boxSizing:'border-box',color:dm?'#e2e8f0':'#1e293b',outline:'none',background:dm?'#0f172a':'white' };
  const lbl = { fontSize:11,fontWeight:600,color:dm?'#94a3b8':'#64748b',textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:5 };

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
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-evenly',gap:16,flex:1,margin:'0 20px' }}>
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

          {/* Dark mode toggle */}
          <button onClick={() => setDarkMode(d => !d)}
            title={dm ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:9,border:'1px solid rgba(255,255,255,0.2)',background:dm?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.08)',color:'white',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)' }}>
            <span>{dm ? '☀️' : '🌙'}</span> {dm ? 'Light' : 'Dark'}
          </button>

          {/* DDx button */}
          <button onClick={() => setShowDdx(true)}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(124,58,237,0.5)',background:'rgba(124,58,237,0.15)',color:'#c4b5fd',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)' }}>
            <span>🔬</span> MSK Lesion DDx
          </button>
        </div>

        {/* Right: user + logout */}
        <div style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>
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
        <div style={{ background:dm?'#1e293b':'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr(isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#1d4ed8,#2563eb)', isCT?'🔬':'📝', isCT?'CT Dictation Input':'MRI Dictation Input')}
          <div style={{ padding:16,display:'flex',flexDirection:'column',gap:12,flex:1 }}>
            <div style={{ display:'flex',gap:8 }}>
              <div style={{ flex:2 }}><label style={lbl}>Body Part</label>
                <select style={inp} value={selectedBodyPart} onChange={e => { setSelectedBodyPart(e.target.value); resetIncidentals(); }}>
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
            <div style={{ padding:'9px 12px',background:dm?(isCT?'#0c2d36':'#1e1b4b'):(isCT?'linear-gradient(135deg,#ecfeff,#f0f9ff)':'linear-gradient(135deg,#eff6ff,#f0f9ff)'),borderRadius:8,border:dm?'1px solid '+(isCT?'#164e63':'#312e81'):(isCT?'1px solid #a5f3fc':'1px solid #bfdbfe'),fontSize:12,color:isCT?'#22d3ee':'#818cf8',fontStyle:'italic',lineHeight:1.6 }}>
              {technique}
            </div>
            {/* ── Incidental Findings Panel ── */}
            {(showLungWarning || showGUWarning) && (
              <IncidentalPanel
                showLung={showLungWarning}
                showGU={showGUWarning}
                noduleType={noduleType} setNoduleType={setNoduleType}
                noduleSize={noduleSize} setNoduleSize={setNoduleSize}
                renalFinding={renalFinding} setRenalFinding={setRenalFinding}
                gynFinding={gynFinding} setGynFinding={setGynFinding}
                aortaFinding={aortaFinding} setAortaFinding={setAortaFinding}
                patientAge={patientAge} setPatientAge={setPatientAge}
                patientSex={patientSex} setPatientSex={setPatientSex}
                isPostmenopausal={isPostmenopausal}
              />
            )}
            <div style={{ flex:1,display:'flex',flexDirection:'column' }}><label style={lbl}>Findings</label>
              <textarea className="msk-textarea" style={{ ...inp,flex:1,minHeight:160,resize:'vertical',lineHeight:1.7,fontFamily:'inherit',border:isListening?'1.5px solid #ef4444':'1px solid #dde3ed',boxShadow:isListening?'0 0 0 3px rgba(239,68,68,0.1)':'none',transition:'all 0.15s' }}
                value={dictationText} onChange={e => setDictationText(e.target.value)} placeholder={`Type or dictate ${isCT?'CT':'MRI'} findings here…`} />
            </div>
            {micError && <div style={{ fontSize:11,color:'#dc2626',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:7,padding:'7px 10px',lineHeight:1.5 }}>{micError}</div>}
            <button onClick={isListening ? stopListening : toggleListening}
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:10,borderRadius:9,border:'1.5px solid '+(isListening?'#fca5a5':(dm?'#334155':'#dde3ed')),background:isListening?'#fef2f2':(dm?'#0f172a':'#f8fafc'),fontSize:14,fontWeight:600,cursor:'pointer',color:isListening?'#dc2626':(dm?'#94a3b8':'#475569'),transition:'all 0.15s' }}>
              <span style={{ width:8,height:8,borderRadius:'50%',background:isListening?'#ef4444':'#94a3b8',boxShadow:isListening?'0 0 8px #ef4444':'none',flexShrink:0,transition:'all 0.3s' }} />
              {isListening ? '⏹ Stop Recording' : '🎤 Start Dictation'}
            </button>
            <button onClick={generateReport} disabled={isGenerating || !dictationText.trim()}
              style={{ width:'100%',padding:12,borderRadius:9,border:'none',background:(isGenerating||!dictationText.trim())?(dm?'#1e293b':'#e2e8f0'):(isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#2563eb,#4f46e5)'),color:(isGenerating||!dictationText.trim())?(dm?'#475569':'#94a3b8'):'white',fontSize:14,fontWeight:700,cursor:(isGenerating||!dictationText.trim())?'not-allowed':'pointer',boxShadow:(isGenerating||!dictationText.trim())?'none':'0 4px 16px rgba(37,99,235,0.35)',letterSpacing:'0.02em' }}>
              {isGenerating ? '⏳ Generating…' : `✨ Generate ${isCT?'CT':'MRI'} Report`}
            </button>
          </div>
        </div>

        {/* Col 2 — Report */}
        <div style={{ background:dm?'#1e293b':'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr('linear-gradient(135deg,#5b21b6,#7c3aed)', '📄', 'Generated Report')}
          <div style={{ padding:16,display:'flex',flexDirection:'column',gap:12,flex:1 }}>
            <div className="msk-report-box" style={{ flex:1,padding:'14px 16px',border:'1px solid '+(dm?'#334155':'#e8edf5'),borderRadius:10,overflowY:'auto',minHeight:340,maxHeight:'65vh',background:dm?'#0f172a':(generatedReport?'white':'#f8fafc') }}>
              {isGenerating
                ? <div style={{ display:'flex',flexDirection:'column',gap:10,paddingTop:4 }}>{[55,80,65,90,50,72,60].map((w,i) => <div key={i} style={{ height:9,background:`rgba(37,99,235,${0.06+i*0.02})`,borderRadius:4,width:w+'%' }} />)}</div>
                : generatedReport
                  ? <div style={{ fontFamily:"Georgia,'Times New Roman',serif" }}>{formatReport(generatedReport, dm ? {
                      neg:'#64748b',   // dark mode normals: medium slate — visible but subdued
                      pos:'#fbbf24',   // dark mode positives: amber/yellow — warm, clear, not harsh
                      lbl:'#94a3b8',   // subheading labels
                      body:'#cbd5e1',  // impression body text
                      posW:600,
                      border:'#334155',
                      hdr:'#93c5fd'
                    } : {
                      neg:'#6b7280',   // light mode normals: grey
                      pos:'#dc2626',   // light mode positives: red
                      lbl:'#1e293b',
                      body:'#1e293b',
                      posW:600,
                      border:'#e2e8f0',
                      hdr:'#1e3a5f'
                    })}</div>
                  : <div style={{ color:'#94a3b8',fontStyle:'italic',fontSize:13,textAlign:'center',paddingTop:40,lineHeight:1.8 }}><div style={{ fontSize:32,marginBottom:10 }}>📋</div>Report will appear here after generation.</div>
              }
            </div>
            <CopyButton generatedReport={generatedReport} dm={dm} />
          </div>
        </div>

        {/* Col 3 — Reference */}
        <div style={{ background:dm?'#1e293b':'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr('linear-gradient(135deg,#0e7490,#0891b2)', '📐', 'Reference Panel')}
          <div className="msk-ref-panel" style={{ padding:16,flex:1,overflowY:'auto' }}>
            <ReferencePanel selectedBodyPart={selectedBodyPart} dm={dm} />
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
