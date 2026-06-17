'use client';
export const dynamic = 'force-dynamic'; // v2026-05-22 03:00
import { useState, useRef, useEffect } from 'react';
// LucidMSK logo font
if (typeof document !== 'undefined' && !document.getElementById('rajdhani-font')) {
  const link = document.createElement('link');
  link.id = 'rajdhani-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap';
  document.head.appendChild(link);
}
import { JOINT_DATA, DIAGRAM_SVGS } from './referenceData';
import CopyButton from './CopyButton';

import { MRI_GRADING_DATA, CT_GRADING_DATA } from './gradingData';
import TemplatesPanel from './TemplatesPanel';

// ─── MODALITY-AWARE DATA SELECTOR ────────────────────────────────────────────
// Returns the correct grading data object for a given body part and modality.
// MRI: uses MRI_GRADING_DATA if available, else falls back to JOINT_DATA (referenceData.js legacy).
// CT:  uses CT_GRADING_DATA if available, else returns null (Reference Panel shows a notice).
function getEffectiveJointData(bodyPart, modality) {
  if (modality === 'CT') {
    return CT_GRADING_DATA[bodyPart] || null;
  }
  // MRI: prefer MRI_GRADING_DATA override, else legacy JOINT_DATA
  return MRI_GRADING_DATA[bodyPart] || JOINT_DATA[bodyPart] || null;
}

const BODY_PARTS = ['spine','pelvis','shoulder','humerus','elbow','forearm','wrist','hand','thumb','fingers','hip','femur/thigh','knee','tibia/fibula','ankle','foot'];
const BODY_PARTS_CT = ['spine','pelvis','shoulder','humerus','elbow','forearm','wrist','hand','hip','femur/thigh','knee','tibia/fibula','ankle','foot'];
const BILATERAL = ['spine','pelvis'];

// Structures that should read "absent" when not mentioned
const ABSENT_STRUCTURES = [
  'joint effusion','effusion','baker cyst','bursa','bursitis',
  'soft tissue mass','mass','ganglion','cyst','lipoma','hematoma',
  'loose body','loose bodies','synovitis','plicae','plica',
];

// MRI anatomy — full soft tissue detail
const ANATOMY_MRI = {
  knee:'Medial Meniscus, Lateral Meniscus, Anterior Cruciate Ligament, Posterior Cruciate Ligament, Medial Collateral Ligament Complex, Lateral Collateral Ligament Complex, Patellar Tendon, Quadriceps Tendon, Medial Compartment Articular Cartilage, Lateral Compartment Articular Cartilage, Patellofemoral Articular Cartilage, Bones, Joint Effusion, Baker Cyst, Muscles, Regional Neurovascular Structures, Soft Tissues',
  shoulder:'Supraspinatus Tendon, Infraspinatus Tendon, Subscapularis Tendon, Teres Minor Tendon, Biceps Tendon Long Head, Acromioclavicular Joint, Glenoid Labrum, Acromial Undersurface, Subacromial and Subdeltoid Bursa, Articular Cartilage, Bones, Joint Effusion, Muscles, Regional Neurovascular Structures, Soft Tissues',
  hip:'Acetabular Labrum, Articular Cartilage, Iliopsoas Tendon, Gluteus Medius Tendon, Gluteus Minimus Tendon, Proximal Hamstring Tendons, Bones, Joint Effusion, Muscles, Regional Neurovascular Structures, Soft Tissues',
  wrist:'Triangular Fibrocartilage Complex, Scapholunate Ligament, Lunotriquetral Ligament, Extrinsic Ligaments, Flexor Tendons, Extensor Tendons, Median Nerve (Carpal Tunnel), Ulnar Nerve (Guyon Canal), Articular Cartilage, Bones, Muscles, Soft Tissues',
  elbow:'UCL (Ulnar Collateral Ligament — medial), LUCL (Lateral Ulnar Collateral Ligament — lateral), RCL (Radial Collateral Ligament — lateral), Annular Ligament, Common Flexor Tendon, Common Extensor Tendon, Distal Biceps Tendon, Brachialis Tendon, Triceps Tendon, Ulnar Nerve, Median Nerve, Radial Nerve / Posterior Interosseous Nerve, Articular Cartilage, Bones, Joint Effusion, Muscles, Soft Tissues',
  ankle:'Anterior Talofibular Ligament, Calcaneofibular Ligament, Posterior Talofibular Ligament, Deltoid Ligament Complex, Syndesmosis, Achilles Tendon, Posterior Tibial Tendon, Peroneal Tendons, Flexor Hallucis Longus Tendon, Plantar Fascia, Articular Cartilage, Bones, Joint Effusion, Muscles, Regional Neurovascular Structures, Soft Tissues',
  spine:'Vertebral Alignment, Vertebral Bodies, Intervertebral Discs, Paraspinal Soft Tissues, Facet Joints, Bones, Cord / Conus / Cauda Equina',
  pelvis:'Sacroiliac Joints, Pubic Symphysis, Hip Joints, Iliopsoas, Gluteal Muscles, Proximal Hamstring Tendons, Pelvic Bones, Regional Neurovascular Structures, Soft Tissues',
  foot:'Plantar Fascia, Lisfranc Ligament Complex, Plantar Plate, Articular Cartilage, Bones, Muscles, Regional Neurovascular Structures, Soft Tissues',
  'femur/thigh':'Proximal Hamstring Tendons (conjoint tendon at ischial tuberosity), Biceps Femoris Long Head, Biceps Femoris Short Head, Semimembranosus, Semitendinosus, Quadriceps Muscle Group (rectus femoris / vastus lateralis / vastus medialis / vastus intermedius), Adductor Muscle Group, Iliotibial Band, Femoral Neurovascular Bundle, Femur, Bone Marrow Signal, Soft Tissues',
  'tibia/fibula':'Tibialis Anterior, Extensor Hallucis Longus, Extensor Digitorum Longus, Posterior Tibial Tendon, Flexor Digitorum Longus, Flexor Hallucis Longus, Peroneus Longus, Peroneus Brevis, Anterior Compartment Musculature, Posterior Compartment Musculature, Lateral Compartment Musculature, Interosseous Membrane, Tibia (cortex / medullary canal / periosteum), Fibula, Bone Marrow Signal, Regional Neurovascular Structures, Soft Tissues',
  humerus:'Deltoid Muscle, Biceps Brachii, Brachialis, Triceps Brachii, Coracobrachialis, Radial Nerve, Axillary Nerve, Ulnar Nerve, Humerus (cortex / medullary canal / periosteum), Bone Marrow Signal, Soft Tissues',
  forearm:'Flexor Carpi Radialis, Flexor Carpi Ulnaris, Flexor Digitorum Superficialis, Flexor Digitorum Profundus, Flexor Pollicis Longus, Pronator Teres, Pronator Quadratus, Extensor Carpi Radialis Longus and Brevis, Extensor Carpi Ulnaris, Extensor Digitorum, Extensor Pollicis Longus and Brevis, Abductor Pollicis Longus, Brachioradialis, Supinator, Radius, Ulna, Interosseous Membrane, Radial Nerve, Median Nerve, Ulnar Nerve, Bone Marrow Signal, Soft Tissues',
  hand:'Flexor Tendons (FDS and FDP per ray), Extensor Tendons (per ray), Intrinsic Muscles (interossei and lumbricals), Thenar Muscles, Hypothenar Muscles, Median Nerve (Carpal Tunnel), Ulnar Nerve (Guyon Canal), Metacarpals, Metacarpophalangeal Joints, Articular Cartilage, Bones, Muscles, Soft Tissues',
  thumb:'Flexor Pollicis Longus Tendon, Extensor Pollicis Longus Tendon, Extensor Pollicis Brevis Tendon, Abductor Pollicis Longus Tendon, Ulnar Collateral Ligament (UCL — gamekeeper / skier thumb), Radial Collateral Ligament, Volar Plate, Adductor Pollicis Aponeurosis, Thenar Muscles, Sesamoids, First CMC Joint (trapeziometacarpal), MCP Joint, IP Joint, Articular Cartilage, Bones, Soft Tissues',
  fingers:'Flexor Digitorum Superficialis Tendon, Flexor Digitorum Profundus Tendon, Central Slip and Extensor Hood, Lateral Bands, Annular Pulleys (A1 through A5 per finger), Collateral Ligaments (radial and ulnar per joint), Volar Plate, PIP Joint, DIP Joint, MCP Joint, Articular Cartilage, Bones, Soft Tissues',
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
  'femur/thigh':'Femur (cortex / medullary canal / periosteum), Soft Tissue Compartments, Soft Tissues',
  'tibia/fibula':'Tibia (cortex / medullary canal / periosteum), Fibula, Interosseous Membrane, Soft Tissues',
  humerus:'Humerus (cortex / medullary canal / periosteum), Soft Tissues',
  forearm:'Radius, Ulna, Interosseous Membrane, Soft Tissues',
  hand:'Metacarpals, Phalanges, CMC Joints, MCP Joints, IP Joints, Dislocation or Subluxation, Soft Tissues',
};

const ANATOMY = ANATOMY_MRI; // backward compat
function getAnatomy(part, isCT) {
  return isCT ? (ANATOMY_CT[part] || ANATOMY_MRI[part]) : (ANATOMY_MRI[part] || '');
}


// ─── GRADING CONTEXT BUILDER ─────────────────────────────────────────────────
// Extracts grading scales from JOINT_DATA and formats them for Claude.
// Only includes entries marked isGradingScale:true — skips pure measurements.
function buildGradingContext(part, modality) {
  const jointData = getEffectiveJointData(part, modality);
  if (!jointData?.measurements?.length) return '';
  const scales = jointData.measurements.filter(m => m.isGradingScale);
  if (!scales.length) return '';
  return scales.map(m => {
    const grades = m.normalValues.map(v => `  ${v.label}: ${v.value}`).join('\n');
    return `${m.label}:\n${grades}`;
  }).join('\n\n');
}


// REPORT HEADING BUILDER
function buildReportHeading(modality, part, lat, con, spineRegion) {
  const isCT = modality === 'CT';
  const isRheum = modality === 'XR';
  const partLabel = (part === 'spine' && spineRegion ? spineRegion + ' spine' : part).toUpperCase();
  const latStr = lat ? (lat.toUpperCase() === 'BILATERAL' ? 'BILATERAL' : lat.toUpperCase()) : '';
  const latPart = latStr ? latStr + ' ' : '';
  if (isRheum) return 'RADIOGRAPHS ' + latPart + partLabel;
  const conUpper = (con || '').toUpperCase();
  let conLabel = '';
  if (conUpper.includes('WITHOUT AND WITH') || conUpper.includes('WITH AND WITHOUT')) conLabel = 'WITH AND WITHOUT CONTRAST';
  else if (conUpper.includes('WITHOUT')) conLabel = 'WITHOUT CONTRAST';
  else if (conUpper.includes('WITH')) conLabel = 'WITH CONTRAST';
  return (isCT ? 'CT' : 'MRI') + ' ' + latPart + partLabel + (conLabel ? ' ' + conLabel : '');
}

function buildPrompt(part, lat, con, spineRegion, modality, doseOpt = true, massMode = 'auto') {
  const isCT = modality === 'CT';
  const modalityName = isCT ? 'CT' : 'MRI';
  const doseOptSentence = doseOpt ? ' One or more of the following dose optimizing techniques were utilized for this exam: automated exposure control, adjustment of the mA and/or kV according to patient size, and/or use of iterative reconstruction technique.' : '';
  const techniqueText = isCT
    ? `CT scan of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part} ${con} IV contrast. Multiplanar reformats were created.${doseOptSentence}`
    : `Multiplanar multisequence MRI of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part} ${con} IV contrast.`;

  const findingsRules = isCT
    ? `FINDINGS RULES (CT): 1. Not mentioned: write "intact." EXCEPTION: Joint Effusion, Dislocation or Subluxation — write "absent." Soft Tissues — write "No acute soft tissue abnormality." 2. Positive: exact dictated words only. 3. CT language only: attenuation, cortical integrity, trabecular pattern, osteophytes, subchondral cysts, chondrocalcinosis. No T1/T2/STIR language. 4. BONES RULE — all three on same line: Fracture/cortical disruption (or "No fracture or cortical disruption."), Osteonecrosis (or "No osteonecrosis."), Osseous lesion (or "No aggressive osseous lesion."). 5. JOINT SPACE RULE — for each joint space: address narrowing, osteophytes, subchondral cysts, chondrocalcinosis — or write "Preserved joint space without osteophytes, subchondral cysts, or chondrocalcinosis."`
    : `FINDINGS RULES: 1. Not mentioned: write "intact." EXCEPTION: Joint Effusion, Baker Cyst, bursae, soft tissue masses — write "absent" not "intact." 2. Positive: exact dictated words only, no added morphology/signal/measurements. 3. BONES RULE — use a SINGLE heading "Bones:" for ALL bone findings. Address all three on the same line: Fracture/contusion (or "No fracture or contusion."), Osteonecrosis (or "No osteonecrosis."), Marrow signal (or "No marrow infiltration or bone lesion.") — three sentences on same line. Example: "Bones: No fracture or contusion. No osteonecrosis. No marrow infiltration or bone lesion." BONES SCOPE: include acute fractures, bone contusions, stress reactions/stress fractures, AVN, bone lesions (benign or malignant), marrow infiltration. Do NOT include chronic degenerative changes (osteophytes, subchondral sclerosis/cysts from OA) — those belong under Articular Cartilage or joint headings. CRITICAL: Do NOT create any subheading named after an individual bone (e.g. do NOT write "Femur:", "Tibia:", "Patella:", "Fibula:", "Calcaneus:", "Talus:" etc. as standalone findings headings). All bone findings consolidate under the single "Bones:" heading.`;
  const normalImpressionText = isCT
    ? `If entirely normal: "No significant CT findings of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part}."`
    : `If entirely normal: "No significant MRI findings of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part}."`;

  const gradingContext = buildGradingContext(part, modality);
  const gradingBlock = gradingContext
    ? `\n\nGRADING SCALES IN USE FOR THIS JOINT (apply these when grading is mentioned in dictation):\n${gradingContext}`
    : '';

  return `You are a subspecialty MSK radiologist generating a structured ${modalityName} report.

CRITICAL FORMATTING RULES:
- NEVER use markdown. No asterisks, no bold, no dashes, no bullet points.
- ABSOLUTE RULE — ZERO TOLERANCE: NEVER include any commentary, interpretation notes, correction notices, clarification notes, or meta-statements anywhere in the output. This includes — but is not limited to — phrases like "I interpreted X as Y", "I assumed you meant Z", "Note: I understood [term] to mean [term]", "I corrected [word] to [word]", "[term] interpreted as [term]", or any similar phrasing. If speech recognition produced garbled text, silently use your best clinical interpretation without any comment. The output must contain ONLY the formal radiology report sections: the exam heading, HISTORY, COMPARISON, TECHNIQUE, FINDINGS, IMPRESSION, and optionally FOOTNOTE/REFERENCES. Any sentence that is not part of the formal report is strictly forbidden.
- Section headers (TECHNIQUE, FINDINGS, LEVELS, IMPRESSION) on their own line in ALL CAPS with colon.
- Subheadings: "Structure Name: finding text" — Title Case, colon, finding on same line.

ANATOMY TO COVER for ${part}: ${getAnatomy(part, isCT)}
Generate a subheading for EVERY structure listed above.
${findingsRules}
IMPRESSION RULES:
CORE PRINCIPLE: The impression must read like a subspecialty MSK radiologist's synthesis — not a transcription of the findings list. Group related findings under a single unifying clinical diagnosis whenever possible. Use "as above" to refer back to findings rather than repeating measurements, grades, or signal descriptions. Aim for 1-4 impression items. A laundry list is always wrong.

NAMED SYNDROME PATTERNS — recognize and use these by name when the findings fit:

KNEE:
- PIVOT SHIFT / ACL INJURY: ACL tear + bone bruise/fracture + meniscus tear → "Sequela of pivot shift injury with ACL tear, [lateral/medial] osseous injury, and [meniscus] tear, as above."
- DASHBOARD INJURY: PCL tear + posterior tibial bone bruise → "Sequela of dashboard-type injury with PCL tear and posterior osseous injury, as above."
- HYPEREXTENSION INJURY: PCL + ACL tears + anterior bone bruising → "Sequela of hyperextension injury with multiligamentous involvement, as above."
- MULTILIGAMENTOUS: 3+ ligament injuries → "Multiligamentous knee injury (Schenck grade [if determinable]) involving [list], as above."
- DEGENERATIVE: Cartilage loss + degenerative meniscus tear + osteophytes → "[Mild/moderate/advanced/severe] osteoarthrosis, most significant in the [compartment] compartment, with associated degenerative [meniscus] tear, as above."
- ROTATOR CUFF ARTHROPATHY (if applicable): Superior migration humeral head + cuff tears → "Rotator cuff arthropathy with [massive cuff tear pattern], as above."


SHOULDER-SPECIFIC FINDINGS DEFAULTS AND RULES:
- Acromial Undersurface: default "Bigliani type 2 morphology." (change only if dictated otherwise)
- Subacromial and Subdeltoid Bursa: SEPARATE heading — do NOT include in Soft Tissues. Default: "No subacromial or subdeltoid bursitis."
- Biceps Tendon Long Head: default "Intact tendon. No tenosynovitis."
- Coracoclavicular ligament complex / coracoacromial ligament complex: if dictated, place findings under the AC Joint heading — NOT as a separate heading.
- Do NOT generate a "Glenohumeral Joint: intact" heading. This heading does not exist.
- crescent zone: do NOT capitalize — write "crescent zone" not "Crescent Zone"

SHOULDER:
- MASSIVE ROTATOR CUFF TEAR: Tears of 2+ tendons with muscle atrophy/fatty infiltration → "Massive rotator cuff tear involving the [tendons] with [Goutallier grade] fatty infiltration and [Patte stage] muscle retraction, as above." If superior humeral head migration or glenohumeral arthritis present add: "findings consistent with rotator cuff arthropathy."
- BANKART / ANTERIOR INSTABILITY: Anterior labral tear + Hill-Sachs + osseous Bankart → "Anterior glenohumeral instability pattern with Bankart lesion[/osseous Bankart], Hill-Sachs deformity, as above."
- POSTERIOR INSTABILITY: Posterior labral tear + reverse Hill-Sachs → "Posterior glenohumeral instability pattern with reverse Bankart lesion and reverse Hill-Sachs deformity, as above."
- SLAP: Superior labral tear → "SLAP tear [type if determinable], as above."
- SUBACROMIAL IMPINGEMENT: Hooked acromion/AC arthritis + supraspinatus pathology → "Subacromial impingement pattern with [partial/full] supraspinatus [tendinosis/tear], as above."
- AC SEPARATION: AC joint injury → "Acromioclavicular separation [Rockwood grade if determinable], as above."
- DISLOCATION: Anterior or posterior dislocation findings → "Sequela of [anterior/posterior] glenohumeral dislocation with [associated findings], as above."

ANKLE:
- INVERSION INJURY: ATFL ± CFL ± PTFL tears + bone bruising → "Sequela of inversion ankle injury with [lateral ligament complex] tear(s) and [osseous/osteochondral] injury, as above."
- EVERSION INJURY: Deltoid tear ± syndesmosis injury → "Sequela of eversion ankle injury with deltoid ligament disruption[/syndesmotic injury], as above."
- HIGH ANKLE SPRAIN: Syndesmosis injury ± Maisonneuve → "High ankle sprain with syndesmotic injury, as above." If Maisonneuve: add "findings consistent with Maisonneuve fracture pattern, clinical correlation recommended."
- HAGLUND SYNDROME: Insertional Achilles tendinopathy + Haglund deformity + retrocalcaneal bursitis → "Haglund syndrome with insertional Achilles tendinopathy, Haglund deformity, and retrocalcaneal bursitis, as above."
- OSTEOCHONDRAL LESION TALUS: OLT → always own line: "Osteochondral lesion of the talar [medial/lateral] dome, as above."

FOOT MRI — FINDINGS HEADING RULES:
- PLANTAR FASCIA: default when not dictated: "No fibroma or acute injury." Do NOT default to "intact."
- DO NOT include Achilles tendon, peroneal tendons, or posterior tibial tendon headings in a foot MRI UNLESS they are specifically dictated. These are ankle structures.
- BONES — REACTIVE OSTEITIS RULE: When dictation describes high T2/STIR signal in bone WITHOUT corresponding low T1 signal change, report as: "Reactive osteitis versus early osteomyelitis cannot be excluded. Clinical and laboratory correlation recommended." when infection is a clinical concern. If clearly post-traumatic or mechanical context, use "reactive marrow edema."

HIP:
- FAI CAM: CAM deformity + labral tear + cartilage damage → "CAM-type femoroacetabular impingement with anterosuperior labral tear[/cartilage injury], as above."
- FAI PINCER: Overcoverage + labral tear → "Pincer-type femoroacetabular impingement with labral [degeneration/tear], as above."
- MIXED FAI: Both → "Mixed-type FAI with labral pathology, as above."
- AVN: Always own line with Ficat stage if determinable.


NON-ARTHROGRAPHIC DISCLAIMER LOGIC (applies to wrist, shoulder, and hip):
If the dictation includes "allowing for non-arthrographic technique" or "allowing for lack of joint distention" in context of a structure:
1. Place the disclaimer WITHIN the subheading for that structure — NOT in TECHNIQUE section.
2. Findings phrasing: "Allowing for non-arthrographic technique, no tear of the [structure] is identified."
   Structure name mappings:
   - TFC/TFCC → "triangular fibrocartilage complex (TFC)"
   - SL ligament → "scapholunate (SL) ligament"
   - LT ligament → "lunotriquetral (LT) ligament"
   - Labrum (shoulder or hip) → "labrum" (qualify by location as dictated)
3. Impression phrasing: "Allowing for non-arthrographic technique, no tear of the [full structure name]. If there is continued clinical concern, MR arthrogram may be obtained for further assessment."
4. This disclaimer applies ONLY when no tear is the conclusion. If a tear IS identified, omit the disclaimer entirely.
5. NEVER place this disclaimer in the TECHNIQUE section.

WRIST:
- DE QUERVAIN'S: First dorsal compartment tenosynovitis (APL/EPB) → "De Quervain tenosynovitis of the first dorsal compartment, as above."
- INTERSECTION SYNDROME (1ST/2ND): First/second compartment intersection edema → "First/second compartment intersection syndrome, as above."
- INTERSECTION SYNDROME (3RD): EPL/second compartment crossover → "Second/third compartment intersection syndrome (posterior intersection syndrome), as above."
- TFCC INJURY: TFCC tear ± ulnar styloid → "Triangular fibrocartilage complex tear[/ulnar styloid avulsion], as above."
- SCAPHOLUNATE DISSOCIATION: SL ligament tear + widening → "Scapholunate ligament tear with [static/dynamic] instability pattern, as above."
- KIENBOCK: Lunate AVN → "Kienbock disease [Lichtman stage if determinable], as above."

ELBOW:
- LATERAL EPICONDYLOSIS/TEAR: Common extensor origin → "Lateral epicondylosis[/partial tear of common extensor origin], as above." (tennis elbow)
- MEDIAL EPICONDYLOSIS/TEAR: Common flexor origin → "Medial epicondylosis[/partial tear of common flexor origin], as above." (golfer's elbow)
- UCL INJURY: UCL tear ± valgus instability → "Ulnar collateral ligament tear with [complete/partial] disruption, as above."
- POSTEROLATERAL ROTATORY INSTABILITY: RCL complex tear → "Lateral collateral ligament complex tear with posterolateral rotatory instability pattern, as above."
- ELBOW IMPRESSION DEDUPLICATION RULE: Each finding must appear ONCE only in the impression. If a finding (e.g., common extensor tendon tearing) is already stated, do not restate it under a different name or heading. Review the full impression before finalizing and remove any repeated findings.
- DISLOCATION: "Sequela of [simple/complex] elbow dislocation with [associated fractures/ligament injuries], as above."
- PANNER / OCD: Capitellum OCD → "Osteochondral lesion of the capitellum[/Panner disease], as above." — always own line.

PELVIS:
- YOUNG-BURGESS CLASSIFICATION: Apply when pelvic ring fracture identified:
  - Lateral compression (LC) I/II/III based on pattern
  - Anteroposterior compression (APC) I/II/III
  - Vertical shear (VS)
  - Combined mechanism (CM)
  → "Pelvic ring fracture, [Young-Burgess classification] pattern, as above."
- AVULSION: Apophyseal avulsion → "[ASIS/AIIS/ischial tuberosity/iliac crest] avulsion fracture, as above."
- SACRAL INSUFFICIENCY: Bilateral sacral ala fractures in elderly → "Sacral insufficiency fractures, as above."

PELVIS MRI — FINDINGS HEADING RULES:
- ILIOPSOAS heading: use exactly "Iliopsoas:" (NOT "Iliopsoas Muscles:"). Default when not dictated: "No tear or bursitis."
- SACROILIAC JOINTS heading: report ONLY findings directly related to the SI joints — trauma, OA, sacroiliitis, infection. Do NOT place lumbar spine, surgical hardware, or any non-SI-joint findings here.
- PUBIC SYMPHYSIS heading: default when not dictated: "No acute abnormality." (NOT "intact")
- HIP JOINTS heading: default when not dictated: "No acute abnormality." (NOT "intact")

FEMUR/THIGH — BAMIC GRADING (British Athletics Muscle Injury Classification):
Apply BAMIC grading when a hamstring or thigh muscle injury is identified. BAMIC classifies injuries by anatomic location (muscle belly vs. myotendinous junction vs. central/intramuscular tendon) and cross-sectional area (CSA) involvement:

GRADE 0: Reactive MRI signal change only — peritendinous edema or minimal intramuscular edema; no architectural disruption
GRADE 1a: Injury at/near the peripheral myotendinous junction (MTJ) within the muscle; <10% CSA involved
GRADE 1b: Injury at/near the peripheral MTJ within the muscle; ≥10% CSA involved
GRADE 2a: Injury at/near the MTJ involving the myotendinous unit; <10% CSA involved
GRADE 2b: Injury at/near the MTJ involving the myotendinous unit; ≥10% CSA involved
GRADE 3a: Injury at/within the central (intramuscular) tendon; <10% CSA involved
GRADE 3b: Injury at/within the central (intramuscular) tendon; ≥10% CSA involved
GRADE 4: Complete or near-complete tear — proximal tendon avulsion from ischial tuberosity, or complete central tendon disruption with retraction

MODIFIER (c): Add subscript (c) for isolated central tendon injury without peripheral muscle involvement (e.g., Grade 3a(c))

BAMIC IMPRESSION RULES:
- Always state the BAMIC grade, affected muscle(s) by name, and anatomic injury site
- Include approximate CSA involvement if provided in dictation
- Grade 4: note whether avulsion is from ischial tuberosity, degree of retraction in cm, and whether conjoint tendon or individual tendons involved
- QUADRICEPS injuries: use BAMIC framework; specify which head (rectus femoris most common); note myotendinous vs. proximal/distal tendon
- ADDUCTOR injuries: use BAMIC framework; adductor longus most common
- Example Grade 2b: "Grade 2b biceps femoris long head hamstring injury at the myotendinous junction with ≥10% cross-sectional involvement, as above."
- Example Grade 4: "Complete proximal hamstring avulsion (conjoint biceps femoris / semitendinosus / semimembranosus tendons) at the ischial tuberosity with [X] cm retraction, BAMIC Grade 4, as above."
- In IMPRESSION, write BAMIC grade explicitly (do not use "as above" to substitute for the grade number itself)

TIBIA/FIBULA — FREDERICSON GRADING (Medial Tibial Stress Syndrome / Tibial Stress Reaction):
Apply Fredericson grading when periosteal edema, medullary edema, or cortical abnormality of the tibia is identified in a stress reaction/fracture context:

GRADE 1: Mild periosteal edema on STIR/fluid-sensitive sequences; T1 normal; no medullary involvement
GRADE 2: Moderate-to-severe periosteal edema on STIR; T1 normal; no medullary involvement
GRADE 3: Periosteal AND medullary (marrow) edema on STIR; T1 remains normal (no trabecular injury)
GRADE 4a: Periosteal AND marrow edema on both STIR and T1 (low T1 signal = trabecular microfracture/injury)
GRADE 4b: Grade 4a findings PLUS a visible intracortical or transcortical fracture line — frank stress fracture

FREDERICSON IMPRESSION RULES:
- State Fredericson grade, affected bone, and location (proximal/middle/distal third of tibia)
- Note cortical location if relevant: posteromedial cortex = medial tibial stress syndrome; anterior cortex = high-risk ("dreaded black line")
- Grade 4b = stress fracture — list prominently with urgency flag if anterior cortex involved
- Example Grade 3: "Medial tibial stress syndrome, Fredericson Grade 3, posteromedial cortex, middle third of tibia with periosteal and medullary edema, as above."
- Example Grade 4b: "Tibial stress fracture, Fredericson Grade 4b, anterior cortex of the mid-tibia — high-risk location; orthopedic consultation recommended, as above."
- Fibular stress reactions: note location and grade using same periosteal/medullary/cortical framework

HUMERUS:
- PROXIMAL HUMERUS FRACTURE: Neer classification if applicable (1-4 part based on displacement of segments: humeral head, greater tuberosity, lesser tuberosity, shaft)
- HUMERAL SHAFT FRACTURE: Note location (proximal/middle/distal third), pattern; radial nerve at risk with middle third ("Holstein-Lewis" type)
- AVN HUMERAL HEAD: Cruess stage if determinable; list on its own line
- BONE LESION: Always own line; note Lodwick grade/aggressiveness

FOREARM (RADIUS/ULNA):
- BOTH-BONE FRACTURE: "Both-bone forearm fracture involving the radius and ulna, as above."
- MONTEGGIA FRACTURE-DISLOCATION: Ulna fracture + radial head dislocation → "Monteggia fracture-dislocation pattern, as above." (Bado classification if determinable)
- GALEAZZI FRACTURE-DISLOCATION: Radial shaft fracture + DRUJ disruption → "Galeazzi fracture-dislocation pattern, as above."
- ISOLATED RADIAL/ULNAR SHAFT FRACTURE: Note location, pattern, and DRUJ/proximal RU joint integrity
- BONE LESION: Always own line


SPINE-SPECIFIC FINDINGS RULES:

INTERVERTEBRAL DISCS heading — INCLUDE ONLY: desiccation (global or by level), annular fissures/tears (by level), Schmorl nodes (by level), Modic changes (type and level).
INTERVERTEBRAL DISCS heading — DO NOT INCLUDE: disc herniations, protrusions, extrusions, bulges, spinal canal stenosis, foraminal stenosis. These belong exclusively under LEVELS.
INTERVERTEBRAL DISCS default when nothing abnormal: "No acute abnormality." — NOT "intact."

PARASPINAL SOFT TISSUES: default text is "No acute abnormality." — NOT "intact."

CANAL AND NEURAL FORAMINA: Do NOT generate this as a standalone FINDINGS heading. Canal and foraminal stenosis belongs exclusively under individual LEVELS entries.

CORD / CONUS / CAUDA EQUINA heading — INCLUDE ONLY: conus medullaris tip level/termination, intrinsic cord signal abnormality (e.g. syrinx, myelomalacia, demyelination), and cauda equina nerve root crowding/clumping NOT attributable to a specific disc level.
CORD / CONUS / CAUDA EQUINA heading — DO NOT INCLUDE: disc herniation/protrusion/extrusion, or nerve root compression/displacement caused by a disc — even if the dictation mentions a nerve root by name (e.g. "compressing the left L5 nerve root"). ANY finding describing a disc compressing, displacing, or impinging a nerve root belongs exclusively under the corresponding LEVELS entry for that disc level (e.g. an L4-5 disc extrusion compressing the L5 nerve root → "L4-L5:" line under LEVELS), never under Cord/Conus/Cauda Equina.
CORD / CONUS / CAUDA EQUINA default when conus level/termination is NOT dictated: "The conus medullaris terminates at a normal level. No intrinsic cord signal abnormality." Do NOT write "termination is not dictated" or any phrase implying missing information — always phrase the default as a normal finding.
LEVEL INFERENCE: If a disc-level nerve root relationship is dictated but the disc level itself is ambiguous or not stated, use standard lumbar numbering to infer it — a paracentral/foraminal disc at level X-Y typically compresses the traversing nerve root numbered Y in the lateral recess/foramen (e.g. an L4-5 disc most commonly compresses the L5 nerve root; an L5-S1 disc most commonly compresses the S1 nerve root). Place the finding under the inferred LEVELS entry.

FACET JOINTS heading — ALWAYS generate this heading in FINDINGS (it is a required structure for spine). Level-specific facet findings (edema, effusion, erosion, synovitis, arthrosis at a particular level) are ALSO reported under the corresponding LEVELS entry, not instead of this heading. Default text for the Facet Joints heading when nothing facet-specific is dictated: "No facet arthropathy or effusion." Never write "See LEVELS." as the Facet Joints heading text — always give the normal-default sentence above unless dictation describes a global/non-level-specific facet finding.

BONES heading — include if dictated: pars defect (location/level), pedicle or pars stress reaction, vertebral hemangiomas, fractures, marrow signal abnormality. Default marrow text when nothing abnormal: "No marrow infiltration or aggressive osseous lesion."

DISCITIS / OSTEOMYELITIS ALERT — apply when dictation mentions increased STIR or T2 signal in a disc:
Search the dictation for additional signs: endplate erosion, paraspinal collection/abscess, epidural collection/abscess, enhancement pattern.
- IF additional signs of infection ARE present (endplate erosion, paraspinal/epidural collection or abscess): Use impression language "Findings are concerning for discitis/osteomyelitis at [level]. Paraspinal/epidural involvement as above. Urgent clinical and laboratory correlation recommended."
- IF ONLY increased STIR/T2 disc signal, no additional signs mentioned: Use impression language "Increased STIR/T2 signal is present within the [level] disc, which in isolation is nonspecific and may reflect degenerative change; however, early discitis can have a similar appearance. Correlation with clinical symptoms and laboratory values (ESR, CRP, WBC) is recommended. If there is concern for early infection, short-interval follow-up MRI with contrast is recommended."

REGIONAL NEUROVASCULAR STRUCTURES: Generate this heading for ALL non-spine MRI joints. Default text when not dictated: "Normal caliber vessels and nerves. No neurovascular compression or abnormal signal identified."

SPINE:
- MULTILEVEL DISC DISEASE: → "Multilevel degenerative disc disease most significant at [worst level(s)] with [worst complication — e.g. moderate spinal stenosis, neural foraminal narrowing], as above."
- SINGLE LEVEL: → "[Level] disc herniation/protrusion with [nerve involvement if present], as above."
- COMPRESSION FRACTURE: → "[Acute/subacute/chronic] compression fracture [level], [height loss %], as above." If multiple: group as "multilevel compression fractures."
- SPONDYLOLISTHESIS: → "Grade [I-IV] [antero/retro]listhesis at [level] with [associated stenosis if present], as above."

GENERAL NAMED SYNDROMES (any joint):
- COMPLEX REGIONAL PAIN SYNDROME (CRPS): Periarticular osteopenia + soft tissue edema pattern → "Imaging findings consistent with complex regional pain syndrome, clinical correlation recommended."
- STRESS FRACTURE: → "[Fatigue/insufficiency] stress fracture of the [bone], as above."
- AVULSION: Name the muscle origin/insertion + bone → "[Muscle] avulsion [fracture/injury] at [site], as above."
- NERVE ENTRAPMENT: → "[Nerve] entrapment at [site — e.g. carpal tunnel, cubital tunnel, tarsal tunnel], as above."
- TRANSIENT BONE MARROW EDEMA SYNDROME: Diffuse marrow edema without fracture/AVN → "Transient bone marrow edema syndrome of the [bone/joint], as above."

OSTEOMYELITIS / SEPTIC ARTHRITIS IMPRESSION RULES:
- OSTEOMYELITIS: When osteomyelitis is dictated at any bone, it MUST have its own dedicated impression line. State as: "Osteomyelitis, [bone name]." — do NOT include T1/T2/STIR signal descriptions in the impression, just the diagnosis and location.
- SEPTIC ARTHRITIS: When septic arthritis is dictated at a joint, it may be combined with osteomyelitis of the same bones on a single impression line if both are present at the same location: e.g., "Osteomyelitis of the [bone] with adjacent septic arthritis of the [joint]."
- Multiple sites: each affected bone with osteomyelitis gets its own impression line.
- Do NOT repeat MRI signal characteristics (T1 hypointense, T2/STIR hyperintense) in the impression — state only the diagnosis.

WHAT ALWAYS GETS ITS OWN LINE (never grouped):
- Osteochondral lesion / OCD / subchondral fracture
- AVN (with Ficat/ARCO stage)
- Aggressive or indeterminate osseous lesion
- Fracture of high urgency (pelvic ring, vertebral with cord compromise)
- Incidental finding unrelated to primary pathology (e.g. an incidental cyst, e.g. renal or adnexal, on a non-abdominal MRI)
- Normal exam → ${normalImpressionText}

SPINE INCIDENTAL CYST GARBLE — ADNEXAL vs RENAL: On lumbar/pelvic spine MRI, an incidentally noted cyst near the kidneys/pelvis is far more often an ADNEXAL cyst (ovarian/pelvic) than a renal cyst, and speech recognition frequently mangles "adnexal" into phonetically similar nonsense (e.g. "at nexle", "a nexel", "an exile", "and nexel"). If the dictation contains a garbled word resembling "adnexal" immediately before "cyst," transcribe it as "adnexal cyst," NOT "renal cyst" — do not substitute organ names based on a prompt example; use only what best phonetically matches the garbled dictation.


GLOBAL DEFAULTS (apply to ALL joints unless dictation specifies otherwise):
- Muscles: "No high-grade fatty infiltration or volume loss. No intramuscular edema to suggest denervation, myositis, or strain."
- Articular Cartilage: "Preserved." (NOT "intact" — use "preserved" for all joints)
- Soft Tissues: "No acute abnormality." (NOT "intact")
- Bones (MRI): always include "No marrow infiltration or aggressive osseous lesion." as part of the Bones subheading unless a specific lesion is dictated.
- Regional Neurovascular Structures (all non-spine, non-wrist MRI joints): default "Normal caliber vessels and nerves. No neurovascular compression or abnormal signal identified."
- POSTSURGICAL CHANGE (ALL MRI joints): If the dictation describes any surgical changes, postoperative findings, or hardware at any location, generate a separate "Postsurgical Change:" heading in the FINDINGS section and place ALL such findings there. Do NOT scatter postsurgical findings under other headings (e.g. Soft Tissues, Bones, joint-specific headings). If no surgical changes are dictated, do NOT generate this heading.

STYLE RULES:
- Number each item. Most important/urgent first.
- Use named syndromes and clinical mechanisms — not signal descriptions or grade numbers
- "as above" replaces repeating measurements, grades, signal characteristics — but use it SPARINGLY: maximum one "as above" per impression line, and only when the finding has genuine complexity worth referencing. DO NOT use "as above" for simple, self-evident findings.
- Do NOT write "modified Outerbridge grade X", "T2 hyperintensity", "low signal on T1" in the impression
- ${normalImpressionText}
- CARTILAGE / OA RULE (knee): If Modified Outerbridge grading in 2+ compartments → single DEGENERATIVE line, not per-compartment.
- OSTEOCHONDRAL EXCEPTION: OCD/osteochondral lesion/subchondral fracture always listed separately.

KNEE CARTILAGE SURFACE VOCABULARY — CRITICAL:
Speech recognition frequently garbles anatomic cartilage surface names. When cartilage loss or grading is dictated for the knee, map the dictated phrase to the correct anatomic surface using this reference — always use the correct term in the report:
  Patellofemoral compartment surfaces:
    - "medial patellar facet" / "medial facet of the patella" / "medial patella"
    - "lateral patellar facet" / "lateral facet of the patella" / "lateral patella"
    - "central ridge of the patella" / "central patellar ridge"
    - "medial trochlear facet" / "medial trochlea" — garbled forms: "medical truck layer for set", "medial trochlear for set"
    - "lateral trochlear facet" / "lateral trochlea" — garbled forms: "lateral truck layer for set", "lateral trochlear for set", "lateral trochlear facet"
    - "trochlear groove" / "central trochlea"
  Tibiofemoral compartment surfaces:
    - "medial femoral condyle"
    - "lateral femoral condyle"
    - "medial tibial plateau"
    - "lateral tibial plateau"
When speech recognition produces garbled text that phonetically resembles one of these surfaces, silently correct to the proper anatomic term and include it in the report. Never ignore a cartilage grade because the surface name was garbled — always attempt to match to the nearest anatomic surface above.
- SIMPLIFIED IMPRESSION PRINCIPLE: Synthesize findings into a single clinical diagnosis where possible. DO NOT list every individual finding component — name the pattern, then add only the most clinically critical features.
  WRONG: "Advanced glenohumeral osteoarthrosis with modified Outerbridge grade 3 to 4 cartilage loss involving both articular surfaces, marginal osteophytes, multifocal subchondral marrow edema preferentially at the glenoid, circumferential labral tearing, osteochondral debris and/or synovitis within a small joint effusion."
  RIGHT: "Severe glenohumeral joint osteoarthrosis with circumferential labral tearing and small debris-containing joint effusion."
  The rule: name the overarching diagnosis + at most 2 clinically actionable features. Everything else is implicit in the diagnosis or detailed in FINDINGS.${gradingBlock}
MASS / TUMOR / CANCER RULES — apply whenever dictation mentions a mass, tumor, cancer, malignancy, neoplasm, carcinoma, sarcoma, lymphoma, metastasis, lesion with oncologic context, or recurrence:

BNCT PATTERN RECOGNITION — REPORT GENERATOR:
When a vertebral body or sacrococcygeal bone lesion is described, actively check for the BNCT pattern:
  BNCT-COMPATIBLE (all must be present): T1 hypointense, T2 hyperintense, no enhancement, central vertebral location, ± mild sclerosis, ± multifocal
  BNCT-INCOMPATIBLE (any one excludes BNCT): frank lysis, extraosseous/soft tissue mass, avid or moderate enhancement
If BNCT-compatible: in the FINDINGS Bones section describe the lesion, then in IMPRESSION write: "Imaging features are most consistent with benign notochordal cell tumor (BNCT). Biopsy is not recommended for lesions with this typical appearance; imaging surveillance is appropriate. Development of lysis, soft tissue extension, or enhancement would warrant upgrading to atypical notochordal cell tumor (ANCT) and further evaluation."
If BNCT-incompatible features are present: raise chordoma in the differential and note which features exclude BNCT.

FINDINGS — MASS HEADING:
Generate a separate MASS heading in the FINDINGS section.
Describe: location, size (in centimeters, three dimensions if provided), signal characteristics or density, morphology, margins, and involvement of adjacent structures as dictated.
Do not fabricate features not present in the dictation.

CASE TYPE — apply exactly one of the following three sets of rules:
${massMode === 'new' ? `ACTIVE CASE TYPE: NEW CASE (explicitly set by user)
- Include a differential diagnosis based on the imaging features described. List most likely first. Do not fabricate features not in the dictation.
- Do not include a comparison statement.` :
  massMode === 'followup' ? `ACTIVE CASE TYPE: FOLLOW-UP CASE (explicitly set by user)
- Do NOT include a differential diagnosis.
- If the radiologist dictates a comparison to prior imaging (size change, signal change, new or resolved features): incorporate that comparison into the MASS description naturally (e.g., "decreased in size compared to [date] MRI measuring X cm, previously Y cm").
- If no comparison is dictated, do not fabricate one.` :
  massMode === 'postresection' ? `ACTIVE CASE TYPE: POST-RESECTION CASE (explicitly set by user)
- Do NOT include a differential diagnosis.
- Describe the surgical bed and any signal abnormality present.
- Specifically evaluate and describe: enhancement pattern, restricted diffusion, mass effect, involvement of margins or neurovascular structures as dictated.` :
`AUTO-DETECT CASE TYPE from context clues in the dictation — infer from what is said, do not ask:

NEW CASE (no prior comparison mentioned; no treatment history; no post-surgical context):
- Include a differential diagnosis based on imaging features described. List most likely first. Do not fabricate features not in the dictation.
- Do not include a comparison statement.

FOLLOW-UP CASE (prior comparison mentioned, prior treatment mentioned — chemotherapy, radiation, immunotherapy — or comparison imaging referenced):
- Do NOT include a differential diagnosis.
- If the radiologist dictates a size or signal change vs. prior: incorporate that naturally into the MASS description (e.g., "decreased in size compared to [date] MRI measuring X cm, previously Y cm").
- If no comparison is dictated, do not fabricate one.

POST-RESECTION CASE (prior surgical resection, "post-op," "post-resection," "surgical bed," "post-treatment change," or similar context):
- Do NOT include a differential diagnosis.
- Describe the surgical bed findings as dictated.
- Specifically evaluate and describe: enhancement pattern, restricted diffusion, mass effect, involvement of margins or neurovascular structures as dictated.`}

IMPRESSION — FOLLOW-UP MASS (mass still present, being followed):
Lead the impression with exactly one of the following phrases based on what the radiologist dictated — do not infer or choose on your own unless dictation clearly supports it:
  - "Tumor progression." — if mass has grown, new lesions appear, or features are worsening
  - "Mixed response to therapy." — if partial response, some areas improved and others progressed
  - "Complete response to therapy." — if mass has resolved or shows no residual viable tumor
State size and key change (or stability) in the same sentence after the lead phrase.
Example: "Tumor progression. The [location] mass has increased in size from X cm to Y cm compared to [date]."

IMPRESSION — POST-RESECTION:
The primary impression point must address tumor recurrence status. Use exactly one of:
  - "No local tumor recurrence identified."
  - "Findings suspicious for local tumor recurrence." — if concerning but not definitive
  - "Findings consistent with local tumor recurrence." — if definitive
This must be the FIRST or SECOND line of the impression.
Do NOT lead with soft tissue edema, fluid, or secondary findings when recurrence status is the clinical question.


FORMAT — one blank line between each section:
${buildReportHeading(modalityName, part, lat, con, spineRegion)}

HISTORY:

COMPARISON: None.

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

    // FOOTNOTE / REFERENCES — small, muted, italic section below impression
    if (/^(FOOTNOTES?|REFERENCES?)(\s*\/\s*(FOOTNOTES?|REFERENCES?))?:?$/i.test(t)) {
      inFootnote = true; inReferences = true; inImpression = false;
      const headerLabel = t.replace(/:?$/, '').replace(/\s*\/\s*/, ' / ')
        .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      return (
        <div key={i} style={{ marginTop:18, borderTop:'1px solid '+(colors.border||'#e2e8f0'), paddingTop:8, marginBottom:3 }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.14em', color:'#94a3b8', textTransform:'uppercase' }}>{headerLabel}</span>
        </div>
      );
    }
    if (inFootnote || inReferences) return <div key={i} style={{ fontSize:10, color:'#94a3b8', fontStyle:'italic', lineHeight:1.6, paddingLeft:4, marginBottom:3 }}>{t}</div>;

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

// ─── PERMANENT PELVIS ATLAS LABELS (T1 sequence) ────────────────────────────
// Labels accurately placed with label editor — SI joint labels updated 2026-06
const PELVIS_LABELS = {
  2: [
    [77.5, 57.7, "gluteus medius"],
  ],
  4: [
    [56.9, 53.9, "L5"],
    [62.5, 49, "psoas"],
  ],
  5: [
    [78.8, 55.0, "gluteus medius"],
    [75, 52.4, "iliacus"],
    [62.6, 47.5, "psoas"],
  ],
  6: [
    [59.0, 53.9, "L5"],
  ],
  7: [
    [62.8, 47.5, "psoas"],
  ],
  8: [
    [79.4, 54.2, "gluteus medius"],
    [74.7, 51.3, "iliacus"],
  ],
  9: [
    [68.5, 49.3, "lateral femoral cutaneous nerve"],
    [59.7, 54.0, "L5"],
    [84.2, 42.1, "iliac bone"],
    [63.1, 17.4, "rectus abdominis"],
  ],
  10: [
    [74.6, 71.2, "gluteus maximus"],
    [64.4, 64.2, "SI joint, ligamentous portion"],
  ],
  11: [
    [69.7, 49.5, "lateral femoral cutaneous nerve"],
    [64.3, 47.2, "psoas"],
  ],
  12: [
    [81.3, 52.9, "gluteus medius"],
    [60.8, 54.6, "L5"],
    [57.3, 58.8, "S1"],
    [52.6, 56.1, "Sacrum, S1"],
    [74.7, 48.3, "iliacus"],
    [63.2, 64.8, "SI joint, ligamentous portion"],
  ],
  13: [
    [77.6, 69.9, "gluteus maximus"],
    [56.8, 64.7, "S2"],
    [53.3, 62.2, "Sacrum, S2"],
  ],
  14: [
    [72.7, 46.8, "lateral femoral cutaneous nerve"],
    [64.4, 64.8, "SI joint, ligamentous portion"],
    [67.6, 56.9, "SI joint, synovial portion"],
  ],
  15: [
    [64.4, 46.3, "psoas muscle"],
    [81.2, 54.4, "gluteus medius"],
    [61.6, 55.2, "L5"],
    [58.6, 58.2, "S1"],
    [65.5, 63.9, "SI joint, ligamentous portion"],
    [67.2, 56.9, "SI joint, synovial portion"],
  ],
  16: [
    [74.2, 44.6, "lateral femoral cutaneous nerve"],
    [57.4, 65.3, "S2"],
    [53.6, 69.1, "Sacrum, S3"],
    [75.2, 47, "iliacus"],
  ],
  17: [
    [81.8, 53.5, "gluteus medius"],
    [80.2, 66.8, "gluteus maximus"],
    [65.8, 61.2, "SI joint, synovial portion"],
  ],
  18: [
    [68.8, 47.7, "femoral nerve"],
    [76.1, 41.4, "lateral femoral cutaneous nerve"],
    [61.0, 59.8, "S1"],
    [57.1, 71.2, "S3"],
    [62.8, 57.2, "iliac bone"],
  ],
  19: [
    [81.2, 52.3, "gluteus medius"],
    [63.8, 56.0, "L5"],
    [54.1, 73.3, "Sacrum, S4"],
    [66.1, 45.4, "psoas"],
    [75.3, 45.7, "iliacus"],
    [65.3, 62.4, "SI joint, synovial portion"],
  ],
  20: [
    [63.9, 53.1, "obturator nerve"],
    [62.4, 59.4, "S1"],
    [60.6, 65.3, "S2"],
    [58.2, 71.6, "S3"],
    [67.1, 42.2, "iliacus"],
    [64.1, 53.1, "obturator nerve"],
    [65.3, 62.4, "SI joint, synovial portion"],
  ],
  21: [
    [76.7, 35.3, "lateral femoral cutaneous nerve"],
    [81.2, 52.0, "gluteus medius"],
    [81.7, 67.2, "gluteus maximus"],
    [53.7, 74.8, "Sacrum, S5"],
  ],
  22: [
    [70.0, 44.6, "femoral nerve"],
    [81.0, 42.6, "gluteus minimus"],
    [64.0, 57.1, "L5"],
    [63.7, 60.3, "S1"],
    [59.4, 71.2, "S3"],
    [66.2, 61.2, "SI joint, synovial portion"],
  ],
  23: [
    [65.0, 53.6, "obturator nerve"],
    [77.0, 32.8, "lateral femoral cutaneous nerve"],
    [81.7, 51.8, "gluteus medius"],
    [61.9, 65.1, "S2"],
    [63.2, 68.1, "piriformis"],
    [67.5, 43.9, "psoas"],
    [75, 42.7, "iliacus"],
  ],
  24: [
    [82.5, 66.8, "gluteus maximus"],
    [80.4, 30.6, "anterior superior iliac spine"],
    [60.2, 70.6, "S3"],
    [75.9, 29.6, "ilioinguinal nerve"],
  ],
  25: [
    [71.1, 41.9, "femoral nerve"],
    [81.7, 51.2, "gluteus medius"],
    [66.4, 59.0, "L5"],
    [64.5, 68.9, "piriformis"],
  ],
  26: [
    [64.5, 64.5, "S2"],
    [61.4, 69.3, "S3"],
    [66.0, 40.5, "iliacus"],
  ],
  27: [
    [80.7, 42.0, "gluteus minimus"],
    [82.1, 65.9, "gluteus maximus"],
    [65.0, 68.7, "piriformis"],
    [71.2, 40.7, "femoral nerve"],
    [67.6, 44.3, "psoas"],
  ],
  28: [
    [67.6, 61.0, "sciatic nerve"],
    [66.7, 53.5, "obturator nerve"],
    [71.2, 40.2, "femoral nerve"],
    [82.5, 51.2, "gluteus medius"],
    [61.9, 68.7, "S3"],
    [75.3, 39.3, "iliacus"],
  ],
  29: [
    [82.6, 30.2, "tensor fascia lata"],
    [68.7, 66.6, "piriformis"],
  ],
  30: [
    [83.3, 65.9, "gluteus maximus"],
    [74.6, 30.7, "ilioinguinal nerve"],
    [66.1, 41.4, "external iliac artery"],
  ],
  31: [
    [66.8, 52.0, "obturator nerve"],
    [71.7, 38.2, "femoral nerve"],
    [79.1, 31.4, "sartorius"],
    [64.2, 68.5, "S3"],
    [70.9, 65.5, "piriformis"],
  ],
  32: [
    [68.3, 61.7, "sciatic nerve"],
    [82.0, 53.3, "gluteus medius"],
    [65.6, 44.3, "external iliac vein"],
    [68.5, 42.3, "psoas"],
  ],
  33: [
    [83.1, 67.4, "gluteus maximus"],
    [83.1, 31.4, "tensor fascia lata"],
    [73.0, 63.0, "piriformis"],
  ],
  34: [
    [82.9, 53.9, "gluteus medius"],
    [54.2, 80.3, "coccyx"],
    [71.8, 36.6, "femoral nerve"],
  ],
  35: [
    [66.5, 51.5, "obturator nerve"],
    [72.0, 36.6, "femoral nerve"],
    [80.5, 43.0, "gluteus minimus"],
    [83.7, 67.6, "gluteus maximus"],
    [78.4, 31.6, "sartorius"],
    [76.7, 40.1, "anterior inferior iliac spine"],
    [66.4, 41.9, "external iliac vein"],
    [72.3, 31, "ilioinguinal nerve"],
    [68.1, 38.4, "external iliac artery"],
  ],
  36: [
    [83.3, 54.4, "gluteus medius"],
    [78.1, 38.6, "rectus femoris, direct head"],
    [64.3, 74.4, "sacrotuberous ligament"],
    [54.2, 79.2, "coccyx"],
    [48.5, 88.4, "sciatic nerve"],
  ],
  37: [
    [85.0, 66.0, "gluteus maximus"],
    [84.7, 32.5, "tensor fascia lata"],
    [70, 41.6, "psoas"],
  ],
  38: [
    [78.1, 43.4, "rectus femoris, reflected head"],
    [70.4, 41.7, "iliopsoas"],
    [66.6, 40.0, "external iliac vein"],
    [69.3, 37.1, "external iliac artery"],
  ],
  39: [
    [71.7, 63.5, "sciatic nerve"],
    [65.3, 49.1, "obturator nerve"],
    [71.8, 35.1, "femoral nerve"],
    [80.2, 28.3, "lateral femoral cutaneous nerve"],
    [81.0, 43.2, "gluteus minimus"],
    [84.1, 54.6, "gluteus medius"],
    [85.3, 67.2, "gluteus maximus"],
    [77.5, 30.6, "sartorius"],
    [84.7, 32.1, "tensor fascia lata"],
    [65.6, 73.7, "sacrotuberous ligament"],
    [53.3, 75.8, "coccyx"],
    [68.4, 31.6, "ilioinguinal nerve"],
  ],
  40: [
    [56.3, 25.5, "rectus abdominis"],
    [67.1, 39.0, "external iliac vein"],
    [53.2, 88, "sciatic nerve"],
    [81.8, 56.5, "piriformis"],
    [69.4, 35.9, "external iliac artery"],
  ],
  41: [
    [84.9, 54.2, "gluteus medius"],
    [84.9, 67.8, "gluteus maximus"],
    [78.9, 38.8, "rectus femoris"],
    [66.9, 67.2, "sacrospinous ligament"],
  ],
  42: [
    [71.8, 34.4, "femoral nerve"],
    [82.1, 43.6, "gluteus minimus"],
    [77.5, 31.4, "sartorius"],
    [67.2, 71.6, "sacrotuberous ligament"],
    [72.3, 41.4, "iliopsoas"],
    [79.7, 55.2, "superior gemellus"],
    [69.9, 35.9, "common femoral artery"],
  ],
  43: [
    [64.1, 47.5, "obturator nerve"],
    [85.3, 54.6, "gluteus medius"],
    [84.5, 32.7, "tensor fascia lata"],
    [67.4, 68.1, "pudendal neurovascular bundle"],
    [56.0, 27.6, "rectus abdominis"],
    [67.4, 38.4, "external iliac vein"],
  ],
  44: [
    [76.4, 63.2, "sciatic nerve"],
    [84.4, 68.5, "gluteus maximus"],
    [73.8, 49.7, "femoral head"],
    [68.3, 70.6, "sacrotuberous ligament"],
    [67.4, 38.0, "common femoral vein"],
  ],
  45: [
    [84.9, 56.1, "gluteus medius"],
    [76.7, 30.8, "sartorius"],
    [79.7, 37.5, "rectus femoris"],
    [75.7, 61.7, "obturator internus"],
    [71.9, 42.4, "iliopsoas"],
    [41.8, 88.5, "sciatic nerve"],
    [81.5, 54.2, "obturator internus"],
    [69.9, 35.3, "common femoral artery"],
  ],
  46: [
    [72.3, 35.1, "femoral nerve"],
    [85.2, 33.3, "tensor fascia lata"],
    [68.7, 70.4, "sacrotuberous ligament"],
    [65.8, 66.0, "pudendal neurovascular bundle"],
    [52.1, 46.0, "urinary bladder"],
    [52.9, 61.5, "rectum"],
    [78.9, 57.8, "inferior gemellus"],
  ],
  47: [
    [64.1, 46.6, "obturator nerve"],
    [83.7, 44.1, "gluteus minimus"],
    [86.8, 53.9, "gluteus medius"],
    [83.6, 69.3, "gluteus maximus"],
    [70.7, 67.8, "obturator internus"],
    [56.3, 31.2, "rectus abdominis"],
    [67.4, 37.9, "common femoral vein"],
    [63.2, 55.2, "obturator internus"],
  ],
  48: [
    [79.9, 37.1, "rectus femoris"],
    [86.0, 33.7, "tensor fascia lata"],
    [78.6, 49.5, "femoral neck"],
    [69.1, 69.9, "sacrotuberous ligament"],
    [65.3, 63.8, "pudendal neurovascular bundle"],
    [63.7, 56.1, "obturator internus"],
    [70.2, 36, "common femoral artery"],
  ],
  49: [
    [78.2, 63.4, "sciatic nerve"],
    [63.8, 44.8, "obturator nerve"],
    [85.0, 46.4, "gluteus minimus"],
    [72.5, 45.9, "iliopsoas"],
    [52.5, 33.5, "rectus abdominis"],
  ],
  50: [
    [74.9, 31.0, "sartorius"],
    [85.3, 52.9, "femoral greater trochanter"],
    [69.6, 70.4, "sacrotuberous ligament"],
    [64.0, 62.4, "pudendal neurovascular bundle"],
    [65.0, 64.0, "Alcock's canal"],
    [64.3, 56.5, "obturator internus"],
    [67.2, 38.0, "common femoral vein"],
    [48, 88.7, "sciatic nerve"],
  ],
  51: [
    [63.5, 44.1, "obturator nerve"],
    [85.7, 47.8, "gluteus minimus"],
    [84.7, 69.5, "gluteus maximus"],
    [70.6, 62.6, "ischial tuberosity"],
    [74.9, 63.0, "semimembranosus"],
    [63.4, 60.5, "pudendal neurovascular bundle"],
    [77.6, 59.8, "quadratus femoris"],
    [73.8, 48.3, "iliopsoas"],
    [51.0, 36.7, "midline aponeurotic plate"],
    [67.4, 38.4, "common femoral vein"],
    [65.6, 36.5, "great saphenous vein"],
  ],
  52: [
    [72.7, 36.6, "femoral nerve"],
    [78.6, 35.2, "rectus femoris"],
    [85.8, 33.9, "tensor fascia lata"],
    [73.6, 67.6, "conjoined hamstring tendon"],
    [64.0, 58.0, "obturator internus"],
    [51.8, 52.9, "urethra"],
    [51.7, 57.9, "vagina"],
    [51.0, 40.0, "pubic symphysis"],
    [56.6, 38.4, "adductor tubercle"],
    [64.6, 41.7, "pectineus"],
    [64.5, 52.0, "obturator externus"],
    [74.0, 50.8, "iliopsoas"],
  ],
  53: [
    [80.6, 63.2, "sciatic nerve"],
    [86.1, 47.4, "gluteus minimus"],
    [75.6, 62.8, "semimembranosus"],
    [76.4, 59.0, "quadratus femoris"],
    [67.9, 39.8, "common femoral vein"],
  ],
  54: [
    [87.1, 70.0, "gluteus maximus"],
    [86.5, 34.4, "tensor fascia lata"],
    [65.9, 43.2, "pectineus"],
    [74.3, 52.3, "iliopsoas"],
    [68.7, 39.8, "common femoral vein"],
    [48.8, 89.6, "sciatic nerve"],
  ],
  55: [
    [65.0, 35.8, "great saphenous vein"],
    [69.4, 36.8, "superficial femoral artery"],
    [70.6, 39.8, "profunda femoral artery"],
  ],
  56: [
    [72.8, 32.1, "sartorius"],
    [78.0, 36.3, "rectus femoris"],
    [76.8, 59.2, "quadratus femoris"],
    [59.0, 43.4, "adductor longus"],
    [74.3, 53.3, "iliopsoas"],
    [62.6, 49, "adductor brevis"],
  ],
  57: [
    [85.8, 69.9, "gluteus maximus"],
    [65.6, 36.1, "great saphenous vein"],
    [68.8, 40.1, "common femoral vein"],
  ],
  58: [
    [80.8, 62.6, "sciatic nerve"],
    [86.6, 35.2, "tensor fascia lata"],
    [76.0, 60.1, "quadratus femoris"],
    [61.9, 44.7, "adductor longus"],
    [74.0, 53.5, "iliopsoas"],
    [64.6, 49.3, "adductor brevis"],
  ],
  59: [
    [77.0, 35.2, "rectus femoris"],
    [75.6, 63.0, "semimembranosus"],
    [76.2, 55.6, "femoral lesser trochanter"],
    [69.1, 36.8, "superficial femoral artery"],
    [71.1, 41.3, "profunda femoral artery"],
  ],
  60: [
    [87.4, 68.3, "gluteus maximus"],
    [76.2, 60.5, "quadratus femoris"],
  ],
  61: [
    [70.9, 32.7, "sartorius"],
    [76.2, 60.5, "quadratus femoris"],
    [71.5, 64.1, "adductor magnus"],
    [68.7, 41.1, "superficial femoral vein"],
    [48.8, 89.8, "sciatic nerve"],
  ],
  62: [
    [75.9, 35.4, "rectus femoris"],
    [86.5, 37.1, "tensor fascia lata"],
    [73.5, 67.6, "semitendinosus"],
    [69.1, 37.3, "superficial femoral artery"],
  ],
  63: [
    [58.2, 52.3, "gracilis"],
    [77.2, 65.5, "biceps femoris, long head"],
    [71.4, 64.1, "adductor magnus"],
    [64.0, 37.9, "great saphenous vein"],
    [68.5, 40.7, "superficial femoral vein"],
    [69.5, 43.4, "deep femoral vein"],
    [70.9, 43.6, "profunda femoral artery"],
  ],
  64: [
    [86.6, 69.9, "gluteus maximus"],
    [87.4, 35.8, "tensor fascia lata"],
    [75.6, 63.8, "semimembranosus"],
  ],
  65: [
    [80.5, 62.8, "sciatic nerve"],
    [58.2, 52.9, "gracilis"],
    [75.2, 35.8, "rectus femoris"],
    [68.4, 38.2, "superficial femoral artery"],
  ],
  66: [
    [51.5, 88.4, "sciatic nerve"],
    [70.6, 45.7, "profunda femoral artery"],
  ],
  67: [
    [86.9, 67.6, "gluteus maximus"],
    [68.8, 34.4, "sartorius"],
    [75.6, 63.0, "semimembranosus"],
  ],
  68: [
    [74.8, 35.0, "rectus femoris"],
    [86.9, 35.6, "tensor fascia lata"],
    [72.5, 64.3, "adductor magnus"],
  ],
  69: [
    [58.6, 55.0, "gracilis"],
    [69.5, 45.1, "deep femoral vein"],
    [68.5, 41.5, "superficial femoral vein"],
  ],
  70: [
    [67.9, 34.4, "sartorius"],
    [78.9, 64.7, "biceps femoris, long head"],
    [60.6, 39.6, "great saphenous vein"],
    [57.7, 53.1, "gracilis muscle"],
    [71.1, 46.6, "profunda femoral artery"],
  ],
  71: [
    [85.0, 66.4, "gluteus maximus"],
    [86.9, 34.2, "tensor fascia lata"],
    [76.7, 68.7, "semitendinosus"],
    [66.4, 39.5, "superficial femoral artery"],
  ],
  72: [
    [74.9, 35.2, "rectus femoris"],
    [59.7, 40.3, "great saphenous vein"],
  ],
  73: [
    [66.6, 35.8, "sartorius"],
    [75.2, 63.2, "semimembranosus"],
  ],
  74: [
    [57.4, 54.2, "gracilis"],
    [87.1, 34.4, "tensor fascia lata"],
    [76.2, 68.5, "semitendinosus"],
  ],
  75: [
    [87.3, 65.5, "gluteus maximus"],
    [72.7, 34.4, "rectus femoris"],
    [67.7, 43.2, "superficial femoral vein"],
    [70.4, 47.6, "deep femoral vein"],
    [65.2, 40.4, "superficial femoral artery"],
    [71.2, 48.6, "profunda femoral artery"],
  ],
  76: [
    [75.1, 63.2, "semimembranosus"],
    [58.4, 41.5, "great saphenous vein"],
  ],
  77: [
    [80.8, 63.2, "sciatic nerve"],
    [79.4, 65.1, "biceps femoris, long head"],
    [76.0, 68.3, "semitendinosus"],
  ],
  78: [
    [57.6, 55.6, "gracilis"],
    [74.4, 43.2, "vastus intermedius"],
  ],
  79: [
    [86.8, 64.9, "gluteus maximus"],
    [72.8, 35.2, "rectus femoris"],
  ],
  80: [
    [74.3, 63.6, "semimembranosus"],
  ],
  81: [
    [63.8, 37.7, "sartorius"],
    [74.6, 67.6, "semitendinosus"],
    [73.1, 42.8, "vastus intermedius"],
    [71.5, 50.4, "profunda femoral artery"],
  ],
  82: [
    [57.1, 58.0, "gracilis"],
    [81.2, 65.3, "biceps femoris, long head"],
    [65.8, 44.5, "superficial femoral vein"],
    [70.6, 50.8, "deep femoral vein"],
  ],
  83: [
    [86.8, 63.2, "gluteus maximus"],
    [72.3, 35.0, "rectus femoris"],
    [73.8, 63.6, "semimembranosus"],
  ],
  84: [
    [62.9, 38.6, "sartorius"],
  ],
  86: [
    [80.0, 61.6, "sciatic nerve"],
    [56.8, 58.4, "gracilis"],
    [71.5, 35.8, "rectus femoris"],
    [81.7, 64.7, "biceps femoris, long head"],
    [74.4, 67.4, "semitendinosus"],
  ],
  87: [
    [65.1, 45.3, "superficial femoral vein"],
    [70.7, 52.3, "deep femoral vein"],
    [72.3, 51.7, "profunda femoral artery"],
  ],
  88: [
    [62.1, 39.6, "sartorius"],
  ],
  89: [
    [86.3, 62.8, "gluteus maximus"],
    [73.6, 63.0, "semimembranosus"],
    [71.7, 51.7, "profunda femoral artery"],
  ],
  90: [
    [56.9, 60.1, "gracilis"],
  ],
  91: [
    [81.8, 64.7, "biceps femoris, long head"],
    [76.5, 48.9, "femoral diaphysis"],
  ],
  92: [
    [85.8, 61.5, "gluteus maximus"],
    [71.4, 36.3, "rectus femoris"],
    [73.6, 68.9, "semitendinosus"],
  ],
  93: [
    [61.4, 41.7, "sartorius"],
  ],
  94: [
    [70.1, 36.5, "rectus femoris"],
  ],
  96: [
    [60.5, 43.4, "sartorius"],
    [62.9, 44.7, "Hunter's Canal / Adductor Canal"],
  ],
  97: [
    [74.0, 67.8, "semitendinosus"],
  ],
  98: [
    [72.7, 63.4, "semimembranosus"],
    [72.8, 67.2, "semitendinosus"],
  ],
  99: [
    [69.8, 36.5, "rectus femoris"],
    [62.2, 48.6, "superficial femoral artery"],
  ],
  100: [
    [60.0, 46.6, "sartorius"],
    [73.6, 67.0, "semitendinosus"],
  ],
};
const SHOULDER_LABELS = {
  1: [
    [35.3, 28.9, "pec major"],
    [54.6, 31.6, "pec major"],
    [59.7, 35, "pec major"],
    [13.2, 38.7, "pec minor"],
    [57.5, 14.6, "cephalic vein"],
    [79.2, 34.4, "deltoid, lateral"],
    [90.2, 62.9, "deltoid, posterior"],
    [52.2, 37.2, "short head biceps"],
    [44.7, 36.3, "coracobrachialis"],
    [65.3, 71.7, "triceps"],
    [52, 59.5, "teres major"],
    [53.9, 49.4, "latissimus dorsi"],
    [63.6, 45.1, "humeral diaphysis"],
  ],
  2: [
    [49.7, 31.4, "pec major"],
    [15.2, 23.3, "pec major"],
    [58.8, 35.3, "pec major"],
    [76.8, 34.1, "deltoid, lateral"],
  ],
  3: [
    [24.2, 34.1, "pec major"],
    [24.7, 17, "pec major"],
    [12, 38, "pec minor"],
    [54.2, 13.3, "cephalic vein"],
  ],
  4: [
    [56.1, 32.9, "pec major"],
    [78.6, 32.9, "deltoid, lateral"],
    [56.6, 65.3, "long head of the triceps"],
  ],
  5: [
    [54.4, 32.8, "pec major"],
    [20.5, 21.1, "pec major"],
    [63.7, 18.9, "deltoid, anterior"],
    [55.8, 57.3, "axillary nerve"],
    [56.4, 55.6, "axillary artery and vein"],
    [54.1, 58.7, "quadrilateral space"],
  ],
  6: [
    [12, 38.2, "pec minor"],
    [49.3, 13.3, "cephalic vein"],
    [88.8, 61.1, "deltoid, posterior"],
    [59.3, 34.8, "long head of the biceps tendon"],
  ],
  7: [
    [46.6, 33.9, "coracobrachialis"],
    [50.8, 34.4, "short head of the biceps"],
    [59.2, 34.1, "long head of the biceps"],
    [55.4, 63.3, "long head of the triceps"],
  ],
  8: [
    [12.2, 39.9, "pec minor"],
    [44.7, 13.9, "cephalic vein"],
    [81.2, 35, "deltoid, lateral"],
    [60.5, 34.1, "long head of the biceps tendon"],
    [60.8, 75.3, "teres minor"],
  ],
  9: [
    [61.7, 72.4, "teres minor"],
    [53.9, 53.9, "axillary pouch"],
  ],
  10: [
    [9.5, 40, "pec minor"],
    [60.7, 20.2, "deltoid, anterior"],
    [86.1, 63.1, "deltoid, posterior"],
    [60.7, 33.1, "long head of the biceps tendon, vertical part"],
    [64.9, 69, "teres minor"],
    [52.9, 55.5, "labrum, inferior"],
  ],
  11: [
    [38.8, 16.6, "cephalic vein"],
    [81.2, 34.8, "deltoid, lateral"],
    [48.3, 77.2, "infraspinatus"],
    [69.3, 63.3, "teres minor"],
    [56.8, 62.2, "labrum, posterior inferior"],
    [48, 49.2, "labrum, anterior inferior"],
  ],
  12: [
    [13.6, 41.2, "pec minor"],
    [61.5, 32.4, "long head of the biceps tendon, vertical part"],
    [48, 31.1, "conjoined tendon"],
    [49, 39.2, "subscapularis"],
    [34.7, 51.2, "subscapularis"],
    [75.1, 56.8, "teres minor"],
    [56.4, 62.2, "labrum, posterior inferior"],
    [47.5, 48.5, "labrum, anterior inferior"],
    [47.8, 43.1, "interior glenohumeral ligament, anterior band"],
  ],
  13: [
    [18.3, 39.2, "pec minor"],
    [34.6, 19.9, "cephalic vein"],
    [57.3, 22.2, "deltoid, anterior"],
    [85.9, 61.4, "deltoid, posterior"],
    [62.9, 34.3, "biceps groove"],
    [56.6, 33.1, "lesser tuberosity"],
    [61.4, 48.2, "humeral head"],
    [46.4, 58.7, "glenoid"],
    [42.2, 61.7, "glenoid neck"],
    [48.6, 36.8, "subscapularis"],
    [38, 45.6, "subscapularis"],
    [33.7, 53.1, "subscapularis"],
    [52.7, 75.3, "infraspinatus"],
    [56.3, 62.8, "labrum, posterior inferior"],
    [46.8, 48.9, "labrum, anterior inferior"],
    [49.3, 55.6, "cartilage"],
    [46.9, 41.9, "middle glenohumeral ligament"],
  ],
  14: [
    [33.2, 37, "pec minor"],
    [83.7, 37.7, "deltoid, lateral"],
    [47.8, 65.1, "suprascapular nerve"],
    [62.4, 31.9, "long head of the biceps tendon, vertical part"],
    [51.2, 34.3, "subscapularis"],
    [41.4, 44.8, "subscapularis"],
    [27.5, 58, "subscapularis"],
    [58.5, 71.9, "infraspinatus"],
    [46.6, 49.2, "labrum, anterior"],
    [55.3, 61.7, "labrum, posterior"],
  ],
  15: [
    [26.4, 25.6, "cephalic vein"],
    [47.6, 65.6, "spinoglenoid notch"],
    [40.7, 36.1, "coracoid process"],
    [68.1, 65, "infraspinatus"],
    [59.2, 71.4, "infraspinatus"],
    [78.6, 51.2, "infraspinatus"],
    [46.4, 47.5, "labrum, anterior superior"],
    [55.1, 61.4, "labrum, posterior superior"],
    [47.3, 42.6, "middle glenohumeral ligament"],
  ],
  16: [
    [52.4, 25.5, "deltoid, anterior"],
    [81.7, 62.1, "deltoid, posterior"],
    [43.7, 63.1, "suprascapular nerve"],
    [60.2, 31.6, "long head of the biceps tendon, vertical part"],
    [71.4, 34.4, "greater tuberosity"],
    [77.8, 53.4, "infraspinatus"],
    [67.5, 65, "infraspinatus"],
    [58, 71.6, "infraspinatus"],
    [46.8, 47.3, "labrum, anterior superior"],
    [53.2, 60.4, "labrum, posterior superior"],
  ],
  17: [
    [79.2, 33.6, "deltoid, lateral"],
    [79.3, 65, "deltoid, posterior"],
    [33.6, 57.5, "suprascapular nerve"],
    [30.5, 56.3, "suprascapular notch"],
    [56.6, 35.3, "long head of the biceps tendon, horizontal part"],
    [71, 33.4, "supraspinatus"],
    [75.6, 42.4, "infraspinatus"],
    [46.9, 47.3, "labrum, anterior superior"],
    [52.7, 56.7, "labrum, posterior superior"],
    [45.4, 42.8, "superior glenohumeral ligament"],
  ],
  18: [
    [48, 74.8, "scapular spine"],
    [38.8, 80.2, "scapular spine"],
    [26.1, 56.3, "suprascapular nerve"],
    [28.5, 54.5, "suprascapular artery and vein"],
    [54.7, 43.6, "long head of the biceps tendon, horizontal part"],
    [68.1, 36.3, "supraspinatus"],
    [34.4, 45.6, "coracoclavicular ligament complex"],
    [51.2, 50.7, "biceps labral anchor complex"],
  ],
  19: [
    [51, 29.7, "deltoid, anterior"],
    [23.2, 53.6, "suprascapular nerve"],
    [47.3, 55.5, "supraspinatus"],
    [34.6, 47, "coracoclavicular ligament complex"],
  ],
  20: [
    [75.3, 38.9, "deltoid, lateral"],
    [54.2, 50.6, "supraspinatus"],
    [42, 61.9, "supraspinatus"],
    [34.1, 48.9, "coracoclavicular ligament complex"],
  ],
  21: [
    [26.1, 43.8, "clavicle"],
    [59, 49, "acromioclavicular joint"],
    [67.6, 47.8, "acromion"],
    [36.4, 67.8, "supraspinatus"],
    [49.7, 56.1, "supraspinatus"],
    [66.6, 58.3, "physis scar"],
  ],
  22: [
    [20, 89.5, "trapezius"],
  ],
  26: [
    [16.3, 83.1, "trapezius"],
  ],
};

const SAG_SHOULDER_LABELS = {
  1: [
    [48.2, 7.5, "trapezius"],
    [49.7, 25.6, "supraspinatus"],
    [67.4, 49, "infraspinatus"],
    [76.4, 38.3, "deltoid, posterior"],
    [40.6, 47, "subscapularis"],
  ],
  3: [
    [50.4, 27.5, "supraspinatus"],
    [68.1, 46.1, "infraspinatus"],
    [70.3, 67.3, "teres minor"],
    [78.7, 40, "deltoid, posterior"],
    [38.6, 48, "subscapularis"],
    [61.6, 83.3, "teres major"],
    [15, 64.5, "pec minor"],
  ],
  4: [
    [70.8, 66.5, "teres minor"],
  ],
  5: [
    [46.9, 10, "trapezius"],
    [36.5, 47.3, "subscapularis"],
    [65, 82.3, "teres major"],
    [21.9, 63.8, "pec minor"],
  ],
  6: [
    [66.9, 43.4, "infraspinatus"],
    [80.6, 38.3, "deltoid, posterior"],
  ],
  7: [
    [49.2, 26.6, "supraspinatus"],
    [20.6, 21.9, "deltoid, anterior"],
    [3.8, 35, "pec major"],
    [35.5, 48, "subscapularis"],
    [33.8, 24.8, "coracoclavicular ligament complex"],
    [24.1, 55.8, "pec minor"],
  ],
  8: [
    [50.8, 11.2, "trapezius"],
    [72, 59.7, "teres minor"],
    [19.2, 25.3, "deltoid, anterior"],
    [56, 90.9, "latissimus dorsi, tendon"],
    [57.2, 76.1, "teres major"],
    [65, 26.6, "scapular spine"],
    [32.8, 25.3, "coracoclavicular ligament complex"],
    [38.9, 18.5, "clavicle"],
  ],
  9: [
    [66.7, 40.5, "infraspinatus"],
    [84.7, 41.9, "deltoid, posterior"],
    [6, 50.6, "pec major"],
    [35.8, 45, "subscapularis"],
    [49.1, 83.9, "latissimus dorsi, tendon"],
    [57.9, 63.9, "long head of the triceps"],
    [34.5, 23.8, "coracoclavicular ligament complex"],
    [24.5, 50.6, "pec minor"],
  ],
  10: [
    [69.9, 57, "teres minor"],
    [33.3, 29.5, "coracoacromial ligament"],
    [58.9, 69.2, "long head of the triceps"],
    [50.8, 44.1, "glenoid"],
    [55.2, 56.1, "infraglenoid tubercle"],
    [45.3, 31.9, "superior labrum"],
    [41.6, 47.2, "anterior labrum"],
    [58.4, 43.3, "posterior labrum"],
    [41.1, 40, "anterior superior labrum"],
    [54.3, 36.8, "posterior superior labrum"],
    [47.2, 55.6, "anterior inferior labrum"],
    [58.7, 50.9, "posterior inferior labrum"],
  ],
  11: [
    [48.7, 26.5, "supraspinatus"],
    [16.7, 29.7, "deltoid, anterior"],
    [12.1, 61.2, "pec major"],
    [34.7, 28.5, "coracoacromial ligament"],
    [34.5, 30.9, "coracohumeral ligament"],
    [34.7, 43.3, "subscapularis"],
    [45, 74.5, "latissimus dorsi, tendon"],
    [76.2, 87.2, "triceps"],
    [54, 67.3, "axillary neurovascular bundle"],
  ],
  12: [
    [66.4, 37.8, "infraspinatus"],
    [69.1, 53.6, "teres minor"],
    [87.9, 45.8, "deltoid, posterior"],
    [10.8, 60.9, "pec major"],
    [27.2, 78.2, "pec major"],
    [38, 25.6, "coracoacromial ligament"],
    [36.4, 29.9, "coracohumeral ligament"],
  ],
  13: [
    [38.7, 29.2, "coracohumeral ligament"],
    [34.7, 39.2, "subscapularis"],
    [43.1, 68.2, "latissimus dorsi, tendon"],
    [52.5, 19.9, "AC joint"],
  ],
  14: [
    [49.2, 25.5, "supraspinatus"],
    [63.8, 31.2, "infraspinatus"],
    [67.2, 51.6, "teres minor"],
    [29.6, 82.6, "pec major"],
    [41.1, 24.3, "coracoacromial ligament"],
    [39.1, 28.5, "coracohumeral ligament"],
    [41.1, 29.9, "long head of the biceps"],
    [34, 39.4, "subscapularis"],
  ],
  15: [
    [15.8, 42.8, "deltoid, anterior"],
    [44, 22.9, "coracoacromial ligament"],
    [39.6, 31.2, "long head of the biceps"],
    [50.4, 34.8, "humeral head"],
    [34, 38.2, "subscapularis"],
  ],
  16: [
    [50.1, 25.8, "supraspinatus"],
    [66.5, 48.2, "teres minor"],
    [38.6, 31.7, "long head of the biceps"],
    [37.5, 70.9, "long head of the biceps"],
    [48.4, 53.3, "surgical neck, of the humerus"],
    [36.5, 40, "lesser tuberosity"],
  ],
  17: [
    [59.7, 28.9, "infraspinatus"],
    [85.7, 53.6, "deltoid, posterior"],
    [22.1, 47.2, "deltoid, anterior"],
    [50.9, 21.6, "acromion"],
    [38, 55.1, "long head of the biceps"],
    [35.5, 37.3, "subscapularis"],
  ],
  18: [
    [50.1, 26.8, "supraspinatus"],
    [38.7, 37.8, "long head of the biceps"],
  ],
  19: [
    [47.4, 28.9, "supraspinatus"],
    [56.5, 30, "infraspinatus"],
    [63.1, 44.8, "teres minor"],
    [45.5, 32.4, "superior facet, greater tuberosity"],
  ],
  20: [
    [46.7, 30.7, "supraspinatus"],
    [56.7, 34.3, "infraspinatus"],
    [79.6, 58.5, "deltoid, posterior"],
    [55.2, 35.8, "middle facet, greater tuberosity"],
    [59.9, 43.3, "inferior facet, greater tuberosity"],
  ],
  21: [
    [54.8, 34.8, "infraspinatus"],
    [36.2, 53.8, "deltoid, lateral"],
  ],
  22: [
    [56, 52.2, "deltoid, lateral"],
  ],
};

const COR_SHOULDER_LABELS = {
  1: [
    [20.4, 25, "suprascapular neurovascular bundle"],
  ],
  3: [
    [31.1, 20.5, "clavicle"],
    [23, 27.7, "suprascapular neurovascular bundle"],
    [60.9, 33.9, "deltoid, anterior"],
  ],
  4: [
    [24.3, 28.9, "suprascapular neurovascular bundle"],
  ],
  5: [
    [31.4, 27, "coracoclavicular ligament complex"],
    [29.2, 52.2, "subscapularis"],
    [68.1, 39, "deltoid, anterior"],
  ],
  6: [
    [32.1, 25.8, "coracoclavicular ligament complex"],
    [26.2, 32.8, "suprascapular neurovascular bundle"],
    [44.8, 46.1, "subscapularis"],
    [23, 53.1, "subscapularis"],
  ],
  7: [
    [38, 18.9, "clavicle"],
    [67.7, 42.2, "long head of the biceps"],
    [64.5, 64.5, "long head of the biceps"],
    [59.4, 32.2, "long head of the biceps"],
    [65.5, 50.7, "biceps groove"],
    [75.3, 39.9, "deltoid, anterior"],
  ],
  8: [
    [44.7, 42.6, "anterior labrum"],
    [47, 34.4, "anterior superior labrum"],
    [45.2, 49.7, "anterior inferior labrum"],
    [30.1, 35.1, "suprascapular neurovascular bundle"],
    [29.2, 33.1, "suprascapular notch"],
    [62.3, 31.6, "long head of the biceps"],
  ],
  9: [
    [45.7, 32.1, "superior labrum"],
    [68.1, 30.7, "supraspinatus"],
    [60.9, 27.2, "supraspinatus"],
    [29.6, 23.1, "supraspinatus"],
    [52.5, 29.9, "long head of the biceps"],
    [78.1, 42.4, "deltoid, lateral"],
  ],
  10: [
    [60.9, 38.3, "humeral head"],
    [41.9, 43.3, "glenoid cartilage"],
    [43.6, 33.4, "superior labrum"],
    [45.5, 55.3, "inferior labrum"],
    [31.3, 37.3, "suprascapular neurovascular bundle"],
    [38.9, 74.8, "teres major"],
    [69.1, 32.4, "superior facet of greater tuberosity"],
  ],
  11: [
    [60.1, 57.8, "surgical neck of the humerus"],
    [37.9, 44.4, "glenoid"],
    [54.7, 20, "AC joint"],
    [45.2, 55.8, "inferior labrum"],
    [43.3, 38.7, "humeral head cartilage"],
    [54.2, 27.8, "humeral head cartilage"],
    [33.6, 24.6, "supraspinatus"],
    [54.2, 26, "supraspinatus"],
    [63.5, 26.6, "supraspinatus"],
    [68.6, 29.5, "supraspinatus"],
    [80.4, 55.1, "deltoid, lateral"],
    [35, 47.8, "glenoid neck"],
    [31.8, 41.1, "spinoglenoid notch"],
    [46, 67.8, "axillary neurovascular bundle"],
    [45.3, 66.7, "quadrilateral space"],
    [68.1, 26.8, "subacromial/subdeltoid bursa"],
  ],
  12: [
    [47.4, 61.6, "inferior joint capsule"],
    [42.1, 36, "posterior superior labrum"],
    [32.6, 38.9, "suprascapular neurovascular bundle"],
    [40.6, 78.5, "teres major"],
    [67.9, 26, "subacromial/subdeltoid bursa"],
  ],
  13: [
    [44.8, 54.5, "posterior inferior labrum"],
    [41.8, 37, "posterior superior labrum"],
    [48.6, 69.9, "axillary neurovascular bundle"],
    [71.3, 31.4, "infraspinatus"],
    [71.4, 34.4, "middle facet of greater tuberosity"],
  ],
  14: [
    [41.9, 43.4, "posterior labrum"],
    [71.3, 33.1, "infraspinatus"],
  ],
  15: [
    [48.9, 71.6, "axillary neurovascular bundle"],
    [69.1, 33.1, "infraspinatus"],
  ],
  16: [
    [30.3, 27.5, "scapular spine"],
    [67.9, 48.7, "teres minor"],
    [64.8, 33.9, "infraspinatus"],
    [26.9, 45, "infraspinatus"],
    [27.5, 84.6, "teres major"],
  ],
  17: [
    [77, 38.7, "deltoid, posterior"],
    [46, 55.8, "teres minor"],
    [58.1, 51.4, "teres minor"],
    [48.2, 41.1, "infraspinatus"],
    [27, 45.1, "infraspinatus"],
    [57.7, 37.2, "infraspinatus"],
    [45.5, 82.4, "triceps"],
  ],
  18: [
    [48.6, 55.3, "teres minor"],
    [21.1, 48.3, "infraspinatus"],
    [43.1, 42.4, "infraspinatus"],
  ],
  19: [
    [35.8, 62.6, "teres minor"],
    [45.8, 86, "triceps"],
  ],
  20: [
    [66.4, 45.5, "deltoid, posterior"],
  ],
  21: [
    [43.6, 83.4, "triceps"],
    [64, 46.3, "deltoid, posterior"],
  ],
  22: [
    [59.9, 52.4, "deltoid, posterior"],
  ],
};

const COR_ELBOW_LABELS = {
  112: [
    [46.8, 47.5, "biceps tendon"],
  ],
  113: [
    [50.2, 62.1, "biceps tendon"],
    [40.8, 18.3, "biceps"],
    [36.8, 56, "radial nerve"],
  ],
  114: [
    [35.8, 45.1, "radial nerve"],
  ],
  115: [
    [51.2, 69.4, "biceps tendon"],
    [50.8, 56.8, "brachialis tendon"],
  ],
  116: [
    [36.1, 56.8, "RCL"],
    [51.4, 71.6, "biceps tendon"],
    [52.4, 61.9, "brachialis tendon"],
  ],
  117: [
    [42.5, 63.1, "radial head"],
    [57.6, 50.6, "trochlea"],
    [43, 54.6, "capitellum"],
    [32.9, 53.4, "common extensor tendon"],
    [44.1, 59.7, "radiocapitellar cartilage"],
    [52.2, 74.5, "biceps tendon"],
    [53.6, 66.8, "brachialis tendon"],
  ],
  118: [
    [67.1, 51.9, "UCL, anterior bundle"],
    [33.2, 54.8, "common extensor tendon"],
    [67.6, 48, "pronator teres"],
    [58.6, 55.3, "ulnohumeral compartment cartilage"],
    [52.2, 75.5, "biceps tendon"],
    [54.7, 68.4, "brachialis tendon"],
  ],
  119: [
    [44.9, 69.5, "radial neck"],
    [66.8, 52.9, "UCL, anterior bundle"],
    [65.4, 57.7, "sublime tubercle"],
    [31.4, 55.1, "common extensor tendon"],
    [69.7, 43.3, "flexor/pronator tendon"],
    [34.2, 49.5, "lateral humeral epicondyle"],
    [50.3, 79.9, "radial tuberosity"],
    [52.9, 77, "biceps tendon"],
    [54.9, 70.7, "brachialis tendon"],
    [51, 62.4, "proximal radioulnar joint"],
  ],
  120: [
    [71.4, 43.1, "flexor/pronator tendon"],
    [67.6, 51.4, "UCL"],
    [35.1, 59.5, "LUCL"],
    [38.6, 9.4, "humeral diaphysis"],
    [46.8, 27.7, "supracondylar humerus"],
    [67.1, 40.7, "medial humeral epicondyle"],
    [56.1, 74.1, "brachialis tendon"],
  ],
  121: [
    [66.4, 50.6, "UCL, posterior bundle"],
    [85.6, 40.7, "flexor/pronator tendon"],
    [38.1, 65.3, "LUCL"],
  ],
  122: [
    [51.5, 12.9, "triceps"],
    [64.9, 63.3, "ulnar nerve"],
    [66.8, 49, "ulnar nerve"],
    [43.2, 67.7, "LUCL"],
  ],
  123: [
    [53.9, 43.4, "olecranon"],
    [53.4, 30.4, "triceps"],
    [63.9, 46.8, "ulnar nerve"],
    [62.2, 32.8, "ulnar nerve"],
  ],
  124: [
    [53.7, 32.2, "triceps"],
    [51.9, 71.7, "ulna"],
  ],
};

const AX_T1_ELBOW_LABELS = {
  128: [
    [61.2, 46.3, "median nerve"],
    [68.1, 59.5, "ulnar nerve"],
    [60.7, 68, "triceps"],
    [49, 35, "biceps"],
  ],
  130: [
    [62, 45.6, "median nerve"],
    [49.5, 33.9, "biceps"],
  ],
  131: [
    [69.5, 60.2, "ulnar nerve"],
    [40.3, 37.8, "musculocutaneous nerve"],
  ],
  132: [
    [62.5, 69.7, "triceps"],
    [41.4, 46, "brachialis"],
    [51.7, 33.6, "biceps"],
  ],
  133: [
    [38.5, 51.1, "radial nerve"],
    [63.6, 42.8, "median nerve"],
    [71.5, 60.9, "ulnar nerve"],
    [51.2, 57.2, "humerus"],
    [49.2, 32.6, "biceps"],
    [41.9, 45.5, "brachialis"],
    [40.5, 35.8, "lateral antebrachial cutaneous nerve"],
  ],
  135: [
    [39.2, 48.5, "radial nerve"],
    [72.5, 61.7, "ulnar nerve"],
    [62.2, 69.9, "triceps"],
    [41.4, 34.6, "lateral antebrachial cutaneous nerve"],
    [59.8, 64.5, "medial head triceps"],
  ],
  136: [
    [50.7, 31.7, "biceps"],
    [45.4, 43.9, "brachialis"],
    [67.8, 65.5, "long head, triceps"],
    [51.7, 68.9, "lateral head, triceps"],
  ],
  137: [
    [39.2, 46.8, "radial nerve"],
    [41.9, 33.9, "lateral antebrachial cutaneous nerve"],
  ],
  138: [
    [64.2, 37.5, "median nerve"],
    [72.9, 63.4, "ulnar nerve"],
    [61.2, 69.5, "triceps"],
    [60, 57.7, "posterior fat pad"],
    [56.8, 48.7, "anterior fat pad"],
  ],
  139: [
    [37.5, 43.6, "radial nerve"],
    [60.7, 69.2, "triceps"],
    [51.9, 30.7, "biceps"],
    [42.4, 33.6, "lateral antebrachial cutaneous nerve"],
  ],
  140: [
    [73.9, 63.1, "ulnar nerve"],
    [77.8, 56.3, "medial humeral epicondyle"],
    [39.2, 60.7, "lateral humeral epicondyle"],
    [48.3, 40.4, "brachialis"],
    [79.7, 51.9, "pronator teres"],
  ],
  141: [
    [37.8, 38.9, "superficial branch of the radial nerve"],
    [35.9, 41.2, "deep branch of the radial nerve"],
    [65.1, 33.9, "median nerve"],
    [74.8, 63.6, "Osbourne's aponeurosis"],
    [79.8, 54.8, "common flexor tendon"],
    [29.1, 43.4, "brachioradialis"],
    [72.2, 61.9, "cubital tunnel"],
  ],
  142: [
    [59.3, 29.4, "lacertus fibrosus"],
    [77, 45.1, "pronator teres"],
    [80.5, 53.9, "common flexor tendon"],
  ],
  143: [
    [37.5, 37, "superficial branch of the radial nerve"],
    [35.6, 39.9, "deep branch of the radial nerve"],
    [74.2, 59.7, "ulnar nerve"],
    [49.7, 31.9, "biceps"],
    [33.6, 53.1, "common extensor tendon"],
    [70.7, 59.5, "UCL, posterior bundle"],
  ],
  144: [
    [61.5, 29.4, "lacertus fibrosus"],
    [51.2, 39, "brachialis"],
    [33.4, 50.4, "common extensor tendon"],
    [35.4, 49.9, "RCL"],
    [34.1, 55.8, "LUCL"],
    [73.2, 50.6, "UCL, anterior bundle"],
    [71.5, 57.8, "UCL, posterior bundle"],
    [45.4, 66.7, "anconeus"],
    [42.2, 42.6, "capitellum"],
    [62.9, 44.1, "trochlea"],
  ],
  145: [
    [63.7, 35.3, "median nerve"],
    [50.5, 39.7, "brachialis"],
    [35.4, 48.7, "RCL"],
    [72.9, 50.2, "UCL, anterior bundle"],
    [72, 57.2, "UCL, posterior bundle"],
  ],
  146: [
    [40.2, 36.8, "superficial branch of the radial nerve"],
    [36.4, 39.5, "deep branch of the radial nerve"],
    [51, 34.4, "biceps"],
    [71.2, 36.7, "pronator teres"],
    [36.1, 57.7, "LUCL"],
    [72.7, 52.2, "UCL, anterior bundle"],
    [72, 56.7, "UCL, posterior bundle"],
  ],
  147: [
    [63.1, 37.7, "median nerve"],
    [72.7, 60, "ulnar nerve"],
    [40, 60.2, "LUCL"],
    [50.5, 42.2, "Annular ligament"],
    [43.6, 49.2, "radial head"],
    [53.4, 51.9, "proximal radioulnar joint"],
  ],
  148: [
    [40.5, 37.2, "superficial branch of the radial nerve"],
    [37.3, 39.5, "deep branch of the radial nerve"],
    [40, 59.9, "LUCL"],
  ],
  149: [
    [70.7, 59, "ulnar nerve"],
    [51.7, 38.9, "biceps"],
    [54.4, 45.1, "brachialis"],
  ],
  150: [
    [40.2, 37.7, "superficial branch of the radial nerve"],
    [38, 41.2, "deep branch of the radial nerve"],
    [60.7, 43.4, "median nerve"],
  ],
  151: [
    [69.3, 58.3, "ulnar nerve"],
    [56.8, 48.7, "brachialis"],
  ],
  152: [
    [40.2, 38.7, "superficial branch of the radial nerve"],
    [37.3, 42.8, "deep branch of the radial nerve"],
    [52.2, 44.8, "biceps"],
  ],
  153: [
    [52.5, 48, "biceps"],
    [50.3, 52.4, "radial tuberosity"],
    [58, 53.8, "brachialis"],
  ],
  154: [
    [38.8, 37.8, "superficial branch of the radial nerve"],
    [36.8, 45.3, "deep branch of the radial nerve"],
    [58.5, 45.1, "median nerve"],
    [65.8, 56.8, "ulnar nerve"],
  ],
  156: [
    [40.2, 37.8, "superficial branch of the radial nerve"],
    [35.9, 48.2, "deep branch of the radial nerve"],
  ],
  157: [
    [39.7, 38.3, "superficial branch of the radial nerve"],
    [35.3, 49.5, "deep branch of the radial nerve"],
    [41.9, 49.2, "radius"],
    [53.1, 65, "ulna"],
    [56.4, 45, "median nerve"],
    [62.7, 55.3, "ulnar nerve"],
  ],
};

const ELBOW_LABELS = {
  79: [
    [61.2, 46.3, "median nerve"],
    [68.1, 59.5, "ulnar nerve"],
    [60.7, 68, "triceps"],
    [49, 35, "biceps"],
  ],
  81: [
    [62, 45.6, "median nerve"],
    [49.5, 33.9, "biceps"],
  ],
  82: [
    [69.5, 60.2, "ulnar nerve"],
    [40.3, 37.8, "musculocutaneous nerve"],
  ],
  83: [
    [62.5, 69.7, "triceps"],
    [41.4, 46, "brachialis"],
    [51.7, 33.6, "biceps"],
  ],
  84: [
    [38.5, 51.1, "radial nerve"],
    [63.6, 42.8, "median nerve"],
    [71.5, 60.9, "ulnar nerve"],
    [51.2, 57.2, "humerus"],
    [49.2, 32.6, "biceps"],
    [41.9, 45.5, "brachialis"],
    [40.5, 35.8, "lateral antebrachial cutaneous nerve"],
  ],
  86: [
    [39.2, 48.5, "radial nerve"],
    [72.5, 61.7, "ulnar nerve"],
    [62.2, 69.9, "triceps"],
    [41.4, 34.6, "lateral antebrachial cutaneous nerve"],
    [59.8, 64.5, "medial head triceps"],
  ],
  87: [
    [50.7, 31.7, "biceps"],
    [45.4, 43.9, "brachialis"],
    [67.8, 65.5, "long head, triceps"],
    [51.7, 68.9, "lateral head, triceps"],
  ],
  88: [
    [39.2, 46.8, "radial nerve"],
    [41.9, 33.9, "lateral antebrachial cutaneous nerve"],
  ],
  89: [
    [64.2, 37.5, "median nerve"],
    [72.9, 63.4, "ulnar nerve"],
    [61.2, 69.5, "triceps"],
    [60, 57.7, "posterior fat pad"],
    [56.8, 48.7, "anterior fat pad"],
  ],
  90: [
    [37.5, 43.6, "radial nerve"],
    [60.7, 69.2, "triceps"],
    [51.9, 30.7, "biceps"],
    [42.4, 33.6, "lateral antebrachial cutaneous nerve"],
  ],
  91: [
    [73.9, 63.1, "ulnar nerve"],
    [77.8, 56.3, "medial humeral epicondyle"],
    [39.2, 60.7, "lateral humeral epicondyle"],
    [48.3, 40.4, "brachialis"],
    [79.7, 51.9, "pronator teres"],
  ],
  92: [
    [37.8, 38.9, "superficial branch of the radial nerve"],
    [35.9, 41.2, "deep branch of the radial nerve"],
    [65.1, 33.9, "median nerve"],
    [74.8, 63.6, "Osbourne's aponeurosis"],
    [79.8, 54.8, "common flexor tendon"],
    [29.1, 43.4, "brachioradialis"],
    [72.2, 61.9, "cubital tunnel"],
  ],
  93: [
    [59.3, 29.4, "lacertus fibrosus"],
    [77, 45.1, "pronator teres"],
    [80.5, 53.9, "common flexor tendon"],
  ],
  94: [
    [37.5, 37, "superficial branch of the radial nerve"],
    [35.6, 39.9, "deep branch of the radial nerve"],
    [74.2, 59.7, "ulnar nerve"],
    [49.7, 31.9, "biceps"],
    [33.6, 53.1, "common extensor tendon"],
    [70.7, 59.5, "UCL, posterior bundle"],
  ],
  95: [
    [61.5, 29.4, "lacertus fibrosus"],
    [51.2, 39, "brachialis"],
    [33.4, 50.4, "common extensor tendon"],
    [35.4, 49.9, "RCL"],
    [34.1, 55.8, "LUCL"],
    [73.2, 50.6, "UCL, anterior bundle"],
    [71.5, 57.8, "UCL, posterior bundle"],
    [45.4, 66.7, "anconeus"],
    [42.2, 42.6, "capitellum"],
    [62.9, 44.1, "trochlea"],
  ],
  96: [
    [63.7, 35.3, "median nerve"],
    [50.5, 39.7, "brachialis"],
    [35.4, 48.7, "RCL"],
    [72.9, 50.2, "UCL, anterior bundle"],
    [72, 57.2, "UCL, posterior bundle"],
  ],
  97: [
    [40.2, 36.8, "superficial branch of the radial nerve"],
    [36.4, 39.5, "deep branch of the radial nerve"],
    [51, 34.4, "biceps"],
    [71.2, 36.7, "pronator teres"],
    [36.1, 57.7, "LUCL"],
    [72.7, 52.2, "UCL, anterior bundle"],
    [72, 56.7, "UCL, posterior bundle"],
  ],
  98: [
    [63.1, 37.7, "median nerve"],
    [72.7, 60, "ulnar nerve"],
    [40, 60.2, "LUCL"],
    [50.5, 42.2, "Annular ligament"],
    [43.6, 49.2, "radial head"],
    [53.4, 51.9, "proximal radioulnar joint"],
  ],
  99: [
    [40.5, 37.2, "superficial branch of the radial nerve"],
    [37.3, 39.5, "deep branch of the radial nerve"],
    [40, 59.9, "LUCL"],
  ],
  100: [
    [70.7, 59, "ulnar nerve"],
    [51.7, 38.9, "biceps"],
    [54.4, 45.1, "brachialis"],
  ],
  101: [
    [40.2, 37.7, "superficial branch of the radial nerve"],
    [38, 41.2, "deep branch of the radial nerve"],
    [60.7, 43.4, "median nerve"],
  ],
  102: [
    [69.3, 58.3, "ulnar nerve"],
    [56.8, 48.7, "brachialis"],
  ],
  103: [
    [40.2, 38.7, "superficial branch of the radial nerve"],
    [37.3, 42.8, "deep branch of the radial nerve"],
    [52.2, 44.8, "biceps"],
  ],
  104: [
    [52.5, 48, "biceps"],
    [50.3, 52.4, "radial tuberosity"],
    [58, 53.8, "brachialis"],
  ],
  105: [
    [38.8, 37.8, "superficial branch of the radial nerve"],
    [36.8, 45.3, "deep branch of the radial nerve"],
    [58.5, 45.1, "median nerve"],
    [65.8, 56.8, "ulnar nerve"],
  ],
  107: [
    [40.2, 37.8, "superficial branch of the radial nerve"],
    [35.9, 48.2, "deep branch of the radial nerve"],
  ],
  108: [
    [39.7, 38.3, "superficial branch of the radial nerve"],
    [35.3, 49.5, "deep branch of the radial nerve"],
    [41.9, 49.2, "radius"],
    [53.1, 65, "ulna"],
    [56.4, 45, "median nerve"],
    [62.7, 55.3, "ulnar nerve"],
  ],
};

// ─── ANATOMY ATLAS DATA (Visible Human Project + Real MRI) ───────────────────
const VHP_BASE = 'https://data.lhncbc.nlm.nih.gov/public/Visible-Human/Male-Images/PNG_format';

// Helper — generate sequential slice arrays for local MRI stacks
// folder: public subfolder, prefix: filename prefix, count: number of images, startNum: first number (default 1)
const localSlices = (count, startNum = 1) => Array.from({length: count}, (_, i) => i + startNum);

// Each joint defines: folder, slices array, view label, and label overlays per anatomy layer
const ATLAS_JOINTS = {
  shoulder: {
    label: 'Shoulder',
    region: 'Upper Extremity',
    useLocalMRI: true,
    defaultSlice: 13,
    sequences: {
      ax_pdfs: {
        label: 'Ax PDFS',
        path: '/atlas/ax-shoulder-pdfs/ax%20shoulder%20',
        slices: localSlices(26),
        ext: '.jpg',
        pad: 4,
        permanentLabels: SHOULDER_LABELS,
      },
      sag_t1: {
        label: 'Sag T1',
        path: '/atlas/sag-shoulder-t1/sag%20t1%20%20shoulder%20',
        slices: localSlices(22),
        ext: '.jpg',
        pad: 4,
        permanentLabels: SAG_SHOULDER_LABELS,
      },
      cor_pdfs: {
        label: 'Cor PDFS',
        path: '/atlas/cor-shoulder-pdfs/cor%20%20shoulder%20',
        slices: localSlices(22),
        ext: '.jpg',
        pad: 4,
        labelSide: 'right',
        permanentLabels: COR_SHOULDER_LABELS,
      },
    },
    view: 'MRI — shoulder',
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
    useLocalMRI: true,
    defaultSlice: 15,
    sequences: {
      ax_pdfs: {
        label: 'Ax PDFS',
        path: '/atlas/ax-elbow-pdfs/MRI%20KNEE%20W%20O%20CONTRAST%20RIGHT%20',
        slices: Array.from({length:30},(_,i)=>i+79),
        ext: '.jpg',
        pad: 4,
        permanentLabels: ELBOW_LABELS,
      },
      ax_t1: {
        label: 'Ax T1',
        path: '/atlas/ax-elbow-t1/MRI%20KNEE%20W%20O%20CONTRAST%20RIGHT%20',
        slices: Array.from({length:30},(_,i)=>i+128),
        ext: '.jpg',
        pad: 4,
        permanentLabels: AX_T1_ELBOW_LABELS,
      },
      cor_pdfs: {
        label: 'Cor PDFS',
        path: '/atlas/cor-elbow-pdfs/MRI%20KNEE%20W%20O%20CONTRAST%20RIGHT%20',
        slices: Array.from({length:15},(_,i)=>i+112),
        ext: '.jpg',
        pad: 4,
        permanentLabels: COR_ELBOW_LABELS,
      },
    },
    view: 'MRI — elbow',
    labels: {
      bones:    [[65,50,'Humerus','#1e3a8a'],[55,68,'Ulna','#1e3a8a'],[72,65,'Radius','#1e3a8a']],
      tendons:  [[70,40,'Biceps tendon','#14532d'],[60,60,'Triceps tendon','#14532d'],[68,70,'Common extensor t.','#14532d'],[40,70,'Common flexor t.','#14532d']],
      muscles:  [[78,50,'Brachialis','#7c2d12'],[82,40,'Brachioradialis','#7c2d12']],
      nerves:   [[72,65,'Ulnar n.','#92400e'],[68,35,'Radial n.','#92400e'],[58,45,'Median n.','#92400e']],
      arteries: [[67,52,'Brachial a.','#991b1b']],
      veins:    [[65,55,'Brachial v.','#4c1d95']],
    },
  },
  wrist: {
    label: 'Wrist',
    region: 'Upper Extremity',
    useLocalMRI: true,
    defaultSlice: 15,
    sequences: {
      ax_pdfs: {
        label: 'Ax PDFS',
        path: '/atlas/ax-wrist-pdfs/ax%20wrist%20',
        slices: localSlices(30),
        ext: '.jpg',
        pad: 4,
        permanentLabels: {
          1: [[43.3,40.9,"radius","#1e3a8a"],[66.5,46.5,"ulna","#1e3a8a"],[71.5,44,"extensor carpi ulnaris","#7c2d12"],[62,36.8,"extensor digiti minimi","#7c2d12"],[32.1,39.8,"extensor pollicis brevis","#7c2d12"],[34.8,37.7,"extensor carpi radialis longus","#7c2d12"],[39.1,35.2,"extensor carpi radialis brevis","#7c2d12"],[49.6,35.7,"extensor pollicis longus","#7c2d12"],[40.2,54.9,"flexor pollicis longus","#7c2d12"],[34.1,60.2,"flexor carpi radialis","#7c2d12"],[40,57.8,"median nerve","#92400e"],[60,62.7,"ulnar nerve","#92400e"],[62.5,65.2,"flexor carpi ulnaris","#7c2d12"],[58.2,39.1,"extensor indicis proprius","#7c2d12"],[55.7,34.4,"extensor digitorum communis","#7c2d12"],[42.4,66.1,"palmaris longus","#7c2d12"],[49.4,58.4,"FDP2","#7c2d12"],[41.8,60,"FDS3","#7c2d12"],[55.3,60.3,"FDP3","#7c2d12"],[59.8,60.2,"FDP4","#7c2d12"]],
          2: [[30.7,43.8,"abductor pollicis longus","#7c2d12"],[40.2,56,"flexor pollicis longus","#7c2d12"],[30.7,52.1,"radial artery and veins","#991b1b"],[55.5,64.5,"ulnar artery and veins","#991b1b"]],
          3: [[61.8,37,"extensor digiti minimi","#7c2d12"],[31.4,40.9,"extensor pollicis brevis","#7c2d12"],[39.5,35,"extensor carpi radialis brevis","#7c2d12"],[47.9,35.3,"extensor pollicis longus","#7c2d12"],[47.8,57.8,"FDP2","#7c2d12"],[43.8,57.8,"FDS2","#7c2d12"],[42.4,60.7,"FDS3","#7c2d12"],[54.8,60,"FDP3","#7c2d12"],[59.1,59.4,"FDP4","#7c2d12"]],
          4: [[70.2,43.1,"extensor carpi ulnaris","#7c2d12"],[35.2,36.8,"extensor carpi radialis longus","#7c2d12"],[40.2,58.9,"median nerve","#92400e"],[60.5,62.1,"ulnar nerve","#92400e"]],
          5: [[69.2,44,"ulnar groove","#1e3a8a"],[55.5,44.5,"distal radioulnar joint","#1e3a8a"],[69.9,40.6,"ECU subsheath","#14532d"],[29.2,44.9,"abductor pollicis longus","#7c2d12"],[39.3,56.2,"flexor pollicis longus","#7c2d12"],[34.6,59.1,"flexor carpi radialis","#7c2d12"],[60.3,62,"ulnar nerve","#92400e"],[61.8,64.1,"flexor carpi ulnaris","#7c2d12"],[55.7,37.7,"extensor indicis proprius","#7c2d12"],[54.4,35.2,"extensor digitorum communis","#7c2d12"],[42.5,65.2,"palmaris longus","#7c2d12"],[59.1,60.2,"FDP4","#7c2d12"]],
          6: [[54,43.4,"radial sigmoid notch","#1e3a8a"],[42.4,35.5,"Lister's tubercle","#1e3a8a"],[70.4,42.9,"extensor carpi ulnaris","#7c2d12"],[60.7,37,"extensor digiti minimi","#7c2d12"],[46.1,35,"extensor pollicis longus","#7c2d12"],[48.8,59.1,"FDP2","#7c2d12"],[44.3,58.2,"FDS2","#7c2d12"],[43.8,60.7,"FDS3","#7c2d12"],[53.9,59.4,"FDP3","#7c2d12"]],
          7: [[70.4,47.6,"ulnar styloid","#1e3a8a"],[57.1,42.7,"ulnar cartilage","#1e3a8a"],[28.7,46.9,"abductor pollicis longus","#7c2d12"],[28.1,43.4,"extensor pollicis brevis","#7c2d12"],[34.6,36.6,"extensor carpi radialis longus","#7c2d12"],[38.4,34.8,"extensor carpi radialis brevis","#7c2d12"],[40.2,56.7,"flexor pollicis longus","#7c2d12"],[41.3,60.5,"median nerve","#92400e"],[42.5,64.8,"palmaris longus","#7c2d12"]],
          8: [[69.7,43.4,"extensor carpi ulnaris","#7c2d12"],[44.3,34.6,"extensor pollicis longus","#7c2d12"],[35.5,59.4,"flexor carpi radialis","#7c2d12"],[61.4,63.6,"flexor carpi ulnaris","#7c2d12"],[53.7,36.8,"extensor digitorum communis","#7c2d12"],[61.8,42.7,"dorsal radioulnar ligament","#14532d"],[62.7,51,"volar radioulnar ligament","#14532d"],[53.7,59.3,"FDP3","#7c2d12"],[57.8,58.2,"FDP4","#7c2d12"]],
          9: [[61.2,38.4,"extensor digiti minimi","#7c2d12"],[28,48.3,"abductor pollicis longus","#7c2d12"],[59.3,62.1,"ulnar nerve","#92400e"],[43.1,64.7,"palmaris longus","#7c2d12"],[62.7,52.1,"volar radioulnar ligament","#14532d"],[60.7,44,"dorsal radioulnar ligament","#14532d"],[44.2,57.6,"FDS2","#7c2d12"]],
          10: [[26.3,45.8,"extensor pollicis brevis","#7c2d12"],[38.9,35.7,"extensor carpi radialis brevis","#7c2d12"],[40.2,56.6,"flexor pollicis longus","#7c2d12"],[44,62,"median nerve","#92400e"],[49.2,41.5,"scapholunate ligament, dorsal band","#14532d"],[45.4,52.1,"scapholunate ligament, volar band","#14532d"],[48.1,58,"FDP2","#7c2d12"],[44.7,59.8,"FDS3","#7c2d12"],[53.3,58.5,"FDP3","#7c2d12"],[57.3,57.8,"FDP4","#7c2d12"],[59.3,58.7,"FDS5","#7c2d12"]],
          11: [[69.3,45.4,"extensor carpi ulnaris","#7c2d12"],[34.6,37.7,"extensor carpi radialis longus","#7c2d12"],[42.4,33.5,"extensor pollicis longus","#7c2d12"],[61.8,63,"flexor carpi ulnaris","#7c2d12"],[52.2,37.3,"extensor indicis proprius","#7c2d12"],[54.6,37.5,"extensor digitorum communis","#7c2d12"],[51.5,49.2,"lunate","#1e3a8a"],[49,41.6,"scapholunate ligament, dorsal band","#14532d"],[45.2,51.4,"scapholunate ligament, volar band","#14532d"],[59.3,51.9,"lunotriquetral ligament, volar band","#14532d"],[51.2,60.7,"FDS4","#7c2d12"]],
          12: [[62.3,40.2,"extensor digiti minimi","#7c2d12"],[36.4,58.9,"flexor carpi radialis","#7c2d12"],[44.2,61.8,"median nerve","#92400e"],[58.5,62,"ulnar nerve","#92400e"],[62.1,63.6,"flexor carpi ulnaris","#7c2d12"],[44,64.8,"palmaris longus","#7c2d12"],[41.8,45.4,"scaphoid","#1e3a8a"],[51.2,48.5,"lunate","#1e3a8a"],[61.4,48.5,"triquetrum","#1e3a8a"],[48.8,41.6,"scapholunate ligament, dorsal band","#14532d"],[58.7,42.9,"lunotriquetral ligament, dorsal band","#14532d"],[53.3,57.8,"FDP3","#7c2d12"],[56.4,56.7,"FDP4","#7c2d12"]],
          13: [[69.7,46.3,"extensor carpi ulnaris","#7c2d12"],[26.5,51.5,"abductor pollicis longus","#7c2d12"],[25.1,48.1,"extensor pollicis brevis","#7c2d12"],[40.7,36.1,"extensor carpi radialis brevis","#7c2d12"],[41.1,57.5,"flexor pollicis longus","#7c2d12"],[61.1,48.1,"triquetrum","#1e3a8a"],[44.3,57.6,"FDS2","#7c2d12"]],
          14: [[63.8,41.5,"extensor digiti minimi","#7c2d12"],[34.6,38.2,"extensor carpi radialis longus","#7c2d12"],[36.8,59.3,"flexor carpi radialis","#7c2d12"],[58.7,60.3,"Guyon's canal","#14532d"],[63,59.6,"pisiform","#1e3a8a"],[64.8,55.3,"pisotriquetral joint","#1e3a8a"],[63,63.6,"flexor carpi ulnaris","#7c2d12"],[55.7,38,"extensor digitorum communis","#7c2d12"],[43.8,64.1,"palmaris longus","#7c2d12"],[37.1,46.3,"scaphoid","#1e3a8a"],[48.3,57.1,"FDP2","#7c2d12"],[46.7,60,"FDS3","#7c2d12"],[52.2,57.5,"FDP3","#7c2d12"]],
          15: [[41.5,35.7,"extensor carpi radialis brevis","#7c2d12"],[35.7,35.5,"extensor pollicis longus","#7c2d12"],[44.3,60.9,"median nerve","#92400e"],[57.1,61.6,"ulnar nerve","#92400e"],[65.6,50.6,"triquetrum","#1e3a8a"],[44.7,56.9,"FDS2","#7c2d12"],[55.3,55.8,"FDP4","#7c2d12"],[57.1,57.8,"FDS5","#7c2d12"]],
          16: [[70.2,48.7,"extensor carpi ulnaris","#7c2d12"],[25.8,54.2,"abductor pollicis longus","#7c2d12"],[21.8,50.5,"extensor pollicis brevis","#7c2d12"],[41.8,56.6,"flexor pollicis longus","#7c2d12"],[37.5,59.8,"flexor carpi radialis","#7c2d12"],[65,50.8,"triquetrum","#1e3a8a"],[47.6,56,"FDP2","#7c2d12"],[52.2,56.6,"FDP3","#7c2d12"],[52.8,59.3,"FDS4","#7c2d12"]],
          17: [[65.6,43.3,"extensor digiti minimi","#7c2d12"],[33.7,38.2,"extensor carpi radialis longus","#7c2d12"],[56.4,61.8,"ulnar nerve","#92400e"],[56.6,38,"extensor digitorum communis","#7c2d12"],[44.9,65,"palmaris longus","#7c2d12"],[47.6,58.9,"FDS3","#7c2d12"]],
          18: [[70.8,50.6,"extensor carpi ulnaris","#7c2d12"],[26.9,56,"abductor pollicis longus","#7c2d12"],[42.7,35.2,"extensor carpi radialis brevis","#7c2d12"],[31.2,38.4,"extensor pollicis longus","#7c2d12"],[44.2,58.9,"median nerve","#92400e"],[50.6,35.3,"extensor indicis proprius","#7c2d12"],[47.9,55.1,"FDP2","#7c2d12"],[45.1,56.7,"FDS2","#7c2d12"],[51.9,56.2,"FDP3","#7c2d12"],[69.7,59.6,"abductor digiti minimi","#7c2d12"]],
          19: [[17.9,52.4,"extensor pollicis brevis","#7c2d12"],[41.6,57.1,"flexor pollicis longus","#7c2d12"],[37.9,58,"flexor carpi radialis","#7c2d12"],[54.4,58.5,"transverse carpal ligament","#14532d"],[47.8,58.2,"FDS3","#7c2d12"],[54.6,53.5,"FDP4","#7c2d12"]],
          20: [[70.8,51.5,"extensor carpi ulnaris","#7c2d12"],[33.4,37.7,"extensor carpi radialis longus","#7c2d12"],[55.7,62,"ulnar nerve","#92400e"],[55.3,36.4,"extensor digitorum communis","#7c2d12"],[46.7,54.2,"FDP2","#7c2d12"],[51.9,55.1,"FDP3","#7c2d12"],[52.2,57.8,"FDS4","#7c2d12"],[61.1,47.2,"hamate","#1e3a8a"],[58.7,55.5,"hamate hook","#1e3a8a"],[49.4,43.4,"capitate","#1e3a8a"],[38.4,44.3,"trapezoid","#1e3a8a"],[32.6,53.3,"trapezium","#1e3a8a"],[29.8,64.8,"abductor pollicis brevis","#7c2d12"]],
          21: [[43.3,33.9,"extensor carpi radialis brevis","#7c2d12"],[27.8,40.6,"extensor pollicis longus","#7c2d12"],[45.2,56.4,"FDS2","#7c2d12"],[48.3,57.6,"FDS3","#7c2d12"],[54.4,52.8,"FDP4","#7c2d12"]],
          22: [[71.1,52.1,"extensor carpi ulnaris","#7c2d12"],[69.5,44.9,"extensor digiti minimi","#7c2d12"],[40.4,56.2,"flexor pollicis longus","#7c2d12"],[43.8,58.5,"median nerve","#92400e"],[46.3,54,"FDP2","#7c2d12"],[51.7,54.6,"FDP3","#7c2d12"],[58.5,61.1,"flexor digiti minimi","#7c2d12"],[34.1,61.1,"opponens pollicis","#7c2d12"]],
          23: [[32.1,38.9,"extensor carpi radialis longus","#7c2d12"],[48.7,57.3,"FDS3","#7c2d12"],[52.6,56.9,"FDS4","#7c2d12"],[55.7,55.3,"FDS5","#7c2d12"],[77.6,59.4,"abductor digiti minimi","#7c2d12"],[65,58,"opponens digiti minimi","#7c2d12"],[26.3,66.5,"abductor pollicis brevis","#7c2d12"]],
          24: [[44.7,34.3,"extensor carpi radialis brevis","#7c2d12"],[22.7,42.4,"extensor pollicis longus","#7c2d12"],[49.9,33,"extensor indicis proprius","#7c2d12"],[46,53.9,"FDP2","#7c2d12"],[46,56,"FDS2","#7c2d12"],[55.3,52.8,"FDP4","#7c2d12"],[27.2,62.3,"opponens pollicis","#7c2d12"]],
          25: [[71.5,45.4,"extensor digiti minimi","#7c2d12"],[38.4,56.2,"flexor pollicis longus","#7c2d12"],[44.5,57.5,"median nerve","#92400e"],[49.7,56.2,"FDS3","#7c2d12"],[51.5,53.9,"FDP3","#7c2d12"],[64.1,61.6,"flexor digiti minimi","#7c2d12"],[40.4,60.3,"flexor pollicis brevis","#7c2d12"]],
          26: [[46,55.7,"FDS2","#7c2d12"],[53.9,57.1,"FDS4","#7c2d12"],[81,59.4,"abductor digiti minimi","#7c2d12"]],
          27: [[44.7,53.1,"FDP2","#7c2d12"],[49.7,55.7,"FDS3","#7c2d12"],[58.2,56,"FDS5","#7c2d12"],[26.9,58.4,"flexor pollicis brevis","#7c2d12"]],
          28: [[17.3,44.3,"extensor pollicis longus","#7c2d12"],[36.2,56.6,"flexor pollicis longus","#7c2d12"],[47.9,63.2,"palmar aponeurosis","#14532d"],[52.6,52.8,"FDP3","#7c2d12"],[56.9,52.8,"FDP4","#7c2d12"]],
          29: [[46.1,55.1,"FDS2","#7c2d12"]],
          30: [[15.7,44.7,"extensor pollicis longus","#7c2d12"],[33.4,58.5,"flexor pollicis longus","#7c2d12"],[46.9,31,"extensor indicis proprius","#7c2d12"],[16.8,52.6,"1st metacarpal","#1e3a8a"],[37.7,37.9,"2nd metacarpal","#1e3a8a"],[51.9,38,"3rd metacarpal","#1e3a8a"],[63.4,42.9,"4th metacarpal","#1e3a8a"],[74.2,52.2,"5th metacarpal","#1e3a8a"],[43.8,53.1,"FDP2","#7c2d12"],[45.8,54.9,"FDS2","#7c2d12"],[50.6,54.9,"FDS3","#7c2d12"],[52.6,51.4,"FDP3","#7c2d12"],[58.4,53.5,"FDP4","#7c2d12"],[57.3,56,"FDS4","#7c2d12"],[60.5,56.2,"FDS5","#7c2d12"]],
        },
      },
      cor_pdfs: {
        label: 'Cor PDFS',
        path: '/atlas/cor-wrist-pdfs/cor%20%20wrist%20',
        slices: localSlices(17, 2),
        ext: '.jpg',
        pad: 4,
        permanentLabels: {
          3: [[65.4,87.7,"flexor carpi ulnaris","#7c2d12"]],
          4: [[64.5,74.6,"flexor carpi ulnaris","#7c2d12"],[65.2,67.7,"flexor carpi ulnaris","#7c2d12"],[31.4,22.7,"flexor pollicis brevis","#7c2d12"],[16.4,40.7,"abductor pollicis","#7c2d12"],[30.8,42.4,"opponens pollicis","#7c2d12"]],
          6: [[31.7,22.7,"flexor pollicis longus","#7c2d12"],[45.6,56.4,"median nerve","#92400e"],[60,62.1,"ulnar nerve","#92400e"]],
          7: [[39.7,37,"flexor pollicis longus","#7c2d12"],[43.8,58.5,"flexor pollicis longus","#7c2d12"],[42.2,82.1,"flexor pollicis longus","#7c2d12"],[59.8,47.2,"hook of hamate","#1e3a8a"],[67.5,62.1,"pisiform","#1e3a8a"],[65.2,51.7,"pisometacarpal ligament","#14532d"],[62,53.1,"pisohamate ligament","#14532d"],[55.5,69.7,"long radiolunate ligament","#14532d"],[80.9,37.5,"abductor digiti minimi","#7c2d12"],[73.7,30.1,"flexor digiti minimi","#7c2d12"]],
          8: [[33.7,49.9,"trapezium","#1e3a8a"],[20.6,37,"1st metacarpal","#1e3a8a"],[16.1,4,"1st proximal phalanx","#1e3a8a"],[15.4,10,"1st MCP joint","#1e3a8a"],[46.5,30.8,"2nd flexor tendons","#7c2d12"],[51,32.6,"3rd flexor tendons","#7c2d12"],[56.6,31.4,"4th flexor tendons","#7c2d12"],[60.7,31.7,"5th flexor tendons","#7c2d12"],[34.3,41.6,"anterior oblique ligament","#14532d"],[58.7,66.5,"long radiolunate ligament","#14532d"],[61.6,70.4,"ulnolunate ligament","#14532d"]],
          9: [[67,70.6,"TFC, ulnotriquetral ligament","#14532d"],[62.5,72.2,"TFC, ulnolunate ligament","#14532d"],[65.7,75.5,"TFC, volar radioulnar ligament","#14532d"],[63.6,70.8,"lunotriquetral ligament, volar band","#14532d"],[29.2,44.7,"1st CMC joint","#1e3a8a"],[34.1,40.6,"anterior oblique ligament","#14532d"],[24.7,49.6,"posterior 1st CMC ligament capsule","#14532d"],[25.8,50.5,"posterior 1st CMC ligament capsule","#14532d"],[45.4,68.3,"palmar radiocarpal ligament","#14532d"],[57.8,58,"triquetrohamatecapitate ligament","#14532d"],[60.7,66.8,"lunotriquetral ligament, volar band","#14532d"],[46,55.5,"scaphocapitate ligament","#14532d"]],
          10: [[48.5,71.7,"scapholunate ligament, volar band","#14532d"],[39.5,52.1,"STT joint","#1e3a8a"],[52.2,75.3,"lunate facet","#1e3a8a"],[80.9,1.5,"5th proximal phalanx","#1e3a8a"],[81,5.1,"5th MCP joint","#1e3a8a"]],
          11: [[63.2,73.7,"TFC, central disc","#14532d"],[59.8,75.5,"TFC, radial attachment","#14532d"],[55.5,69,"lunate","#1e3a8a"],[39.5,62.9,"scaphoid","#1e3a8a"],[65,63.8,"triquetrum","#1e3a8a"],[59.8,52.4,"hamate","#1e3a8a"],[64.5,45.1,"5th CMC joint","#1e3a8a"],[40.7,70.8,"scaphoid facet","#1e3a8a"],[72.9,30.1,"5th metacarpal","#1e3a8a"],[72.6,47.4,"extensor carpi ulnaris","#7c2d12"],[69.3,70.1,"meniscal homologue","#14532d"],[70.4,67.4,"UCL","#14532d"],[53.3,74.7,"proximal carpal row","#1e3a8a"],[28.3,44.5,"posterior 1st CMC ligament capsule","#14532d"],[31.9,65,"radial collateral ligament","#14532d"]],
          12: [[43.3,82.7,"radius","#1e3a8a"],[68.4,85,"ulna","#1e3a8a"],[58.4,81.8,"distal radioulnar joint","#1e3a8a"],[57.6,79.6,"radial sigmoid notch","#1e3a8a"],[68.6,78.2,"TFC, foveal attachment","#14532d"],[71,74.7,"TFC, styloid attachment","#14532d"],[72.2,77.6,"ulnar styloid process","#1e3a8a"],[62.3,74.6,"TFC, central disc","#14532d"],[64.1,70.2,"lunotriquetral ligament, membranous","#14532d"],[49.7,71.5,"scapholunate ligament, membranous","#14532d"],[50.6,55.3,"capitate","#1e3a8a"],[33.9,69.2,"radial styloid process","#1e3a8a"],[72.2,53.5,"extensor carpi ulnaris","#7c2d12"],[28.9,68.6,"1st extensor compartment tendons","#7c2d12"],[53.1,64.7,"mid carpal row","#1e3a8a"],[30.7,38.9,"intermetacarpal ligament","#14532d"]],
          13: [[63.4,69.9,"lunotriquetral ligament, dorsal band","#14532d"],[39.3,50.5,"trapezoid","#1e3a8a"],[62.7,44.5,"4th CMC joint","#1e3a8a"],[70.2,68.6,"extensor carpi ulnaris","#7c2d12"],[72.2,38.2,"extensor digiti minimi","#7c2d12"]],
          14: [[62.5,74,"TFC, dorsal radioulnar ligament","#14532d"],[51.2,69,"scapholunate ligament, dorsal band","#14532d"],[38.8,44.9,"2nd CMC joint","#1e3a8a"],[51.3,44.7,"3rd CMC joint","#1e3a8a"],[72.4,83,"extensor carpi ulnaris","#7c2d12"],[29,51,"extensor pollicis longus","#7c2d12"],[68.4,51.2,"extensor digiti minimi","#7c2d12"]],
          15: [[64.1,75.6,"TFC, dorsal radioulnar ligament","#14532d"],[38,33,"2nd metacarpal","#1e3a8a"],[51.2,31.2,"3rd metacarpal","#1e3a8a"],[63.4,29,"4th metacarpal","#1e3a8a"],[31.9,53.3,"extensor pollicis longus","#7c2d12"],[34.6,55.7,"extensor carpi radialis longus","#7c2d12"],[52.2,58.4,"dorsal intercarpal ligament","#14532d"],[52.8,69,"dorsal radiocarpal ligament","#14532d"]],
          16: [[42.5,71.5,"Lister's tubercle","#1e3a8a"],[56.7,64.7,"extensor digitorum communis","#7c2d12"]],
          17: [[45.2,75.1,"extensor pollicis longus","#7c2d12"],[42.7,56.9,"extensor carpi radialis brevis","#7c2d12"]],
        },
      },
    },
    view: 'MRI — wrist',
    labels: {
      bones:    [[50,45,'Radius','#1e3a8a'],[60,55,'Scaphoid','#1e3a8a'],[50,60,'Lunate','#1e3a8a'],[40,55,'Triquetrum','#1e3a8a'],[65,65,'Capitate','#1e3a8a']],
      tendons:  [[42,40,'Flexor tendons','#14532d'],[58,38,'Extensor tendons','#14532d'],[50,70,'TFCC','#14532d']],
      muscles:  [[40,38,'FCR/FCU','#7c2d12'],[60,38,'ECU/ECRB','#7c2d12']],
      nerves:   [[44,42,'Median n.','#92400e'],[38,48,'Ulnar n.','#92400e']],
      arteries: [[46,40,'Radial a.','#991b1b'],[38,44,'Ulnar a.','#991b1b']],
      veins:    [[48,38,'Radial v.','#4c1d95']],
    },
  },
  hip: {
    label: 'Hip',
    region: 'Lower Extremity',
    useLocalMRI: true,
    defaultSlice: 10,
    sequences: {
      ax_pdfs: {
        label: 'Ax PDFS',
        path: '/atlas/hip/hip_ax_pdfs_',
        slices: Array.from({length:24},(_,i)=>i+1),
        ext: '.webp',
        pad: 0,
        permanentLabels: {
          1: [[65.2,34.8,"femoral nerve","#92400e"],[81.4,78.2,"piriformis","#7c2d12"],[57.5,31.4,"iliacus","#7c2d12"],[42.4,33.9,"gluteus minimus","#7c2d12"],[31.7,36.8,"gluteus medius","#7c2d12"],[75.5,30.1,"external iliac artery","#991b1b"],[77.4,35.5,"external iliac vein","#4c1d95"]],
          2: [[63.4,30.8,"femoral nerve","#92400e"],[69.2,32.3,"psoas","#7c2d12"]],
          3: [[76.4,77.1,"piriformis","#7c2d12"],[68.8,31.6,"psoas","#7c2d12"],[53,37,"iliac bone","#1e3a8a"],[42,82.1,"gluteus maximus","#7c2d12"],[75.1,26.9,"external iliac artery","#991b1b"],[76.4,34.4,"external iliac vein","#4c1d95"]],
          4: [[61.2,25.1,"femoral nerve","#92400e"],[29,39.8,"gluteus medius","#7c2d12"],[76,31.2,"external iliac vein","#4c1d95"]],
          5: [[71,64.8,"sciatic nerve","#92400e"],[67.9,71.7,"piriformis","#7c2d12"],[67.4,29.8,"iliopsoas","#7c2d12"],[50.8,20,"anterior inferior iliac spine","#1e3a8a"],[45.4,10.1,"sartorius","#7c2d12"],[36.8,13.6,"tensor fascia lata","#7c2d12"],[30.8,48.7,"gluteus medius","#7c2d12"],[26.9,70.1,"gluteus maximus","#7c2d12"],[72.8,25.3,"external iliac artery","#991b1b"],[75.3,31.4,"external iliac vein","#4c1d95"]],
          6: [[62.3,20.2,"femoral nerve","#92400e"],[67.5,65.2,"sciatic nerve","#92400e"],[77.6,86.6,"sacrotuberous ligament","#14532d"],[41.5,33.4,"gluteus minimus","#7c2d12"],[76,28.5,"external iliac vein","#4c1d95"]],
          7: [[61.1,68.8,"piriformis","#7c2d12"],[58,19.5,"iliacus","#7c2d12"],[66.3,27.6,"psoas","#7c2d12"],[49.4,17.5,"rectus femoris direct head","#7c2d12"],[46.1,26.2,"rectus femoris reflected head","#7c2d12"],[44,7.4,"lateral femoral cutaneous nerve","#92400e"],[29.6,41.5,"gluteus medius","#7c2d12"],[27.4,53.5,"gluteus medius","#7c2d12"],[35.7,58.4,"gluteus medius","#7c2d12"],[66.6,53.9,"obturator internus","#7c2d12"],[71.3,21.5,"external iliac artery","#991b1b"],[73.8,26.3,"external iliac vein","#4c1d95"]],
          8: [[63.9,16.4,"femoral nerve","#92400e"],[65.7,67.4,"sciatic nerve","#92400e"],[44.9,26,"rectus femoris reflected head","#7c2d12"],[78,86.4,"sacrotuberous ligament","#14532d"],[27.8,74.2,"gluteus maximus","#7c2d12"],[54.2,62.7,"piriformis","#7c2d12"],[67.9,69.3,"sciatic notch","#1e3a8a"]],
          9: [[61.1,68.1,"sciatic nerve","#92400e"],[64.7,27.1,"psoas","#7c2d12"],[48.7,17.9,"rectus femoris direct head","#7c2d12"],[44.2,26.7,"rectus femoris reflected head","#7c2d12"],[76.2,84.5,"sacrotuberous ligament","#14532d"],[48.1,8,"sartorius","#7c2d12"],[34.1,16.3,"tensor fascia lata","#7c2d12"],[32.8,40.4,"gluteus minimus","#7c2d12"],[28.1,53.5,"gluteus medius","#7c2d12"],[47,60.2,"piriformis","#7c2d12"],[69.2,18.6,"external iliac artery","#991b1b"],[74,24,"external iliac vein","#4c1d95"]],
          10: [[62.5,15.9,"femoral nerve","#92400e"],[72.8,79.2,"sacrospinous ligament","#14532d"],[19.7,40,"iliiotibial tract/band","#14532d"],[40.9,7.4,"lateral femoral cutaneous nerve","#92400e"],[27.1,54.4,"gluteus medius","#7c2d12"],[71.7,40.2,"obturator nerve","#92400e"],[69,54,"obturator internus","#7c2d12"],[38.6,56.9,"piriformis","#7c2d12"],[68.4,17.7,"external iliac artery","#991b1b"],[74.2,21.7,"external iliac vein","#4c1d95"],[67.9,68.8,"ischial spine","#1e3a8a"]],
          11: [[53.7,67.9,"sciatic nerve","#92400e"],[48.1,17,"rectus femoris direct head","#7c2d12"],[73.5,82.1,"sacrotuberous ligament","#14532d"],[27.8,54.2,"gluteus medius","#7c2d12"],[22.7,74.2,"gluteus maximus","#7c2d12"],[34.6,54.2,"piriformis","#7c2d12"],[67.2,16.8,"common femoral artery","#991b1b"]],
          12: [[71.7,80.3,"sacrotuberous ligament","#14532d"],[26.9,40.7,"gluteus minimus","#7c2d12"],[52.2,39.5,"femoral head","#1e3a8a"],[44.5,58,"obturator internus","#7c2d12"],[35.2,50.1,"obturator internus","#7c2d12"],[66.6,16.3,"common femoral artery","#991b1b"],[71.7,19.1,"common femoral vein","#4c1d95"]],
          13: [[61.1,15.5,"femoral nerve","#92400e"],[18.1,42.5,"iliiotibial tract/band","#14532d"],[33.4,17,"tensor fascia lata","#7c2d12"],[23.8,37.7,"gluteus medius","#7c2d12"],[26.5,54.9,"gluteus medius","#7c2d12"],[24.7,74.7,"gluteus maximus","#7c2d12"],[73.1,38.4,"obturator nerve","#92400e"],[34.8,57.5,"posterior superior facet of greater trochanter","#1e3a8a"],[53.5,63.9,"obturator internus","#7c2d12"],[66.3,16.3,"common femoral artery","#991b1b"],[70.6,19.3,"common femoral vein","#4c1d95"],[70.4,69.3,"pudendal nerve","#92400e"]],
          14: [[47,68.4,"sciatic nerve","#92400e"],[54.6,28.1,"iliacus","#7c2d12"],[60,28.7,"psoas","#7c2d12"],[68.6,78.2,"sacrotuberous ligament","#14532d"],[49.9,8.2,"sartorius","#7c2d12"],[48.7,16.4,"rectus femoris","#7c2d12"],[37.7,8.5,"lateral femoral cutaneous nerve","#92400e"],[33.7,58,"posterior superior facet of greater trochanter","#1e3a8a"],[71,55.5,"obturator internus","#7c2d12"],[66.1,16.8,"common femoral artery","#991b1b"],[71,19.3,"common femoral vein","#4c1d95"],[70.1,69,"pudendal nerve","#92400e"]],
          15: [[52.2,24,"iliacus","#7c2d12"],[24.2,54.4,"gluteus medius","#7c2d12"],[74.6,36.4,"obturator foramen","#1e3a8a"],[45.6,42.9,"femoral neck","#1e3a8a"],[27.6,55.8,"lateral facet of greater trochanter","#1e3a8a"],[92.2,14.3,"rectus abdominis","#7c2d12"],[65.9,16.8,"common femoral artery","#991b1b"],[70.8,20,"common femoral vein","#4c1d95"],[73.1,60.7,"pudendal nerve","#92400e"]],
          16: [[56,68.1,"conjoined tendon","#14532d"],[65.9,75.3,"sacrotuberous ligament","#14532d"],[54.8,9.6,"sartorius","#7c2d12"],[24,44.7,"gluteus minimus","#7c2d12"],[30.5,51,"greater trochanter","#1e3a8a"],[69.5,25.8,"pectineus","#7c2d12"],[92.4,14.8,"rectus abdominis","#7c2d12"],[65.2,17.2,"common femoral artery","#991b1b"],[69.9,20.6,"common femoral vein","#4c1d95"],[23.5,56.9,"trochanteric bursa","#14532d"]],
          17: [[59.1,18.8,"femoral nerve","#92400e"],[44.2,69.9,"sciatic nerve","#92400e"],[57.6,36.8,"psoas","#7c2d12"],[53.9,35.2,"iliacus","#7c2d12"],[56.2,69.3,"conjoined tendon","#14532d"],[52.4,64.5,"semimembranosus","#7c2d12"],[65.6,74.9,"sacrotuberous ligament","#14532d"],[19.3,41.1,"iliiotibial tract/band","#14532d"],[29,18.8,"tensor fascia lata","#7c2d12"],[36.1,8.7,"lateral femoral cutaneous nerve","#92400e"],[22.4,73.1,"gluteus maximus","#7c2d12"],[24.7,46.7,"anterior facet of greater trochanter","#1e3a8a"],[70.6,27.1,"pectineus","#7c2d12"],[93.8,16.4,"aponeurotic plate","#14532d"],[65,18.2,"common femoral artery","#991b1b"],[69.2,21.1,"common femoral vein","#4c1d95"]],
          18: [[55.3,70.8,"conjoined tendon","#14532d"],[52.2,63.8,"semimembranosus","#7c2d12"],[64.7,74.2,"sacrotuberous ligament","#14532d"],[50.3,17,"rectus femoris","#7c2d12"],[69,27.2,"pectineus","#7c2d12"],[94,19.9,"adductor tubercle","#1e3a8a"],[68.8,21.8,"common femoral vein","#4c1d95"],[64.8,18.2,"superficial femoral artery","#991b1b"],[63.4,21.1,"deep femoral artery","#991b1b"]],
          19: [[58,20.4,"femoral nerve","#92400e"],[54.9,40,"iliopsoas","#7c2d12"],[54.9,71.7,"conjoined tendon","#14532d"],[52.8,63.9,"semimembranosus","#7c2d12"],[58.5,65.2,"ischial tuberosity","#1e3a8a"],[65.2,72,"sacrotuberous ligament","#14532d"],[50.3,16.1,"rectus femoris","#7c2d12"],[65.7,30.7,"pectineus","#7c2d12"],[86.6,34.6,"adductor brevis","#7c2d12"],[71.3,46.5,"obturator externus","#7c2d12"],[70.1,17,"great saphenous vein","#4c1d95"],[65,18.4,"superficial femoral artery","#991b1b"],[62.1,22.6,"deep femoral artery","#991b1b"]],
          20: [[54.6,43.8,"iliopsoas","#7c2d12"],[53.1,62.7,"semimembranosus","#7c2d12"],[54.2,69.9,"conjoined tendon","#14532d"],[55.5,9.2,"sartorius","#7c2d12"],[18.6,70.2,"gluteus maximus","#7c2d12"],[62.9,31.9,"pectineus","#7c2d12"],[92.2,21.3,"adductor longus","#7c2d12"],[85.4,36.8,"adductor brevis","#7c2d12"],[72.8,47.8,"obturator externus","#7c2d12"],[70.8,17.7,"great saphenous vein","#4c1d95"],[61.8,22.6,"deep femoral artery","#991b1b"],[66.8,23.3,"superficial femoral vein","#4c1d95"]],
          21: [[39.5,68.1,"sciatic nerve","#92400e"],[53.7,45.6,"iliopsoas","#7c2d12"],[53.3,70.1,"conjoined tendon","#14532d"],[52.4,64.3,"semimembranosus","#7c2d12"],[29,19.5,"tensor fascia lata","#7c2d12"],[91.5,22.2,"adductor longus","#7c2d12"],[73.3,47.9,"obturator externus","#7c2d12"],[46.7,59.6,"quadratus femoris","#7c2d12"],[64.5,19.1,"superficial femoral artery","#991b1b"]],
          22: [[53.9,63.6,"semimembranosus","#7c2d12"],[52.8,69,"conjoined tendon","#14532d"],[50.4,16.8,"rectus femoris","#7c2d12"],[48.8,58.4,"quadratus femoris","#7c2d12"],[54.4,56.9,"ischiofemoral space","#7c2d12"],[73.1,15.9,"great saphenous vein","#4c1d95"],[60.3,25.4,"deep femoral artery","#991b1b"],[65.6,23.8,"superficial femoral vein","#4c1d95"]],
          23: [[50.4,51,"lesser trochanter","#1e3a8a"],[76,49.7,"inferior pubic ramus","#1e3a8a"],[53.1,63,"semimembranosus","#7c2d12"],[20.8,74.2,"gluteus maximus","#7c2d12"],[87.3,24.5,"adductor longus","#7c2d12"],[48.5,60.3,"quadratus femoris","#7c2d12"],[52.4,57.3,"quadratus femoris space","#7c2d12"],[64.1,19.9,"superficial femoral artery","#991b1b"],[64.3,24.9,"superficial femoral vein","#4c1d95"]],
          24: [[38.4,66.5,"sciatic nerve","#92400e"],[52.6,64.1,"semimembranosus","#7c2d12"],[51.5,68.6,"conjoined tendon","#14532d"],[58.9,11.4,"sartorius","#7c2d12"],[51,15.2,"rectus femoris","#7c2d12"],[26,21.7,"tensor fascia lata","#7c2d12"],[23.5,80.1,"gluteus maximus","#7c2d12"],[87.9,25.8,"adductor longus","#7c2d12"],[80,37.3,"adductor brevis","#7c2d12"],[43.6,60.3,"quadratus femoris","#7c2d12"],[63.9,20.4,"superficial femoral artery","#991b1b"],[60,26.3,"deep femoral artery","#991b1b"],[63.4,24.7,"superficial femoral vein","#4c1d95"],[61.8,28.3,"deep femoral vein","#4c1d95"]],
        },
      },
      cor_pdfs: {
        label: 'Cor PDFS',
        path: '/atlas/hip/hip_cor_pdfs_',
        slices: Array.from({length:22},(_,i)=>i+1),
        ext: '.webp',
        pad: 0,
        permanentLabels: {
          1: [[57.3,48.1,"rectus femoris","#7c2d12"],[60,68.3,"rectus femoris","#7c2d12"],[44.5,23.1,"tensor fascia lata","#14532d"],[68.4,70.8,"sartorius","#7c2d12"],[65.6,36.1,"iliacus","#7c2d12"],[38,60.3,"tensor fascia lata","#14532d"]],
          2: [[57.8,29.2,"anterior inferior iliac spine","#1e3a8a"],[55.1,39.7,"rectus femoris","#7c2d12"],[51.2,26.3,"gluteus minimus","#7c2d12"],[39.8,24.4,"gluteus medius","#7c2d12"],[76.2,94.4,"sartorius","#7c2d12"]],
          3: [[38.4,22.7,"gluteus medius","#7c2d12"],[49.7,26.7,"gluteus minimus","#7c2d12"],[70.8,38.4,"femoral nerve","#92400e"],[74.7,41.5,"femoral artery","#991b1b"],[78.2,46.3,"femoral vein","#4c1d95"],[43.6,88.2,"vastus lateralis","#7c2d12"]],
          4: [[31.6,64.7,"IT band","#14532d"],[47.6,34.1,"gluteus minimus","#7c2d12"],[37.1,30.3,"gluteus medius","#7c2d12"]],
          5: [[47.2,6.7,"iliac bone","#1e3a8a"],[62.3,44,"iliacus","#7c2d12"],[31.4,71.9,"IT band","#14532d"],[37.9,26.7,"gluteus medius","#7c2d12"],[49.7,28.5,"gluteus minimus","#7c2d12"],[85.4,60.9,"pectineus","#7c2d12"],[38.9,78.3,"vastus lateralis","#7c2d12"],[62.1,89,"vastus medialis","#7c2d12"],[46.3,84.3,"vastus intermedius","#7c2d12"],[96.3,65.6,"adductor longus","#7c2d12"]],
          6: [[67.2,47.9,"psoas","#7c2d12"],[69.9,36.8,"psoas","#7c2d12"],[60.9,52.1,"iliacus","#7c2d12"],[45.6,33.7,"gluteus minimus","#7c2d12"],[41.5,38.6,"gluteus minimus","#7c2d12"],[34.1,22.2,"gluteus medius","#7c2d12"],[59.1,45.2,"labrum, anterior","#14532d"],[65,27.6,"femoral nerve","#92400e"],[54.9,85.2,"vastus intermedius","#7c2d12"],[95.8,69.2,"adductor longus","#7c2d12"],[90.8,81.2,"adductor longus","#7c2d12"],[52.2,49,"iliofemoral ligament","#14532d"]],
          7: [[47.4,25.4,"gluteus minimus","#7c2d12"],[90,56.2,"superior pubic ramus","#1e3a8a"],[65.4,56,"psoas","#7c2d12"],[71.3,25.8,"psoas","#7c2d12"],[61.6,22.7,"iliacus","#7c2d12"],[60.3,55.3,"iliacus","#7c2d12"],[40,40.9,"gluteus minimus","#7c2d12"],[32.5,24,"gluteus medius","#7c2d12"],[52.1,39.3,"labrum, anterior superior","#14532d"],[38,78.5,"vastus lateralis","#7c2d12"],[50.8,83,"vastus intermedius","#7c2d12"],[90,86.8,"adductor longus","#7c2d12"],[91.8,67.2,"adductor brevis","#7c2d12"]],
          8: [[49,7.3,"iliac bone","#1e3a8a"],[32.6,22.2,"gluteus medius","#7c2d12"],[41.6,35.7,"gluteus minimus","#7c2d12"],[35.7,51,"gluteus minimus","#7c2d12"],[71.9,16.6,"psoas","#7c2d12"],[50.3,39.1,"labrum, anterior superior","#14532d"],[92,69.5,"adductor brevis","#7c2d12"]],
          9: [[34.4,47.8,"gluteus minimus","#7c2d12"],[46.7,25.4,"gluteus minimus","#7c2d12"],[33.7,58.5,"anterior facet, greater trochanter","#1e3a8a"],[50.4,52.1,"femoral neck","#1e3a8a"],[61.2,61.4,"iliopsoas","#7c2d12"],[71.9,12.3,"psoas","#7c2d12"],[63.8,26,"iliacus","#7c2d12"],[49.6,38.6,"labrum, posterior superior","#14532d"],[78.9,17.2,"external iliac artery","#991b1b"],[78.2,26.9,"external iliac vein","#4c1d95"],[59.1,35.9,"acetabulum","#1e3a8a"]],
          10: [[57.1,46,"femoral head","#1e3a8a"],[66.8,45.1,"ligamentum teres","#14532d"],[65,45.4,"fovea capitalis","#1e3a8a"],[71.7,7.4,"psoas","#7c2d12"],[62.1,20,"iliacus","#7c2d12"],[74,61.2,"obturator externus","#7c2d12"],[48.8,38.6,"labrum, posterior superior","#14532d"],[55.3,36.6,"hip joint space","#1e3a8a"],[68.1,18.6,"femoral nerve","#92400e"]],
          11: [[65.9,44.2,"ligamentum teres","#14532d"],[59.4,68.4,"iliopsoas","#7c2d12"],[60.5,13.9,"iliacus","#7c2d12"],[64.8,60.3,"obturator externus","#7c2d12"],[48.8,39.1,"labrum, posterior","#14532d"]],
          12: [[27.8,15.9,"gluteus medius","#7c2d12"],[30.1,54.8,"gluteus medius","#7c2d12"],[33,35.3,"gluteus medius","#7c2d12"],[34.8,58.4,"greater trochanter","#1e3a8a"],[56.9,61.4,"obturator externus","#7c2d12"],[48.5,41.1,"labrum, posterior","#14532d"]],
          13: [[53.7,76.9,"lesser trochanter","#1e3a8a"],[43.4,69.7,"intertrochanteric femur","#1e3a8a"],[57.8,73.5,"iliopsoas","#7c2d12"],[38,47.9,"piriformis","#7c2d12"],[41.3,49.4,"obturator internus (and gemelli muscles)","#7c2d12"],[49,59.1,"obturator externus","#7c2d12"],[41.8,57.8,"obturator externus","#7c2d12"]],
          14: [[32.5,54.8,"gluteus medius","#7c2d12"],[32.5,50.3,"gluteus medius","#7c2d12"],[79.8,74.7,"inferior pubic ramus","#1e3a8a"],[38.9,47.4,"piriformis","#7c2d12"]],
          15: [[51.2,29.9,"gluteus minimus","#7c2d12"],[24.2,70.4,"gluteus maximus","#7c2d12"],[20,34.4,"gluteus maximus","#7c2d12"],[42.2,46.1,"piriformis","#7c2d12"],[45.1,49.4,"obturator internus (and gemelli muscles)","#7c2d12"],[47.6,57.6,"quadratus femoris","#7c2d12"]],
          16: [[60.5,9.2,"iliac bone","#1e3a8a"],[62.3,52.2,"ischium","#1e3a8a"],[44.7,43.8,"piriformis","#7c2d12"],[47.4,49.4,"obturator internus (and gemelli muscles)","#7c2d12"],[45.8,58.4,"quadratus femoris","#7c2d12"]],
          17: [[66.8,8,"SI joint (synovial)","#14532d"],[48.8,42.4,"piriformis","#7c2d12"]],
          18: [[61.2,54.9,"ischium","#1e3a8a"],[53.3,68.8,"semimembranosus","#7c2d12"],[60.7,79.4,"adductor magnus","#7c2d12"],[17,59.3,"gluteus maximus","#7c2d12"],[15.4,32.5,"gluteus maximus","#7c2d12"],[52.1,40.9,"piriformis","#7c2d12"],[52.6,51.2,"obturator internus (and gemelli muscles)","#7c2d12"]],
          19: [[60,68.3,"ischial tuberosity","#1e3a8a"],[51.3,77.4,"semimembranosus","#7c2d12"],[74.2,3.7,"sacrum","#1e3a8a"]],
          20: [[53.5,68.8,"conjoined hamstring tendon","#14532d"],[61.4,37,"piriformis","#7c2d12"]],
          21: [[54.6,67.7,"conjoined hamstring tendon","#14532d"],[72.6,22.9,"sciatic nerve","#92400e"],[61.1,42.4,"sciatic nerve","#92400e"],[56.4,52.2,"obturator internus (and gemelli muscles)","#7c2d12"],[64.8,54.4,"obturator internus","#7c2d12"]],
          22: [[76.4,6.9,"sacrum","#1e3a8a"],[70.1,13.2,"SI joint (synovial)","#14532d"],[70.1,4,"SI joint (ligamentous)","#14532d"],[66.3,28.5,"piriformis","#7c2d12"],[34.4,36.6,"gluteus maximus","#7c2d12"],[25.6,63.8,"gluteus maximus","#7c2d12"]],
        },
      },
      sag_pdfs: {
        label: 'Sag PDFS',
        path: '/atlas/hip/hip_sag_pdfs_',
        slices: Array.from({length:28},(_,i)=>i+1),
        ext: '.webp',
        pad: 0,
        permanentLabels: {
          3:  [[65.2,49.4,"gluteus maximus","#7c2d12"]],
          6:  [[72.4,38,"gluteus maximus","#7c2d12"]],
          7:  [[23.6,72.6,"tensor fascia lata","#7c2d12"],[48.8,50.5,"gluteus medius","#7c2d12"],[44.3,19.7,"gluteus medius","#7c2d12"],[69.2,24,"gluteus maximus","#7c2d12"]],
          8:  [[21.1,68.8,"tensor fascia lata","#7c2d12"],[41.6,46.5,"gluteus minimus","#7c2d12"],[47.9,44.5,"gluteus medius","#7c2d12"],[52.1,44.2,"gluteus medius","#7c2d12"],[45.2,13.6,"gluteus medius","#7c2d12"]],
          9:  [[70.4,33.5,"gluteus maximus","#7c2d12"],[46.1,53.5,"greater trochanter","#1e3a8a"],[39.3,45.4,"gluteus minimus","#7c2d12"],[47.2,34.1,"gluteus medius","#7c2d12"],[47.6,17.3,"gluteus medius","#7c2d12"],[47.8,42.4,"gluteus medius","#7c2d12"],[54.9,44,"gluteus medius","#7c2d12"]],
          10: [[46.1,47,"piriformis","#7c2d12"],[18.1,54.2,"tensor fascia lata","#7c2d12"],[35.7,43.3,"gluteus minimus","#7c2d12"],[33,85.5,"vastus lateralis","#7c2d12"]],
          11: [[51,44.7,"piriformis","#7c2d12"],[46.7,47.6,"obturator internus","#7c2d12"],[46,62.3,"intertrochanteric femur","#1e3a8a"],[31.9,28.1,"gluteus minimus","#7c2d12"],[45.1,17,"gluteus medius","#7c2d12"]],
          12: [[54.6,42.5,"piriformis","#7c2d12"],[51.9,47,"obturator internus","#7c2d12"],[75.1,31.7,"gluteus maximus","#7c2d12"],[17.9,39.1,"tensor fascia lata","#7c2d12"],[26.2,17,"gluteus minimus","#7c2d12"]],
          13: [[66.5,62.3,"sciatic nerve","#92400e"],[54,47,"obturator internus (and gemelli)","#7c2d12"],[56.6,44.9,"superior gemellus","#7c2d12"],[55.8,50.5,"inferior gemellus","#7c2d12"],[42.4,11.4,"gluteus medius","#7c2d12"]],
          14: [[41.5,38.6,"labrum, posterior superior","#14532d"],[46.1,41.6,"labrum, posterior","#14532d"],[66.8,55.5,"sciatic nerve","#92400e"],[57.1,41.5,"piriformis","#7c2d12"],[58.5,44.7,"superior gemellus","#7c2d12"],[59.3,52.1,"inferior gemellus","#7c2d12"],[58,63.2,"quadratus femoris","#7c2d12"],[17,34.8,"tensor fascia lata","#7c2d12"],[50.8,57.6,"obturator externus","#7c2d12"]],
          15: [[33,38.9,"labrum, anterior superior","#14532d"],[39.8,38,"labrum, posterior superior","#14532d"],[51,47.2,"labrum, posterior","#14532d"],[59.4,48.7,"obturator internus","#7c2d12"],[42.5,54,"femoral neck","#1e3a8a"],[78.7,34.1,"gluteus maximus","#7c2d12"],[16.3,10.1,"anterior superior iliac spine","#1e3a8a"],[59.1,68.8,"quadratus femoris","#7c2d12"]],
          16: [[31.2,41.1,"labrum, anterior superior","#14532d"],[51,50.6,"labrum, posterior","#14532d"],[66.5,48.3,"sciatic nerve","#92400e"],[50.3,74.7,"lesser trochanter","#1e3a8a"],[13.7,37,"sartorius","#7c2d12"],[49.4,58.5,"obturator externus","#7c2d12"],[63,67,"semimembranosus","#7c2d12"],[66.8,68.1,"conjoined hamstring tendon","#14532d"],[33,87.5,"vastus intermedius","#7c2d12"]],
          17: [[30.7,43.8,"labrum, anterior","#14532d"],[50.8,52.1,"labrum, posterior inferior","#14532d"],[66.5,51.4,"obturator internus","#7c2d12"],[20.9,38.8,"rectus femoris","#7c2d12"],[56.6,65.7,"quadratus femoris","#7c2d12"],[13.4,48.5,"sartorius","#7c2d12"],[60.5,67.7,"semimembranosus","#7c2d12"],[67.2,63,"conjoined hamstring tendon","#14532d"]],
          18: [[30.8,45.6,"labrum, anterior","#14532d"],[47.6,55.3,"labrum, posterior inferior","#14532d"],[41.6,35.2,"hip joint","#34d399"],[37.3,32.5,"acetabulum","#1e3a8a"],[66.1,43.4,"sciatic nerve","#92400e"],[42.4,46.3,"femoral head","#1e3a8a"],[45.2,68.3,"iliopsoas","#7c2d12"],[81.9,34.6,"gluteus maximus","#7c2d12"],[22.6,29.2,"anterior inferior iliac spine","#1e3a8a"],[19.3,72,"rectus femoris","#7c2d12"],[12.7,62.3,"sartorius","#7c2d12"],[51.2,62.9,"obturator externus","#7c2d12"],[63,76,"adductor magnus","#7c2d12"]],
          19: [[32.5,50.5,"labrum, anterior inferior","#14532d"],[45.2,55.3,"labrum, posterior inferior","#14532d"],[63.9,62.3,"ischium","#1e3a8a"],[64.3,68.3,"ischial tuberosity","#1e3a8a"],[37.3,58.7,"iliopsoas","#7c2d12"],[14.6,59.3,"sartorius","#7c2d12"],[47.8,60.3,"obturator externus","#7c2d12"],[62.7,77.4,"adductor magnus","#7c2d12"]],
          20: [[37.9,54,"transverse acetabular ligament","#14532d"],[55.8,14.1,"iliac bone","#1e3a8a"],[66.5,39.1,"sciatic nerve","#92400e"],[68.6,30.7,"piriformis","#7c2d12"],[70.2,50.8,"obturator internus","#7c2d12"],[32.8,52.8,"iliopsoas","#7c2d12"],[30.8,33.4,"iliacus","#7c2d12"],[14.3,66.8,"sartorius","#7c2d12"],[72.6,62.7,"sacrotuberous ligament","#14532d"]],
          21: [[42.5,42,"ligamentum teres","#14532d"],[62.9,68.6,"ischium","#1e3a8a"],[65.9,35.2,"sciatic nerve","#92400e"],[29.6,44.9,"iliopsoas","#7c2d12"],[47.8,10.9,"iliacus","#7c2d12"],[87.2,32.8,"gluteus maximus","#7c2d12"],[49.4,64.7,"obturator externus","#7c2d12"],[75.1,58,"sacrotuberous ligament","#14532d"]],
          22: [[66.8,34.8,"sciatic nerve","#92400e"],[15.9,75.1,"sartorius","#7c2d12"],[77.3,50.8,"sacrotuberous ligament","#14532d"]],
          23: [[60.3,10.5,"iliac bone","#1e3a8a"],[67.7,31.7,"sciatic nerve","#92400e"],[74.4,27.8,"piriformis","#7c2d12"],[59.4,51.2,"obturator internus","#7c2d12"],[32.8,33.7,"psoas","#7c2d12"],[22,56.6,"femoral neurovascular bundle","#991b1b"],[82.7,36.6,"sacrotuberous ligament","#14532d"]],
          24: [[69.3,3.5,"SI joint","#34d399"],[38.9,9.8,"psoas","#7c2d12"],[43.6,63.4,"obturator externus","#7c2d12"],[85.9,50.6,"gluteus maximus","#7c2d12"],[22.9,48.5,"femoral neurovascular bundle","#991b1b"]],
          25: [[36.2,49.7,"superior pubic ramus","#1e3a8a"],[53.7,69.2,"inferior pubic ramus","#1e3a8a"],[96.2,33.2,"gluteus maximus","#7c2d12"]],
          26: [[78.7,22.4,"piriformis","#7c2d12"],[39.7,60.9,"obturator externus","#7c2d12"],[48.5,75.5,"inferior pubic ramus","#1e3a8a"],[34.6,50.3,"superior pubic ramus","#1e3a8a"]],
          27: [[74,5.8,"sacrum","#1e3a8a"],[29.2,81.6,"adductor longus","#7c2d12"],[32.6,71.1,"pectineus","#7c2d12"]],
          28: [[12.3,15.9,"rectus abdominis","#7c2d12"],[40,77.1,"adductor brevis","#7c2d12"],[28.9,74,"adductor longus","#7c2d12"],[30.5,60.7,"pectineus","#7c2d12"]],
        },
      },
    },
    view: 'MRI — hip',
    labels: {
      bones:    [[68,48,'Femoral head','#1e3a8a'],[50,28,'Acetabulum','#1e3a8a'],[22,35,'Ilium','#1e3a8a'],[50,72,'Femoral neck','#1e3a8a']],
      tendons:  [[58,55,'Iliopsoas t.','#14532d'],[72,42,'Labrum','#14532d'],[80,58,'Conjoined hamstring t.','#14532d'],[40,62,'Adductor t.','#14532d']],
      muscles:  [[82,48,'Gluteus max','#7c2d12'],[68,32,'Gluteus med/min','#7c2d12'],[30,50,'Iliopsoas m.','#7c2d12'],[60,68,'Short ext. rotators','#7c2d12']],
      nerves:   [[75,62,'Sciatic n.','#92400e'],[42,45,'Femoral n.','#92400e'],[55,60,'Obturator n.','#92400e']],
      arteries: [[45,52,'Femoral a.','#991b1b'],[62,38,'Med. circumflex fem. a.','#991b1b']],
      veins:    [[47,55,'Femoral v.','#4c1d95']],
    },
  },
  knee: {
    label: 'Knee',
    region: 'Lower Extremity',
    useLocalMRI: true,
    defaultSlice: 14,
    sequences: {
      ax_pdfs: {
        label: 'Ax PDFS',
        path: '/atlas/ax-knee-pdfs/MRI%20KNEE%20W%20O%20CONTRAST%20RIGHT%20',
        slices: Array.from({length:27},(_,i)=>i+1),
        ext: '.jpg',
        pad: 4,
        permanentLabels: {
          1: [[49,47,"femur","#1e3a8a"],[43.3,71.5,"sciatic nerve","#92400e"],[62.5,86.3,"semitendinosus","#7c2d12"],[72.8,78.7,"gracilis","#7c2d12"],[78.9,70.6,"sartorius","#7c2d12"],[31.2,69.3,"biceps femoris, short head","#7c2d12"],[37.3,80.7,"biceps femoris, long head","#7c2d12"],[50.8,26.5,"quadriceps","#7c2d12"],[32.1,43.3,"vastus lateralis","#7c2d12"],[73.5,61.2,"adductor magnus","#7c2d12"],[55.3,62.7,"popliteal artery","#991b1b"]],
          2: [[35.3,80.3,"biceps femoris, long head","#7c2d12"],[50.4,24.9,"quadriceps","#7c2d12"],[69.9,40.2,"vastus medialis","#7c2d12"],[51.5,65.4,"popliteal vein(s)","#4c1d95"]],
          3: [[42.5,71.7,"sciatic nerve","#92400e"],[77.4,70.8,"sartorius","#7c2d12"],[31,66.8,"biceps femoris, short head","#7c2d12"],[30.8,45.6,"vastus lateralis","#7c2d12"],[72.6,61.2,"adductor magnus","#7c2d12"]],
          4: [[72,78.7,"gracilis","#7c2d12"],[51.3,21.5,"quadriceps","#7c2d12"],[52.8,64.3,"popliteal artery","#991b1b"],[51.7,26,"suprapatellar / quadriceps fat pad","#1e3a8a"]],
          5: [[24.5,69.2,"biceps femoris","#7c2d12"],[70.2,40.9,"vastus medialis","#7c2d12"],[51,32.5,"prefemoral fat pad","#14532d"],[49.6,68.4,"popliteal vein(s)","#4c1d95"]],
          6: [[43.1,73.1,"tibial nerve","#92400e"],[37.9,74.9,"common peroneal nerve","#92400e"],[42,75.1,"medial sural cutaneous nerve","#92400e"],[39.1,76.4,"lateral sural cutaneous nerve","#92400e"],[57.8,78,"semimembranosus","#7c2d12"],[68.3,75.1,"semimembranosus","#7c2d12"],[64.7,84.6,"semitendinosus","#7c2d12"],[77.6,71.7,"sartorius","#7c2d12"],[24.5,67.7,"biceps femoris","#7c2d12"]],
          7: [[37,75.8,"common peroneal nerve","#92400e"],[71.3,78.2,"gracilis","#7c2d12"],[73.5,41.1,"vastus medialis","#7c2d12"],[50.6,65.2,"popliteal artery","#991b1b"]],
          8: [[35.3,76,"common peroneal nerve","#92400e"],[42,76.9,"medial sural cutaneous nerve","#92400e"],[36.8,78.3,"lateral sural cutaneous nerve","#92400e"],[54.2,22.6,"patella","#1e3a8a"],[60.5,26.3,"medial patellar facet","#67e8f9"],[52.8,28.9,"central ridge of patella","#67e8f9"],[44.5,26,"lateral patellar facet","#67e8f9"],[67.9,75.1,"semimembranosus","#7c2d12"],[57.3,77.6,"semimembranosus","#7c2d12"],[47.6,71,"popliteal vein(s)","#4c1d95"]],
          9: [[43.8,76,"tibial nerve","#92400e"],[33.5,77.1,"common peroneal nerve","#92400e"],[42.4,78.3,"medial sural cutaneous nerve","#92400e"],[66.3,83.2,"semitendinosus","#7c2d12"],[76.9,72,"sartorius","#7c2d12"],[48.3,65.9,"popliteal artery","#991b1b"],[47.2,70.6,"popliteal vein(s)","#4c1d95"]],
          10: [[32.3,76.9,"common peroneal nerve","#92400e"],[53,21.8,"patella","#1e3a8a"],[71.3,33.9,"medial patellofemoral ligament","#14532d"],[30.7,32.3,"lateral patellofemoral ligament","#14532d"],[70.4,76.5,"gracilis","#7c2d12"],[22.9,66.3,"biceps femoris","#7c2d12"],[65.9,29.2,"medial plica","#14532d"],[43.1,25.8,"joint fluid","#1e3a8a"]],
          11: [[44.5,74.6,"tibial nerve","#92400e"],[43.6,82.7,"medial sural cutaneous nerve","#92400e"],[32.6,79.2,"lateral sural cutaneous nerve","#92400e"],[51.3,22,"patella","#1e3a8a"],[68.1,76,"semimembranosus","#7c2d12"],[40,77.1,"lateral gastrocnemius","#7c2d12"],[48.1,67.4,"popliteal artery","#991b1b"]],
          12: [[29.4,77.1,"common peroneal nerve","#92400e"],[44.3,83.6,"medial sural cutaneous nerve","#92400e"],[50.6,34.1,"trochlear groove","#67e8f9"],[67.5,81.4,"semitendinosus","#7c2d12"],[76.9,71.7,"sartorius","#7c2d12"],[81.4,49.7,"MCL","#14532d"],[48.5,57.5,"ACL","#14532d"],[24.5,54.9,"LCL","#14532d"],[51.3,27.2,"Hoffa's fat pad","#14532d"],[39.1,23.6,"Location for edema in fat pad impingement","#14532d"],[35.5,67.7,"posterior lateral femoral condyle cartilage","#67e8f9"],[70.4,68.8,"posterior medial femoral condyle cartilage","#67e8f9"]],
          13: [[28.9,76.9,"common peroneal nerve","#92400e"],[57.8,31.9,"medial trochlear facet","#67e8f9"],[42.5,29.9,"lateral trochlear facet","#67e8f9"],[51.3,35.3,"trochlear groove","#67e8f9"],[62.7,71.3,"medial gastrocnemius","#7c2d12"],[55.8,71.3,"medial gastrocnemius","#7c2d12"],[24.4,56,"LCL","#14532d"],[28.3,36.8,"IT band","#14532d"],[39.3,72.6,"plantaris","#7c2d12"],[38.8,78.2,"lateral gastrocnemius","#7c2d12"],[46.9,71.1,"popliteal vein(s)","#4c1d95"]],
          14: [[45.4,74.6,"tibial nerve","#92400e"],[44.9,86.1,"medial sural cutaneous nerve","#92400e"],[31.4,81,"lateral sural cutaneous nerve","#92400e"],[49.7,19,"patellar tendon","#1e3a8a"],[69,29.4,"medial patellofemoral retinaculum","#14532d"],[32.6,27.4,"lateral patellofemoral retinaculum","#14532d"],[66.8,74,"semimembranosus","#7c2d12"],[71.5,73.5,"gracilis","#7c2d12"],[49.4,53.7,"ACL","#14532d"],[57.6,53.5,"PCL","#14532d"],[22.9,56.7,"LCL","#14532d"],[21.1,65.4,"biceps femoris","#7c2d12"],[25.6,56.2,"popliteus","#7c2d12"],[51.2,27.2,"Hoffa's fat pad","#14532d"],[27.8,68.1,"fabella","#7c2d12"]],
          15: [[26.5,76.2,"common peroneal nerve","#92400e"],[64.1,72.2,"Baker cyst neck location","#7c2d12"],[54.9,71.1,"medial gastrocnemius","#7c2d12"],[68.3,77.6,"semitendinosus","#7c2d12"],[81,51,"MCL","#14532d"],[50.1,50.6,"ACL","#14532d"],[55.5,56.2,"PCL","#14532d"],[22.6,57.6,"LCL","#14532d"],[37.5,72.6,"plantaris","#7c2d12"],[24,59.4,"popliteus","#7c2d12"],[45.4,67.7,"popliteal artery","#991b1b"],[24,64.8,"fabellofibular ligament","#1e3a8a"]],
          16: [[46.3,86.8,"medial sural cutaneous nerve","#92400e"],[48.5,21.3,"patellar tendon","#1e3a8a"],[66.8,28.5,"medial patellofemoral retinaculum","#14532d"],[33.9,26.9,"lateral patellofemoral retinaculum","#14532d"],[63.9,73.7,"medial gastrocnemius","#7c2d12"],[66.3,71.1,"semimembranosus","#7c2d12"],[76.9,69,"sartorius","#7c2d12"],[51.9,47.9,"ACL","#14532d"],[52.2,58.5,"PCL","#14532d"],[29.9,44.7,"lateral meniscus, anterior horn","#14532d"],[24.5,54.4,"lateral meniscus, body","#14532d"],[33.5,61.8,"lateral meniscus, posterior horn","#14532d"],[20.8,58.7,"LCL","#14532d"],[28,33.7,"IT band","#14532d"],[36.6,80.1,"lateral gastrocnemius","#7c2d12"],[23.1,64.3,"fabellofibular ligament","#1e3a8a"],[44.7,46.3,"anterior root ligament, lateral meniscus","#14532d"],[46.3,56.7,"posterior root ligament, lateral meniscus","#14532d"],[56.9,44.2,"anterior root ligament, medial meniscus","#14532d"]],
          17: [[64.1,72.8,"medial gastrocnemius","#7c2d12"],[71.7,70.6,"gracilis","#7c2d12"],[51.5,58.9,"PCL","#14532d"],[65.7,61.1,"medial meniscus, posterior horn","#14532d"],[73.3,49,"medial meniscus, body","#14532d"],[64.7,38,"medial meniscus, anterior horn","#14532d"],[20.9,58.5,"LCL","#14532d"],[20,64.1,"biceps femoris","#7c2d12"],[42.9,72.8,"plantaris","#7c2d12"],[26.9,63.8,"popliteus","#7c2d12"],[22.4,64.3,"fabellofibular ligament","#1e3a8a"],[35.7,51,"lateral tibial plateau","#1e3a8a"],[67.5,47.2,"medial tibial plateau","#1e3a8a"],[58.2,58,"posterior root ligament, medial meniscus","#14532d"]],
          18: [[22,72.4,"common peroneal nerve","#92400e"],[46.9,87.5,"medial sural cutaneous nerve","#92400e"],[28.9,80.5,"lateral sural cutaneous nerve","#92400e"],[47.4,22.9,"patellar tendon","#1e3a8a"],[69.7,75.3,"semitendinosus","#7c2d12"],[78,51.2,"MCL","#14532d"],[50.6,60.7,"PCL","#14532d"],[19.9,59.1,"LCL","#14532d"],[19.3,63.6,"biceps femoris","#7c2d12"],[46,69.5,"popliteal vein(s)","#4c1d95"]],
          19: [[46.7,71.1,"tibial nerve","#92400e"],[46.5,23.3,"patellar tendon","#1e3a8a"],[66.6,69,"semimembranosus","#7c2d12"],[71.9,68.1,"gracilis","#7c2d12"],[18.8,63,"conjoined tendon","#14532d"],[28.9,37.5,"Gerdy's tubercle","#1e3a8a"],[27.8,34.4,"IT band","#14532d"],[45.1,72.9,"plantaris","#7c2d12"],[37.9,81.4,"lateral gastrocnemius","#7c2d12"],[32.3,65.7,"popliteus","#7c2d12"],[42.7,67.7,"popliteal artery","#991b1b"]],
          20: [[19,70.1,"common peroneal nerve","#92400e"],[66.8,67,"semimembranosus","#7c2d12"],[73.8,62.9,"sartorius","#7c2d12"],[75.6,51,"MCL","#14532d"]],
          21: [[49.2,88.1,"medial sural cutaneous nerve","#92400e"],[28.9,80.9,"lateral sural cutaneous nerve","#92400e"],[45.6,24.4,"patellar tendon","#1e3a8a"],[40.2,27.1,"deep infrapatellar bursa","#1e3a8a"],[69.7,71.5,"semitendinosus","#7c2d12"],[46.7,73.1,"plantaris","#7c2d12"],[25.3,56.6,"proximal tibiofibular joint","#1e3a8a"]],
          22: [[46.9,68.1,"tibial nerve","#92400e"],[16.3,67.7,"common peroneal nerve","#92400e"],[70.4,64.3,"gracilis","#7c2d12"],[37.1,69.3,"soleus","#7c2d12"],[40.7,62.3,"popliteus","#7c2d12"]],
          23: [[43.8,24,"patellar tendon","#1e3a8a"],[42.9,65.7,"popliteal vein(s)","#4c1d95"],[36.6,64.7,"popliteal vein(s)","#4c1d95"]],
          24: [[16.6,65.6,"common peroneal nerve","#92400e"],[44.5,26.9,"tibial tubercle","#1e3a8a"],[69,64.1,"semitendinosus","#7c2d12"],[50.4,72.9,"plantaris","#7c2d12"],[40.7,71,"soleus","#7c2d12"],[44.2,60,"popliteus","#7c2d12"],[38.4,65.2,"popliteal artery","#991b1b"],[25.3,61.1,"fibula","#1e3a8a"],[46.5,43.4,"tibia","#1e3a8a"]],
          25: [[46.3,65.6,"tibial nerve","#92400e"],[44.2,26.2,"tibial tubercle","#1e3a8a"],[67.5,56.2,"gracilis","#7c2d12"]],
          26: [[17.9,63.8,"common peroneal nerve","#92400e"],[66.5,56.7,"semitendinosus","#7c2d12"],[53.3,72.2,"plantaris","#7c2d12"]],
          27: [[44.5,64.5,"tibial nerve","#92400e"],[40.6,70.4,"soleus","#7c2d12"],[48.8,58.4,"popliteus","#7c2d12"],[40,84.1,"lateral gastrocnemius","#7c2d12"],[64.1,79.6,"medial gastrocnemius","#7c2d12"],[48.5,69.7,"soleus","#7c2d12"],[54.4,73.1,"plantaris","#7c2d12"],[31,40,"tibialis anterior","#1e3a8a"],[26.3,47.6,"extensor digitorum longus","#7c2d12"],[17.7,57.1,"peroneus longus","#7c2d12"],[48.8,63.9,"anterior aponeurosis","#14532d"],[47.9,77.8,"posterior aponeurosis","#14532d"],[52.1,81.6,"central intramuscular tendon","#14532d"]]
        },
      },
      cor_pdfs: {
        label: 'Cor PDFS',
        path: '/atlas/cor-knee-pdfs/MRI%20KNEE%20W%20O%20CONTRAST%20RIGHT%20',
        slices: Array.from({length:21},(_,i)=>i+57),
        ext: '.jpg',
        pad: 4,
        permanentLabels: {
          57: [[63.9,36.1,"semitendinosus","#7c2d12"]],
          58: [[73.8,5.6,"gracilis","#7c2d12"],[66.8,54.2,"semitendinosus","#7c2d12"]],
          59: [[37.1,58.9,"lateral gastrocnemius","#7c2d12"],[59.6,19.5,"semimembranosus","#7c2d12"],[75.8,32.8,"sartorius","#7c2d12"],[73.3,27.8,"gracilis","#7c2d12"],[68.6,66.1,"semitendinosus","#7c2d12"]],
          60: [[35.9,41.8,"common peroneal nerve","#92400e"],[43.4,36.8,"tibial nerve","#92400e"],[38.2,53.1,"lateral gastrocnemius","#7c2d12"],[56.2,53,"medial gastrocnemius","#7c2d12"],[60.7,22.7,"semimembranosus","#7c2d12"],[78.3,26.2,"sartorius","#7c2d12"],[71.9,56.7,"gracilis","#7c2d12"],[69.5,74.2,"semitendinosus","#7c2d12"]],
          61: [[45.1,14.8,"sciatic nerve","#92400e"],[46.9,61.4,"tibial nerve","#92400e"],[25.3,66.6,"common peroneal nerve","#92400e"],[54.9,55.1,"medial gastrocnemius","#7c2d12"],[57.5,70.8,"medial gastrocnemius","#7c2d12"],[72.2,69.3,"gracilis","#7c2d12"],[70.6,80,"semitendinosus","#7c2d12"]],
          62: [[27.4,37.3,"biceps femoris","#7c2d12"],[20.8,79.1,"common peroneal nerve","#92400e"],[71.9,76.9,"gracilis","#7c2d12"],[70.4,85,"semitendinosus","#7c2d12"],[50.1,28.1,"popliteal artery","#991b1b"],[33.9,93.6,"soleus","#7c2d12"]],
          63: [[22.7,49.4,"biceps femoris","#7c2d12"],[17.5,86.1,"common peroneal nerve","#92400e"],[71.5,82.5,"gracilis","#7c2d12"],[53.5,28.3,"popliteal veins","#4c1d95"]],
          64: [[33,76.7,"popliteus","#7c2d12"],[20.6,65.7,"biceps femoris","#7c2d12"],[30.1,79.6,"popliteofibular ligament","#1e3a8a"],[17.3,94,"common peroneal nerve","#92400e"],[23.5,84.3,"fibula, epiphysis","#1e3a8a"],[26.2,90.6,"physis, proximal fibula","#1e3a8a"],[72,85,"gracilis","#7c2d12"]],
          65: [[49.7,56.2,"ACL","#14532d"],[50.8,72.8,"PCL tibial footprint","#1e3a8a"],[69,71.9,"medial meniscus, posterior horn","#14532d"],[57.1,70.4,"posterior root ligament, medial meniscus","#14532d"],[32.3,67.5,"lateral meniscus, posterior horn","#14532d"],[46.7,67.9,"posterior root ligament, lateral meniscus","#14532d"],[25.8,65.2,"popliteus","#7c2d12"],[18.6,77.6,"conjoined tendon","#14532d"],[27.8,96.3,"fibular metaphysis","#1e3a8a"]],
          66: [[50.8,59.4,"ACL","#14532d"],[54,64.1,"PCL","#14532d"],[80.7,62.9,"MCL, superficial fibers","#14532d"],[25.1,56.2,"LCL","#14532d"],[25.4,59.8,"popliteus","#7c2d12"],[26.7,83.4,"proximal tibiofibular joint","#1e3a8a"],[35,69.3,"lateral tibial plateau","#1e3a8a"],[69.3,73.7,"medial tibial plateau","#1e3a8a"],[33.2,67.4,"lateral tibiofemoral compartment cartilage","#67e8f9"]],
          67: [[70.6,62.7,"medial femoral condyle","#1e3a8a"],[35,58.5,"lateral femoral condyle","#1e3a8a"],[50.1,60.9,"ACL","#14532d"],[47.8,65,"lateral tibial spine","#1e3a8a"],[57.5,60.3,"PCL","#14532d"],[81.2,61.8,"posterior lateral femoral condyle cartilage","#67e8f9"],[78.3,67.2,"MCL deep fibers (meniscofemoral ligament)","#14532d"],[77.1,73.7,"MCL deep fibers (meniscotibial ligament)","#1e3a8a"],[74,71.3,"medial meniscus, body","#14532d"],[26.7,66.1,"lateral meniscus, body","#14532d"],[25.6,64.8,"lateral meniscus, body","#14532d"],[26.2,84.6,"proximal tibiofibular joint","#1e3a8a"],[48.3,74,"tibial epiphysis","#1e3a8a"],[49,79.4,"physis, proximal tibia","#1e3a8a"],[23.1,62.5,"anterolateral ligament","#14532d"]],
          68: [[49.4,6.9,"femoral diaphysis","#1e3a8a"],[50.6,32.5,"femoral metaphysis","#1e3a8a"],[51.9,45.1,"femoral distal physis","#1e3a8a"],[51.2,64.5,"ACL","#14532d"],[57.1,65.7,"medial tibial spine","#1e3a8a"],[70.4,70.2,"free edge / white-white zone","#7c2d12"],[74.7,69.9,"red-white zone","#7c2d12"],[77.4,69.7,"red-red zone","#7c2d12"],[24.9,46.7,"IT band","#14532d"],[32.1,14.8,"vastus lateralis","#7c2d12"],[68.3,70.1,"medial tibiofemoral compartment cartilage","#67e8f9"]],
          69: [[61.4,55.1,"femoral epiphysis","#1e3a8a"],[51.7,63.8,"ACL","#14532d"],[53.1,67.5,"ACL tibial footprint","#1e3a8a"],[29.2,65.2,"lateral meniscus, anterior horn","#14532d"],[26.2,43.1,"IT band","#14532d"]],
          70: [[73.1,68.4,"medial meniscus, anterior horn","#14532d"],[45.1,68.8,"anterior root ligament, lateral meniscus","#14532d"],[26.9,44.3,"IT band","#14532d"],[26,55.1,"IT band","#14532d"],[60.3,73.1,"tibial epiphysis","#1e3a8a"],[51.2,85.5,"tibial metaphysis","#1e3a8a"]],
          71: [[27.8,70.4,"Gerdy's tubercle","#1e3a8a"],[27.2,59.4,"IT band","#14532d"]],
          72: [[62,66.8,"anterior root ligament, medial meniscus","#14532d"],[68.1,12.7,"vastus medialis","#7c2d12"]],
          73: [[49.9,6.5,"quadriceps","#7c2d12"],[50.6,61.8,"Hoffa's fat pad","#14532d"]],
          74: [[52.8,11.9,"quadriceps","#7c2d12"],[53.1,23.5,"quadriceps/suprapatellar fat pad","#1e3a8a"],[64.7,43.1,"joint fluid","#1e3a8a"]],
          75: [[53,17,"quadriceps","#7c2d12"],[46.1,87.9,"tibial tubercle","#1e3a8a"]],
          76: [[53.1,24,"quadriceps","#7c2d12"],[51.7,38.6,"patella","#1e3a8a"],[49.6,70.6,"patellar tendon","#1e3a8a"]],
          77: [[53,42.5,"patella","#1e3a8a"],[49.4,60.7,"patellar tendon","#1e3a8a"]]
        },
      },
      sag_pdfs: {
        label: 'Sag PDFS',
        path: '/atlas/sag-knee-pdfs/MRI%20KNEE%20W%20O%20CONTRAST%20RIGHT%20',
        slices: Array.from({length:29},(_,i)=>i+28),
        ext: '.jpg',
        pad: 4,
        permanentLabels: {
          30: [[53.3,56.7,"MCL","#14532d"]],
          31: [[71.7,22,"sartorius","#7c2d12"]],
          32: [[74.2,17.9,"sartorius","#7c2d12"],[61.8,82.3,"sartorius","#7c2d12"],[48.5,10,"vastus medialis","#7c2d12"],[51,63,"medial meniscus, body","#14532d"]],
          33: [[69.5,50.8,"medial femoral condyle posterior articular surface","#67e8f9"],[71.5,77.8,"semitendinosus","#7c2d12"],[72.9,12.1,"sartorius","#7c2d12"],[64.8,62.7,"medial meniscocapsular junction","#14532d"]],
          34: [[47.9,62.3,"medial tibiofemoral compartment articular cartilage","#67e8f9"],[75.5,66.6,"semitendinosus","#7c2d12"],[78.2,17.2,"gracilis","#7c2d12"],[71.3,67.2,"gracilis","#7c2d12"]],
          35: [[78.9,57.6,"semitendinosus","#7c2d12"],[38,60.7,"medial meniscus, anterior horn","#14532d"]],
          36: [[50.8,56.6,"medial femoral condyle","#1e3a8a"],[76.9,28.3,"semimembranosus","#7c2d12"],[81.8,46.5,"semitendinosus","#7c2d12"],[62.1,63.2,"medial meniscus, posterior horn","#14532d"]],
          37: [[78,15.9,"semimembranosus","#7c2d12"],[83.4,32.8,"semitendinosus","#7c2d12"],[39.3,5.5,"vastus medialis","#7c2d12"]],
          38: [[30.1,48.7,"medial trochlear facet","#67e8f9"],[78,56.2,"medial gastrocnemius","#7c2d12"],[77.3,7.6,"semimembranosus","#7c2d12"],[57.3,53.1,"PCL femoral attachment","#14532d"]],
          39: [[28.3,34.3,"medial patellar facet","#67e8f9"],[81.6,56.9,"medial gastrocnemius","#7c2d12"],[59.8,62.7,"posterior root ligament, medial meniscus","#14532d"],[36.4,62.1,"anterior root ligament, medial meniscus","#14532d"],[54.9,53.9,"PCL","#14532d"]],
          40: [[77.6,9.8,"semimembranosus","#7c2d12"],[59.6,63.9,"posterior root ligament, medial meniscus","#14532d"],[57.6,57.3,"PCL","#14532d"],[38.8,59.6,"anterior intermeniscal ligament","#14532d"]],
          41: [[60,63,"PCL","#14532d"]],
          42: [[35,48.8,"trochlear groove","#67e8f9"],[30.8,34.4,"central ridge of patella","#67e8f9"],[77.1,6.9,"semimembranosus","#7c2d12"],[61.6,67.2,"PCL tibial footprint","#1e3a8a"],[44.3,62.9,"ACL tibial footprint","#1e3a8a"],[50.4,57.5,"ACL","#14532d"],[55.1,52.2,"ACL","#14532d"],[39.1,60.3,"anterior intermeniscal ligament","#14532d"]],
          43: [[47.8,6.7,"femoral diaphysis","#1e3a8a"],[72.8,63.6,"tibial nerve","#92400e"],[56.4,61.1,"posterior root ligament, lateral meniscus","#14532d"],[53.9,54.6,"ACL","#14532d"],[57.8,47.8,"ACL femoral attachment","#14532d"],[31.6,55.7,"infrapatellar plica","#1e3a8a"]],
          44: [[46.9,25.8,"femoral metaphysis","#1e3a8a"],[22.7,62.9,"patellar tendon","#1e3a8a"],[24.4,17.3,"quadriceps tendon","#14532d"],[15.7,40.4,"patellar expansion","#1e3a8a"],[61.6,89.9,"popliteus","#7c2d12"],[74.2,48.7,"tibial nerve","#92400e"],[70.8,43.1,"popliteal artery","#991b1b"],[69,44.5,"popliteal veins","#4c1d95"],[45.4,61.1,"anterior root ligament, lateral meniscus","#14532d"],[39.3,60.2,"anterior intermeniscal ligament","#14532d"]],
          45: [[28,89,"tibial tubercle","#1e3a8a"],[32.6,15.9,"prefemoral fat pad","#14532d"],[26,21.7,"suprapatellar/quadriceps fat pad","#1e3a8a"],[30.8,57.6,"Hoffa's fat pad","#14532d"],[76.5,6.9,"semimembranosus","#7c2d12"],[28.3,76,"deep infrapatellar bursa","#1e3a8a"]],
          46: [[27.1,34.3,"lateral patellar facet","#67e8f9"],[31,49.4,"lateral trochlear facet","#67e8f9"],[64.5,77.6,"popliteus","#7c2d12"],[73.8,29.8,"tibial nerve","#92400e"],[40.6,60.5,"anterior intermeniscal ligament","#14532d"]],
          47: [[64.1,63.8,"posterior inferior popliteomeniscal fascicle","#14532d"],[45.4,82.1,"tibial metaphysis","#1e3a8a"],[65,76.5,"popliteus","#7c2d12"],[71.9,8.9,"sciatic nerve","#92400e"]],
          48: [[52.2,55.5,"lateral femoral condyle","#1e3a8a"],[36.2,45.2,"femoral epiphysis","#1e3a8a"],[47.8,41.6,"distal femoral physis","#1e3a8a"],[46.7,74.2,"proximal tibial physis","#1e3a8a"],[65.2,72.6,"popliteus","#7c2d12"],[75.3,26.9,"common peroneal nerve","#92400e"]],
          49: [[81,60.3,"lateral gastrocnemius","#7c2d12"]],
          50: [[60.2,62.5,"lateral meniscus, posterior horn","#14532d"],[45.8,60.9,"lateral meniscus, anterior horn","#14532d"],[64.1,60.3,"posterior superior popliteomeniscal fascicle","#14532d"],[47.9,69.7,"tibial epiphysis","#1e3a8a"],[54,64.7,"lateral tibial plateau","#1e3a8a"],[68.3,48.7,"lateral femoral condyle posterior articular surface","#67e8f9"],[65.9,67.4,"popliteus","#7c2d12"],[40.9,5.1,"vastus lateralis","#7c2d12"]],
          51: [[63.2,63.4,"anterior inferior popliteomeniscal fascicle","#14532d"],[53.5,62,"lateral tibiofemoral compartment cartilage","#67e8f9"],[64.1,92,"fibular metaphysis","#1e3a8a"],[63.2,85.4,"proximal fibular physis","#1e3a8a"],[60.5,77.8,"proximal tibiofibular joint","#1e3a8a"],[72.9,48.1,"lateral gastrocnemius","#7c2d12"],[76,44.9,"common peroneal nerve","#92400e"]],
          52: [[54,61.6,"lateral meniscus, body","#14532d"],[64.1,65.2,"popliteus","#7c2d12"],[49.9,7.4,"vastus lateralis","#7c2d12"],[77.3,53.9,"common peroneal nerve","#92400e"]],
          53: [[64.1,80.1,"fibular epiphysis","#1e3a8a"],[60.7,58.4,"popliteus","#7c2d12"],[56.7,52.6,"popliteus","#7c2d12"],[49.9,6.5,"vastus lateralis","#7c2d12"],[74.6,62.7,"common peroneal nerve","#92400e"]],
          54: [[56.6,50.6,"LCL","#14532d"],[66.1,27.1,"biceps femoris","#7c2d12"]],
          55: [[68.3,32.3,"biceps femoris","#7c2d12"],[71.3,75.6,"common peroneal nerve","#92400e"]]
        },
      },
    },
    view: 'MRI — knee',
    labels: {
      bones:    [[50,38,'Distal femur','#1e3a8a'],[50,62,'Proximal tibia','#1e3a8a'],[72,38,'Patella','#1e3a8a'],[78,55,'Fibula','#1e3a8a']],
      tendons:  [[72,32,'Patellar tendon','#14532d'],[50,50,'ACL','#14532d'],[45,52,'PCL','#14532d'],[35,55,'Med. meniscus','#14532d'],[65,55,'Lat. meniscus','#14532d'],[28,48,'MCL','#14532d'],[72,48,'LCL','#14532d']],
      muscles:  [[78,38,'Biceps fem.','#7c2d12'],[74,58,'Gastroc. (lat)','#7c2d12'],[26,58,'Gastroc. (med)','#7c2d12']],
      nerves:   [[80,52,'Peroneal n.','#92400e'],[78,62,'Tibial n.','#92400e']],
      arteries: [[52,58,'Popliteal a.','#991b1b']],
      veins:    [[54,60,'Popliteal v.','#4c1d95']],
    },
  },
  ankle: {
    label: 'Ankle',
    region: 'Lower Extremity',
    useLocalMRI: true,
    defaultSlice: 15,
    sequences: {
      axial: {
        label: 'Axial',
        path: '/atlas/ankle/ankle_ax_',
        slices: Array.from({length:30},(_,i)=>i+1),
        ext: '.webp',
        pad: 0,
        permanentLabels: {
          1: [[47.6,54,"tibia","#1e3a8a"],[62.5,65.7,"fibula","#1e3a8a"],[49.7,44.3,"tibialis anterior","#7c2d12"],[39.3,62,"tibialis posterior","#7c2d12"],[37,65.4,"flexor digitorum longus","#7c2d12"],[45.8,73.1,"flexor hallucis longus","#7c2d12"],[48.5,84.1,"Achilles","#7c2d12"],[45.8,80,"soleus","#7c2d12"],[60,60.9,"interosseous membrane","#14532d"],[66.6,71.3,"peroneus brevis","#7c2d12"],[67,60,"superficial peroneal nerve","#92400e"]],
          3: [[56.4,46,"extensor digitorum longus","#7c2d12"]],
          4: [[65.2,56.6,"superficial peroneal nerve","#92400e"]],
          5: [[37.3,62.9,"tibialis posterior","#7c2d12"],[37.3,65.7,"flexor digitorum longus","#7c2d12"],[47.9,83.7,"Achilles","#7c2d12"],[66.6,70.6,"peroneus longus","#7c2d12"],[40.9,69.5,"tibial nerve","#92400e"]],
          6: [[45.1,41.6,"tibialis anterior","#7c2d12"],[44.2,70.8,"flexor hallucis longus","#7c2d12"],[64.5,71.1,"peroneus brevis","#7c2d12"]],
          7: [[49.6,41.3,"extensor hallucis longus","#7c2d12"],[54,43.1,"extensor digitorum longus","#7c2d12"],[65.6,69.9,"peroneus longus","#7c2d12"],[36.6,62.1,"tibialis posterior","#7c2d12"]],
          8: [[35.9,61.4,"tibialis posterior","#7c2d12"],[36.8,65,"flexor digitorum longus","#7c2d12"],[57.5,60,"interosseous ligament","#14532d"],[40.9,69,"tibial nerve","#92400e"],[50.1,43.6,"deep peroneal nerve","#92400e"]],
          9: [[36.4,65.2,"flexor digitorum longus","#7c2d12"],[44,69.9,"flexor hallucis longus","#7c2d12"],[47.9,83.7,"Achilles","#7c2d12"],[43.4,81,"plantaris","#7c2d12"],[64.8,69.7,"peroneus longus","#7c2d12"]],
          10: [[42.9,37.3,"tibialis anterior","#7c2d12"],[48.1,39.3,"extensor hallucis longus","#7c2d12"],[62,68.8,"peroneus brevis","#7c2d12"],[39.1,69.5,"tibial artery","#991b1b"],[37.9,67.5,"tibial veins","#4c1d95"]],
          11: [[33.2,60.5,"tibialis posterior","#7c2d12"],[36.6,64.3,"flexor digitorum longus","#7c2d12"],[63.8,70.1,"peroneus longus","#7c2d12"],[40.7,67.9,"tibial nerve","#92400e"],[39.3,68.6,"tarsal tunnel","#c084fc"]],
          12: [[46.5,37.1,"extensor hallucis longus","#7c2d12"],[52.4,39.5,"extensor digitorum longus","#7c2d12"],[43.1,69.9,"flexor hallucis longus","#7c2d12"],[49.6,84.8,"Achilles","#7c2d12"],[44.3,81.9,"plantaris","#7c2d12"],[61.2,67.9,"peroneus brevis","#7c2d12"],[62.5,52.2,"anterior inferior tibiofibular ligament","#14532d"],[55.1,66.6,"posterior inferior tibiofibular ligament","#14532d"],[46,55.1,"tibial plafond","#1e3a8a"],[58.7,50.1,"chaput tubercle","#1e3a8a"],[63.4,54.4,"wagstaffe tubercle","#1e3a8a"]],
          13: [[39.8,32.6,"tibialis anterior","#7c2d12"],[46.5,54.9,"talar dome","#1e3a8a"],[60.3,49.7,"anterior inferior tibiofibular ligament","#14532d"],[54,66.8,"posterior inferior tibiofibular ligament","#14532d"],[37.9,65.9,"tibial nerve","#92400e"],[29.6,60.9,"flexor retinaculum","#14532d"],[50.1,66.8,"volkmann tubercle","#1e3a8a"]],
          14: [[44.7,31.7,"extensor hallucis longus","#7c2d12"],[29.9,57.3,"tibialis posterior","#7c2d12"],[33.5,62.9,"flexor digitorum longus","#7c2d12"],[60.7,68.1,"peroneus brevis","#7c2d12"],[63.2,68.8,"peroneus longus","#7c2d12"],[54.4,80.7,"sural nerve","#92400e"],[60.2,49.9,"anterior inferior tibiofibular ligament","#14532d"],[53.5,66.5,"intermalleolar ligament","#14532d"],[32.1,53.3,"medial malleolus","#1e3a8a"]],
          15: [[52.8,35.2,"extensor digitorum longus","#7c2d12"],[49.7,85.7,"Achilles","#7c2d12"],[44.5,82.5,"plantaris","#7c2d12"],[63.4,70.8,"superior peroneal retinaculum","#14532d"],[54.8,78.2,"small saphenous vein","#4c1d95"],[34.3,53.9,"deltoid (posterior tibiotalar, deep)","#14532d"],[34.6,49.2,"deltoid (anterior tibiotalar, deep)","#14532d"],[32.5,43.8,"deltoid (tibionavicular, superficial)","#14532d"],[30.8,46.5,"deltoid (tibiospring, superficial)","#14532d"],[29.4,49.7,"deltoid (tibiocalcaneal, superficial)","#14532d"]],
          16: [[54.2,32.8,"extensor digitorum longus","#7c2d12"],[30.1,54,"tibialis posterior","#7c2d12"],[32.6,59.6,"flexor digitorum longus","#7c2d12"],[41.8,69.3,"flexor hallucis longus","#7c2d12"],[59.6,67.7,"peroneus brevis","#7c2d12"],[64.7,68.8,"superior peroneal retinaculum","#14532d"],[61.4,68.3,"retromalleolar groove","#c084fc"],[34.6,65.7,"tibial nerve","#92400e"],[35.7,66.3,"tarsal tunnel","#c084fc"],[31.4,45.2,"deltoid (tibiospring, superficial)","#14532d"],[63.6,59.4,"lateral malleolus","#1e3a8a"]],
          17: [[34.6,25.8,"tibialis anterior","#7c2d12"],[38.8,17.2,"extensor hallucis longus","#7c2d12"],[42.4,46.9,"talar neck","#1e3a8a"],[46.1,55.7,"talar body","#1e3a8a"],[37.7,65.4,"medial tubercle, posterior process talus","#1e3a8a"],[46.1,68.8,"lateral tubercle, posterior process talus","#1e3a8a"],[60,51.5,"ATFL","#14532d"],[58.7,61.1,"PTFL","#14532d"],[56.2,81,"sural nerve","#92400e"]],
          18: [[35,10,"extensor hallucis longus","#7c2d12"],[31.7,58.4,"flexor digitorum longus","#7c2d12"],[39.8,67,"flexor hallucis longus","#7c2d12"],[48.3,87.3,"Achilles","#7c2d12"],[42,83,"plantaris","#7c2d12"],[41.5,37.1,"talar head","#1e3a8a"],[58.5,63.4,"CFL","#14532d"],[62.5,66.3,"peroneus longus","#7c2d12"],[33.5,63.6,"tibial nerve","#92400e"],[29.8,43.8,"spring ligament complex, superomedial bundle","#14532d"]],
          19: [[28.9,48.1,"tibialis posterior","#7c2d12"],[61.4,60.9,"peroneus brevis","#7c2d12"],[45.2,18.6,"2nd/intermediate cuneiform","#1e3a8a"],[59.1,63.4,"CFL","#14532d"],[63.6,60.5,"inframalleolar region","#c084fc"],[29.6,43.6,"spring ligament complex, superomedial bundle","#14532d"],[48.5,48.7,"sinus tarsi","#c084fc"],[54,54.8,"posterior subtalar joint","#14532d"],[37.9,53.3,"middle subtalar joint","#14532d"]],
          20: [[31,20.6,"tibialis anterior","#7c2d12"],[28.1,40.7,"tibialis posterior","#7c2d12"],[37.5,59.3,"flexor hallucis longus","#7c2d12"],[47.6,88.1,"Achilles","#7c2d12"],[40,83.4,"plantaris","#7c2d12"],[39.1,31.6,"navicular","#1e3a8a"],[58.7,40.7,"bifurcate ligament complex","#14532d"],[40.6,57.5,"sustentaculum talis","#1e3a8a"],[62,35.3,"extensor digitorum brevis","#7c2d12"]],
          21: [[34.1,37,"tibialis posterior","#7c2d12"],[33,49.6,"flexor digitorum longus","#7c2d12"],[62.3,54.9,"peroneus brevis","#7c2d12"],[46.1,10.5,"2nd metatarsal","#1e3a8a"],[40.9,12.7,"Lisfranc Ligament (inteosseous)","#14532d"],[34.4,19.9,"1st/medial cuneiform","#1e3a8a"],[62.5,60.3,"peroneus longus","#7c2d12"],[34.4,58.7,"tibial nerve","#92400e"],[42.9,40.2,"spring ligament complex, inferoplantar longitudinal","#14532d"],[37.7,39.7,"spring ligament complex, medial oblique","#14532d"],[61.8,43.6,"dorsal calcaneocuboid ligament","#14532d"]],
          22: [[30.1,16.6,"tibialis anterior","#7c2d12"],[39.8,51.7,"flexor hallucis longus","#7c2d12"],[61.2,54.9,"peroneal tubercle","#1e3a8a"],[35.3,5.6,"1st metatarsal","#1e3a8a"],[52.8,22.2,"3rd/lateral cuneiform","#1e3a8a"],[50.4,69,"calcaneus","#1e3a8a"]],
          23: [[41.1,33.7,"flexor digitorum longus","#7c2d12"],[39.8,41.1,"Knot of Henry","#7c2d12"],[63.8,44.9,"peroneus brevis","#7c2d12"],[54.4,9.6,"3rd metatarsal","#1e3a8a"],[42.2,17.9,"Lisfranc ligament, C1-M2","#14532d"],[61.2,55.5,"peroneus longus","#7c2d12"],[35.9,49.2,"medial planar nerve","#92400e"]],
          24: [[39.5,28.3,"flexor hallucis longus","#7c2d12"],[65.4,40.9,"peroneus brevis","#7c2d12"],[60,15.9,"4th metatarsal","#1e3a8a"],[46.3,17,"Lisfranc C1-M3","#14532d"],[56.9,33,"cuboid","#1e3a8a"],[61.1,49,"peroneus longus","#7c2d12"]],
          25: [[37.5,17.3,"flexor hallucis longus","#7c2d12"],[65.6,40.2,"peroneus brevis","#7c2d12"],[55.8,38,"peroneus longus","#7c2d12"],[50.8,24.4,"peroneus longus","#7c2d12"]],
          26: [[66.6,35.3,"peroneus brevis","#7c2d12"],[66.5,22.6,"5th metatarsal metaphysis (Jones)","#1e3a8a"],[67.4,16.3,"5th metatarsal diaphysis (Stress)","#1e3a8a"]],
          27: [[65.6,36.8,"lateral cord of plantar fascia","#14532d"],[65.7,32.6,"5th metatarsal tuberosity","#1e3a8a"],[47.9,72,"plantar fascia","#14532d"],[60.9,46.7,"abductor digiti minimi","#7c2d12"],[50.3,49.4,"flexor digitorum brevis","#7c2d12"],[40.7,47.6,"abductor hallucis","#7c2d12"]]
        },
      },
      coronal: {
        label: 'Coronal',
        path: '/atlas/ankle/ankle_cor_',
        slices: Array.from({length:31},(_,i)=>i+1),
        ext: '.webp',
        pad: 0,
        permanentLabels: {
          1: [[34.4,65.9,"1st metatarsal","#1e3a8a"],[45.2,66.1,"2nd metatarsal","#1e3a8a"],[54.8,70.8,"3rd metatarsal","#1e3a8a"],[60.3,75.3,"4th metatarsal","#1e3a8a"],[69.3,81.4,"5th metatarsal","#1e3a8a"],[45.6,88.2,"plantar fascia, central cord","#14532d"],[25.3,77.8,"abductor hallucis","#7c2d12"],[33.4,83.4,"flexor hallucis longus","#7c2d12"],[33,57.8,"extensor hallucis longus","#7c2d12"]],
          2: [[55.7,62.9,"extensor digitorum brevis","#7c2d12"]],
          3: [[43.4,86.3,"flexor digitorum brevis","#7c2d12"],[42.2,72.8,"peroneus longus","#7c2d12"]],
          4: [[26.9,76.7,"abductor hallucis","#7c2d12"],[41.3,60,"Lisfranc ligament, interosseous","#14532d"],[40.9,52.4,"Lisfranc ligament, dorsal","#14532d"],[41.8,71,"Lisfranc ligament, C1-M2","#14532d"],[35.2,79.4,"flexor hallucis longus","#7c2d12"],[44.5,80.5,"flexor digitorum longus","#7c2d12"],[34.6,52.6,"extensor hallucis longus","#7c2d12"],[36.6,62.5,"1st/medial cuneiform","#1e3a8a"],[45.4,60,"2nd/intermediate cuneiform","#1e3a8a"]],
          5: [[45.2,87.2,"plantar fascia, central cord","#14532d"],[26,80.5,"plantar fascia, medial cord","#14532d"],[46.7,74.6,"peroneus longus","#7c2d12"],[40,51.9,"Lisfranc ligament, dorsal","#14532d"],[40.4,59.1,"Lisfranc ligament, interosseous","#14532d"],[40.4,68.8,"Lisfranc ligament, C1-M2","#14532d"],[43.4,70.2,"Lisfranc ligament, C1-M3","#14532d"],[28.9,59.8,"tibialis anterior","#7c2d12"],[34.1,62.9,"1st/medial cuneiform","#1e3a8a"],[45.2,59.3,"2nd/intermediate cuneiform","#1e3a8a"],[52.8,66.1,"3rd/lateral cuneiform","#1e3a8a"]],
          6: [[44.5,69,"Lisfranc ligament, C1-M3","#14532d"],[60,60,"extensor digitorum brevis","#7c2d12"],[37.1,49.7,"extensor hallucis longus","#7c2d12"],[56,54.4,"extensor digitorum longus","#7c2d12"],[33.2,64.3,"1st/medial cuneiform","#1e3a8a"],[44.7,60.3,"2nd/intermediate cuneiform","#1e3a8a"],[53.3,64.1,"3rd/lateral cuneiform","#1e3a8a"]],
          7: [[28.5,73.1,"abductor hallucis","#7c2d12"],[38,75.6,"flexor hallucis longus","#7c2d12"],[42.7,77.4,"flexor digitorum longus","#7c2d12"],[38.9,48.7,"extensor hallucis longus","#7c2d12"],[32.8,53.5,"tibialis anterior","#7c2d12"],[40.7,68.3,"tibialis posterior","#7c2d12"],[36.8,79.4,"medial plantar nerve","#92400e"],[53.5,81.8,"lateral plantar nerve","#92400e"],[34.1,63.8,"1st/medial cuneiform","#1e3a8a"],[44.7,57.3,"2nd/intermediate cuneiform","#1e3a8a"],[52.8,63.8,"3rd/lateral cuneiform","#1e3a8a"]],
          8: [[45.1,87,"plantar fascia, central cord","#14532d"],[65.7,88.1,"plantar fascia, lateral cord","#14532d"],[27.1,74.9,"plantar fascia, medial cord","#14532d"],[42.9,83.2,"flexor digitorum brevis","#7c2d12"],[50.8,77.1,"peroneus longus","#7c2d12"],[41.6,76,"flexor digitorum longus","#7c2d12"],[34.3,49.4,"tibialis anterior","#7c2d12"],[46,46.1,"extensor hallucis longus","#7c2d12"],[51.9,49.2,"extensor digitorum longus","#7c2d12"],[39.7,67.7,"tibialis posterior","#7c2d12"],[52.6,63.2,"3rd/lateral cuneiform","#1e3a8a"]],
          9: [[41.5,74.2,"flexor digitorum longus","#7c2d12"],[62.9,60.9,"extensor digitorum brevis","#7c2d12"],[37.1,76.4,"medial plantar nerve","#92400e"],[42.4,56.7,"navicular","#1e3a8a"],[58.5,57.5,"deep peroneal nerve and dorsalis pedis artery","#92400e"]],
          10: [[29.6,77.3,"plantar fascia, medial cord","#14532d"],[29.8,72.6,"abductor hallucis","#7c2d12"],[45.4,76.7,"quadratus plantae","#7c2d12"],[69.2,78.9,"peroneus brevis","#7c2d12"],[39.7,72.4,"flexor hallucis longus","#7c2d12"],[41.6,37.9,"tibialis anterior","#7c2d12"],[46.9,38.9,"extensor hallucis longus","#7c2d12"],[53,45.6,"extensor digitorum longus","#7c2d12"],[38,67,"tibialis posterior","#7c2d12"],[54.2,81.8,"lateral plantar nerve","#92400e"],[58.7,72.9,"cuboid","#1e3a8a"],[41.6,55.7,"navicular","#1e3a8a"]],
          11: [[66.8,87.3,"plantar fascia, lateral cord","#14532d"],[64.3,83.7,"abductor digiti minimi","#7c2d12"],[56.9,80.1,"peroneus longus","#7c2d12"],[40.4,72.6,"flexor digitorum longus","#7c2d12"],[37.7,71.1,"Knot of Henry","#7c2d12"],[40,70.8,"flexor hallucis longus","#7c2d12"],[53.1,44.3,"extensor digitorum longus","#7c2d12"],[36.6,65.6,"tibialis posterior","#7c2d12"],[58.9,71.7,"cuboid","#1e3a8a"],[38.9,57.3,"navicular","#1e3a8a"],[52.1,52.2,"bifurcate ligament, navicular limb","#14532d"],[55.7,54.9,"deep peroneal nerve and dorsalis pedis artery","#92400e"]],
          12: [[41.8,85.9,"plantar fascia, central cord","#14532d"],[65,86.3,"plantar fascia, lateral cord","#14532d"],[42.4,80.3,"flexor digitorum brevis","#7c2d12"],[67.2,74.4,"peroneus brevis","#7c2d12"],[62.9,60.9,"extensor digitorum brevis","#7c2d12"],[45.2,21.8,"tibialis anterior","#7c2d12"],[49.4,30.1,"extensor hallucis longus","#7c2d12"],[54,36.1,"extensor digitorum longus","#7c2d12"],[32.6,50.5,"deltoid complex, tibionavicular (superficial)","#14532d"],[33.7,64.3,"tibialis posterior","#7c2d12"],[37.9,73.8,"medial plantar nerve","#92400e"],[52.2,80.7,"lateral plantar nerve","#92400e"],[58,70.1,"cuboid","#1e3a8a"],[29.9,61.4,"navicular tuberosity","#1e3a8a"],[52.4,53.1,"bifurcate ligament, navicular limb","#14532d"]],
          13: [[43.6,74.2,"quadratus plantae","#7c2d12"],[49.2,11.9,"tibialis anterior","#7c2d12"],[52.2,17,"extensor hallucis longus","#7c2d12"],[56.7,22.7,"extensor digitorum longus","#7c2d12"],[31.7,48.5,"deltoid complex, tibionavicular (superficial)","#14532d"],[30.3,60.7,"tibialis posterior","#7c2d12"],[33.7,64.5,"tibialis posterior","#7c2d12"],[35.9,62.5,"spring ligament complex","#14532d"],[46.5,60.9,"anterior subtalar joint","#1e3a8a"],[57.5,65.6,"calcaneocuboid joint","#1e3a8a"],[59.1,59.1,"bifurcate ligament, cuboid limb","#14532d"],[55.3,56,"bifurcate ligament, navicular limb","#14532d"],[55.3,35,"deep peroneal nerve and dorsalis pedis artery","#92400e"],[53.9,50.1,"deep peroneal nerve and dorsalis pedis artery","#92400e"]],
          14: [[31.6,75.3,"plantar fascia, medial cord","#14532d"],[30.5,70.8,"abductor hallucis","#7c2d12"],[43.4,81.4,"flexor digitorum brevis","#7c2d12"],[59.3,77.1,"peroneus longus","#7c2d12"],[67,71.3,"peroneus brevis","#7c2d12"],[37.7,66.3,"flexor digitorum longus","#7c2d12"],[64.5,61.1,"extensor digitorum brevis","#7c2d12"],[50.6,4.4,"tibialis anterior","#7c2d12"],[31.7,48.7,"deltoid complex, tibionavicular (superficial)","#14532d"],[30.1,60.5,"tibialis posterior","#7c2d12"],[36.4,69.7,"medial plantar nerve","#92400e"],[48.7,80.5,"lateral plantar nerve","#92400e"],[62.7,59.6,"dorsal calcaneocuboid ligament","#14532d"],[60.2,58.5,"bifurcate ligament, cuboid limb","#14532d"],[57.6,57.3,"bifurcate ligament, navicular limb","#14532d"]],
          15: [[62.7,80.5,"abductor digiti minimi","#7c2d12"],[40.2,68.3,"flexor hallucis longus","#7c2d12"],[37,65.2,"flexor digitorum longus","#7c2d12"],[34.1,46,"deltoid complex, anterior tibiotalar (deep)","#14532d"],[32.3,45.2,"deltoid complex, tibiospring (superficial)","#14532d"],[31.4,48.5,"deltoid complex, tibiospring (superficial)","#14532d"],[29.2,56.2,"tibialis posterior","#7c2d12"],[31.9,54.4,"spring ligament complex","#14532d"],[55.8,67,"calcaneus","#1e3a8a"]],
          16: [[42,83.6,"plantar fascia, central cord","#14532d"],[62.5,84.6,"plantar fascia, lateral cord","#14532d"],[42.5,72.6,"quadratus plantae","#7c2d12"],[41.8,80.9,"flexor digitorum brevis","#7c2d12"],[62.5,72.2,"peroneus longus","#7c2d12"],[65.9,67.2,"peroneus brevis","#7c2d12"],[63.8,62.5,"extensor digitorum brevis","#7c2d12"],[34.6,45.6,"deltoid complex, anterior tibiotalar (deep)","#14532d"],[30.5,53,"tibialis posterior","#7c2d12"],[39.7,57.5,"middle subtalar joint","#1e3a8a"],[63.9,37.3,"anterior inferior tibiofibular ligament","#14532d"],[35.7,68.1,"medial plantar nerve","#92400e"],[45.8,78,"lateral plantar nerve","#92400e"],[52.2,67.4,"calcaneus","#1e3a8a"],[45.2,63.6,"calcaneus, sustentaculum","#1e3a8a"],[50.6,58.5,"sinus tarsi","#1e3a8a"]],
          17: [[32.6,76.5,"plantar fascia, medial cord","#14532d"],[32.5,71.5,"abductor hallucis","#7c2d12"],[42.5,80.1,"flexor digitorum brevis","#7c2d12"],[63.6,52.4,"anterior talofibular ligament","#14532d"],[65.7,64.7,"peroneus brevis","#7c2d12"],[39.3,66.6,"flexor hallucis longus","#7c2d12"],[34.4,60.5,"flexor digitorum longus","#7c2d12"],[35.3,44.7,"deltoid complex, posterior tibiotalar (deep)","#14532d"],[28.9,43.1,"flexor retinaculum","#14532d"],[38.4,54.6,"middle subtalar joint","#1e3a8a"],[49,37.5,"tibiotalar joint","#1e3a8a"],[63,37,"anterior inferior tibiofibular ligament","#14532d"],[44.7,55.7,"sinus tarsi","#1e3a8a"]],
          18: [[42.2,83.4,"plantar fascia, central cord","#14532d"],[59.4,85,"plantar fascia, lateral cord","#14532d"],[58.9,81.4,"abductor digiti minimi","#7c2d12"],[50.4,14.3,"tibia","#1e3a8a"],[48.7,35.9,"tibial plafond","#1e3a8a"],[49.2,38.9,"talar dome","#1e3a8a"],[49,46.3,"talar body","#1e3a8a"],[64.5,41.6,"lateral malleolus","#1e3a8a"],[33.2,36.8,"medial malleolus","#1e3a8a"],[64.3,52.6,"anterior talofibular ligament","#14532d"],[64.1,66.1,"peroneal tubercle","#1e3a8a"],[63.6,68.1,"peroneus longus","#7c2d12"],[40.2,64.8,"flexor hallucis longus","#7c2d12"],[35.7,44.7,"deltoid complex, posterior tibiotalar (deep)","#14532d"],[31,46.3,"tibialis posterior","#7c2d12"],[53.1,56.2,"posterior subtalar joint","#1e3a8a"],[61.4,27.8,"interosseous ligament","#14532d"],[35.2,63.6,"medial plantar nerve","#92400e"],[42.2,76,"lateral plantar nerve","#92400e"]],
          19: [[42.7,70.4,"quadratus plantae","#7c2d12"],[42.5,79.4,"flexor digitorum brevis","#7c2d12"],[62.3,52.2,"posterior talofibular ligament","#14532d"],[64.3,54.8,"calcaneofibular ligament","#14532d"],[65.2,65.6,"peroneus longus","#7c2d12"],[64.5,59.8,"peroneus brevis","#7c2d12"],[35.7,44.2,"deltoid complex, posterior tibiotalar (deep)","#14532d"],[38.8,71.9,"lateral plantar nerve","#92400e"],[53.7,65.9,"calcaneus","#1e3a8a"]],
          20: [[34.1,76,"plantar fascia, medial cord","#14532d"],[33.7,69.9,"abductor hallucis","#7c2d12"],[59.4,49.6,"posterior talofibular ligament","#14532d"],[61.6,56,"calcaneofibular ligament","#14532d"],[65.4,61.2,"peroneus longus","#7c2d12"],[63.9,55.8,"peroneus brevis","#7c2d12"],[38.8,60.2,"flexor hallucis longus","#7c2d12"],[35,37.5,"tibialis posterior","#7c2d12"],[48.7,53,"posterior subtalar joint","#1e3a8a"],[56.4,37,"posterior inferior tibiofibular ligament","#14532d"],[58.4,28,"interosseous ligament","#14532d"],[34.8,61.2,"medial plantar nerve","#92400e"],[36.8,67,"lateral plantar nerve","#92400e"],[67.2,65.6,"sural nerve and lesser saphenous vein","#92400e"]],
          21: [[57.3,81.2,"abductor digiti minimi","#7c2d12"],[65.2,14.1,"fibula","#1e3a8a"],[51.2,32.3,"posterior malleolus","#1e3a8a"],[62,58.7,"calcaneofibular ligament","#14532d"],[39.8,56.7,"flexor hallucis longus","#7c2d12"],[39.3,40.4,"flexor digitorum longus","#7c2d12"],[39.1,21.3,"tibialis posterior","#7c2d12"],[49.4,52.2,"posterior subtalar joint","#1e3a8a"],[57.8,36.1,"posterior inferior tibiofibular ligament","#14532d"],[35.9,56.4,"tibial nerve","#92400e"]],
          22: [[42.2,81.8,"plantar fascia, central cord","#14532d"],[56.2,83.9,"plantar fascia, lateral cord","#14532d"],[35.5,76.4,"plantar fascia, medial cord","#14532d"],[40.2,67.2,"quadratus plantae","#7c2d12"],[43.3,78.7,"flexor digitorum brevis","#7c2d12"],[65.4,51,"peroneus longus","#7c2d12"],[62,46.5,"peroneus brevis","#7c2d12"],[43.6,46.1,"flexor hallucis longus","#7c2d12"],[36.1,57.1,"tibial nerve","#92400e"],[65.7,61.8,"sural nerve and lesser saphenous vein","#92400e"]],
          23: [[62.9,26.2,"peroneus brevis","#7c2d12"],[68.4,24.2,"peroneus longus","#7c2d12"],[45.4,33,"flexor hallucis longus","#7c2d12"]],
          24: [[42.9,83.2,"plantar fascia, central cord","#14532d"],[54.8,83.6,"plantar fascia, lateral cord","#14532d"],[36.8,73.5,"abductor hallucis","#7c2d12"],[64.3,60.5,"sural nerve and lesser saphenous vein","#92400e"]],
          25: [[38.2,76.5,"plantar fascia, medial cord","#14532d"],[40.2,66.3,"quadratus plantae","#7c2d12"],[59.1,44,"sural nerve and lesser saphenous vein","#92400e"]],
          27: [[52.1,29.4,"Achilles","#7c2d12"],[48.8,5.6,"soleus","#7c2d12"],[54.9,4.4,"Achilles","#7c2d12"],[52.6,66.1,"calcaneus","#1e3a8a"]],
          28: [[51.7,47.8,"Achilles","#7c2d12"]],
        },
      },
    },
    view: 'MRI — ankle',
    labels: {
      bones:    [[50,42,'Tibia','#1e3a8a'],[60,55,'Talus','#1e3a8a'],[65,68,'Calcaneus','#1e3a8a'],[78,50,'Fibula','#1e3a8a']],
      tendons:  [[42,52,'Post. tibial t.','#14532d'],[44,56,'FDL','#14532d'],[46,60,'FHL','#14532d'],[78,58,'Peroneal t.','#14532d'],[50,75,'Achilles','#14532d'],[50,35,'Ant. tibial t.','#14532d']],
      muscles:  [[40,42,'Deep post. compart.','#7c2d12'],[80,44,'Peroneal m.','#7c2d12']],
      nerves:   [[43,54,'Post. tibial n.','#92400e'],[76,52,'Sural n.','#92400e']],
      arteries: [[44,50,'Post. tibial a.','#991b1b'],[48,38,'Ant. tibial a.','#991b1b']],
      veins:    [[46,52,'Post. tibial v.','#4c1d95']],
    },
  },
  pelvis: {
    label: 'Pelvis',
    region: 'Pelvis',
    folder: 'pelvis',
    slices: Array.from({length:100},(_,i)=>i+1),
    defaultSlice: 35,
    useLocalMRI: true,
    localPath: '/atlas/pelvis/pelvis_', localExt: '.webp',
    sequences: {
      t1: { label:'T1', path:'/atlas/pelvis/pelvis_', slices:Array.from({length:100},(_,i)=>i+1), ext:'.webp', permanentLabels: PELVIS_LABELS },
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
  brachialPlexus: {
    label: 'Brachial Plexus',
    region: 'Upper Extremity',
    isBrachialPlexus: true,
    useLocalMRI: true,
    defaultSlice: 1,
    sequences: {
      mri: {
        label: 'MRI',
        path: '/atlas/brachial-plexus/Slide',
        slices: Array.from({length:44},(_,i)=>i+1),
        ext: '.PNG',
        pad: 0,
        permanentLabels: [],
      },
    },
    view: 'Brachial plexus MRI — left = unlabeled · right = labeled',
    labels: {},
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
  const [selectedRegion, setSelectedRegion] = useState('Pelvis');
  const [selectedJoint, setSelectedJoint] = useState('pelvis');
  const [sliceIdx, setSliceIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [renderTick, setRenderTick] = useState(0);
  const [loadedSet, setLoadedSet] = useState(new Set());  const [sequence, setSequence] = useState('t1');
  const sequenceRef = useRef('t1');
  const [labelMode, setLabelMode] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({ nerves:true, muscles:true, arteries:true, veins:true, bones:true, ligaments:true, joints:true, spaces:true, cartilage:true });
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
      const idx = j && !j.isBrachialPlexus ? (j.useLocalMRI ? j.defaultSlice-1 : (j.slices||[]).indexOf(j.defaultSlice)) : 0;
      setSliceIdx(Math.max(0, idx));
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (jointData && !jointData.isBrachialPlexus) {
      const idx = jointData.useLocalMRI ? jointData.defaultSlice-1 : (jointData.slices||[]).indexOf(jointData.defaultSlice);
      setSliceIdx(Math.max(0, idx));
      setImgError(false);
      setLoadedSet(new Set());
      // Reset sequence to first available for this joint
      if (jointData.sequences) {
        const firstSeq = Object.keys(jointData.sequences)[0];
        setSequence(firstSeq);
        sequenceRef.current = firstSeq;
      }
    }
  }, [selectedJoint]);

  // Wheel scroll — 80ms throttle, NO imgLoaded reset (prevents spinner flash on cached images)
  const wheelThrottleRef = useRef(0);
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (!jointData) return;
      const now = Date.now();
      if (now - wheelThrottleRef.current < 80) return;
      wheelThrottleRef.current = now;
      setSliceIdx(i => {
        const activeSqKey = jointData?.sequences?.[sequenceRef.current] ? sequenceRef.current : Object.keys(jointData?.sequences||{})[0];
        const sq = jointData?.sequences?.[activeSqKey] || null;
        const slices = sq ? sq.slices : (jointData?.slices || []);
        return e.deltaY > 0 ? Math.min(slices.length-1, i+1) : Math.max(0, i-1);
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [jointData]);

  // Smart preload — ±10 immediately on joint/sequence change, rest lazily after 1s
  // Keeps initial load snappy; browser cache handles subsequent scrolls
  useEffect(() => {
    if (!jointData) return;
    const preloadSqKey = jointData?.sequences?.[sequenceRef.current] ? sequenceRef.current : Object.keys(jointData?.sequences||{})[0];
    const sq = jointData?.sequences?.[preloadSqKey] || null;
    const src = sq || (jointData?.useLocalMRI ? jointData : null);
    if (!src) return;
    const sliceArr = sq ? sq.slices : (jointData.slices || []);
    const pathFn = sq
      ? (i) => `${sq.path}${sq.pad===0?sliceArr[i]:String(sliceArr[i]).padStart(sq.pad||3,'0')}${sq.ext}`
      : (i) => `${jointData.localPath}${String(sliceArr[i]).padStart(3,'0')}${jointData.localExt||'.webp'}`;
    const center = sliceIdx || Math.floor(sliceArr.length / 2);
    // Tier 1: ±10 slices — load immediately (covers fast local scrolling)
    const tier1 = [], tier2 = [], tier3 = [];
    sliceArr.forEach((_, i) => {
      const d = Math.abs(i - center);
      if (d <= 10) tier1.push(i);
      else if (d <= 35) tier2.push(i);
      else tier3.push(i);
    });
    tier1.forEach(i => { const img = new Image(); img.src = pathFn(i); });
    // Tier 2: ±35 after 800ms
    const t2 = setTimeout(() => {
      tier2.forEach(i => { const img = new Image(); img.src = pathFn(i); });
    }, 800);
    // Tier 3: rest after 2.5s (user is likely settled on a joint by then)
    const t3 = setTimeout(() => {
      tier3.forEach(i => { const img = new Image(); img.src = pathFn(i); });
    }, 2500);
    return () => { clearTimeout(t2); clearTimeout(t3); };
  }, [selectedJoint, sequence]);

  useEffect(() => { setSliceIdx(0); setImgError(false); setLoadedSet(new Set()); }, [sequence]);

  // seqData / imgUrl — must be defined BEFORE any useEffect that depends on imgUrl
  const seqData = jointData?.sequences
    ? (jointData.sequences[sequence] || jointData.sequences[Object.keys(jointData.sequences)[0]] || null)
    : null;
  const activeSlices = seqData ? seqData.slices : (jointData?.slices || []);
  const currentSlice = activeSlices[sliceIdx] ?? null;
  const imgUrl = jointData && currentSlice
    ? seqData
      ? `${seqData.path}${seqData.pad===0?currentSlice:String(currentSlice).padStart(seqData.pad||3,'0')}${seqData.ext}`
      : jointData.useLocalMRI
        ? `${jointData.localPath}${String(currentSlice).padStart(3,'0')}${jointData.localExt||'.webp'}`
        : `${VHP_BASE}/${jointData.folder}/a_vm${currentSlice}.png`
    : null;

  // imgLoaded = current slice is in the loadedSet
  const imgLoaded = imgUrl ? loadedSet.has(imgUrl) : false;

  // No probe needed — onLoad handler on each img populates loadedSet

  // ── Label click handler — coords relative to ACTUAL image pixels ──────────
  const handleImageClick = (e) => {
    if (!labelMode || !imgRef.current) return;
    const ir = imgRef.current.getBoundingClientRect();
    const natW = imgRef.current.naturalWidth  > 0 ? imgRef.current.naturalWidth  : imgRef.current.getBoundingClientRect().width;
    const natH = imgRef.current.naturalHeight > 0 ? imgRef.current.naturalHeight : imgRef.current.getBoundingClientRect().height;
    const scale = Math.min(ir.width / natW, ir.height / natH);
    const ow = natW * scale;
    const oh = natH * scale;
    // Top-left of actual rendered pixels within the element
    const pxLeft = ir.left + (ir.width  - ow) / 2;
    const pxTop  = ir.top  + (ir.height - oh) / 2;
    const x = parseFloat(((e.clientX - pxLeft) / ow * 100).toFixed(1));
    const y = parseFloat(((e.clientY - pxTop)  / oh * 100).toFixed(1));
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
    if (/tunnel|canal|notch|recess|foramen|fossa|alcock|hunter|spinoglenoid|suprascapular notch|cubital tunnel|carpal tunnel|guyon|bursa|quadrilateral space|biceps groove|cyst|\bspace\b|sinus tarsi|inframalleolar|retromalleolar/.test(n)) return 'spaces';
    // Cartilage before joints — prevents "tibiofemoral compartment cartilage" matching the joints rule
    // Includes patellar/trochlear facets (articular surfaces) but excludes trochanter/tuberosity facets (tendon footprints) and fibrocartilage
    if (/patellar facet|facet of the patella|trochlear facet|trochlear groove|compartment cartilage|condyle cartilage|articular cartilage|glenoid cartilage|humeral head cartilage|radiocapitellar cartilage|ulnohumeral.*cartilage|\bcartilage\b/.test(n) && !/trochanter|tuberosity|fibrocartilage|triangular/.test(n)) return 'cartilage';
    if (/\bjoint\b(?!.*capsule)|ac joint|si joint|acromioclavicular|glenohumeral|sacroiliac|radiocarpal|midcarpal|lisfranc joint|patellofemoral|tibiofibular joint|tibiotalar|subtalar|facet joint/.test(n)) return 'joints';
    if (/nerve|plexus|nvb|ganglion|cutaneous nerve|antebrachial|brachial plexus/.test(n)) return 'nerves';
    if (/artery|femoral art|iliac a|neurovascular bundle/.test(n)) return 'arteries';
    if (/vein|saphenous|femoral vein|iliac v/.test(n)) return 'veins';
    // Ligaments before bones — prevents "intermalleolar ligament", "deltoid (tibiocalcaneal...)" matching bone keywords
    if (/ligament|ligamentous|sacrospinous|sacrotuberous|aponeurosis|osbourne|lacertus|retinaculum|coracoclavicular|coracoacromial|ucl|lcl|acl|pcl|mcl|collateral|annular|labrum|labral|anchor|fascia|capsule|\btfc\b|central disc|subsheath|meniscus|meniscal|intermeniscal|popliteomeniscal|popliteofibular|fabellofibular|anterolateral|meniscocapsular|root ligament|fat pad|plica|hoffa|prefemoral|suprapatellar|infrapatellar|footprint|\bband\b|white.*zone|red.*zone|zone.*white|zone.*red|\batfl\b|\bptfl\b|\bcfl\b|deltoid|interosseous membrane|lisfranc/.test(n)) return 'ligaments';
    if (/sacrum|ilium|iliac bone|femur|acetabulum|trochanter|coccyx|symphysis|ramus|tubercle|tuberosity|asis|aiis|intertrochanteric|pubic|humerus|\bradius\b|\bulna\b|ulnar styloid|ulnar groove|radial tuberosity|olecranon|capitellum|trochlea|epicondyle|sublime tubercle|glenoid|acromion|clavicle|\bscapula\b|scapular spine|coracoid|coracoid process|humeral head|femoral head|femoral neck|femoral diaphysis|vertebra|vertebral body|\bL[1-5]\b|\bS[1-5]\b|\bC[1-7]\b|ischial tuberosity|pubic bone|iliac crest|scaphoid|lunate|triquetrum|pisiform|capitate|hamate|trapezium|trapezoid|metacarpal|lister|epiphysis|metaphysis|diaphysis|physis|plateau|tibial tubercle|tibial spine|femoral trochlea|\bpatella\b|\bfibula\b|\btibia\b|\bfemur\b|talar|talus|\bnavicular\b|\bcalcaneus\b|calcaneal|malleolus|malleolar|\bplafond\b|sustentaculum|metatarsal|cuneiform|\bcuboid\b/.test(n)) return 'bones';
    return 'muscles';
  };

  const colorMap = { nerves:'#facc15', muscles:'#f97316', arteries:'#ef4444', veins:'#60a5fa', bones:'#ffffff', ligaments:'#d1d5db', joints:'#34d399', spaces:'#c084fc', cartilage:'#67e8f9' };

  const permanentLabels = allPermanentLabels.filter(([,,name]) => (visibleLayers[getLabelLayer(name)] ?? true));

  // Sort labels by Y position for vertical alignment with dots
  const sidebarLabels = permanentLabels.slice().sort((a, b) => a[1] - b[1]);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'8px' }}>
      <div style={{ background:'#0f172a',borderRadius:16,width:'min(99vw,1600px)',height:'min(96vh,1000px)',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,0.7)' }}>

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
            <p style={{ fontSize:9,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'12px 0 4px' }}>Labels</p>
            <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
              <button onClick={() => setVisibleLayers({ nerves:true,muscles:true,tendons:true,arteries:true,veins:true,bones:true,ligaments:true,joints:true,spaces:true,cartilage:true })}
                style={{ padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:700,border:'1px solid #475569',background:'#1e293b',color:'#94a3b8',cursor:'pointer',textAlign:'left' }}>All On</button>
              <button onClick={() => setVisibleLayers({ nerves:false,muscles:false,tendons:false,arteries:false,veins:false,bones:false,ligaments:false,joints:false,spaces:false,cartilage:false })}
                style={{ padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:700,border:'1px solid #475569',background:'#1e293b',color:'#94a3b8',cursor:'pointer',textAlign:'left' }}>All Off</button>
              {[
                {key:'nerves',    label:'Nerves',    color:'#facc15'},
                {key:'muscles',   label:'Muscles',   color:'#f97316'},
                {key:'arteries',  label:'Arteries',  color:'#ef4444'},
                {key:'veins',     label:'Veins',     color:'#60a5fa'},
                {key:'bones',     label:'Bones',     color:'#e2e8f0'},
                {key:'joints',    label:'Joints',    color:'#34d399'},
                {key:'cartilage', label:'Cartilage', color:'#67e8f9'},
                {key:'ligaments', label:'Ligaments', color:'#a3e635'},
                {key:'spaces',    label:'Spaces',    color:'#c084fc'},
              ].map(({key,label,color}) => (
                <button key={key} onClick={() => setVisibleLayers(prev => ({...prev,[key]:!prev[key]}))}
                  style={{ padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:700,border:'1px solid '+color,background:visibleLayers[key]?color+'33':'transparent',color:visibleLayers[key]?color:'#475569',cursor:'pointer',textAlign:'left' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 2+3 — IMAGE + SIDEBAR in a shared flex row with SVG leader lines */}
          <div style={{ flex:1,display:'flex',flexDirection:'row',overflow:'hidden',position:'relative' }}>

          {/* Col 2 — IMAGE */}
          <div ref={imgContainerRef}
            style={{ flex:'1 1 0',minWidth:0,display:'flex',flexDirection:'column',background:'#020617',overflow:'hidden',position:'relative' }}>

            {/* Sequence toggle */}
            {jointData?.sequences && (
              <div style={{ display:'flex',gap:4,padding:'5px 12px',background:'#0a0f1a',borderBottom:'1px solid #1e293b',flexShrink:0 }}>
                <span style={{ fontSize:9,color:'#475569',fontWeight:600,alignSelf:'center',marginRight:4 }}>SEQUENCE:</span>
                {Object.entries(jointData.sequences).map(([key, sq]) => (
                  <button key={key} onClick={() => { setSequence(key); sequenceRef.current = key; }}
                    style={{ padding:'3px 10px',borderRadius:5,border:'1px solid '+(sequence===key?'#3b82f6':'#334155'),background:sequence===key?'#1d4ed8':'#1e293b',color:sequence===key?'white':'#64748b',fontSize:10,fontWeight:sequence===key?700:400,cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
                    {sq.label}
                    {!sq.permanentLabels && (
                      <span style={{ fontSize:8,fontWeight:700,color:'#f59e0b',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.4)',borderRadius:3,padding:'1px 4px',letterSpacing:'0.04em' }}>LABELS PENDING</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Slice navigator */}
            {jointData && (
              <div style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',background:'#0f172a',borderBottom:'1px solid #1e293b',flexShrink:0 }}>
                <button onClick={() => { setSliceIdx(i => Math.max(0,i-1)); }} disabled={sliceIdx===0}
                  style={{ background:sliceIdx===0?'#1e293b':'#1d4ed8',border:'none',color:'white',borderRadius:5,width:24,height:24,cursor:sliceIdx===0?'default':'pointer',fontSize:14,fontWeight:700,opacity:sliceIdx===0?0.4:1,flexShrink:0 }}>‹</button>
                <div style={{ flex:1,display:'flex',alignItems:'center',gap:6 }}>
                  <input type="range" min={0} max={activeSlices.length-1} value={sliceIdx}
                    onChange={e => { setSliceIdx(Number(e.target.value)); }}
                    style={{ flex:1,accentColor:'#3b82f6',cursor:'pointer' }} />
                  <span style={{ color:'#93c5fd',fontSize:10,fontWeight:700,whiteSpace:'nowrap',background:'#1e293b',padding:'2px 7px',borderRadius:4,border:'1px solid #3b82f6',minWidth:52,textAlign:'center' }}>
                    {sliceIdx+1} / {activeSlices.length}
                  </span>
                </div>
                <button onClick={() => { setSliceIdx(i => Math.min(activeSlices.length-1,i+1)); }} disabled={sliceIdx===activeSlices.length-1}
                  style={{ background:sliceIdx===activeSlices.length-1?'#1e293b':'#1d4ed8',border:'none',color:'white',borderRadius:5,width:24,height:24,cursor:sliceIdx===activeSlices.length-1?'default':'pointer',fontSize:14,fontWeight:700,opacity:sliceIdx===activeSlices.length-1?0.4:1,flexShrink:0 }}>›</button>
              </div>
            )}

            {/* Image area — click handler here so coords are relative to image area only */}
            <div ref={imgAreaRef} onClick={handleImageClick}
              style={{ flex:'1 1 0',minHeight:0,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:labelMode?'crosshair':'default' }}>
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
              {/* Pre-render all slices — visible one shows instantly from cache, others hidden */}
              {activeSlices.map((sl, i) => {
                const url = seqData
                  ? `${seqData.path}${seqData.pad===0?sl:String(sl).padStart(seqData.pad||3,'0')}${seqData.ext}`
                  : jointData?.useLocalMRI
                    ? `${jointData.localPath}${String(sl).padStart(3,'0')}${jointData.localExt||'.webp'}`
                    : `${VHP_BASE}/${jointData.folder}/a_vm${sl}.png`;
                const isActive = i === sliceIdx;
                return (
                  <img key={url} src={url}
                    ref={isActive ? imgRef : null}
                    onLoad={() => {
                      setLoadedSet(prev => { const n = new Set(prev); n.add(url); return n; });
                      if (isActive) requestAnimationFrame(() => setRenderTick(t => t+1));
                    }}
                    onError={() => { if (isActive) setImgError(true); }}
                    style={{ width:'100%',height:'100%',objectFit:'contain',
                      display: isActive ? 'block' : 'none',
                      position:'absolute', inset:0, borderRadius:4, userSelect:'none' }}
                    loading="eager"
                    decoding="async"
                    alt={`Slice ${sl}`}
                  />
                );
              })}

              {/* DOTS ONLY on image — no text labels */}
              {/* Single SVG overlay — dots + lines + labels all in one coordinate space */}
              {imgLoaded && imgRef.current && imgAreaRef.current && renderTick >= 0 && (() => {
                const imgEl = imgRef.current;
                const ar  = imgAreaRef.current.getBoundingClientRect();
                const ir  = imgEl.getBoundingClientRect();
                // Labels were recorded as % of the rendered image pixels.
                // Use naturalWidth/Height to compute true rendered rect inside objectFit:contain.
                // Guard against natW/natH = 0 (image not yet decoded) — fall back to element size.
                const natW = imgEl.naturalWidth  > 0 ? imgEl.naturalWidth  : ir.width;
                const natH = imgEl.naturalHeight > 0 ? imgEl.naturalHeight : ir.height;
                const scale = Math.min(ir.width / natW, ir.height / natH);
                const ow = natW * scale;
                const oh = natH * scale;
                if (!ow || !oh || !isFinite(ow) || !isFinite(oh)) return null;
                // Offset of rendered image pixels within the container
                const ol = (ir.left - ar.left) + (ir.width  - ow) / 2;
                const ot = (ir.top  - ar.top)  + (ir.height - oh) / 2;
                return (
                  <svg style={{ position:'absolute', left:ol, top:ot, width:ow, height:oh, pointerEvents:'none', overflow:'visible' }}
                    viewBox={`0 0 ${ow} ${oh}`}>

                    {/* Permanent labels — evenly spaced vertically to prevent overlap */}
                    {(() => {
                      const fontSize = Math.max(10, Math.min(13, ow / 60));
                      const lineH = fontSize + 5; // min spacing between label rows
                      const n = permanentLabels.length;
                      if (n === 0) return null;
                      const labelRight = seqData?.labelSide === 'right';
                      // Sort by Y so labels roughly follow anatomy top-to-bottom
                      const sorted = permanentLabels.map(([x,y,name],origIdx) => ({x,y,name,origIdx}))
                        .sort((a,b) => a.y - b.y);
                      // Distribute label Y positions evenly across image height
                      // with a small top/bottom margin
                      const topMargin = fontSize;
                      const botMargin = fontSize;
                      const spread = oh - topMargin - botMargin;
                      return sorted.map(({x, y, name, origIdx}, i) => {
                        const col = colorMap[getLabelLayer(name)] || '#ffffff';
                        const px = (x / 100) * ow;
                        const py = (y / 100) * oh; // dot stays at true position
                        // Text Y: evenly distributed
                        const ty = n === 1 ? oh / 2 : topMargin + (i / (n - 1)) * spread;
                        const textX = 8;
                        const maxLabelW = ow * 0.38; // max label area = 38% of image width
                        const lineStartX = Math.min(textX + name.length * fontSize * 0.62 + 4, maxLabelW);
                        const jogX = Math.min(lineStartX + 20, px - 4);
                        if (labelRight) {
                          const textXr = ow - 8;
                          const maxLabelWr = ow * 0.38;
                          const lineStartXr = Math.max(ow - (name.length * fontSize * 0.62 + 12), ow - maxLabelWr);
                          const jogXr = Math.max(lineStartXr - 20, px + 4);
                          return (
                            <g key={'p'+origIdx}>
                              <circle cx={px} cy={py} r="4" fill={col} opacity="0.95"
                                stroke="rgba(0,0,0,0.7)" strokeWidth="1"/>
                              <polyline
                                points={`${lineStartXr},${ty} ${jogXr},${ty} ${jogXr},${py} ${px+1},${py}`}
                                fill="none" stroke={col} strokeWidth="0.9" opacity="0.65"/>
                              <text x={textXr} y={ty} fontSize={fontSize} fill="rgba(0,0,0,0.9)"
                                fontFamily="system-ui,sans-serif" fontWeight="700"
                                textAnchor="end" dominantBaseline="middle" dx="1" dy="1">{name}</text>
                              <text x={textXr} y={ty} fontSize={fontSize} fill={col}
                                fontFamily="system-ui,sans-serif" fontWeight="700"
                                textAnchor="end" dominantBaseline="middle">{name}</text>
                            </g>
                          );
                        }
                        return (
                          <g key={'p'+origIdx}>
                            <circle cx={px} cy={py} r="4" fill={col} opacity="0.95"
                              stroke="rgba(0,0,0,0.7)" strokeWidth="1"/>
                            <polyline
                              points={`${lineStartX},${ty} ${jogX},${ty} ${jogX},${py} ${px-1},${py}`}
                              fill="none" stroke={col} strokeWidth="0.9" opacity="0.65"/>
                            <text x={textX} y={ty} fontSize={fontSize} fill="rgba(0,0,0,0.9)"
                              fontFamily="system-ui,sans-serif" fontWeight="700"
                              textAnchor="start" dominantBaseline="middle" dx="1" dy="1">{name}</text>
                            <text x={textX} y={ty} fontSize={fontSize} fill={col}
                              fontFamily="system-ui,sans-serif" fontWeight="700"
                              textAnchor="start" dominantBaseline="middle">{name}</text>
                          </g>
                        );
                      });
                    })()}

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
          <div style={{ flex:'0 0 180px',width:180,background:'#000000',borderLeft:'1px solid #1e293b',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative' }}>
          {jointData?.isBrachialPlexus && (
            <div style={{ overflowY:'auto',padding:'10px 8px',display:'flex',flexDirection:'column',gap:2,height:'100%' }}>
              <div style={{ fontSize:9,fontWeight:800,letterSpacing:'0.12em',color:'#60a5fa',textTransform:'uppercase',marginBottom:8,paddingBottom:5,borderBottom:'1px solid #1e293b' }}>Key</div>
              {[
                { section:'Roots', color:'#60a5fa', items:[['C5–T1','Nerve roots']] },
                { section:'Trunks', color:'#60a5fa', items:[['UT','Upper trunk'],['MT','Middle trunk'],['LT','Lower trunk']] },
                { section:'Divisions', color:'#94a3b8', items:[['A','Anterior div.'],['P','Posterior div.']] },
                { section:'Cords', color:'#a78bfa', items:[['LC','Lateral cord'],['PC','Posterior cord'],['MC','Medial cord']] },
                { section:'Terminal', color:'#4ade80', items:[['MCN','Musculocutaneous'],['AN','Axillary'],['RN','Radial'],['UN','Ulnar'],['MN','Median']] },
              ].map(({section,color,items}) => (
                <div key={section} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:8,fontWeight:700,letterSpacing:'0.1em',color:'#475569',textTransform:'uppercase',marginBottom:4 }}>{section}</div>
                  {items.map(([abbr,full]) => (
                    <div key={abbr} style={{ display:'flex',gap:5,alignItems:'baseline',marginBottom:4,paddingLeft:2 }}>
                      <span style={{ fontSize:11,fontWeight:800,color,minWidth:34,flexShrink:0 }}>{abbr}</span>
                      <span style={{ fontSize:10,color:'#94a3b8',lineHeight:1.3 }}>{full}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {!jointData?.isBrachialPlexus && (<>

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
          </>)}
          </div>

          </div>{/* end Col 2+3 wrapper */}

        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ─── RESEARCH POSTS ────────────────────────────────────────────────────────
// Add new posts to the TOP of this array. Each old post moves down automatically.
// Fields: date, title, journal, citation, summary (array of bullet strings),
//         keyTakeaway, link (optional DOI/PubMed URL), tags (array of strings)
const RESEARCH_POSTS = [
  {
    date: 'May 25, 2026',
    title: 'Example Post — Replace With Your First Article Review',
    journal: 'Journal Name · Year',
    citation: 'Author A, Author B, et al. Full article title here. Journal. Year;Vol(Issue):Pages.',
    summary: [
      'Study design and population: describe the cohort, imaging modality, and primary objective.',
      'Key finding 1: the most important result with numbers where relevant.',
      'Key finding 2: secondary findings or subgroup analysis.',
      'Methodology note: anything notable about the technique, grading system, or statistical approach.',
    ],
    keyTakeaway: 'One sentence distilling the clinical bottom line — what this changes or confirms in your practice.',
    link: 'https://scholar.google.com/scholar?q=replace+with+article+title',
    tags: ['Knee', 'Cartilage', 'MRI'],
  },
];

// ─── SUPABASE CLIENT (lazy, no extra package needed) ────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getSupabase = (accessToken) => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) return null;
  // Use user JWT if provided (required for RLS policies that check auth.uid())
  const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${key}`;
  const headers = { 'Content-Type':'application/json', apikey:key, Authorization:authHeader };
  return {
    from: (table) => ({
      select: (cols='*') => ({
        eq: (col, val) => ({
          order: (col2, opts={}) => fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}&${col}=eq.${encodeURIComponent(val)}&order=${col2}.${opts.ascending===false?'desc':'asc'}`, { headers }).then(r=>r.json()),
        }),
      }),
      insert: (row) => fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method:'POST', headers:{...headers,'Prefer':'return=representation'}, body:JSON.stringify(row) }).then(async r=>{ const d=await r.json(); if(!r.ok) throw new Error(JSON.stringify(d)); return d; }),
      delete: () => ({
        eq: (col, val) => fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}`, { method:'DELETE', headers }).then(r => r.status === 204 ? null : r.json()),
      }),
    }),
  };
};


// ─── ARTICLE LIKES ───────────────────────────────────────────────────────────
function ArticleLikes({ postIdx }) {
  const [likes, setLikes] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const storageKey = `liked_post_${postIdx}`;
  // Use a stable fingerprint: storageKey value stored at like-time
  const fingerprint = storageKey;

  const fetchCount = () => {
    // Fetch all rows for this post and count them — simplest approach with our minimal client
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) { setLikes(0); return; }
    fetch(`${SUPABASE_URL}/rest/v1/article_likes?select=id&post_idx=eq.${postIdx}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
      .then(r => r.json())
      .then(data => setLikes(Array.isArray(data) ? data.length : 0))
      .catch(() => setLikes(0));
  };

  useEffect(() => {
    try { setHasLiked(!!localStorage.getItem(storageKey)); } catch {}
    fetchCount();
  }, [postIdx]);

  const handleLike = async () => {
    if (animating) return;
    setAnimating(true);
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) { setTimeout(() => setAnimating(false), 400); return; }
    const headers = { 'Content-Type':'application/json', apikey:key, Authorization:`Bearer ${key}` };

    if (hasLiked) {
      try {
        // Delete by fingerprint column
        await fetch(`${SUPABASE_URL}/rest/v1/article_likes?post_idx=eq.${postIdx}&fingerprint=eq.${encodeURIComponent(fingerprint)}`, {
          method: 'DELETE', headers,
        });
        setHasLiked(false);
        localStorage.removeItem(storageKey);
        setLikes(l => Math.max(0, (l || 1) - 1));
      } catch {}
    } else {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/article_likes`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ post_idx: postIdx, fingerprint, created_at: new Date().toISOString() }),
        });
        setHasLiked(true);
        localStorage.setItem(storageKey, '1');
        setLikes(l => (l || 0) + 1);
      } catch {}
    }
    // Re-fetch true count from DB after a short delay
    setTimeout(() => { fetchCount(); setAnimating(false); }, 600);
  };

  return (
    <button onClick={handleLike}
      style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:20,border:'1px solid',
        borderColor: hasLiked ? 'rgba(239,68,68,0.5)' : '#1e3a5f',
        background: hasLiked ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
        color: hasLiked ? '#f87171' : '#475569',
        cursor:'pointer', fontSize:12, fontWeight:600,
        transform: animating ? 'scale(1.2)' : 'scale(1)',
        transition:'all 0.15s ease',
        userSelect:'none' }}>
      <span style={{ fontSize:14, lineHeight:1 }}>{hasLiked ? '❤️' : '🤍'}</span>
      <span>{likes === null ? '…' : likes}</span>
    </button>
  );
}

// ─── COMMENT SECTION (per article) ──────────────────────────────────────────
function ArticleComments({ postIdx, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    setComments([]);
    // Pass user token if available so RLS authenticated read policy passes
    const sb = getSupabase(currentUser?.access_token);
    if (!sb) { setLoading(false); return; }
    sb.from('article_comments').select('*').eq('post_idx', postIdx).order('created_at', { ascending:true })
      .then(data => {
        setComments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load comments:', err);
        setLoading(false);
      });
  }, [postIdx, currentUser?.access_token]);

  const submit = async () => {
    if (!text.trim() || !currentUser) return;
    setSubmitting(true); setError('');
    try {
      // Moderation check — fail CLOSED
      try {
        const modRes = await fetch('/api/moderate-comment', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ text: text.trim() }),
          cache: 'no-store',
        });
        if (!modRes.ok) {
          setError(`Moderation unavailable (${modRes.status}). Please try again.`);
          setSubmitting(false); return;
        }
        const modData = await modRes.json();
        if (modData.blocked) {
          setError(modData.reason || 'Comment not allowed. Please keep discussion professional and on-topic.');
          setSubmitting(false); return;
        }
      } catch (modErr) {
        setError('Moderation service unavailable. Please try again.');
        setSubmitting(false); return;
      }

      // Save to Supabase — pass user JWT so RLS policy (auth.uid() = user_id) passes
      const sb = getSupabase(currentUser.access_token);
      const result = await sb.from('article_comments').insert({
        post_idx: postIdx,
        user_id: currentUser.id,
        user_email: currentUser.email,
        body: text.trim(),
        created_at: new Date().toISOString(),
      });
      const saved = Array.isArray(result) ? result[0] : null;
      if (saved) { setComments(prev => [...prev, saved]); setText(''); setShowForm(false); }
      else setError('Failed to save. Please try again.');
    } catch (e) { setError('Failed to post comment. Please try again.'); }
    setSubmitting(false);
  };

  const deleteComment = async (id) => {
    try {
      const sb = getSupabase(currentUser?.access_token);
      await sb.from('article_comments').delete().eq('id', id);
    } catch (e) { console.error('Delete failed:', e); }
    // Optimistically remove from UI regardless
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const fmt = (iso) => { try { return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); } catch { return ''; } };

  return (
    <div style={{ marginTop:14,borderTop:'1px solid #1e3a5f',paddingTop:12,display:'flex',flexDirection:'column',gap:8 }}>

      {/* Header row */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
        <span style={{ fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em' }}>
          💬 Discussion {comments.length > 0 && `(${comments.length})`}
        </span>
        {currentUser && (
          <button onClick={() => { setShowForm(f=>!f); setError(''); setText(''); }}
            style={{ fontSize:10,fontWeight:600,color:'#059669',background:'rgba(5,150,105,0.1)',border:'1px solid rgba(5,150,105,0.25)',borderRadius:6,padding:'3px 9px',cursor:'pointer' }}>
            {showForm ? 'Cancel' : '+ Add Comment'}
          </button>
        )}
      </div>

      {/* Scrollable comments list */}
      {loading ? (
        <div style={{ fontSize:11,color:'#475569',padding:'4px 0' }}>Loading…</div>
      ) : (
        <div style={{ overflowY:'auto',maxHeight:160,display:'flex',flexDirection:'column',gap:7,paddingRight:4,flexShrink:0 }}>
          {comments.map(c => (
            <div key={c.id} style={{ background:'rgba(255,255,255,0.03)',border:'1px solid #1e3a5f',borderRadius:7,padding:'8px 11px',display:'flex',gap:8,alignItems:'flex-start',flexShrink:0 }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',gap:6,alignItems:'baseline',marginBottom:3,flexWrap:'wrap' }}>
                  <span style={{ fontSize:10,fontWeight:700,color:'#60a5fa' }}>{c.user_email?.split('@')[0] || 'User'}</span>
                  <span style={{ fontSize:9,color:'#334155' }}>{fmt(c.created_at)}</span>
                </div>
                <p style={{ fontSize:12,color:'#cbd5e1',lineHeight:1.6,margin:0 }}>{c.body}</p>
              </div>
              {currentUser?.id === c.user_id && (
                <button onClick={() => deleteComment(c.id)}
                  style={{ fontSize:9,color:'#475569',background:'none',border:'none',cursor:'pointer',flexShrink:0,padding:'2px 4px',borderRadius:4 }}
                  title="Delete your comment">✕</button>
              )}
            </div>
          ))}
          {comments.length === 0 && !showForm && (
            <p style={{ fontSize:11,color:'#334155',fontStyle:'italic',margin:0 }}>No comments yet. {currentUser ? 'Be the first.' : 'Sign in to comment.'}</p>
          )}
        </div>
      )}

      {/* New comment form — always fully visible below comments */}
      {showForm && currentUser && (
        <div style={{ display:'flex',flexDirection:'column',gap:6,flexShrink:0,borderTop:'1px solid #1e3a5f',paddingTop:8 }}>
          <textarea value={text} onChange={e=>setText(e.target.value)}
            placeholder="Share your clinical perspective or questions about this paper…"
            style={{ width:'100%',height:64,background:'#0f172a',border:'1px solid #334155',borderRadius:7,color:'#e2e8f0',fontSize:12,padding:'8px 10px',resize:'none',lineHeight:1.5,boxSizing:'border-box' }} />
          {error && <p style={{ fontSize:11,color:'#f87171',margin:0,lineHeight:1.4 }}>{error}</p>}
          <div style={{ display:'flex',gap:7,justifyContent:'flex-end' }}>
            <button onClick={() => { setShowForm(false); setError(''); setText(''); }}
              style={{ fontSize:11,color:'#64748b',background:'none',border:'1px solid #334155',borderRadius:6,padding:'5px 12px',cursor:'pointer' }}>Cancel</button>
            <button onClick={submit} disabled={submitting || !text.trim()}
              style={{ fontSize:11,fontWeight:700,color:'white',background:submitting||!text.trim()?'#1e3a5f':'#059669',border:'none',borderRadius:6,padding:'5px 14px',cursor:submitting||!text.trim()?'not-allowed':'pointer' }}>
              {submitting ? 'Checking…' : 'Post Comment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECOMMEND ARTICLE FORM ──────────────────────────────────────────────────
function RecommendArticleForm({ currentUser, onClose }) {
  const [form, setForm] = useState({ title:'', authors:'', journal:'', year:'', note:'' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = { width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:7, color:'#e2e8f0', fontSize:12, padding:'7px 10px', boxSizing:'border-box' };

  const submit = async () => {
    if (!form.title.trim() || !currentUser) return;
    setSubmitting(true); setError('');
    try {
      const sb = getSupabase(currentUser?.access_token);
      const result = await sb.from('article_recommendations').insert({
        user_id: currentUser.id,
        user_email: currentUser.email,
        title: form.title.trim(),
        authors: form.authors.trim(),
        journal: form.journal.trim(),
        year: form.year.trim(),
        note: form.note.trim(),
        created_at: new Date().toISOString(),
        status: 'pending',
      });
      if (Array.isArray(result) && result[0]) setDone(true);
      else setError('Failed to submit. Please try again.');
    } catch { setError('Network error. Please try again.'); }
    setSubmitting(false);
  };

  if (done) return (
    <div style={{ padding:'20px',textAlign:'center' }}>
      <div style={{ fontSize:28,marginBottom:8 }}>✅</div>
      <p style={{ color:'#a7f3d0',fontWeight:700,fontSize:14 }}>Recommendation submitted!</p>
      <p style={{ color:'#64748b',fontSize:12 }}>Thank you — it will be reviewed for inclusion.</p>
      <button onClick={onClose} style={{ marginTop:12,padding:'6px 18px',borderRadius:7,border:'none',background:'#059669',color:'white',fontWeight:700,fontSize:12,cursor:'pointer' }}>Close</button>
    </div>
  );

  return (
    <div style={{ padding:'16px 20px',display:'flex',flexDirection:'column',gap:10 }}>
      <div style={{ fontSize:13,fontWeight:700,color:'#e2e8f0',marginBottom:4 }}>📬 Recommend an Article</div>
      <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
        <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Article Title *</label>
        <input style={inp} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Full article title" />
      </div>
      <div style={{ display:'flex',gap:8 }}>
        <div style={{ flex:2,display:'flex',flexDirection:'column',gap:5 }}>
          <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Authors</label>
          <input style={inp} value={form.authors} onChange={e=>set('authors',e.target.value)} placeholder="Author A, Author B, et al." />
        </div>
        <div style={{ flex:1,display:'flex',flexDirection:'column',gap:5 }}>
          <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Year</label>
          <input style={inp} value={form.year} onChange={e=>set('year',e.target.value)} placeholder="2024" maxLength={4} />
        </div>
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
        <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Journal</label>
        <input style={inp} value={form.journal} onChange={e=>set('journal',e.target.value)} placeholder="e.g. Skeletal Radiology" />
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
        <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Why relevant to MSK radiology?</label>
        <textarea style={{...inp,minHeight:60,resize:'vertical'}} value={form.note} onChange={e=>set('note',e.target.value)} placeholder="Brief note on clinical relevance or why this should be included…" />
      </div>
      {error && <p style={{ fontSize:11,color:'#f87171',margin:0 }}>{error}</p>}
      <div style={{ display:'flex',gap:8,justifyContent:'flex-end',marginTop:4 }}>
        <button onClick={onClose} style={{ fontSize:11,color:'#64748b',background:'none',border:'1px solid #334155',borderRadius:6,padding:'6px 14px',cursor:'pointer' }}>Cancel</button>
        <button onClick={submit} disabled={submitting || !form.title.trim()}
          style={{ fontSize:11,fontWeight:700,color:'white',background:submitting||!form.title.trim()?'#1e3a5f':'#059669',border:'none',borderRadius:6,padding:'6px 16px',cursor:submitting||!form.title.trim()?'not-allowed':'pointer' }}>
          {submitting ? 'Submitting…' : 'Submit Recommendation'}
        </button>
      </div>
    </div>
  );
}

// ─── RESEARCH MODAL ────────────────────────────────────────────────────────
// ─── MSK HUB DROPDOWN ────────────────────────────────────────────────────────
function MSKHubDropdown({ onOpenResearch, onOpenJobs, onOpenCme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(99,179,237,0.4)',background:'rgba(99,179,237,0.1)',color:'#90cdf4',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)',whiteSpace:'nowrap' }}>
        <span>🗂️</span> MSK Hub
      </button>
      {open && (
        <div style={{ position:'absolute',top:'calc(100% + 6px)',left:0,background:'#1a2332',border:'1px solid rgba(99,179,237,0.2)',borderRadius:10,boxShadow:'0 8px 32px rgba(0,0,0,0.9)',zIndex:99999,minWidth:210,overflow:'hidden' }}>
          <button
            onClick={() => { setOpen(false); onOpenResearch(); }}
            style={{ display:'block',width:'100%',padding:'11px 18px',background:'transparent',border:'none',borderBottom:'1px solid rgba(99,179,237,0.08)',color:'#cbd5e0',fontSize:13,textAlign:'left',cursor:'pointer',transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(99,179,237,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            📰 Latest MSK Research
          </button>
          <button
            onClick={() => { setOpen(false); onOpenCme(); }}
            style={{ display:'block',width:'100%',padding:'11px 18px',background:'transparent',border:'none',borderBottom:'1px solid rgba(99,179,237,0.08)',color:'#cbd5e0',fontSize:13,textAlign:'left',cursor:'pointer',transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(99,179,237,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            🎓 CME Library
          </button>
          <button
            onClick={() => { setOpen(false); onOpenJobs(); }}
            style={{ display:'block',width:'100%',padding:'11px 18px',background:'transparent',border:'none',color:'#cbd5e0',fontSize:13,textAlign:'left',cursor:'pointer',transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(99,179,237,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            💼 Jobs Board
          </button>

        </div>
      )}
    </div>
  );
}

// ─── RESEARCH MODAL INNER ────────────────────────────────────────────────────
function ResearchModalInner({ currentUser }) {
  const [expanded, setExpanded] = useState(null);
  const [showRecommend, setShowRecommend] = useState(false);
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:0 }}>
      {showRecommend && (
        <div style={{ background:'#141f30',borderBottom:'1px solid #1e3a5f',marginBottom:16,borderRadius:10,overflow:'hidden' }}>
          <RecommendArticleForm currentUser={currentUser} onClose={() => setShowRecommend(false)} />
        </div>
      )}
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        {RESEARCH_POSTS.map((post, idx) => {
          const isOpen = expanded === idx;
          const isLatest = idx === 0;
          return (
            <div key={idx} style={{ background:isOpen?'#1e293b':'#141f30',border:'1px solid '+(isOpen?'#059669':'#1e3a5f'),borderRadius:12,overflow:'hidden',transition:'border-color 0.2s' }}>
              <div onClick={() => setExpanded(isOpen ? null : idx)}
                style={{ padding:'14px 18px',cursor:'pointer',display:'flex',gap:14,alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap' }}>
                    {isLatest && <span style={{ background:'#059669',color:'white',fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:999,letterSpacing:'0.08em',textTransform:'uppercase' }}>NEW</span>}
                    {post.tags.map(tag => <span key={tag} style={{ background:'rgba(99,102,241,0.2)',color:'#a5b4fc',fontSize:9,fontWeight:600,padding:'2px 7px',borderRadius:999 }}>{tag}</span>)}
                    <span style={{ fontSize:10,color:'#475569',marginLeft:'auto' }}>{post.date}</span>
                  </div>
                  <div style={{ fontSize:14,fontWeight:700,color:'#e2e8f0',lineHeight:1.4,marginBottom:3 }}>{post.title}</div>
                  <div style={{ fontSize:11,color:'#64748b',fontStyle:'italic' }}>{post.journal}</div>
                </div>
                <div style={{ color:'#475569',fontSize:18,fontWeight:300,flexShrink:0,marginTop:2,transition:'transform 0.2s',transform:isOpen?'rotate(90deg)':'none' }}>›</div>
              </div>
              {isOpen && (
                <div style={{ padding:'0 18px 18px',borderTop:'1px solid #1e3a5f',overflowY:'auto',maxHeight:'55vh' }}>
                  <div style={{ padding:'10px 12px',background:'rgba(255,255,255,0.03)',borderRadius:7,marginTop:12,marginBottom:14 }}>
                    <span style={{ fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em' }}>Citation  </span>
                    <span style={{ fontSize:11,color:'#94a3b8',lineHeight:1.6 }}>{post.citation}</span>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Summary</div>
                    {post.summary.map((bullet, bi) => (
                      <div key={bi} style={{ display:'flex',gap:8,marginBottom:6 }}>
                        <span style={{ color:'#059669',fontWeight:700,fontSize:13,flexShrink:0,marginTop:1 }}>›</span>
                        <span style={{ fontSize:13,color:'#cbd5e1',lineHeight:1.7 }}>{bullet}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'linear-gradient(135deg,rgba(5,150,105,0.15),rgba(6,95,70,0.1))',border:'1px solid rgba(5,150,105,0.3)',borderRadius:8,padding:'10px 14px',marginBottom:12 }}>
                    <span style={{ fontSize:10,fontWeight:800,color:'#059669',textTransform:'uppercase',letterSpacing:'0.08em' }}>🔑 Key Takeaway  </span>
                    <span style={{ fontSize:13,color:'#a7f3d0',lineHeight:1.6,fontWeight:500 }}>{post.keyTakeaway}</span>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginTop:0 }}>
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:7,border:'1px solid #1e3a5f',background:'rgba(255,255,255,0.04)',color:'#60a5fa',fontSize:11,fontWeight:600,textDecoration:'none' }}>
                        🔗 Search on Google Scholar →
                      </a>
                    )}
                    <ArticleLikes postIdx={idx} />
                  </div>
                  <ArticleComments postIdx={idx} currentUser={currentUser} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:16,paddingTop:12,borderTop:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontSize:10,color:'#475569',fontStyle:'italic' }}>Add new posts to the top of RESEARCH_POSTS in page.js</span>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          <span style={{ fontSize:10,color:'#334155' }}>{RESEARCH_POSTS.length} post{RESEARCH_POSTS.length !== 1 ? 's' : ''}</span>
          {currentUser && !showRecommend && (
            <button onClick={() => setShowRecommend(true)}
              style={{ fontSize:10,fontWeight:700,color:'#059669',background:'rgba(5,150,105,0.1)',border:'1px solid rgba(5,150,105,0.25)',borderRadius:6,padding:'4px 10px',cursor:'pointer' }}>
              📬 Recommend Article
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MSK HUB MODAL ───────────────────────────────────────────────────────────
const JOB_TYPES = ['Full-Time','Part-Time','Fellowship','Locums','Research','Industry'];
const ADMIN_NOTIFY_EMAIL = 'admin@lucidmsk.com';
const emptyJobForm = { title:'', institution:'', location:'', job_type:'Full-Time', salary_range:'', apply_link:'', description:'' };

// ─── CME TAB INNER ──────────────────────────────────────────────────────────
const CME_SPECIALTIES = ['All', 'Knee', 'Shoulder', 'Hip', 'Ankle', 'Wrist/Hand', 'Elbow', 'Spine', 'Pelvis', 'Soft Tissue Tumors', 'Trauma', 'General MSK'];
const CME_FORMATS     = ['All', 'Video Lecture', 'Case-Based Module', 'Quiz/Self-Assessment', 'Podcast', 'Article Review', 'Slide Deck'];
const CME_CREDITS     = ['All', '0.25 AMA PRA Cat 1', '0.5 AMA PRA Cat 1', '1.0 AMA PRA Cat 1', '1.5 AMA PRA Cat 1', '2.0 AMA PRA Cat 1'];

// ── Bulk question paste parser ────────────────────────────────────────────
// Accepts a pasted block of quiz questions in a forgiving numbered format:
//   1. Question text?
//   A) wrong option
//   *B) correct option        <- asterisk marks the correct answer
//   C) wrong option
//   D) wrong option
// Also accepts "(correct)" as a suffix instead of a leading asterisk, lowercase
// letters, and either "1." or "1)" numbering. Returns { questions, errors } —
// errors are human-readable strings describing exactly which question failed and
// why, so the admin can fix just that one rather than re-pasting everything.
function parsePastedQuestions(raw) {
  if (!raw || !raw.trim()) return { questions: [], errors: ['Nothing to parse \u2014 paste your questions into the box first.'] };
  const errors = [];
  const lines = raw.split('\n');
  const blocks = [];
  let current = [];
  const qStartRe = /^\s*\d+[\.\)]\s+/;
  for (const line of lines) {
    if (qStartRe.test(line) && current.length) {
      blocks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current);

  const questions = [];
  const optRe = /^\s*(\*)?\s*([A-Da-d])[\.\)]\s*(.*)$/;

  blocks.forEach((block, bi) => {
    const nonEmpty = block.filter(l => l.trim());
    if (!nonEmpty.length) return;
    const qLine = nonEmpty[0].replace(qStartRe, '').trim();
    const optLines = nonEmpty.slice(1);
    const options = ['', '', '', ''];
    let correct_index = null;
    let parsedAny = false;
    optLines.forEach(line => {
      const m = line.match(optRe);
      if (!m) return;
      parsedAny = true;
      const isCorrect = !!m[1] || /\(correct\)/i.test(line);
      const letter = m[2].toUpperCase();
      const idx = letter.charCodeAt(0) - 65;
      let text = m[3].replace(/\(correct\)/i, '').trim();
      if (idx >= 0 && idx < 4) {
        options[idx] = text;
        if (isCorrect) correct_index = idx;
      }
    });
    if (!qLine) { errors.push(`Question ${bi+1}: missing question text.`); return; }
    if (!parsedAny || options.some(o => !o)) { errors.push(`Question ${bi+1} ("${qLine.slice(0,40)}${qLine.length>40?'...':''}"): needs exactly 4 lettered options (A\u2013D).`); return; }
    if (correct_index === null) { errors.push(`Question ${bi+1} ("${qLine.slice(0,40)}${qLine.length>40?'...':''}"): no correct answer marked \u2014 put a * before the correct letter, e.g. "*C) ..." or add "(correct)" after it.`); return; }
    questions.push({ question_text: qLine, options, correct_index });
  });

  return { questions, errors };
}

const PASTE_FORMAT_HELP = `1. Question text goes here?
A) Wrong option
*B) Correct option
C) Wrong option
D) Wrong option

2. Next question?
A) Wrong option
B) Wrong option
C) Wrong option
*D) Correct option`;

function CmeTabInner({ currentUser, isAdmin, sbHeaders, sbUrl, initialModuleId }) {
  const [modules, setModules]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterSpec, setFilterSpec]   = useState('All');
  const [filterFmt, setFilterFmt]     = useState('All');
  const [completedIds, setCompletedIds] = useState(new Set());
  const [activeModule, setActiveModule] = useState(null);
  const [moduleTab, setModuleTab]       = useState('content');
  const [contentViewed, setContentViewed] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers]   = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResult, setTestResult]     = useState(null);
  const [testLoading, setTestLoading]   = useState(false);
  const [showUpload, setShowUpload]     = useState(false);
  const [uploadForm, setUploadForm]     = useState({ title:'', specialty:'Knee', format:'Video Lecture', credits:'1.0', description:'', duration_min:'', url:'', objectives:'', author:'', thumbnail_url:'', content_type:'video', video_url:'', file_url:'', pathology_tags:'' });
  const [uploadQuestions, setUploadQuestions] = useState([
    { question_text:'', options:['','','',''], correct_index:0 },
    { question_text:'', options:['','','',''], correct_index:0 },
    { question_text:'', options:['','','',''], correct_index:0 },
  ]);
  const [uploadErr, setUploadErr]     = useState('');
  const [uploadOk, setUploadOk]       = useState('');
  const [saving, setSaving]           = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const thumbInputRef = useRef(null);
  const editThumbInputRef = useRef(null);

  // ── Edit module state ──────────────────────────────────────────────────────
  const [editingModule, setEditingModule] = useState(null);
  const [editForm, setEditForm]           = useState({});
  const [editQuestions, setEditQuestions] = useState([]);
  const [editErr, setEditErr]             = useState('');
  const [editOk, setEditOk]               = useState('');
  const [editSaving, setEditSaving]       = useState(false);

  // ── Bulk question paste state (upload + edit each get their own box) ───────
  const [uploadPasteText, setUploadPasteText] = useState('');
  const [uploadPasteErrors, setUploadPasteErrors] = useState([]);
  const [showUploadPasteBox, setShowUploadPasteBox] = useState(false);
  const [editPasteText, setEditPasteText] = useState('');
  const [editPasteErrors, setEditPasteErrors] = useState([]);
  const [showEditPasteBox, setShowEditPasteBox] = useState(false);

  const sbH = sbHeaders ? sbHeaders() : (() => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return { 'Content-Type':'application/json', 'apikey': key, 'Authorization': `Bearer ${(currentUser?.access_token || key)}` };
  })();
  const sbU = sbUrl || ((p) => `${SUPABASE_URL}/rest/v1/${p}`);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(sbU('cme_modules?select=*&status=eq.published&order=created_at.desc'), { headers: sbH });
        const data = await res.json();
        setModules(Array.isArray(data) ? data : []);
        if (currentUser) {
          const r2  = await fetch(sbU(`cme_completions?select=module_id&user_id=eq.${currentUser.id}`), { headers: sbH });
          const d2  = await r2.json();
          if (Array.isArray(d2)) setCompletedIds(new Set(d2.map(x => x.module_id)));
        }
      } catch(e) { console.error('CME fetch error', e); }
      setLoading(false);
    })();
  }, []);

  const markComplete = async (moduleId) => {
    if (!currentUser || completedIds.has(moduleId)) return;
    try {
      await fetch(sbU('cme_completions'), {
        method: 'POST',
        headers: { ...sbH, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ user_id: currentUser.id, module_id: moduleId, completed_at: new Date().toISOString() })
      });
      setCompletedIds(prev => new Set([...prev, moduleId]));
    } catch(e) { console.error('markComplete error', e); }
  };

  const submitModule = async () => {
    setUploadErr(''); setUploadOk('');
    if (!uploadForm.title.trim())       return setUploadErr('Title is required.');
    if (!uploadForm.description.trim()) return setUploadErr('Description is required.');
    const validQuestions = uploadQuestions.filter(q => q.question_text.trim() && q.options.every(o => o.trim()));
    if (validQuestions.length < 3)      return setUploadErr('At least 3 complete questions required (all 4 options filled).');
    setSaving(true);
    try {
      const payload = {
        ...uploadForm,
        status: 'published',
        duration_min: parseInt(uploadForm.duration_min)||null,
        created_by: currentUser?.id,
        question_count: validQuestions.length,
        pathology_tags: uploadForm.pathology_tags
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(Boolean),
      };
      const res = await fetch(sbU('cme_modules'), {
        method: 'POST',
        headers: { ...sbH, 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const [newMod] = await res.json();
      // Save questions
      for (let i = 0; i < validQuestions.length; i++) {
        const q = validQuestions[i];
        await fetch(sbU('cme_questions'), {
          method: 'POST',
          headers: { ...sbH, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ module_id: newMod.id, question_text: q.question_text, options: q.options, correct_index: q.correct_index, order_index: i })
        });
      }
      setModules(prev => [newMod, ...prev]);
      setUploadOk(`Module published with ${validQuestions.length} questions!`);
      setUploadForm({ title:'', specialty:'Knee', format:'Video Lecture', credits:'1.0', description:'', duration_min:'', url:'', objectives:'', author:'', thumbnail_url:'', content_type:'video', video_url:'', file_url:'', pathology_tags:'' });
      setUploadQuestions([
        { question_text:'', options:['','','',''], correct_index:0 },
        { question_text:'', options:['','','',''], correct_index:0 },
        { question_text:'', options:['','','',''], correct_index:0 },
      ]);
    } catch(e) { console.error('submitModule error', e); setUploadErr('Failed to publish. Please try again.'); }
    setSaving(false);
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm('Delete this CME module? This cannot be undone.')) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/cme_modules?id=eq.${moduleId}`, {
        method: 'DELETE',
        headers: { ...sbH, 'Prefer': 'return=minimal' }
      });
      if (!res.ok) throw new Error(await res.text());
      setModules(prev => prev.filter(m => m.id !== moduleId));
      setActiveModule(null);
    } catch(e) { console.error('deleteModule error', e); alert('Delete failed. Check RLS policy — see instructions.'); }
  };

  // ── Open edit form, pre-filling with existing module data ──────────────────
  const openEditModule = async (mod) => {
    setEditErr(''); setEditOk('');
    setEditForm({
      title:         mod.title || '',
      specialty:     mod.specialty || 'Knee',
      format:        mod.format || 'Video Lecture',
      credits:       mod.credits || '1.0',
      description:   mod.description || '',
      duration_min:  mod.duration_min || '',
      objectives:    mod.objectives || '',
      author:        mod.author || '',
      thumbnail_url: mod.thumbnail_url || '',
      pathology_tags: Array.isArray(mod.pathology_tags) ? mod.pathology_tags.join(', ') : (mod.pathology_tags || ''),
      content_type:  mod.content_type || (mod.file_url ? 'pdf' : 'video'),
      video_url:     mod.video_url || (mod.content_type === 'video' ? mod.url : '') || '',
      file_url:      mod.file_url  || (mod.content_type === 'pdf'   ? mod.url : '') || '',
      url:           mod.url || '',
    });
    try {
      const res = await fetch(sbU(`cme_questions?module_id=eq.${mod.id}&order=order_index.asc`), { headers: sbH });
      const qs  = await res.json();
      setEditQuestions(Array.isArray(qs) && qs.length > 0 ? qs.map(q => ({
        id:            q.id,
        question_text: q.question_text || q.question || '',
        options:       Array.isArray(q.options) ? q.options : ['','','',''],
        correct_index: q.correct_index ?? 0,
      })) : [
        { question_text:'', options:['','','',''], correct_index:0 },
        { question_text:'', options:['','','',''], correct_index:0 },
        { question_text:'', options:['','','',''], correct_index:0 },
      ]);
    } catch(e) {
      setEditQuestions([
        { question_text:'', options:['','','',''], correct_index:0 },
        { question_text:'', options:['','','',''], correct_index:0 },
        { question_text:'', options:['','','',''], correct_index:0 },
      ]);
    }
    setEditingModule(mod);
    setShowEditPasteBox(false);
    setEditPasteText('');
    setEditPasteErrors([]);
  };

  // ── Save edits back to Supabase ────────────────────────────────────────────
  const saveEditModule = async () => {
    setEditErr(''); setEditOk('');
    if (!editForm.title.trim())       return setEditErr('Title is required.');
    if (!editForm.description.trim()) return setEditErr('Description is required.');
    const validQs = editQuestions.filter(q => q.question_text.trim() && q.options.every(o => o.trim()));
    if (validQs.length < 3) return setEditErr('At least 3 complete questions required.');
    setEditSaving(true);
    try {
      const payload = {
        ...editForm,
        duration_min: parseInt(editForm.duration_min)||null,
        question_count: validQs.length,
        video_url: editForm.content_type === 'pdf' ? '' : editForm.video_url,
        file_url:  editForm.content_type === 'video' ? '' : editForm.file_url,
        url: editForm.content_type === 'pdf' ? editForm.file_url : editForm.video_url,
        pathology_tags: (editForm.pathology_tags || '')
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(Boolean),
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/cme_modules?id=eq.${editingModule.id}`, {
        method: 'PATCH',
        headers: { ...sbH, 'Prefer': 'return=representation' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const [updated] = await res.json();
      await fetch(`${SUPABASE_URL}/rest/v1/cme_questions?module_id=eq.${editingModule.id}`, {
        method: 'DELETE', headers: { ...sbH, 'Prefer': 'return=minimal' }
      });
      for (let i = 0; i < validQs.length; i++) {
        const q = validQs[i];
        await fetch(sbU('cme_questions'), {
          method: 'POST',
          headers: { ...sbH, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ module_id: editingModule.id, question_text: q.question_text, options: q.options, correct_index: q.correct_index, order_index: i }),
        });
      }
      setModules(prev => prev.map(m => m.id === editingModule.id ? { ...m, ...updated } : m));
      if (activeModule?.id === editingModule.id) setActiveModule(prev => ({ ...prev, ...updated }));
      setEditOk('Module updated successfully!');
      setTimeout(() => { setEditingModule(null); setEditOk(''); }, 1200);
    } catch(e) {
      console.error('saveEditModule error', e);
      setEditErr('Save failed. Please try again.');
    }
    setEditSaving(false);
  };

  const openModule = async (m) => {
    setActiveModule(m);
    setModuleTab('content');
    setContentViewed(false);
    setTestQuestions([]);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestResult(null);
    // Pre-fetch questions
    try {
      const res = await fetch(sbU(`cme_questions?module_id=eq.${m.id}&order=order_index.asc`), { headers: sbH });
      const data = await res.json();
      if (Array.isArray(data)) setTestQuestions(data);
    } catch(e) { console.error('loadQuestions error', e); }
  };

  // If the CME tab was opened with a specific module requested (e.g. clicked from
  // the report generator's "Related CME Available" banner), jump straight into that
  // module's detail screen once the modules list has finished loading.
  const didAutoOpenRef = useRef(false);
  useEffect(() => {
    if (didAutoOpenRef.current) return;
    if (!initialModuleId || loading || !modules.length) return;
    const match = modules.find(m => m.id === initialModuleId);
    if (match) {
      didAutoOpenRef.current = true;
      openModule(match);
    }
  }, [initialModuleId, loading, modules]);

  // Parses uploadPasteText and REPLACES the current uploadQuestions rows with the
  // result on success. On any parse error, nothing is replaced — errors are shown
  // instead so the admin can fix the pasted text without losing already-typed rows.
  const handleUploadPasteImport = () => {
    const { questions, errors } = parsePastedQuestions(uploadPasteText);
    if (errors.length) { setUploadPasteErrors(errors); return; }
    setUploadQuestions(questions);
    setUploadPasteErrors([]);
    setUploadPasteText('');
    setShowUploadPasteBox(false);
  };

  const handleEditPasteImport = () => {
    const { questions, errors } = parsePastedQuestions(editPasteText);
    if (errors.length) { setEditPasteErrors(errors); return; }
    setEditQuestions(questions);
    setEditPasteErrors([]);
    setEditPasteText('');
    setShowEditPasteBox(false);
  };

  const submitTest = async () => {
    if (!currentUser || !activeModule) return;
    setTestLoading(true);
    const total = testQuestions.length;
    if (total === 0) { setTestLoading(false); return; }
    let correct = 0;
    testQuestions.forEach(q => {
      if (testAnswers[q.id] === q.correct_index) correct++;
    });
    const score = correct / total;
    const threshold = parseFloat(activeModule.pass_threshold) || 0.75;
    const passed = score >= threshold;
    const credits = parseFloat(activeModule.credits) || 1.0;
    setTestResult({ score, passed, correct, total, credits });
    setTestSubmitted(true);
    // Record attempt
    try {
      await fetch(sbU('cme_attempts'), {
        method: 'POST',
        headers: { ...sbH, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ user_id: currentUser.id, module_id: activeModule.id, score, passed, completed_at: new Date().toISOString() })
      });
    } catch(e) { console.error('submitTest attempt error', e); }
    // If passed, mark complete and log credits
    if (passed && !completedIds.has(activeModule.id)) {
      try {
        await fetch(sbU('cme_completions'), {
          method: 'POST',
          headers: { ...sbH, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ user_id: currentUser.id, module_id: activeModule.id, completed_at: new Date().toISOString() })
        });
        setCompletedIds(prev => new Set([...prev, activeModule.id]));
      } catch(e) { console.error('markComplete error', e); }
    }
    setTestLoading(false);
  };

  const resetTest = () => {
    setTestAnswers({});
    setTestSubmitted(false);
    setTestResult(null);
  };

  const uploadThumbnail = async (file, targetSetter = setUploadForm, targetErrSetter = setUploadErr) => {
    if (!file) return;
    const allowed = ['image/jpeg','image/png','image/webp','image/gif'];
    if (!allowed.includes(file.type)) { targetErrSetter('Thumbnail must be a JPG, PNG, WebP, or GIF image.'); return; }
    if (file.size > 5 * 1024 * 1024) { targetErrSetter('Thumbnail must be under 5MB.'); return; }
    setThumbnailUploading(true);
    targetErrSetter('');
    try {
      const ext      = file.name.split('.').pop();
      const filename = `cme-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/cme-thumbnails/${filename}`,
        {
          method: 'POST',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${currentUser?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': file.type,
            'x-upsert': 'false',
          },
          body: file,
        }
      );
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || JSON.stringify(e)); }
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/cme-thumbnails/${filename}`;
      targetSetter(f => ({ ...f, thumbnail_url: publicUrl }));
    } catch(e) {
      console.error('uploadThumbnail error', e);
      targetErrSetter(`Thumbnail upload failed: ${e.message}`);
    }
    setThumbnailUploading(false);
  };

  const filtered = modules.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.author?.toLowerCase().includes(q) || m.specialty?.toLowerCase().includes(q);
    const matchSpec   = filterSpec === 'All' || m.specialty === filterSpec;
    const matchFmt    = filterFmt  === 'All' || m.format    === filterFmt;
    return matchSearch && matchSpec && matchFmt;
  });

  const totalCredits = [...completedIds].reduce((sum, id) => {
    const m = modules.find(x => x.id === id);
    return sum + (parseFloat(m?.credits) || 0);
  }, 0);

  const inp  = { background:'#0f172a', border:'1px solid rgba(99,179,237,0.2)', borderRadius:8, color:'#e2e8f0', fontSize:13, padding:'9px 12px', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' };
  const lbl  = { color:'#90cdf4', fontSize:12, fontWeight:700, letterSpacing:'0.04em', display:'block', marginBottom:4 };

  if (activeModule) {
    const isPdf   = activeModule.content_type === 'pdf'
      ? true
      : activeModule.content_type === 'video'
        ? false
        : !!activeModule.file_url;
    const isVideo = !isPdf && (activeModule.content_type === 'video' || !!activeModule.video_url);
    const contentUrl = isPdf
      ? (activeModule.file_url || activeModule.url || '')
      : (activeModule.video_url || activeModule.url || '');
    const alreadyPassed = completedIds.has(activeModule.id);
    const passThreshold = parseFloat(activeModule.pass_threshold) || 0.75;
    const allAnswered = testQuestions.length > 0 && testQuestions.every(q => testAnswers[q.id] !== undefined);

    // YouTube embed helper
    const getYouTubeId = (url) => {
      const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\n]+)/);
      return m ? m[1] : null;
    };

    return (
      <div>
        {/* Back button + header */}
        <button onClick={() => setActiveModule(null)} style={{ background:'none', border:'none', color:'#90cdf4', cursor:'pointer', fontSize:13, fontWeight:700, marginBottom:14, padding:0 }}>← Back to CME Library</button>

        <div style={{ background:'#0f172a', borderRadius:14, border:'1px solid rgba(99,179,237,0.15)', overflow:'hidden' }}>
          {/* Module header */}
          <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(99,179,237,0.1)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
              <div style={{ color:'#e2e8f0', fontSize:16, fontWeight:800, lineHeight:1.3, flex:1 }}>{activeModule.title}</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', flexShrink:0 }}>
                <span style={{ background:'rgba(99,179,237,0.1)', color:'#90cdf4', borderRadius:6, padding:'2px 9px', fontSize:11, fontWeight:700 }}>{activeModule.format}</span>
                <span style={{ background:'rgba(104,211,145,0.1)', color:'#68d391', borderRadius:6, padding:'2px 9px', fontSize:11, fontWeight:700 }}>{activeModule.credits} credit{parseFloat(activeModule.credits)!==1?'s':''}</span>
                {alreadyPassed && <span style={{ background:'rgba(104,211,145,0.15)', color:'#68d391', borderRadius:6, padding:'2px 9px', fontSize:11, fontWeight:700 }}>✅ Completed</span>}
              </div>
            </div>
            <div style={{ display:'flex', gap:14, color:'#4a5568', fontSize:11, marginTop:6, flexWrap:'wrap' }}>
              {activeModule.author    && <span>👤 {activeModule.author}</span>}
              {activeModule.specialty && <span>🦴 {activeModule.specialty}</span>}
              {activeModule.duration_min && <span>⏱ {activeModule.duration_min} min</span>}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display:'flex', borderBottom:'1px solid rgba(99,179,237,0.1)' }}>
            {['content','test'].map(t => {
              const labels = { content:'📺 Content', test:'📝 Post-Test' };
              const locked = t === 'test' && !contentViewed && !alreadyPassed;
              const active = moduleTab === t;
              return (
                <button key={t} onClick={() => { if (!locked) setModuleTab(t); }}
                  style={{ flex:1, padding:'11px 0', background: active ? 'rgba(99,179,237,0.08)' : 'none', border:'none', borderBottom: active ? '2px solid #90cdf4' : '2px solid transparent', color: locked ? '#374151' : active ? '#90cdf4' : '#64748b', fontSize:13, fontWeight:700, cursor: locked ? 'not-allowed' : 'pointer', transition:'all 0.15s' }}>
                  {labels[t]}{locked ? ' 🔒' : ''}
                </button>
              );
            })}
          </div>

          {/* CONTENT TAB */}
          {moduleTab === 'content' && (
            <div style={{ padding:'20px 22px' }}>
              {/* Video embed */}
              {isVideo && contentUrl && (() => {
                const ytId = getYouTubeId(contentUrl);
                return ytId ? (
                  <div style={{ position:'relative', paddingBottom:'56.25%', height:0, borderRadius:10, overflow:'hidden', marginBottom:18, border:'1px solid rgba(99,179,237,0.15)' }}>
                    <iframe src={`https://www.youtube.com/embed/${ytId}`} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                ) : (
                  <a href={contentUrl} target="_blank" rel="noopener noreferrer" style={{ display:'block', padding:'14px 18px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:10, color:'#90cdf4', fontSize:13, fontWeight:700, textDecoration:'none', marginBottom:18 }}>▶️ Open Video →</a>
                );
              })()}

              {/* PDF embed */}
              {isPdf && !isVideo && contentUrl && (
                <div style={{ marginBottom:18 }}>
                  <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + contentUrl : contentUrl)}&embedded=true`} style={{ width:'100%', height:'80vh', minHeight:600, border:'1px solid rgba(99,179,237,0.15)', borderRadius:10 }} title="CME Module PDF" />
                </div>
              )}

              {/* Description + objectives */}
              {activeModule.description && <p style={{ color:'#a0aec0', fontSize:13, lineHeight:1.7, marginBottom:16 }}>{activeModule.description}</p>}
              {activeModule.objectives && (
                <div style={{ background:'rgba(99,179,237,0.05)', border:'1px solid rgba(99,179,237,0.1)', borderRadius:10, padding:'14px 18px', marginBottom:18 }}>
                  <div style={{ color:'#90cdf4', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:'0.05em' }}>LEARNING OBJECTIVES</div>
                  {activeModule.objectives.split('\n').filter(Boolean).map((obj, i) => (
                    <div key={i} style={{ color:'#a0aec0', fontSize:12, lineHeight:1.6, display:'flex', gap:8, marginBottom:4 }}>
                      <span style={{ color:'#3b82f6', flexShrink:0 }}>{i+1}.</span><span>{obj}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Admin actions */}
              {isAdmin && (
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  <button onClick={() => openEditModule(activeModule)}
                    style={{ padding:'8px 16px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.25)', borderRadius:8, color:'#90cdf4', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    ✏️ Edit Module
                  </button>
                  <button onClick={() => deleteModule(activeModule.id)}
                    style={{ padding:'8px 16px', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:8, color:'#fc8181', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    🗑️ Delete Module
                  </button>
                </div>
              )}

              {/* Unlock post-test button */}
              {!contentViewed && !alreadyPassed && testQuestions.length > 0 && (
                <button onClick={() => { setContentViewed(true); setModuleTab('test'); }}
                  style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,rgba(99,179,237,0.2),rgba(99,179,237,0.08))', border:'1px solid rgba(99,179,237,0.35)', borderRadius:10, color:'#90cdf4', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                  I've reviewed this content — Take the Post-Test →
                </button>
              )}
              {testQuestions.length === 0 && !alreadyPassed && (
                <div style={{ color:'#4a5568', fontSize:12, textAlign:'center', padding:'10px 0' }}>No post-test questions added yet.</div>
              )}
              {alreadyPassed && (
                <div style={{ textAlign:'center', padding:'14px', background:'rgba(104,211,145,0.07)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:10, color:'#68d391', fontSize:13, fontWeight:700 }}>
                  ✅ You have already passed this module and earned {activeModule.credits} credit{parseFloat(activeModule.credits)!==1?'s':''}.
                </div>
              )}
            </div>
          )}

          {/* POST-TEST TAB */}
          {moduleTab === 'test' && (
            <div style={{ padding:'20px 22px' }}>
              {/* Already passed */}
              {alreadyPassed && !testSubmitted && (
                <div style={{ textAlign:'center', padding:'28px', color:'#68d391' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>🏆</div>
                  <div style={{ fontSize:15, fontWeight:700 }}>Module Completed</div>
                  <div style={{ fontSize:12, color:'#4a5568', marginTop:6 }}>You already earned {activeModule.credits} credit{parseFloat(activeModule.credits)!==1?'s':''} for this module.</div>
                </div>
              )}

              {/* Result screen */}
              {testSubmitted && testResult && (
                <div>
                  <div style={{ textAlign:'center', padding:'24px 16px', background: testResult.passed ? 'rgba(104,211,145,0.07)' : 'rgba(245,101,101,0.07)', border:`1px solid ${testResult.passed ? 'rgba(104,211,145,0.25)' : 'rgba(245,101,101,0.2)'}`, borderRadius:12, marginBottom:20 }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>{testResult.passed ? '🎉' : '😔'}</div>
                    <div style={{ fontSize:18, fontWeight:800, color: testResult.passed ? '#68d391' : '#fc8181', marginBottom:6 }}>
                      {testResult.passed ? 'Congratulations — You Passed!' : 'Not Quite — Please Retry'}
                    </div>
                    <div style={{ fontSize:14, color:'#a0aec0', marginBottom:4 }}>
                      Score: {testResult.correct}/{testResult.total} ({Math.round(testResult.score * 100)}%) — Pass threshold: {Math.round(passThreshold * 100)}%
                    </div>
                    {testResult.passed && (
                      <div style={{ fontSize:13, color:'#68d391', fontWeight:700, marginTop:6 }}>
                        🎓 {testResult.credits} CME credit{testResult.credits !== 1 ? 's' : ''} earned
                      </div>
                    )}
                  </div>

                  {/* Answer review */}
                  <div style={{ marginBottom:20 }}>
                    {testQuestions.map((q, i) => {
                      const selected = testAnswers[q.id];
                      const correct  = q.correct_index;
                      const isRight  = selected === correct;
                      return (
                        <div key={q.id} style={{ marginBottom:14, padding:'14px 16px', background:'rgba(15,23,42,0.6)', border:`1px solid ${isRight ? 'rgba(104,211,145,0.2)' : 'rgba(245,101,101,0.2)'}`, borderRadius:10 }}>
                          <div style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, marginBottom:10 }}>{i+1}. {q.question_text}</div>
                          {q.options.map((opt, oi) => {
                            const isSelected = selected === oi;
                            const isCorrect  = correct === oi;
                            return (
                              <div key={oi} style={{ padding:'7px 12px', marginBottom:4, borderRadius:7, fontSize:12,
                                background: isCorrect ? 'rgba(104,211,145,0.12)' : isSelected && !isCorrect ? 'rgba(245,101,101,0.1)' : 'transparent',
                                border: `1px solid ${isCorrect ? 'rgba(104,211,145,0.3)' : isSelected && !isCorrect ? 'rgba(245,101,101,0.25)' : 'transparent'}`,
                                color: isCorrect ? '#68d391' : isSelected && !isCorrect ? '#fc8181' : '#64748b',
                                display:'flex', alignItems:'center', gap:8 }}>
                                <span>{isCorrect ? '✓' : isSelected && !isCorrect ? '✗' : '○'}</span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Certificate or retry */}
                  {testResult.passed ? (
                    <div style={{ background:'rgba(104,211,145,0.06)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:12, padding:'20px 22px', textAlign:'center' }}>
                      <div style={{ color:'#68d391', fontSize:13, fontWeight:700, marginBottom:4 }}>🏅 Certificate of Completion</div>
                      <div style={{ color:'#a0aec0', fontSize:12, marginBottom:14 }}>
                        This certifies that <strong style={{ color:'#e2e8f0' }}>{currentUser?.email}</strong> has successfully completed<br/>
                        <strong style={{ color:'#e2e8f0' }}>{activeModule.title}</strong><br/>
                        and earned <strong style={{ color:'#68d391' }}>{testResult.credits} CME credit{testResult.credits !== 1 ? 's' : ''}</strong> on {new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}.
                      </div>
                      <button onClick={() => window.print()}
                        style={{ padding:'10px 24px', background:'rgba(104,211,145,0.12)', border:'1px solid rgba(104,211,145,0.3)', borderRadius:9, color:'#68d391', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                        🖨️ Print Certificate
                      </button>
                    </div>
                  ) : (
                    <button onClick={resetTest}
                      style={{ width:'100%', padding:'12px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.25)', borderRadius:10, color:'#90cdf4', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                      🔄 Retake Post-Test
                    </button>
                  )}
                </div>
              )}

              {/* Questions */}
              {!testSubmitted && !alreadyPassed && (
                <div>
                  <div style={{ color:'#90cdf4', fontSize:13, fontWeight:700, marginBottom:16 }}>
                    Post-Test — {testQuestions.length} Question{testQuestions.length!==1?'s':''} · Pass score: {Math.round(passThreshold*100)}%
                  </div>
                  {testQuestions.map((q, i) => (
                    <div key={q.id} style={{ marginBottom:18, padding:'16px 18px', background:'rgba(15,23,42,0.5)', border:'1px solid rgba(99,179,237,0.1)', borderRadius:12 }}>
                      <div style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, marginBottom:12 }}>{i+1}. {q.question_text}</div>
                      {q.options.map((opt, oi) => {
                        const selected = testAnswers[q.id] === oi;
                        return (
                          <div key={oi} onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: oi }))}
                            style={{ padding:'9px 14px', marginBottom:6, borderRadius:8, fontSize:12, cursor:'pointer', transition:'all 0.12s',
                              background: selected ? 'rgba(99,179,237,0.15)' : 'rgba(99,179,237,0.03)',
                              border: `1px solid ${selected ? 'rgba(99,179,237,0.5)' : 'rgba(99,179,237,0.1)'}`,
                              color: selected ? '#90cdf4' : '#94a3b8',
                              display:'flex', alignItems:'center', gap:10 }}>
                            <span style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${selected ? '#90cdf4' : '#374151'}`, background: selected ? '#90cdf4' : 'transparent', flexShrink:0, display:'inline-block' }} />
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <button onClick={submitTest} disabled={!allAnswered || testLoading}
                    style={{ width:'100%', padding:'13px', background: allAnswered ? 'linear-gradient(135deg,rgba(104,211,145,0.2),rgba(104,211,145,0.08))' : 'rgba(55,65,81,0.3)', border:`1px solid ${allAnswered ? 'rgba(104,211,145,0.35)' : 'rgba(55,65,81,0.4)'}`, borderRadius:10, color: allAnswered ? '#68d391' : '#374151', fontSize:14, fontWeight:700, cursor: allAnswered ? 'pointer' : 'not-allowed' }}>
                    {testLoading ? '⏳ Submitting...' : allAnswered ? '✅ Submit Post-Test' : `Answer all ${testQuestions.length} questions to submit`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      {/* ── Edit Module Modal ─────────────────────────────────────────────── */}
      {isAdmin && editingModule && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9999, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'24px 16px' }}>
          <div style={{ background:'#0d1929', border:'1px solid rgba(99,179,237,0.2)', borderRadius:14, width:'100%', maxWidth:760, padding:'28px 28px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ color:'#90cdf4', fontSize:15, fontWeight:700 }}>✏️ Edit Module</div>
              <button onClick={() => { setEditingModule(null); setEditErr(''); setEditOk(''); }}
                style={{ background:'none', border:'none', color:'#718096', fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
            </div>
            {editErr && <div style={{ color:'#fc8181', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{editErr}</div>}
            {editOk  && <div style={{ color:'#68d391', background:'rgba(104,211,145,0.08)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{editOk}</div>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label style={lbl}>Module Title *</label><input style={inp} value={editForm.title||''} onChange={e => setEditForm(f=>({...f,title:e.target.value}))} /></div>
              <div><label style={lbl}>Author / Faculty</label><input style={inp} value={editForm.author||''} onChange={e => setEditForm(f=>({...f,author:e.target.value}))} /></div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Pathology Tags <span style={{ color:'#4a5568', fontWeight:400 }}>(comma-separated)</span></label>
              <input style={inp} value={editForm.pathology_tags||''} onChange={e => setEditForm(f=>({...f,pathology_tags:e.target.value}))} placeholder="rotator cuff tear, impingement" />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Thumbnail Image <span style={{ color:'#4a5568', fontWeight:400 }}>(optional — JPG, PNG, or WebP · max 5MB)</span></label>
              <input ref={editThumbInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display:'none' }} onChange={e => uploadThumbnail(e.target.files[0], setEditForm, setEditErr)} />
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <button type="button" onClick={() => editThumbInputRef.current?.click()} disabled={thumbnailUploading}
                  style={{ padding:'9px 16px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:8, color: thumbnailUploading ? '#4a5568' : '#90cdf4', fontSize:12, fontWeight:700, cursor: thumbnailUploading ? 'not-allowed' : 'pointer', flexShrink:0 }}>
                  {thumbnailUploading ? '⏳ Uploading...' : '📁 Choose Image'}
                </button>
                {editForm.thumbnail_url
                  ? <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                      <img src={editForm.thumbnail_url} alt="thumbnail preview" style={{ height:40, width:70, objectFit:'cover', borderRadius:5, border:'1px solid rgba(99,179,237,0.2)' }} />
                      <span style={{ color:'#68d391', fontSize:11, fontWeight:700 }}>✅ Set</span>
                      <button type="button" onClick={() => { setEditForm(f=>({...f,thumbnail_url:''})); if(editThumbInputRef.current) editThumbInputRef.current.value=''; }}
                        style={{ background:'none', border:'none', color:'#fc8181', fontSize:11, cursor:'pointer', padding:0 }}>✕ Remove</button>
                    </div>
                  : <span style={{ color:'#374151', fontSize:11 }}>No image selected — module will show default 🎓 icon</span>
                }
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label style={lbl}>Specialty</label>
                <select style={inp} value={editForm.specialty||'Knee'} onChange={e => setEditForm(f=>({...f,specialty:e.target.value}))}>
                  {CME_SPECIALTIES.filter(s=>s!=='All').map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Format</label>
                <select style={inp} value={editForm.format||'Video Lecture'} onChange={e => setEditForm(f=>({...f,format:e.target.value}))}>
                  {CME_FORMATS.filter(f=>f!=='All').map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Credits</label>
                <select style={inp} value={editForm.credits||'1.0'} onChange={e => setEditForm(f=>({...f,credits:e.target.value}))}>
                  {CME_CREDITS.filter(c=>c!=='All').map(c => <option key={c} value={c.split(' ')[0]}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Duration (min)</label><input style={inp} type="number" value={editForm.duration_min||''} onChange={e => setEditForm(f=>({...f,duration_min:e.target.value}))} /></div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Description *</label>
              <textarea style={{ ...inp, minHeight:70, resize:'vertical' }} value={editForm.description||''} onChange={e => setEditForm(f=>({...f,description:e.target.value}))} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Learning Objectives <span style={{ color:'#4a5568', fontWeight:400 }}>(one per line)</span></label>
              <textarea style={{ ...inp, minHeight:70, resize:'vertical' }} value={editForm.objectives||''} onChange={e => setEditForm(f=>({...f,objectives:e.target.value}))} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Content Type</label>
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                {['video','pdf'].map(ct => (
                  <button key={ct} type="button" onClick={() => setEditForm(f=>({...f, content_type:ct, video_url: ct==='pdf' ? '' : f.video_url, file_url: ct==='video' ? '' : f.file_url}))}
                    style={{ padding:'7px 18px', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer', border:`1px solid ${editForm.content_type===ct?'rgba(99,179,237,0.5)':'rgba(99,179,237,0.15)'}`, background:editForm.content_type===ct?'rgba(99,179,237,0.12)':'transparent', color:editForm.content_type===ct?'#90cdf4':'#64748b' }}>
                    {ct==='video'?'▶️ Video (YouTube)':'📄 PDF / Slides'}
                  </button>
                ))}
              </div>
              {editForm.content_type==='video'
                ? <input style={inp} value={editForm.video_url||''} onChange={e => setEditForm(f=>({...f,video_url:e.target.value,url:e.target.value}))} placeholder="https://www.youtube.com/watch?v=..." />
                : <input style={inp} value={editForm.file_url||''} onChange={e => setEditForm(f=>({...f,file_url:e.target.value,url:e.target.value}))} placeholder="/pdf/CME_Module01_Spine_Content.pdf" />
              }
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <label style={{ ...lbl, marginBottom:0 }}>Post-Test Questions * <span style={{ color:'#4a5568', fontWeight:400 }}>(min 3)</span></label>
                <div style={{ display:'flex', gap:8 }}>
                  <button type="button" onClick={() => setShowEditPasteBox(s => !s)}
                    style={{ padding:'5px 12px', background:'rgba(104,211,145,0.1)', border:'1px solid rgba(104,211,145,0.25)', borderRadius:6, color:'#68d391', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    📋 Paste Questions
                  </button>
                  <button type="button" onClick={() => setEditQuestions(qs=>[...qs,{question_text:'',options:['','','',''],correct_index:0}])}
                    style={{ padding:'5px 12px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:6, color:'#90cdf4', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    + Add Question
                  </button>
                </div>
              </div>
              {showEditPasteBox && (
                <div style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:10, padding:'14px 16px', marginBottom:10 }}>
                  <div style={{ color:'#718096', fontSize:10.5, marginBottom:8, whiteSpace:'pre-wrap', fontFamily:'monospace', lineHeight:1.5 }}>{PASTE_FORMAT_HELP}</div>
                  <textarea
                    value={editPasteText}
                    onChange={e => setEditPasteText(e.target.value)}
                    placeholder="Paste your questions here, in the format shown above..."
                    style={{ ...inp, minHeight:160, fontFamily:'monospace', fontSize:11.5, resize:'vertical', marginBottom:8 }}
                  />
                  {editPasteErrors.length > 0 && (
                    <div style={{ background:'rgba(252,129,129,0.1)', border:'1px solid rgba(252,129,129,0.25)', borderRadius:6, padding:'8px 10px', marginBottom:8 }}>
                      {editPasteErrors.map((e, i) => (
                        <div key={i} style={{ color:'#fc8181', fontSize:11, marginBottom:i<editPasteErrors.length-1?4:0 }}>• {e}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:8 }}>
                    <button type="button" onClick={handleEditPasteImport}
                      style={{ padding:'7px 16px', background:'rgba(104,211,145,0.15)', border:'1px solid rgba(104,211,145,0.35)', borderRadius:6, color:'#68d391', fontSize:11.5, fontWeight:700, cursor:'pointer' }}>
                      Import &amp; Replace Questions Below
                    </button>
                    <button type="button" onClick={() => { setShowEditPasteBox(false); setEditPasteText(''); setEditPasteErrors([]); }}
                      style={{ padding:'7px 16px', background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, color:'#718096', fontSize:11.5, cursor:'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {editQuestions.map((q,qi) => (
                <div key={qi} style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(99,179,237,0.1)', borderRadius:10, padding:'14px 16px', marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ color:'#90cdf4', fontSize:12, fontWeight:700 }}>Q{qi+1}</span>
                    {editQuestions.length > 3 && (
                      <button type="button" onClick={() => setEditQuestions(qs=>qs.filter((_,i)=>i!==qi))}
                        style={{ background:'none', border:'none', color:'#fc8181', fontSize:11, cursor:'pointer', padding:0 }}>✕ Remove</button>
                    )}
                  </div>
                  <input style={{ ...inp, marginBottom:8 }} value={q.question_text} onChange={e => setEditQuestions(qs=>qs.map((x,i)=>i===qi?{...x,question_text:e.target.value}:x))} placeholder={`Question ${qi+1}...`} />
                  {q.options.map((opt,oi) => (
                    <div key={oi} style={{ display:'flex', gap:6, alignItems:'center', marginBottom:5 }}>
                      <input type="radio" name={`edit_correct_${qi}`} checked={q.correct_index===oi} onChange={() => setEditQuestions(qs=>qs.map((x,i)=>i===qi?{...x,correct_index:oi}:x))} style={{ accentColor:'#68d391' }} />
                      <input style={{ ...inp, flex:1 }} value={opt} onChange={e => setEditQuestions(qs=>qs.map((x,i)=>i===qi?{...x,options:x.options.map((o,j)=>j===oi?e.target.value:o)}:x))} placeholder={`Option ${String.fromCharCode(65+oi)}`} />
                    </div>
                  ))}
                  <div style={{ fontSize:10, color:'#4a5568', marginTop:4 }}>● = correct answer</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={saveEditModule} disabled={editSaving}
                style={{ flex:1, padding:'11px', background:editSaving?'#1a3a5c':'linear-gradient(135deg,#2b6cb0,#1a3a5c)', border:'1px solid rgba(99,179,237,0.3)', borderRadius:9, color:'#e2e8f0', fontSize:13, fontWeight:700, cursor:editSaving?'not-allowed':'pointer' }}>
                {editSaving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
              <button onClick={() => { setEditingModule(null); setEditErr(''); setEditOk(''); }}
                style={{ padding:'11px 20px', background:'transparent', border:'1px solid rgba(99,179,237,0.15)', borderRadius:9, color:'#718096', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:12, borderBottom:'1px solid rgba(99,179,237,0.1)', flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ color:'#90cdf4', fontSize:15, fontWeight:700 }}>CME Library</div>
          <div style={{ color:'#4a5568', fontSize:12, marginTop:2 }}>AMA PRA Category 1 credits — MSK Radiology</div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          {currentUser && (
            <div style={{ background:'rgba(104,211,145,0.08)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:8, padding:'6px 14px', color:'#68d391', fontSize:12, fontWeight:700 }}>
              🎓 {totalCredits.toFixed(2)} credits earned · {completedIds.size} module{completedIds.size!==1?'s':''} completed
            </div>
          )}
          {isAdmin && (
            <button onClick={() => setShowUpload(v => !v)}
              style={{ padding:'7px 16px', background: showUpload ? 'rgba(245,189,64,0.12)' : 'rgba(99,179,237,0.08)', border:'1px solid '+(showUpload?'rgba(245,189,64,0.3)':'rgba(99,179,237,0.2)'), borderRadius:8, color: showUpload ? '#f6bd40':'#90cdf4', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              {showUpload ? '✕ Cancel Upload' : '⬆️ Upload Module'}
            </button>
          )}
        </div>
      </div>

      {/* Admin upload form */}
      {isAdmin && showUpload && (
        <div style={{ background:'rgba(245,189,64,0.04)', border:'1px solid rgba(245,189,64,0.15)', borderRadius:12, padding:'20px 22px', marginBottom:20 }}>
          <div style={{ color:'#f6bd40', fontSize:13, fontWeight:700, marginBottom:16 }}>📤 Upload New CME Module</div>
          {uploadErr && <div style={{ color:'#fc8181', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{uploadErr}</div>}
          {uploadOk  && <div style={{ color:'#68d391', background:'rgba(104,211,145,0.08)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{uploadOk}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div><label style={lbl}>Module Title *</label><input style={inp} value={uploadForm.title} onChange={e => setUploadForm(f=>({...f,title:e.target.value}))} placeholder="e.g. ACL Tears: Anatomy to MRI Pattern Recognition" /></div>
            <div><label style={lbl}>Author / Faculty</label><input style={inp} value={uploadForm.author} onChange={e => setUploadForm(f=>({...f,author:e.target.value}))} placeholder="Dr. Jane Smith, MD" /></div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Pathology Tags <span style={{ color:'#4a5568', fontWeight:400 }}>(comma-separated — used to match this module to relevant reports, e.g. "rotator cuff tear, impingement, labral tear")</span></label>
            <input style={inp} value={uploadForm.pathology_tags} onChange={e => setUploadForm(f=>({...f,pathology_tags:e.target.value}))} placeholder="rotator cuff tear, impingement" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:12 }}>
            <div><label style={lbl}>Specialty</label>
              <select style={inp} value={uploadForm.specialty} onChange={e => setUploadForm(f=>({...f,specialty:e.target.value}))}>
                {CME_SPECIALTIES.filter(s=>s!=='All').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Format</label>
              <select style={inp} value={uploadForm.format} onChange={e => setUploadForm(f=>({...f,format:e.target.value}))}>
                {CME_FORMATS.filter(f=>f!=='All').map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Credits</label>
              <select style={inp} value={uploadForm.credits} onChange={e => setUploadForm(f=>({...f,credits:e.target.value}))}>
                {CME_CREDITS.filter(c=>c!=='All').map(c => <option key={c} value={c.split(' ')[0]}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Duration (min)</label><input style={inp} type="number" value={uploadForm.duration_min} onChange={e => setUploadForm(f=>({...f,duration_min:e.target.value}))} placeholder="45" /></div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Module URL * <span style={{ color:'#4a5568', fontWeight:400 }}>(hosted video, PDF, or SCORM link)</span></label>
            <input style={inp} value={uploadForm.url} onChange={e => setUploadForm(f=>({...f,url:e.target.value}))} placeholder="https://..." />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Thumbnail Image <span style={{ color:'#4a5568', fontWeight:400 }}>(optional — JPG, PNG, or WebP · max 5MB)</span></label>
            <input ref={thumbInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display:'none' }} onChange={e => uploadThumbnail(e.target.files[0])} />
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <button type="button" onClick={() => thumbInputRef.current?.click()} disabled={thumbnailUploading}
                style={{ padding:'9px 16px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:8, color: thumbnailUploading ? '#4a5568' : '#90cdf4', fontSize:12, fontWeight:700, cursor: thumbnailUploading ? 'not-allowed' : 'pointer', flexShrink:0 }}>
                {thumbnailUploading ? '⏳ Uploading...' : '📁 Choose Image'}
              </button>
              {uploadForm.thumbnail_url
                ? <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                    <img src={uploadForm.thumbnail_url} alt="thumbnail preview" style={{ height:40, width:70, objectFit:'cover', borderRadius:5, border:'1px solid rgba(99,179,237,0.2)' }} />
                    <span style={{ color:'#68d391', fontSize:11, fontWeight:700 }}>✅ Uploaded</span>
                    <button type="button" onClick={() => { setUploadForm(f=>({...f,thumbnail_url:''})); if(thumbInputRef.current) thumbInputRef.current.value=''; }}
                      style={{ background:'none', border:'none', color:'#fc8181', fontSize:11, cursor:'pointer', padding:0 }}>✕ Remove</button>
                  </div>
                : <span style={{ color:'#374151', fontSize:11 }}>No image selected — module will show default 🎓 icon</span>
              }
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Description *</label>
            <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} value={uploadForm.description} onChange={e => setUploadForm(f=>({...f,description:e.target.value}))} placeholder="Brief overview of the module content and clinical relevance..." />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Learning Objectives <span style={{ color:'#4a5568', fontWeight:400 }}>(one per line)</span></label>
            <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} value={uploadForm.objectives} onChange={e => setUploadForm(f=>({...f,objectives:e.target.value}))} placeholder={"Identify the key MRI findings of ACL tears\nDescribe partial vs complete tears\nApply grading criteria in clinical practice"} />
          </div>

          {/* Content type + URL */}
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Content Type</label>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              {['video','pdf'].map(ct => (
                <button key={ct} type="button" onClick={() => setUploadForm(f=>({...f,content_type:ct}))}
                  style={{ padding:'7px 18px', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer', border:`1px solid ${uploadForm.content_type===ct ? 'rgba(99,179,237,0.5)' : 'rgba(99,179,237,0.15)'}`, background: uploadForm.content_type===ct ? 'rgba(99,179,237,0.12)' : 'transparent', color: uploadForm.content_type===ct ? '#90cdf4' : '#64748b' }}>
                  {ct === 'video' ? '▶️ Video (YouTube)' : '📄 PDF / Slides'}
                </button>
              ))}
            </div>
            {uploadForm.content_type === 'video'
              ? <input style={inp} value={uploadForm.video_url} onChange={e => setUploadForm(f=>({...f,video_url:e.target.value,url:e.target.value}))} placeholder="https://www.youtube.com/watch?v=..." />
              : <input style={inp} value={uploadForm.file_url} onChange={e => setUploadForm(f=>({...f,file_url:e.target.value,url:e.target.value}))} placeholder="https://... (Supabase storage URL or public PDF link)" />
            }
          </div>

          {/* Post-test question builder */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <label style={{ ...lbl, marginBottom:0 }}>Post-Test Questions * <span style={{ color:'#4a5568', fontWeight:400 }}>(min 3, all 4 options required)</span></label>
              <div style={{ display:'flex', gap:8 }}>
                <button type="button" onClick={() => setShowUploadPasteBox(s => !s)}
                  style={{ padding:'5px 12px', background:'rgba(104,211,145,0.1)', border:'1px solid rgba(104,211,145,0.25)', borderRadius:6, color:'#68d391', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  📋 Paste Questions
                </button>
                <button type="button" onClick={() => setUploadQuestions(qs => [...qs, { question_text:'', options:['','','',''], correct_index:0 }])}
                  style={{ padding:'5px 12px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:6, color:'#90cdf4', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  + Add Question
                </button>
              </div>
            </div>
            {showUploadPasteBox && (
              <div style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:10, padding:'14px 16px', marginBottom:10 }}>
                <div style={{ color:'#718096', fontSize:10.5, marginBottom:8, whiteSpace:'pre-wrap', fontFamily:'monospace', lineHeight:1.5 }}>{PASTE_FORMAT_HELP}</div>
                <textarea
                  value={uploadPasteText}
                  onChange={e => setUploadPasteText(e.target.value)}
                  placeholder="Paste your questions here, in the format shown above..."
                  style={{ ...inp, minHeight:160, fontFamily:'monospace', fontSize:11.5, resize:'vertical', marginBottom:8 }}
                />
                {uploadPasteErrors.length > 0 && (
                  <div style={{ background:'rgba(252,129,129,0.1)', border:'1px solid rgba(252,129,129,0.25)', borderRadius:6, padding:'8px 10px', marginBottom:8 }}>
                    {uploadPasteErrors.map((e, i) => (
                      <div key={i} style={{ color:'#fc8181', fontSize:11, marginBottom:i<uploadPasteErrors.length-1?4:0 }}>• {e}</div>
                    ))}
                  </div>
                )}
                <div style={{ display:'flex', gap:8 }}>
                  <button type="button" onClick={handleUploadPasteImport}
                    style={{ padding:'7px 16px', background:'rgba(104,211,145,0.15)', border:'1px solid rgba(104,211,145,0.35)', borderRadius:6, color:'#68d391', fontSize:11.5, fontWeight:700, cursor:'pointer' }}>
                    Import &amp; Replace Questions Below
                  </button>
                  <button type="button" onClick={() => { setShowUploadPasteBox(false); setUploadPasteText(''); setUploadPasteErrors([]); }}
                    style={{ padding:'7px 16px', background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, color:'#718096', fontSize:11.5, cursor:'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {uploadQuestions.map((q, qi) => (
              <div key={qi} style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(99,179,237,0.1)', borderRadius:10, padding:'14px 16px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ color:'#90cdf4', fontSize:12, fontWeight:700 }}>Q{qi+1}</span>
                  {uploadQuestions.length > 3 && (
                    <button type="button" onClick={() => setUploadQuestions(qs => qs.filter((_,i)=>i!==qi))}
                      style={{ background:'none', border:'none', color:'#fc8181', fontSize:11, cursor:'pointer', padding:0 }}>✕ Remove</button>
                  )}
                </div>
                <input style={{ ...inp, marginBottom:8 }} value={q.question_text} onChange={e => setUploadQuestions(qs => qs.map((x,i) => i===qi ? {...x, question_text:e.target.value} : x))} placeholder={`Question ${qi+1} text...`} />
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display:'flex', gap:6, alignItems:'center', marginBottom:5 }}>
                    <input type="radio" name={`correct_${qi}`} checked={q.correct_index===oi} onChange={() => setUploadQuestions(qs => qs.map((x,i) => i===qi ? {...x, correct_index:oi} : x))} style={{ accentColor:'#68d391', flexShrink:0 }} />
                    <input style={{ ...inp, flex:1 }} value={opt} onChange={e => setUploadQuestions(qs => qs.map((x,i) => i===qi ? {...x, options:x.options.map((o,j)=>j===oi?e.target.value:o)} : x))} placeholder={`Option ${String.fromCharCode(65+oi)}`} />
                  </div>
                ))}
                <div style={{ color:'#4a5568', fontSize:10, marginTop:4 }}>🟢 Radio button = correct answer</div>
              </div>
            ))}
          </div>

          <button onClick={submitModule} disabled={saving}
            style={{ padding:'10px 24px', background:'linear-gradient(135deg,rgba(245,189,64,0.2),rgba(245,189,64,0.08))', border:'1px solid rgba(245,189,64,0.35)', borderRadius:9, color:'#f6bd40', fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
            {saving ? '⏳ Publishing...' : '🚀 Publish Module'}
          </button>
        </div>
      )}

      {/* Search + filters */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <input style={{ ...inp, flex:'1 1 200px', background:'#0f172a' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search modules, topics, faculty..." />
        <select style={{ ...inp, flex:'0 0 auto', width:'auto', background:'#0f172a' }} value={filterSpec} onChange={e => setFilterSpec(e.target.value)}>
          {CME_SPECIALTIES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={{ ...inp, flex:'0 0 auto', width:'auto', background:'#0f172a' }} value={filterFmt} onChange={e => setFilterFmt(e.target.value)}>
          {CME_FORMATS.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      {/* Module grid */}
      {loading && <p style={{ color:'#718096', fontSize:13 }}>Loading CME modules...</p>}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', color:'#4a5568', padding:'56px 24px' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎓</div>
          <div style={{ fontSize:14 }}>{modules.length === 0 ? 'No CME modules published yet.' : 'No modules match your search.'}</div>
          {isAdmin && modules.length === 0 && <div style={{ fontSize:12, marginTop:8, color:'#374151' }}>Use "Upload Module" above to add the first module.</div>}
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {filtered.map(m => {
          const done = completedIds.has(m.id);
          return (
            <div key={m.id} onClick={() => openModule(m)} style={{ background:'#0f172a', border:'1px solid '+(done?'rgba(104,211,145,0.25)':'rgba(99,179,237,0.12)'), borderRadius:12, overflow:'hidden', cursor:'pointer', transition:'border-color 0.15s,transform 0.15s', position:'relative' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              {m.thumbnail_url
                ? <div style={{ width:'100%', height:110, background:`url(${m.thumbnail_url}) center/cover`, borderBottom:'1px solid rgba(99,179,237,0.08)' }} />
                : <div style={{ width:'100%', height:70, background:'linear-gradient(135deg,#0c2340,#1a3a5c)', display:'flex', alignItems:'center', justifyContent:'center', borderBottom:'1px solid rgba(99,179,237,0.08)', fontSize:28 }}>🎓</div>
              }
              {done && <div style={{ position:'absolute', top:8, right:8, background:'rgba(104,211,145,0.9)', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:800, color:'#065f46' }}>✅ DONE</div>}
              <div style={{ padding:'14px 16px' }}>
                <div style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, lineHeight:1.4, marginBottom:8 }}>{m.title}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
                  <span style={{ background:'rgba(99,179,237,0.08)', color:'#64748b', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:700 }}>{m.specialty}</span>
                  <span style={{ background:'rgba(139,92,246,0.08)', color:'#a78bfa', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:700 }}>{m.format}</span>
                  <span style={{ background:'rgba(104,211,145,0.08)', color:'#68d391', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:700 }}>{m.credits} cr</span>
                </div>
                <p style={{ color:'#64748b', fontSize:11, lineHeight:1.5, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{m.description}</p>
                {m.duration_min && <div style={{ color:'#374151', fontSize:10, marginTop:8 }}>⏱ {m.duration_min} min{m.author ? ` · ${m.author}` : ''}</div>}
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteModule(m.id); }}
                    style={{ marginTop:10, padding:'5px 12px', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:6, color:'#fc8181', fontSize:11, fontWeight:700, cursor:'pointer', width:'100%' }}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MSKHubModal({ initialTab, initialModuleId, onClose, currentUser, isAdmin }) {
  const [tab, setTab]                 = useState(initialTab || 'research');
  const [jobs, setJobs]               = useState([]);
  const [pending, setPending]         = useState([]);
  const [form, setForm]               = useState(emptyJobForm);
  const [formErr, setFormErr]         = useState('');
  const [formOk, setFormOk]           = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const sbHeaders = () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = currentUser?.access_token || key;
    return { 'Content-Type':'application/json', 'apikey': key, 'Authorization': `Bearer ${token}` };
  };
  const sbUrl = (path) => `${SUPABASE_URL}/rest/v1/${path}`;

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(
        sbUrl(`job_posts?select=*&status=eq.approved&expires_at=gte.${today}&order=created_at.desc`),
        { headers: sbHeaders() }
      );
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch(e) { console.error('fetchJobs error:', e); }
    setLoadingJobs(false);
  };

  const fetchPending = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(
        sbUrl(`job_posts?select=*&status=eq.pending&order=created_at.desc`),
        { headers: sbHeaders() }
      );
      const data = await res.json();
      setPending(Array.isArray(data) ? data : []);
    } catch(e) { console.error('fetchPending error:', e); }
  };

  useEffect(() => {
    if (tab === 'jobs') fetchJobs();
    if (tab === 'cme') { /* CME modules load on mount inside CmeTabInner */ }
    if (tab === 'admin') { console.log('Admin tab opened, isAdmin:', isAdmin); fetchPending(); }
  }, [tab]);

  const setField = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submitJob = async () => {
    setFormErr(''); setFormOk('');
    if (!form.title.trim())       return setFormErr('Job title is required.');
    if (!form.institution.trim()) return setFormErr('Institution is required.');
    if (!form.location.trim())    return setFormErr('Location is required.');
    if (!form.apply_link.trim())  return setFormErr('Application link or contact email is required.');
    if (!form.description.trim()) return setFormErr('Job description is required.');
    setSubmitting(true);
    try {
      const expires = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
      const res = await fetch(sbUrl('job_posts'), {
        method: 'POST',
        headers: { ...sbHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...form, user_id: currentUser.id, status:'pending', expires_at: expires })
      });
      if (!res.ok) {
        const e = await res.json();
        console.error('Supabase insert error:', JSON.stringify(e));
        console.error('user_id being sent:', currentUser.id);
        console.error('access_token present:', !!currentUser?.access_token);
        throw new Error(JSON.stringify(e));
      }
      // Notify admin
      try {
        await fetch('/api/notify-admin', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ to: ADMIN_NOTIFY_EMAIL, subject: `[LucidMSK] New Job Post Pending: ${form.title}`,
            html: `<div style="font-family:sans-serif;padding:24px;background:#0f1923;color:#e2e8f0;border-radius:12px;"><h2 style="color:#90cdf4;">New Job Post Pending Approval</h2><p><b>Title:</b> ${form.title}</p><p><b>Institution:</b> ${form.institution}</p><p><b>Location:</b> ${form.location}</p><p><b>Type:</b> ${form.job_type}</p><p><b>Submitted by:</b> ${currentUser.email}</p><p style="margin-top:20px;color:#718096;">Log in to LucidMSK → MSK Hub → Admin tab to approve or remove this post.</p></div>` }) });
      } catch(_) {}
      setForm(emptyJobForm);
      setFormOk('Submitted! Your post will appear on the board once approved (usually within 24 hours).');
    } catch(e) {
      console.error('submitJob error:', e);
      setFormErr('Submission failed. Please try again.');
    }
    setSubmitting(false);
  };

  const approvePost = async id => {
    try {
      await fetch(sbUrl(`job_posts?id=eq.${id}`), { method:'PATCH', headers:{ ...sbHeaders(),'Prefer':'return=minimal' }, body: JSON.stringify({status:'approved'}) });
      fetchPending(); fetchJobs();
    } catch(e) { console.error('approvePost error:', e); }
  };
  const removePost = async id => {
    try {
      await fetch(sbUrl(`job_posts?id=eq.${id}`), { method:'PATCH', headers:{ ...sbHeaders(),'Prefer':'return=minimal' }, body: JSON.stringify({status:'removed'}) });
      fetchPending(); fetchJobs();
    } catch(e) { console.error('removePost error:', e); }
  };

  // ── shared styles ──
  const inp = { background:'#1a2332', border:'1px solid rgba(99,179,237,0.2)', borderRadius:8, color:'#e2e8f0', fontSize:13, padding:'9px 12px', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' };
  const lbl = { color:'#90cdf4', fontSize:12, fontWeight:700, letterSpacing:'0.04em', display:'block', marginBottom:4 };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.78)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'16px',overflowY:'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#0f172a',borderRadius:16,width:'min(99vw,880px)',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 30px 80px rgba(0,0,0,0.7)',border:'1px solid rgba(99,179,237,0.15)' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#0c2340,#153a5c)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,borderBottom:'1px solid rgba(99,179,237,0.15)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:20 }}>🗂️</span>
            <div>
              <div style={{ color:'white',fontWeight:800,fontSize:14,letterSpacing:'0.08em' }}>MSK HUB</div>
              <div style={{ color:'rgba(255,255,255,0.5)',fontSize:11,marginTop:1 }}>MSK Radiology Research · Careers · Opportunities</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',borderRadius:8,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:600 }}>✕</button>
        </div>

        {/* Tab bar */}
        <div onClick={e => e.stopPropagation()} style={{ display:'flex',gap:3,padding:'10px 16px 0',background:'#0f172a',flexShrink:0,position:'relative',zIndex:10 }}>
          {[
            { id:'research', label:'📰 Latest Research' },
            { id:'cme',      label:'🎓 CME' },
            { id:'jobs',     label:'💼 Jobs Board' },
            ...(isAdmin     ? [{ id:'admin', label:`🛡️ Admin${pending.length > 0 ? ` (${pending.length})` : ''}` }] : []),
          ].map(t => (
            <button key={t.id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTab(t.id); if (t.id === 'admin') fetchPending(); if (t.id === 'jobs') fetchJobs(); }}
              style={{ padding:'9px 16px',borderRadius:'8px 8px 0 0',border:'1px solid '+(tab===t.id?'rgba(99,179,237,0.3)':'rgba(99,179,237,0.1)'),borderBottom:'none',background:tab===t.id?'#1a2332':'rgba(99,179,237,0.05)',color:tab===t.id?'#90cdf4':'#94a3b8',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap',pointerEvents:'auto',zIndex:1,position:'relative' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1,overflowY:'auto',padding:'20px 24px',background:'#1a2332' }}>

          {/* ── Research tab — existing ResearchModal content ── */}
          {tab === 'research' && <ResearchModalInner currentUser={currentUser} />}

          {/* ── Jobs Board tab ── */}
          {tab === 'jobs' && (
            <div>
              <div style={{ color:'#90cdf4',fontSize:15,fontWeight:700,marginBottom:16,paddingBottom:10,borderBottom:'1px solid rgba(99,179,237,0.1)' }}>MSK Radiology Opportunities</div>
              {loadingJobs && <p style={{ color:'#718096',fontSize:13 }}>Loading...</p>}
              {!loadingJobs && jobs.length === 0 && (
                <div style={{ textAlign:'center',color:'#4a5568',padding:'48px 24px' }}>
                  <div style={{ fontSize:40,marginBottom:12 }}>🩻</div>
                  <div style={{ fontSize:14 }}>No active job postings yet.</div>
                </div>
              )}
              {jobs.map(job => (
                <div key={job.id} style={{ background:'#0f172a',border:'1px solid rgba(99,179,237,0.1)',borderRadius:12,padding:'18px 20px',marginBottom:12 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,flexWrap:'wrap' }}>
                    <div style={{ color:'#e2e8f0',fontSize:16,fontWeight:700 }}>{job.title}</div>
                    <span style={{ background:'rgba(99,179,237,0.1)',color:'#90cdf4',borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:700,border:'1px solid rgba(99,179,237,0.2)',flexShrink:0 }}>{job.job_type}</span>
                  </div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:12,margin:'8px 0',color:'#718096',fontSize:12 }}>
                    <span>🏥 {job.institution}</span>
                    <span>📍 {job.location}</span>
                    {job.salary_range && <span>💰 {job.salary_range}</span>}
                    <span>⏳ Expires {new Date(job.expires_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color:'#a0aec0',fontSize:13,lineHeight:1.6,margin:'10px 0' }}>{job.description}</p>
                  <div style={{ display:'flex',gap:8,flexWrap:'wrap',alignItems:'center' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(job.apply_link.startsWith('http') ? job.apply_link : `mailto:${job.apply_link}`, '_blank'); }}
                      style={{ display:'inline-block',padding:'7px 18px',background:'rgba(99,179,237,0.1)',border:'1px solid rgba(99,179,237,0.3)',borderRadius:8,color:'#90cdf4',fontSize:12,fontWeight:700,textDecoration:'none',cursor:'pointer' }}>
                      {job.apply_link.startsWith('http') ? '🔗 Apply / Learn More →' : '✉️ Email to Apply →'}
                    </button>
                    <span style={{ color:'#4a5568',fontSize:11 }}>or copy:</span>
                    <span style={{ color:'#64748b',fontSize:11,fontFamily:'monospace',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:5,padding:'3px 8px',userSelect:'all',cursor:'text' }}>{job.apply_link}</span>
                    {isAdmin && <button onClick={(e) => { e.stopPropagation(); removePost(job.id); }} style={{ padding:'7px 14px',background:'rgba(245,101,101,0.1)',border:'1px solid rgba(245,101,101,0.25)',borderRadius:8,color:'#fc8181',fontSize:12,fontWeight:600,cursor:'pointer' }}>Remove</button>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CME tab ── */}
          {tab === 'cme' && <CmeTabInner currentUser={currentUser} isAdmin={isAdmin} sbHeaders={sbHeaders} sbUrl={sbUrl} initialModuleId={initialModuleId} />}

          {/* ── Admin tab ── */}
          {tab === 'admin' && isAdmin && (
            <div>
              <div style={{ color:'#90cdf4',fontSize:15,fontWeight:700,marginBottom:16,paddingBottom:10,borderBottom:'1px solid rgba(99,179,237,0.1)' }}>
                Pending Approval
                {pending.length > 0 && <span style={{ background:'rgba(245,101,101,0.15)',color:'#fc8181',border:'1px solid rgba(245,101,101,0.3)',borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:700,marginLeft:10 }}>{pending.length} pending</span>}
              </div>
              {pending.length === 0 && <div style={{ textAlign:'center',color:'#4a5568',padding:'48px 24px',fontSize:14 }}>✅ No posts pending approval.</div>}
              {pending.map(job => (
                <div key={job.id} style={{ background:'#0f172a',border:'1px solid rgba(245,189,64,0.2)',borderRadius:12,padding:'18px 20px',marginBottom:12 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,flexWrap:'wrap' }}>
                    <div style={{ color:'#e2e8f0',fontSize:15,fontWeight:700 }}>{job.title}</div>
                    <span style={{ background:'rgba(245,189,64,0.1)',color:'#f6bd40',borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:700,border:'1px solid rgba(245,189,64,0.3)',flexShrink:0 }}>{job.job_type}</span>
                  </div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:12,margin:'8px 0',color:'#718096',fontSize:12 }}>
                    <span>🏥 {job.institution}</span>
                    <span>📍 {job.location}</span>
                    {job.salary_range && <span>💰 {job.salary_range}</span>}
                    <span>📅 Submitted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color:'#a0aec0',fontSize:13,lineHeight:1.6,margin:'10px 0' }}>{job.description}</p>
                  <div style={{ display:'flex',gap:8 }}>
                    <button onClick={() => approvePost(job.id)} style={{ padding:'7px 16px',background:'rgba(104,211,145,0.12)',border:'1px solid rgba(104,211,145,0.3)',borderRadius:8,color:'#68d391',fontSize:13,fontWeight:600,cursor:'pointer' }}>✅ Approve</button>
                    <button onClick={() => removePost(job.id)}  style={{ padding:'7px 16px',background:'rgba(245,101,101,0.1)', border:'1px solid rgba(245,101,101,0.25)',borderRadius:8,color:'#fc8181', fontSize:13,fontWeight:600,cursor:'pointer' }}>🗑️ Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── RESEARCH MODAL INNER (extracted so it works inside MSKHub) ───────────────
// This is the original ResearchModal body, refactored as a sub-component
function ResearchModal({ onClose, currentUser }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'8px' }}>
      <div style={{ background:'#0f172a',borderRadius:16,width:'min(99vw,860px)',height:'min(96vh,1000px)',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ background:'linear-gradient(135deg,#065f46,#059669)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:18 }}>📰</span>
            <div>
              <div style={{ color:'white',fontWeight:800,fontSize:14,letterSpacing:'0.08em' }}>LATEST MSK RADIOLOGY RESEARCH</div>
              <div style={{ color:'rgba(255,255,255,0.6)',fontSize:11,marginTop:1 }}>Weekly article reviews — key findings distilled for clinical practice</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',borderRadius:8,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:600 }}>✕</button>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'20px 24px' }}>
          <ResearchModalInner currentUser={currentUser} />
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
  const [gender, setGender] = useState('');
  const [ctDensity, setCtDensity] = useState('');
  const [macroFat, setMacroFat] = useState(false);
  const [softTissueExt, setSoftTissueExt] = useState(false);
  const [endostalScalloping, setEndostalScalloping] = useState(false);
  const [periostealRxn, setPeriostealRxn] = useState(false);
  const [fluidFluidLevels, setFluidFluidLevels] = useState(false);
  const [marrowEdema, setMarrowEdema] = useState(false);
  const [ddxResult, setDdxResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const inp = { width:'100%',padding:'8px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,color:'#1e293b',background:'white',boxSizing:'border-box' };
  const lbl = { fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4 };

  const generateDdx = async () => {
    setIsGenerating(true);
    setDdxResult('');
    const ctFindings = [ctLytic&&'lytic',ctSclerotic&&'sclerotic/blastic',ctGroundGlass&&'ground glass',ctChondroid&&'chondroid matrix'].filter(Boolean).join(', ');
    const aggressiveFeatures = [
      softTissueExt&&'extra-osseous soft tissue extension',
      endostalScalloping&&'deep endosteal scalloping (>2/3 cortical thickness)',
      periostealRxn&&'periosteal reaction',
      fluidFluidLevels&&'fluid-fluid levels',
      marrowEdema&&'marrow edema around intraosseous lesion',
    ].filter(Boolean).join(', ');
    const prompt = `You are a subspecialty MSK radiologist. Generate a prioritized differential diagnosis.

Patient: Age ${age||'unknown'}, Gender: ${gender||'not specified'}, Location: ${location||'not specified'}
Tissue type: ${tissueType}
${tissueType==='bone' ? `Bone location (epiphysis/metaphysis/diaphysis): ${boneLocation}` : `Depth: ${depth} to fascia`}
${ctFindings ? `CT matrix/density: ${ctFindings}` : ''}
${ctDensity ? `CT density relative to muscle: ${ctDensity}` : ''}
${macroFat ? 'Macroscopic fat present (T1 bright, drops on fat-sat)' : ''}
${aggressiveFeatures ? `Aggressive/additional features: ${aggressiveFeatures}` : ''}
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

Be concise and clinically actionable. Use WHO 2020 bone tumor classification, Kransdorf/Murphey criteria, and USP6 family recognition criteria (Broski & Wenger, Skeletal Radiol 2023).

IMPORTANT: If the pattern fits a USP6-driven neoplasm (myositis ossificans, ABC, nodular fasciitis, FOPD, fibroma of tendon sheath), explicitly flag this in your response with a USP6 FAMILY ALERT. These lesions mimic malignancy but are benign.

IMPORTANT: If a vertebral or sacrococcygeal lesion is described as T1 hypointense, T2 hyperintense, non-enhancing, centrally located, ± mild sclerosis, ± multifocal, WITHOUT lysis / extraosseous mass / avid enhancement — place BENIGN NOTOCHORDAL CELL TUMOR (BNCT) at the top of the differential. Flag with a BNCT ALERT and state that biopsy is NOT recommended for typical BNCT; imaging surveillance is appropriate.`;

    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:1200,
          system:`You are a subspecialty MSK radiologist expert in bone and soft tissue tumor imaging. Provide evidence-based differential diagnoses using WHO 2020 bone tumor classification, Kransdorf/Murphey criteria, and current molecular pathology knowledge.

CRITICAL KNOWLEDGE — USP6-DRIVEN NEOPLASM FAMILY (Broski & Wenger, Skeletal Radiol 2023):
Recognize this family of benign self-limiting mesenchymal neoplasms that share USP6 gene rearrangements on chr 17p13. All occur in young adults, often show RAPID GROWTH mimicking malignancy, and have overlapping imaging features. Members:

1. MYOSITIS OSSIFICANS: Intramuscular, 3 stages (early/intermediate/mature).
   - Early: Non-specific soft tissue mass, T1 iso/hypointense, T2 hyperintense, perilesional edema — mimics sarcoma
   - Key MRI: "striate" pattern (intact muscle fibers coursing through mass on images parallel to fibers)
   - Pathognomonic: PERIPHERAL zonal calcification (centripetal) — OPPOSITE to extraskeletal osteosarcoma (central/centrifugal)
   - With time: shrinks, edema resolves, develops internal fat signal (marrow maturation)
   - US: outer hypoechoic / middle hyperechoic (calcifying rim) / central hypoechoic zones
   - FDG PET: may be avid — peripheral calcification on CT component is key

2. ANEURYSMAL BONE CYST (ABC) — Primary (USP6+) vs Secondary (USP6−):
   - Location: metaphysis of long bones, posterior vertebral elements
   - XR/CT: lytic, expansile, eccentric metaphyseal, narrow zone of transition, thin cortical shell, delicate trabeculation (periosteal ridges not true bony septations)
   - MRI: multiple fluid-fluid levels (REQUISITE for conventional ABC), variable T1/T2 signal cysts, thin peripheral/septal enhancement
   - Scintigraphy: classic "doughnut sign" (photopenic center + peripheral uptake)
   - ABC vs Telangiectatic Osteosarcoma: ABC = intact expanded cortex, no periosteal reaction, no soft tissue mass, thin septal enhancement, >2/3 cystic spaces with FFL. TOS = cortical destruction, periosteal reaction, soft tissue mass, nodular enhancement — 22% of TOS misdiagnosed as ABC on imaging alone → USP6 analysis critical
   - Surface (periosteal) ABC: diaphyseal, scalloped cortical defect, may mimic periosteal osteosarcoma or chondroma → USP6 analysis invaluable

3. SOLID ABC (Giant Cell Lesion of Small Bones): 5% of ABCs; solidly enhancing T2 hyperintense soft tissue component; FFL may be absent; marked FDG uptake may mimic metastasis/sarcoma

4. SOFT TISSUE ABC: ~60 reported cases; mean age 30y; thin peripheral eggshell calcification + FFL + perilesional edema; GROWS (unlike myositis ossificans which stabilizes/involutes); FFL only 4/10 on MRI; often needs surgical resection

5. NODULAR FASCIITIS (most common benign fibrous ST tumor):
   - Age 20-40y; volar forearm, extremities; RAPID GROWTH; self-limiting (spontaneous regression months)
   - MRI: ovoid, broad fascial base, low T1/heterogeneous high T2, perilesional edema, heterogeneous enhancement with areas of nonenhancement
   - Key signs: "fascia tail sign" (broad fascial base + linear extension along fascia), "inverted target sign" (central T2 hyperintense focus in hypointense background = cystic degeneration/myxoid)
   - Intramuscular subtype: most likely mistaken for sarcoma (larger, deeper, less well-defined)
   - FDG PET: variable uptake, may mimic metastasis
   - DDx: desmoid fibromatosis, myxofibrosarcoma, MPNST; if intramuscular add sarcoma and myositis ossificans

6. FIBROMA OF TENDON SHEATH (Tenosynovial Nodular Fasciitis):
   - Age 20-50y; 82% in distal upper extremity (fingers/hands/wrists); painless, slow-growing
   - MRI: LOWER signal than muscle on BOTH T1 and T2 (high collagen); may have increased T2 in cellular/myxoid variants
   - Key DDx: Tenosynovial Giant Cell Tumor (formerly GCTTS) — "blooming artifact" on GRE strongly favors TSGCT; FTS has central T2 hypointensity + oval morphology; TSGCT has peripheral T2 hypointensity + lobular morphology; T2 signal ratio tumor:tendon >3 favors TSGCT

7. FIBRO-OSSEOUS PSEUDOTUMOR OF DIGITS (FOPD):
   - Subcutaneous fingers (especially index finger); young adults; rapid growth
   - XR/MRI: subcutaneous soft tissue mass with variable/amorphous mineralization ± partial zonal ossification (less complete than myositis ossificans)
   - Radiolucent cleft separating from bone (no attachment); no periostitis
   - Key DDx: florid reactive periostitis, BPOP, turret exostosis, periosteal chondroma

SHARED USP6 FAMILY RED FLAGS FOR BENIGN DIAGNOSIS (NOT malignancy):
- Young adult + rapid growth + peripheral zonal ossification → myositis ossificans NOT sarcoma
- Multiple FFL + thin septal enhancement + intact cortex → ABC NOT telangiectatic osteosarcoma
- Broad fascial base + fascia tail sign + spontaneous regression → nodular fasciitis NOT fibrosarcoma
- Low T1 AND T2 + finger/wrist + tendon association → fibroma of tendon sheath NOT TSGCT/sarcoma
- Subcutaneous finger mass + amorphous ossification + radiolucent bone cleft → FOPD NOT extraskeletal osteosarcoma

USP6 NEGATIVITY does not exclude diagnosis (sensitivity <100% for all entities).
Secondary ABC (USP6−) occurs with: chondroblastoma, GCT, osteoblastoma, fibrous dysplasia.
Telangiectatic osteosarcoma is USP6− — biopsy with USP6 analysis critical when ABC vs TOS unclear.

--- UPDATED KNOWLEDGE: SKELETAL RADIOLOGY 2023 PAPERS ---

PAPER A — TSGCT DIGITS: LOCALIZED vs DIFFUSE (Jeong et al, Skel Radiol 2023, n=28):
LOCALIZED TYPE (n=22): median 1.8cm, single nodule, CIRCUMSCRIBED margin, PERIPHERAL HYPOINTENSE RIM on T2 (86.4%), speckled central hypointensity (faint hemosiderin), bone erosion 50%, articular involvement 18%, muscle involvement 0%, recurrence <15%. En bloc resection curative.
DIFFUSE TYPE (n=6): median 4.3cm, MULTINODULAR (66.7%), INFILTRATIVE margin (83.3%), NO peripheral rim (0%), GRANULAR central hypointensity (83.3%) = strong hemosiderin, articular involvement 100%, muscle involvement 67%, tendon destruction 67%, recurrence 50%. Requires adjuvant therapy.
ROC BEST DISCRIMINATORS for diffuse type: absent peripheral rim AUC 0.932 (sens 100%, spec 86%), infiltrative margin AUC 0.917, articular involvement AUC 0.909.
NOT DISCRIMINATORY: bone erosion (both types), neurovascular encasement (both types), septum (both types ~83-91%).
KEY CLINICAL POINT: Both types arise from tendon sheath digits (extra-articular). Diffuse type = higher recurrence, often requires radical resection +/- pexidartinib (CSF1 inhibitor). Diffuse TSGCT digit = extra-articular equivalent of PVNS.

PAPER B — NOVEL FUSION SARCOMAS: ROUND CELL, SPINDLE CELL, TARGETABLE TK, GIANT CELL (Fanburg-Smith et al, Skel Radiol 2023):
ROUND CELL TUMORS:
- Classic Ewing (EWSR1::FLI1 80%, EWSR1::ERG 8%): diaphyseal long bone, large soft tissue component, minimal periosteal reaction, CD99 crisp cytoplasmic membrane staining, poor prognosis.
- CIC-REARRANGED sarcoma (CIC::DUX4): young adults (older than Ewing), larger/more necrosis/myxoid change, WT1+ nuclear-to-Golgi dot pattern, CD99 Golgi only, DISMAL prognosis. FDG uptake higher than Ewing. Treat like Ewing but outcomes poor.
- BCOR-ALTERED sarcoma (BCOR::CCNB3): teens, pelvis/lower extremity, lytic or sclerotic, T2 heterogeneous with flow voids, CD99 NEGATIVE, BCOR+ CCNB3+, similar/slightly better than Ewing. BCOR::ITD = aggressive infantile variant (<=2yr), invades spinal canal.
- EWSR1/FUS::NFATc2 SOLID: young adults, long bone metadiaphysis, EWSR1 amplification on FISH (key feature), mTOR targetable, behavior better than Ewing with survival after metastasectomy. IHC: CD99+, EMA+, low MIB1. DO NOT respond to Ewing therapy.
- EWSR1/FUS::NFATc2 CYSTIC (Unicameral Bone Cyst variant): 40-67% of simple bone cysts harbor this fusion; well-defined lytic metaphyseal lesion + fracture (fallen fragment sign), NO mass/nodule on MRI; peripheral rim enhancement only; local recurrence common, NO metastases. These lack EWSR1 amplification (distinguishes from solid type).
- EWSR1/FUS::NFATc2 VASCULAR: mimics intraosseous hemangioma/sclerosing hemangioma; multifocal possible (rib/pelvis/spine/femur); arcs-and-rings matrix confuses with cartilage DDx; favorable outcome to date.
SPINDLE CELL:
- INTRAOSSEOUS RMS (EWSR1/FUS::TFCP2): young adults, craniofacial/gnathic/rib/long bones, LARGE LYTIC MASS WITH CORTICAL DESTRUCTION, NO MATRIX (critical feature — distinguishes from osteosarcoma), ALK+, MyoD1+, myogenin rare/absent, desmin variable. High grade, aggressive. Key DDx clue: no osteoid matrix despite aggressive appearance.
TARGETABLE TYROSINE KINASE FUSIONS (children/young adults, RAS::MAPK pathway):
- ALK fusion sarcoma: MIMICS VASCULAR MALFORMATION (infiltrative, pericytoid vessels, feeder vessels); low-intermediate T2; infiltrative pattern with fascial tails; FDG avid; treat with Crizotinib.
- NTRK fusion sarcoma: bone or soft tissue; IN BONE MIMICS OSTEOSARCOMA (metaphyseal, cortical destruction) BUT NO MATRIX/MINERALIZATION — if young patient + intraosseous + no matrix -> NGS mandatory; high-grade with TPR/KANK1 fusions; treat with Larotrectinib.
- Other BRAF/RAF1/RET/FGFR1/ABL1 fusions: similar infiltrative ovoid-spindled pattern; targetable with respective inhibitors.
- SHARED IHC: focal S100+, focal CD34+, SOX10 NEGATIVE (distinguishes from nerve sheath); NGS required for final classification.
GIANT CELL RICH TUMORS:
- GCT BONE (H3F3A G34W mutation): classic metaphyseal eccentric lytic to "end of bone," adults; G34W stains mononuclear cells but spares osteoclast giant cells; denosumab knocks out monocytic cells leaving spindled stromal cells which can form bone.
- PRIMARY MALIGNANT GCT: nodule of UPS-like or osteosarcoma-like area within classic GCT; both components G34W+; cortical destruction/sclerotic change radiologically.
- TSGCT/PVNS (CSF1 rearrangement, targetable with PEXIDARTINIB): intra- or extra-articular; low T2 + GRE blooming = pathognomonic; MALIGNANT TSGCT = loss of giant cells, epithelioid histiocytoid, >10 mitoses/10hpf, necrosis — CSF1 often ABSENT in malignant foci -> pexidartinib ineffective for malignant cases.
- GIANT CELL TUMOR SOFT TISSUE (HMGA2::NCOR2): well-delineated soft tissue mass, homogeneous enhancement +/- ABC-like cystic change; keratin AE1/3 stains mononuclear stromal cells (spares giant cells); borderline/low grade.

PAPER C — PET/MR PEDIATRIC BONE TUMORS (Padwal et al, Skel Radiol 2023):
KEY ADVANTAGES of 18F-FDG PET/MR over PET/CT: >=73% radiation reduction, superior soft tissue contrast, single anesthesia, simultaneous local + whole-body staging in ~60 min.
OSTEOSARCOMA on PET/MR: soft tissue components T2-hyperintense + FDG-avid; bone-forming components T2-hypointense + low FDG avidity -> heterogeneous appearance. Photopenic center = poor prognosis. Tumor thrombus up to 40% (SUVmax 7.9-20 for tumor thrombus vs no uptake for benign thrombus). Post-therapy SUVmax <2.5 = good response; SUVmax >5 = poor response. Skip lesions detected with 95.2% accuracy by PET vs 66.7% conventional imaging.
EWING SARCOMA on PET/MR: restricted diffusion + hypermetabolic. Pre-therapy SUVmax >=12 = poor response predictor. FDG reduction >30% after chemo = treatment response. PET > bone scan for osseous metastases (88% vs 37%). CHECK PANCREAS for metastases (specific affinity unique to Ewing). RECIST criteria DO NOT apply to bone tumors.
BONE LYMPHOMA on PET/MR: T1 hypointense, markedly restricted diffusion, T2 LOWER than sarcomas (unique feature), cortex typically intact (spreads via Haversian canals). FDG PPV up to 100% for active disease. Response by Lugano criteria.
LCH on PET/MR: proliferative phase = T2 hyperintense + restricted diffusion + enhancement + marked FDG uptake. Treated LCH = T2 iso/hypointense + less diffusion restriction + less FDG. BRAF V600E mutation associated. PET/CT superior to bone surveys/MR/CT/bone scan for active lesion detection.

--- UPDATED KNOWLEDGE: SKELETAL RADIOLOGY 2023 PAPERS (BATCH 2) ---

PAPER D — CHORDOMA & BNCT (Murphey et al, Skel Radiol 2023):
BNCT (BENIGN NOTOCHORDAL CELL TUMOR):
- Incidence: 19% of cadaveric spines; clivus 11.5%, sacrococcygeal 12%, cervical 5%, thoracic 0%, lumbar 2%
- Radiograph: usually OCCULT; larger lesions show mild patchy sclerosis
- CT: PATCHY SCLEROSIS with MAINTAINED TRABECULAR ARCHITECTURE (trabeculae infiltrated but NOT destroyed) — key distinguishing feature; lesions typically <35mm; NO osteolysis
- MRI: low-intermediate T1 (marrow replacement), HIGH T2 signal (myxoid); minute foci of preserved yellow marrow fat on T1 = diagnostic clue; NO contrast enhancement; NO cortical destruction; NO soft tissue mass
- Bone scan/PET: usually NORMAL or mildly reduced uptake
- MANAGEMENT: BIOPSY NOT WARRANTED for typical BNCT — biopsy may provoke misdiagnosis as chordoma leading to unnecessary surgery; imaging surveillance recommended
- ANCT (Atypical Notochordal Cell Tumor): term for BNCT with atypical features (minute soft tissue extension, faint enhancement, small lytic foci); requires close follow-up but usually minimal progression over 3-10 years

CONVENTIONAL CHORDOMA (CC):
- Demographics: age 50-60 years (median 60), 2:1 male, Caucasian; 1-4% of primary malignant bone tumors
- Location: sacrococcygeal 50%, sphenooccipital (clival) 33%, mobile spine 17%; sacrococcygeal predilection for S4-S5; mobile spine predilection for C2
- Clinical: slow growing, insidious onset; sacrococcygeal symptoms = back pain, constipation, neuropathy; bowel/bladder incontinence = late/ominous sign
- Radiograph: large mixed lytic-sclerotic midline lesion; CALCIFICATION 50-70% sacrococcygeal; mobile spine shows ivory vertebra or bone destruction; disc space SPARED (extends around disc, not through it)
- CT: predominantly lytic + presacral soft tissue mass; calcification 60-90%; low attenuation (myxoid); pseudocapsule; mild-moderate septal/peripheral enhancement
- MRI: T1 low-intermediate; T2 HIGH (92-100%) = hallmark; MULTILOBULATED with septations (100%); hemorrhage 66-77% (high T1+T2); heterogeneous enhancement (95%); soft tissue mass 100% sacrococcygeal; SI joint transgression 23%; multilevel extension AROUND disc spaces (disc-SPARING)
- FDG-PET: moderate uptake (SUVmax avg 5.8); useful for treatment monitoring

DEDIFFERENTIATED CHORDOMA (DC):
- Biphasic: CC component + HIGH GRADE sarcoma component (UPS-like or osteosarcoma-like)
- MRI BIMORPHIC: CC portion = high T2/low enhancement; dedifferentiated portion = INTERMEDIATE T2 + PROMINENT ENHANCEMENT + lower ADC
- More aggressive than CC; dismal prognosis

POORLY DIFFERENTIATED CHORDOMA (PDC):
- Age 1-29 years (median 11), female 2:1; CLIVUS/CERVICAL SPINE predominance (rarely sacrococcygeal)
- IHC: brachyury+ cytokeratin+ but S100 NEGATIVE; INI1 (SMARCB1) LOSS = key diagnostic feature
- MRI: LOWER T2 signal than CC (more cellular, less myxoid); avid enhancement; lower ADC
- Very aggressive, early metastases, dismal prognosis

BNCT vs CC KEY DISCRIMINATORS:
- BNCT: maintained trabeculae + patchy sclerosis + no bone destruction + no soft tissue mass + no enhancement = BENIGN, surveillance only
- CC: cortical destruction + soft tissue mass + enhancement = MALIGNANT, aggressive treatment
- ANCT: between these two; biopsy + follow-up required
- TREATMENT: wide en-bloc resection + proton beam RT (50-60% local control at 5yr); local recurrence 19-75%; 5-yr survival 45-86%

BNCT PATTERN RECOGNITION — ACTIVE TRIGGER RULE:
When a vertebral or sacrococcygeal bone lesion is described with ALL of the following features, place BNCT at the TOP of the differential diagnosis list:
  REQUIRED POSITIVE features: T1 hypointense (marrow replacement), T2 hyperintense, NO contrast enhancement, central location within the vertebral body/segment, ± mild sclerosis on CT, ± multifocal involvement
  REQUIRED NEGATIVE features (must be absent): NO lytic destruction, NO extraosseous/soft tissue mass, NO avid or moderate enhancement
If ANY of the following are present, remove BNCT from the differential and elevate chordoma or dedifferentiated chordoma: frank osteolysis, extraosseous soft tissue extension, avid enhancement. Flag this exclusion explicitly.
Format when BNCT is top diagnosis: "1. Benign notochordal cell tumor (BNCT) — imaging features are characteristic: T1 hypointense, T2 hyperintense, no enhancement, no soft tissue mass, [± patchy sclerosis], central vertebral location. Biopsy is NOT recommended for typical BNCT; imaging surveillance is appropriate. If any atypical features develop (soft tissue extension, enhancement, lysis), upgrade to atypical notochordal cell tumor (ANCT) and consider biopsy."

PAPER E — WHO 2020 BONE TUMOR CLASSIFICATION (Hwang, Hameed, Kransdorf, Skel Radiol 2023):
KEY RECLASSIFICATIONS:
- CHONDROBLASTOMA: moved to BENIGN (recurrence <=5%, no distant mets)
- CHONDROMYXOID FIBROMA: moved to BENIGN (despite 3-22% local recurrence)
- ABC: USP6 rearrangement in 70% of primary ABCs (key diagnostic marker); "giant cell lesion of small bones" = solid ABC variant; old terminology NO LONGER RECOMMENDED
- SYNOVIAL CHONDROMATOSIS: BENIGN to INTERMEDIATE (locally aggressive); malignant transformation 1-6.4% (median 20yr); marrow invasion + cortical destruction = chondrosarcomatous transformation
- OFD-LIKE ADAMANTINOMA: malignant to INTERMEDIATE (locally aggressive); 20% local recurrence
- EPITHELIOID HEMANGIOMA: now INTERMEDIATE (locally aggressive ONLY, no longer rarely metastasizing); FOS/FOSB rearrangements; multifocal 18-25%
- ERDHEIM-CHESTER DISEASE: now HEMATOPOIETIC NEOPLASM; bilateral diaphyseal/metaphyseal osteosclerosis of long bones SPARING axial skeleton/hands/feet; cardiac + retroperitoneal involvement >50%; BRAF inhibitors (dabrafenib) effective; shares MAPK pathway mutations with LCH and Rosai-Dorfman

ENCHONDROMA vs ACT/CS1:
- ACT (appendicular) = CS1 (axial/flat bones) — HISTOLOGICALLY IDENTICAL, distinguished by location only
- Features favoring ACT/CS1 over enchondroma: size >5cm, endosteal scalloping >2/3 cortex, expansile remodeling, cortical destruction, soft tissue extension, pain, bone scan uptake
- Presence of marrow fat + no deep scalloping = enchondroma or regression; 87% of enchondromas stable/regress on MRI
- Secondary peripheral CS from osteochondroma: cartilage cap >2.0cm (perpendicular to tidemark) = malignancy threshold

NEW 2020 WHO ENTITIES:
- HIBERNOMA OF BONE: benign brown adipocyte tumor; spine/pelvis; older women; sclerotic 64%, lytic 18%; variable T1 fat signal; SUVmax 3.0-4.1 on PET
- FIBROCARTILAGINOUS MESENCHYMOMA: locally aggressive; age <30; metaphysis of long bones/pelvis; lytic + sclerotic rim + cortical destruction; no GNAS/IDH/MDM2 (distinguishes from FD/CS/low-grade OS)
- DEDIFFERENTIATED ADAMANTINOMA: new malignant entity; classic adamantinoma + sarcomatoid transition; metastases in 2/3 patients
- ROSAI-DORFMAN DISEASE: reclassified from benign; bone 5-10%; intramedullary lytic + cortical destruction + mimics malignancy

OSTEOSARCOMA: now 6 subtypes; secondary OS is now separate entity with 6 subtypes (Paget, radiation, infarct, osteomyelitis, implant, fibrous dysplasia)

PAPER F — ANGIOLIPOMA (Kransdorf et al, Skel Radiol 2023, n=778 lesions, 344 patients):
CLINICAL PROFILE:
- ALL subcutaneous (100%); forearm 30.6%, arm 17%, thigh 14.4%; upper extremity >50% of all lesions
- Median size 2.4cm (range 0.4-7.7cm); multifocal 36% in this series
- PAINFUL (tenderness to palpation, worsens with pressure/elastic bands) — due to intracapillary FIBRIN THROMBI (pathognomonic finding)
- Molecular: PRKD2 mutations and/or PIK3CA activating mutations (PI3K/AKT pathway)
- Age: late teens to 80s; median 50 years; uncommon in children

ULTRASOUND:
- HETEROGENEOUS (virtually 100%) + MILDLY HYPERECHOIC vs adjacent fat (86.1%)
- Vascularity ABSENT 73.2% (key negative finding on color Doppler); mild vascularity 18.3%
- Ovoid shape; abuts skin 85.5%

CT:
- Fat in 85% of lesions
- KEY FEATURE: CURVILINEAR SUBCAPSULAR VASCULARITY (linear densities most prominent at periphery/subcapsular) = corresponds to peripheral capillary channels
- Cellular angiolipoma (>90% vascular) = no visible fat, prominent enhancement; can mimic Kaposi sarcoma

MRI:
- "DIRTY FAT" appearance on T1 (fat signal interrupted by vascular component)
- Moderate enhancement 69.2%; mild 19.2%
- CHEMICAL SHIFT IMAGING: signal dropout >56% confirms fat even when vascular component is confluent
- Small FOV + thin slices REQUIRED; routine protocols miss lesions

ANGIOLIPOMA vs LIPOMA CHEAT SHEET:
- Angiolipoma: HETEROGENEOUS + HYPERECHOIC + OVOID + PAINFUL + MULTIFOCAL + curvilinear vascularity CT + dirty fat MRI
- Lipoma: HOMOGENEOUS + ISOECHOIC + SPINDLE SHAPE + painless + NO vascularity (0%) + clean fat signal
- "Infiltrating angiolipoma" is OBSOLETE TERM; WHO now calls these INTRAMUSCULAR ANGIOMAS (unrelated entity)`,

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
              <label style={lbl}>Aggressive / Additional Features</label>
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                {chk('Extra-osseous soft tissue extension', softTissueExt, setSoftTissueExt)}
                {chk('Deep endosteal scalloping (>2/3 cortex)', endostalScalloping, setEndostalScalloping)}
                {chk('Periosteal reaction', periostealRxn, setPeriostealRxn)}
                {chk('Fluid-fluid levels', fluidFluidLevels, setFluidFluidLevels)}
                {chk('Marrow edema around intraosseous lesion', marrowEdema, setMarrowEdema)}
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

// ─── ARTHROPLASTY MODULE ─────────────────────────────────────────────────────
import { ARTHROPLASTY_DATA, ARTHROPLASTY_JOINTS, ARTHROPLASTY_EXAMPLE_IMAGES } from './arthroplastyData';

function ArthroplastyPanel({ joint, arthroplastyType, arthroplastyChecklist, setArthroplastyChecklist, arthroplastyGrading, setArthroplastyGrading, arthroplastyImageTab, setArthroplastyImageTab, dm }) {
  const data = ARTHROPLASTY_DATA[joint];
  if (!data) return null;
  const typeKey = arthroplastyType || (Object.keys(data.complications)[0]);
  const compData = data.complications[typeKey];
  if (!compData) return null;
  const { items, gradings } = compData;
  const selectedGrading = gradings.find(g => g.id === arthroplastyGrading) || null;

  const toggleCheck = (id) => setArthroplastyChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  const checkedCount = items.filter(i => arthroplastyChecklist[i.id]).length;
  const [popupImg, setPopupImg] = useState(null); // {src, caption} or {images:[{src,caption}], caption}

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
      {/* Image popup overlay */}
      {popupImg && (
        <div onClick={() => setPopupImg(null)} style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.72)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div onClick={e => e.stopPropagation()} style={{background:dm?'#1e293b':'#ffffff',borderRadius:12,overflow:'hidden',maxWidth:560,width:'100%',boxShadow:'0 24px 64px rgba(0,0,0,0.5)',display:'flex',flexDirection:'column',maxHeight:'90vh',overflowY:'auto'}}>
            {(popupImg.images || [popupImg]).map((img,idx) => (
              <div key={idx}>
                <img src={img.src} alt="Example image" style={{width:'100%',display:'block',maxHeight:380,objectFit:'contain',background:'#000'}} />
                {img.caption && (
                  <p style={{margin:0,padding:'10px 14px 0',fontSize:11,color:dm?'#94a3b8':'#64748b',lineHeight:1.5}}>{img.caption}</p>
                )}
              </div>
            ))}
            {popupImg.caption && popupImg.images && (
              <p style={{margin:0,padding:'8px 14px 0',fontSize:11,color:dm?'#94a3b8':'#64748b',lineHeight:1.5,fontStyle:'italic'}}>{popupImg.caption}</p>
            )}
            {popupImg.citation && (
              <p style={{margin:0,padding:'8px 14px 0',fontSize:10,color:dm?'#475569':'#94a3b8',lineHeight:1.5,fontStyle:'italic'}}>📚 {popupImg.citation}</p>
            )}
            <div style={{padding:'12px 14px'}}>
              <button onClick={() => setPopupImg(null)}
                style={{width:'100%',padding:'9px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#0e7490,#0891b2)',color:'white',fontSize:13,fontWeight:700,letterSpacing:'0.02em'}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header bar */}
      <div style={{ background:dm?'rgba(8,145,178,0.15)':'#ecfeff',border:'1px solid '+(dm?'#164e63':'#a5f3fc'),borderRadius:8,padding:'8px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
        <span style={{ fontSize:11,fontWeight:700,color:dm?'#22d3ee':'#0e7490',letterSpacing:'0.06em',textTransform:'uppercase' }}>
          🔩 {compData.label}
        </span>
        {checkedCount > 0 && (
          <span style={{ fontSize:10,fontWeight:700,color:'#fff',background:'#0891b2',borderRadius:10,padding:'2px 8px' }}>
            {checkedCount} finding{checkedCount>1?'s':''} flagged
          </span>
        )}
      </div>

      {/* TOP: Complication Checklist — full width, 2-col grid */}
      <div style={{ background:dm?'#0f172a':'#f8fafc',border:'1px solid '+(dm?'#334155':'#e2e8f0'),borderRadius:8,padding:10,flexShrink:0 }}>
        <div style={{ fontSize:10,fontWeight:700,color:dm?'#64748b':'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Complication Checklist</div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 10px' }}>
          {items.map(item => (
            <label key={item.id} style={{ display:'flex',alignItems:'flex-start',gap:6,cursor:'pointer',padding:'4px 6px',borderRadius:5,background:arthroplastyChecklist[item.id]?(item.critical?(dm?'rgba(220,38,38,0.15)':'#fef2f2'):(dm?'rgba(8,145,178,0.12)':'#ecfeff')):'transparent',border:'1px solid '+(arthroplastyChecklist[item.id]?(item.critical?(dm?'#dc2626':'#fca5a5'):(dm?'#0891b2':'#a5f3fc')):'transparent'),transition:'all 0.15s' }}>
              <input
                type="checkbox"
                checked={!!arthroplastyChecklist[item.id]}
                onChange={() => toggleCheck(item.id)}
                style={{ width:13,height:13,marginTop:2,accentColor:item.critical?'#dc2626':'#0891b2',flexShrink:0,cursor:'pointer' }}
              />
              <span style={{ fontSize:11,color:arthroplastyChecklist[item.id]?(item.critical?(dm?'#fca5a5':'#dc2626'):(dm?'#22d3ee':'#0e7490')):(dm?'#94a3b8':'#475569'),lineHeight:1.35,fontWeight:arthroplastyChecklist[item.id]?600:400 }}>
                {item.critical && <span style={{ fontSize:9,marginRight:3,verticalAlign:'middle' }}>⚠️</span>}
                {item.label}
                {ARTHROPLASTY_EXAMPLE_IMAGES[item.id] && (
                  <span onClick={e => { e.preventDefault(); e.stopPropagation(); setPopupImg(ARTHROPLASTY_EXAMPLE_IMAGES[item.id]); }}
                    style={{fontSize:9,fontWeight:500,color:'#60a5fa',cursor:'pointer',textDecoration:'underline',display:'block',marginTop:2,WebkitTextFillColor:'#60a5fa'}}>
                    🔍 Show Example
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* BOTTOM: Grading systems — full width */}
      <div style={{ background:dm?'#0f172a':'#f8fafc',border:'1px solid '+(dm?'#334155':'#e2e8f0'),borderRadius:8,padding:10,display:'flex',flexDirection:'column',gap:8 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6 }}>
          <div style={{ fontSize:10,fontWeight:700,color:dm?'#64748b':'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em' }}>Grading Systems</div>
          {/* Grading selector tabs */}
          <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
            {gradings.map(g => (
              <button key={g.id} onClick={() => setArthroplastyGrading(arthroplastyGrading===g.id?'':g.id)}
                style={{ padding:'3px 10px',borderRadius:5,border:'1px solid '+(arthroplastyGrading===g.id?(dm?'#0891b2':'#0e7490'):(dm?'#334155':'#d1d5db')),background:arthroplastyGrading===g.id?(dm?'rgba(8,145,178,0.2)':'#ecfeff'):'transparent',color:arthroplastyGrading===g.id?(dm?'#22d3ee':'#0e7490'):(dm?'#94a3b8':'#6b7280'),fontSize:10,fontWeight:arthroplastyGrading===g.id?700:400,cursor:'pointer' }}>
                {g.label.split('—')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Grading content */}
        {selectedGrading ? (
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:dm?'#22d3ee':'#0891b2',marginBottom:3 }}>{selectedGrading.label}</div>
            <div style={{ fontSize:10,color:dm?'#94a3b8':'#64748b',marginBottom:8,lineHeight:1.5,fontStyle:'italic' }}>{selectedGrading.description}</div>
            {selectedGrading.image && (
              <div style={{ marginBottom:8 }}>
                <img src={selectedGrading.image.src} alt={selectedGrading.label} style={{ width:'100%',maxWidth:480,display:'block',margin:'0 auto',borderRadius:6 }} />
                {selectedGrading.image.caption && (
                  <p style={{ margin:'4px 0 0',fontSize:10,color:dm?'#94a3b8':'#64748b',lineHeight:1.4,textAlign:'center',fontStyle:'italic' }}>{selectedGrading.image.caption}</p>
                )}
              </div>
            )}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:6 }}>
              {selectedGrading.grades.map((g,i) => (
                <div key={i} style={{ background:dm?'rgba(255,255,255,0.03)':'white',border:'1px solid '+(dm?'#1e293b':'#f1f5f9'),borderRadius:5,padding:'6px 8px' }}>
                  <div style={{ fontSize:11,fontWeight:700,color:dm?'#38bdf8':'#0369a1' }}>{g.grade}</div>
                  <div style={{ fontSize:11,color:dm?'#cbd5e1':'#334155',lineHeight:1.5,marginTop:2 }}>{g.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:8,padding:'5px 7px',background:dm?'rgba(255,255,255,0.03)':'#f1f5f9',borderRadius:4,fontSize:9,color:dm?'#475569':'#94a3b8',fontStyle:'italic',lineHeight:1.4 }}>
              📚 {selectedGrading.citation}
            </div>
          </div>
        ) : (
          <div style={{ display:'flex',alignItems:'center',gap:8,color:dm?'#334155':'#cbd5e1',fontSize:11,padding:'8px 4px' }}>
            <span style={{ fontSize:18 }}>🦾</span>
            <span>Select a grading system above to view classification criteria.</span>
          </div>
        )}
      </div>

      {/* Flagged findings summary */}
      {checkedCount > 0 && (
        <div style={{ background:dm?'rgba(220,38,38,0.08)':'#fef2f2',border:'1px solid '+(dm?'#dc2626':'#fca5a5'),borderRadius:7,padding:'8px 12px',flexShrink:0 }}>
          <div style={{ fontSize:10,fontWeight:700,color:dm?'#fca5a5':'#dc2626',marginBottom:5,letterSpacing:'0.06em',textTransform:'uppercase' }}>⚠️ Flagged Findings</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px 10px' }}>
            {items.filter(i => arthroplastyChecklist[i.id]).map(i => (
              <div key={i.id} style={{ fontSize:11,color:dm?'#fca5a5':'#dc2626',display:'flex',alignItems:'flex-start',gap:5 }}>
                <span style={{ color:i.critical?'#ef4444':'#0891b2',flexShrink:0 }}>{i.critical?'●':'○'}</span>
                <span>{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REFERENCE PANEL ──────────────────────────────────────────────────────
function ReferencePanel({ selectedBodyPart, modality = 'MRI', spineRegion = 'lumbar', darkMode = false }) {
  const rawJointData = getEffectiveJointData(selectedBodyPart, modality);
  const jointData = (rawJointData && selectedBodyPart === 'spine') ? {
    ...rawJointData,
    measurements: (rawJointData.measurements || []).filter(m =>
      !m.spineRegions || m.spineRegions.includes(spineRegion)
    )
  } : rawJointData;
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');
  useEffect(() => { setSelectedMeasurementId(''); }, [selectedBodyPart, modality]);
  const selectedMeasurement = jointData?.measurements?.find(m => m.id === selectedMeasurementId);
  const accent = '#0891b2';
  const dm = darkMode;
  if (!jointData) return <div style={{ color:'#94a3b8',fontSize:13,textAlign:'center',padding:20 }}>{modality === 'CT' ? 'No CT fracture classification available for this region. Switch to a specific bone region or select MRI for grading scales.' : 'Select a body part.'}</div>;
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:0,height:'100%' }}>
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <p style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:accent,margin:0 }}>{jointData.label}</p>
        <select style={{ width:'100%',padding:'8px 10px',border:'1px solid '+(dm?'#334155':'#e2e8f0'),borderRadius:8,fontSize:13,background:dm?'#0f172a':'white',cursor:'pointer',color:dm?'#e2e8f0':'#1e293b',boxSizing:'border-box' }}
          value={selectedMeasurementId} onChange={e => setSelectedMeasurementId(e.target.value)}>
          <option value="">— Select a measurement —</option>
          {(jointData.measurements||[]).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        {selectedMeasurement ? (
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
              <span style={{ display:'inline-block',padding:'2px 8px',background:dm?'#0c4a6e':'#e0f2fe',color:dm?'#7dd3fc':'#0369a1',borderRadius:999,fontSize:11,fontWeight:600,width:'fit-content' }}>{selectedMeasurement.plane}</span>
              {selectedMeasurement.description ? <p style={{ fontSize:12,color:dm?'#94a3b8':'#64748b',margin:0,lineHeight:1.5 }}>{selectedMeasurement.description}</p> : null}
            </div>
            <div style={{ border:'1px solid '+(dm?'#334155':'#e2e8f0'),borderRadius:8,overflow:'hidden',background:dm?'#0f172a':'#fafbfc',padding:8 }}>
              {selectedMeasurement.canalImages ? (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {selectedMeasurement.canalImages.map((img,idx) => (
                    <div key={idx} style={{ textAlign:'center' }}>
                      <img src={img.src} alt={img.label} style={{ width:'100%', borderRadius:4, display:'block', marginBottom:3 }} />
                      <p style={{ fontSize:11, fontWeight:600, color:dm?'#e2e8f0':'#1e293b', margin:0 }}>{img.label}</p>
                    </div>
                  ))}
                </div>
              ) : selectedMeasurement.modicImages ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {selectedMeasurement.modicImages.map((img,idx) => (
                    <div key={idx} style={{ background:dm?'#0f172a':'white', border:'1px solid '+(dm?'#334155':'#e2e8f0'), borderRadius:6, padding:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:dm?'#e2e8f0':'#1e293b' }}>{img.label}</span>
                        <span style={{ fontSize:11, color:dm?'#94a3b8':'#64748b' }}>{img.sublabel}</span>
                      </div>
                      <img src={img.src} alt={img.label} style={{ width:'100%', borderRadius:4, display:'block', marginBottom:4 }} />
                      <div style={{ display:'flex', justifyContent:'space-around' }}>
                        {img.colLabels.map((lbl,li) => (
                          <span key={li} style={{ fontSize:10, color:dm?'#94a3b8':'#64748b', fontWeight:500 }}>{lbl}</span>
                        ))}
                      </div>
                      <div style={{ textAlign:'center', marginTop:2 }}>
                        <span style={{ fontSize:10, color:dm?'#7dd3fc':'#0369a1' }}>{img.signalLine}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedMeasurement.discZoneImage ? (
                <div>
                  <img src={selectedMeasurement.discZoneImage} alt='Disc zone locations' style={{ width:'100%', borderRadius:6, display:'block', marginBottom:6 }} />
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 10px', padding:'4px 2px' }}>
                    {[['#ef4444','Central'],['#22c55e','Paracentral'],['#3b82f6','Foraminal'],['#eab308','Extraforaminal']].map(([col,lbl]) => (
                      <span key={lbl} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:dm?'#e2e8f0':'#1e293b' }}>
                        <span style={{ width:10, height:10, borderRadius:2, background:col, display:'inline-block', flexShrink:0 }} />{lbl}
                      </span>
                    ))}
                  </div>
                </div>
              ) : selectedMeasurement.diagram === 'sanders_calcaneus' ? <img src="/images/msk/sanders_calcaneus.jpg" alt="Sanders calcaneus classification" style={{width:'100%',maxWidth:520,display:'block',margin:'0 auto',borderRadius:4}} /> : selectedMeasurement.singleImage ? <img src={selectedMeasurement.singleImage} alt={selectedMeasurement.label} style={{width:'100%',maxWidth:520,display:'block',margin:'0 auto',borderRadius:4}} /> : (DIAGRAM_SVGS[selectedMeasurement.diagram] || <div style={{ padding:24,textAlign:'center',color:'#94a3b8',fontSize:12 }}>Diagram coming soon</div>)}
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
        <p style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:accent,margin:0 }}>{selectedMeasurement?.id === 'modic_changes' ? '🔬 Imaging Findings' : selectedMeasurement?.id === 'disc_nomenclature' ? '📖 Terminology' : '📊 Grading / Normal Values'}</p>
        {selectedMeasurement ? (
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
            <tbody>
              {selectedMeasurement.normalValues.map((nv,i) => {
                const isHeader = nv.label.startsWith('──');
                if (isHeader) return (
                  <tr key={i}>
                    <td colSpan={2} style={{ padding:'8px 4px 3px',paddingTop:i===0?2:10,color:'#38bdf8',fontSize:12,fontWeight:800,letterSpacing:'0.04em',borderBottom:'1px solid '+(dm?'#1e3a5f':'#bae6fd') }}>{nv.label.replace(/^──\s*/,'').replace(/\s*──$/,'').trim()}</td>
                  </tr>
                );
                return (
                  <tr key={i} style={{ borderBottom:'1px solid '+(dm?'#334155':'#f1f5f9') }}>
                    <td style={{ padding:'5px 4px',color:dm?'#94a3b8':'#64748b',width:'45%',verticalAlign:'top' }}>{nv.label}</td>
                    <td style={{ padding:'5px 4px',color:dm?'#e2e8f0':'#1e293b',fontWeight:600,fontFamily:"'Courier New',monospace" }}>{nv.value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:5,overflowY:'auto',maxHeight:320 }}>
            {(jointData.measurements||[]).map(m => (
              <div key={m.id} onClick={() => setSelectedMeasurementId(m.id)}
                style={{ padding:'7px 10px',background:dm?'#0f172a':'#f8fafc',borderRadius:7,border:'1px solid '+(dm?'#334155':'#f1f5f9'),cursor:'pointer' }}>
                <div style={{ fontSize:12,fontWeight:600,color:'#0891b2' }}>{m.label}</div>
                {!m.isGradingScale &&
                  <div style={{ fontSize:11,color:dm?'#94a3b8':'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{m.normalValues[0]?.label}: {m.normalValues[0]?.value}</div>
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── INCIDENTAL FINDINGS HELPERS ─────────────────────────────────────────────
// Fleischner Society 2017 guidelines for incidental pulmonary nodules
function getFleischnerRec(type, size) {
  const recs = {
    solid: {
      '<6mm':    { low: 'No routine follow-up', high: 'Optional CT at 12 months' },
      '6-8mm':   { low: 'CT at 6-12 months, then 18-24 months if stable', high: 'CT at 6-12 months, then 18-24 months if stable' },
      '>8mm':    { low: 'Consider CT at 3 months, PET/CT, or tissue sampling', high: 'CT at 3 months, PET/CT, or tissue sampling' },
    },
    ggo: {
      '<6mm':    { low: 'No routine follow-up', high: 'No routine follow-up' },
      '6-8mm':   { low: 'CT at 6-12 months to confirm persistence, then CT every 2 years until 5 years', high: 'CT at 6-12 months to confirm persistence, then CT every 2 years until 5 years' },
      '>8mm':    { low: 'CT at 3-6 months to confirm persistence, then CT every year for 3 years', high: 'CT at 3-6 months to confirm persistence, then CT every year for 3 years' },
    },
    partsolid: {
      '<6mm':    { low: 'No routine follow-up', high: 'No routine follow-up' },
      '6-8mm':   { low: 'CT at 3-6 months. If stable and solid component <6mm, annual CT x 5 years', high: 'CT at 3-6 months. If stable and solid component <6mm, annual CT x 5 years' },
      '>8mm':    { low: 'CT at 3-6 months. PET/CT or tissue sampling if solid component grows or >8mm', high: 'CT at 3-6 months. PET/CT or tissue sampling if solid component grows or >8mm' },
    },
  };
  return recs[type]?.[size] || null;
}

// ACR Incidental Renal Findings Committee guidelines
function getRenalRec(finding) {
  const recs = {
    'simple cyst (<1cm)':        { rec: 'No follow-up needed. Benign simple cyst.' },
    'simple cyst (1-3.9cm)':     { rec: 'No follow-up needed if classic simple cyst. Bosniak I.' },
    'simple cyst (≥4cm)':        { rec: 'No follow-up needed if classic simple cyst. Confirm with ultrasound if not classic.' },
    'minimally complex (Bosniak II)':  { rec: 'No follow-up needed.' },
    'Bosniak IIF':               { rec: 'CT or MRI at 6 months, then annually for 5 years.' },
    'Bosniak III':               { rec: 'Urologic referral. ~50% malignancy rate.' },
    'Bosniak IV':                { rec: 'Urologic referral. Surgical or ablative therapy recommended.' },
    'solid mass (<1cm)':         { rec: 'Urologic consultation. Growth rate assessment with short-interval follow-up CT/MRI.' },
    'solid mass (1-3.9cm)':      { rec: 'Urologic consultation. CT/MRI with and without contrast for characterization.' },
    'solid mass (≥4cm)':         { rec: 'Urologic consultation. Surgical planning.' },
  };
  return recs[finding] || null;
}

// ACR/SRU guidelines for incidental gynecologic findings
function getGynRec(finding, isPostmenopausal) {
  const recs = {
    'simple cyst (<3cm)': {
      pre:  'No follow-up needed. Likely functional or physiologic cyst.',
      post: 'No follow-up needed if <1cm. Follow-up ultrasound in 1 year if 1-3cm.',
    },
    'simple cyst (3-5cm)': {
      pre:  'Follow-up ultrasound in 1 year.',
      post: 'Follow-up ultrasound in 1 year.',
    },
    'simple cyst (5-7cm)': {
      pre:  'Follow-up ultrasound in 6-12 months or GYN referral.',
      post: 'GYN referral.',
    },
    'simple cyst (>7cm)': {
      pre:  'MRI or GYN referral.',
      post: 'GYN referral or surgical evaluation.',
    },
    'complex cyst': {
      pre:  'GYN referral. IOTA characterization or ADNEX model recommended.',
      post: 'GYN referral. Malignancy risk higher in postmenopausal patients.',
    },
    'fibroid (small <3cm)': {
      pre:  'No follow-up needed if asymptomatic.',
      post: 'No follow-up needed. New growth in postmenopausal patient warrants evaluation.',
    },
    'endometrial thickening': {
      pre:  'Clinical correlation. Endometrial biopsy if symptomatic.',
      post: 'GYN referral. Endometrial biopsy recommended if >4mm.',
    },
  };
  return recs[finding] || null;
}

// ACR Incidental Aortic Findings guidelines
function getAortaRec(finding) {
  const recs = {
    '<3cm':         { rec: 'Normal aortic diameter. No follow-up needed.' },
    '3-3.9cm':      { rec: 'Infrarenal aortic ectasia. Vascular surgery notification. Ultrasound or CT in 3 years.' },
    '4-4.9cm':      { rec: 'AAA — moderate. Vascular surgery referral. CT/ultrasound every 6-12 months.' },
    '5-5.4cm':      { rec: 'AAA — large. Urgent vascular surgery referral. Surgical planning.' },
    '≥5.5cm':       { rec: 'AAA — surgical threshold. Urgent vascular surgery referral. Surgical repair indicated.' },
    'penetrating ulcer': { rec: 'Vascular surgery notification. Short-interval CT follow-up in 3-6 months. Urgent if symptomatic.' },
    'intramural hematoma': { rec: 'Urgent vascular surgery notification. High risk for dissection.' },
  };
  return recs[finding] || null;
}

// ─── INCIDENTAL PANEL COMPONENT ───────────────────────────────────────────────
function IncidentalPanel({ showLung, showGU, noduleType, setNoduleType, noduleSize, setNoduleSize,
  renalFinding, setRenalFinding, gynFinding, setGynFinding, aortaFinding, setAortaFinding,
  patientAge, setPatientAge, patientSex, setPatientSex, isPostmenopausal }) {

  const tog = (val, current, setter) => (
    <button onClick={() => setter(current === val ? '' : val)}
      style={{ padding:'4px 8px',borderRadius:6,border:'1px solid '+(current===val?'#dc2626':'#334155'),background:current===val?'#fef2f2':'transparent',color:current===val?'#dc2626':'#94a3b8',fontSize:10,fontWeight:current===val?700:400,cursor:'pointer' }}>
      {val}
    </button>
  );

  return (
    <div style={{ background:'#1a0a0a',border:'1.5px solid #dc2626',borderRadius:8,padding:'10px 12px',display:'flex',flexDirection:'column',gap:10 }}>
      {showLung && (
        <div>
          <div style={{ fontSize:10,fontWeight:800,color:'#ef4444',letterSpacing:'0.1em',marginBottom:6 }}>⚠️ INCIDENTAL LESION CHECKER — LUNG</div>
          <div style={{ fontSize:10,color:'#94a3b8',marginBottom:4 }}>Nodule type:</div>
          <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginBottom:6 }}>
            {['solid','ggo','partsolid'].map(t => tog(t, noduleType, setNoduleType))}
          </div>
          {noduleType && (
            <>
              <div style={{ fontSize:10,color:'#94a3b8',marginBottom:4 }}>Size:</div>
              <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                {['<6mm','6-8mm','>8mm'].map(s => tog(s, noduleSize, setNoduleSize))}
              </div>
            </>
          )}
        </div>
      )}
      {showGU && (
        <div>
          <div style={{ fontSize:10,fontWeight:800,color:'#ef4444',letterSpacing:'0.1em',marginBottom:6 }}>⚠️ INCIDENTAL LESION CHECKER — GU / AORTA</div>
          <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
            <div>
              <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Renal finding:</div>
              <select value={renalFinding} onChange={e=>setRenalFinding(e.target.value)}
                style={{ width:'100%',padding:'4px 6px',borderRadius:5,fontSize:10,background:'#0f172a',color:'#e2e8f0',border:'1px solid #334155' }}>
                <option value="">— None —</option>
                {['simple cyst (<1cm)','simple cyst (1-3.9cm)','simple cyst (≥4cm)','minimally complex (Bosniak II)','Bosniak IIF','Bosniak III','Bosniak IV','solid mass (<1cm)','solid mass (1-3.9cm)','solid mass (≥4cm)'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Gynecologic finding:</div>
              <select value={gynFinding} onChange={e=>setGynFinding(e.target.value)}
                style={{ width:'100%',padding:'4px 6px',borderRadius:5,fontSize:10,background:'#0f172a',color:'#e2e8f0',border:'1px solid #334155' }}>
                <option value="">— None —</option>
                {['simple cyst (<3cm)','simple cyst (3-5cm)','simple cyst (5-7cm)','simple cyst (>7cm)','complex cyst','fibroid (small <3cm)','endometrial thickening'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            {gynFinding && (
              <div style={{ display:'flex',gap:6 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Patient age:</div>
                  <input type="number" value={patientAge} onChange={e=>setPatientAge(e.target.value)} placeholder="Age"
                    style={{ width:'100%',padding:'4px 6px',borderRadius:5,fontSize:10,background:'#0f172a',color:'#e2e8f0',border:'1px solid #334155' }}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Sex:</div>
                  <div style={{ display:'flex',gap:3 }}>
                    {['M','F'].map(s => (
                      <button key={s} onClick={()=>setPatientSex(patientSex===s?'':s)}
                        style={{ flex:1,padding:'4px',borderRadius:5,border:'1px solid '+(patientSex===s?'#2563eb':'#334155'),background:patientSex===s?'#1e3a5f':'transparent',color:patientSex===s?'#93c5fd':'#94a3b8',fontSize:10,cursor:'pointer' }}>
                        {s==='M'?'M':'F'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Aortic diameter:</div>
              <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                {['<3cm','3-3.9cm','4-4.9cm','5-5.4cm','≥5.5cm','penetrating ulcer','intramural hematoma'].map(v => tog(v, aortaFinding, setAortaFinding))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// RHEUM MODULE — X-Ray Arthritis DDx Builder
// Based on Core Radiology: A Visual Approach to Diagnostic Imaging (Mandell 2013)
// Chapter: Arthritis — pp. 346-364
// ─────────────────────────────────────────────────────────────────────────────

// ── Rheum DDx Data ──────────────────────────────────────────────────────────
// Each joint has categories of findings; each finding maps to compatible diagnoses.
// diag keys: OA=Osteoarthritis, RA=Rheumatoid Arthritis, PsA=Psoriatic Arthritis,
// AS=Ankylosing Spondylitis, ReA=Reactive Arthropathy, IBD=IBD Arthropathy,
// Gout=Gout, CPPD=CPPD, HADD=Hydroxyapatite Deposition, SLE=Systemic Lupus,
// JIA=Juvenile Idiopathic Arthritis, Hemo=Hemophilia, Scl=Scleroderma,
// EOA=Erosive OA, Hem=Hemochromatosis, Sep=Septic/Infectious

import { RHEUM_JOINTS, DIAG_INFO, RHEUM_EXAMPLE_IMAGES } from './rheumData';

function buildRheumPrompt(joint, laterality, views) {
  const jLabel = RHEUM_JOINTS[joint]?.label || joint;
  const latLabel = laterality === 'bilateral' ? 'Bilateral' : (laterality === 'left' ? 'Left' : 'Right');
  const viewsLabel = views ? `, ${views} view${views==='1'?'':'s'}` : '';
  return `You are a subspecialty MSK radiologist generating a structured radiograph report for a rheumatology case.

CRITICAL FORMATTING RULES:
- NEVER use markdown. No asterisks, no bold, no dashes, no bullet points.
- Section headers (TECHNIQUE, FINDINGS, IMPRESSION) on their own line in ALL CAPS with colon.
- Subheadings: "Structure Name: finding text" — Title Case, colon, finding on same line.
- ABSOLUTE RULE — ZERO TOLERANCE: NEVER include any commentary, interpretation notes, correction notices, clarification notes, or meta-statements anywhere in the output. This includes phrases like "I interpreted X as Y", "I assumed you meant Z", or any notation about speech recognition corrections. Silently apply best clinical interpretation. Output must contain ONLY formal radiology report content.

TECHNIQUE:
${latLabel} radiograph of the ${jLabel.toLowerCase()}${viewsLabel}.

FINDINGS RULES:
1. Not mentioned: write "No acute abnormality." for all structures including Soft Tissues and Bones.
2. Positive findings: exact dictated words only.
3. For joints: address joint space (narrowing pattern, distribution), subchondral bone (sclerosis, cysts), osteophytes, erosions (marginal, central, overhanging), bone density, periosteal reaction, soft-tissue swelling, calcifications, subluxations or deformities.
4. BONES: address cortex integrity and any fracture or lesion.

IMPRESSION RULES — FOLLOW EXACTLY:
- The impression must be concise. Do NOT repeat or summarize individual findings from the FINDINGS section.
- Use SINGULAR: "The imaging pattern IS most consistent with the diagnosis of [X]." — never "patterns are."
- Secondary differential: after the first sentence, add "Next consideration includes [Y]." Keep it brief — one short clause maximum.
- Two coexisting entities: "The imaging pattern is most consistent with [X] superimposed with [Y]." Then optionally one brief next consideration sentence.
- Normal: "No radiographic evidence of significant arthropathy of the ${jLabel.toLowerCase()}."
- KNEE-SPECIFIC CPPD vs OA RULE: If chondrocalcinosis is present WITH isolated patellofemoral narrowing and/or prominent subchondral cysts, favor CPPD as the primary diagnosis. If chondrocalcinosis is present WITH tricompartmental or medial-predominant narrowing and osteophytes, favor OA as primary with CPPD as next consideration.
- Do NOT reference ABCDE or ABCDEs anywhere in the report.
- Do NOT restate or paraphrase findings from the FINDINGS section in the impression.
- Use complete sentences only — no numbered lists.
- Maximum 2–3 sentences total in the impression.

FORMAT — one blank line between each section:
${buildReportHeading('XR', jLabel.toLowerCase(), laterality==='bilateral'?'bilateral':(laterality==='left'?'left':'right'), '', '')}

HISTORY:

COMPARISON: None.

TECHNIQUE:
${latLabel} radiograph of the ${jLabel.toLowerCase()}${viewsLabel}.

FINDINGS:
Structure: finding

IMPRESSION:
The imaging pattern is most consistent with the diagnosis of [X].`;
}

function RheumDDxPanel({ rheumJoint, rheumLaterality, rheumChecks, setRheumChecks, onGenerate, isGenerating, dm }) {
  const jointData = RHEUM_JOINTS[rheumJoint];
  const accent = '#a855f7';
  const [popupImg, setPopupImg] = useState(null); // {src, caption}

  // Compute matching diagnoses from checked findings
  const checkedIds = Object.keys(rheumChecks).filter(k => rheumChecks[k]);
  const diagScores = {};
  if (checkedIds.length > 0 && jointData) {
    jointData.categories.forEach(cat => {
      cat.findings.forEach(f => {
        if (rheumChecks[f.id]) {
          f.diags.forEach(d => { diagScores[d] = (diagScores[d] || 0) + 1; });
        }
      });
    });
  }

  const sortedDiags = Object.entries(diagScores)
    .sort((a,b) => b[1]-a[1])
    .filter(([,s]) => s > 0);

  const maxScore = sortedDiags[0]?.[1] || 1;

  const toggleCheck = (id) => setRheumChecks(prev => ({...prev, [id]: !prev[id]}));
  const clearAll = () => setRheumChecks({});

  if (!jointData) return <div style={{color:'#94a3b8',fontSize:13,padding:16}}>Select a joint to begin.</div>;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:0,height:'100%'}}>
      {/* Image popup overlay */}
      {popupImg && (
        <div onClick={() => setPopupImg(null)} style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.72)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div onClick={e => e.stopPropagation()} style={{background:dm?'#1e293b':'#ffffff',borderRadius:12,overflow:'hidden',maxWidth:520,width:'100%',boxShadow:'0 24px 64px rgba(0,0,0,0.5)',display:'flex',flexDirection:'column'}}>
            <img src={popupImg.src} alt="Example radiograph" style={{width:'100%',display:'block',maxHeight:420,objectFit:'contain',background:'#000'}} />
            {popupImg.caption && (
              <p style={{margin:0,padding:'10px 14px 0',fontSize:11,color:dm?'#94a3b8':'#64748b',lineHeight:1.5}}>{popupImg.caption}</p>
            )}
            <div style={{padding:'12px 14px'}}>
              <button onClick={() => setPopupImg(null)}
                style={{width:'100%',padding:'9px',borderRadius:8,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c2d92,#a855f7)',color:'white',fontSize:13,fontWeight:700,letterSpacing:'0.02em'}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:accent}}>{jointData.label} — Rheum DDx</span>
        {checkedIds.length > 0 && (
          <button onClick={clearAll} style={{fontSize:10,color:'#94a3b8',background:'none',border:'none',cursor:'pointer',padding:'2px 6px',borderRadius:4,border:'1px solid #334155'}}>
            Clear all
          </button>
        )}
      </div>



      {/* Findings checkboxes */}
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:10}}>
        {jointData.categories.map(cat => (
          <div key={cat.label}>
            <div style={{display:'flex',flexDirection:'column',gap:3}}>
              {cat.findings.map(f => {
                const checked = !!rheumChecks[f.id];
                return (
                  <label key={f.id} style={{display:'flex',alignItems:'flex-start',gap:7,cursor:'pointer',padding:'5px 7px',borderRadius:6,
                    background: checked ? (dm?'#1e2a3a':'#f0f4ff') : (dm?'#0f172a':'#f8fafc'),
                    border: `1px solid ${checked?(dm?'#334e6e':'#c7d7f0'):(dm?'#1e293b':'#f1f5f9')}`,
                    transition:'all 0.1s'}}>
                    <input type="checkbox" checked={checked} onChange={() => toggleCheck(f.id)}
                      style={{marginTop:2,accentColor:accent,cursor:'pointer',flexShrink:0}} />
                    <div style={{flex:1,minWidth:0}}>
                      <span style={{fontSize:12,fontWeight:checked?600:400,color:checked?(dm?'#93c5fd':'#1d4ed8'):(dm?'#cbd5e1':'#374151'),lineHeight:1.3,display:'flex',alignItems:'baseline',gap:6,flexWrap:'wrap'}}>
                        {f.label}
                      </span>
                      {RHEUM_EXAMPLE_IMAGES[f.id] && (
                        <span onClick={e => { e.preventDefault(); e.stopPropagation(); setPopupImg(RHEUM_EXAMPLE_IMAGES[f.id]); }}
                          style={{fontSize:9,fontWeight:500,color:'#60a5fa',cursor:'pointer',textDecoration:'underline',display:'block',marginTop:2,WebkitTextFillColor:'#60a5fa'}}>
                          🔍 Show Example
                        </span>
                      )}

                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Generate from DDx button */}
      <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${dm?'#334155':'#e2e8f0'}`}}>
        <p style={{fontSize:10,color:dm?'#64748b':'#94a3b8',margin:'0 0 6px 0',lineHeight:1.4}}>
          {checkedIds.length > 0
            ? `${checkedIds.length} finding${checkedIds.length!==1?'s':''} selected → top DDx: ${sortedDiags.slice(0,2).map(([d])=>(DIAG_INFO[d]||{label:d}).label).join(', ') || '—'}`
            : 'Check findings above to generate a focused DDx report, or use the left panel to dictate freely.'}
        </p>
        <button onClick={onGenerate} disabled={isGenerating || checkedIds.length === 0}
          style={{width:'100%',padding:'10px 12px',borderRadius:9,border:'none',cursor:isGenerating||checkedIds.length===0?'not-allowed':'pointer',
            background:isGenerating||checkedIds.length===0?(dm?'#1e293b':'#e2e8f0'):'linear-gradient(135deg,#7c2d92,#a855f7)',
            color:isGenerating||checkedIds.length===0?(dm?'#475569':'#94a3b8'):'white',
            fontSize:13,fontWeight:700,letterSpacing:'0.02em',
            boxShadow:isGenerating||checkedIds.length===0?'none':'0 4px 16px rgba(168,85,247,0.4)',transition:'all 0.15s'}}>
          {isGenerating ? '⏳ Generating…' : checkedIds.length === 0 ? '🔬 Generate DDx Report (select findings first)' : '🔬 Generate DDx Report'}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const ADMIN_EMAIL = 'admin@lucidmsk.com';
const ADMIN_EMAILS = ['admin@lucidmsk.com', 'adamsinger82@gmail.com'];
const SESSION_TOKEN_KEY = 'msk_session_token';

// Generate a random session token
const generateSessionToken = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

// Write session token to profiles table
const writeSessionToken = async (userId, token, accessToken) => {
  try {
    await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: getAnonKey(),
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ session_token: token, session_updated_at: new Date().toISOString() }),
    });
  } catch(e) { console.warn('writeSessionToken failed', e); }
};

// Verify session token matches DB — returns 'valid' | 'invalid' | 'error'
const verifySessionToken = async (userId, token, accessToken) => {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${userId}&select=session_token`, {
      headers: { apikey: getAnonKey(), Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return 'error';
    return data[0].session_token === token ? 'valid' : 'invalid';
  } catch { return 'error'; }
};

// ── Terms of Use text (rendered as JSX) ──────────────────────────────────────
const TOU_TEXT = (
  <div style={{ fontFamily: 'inherit' }}>
    <h2 style={{ color:'white', fontSize:16, fontWeight:700, marginBottom:4 }}>LucidMSK — Terms of Use Agreement</h2>
    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginBottom:20 }}>Effective Date: May 30, 2026</p>

    {[
      ['1. Acceptance of Terms', 'By creating an account, accessing, or using the LucidMSK application ("Application"), you ("User") agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, you must not access or use the Application. Your continued use of the Application constitutes your ongoing acceptance of these Terms as they may be updated from time to time.'],
      ['2. Description of the Application', 'LucidMSK is an AI-assisted platform designed to support musculoskeletal (MSK) radiology reporting and reference. The Application is intended to assist fellowship-trained radiologists and qualified medical professionals in the drafting, structuring, and referencing of radiology reports. LucidMSK utilizes artificial intelligence to provide decision support, reference material, and reporting assistance.\n\nThe Application is provided as a professional reference and drafting tool only. It does not constitute the practice of medicine and is not a substitute for the independent clinical judgment of a licensed medical professional.'],
      ['3. Intended Users', 'The Application is intended for use exclusively by licensed medical professionals, including but not limited to radiologists, physicians, and other qualified healthcare providers. By using the Application, you represent and warrant that:\n\n• You are a licensed medical professional in good standing in your jurisdiction;\n• You have the training, qualifications, and licensure necessary to interpret and apply radiology reports and medical information;\n• You will use the Application only in connection with your professional duties and in compliance with all applicable laws and regulations.'],
      ['4. Educational and Assistive Purpose Only', 'ALL content, output, suggestions, draft reports, reference material, and information provided by the Application are for EDUCATIONAL AND ASSISTIVE PURPOSES ONLY. The Application is a drafting and reference aid — not a diagnostic tool, not a clinical decision-making system, and not a replacement for independent professional judgment.\n\nLucidMSK AI-generated content:\n• May contain errors, omissions, or inaccuracies;\n• Has not been reviewed or approved by the FDA or any regulatory authority as a medical device;\n• Does not constitute a final radiology report or medical opinion;\n• Must be independently reviewed, verified, and approved by the licensed medical professional before use in any clinical context.'],
      ['5. User Responsibility and Assumption of Risk', 'YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE APPLICATION IS AT YOUR SOLE RISK. As a licensed medical professional, you bear full and exclusive responsibility for:\n\n• All clinical decisions, diagnoses, interpretations, and medical opinions you make in connection with your use of the Application;\n• The accuracy, completeness, and appropriateness of any radiology report or medical documentation you produce, whether or not assisted by the Application;\n• Independently verifying all Application output before relying upon it in any clinical context;\n• Compliance with all applicable professional standards, institutional policies, and legal requirements governing the practice of radiology and medicine in your jurisdiction;\n• Patient safety and the standard of care owed to your patients.\n\nThe Application is a tool to assist your professional judgment — it does not replace it. You remain solely responsible for all patient care decisions.'],
      ['6. Disclaimer of Warranties', 'THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, LUCIDMSK AND ITS OWNERS, DEVELOPERS, EMPLOYEES, AGENTS, AND AFFILIATES ("LUCIDMSK PARTIES") EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:\n\n• Any implied warranty of merchantability, fitness for a particular purpose, or non-infringement;\n• Any warranty that the Application will be uninterrupted, error-free, secure, or free of viruses or harmful components;\n• Any warranty regarding the accuracy, reliability, completeness, or timeliness of any content or output generated by the Application;\n• Any warranty that the Application is suitable for clinical, diagnostic, or therapeutic use.'],
      ['7. Limitation of Liability and Release', 'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU AGREE THAT THE LUCIDMSK PARTIES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF, OR INABILITY TO USE, THE APPLICATION, INCLUDING BUT NOT LIMITED TO:\n\n• Any harm to patients or third parties arising from clinical decisions made with or without reference to the Application;\n• Any errors, inaccuracies, or omissions in Application output;\n• Any loss of data, revenue, reputation, or professional standing;\n• Any claim arising from your reliance on Application-generated content.\n\nTHIS LIMITATION APPLIES REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE) AND EVEN IF LUCIDMSK HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.'],
      ['8. Indemnification and Waiver of Claims', 'By using the Application, you agree to indemnify, defend, and hold harmless the LucidMSK Parties from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys\' fees) arising out of or in any way connected with:\n\n• Your use of or reliance upon the Application;\n• Any clinical decision, diagnosis, report, or medical action you take in connection with the Application;\n• Your violation of these Terms;\n• Your violation of any applicable law, regulation, or professional standard;\n• Any claim by a patient, employer, insurer, or third party arising from your use of the Application.\n\nYOU EXPRESSLY WAIVE ANY AND ALL CLAIMS, CAUSES OF ACTION, AND RIGHTS TO BRING LEGAL ACTION OF ANY KIND AGAINST THE LUCIDMSK PARTIES ARISING FROM OR RELATED TO YOUR USE OF THE APPLICATION. This waiver includes but is not limited to claims in contract, tort, negligence, product liability, medical malpractice, and any statutory cause of action.'],
      ['9. No Doctor-Patient Relationship', 'Use of the Application does not create a doctor-patient relationship, a physician-patient relationship, or any other professional-client relationship between the User and LucidMSK or its owners, developers, or employees. LucidMSK is not a licensed healthcare provider and does not provide medical advice, diagnosis, or treatment.'],
      ['10. Privacy, Data, and Prohibition on PHI', '10.1 Prohibition on PHI Input. YOU ARE STRICTLY PROHIBITED from entering, uploading, transmitting, or otherwise providing any Protected Health Information ("PHI") or Personally Identifiable Information ("PII") — as defined under HIPAA and its implementing regulations, or any other applicable law — into the Application. This prohibition includes but is not limited to patient names, dates of birth, addresses, medical record numbers, social security numbers, or any other information that could reasonably be used to identify an individual patient. You agree to de-identify all patient information in accordance with HIPAA Safe Harbor or Expert Determination standards.\n\n10.2 No Liability for Inadvertently Provided PHI. LucidMSK is not designed, intended, or approved as a HIPAA-compliant platform and does not function as a Business Associate under HIPAA. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE LUCIDMSK PARTIES SHALL HAVE NO LIABILITY WHATSOEVER FOR ANY PHI OR PII THAT IS INADVERTENTLY, ACCIDENTALLY, OR OTHERWISE PROVIDED TO THE APPLICATION BY ANY USER. Any such disclosure is entirely the responsibility of the User who provided it.\n\n10.3 Your Compliance Responsibility. You are solely responsible for ensuring your use of the Application complies with all applicable privacy laws and regulations, including HIPAA, HITECH, state privacy laws, and any institutional policies governing patient data.'],
      ['11. Modifications to Terms', 'LucidMSK reserves the right to modify these Terms at any time. Updated Terms will be posted within the Application. Your continued use of the Application following the posting of updated Terms constitutes your acceptance of the revised Terms.'],
      ['12. Governing Law', 'These Terms shall be governed by and construed in accordance with the laws of the State of Georgia, United States of America, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Georgia.'],
      ['13. Severability', 'If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.'],
      ['14. Third-Party Services and Infrastructure', 'The Application is built upon and hosted using third-party software platforms, cloud infrastructure, and service providers, including but not limited to hosting providers, database services, authentication services, artificial intelligence APIs, and payment processors (collectively, "Third-Party Services"). By using the Application, you acknowledge and agree to the following:\n\n14.1 Data Sharing with Third Parties. In the course of providing the Application\'s functionality, certain information you input or that is generated through your use of the Application — including but not limited to account information, usage data, and content you submit — may be transmitted to, processed by, or stored with Third-Party Services. LucidMSK does not sell your personal information to third parties, but cannot guarantee how Third-Party Services handle data transmitted to them in the course of Application operation.\n\n14.2 Disclaimer of Liability for Third-Party Failures. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, LUCIDMSK EXPRESSLY DISCLAIMS ALL LIABILITY FOR ANY: (a) breach, loss, unauthorized access, or misuse of data that occurs at the Third-Party Service level; (b) failure, interruption, degradation, or unavailability of the Application resulting from Third-Party Service outages, downtime, or technical failures; (c) temporary or permanent loss of service, data, or functionality caused by changes to, discontinuation of, or failures within any Third-Party Service; or (d) actions, omissions, privacy practices, or security incidents of any Third-Party Service provider.\n\n14.3 Service Availability. LucidMSK does not guarantee uninterrupted or error-free access to the Application. Temporary loss of service or impaired functionality resulting from Third-Party Service issues is outside LucidMSK\'s control, and LucidMSK shall have no liability for any damages, losses, or inconvenience arising therefrom.\n\n14.4 User Acknowledgment. By using the Application, you expressly acknowledge that you understand the Application relies on Third-Party Services and that you accept the risks associated with such reliance, including the data sharing and service availability risks described in this section.'],
      ['15. Entire Agreement', 'These Terms constitute the entire agreement between you and LucidMSK with respect to the subject matter herein and supersede all prior or contemporaneous agreements, representations, warranties, and understandings.'],
    ].map(([title, body]) => (
      <div key={title} style={{ marginBottom:18 }}>
        <h3 style={{ color:'rgba(255,255,255,0.9)', fontSize:13, fontWeight:700, marginBottom:6 }}>{title}</h3>
        {body.split('\n\n').map((para, i) => (
          <p key={i} style={{ margin:'0 0 8px', color:'rgba(255,255,255,0.65)', fontSize:12.5, lineHeight:1.7, whiteSpace:'pre-line' }}>{para}</p>
        ))}
      </div>
    ))}

    <div style={{ marginTop:24, padding:'14px 16px', background:'rgba(79,70,229,0.12)', border:'1px solid rgba(79,70,229,0.3)', borderRadius:8 }}>
      <p style={{ color:'rgba(255,255,255,0.85)', fontSize:12, fontWeight:600, margin:0, lineHeight:1.6 }}>
        USER ACKNOWLEDGMENT: BY CLICKING "I AGREE," CREATING AN ACCOUNT, OR USING THE LUCIDMSK APPLICATION, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF USE IN THEIR ENTIRETY. YOU ACKNOWLEDGE THAT YOU ARE A LICENSED MEDICAL PROFESSIONAL AND THAT YOU ARE SOLELY RESPONSIBLE FOR ALL CLINICAL DECISIONS YOU MAKE IN CONNECTION WITH YOUR USE OF THIS APPLICATION.
      </p>
    </div>
  </div>
);

// ── Approval helpers ─────────────────────────────────────────────────────────
async function getApprovalStatus(userId, accessToken) {
  const key = getAnonKey();
  const r = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${userId}&select=approved`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  if (!rows || rows.length === 0) return null;
  return rows[0].approved === true;
}

async function getPendingUsers(accessToken) {
  const key = getAnonKey();
  const r = await fetch(`${SUPA_URL}/rest/v1/profiles?approved=eq.false&rejected=eq.false&select=id,email,created_at`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return [];
  return r.json();
}

async function getApprovedUsers(accessToken) {
  const key = getAnonKey();
  const r = await fetch(`${SUPA_URL}/rest/v1/profiles?approved=eq.true&select=id,email,created_at`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return [];
  return r.json();
}

async function callAdminFunc(funcName, userId, accessToken) {
  const key = getAnonKey();
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/rpc/${funcName}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_user_id: userId }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error(`${funcName} failed`, r.status, t);
      return { ok: false, error: `${r.status}: ${t}` };
    }
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

async function setApproved(userId, accessToken) {
  return callAdminFunc('approve_user', userId, accessToken);
}

async function setRejected(userId, accessToken) {
  return callAdminFunc('reject_user', userId, accessToken);
}

async function revokeAccess(userId, accessToken) {
  return callAdminFunc('revoke_user', userId, accessToken);
}

// ── Waiting screen ────────────────────────────────────────────────────────────
function PendingApprovalPage({ onSignOut }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#1a0a2e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'10%', left:'5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.12),transparent 70%)', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'8%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)', filter:'blur(40px)' }} />
      </div>
      <div style={{ width:'100%', maxWidth:420, position:'relative', textAlign:'center' }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⏳</div>
          <h2 style={{ color:'white', fontSize:22, fontWeight:700, margin:'0 0 12px', letterSpacing:'-0.02em' }}>Account Pending Approval</h2>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.6, margin:'0 0 24px' }}>
            Your account has been created and is awaiting admin approval.<br/>
            You'll have full access once approved. This typically takes 1–2 business days.
          </p>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, margin:'0 0 32px' }}>
            Questions? Contact <span style={{ color:'rgba(148,163,255,0.7)' }}>admin@lucidmsk.com</span>
          </p>
        </div>
        <button
          onClick={onSignOut}
          style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', padding:'10px 28px', borderRadius:9, fontSize:14, cursor:'pointer' }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Rejected screen ────────────────────────────────────────────────────────────
function RejectedPage({ onSignOut }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#1a0a2e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420, position:'relative', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🚫</div>
        <h2 style={{ color:'white', fontSize:22, fontWeight:700, margin:'0 0 12px' }}>Access Not Approved</h2>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.6, margin:'0 0 32px' }}>
          Your account was not approved for access to LucidMSK.<br/>
          Contact <span style={{ color:'rgba(148,163,255,0.7)' }}>admin@lucidmsk.com</span> if you believe this is an error.
        </p>
        <button
          onClick={onSignOut}
          style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', padding:'10px 28px', borderRadius:9, fontSize:14, cursor:'pointer' }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Admin panel ────────────────────────────────────────────────────────────────
function AdminPanel({ currentUser, onClose }) {
  const [tab, setTab] = useState('pending'); // 'pending' | 'approved'
  const [pending, setPending] = useState([]);
  const [approvedList, setApprovedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const [p, a] = await Promise.all([
      getPendingUsers(currentUser.access_token),
      getApprovedUsers(currentUser.access_token),
    ]);
    setPending(p || []);
    setApprovedList(a || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleApprove = async (userId, email) => {
    const res = await setApproved(userId, currentUser.access_token);
    if (res.ok) { flash(`✅ Approved: ${email}`); load(); }
    else flash(`❌ ${res.error}`);
  };

  const handleReject = async (userId, email) => {
    const res = await setRejected(userId, currentUser.access_token);
    if (res.ok) { flash(`🚫 Rejected: ${email}`); load(); }
    else flash(`❌ ${res.error}`);
  };

  const handleRevoke = async (userId, email) => {
    const res = await revokeAccess(userId, currentUser.access_token);
    if (res.ok) { flash(`↩️ Access revoked: ${email}`); load(); }
    else flash(`❌ ${res.error}`);
  };

  const rowStyle = { display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' };
  const btnStyle = (color) => ({ background:`rgba(${color},0.15)`, border:`1px solid rgba(${color},0.35)`, color:`rgb(${color})`, padding:'5px 14px', borderRadius:7, fontSize:12, cursor:'pointer', whiteSpace:'nowrap' });

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, width:'100%', maxWidth:560, maxHeight:'80vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ color:'white', fontSize:16, fontWeight:700 }}>🛡️ Admin Panel</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:2 }}>LucidMSK Member Management</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:20, cursor:'pointer', padding:'2px 6px' }}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
          {[['pending',`Pending (${pending.length})`],['approved',`Approved (${approvedList.length})`]].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex:1, background:'none', border:'none', borderBottom: tab===key ? '2px solid #5b9ef7' : '2px solid transparent', color: tab===key ? 'white' : 'rgba(255,255,255,0.4)', padding:'10px 0', fontSize:13, cursor:'pointer', transition:'all 0.15s' }}>{label}</button>
          ))}
        </div>
        {/* Flash message */}
        {actionMsg && (
          <div style={{ margin:'8px 16px 0', padding:'8px 14px', background:'rgba(255,255,255,0.07)', borderRadius:7, color:'rgba(255,255,255,0.8)', fontSize:13 }}>{actionMsg}</div>
        )}
        {/* Content */}
        <div style={{ overflowY:'auto', padding:'12px 20px', flex:1 }}>
          {loading ? (
            <div style={{ color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'32px 0', fontSize:13 }}>Loading…</div>
          ) : tab === 'pending' ? (
            pending.length === 0 ? (
              <div style={{ color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'32px 0', fontSize:13 }}>No pending users 🎉</div>
            ) : pending.map(u => (
              <div key={u.id} style={rowStyle}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'white', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                  <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:2 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown date'}</div>
                </div>
                <button onClick={() => handleApprove(u.id, u.email)} style={btnStyle('100,200,100')}>Approve</button>
                <button onClick={() => handleReject(u.id, u.email)} style={btnStyle('255,100,100')}>Reject</button>
              </div>
            ))
          ) : (
            approvedList.length === 0 ? (
              <div style={{ color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'32px 0', fontSize:13 }}>No approved users yet</div>
            ) : approvedList.map(u => (
              <div key={u.id} style={rowStyle}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'white', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                  <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:2 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</div>
                </div>
                {u.email !== ADMIN_EMAIL && (
                  <button onClick={() => handleRevoke(u.id, u.email)} style={btnStyle('255,180,80')}>Revoke</button>
                )}
                {u.email === ADMIN_EMAIL && (
                  <span style={{ color:'rgba(148,163,255,0.6)', fontSize:11 }}>Admin</span>
                )}
              </div>
            ))
          )}
        </div>
        {/* Footer */}
        <div style={{ padding:'10px 20px', borderTop:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
          <button onClick={load} style={{ background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.5)', padding:'6px 16px', borderRadius:7, fontSize:12, cursor:'pointer' }}>↻ Refresh</button>
        </div>
      </div>
    </div>
  );
}

async function supaSignUp(email, password) {
  const r = await fetch(`${SUPA_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: getAnonKey() },
    body: JSON.stringify({ email, password, data: {}, gotrue_meta_security: {}, options: { emailRedirectTo: 'https://lucidmsk.com/auth/callback' } }),
  });
  const data = await r.json();
  // Create profiles row immediately after signup; admin email auto-approved
  if (data?.user?.id) {
    const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    await fetch(`${SUPA_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        apikey: getAnonKey(),
        Authorization: `Bearer ${data.access_token || getAnonKey()}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=ignore-duplicates',
      },
      body: JSON.stringify({ id: data.user.id, email: email.trim().toLowerCase(), approved: isAdmin, rejected: false, terms_accepted_at: new Date().toISOString() }),
    });
  }
  return data;
}

async function supaSignIn(email, password) {
  const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: getAnonKey() },
    body: JSON.stringify({ email, password }),
  });
  return r.json();
}

async function supaSignOut(accessToken) {
  await fetch(`${SUPA_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: getAnonKey(), Authorization: `Bearer ${accessToken}` },
  });
}

async function supaGetUser(accessToken) {
  const r = await fetch(`${SUPA_URL}/auth/v1/user`, {
    headers: { apikey: getAnonKey(), Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  return r.json();
}

function saveSession(session) {
  try {
    localStorage.setItem('msk_session', JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: Date.now() + (session.expires_in || 3600) * 1000,
      user: session.user,
    }));
  } catch {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem('msk_session');
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.expires_at && s.expires_at < Date.now()) { localStorage.removeItem('msk_session'); return null; }
    return s;
  } catch { return null; }
}

function clearSession() {
  try { localStorage.removeItem('msk_session'); } catch {}
}

// ─── AVATAR OPTIONS ──────────────────────────────────────────────────────────
const AVATAR_OPTIONS = [
  { id:'stethoscope', icon:'🩺' },
  { id:'xray',        icon:'🩻' },
  { id:'bone',        icon:'🦴' },
  { id:'brain',       icon:'🧠' },
  { id:'microscope',  icon:'🔬' },
  { id:'dna',         icon:'🧬' },
  { id:'shield',      icon:'🛡️' },
  { id:'star',        icon:'⭐' },
];

function saveUserPrefs(userId, prefs) {
  try { localStorage.setItem(`msk_prefs_${userId}`, JSON.stringify(prefs)); } catch {}
}
function loadUserPrefs(userId) {
  try {
    const raw = localStorage.getItem(`msk_prefs_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function getInitials(firstName, lastName, email) {
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  if (firstName) return firstName.slice(0,2).toUpperCase();
  return (email?.[0] || '?').toUpperCase();
}
function getAvatarIcon(avatarChoice) {
  return AVATAR_OPTIONS.find(a => a.id === avatarChoice)?.icon || '👤';
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarMode, setAvatarMode] = useState('initials'); // 'initials' | 'icon'
  const [avatarChoice, setAvatarChoice] = useState('stethoscope');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touChecked, setTouChecked] = useState(false);
  const [touModalOpen, setTouModalOpen] = useState(false);
  const [touViewed, setTouViewed] = useState(false);

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 9,
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
    color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }
    if (mode === 'signup' && password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (mode === 'signup' && password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (mode === 'signup' && !touChecked) { setError('You must read and agree to the Terms of Use to create an account.'); return; }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await supaSignUp(email.trim(), password);
        if (data.error) { setError(data.error.message || data.msg || 'Sign up failed.'); }
        else if (data.user && !data.session) {
          setSuccess('Account created! Please check your email to confirm your address, then sign in.');
          setMode('signin');
        } else if (data.access_token) {
          saveSession(data);
          const uid = data.user?.id;
          if (uid) saveUserPrefs(uid, { firstName, lastName, avatarMode, avatarChoice });
          onLogin({ ...data.user, access_token: data.access_token });
        } else {
          setSuccess('Account created! Please sign in.');
          setMode('signin');
        }
      } else {
        const data = await supaSignIn(email.trim(), password);
        if (data.error || data.error_description) {
          const errMsg = (data.error_description || data.error || '').toLowerCase();
          if (errMsg.includes('email not confirmed') || errMsg.includes('not confirmed')) {
            setError('Your email address is not yet confirmed. Please check your inbox for a verification email.');
          } else {
            setError(data.error_description || data.error || 'Invalid email or password.');
          }
        } else if (data.access_token) {
          saveSession(data); onLogin({ ...data.user, access_token: data.access_token });
        } else {
          setError('Invalid email or password.');
        }
      }
    } catch { setError('Network error. Please check your connection.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#1a0a2e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      {/* Background decoration */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'10%', left:'5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.12),transparent 70%)', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'8%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)', filter:'blur(40px)' }} />
      </div>

      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:32 }}>
          <svg width="64" height="64" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
            <defs>
              <filter id="login-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <circle cx="36" cy="36" r="33" stroke="#1a3a6b" strokeWidth="1.2"/>
            <rect x="32" y="18" width="8" height="36" rx="4" fill="#5b9ef7" opacity="0.08"/>
            <ellipse cx="36" cy="18" rx="7" ry="5" fill="#5b9ef7" opacity="0.18"/>
            <ellipse cx="36" cy="54" rx="7" ry="5" fill="#5b9ef7" opacity="0.18"/>
            <line x1="33" y1="22" x2="33" y2="50" stroke="#5b9ef7" strokeWidth="1.5" opacity="0.35"/>
            <line x1="39" y1="22" x2="39" y2="50" stroke="#5b9ef7" strokeWidth="1.5" opacity="0.35"/>
            <line x1="36" y1="14" x2="20" y2="28" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="36" y1="14" x2="52" y2="28" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="20" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <line x1="52" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <line x1="20" y1="28" x2="16" y2="44" stroke="#4a90d9" strokeWidth="0.8" className="ll"/>
            <line x1="52" y1="28" x2="56" y2="44" stroke="#4a90d9" strokeWidth="0.8" className="ll"/>
            <line x1="36" y1="36" x2="26" y2="44" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="36" y1="36" x2="46" y2="44" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="16" y1="44" x2="36" y2="58" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="56" y1="44" x2="36" y2="58" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="26" y1="44" x2="36" y2="58" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="46" y1="44" x2="36" y2="58" stroke="#7ab8f5" strokeWidth="0.8"/>
            <circle cx="36" cy="14" r="3.2" fill="#5b9ef7" filter="url(#login-glow)" className="ln1"/>
            <circle cx="20" cy="28" r="2.5" fill="#4a90d9" filter="url(#login-glow)" className="ln2"/>
            <circle cx="52" cy="28" r="2.5" fill="#4a90d9" filter="url(#login-glow)" className="ln2"/>
            <circle cx="16" cy="44" r="2.5" fill="#4a90d9" filter="url(#login-glow)" className="ln3"/>
            <circle cx="56" cy="44" r="2.5" fill="#4a90d9" filter="url(#login-glow)" className="ln3"/>
            <circle cx="26" cy="44" r="2"   fill="#7ab8f5" filter="url(#login-glow)" className="ln2"/>
            <circle cx="46" cy="44" r="2"   fill="#7ab8f5" filter="url(#login-glow)" className="ln2"/>
            <circle cx="36" cy="58" r="3.2" fill="#5b9ef7" filter="url(#login-glow)" className="ln1"/>
            <circle cx="36" cy="36" r="3.8" fill="#90caf9" filter="url(#login-glow)" className="ln3"/>
          </svg>
          <div>
            <div style={{ color:'#e0eaff', fontWeight:700, fontSize:34, letterSpacing:'2px', fontFamily:'Rajdhani, sans-serif', lineHeight:1 }}>
              Lucid<span style={{ color:'#5b9ef7' }}>MSK</span>
            </div>
            <div style={{ color:'#3a6aaa', fontSize:9, letterSpacing:'4px', textTransform:'uppercase', fontWeight:300, marginTop:4 }}>
              AI-Powered MSK Radiology Assistant
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'28px 32px', boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>
          {/* Mode tabs */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:10, padding:3, marginBottom:24, gap:2 }}>
            {[['signin','Sign In'],['signup','Create Account']].map(([m,l]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{ flex:1, padding:'8px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
                  background: mode===m ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : 'transparent',
                  color: mode===m ? 'white' : 'rgba(255,255,255,0.45)',
                  boxShadow: mode===m ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                  transition:'all 0.2s' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode === 'signup' && (<>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>First Name</label>
                  <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Jane" style={inp} />
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Last Name</label>
                  <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Smith" style={inp} />
                </div>
              </div>
              <div>
                <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Profile Style</label>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <button type="button" onClick={()=>setAvatarMode('initials')}
                    style={{ padding:'6px 14px', borderRadius:8, border:'1px solid', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                      borderColor: avatarMode==='initials' ? '#4f46e5' : 'rgba(255,255,255,0.15)',
                      background: avatarMode==='initials' ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.05)',
                      color: avatarMode==='initials' ? '#a5b4fc' : 'rgba(255,255,255,0.5)' }}>
                    Initials
                  </button>
                  {AVATAR_OPTIONS.map(av => (
                    <button key={av.id} type="button" onClick={()=>{ setAvatarMode('icon'); setAvatarChoice(av.id); }}
                      style={{ width:36, height:36, borderRadius:'50%', border:'2px solid', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                        borderColor: avatarMode==='icon' && avatarChoice===av.id ? '#4f46e5' : 'rgba(255,255,255,0.15)',
                        background: avatarMode==='icon' && avatarChoice===av.id ? 'rgba(79,70,229,0.25)' : 'rgba(255,255,255,0.05)' }}>
                      {av.icon}
                    </button>
                  ))}
                </div>
              </div>
            </>)}
            <div>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                placeholder="you@example.com" style={inp} autoComplete="email" />
            </div>
            <div>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                placeholder={mode==='signup'?'Min. 8 characters':'Your password'} style={inp} autoComplete={mode==='signup'?'new-password':'current-password'} />
            </div>
            {mode === 'signup' && (
              <div>
                <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                  placeholder="Repeat password" style={inp} autoComplete="new-password" />
              </div>
            )}

            {error && <p style={{ margin:0, padding:'8px 12px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#fca5a5', fontSize:12, lineHeight:1.5 }}>{error}</p>}
            {success && <p style={{ margin:0, padding:'8px 12px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:8, color:'#6ee7b7', fontSize:12, lineHeight:1.5 }}>{success}</p>}

            {/* Terms of Use checkbox — signup only */}
            {mode === 'signup' && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9 }}>
                <input
                  type="checkbox"
                  id="tou-checkbox"
                  checked={touChecked}
                  onChange={e => setTouChecked(e.target.checked)}
                  disabled={!touViewed}
                  style={{ marginTop:2, cursor: touViewed ? 'pointer' : 'not-allowed', accentColor:'#4f46e5', width:15, height:15, flexShrink:0 }}
                />
                <label htmlFor="tou-checkbox" style={{ color:'rgba(255,255,255,0.6)', fontSize:12, lineHeight:1.5, cursor: touViewed ? 'pointer' : 'default' }}>
                  I have read and agree to the{' '}
                  <button type="button" onClick={() => { setTouModalOpen(true); setTouViewed(true); }}
                    style={{ background:'none', border:'none', color:'#818cf8', fontSize:12, cursor:'pointer', textDecoration:'underline', padding:0 }}>
                    Terms of Use
                  </button>
                  {!touViewed && <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}> — click to read first</span>}
                </label>
              </div>
            )}

            {/* ToU Modal Overlay */}
            {touModalOpen && (
              <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
                onClick={e => { if (e.target === e.currentTarget) setTouModalOpen(false); }}>
                <div style={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, width:'100%', maxWidth:680, maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
                    <span style={{ color:'white', fontWeight:700, fontSize:15 }}>LucidMSK — Terms of Use</span>
                    <button onClick={() => setTouModalOpen(false)} style={{ background:'none', border:'none', color:'#64748b', fontSize:18, cursor:'pointer', lineHeight:1 }}>✕</button>
                  </div>
                  <div style={{ overflowY:'auto', padding:'20px 24px', flex:1, color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.75 }}>
                    {TOU_TEXT}
                  </div>
                  <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'flex-end', gap:10, flexShrink:0 }}>
                    <button onClick={() => setTouModalOpen(false)}
                      style={{ padding:'9px 22px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ padding:'12px', borderRadius:10, border:'none', cursor:loading?'not-allowed':'pointer', fontWeight:800, fontSize:14, letterSpacing:'0.04em',
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#2563eb,#4f46e5)',
                color: loading ? 'rgba(255,255,255,0.4)' : 'white',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)',
                transition:'all 0.15s', marginTop:4 }}>
              {loading ? '⏳ Please wait…' : mode==='signin' ? '→ Sign In' : '→ Create Account'}
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}

// ── CME Banner: matches report pathology against CME modules ────────────────
// Body part → CME specialty mapping, used as a hard filter so a shoulder report
// never surfaces a knee module (and vice versa). 'General MSK', 'Soft Tissue
// Tumors', and 'Trauma' are cross-cutting and always allowed through, since a
// module tagged that way may be relevant regardless of which joint was imaged.
const BODYPART_TO_CME_SPECIALTY = {
  knee: 'Knee',
  shoulder: 'Shoulder',
  hip: 'Hip',
  ankle: 'Ankle',
  foot: 'Ankle',
  wrist: 'Wrist/Hand',
  hand: 'Wrist/Hand',
  thumb: 'Wrist/Hand',
  fingers: 'Wrist/Hand',
  elbow: 'Elbow',
  spine: 'Spine',
  pelvis: 'Pelvis',
  humerus: 'Shoulder',
  forearm: 'Elbow',
  'femur/thigh': 'Hip',
  'tibia/fibula': 'Knee',
};
const CROSS_CUTTING_CME_SPECIALTIES = ['Soft Tissue Tumors', 'Trauma', 'General MSK'];

// Curated pathology vocabulary used as a fallback when a module has no
// pathology_tags filled in yet — pulled from the module title only (never
// from specialty, since specialty is just the body part and matching on it
// is what caused unrelated modules like "Shoulder Arthroplasty" to surface
// for every shoulder report regardless of actual findings).
const CME_PATHOLOGY_KEYWORDS = [
  'arthroplasty','replacement','prosthesis','prosthetic',
  'rotator cuff','cuff tear','impingement','labral tear','slap',
  'instability','dislocation','bankart','hill-sachs',
  'meniscus','meniscal','acl','pcl tear','mcl tear','lcl tear','chondral','osteochondral',
  'tendinosis','tendinopathy','tenosynovitis',
  'stress fracture','avn','osteonecrosis','avascular necrosis',
  'sarcoma','metastasis','metastatic',
  'osteomyelitis','discitis',
  'spinal stenosis','disc herniation','radiculopathy','myelopathy',
  'osteoarthritis','rheumatoid arthritis','gout','cppd',
  'tfcc','scapholunate','carpal tunnel','de quervain',
  'plantar fasciitis','achilles','syndesmosis',
  'femoroacetabular','hamstring',
];

// Negation words that, when found immediately before a matched pathology phrase,
// mean the finding was explicitly ruled out — and should not count as a match.
// Radiology reports are formulaic ("No labral tear.", "Without acute fracture.",
// "Intact. No osteonecrosis."), so a short look-back window before the phrase is sufficient.
const CME_NEGATION_WORDS = ['no', 'not', 'without', 'absent', 'negative for', 'free of', 'no evidence of', 'no significant'];
const CME_NEGATION_LOOKBACK_CHARS = 25;

// Returns true if `phrase` appears in `textLower` at least once WITHOUT being
// immediately preceded by a negation word within the lookback window.
function phraseMatchesPositively(textLower, phrase) {
  let searchFrom = 0;
  while (true) {
    const idx = textLower.indexOf(phrase, searchFrom);
    if (idx === -1) return false;
    const windowStart = Math.max(0, idx - CME_NEGATION_LOOKBACK_CHARS);
    const lookback = textLower.slice(windowStart, idx);
    const negated = CME_NEGATION_WORDS.some(neg => lookback.includes(neg));
    if (!negated) return true; // found a non-negated occurrence — good enough
    searchFrom = idx + phrase.length; // this occurrence was negated, keep scanning for another
  }
}

function findCmeMatches(reportText, modules, selectedBodyPart) {
  if (!reportText || !modules?.length) return [];

  // Hard filter: only consider modules tagged for this body part's specialty,
  // or tagged with a cross-cutting specialty (Trauma, Soft Tissue Tumors, General MSK).
  const allowedSpecialty = BODYPART_TO_CME_SPECIALTY[selectedBodyPart];
  const candidates = modules.filter(m => {
    if (!m.specialty) return false;
    if (CROSS_CUTTING_CME_SPECIALTIES.includes(m.specialty)) return true;
    return m.specialty === allowedSpecialty;
  });
  if (!candidates.length) return [];

  const reportLower = reportText.toLowerCase();

  const scored = candidates.map(m => {
    let score = 0;
    // Primary signal: admin-entered pathology_tags, each tag is a phrase that
    // must appear in the report text — and NOT be negated — to count.
    const tags = Array.isArray(m.pathology_tags) ? m.pathology_tags : [];
    tags.forEach(tag => {
      const t = (tag || '').toLowerCase().trim();
      if (t && phraseMatchesPositively(reportLower, t)) score += 3; // weighted higher — explicit admin intent
    });
    // Fallback signal: curated pathology keywords found in the module's own title,
    // each checked against the report text (also negation-aware). Title words like
    // "shoulder" or "MRI" are not in this list, so generic body-part overlap can't score.
    const titleLower = (m.title || '').toLowerCase();
    CME_PATHOLOGY_KEYWORDS.forEach(kw => {
      if (titleLower.includes(kw) && phraseMatchesPositively(reportLower, kw)) score += 1;
    });
    return { ...m, score };
  }).filter(m => m.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

function CmeBanner({ matches, dm, onOpenModule }) {
  if (!matches?.length) return null;
  return (
    <div style={{
      background: dm ? 'rgba(20,83,45,0.35)' : 'rgba(220,252,231,0.9)',
      border: `1px solid ${dm ? '#166534' : '#86efac'}`,
      borderRadius: 10,
      padding: '10px 12px',
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: dm ? '#4ade80' : '#15803d', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        🎓 Related CME Available
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {matches.map(m => (
          <div
            key={m.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpenModule?.(m.id)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpenModule?.(m.id); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: dm ? 'rgba(34,197,94,0.15)' : 'white',
              border: `1px solid ${dm ? '#166534' : '#bbf7d0'}`,
              borderRadius: 7,
              padding: '7px 10px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 14 }}>📋</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: dm ? '#4ade80' : '#15803d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.title}
              </div>
              {m.specialty && (
                <div style={{ fontSize: 10, color: dm ? '#86efac' : '#16a34a', marginTop: 1 }}>{m.specialty}</div>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'white', background: dm ? '#16a34a' : '#22c55e', borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              CLAIM CME
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // ── Auth state ────────────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [sessionKickedOut, setSessionKickedOut] = useState(false);
  const sessionCheckRef = useRef(null); // null=checking, true=approved, false=pending, 'rejected'=rejected
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showTouModal, setShowTouModal] = useState(false);
  const [userPrefs, setUserPrefs] = useState({ firstName:'', lastName:'', avatarMode:'initials', avatarChoice:'stethoscope' });
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);

  // Restore session + prefs — with token refresh if expiring within 10 minutes
  useEffect(() => {
    const doRestore = async () => {
      const s = loadSession();
      if (!s?.user || !s?.access_token || !localStorage.getItem('msk_session')) {
        setAuthLoading(false); return;
      }
      let accessToken = s.access_token;
      // Refresh if token expires within 10 minutes (600000ms)
      const expiresIn = (s.expires_at || 0) - Date.now();
      if (expiresIn < 600000 && s.refresh_token) {
        try {
          const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: getAnonKey() },
            body: JSON.stringify({ refresh_token: s.refresh_token }),
          });
          if (r.ok) {
            const fresh = await r.json();
            if (fresh.access_token) {
              saveSession(fresh);
              accessToken = fresh.access_token;
            }
          }
        } catch {} // Refresh failed — use existing token, will expire eventually
      }
      const prefs = loadUserPrefs(s.user.id);
      if (prefs) setUserPrefs(p => ({ ...p, ...prefs }));
      const restoredUser = { ...s.user, access_token: accessToken };

      // ── Session token check (skip for admins) ──────────────────────────
      if (!ADMIN_EMAILS.includes(restoredUser.email?.toLowerCase())) {
        const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
        if (storedToken) {
          const result = await verifySessionToken(restoredUser.id, storedToken, accessToken);
          if (result === 'invalid') {
            // Another device logged in — kick this one out
            localStorage.removeItem('msk_session');
            localStorage.removeItem(SESSION_TOKEN_KEY);
            setSessionKickedOut(true);
            setAuthLoading(false);
            return;
          }
        }
      }

      setAuthUser(restoredUser);
      // Re-check approval on session restore
      if (restoredUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setApprovalStatus(true);
      } else {
        try {
          const rows = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${restoredUser.id}&select=approved,rejected`, {
            headers: { apikey: getAnonKey(), Authorization: `Bearer ${accessToken}` },
          }).then(r => r.json());
          if (!rows || rows.length === 0) setApprovalStatus(false);
          else if (rows[0].rejected) setApprovalStatus('rejected');
          else setApprovalStatus(rows[0].approved === true);
        } catch { setApprovalStatus(false); }
      }
      setAuthLoading(false);
    };
    doRestore();
  }, []);

  // ── Fetch published CME modules once (used for CME banner matching) ──────
  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/cme_modules?select=id,title,specialty,url,pathology_tags&status=eq.published`, {
      headers: { apikey: getAnonKey() }
    }).then(r => r.ok ? r.json() : []).then(data => {
      if (Array.isArray(data)) setCmeModules(data);
    }).catch(() => {});
  }, []);

  const handleLogin = async (user) => {
    // Load prefs BEFORE setting authUser so auto-save guard doesn't overwrite them
    const prefs = loadUserPrefs(user.id);
    if (prefs) setUserPrefs(p => ({ ...p, ...prefs }));
    setSessionKickedOut(false);
    // ── Generate + write session token (skip for admins) ──────────────────
    if (!ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
      const token = generateSessionToken();
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      await writeSessionToken(user.id, token, user.access_token);
    }
    setAuthUser(user);
    // Check approval status immediately after login (admin always bypasses)
    if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setApprovalStatus(true);
    } else {
      // Retry up to 4 times with 500ms delay — JWT sometimes needs a moment
      // to propagate through Supabase RLS before the profiles query returns data
      const checkApproval = async (retries = 4, delay = 500) => {
        try {
          const rows = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${user.id}&select=approved,rejected`, {
            headers: { apikey: getAnonKey(), Authorization: `Bearer ${user.access_token}` },
          }).then(r => r.json());
          if (!rows || rows.length === 0) {
            // Empty result — JWT may not have propagated yet, retry
            if (retries > 0) {
              await new Promise(res => setTimeout(res, delay));
              return checkApproval(retries - 1, delay);
            }
            setApprovalStatus(false); // genuinely no profile row
          } else if (rows[0].rejected) {
            setApprovalStatus('rejected');
          } else {
            setApprovalStatus(rows[0].approved === true);
          }
        } catch {
          if (retries > 0) {
            await new Promise(res => setTimeout(res, delay));
            return checkApproval(retries - 1, delay);
          }
          setApprovalStatus(false);
        }
      };
      await checkApproval();
    }
  };
  const handleSignOut = () => {
    // Clear session token from localStorage
    try { localStorage.removeItem(SESSION_TOKEN_KEY); } catch {}
    // Clear session check interval
    if (sessionCheckRef.current) { clearInterval(sessionCheckRef.current); sessionCheckRef.current = null; }
    // Wipe ALL auth-related storage synchronously — no server call needed
    try {
      localStorage.removeItem('msk_session');
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('sb-') || k.includes('supabase')) localStorage.removeItem(k);
      });
    } catch {}
    setAuthUser(null);
    setApprovalStatus(null);
    setSessionKickedOut(false);
    setShowAdminPanel(false);
    setUserPrefs({ firstName:'', lastName:'', avatarMode:'initials', avatarChoice:'stethoscope' });
    setShowAvatarPopup(false);
  };

  // ── Mobile state ──────────────────────────────────────────────────────────
  const [mobileTab, setMobileTab] = useState(0); // 0=Dictation, 1=Report, 2=Reference
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const [selectedBodyPart, setSelectedBodyPart] = useState('spine');
  const [side, setSide] = useState('left');
  const [contrast, setContrast] = useState('without');
  const [modality, setModality] = useState('MRI');
  const [dictationText, setDictationText] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isEditingReport, setIsEditingReport] = useState(false); // Col 2 edit toggle
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState('');
  const [spineRegion, setSpineRegion] = useState('lumbar');
  const [showAtlas, setShowAtlas] = useState(false);
  const [showDdx, setShowDdx] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const [hubInitialModuleId, setHubInitialModuleId] = useState(null); // set when jumping straight to a specific CME module
  const [hubTab, setHubTab] = useState('research'); // 'research' | 'jobs' | 'cme'
  const [cmeModules, setCmeModules] = useState([]);  // CME library — loaded once at app mount

  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;
  const recognitionRef = useRef(null);
  const isRheumRef = useRef(false); // tracks current modality for STT handler
  const finalTranscriptPersistRef = useRef(''); // persists transcript across recognition restarts

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
  const [layPersonSummary, setLayPersonSummary] = useState(false);
  const [includeDoseOpt, setIncludeDoseOpt] = useState(true);
  const [massMode, setMassMode] = useState('auto'); // 'auto' | 'new' | 'followup' | 'postresection'
  // ── Arthroplasty module state ─────────────────────────────────────────────
  const [arthroplastyEnabled, setArthroplastyEnabled] = useState(false);
  const [arthroplastyType, setArthroplastyType] = useState(''); // shoulder: 'rtsa'|'atsa'|'hemi'; hip: 'tha'; knee: 'tka'
  const [arthroplastyChecklist, setArthroplastyChecklist] = useState({});
  const [arthroplastyGrading, setArthroplastyGrading] = useState('');
  const [arthroplastyImageTab, setArthroplastyImageTab] = useState(0);
  // ── Rheum module state ──────────────────────────────────────────────────
  const [rheumJoint, setRheumJoint] = useState('knee');
  const [rheumLaterality, setRheumLaterality] = useState('left');
  const [rheumViews, setRheumViews] = useState('2');
  const [rheumChecks, setRheumChecks] = useState({});
  const [rheumFreeText, setRheumFreeText] = useState('');
  const [isGeneratingRheum, setIsGeneratingRheum] = useState(false);
  const WEBSITE_URL = 'https://mri-reporting.vercel.app'; // update to your actual patient-facing URL

  const showSide = !BILATERAL.includes(selectedBodyPart);
  const isCT = modality === 'CT';
  const isRheum = modality === 'Rheum';
  useEffect(() => { isRheumRef.current = isRheum; }, [isRheum]);
  const partLabel = selectedBodyPart === 'spine' ? `${spineRegion} spine` : selectedBodyPart;
  const sideLabel = showSide ? `${side} ` : '';
  const contrastLabel = contrast === 'without' ? 'without' : contrast === 'with' ? 'with' : 'with and without';

  const technique = isCT
    ? `CT scan of the ${sideLabel}${partLabel} ${contrastLabel} IV contrast. Multiplanar reformats were created.${includeDoseOpt ? ' One or more of the following dose optimizing techniques were utilized for this exam: automated exposure control, adjustment of the mA and/or kV according to patient size, and/or use of iterative reconstruction technique.' : ''}`
    : `Multiplanar multisequence MRI of the ${sideLabel}${partLabel} ${contrastLabel} IV contrast.`;


  // ── Incidental trigger logic ──────────────────────────────────────────────
  const showLungWarning = isCT && (
    selectedBodyPart === 'shoulder' ||
    (selectedBodyPart === 'spine' && ['cervical','thoracic'].includes(spineRegion))
  );
  const showGUWarning = !isRheum && (
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
  const resetArthroplasty = () => {
    setArthroplastyEnabled(false);
    setArthroplastyType('');
    setArthroplastyChecklist({});
    setArthroplastyGrading('');
    setArthroplastyImageTab(0);
  };

  const generateReport = async () => {
    const textToUse = isRheum ? rheumFreeText : dictationText;
    if (!textToUse.trim()) return;
    setGeneratedReport(''); // always clears center col — any button can override
    setIsEditingReport(false);
    setIsGenerating(true);
    const lat = showSide ? side : '';
    // ── Mass mode resolution ─────────────────────────────────────────────────
    const massKeywords = [
      'mass','tumor','tumour','cancer','malignancy','malignant',
      'carcinoma','sarcoma','lymphoma','metastasis','metastatic',
      'metastases','neoplasm','neoplastic','lesion','recurrence',
      'recurrent','oncology','oncologic'
    ];
    const hasMassKeyword = massKeywords.some(k => textToUse.toLowerCase().includes(k));
    // Resolve effective mode: if user pinned a mode, use it; otherwise 'auto' passes through to prompt
    const resolvedMassMode = massMode; // 'auto' lets the prompt do its own detection
    try {
      const layPersonInstruction = layPersonSummary
        ? `\n\nADDITIONAL SECTION — IMPORTANT: After you have completed the full formal radiology report including TECHNIQUE, FINDINGS, IMPRESSION, and any REFERENCES/FOOTNOTE sections, append one final separate section at the very end. Do not modify the formal report sections in any way. The additional section must begin with the exact header "UNDERSTANDING YOUR RESULTS:" on its own line in ALL CAPS. Then write 2-5 plain-language sentences summarizing the key findings for a patient with a high school education. Rules: no medical jargon — use "wear and tear" not "osteoarthritis", "cartilage damage" not "chondromalacia", "torn" not "ruptured", "fluid buildup" not "effusion", "pinched nerve" not "radiculopathy". Be clear but reassuring in tone. Do not repeat the formal impression verbatim`
        : '';
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:2000,
          system: isRheum ? buildRheumPrompt(rheumJoint, rheumLaterality, rheumViews) + layPersonInstruction : buildPrompt(selectedBodyPart, lat, contrast, spineRegion, modality, includeDoseOpt, resolvedMassMode) + layPersonInstruction,
          messages:[{role:'user',content:`Dictated findings:\n\n${isRheum ? rheumFreeText : dictationText}${(!isRheum && buildIncidentalBlock()) ? '\n\nINCIDENTAL FINDINGS — PLACEMENT INSTRUCTIONS:\nFor each incidental finding below: (1) add a brief descriptive sentence in the FINDINGS section under the most relevant existing heading (for spine MRI use "Paraspinal Soft Tissues:"; for non-spine joints use "Soft Tissues:" or "Regional Neurovascular Structures:" as appropriate for aortic findings) — e.g. "Incidentally noted simple-appearing right adnexal cyst measuring up to X cm." (2) add a corresponding numbered line in the IMPRESSION. (3) include the management recommendation and citation in REFERENCES/FOOTNOTE as detailed below. Do NOT place these findings ONLY in the impression — they must also appear in FINDINGS.\n\n' + buildIncidentalBlock() : ''}`}],
        }),
      });
      const data = await res.json();
      if (data?.error) setGeneratedReport('Error: ' + data.error);
      else { setGeneratedReport(data?.content?.[0]?.text || 'Error generating report.'); setMobileTab(1); }
    } catch { setGeneratedReport('Network error. Please try again.'); }
    setIsGenerating(false);
  };

  // ── Generate Report from DDx checkboxes ───────────────────────────────────
  const generateRheumReport = async () => {
    setIsGeneratingRheum(true);
    setGeneratedReport(''); // always clears and replaces center col
    setIsEditingReport(false);
    const jLabel = RHEUM_JOINTS[rheumJoint]?.label || rheumJoint;
    // Build a structured finding list from checked boxes
    const checkedFindings = [];
    const jData = RHEUM_JOINTS[rheumJoint];
    if (jData) {
      jData.categories.forEach(cat => {
        cat.findings.forEach(f => {
          if (rheumChecks[f.id]) checkedFindings.push(`[${cat.label}] ${f.label}`);
        });
      });
    }
    const findingsSummary = checkedFindings.length > 0
      ? checkedFindings.map(f => `• ${f}`).join('\n')
      : '(No specific findings selected — generate differential only)';
    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:1500,
          system: buildRheumPrompt(rheumJoint, rheumLaterality, rheumViews),
          messages:[{role:'user',content:`Radiographic findings checked by the radiologist:\n\n${findingsSummary}\n\nPlease generate a structured X-ray report. For the impression (2-3 sentences maximum): use SINGULAR — "The imaging pattern is most consistent with the diagnosis of [X]." If there is a secondary consideration add "Next consideration includes [Y]." (brief). If two entities coexist: "The imaging pattern is most consistent with [X] superimposed with [Y]." KNEE CPPD vs OA: if chondrocalcinosis + isolated patellofemoral narrowing or prominent subchondral cysts → favor CPPD primary; if chondrocalcinosis + tricompartmental or medial narrowing + osteophytes → favor OA primary with CPPD next. Do NOT repeat findings from FINDINGS. Do NOT reference ABCDE or ABCDEs.`}],
        }),
      });
      const data = await res.json();
      if (data?.error) setGeneratedReport('Error: ' + data.error);
      else { setGeneratedReport(data?.content?.[0]?.text || 'Error generating report.'); setMobileTab(1); }
    } catch { setGeneratedReport('Network error. Please try again.'); }
    setIsGeneratingRheum(false);
  };

  const keepaliveTimerRef = useRef(null);
  const gracePeriodRef = useRef(false); // true after a final result — suppresses keepalive restart briefly
  const graceTimerRef = useRef(null);

  const startKeepalive = (getRecRef) => {
    stopKeepalive();
    // Periodic forced restarts were fragmenting continuous speech into small chunks,
    // each transcribed without sentence context — causing both garbling and mid-word
    // cutoffs. Rely solely on the natural onend auto-restart loop below, which already
    // handles browser silence timeouts and reseeds from finalTranscriptPersistRef.
  };

  const stopKeepalive = () => {
    if (keepaliveTimerRef.current) { clearInterval(keepaliveTimerRef.current); keepaliveTimerRef.current = null; }
    if (graceTimerRef.current) { clearTimeout(graceTimerRef.current); graceTimerRef.current = null; }
    gracePeriodRef.current = false;
  };

  const toggleListening = () => {
    if (isListening) { stopKeepalive(); recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Please use Chrome or Edge.'); return; }
    setMicError('');
    finalTranscriptPersistRef.current = '';

    // Factory: builds a fresh recognition instance with all handlers correctly scoped.
    // Called once on start and again on every auto-restart (fixes Edge stale-closure bug).
    const makeRecognition = () => {
      const rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US'; rec.maxAlternatives = 1;

      rec.onstart = () => setIsListening(true);
      rec.onaudiostart = () => setIsListening(true);

      rec.onresult = (event) => {
        let interim = '';
        let gotFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) { finalTranscriptPersistRef.current += t + ' '; gotFinal = true; }
          else interim += t;
        }
        // Grace period: after any final result, pause keepalive for 2.5s so
        // Chrome/Edge don't get interrupted mid-sentence at end of dictation
        if (gotFinal) {
          gracePeriodRef.current = true;
          if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
          graceTimerRef.current = setTimeout(() => { gracePeriodRef.current = false; graceTimerRef.current = null; }, 2500);
        }
        const transcript = finalTranscriptPersistRef.current + interim;
        if (isRheumRef.current) setRheumFreeText(transcript);
        else setDictationText(transcript);
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed') { stopKeepalive(); setMicError('Microphone access denied. Click the lock icon in your address bar.'); setIsListening(false); }
        // no-speech / audio-capture: silence timeout — onend fires next and restarts automatically
      };

      rec.onend = () => {
        // Only restart if we are still the active recognition instance
        if (recognitionRef.current !== rec) return;
        setTimeout(() => {
          if (recognitionRef.current !== rec) return;
          try {
            const next = makeRecognition(); // fresh instance — correct scope for Edge
            next.start();
            recognitionRef.current = next;
          } catch { stopKeepalive(); setIsListening(false); }
        }, 150);
      };

      return rec;
    };

    try {
      const recognition = makeRecognition();
      recognition.start();
      recognitionRef.current = recognition;
      startKeepalive(() => recognitionRef.current);
    } catch (err) { stopKeepalive(); setIsListening(false); setMicError('Could not start microphone: ' + err.message); }
  };

  const stopListening = () => { stopKeepalive(); const rec = recognitionRef.current; recognitionRef.current = null; try { rec?.stop(); } catch {} setIsListening(false); };
  useEffect(() => () => { stopKeepalive(); recognitionRef.current?.stop(); }, []);

  const inp = { width:'100%',padding:'9px 12px',border:'1px solid '+(dm?'#334155':'#dde3ed'),borderRadius:8,fontSize:14,boxSizing:'border-box',color:dm?'#e2e8f0':'#1e293b',outline:'none',background:dm?'#0f172a':'white' };
  const lbl = { fontSize:11,fontWeight:600,color:dm?'#94a3b8':'#64748b',textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:5 };

  const colHdr = (gradient, icon, title, extra) => (
    <div style={{ background:gradient,padding:'15px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10 }}>
      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
        <span style={{ fontSize:18,filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>{icon}</span>
        <span style={{ color:'white',fontWeight:800,fontSize:13,textTransform:'uppercase',letterSpacing:'0.14em',textShadow:'0 1px 3px rgba(0,0,0,0.2)' }}>{title}</span>
      </div>
      {extra || null}
    </div>
  );

  // Auto-save userPrefs — only when logged in, and only when prefs are non-default
  // (prevents sign-out state reset from overwriting stored prefs)
  const prefsInitialized = useRef(false);
  useEffect(() => {
    if (!authUser?.id) { prefsInitialized.current = false; return; }
    // Skip the first fire right after login (that's the restore, not a user change)
    if (!prefsInitialized.current) { prefsInitialized.current = true; return; }
    saveUserPrefs(authUser.id, userPrefs);
  }, [userPrefs, authUser?.id]);

  // Close avatar popup on outside click — uses ref to check if click is outside
  const avatarPopupRef = useRef(null);
  useEffect(() => {
    if (!showAvatarPopup) return;
    const handleMouseDown = (e) => {
      if (avatarPopupRef.current && !avatarPopupRef.current.contains(e.target)) {
        setShowAvatarPopup(false);
      }
    };
    // Use mousedown so it fires before focus/blur on inputs
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showAvatarPopup]);

  // ── Periodic session token check every 5 minutes ──────────────────────────
  useEffect(() => {
    if (!authUser || ADMIN_EMAILS.includes(authUser.email?.toLowerCase())) return;
    const check = async () => {
      const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
      if (!storedToken) return;
      const result = await verifySessionToken(authUser.id, storedToken, authUser.access_token);
      if (result === 'invalid') {
        if (sessionCheckRef.current) { clearInterval(sessionCheckRef.current); sessionCheckRef.current = null; }
        try { localStorage.removeItem('msk_session'); localStorage.removeItem(SESSION_TOKEN_KEY); } catch {}
        setAuthUser(null);
        setApprovalStatus(null);
        setSessionKickedOut(true);
      }
    };
    sessionCheckRef.current = setInterval(check, 5 * 60 * 1000); // every 5 min
    return () => { if (sessionCheckRef.current) clearInterval(sessionCheckRef.current); };
  }, [authUser]);

  // ── AUTH GATE ── after all hooks ───────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight:'100vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ color:'rgba(255,255,255,0.4)',fontSize:14 }}>⏳ Loading…</div>
    </div>
  );
  // ── Session kicked out gate ────────────────────────────────────────────────
  if (sessionKickedOut) return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background:'#0f172a', border:'1px solid rgba(245,101,101,0.3)', borderRadius:16, padding:'40px 36px', maxWidth:420, textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
        <div style={{ color:'#f87171', fontSize:18, fontWeight:800, marginBottom:10 }}>Signed Out</div>
        <div style={{ color:'#94a3b8', fontSize:14, lineHeight:1.7, marginBottom:28 }}>
          Your account was signed in on another device.<br/>
          Each account can only be active on one device at a time.
        </div>
        <button onClick={() => setSessionKickedOut(false)}
          style={{ padding:'12px 32px', background:'linear-gradient(135deg,rgba(99,179,237,0.2),rgba(99,179,237,0.08))', border:'1px solid rgba(99,179,237,0.35)', borderRadius:10, color:'#90cdf4', fontSize:14, fontWeight:700, cursor:'pointer' }}>
          Sign In Again
        </button>
      </div>
    </div>
  );
  if (!authUser) return <LoginPage onLogin={handleLogin} />;
  // Approval gate — show while checking or if not yet approved
  if (approvalStatus === null) return (
    <div style={{ minHeight:'100vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ color:'rgba(255,255,255,0.4)',fontSize:14 }}>⏳ Checking access…</div>
    </div>
  );
  if (approvalStatus === 'rejected') return <RejectedPage onSignOut={handleSignOut} />;
  if (approvalStatus === false) return <PendingApprovalPage onSignOut={handleSignOut} />;

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(160deg,#0d1b2a 0%,#1a3a5c 45%,#0d1b2a 100%)',fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {showAtlas && <AtlasModal onClose={() => setShowAtlas(false)} />}
      {showDdx && <DdxModal onClose={() => setShowDdx(false)} />}
      {showResearch && <ResearchModal onClose={() => setShowResearch(false)} currentUser={authUser} />}
      {showHub && <MSKHubModal initialTab={hubTab} initialModuleId={hubInitialModuleId} onClose={() => { setShowHub(false); setHubInitialModuleId(null); }} currentUser={authUser} isAdmin={['admin@lucidmsk.com','adamsinger82@gmail.com'].includes(authUser?.email?.toLowerCase())} />}
      {showTemplates && <TemplatesPanel authUser={authUser} generatedReport={generatedReport} selectedBodyPart={selectedBodyPart} modality={modality} onLoad={r => setGeneratedReport(r)} onClose={() => setShowTemplates(false)} dm={darkMode} />}

      {showAdminPanel && ['admin@lucidmsk.com','adamsinger82@gmail.com'].includes(authUser?.email?.toLowerCase()) && (
        <AdminPanel currentUser={authUser} onClose={() => setShowAdminPanel(false)} />
      )}

      {/* ── ToU Modal (accessible from profile settings) ── */}
      {showTouModal && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowTouModal(false); }}>
          <div style={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, width:'100%', maxWidth:720, maxHeight:'82vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
              <span style={{ color:'white', fontWeight:700, fontSize:15 }}>LucidMSK — Terms of Use</span>
              <button onClick={() => setShowTouModal(false)} style={{ background:'none', border:'none', color:'#64748b', fontSize:18, cursor:'pointer', lineHeight:1 }}>✕</button>
            </div>
            <div style={{ overflowY:'auto', padding:'20px 26px', flex:1, color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.75 }}>
              {TOU_TEXT}
            </div>
            <div style={{ padding:'14px 22px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'flex-end', flexShrink:0 }}>
              <button onClick={() => setShowTouModal(false)}
                style={{ padding:'9px 24px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="msk-header" style={{ background:'rgba(255,255,255,0.04)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',position:'relative',zIndex:500 }}>
        {/* Left: LucidMSK logo */}
        <div className="msk-header-logo" style={{ display:'flex',alignItems:'center',gap:10,flexShrink:0 }}>
          <svg width="36" height="36" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
            <defs>
              <filter id="hdr-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <style>{`
                @keyframes lucidNodeGlow {
                  0%,100%{filter:drop-shadow(0 0 4px #5b9ef7) drop-shadow(0 0 8px #90CAF9);opacity:1}
                  50%{filter:drop-shadow(0 0 8px #1976D2) drop-shadow(0 0 16px #42A5F5);opacity:0.7}
                }
                @keyframes lucidLineFade {
                  0%,100%{opacity:0.55} 50%{opacity:0.25}
                }
                .ln1{animation:lucidNodeGlow 2.6s ease-in-out infinite}
                .ln2{animation:lucidNodeGlow 2.6s ease-in-out infinite 0.65s}
                .ln3{animation:lucidNodeGlow 2.6s ease-in-out infinite 1.3s}
                .ll {animation:lucidLineFade  2.6s ease-in-out infinite}
              `}</style>
            </defs>
            <circle cx="36" cy="36" r="33" stroke="#1a3a6b" strokeWidth="1.2"/>
            <rect x="32" y="18" width="8" height="36" rx="4" fill="#5b9ef7" opacity="0.08"/>
            <ellipse cx="36" cy="18" rx="7" ry="5" fill="#5b9ef7" opacity="0.18"/>
            <ellipse cx="36" cy="54" rx="7" ry="5" fill="#5b9ef7" opacity="0.18"/>
            <line x1="33" y1="22" x2="33" y2="50" stroke="#5b9ef7" strokeWidth="1.5" opacity="0.35"/>
            <line x1="39" y1="22" x2="39" y2="50" stroke="#5b9ef7" strokeWidth="1.5" opacity="0.35"/>
            <line x1="36" y1="14" x2="20" y2="28" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="36" y1="14" x2="52" y2="28" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="20" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <line x1="52" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <line x1="20" y1="28" x2="16" y2="44" stroke="#4a90d9" strokeWidth="0.8" className="ll"/>
            <line x1="52" y1="28" x2="56" y2="44" stroke="#4a90d9" strokeWidth="0.8" className="ll"/>
            <line x1="36" y1="36" x2="26" y2="44" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="36" y1="36" x2="46" y2="44" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="16" y1="44" x2="36" y2="58" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="56" y1="44" x2="36" y2="58" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="26" y1="44" x2="36" y2="58" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="46" y1="44" x2="36" y2="58" stroke="#7ab8f5" strokeWidth="0.8"/>
            <circle cx="36" cy="14" r="3.2" fill="#5b9ef7" filter="url(#hdr-glow)" className="ln1"/>
            <circle cx="20" cy="28" r="2.5" fill="#4a90d9" filter="url(#hdr-glow)" className="ln2"/>
            <circle cx="52" cy="28" r="2.5" fill="#4a90d9" filter="url(#hdr-glow)" className="ln2"/>
            <circle cx="16" cy="44" r="2.5" fill="#4a90d9" filter="url(#hdr-glow)" className="ln3"/>
            <circle cx="56" cy="44" r="2.5" fill="#4a90d9" filter="url(#hdr-glow)" className="ln3"/>
            <circle cx="26" cy="44" r="2"   fill="#7ab8f5" filter="url(#hdr-glow)" className="ln2"/>
            <circle cx="46" cy="44" r="2"   fill="#7ab8f5" filter="url(#hdr-glow)" className="ln2"/>
            <circle cx="36" cy="58" r="3.2" fill="#5b9ef7" filter="url(#hdr-glow)" className="ln1"/>
            <circle cx="36" cy="36" r="3.8" fill="#90caf9" filter="url(#hdr-glow)" className="ln3"/>
          </svg>
          <span style={{ color:'#e0eaff', fontWeight:700, fontSize:22, letterSpacing:'2px', fontFamily:'Rajdhani, sans-serif', lineHeight:1 }}>
            Lucid<span style={{ color:'#5b9ef7' }}>MSK</span>
          </span>
        </div>

        {/* Center: MRI/CT toggle + tool buttons */}
        <div className="msk-header-center" style={{ display:'flex',alignItems:'center',justifyContent:'space-evenly',gap:16,flex:1,margin:'0 20px' }}>
          {/* MRI / CT / Rheum toggle */}
          <div style={{ display:'flex',alignItems:'center',background:'rgba(255,255,255,0.08)',borderRadius:10,padding:3,gap:2 }}>
            {[
              {id:'MRI', label:'MRI', active:'linear-gradient(135deg,#1d4ed8,#4f46e5)'},
              {id:'CT',  label:'CT',  active:'linear-gradient(135deg,#0e7490,#0891b2)'},
              {id:'Rheum',label:'Rheum', active:'linear-gradient(135deg,#7c2d92,#a855f7)'},
            ].map(({id,label,active}) => (
              <button key={id} onClick={() => setModality(id)}
                style={{ padding:'6px 18px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:700,letterSpacing:'0.06em',transition:'all 0.2s',
                  background:modality===id?active:'transparent',
                  color:modality===id?'white':'rgba(255,255,255,0.45)',
                  boxShadow:modality===id?'0 2px 8px rgba(0,0,0,0.25)':'none' }}>
                {label}
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

          {/* MSK Hub dropdown */}
          <MSKHubDropdown
            onOpenResearch={() => { setHubTab('research'); setShowHub(true); }}
            onOpenCme={() => { setHubTab('cme'); setShowHub(true); }}
            onOpenJobs={() => { setHubTab('jobs'); setShowHub(true); }}
          />

          {/* DDx button */}
          <button onClick={() => setShowDdx(true)}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(124,58,237,0.5)',background:'rgba(124,58,237,0.15)',color:'#c4b5fd',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)' }}>
            <span>🔬</span> MSK Lesion DDx
          </button>
        </div>

        {/* Mobile: hamburger */}
        <button className="msk-hamburger" onClick={() => setMobileDrawer(d => !d)}
          style={{ display:'none',alignItems:'center',justifyContent:'center',width:38,height:38,borderRadius:9,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',cursor:'pointer',flexShrink:0,marginLeft:'auto' }}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <rect y="0" width="18" height="2" rx="1" fill="rgba(255,255,255,0.8)"/>
            <rect y="6" width="18" height="2" rx="1" fill="rgba(255,255,255,0.8)"/>
            <rect y="12" width="18" height="2" rx="1" fill="rgba(255,255,255,0.8)"/>
          </svg>
        </button>

        {/* Right: avatar button + sign out */}
        <div className="msk-header-right" style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0,position:'relative' }}>

          {/* Avatar button — click to open prefs popup */}
          <button onClick={() => setShowAvatarPopup(p => !p)} title="Profile & Avatar"
            style={{ width:36,height:36,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.2)',background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,transition:'all 0.15s',boxShadow:showAvatarPopup?'0 0 0 3px rgba(99,102,241,0.4)':'none' }}>
            {userPrefs.avatarMode === 'icon'
              ? <span style={{ fontSize:18,lineHeight:1 }}>{getAvatarIcon(userPrefs.avatarChoice)}</span>
              : <span style={{ fontSize:12,fontWeight:800,color:'white',letterSpacing:'-0.02em' }}>{getInitials(userPrefs.firstName, userPrefs.lastName, authUser?.email)}</span>
            }
          </button>

          {/* Admin button — only for admin users */}
          {['admin@lucidmsk.com','adamsinger82@gmail.com'].includes(authUser?.email?.toLowerCase()) && (
            <button onClick={() => setShowAdminPanel(true)}
              style={{ padding:'7px 13px',borderRadius:8,border:'1px solid rgba(148,163,255,0.35)',background:'rgba(148,163,255,0.1)',color:'rgba(148,163,255,0.9)',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap' }}>
              🛡️ Admin
            </button>
          )}

          {/* Sign Out */}
          <button onClick={handleSignOut}
            style={{ padding:'7px 13px',borderRadius:8,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap' }}>
            Sign Out
          </button>

          {/* Avatar preference popup */}
          {showAvatarPopup && (
            <div ref={avatarPopupRef}
              style={{ position:'absolute',top:48,right:0,zIndex:500,background:'#1e293b',border:'1px solid rgba(255,255,255,0.12)',borderRadius:14,padding:18,minWidth:280,boxShadow:'0 16px 48px rgba(0,0,0,0.5)' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                <span style={{ color:'white',fontWeight:700,fontSize:13 }}>Profile Settings</span>
                <button onClick={() => setShowAvatarPopup(false)} style={{ background:'none',border:'none',color:'#64748b',fontSize:16,cursor:'pointer',padding:'0 4px' }}>✕</button>
              </div>
              <p style={{ color:'#64748b',fontSize:11,margin:'0 0 12px' }}>{authUser?.email}</p>

              {/* Name fields */}
              <div style={{ display:'flex',gap:8,marginBottom:12 }}>
                <input value={userPrefs.firstName||''} onChange={e=>setUserPrefs(p=>({...p,firstName:e.target.value}))}
                  placeholder="First name"
                  style={{ flex:1,padding:'7px 10px',borderRadius:7,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:12,outline:'none' }} />
                <input value={userPrefs.lastName||''} onChange={e=>setUserPrefs(p=>({...p,lastName:e.target.value}))}
                  placeholder="Last name"
                  style={{ flex:1,padding:'7px 10px',borderRadius:7,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:12,outline:'none' }} />
              </div>

              {/* Style toggle */}
              <p style={{ color:'rgba(255,255,255,0.5)',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',margin:'0 0 8px' }}>Display Style</p>
              <div style={{ display:'flex',gap:8,marginBottom:14 }}>
                <button onClick={() => setUserPrefs(p=>({...p,avatarMode:'initials'}))}
                  style={{ flex:1,padding:'7px',borderRadius:8,border:'1px solid',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                    borderColor:userPrefs.avatarMode==='initials'?'#4f46e5':'rgba(255,255,255,0.1)',
                    background:userPrefs.avatarMode==='initials'?'rgba(79,70,229,0.2)':'rgba(255,255,255,0.04)',
                    color:userPrefs.avatarMode==='initials'?'#a5b4fc':'rgba(255,255,255,0.4)' }}>
                  Initials
                </button>
                <button onClick={() => setUserPrefs(p=>({...p,avatarMode:'icon'}))}
                  style={{ flex:1,padding:'7px',borderRadius:8,border:'1px solid',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                    borderColor:userPrefs.avatarMode==='icon'?'#4f46e5':'rgba(255,255,255,0.1)',
                    background:userPrefs.avatarMode==='icon'?'rgba(79,70,229,0.2)':'rgba(255,255,255,0.04)',
                    color:userPrefs.avatarMode==='icon'?'#a5b4fc':'rgba(255,255,255,0.4)' }}>
                  Icon
                </button>
              </div>

              {/* Avatar icon grid */}
              {userPrefs.avatarMode === 'icon' && (
                <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:14 }}>
                  {AVATAR_OPTIONS.map(av => (
                    <button key={av.id} onClick={() => setUserPrefs(p=>({...p,avatarChoice:av.id}))}
                      style={{ width:40,height:40,borderRadius:'50%',border:'2px solid',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.12s',
                        borderColor:userPrefs.avatarChoice===av.id?'#4f46e5':'rgba(255,255,255,0.1)',
                        background:userPrefs.avatarChoice===av.id?'rgba(79,70,229,0.25)':'rgba(255,255,255,0.04)' }}>
                      {av.icon}
                    </button>
                  ))}
                </div>
              )}

              {/* Terms of Use link */}
              <button
                onClick={() => setShowTouModal(true)}
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid rgba(148,163,255,0.25)', background:'rgba(148,163,255,0.06)', color:'rgba(148,163,255,0.8)', fontSize:12, fontWeight:600, cursor:'pointer', textAlign:'left', marginBottom:10 }}>
                📋 View Terms of Use
              </button>

              {/* Preview + Save */}
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={{ width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  {userPrefs.avatarMode==='icon'
                    ? <span style={{ fontSize:20 }}>{getAvatarIcon(userPrefs.avatarChoice)}</span>
                    : <span style={{ fontSize:13,fontWeight:800,color:'white' }}>{getInitials(userPrefs.firstName,userPrefs.lastName,authUser?.email)}</span>
                  }
                </div>
                <button onClick={() => { setShowAvatarPopup(false); }}
                  style={{ flex:1,padding:'9px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#2563eb,#4f46e5)',color:'white',fontWeight:700,fontSize:13,cursor:'pointer' }}>
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE DRAWER (hidden on desktop via CSS) ── */}
      {mobileDrawer && (
        <div className="msk-drawer" style={{ display:'none',flexDirection:'column',background:'#0d1b2a',borderBottom:'1px solid rgba(255,255,255,0.1)',padding:'12px 14px',gap:8,zIndex:200 }}>
          {/* Modality toggle */}
          <div style={{ display:'flex',alignItems:'center',background:'rgba(255,255,255,0.08)',borderRadius:10,padding:3,gap:2 }}>
            {[
              {id:'MRI', label:'MRI', active:'linear-gradient(135deg,#1d4ed8,#4f46e5)'},
              {id:'CT',  label:'CT',  active:'linear-gradient(135deg,#0e7490,#0891b2)'},
              {id:'Rheum',label:'Rheum', active:'linear-gradient(135deg,#7c2d92,#a855f7)'},
            ].map(({id,label,active}) => (
              <button key={id} onClick={() => { setModality(id); setMobileDrawer(false); }}
                style={{ flex:1,padding:'10px 8px',borderRadius:8,border:'none',cursor:'pointer',fontSize:14,fontWeight:700,letterSpacing:'0.06em',transition:'all 0.2s',
                  background:modality===id?active:'transparent',
                  color:modality===id?'white':'rgba(255,255,255,0.45)',
                  boxShadow:modality===id?'0 2px 8px rgba(0,0,0,0.25)':'none' }}>
                {label}
              </button>
            ))}
          </div>
          {/* Tool buttons */}
          {[
            { label:'🫁 MRI Anatomy Atlas', onClick:() => { setShowAtlas(true); setMobileDrawer(false); }, color:'rgba(255,255,255,0.08)', border:'rgba(255,255,255,0.2)', textColor:'white' },
            { label:'📰 Latest MSK Research', onClick:() => { setHubTab('research'); setShowHub(true); setMobileDrawer(false); }, color:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.5)', textColor:'#6ee7b7' },
            { label:'💼 MSK Jobs Board', onClick:() => { setHubTab('jobs'); setShowHub(true); setMobileDrawer(false); }, color:'rgba(99,179,237,0.12)', border:'rgba(99,179,237,0.4)', textColor:'#90cdf4' },
            { label:'🔬 MSK Lesion DDx', onClick:() => { setShowDdx(true); setMobileDrawer(false); }, color:'rgba(124,58,237,0.15)', border:'rgba(124,58,237,0.5)', textColor:'#c4b5fd' },
            { label:dm?'☀️ Light Mode':'🌙 Dark Mode', onClick:() => { setDarkMode(d=>!d); setMobileDrawer(false); }, color:'rgba(255,255,255,0.08)', border:'rgba(255,255,255,0.2)', textColor:'white' },
          ].map((btn,i) => (
            <button key={i} onClick={btn.onClick}
              style={{ width:'100%',padding:'12px 14px',borderRadius:10,border:`1px solid ${btn.border}`,background:btn.color,color:btn.textColor,fontSize:14,fontWeight:700,cursor:'pointer',textAlign:'left',letterSpacing:'0.03em' }}>
              {btn.label}
            </button>
          ))}
          <button onClick={() => { handleSignOut(); setMobileDrawer(false); }}
            style={{ width:'100%',padding:'12px 14px',borderRadius:10,border:'1px solid rgba(255,100,100,0.3)',background:'rgba(239,68,68,0.08)',color:'#fca5a5',fontSize:14,fontWeight:700,cursor:'pointer',textAlign:'left' }}>
            ← Sign Out
          </button>
        </div>
      )}

      {/* ── MOBILE TAB BAR (hidden on desktop via CSS) ── */}
      <div className="msk-tab-bar" style={{ display:'none',position:'sticky',top:0,zIndex:100,background:'rgba(13,27,42,0.97)',backdropFilter:'blur(8px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'6px 12px',gap:6 }}>
        {[
          { label:'📝 Dictation', icon:'📝' },
          { label:'📄 Report',    icon:'📄' },
          { label:'📐 Reference', icon:'📐' },
        ].map((t,i) => (
          <button key={i} onClick={() => setMobileTab(i)}
            style={{ flex:1,padding:'10px 4px',borderRadius:9,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,transition:'all 0.2s',
              background: mobileTab===i
                ? (i===0 ? (isRheum?'linear-gradient(135deg,#7c2d92,#a855f7)':isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#1d4ed8,#4f46e5)') : i===1 ? 'linear-gradient(135deg,#5b21b6,#7c3aed)' : (isRheum?'linear-gradient(135deg,#7c2d92,#a855f7)':isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#1d4ed8,#4f46e5)'))
                : 'rgba(255,255,255,0.05)',
              color: mobileTab===i ? 'white' : 'rgba(255,255,255,0.4)',
              boxShadow: mobileTab===i ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── THREE COLUMN GRID ── */}
      <div className="msk-grid">

        {/* Col 1 — Dictation */}
        <div className={`msk-col${mobileTab===0?' mobile-active':''}`} style={{ background:dm?'#1e293b':'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr(isRheum?'linear-gradient(135deg,#7c2d92,#a855f7)':isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#1d4ed8,#2563eb)', isRheum?'🩻':isCT?'🔬':'📝', isRheum?'X-Ray Dictation (Rheum)':isCT?'CT Dictation Input':'MRI Dictation Input')}
          <div style={{ padding:16,display:'flex',flexDirection:'column',gap:12,flex:1 }}>
            <div style={{ display:'flex',gap:8 }}>
              {isRheum ? (<>
                <div style={{ flex:2 }}><label style={lbl}>Joint / Region</label>
                  <select style={inp} value={rheumJoint} onChange={e => { setRheumJoint(e.target.value); setRheumChecks({}); }}>
                    {[['hand','Hand'],['wrist','Wrist'],['elbow','Elbow'],['shoulder','Shoulder'],['hip','Hip'],['knee','Knee'],['foot','Foot'],['si','SI Joints'],['c-spine','Cervical Spine'],['t-spine','Thoracic Spine'],['l-spine','Lumbar Spine']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div style={{ flex:1 }}><label style={lbl}>Laterality</label>
                  <select style={inp} value={rheumLaterality} onChange={e => setRheumLaterality(e.target.value)}>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="bilateral">Bilateral</option>
                  </select>
                </div>
                <div style={{ flex:1 }}><label style={lbl}>Views</label>
                  <select style={inp} value={rheumViews} onChange={e => setRheumViews(e.target.value)}>
                    <option value="1">1 view</option>
                    <option value="2">2 views</option>
                    <option value="3">3 views</option>
                    <option value="4">4 views</option>
                    <option value="4+">4+ views</option>
                  </select>
                </div>
              </>) : (<>
                <div style={{ flex:2 }}><label style={lbl}>Body Part</label>
                  <select style={inp} value={selectedBodyPart} onChange={e => { setSelectedBodyPart(e.target.value); resetIncidentals(); resetArthroplasty(); }}>
                    {(isCT ? BODY_PARTS_CT : BODY_PARTS).map(b => {
                      const LABELS = {'femur/thigh':'Femur / Thigh','tibia/fibula':'Tibia / Fibula','humerus':'Humerus','forearm':'Forearm','fingers':'Fingers'};
                      const label = LABELS[b] || (b.charAt(0).toUpperCase()+b.slice(1));
                      return <option key={b} value={b}>{label}</option>;
                    })}
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
              </>)}
            </div>
            {!isRheum && <div><label style={lbl}>Contrast</label>
              <select style={inp} value={contrast} onChange={e => setContrast(e.target.value)}>
                <option value="without">Without IV contrast</option>
                <option value="with">With IV contrast</option>
                <option value="with and without">With and without IV contrast</option>
              </select>
            </div>}
            {!isRheum && <div style={{ padding:'9px 12px',background:dm?(isCT?'#0c2d36':'#1e1b4b'):(isCT?'linear-gradient(135deg,#ecfeff,#f0f9ff)':'linear-gradient(135deg,#eff6ff,#f0f9ff)'),borderRadius:8,border:dm?'1px solid '+(isCT?'#164e63':'#312e81'):(isCT?'1px solid #a5f3fc':'1px solid #bfdbfe'),fontSize:12,color:isCT?'#22d3ee':'#818cf8',fontStyle:'italic',lineHeight:1.6 }}>
              {technique}
            </div>}
            {isCT && (
              <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'7px 10px',borderRadius:7,border:'1px solid '+(includeDoseOpt?(dm?'#164e63':'#a5f3fc'):(dm?'#334155':'#e2e8f0')),background:includeDoseOpt?(dm?'#0c2d36':'#ecfeff'):(dm?'#0f172a':'#f8fafc'),transition:'all 0.15s' }}>
                <input type="checkbox" checked={includeDoseOpt} onChange={e=>setIncludeDoseOpt(e.target.checked)} style={{ width:14,height:14,accentColor:'#0891b2',cursor:'pointer' }}/>
                <span style={{ fontSize:11,fontWeight:600,color:includeDoseOpt?(dm?'#22d3ee':'#0e7490'):(dm?'#64748b':'#64748b') }}>Include dose optimization sentence</span>
              </label>
            )}
            {/* ── Arthroplasty checkbox (MRI + CT, shoulder/hip/knee) ── */}
            {!isRheum && ARTHROPLASTY_JOINTS.includes(selectedBodyPart) && (
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'7px 10px',borderRadius:7,border:'1px solid '+(arthroplastyEnabled?(dm?'#0891b2':'#a5f3fc'):(dm?'#334155':'#e2e8f0')),background:arthroplastyEnabled?(dm?'#0c2d36':'#ecfeff'):(dm?'#0f172a':'#f8fafc'),transition:'all 0.15s' }}>
                  <input type="checkbox" checked={arthroplastyEnabled} onChange={e=>{ setArthroplastyEnabled(e.target.checked); if(!e.target.checked){ setArthroplastyType(''); setArthroplastyChecklist({}); setArthroplastyGrading(''); }}} style={{ width:14,height:14,accentColor:'#0891b2',cursor:'pointer' }}/>
                  <span style={{ fontSize:11,fontWeight:700,color:arthroplastyEnabled?(dm?'#22d3ee':'#0e7490'):(dm?'#64748b':'#64748b'),letterSpacing:'0.02em' }}>🔩 Arthroplasty</span>
                </label>
                {arthroplastyEnabled && ARTHROPLASTY_DATA[selectedBodyPart]?.types.length > 1 && (
                  <div style={{ padding:'8px 10px',background:dm?'rgba(8,145,178,0.1)':'#f0fdfe',border:'1px solid '+(dm?'#164e63':'#a5f3fc'),borderRadius:7,display:'flex',flexDirection:'column',gap:5 }}>
                    <div style={{ fontSize:10,fontWeight:700,color:dm?'#64748b':'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2 }}>Implant Type</div>
                    {ARTHROPLASTY_DATA[selectedBodyPart].types.map(t => (
                      <label key={t.id} style={{ display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:12,color:arthroplastyType===t.id?(dm?'#22d3ee':'#0891b2'):(dm?'#94a3b8':'#475569'),fontWeight:arthroplastyType===t.id?700:400 }}>
                        <input type="checkbox" checked={arthroplastyType===t.id} onChange={()=>{ setArthroplastyType(arthroplastyType===t.id?'':t.id); setArthroplastyChecklist({}); setArthroplastyGrading(''); }} style={{ width:13,height:13,accentColor:'#0891b2',cursor:'pointer' }}/>
                        {t.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                value={isRheum ? rheumFreeText : dictationText} onChange={e => { if (isRheum) { setRheumFreeText(e.target.value); } else { setDictationText(e.target.value); finalTranscriptPersistRef.current = e.target.value; } }} placeholder={`Type or dictate ${isRheum?'X-ray':isCT?'CT':'MRI'} findings here…`}
                spellCheck={false} autoCorrect="off" autoCapitalize="off" />
            </div>
            {micError && <div style={{ fontSize:11,color:'#dc2626',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:7,padding:'7px 10px',lineHeight:1.5 }}>{micError}</div>}
            <button onClick={isListening ? stopListening : toggleListening}
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:10,borderRadius:9,border:'1.5px solid '+(isListening?'#fca5a5':(dm?'#334155':'#dde3ed')),background:isListening?'#fef2f2':(dm?'#0f172a':'#f8fafc'),fontSize:14,fontWeight:600,cursor:'pointer',color:isListening?'#dc2626':(dm?'#94a3b8':'#475569'),transition:'all 0.15s' }}>
              <span style={{ width:8,height:8,borderRadius:'50%',background:isListening?'#ef4444':'#94a3b8',boxShadow:isListening?'0 0 8px #ef4444':'none',flexShrink:0,transition:'all 0.3s' }} />
              {isListening ? '⏹ Stop Recording' : '🎤 Start Dictation'}
            </button>
            <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'8px 12px',borderRadius:8,border:'1px solid '+(layPersonSummary?(dm?'#1d4ed8':'#bfdbfe'):(dm?'#334155':'#e2e8f0')),background:layPersonSummary?(dm?'#1e3a5f':'#eff6ff'):(dm?'#0f172a':'#f8fafc'),transition:'all 0.15s' }}>
              <input type="checkbox" checked={layPersonSummary} onChange={e=>setLayPersonSummary(e.target.checked)} style={{ width:15,height:15,accentColor:'#2563eb',cursor:'pointer' }}/>
              <span style={{ fontSize:12,fontWeight:600,color:layPersonSummary?(dm?'#93c5fd':'#1d4ed8'):(dm?'#64748b':'#64748b') }}>🧑‍🏫 Add "Understanding Your Results" patient summary</span>
            </label>
            {!isRheum && (
              <div style={{ padding:'8px 12px',borderRadius:8,border:'1px solid '+(massMode!=='auto'?(dm?'#7c2d12':'#fed7aa'):(dm?'#334155':'#e2e8f0')),background:massMode!=='auto'?(dm?'#3b0f02':'#fff7ed'):(dm?'#0f172a':'#f8fafc'),transition:'all 0.15s' }}>
                <div style={{ fontSize:11,fontWeight:600,color:massMode!=='auto'?(dm?'#fb923c':'#c2410c'):(dm?'#64748b':'#94a3b8'),letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:6 }}>🔬 Mass / Tumor Case Type</div>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                  {[
                    { val:'auto', label:'Auto-detect' },
                    { val:'new',  label:'New case' },
                    { val:'followup', label:'Follow-up' },
                    { val:'postresection', label:'Post-resection' },
                  ].map(({ val, label }) => {
                    const active = massMode === val;
                    return (
                      <button key={val} onClick={() => setMassMode(val)}
                        style={{ padding:'4px 10px',borderRadius:6,border:'1px solid '+(active?(dm?'#f97316':'#ea580c'):(dm?'#334155':'#d1d5db')),background:active?(dm?'#7c2d12':'#ffedd5'):'transparent',color:active?(dm?'#fb923c':'#c2410c'):(dm?'#94a3b8':'#6b7280'),fontSize:11,fontWeight:active?700:500,cursor:'pointer',transition:'all 0.12s' }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <button onClick={() => setShowTemplates(true)}
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'8px 12px',borderRadius:9,border:`1.5px solid ${dm?'#334155':'#dde3ed'}`,background:dm?'#0f172a':'#f8fafc',color:dm?'#94a3b8':'#475569',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.15s' }}>
              📂 Templates
            </button>
            {(() => {
              const leftHasText = isRheum ? !!rheumFreeText.trim() : !!dictationText.trim();
              const leftDisabled = isGenerating || isGeneratingRheum || !leftHasText;
              const leftBg = leftDisabled ? (dm?'#1e293b':'#e2e8f0') : isRheum ? 'linear-gradient(135deg,#7c2d92,#a855f7)' : isCT ? 'linear-gradient(135deg,#0e7490,#0891b2)' : 'linear-gradient(135deg,#2563eb,#4f46e5)';
              const leftColor = leftDisabled ? (dm?'#475569':'#94a3b8') : 'white';
              const leftShadow = leftDisabled ? 'none' : isRheum ? '0 4px 16px rgba(168,85,247,0.35)' : '0 4px 16px rgba(37,99,235,0.35)';
              const canReset = !!(leftHasText || generatedReport);
              return (
                <div style={{ display:'flex',gap:8 }}>
                  <button onClick={generateReport} disabled={leftDisabled}
                    style={{ flex:2,padding:'10px 12px',borderRadius:9,border:'none',background:leftBg,color:leftColor,fontSize:13,fontWeight:700,cursor:leftDisabled?'not-allowed':'pointer',boxShadow:leftShadow,letterSpacing:'0.02em' }}>
                    {(isGenerating||isGeneratingRheum) ? '⏳ Generating…' : `✨ Generate ${isRheum?'X-Ray':isCT?'CT':'MRI'} Report`}
                  </button>
                  <button onClick={() => {
                    if (isListening) stopListening();
                    stopKeepalive();
                    finalTranscriptPersistRef.current = '';
                    setDictationText('');
                    setRheumFreeText('');
                    setGeneratedReport('');
                    setIsEditingReport(false);
                  }} disabled={!canReset}
                    title="Clear dictation and report — start next case"
                    style={{ flex:1,padding:'10px 12px',borderRadius:9,border:'1.5px solid '+(canReset?(dm?'#475569':'#cbd5e1'):(dm?'#1e293b':'#e2e8f0')),background:canReset?(dm?'#1e293b':'#f8fafc'):(dm?'#0f172a':'#f1f5f9'),color:canReset?(dm?'#94a3b8':'#64748b'):(dm?'#334155':'#cbd5e1'),fontSize:12,fontWeight:600,cursor:canReset?'pointer':'not-allowed',transition:'all 0.15s',flexShrink:0 }}
                    onMouseEnter={e => { if (canReset) e.currentTarget.style.background = dm?'#dc2626':'#fee2e2'; e.currentTarget.style.color = dm?'#fca5a5':'#dc2626'; e.currentTarget.style.borderColor = dm?'#ef4444':'#fca5a5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = canReset?(dm?'#1e293b':'#f8fafc'):(dm?'#0f172a':'#f1f5f9'); e.currentTarget.style.color = canReset?(dm?'#94a3b8':'#64748b'):(dm?'#334155':'#cbd5e1'); e.currentTarget.style.borderColor = canReset?(dm?'#475569':'#cbd5e1'):(dm?'#1e293b':'#e2e8f0'); }}>
                    Reset Report
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Col 2 — Report */}
        <div className={`msk-col${mobileTab===1?' mobile-active':''}`} style={{ background:dm?'#1e293b':'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr('linear-gradient(135deg,#5b21b6,#7c3aed)', '📄', 'Generated Report',
            generatedReport && !isGenerating ? (
              <button onClick={() => setIsEditingReport(e => !e)}
                style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 11px',borderRadius:7,border:'1px solid rgba(255,255,255,0.35)',background:isEditingReport?'rgba(255,255,255,0.22)':'rgba(255,255,255,0.1)',color:'white',fontSize:11,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s' }}>
                {isEditingReport ? '🔒 Lock' : '✏️ Edit'}
              </button>
            ) : null
          )}
          <div style={{ padding:16,display:'flex',flexDirection:'column',gap:12,flex:1 }}>
            <div className="msk-report-box" style={{ flex:1,padding:isEditingReport?0:'14px 16px',border:'1px solid '+(dm?'#334155':'#e8edf5'),borderRadius:10,overflowY:'auto',minHeight:340,maxHeight:'65vh',background:dm?'#0f172a':(generatedReport?'white':'#f8fafc') }}>
              {isGenerating
                ? <div style={{ display:'flex',flexDirection:'column',gap:10,paddingTop:4 }}>{[55,80,65,90,50,72,60].map((w,i) => <div key={i} style={{ height:9,background:`rgba(37,99,235,${0.06+i*0.02})`,borderRadius:4,width:w+'%' }} />)}</div>
                : generatedReport
                  ? (isEditingReport
                      ? <textarea value={generatedReport} onChange={e => setGeneratedReport(e.target.value)}
                          style={{ width:'100%',height:'100%',minHeight:340,maxHeight:'65vh',padding:'14px 16px',border:'none',borderRadius:10,outline:'none',resize:'vertical',boxSizing:'border-box',background:dm?'#0f172a':'white',color:dm?'#e2e8f0':'#1e293b',fontFamily:"Georgia,'Times New Roman',serif",fontSize:13,lineHeight:1.7 }}
                        />
                      : <div style={{ fontFamily:"Georgia,'Times New Roman',serif" }}>{formatReport(generatedReport, dm ? {
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
                    )
                  : <div style={{ color:'#94a3b8',fontStyle:'italic',fontSize:13,textAlign:'center',paddingTop:40,lineHeight:1.8 }}><div style={{ fontSize:32,marginBottom:10 }}>📋</div>Report will appear here after generation.</div>
              }
            </div>
            <CopyButton generatedReport={generatedReport} dm={dm} />
          </div>
        </div>

        {/* Col 3 — Reference */}
        <div className={`msk-col${mobileTab===2?' mobile-active':''}`} style={{ background:dm?'#1e293b':'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr(
            arthroplastyEnabled && ARTHROPLASTY_JOINTS.includes(selectedBodyPart)
              ? 'linear-gradient(135deg,#0e7490,#0891b2)'
              : isRheum ? 'linear-gradient(135deg,#7c2d92,#a855f7)' : isCT ? 'linear-gradient(135deg,#0e7490,#0891b2)' : 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
            arthroplastyEnabled && ARTHROPLASTY_JOINTS.includes(selectedBodyPart) ? '🔩' : isRheum ? '🩻' : isCT ? '🦴' : '📐',
            arthroplastyEnabled && ARTHROPLASTY_JOINTS.includes(selectedBodyPart)
              ? `${selectedBodyPart.charAt(0).toUpperCase()+selectedBodyPart.slice(1)} Arthroplasty — ${modality} Review`
              : isRheum ? 'Rheum DDx Builder' : isCT ? 'CT Fracture Classification' : 'MRI Grading Reference'
          )}
          <div className="msk-ref-panel" style={{ padding:16,flex:1,overflowY:'auto' }}>
            <CmeBanner
              matches={findCmeMatches(generatedReport, cmeModules, selectedBodyPart)}
              dm={dm}
              onOpenModule={(moduleId) => { setHubTab('cme'); setHubInitialModuleId(moduleId); setShowHub(true); }}
            />
            {isRheum
              ? <RheumDDxPanel
                  rheumJoint={rheumJoint}
                  rheumLaterality={rheumLaterality}
                  rheumViews={rheumViews}
                  rheumChecks={rheumChecks}
                  setRheumChecks={setRheumChecks}
                  onGenerate={generateRheumReport}
                  isGenerating={isGeneratingRheum}
                  dm={dm}
                />
              : arthroplastyEnabled && ARTHROPLASTY_JOINTS.includes(selectedBodyPart) && (arthroplastyType || ARTHROPLASTY_DATA[selectedBodyPart]?.types.length === 1)
                ? <ArthroplastyPanel
                    joint={selectedBodyPart}
                    arthroplastyType={arthroplastyType}
                    arthroplastyChecklist={arthroplastyChecklist}
                    setArthroplastyChecklist={setArthroplastyChecklist}
                    arthroplastyGrading={arthroplastyGrading}
                    setArthroplastyGrading={setArthroplastyGrading}
                    arthroplastyImageTab={arthroplastyImageTab}
                    setArthroplastyImageTab={setArthroplastyImageTab}
                    dm={dm}
                  />
                : arthroplastyEnabled && ARTHROPLASTY_JOINTS.includes(selectedBodyPart) && !arthroplastyType
                  ? <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:10,color:dm?'#475569':'#94a3b8',textAlign:'center',padding:24 }}>
                      <div style={{ fontSize:32 }}>🔩</div>
                      <div style={{ fontSize:13,fontWeight:600,color:dm?'#64748b':'#94a3b8' }}>Select an implant type in the left panel to load the complication checklist and grading systems.</div>
                    </div>
                  : <ReferencePanel selectedBodyPart={selectedBodyPart} modality={modality} spineRegion={spineRegion} darkMode={dm} />
            }
          </div>
        </div>

      </div>

      <style>{`
        .msk-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:16px; box-sizing:border-box; }

        /* ── MOBILE STYLES (≤768px) — desktop completely unaffected ── */
        @media (max-width:768px) {

          /* Grid: single column, no gap */
          .msk-grid { grid-template-columns:1fr !important; gap:0 !important; padding:0 !important; }

          /* Hide all panels by default on mobile; show only active */
          .msk-col { display:none !important; }
          .msk-col.mobile-active { display:flex !important; flex-direction:column; min-height:calc(100vh - 120px); }

          /* Textarea + report box sizing */
          .msk-report-box { min-height:260px !important; max-height:55vh !important; }
          .msk-textarea { min-height:140px !important; font-size:16px !important; }
          .msk-ref-panel { max-height:none !important; overflow-y:visible !important; }

          /* Header: compact single row */
          .msk-header { padding:10px 14px !important; gap:8px !important; flex-wrap:nowrap !important; }
          .msk-header-logo span[style] { font-size:17px !important; }
          .msk-header-center { display:none !important; }
          .msk-header-right { margin-left:auto; }

          /* Hamburger menu (mobile only) */
          .msk-hamburger { display:flex !important; }

          /* Mobile nav drawer */
          .msk-drawer { display:flex !important; }

          /* Mobile tab bar */
          .msk-tab-bar { display:flex !important; }

          /* Touch-friendly select/input sizing */
          select, input[type="text"], input[type="email"], input[type="password"] {
            font-size:16px !important;
            min-height:42px !important;
          }

          /* Larger tap targets for buttons */
          .msk-col button { min-height:44px !important; }
        }

        /* Desktop: hide mobile-only elements */
        .msk-hamburger { display:none; }
        .msk-drawer { display:none; }
        .msk-tab-bar { display:none; }
      `}</style>
    </div>
  );
}