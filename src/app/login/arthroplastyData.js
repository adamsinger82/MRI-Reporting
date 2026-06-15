'use client';

// ─── ARTHROPLASTY DATA ───────────────────────────────────────────────────────
// Extracted from page.js. Used by ArthroplastyPanel and related logic.

const ARTHROPLASTY_DATA = {
  shoulder: {
    label: 'Shoulder Arthroplasty',
    types: [
      { id: 'rtsa', label: 'Reverse TSA (rTSA)' },
      { id: 'atsa', label: 'Anatomic TSA (aTSA)' },
      { id: 'hemi', label: 'Hemiarthroplasty' },
    ],
    complications: {
      rtsa: {
        label: 'rTSA Complications',
        items: [
          { id: 'rtsa_acromial', label: 'Acromial / scapular spine stress reaction or fracture', critical: true },
          { id: 'rtsa_notching', label: 'Inferior scapular notching (Sirveaux grade ___)', critical: false },
          { id: 'rtsa_dislocation', label: 'Dislocation / instability', critical: true },
          { id: 'rtsa_loosening_glenoid', label: 'Glenosphere / baseplate loosening (osteolysis, radiolucent lines)', critical: false },
          { id: 'rtsa_loosening_humeral', label: 'Humeral stem loosening (periprosthetic osteolysis)', critical: false },
          { id: 'rtsa_ppf', label: 'Periprosthetic fracture', critical: true },
          { id: 'rtsa_infection', label: 'Periprosthetic joint infection (cortical erosion, periosteal reaction)', critical: true },
          { id: 'rtsa_malposition', label: 'Component malposition (version / inclination)', critical: false },
          { id: 'rtsa_notch_adv', label: 'Humeral stem subsidence', critical: false },
          { id: 'rtsa_cement', label: 'Cement mantle fracture / hardware failure (screw fracture)', critical: false },
          { id: 'rtsa_stress', label: 'Stress shielding / cortical thinning (humeral shaft)', critical: false },
          { id: 'rtsa_het_oss', label: 'Heterotopic ossification', critical: false },
          { id: 'rtsa_liner_dissoc', label: 'Polyethylene liner dissociation from the humeral tray (loss of glenosphere-humeral component spacing — may preclude closed reduction)', critical: true },
          { id: 'rtsa_metallosis', label: 'Metallosis / metal debris reaction (synovitis, dark periprosthetic tissue/fluid)', critical: false },
        ],
        gradings: [
          {
            id: 'sirveaux',
            label: 'Sirveaux Classification — Inferior Scapular Notching (rTSA)',
            description: 'Sirveaux classification grades inferior scapular notching in reverse TSA. Assessed on CT coronal/axial images and X-ray. Key prognostic factor for glenosphere/baseplate loosening and long-term failure.',
            image: { src: '/images/msk/scap_notching_grade.jpg', caption: 'Sirveaux grading reference — inferior scapular notch progression relative to the inferior baseplate screw.' },
            grades: [
              { grade: 'Grade 0', desc: 'No notching — normal scapular neck' },
              { grade: 'Grade 1', desc: 'Notch within the pillar of the scapula (inferior to inferior screw hole)' },
              { grade: 'Grade 2', desc: 'Notch reaching the inferior screw' },
              { grade: 'Grade 3', desc: 'Notch beyond the inferior screw — superior to it' },
              { grade: 'Grade 4', desc: 'Notch reaching the baseplate — osteolysis behind baseplate, risk of loosening' },
            ],
            citation: 'Sirveaux F et al. Grammont inverted total shoulder arthroplasty in the treatment of glenohumeral osteoarthritis with massive rupture of the cuff. J Bone Joint Surg Br 2004;86(3):388-395.',
          },
          {
            id: 'wright_cofield',
            label: 'Wright & Cofield Classification — Periprosthetic Humeral Fracture',
            description: 'Wright & Cofield classification specifically designed for periprosthetic humeral fractures in shoulder arthroplasty (TSA, rTSA, hemiarthroplasty). Based on fracture location relative to the humeral stem tip. CT essential for characterizing bone stock and stem stability.',
            grades: [
              { grade: 'Type A', desc: 'Fracture at the stem TIP or at any level PROXIMAL to the tip — cortex breached at or above tip; stem usually stable; ORIF with plate and cerclage wires' },
              { grade: 'Type B', desc: 'Fracture spanning the stem TIP — fracture extends both proximal and distal to stem tip; assess stem stability: stable → ORIF; unstable → revision long-stem prosthesis' },
              { grade: 'Type C', desc: 'Fracture entirely DISTAL to the stem tip — treat as independent diaphyseal fracture; standard ORIF; no revision needed unless stem loosened by fracture' },
            ],
            citation: 'Wright TW & Cofield RH. Humeral fractures after shoulder arthroplasty. J Bone Joint Surg Am 1995;77(9):1340-1346.',
          },
          {
            id: 'goutallier_rtsa',
            label: 'Goutallier Classification — Rotator Cuff Fatty Infiltration (Preop Planning)',
            description: 'Grades fatty infiltration of the rotator cuff musculature on CT/MRI. Higher grades (3–4) predict poor cuff function and favor reverse over anatomic TSA. Part of the preoperative rotator cuff arthropathy (RCA) assessment alongside Hamada and Favard.',
            image: { src: '/images/msk/RCA_glenoid_wear.jpg', caption: 'Rotator cuff arthropathy — glenoid wear and cuff musculature assessment used for Goutallier, Hamada, and Favard grading.' },
            grades: [
              { grade: 'Grade 0', desc: 'Normal muscle — no fat' },
              { grade: 'Grade 1', desc: 'Some fatty streaks within the muscle' },
              { grade: 'Grade 2', desc: 'Fat content less than muscle (< 50%)' },
              { grade: 'Grade 3', desc: 'Fat content equal to muscle (~50%)' },
              { grade: 'Grade 4', desc: 'Fat content greater than muscle (> 50%)' },
              { grade: 'Surgical relevance', desc: 'Grade ≥ 3 for the infraspinatus/teres minor strongly favors rTSA over aTSA in cuff tear arthropathy' },
            ],
            citation: 'Goutallier D et al. Fatty muscle degeneration in cuff ruptures: pre- and postoperative evaluation by CT scan. Clin Orthop Relat Res 1994;(304):78-83.',
          },
          {
            id: 'hamada',
            label: 'Hamada Classification — Cuff Tear Arthropathy',
            description: 'Stages the severity of cuff tear arthropathy (CTA) based on acromiohumeral interval narrowing and secondary glenohumeral degenerative change. Grades 4–5 represent advanced CTA and are a primary indication for rTSA.',
            image: { src: '/images/msk/RCA_glenoid_wear.jpg', caption: 'Rotator cuff arthropathy — glenoid wear and cuff musculature assessment used for Goutallier, Hamada, and Favard grading.' },
            grades: [
              { grade: 'Grade 1', desc: 'Acromiohumeral interval (AHI) > 6 mm; no degenerative change' },
              { grade: 'Grade 2', desc: 'AHI ≤ 5 mm (narrowed); no degenerative change' },
              { grade: 'Grade 3', desc: '"Acetabularization" — concave remodeling of the acromion undersurface articulating with the humeral head' },
              { grade: 'Grade 4A', desc: 'Glenohumeral arthritis (osteophytes/sclerosis) WITHOUT acetabularization' },
              { grade: 'Grade 4B', desc: 'Glenohumeral arthritis WITH acetabularization' },
              { grade: 'Grade 5', desc: '"Femoralization" — collapse/rounding of the humeral head articulating with the acetabularized acromion' },
            ],
            citation: 'Hamada K et al. Roentgenographic findings in massive rotator cuff tears: a long-term observation. Clin Orthop Relat Res 1990;(254):92-96; modified by Hamada K et al. J Shoulder Elbow Surg 2011.',
          },
          {
            id: 'favard',
            label: 'Favard Classification — Glenoid Erosion in Cuff Tear Arthropathy',
            description: 'Describes the pattern of glenoid erosion in cuff tear arthropathy, distinguishing concentric (central) from eccentric (superior) wear patterns. Erosion pattern guides glenoid component selection (e.g., bone grafting, augmented baseplate) in rTSA.',
            image: { src: '/images/msk/RCA_glenoid_wear.jpg', caption: 'Rotator cuff arthropathy — glenoid wear and cuff musculature assessment used for Goutallier, Hamada, and Favard grading.' },
            grades: [
              { grade: 'E0', desc: 'No erosion — concentric glenoid' },
              { grade: 'E1', desc: 'Mild concentric erosion — erosion center remains medial to the base of the coracoid' },
              { grade: 'E2', desc: 'Severe concentric erosion — erosion extends medial to the coracoid base' },
              { grade: 'E3', desc: 'Mild superior (eccentric) erosion — biconcave glenoid' },
              { grade: 'E4', desc: 'Severe superior (eccentric) erosion — significant superior glenoid bone loss' },
            ],
            citation: 'Favard L et al. Reverse prostheses in arthropathies with cuff tear: are survivorship and function maintained over time? Clin Orthop Relat Res 2011;469(9):2469-2475.',
          },
        ],
      },
      atsa: {
        label: 'aTSA Complications',
        items: [
          { id: 'atsa_glenoid_loose', label: 'Glenoid component loosening (esp. polyethylene-backed — "rocking horse" sign, radiolucent lines)', critical: true },
          { id: 'atsa_humeral_loose', label: 'Humeral stem loosening (periprosthetic osteolysis)', critical: false },
          { id: 'atsa_ppf', label: 'Periprosthetic fracture', critical: true },
          { id: 'atsa_cuff', label: 'Rotator cuff tearing / superior escape (humeral head migration)', critical: false },
          { id: 'atsa_dislocation', label: 'Dislocation / subluxation', critical: true },
          { id: 'atsa_overstuff', label: 'Overstuffing (glenohumeral offset > 56 mm; altered mechanics)', critical: false },
          { id: 'atsa_infection', label: 'Periprosthetic joint infection', critical: true },
          { id: 'atsa_malposition', label: 'Component malposition (glenoid retroversion, humeral version)', critical: false },
          { id: 'atsa_cement', label: 'Cement mantle fracture / peg fracture (keeled glenoid)', critical: false },
          { id: 'atsa_stress', label: 'Stress shielding / cortical thinning', critical: false },
          { id: 'atsa_het_oss', label: 'Heterotopic ossification', critical: false },
          { id: 'atsa_glenoid_wear', label: 'Progressive glenoid bone loss / eccentric wear', critical: false },
          { id: 'atsa_metallosis', label: 'Metallosis / metal debris reaction (fractured metal-backed glenoid component, synovitis, periarticular erosion)', critical: true },
        ],
        gradings: [
          {
            id: 'wright_cofield_atsa',
            label: 'Wright & Cofield Classification — Periprosthetic Humeral Fracture',
            description: 'Wright & Cofield classification for periprosthetic humeral fractures after shoulder arthroplasty. Location relative to stem tip determines surgical strategy. CT clarifies fracture morphology and stem fixation status.',
            grades: [
              { grade: 'Type A', desc: 'Fracture at or PROXIMAL to stem tip — stem usually stable; ORIF with plate and cerclage' },
              { grade: 'Type B', desc: 'Fracture spanning the stem TIP — stability determines approach: stable → ORIF; unstable → long-stem revision' },
              { grade: 'Type C', desc: 'Fracture DISTAL to stem tip — independent fracture management; ORIF without stem revision (unless loosened)' },
            ],
            citation: 'Wright TW & Cofield RH. Humeral fractures after shoulder arthroplasty. J Bone Joint Surg Am 1995;77(9):1340-1346.',
          },
        ],
      },
      hemi: {
        label: 'Hemiarthroplasty Complications',
        items: [
          { id: 'hemi_loose', label: 'Humeral stem loosening (periprosthetic osteolysis, subsidence)', critical: false },
          { id: 'hemi_glenoid_wear', label: 'Native glenoid erosion / wear (concentric vs. eccentric pattern)', critical: false },
          { id: 'hemi_cuff', label: 'Rotator cuff tearing / superior migration of humeral head', critical: false },
          { id: 'hemi_ppf', label: 'Periprosthetic fracture', critical: true },
          { id: 'hemi_dislocation', label: 'Dislocation / subluxation', critical: true },
          { id: 'hemi_overstuff', label: 'Overstuffing (excessive head size — glenohumeral incongruency)', critical: false },
          { id: 'hemi_infection', label: 'Periprosthetic joint infection', critical: true },
          { id: 'hemi_malposition', label: 'Component malposition (retroversion, head height)', critical: false },
          { id: 'hemi_cement', label: 'Cement mantle fracture', critical: false },
          { id: 'hemi_het_oss', label: 'Heterotopic ossification', critical: false },
          { id: 'hemi_avascular', label: 'Humeral head avascular necrosis (residual native bone) — if hemi for AVN', critical: false },
        ],
        gradings: [
          {
            id: 'wright_cofield_hemi',
            label: 'Wright & Cofield Classification — Periprosthetic Humeral Fracture',
            description: 'Wright & Cofield classification for periprosthetic humeral fractures after hemiarthroplasty. Same framework as for TSA variants.',
            grades: [
              { grade: 'Type A', desc: 'Fracture at or PROXIMAL to stem tip — ORIF with plate and cerclage wires; stem typically stable' },
              { grade: 'Type B', desc: 'Fracture spanning the stem TIP — assess stability: stable → ORIF; unstable → long-stem revision prosthesis' },
              { grade: 'Type C', desc: 'Fracture DISTAL to stem tip — standard diaphyseal ORIF; no prosthetic revision required' },
            ],
            citation: 'Wright TW & Cofield RH. Humeral fractures after shoulder arthroplasty. J Bone Joint Surg Am 1995;77(9):1340-1346.',
          },
        ],
      },
    },
  },
  hip: {
    label: 'Total Hip Arthroplasty (THA)',
    types: [
      { id: 'tha', label: 'Total Hip Arthroplasty (THA)' },
    ],
    complications: {
      tha: {
        label: 'THA Complications',
        items: [
          { id: 'tha_particle', label: 'Particle disease / osteolysis (focal periprosthetic bone loss — acetabulum, proximal femur)', critical: false },
          { id: 'tha_metallosis', label: 'Adverse local tissue reaction (ALTR) / metallosis (MoM or taper corrosion — soft tissue mass / fluid)', critical: true },
          { id: 'tha_liner_wear', label: 'Polyethylene liner wear (asymmetric femoral head position in acetabular shell)', critical: false },
          { id: 'tha_ppf', label: 'Periprosthetic fracture (Vancouver classification)', critical: true },
          { id: 'tha_dislocation', label: 'Dislocation / instability', critical: true },
          { id: 'tha_liner_disp', label: 'Polyethylene liner displacement / dissociation from shell', critical: true },
          { id: 'tha_het_oss', label: 'Heterotopic ossification (Brooker classification)', critical: false },
          { id: 'tha_acetab_loose', label: 'Acetabular component loosening (shell migration, radiolucent lines Zones I–III)', critical: false },
          { id: 'tha_femoral_loose', label: 'Femoral stem loosening (radiolucent lines Gruen Zones 1–14)', critical: false },
          { id: 'tha_trunnion', label: 'Trunnion corrosion (taper junction — mixed MoP / MoM heads)', critical: false },
          { id: 'tha_iliopsoas', label: 'Iliopsoas impingement (anterior cup overhang — groin pain)', critical: false },
          { id: 'tha_ip_bursitis', label: 'Iliopsoas bursitis (peritendinous fluid collection, often from cup overhang/impingement)', critical: false },
          { id: 'tha_acetab_malpos', label: 'Acetabular component malposition (inclination / anteversion)', critical: false },
          { id: 'tha_infection', label: 'Periprosthetic joint infection', critical: true },
          { id: 'tha_pseudo', label: 'Pseudotumor (ALTR solid/cystic mass — MoM or trunnion)', critical: true },
          { id: 'tha_stress', label: 'Stress shielding / proximal femoral cortical thinning', critical: false },
        ],
        gradings: [
          {
            id: 'vancouver',
            label: 'Vancouver Classification — Periprosthetic Femoral Fracture (THA)',
            description: 'Vancouver classification for periprosthetic femoral fractures in THA. Determines surgical strategy based on fracture location, stem stability, and bone stock. CT defines fracture morphology and bone quality.',
            image: { src: '/images/msk/PPF_THA_fem.jpg', caption: 'Example: Vancouver B-type periprosthetic femoral fracture at the level of the femoral stem.' },
            grades: [
              { grade: 'Type A (trochanteric)', desc: 'AG = greater trochanter; AL = lesser trochanter; usually stable stem; fixation ± cabling' },
              { grade: 'Type B1', desc: 'Fracture at/around stem, STABLE implant — ORIF (plate/cerclage); good bone stock' },
              { grade: 'Type B2', desc: 'Fracture at/around stem, UNSTABLE implant — revision stem (long/cemented) + ORIF if needed' },
              { grade: 'Type B3', desc: 'Fracture at/around stem, UNSTABLE + poor bone — revision stem + proximal femoral replacement or allograft' },
              { grade: 'Type C', desc: 'Fracture DISTAL to stem — treat as independent fracture; ORIF without revision' },
            ],
            citation: 'Duncan CP & Masri BA. Fractures of the femur after hip replacement. J Bone Joint Surg Br 1995;77:S199-S202.',
          },
          {
            id: 'brooker',
            label: 'Brooker Classification — Heterotopic Ossification (THA)',
            description: 'Brooker classification of heterotopic ossification following THA. Assessed on CT axial/coronal images (or AP pelvis radiograph). Grades III–IV associated with functional limitation.',
            grades: [
              { grade: 'Class I', desc: 'Bone islands in soft tissues around hip; isolated calcification' },
              { grade: 'Class II', desc: 'Bone spurs from pelvis or proximal femur; gap >1 cm between opposing surfaces' },
              { grade: 'Class III', desc: 'Bone spurs from pelvis or proximal femur; gap <1 cm between opposing bone surfaces' },
              { grade: 'Class IV', desc: 'Apparent bony ankylosis of hip — radiographic ankylosis (CT confirms true ankylosis vs. bridging)' },
            ],
            citation: 'Brooker AF et al. Ectopic ossification following total hip replacement. J Bone Joint Surg Am 1973;55(8):1629-1632.',
          },
          {
            id: 'gruen',
            label: 'Gruen Zones — Femoral Component Radiolucent Lines',
            description: 'Gruen 14-zone system for femoral stem radiolucent line reporting. Zones 1–7 on AP, Zones 8–14 on lateral. Progressive or complete radiolucent lines suggest loosening.',
            grades: [
              { grade: 'Zones 1–7 (AP)', desc: '1: proximal lateral; 2: lateral mid; 3: distal lateral; 4: distal tip; 5: distal medial; 6: medial mid; 7: proximal medial (calcar)' },
              { grade: 'Zones 8–14 (Lateral)', desc: 'Mirror image on lateral view — 8 anterior proximal through 14 posterior proximal' },
              { grade: 'Interpretation', desc: 'Stable fibrous ingrowth: thin uniform line. Loosening: progressive ≥2 mm line, pedestal at stem tip, cortical hypertrophy distal, varus stem migration' },
            ],
            citation: 'Gruen TA et al. "Modes of failure" of cemented stem-type femoral components. Clin Orthop 1979;(141):17-27.',
          },
          {
            id: 'delee_charnley',
            label: 'DeLee & Charnley Zones — Acetabular Component Radiolucent Lines',
            description: 'DeLee & Charnley 3-zone system for acetabular cup radiolucent lines. Zone III (medial) loosening most concerning. Migrated cup or progressive lines → loosening.',
            grades: [
              { grade: 'Zone I (superior)', desc: 'Superior zone; radiolucent line here common, less concerning if isolated' },
              { grade: 'Zone II (medial)', desc: 'Medial zone (pelvic floor); progressive lines suggest migration risk' },
              { grade: 'Zone III (inferior)', desc: 'Inferior/lateral zone; complete circumferential lucency = high loosening probability' },
              { grade: 'Loosening criteria', desc: 'Migration >2 mm, change in cup inclination >3°, or progressive radiolucent lines in all 3 zones' },
            ],
            citation: 'DeLee JG & Charnley J. Radiological demarcation of cemented sockets in total hip replacement. Clin Orthop 1976;(121):20-32.',
          },
        ],
      },
    },
  },
  knee: {
    label: 'Total Knee Arthroplasty (TKA)',
    types: [
      { id: 'tka', label: 'Total Knee Arthroplasty (TKA)' },
    ],
    complications: {
      tka: {
        label: 'TKA Complications',
        items: [
          { id: 'tka_particle', label: 'Particle disease / osteolysis (periprosthetic bone loss — femoral / tibial / patellar)', critical: false },
          { id: 'tka_liner_wear', label: 'Polyethylene tibial insert / patellar button wear (component height asymmetry)', critical: false },
          { id: 'tka_ppf', label: 'Periprosthetic fracture (supracondylar femur, tibia, patella)', critical: true },
          { id: 'tka_patellar_disp', label: 'Patellar button displacement / dissociation / maltracking', critical: true },
          { id: 'tka_metallosis', label: 'Metallosis (corrosion debris — rare; dark periprosthetic fluid/tissue on MRI)', critical: false },
          { id: 'tka_extensor', label: 'Extensor mechanism failure (patellar tendon / quadriceps rupture)', critical: true },
          { id: 'tka_femoral_loose', label: 'Femoral component loosening (radiolucent lines, component migration)', critical: false },
          { id: 'tka_tibial_loose', label: 'Tibial baseplate loosening / subsidence (varus collapse, radiolucent lines)', critical: false },
          { id: 'tka_patellar_loose', label: 'Patellar component loosening (bone-cement interface)', critical: false },
          { id: 'tka_malrotation', label: 'Component malrotation (tibial internal rotation — CT-measured relative to tibial axis)', critical: false },
          { id: 'tka_infection', label: 'Periprosthetic joint infection', critical: true },
          { id: 'tka_cement', label: 'Cement mantle fracture / hardware failure', critical: false },
          { id: 'tka_arthrofibrosis', label: 'Arthrofibrosis / posterior capsule calcification', critical: false },
          { id: 'tka_stress_shielding', label: 'Stress shielding / distal femoral cortical thinning', critical: false },
          { id: 'tka_stiffness', label: 'Flexion space imbalance / posterior condylar offset alteration', critical: false },
          { id: 'tka_vascular', label: 'Vascular injury — pseudoaneurysm (recurrent hemarthrosis, contrast blush along posterior capsule communicating with the joint)', critical: true },
        ],
        gradings: [
          {
            id: 'felix',
            label: 'Felix Classification — Periprosthetic Patellar Fracture (TKA)',
            description: 'Felix classification for periprosthetic patellar fractures following TKA. Guides surgical management based on implant stability and extensor mechanism integrity.',
            grades: [
              { grade: 'Type I', desc: 'Fracture with STABLE implant, intact extensor mechanism — non-operative' },
              { grade: 'Type II', desc: 'Fracture with STABLE implant, DISRUPTED extensor mechanism — surgical repair' },
              { grade: 'Type III', desc: 'Fracture with LOOSE patellar component — revision arthroplasty' },
              { grade: 'Type IV', desc: 'Fracture at patellar "pole" — treat like soft tissue injury ± excision of fragment' },
            ],
            citation: 'Felix NA et al. Periprosthetic fractures of the patella. Clin Orthop 1997;(345):165-175.',
          },
          {
            id: 'su',
            label: 'Su Classification — Periprosthetic Distal Femur Fracture (TKA)',
            description: 'Su classification for supracondylar/periprosthetic distal femoral fractures in TKA. Based on fracture location relative to femoral component.',
            grades: [
              { grade: 'Type I', desc: 'Fracture entirely PROXIMAL to femoral component (above stem/box) — ORIF with plate/nail; stable component' },
              { grade: 'Type II', desc: 'Fracture begins AT proximal end of femoral component — ORIF; component stability assessed intraoperatively' },
              { grade: 'Type III', desc: 'Fracture WITHIN component housing — revision arthroplasty with distal femoral replacement' },
            ],
            citation: 'Su ET et al. Periprosthetic femoral fractures above total knee replacements. J Arthroplasty 2004;19(4):386-393.',
          },
          {
            id: 'aori',
            label: 'AORI Classification — Bone Loss in Revision TKA',
            description: 'Anderson Orthopaedic Research Institute (AORI) classification for bone defects encountered at revision TKA. Guides selection of revision implant and augmentation strategy. CT essential for preoperative planning.',
            grades: [
              { grade: 'Type I (Femur or Tibia)', desc: 'Minor bone loss — intact metaphyseal bone; standard primary component may work' },
              { grade: 'Type IIA', desc: 'Moderate defect involving ONE condyle/plateau — contained or cavitary; augment blocks sufficient' },
              { grade: 'Type IIB', desc: 'Moderate defect involving BOTH condyles/plateaus — structural augment or bulk allograft' },
              { grade: 'Type III', desc: 'Severe defect — entire condyle/plateau deficient; may affect collateral ligament origin; distal femoral/proximal tibial replacement required' },
            ],
            citation: 'Engh GA & Ammeen DJ. Bone loss with revision total knee arthroplasty. J Bone Joint Surg Am 1999;81(10):1434-1438.',
          },
          {
            id: 'rorabeck',
            label: 'Rorabeck Classification — Periprosthetic Distal Femur Fracture',
            description: 'Rorabeck & Taylor classification for periprosthetic distal femoral fractures — precursor to Su, still widely cited.',
            grades: [
              { grade: 'Type I', desc: 'Undisplaced fracture, STABLE component — conservative or ORIF' },
              { grade: 'Type II', desc: 'Displaced fracture (>5 mm or >5°), STABLE component — ORIF' },
              { grade: 'Type III', desc: 'Displaced fracture, UNSTABLE or failed component — revision arthroplasty' },
            ],
            citation: 'Rorabeck CH & Taylor JW. Periprosthetic fractures of the femur complicating total knee arthroplasty. Orthop Clin North Am 1999;30(2):265-277.',
          },
        ],
      },
    },
  },
};

