'use client';
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
    ? `FINDINGS RULES (CT): 1. Not mentioned: write "intact." EXCEPTION: Joint Effusion, Baker Cyst, bursae, soft tissue masses write "absent." 2. Positive: exact dictated words only. 3. CT language only: attenuation, cortical integrity, trabecular pattern. No T1/T2/STIR/marrow signal language. 4. BONES RULE — address all three: Fracture/cortical disruption (or "No fracture or cortical disruption."), Osteonecrosis (or "No osteonecrosis."), Osseous lesion (or "No aggressive osseous lesion.") — three sentences on same line.`
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

ANATOMY TO COVER for ${part}: ${ANATOMY[part]}
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

// ─── PERMANENT PELVIS ATLAS LABELS (T1 sequence) ────────────────────────────
// Generated from atlas_labels.json — 279 labels across 84 slices
const PELVIS_LABELS = {
  8: [
    [55.4, 57.8, "S1"],
  ],
  10: [
    [69.1, 49.2, "lateral femoral cutaneous nerve"],
  ],
  11: [
    [56.8, 58.9, "S1"],
    [63.7, 47, "psoas"],
  ],
  12: [
    [60.7, 54, "L5"],
    [70.3, 48.4, "lateral femoral cutaneous nerve"],
    [52.3, 55.8, "Sacrum, S1"],
    [64.3, 63.2, "SI joint, ligamentous"],
  ],
  13: [
    [67.8, 56.4, "SI joint, synovial"],
  ],
  14: [
    [53.6, 63, "Sacrum, S2"],
    [64.9, 63.9, "SI joint, ligamentous"],
  ],
  15: [
    [58.8, 58.2, "S1"],
    [57.1, 65.4, "S2"],
    [73.6, 45.3, "lateral femoral cutaneous nerve"],
    [67.2, 58.2, "SI joint, synovial"],
    [64.4, 68.3, "SI joint, ligamentous"],
  ],
  16: [
    [62.1, 54.9, "L5"],
    [53.7, 69.3, "Sacrum, S3"],
  ],
  17: [
    [58.2, 65.2, "S2"],
    [56.5, 70.9, "S3"],
    [63, 52.5, "Obturator nerve"],
    [75.4, 42.9, "lateral femoral cutaneous nerve"],
    [68.8, 47.9, "femoral nerve"],
    [64.9, 45.7, "psoas"],
    [66.3, 58.9, "SI joint, synovial"],
    [65.8, 64.5, "SI joint, synovial"],
  ],
  18: [
    [61.2, 58.9, "S1"],
    [76.2, 41.1, "lateral femoral cutaneous nerve"],
  ],
  19: [
    [57.1, 71.1, "S3"],
    [53.9, 72, "Sacrum, S4"],
    [65.5, 58.8, "SI joint, synovial"],
    [65.1, 65.9, "SI joint, synovial"],
  ],
  20: [
    [63.8, 56.5, "L5"],
    [60.1, 65.2, "S2"],
    [63.8, 53.2, "Obturator nerve"],
    [69.7, 45.5, "femoral nerve"],
    [65.2, 68.5, "SI joint, synovial"],
    [66, 59.9, "SI joint, synovial"],
  ],
  21: [
    [63, 58.9, "S1"],
    [77, 34.8, "lateral femoral cutaneous nerve"],
    [69.9, 45.1, "femoral nerve"],
    [64.9, 67.8, "SI joint, synovial"],
    [65.7, 61.5, "SI joint, synovial"],
    [65.7, 41.1, "genitofemoral nerve"],
  ],
  22: [
    [80.9, 38.5, "gluteus minimus"],
  ],
  23: [
    [65.1, 57.1, "L5"],
    [61.8, 64.1, "S2"],
    [59.9, 70.7, "S3"],
    [64.3, 60, "S1"],
    [65.2, 53.4, "Obturator nerve"],
    [77.2, 31.9, "lateral femoral cutaneous nerve"],
    [70.5, 43.8, "femoral nerve"],
    [80.6, 69.1, "gluteus maximus"],
    [80.1, 29.8, "anterior superior iliac spine"],
    [66.6, 40.7, "genitofemoral nerve"],
  ],
  24: [
    [75.3, 40.7, "iliacus"],
    [54.3, 76.4, "Sacrum, S5"],
  ],
  25: [
    [65.2, 61, "sciatic nerve"],
    [77.9, 29.3, "lateral femoral cutaneous nerve"],
    [71.1, 42, "femoral nerve"],
    [64.1, 69.4, "piriformis"],
  ],
  26: [
    [82.6, 50.6, "gluteus medius"],
    [75.4, 29.6, "ilioinguinal nerve"],
    [64.7, 68.5, "piriformis"],
  ],
  27: [
    [67.1, 66.7, "piriformis"],
    [67.2, 39.8, "genitofemoral nerve"],
  ],
  28: [
    [66.6, 53, "Obturator nerve"],
    [80.7, 40, "gluteus minimus"],
    [66.8, 67, "SI joint, ligamentous"],
  ],
  29: [
    [67.2, 61.5, "sciatic nerve"],
    [79.3, 28.4, "lateral femoral cutaneous nerve"],
    [71.6, 38.7, "femoral nerve"],
    [79.3, 30.7, "sartorius"],
  ],
  30: [
    [67.5, 61.5, "sciatic nerve"],
    [69.2, 65.9, "piriformis"],
  ],
  31: [
    [80.6, 68.3, "gluteus maximus"],
    [74.5, 31.3, "ilioinguinal nerve"],
    [70.8, 64.6, "piriformis"],
  ],
  32: [
    [71.4, 37.4, "femoral nerve"],
    [83.4, 31.1, "tensor fascia lata"],
    [67.1, 40, "external iliac artery"],
  ],
  33: [
    [66.9, 51.4, "Obturator nerve"],
    [68.2, 62.8, "sciatic nerve"],
    [79.5, 28, "lateral femoral cutaneous nerve"],
    [81.2, 40.5, "gluteus minimus"],
    [79.2, 30.9, "sartorius"],
    [66.6, 37.4, "genitofemoral nerve"],
  ],
  34: [
    [78.7, 30.6, "sartorius"],
    [72.8, 31.9, "ilioinguinal nerve"],
    [77, 39.6, "anterior inferior iliac spine"],
    [73.6, 62.1, "piriformis"],
  ],
  35: [
    [68.6, 63, "sciatic nerve"],
  ],
  36: [
    [66, 50.6, "Obturator nerve"],
    [71.1, 38.1, "femoral nerve"],
    [81, 42.2, "gluteus minimus"],
    [59.2, 24.7, "rectus abdominis"],
    [54.3, 78.8, "coccyx"],
    [63, 74.4, "sacrotuberus ligament"],
    [66.4, 35.2, "genitofemoral nerve, genital branch"],
    [68.5, 37.7, "external iliac artery"],
  ],
  37: [
    [83.2, 55.6, "gluteus medius"],
    [84.3, 50.5, "gluteus medius"],
    [66, 67.4, "sacrospinous ligament"],
  ],
  38: [
    [70.9, 63.7, "sciatic nerve"],
    [79.9, 69.8, "gluteus maximus"],
    [71.1, 33.3, "ilioinguinal nerve"],
    [65.5, 72.4, "sacrotuberus ligament"],
    [67.5, 32.6, "genitofemoral nerve, genital branch"],
  ],
  39: [
    [71.4, 36.1, "femoral nerve"],
    [81.8, 41.2, "gluteus minimus"],
    [52.8, 75.3, "coccyx"],
  ],
  40: [
    [64.9, 48.8, "Obturator nerve"],
    [84.8, 32, "tensor fascia lata"],
    [78.4, 40.7, "rectus femoris"],
    [72.2, 40.5, "iliopsoas"],
    [69.4, 33.9, "ilioinguinal nerve"],
    [67.1, 66.9, "sacrospinous ligament"],
    [66.8, 31.3, "genitofemoral nerve, genital branch"],
    [69.7, 36.5, "common femoral artery"],
  ],
  41: [
    [75, 63.7, "sciatic nerve"],
    [80.4, 28.7, "lateral femoral cutaneous nerve"],
    [72.2, 34.1, "femoral nerve"],
    [77.5, 31.5, "sartorius"],
    [74.1, 49.4, "femoral head"],
    [52.8, 72.2, "coccyx"],
  ],
  42: [
    [82.3, 43.1, "gluteus minimus"],
    [68.2, 33.3, "ilioinguinal nerve"],
    [66.1, 32.2, "genitofemoral nerve, genital branch"],
    [70.6, 33.7, "genitofemoral nerve, femoral branch"],
    [69.7, 35.9, "common femoral artery"],
  ],
  43: [
    [71.7, 34.4, "femoral nerve"],
    [84.1, 56, "gluteus medius"],
    [86, 50.8, "gluteus medius"],
    [72.7, 41.1, "iliopsoas"],
  ],
  44: [
    [72.2, 34.4, "femoral nerve"],
    [85.5, 32.8, "tensor fascia lata"],
    [79.2, 37.6, "rectus femoris"],
    [70.6, 33.9, "genitofemoral nerve, femoral branch"],
  ],
  45: [
    [77, 63.5, "sciatic nerve"],
    [82.7, 42.9, "gluteus minimus"],
    [84.9, 56.7, "gluteus medius"],
    [79.2, 71.6, "gluteus maximus"],
    [65.5, 31.7, "ilioinguinal nerve"],
    [64.9, 56.9, "obturator internus"],
    [68, 70.2, "sacrotuberus ligament"],
    [69.9, 35.5, "common femoral artery"],
  ],
  46: [
    [72.3, 35.2, "femoral nerve"],
    [73.1, 42.5, "iliopsoas"],
    [64.1, 56.9, "obturator internus"],
    [70.3, 67.4, "obturator internus"],
    [77, 60.2, "obturator internus"],
  ],
  47: [
    [64.1, 47.7, "Obturator nerve"],
    [84.9, 53, "greater trochanter"],
    [54.7, 31.1, "rectus abdominis"],
    [68.9, 69.8, "sacrotuberus ligament"],
    [70.9, 33.5, "genitofemoral nerve, femoral branch"],
  ],
  48: [
    [87.2, 52.9, "gluteus medius"],
    [73.1, 43.8, "iliopsoas"],
    [84.4, 52.1, "greater trochanter"],
    [66.3, 66.1, "pudendal NVB"],
  ],
  49: [
    [84.6, 46.4, "gluteus minimus"],
    [85.2, 33.9, "tensor fascia lata"],
    [77.6, 49.9, "femoral neck"],
    [65.2, 63, "Pudendal NVB (Alcock's canal)"],
    [68.8, 69.8, "sacrotuberus ligament"],
  ],
  50: [
    [78.4, 63, "sciatic nerve"],
    [81.5, 70.7, "gluteus maximus"],
    [73, 45.5, "iliopsoas"],
    [85.2, 52.9, "greater trochanter"],
    [64, 55.8, "obturator internus"],
    [69.7, 36.6, "common femoral artery"],
  ],
  51: [
    [63.8, 43.6, "Obturator nerve"],
    [86.2, 47.9, "gluteus minimus"],
    [63.8, 57.8, "obturator internus"],
    [63.5, 60.8, "pudendal NVB (Alcock's canal)"],
    [70, 69.3, "sacrotuberus ligament"],
  ],
  52: [
    [79.6, 28.5, "lateral femoral cutaneous nerve"],
    [85.4, 34.2, "tensor fascia lata"],
    [73.9, 30.9, "sartorius"],
    [73.7, 48.3, "iliopsoas"],
  ],
  53: [
    [80.7, 63, "sciatic nerve"],
    [85.7, 34.2, "tensor fascia lata"],
    [79, 35.5, "rectus femoris"],
    [51.1, 42.9, "pubic symphysis"],
    [62.9, 59.1, "pudendal NVB (Alcock's canal)"],
    [69.9, 36.5, "common femoral artery"],
    [65.8, 35.9, "great saphenous vein"],
  ],
  54: [
    [74.2, 67, "conjoined hamstring"],
    [74.8, 62.6, "semimembranosus"],
    [74.2, 51.4, "iliopsoas"],
    [53.3, 38.7, "pubic tubercle"],
  ],
  56: [
    [74.5, 53.2, "iliopsoas"],
  ],
  57: [
    [84.9, 71.1, "gluteus maximus"],
    [86.3, 34.2, "tensor fascia lata"],
    [72.5, 31.5, "sartorius"],
    [74.2, 53.4, "iliopsoas"],
    [80.3, 51.4, "intertrochanteric femur"],
    [63.8, 58, "inferior pubic ramus"],
    [69.4, 36.3, "superficial femoral artery"],
  ],
  58: [
    [75.1, 66.5, "conjoined hamstring"],
    [74.1, 53.4, "iliopsoas"],
    [76.2, 56, "lesser trochanter"],
  ],
  59: [
    [76.2, 65.9, "biceps femoris, long head"],
    [64.4, 36.3, "great saphenous vein"],
  ],
  60: [
    [81.2, 62.4, "sciatic nerve"],
    [75, 63, "semimembranosus"],
    [73, 66.9, "semitendinosus"],
    [76.5, 55.1, "lesser trochanter"],
    [68.9, 40.5, "superficial femoral vein"],
  ],
  61: [
    [86.9, 35.5, "tensor fascia lata"],
    [69.4, 37.4, "superficial femoral artery"],
    [63.5, 37.2, "great saphenous vein"],
  ],
  62: [
    [70.8, 32.6, "sartorius"],
    [77.2, 65.6, "biceps femoris, long head"],
  ],
  63: [
    [80.6, 62.1, "sciatic nerve"],
    [68.3, 40.9, "superficial femoral vein"],
  ],
  64: [
    [76.5, 34.1, "rectus femoris"],
    [57.8, 51.9, "gracilis"],
    [75.4, 62.3, "semimembranosus"],
    [76.1, 68.1, "semitendinosus"],
  ],
  65: [
    [77.5, 65.2, "biceps femoris, long head"],
    [62.3, 37.9, "great saphenous vein"],
  ],
  66: [
    [87.2, 36.3, "tensor fascia lata"],
    [69.6, 33.3, "sartorius"],
    [76.2, 67.8, "semitendinosus"],
    [80.1, 51.2, "subtrochanteric femur"],
    [68, 37.9, "superficial femoral artery"],
  ],
  67: [
    [68.6, 40.9, "superficial femoral vein"],
  ],
  68: [
    [67.4, 38.1, "superficial femoral artery"],
  ],
  69: [
    [80.7, 63.4, "sciatic nerve"],
    [86.9, 34.8, "tensor fascia lata"],
    [57.6, 53.2, "gracilis"],
    [78.2, 65.2, "biceps femoris, long head"],
  ],
  70: [
    [68, 42.2, "superficial femoral vein"],
  ],
  71: [
    [75.3, 34.4, "rectus femoris"],
    [75.6, 63.2, "semimembranosus"],
    [76.7, 68.5, "semitendinosus"],
    [66.4, 39.4, "superficial femoral artery"],
  ],
  72: [
    [60.4, 40, "great saphenous vein"],
  ],
  74: [
    [77, 69.1, "semitendinosus"],
    [65.5, 40, "superficial femoral artery"],
    [67.5, 42.4, "superficial femoral vein"],
  ],
  75: [
    [81.2, 63.4, "sciatic nerve"],
    [57.8, 54.5, "gracilis"],
  ],
  76: [
    [58.7, 41.6, "great saphenous vein"],
  ],
  77: [
    [73.1, 34.6, "rectus femoris"],
    [57.4, 55.4, "gracilis"],
    [64.7, 40.5, "superficial femoral artery"],
  ],
  79: [
    [79.3, 64.5, "biceps femoris, long head"],
    [66.4, 44, "superficial femoral vein"],
    [58.2, 42.5, "great saphenous vein"],
  ],
  80: [
    [57.3, 54.7, "gracilis"],
    [76.4, 66.7, "semitendinosus"],
  ],
  81: [
    [64.1, 41.6, "superficial femoral artery"],
    [66.4, 44.4, "superficial femoral vein"],
  ],
  83: [
    [81, 64.5, "biceps femoris, long head"],
  ],
  84: [
    [74.7, 63.5, "semimembranosus"],
  ],
  85: [
    [71.6, 34.6, "rectus femoris"],
    [56.8, 57.3, "gracilis"],
    [63, 42.9, "superficial femoral artery"],
  ],
  86: [
    [75.1, 66.9, "semitendinosus"],
  ],
  87: [
    [81.2, 64.8, "biceps femoris, long head"],
    [65.1, 46, "superficial femoral vein"],
  ],
  88: [
    [56.4, 58.8, "gracilis"],
    [62.4, 44.6, "superficial femoral artery"],
  ],
  91: [
    [61.9, 44.8, "superficial femoral artery"],
  ],
  92: [
    [74.4, 66.9, "semitendinosus"],
    [64.1, 47.3, "superficial femoral vein"],
  ],
  94: [
    [80.3, 64.5, "biceps femoris, long head"],
  ],
  95: [
    [61.6, 46.8, "superficial femoral artery"],
  ],
  96: [
    [72.5, 63.5, "semimembranosus"],
  ],
  97: [
    [62.1, 47, "Adductor/Hunter's canal"],
    [63.8, 48.6, "superficial femoral vein"],
  ],
  99: [
    [81.2, 63.9, "biceps femoris, long head"],
    [61.9, 48.3, "superficial femoral artery"],
  ],
  100: [
    [72.5, 63.2, "semimembranosus"],
    [79.9, 64.5, "biceps femoris, long head"],
    [73.6, 67, "semitendinosus"],
    [64.1, 49.5, "superficial femoral vein"],
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
function AtlasModal({ onClose }) {
  const [selectedRegion, setSelectedRegion] = useState('Upper Extremity');
  const [selectedJoint, setSelectedJoint] = useState('shoulder');
  const [sliceIdx, setSliceIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [sequence, setSequence] = useState('t1');
  const sequenceRef = useRef('t1');
  const [labelMode, setLabelMode] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({ nerves:true, muscles:true, vessels:true, bones:true, ligaments:true });
  const [userLabels, setUserLabels] = useState({});
  const [pendingClick, setPendingClick] = useState(null);
  const [pendingText, setPendingText] = useState('');
  const imgContainerRef = useRef(null);

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
      setImgLoaded(false);
      setImgError(false);
    }
  }, [selectedJoint]);

  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (!jointData) return;
      setSliceIdx(i => {
        const seqD = jointData?.sequences?.[sequenceRef.current] || null;
        const slices = seqD ? seqD.slices : jointData.slices;
        const next = e.deltaY > 0 ? Math.min(slices.length-1, i+1) : Math.max(0, i-1);
        if (next !== i) setImgLoaded(false);
        return next;
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [jointData]);

  // Preload full stack immediately when joint or sequence changes
  useEffect(() => {
    if (!jointData) return;
    const sq = jointData?.sequences?.[sequenceRef.current] || null;
    const src = sq || (jointData.useLocalMRI ? jointData : null);
    if (!src) return;
    const sliceArr = sq ? sq.slices : jointData.slices;
    const pathFn = sq
      ? (i) => `${sq.path}${String(sliceArr[i]).padStart(3,'0')}${sq.ext}`
      : (i) => `${jointData.localPath}${String(sliceArr[i]).padStart(3,'0')}${jointData.localExt||'.webp'}`;
    // Fire all preloads immediately — browser will queue and prioritize
    sliceArr.forEach((_, i) => {
      const img = new Image();
      img.src = pathFn(i);
    });
  }, [selectedJoint, sequence]);

  useEffect(() => {
    setSliceIdx(0);
    setImgLoaded(false);
    setImgError(false);
  }, [sequence]);

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

  const imgRef = useRef(null);
  const handleImageClick = (e) => {
    if (!labelMode || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
    setPendingClick({ x, y });
    setPendingText('');
  };

  const saveLabel = () => {
    if (!pendingClick || !pendingText.trim()) { setPendingClick(null); return; }
    const key = `${selectedJoint}_${currentSlice}`;
    setUserLabels(prev => ({ ...prev, [key]: [...(prev[key] || []), [pendingClick.x, pendingClick.y, pendingText.trim()]] }));
    setPendingClick(null);
    setPendingText('');
  };

  const deleteLabel = (key, i) => {
    setUserLabels(prev => { const arr = [...(prev[key] || [])]; arr.splice(i, 1); return { ...prev, [key]: arr }; });
  };

  const exportLabels = () => {
    const blob = new Blob([JSON.stringify(userLabels, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'atlas_labels.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const currentLabelKey = `${selectedJoint}_${currentSlice}`;
  const currentLabels = userLabels[currentLabelKey] || [];
  const totalLabels = Object.values(userLabels).reduce((s, arr) => s + arr.length, 0);
  const layerColors = { bones:'#4a7fa5', tendons:'#2d7a5a', muscles:'#c07040', nerves:'#d97706', arteries:'#dc2626', veins:'#7c3aed' };

  // Permanent baked-in labels for current slice (T1 pelvis only)
  const allPermanentLabels = (seqData?.permanentLabels && currentSlice != null)
    ? (seqData.permanentLabels[currentSlice] || [])
    : [];

  // Layer categorization for filter toggles
  const getLabelLayer = (name) => {
    const n = name.toLowerCase();
    if (/nerve|plexus|nvb|ganglion/.test(n)) return 'nerves';
    if (/artery|vein|vessel|saphenous|femoral art|femoral vein|iliac a|iliac v|canal/.test(n)) return 'vessels';
    if (/muscle|maximus|medius|minimus|psoas|iliacus|iliopsoas|sartorius|rectus fem|gracilis|semi|biceps|tensor|piriform|obturator int|hamstring|adductor/.test(n)) return 'muscles';
    if (/sacrum|ilium|femur|acetabulum|trochanter|spine|coccyx|symphysis|ramus|tubercle|asis|aiis|iliac spine/.test(n)) return 'bones';
    if (/ligament|ligamentous|synovial|sacrospinous|sacrotuberous/.test(n)) return 'ligaments';
    return 'muscles'; // default
  };

  const permanentLabels = allPermanentLabels.filter(([,, name]) => visibleLayers[getLabelLayer(name)]);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'#0f172a',borderRadius:16,width:'min(96vw,1100px)',maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#1e3a5f,#1d4ed8)',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:18 }}>🔬</span>
            <span style={{ color:'white',fontWeight:800,fontSize:14,letterSpacing:'0.08em' }}>ANATOMY ATLAS — MRI</span>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',borderRadius:8,padding:'5px 14px',cursor:'pointer',fontSize:13,fontWeight:600 }}>✕</button>
        </div>

        <div style={{ display:'flex',flex:1,overflow:'hidden',minHeight:0 }}>

          {/* Col 1 — joint selector */}
          <div style={{ width:150,borderRight:'1px solid #1e293b',padding:12,display:'flex',flexDirection:'column',gap:6,overflowY:'auto',background:'#0f172a',flexShrink:0 }}>
            <p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 4px' }}>Region</p>
            <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
              style={{ width:'100%',padding:'6px 8px',border:'1px solid #334155',borderRadius:6,fontSize:11,background:'#1e293b',color:'#e2e8f0' }}>
              {Object.keys(ATLAS_REGIONS_MAP).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'10px 0 4px' }}>Joint</p>
            {Object.entries(regionJoints).map(([k, v]) => (
              <button key={k} onClick={() => setSelectedJoint(k)}
                style={{ padding:'7px 10px',borderRadius:7,border:'1px solid '+(selectedJoint===k?'#3b82f6':'#334155'),background:selectedJoint===k?'#1e3a5f':'#1e293b',color:selectedJoint===k?'#93c5fd':'#94a3b8',fontSize:12,fontWeight:selectedJoint===k?700:400,cursor:'pointer',textAlign:'left',transition:'all 0.12s' }}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Col 2 — image + overlays */}
          <div style={{ flex:1,display:'flex',flexDirection:'column',background:'#020617',overflow:'hidden',position:'relative' }}>

            {/* Sequence toggle — only shown for joints with multiple sequences */}
            {jointData?.sequences && (
              <div style={{ display:'flex',gap:4,padding:'6px 14px',background:'#0a0f1a',borderBottom:'1px solid #1e293b',flexShrink:0 }}>
                <span style={{ fontSize:10,color:'#475569',fontWeight:600,alignSelf:'center',marginRight:4 }}>SEQUENCE:</span>
                {Object.entries(jointData.sequences).map(([key, sq]) => (
                  <button key={key} onClick={() => { setSequence(key); sequenceRef.current = key; }}
                    style={{ padding:'4px 12px',borderRadius:6,border:'1px solid '+(sequence===key?'#3b82f6':'#334155'),background:sequence===key?'#1d4ed8':'#1e293b',color:sequence===key?'white':'#64748b',fontSize:11,fontWeight:sequence===key?700:400,cursor:'pointer',transition:'all 0.1s' }}>
                    {sq.label}
                  </button>
                ))}
              </div>
            )}

            {/* Slice navigator bar */}
            {jointData && (
              <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:'#0f172a',borderBottom:'1px solid #1e293b',flexShrink:0 }}>
                <button onClick={() => { setSliceIdx(i => Math.max(0,i-1)); setImgLoaded(false); }}
                  disabled={sliceIdx===0}
                  style={{ background:sliceIdx===0?'#1e293b':'#1d4ed8',border:'none',color:'white',borderRadius:6,width:28,height:28,cursor:sliceIdx===0?'default':'pointer',fontSize:16,fontWeight:700,opacity:sliceIdx===0?0.4:1,flexShrink:0 }}>‹</button>
                {activeSlices.length > 10 ? (
                  <div style={{ flex:1,display:'flex',alignItems:'center',gap:8 }}>
                    <input type="range" min={0} max={activeSlices.length-1} value={sliceIdx}
                      onChange={e => { setSliceIdx(Number(e.target.value)); setImgLoaded(false); }}
                      style={{ flex:1,accentColor:'#3b82f6',cursor:'pointer' }} />
                    <span style={{ color:'#93c5fd',fontSize:11,fontWeight:700,whiteSpace:'nowrap',background:'#1e293b',padding:'3px 8px',borderRadius:5,border:'1px solid #3b82f6',minWidth:60,textAlign:'center' }}>
                      {sliceIdx+1} / {activeSlices.length}
                    </span>
                  </div>
                ) : (
                  <div style={{ flex:1,display:'flex',gap:4,alignItems:'center',justifyContent:'center',overflow:'hidden' }}>
                    {activeSlices.map((s,i) => (
                      <button key={s} onClick={() => { setSliceIdx(i); setImgLoaded(false); }}
                        style={{ padding:'3px 8px',borderRadius:5,border:'1px solid '+(i===sliceIdx?'#3b82f6':'#334155'),background:i===sliceIdx?'#1d4ed8':'#1e293b',color:i===sliceIdx?'white':'#64748b',fontSize:11,fontWeight:i===sliceIdx?700:400,cursor:'pointer',flexShrink:0 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => { setSliceIdx(i => Math.min(activeSlices.length-1,i+1)); setImgLoaded(false); }}
                  disabled={sliceIdx===activeSlices.length-1}
                  style={{ background:sliceIdx===activeSlices.length-1?'#1e293b':'#1d4ed8',border:'none',color:'white',borderRadius:6,width:28,height:28,cursor:sliceIdx===activeSlices.length-1?'default':'pointer',fontSize:16,fontWeight:700,opacity:sliceIdx===activeSlices.length-1?0.4:1,flexShrink:0 }}>›</button>

              </div>
            )}

            {/* Image + SVG overlay */}
            <div ref={imgContainerRef} onClick={handleImageClick}
              style={{ flex:1,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:labelMode?'crosshair':'default' }}>
              {!imgLoaded && !imgError && (
                <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,color:'#475569',zIndex:2 }}>
                  <div style={{ width:36,height:36,border:'3px solid #1d4ed8',borderTop:'3px solid transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>
                  <span style={{ fontSize:12 }}>{jointData?.useLocalMRI ? 'Loading MRI…' : 'Loading cryosection…'}</span>
                </div>
              )}
              {imgError && (
                <div style={{ color:'#ef4444',fontSize:13,textAlign:'center',padding:20 }}>
                  <div style={{ fontSize:32,marginBottom:8 }}>⚠️</div>
                  <div>Image unavailable</div>
                  <div style={{ fontSize:11,color:'#64748b',marginTop:4 }}>Slice {currentSlice}</div>
                </div>
              )}
              {imgUrl && (
                <img key={imgUrl} src={imgUrl} ref={imgRef}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => { setImgError(true); setImgLoaded(false); }}
                  style={{ maxWidth:'100%',maxHeight:'100%',objectFit:'contain',display:imgLoaded?'block':'none',borderRadius:4,userSelect:'none' }}
                  alt={`Axial MRI slice ${currentSlice}`}
                />
              )}
              {/* Label overlay — covers image exactly using inset:0 + object-fit trick */}
              {imgLoaded && (permanentLabels.length > 0 || currentLabels.length > 0) && (
                <svg
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Permanent baked-in labels — white */}
                  {permanentLabels.map(([x, y, text], li) => (
                    <g key={'p'+li}>
                      <circle cx={x} cy={y} r="0.8" fill="white" opacity="0.95"/>
                      <rect x={x+1.2} y={y-2.4} width={Math.min(text.length*1.5+1.5, 35)} height="4.6" rx="0.6" fill="rgba(0,0,0,0.80)"/>
                      <text x={x+2.0} y={y+0.9} fontSize="2.5" fill="white" fontFamily="monospace" fontWeight="600">{text}</text>
                    </g>
                  ))}
                  {/* User labels — yellow */}
                  {currentLabels.map(([x, y, text], li) => (
                    <g key={'u'+li}>
                      <circle cx={x} cy={y} r="1.0" fill="#facc15" opacity="0.95"/>
                      <rect x={x+1.2} y={y-2.4} width={Math.min(text.length*1.6+1.5, 35)} height="4.6" rx="0.6" fill="rgba(0,0,0,0.85)"/>
                      <text x={x+2.0} y={y+0.9} fontSize="2.5" fill="#facc15" fontFamily="monospace" fontWeight="700">{text}</text>
                    </g>
                  ))}
                </svg>
              )}
              {/* Pending click dot — shows where user clicked */}
              {pendingClick && imgLoaded && imgRef.current && (() => {
                const ir = imgRef.current.getBoundingClientRect();
                const cr = imgContainerRef.current.getBoundingClientRect();
                const px = (ir.left - cr.left) + (pendingClick.x / 100 * ir.width);
                const py = (ir.top - cr.top) + (pendingClick.y / 100 * ir.height);
                return (
                  <div style={{ position:'absolute',left:px,top:py,transform:'translate(-50%,-50%)',zIndex:10,pointerEvents:'none' }}>
                    <div style={{ width:12,height:12,borderRadius:'50%',background:'#facc15',border:'2px solid white',boxShadow:'0 0 8px rgba(250,204,21,0.9)' }}/>
                  </div>
                );
              })()}
              {/* Label mode hint */}
              {labelMode && imgLoaded && !pendingClick && (
                <div style={{ position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',background:'rgba(250,204,21,0.15)',border:'1px solid #facc15',borderRadius:6,padding:'4px 10px',pointerEvents:'none' }}>
                  <span style={{ fontSize:10,color:'#facc15',fontWeight:600 }}>Click on a structure to label it</span>
                </div>
              )}
            </div>

            {/* Bottom info bar */}
            {jointData && (
              <div style={{ padding:'6px 14px',background:'#0f172a',borderTop:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
                <span style={{ fontSize:10,color:'#64748b',fontStyle:'italic' }}>{jointData.view}</span>
                <span style={{ fontSize:10,color:'#334155' }}>''</span>
              </div>
            )}
          </div>

          {/* Col 3 — label tools + layer toggles */}
          <div style={{ width:165,borderLeft:'1px solid #1e293b',padding:12,display:'flex',flexDirection:'column',gap:8,background:'#0f172a',flexShrink:0,overflowY:'auto' }}>
            {/* Layer visibility toggles — always shown */}
            <p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 2px' }}>Show Labels</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
              {[
                {key:'all', label:'All', color:'#e2e8f0'},
                {key:'nerves', label:'Nerves', color:'#d97706'},
                {key:'muscles', label:'Muscles', color:'#c07040'},
                {key:'vessels', label:'Vessels', color:'#dc2626'},
                {key:'bones', label:'Bones', color:'#4a7fa5'},
                {key:'ligaments', label:'Ligaments', color:'#2d7a5a'},
              ].map(({key, label, color}) => (
                <button key={key}
                  onClick={() => setVisibleLayers(prev =>
                    key === 'all'
                      ? { nerves:true, muscles:true, vessels:true, bones:true, ligaments:true }
                      : { ...prev, [key]: !prev[key] }
                  )}
                  style={{
                    padding:'3px 7px', borderRadius:5, fontSize:9, fontWeight:700,
                    border:'1px solid '+(key==='all'?'#475569':color),
                    background: key==='all' ? '#1e293b' : (visibleLayers[key] ? color+'33' : 'transparent'),
                    color: key==='all' ? '#94a3b8' : (visibleLayers[key] ? color : '#475569'),
                    cursor:'pointer', transition:'all 0.1s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ height:1, background:'#1e293b', margin:'2px 0' }}/>
            <p style={{ fontSize:10,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 2px' }}>Label Tools</p>
            <button onClick={() => { setLabelMode(m => !m); setPendingClick(null); }}
              style={{ padding:'8px 10px',borderRadius:7,border:'1px solid '+(labelMode?'#facc15':'#334155'),background:labelMode?'rgba(250,204,21,0.12)':'#1e293b',color:labelMode?'#facc15':'#94a3b8',fontSize:11,fontWeight:700,cursor:'pointer' }}>
              {labelMode ? '✏️ Labeling ON' : '✏️ Label Mode'}
            </button>
            {/* Label input — appears in panel after clicking image */}
            {pendingClick && (
              <div style={{ background:'#1e293b',border:'1px solid #3b82f6',borderRadius:8,padding:10 }}>
                <p style={{ margin:'0 0 6px',fontSize:10,color:'#93c5fd',fontWeight:700 }}>Name this structure</p>
                <input autoFocus value={pendingText} onChange={e => setPendingText(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter') saveLabel(); if (e.key==='Escape') setPendingClick(null); }}
                  placeholder="e.g. R femoral head"
                  style={{ width:'100%',padding:'5px 7px',background:'#0f172a',border:'1px solid #475569',borderRadius:5,color:'#e2e8f0',fontSize:11,outline:'none',boxSizing:'border-box' }}/>
                <div style={{ display:'flex',gap:5,marginTop:6 }}>
                  <button onClick={saveLabel} style={{ flex:1,padding:'5px',background:'#1d4ed8',border:'none',borderRadius:5,color:'white',fontSize:10,fontWeight:700,cursor:'pointer' }}>Save</button>
                  <button onClick={() => setPendingClick(null)} style={{ flex:1,padding:'5px',background:'#334155',border:'none',borderRadius:5,color:'#94a3b8',fontSize:10,cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            {totalLabels > 0 && (
              <button onClick={exportLabels}
                style={{ padding:'7px 10px',borderRadius:7,border:'1px solid #22c55e',background:'rgba(34,197,94,0.1)',color:'#22c55e',fontSize:11,fontWeight:700,cursor:'pointer' }}>
                Export JSON ({totalLabels})
              </button>
            )}
            {currentLabels.length > 0 && (
              <div style={{ marginTop:4 }}>
                <p style={{ fontSize:9,color:'#64748b',fontWeight:700,textTransform:'uppercase',margin:'0 0 4px' }}>Slice {currentSlice} labels</p>
                {currentLabels.map(([x, y, text], i) => (
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:4,marginBottom:3 }}>
                    <span style={{ flex:1,fontSize:10,color:'#facc15',background:'#1e293b',padding:'2px 6px',borderRadius:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{text}</span>
                    <button onClick={() => deleteLabel(currentLabelKey, i)}
                      style={{ background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12,padding:'0 2px',lineHeight:1 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop:'auto',padding:'8px',background:'#1e293b',borderRadius:8,border:'1px solid #334155' }}>
              <p style={{ fontSize:9,color:'#94a3b8',margin:0,lineHeight:1.6 }}>Scroll to navigate slices. Enable label mode then click any structure to annotate. Export JSON when done.</p>
            </div>
          </div>
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
            <CopyButton generatedReport={generatedReport} />
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
