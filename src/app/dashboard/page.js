'use client';
export const dynamic = 'force-dynamic'; // v2026-05-22 03:00
import { useState, useRef, useEffect } from 'react';
import { JOINT_DATA, DIAGRAM_SVGS } from './referenceData';
import CopyButton from './CopyButton';

// ─── MODALITY-AWARE GRADING DATA ─────────────────────────────────────────────
// MRI_GRADING_DATA: shown in right panel when MRI is selected
// CT_GRADING_DATA:  shown in right panel when CT is selected
// EFFECTIVE_JOINT_DATA merges these with imported JOINT_DATA (legacy joints)
// and the active modality slice is selected at render time.

const MRI_GRADING_DATA = {
  // ── MRI: Femur / Thigh ──────────────────────────────────────────────────
  'femur/thigh': {
    label: 'Femur / Thigh — MRI',
    measurements: [
      {
        id: 'bamic_grading',
        label: 'BAMIC — Muscle Injury Grade (Hamstring / Quad / Adductor)',
        isGradingScale: true,
        plane: 'Axial + Coronal',
        description: 'British Athletics Muscle Injury Classification (BAMIC). Classifies muscle injuries by anatomic location (muscle belly, myotendinous junction, central/intramuscular tendon) and cross-sectional area (CSA) involvement. Validated for hamstrings; applied to quads and adductors using the same framework. Strong prognostic value for return-to-sport.',
        diagram: null,
        citations: [
          { label: 'Pollock N et al. — BAMIC validation. Br J Sports Med 2016;50(19):1215-1220.', url: 'https://pubmed.ncbi.nlm.nih.gov/27160205/' },
          { label: 'Wangensteen A et al. — BAMIC MRI prognosis. Am J Sports Med 2018;46(10):2353-2363.', url: 'https://pubmed.ncbi.nlm.nih.gov/29986149/' },
        ],
        normalValues: [
          { label: 'Grade 0', value: 'Signal change only — peritendinous/minimal intramuscular edema; NO architectural disruption' },
          { label: 'Grade 1a', value: 'Peripheral MTJ injury within the muscle belly; <10% CSA involved' },
          { label: 'Grade 1b', value: 'Peripheral MTJ injury within the muscle belly; ≥10% CSA involved' },
          { label: 'Grade 2a', value: 'MTJ injury — myotendinous unit involved; <10% CSA' },
          { label: 'Grade 2b', value: 'MTJ injury — myotendinous unit involved; ≥10% CSA' },
          { label: 'Grade 3a', value: 'Central (intramuscular) tendon injury; <10% CSA involved' },
          { label: 'Grade 3b', value: 'Central (intramuscular) tendon injury; ≥10% CSA involved' },
          { label: 'Grade 4', value: 'Complete/near-complete tear — proximal avulsion or full central tendon disruption with retraction' },
          { label: 'Modifier (c)', value: 'Isolated central tendon only (no peripheral muscle edema) — e.g. Grade 3a(c)' },
          { label: 'Key landmarks', value: 'MTJ = myotendinous junction; CSA = cross-sectional area of injured muscle at widest axial slice' },
        ],
      },
    ],
  },
  // ── MRI: Tibia / Fibula ─────────────────────────────────────────────────
  'tibia/fibula': {
    label: 'Tibia / Fibula — MRI',
    measurements: [
      {
        id: 'fredericson_grade',
        label: 'Fredericson Grade — Tibial Stress Reaction / Stress Fracture',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'Fredericson MRI grading for medial tibial stress syndrome and tibial stress injuries. Grades 1–2: periosteal only. Grade 3: adds medullary edema. Grade 4a: low T1 (trabecular fracture). Grade 4b: cortical fracture line (frank stress fracture). Anterior cortex Grade 4b = "dreaded black line" — high risk for complete fracture, orthopedic referral indicated.',
        diagram: null,
        citations: [
          { label: 'Fredericson M et al. — MRI tibial stress grading. Am J Sports Med 1995;23(4):472-481.', url: 'https://pubmed.ncbi.nlm.nih.gov/7573660/' },
          { label: 'Kiuru MJ et al. — MRI stress fracture classification. Skeletal Radiol 2004;33(4):216-221.', url: 'https://pubmed.ncbi.nlm.nih.gov/14730395/' },
        ],
        normalValues: [
          { label: 'Grade 1', value: 'Mild periosteal edema (STIR only); T1 normal; no medullary signal change' },
          { label: 'Grade 2', value: 'Moderate-severe periosteal edema (STIR); T1 normal; no medullary involvement' },
          { label: 'Grade 3', value: 'Periosteal + medullary (marrow) edema on STIR; T1 still normal — no trabecular fracture' },
          { label: 'Grade 4a', value: 'Periosteal + marrow edema on STIR AND low T1 signal — trabecular microfracture' },
          { label: 'Grade 4b', value: 'All of 4a PLUS visible cortical/transcortical fracture line — frank stress fracture' },
          { label: '⚠ High-risk: Anterior cortex', value: '"Dreaded black line" — Grade 4b anterior tibia; orthopedic consultation required' },
          { label: 'Typical MTSS location', value: 'Posteromedial cortex, middle or distal third of tibia' },
        ],
      },
    ],
  },
  // ── MRI: Humerus ────────────────────────────────────────────────────────
  humerus: {
    label: 'Humerus — MRI',
    measurements: [
      {
        id: 'humerus_mri_avascular',
        label: 'Cruess Classification — Humeral Head AVN',
        isGradingScale: true,
        plane: 'Coronal',
        description: 'Cruess (modified Ficat) staging of avascular necrosis of the humeral head on MRI. Based on morphologic changes from early signal abnormality to collapse and secondary glenohumeral arthritis.',
        diagram: null,
        citations: [
          { label: 'Cruess RL. — Steroid-induced osteonecrosis. J R Coll Surg Edinb 1981;26(2):69-77.', url: 'https://pubmed.ncbi.nlm.nih.gov/7230104/' },
        ],
        normalValues: [
          { label: 'Stage I', value: 'Normal radiograph/morphology; MRI: abnormal marrow signal only (low T1, high STIR)' },
          { label: 'Stage II', value: 'Sclerosis/cysts/osteopenia on CT/X-ray; MRI: "double line sign" — inner high T2 + outer low T1/T2 rim; no collapse' },
          { label: 'Stage III', value: 'Subchondral fracture ("crescent sign") without humeral head collapse' },
          { label: 'Stage IV', value: 'Flattening/collapse of the humeral head; glenohumeral joint space preserved' },
          { label: 'Stage V', value: 'Collapse + secondary glenohumeral joint space narrowing / osteoarthritis' },
        ],
      },
    ],
  },
  // ── MRI: Forearm ────────────────────────────────────────────────────────
  forearm: {
    label: 'Forearm — MRI',
    measurements: [
      {
        id: 'forearm_mri_stress',
        label: 'Forearm Stress Reaction / Compartment Syndrome — MRI Patterns',
        isGradingScale: false,
        plane: 'Axial + Coronal',
        description: 'MRI findings in forearm stress reactions (ulna most common in wheelchair athletes/throwing sports), exertional compartment syndrome (increased T2 in affected compartment post-exercise), and muscle strain patterns. Not a formal numeric grading system — apply BAMIC principles for muscle injuries.',
        diagram: null,
        citations: [
          { label: 'Anderson MW. — MRI of the forearm. Semin Musculoskelet Radiol 2010;14(3):348-358.', url: 'https://pubmed.ncbi.nlm.nih.gov/20539617/' },
        ],
        normalValues: [
          { label: 'Ulnar stress reaction', value: 'Periosteal edema ± medullary edema on STIR; low T1 = Grade 4a equivalent; cortical line = frank fracture' },
          { label: 'Radial stress reaction', value: 'Same pattern; less common; seen in gymnasts and overhead athletes' },
          { label: 'Exertional compartment', value: 'Diffuse T2 elevation in affected compartment (volar > dorsal); best imaged post-exercise' },
          { label: 'Muscle strain (BAMIC)', value: 'Apply BAMIC Grade 0–4 framework for any discrete muscle tear' },
          { label: 'Pronator teres syndrome', value: 'Median nerve compression at pronator teres — increased T2 signal in nerve, denervation edema in FPL/FDP(index)' },
          { label: 'Interosseous membrane tear', value: 'Essex-Lopresti: disruption of central band; increased signal + thickening on coronal sequences' },
        ],
      },
    ],
  },
  // ── MRI: Knee ───────────────────────────────────────────────────────────
  knee: {
    label: 'Knee — MRI',
    measurements: [],  // uses existing JOINT_DATA from referenceData.js
  },
};