const ARTHROPLASTY_JOINTS = ['shoulder', 'hip', 'knee'];

// ─── EXAMPLE IMAGES ──────────────────────────────────────────────────────────
// Keyed by checklist item id. Single image: {src, caption}. Multiple: {images:[{src,caption}, ...]}
const ARTHROPLASTY_EXAMPLE_IMAGES = {
  // ── Hip (THA) ──────────────────────────────────────────────────────────────
  tha_pseudo: {
    src: '/images/msk/ALTR_THA.jpg',
    caption: 'Adverse local tissue reaction (ALTR) / pseudotumor in THA — solid/cystic periarticular soft tissue mass.',
  },
  tha_ip_bursitis: {
    src: '/images/msk/IP_bursitis.jpg',
    caption: 'Iliopsoas bursitis — peritendinous fluid collection anterior to the acetabular component, often related to cup overhang/impingement.',
  },
  tha_particle: {
    images: [
      { src: '/images/msk/osteolysis_THA_CT.jpg', caption: 'CT — femoral-sided osteolysis from particle disease (arrows).' },
      { src: '/images/msk/osteolysis_THA_MRI.jpg', caption: 'MRI — corresponding femoral-sided osteolysis from particle disease (arrows).' },
    ],
  },
  tha_ppf: {
    src: '/images/msk/PPF_THA_fem.jpg',
    caption: 'Periprosthetic femoral fracture, Vancouver type B (fracture at/around the stem with implant loosening).',
  },
  // ── Shoulder — Anatomic TSA (aTSA) ────────────────────────────────────────────
  atsa_glenoid_loose: {
    src: '/images/msk/failed_atsa_glenoid_out.jpg',
    caption: 'Failed aTSA — glenoid component displaced/loose ("glenoid component is out").',
  },
  atsa_overstuff: {
    src: '/images/msk/tsa_glenoid_out_overstuff.jpg',
    caption: 'Overstuffed aTSA with an oversized humeral head component, contributing to glenoid component failure.',
  },
  atsa_infection: {
    src: '/images/msk/infected_tsa.png',
    caption: 'Infected TSA — extensive periprosthetic erosions and soft tissue swelling.',
  },
  atsa_metallosis: {
    src: '/images/msk/metallosis_tsa_fractured_glenoid.jpg',
    caption: 'Fractured metal-backed glenoid component with displacement, metallosis (metal debris), and periarticular erosion.',
  },
  // ── Shoulder — Reverse TSA (rTSA) ─────────────────────────────────────────────
  rtsa_acromial: {
    src: '/images/msk/acromion_fx.jpg',
    caption: 'Acromial / scapular spine stress fracture after rTSA.',
  },
  rtsa_notching: {
    src: '/images/msk/scapular_notching.jpg',
    caption: 'Inferior scapular notching after rTSA (see Sirveaux grading for staging).',
  },
  rtsa_ppf: {
    images: [
      { src: '/images/msk/ppf_scapula_loose_hw.jpg', caption: 'Scapular periprosthetic fracture resulting in glenoid hardware loosening with abnormal cranial angulation of the glenosphere.' },
      { src: '/images/msk/ppf_humeral_rtsa.jpg', caption: 'Humeral-sided periprosthetic fracture after rTSA.' },
    ],
  },
  rtsa_liner_dissoc: {
    src: '/images/msk/polyetheylene_liner_dissociation.jpg',
    caption: 'Polyethylene liner dissociated from the humeral tray, displaced with loss of glenosphere-humeral spacing — may preclude closed reduction.',
    citation: 'Familiari F et al. Polyethylene liner dissociation after reverse shoulder arthroplasty. JSES Int 2022;7(2):247-251. https://pmc.ncbi.nlm.nih.gov/articles/PMC9998731/',
  },
  rtsa_cement: {
    src: '/images/msk/central_screw_fx_rtsa_xr.jpg',
    caption: 'Fracture of the glenoid baseplate central screw with resultant loosening and abnormal cranial angulation of the glenosphere.',
  },
  rtsa_metallosis: {
    images: [
      { src: '/images/msk/metallosis_rtsa.jpg', caption: 'Metallosis after rTSA — faint metal debris within the joint.' },
    ],
    caption: 'Arthroscopic correlation: black-stained synovium from metal debris and foreign body reaction (biopsy-proven).',
  },
  // ── Knee (TKA) ─────────────────────────────────────────────────────────────
  tka_vascular: {
    src: '/images/msk/tibial_artery_tka.jpg',
    caption: 'Recurrent hemarthrosis after TKA — contrast blush along the posterior joint capsule consistent with a pseudoaneurysm communicating with the joint, subsequently coiled.',
  },
};

export { ARTHROPLASTY_DATA, ARTHROPLASTY_JOINTS, ARTHROPLASTY_EXAMPLE_IMAGES };
