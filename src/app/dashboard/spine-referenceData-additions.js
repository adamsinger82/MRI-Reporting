// ─────────────────────────────────────────────────────────────────────────────
// SPINE ADDITIONS FOR referenceData.js
//
// HOW TO INTEGRATE:
//
// STEP 1 — In JOINT_DATA.spine.measurements[], REPLACE the entire spine block
//   (lines 687–789) with the object below.
//
// STEP 2 — In DIAGRAM_SVGS, after the 'spine-cobb' entry (around line 1985),
//   paste all the new SVG entries from the DIAGRAM_SVGS ADDITIONS section below.
//
// No other files need changes.
// ─────────────────────────────────────────────────────────────────────────────


// ═════════════════════════════════════════════════════════════════════════════
// STEP 1 — REPLACE spine: { ... } in JOINT_DATA with this entire block
// ═════════════════════════════════════════════════════════════════════════════

  spine: {
    label: 'Spine',
    measurements: [
      // ── GRADING SCALES (isGradingScale:true — fed into Claude prompt) ──────

      {
        id: 'pfirrmann',
        label: 'Pfirrmann Disc Degeneration Grade',
        plane: 'Sagittal T2',
        description: 'Five-grade MRI classification of intervertebral disc degeneration based on T2 signal intensity, homogeneity, distinction of nucleus/annulus border, and disc height. Applied per level. Dictate naturally: "L4-5 Pfirrmann grade 4" — Claude extracts this automatically.',
        isGradingScale: true,
        normalValues: [
          { label: 'Grade I',   value: 'Homogeneous bright white; clear nucleus/annulus border; normal height' },
          { label: 'Grade II',  value: 'Inhomogeneous with horizontal grey bands; clear border; normal height' },
          { label: 'Grade III', value: 'Grey, inhomogeneous; indistinct border; mild height loss possible' },
          { label: 'Grade IV',  value: 'Dark grey/black, inhomogeneous; lost border; moderate height loss' },
          { label: 'Grade V',   value: 'Black, collapsed; no nuclear/annular distinction; severe height loss' },
          { label: 'Dictation', value: 'Say level + grade: "L4-5 grade 4, L5-S1 grade 3"' },
        ],
        citations: [
          { label: "Pfirrmann CW et al. MRI classification of lumbar intervertebral disc degeneration. Spine 2001", url: "https://scholar.google.com/scholar?q=Pfirrmann+CW+lumbar+intervertebral+disc+degeneration+MRI+classification+Spine+2001" },
          { label: "Griffith JF et al. Repeatability of Pfirrmann disc grading. AJR 2007", url: "https://scholar.google.com/scholar?q=Griffith+Pfirrmann+disc+grading+repeatability+inter-observer+AJR+2007" },
        ],
        diagram: 'spine-pfirrmann',
      },

      {
        id: 'central-stenosis',
        label: 'Central Canal Stenosis (Lee Grade)',
        plane: 'Axial T2 / sagittal',
        description: 'Grades narrowing of the central spinal canal based on CSF space obliteration and cord/cauda equina contact. Applied per level, per side where relevant. Dictate: "L4-5 moderate central stenosis" — Claude extracts and formats.',
        isGradingScale: true,
        normalValues: [
          { label: 'None',     value: 'No narrowing; CSF freely surrounds neural elements' },
          { label: 'Mild',     value: 'CSF space reduced but cord/cauda not contacted' },
          { label: 'Moderate', value: 'CSF effaced; cord or cauda equina contacted but not compressed' },
          { label: 'Severe',   value: 'Cord/cauda compressed; possible cord signal change' },
          { label: 'Lumbar',   value: 'Severe = cauda equina crowding / no visible CSF' },
          { label: 'Cervical', value: 'Severe = cord flattening ± T2 signal change (myelomalacia)' },
        ],
        citations: [
          { label: "Lee S et al. Central canal stenosis grading: reliability. Spine 2008", url: "https://scholar.google.com/scholar?q=Lee+central+canal+stenosis+grading+MRI+reliability+Spine+2008" },
          { label: "Schizas C et al. Qualitative grading of severity of lumbar spinal stenosis. Eur Spine J 2010", url: "https://scholar.google.com/scholar?q=Schizas+qualitative+grading+lumbar+spinal+stenosis+MRI+2010" },
        ],
        diagram: 'spine-central-stenosis',
      },

      {
        id: 'foraminal-stenosis',
        label: 'Foraminal Stenosis (Lee Grade)',
        plane: 'Sagittal T1 / T2 + axial',
        description: 'Four-grade system based on perineural fat loss and nerve root morphologic change within the foramen. Graded per level per side. Dictate: "L4-5 right grade 2 foraminal stenosis" — Claude extracts.',
        isGradingScale: true,
        normalValues: [
          { label: 'Grade 0', value: 'Normal — perineural fat present in all planes around root' },
          { label: 'Grade 1', value: 'Fat partially effaced in one plane; root morphology preserved' },
          { label: 'Grade 2', value: 'Fat completely effaced in all planes; root morphology preserved' },
          { label: 'Grade 3', value: 'Root morphologic change — deformation, flattening, or obliteration' },
          { label: 'Dictation', value: '"Mild right L4-5 foraminal narrowing" = Grade 1–2; "severe" = Grade 3' },
        ],
        citations: [
          { label: "Lee S et al. Foraminal stenosis MRI grading. Spine 2008", url: "https://scholar.google.com/scholar?q=Lee+foraminal+stenosis+MRI+grading+lumbar+spine+2008" },
          { label: "Wildermuth S et al. Lumbar spine: quantitative and qualitative MRI assessment. Radiology 1998", url: "https://scholar.google.com/scholar?q=Wildermuth+lumbar+spine+foraminal+stenosis+MRI+qualitative+quantitative+1998" },
        ],
        diagram: 'spine-foraminal-stenosis',
      },

      {
        id: 'meyerding',
        label: 'Meyerding Spondylolisthesis Grade',
        plane: 'Sagittal',
        description: 'Grades forward slip of one vertebral body on the one below based on percent of endplate width displaced. Dictate: "Grade II anterolisthesis at L4-5" — Claude incorporates into impression.',
        isGradingScale: true,
        normalValues: [
          { label: 'Grade I',   value: '0–25% anterior slip — stable, usually conservative' },
          { label: 'Grade II',  value: '25–50% — symptomatic; surgical evaluation if unstable' },
          { label: 'Grade III', value: '50–75% — high-grade; surgical in most cases' },
          { label: 'Grade IV',  value: '75–100% — severe instability; always surgical' },
          { label: 'Grade V',   value: 'Spondyloptosis — complete anterior dislocation (>100%)' },
          { label: 'Also note', value: 'Retrolisthesis (posterior slip) graded same scale' },
        ],
        citations: [
          { label: "Meyerding HW. Spondylolisthesis. Surg Gynecol Obstet 1932", url: "https://scholar.google.com/scholar?q=Meyerding+spondylolisthesis+classification+grade+1932" },
          { label: "Kalichman L et al. Spondylolysis and spondylolisthesis. Semin Arthritis Rheum 2008", url: "https://scholar.google.com/scholar?q=Kalichman+spondylolysis+spondylolisthesis+prevalence+clinical+2008" },
        ],
        diagram: 'spine-meyerding',
      },

      {
        id: 'tlics',
        label: 'TLICS Score (Thoracolumbar Fractures)',
        plane: 'Sagittal + axial',
        description: 'Thoracolumbar Injury Classification and Severity score. Three components: injury morphology + posterior ligamentous complex (PLC) integrity + neurologic status. Dictate findings naturally — Claude calculates score and management recommendation.',
        isGradingScale: true,
        normalValues: [
          { label: 'Compression (morph)',        value: '+1 point' },
          { label: 'Burst (morph)',               value: '+2 points' },
          { label: 'Translation/rotation (morph)',value: '+3 points' },
          { label: 'Distraction (morph)',         value: '+4 points' },
          { label: 'PLC intact',                  value: '+0 points' },
          { label: 'PLC indeterminate',           value: '+2 points' },
          { label: 'PLC disrupted',               value: '+3 points' },
          { label: 'Neuro intact',                value: '+0 points' },
          { label: 'Nerve root injury',           value: '+2 points' },
          { label: 'Complete cord',               value: '+2 points' },
          { label: 'Incomplete cord',             value: '+3 points' },
          { label: 'Score ≤ 3',                   value: 'Conservative management' },
          { label: 'Score = 4',                   value: 'Surgeon discretion' },
          { label: 'Score ≥ 5',                   value: 'Surgical management recommended' },
        ],
        citations: [
          { label: "Vaccaro AR et al. TLICS: a new classification for thoracolumbar injuries. Spine 2005", url: "https://scholar.google.com/scholar?q=Vaccaro+TLICS+thoracolumbar+injury+classification+severity+Spine+2005" },
          { label: "Patel AA et al. TLICS: a new treatment paradigm. J Bone Joint Surg Am 2007", url: "https://scholar.google.com/scholar?q=Patel+TLICS+thoracolumbar+injury+classification+treatment+paradigm+2007" },
        ],
        diagram: 'spine-tlics',
      },

      // ── MEASUREMENTS (existing, unchanged) ─────────────────────────────────

      {
        id: 'modic',
        label: 'Modic Changes',
        plane: 'Sagittal T1 / T2',
        description: 'Vertebral endplate and marrow signal changes adjacent to degenerated discs. Classified by T1/T2 signal pattern.',
        normalValues: [
          { label: 'Type 1', value: 'T1↓ T2↑ — edema/inflammation (active)' },
          { label: 'Type 2', value: 'T1↑ T2↑ — fatty replacement (chronic stable)' },
          { label: 'Type 3', value: 'T1↓ T2↓ — sclerosis (end-stage)' },
          { label: 'Clinical', value: 'Type 1 correlates with discogenic pain' },
        ],
        citations: [
          { label: "Modic MT et al. Degenerative disk disease: assessment with MR imaging. Radiology 1988", url: "https://scholar.google.com/scholar?q=Modic+Steinberg+Ross+Masaryk+degenerative+disk+disease+vertebral+body+marrow+MR+imaging+1988" },
          { label: "Rahme R, Moussa R. Modic vertebral endplate and marrow changes: pathologic significance. AJNR 2008", url: "https://scholar.google.com/scholar?q=Rahme+Moussa+Modic+vertebral+endplate+marrow+changes+pathologic+significance+low+back+pain+2008" },
        ],
        diagram: 'spine-modic',
      },

      {
        id: 'disc-nomenclature',
        label: 'Disc Nomenclature',
        plane: 'Sagittal + axial T2',
        description: 'Standardized disc pathology terminology per NASS/ASSR/ASNR guidelines. Based on percent of disc extending beyond endplates.',
        normalValues: [
          { label: 'Bulge',         value: 'Broad-based: > 50% circumference, < 3 mm' },
          { label: 'Protrusion',    value: 'Focal: < 25% circumference, base > AP extent' },
          { label: 'Extrusion',     value: 'AP extent > base width (herniated nucleus)' },
          { label: 'Sequestration', value: 'Free fragment separated from parent disc' },
          { label: 'Migration',     value: 'Displaced above/below parent disc level' },
        ],
        citations: [
          { label: "Fardon DF et al. Lumbar disc nomenclature version 2.0. Spine J 2014", url: "https://scholar.google.com/scholar?q=Fardon+lumbar+disc+nomenclature+version+2+Spine+Journal+2014" },
          { label: "Jensen MC et al. MRI of the lumbar spine in asymptomatic subjects. N Engl J Med 1994", url: "https://scholar.google.com/scholar?q=Jensen+MRI+lumbar+spine+asymptomatic+subjects+disc+nomenclature+1994" },
        ],
        diagram: 'spine-disc-nomen',
      },

      {
        id: 'ao-cervical',
        label: 'AO Spine Classification — Cervical',
        plane: 'Sagittal + axial',
        description: 'AO Spine fracture classification for subaxial cervical spine (C3–C7). Based on morphology, disco-ligamentous complex, and neurological status.',
        normalValues: [
          { label: 'Type A', value: 'Compression: A0 (no Fx) → A4 (burst)' },
          { label: 'Type B', value: 'Tension band: B1 (posterior) B2 (ant PLC) B3 (ant)' },
          { label: 'Type C', value: 'Translation / dislocation (highest instability)' },
          { label: 'Modifier N', value: 'N0–N4 neurological status' },
          { label: 'Modifier F', value: 'F1–F4 facet injury' },
        ],
        citations: [
          { label: "Vaccaro AR et al. AO Spine subaxial cervical spine injury classification. Global Spine J 2016", url: "https://scholar.google.com/scholar?q=Vaccaro+AO+Spine+subaxial+cervical+injury+classification+system+2016" },
        ],
        diagram: 'spine-ao-cervical',
      },

      {
        id: 'ao-thoracolumbar',
        label: 'AO Spine Classification — Thoracolumbar',
        plane: 'Sagittal + axial',
        description: 'AO Spine fracture classification for thoracolumbar spine (T1–L5). Guides surgical vs conservative management via TLICS score.',
        normalValues: [
          { label: 'Type A', value: 'Compression: A0–A4 (A4 = burst)' },
          { label: 'Type B', value: 'Posterior band disruption: B1 (bony) B2 (PLC) B3 (ant hyper-ext)' },
          { label: 'Type C', value: 'Displacement: all 3 columns disrupted' },
          { label: 'TLICS ≤ 3', value: 'Conservative management' },
          { label: 'TLICS ≥ 5', value: 'Surgical management' },
        ],
        citations: [
          { label: "Vaccaro AR et al. AO Spine thoracolumbar fracture classification system. Spine 2013", url: "https://scholar.google.com/scholar?q=Vaccaro+AO+Spine+thoracolumbar+fracture+classification+2013" },
        ],
        diagram: 'spine-ao-tl',
      },

      {
        id: 'spinal-imbalance',
        label: 'Coronal & Sagittal Imbalance',
        plane: 'Coronal + sagittal full-length',
        description: 'Global spinal alignment parameters. Sagittal vertical axis (SVA) and coronal balance assessed on full-length standing radiographs; MRI provides structural detail.',
        normalValues: [
          { label: 'SVA (sagittal)', value: '< 50 mm (C7 plumb to S1)' },
          { label: 'Coronal balance', value: '< 20 mm (C7 to CSVL)' },
          { label: 'Pelvic incidence', value: 'PI = PT + SS (individual fixed value)' },
          { label: 'LL mismatch', value: 'PI − LL should be < 10°' },
          { label: 'Pelvic tilt', value: 'Normal < 20°; > 25° = compensation' },
        ],
        diagram: 'spine-imbalance',
      },

      {
        id: 'cobb-angle',
        label: 'Cobb Angle (Scoliosis)',
        plane: 'Coronal',
        description: 'Angle between endplates of most tilted vertebrae at curve apex. Standard measure for scoliosis severity and surgical planning.',
        normalValues: [
          { label: 'Normal',            value: '< 10°' },
          { label: 'Mild scoliosis',    value: '10–25°' },
          { label: 'Moderate',          value: '25–45°' },
          { label: 'Surgical threshold', value: '> 40–50°' },
          { label: 'Progression risk',  value: 'High if > 30° before skeletal maturity' },
        ],
        diagram: 'spine-cobb',
      },
    ],
  },