const CT_GRADING_DATA = {
  // ── CT: Knee ────────────────────────────────────────────────────────────
  knee: {
    label: 'Knee — CT Fracture Classification',
    measurements: [
      {
        id: 'schatzker_tibial_plateau',
        label: 'Schatzker Classification — Tibial Plateau Fracture',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'Schatzker classification of tibial plateau fractures. Types I–III involve the lateral plateau only. Type IV involves the medial plateau (higher energy, worse prognosis). Types V–VI are bicondylar/complex. Higher Schatzker type = greater articular comminution and axial instability.',
        diagram: null,
        citations: [
          { label: 'Schatzker J et al. — Tibial plateau fractures. Clin Orthop 1979;138:94-104.', url: 'https://pubmed.ncbi.nlm.nih.gov/456045/' },
          { label: 'Zeltser DW & Leopold SS. — Schatzker classification. Clin Orthop 2013;471(3):771-773.', url: 'https://pubmed.ncbi.nlm.nih.gov/23143299/' },
        ],
        normalValues: [
          { label: 'Type I', value: 'Pure lateral plateau split fracture — no depression; young bone; assess for fibular head fracture' },
          { label: 'Type II', value: 'Lateral plateau split + depression (most common); depression >2 mm clinically significant' },
          { label: 'Type III', value: 'Pure lateral plateau depression (no split); osteoporotic bone; lateral meniscus at risk' },
          { label: 'Type IV', value: 'Medial plateau fracture (split or comminuted); higher energy; associated cruciate/vascular injury' },
          { label: 'Type V', value: 'Bicondylar fracture — both plateaus; metaphysis intact to diaphysis' },
          { label: 'Type VI', value: 'Bicondylar + metaphyseal-diaphyseal dissociation; highest energy; severe soft tissue injury' },
          { label: 'Depression threshold', value: '≥2 mm articular depression = surgical threshold in most guidelines' },
        ],
      },
      {
        id: 'patella_fracture',
        label: 'Patella Fracture Classification',
        isGradingScale: true,
        plane: 'Axial + Sagittal',
        description: 'Descriptive classification of patellar fractures by pattern. Treatment determined by displacement (>2 mm articular step-off or >3 mm gap) and extensor mechanism integrity.',
        diagram: null,
        citations: [
          { label: 'Melvin JS & Mehta S. — Patellar fractures. J Am Acad Orthop Surg 2011;19(4):198-207.', url: 'https://pubmed.ncbi.nlm.nih.gov/21464214/' },
        ],
        normalValues: [
          { label: 'Transverse (50–80%)', value: 'Most common; mid-patella; disrupts extensor mechanism if displaced' },
          { label: 'Comminuted/stellate', value: 'High-energy; multiple fragments; variable extensor mechanism involvement' },
          { label: 'Vertical/longitudinal', value: 'Usually does not disrupt extensor mechanism; often treated nonoperatively' },
          { label: 'Osteochondral', value: 'Lateral femoral condyle or medial patellar facet — associated with dislocation' },
          { label: 'Sleeve fracture', value: 'Pediatric: cartilaginous sleeve avulsion from inferior pole; easy to miss on X-ray' },
          { label: 'Surgical threshold', value: '>2 mm articular step-off OR >3 mm fragment gap AND intact extensor mechanism not assured' },
        ],
      },
    ],
  },
  // ── CT: Tibia / Fibula ──────────────────────────────────────────────────
  'tibia/fibula': {
    label: 'Tibia / Fibula — CT Fracture Classification',
    measurements: [
      {
        id: 'schatzker_tibial_plateau',
        label: 'Schatzker Classification — Tibial Plateau Fracture',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'Schatzker classification of tibial plateau fractures (proximal intra-articular). CT is the gold standard for classification and surgical planning. Assess for articular depression, split components, and posterior plateau involvement (often missed on X-ray).',
        diagram: null,
        citations: [
          { label: 'Schatzker J et al. — Tibial plateau fractures. Clin Orthop 1979;138:94-104.', url: 'https://pubmed.ncbi.nlm.nih.gov/456045/' },
        ],
        normalValues: [
          { label: 'Type I', value: 'Pure lateral split — no depression; young bone; rule out fibular head fracture' },
          { label: 'Type II', value: 'Lateral split + depression (most common); measure max depression in mm' },
          { label: 'Type III', value: 'Pure lateral depression (no split); osteoporotic; lateral meniscus interposition risk' },
          { label: 'Type IV', value: 'Medial plateau — higher energy; PCL/vascular injury association' },
          { label: 'Type V', value: 'Bicondylar — metaphysis intact to shaft' },
          { label: 'Type VI', value: 'Bicondylar + metaphyseal-diaphyseal dissociation — highest energy injury' },
          { label: 'Posterior plateau', value: 'Posterolateral/posteromedial fragments: note separately — critical for surgical approach planning' },
        ],
      },
      {
        id: 'ao_ota_proximal_tibia',
        label: 'AO/OTA — Proximal Tibia Extra-articular (41-A)',
        isGradingScale: true,
        plane: 'Coronal + Sagittal',
        description: 'AO/OTA classification for proximal tibial fractures that do NOT involve the articular surface (metaphyseal and submetaphyseal). Segment 41-A. Important to distinguish from plateau fractures.',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA Fracture Classification 2018 Update. J Orthop Trauma 2018;32(Suppl 1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
        ],
        normalValues: [
          { label: '41-A1', value: 'Simple (wedge or oblique) extra-articular proximal tibia — metaphyseal' },
          { label: '41-A2', value: 'Metaphyseal wedge fracture' },
          { label: '41-A3', value: 'Metaphyseal complex/comminuted — no articular involvement' },
          { label: 'Key distinction', value: 'Fracture line must not enter joint; if articular → reclassify as 41-B (partial) or 41-C (complete articular = Schatzker V/VI)' },
          { label: 'Tibial tubercle avulsion', value: 'Ogden classification in skeletally immature: Types I–V based on avulsion extent' },
        ],
      },
      {
        id: 'ao_ota_tibial_shaft',
        label: 'AO/OTA — Tibial Shaft Fracture (42)',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'AO/OTA classification for tibial diaphyseal fractures (segment 42). Determines fixation strategy. Fracture pattern and comminution guide IM nail vs. plate selection.',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA 2018 Update. J Orthop Trauma 2018;32(Suppl 1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
        ],
        normalValues: [
          { label: '42-A (Simple)', value: 'A1: spiral; A2: oblique (≥30°); A3: transverse (<30°)' },
          { label: '42-B (Wedge)', value: 'B1: spiral wedge; B2: bending wedge; B3: fragmented wedge' },
          { label: '42-C (Complex/comminuted)', value: 'C1: spiral complex; C2: segmental; C3: irregular comminution' },
          { label: 'Open fracture (Gustilo)', value: 'Grade I: <1 cm clean wound; II: >1 cm; IIIA: adequate soft tissue; IIIB: periosteal stripping; IIIC: vascular injury requiring repair' },
          { label: 'Compartment syndrome', value: 'Note circumferential soft tissue swelling, fat stranding — clinical correlation essential' },
        ],
      },
      {
        id: 'ao_ota_distal_tibia',
        label: 'AO/OTA — Distal Tibia / Pilon Fracture (43)',
        isGradingScale: true,
        plane: 'Coronal + Axial + Sagittal',
        description: 'AO/OTA classification for distal tibial fractures including pilon (plafond) fractures. Segment 43. The Rüedi-Allgöwer system is also commonly used for pilon fractures and should be noted when applicable.',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA 2018 Update. J Orthop Trauma 2018;32(Suppl 1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
          { label: 'Rüedi TP & Allgöwer M. — Pilon fractures. Clin Orthop 1979;138:105-110.', url: 'https://pubmed.ncbi.nlm.nih.gov/456046/' },
        ],
        normalValues: [
          { label: '43-A (Extra-articular)', value: 'Distal tibia metaphysis — joint surface intact; includes posterior malleolus fractures without articular step-off' },
          { label: '43-B (Partial articular)', value: 'Part of articular surface retains continuity with shaft (e.g., Chaput/Wagstaffe fragments, posterior malleolus with step-off)' },
          { label: '43-C (Complete articular = Pilon)', value: 'No part of articular surface in continuity with shaft; all 3 types have comminution gradations C1–C3' },
          { label: 'Rüedi I', value: 'Pilon: undisplaced cleavage fracture of articular surface' },
          { label: 'Rüedi II', value: 'Pilon: displacement without comminution of articular surface' },
          { label: 'Rüedi III', value: 'Pilon: comminuted articular surface with metaphyseal impaction' },
          { label: 'Key CT report items', value: 'Number of major articular fragments; max articular step-off (mm); fibular fracture level; degree of metaphyseal comminution' },
        ],
      },
      {
        id: 'lauge_hansen_ankle',
        label: 'Lauge-Hansen / Danis-Weber — Ankle Fracture',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'For distal fibular fractures involving the ankle mortise. Danis-Weber classifies by fibular fracture level relative to the syndesmosis. Lauge-Hansen describes the injury mechanism and ligamentous injury sequence.',
        diagram: null,
        citations: [
          { label: 'Lauge-Hansen N. — Fractures of the ankle. Arch Surg 1950;60(5):957-985.', url: 'https://pubmed.ncbi.nlm.nih.gov/15415202/' },
          { label: 'Weber BG. — Die Verletzungen des oberen Sprunggelenkes. 1966.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
        ],
        normalValues: [
          { label: 'Weber A (= SA)', value: 'Fibular fracture BELOW syndesmosis (infrasyndesmal); transverse; syndesmosis intact; ATFL disrupted' },
          { label: 'Weber B (= SER/PA)', value: 'Fibular fracture AT syndesmosis (transyndesmal); oblique/spiral; syndesmosis +/- intact; most common' },
          { label: 'Weber C (= PER/PAB)', value: 'Fibular fracture ABOVE syndesmosis (suprasyndesmal); syndesmosis disrupted; medial injury required for instability' },
          { label: 'Maisonneuve', value: 'Weber C variant: proximal fibular fracture + complete syndesmotic disruption — must image full fibula' },
          { label: 'Bimalleolar equivalent', value: 'Lateral fracture + deltoid rupture (medial clear space widening) — unstable despite no medial fracture' },
          { label: 'Trimalleolar', value: 'Lateral + medial malleolus + posterior malleolus; posterior fragment >25% joint surface = surgical' },
        ],
      },
    ],
  },
  // ── CT: Femur / Thigh ───────────────────────────────────────────────────
  'femur/thigh': {
    label: 'Femur / Thigh — CT Fracture Classification',
    measurements: [
      {
        id: 'ao_ota_proximal_femur',
        label: 'AO/OTA — Proximal Femur Fracture (31)',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'AO/OTA classification for proximal femoral fractures (segment 31). Includes trochanteric and femoral neck fractures. Garden classification remains in common use for femoral neck (intracapsular) fractures.',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA 2018 Update. J Orthop Trauma 2018;32(Suppl 1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
          { label: 'Garden RS. — Low-angle fixation in femoral neck fractures. J Bone Joint Surg Br 1961;43:647-663.', url: 'https://pubmed.ncbi.nlm.nih.gov/14038931/' },
        ],
        normalValues: [
          { label: 'Garden I (incomplete/valgus impacted)', value: 'Incomplete femoral neck fracture; trabeculae angled; NOT displaced — low AVN risk' },
          { label: 'Garden II (complete, non-displaced)', value: 'Complete fracture; normal trabecular alignment; low-moderate AVN risk' },
          { label: 'Garden III (complete, partial displacement)', value: 'Partial displacement; trabecular malalignment; moderate-high AVN risk' },
          { label: 'Garden IV (complete, full displacement)', value: 'Complete displacement; no trabecular continuity; highest AVN risk (~30%)' },
          { label: 'AO/OTA 31-A (trochanteric)', value: 'A1: simple 2-part intertrochanteric; A2: multifragmentary intertrochanteric; A3: reverse oblique/transverse — unstable' },
          { label: 'AO/OTA 31-B (femoral neck)', value: 'B1: subcapital, minimal displacement; B2: transcervical; B3: subcapital, displaced (= Garden III/IV)' },
          { label: 'AO/OTA 31-C (capital/head)', value: 'Femoral head fracture (Pipkin); note associated posterior dislocation' },
        ],
      },
      {
        id: 'pipkin_femoral_head',
        label: 'Pipkin Classification — Femoral Head Fracture',
        isGradingScale: true,
        plane: 'Axial + Coronal',
        description: 'Pipkin classification for femoral head fractures, which typically occur in the setting of posterior hip dislocation. CT is essential for characterizing fragment size, location, and articular involvement.',
        diagram: null,
        citations: [
          { label: 'Pipkin G. — Treatment of grade IV fracture-dislocation of the hip. J Bone Joint Surg Am 1957;39-A(5):1027-1042.', url: 'https://pubmed.ncbi.nlm.nih.gov/13475403/' },
        ],
        normalValues: [
          { label: 'Type I', value: 'Posterior dislocation + femoral head fracture INFERIOR (caudal) to fovea — ligamentum teres intact' },
          { label: 'Type II', value: 'Posterior dislocation + femoral head fracture SUPERIOR (cranial) to fovea — involves weight-bearing surface' },
          { label: 'Type III', value: 'Type I or II + associated femoral neck fracture — surgical emergency' },
          { label: 'Type IV', value: 'Type I or II + associated acetabular fracture (any wall/column component)' },
          { label: 'Key CT items', value: 'Fragment size (% articular surface); foveal location; associated acetabular fracture; intra-articular fragments; femoral neck integrity' },
        ],
      },
      {
        id: 'ao_ota_femoral_shaft',
        label: 'AO/OTA — Femoral Shaft Fracture (32)',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'AO/OTA classification for femoral diaphyseal fractures (segment 32). Most treated with antegrade IM nail. Assess for ipsilateral femoral neck fracture (up to 9% missed on initial X-ray — CT required).',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA 2018 Update. J Orthop Trauma 2018;32(Suppl 1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
        ],
        normalValues: [
          { label: '32-A (Simple)', value: 'A1: spiral; A2: oblique (≥30°); A3: transverse (<30°)' },
          { label: '32-B (Wedge)', value: 'B1: spiral wedge; B2: bending wedge; B3: fragmented wedge — main fragments still in contact' },
          { label: '32-C (Complex)', value: 'C1: spiral complex; C2: segmental; C3: irregular/highly comminuted' },
          { label: '⚠ Ipsilateral neck fracture', value: 'CT scout and proximal cuts: rule out concurrent femoral neck fracture in ALL femoral shaft injuries' },
          { label: 'Periprosthetic (Vancouver)', value: 'If hardware present: Vancouver A (trochanteric), B1/B2/B3 (around stem), C (distal to stem)' },
        ],
      },
    ],
  },
  // ── CT: Humerus ─────────────────────────────────────────────────────────
  humerus: {
    label: 'Humerus — CT Fracture Classification',
    measurements: [
      {
        id: 'neer_proximal_humerus',
        label: 'Neer Classification — Proximal Humerus Fracture',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'Neer classification of proximal humeral fractures. Based on displacement (>1 cm OR >45° angulation) of 4 segments: humeral head articular surface, greater tuberosity, lesser tuberosity, humeral shaft. CT essential for accurate part assignment and surgical planning.',
        diagram: null,
        citations: [
          { label: 'Neer CS 2nd. — Displaced proximal humeral fractures. J Bone Joint Surg Am 1970;52(6):1077-1089.', url: 'https://pubmed.ncbi.nlm.nih.gov/5455339/' },
          { label: 'Carofino BC & Leopold SS. — Neer classification. Clin Orthop 2013;471(1):39-43.', url: 'https://pubmed.ncbi.nlm.nih.gov/23143298/' },
        ],
        normalValues: [
          { label: '1-part (any # of fracture lines)', value: 'No segment displaced >1 cm or angulated >45° — treat as single unit regardless of fracture line count' },
          { label: '2-part — surgical neck', value: 'Shaft displaced relative to head; most common displaced type; varus/valgus angulation' },
          { label: '2-part — greater tuberosity', value: '>1 cm displacement; rotator cuff attached; associated with anterior dislocation' },
          { label: '2-part — lesser tuberosity', value: 'Rare isolated; associated with posterior dislocation; internal rotation mechanism' },
          { label: '2-part — anatomic neck', value: 'Rare; high AVN risk due to disruption of arcuate artery' },
          { label: '3-part', value: '2 segments displaced; 1 tuberosity + shaft; rotator cuff intact on non-displaced tuberosity' },
          { label: '4-part', value: 'All 4 segments displaced; highest AVN risk (13–34%); arthroplasty often preferred in elderly' },
          { label: '4-part valgus-impacted', value: 'Better blood supply preservation; head tilted into valgus; more amenable to ORIF' },
          { label: 'Fracture-dislocation', value: '2-, 3-, or 4-part with concomitant glenohumeral dislocation; note direction (anterior vs. posterior)' },
          { label: 'Head-splitting', value: 'Articular surface fractured in coronal plane; arthroplasty required' },
        ],
      },
      {
        id: 'ao_ota_humeral_shaft',
        label: 'AO/OTA — Humeral Shaft Fracture (12)',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'AO/OTA classification for humeral diaphyseal fractures (segment 12). Radial nerve injury occurs in ~18% of humeral shaft fractures (highest risk: middle-distal third spiral/Holstein-Lewis type).',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA 2018 Update. J Orthop Trauma 2018;32(Suppl1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
        ],
        normalValues: [
          { label: '12-A (Simple)', value: 'A1: spiral; A2: oblique (≥30°); A3: transverse (<30°)' },
          { label: '12-B (Wedge)', value: 'B1: spiral wedge; B2: bending wedge; B3: fragmented wedge' },
          { label: '12-C (Complex)', value: 'C1: spiral complex; C2: segmental; C3: irregular comminution' },
          { label: '⚠ Holstein-Lewis', value: 'Distal-third spiral fracture — radial nerve tethered at lateral intermuscular septum; radial nerve palsy risk' },
          { label: 'Location key', value: 'Proximal third: assess for rotator cuff/shoulder girdle injury; distal third: assess for lateral condyle/elbow involvement' },
        ],
      },
      {
        id: 'distal_humerus_fracture',
        label: 'AO/OTA — Distal Humerus Fracture (13) + Column Classification',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'Distal humeral fractures classified by AO/OTA (13-A/B/C) and by the column concept (medial + lateral). Type C (intercondylar/bicolumn) fractures require CT for surgical planning. Jupiter modification widely used.',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA 2018. J Orthop Trauma 2018;32(Suppl 1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
          { label: 'Jupiter JB et al. — Intercondylar fractures of the humerus. J Bone Joint Surg Am 1985;67(2):226-239.', url: 'https://pubmed.ncbi.nlm.nih.gov/3973096/' },
        ],
        normalValues: [
          { label: '13-A (Extra-articular)', value: 'Supracondylar; A1: avulsion (epicondyle); A2: simple metaphyseal; A3: comminuted metaphyseal' },
          { label: '13-B (Partial articular)', value: 'B1: lateral condyle/capitellum; B2: medial condyle; B3: frontal plane (Hahn-Steinthal/Kocher-Lorenz capitellar shear)' },
          { label: '13-C (Complete articular — bicolumn)', value: 'C1: simple articular + simple metaphyseal; C2: simple articular + comminuted metaphyseal; C3: comminuted articular' },
          { label: 'Capitellar shear (Dubberley)', value: 'Type I: capitellum only; Type II: capitellum + trochlea as one piece; Type III: capitellum + trochlea comminuted; ± posterior comminution' },
          { label: 'CT key items', value: 'Articular comminution; trochlear/capitellar involvement; coronal plane fragments; medial/lateral epicondyle avulsion' },
        ],
      },
    ],
  },
  // ── CT: Forearm ─────────────────────────────────────────────────────────
  forearm: {
    label: 'Forearm — CT Fracture Classification',
    measurements: [
      {
        id: 'ao_ota_forearm',
        label: 'AO/OTA — Both-Bone Forearm / Radius / Ulna (22)',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'AO/OTA classification for forearm shaft fractures (segment 22). Assess PRUJ (proximal radioulnar joint) and DRUJ (distal radioulnar joint) in all isolated forearm bone fractures to exclude Monteggia and Galeazzi patterns.',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA 2018. J Orthop Trauma 2018;32(Suppl 1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
          { label: 'Bado JL. — The Monteggia lesion. Clin Orthop 1967;50:71-86.', url: 'https://pubmed.ncbi.nlm.nih.gov/6029007/' },
        ],
        normalValues: [
          { label: '22-A (Simple)', value: 'A1: ulna simple + radius intact; A2: radius simple + ulna intact; A3: both bones simple fractures' },
          { label: '22-B (Wedge)', value: 'B1: ulna wedge; B2: radius wedge; B3: one bone wedge + other simple' },
          { label: '22-C (Complex)', value: 'C1: ulna complex + radius intact; C2: radius complex + ulna intact; C3: complex both bones' },
          { label: '⚠ Monteggia (Bado)', value: 'I: ant. radial head disloc. + prox. ulna angulated anteriorly (most common); II: post.; III: lateral; IV: ant. + both-bone' },
          { label: '⚠ Galeazzi', value: 'Distal-third radial shaft fracture + DRUJ dislocation/disruption — "fracture of necessity" requiring surgery' },
          { label: '⚠ Essex-Lopresti', value: 'Radial head fracture + interosseous membrane disruption + DRUJ injury — longitudinal forearm instability; easy to miss' },
        ],
      },
      {
        id: 'distal_radius_fracture',
        label: 'Distal Radius Fracture — Frykman / AO / Key Measurements',
        isGradingScale: true,
        plane: 'Coronal + Sagittal + Axial',
        description: 'Distal radius fractures classified by AO/OTA (23-A/B/C) and historically by Frykman. CT used for comminuted and intra-articular fractures. Key measurements guide operative decision-making.',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA 2018. J Orthop Trauma 2018;32(Suppl 1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
          { label: 'Frykman G. — Fracture of the distal radius. Acta Orthop Scand 1967;Suppl 108:1-153.', url: 'https://pubmed.ncbi.nlm.nih.gov/4226779/' },
        ],
        normalValues: [
          { label: 'AO/OTA 23-A (Extra-articular)', value: 'A1: ulnar styloid only; A2: simple distal radius; A3: comminuted distal radius — radiocarpal joint intact' },
          { label: 'AO/OTA 23-B (Partial articular)', value: 'B1: radial styloid (Chauffeur); B2: dorsal rim (Barton); B3: volar rim (volar Barton/reverse Barton)' },
          { label: 'AO/OTA 23-C (Complete articular)', value: 'C1: simple articular + simple metaphyseal; C2: simple articular + comminuted metaphyseal; C3: comminuted articular (die-punch component common)' },
          { label: 'Radial inclination (normal)', value: '22° (coronal); <15° = loss of inclination — surgical threshold' },
          { label: 'Volar tilt (normal)', value: '11° (sagittal); dorsal angulation >10° = surgical threshold' },
          { label: 'Radial height (normal)', value: '11–12 mm; shortening >3 mm = surgical threshold' },
          { label: 'Articular step-off threshold', value: '>2 mm intra-articular gap or step-off = surgical indication' },
          { label: 'Ulnar variance', value: 'Positive (ulna long relative to radius) — risk for TFCC injury and ulnocarpal impaction' },
        ],
      },
    ],
  },
  // ── CT: Shoulder ────────────────────────────────────────────────────────
  shoulder: {
    label: 'Shoulder — CT Fracture/Instability Classification',
    measurements: [
      {
        id: 'neer_proximal_humerus_shoulder',
        label: 'Neer Classification — Proximal Humerus Fracture',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'See Humerus CT panel for full Neer details. Briefly: 1–4 part based on displacement (>1 cm or >45°) of humeral head, greater tuberosity, lesser tuberosity, shaft.',
        diagram: null,
        citations: [
          { label: 'Neer CS 2nd. — Displaced proximal humeral fractures. J Bone Joint Surg Am 1970;52(6):1077-1089.', url: 'https://pubmed.ncbi.nlm.nih.gov/5455339/' },
        ],
        normalValues: [
          { label: '1-part', value: 'No segment displaced >1 cm or >45° — any number of fracture lines' },
          { label: '2-part', value: 'One segment displaced (surgical neck most common)' },
          { label: '3-part', value: 'Two segments displaced' },
          { label: '4-part', value: 'All four segments displaced — high AVN risk' },
          { label: 'Fracture-dislocation', value: 'Any part pattern + glenohumeral dislocation' },
        ],
      },
      {
        id: 'glenoid_bone_loss',
        label: 'Glenoid Bone Loss — Instability Metrics (ISIS / Inverted Pear)',
        isGradingScale: true,
        plane: 'Axial (en face glenoid reconstruction)',
        description: 'Critical CT measurements for anterior glenohumeral instability. Glenoid bone loss >20–25% = "inverted pear" glenoid — Latarjet procedure preferred over soft tissue repair. Hill-Sachs engagement assessed with the Remplissage/ISIS score.',
        diagram: null,
        citations: [
          { label: 'Burkhart SS & De Beer JF. — Traumatic glenohumeral bone defects. Arthroscopy 2000;16(7):677-694.', url: 'https://pubmed.ncbi.nlm.nih.gov/11027751/' },
          { label: 'Griffith JF et al. — Anterior shoulder instability: CT. AJR 2003;180(1):229-232.', url: 'https://pubmed.ncbi.nlm.nih.gov/12490511/' },
        ],
        normalValues: [
          { label: 'Glenoid bone loss (circle method)', value: 'Normal glenoid diameter ~2.5 cm; % loss = (glenoid diameter – remaining glenoid) / glenoid diameter × 100' },
          { label: '<15% bone loss', value: 'Soft tissue (Bankart) repair appropriate if engaging Hill-Sachs absent' },
          { label: '15–25% bone loss', value: 'Borderline — assess Hill-Sachs engagement; consider Latarjet' },
          { label: '>25% bone loss ("Inverted pear")', value: 'Latarjet or bone grafting procedure strongly recommended; Bankart alone will fail' },
          { label: 'Hill-Sachs on-track/off-track', value: 'HS width < (glenoid track = 0.83×glenoid diameter − bone loss width) = on-track (safe for Bankart); otherwise off-track → Remplissage or Latarjet' },
          { label: 'Osseous Bankart', value: 'Anterior glenoid rim fracture fragment — measure size; if >25% of glenoid = critical bone loss' },
        ],
      },
      {
        id: 'ac_separation_rockwood',
        label: 'Rockwood Classification — AC Joint Separation',
        isGradingScale: true,
        plane: 'Coronal',
        description: 'Rockwood classification of acromioclavicular joint separations. Types I–III are most common; Types IV–VI are rare high-energy injuries. CT useful for posterior displacement (Type IV) and associated fractures.',
        diagram: null,
        citations: [
          { label: 'Rockwood CA. — Injuries to the acromioclavicular joint. 1984. In: Rockwood and Greens Fractures.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
        ],
        normalValues: [
          { label: 'Type I', value: 'AC ligament sprain; CC ligaments intact; no displacement on imaging' },
          { label: 'Type II', value: 'AC ligament torn; CC ligaments sprained; <25% CC distance increase; mild widening' },
          { label: 'Type III', value: 'AC + CC ligaments torn; 25–100% CC distance increase; deltotrapezial fascia intact' },
          { label: 'Type IV', value: 'Clavicle displaced POSTERIORLY into trapezius — CT diagnosis; may appear Type II on AP X-ray' },
          { label: 'Type V', value: '>100% CC distance increase; deltotrapezial fascia torn; clavicle subcutaneous' },
          { label: 'Type VI', value: 'Clavicle displaced INFERIORLY (subacromial/subcoracoid) — rare; high energy' },
          { label: 'Normal CC distance', value: '11–13 mm; >5 mm increase vs. contralateral = abnormal' },
        ],
      },
    ],
  },
  // ── CT: Elbow ───────────────────────────────────────────────────────────
  elbow: {
    label: 'Elbow — CT Fracture Classification',
    measurements: [
      {
        id: 'mason_radial_head',
        label: 'Mason Classification (Modified) — Radial Head Fracture',
        isGradingScale: true,
        plane: 'Axial + Coronal',
        description: 'Mason classification of radial head fractures, commonly modified by Johnston (adds Type IV for fracture-dislocation). CT essential for marginal fractures and surgical planning. Radial head fractures may indicate associated Essex-Lopresti injury.',
        diagram: null,
        citations: [
          { label: 'Mason ML. — Some observations on fractures of the head of the radius. Br J Surg 1954;42(172):123-132.', url: 'https://pubmed.ncbi.nlm.nih.gov/13209027/' },
          { label: 'Johnston GW. — A follow-up of one hundred cases of fracture of the head of the radius. Ulster Med J 1962;31:51-56.', url: 'https://pubmed.ncbi.nlm.nih.gov/14455025/' },
        ],
        normalValues: [
          { label: 'Type I', value: 'Non-displaced or minimally displaced (<2 mm); no mechanical block; non-operative' },
          { label: 'Type II', value: 'Marginal sector fracture WITH displacement (>2 mm) or angulation; may block forearm rotation; ORIF vs. arthroplasty' },
          { label: 'Type III', value: 'Comminuted radial head fracture — 3+ fragments; arthroplasty usually required' },
          { label: 'Type IV (Johnston mod.)', value: 'Any radial head fracture + elbow dislocation; assess coronoid and LCL' },
          { label: '⚠ Essex-Lopresti', value: 'Radial head fracture (often Type III) + interosseous membrane tear + DRUJ injury — do not excise head without recognizing this' },
          { label: 'Surgical threshold', value: '>2 mm displacement, >30° angulation, >30% articular surface, or mechanical block to rotation' },
        ],
      },
      {
        id: 'coronoid_regan_morrey',
        label: 'Regan-Morrey Classification — Coronoid Fracture',
        isGradingScale: true,
        plane: 'Sagittal + Axial',
        description: 'Coronoid fractures are often associated with elbow dislocations (terrible triad: radial head + coronoid + LCL). Regan-Morrey classifies by fracture height. O\'Driscoll classification (anteromedial facet involvement) increasingly used for surgical planning.',
        diagram: null,
        citations: [
          { label: 'Regan W & Morrey BF. — Coronoid process fractures. J Bone Joint Surg Am 1989;71(9):1348-1354.', url: 'https://pubmed.ncbi.nlm.nih.gov/2584650/' },
          { label: 'O\'Driscoll SW et al. — Coronoid fractures. J Shoulder Elbow Surg 2003;12(1):2-11.', url: 'https://pubmed.ncbi.nlm.nih.gov/12610480/' },
        ],
        normalValues: [
          { label: 'Regan-Morrey Type I', value: 'Tip fracture ≤25% coronoid height — most common; unstable if part of terrible triad' },
          { label: 'Regan-Morrey Type II', value: 'Fragment ≤50% coronoid height' },
          { label: 'Regan-Morrey Type III', value: 'Fragment >50% coronoid height — major instability; surgical fixation required' },
          { label: 'O\'Driscoll — Anteromedial facet', value: 'AM1: tip only; AM2: anteromedial rim; AM3: rim + anterior process; varus posteromedial instability pattern' },
          { label: '⚠ Terrible Triad', value: 'Elbow dislocation + radial head fracture + coronoid fracture Type I/II — surgical triple repair' },
          { label: 'CT key items', value: 'Coronoid height (mm); anteromedial facet integrity; associated radial head, olecranon, and LCL injury pattern' },
        ],
      },
      {
        id: 'olecranon_fracture',
        label: 'Mayo Classification — Olecranon Fracture',
        isGradingScale: true,
        plane: 'Sagittal + Axial',
        description: 'Mayo classification of olecranon fractures based on displacement, stability, and comminution. Guides operative vs. non-operative management.',
        diagram: null,
        citations: [
          { label: 'Morrey BF. — The Elbow and Its Disorders. 1993; Mayo Clinic classification.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
        ],
        normalValues: [
          { label: 'Type I (Undisplaced)', value: 'IA: non-comminuted; IB: comminuted; elbow stable; non-operative' },
          { label: 'Type II (Displaced, stable)', value: 'IIA: non-comminuted (tension band wiring); IIB: comminuted (plate fixation)' },
          { label: 'Type III (Displaced, unstable)', value: 'IIIA: non-comminuted; IIIB: comminuted; elbow instability — plate fixation + LCL repair' },
          { label: 'Displacement threshold', value: '>2 mm displacement with inability to actively extend against gravity = operative' },
          { label: 'Monteggia variant', value: 'Olecranon fracture + radial head dislocation (Bado Type II equivalent) — always assess PRUJ' },
        ],
      },
    ],
  },
  // ── CT: Wrist ───────────────────────────────────────────────────────────
  wrist: {
    label: 'Wrist — CT Fracture Classification',
    measurements: [
      {
        id: 'distal_radius_ct',
        label: 'AO/OTA — Distal Radius Fracture (23) + Key Measurements',
        isGradingScale: true,
        plane: 'Coronal + Sagittal',
        description: 'CT indicated for intra-articular distal radius fractures (AO Type 23-B/C). Delineates die-punch fragment, articular comminution, and dorsal/volar rim fragments critical for surgical planning.',
        diagram: null,
        citations: [
          { label: 'Meinberg EG et al. — AO/OTA 2018. J Orthop Trauma 2018;32(Suppl 1):S1-S170.', url: 'https://pubmed.ncbi.nlm.nih.gov/29256945/' },
        ],
        normalValues: [
          { label: 'AO 23-A (Extra-articular)', value: 'A1: ulnar styloid; A2: simple; A3: comminuted — radiocarpal joint intact' },
          { label: 'AO 23-B (Partial articular)', value: 'B1: radial styloid (Chauffeur); B2: dorsal rim (Barton); B3: volar rim (reverse Barton)' },
          { label: 'AO 23-C (Complete articular)', value: 'C1: simple jt + simple metaphysis; C2: simple jt + comminuted metaphysis; C3: comminuted articular (die-punch)' },
          { label: 'Radial inclination', value: 'Normal 22°; surgical if <15°' },
          { label: 'Volar tilt', value: 'Normal 11°; surgical if dorsal angulation >10–15°' },
          { label: 'Radial height', value: 'Normal 11–12 mm; surgical if shortening >3 mm' },
          { label: 'Articular step-off', value: '>2 mm = surgical indication' },
        ],
      },
      {
        id: 'scaphoid_fracture_herbert',
        label: 'Herbert Classification — Scaphoid Fracture',
        isGradingScale: true,
        plane: 'Coronal + Sagittal',
        description: 'Herbert & Fisher classification for scaphoid fractures. CT is the definitive imaging for fracture characterization, displacement measurement, and AVN assessment. Waist fractures most common (70%).',
        diagram: null,
        citations: [
          { label: 'Herbert TJ & Fisher WE. — Scaphoid fracture classification. J Bone Joint Surg Br 1984;66(1):114-123.', url: 'https://pubmed.ncbi.nlm.nih.gov/6693483/' },
        ],
        normalValues: [
          { label: 'Type A (Stable acute)', value: 'A1: fracture of tubercle; A2: incomplete fracture of waist — non-displaced, stable; cast treatment' },
          { label: 'Type B (Unstable acute)', value: 'B1: distal oblique; B2: complete waist (displaced); B3: proximal pole; B4: trans-scaphoid perilunate fracture-dislocation' },
          { label: 'Type C (Delayed union)', value: 'Delayed union (>6 weeks); instability pattern' },
          { label: 'Type D (Established nonunion)', value: 'D1: fibrous union; D2: pseudarthrosis with sclerosis and cyst formation' },
          { label: 'Displacement threshold', value: '>1 mm displacement, >15° intrascaphoid angle, or >45° lateral intrascaphoid angle = unstable; surgical fixation' },
          { label: 'Proximal pole AVN', value: 'Assess CT density of proximal fragment; low density = possible AVN (MRI more sensitive)' },
          { label: 'Humpback deformity', value: 'DISI pattern: intrascaphoid angle >35° on lateral; lateral intrascaphoid angle >45°' },
        ],
      },
      {
        id: 'carpal_dislocation',
        label: 'Perilunate Dislocation / Carpal Instability Classification',
        isGradingScale: true,
        plane: 'Sagittal + Coronal',
        description: 'Progressive perilunate instability (Mayfield stages I–IV). Greater arc injuries involve fractures through carpal bones. Lesser arc = pure ligamentous. CT essential for identifying carpal fractures and assessing reduction.',
        diagram: null,
        citations: [
          { label: 'Mayfield JK et al. — Carpal dislocations. J Hand Surg Am 1980;5(3):226-241.', url: 'https://pubmed.ncbi.nlm.nih.gov/7373122/' },
        ],
        normalValues: [
          { label: 'Mayfield Stage I', value: 'Scapholunate dissociation (SL gap >3 mm, Terry Thomas sign)' },
          { label: 'Mayfield Stage II', value: 'SL + lunocapitate dislocation' },
          { label: 'Mayfield Stage III', value: 'SL + lunocapitate + lunotriquetral dissociation = perilunate dislocation' },
          { label: 'Mayfield Stage IV', value: 'Lunate dislocates volarly (lunate dislocation) — median nerve compression risk' },
          { label: 'Greater arc (trans-scaphoid)', value: 'Fracture through scaphoid ± capitate ± hamate ± triquetrum — trans-scaphoid perilunate dislocation most common variant' },
          { label: 'DISI / VISI', value: 'DISI (SL > 70°, capitolunate > 15°); VISI (LT dissociation, lunocapitate < -15°)' },
        ],
      },
    ],
  },
  // ── CT: Ankle ───────────────────────────────────────────────────────────
  ankle: {
    label: 'Ankle — CT Fracture Classification',
    measurements: [
      {
        id: 'lauge_hansen_weber',
        label: 'Danis-Weber / Lauge-Hansen — Ankle Fracture',
        isGradingScale: true,
        plane: 'Coronal + Axial',
        description: 'Weber classification by fibular fracture level relative to the ankle syndesmosis. Lauge-Hansen describes injury mechanism and ligamentous injury sequence. CT used for complex fractures, posterior malleolus assessment, and pilon differentiation.',
        diagram: null,
        citations: [
          { label: 'Weber BG. — Die Verletzungen des oberen Sprunggelenkes. 1966.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
          { label: 'Lauge-Hansen N. — Fractures of the ankle. Arch Surg 1950;60(5):957-985.', url: 'https://pubmed.ncbi.nlm.nih.gov/15415202/' },
        ],
        normalValues: [
          { label: 'Weber A (infrasyndesmal)', value: 'Fibula fracture below syndesmosis; ATFL disruption; syndesmosis intact; usually stable' },
          { label: 'Weber B (transyndesmal)', value: 'Fibula fracture at syndesmosis (most common); oblique/spiral; syndesmosis ± disrupted; stability variable' },
          { label: 'Weber C (suprasyndesmal)', value: 'Fibula fracture above syndesmosis; syndesmosis disrupted; medial-sided injury required for instability; high fibular fracture → Maisonneuve' },
          { label: 'Trimalleolar', value: 'Lateral + medial + posterior malleolus; posterior fragment >25% tibial articular surface = surgical' },
          { label: 'Posterior malleolus (Haraguchi)', value: 'Type I: posterolateral oblique (most common, ~70%); Type II: medial extension; Type III: small shell avulsion' },
          { label: 'Syndesmosis assessment', value: 'Tibiofibular clear space >5 mm (AP), >6 mm (mortise); tibiofibular overlap <10 mm (AP), <1 mm (mortise) = widening' },
          { label: '⚠ Maisonneuve', value: 'Weber C + proximal fibular fracture; image full fibula; CT ankle + CT/X-ray proximal fibula' },
        ],
      },
      {
        id: 'calcaneus_sanders',
        label: 'Sanders Classification — Calcaneus Fracture',
        isGradingScale: true,
        plane: 'Coronal (posterior facet)',
        description: 'Sanders CT classification of intra-articular calcaneus fractures based on number and location of fracture lines in the posterior facet of the subtalar joint. The primary coronally reconstructed CT image through the widest part of the posterior facet is used.',
        diagram: null,
        citations: [
          { label: 'Sanders R et al. — Operative treatment of intra-articular calcaneal fractures. J Bone Joint Surg Am 1993;75(2):232-252.', url: 'https://pubmed.ncbi.nlm.nih.gov/8423182/' },
        ],
        normalValues: [
          { label: 'Type I', value: 'All non-displaced fractures regardless of number of fracture lines — non-operative' },
          { label: 'Type II (1 fracture line)', value: 'IIA: lateral column; IIB: central; IIC: medial column — 2 articular fragments' },
          { label: 'Type III (2 fracture lines)', value: 'IIIAB: lateral + central; IIIAC: lateral + medial; IIIBC: central + medial — 3 articular fragments' },
          { label: 'Type IV (3+ fracture lines)', value: 'Highly comminuted posterior facet — 4+ fragments; primary subtalar arthrodesis often preferred' },
          { label: 'Böhler angle (normal)', value: '25–40°; flattening (<20°) indicates collapse of posterior facet; <0° = severe comminution' },
          { label: 'Crucial angle of Gissane', value: '120–145°; widening suggests posterior facet impaction' },
          { label: 'Key CT items', value: 'Posterior facet comminution; sustentaculum tali involvement; peroneal tendon entrapment; lateral wall blowout' },
        ],
      },
    ],
  },
  // ── CT: Hip ─────────────────────────────────────────────────────────────
  hip: {
    label: 'Hip — CT Fracture Classification',
    measurements: [
      {
        id: 'garden_femoral_neck',
        label: 'Garden Classification — Femoral Neck Fracture',
        isGradingScale: true,
        plane: 'Coronal',
        description: 'Garden classification for intracapsular femoral neck fractures. CT clarifies fracture pattern and detects posterior comminution. Garden III/IV = displaced = high AVN risk; arthroplasty often preferred in elderly.',
        diagram: null,
        citations: [
          { label: 'Garden RS. — Low-angle fixation in femoral neck fractures. J Bone Joint Surg Br 1961;43:647-663.', url: 'https://pubmed.ncbi.nlm.nih.gov/14038931/' },
        ],
        normalValues: [
          { label: 'Garden I', value: 'Incomplete/valgus impacted — trabeculae angled; NOT fully displaced; low AVN risk' },
          { label: 'Garden II', value: 'Complete, non-displaced — normal trabecular alignment; low-moderate AVN risk' },
          { label: 'Garden III', value: 'Partially displaced — trabecular malalignment; moderate-high AVN risk' },
          { label: 'Garden IV', value: 'Completely displaced — no trabecular continuity; ~30% AVN risk' },
          { label: 'Simplified (I/II vs. III/IV)', value: 'Non-displaced (I+II): consider ORIF; Displaced (III+IV): arthroplasty in elderly, ORIF in young' },
        ],
      },
      {
        id: 'letournel_acetabulum',
        label: 'Letournel-Judet — Acetabular Fracture Classification',
        isGradingScale: true,
        plane: 'Axial + Coronal + 3D CT',
        description: 'Letournel-Judet classification of acetabular fractures. Based on two-column concept (anterior + posterior). CT with 3D reconstruction is the definitive imaging modality. 5 elementary + 5 associated fracture patterns.',
        diagram: null,
        citations: [
          { label: 'Letournel E & Judet R. — Fractures of the Acetabulum. 1981; 2nd ed. Springer 1993.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
          { label: 'Tile M. — Fractures of the Pelvis and Acetabulum. 3rd ed. 2003.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
        ],
        normalValues: [
          { label: 'Elementary — Posterior wall', value: 'Most common; posterior wall fracture ± dislocation; assess % wall involvement (>50% = unstable)' },
          { label: 'Elementary — Posterior column', value: 'Posterior column from greater/lesser sciatic notch to ischiopubic ramus' },
          { label: 'Elementary — Anterior wall', value: 'Anterior wall only — rare' },
          { label: 'Elementary — Anterior column', value: 'Anterior column from iliac wing to pubic symphysis' },
          { label: 'Elementary — Transverse', value: 'Horizontal fracture line through both columns; "spur sign" on obturator oblique = associated type' },
          { label: 'Associated — Both column (most complex)', value: 'Both columns separated from intact ilium; "spur sign" on CT; no articular surface remains attached to axial skeleton' },
          { label: 'Associated — T-type', value: 'Transverse + vertical component through obturator foramen' },
          { label: 'Associated — Posterior column + wall', value: 'Combined posterior column + posterior wall fracture' },
          { label: 'Associated — Transverse + posterior wall', value: 'Most common associated type' },
          { label: 'Associated — Anterior + posterior hemitransverse', value: 'Anterior column/wall + posterior hemitransverse component' },
          { label: 'CT key items', value: 'Femoral head congruence; intra-articular fragments; marginal impaction; dome comminution; posterior wall % involvement' },
        ],
      },
    ],
  },
  // ── CT: Pelvis ──────────────────────────────────────────────────────────
  pelvis: {
    label: 'Pelvis — CT Fracture Classification',
    measurements: [
      {
        id: 'young_burgess',
        label: 'Young-Burgess Classification — Pelvic Ring Fracture',
        isGradingScale: true,
        plane: 'Axial + Coronal',
        description: 'Young-Burgess classification of pelvic ring fractures by mechanism. CT with 3D reconstruction is the definitive imaging. Correlates with hemorrhagic injury and ligamentous disruption pattern. Tile classification (A/B/C) based on stability is also widely used.',
        diagram: null,
        citations: [
          { label: 'Young JW & Burgess AR. — Radiologic Management of Pelvic Ring Fractures. 1987.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
          { label: 'Tile M. — Fractures of the Pelvis and Acetabulum. 3rd ed. 2003.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
        ],
        normalValues: [
          { label: 'LC I (Lateral Compression)', value: 'Sacral buckle fracture + ipsilateral pubic rami fractures — stable; lowest hemorrhage risk' },
          { label: 'LC II', value: 'LC I + ipsilateral iliac wing (crescent) fracture — partially stable' },
          { label: 'LC III ("windswept pelvis")', value: 'LC II + contralateral APC injury — highly unstable; significant hemorrhage risk' },
          { label: 'APC I (Anteroposterior Compression)', value: 'Pubic symphysis widening <2.5 cm; anterior SI ligament sprain only — stable' },
          { label: 'APC II ("Open book")', value: 'Symphysis >2.5 cm + anterior SI ligaments torn; posterior SI intact — rotationally unstable' },
          { label: 'APC III', value: 'Complete hemipelvic dissociation — anterior AND posterior SI ligaments torn; most hemorrhage risk' },
          { label: 'VS (Vertical Shear)', value: 'Vertical displacement of hemipelvis — complete instability; highest hemorrhage risk' },
          { label: 'CM (Combined Mechanism)', value: 'Mix of above patterns' },
          { label: 'Tile A', value: 'Stable — posterior arch intact' },
          { label: 'Tile B', value: 'Rotationally unstable, vertically stable — posterior arch partially intact' },
          { label: 'Tile C', value: 'Rotationally + vertically unstable — posterior arch completely disrupted' },
        ],
      },
    ],
  },
  // ── CT: Spine ───────────────────────────────────────────────────────────
  spine: {
    label: 'Spine — CT Fracture Classification',
    measurements: [
      {
        id: 'ao_spine_classification',
        label: 'AO Spine Classification — Vertebral Fracture',
        isGradingScale: true,
        plane: 'Sagittal + Axial',
        description: 'AO Spine classification system (updated 2013). Three major types: A (compression), B (tension band disruption), C (displacement/translation). Subclassified by morphology and neural injury. Replaces older Denis three-column model in most centers.',
        diagram: null,
        citations: [
          { label: 'Vaccaro AR et al. — AO Spine subaxial cervical spine injury classification. Eur Spine J 2016;25(7):2173-2184.', url: 'https://pubmed.ncbi.nlm.nih.gov/26984749/' },
          { label: 'Reinhold M et al. — AO thoracolumbar classification. Eur Spine J 2013;22(10):2184-2201.', url: 'https://pubmed.ncbi.nlm.nih.gov/23760689/' },
        ],
        normalValues: [
          { label: 'Type A — Compression', value: 'A0: minor (spinous/transverse process); A1: wedge; A2: split; A3: incomplete burst; A4: complete burst' },
          { label: 'Type B — Tension band', value: 'B1: posterior tension band (Chance-type); B2: posterior tension band with osseous injury; B3: anterior (hyperextension through disc/vertebra)' },
          { label: 'Type C — Displacement/translation', value: 'Any fracture with translational/rotational displacement — most unstable; surgical in almost all cases' },
          { label: 'Burst fracture distinction', value: 'A3/A4 (incomplete/complete burst): posterior vertebral wall retropulsion into canal — measure % canal compromise and retropulsion distance (mm)' },
          { label: 'TLICS (modifier)', value: 'Thoracolumbar Injury Classification Score: morphology (1–4) + PLC integrity (0–3) + neurologic status (0–4); ≥5 = surgery; ≤3 = non-operative; 4 = surgeon discretion' },
          { label: 'CSISS / SLIC (cervical)', value: 'Subaxial Cervical Injury Severity Score: disc morphology + DLC integrity + neurologic; ≥5 = surgery' },
          { label: 'Key CT items', value: 'Retropulsion distance (mm); % canal compromise; posterior ligamentous complex (PLC) disruption (CT: interspinous widening, facet perch/dislocation); vertebral height loss (%)' },
        ],
      },
      {
        id: 'odontoid_anderson_dalonzo',
        label: 'Anderson-D\'Alonzo — Odontoid (Dens) Fracture',
        isGradingScale: true,
        plane: 'Coronal + Sagittal',
        description: 'Anderson-D\'Alonzo classification for odontoid fractures. Type II (waist) is most common and has highest nonunion rate. CT provides definitive characterization; MRI assesses transverse ligament integrity.',
        diagram: null,
        citations: [
          { label: 'Anderson LD & D\'Alonzo RT. — Odontoid fractures. J Bone Joint Surg Am 1974;56(8):1663-1674.', url: 'https://pubmed.ncbi.nlm.nih.gov/4434035/' },
        ],
        normalValues: [
          { label: 'Type I', value: 'Oblique avulsion fracture of dens TIP — rare; stable if transverse ligament intact' },
          { label: 'Type II', value: 'Fracture at BASE of dens (dens-body junction) — most common (60%); highest nonunion rate (up to 36%); surgery often recommended' },
          { label: 'Type IIA', value: 'Type II variant: comminuted base — even higher nonunion risk; essentially all require surgery' },
          { label: 'Type III', value: 'Fracture extends into C2 vertebral BODY — better blood supply; lower nonunion rate; often treated with halo or rigid collar' },
          { label: 'Displacement', value: '>5 mm or angulation >10° = associated with higher nonunion rate; surgical fixation strongly favored' },
          { label: 'Transverse ligament', value: 'CT: atlantodental interval (ADI) >3 mm adult / >5 mm child = ligamentous instability; MRI for definitive assessment' },
        ],
      },
    ],
  },
  // ── CT: Foot ────────────────────────────────────────────────────────────
  foot: {
    label: 'Foot — CT Fracture Classification',
    measurements: [
      {
        id: 'lisfranc_fracture_classification',
        label: 'Lisfranc Injury — Myerson / Hardcastle Classification',
        isGradingScale: true,
        plane: 'Axial + Coronal',
        description: 'Lisfranc (tarsometatarsal) injuries classified by Hardcastle (modified by Myerson). CT is definitive for subtle Lisfranc injuries, fleck signs, and articular comminution. A fleck fracture at base of 2nd MT or medial cuneiform = pathognomonic for ligamentous disruption.',
        diagram: null,
        citations: [
          { label: 'Hardcastle PH et al. — Injuries to the Lisfranc joint. J Bone Joint Surg Br 1982;64(3):349-356.', url: 'https://pubmed.ncbi.nlm.nih.gov/7096433/' },
          { label: 'Myerson MS et al. — Fracture-dislocations of the tarsometatarsal joints. J Bone Joint Surg Am 1986;68(6):932-936.', url: 'https://pubmed.ncbi.nlm.nih.gov/3734882/' },
        ],
        normalValues: [
          { label: 'Type A (Total incongruity)', value: 'ALL 5 TMT joints displaced in the same direction (lateral most common) — complete Lisfranc disruption' },
          { label: 'Type B (Partial incongruity)', value: 'B1: medial displacement (1st TMT only); B2: lateral displacement (2nd–5th TMTs, 1st intact)' },
          { label: 'Type C (Divergent)', value: 'C1: partial divergent (1st MT medial + others lateral); C2: complete divergent — all TMT joints disrupted, divergent pattern' },
          { label: 'Purely ligamentous', value: 'No fracture on X-ray; CT/MRI: >2 mm 1st–2nd intermetatarsal space widening; "fleck sign" at base 2nd MT or cuneiform = equivalent to ligamentous disruption' },
          { label: 'Threshold for instability', value: '>2 mm displacement between 1st and 2nd MT bases; any diastasis of medial cuneiform–2nd MT = operative in most guidelines' },
          { label: 'Key CT items', value: 'Diastasis measurement (mm); fleck fracture location; plantar Lisfranc ligament avulsion; navicular-cuneiform involvement' },
        ],
      },
      {
        id: 'calcaneus_sanders_foot',
        label: 'Sanders Classification — Calcaneus Fracture',
        isGradingScale: true,
        plane: 'Coronal (posterior facet)',
        description: 'Sanders CT classification of intra-articular calcaneus fractures. Coronal CT through widest posterior facet is the key image. Type I = non-operative; Types II–IV graded by posterior facet comminution.',
        diagram: null,
        citations: [
          { label: 'Sanders R et al. — Operative calcaneal fractures. J Bone Joint Surg Am 1993;75(2):232-252.', url: 'https://pubmed.ncbi.nlm.nih.gov/8423182/' },
        ],
        normalValues: [
          { label: 'Type I', value: 'All non-displaced — non-operative regardless of fracture line count' },
          { label: 'Type IIA/B/C', value: 'One fracture line; 2 articular fragments — A: lateral, B: central, C: medial column' },
          { label: 'Type IIIAB/AC/BC', value: 'Two fracture lines; 3 articular fragments — various combinations' },
          { label: 'Type IV', value: 'Highly comminuted posterior facet — 4+ fragments; consider primary subtalar arthrodesis' },
          { label: 'Böhler angle', value: 'Normal 25–40°; reduced = posterior facet collapse' },
          { label: 'Peroneal tendon', value: 'Assess for lateral wall blowout and peroneal tendon entrapment' },
        ],
      },
    ],
  },
};

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

const BODY_PARTS = ['knee','shoulder','hip','wrist','elbow','ankle','spine','pelvis','foot','femur/thigh','tibia/fibula','humerus','forearm'];
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
  'femur/thigh':'Proximal Hamstring Tendons (conjoint tendon at ischial tuberosity), Biceps Femoris Long Head, Biceps Femoris Short Head, Semimembranosus, Semitendinosus, Quadriceps Muscle Group (rectus femoris / vastus lateralis / vastus medialis / vastus intermedius), Adductor Muscle Group, Iliotibial Band, Femoral Neurovascular Bundle, Femur, Bone Marrow Signal, Soft Tissues',
  'tibia/fibula':'Tibialis Anterior, Extensor Hallucis Longus, Extensor Digitorum Longus, Posterior Tibial Tendon, Flexor Digitorum Longus, Flexor Hallucis Longus, Peroneus Longus, Peroneus Brevis, Anterior Compartment Musculature, Posterior Compartment Musculature, Lateral Compartment Musculature, Interosseous Membrane, Tibia (cortex / medullary canal / periosteum), Fibula, Bone Marrow Signal, Soft Tissues',
  humerus:'Deltoid Muscle, Biceps Brachii, Brachialis, Triceps Brachii, Coracobrachialis, Radial Nerve, Axillary Nerve, Ulnar Nerve, Humerus (cortex / medullary canal / periosteum), Bone Marrow Signal, Soft Tissues',
  forearm:'Flexor Carpi Radialis, Flexor Carpi Ulnaris, Flexor Digitorum Superficialis, Flexor Digitorum Profundus, Flexor Pollicis Longus, Pronator Teres, Pronator Quadratus, Extensor Carpi Radialis Longus and Brevis, Extensor Carpi Ulnaris, Extensor Digitorum, Extensor Pollicis Longus and Brevis, Abductor Pollicis Longus, Brachioradialis, Supinator, Radius, Ulna, Interosseous Membrane, Radial Nerve, Median Nerve, Ulnar Nerve, Bone Marrow Signal, Soft Tissues',
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

function buildPrompt(part, lat, con, spineRegion, modality, doseOpt = true) {
  const isCT = modality === 'CT';
  const modalityName = isCT ? 'CT' : 'MRI';
  const doseOptSentence = doseOpt ? ' One or more of the following dose optimizing techniques were utilized for this exam: automated exposure control, adjustment of the mA and/or kV according to patient size, and/or use of iterative reconstruction technique.' : '';
  const techniqueText = isCT
    ? `CT scan of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part} ${con} IV contrast. Multiplanar reformats were created.${doseOptSentence}`
    : `Multiplanar multisequence MRI of the ${lat ? lat + ' ' : ''}${part === 'spine' ? spineRegion + ' spine' : part} ${con} IV contrast.`;

  const findingsRules = isCT
    ? `FINDINGS RULES (CT): 1. Not mentioned: write "intact." EXCEPTION: Joint Effusion, Dislocation or Subluxation — write "absent." Soft Tissues — write "No acute soft tissue abnormality." 2. Positive: exact dictated words only. 3. CT language only: attenuation, cortical integrity, trabecular pattern, osteophytes, subchondral cysts, chondrocalcinosis. No T1/T2/STIR language. 4. BONES RULE — all three on same line: Fracture/cortical disruption (or "No fracture or cortical disruption."), Osteonecrosis (or "No osteonecrosis."), Osseous lesion (or "No aggressive osseous lesion."). 5. JOINT SPACE RULE — for each joint space: address narrowing, osteophytes, subchondral cysts, chondrocalcinosis — or write "Preserved joint space without osteophytes, subchondral cysts, or chondrocalcinosis."`
    : `FINDINGS RULES: 1. Not mentioned: write "intact." EXCEPTION: Joint Effusion, Baker Cyst, bursae, soft tissue masses — write "absent" not "intact." 2. Positive: exact dictated words only, no added morphology/signal/measurements. 3. BONES RULE — address all three: Fracture/contusion (or "No fracture or contusion."), Osteonecrosis (or "No osteonecrosis."), Marrow signal (or "No marrow infiltration or bone lesion.") — three sentences on same line. Example: "Bones: No fracture or contusion. No osteonecrosis. No marrow infiltration or bone lesion."`;

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

HIP:
- FAI CAM: CAM deformity + labral tear + cartilage damage → "CAM-type femoroacetabular impingement with anterosuperior labral tear[/cartilage injury], as above."
- FAI PINCER: Overcoverage + labral tear → "Pincer-type femoroacetabular impingement with labral [degeneration/tear], as above."
- MIXED FAI: Both → "Mixed-type FAI with labral pathology, as above."
- AVN: Always own line with Ficat stage if determinable.

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

WHAT ALWAYS GETS ITS OWN LINE (never grouped):
- Osteochondral lesion / OCD / subchondral fracture
- AVN (with Ficat/ARCO stage)
- Aggressive or indeterminate osseous lesion
- Fracture of high urgency (pelvic ring, vertebral with cord compromise)
- Incidental finding unrelated to primary pathology (e.g. renal cyst on hip MRI)
- Normal exam → ${normalImpressionText}

STYLE RULES:
- Number each item. Most important/urgent first.
- Use named syndromes and clinical mechanisms — not signal descriptions or grade numbers
- "as above" replaces repeating measurements, grades, signal characteristics
- Do NOT write "modified Outerbridge grade X", "T2 hyperintensity", "low signal on T1" in the impression
- ${normalImpressionText}
- CARTILAGE / OA RULE (knee): If Modified Outerbridge grading in 2+ compartments → single DEGENERATIVE line, not per-compartment.
- OSTEOCHONDRAL EXCEPTION: OCD/osteochondral lesion/subchondral fracture always listed separately.${gradingBlock}

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
  2: [
    [77.5, 57.7, "gluteus medius"],
  ],
  4: [
    [56.9, 53.9, "L5"],
  ],
  5: [
    [78.8, 55.0, "gluteus medius"],
  ],
  6: [
    [59.0, 53.9, "L5"],
  ],
  8: [
    [79.4, 54.2, "gluteus medius"],
  ],
  9: [
    [68.5, 49.3, "lateral femoral cutaneous nerve"],
    [59.7, 54.0, "L5"],
  ],
  10: [
    [74.6, 71.2, "gluteus maximus"],
    [59.5, 63.9, "SI joint, ligamentous portion"],
  ],
  11: [
    [69.7, 49.5, "lateral femoral cutaneous nerve"],
  ],
  12: [
    [81.3, 52.9, "gluteus medius"],
    [60.8, 54.6, "L5"],
    [57.3, 58.8, "S1"],
    [52.6, 56.1, "Sacrum, S1"],
    [58.5, 64.5, "SI joint, ligamentous portion"],
  ],
  13: [
    [77.6, 69.9, "gluteus maximus"],
    [56.8, 64.7, "S2"],
    [53.3, 62.2, "Sacrum, S2"],
    [71.1, 41.4, "iliac bone"],
  ],
  14: [
    [72.7, 46.8, "lateral femoral cutaneous nerve"],
    [61.5, 57.3, "SI joint, synovial portion"],
    [59, 66.3, "SI joint, ligamentous portion"],
  ],
  15: [
    [64.4, 46.3, "psoas muscle"],
    [81.2, 54.4, "gluteus medius"],
    [61.6, 55.2, "L5"],
    [58.6, 58.2, "S1"],
  ],
  16: [
    [74.2, 44.6, "lateral femoral cutaneous nerve"],
    [57.4, 65.3, "S2"],
    [53.6, 69.1, "Sacrum, S3"],
  ],
  17: [
    [81.8, 53.5, "gluteus medius"],
    [80.2, 66.8, "gluteus maximus"],
    [60.7, 57.7, "SI joint, synovial portion"],
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
  ],
  20: [
    [63.9, 53.1, "obturator nerve"],
    [62.4, 59.4, "S1"],
    [60.6, 65.3, "S2"],
    [58.2, 71.6, "S3"],
    [60, 62.2, "SI joint, synovial portion"],
    [67.1, 42.2, "iliacus"],
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
    [60.4, 62.1, "SI joint, synovial portion"],
  ],
  23: [
    [65.0, 53.6, "obturator nerve"],
    [77.0, 32.8, "lateral femoral cutaneous nerve"],
    [81.7, 51.8, "gluteus medius"],
    [61.9, 65.1, "S2"],
    [63.2, 68.1, "piriformis"],
  ],
  24: [
    [82.5, 66.8, "gluteus maximus"],
    [80.4, 30.6, "anterior superior iliac spine"],
    [60.2, 70.6, "S3"],
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
    [66, 40.5, "iliacus"],
  ],
  27: [
    [80.7, 42.0, "gluteus minimus"],
    [82.1, 65.9, "gluteus maximus"],
    [65.0, 68.7, "piriformis"],
  ],
  28: [
    [67.6, 61.0, "sciatic nerve"],
    [66.7, 53.5, "obturator nerve"],
    [71.2, 40.2, "femoral nerve"],
    [82.5, 51.2, "gluteus medius"],
    [61.9, 68.7, "S3"],
  ],
  29: [
    [82.6, 30.2, "tensor fascia lata"],
    [68.7, 66.6, "piriformis"],
  ],
  30: [
    [83.3, 65.9, "gluteus maximus"],
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
  ],
  33: [
    [83.1, 67.4, "gluteus maximus"],
    [83.1, 31.4, "tensor fascia lata"],
    [73.0, 63.0, "piriformis"],
  ],
  34: [
    [82.9, 53.9, "gluteus medius"],
    [54.2, 80.3, "coccyx"],
  ],
  35: [
    [66.5, 51.5, "obturator nerve"],
    [72.0, 36.6, "femoral nerve"],
    [80.5, 43.0, "gluteus minimus"],
    [83.7, 67.6, "gluteus maximus"],
    [78.4, 31.6, "sartorius"],
    [76.7, 40.1, "Anterior inferior iliac spine"],
    [66.4, 41.9, "external iliac vein"],
  ],
  36: [
    [83.3, 54.4, "gluteus medius"],
    [78.1, 38.6, "rectus femoris, direct head"],
    [64.3, 74.4, "sacrotuberous ligament"],
    [54.2, 79.2, "coccyx"],
  ],
  37: [
    [85.0, 66.0, "gluteus maximus"],
    [84.7, 32.5, "tensor fascia lata"],
  ],
  38: [
    [78.1, 43.4, "rectus femoris, reflected head"],
    [70.4, 41.7, "iliopsoas"],
    [66.6, 40.0, "external iliac vein"],
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
  ],
  40: [
    [56.3, 25.5, "rectus abdominus"],
    [67.1, 39.0, "external iliac vein"],
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
  ],
  43: [
    [64.1, 47.5, "obturator nerve"],
    [85.3, 54.6, "gluteus medius"],
    [84.5, 32.7, "tensor fascia lata"],
    [67.4, 68.1, "pudendal neurovascular bundle"],
    [56.0, 27.6, "rectus abdominus"],
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
  ],
  46: [
    [72.3, 35.1, "femoral nerve"],
    [85.2, 33.3, "tensor fascia lata"],
    [68.7, 70.4, "sacrotuberous ligament"],
    [65.8, 66.0, "pudendal neurovascular bundle"],
    [52.1, 46.0, "urinary bladder"],
    [52.9, 61.5, "rectum"],
  ],
  47: [
    [64.1, 46.6, "obturator nerve"],
    [83.7, 44.1, "gluteus minimus"],
    [86.8, 53.9, "gluteus medius"],
    [83.6, 69.3, "gluteus maximus"],
    [70.7, 67.8, "obturator internus"],
    [56.3, 31.2, "rectus abdominus"],
    [67.4, 37.9, "common femoral vein"],
  ],
  48: [
    [79.9, 37.1, "rectus femoris"],
    [86.0, 33.7, "tensor fascia lata"],
    [78.6, 49.5, "femoral neck"],
    [69.1, 69.9, "sacrotuberous ligament"],
    [65.3, 63.8, "pudendal neurovascular bundle"],
    [63.7, 56.1, "obturator internus"],
  ],
  49: [
    [78.2, 63.4, "sciatic nerve"],
    [63.8, 44.8, "obturator nerve"],
    [85.0, 46.4, "gluteus minimus"],
    [72.5, 45.9, "iliopsoas"],
    [52.5, 33.5, "rectus abdominus"],
  ],
  50: [
    [74.9, 31.0, "sartorius"],
    [85.3, 52.9, "femoral greater trochanter"],
    [69.6, 70.4, "sacrotuberous ligament"],
    [64.0, 62.4, "pudendal neurovascular bundle"],
    [65.0, 64.0, "Alcock's canal"],
    [64.3, 56.5, "obturator internus"],
    [67.2, 38.0, "common femoral vein"],
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
  ],
  55: [
    [65.0, 35.8, "great saphenous vein"],
  ],
  56: [
    [72.8, 32.1, "sartorius"],
    [78.0, 36.3, "rectus femoris"],
    [76.8, 59.2, "quadratus femoris"],
    [59.0, 43.4, "adductor longus"],
    [74.3, 53.3, "iliopsoas"],
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
  ],
  59: [
    [77.0, 35.2, "rectus femoris"],
    [75.6, 63.0, "semimembranosus"],
    [76.2, 55.6, "femoral lesser trochanter"],
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
  ],
  62: [
    [75.9, 35.4, "rectus femoris"],
    [86.5, 37.1, "tensor fascia lata"],
    [73.5, 67.6, "semitendinosus"],
  ],
  63: [
    [58.2, 52.3, "gracilis"],
    [77.2, 65.5, "biceps femoris, long head"],
    [71.4, 64.1, "adductor magnus"],
    [64.0, 37.9, "great saphenous vein"],
    [68.5, 40.7, "superficial femoral vein"],
    [69.5, 43.4, "deep femoral vein"],
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
  ],
  71: [
    [85.0, 66.4, "gluteus maximus"],
    [86.9, 34.2, "tensor fascia lata"],
    [76.7, 68.7, "semitendinosus"],
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
  ],
  88: [
    [62.1, 39.6, "sartorius"],
  ],
  89: [
    [86.3, 62.8, "gluteus maximus"],
    [73.6, 63.0, "semimembranosus"],
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
  ],
  100: [
    [60.0, 46.6, "sartorius"],
    [73.6, 67.0, "semitendinosus"],
  ],
};

const SHOULDER_LABELS = {
  1: [
    [48.8, 30.5, "pec major"],
    [54.5, 35.3, "pec major"],
    [51.2, 37, "short head of the biceps"],
    [47.5, 37, "coracobrachialis"],
    [56.2, 66.7, "long head of the triceps"],
    [51.3, 59.9, "teres major"],
    [51.9, 49.2, "latissimus dorsi"],
    [28.8, 61.9, "serratus anterior"],
  ],
  2: [
    [44.3, 31.4, "pec major"],
    [55.1, 35.3, "pec major"],
    [51.3, 37.3, "short head of the biceps"],
    [51.6, 56.7, "teres major"],
    [51.3, 49.2, "latissimus dorsi"],
  ],
  3: [
    [55.5, 35.6, "pec major"],
    [56.7, 21.4, "deltoid, anterior"],
    [72.4, 61.1, "deltoid, posterior"],
    [54.3, 66, "long head of the triceps"],
    [51.9, 55.5, "teres major"],
    [31.4, 39.2, "pec minor"],
  ],
  4: [
    [51.8, 13.1, "cephalic vein"],
    [56, 60.9, "axillary neurovascular bundle"],
    [50.6, 36.8, "short head of the biceps"],
    [47.6, 36.5, "coracobrachialis"],
    [51.3, 47.5, "latissimus dorsi"],
  ],
  5: [
    [54.8, 24.1, "deltoid, anterior"],
    [69.9, 37, "deltoid, lateral"],
    [71.1, 62.6, "deltoid, posterior"],
    [52.4, 55.6, "axillary neurovascular bundle"],
    [54.3, 63.8, "long head of the triceps"],
    [52.2, 50.4, "teres major"],
    [51.3, 46.1, "latissimus dorsi"],
    [30.7, 17.3, "pec major"],
  ],
  6: [
    [49.8, 12.9, "cephalic vein"],
    [50.6, 55, "axillary neurovascular bundle"],
    [48.6, 35.6, "coracobrachialis"],
    [51.8, 48.7, "teres major"],
  ],
  7: [
    [56.6, 73.8, "teres minor"],
    [50, 36.1, "short head of the biceps"],
    [53.1, 61.9, "long head of the triceps"],
    [32, 40.7, "pec minor"],
  ],
  8: [
    [53.7, 24.3, "deltoid, anterior"],
    [67.6, 35.1, "deltoid, lateral"],
    [70.4, 67, "deltoid, posterior"],
    [56.6, 72.6, "teres minor"],
  ],
  9: [
    [46.3, 14.8, "cephalic vein"],
    [57.1, 71.9, "teres minor"],
    [48.5, 34.3, "coracobrachialis"],
  ],
  10: [
    [55.8, 32.9, "long head of the biceps"],
    [49.5, 50.6, "anterior inferior labrum"],
    [58.3, 68, "teres minor"],
    [48.5, 33.1, "coracobrachialis"],
  ],
  11: [
    [48.6, 48.3, "anterior inferior labrum"],
    [53.5, 61.2, "posterior inferior labrum"],
    [39.8, 55, "subscapularis"],
    [49.6, 21.7, "deltoid, anterior"],
    [67.6, 33.3, "deltoid, lateral"],
    [69.8, 68.5, "deltoid, posterior"],
    [64.1, 53.3, "teres minor"],
    [26.6, 67.8, "serratus anterior"],
  ],
  12: [
    [56, 31.9, "long head of the biceps"],
    [48, 48.7, "anterior inferior labrum"],
    [54, 62.6, "posterior inferior labrum"],
    [42.9, 16.1, "cephalic vein"],
    [53.8, 72.4, "infraspinatus"],
    [49, 30.5, "conjoined tendon"],
    [34.5, 39.5, "pec minor"],
  ],
  13: [
    [47.9, 49.2, "anterior labrum"],
    [53.5, 62.8, "posterior labrum"],
    [49.4, 37.2, "subscapularis"],
    [42, 51.4, "subscapularis"],
    [67.4, 33.6, "deltoid, lateral"],
    [54.6, 71.7, "infraspinatus"],
  ],
  14: [
    [57.6, 46, "humeral head"],
    [47.1, 58.7, "glenoid"],
    [50, 36.3, "subscapularis"],
    [42.9, 48.5, "subscapularis"],
    [53.8, 72.3, "infraspinatus"],
    [48.2, 65.1, "suprascapular neurovascular bundle"],
    [46.3, 34.1, "coracoid process"],
    [39.8, 37.7, "pec minor"],
  ],
  15: [
    [56.7, 31.4, "long head of the biceps"],
    [48, 47.2, "anterior superior labrum"],
    [52.4, 61.6, "posterior superior labrum"],
    [49.3, 54.1, "glenoid cartilage"],
    [50.6, 56, "humeral head cartilage"],
    [37.7, 25.1, "cephalic vein"],
    [55.7, 70, "infraspinatus"],
    [62.8, 60.4, "infraspinatus"],
    [48.8, 64.1, "spinoglenoid notch"],
  ],
  16: [
    [48.3, 47.5, "anterior superior labrum"],
    [51.4, 59.4, "posterior superior labrum"],
    [65.4, 50.6, "infraspinatus"],
    [60.9, 62.4, "infraspinatus"],
    [45.2, 62.2, "suprascapular neurovascular bundle"],
  ],
  17: [
    [53.6, 34.6, "long head of the biceps"],
    [50.1, 52.8, "superior labrum"],
    [60.2, 33.6, "supraspinatus"],
    [64.9, 48.9, "infraspinatus"],
    [41.9, 57.8, "suprascapular neurovascular bundle"],
    [39.2, 56.5, "suprascapular notch"],
  ],
  18: [
    [53, 40.9, "long head of the biceps"],
    [50.8, 49.7, "biceps labral anchor complex"],
    [37.8, 55.1, "suprascapular neurovascular bundle"],
  ],
  19: [
    [47.3, 59.5, "supraspinatus"],
    [58, 38, "supraspinatus"],
    [35.1, 54.6, "suprascapular neurovascular bundle"],
    [53, 71.4, "scapular spine"],
    [41.2, 48.2, "coracoclavicular ligament complex"],
  ],
  20: [
    [50.3, 54.3, "supraspinatus"],
    [41, 48.9, "coracoclavicular ligament complex"],
  ],
  21: [
    [60.4, 49.7, "acromion"],
    [54.8, 47.8, "acromioclavicular joint"],
    [35.6, 42.8, "clavicle"],
  ],
};

const ELBOW_LABELS = {
  79: [
    [49.6, 35, "biceps"],
    [56.3, 69.2, "triceps"],
    [60, 58.7, "ulnar nerve"],
    [43.1, 55.6, "radial nerve"],
    [55.9, 46.1, "median nerve"],
    [44.6, 39.9, "musculocutaneous nerve"],
    [48.6, 60.6, "humerus"],
  ],
  80: [
    [44.5, 49.7, "brachialis"],
    [43.3, 55, "radial nerve"],
  ],
  81: [
    [44.2, 38.3, "musculocutaneous nerve"],
  ],
  82: [
    [43.7, 53.6, "radial nerve"],
    [56.7, 44.1, "median nerve"],
  ],
  83: [
    [44.8, 37, "musculocutaneous nerve"],
  ],
  84: [
    [46, 46.7, "brachialis"],
    [56.6, 68.5, "triceps"],
    [61.5, 61.2, "ulnar nerve"],
    [43.7, 51.9, "radial nerve"],
    [44.8, 36.1, "musculocutaneous nerve"],
    [50.8, 58.2, "humerus"],
  ],
  85: [
    [50.4, 32.2, "biceps"],
    [57.4, 42.4, "median nerve"],
    [45, 35, "lateral antebrachial cutaneous nerve"],
  ],
  86: [
    [44.4, 48.7, "radial nerve"],
    [45.2, 34.6, "lateral antebrachial cutaneous nerve"],
  ],
  87: [
    [47.3, 44.6, "brachialis"],
    [56.3, 68.7, "triceps"],
    [62.8, 61.4, "ulnar nerve"],
  ],
  88: [
    [51.2, 31.6, "biceps"],
    [44, 45.5, "radial nerve"],
    [58, 39.4, "median nerve"],
    [45.6, 33.8, "lateral antebrachial cutaneous nerve"],
  ],
  89: [
    [56.3, 70.2, "triceps"],
    [44.6, 63.9, "lateral humeral epicondyle"],
  ],
  90: [
    [48.3, 41.2, "brachialis"],
    [62.8, 62.9, "ulnar nerve"],
    [43.2, 43.3, "radial nerve"],
    [58.1, 36, "median nerve"],
    [45.7, 33.4, "lateral antebrachial cutaneous nerve"],
  ],
  91: [
    [62.8, 63.3, "ulnar nerve"],
    [64.1, 62.9, "Osbourne's aponeurosis"],
    [61.8, 63.8, "cubital tunnel"],
    [43.3, 40.9, "radial nerve"],
    [65.2, 55.8, "medial humeral epicondyle"],
    [43.7, 62.1, "lateral humeral epicondyle"],
  ],
  92: [
    [50.5, 30.5, "biceps"],
    [43.2, 39.4, "radial nerve"],
    [58.2, 33.8, "median nerve"],
    [66.2, 52.6, "flexor pronator tendon"],
    [46.1, 32.2, "lateral antebrachial cutaneous nerve"],
    [65.1, 57, "medial humeral epicondyle"],
  ],
  93: [
    [49.5, 39.4, "brachialis"],
    [43.5, 37.8, "superficial branch of the radial nerve"],
    [42.3, 40.4, "deep branch of the radial nerve"],
    [65.4, 51.2, "flexor pronator tendon"],
    [66.1, 48, "pronator teres"],
    [55.1, 29.4, "lacertus fibrosus"],
  ],
  94: [
    [63.3, 59.9, "ulnar nerve"],
    [41, 53.3, "common extensor tendon"],
    [55.9, 29.4, "lacertus fibrosus"],
  ],
  95: [
    [43.9, 36.3, "superficial branch of the radial nerve"],
    [57.9, 33.8, "median nerve"],
    [40.9, 51.9, "common extensor tendon"],
    [62.6, 54.6, "UCL"],
    [45.6, 45.5, "capitellum"],
    [45.5, 40.4, "cartilage"],
    [57.1, 46, "trochlea"],
    [55.6, 65.5, "olecranon"],
  ],
  96: [
    [49.8, 34.6, "biceps"],
    [51.3, 40, "brachialis"],
    [62.5, 54.5, "UCL"],
  ],
  97: [
    [57.2, 36.1, "median nerve"],
    [41, 51.2, "common extensor tendon"],
    [62.8, 39.4, "pronator teres"],
    [62.2, 56.5, "UCL"],
  ],
  98: [
    [51.9, 42.4, "brachialis"],
    [62.6, 59.9, "ulnar nerve"],
    [45.3, 36.8, "superficial branch of the radial nerve"],
    [42.8, 39.5, "deep branch of the radial nerve"],
    [62.1, 56, "sublime tubercle"],
  ],
  99: [
    [60.5, 38.3, "pronator teres"],
  ],
  100: [
    [51.4, 39.2, "biceps"],
    [52.8, 45.6, "brachialis"],
    [44.7, 37.5, "superficial branch of the radial nerve"],
    [43, 40.9, "deep branch of the radial nerve"],
  ],
  101: [
    [43.2, 41.9, "deep branch of the radial nerve"],
    [57.5, 37, "pronator teres"],
  ],
  102: [
    [53.6, 50, "brachialis"],
    [60.1, 58.3, "ulnar nerve"],
    [43, 42.4, "deep branch of the radial nerve"],
  ],
  103: [
    [51.1, 44.4, "biceps"],
    [44.3, 38.3, "superficial branch of the radial nerve"],
    [56, 45.1, "median nerve"],
    [56.2, 36.1, "pronator teres"],
  ],
  104: [
    [51.3, 48.3, "biceps"],
    [54.3, 54.5, "brachialis"],
    [42.5, 45, "deep branch of the radial nerve"],
  ],
  105: [
    [57.9, 57.3, "ulnar nerve"],
    [44.6, 37.7, "superficial branch of the radial nerve"],
    [54.9, 45, "median nerve"],
    [52.9, 36.3, "pronator teres"],
    [50.9, 54.1, "radial tuberosity"],
    [52, 64.3, "ulna"],
  ],
  106: [
    [42.2, 47.7, "deep branch of the radial nerve"],
    [44.7, 44.8, "supinator, deep head"],
    [43.3, 42.8, "supinator, superficial head"],
    [47.6, 50.4, "radius"],
  ],
  107: [
    [44.4, 38.7, "superficial branch of the radial nerve"],
    [54.2, 44.8, "median nerve"],
  ],
  108: [
    [56.9, 55.1, "ulnar nerve"],
    [41.7, 50.4, "deep branch of the radial nerve"],
    [42.9, 52.8, "supinator, deep head"],
    [41, 52.4, "supinator, superficial head"],
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
        path: '/atlas/ax shoulder pdfs/ax shoulder ',
        slices: localSlices(26),
        ext: '.jpg',
        pad: 4,
        permanentLabels: SHOULDER_LABELS,
      },
      sag_t1: {
        label: 'Sag T1',
        path: '/atlas/sag shoulder t1/sag t1  shoulder ',
        slices: localSlices(22),
        ext: '.jpg',
        pad: 4,
      },
      cor_pdfs: {
        label: 'Cor PDFS',
        path: '/atlas/cor shoulder pdfs/cor  shoulder ',
        slices: localSlices(22),
        ext: '.jpg',
        pad: 4,
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
        path: '/atlas/ax elbow pdfs/MRI KNEE W O CONTRAST RIGHT ',
        slices: Array.from({length:30},(_,i)=>i+79),
        ext: '.jpg',
        pad: 4,
        permanentLabels: ELBOW_LABELS,
      },
      ax_t1: {
        label: 'Ax T1',
        path: '/atlas/ax elbow t1/MRI KNEE W O CONTRAST RIGHT ',
        slices: Array.from({length:30},(_,i)=>i+128),
        ext: '.jpg',
        pad: 4,
      },
      cor_pdfs: {
        label: 'Cor PDFS',
        path: '/atlas/cor elbow pdfs/MRI KNEE W O CONTRAST RIGHT ',
        slices: Array.from({length:15},(_,i)=>i+112),
        ext: '.jpg',
        pad: 4,
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
        path: '/atlas/ax wrist pdfs/ax wrist ',
        slices: localSlices(30),
        ext: '.jpg',
        pad: 4,
      },
      cor_pdfs: {
        label: 'Cor PDFS',
        path: '/atlas/cor wrist pdfs/cor  wrist ',
        slices: localSlices(17, 2),
        ext: '.jpg',
        pad: 4,
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
    useLocalMRI: true,
    defaultSlice: 14,
    sequences: {
      ax_pdfs: {
        label: 'Ax PDFS',
        path: '/atlas/ax  knee pdfs/MRI KNEE W O CONTRAST RIGHT ',
        slices: Array.from({length:27},(_,i)=>i+1),
        ext: '.jpg',
        pad: 4,
      },
      cor_pdfs: {
        label: 'Cor PDFS',
        path: '/atlas/cor knee pdfs/MRI KNEE W O CONTRAST RIGHT ',
        slices: Array.from({length:21},(_,i)=>i+57),
        ext: '.jpg',
        pad: 4,
      },
      sag_pdfs: {
        label: 'Sag PDFS',
        path: '/atlas/sag knee pdfs/MRI KNEE W O CONTRAST RIGHT ',
        slices: Array.from({length:29},(_,i)=>i+28),
        ext: '.jpg',
        pad: 4,
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
  const [visibleLayers, setVisibleLayers] = useState({ nerves:true, muscles:true, arteries:true, veins:true, bones:true, ligaments:true, joints:true, spaces:true });
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
      ? (i) => `${sq.path}${String(sliceArr[i]).padStart(sq.pad||3,'0')}${sq.ext}`
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

  useEffect(() => { setSliceIdx(0); setImgLoaded(false); setImgError(false); }, [sequence]);

  // seqData / imgUrl — must be defined BEFORE any useEffect that depends on imgUrl
  const seqData = jointData?.sequences
    ? (jointData.sequences[sequence] || jointData.sequences[Object.keys(jointData.sequences)[0]] || null)
    : null;
  const activeSlices = seqData ? seqData.slices : (jointData?.slices || []);
  const currentSlice = activeSlices[sliceIdx] ?? null;
  const imgUrl = jointData && currentSlice
    ? seqData
      ? `${seqData.path}${String(currentSlice).padStart(seqData.pad||3,'0')}${seqData.ext}`
      : jointData.useLocalMRI
        ? `${jointData.localPath}${String(currentSlice).padStart(3,'0')}${jointData.localExt||'.webp'}`
        : `${VHP_BASE}/${jointData.folder}/a_vm${currentSlice}.png`
    : null;

  // Only show spinner if new image takes >150ms — eliminates flash for cached slices
  const prevImgUrlRef = useRef(null);
  useEffect(() => {
    if (!imgUrl || imgUrl === prevImgUrlRef.current) return;
    prevImgUrlRef.current = imgUrl;
    const probe = new Image();
    let timer = null;
    probe.onload = () => { clearTimeout(timer); };
    timer = setTimeout(() => { setImgLoaded(false); setImgError(false); }, 150);
    probe.src = imgUrl;
    if (probe.complete) { clearTimeout(timer); }
    return () => clearTimeout(timer);
  }, [imgUrl]);

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
    // Anatomic spaces — tunnels, canals, notches, recesses
    if (/tunnel|canal|notch|recess|foramen|fossa|alcock|hunter|spinoglenoid|suprascapular notch|cubital tunnel|carpal tunnel|guyon/.test(n)) return 'spaces';
    // Joints
    if (/\bjoint\b|ac joint|si joint|acromioclavicular|glenohumeral|sacroiliac|radiocarpal|midcarpal|lisfranc joint|patellofemoral|tibiofemoral|tibiotalar|subtalar|facet joint/.test(n)) return 'joints';
    // Nerves
    if (/nerve|plexus|nvb|ganglion|cutaneous nerve|antebrachial|brachial plexus/.test(n)) return 'nerves';
    // Vessels
    if (/artery|femoral art|iliac a|neurovascular bundle/.test(n)) return 'arteries';
    if (/vein|saphenous|femoral vein|iliac v/.test(n)) return 'veins';
    // Bones — includes cartilage, glenoid, all named landmarks
    if (/sacrum|ilium|iliac bone|femur|acetabulum|trochanter|coccyx|symphysis|ramus|tubercle|asis|aiis|intertrochanteric|pubic|humerus|radius|ulna|radial tuberosity|olecranon|capitellum|trochlea|epicondyle|sublime tubercle|glenoid|acromion|clavicle|scapula|scapular spine|coracoid|coracoid process|humeral head|femoral head|femoral neck|femoral diaphysis|vertebra|vertebral body|\bL[1-5]\b|\bS[1-5]\b|\bC[1-7]\b|ischial tuberosity|pubic bone|iliac crest|cartilage/.test(n)) return 'bones';
    // Ligaments — includes labrum, labral, fascia, aponeuroses, UCL etc
    if (/ligament|ligamentous|sacrospinous|sacrotuberous|aponeurosis|osbourne|lacertus|retinaculum|coracoclavicular|coracoacromial|ucl|lcl|acl|pcl|mcl|collateral|annular|labrum|labral|anchor|fascia/.test(n)) return 'ligaments';
    // Muscles + tendons — all orange
    return 'muscles';
  };

  const colorMap = { nerves:'#facc15', muscles:'#f97316', arteries:'#ef4444', veins:'#60a5fa', bones:'#ffffff', ligaments:'#d1d5db', joints:'#34d399', spaces:'#c084fc' };

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
            <p style={{ fontSize:9,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'12px 0 3px' }}>Labels</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:3 }}>
              <button onClick={() => setVisibleLayers({ nerves:true,muscles:true,tendons:true,arteries:true,veins:true,bones:true,ligaments:true,joints:true,spaces:true })}
                style={{ padding:'2px 6px',borderRadius:4,fontSize:8,fontWeight:700,border:'1px solid #475569',background:'#1e293b',color:'#94a3b8',cursor:'pointer' }}>All On</button>
              <button onClick={() => setVisibleLayers({ nerves:false,muscles:false,tendons:false,arteries:false,veins:false,bones:false,ligaments:false,joints:false,spaces:false })}
                style={{ padding:'2px 6px',borderRadius:4,fontSize:8,fontWeight:700,border:'1px solid #475569',background:'#1e293b',color:'#94a3b8',cursor:'pointer' }}>All Off</button>
              {[
                {key:'nerves',label:'Nerves',color:'#facc15'},
                {key:'muscles',label:'Muscles',color:'#f97316'},
                {key:'arteries',label:'Arteries',color:'#ef4444'},
                {key:'veins',label:'Veins',color:'#60a5fa'},
                {key:'bones',label:'Bones',color:'#e2e8f0'},
                {key:'ligaments',label:'Ligaments',color:'#d1d5db'},
                {key:'joints',label:'Joints',color:'#34d399'},
                {key:'spaces',label:'Spaces',color:'#c084fc'},
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
            style={{ flex:'1 1 0',minWidth:0,display:'flex',flexDirection:'column',background:'#020617',overflow:'hidden',position:'relative' }}>

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
              {!imgLoaded && !imgError && !imgRef.current?.src && (
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
                <img src={imgUrl} ref={imgRef}
                  onLoad={() => { setImgLoaded(true); requestAnimationFrame(() => setRenderTick(t => t+1)); }}
                  onError={() => { setImgError(true); setImgLoaded(false); }}
                  style={{ width:'100%',height:'100%',objectFit:'contain',
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 0.05s',
                    position:'absolute', inset:0, borderRadius:4, userSelect:'none' }}
                  loading="eager"
                  decoding="sync"
                  alt={`Slice ${currentSlice}`}
                />
              )}

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
                        return (
                          <g key={'p'+origIdx}>
                            {/* Dot on structure */}
                            <circle cx={px} cy={py} r="4" fill={col} opacity="0.95"
                              stroke="rgba(0,0,0,0.7)" strokeWidth="1"/>
                            {/* Elbow line: text → vertical jog → dot */}
                            <polyline
                              points={`${lineStartX},${ty} ${px - 5},${ty} ${px - 5},${py}`}
                              fill="none" stroke={col} strokeWidth="0.9" opacity="0.65"/>
                            {/* Final horizontal to dot */}
                            <line x1={px-5} y1={py} x2={px-1} y2={py}
                              stroke={col} strokeWidth="0.9" opacity="0.65"/>
                            {/* Label text shadow */}
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

// ─── RESEARCH MODAL ────────────────────────────────────────────────────────
function ResearchModal({ onClose }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'8px' }}>
      <div style={{ background:'#0f172a',borderRadius:16,width:'min(99vw,860px)',height:'min(96vh,1000px)',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
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

        {/* Posts feed */}
        <div style={{ flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:16 }}>
          {RESEARCH_POSTS.map((post, idx) => {
            const isOpen = expanded === idx;
            const isLatest = idx === 0;
            return (
              <div key={idx} style={{ background:isOpen?'#1e293b':'#141f30',border:'1px solid '+(isOpen?'#059669':'#1e3a5f'),borderRadius:12,overflow:'hidden',transition:'border-color 0.2s' }}>

                {/* Post header — always visible */}
                <div onClick={() => setExpanded(isOpen ? null : idx)}
                  style={{ padding:'14px 18px',cursor:'pointer',display:'flex',gap:14,alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap' }}>
                      {isLatest && (
                        <span style={{ background:'#059669',color:'white',fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:999,letterSpacing:'0.08em',textTransform:'uppercase' }}>NEW</span>
                      )}
                      {post.tags.map(tag => (
                        <span key={tag} style={{ background:'rgba(99,102,241,0.2)',color:'#a5b4fc',fontSize:9,fontWeight:600,padding:'2px 7px',borderRadius:999 }}>{tag}</span>
                      ))}
                      <span style={{ fontSize:10,color:'#475569',marginLeft:'auto' }}>{post.date}</span>
                    </div>
                    <div style={{ fontSize:14,fontWeight:700,color:'#e2e8f0',lineHeight:1.4,marginBottom:3 }}>{post.title}</div>
                    <div style={{ fontSize:11,color:'#64748b',fontStyle:'italic' }}>{post.journal}</div>
                  </div>
                  <div style={{ color:'#475569',fontSize:18,fontWeight:300,flexShrink:0,marginTop:2,transition:'transform 0.2s',transform:isOpen?'rotate(90deg)':'none' }}>›</div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding:'0 18px 18px',borderTop:'1px solid #1e3a5f' }}>

                    {/* Citation */}
                    <div style={{ padding:'10px 12px',background:'rgba(255,255,255,0.03)',borderRadius:7,marginTop:12,marginBottom:14 }}>
                      <span style={{ fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em' }}>Citation  </span>
                      <span style={{ fontSize:11,color:'#94a3b8',lineHeight:1.6 }}>{post.citation}</span>
                    </div>

                    {/* Summary bullets */}
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Summary</div>
                      {post.summary.map((bullet, bi) => (
                        <div key={bi} style={{ display:'flex',gap:8,marginBottom:6 }}>
                          <span style={{ color:'#059669',fontWeight:700,fontSize:13,flexShrink:0,marginTop:1 }}>›</span>
                          <span style={{ fontSize:13,color:'#cbd5e1',lineHeight:1.7 }}>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    {/* Key takeaway */}
                    <div style={{ background:'linear-gradient(135deg,rgba(5,150,105,0.15),rgba(6,95,70,0.1))',border:'1px solid rgba(5,150,105,0.3)',borderRadius:8,padding:'10px 14px',marginBottom:post.link?12:0 }}>
                      <span style={{ fontSize:10,fontWeight:800,color:'#059669',textTransform:'uppercase',letterSpacing:'0.08em' }}>🔑 Key Takeaway  </span>
                      <span style={{ fontSize:13,color:'#a7f3d0',lineHeight:1.6,fontWeight:500 }}>{post.keyTakeaway}</span>
                    </div>

                    {/* PubMed link */}
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex',alignItems:'center',gap:5,marginTop:10,padding:'6px 12px',borderRadius:7,border:'1px solid #1e3a5f',background:'rgba(255,255,255,0.04)',color:'#60a5fa',fontSize:11,fontWeight:600,textDecoration:'none' }}>
                        🔗 Search on Google Scholar →
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 24px',borderTop:'1px solid #1e293b',flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <span style={{ fontSize:10,color:'#475569',fontStyle:'italic' }}>Add new posts to the top of RESEARCH_POSTS in page.js — use Google Scholar links</span>
          <span style={{ fontSize:10,color:'#334155' }}>{RESEARCH_POSTS.length} post{RESEARCH_POSTS.length !== 1 ? 's' : ''}</span>
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

Be concise and clinically actionable. Use WHO 2020 bone tumor classification, Kransdorf/Murphey criteria, and USP6 family recognition criteria (Broski & Wenger, Skeletal Radiol 2023).

IMPORTANT: If the pattern fits a USP6-driven neoplasm (myositis ossificans, ABC, nodular fasciitis, FOPD, fibroma of tendon sheath), explicitly flag this in your response with a USP6 FAMILY ALERT. These lesions mimic malignancy but are benign.`;

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
function ReferencePanel({ selectedBodyPart, modality = 'MRI', darkMode = false }) {
  const jointData = getEffectiveJointData(selectedBodyPart, modality);
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
            {(jointData.measurements||[]).map(m => (
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
          <div style={{ fontSize:10,fontWeight:800,color:'#ef4444',letterSpacing:'0.1em',marginBottom:6 }}>⚠️ DID YOU CHECK THE LUNG?</div>
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
          <div style={{ fontSize:10,fontWeight:800,color:'#ef4444',letterSpacing:'0.1em',marginBottom:6 }}>⚠️ DID YOU CHECK THE GU SYSTEM?</div>
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
  const [showResearch, setShowResearch] = useState(false);
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
  const [layPersonSummary, setLayPersonSummary] = useState(false);
  const [includeDoseOpt, setIncludeDoseOpt] = useState(true);
  const WEBSITE_URL = 'https://mri-reporting.vercel.app'; // update to your actual patient-facing URL

  const showSide = !BILATERAL.includes(selectedBodyPart);
  const isCT = modality === 'CT';
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
      const layPersonInstruction = layPersonSummary
        ? `\n\nADDITIONAL SECTION — IMPORTANT: After you have completed the full formal radiology report including TECHNIQUE, FINDINGS, IMPRESSION, and any REFERENCES/FOOTNOTE sections, append one final separate section at the very end. Do not modify the formal report sections in any way. The additional section must begin with the exact header "UNDERSTANDING YOUR RESULTS:" on its own line in ALL CAPS. Then write 2-5 plain-language sentences summarizing the key findings for a patient with a high school education. Rules: no medical jargon — use "wear and tear" not "osteoarthritis", "cartilage damage" not "chondromalacia", "torn" not "ruptured", "fluid buildup" not "effusion", "pinched nerve" not "radiculopathy". Be clear but reassuring in tone. Do not repeat the formal impression verbatim. After the sentences, on a new line, write exactly: PROVIDER_LINK`
        : '';
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:2000,
          system: buildPrompt(selectedBodyPart, lat, contrast, spineRegion, modality, includeDoseOpt) + layPersonInstruction,
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
      {showResearch && <ResearchModal onClose={() => setShowResearch(false)} />}

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

          {/* Latest MSK Research button */}
          <button onClick={() => setShowResearch(true)}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(16,185,129,0.5)',background:'rgba(16,185,129,0.12)',color:'#6ee7b7',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)' }}>
            <span>📰</span> Latest MSK Research
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
                  {BODY_PARTS.map(b => {
                    const LABELS = {'femur/thigh':'Femur / Thigh','tibia/fibula':'Tibia / Fibula','humerus':'Humerus','forearm':'Forearm'};
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
            {isCT && (
              <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'7px 10px',borderRadius:7,border:'1px solid '+(includeDoseOpt?(dm?'#164e63':'#a5f3fc'):(dm?'#334155':'#e2e8f0')),background:includeDoseOpt?(dm?'#0c2d36':'#ecfeff'):(dm?'#0f172a':'#f8fafc'),transition:'all 0.15s' }}>
                <input type="checkbox" checked={includeDoseOpt} onChange={e=>setIncludeDoseOpt(e.target.checked)} style={{ width:14,height:14,accentColor:'#0891b2',cursor:'pointer' }}/>
                <span style={{ fontSize:11,fontWeight:600,color:includeDoseOpt?(dm?'#22d3ee':'#0e7490'):(dm?'#64748b':'#64748b') }}>Include dose optimization sentence</span>
              </label>
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
                value={dictationText} onChange={e => setDictationText(e.target.value)} placeholder={`Type or dictate ${isCT?'CT':'MRI'} findings here…`} />
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
          {colHdr(isCT ? 'linear-gradient(135deg,#0e7490,#0891b2)' : 'linear-gradient(135deg,#1d4ed8,#4f46e5)', isCT ? '🦴' : '📐', isCT ? 'CT Fracture Classification' : 'MRI Grading Reference')}
          <div className="msk-ref-panel" style={{ padding:16,flex:1,overflowY:'auto' }}>
            <ReferencePanel selectedBodyPart={selectedBodyPart} modality={modality} dm={dm} />
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
