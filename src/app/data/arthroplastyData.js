'use client';

// ─── ARTHROPLASTY DATA ────────────────────────────────────────────────────────
// ARTHROPLASTY_DATA and ArthroplastyPanel extracted from page.js

// ─── ARTHROPLASTY MODULE ─────────────────────────────────────────────────────
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
        ],
        gradings: [
          {
            id: 'sirveaux',
            label: 'Sirveaux Classification — Inferior Scapular Notching (rTSA)',
            description: 'Sirveaux classification grades inferior scapular notching in reverse TSA. Assessed on CT coronal/axial images and X-ray. Key prognostic factor for glenosphere/baseplate loosening and long-term failure.',
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

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
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


export { ARTHROPLASTY_DATA, ARTHROPLASTY_JOINTS, ArthroplastyPanel };
