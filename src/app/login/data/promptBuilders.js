'use client';
import { MRI_GRADING_DATA, CT_GRADING_DATA } from './gradingData';
// Legacy JOINT_DATA shim — replace with full import if referenceData.js is available
const JOINT_DATA = {};

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

FACET JOINTS: Facet joint edema, effusion, erosion, synovitis, arthrosis — report under individual LEVELS entries, NOT as a standalone FINDINGS heading.

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
- Incidental finding unrelated to primary pathology (e.g. renal cyst on hip MRI)
- Normal exam → ${normalImpressionText}


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


export {
  BODY_PARTS, BODY_PARTS_CT, BILATERAL,
  ABSENT_STRUCTURES, ANATOMY_MRI, ANATOMY_CT, ANATOMY,
  getAnatomy, getEffectiveJointData, buildGradingContext,
  buildReportHeading, buildPrompt, formatReport, isAbsentStructure
};