// ═════════════════════════════════════════════════════════════════════════════
// STEP 2 — PASTE these SVG entries into DIAGRAM_SVGS after 'spine-cobb'
//           i.e. after line ~1985, before the PELVIS section
// ═════════════════════════════════════════════════════════════════════════════

  // ─── PFIRRMANN DISC GRADES I–V ────────────────────────────────────────────
  'spine-pfirrmann': (
    <svg viewBox="0 0 320 210" style={{width:'100%'}} aria-label="Pfirrmann disc degeneration grades I through V">

      {/* ── grade configs ── */}
      {[
        { grade:'I',   x:8,   nucleusColor:'#d4f1f9', annulusColor:'#e8f4f8', discH:44, nucleusRy:0.52, sigText:'Bright',  sigColor:'#0ea5e9' },
        { grade:'II',  x:70,  nucleusColor:'#a8d8e8', annulusColor:'#c9e6f0', discH:40, nucleusRy:0.46, sigText:'Gray',    sigColor:'#64748b' },
        { grade:'III', x:132, nucleusColor:'#6aacbe', annulusColor:'#8fc5d4', discH:34, nucleusRy:0.38, sigText:'Dark',    sigColor:'#475569' },
        { grade:'IV',  x:194, nucleusColor:'#2d6e84', annulusColor:'#4d8fa3', discH:24, nucleusRy:0.28, sigText:'V.Dark',  sigColor:'#334155' },
        { grade:'V',   x:256, nucleusColor:'#1a3a47', annulusColor:'#2a5a6e', discH:12, nucleusRy:0.10, sigText:'Black',   sigColor:'#1a1a2e' },
      ].map(({ grade, x, nucleusColor, annulusColor, discH, nucleusRy, sigText, sigColor }) => {
        const w = 54;
        const cx = x + w / 2;
        const vbH = 28;   // vertebral body height
        const gap = 3;    // endplate gap
        const discTop = 20 + vbH + gap;
        const discCy  = discTop + discH / 2;
        const discBot = discTop + discH;

        return (
          <g key={grade}>
            {/* Upper vertebral body */}
            <rect x={x} y={20} width={w} height={vbH} rx={4}
              fill="#c8b99a" stroke="#9a8868" strokeWidth={1}/>
            {/* Upper endplate */}
            <rect x={x} y={20 + vbH} width={w} height={gap} fill="#b8a888"/>

            {/* Disc — annulus fibrosus */}
            <rect x={x} y={discTop} width={w} height={discH} rx={3}
              fill={annulusColor} stroke="#5a8a9a" strokeWidth={1}/>
            {/* Disc — nucleus pulposus (shrinks with grade) */}
            {nucleusRy > 0.12 && (
              <ellipse
                cx={cx} cy={discCy}
                rx={w * 0.38}
                ry={discH * nucleusRy}
                fill={nucleusColor} opacity={0.9}/>
            )}
            {/* Horizontal fissure lines for grades III+ */}
            {['III','IV','V'].includes(grade) && (
              <line x1={x+8} y1={discCy} x2={x+w-8} y2={discCy}
                stroke="#4a7a8a" strokeWidth={0.8} opacity={0.6}/>
            )}

            {/* Lower endplate */}
            <rect x={x} y={discBot} width={w} height={gap} fill="#b8a888"/>
            {/* Lower vertebral body */}
            <rect x={x} y={discBot + gap} width={w} height={vbH} rx={4}
              fill="#c8b99a" stroke="#9a8868" strokeWidth={1}/>

            {/* Grade label */}
            <text x={cx} y={discBot + gap + vbH + 14}
              textAnchor="middle" fontSize={11} fill="#1a1a2e" fontWeight="700">
              Grade {grade}
            </text>
            {/* Signal label */}
            <text x={cx} y={discBot + gap + vbH + 25}
              textAnchor="middle" fontSize={8} fill={sigColor}>{sigText}</text>
          </g>
        );
      })}

      {/* Height arrow brackets left side */}
      <text x="160" y="200" textAnchor="middle" fontSize={9} fill="#555" fontStyle="italic">
        Sagittal T2 — disc height and signal decrease with grade
      </text>
    </svg>
  ),

  // ─── CENTRAL CANAL STENOSIS — axial cross-sections ────────────────────────
  'spine-central-stenosis': (
    <svg viewBox="0 0 320 210" style={{width:'100%'}} aria-label="Central canal stenosis grades none mild moderate severe">
      {[
        { label:'None',     x:8,   csfFraction:0.62, cordColor:'#e8d5b0', desc:'CSF present' },
        { label:'Mild',     x:84,  csfFraction:0.42, cordColor:'#e8d5b0', desc:'CSF reduced' },
        { label:'Moderate', x:160, csfFraction:0.18, cordColor:'#e8d5b0', desc:'Cord contact' },
        { label:'Severe',   x:236, csfFraction:0.0,  cordColor:'#c0392b', desc:'Cord compressed' },
      ].map(({ label, x, csfFraction, cordColor, desc }) => {
        const w = 68; const h = 68;
        const cx = x + w / 2; const cy = 60 + h / 2;
        const boneR = 28;
        const canalRx = 18; const canalRy = 16;
        const csfRx = canalRx * csfFraction;
        const csfRy = canalRy * csfFraction;
        const cordRx = 7; const cordRy = 6;

        return (
          <g key={label}>
            {/* Bony ring */}
            <circle cx={cx} cy={cy} r={boneR} fill="#d4c9b0" stroke="#9a8868" strokeWidth={1.2}/>
            {/* Posterior spinous process */}
            <path d={`M${cx-10} ${cy - boneR * 0.85} Q${cx} ${cy - boneR * 1.3} ${cx+10} ${cy - boneR * 0.85}`}
              fill="#c8b99a" stroke="#9a8868" strokeWidth={1}/>
            {/* Spinal canal */}
            <ellipse cx={cx} cy={cy+2} rx={canalRx} ry={canalRy}
              fill="#7fb8cc" opacity={0.25}/>
            {/* CSF space */}
            {csfFraction > 0.05 && (
              <ellipse cx={cx} cy={cy+2} rx={Math.max(csfRx, 1)} ry={Math.max(csfRy, 1)}
                fill="#d4f1f9" opacity={0.9}/>
            )}
            {/* Spinal cord / cauda */}
            <ellipse cx={cx} cy={cy+2} rx={cordRx} ry={cordRy}
              fill={cordColor} stroke={label==='Severe'?'#991b1b':'#b89070'} strokeWidth={0.8}/>
            {/* Facet joints */}
            {[[-1],[1]].map(([s],i) => (
              <ellipse key={i} cx={cx + s * boneR * 0.82} cy={cy + boneR * 0.55}
                rx={5} ry={3} fill="#c8b99a" stroke="#9a8868" strokeWidth={0.5}/>
            ))}

            <text x={cx} y={cy + boneR + 18}
              textAnchor="middle" fontSize={10} fill="#1a1a2e" fontWeight="700">{label}</text>
            <text x={cx} y={cy + boneR + 29}
              textAnchor="middle" fontSize={8}
              fill={label==='Severe'?'#c0392b':label==='Moderate'?'#d97706':'#16a34a'}>{desc}</text>
          </g>
        );
      })}

      <text x="160" y="200" textAnchor="middle" fontSize={9} fill="#555" fontStyle="italic">
        Axial T2 — Lee grading system, CSF obliteration left→right
      </text>
    </svg>
  ),

  // ─── FORAMINAL STENOSIS — sagittal foramen cross-sections ─────────────────
  'spine-foraminal-stenosis': (
    <svg viewBox="0 0 320 210" style={{width:'100%'}} aria-label="Foraminal stenosis grades 0 through 3">
      {[
        { grade:'0', label:'Normal',   x:8,  fatOpacity:0.9, rootColor:'#e8d5b0', fatColor:'#fef3c7', desc:'Fat all planes' },
        { grade:'1', label:'Grade 1',  x:84, fatOpacity:0.6, rootColor:'#e8d5b0', fatColor:'#fde68a', desc:'Fat partially lost' },
        { grade:'2', label:'Grade 2',  x:160,fatOpacity:0.2, rootColor:'#e8d5b0', fatColor:'#fbbf24', desc:'Fat effaced' },
        { grade:'3', label:'Grade 3',  x:236,fatOpacity:0.0, rootColor:'#c0392b', fatColor:'#ef4444', desc:'Root deformed' },
      ].map(({ grade, label, x, fatOpacity, rootColor, fatColor, desc }) => {
        const w = 68;
        const cx = x + w / 2; const cy = 80;

        // Pedicle heights above/below
        const pedH = 18; const pedW = 52;
        const foramTop = cy - 26; const foramBot = cy + 26;

        return (
          <g key={grade}>
            {/* Upper pedicle */}
            <rect x={cx - pedW/2} y={foramTop - pedH} width={pedW} height={pedH}
              rx={4} fill="#c8b99a" stroke="#9a8868" strokeWidth={1}/>
            {/* Lower pedicle */}
            <rect x={cx - pedW/2} y={foramBot} width={pedW} height={pedH}
              rx={4} fill="#c8b99a" stroke="#9a8868" strokeWidth={1}/>
            {/* Foramen outline */}
            <ellipse cx={cx} cy={cy} rx={20} ry={24}
              fill="white" stroke="#7a6a4a" strokeWidth={1.2}/>
            {/* Perineural fat */}
            {fatOpacity > 0.05 && (
              <ellipse cx={cx} cy={cy} rx={18} ry={22}
                fill={fatColor} opacity={fatOpacity}/>
            )}
            {/* Nerve root — enlarges/deforms at grade 3 */}
            <ellipse cx={cx} cy={cy}
              rx={grade==='3' ? 13 : 7}
              ry={grade==='3' ? 16 : 8}
              fill={rootColor}
              stroke={grade==='3'?'#991b1b':'#b89070'} strokeWidth={1}/>

            <text x={cx} y={foramBot + pedH + 14}
              textAnchor="middle" fontSize={10} fill="#1a1a2e" fontWeight="700">{label}</text>
            <text x={cx} y={foramBot + pedH + 25}
              textAnchor="middle" fontSize={8}
              fill={grade==='3'?'#c0392b':grade==='2'?'#d97706':grade==='1'?'#ca8a04':'#16a34a'}>{desc}</text>
          </g>
        );
      })}

      <text x="160" y="200" textAnchor="middle" fontSize={9} fill="#555" fontStyle="italic">
        Sagittal T1/T2 — Lee foraminal grading, perineural fat loss left→right
      </text>
    </svg>
  ),

  // ─── MEYERDING SPONDYLOLISTHESIS ──────────────────────────────────────────
  'spine-meyerding': (
    <svg viewBox="0 0 320 220" style={{width:'100%'}} aria-label="Meyerding spondylolisthesis grades I through IV">
      {/* Base fixed vertebra — L5 */}
      <rect x={30} y={140} width={240} height={46} rx={6}
        fill="#c8d8e8" stroke="#4a7fa5" strokeWidth={1.5}/>
      <text x={150} y={167} textAnchor="middle" fontSize={9} fill="#2a5a7a">L5 (fixed)</text>

      {/* Quarter marks on L5 endplate */}
      {[0.25, 0.5, 0.75].map((f, i) => (
        <line key={i} x1={30 + f * 240} y1={140} x2={30 + f * 240} y2={132}
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2"/>
      ))}
      {['25%','50%','75%','100%'].map((t, i) => (
        <text key={i} x={30 + (i+1)*60} y={128} textAnchor="middle" fontSize={7} fill="#94a3b8">{t}</text>
      ))}

      {/* Four slipped vertebrae at increasing offsets */}
      {[
        { grade:'I',  slip:0.125, color:'#bbf7d0', border:'#16a34a' },
        { grade:'II', slip:0.375, color:'#fde68a', border:'#d97706' },
        { grade:'III',slip:0.625, color:'#fdba74', border:'#ea580c' },
        { grade:'IV', slip:0.875, color:'#fca5a5', border:'#dc2626' },
      ].map(({ grade, slip, color, border }, i) => {
        const slipPx = slip * 240;
        const vbX = 30 + slipPx - 30;
        const vbW = 60;
        return (
          <g key={grade}>
            {/* Slipped L4 */}
            <rect x={vbX} y={88} width={vbW} height={46} rx={4}
              fill={color} stroke={border} strokeWidth={1.5}/>
            <text x={vbX + vbW/2} y={116} textAnchor="middle"
              fontSize={8} fill="#1a1a2e" fontWeight="700">L4</text>
            {/* Slip arrow */}
            <line x1={30} y1={74 - i*2} x2={vbX} y2={74 - i*2}
              stroke={border} strokeWidth={1.5} markerEnd="url(#arrow)"/>
            <text x={vbX + vbW/2} y={80 - i*2}
              textAnchor="middle" fontSize={9} fill={border} fontWeight="700">
              Grade {grade}
            </text>
          </g>
        );
      })}

      {/* Arrow marker def */}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#6b7280"/>
        </marker>
      </defs>

      <text x="160" y="208" textAnchor="middle" fontSize={9} fill="#555" fontStyle="italic">
        Sagittal — % anterior slip of L4 on L5 (0–25–50–75–100%)
      </text>
    </svg>
  ),

  // ─── TLICS SCORECARD ──────────────────────────────────────────────────────
  'spine-tlics': (
    <svg viewBox="0 0 320 230" style={{width:'100%'}} aria-label="TLICS thoracolumbar injury classification scoring">

      {/* Title bar */}
      <rect x={10} y={10} width={300} height={22} rx={4} fill="#0d2137"/>
      <text x={160} y={25} textAnchor="middle" fontSize={10} fill="white" fontWeight="700" letterSpacing="0.08em">
        TLICS SCORING SYSTEM
      </text>

      {/* Three columns */}
      {[
        {
          title: 'MORPHOLOGY', x: 10, color: '#1d4ed8', bgColor: '#eff6ff',
          items: [
            { label: 'Compression',      pts: '+1' },
            { label: 'Burst',            pts: '+2' },
            { label: 'Translation/Rot.', pts: '+3' },
            { label: 'Distraction',      pts: '+4' },
          ],
        },
        {
          title: 'PLC INTEGRITY', x: 112, color: '#7c3aed', bgColor: '#f5f3ff',
          items: [
            { label: 'Intact',           pts: '+0' },
            { label: 'Indeterminate',    pts: '+2' },
            { label: 'Disrupted',        pts: '+3' },
          ],
        },
        {
          title: 'NEUROLOGIC', x: 214, color: '#be185d', bgColor: '#fdf2f8',
          items: [
            { label: 'Intact',           pts: '+0' },
            { label: 'Nerve root',       pts: '+2' },
            { label: 'Complete cord',    pts: '+2' },
            { label: 'Incomplete cord',  pts: '+3' },
          ],
        },
      ].map(({ title, x, color, bgColor, items }) => (
        <g key={title}>
          <rect x={x} y={36} width={96} height={22} rx={3} fill={color}/>
          <text x={x+48} y={51} textAnchor="middle" fontSize={8} fill="white" fontWeight="700">{title}</text>
          <rect x={x} y={58} width={96} height={items.length * 18 + 6} rx={3} fill={bgColor} stroke={color} strokeWidth={0.8}/>
          {items.map(({ label, pts }, i) => (
            <g key={label}>
              <text x={x+6} y={72 + i*18} fontSize={8} fill="#1a1a2e">{label}</text>
              <text x={x+88} y={72 + i*18} textAnchor="end" fontSize={9} fill={color} fontWeight="700">{pts}</text>
              {i < items.length - 1 && (
                <line x1={x+3} y1={78 + i*18} x2={x+93} y2={78 + i*18}
                  stroke={color} strokeWidth={0.4} opacity={0.3}/>
              )}
            </g>
          ))}
        </g>
      ))}

      {/* Recommendation bar */}
      <rect x={10} y={158} width={300} height={16} rx={3} fill="#f1f5f9"/>
      <text x={160} y={170} textAnchor="middle" fontSize={8} fill="#475569" fontWeight="600">
        SCORE  =  Morphology  +  PLC  +  Neurologic
      </text>

      {[
        { range:'Score ≤ 3', rec:'Conservative', color:'#16a34a', bg:'#f0fdf4', x:10  },
        { range:'Score = 4', rec:'Surgeon decision', color:'#d97706', bg:'#fffbeb', x:112 },
        { range:'Score ≥ 5', rec:'Surgical', color:'#dc2626', bg:'#fef2f2', x:214 },
      ].map(({ range, rec, color, bg, x }) => (
        <g key={range}>
          <rect x={x} y={178} width={96} height={36} rx={4} fill={bg} stroke={color} strokeWidth={1}/>
          <text x={x+48} y={192} textAnchor="middle" fontSize={8} fill={color} fontWeight="700">{range}</text>
          <text x={x+48} y={205} textAnchor="middle" fontSize={8} fill={color}>{rec}</text>
        </g>
      ))}

      <text x="160" y="224" textAnchor="middle" fontSize={9} fill="#555" fontStyle="italic">
        Thoracolumbar Injury Classification &amp; Severity Score
      </text>
    </svg>
  ),
