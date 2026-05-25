// ─────────────────────────────────────────────────────────────────────────────
// REBUILT SPINE SVG DIAGRAMS — drop-in replacements for referenceData.js
//
// In DIAGRAM_SVGS, find each key and replace the entire entry.
// All 6 diagrams rebuilt: pfirrmann, central-stenosis, foraminal-stenosis,
// meyerding, tlics, imbalance (with plumb line instructions)
// ─────────────────────────────────────────────────────────────────────────────

  // ── PFIRRMANN ─────────────────────────────────────────────────────────────
  // Sagittal T2 appearance: nucleus signal, annulus, height loss per grade
  'spine-pfirrmann': (
    <svg viewBox="0 0 340 260" style={{width:'100%'}} aria-label="Pfirrmann disc degeneration grades I-V">
      <defs>
        <linearGradient id="pf-bone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8dcc8"/>
          <stop offset="100%" stopColor="#c8b898"/>
        </linearGradient>
        <linearGradient id="pf-n1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8f8ff"/>
          <stop offset="100%" stopColor="#b8e8f8"/>
        </linearGradient>
        <linearGradient id="pf-n2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8e8f0"/>
          <stop offset="100%" stopColor="#98c8d8"/>
        </linearGradient>
        <linearGradient id="pf-n3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#88a8b8"/>
          <stop offset="100%" stopColor="#607888"/>
        </linearGradient>
        <linearGradient id="pf-n4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#485868"/>
          <stop offset="100%" stopColor="#283848"/>
        </linearGradient>
        <linearGradient id="pf-n5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#202830"/>
          <stop offset="100%" stopColor="#101820"/>
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="340" height="260" fill="#0a0e14" rx="6"/>

      {/* Title */}
      <text x="170" y="18" textAnchor="middle" fontSize="11" fill="#94a3b8"
        fontWeight="600" letterSpacing="0.08em">PFIRRMANN DISC DEGENERATION — T2 SAGITTAL</text>

      {/* Five grades */}
      {[
        { g:'I',   x:10,  discH:42, nucGrad:'url(#pf-n1)', annFill:'#1a3a4a', border:'#38bdf8', sigColor:'#38bdf8', heightNote:'Normal' },
        { g:'II',  x:76,  discH:38, nucGrad:'url(#pf-n2)', annFill:'#1a3040', border:'#7dd3fc', sigColor:'#7dd3fc', heightNote:'Normal' },
        { g:'III', x:142, discH:30, nucGrad:'url(#pf-n3)', annFill:'#182838', border:'#94a3b8', sigColor:'#94a3b8', heightNote:'Mild ↓' },
        { g:'IV',  x:208, discH:20, nucGrad:'url(#pf-n4)', annFill:'#141e28', border:'#64748b', sigColor:'#64748b', heightNote:'Mod ↓' },
        { g:'V',   x:274, discH:9,  nucGrad:'url(#pf-n5)', annFill:'#0e1620', border:'#475569', sigColor:'#475569', heightNote:'Severe ↓' },
      ].map(({ g, x, discH, nucGrad, annFill, border, sigColor, heightNote }, i) => {
        const w = 56;
        const cx = x + w / 2;
        const vbH = 36;
        const midY = 130;
        const discTop = midY - discH / 2;
        const discBot = midY + discH / 2;
        const ep = 3; // endplate thickness

        // Nucleus width shrinks with grade
        const nucRx = [22, 19, 15, 10, 0][i];
        const nucRy = [discH * 0.44, discH * 0.40, discH * 0.35, discH * 0.30, 0][i];

        return (
          <g key={g}>
            {/* Upper vertebral body */}
            <rect x={x} y={discTop - ep - vbH} width={w} height={vbH}
              rx={4} fill="url(#pf-bone)" stroke="#9a8060" strokeWidth={0.8}/>
            {/* Cortical endplates — top */}
            <rect x={x} y={discTop - ep} width={w} height={ep}
              fill="#b8a078" rx={1}/>

            {/* Annulus fibrosus */}
            <rect x={x} y={discTop} width={w} height={discH}
              rx={2} fill={annFill} stroke={border} strokeWidth={1}/>

            {/* Nucleus pulposus */}
            {nucRx > 0 && (
              <ellipse cx={cx} cy={midY} rx={nucRx} ry={Math.max(nucRy, 1)}
                fill={nucGrad}/>
            )}

            {/* Fissure lines grade III+ */}
            {i >= 2 && discH > 10 && (
              <line x1={x + 8} y1={midY - discH * 0.12}
                    x2={x + w - 8} y2={midY - discH * 0.12}
                stroke="#4a6878" strokeWidth={0.7} opacity={0.7}/>
            )}
            {i >= 3 && discH > 10 && (
              <line x1={x + 8} y1={midY + discH * 0.12}
                    x2={x + w - 8} y2={midY + discH * 0.12}
                stroke="#4a6878" strokeWidth={0.7} opacity={0.5}/>
            )}

            {/* Cortical endplate — bottom */}
            <rect x={x} y={discBot} width={w} height={ep}
              fill="#b8a078" rx={1}/>
            {/* Lower vertebral body */}
            <rect x={x} y={discBot + ep} width={w} height={vbH}
              rx={4} fill="url(#pf-bone)" stroke="#9a8060" strokeWidth={0.8}/>

            {/* Grade label */}
            <text x={cx} y={discTop - ep - vbH - 8}
              textAnchor="middle" fontSize={11} fill={border} fontWeight="700">
              Grade {g}
            </text>

            {/* Height annotation */}
            <text x={cx} y={discBot + ep + vbH + 14}
              textAnchor="middle" fontSize={9} fill={sigColor}>{heightNote}</text>

            {/* Height bracket */}
            <line x1={x - 4} y1={discTop} x2={x - 4} y2={discBot}
              stroke={border} strokeWidth={1} opacity={0.5}/>
            <line x1={x - 7} y1={discTop} x2={x - 1} y2={discTop}
              stroke={border} strokeWidth={1} opacity={0.5}/>
            <line x1={x - 7} y1={discBot} x2={x - 1} y2={discBot}
              stroke={border} strokeWidth={1} opacity={0.5}/>
          </g>
        );
      })}

      {/* Legend */}
      {[
        { color:'#38bdf8', label:'Bright nucleus = hydrated, normal' },
        { color:'#94a3b8', label:'Grey/dark = dehydrated, degenerating' },
        { color:'#475569', label:'Black, collapsed = end-stage' },
      ].map(({ color, label }, i) => (
        <g key={i}>
          <rect x={10} y={230 + i * 10} width={8} height={6} rx={1} fill={color}/>
          <text x={22} y={237 + i * 10} fontSize={8} fill="#94a3b8">{label}</text>
        </g>
      ))}

      <text x="170" y="253" textAnchor="middle" fontSize={8} fill="#64748b" fontStyle="italic">
        Assess on T2 sagittal: signal intensity, nucleus/annulus distinction, disc height
      </text>
    </svg>
  ),


  // ── CENTRAL CANAL STENOSIS ────────────────────────────────────────────────
  // Axial T2 cross-sections — CSF bright, cord grey, bone white rim
  'spine-central-stenosis': (
    <svg viewBox="0 0 340 270" style={{width:'100%'}} aria-label="Central canal stenosis grades">
      <defs>
        <radialGradient id="cs-bone" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ddd0b8"/>
          <stop offset="100%" stopColor="#b8a888"/>
        </radialGradient>
        <radialGradient id="cs-csf" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8f0ff"/>
          <stop offset="100%" stopColor="#88d8f8"/>
        </radialGradient>
        <radialGradient id="cs-cord" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e8d8c0"/>
          <stop offset="100%" stopColor="#c8a878"/>
        </radialGradient>
      </defs>

      <rect width="340" height="270" fill="#0a0e14" rx="6"/>
      <text x="170" y="18" textAnchor="middle" fontSize="11" fill="#94a3b8"
        fontWeight="600" letterSpacing="0.08em">CENTRAL CANAL STENOSIS — AXIAL T2</text>

      {[
        { label:'None',     x:10,  cy:100, csfRx:15, csfRy:13, desc:'CSF surrounds cauda', descColor:'#4ade80' },
        { label:'Mild',     x:94,  cy:100, csfRx:10, csfRy:9,  desc:'CSF reduced, roots visible', descColor:'#a3e635' },
        { label:'Moderate', x:178, cy:100, csfRx:5,  csfRy:4,  desc:'CSF effaced, roots crowded', descColor:'#fb923c' },
        { label:'Severe',   x:262, cy:100, csfRx:0,  csfRy:0,  desc:'No CSF, cord compressed', descColor:'#f87171' },
      ].map(({ label, x, cy, csfRx, csfRy, desc, descColor }, i) => {
        const cx = x + 39;
        const boneOuter = 34;
        const boneInner = 22;
        const cordRx = 8;
        const cordRy = 7;

        return (
          <g key={label}>
            {/* Bony ring — lamina + pedicles */}
            <circle cx={cx} cy={cy} r={boneOuter}
              fill="url(#cs-bone)" stroke="#c8b890" strokeWidth={1.2}/>
            {/* Spinal canal */}
            <ellipse cx={cx} cy={cy} rx={boneInner} ry={boneInner - 2}
              fill="#1a2030" stroke="#3a4858" strokeWidth={0.8}/>

            {/* Posterior arch */}
            <path d={`M${cx - boneOuter * 0.55} ${cy - boneOuter * 0.75}
                      Q${cx} ${cy - boneOuter * 1.35}
                      ${cx + boneOuter * 0.55} ${cy - boneOuter * 0.75}`}
              fill="url(#cs-bone)" stroke="#c8b890" strokeWidth={1}/>

            {/* CSF space — bright T2 */}
            {csfRx > 0 && (
              <ellipse cx={cx} cy={cy} rx={csfRx + cordRx - 1} ry={csfRy + cordRy - 1}
                fill="url(#cs-csf)" opacity={0.9}/>
            )}

            {/* Spinal cord / cauda equina */}
            <ellipse cx={cx} cy={cy} rx={cordRx} ry={cordRy}
              fill="url(#cs-cord)"
              stroke={i === 3 ? '#ef4444' : '#a08060'}
              strokeWidth={i === 3 ? 1.5 : 0.8}/>

            {/* Nerve roots visible in none/mild */}
            {i <= 1 && [[-1,-1],[1,-1],[-1,1],[1,1]].map(([dx,dy], ri) => (
              <circle key={ri}
                cx={cx + dx * (csfRx * 0.55)} cy={cy + dy * (csfRy * 0.6)}
                r={1.8} fill="#d4b890" opacity={0.7}/>
            ))}

            {/* Facet joints */}
            {[[-1],[1]].map(([s], fi) => (
              <ellipse key={fi}
                cx={cx + s * boneOuter * 0.78} cy={cy + boneOuter * 0.52}
                rx={6} ry={4}
                fill="#c8b890" stroke="#a89870" strokeWidth={0.8}/>
            ))}

            {/* Label */}
            <text x={cx} y={cy + boneOuter + 18}
              textAnchor="middle" fontSize={10} fill="white" fontWeight="700">{label}</text>
            <text x={cx} y={cy + boneOuter + 30}
              textAnchor="middle" fontSize={8} fill={descColor}>{desc}</text>
          </g>
        );
      })}

      {/* Anatomy legend */}
      <g transform="translate(10, 180)">
        <text x="0" y="12" fontSize="9" fill="#64748b" fontWeight="600">LEGEND:</text>
        <rect x="50" y="4" width="10" height="8" rx="1" fill="url(#cs-csf)"/>
        <text x="64" y="12" fontSize="8" fill="#94a3b8">CSF (bright T2)</text>
        <rect x="148" y="4" width="10" height="8" rx="1" fill="url(#cs-cord)"/>
        <text x="162" y="12" fontSize="8" fill="#94a3b8">Cord / cauda</text>
        <rect x="240" y="4" width="10" height="8" rx="1" fill="url(#cs-bone)"/>
        <text x="254" y="12" fontSize="8" fill="#94a3b8">Bone</text>
      </g>

      {/* How to grade instruction */}
      <rect x="10" y="200" width="320" height="52" rx="4"
        fill="#0f1e2e" stroke="#1d4ed8" strokeWidth="0.8"/>
      <text x="18" y="214" fontSize="8" fill="#60a5fa" fontWeight="700">HOW TO GRADE:</text>
      <text x="18" y="226" fontSize="8" fill="#94a3b8">1. Use axial T2 at level of maximum narrowing</text>
      <text x="18" y="237" fontSize="8" fill="#94a3b8">2. Assess residual CSF (bright) around cord/cauda equina</text>
      <text x="18" y="248" fontSize="8" fill="#94a3b8">3. Severe = cord signal change on sagittal T2 (myelomalacia)</text>
    </svg>
  ),


  // ── FORAMINAL STENOSIS ────────────────────────────────────────────────────
  // Sagittal view — pedicles, foramen oval, fat signal, nerve root
  'spine-foraminal-stenosis': (
    <svg viewBox="0 0 340 270" style={{width:'100%'}} aria-label="Foraminal stenosis grades 0-3">
      <defs>
        <linearGradient id="fs-ped" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddd0b8"/>
          <stop offset="100%" stopColor="#b8a888"/>
        </linearGradient>
        <radialGradient id="fs-fat" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7"/>
          <stop offset="100%" stopColor="#fde68a"/>
        </radialGradient>
        <radialGradient id="fs-root" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e8d8c0"/>
          <stop offset="100%" stopColor="#c8a878"/>
        </radialGradient>
      </defs>

      <rect width="340" height="270" fill="#0a0e14" rx="6"/>
      <text x="170" y="18" textAnchor="middle" fontSize="11" fill="#94a3b8"
        fontWeight="600" letterSpacing="0.08em">FORAMINAL STENOSIS — SAGITTAL T1</text>

      {[
        { grade:'0', label:'Normal',  x:10,  fatOpacity:0.95, rootRx:6,  rootRy:7,  rootColor:'#c8a878', border:'#4ade80',  desc:'Fat in all planes' },
        { grade:'1', label:'Grade 1', x:94,  fatOpacity:0.55, rootRx:7,  rootRy:8,  rootColor:'#c8a878', border:'#a3e635',  desc:'Partial fat loss' },
        { grade:'2', label:'Grade 2', x:178, fatOpacity:0.10, rootRx:8,  rootRy:9,  rootColor:'#c8a878', border:'#fb923c',  desc:'Fat obliterated' },
        { grade:'3', label:'Grade 3', x:262, fatOpacity:0.0,  rootRx:11, rootRy:13, rootColor:'#ef4444', border:'#f87171',  desc:'Root deformed' },
      ].map(({ grade, label, x, fatOpacity, rootRx, rootRy, rootColor, border, desc }, i) => {
        const cx = x + 39;
        const cy = 105;
        const pedW = 52; const pedH = 22;
        const foramRx = 18; const foramRy = 24;

        return (
          <g key={grade}>
            {/* Superior pedicle */}
            <rect x={cx - pedW/2} y={cy - foramRy - pedH} width={pedW} height={pedH}
              rx={5} fill="url(#fs-ped)" stroke="#9a8060" strokeWidth={1}/>
            {/* Vertebral body hint */}
            <rect x={cx - pedW/2 - 8} y={cy - foramRy - pedH + 4} width={8} height={pedH - 8}
              rx={2} fill="#c8b890" opacity={0.5}/>

            {/* Inferior pedicle */}
            <rect x={cx - pedW/2} y={cy + foramRy} width={pedW} height={pedH}
              rx={5} fill="url(#fs-ped)" stroke="#9a8060" strokeWidth={1}/>
            <rect x={cx - pedW/2 - 8} y={cy + foramRy + 4} width={8} height={pedH - 8}
              rx={2} fill="#c8b890" opacity={0.5}/>

            {/* Foramen — dark background */}
            <ellipse cx={cx} cy={cy} rx={foramRx} ry={foramRy}
              fill="#141e2a" stroke="#2a3a4a" strokeWidth={1}/>

            {/* Perineural fat — bright T1 signal */}
            {fatOpacity > 0.05 && (
              <ellipse cx={cx} cy={cy}
                rx={foramRx - 1} ry={foramRy - 1}
                fill="url(#fs-fat)" opacity={fatOpacity}/>
            )}

            {/* Nerve root */}
            <ellipse cx={cx} cy={cy} rx={rootRx} ry={rootRy}
              fill={rootColor}
              stroke={border} strokeWidth={i === 3 ? 1.5 : 1}/>

            {/* Grade 3 — compression lines */}
            {i === 3 && (
              <>
                <line x1={cx - foramRx + 2} y1={cy - 4} x2={cx - rootRx - 1} y2={cy - 2}
                  stroke="#ef4444" strokeWidth={1} opacity={0.6}/>
                <line x1={cx - foramRx + 2} y1={cy + 4} x2={cx - rootRx - 1} y2={cy + 2}
                  stroke="#ef4444" strokeWidth={1} opacity={0.6}/>
              </>
            )}

            {/* Grade label */}
            <text x={cx} y={cy + foramRy + pedH + 14}
              textAnchor="middle" fontSize={10} fill="white" fontWeight="700">{label}</text>
            <text x={cx} y={cy + foramRy + pedH + 26}
              textAnchor="middle" fontSize={8} fill={border}>{desc}</text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(10,185)">
        <text x="0" y="12" fontSize="9" fill="#64748b" fontWeight="600">LEGEND:</text>
        <rect x="50" y="3" width="10" height="8" rx="1" fill="url(#fs-fat)"/>
        <text x="64" y="12" fontSize="8" fill="#94a3b8">Perineural fat (bright T1)</text>
        <rect x="196" y="3" width="10" height="8" rx="1" fill="#c8a878"/>
        <text x="210" y="12" fontSize="8" fill="#94a3b8">Nerve root</text>
      </g>

      {/* Instructions */}
      <rect x="10" y="204" width="320" height="52" rx="4"
        fill="#0f1e2e" stroke="#1d4ed8" strokeWidth="0.8"/>
      <text x="18" y="218" fontSize="8" fill="#60a5fa" fontWeight="700">HOW TO GRADE:</text>
      <text x="18" y="230" fontSize="8" fill="#94a3b8">1. Use sagittal T1 — fat is bright, root is grey, foramen is dark</text>
      <text x="18" y="241" fontSize="8" fill="#94a3b8">2. Grade 0/1/2 = fat present/partial/absent; root shape normal</text>
      <text x="18" y="252" fontSize="8" fill="#94a3b8">3. Grade 3 = root deformed, flattened, or obliterated in foramen</text>
    </svg>
  ),


  // ── MEYERDING SPONDYLOLISTHESIS ───────────────────────────────────────────
  // True sagittal view — vertebral bodies with realistic slip
  'spine-meyerding': (
    <svg viewBox="0 0 340 270" style={{width:'100%'}} aria-label="Meyerding spondylolisthesis grades">
      <defs>
        <linearGradient id="my-bone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddd0b8"/>
          <stop offset="100%" stopColor="#b8a888"/>
        </linearGradient>
        <linearGradient id="my-disc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a4858"/>
          <stop offset="100%" stopColor="#1a3040"/>
        </linearGradient>
      </defs>

      <rect width="340" height="270" fill="#0a0e14" rx="6"/>
      <text x="170" y="18" textAnchor="middle" fontSize="11" fill="#94a3b8"
        fontWeight="600" letterSpacing="0.08em">MEYERDING SPONDYLOLISTHESIS — SAGITTAL</text>

      {/* Reference L5 — fixed at bottom, full width */}
      <rect x="30" y="188" width="280" height="44" rx="5"
        fill="url(#my-bone)" stroke="#9a8060" strokeWidth="1.2"/>
      <text x="170" y="214" textAnchor="middle" fontSize="9" fill="#1a1a1a" fontWeight="600">L5 (fixed reference)</text>

      {/* L5 top endplate quarter marks */}
      {[0.25,0.5,0.75,1.0].map((f,i) => (
        <g key={i}>
          <line x1={30 + f*280} y1={178} x2={30 + f*280} y2={188}
            stroke="#475569" strokeWidth={1} strokeDasharray="3 2"/>
          <text x={30 + f*280} y={175} textAnchor="middle" fontSize={7} fill="#475569">
            {['25%','50%','75%','100%'][i]}
          </text>
        </g>
      ))}
      {/* 0% mark */}
      <text x={30} y={175} textAnchor="middle" fontSize={7} fill="#475569">0%</text>

      {/* Four slipped L4 vertebrae */}
      {[
        { grade:'I',   slip:0.125, color:'#166534', fill:'#14532d', border:'#4ade80',  label:'0–25%'  },
        { grade:'II',  slip:0.375, color:'#854d0e', fill:'#78350f', border:'#fbbf24',  label:'25–50%' },
        { grade:'III', slip:0.625, color:'#9a3412', fill:'#7c2d12', border:'#fb923c',  label:'50–75%' },
        { grade:'IV',  slip:0.875, color:'#991b1b', fill:'#7f1d1d', border:'#f87171',  label:'75–100%'},
      ].map(({ grade, slip, fill, border, label }, i) => {
        const slipPx = slip * 280;
        const vbX = 30 + slipPx - 14;
        const vbW = 66;
        const vbY = 136;
        const vbH = 44;
        const discY = vbY + vbH;
        const discH = 8;

        return (
          <g key={grade}>
            {/* L4 vertebral body */}
            <rect x={vbX} y={vbY} width={vbW} height={vbH}
              rx={4} fill={fill} stroke={border} strokeWidth={1.5}/>

            {/* Disc between L4-L5 */}
            <rect x={vbX} y={discY} width={vbW} height={discH}
              rx={2} fill="url(#my-disc)" stroke={border} strokeWidth={0.8} opacity={0.8}/>

            {/* Grade label inside vertebra */}
            <text x={vbX + vbW/2} y={vbY + vbH/2 + 4}
              textAnchor="middle" fontSize={9} fill="white" fontWeight="700">
              Grade {grade}
            </text>
            <text x={vbX + vbW/2} y={vbY + vbH/2 + 15}
              textAnchor="middle" fontSize={7} fill={border}>{label}</text>

            {/* Slip distance arrow */}
            <line x1={30} y1={vbY - 8 - i*8} x2={vbX} y2={vbY - 8 - i*8}
              stroke={border} strokeWidth={1} strokeDasharray="4 2" opacity={0.7}/>
            <polygon
              points={`${vbX},${vbY - 8 - i*8} ${vbX-7},${vbY-12-i*8} ${vbX-7},${vbY-4-i*8}`}
              fill={border} opacity={0.7}/>
          </g>
        );
      })}

      {/* Canal compromise annotation */}
      <rect x="10" y="240" width="320" height="22" rx="4"
        fill="#0f1e2e" stroke="#475569" strokeWidth="0.6"/>
      <text x="170" y="254" textAnchor="middle" fontSize="8" fill="#94a3b8">
        Also assess: disc height, canal stenosis, neural foraminal compromise at level of slip
      </text>
    </svg>
  ),


  // ── TLICS SCORECARD ───────────────────────────────────────────────────────
  // Clean structured scorecard — no defs/markers needed
  'spine-tlics': (
    <svg viewBox="0 0 340 270" style={{width:'100%'}} aria-label="TLICS thoracolumbar injury classification">

      <rect width="340" height="270" fill="#0a0e14" rx="6"/>

      {/* Header */}
      <rect x="10" y="8" width="320" height="24" rx="4" fill="#1d4ed8"/>
      <text x="170" y="24" textAnchor="middle" fontSize="11" fill="white"
        fontWeight="700" letterSpacing="0.08em">TLICS — THORACOLUMBAR INJURY SCORE</text>

      {/* Three columns */}
      {[
        {
          title:'MORPHOLOGY', x:10, w:98, accentColor:'#38bdf8', bgColor:'#0c1e2e',
          items:[
            { label:'Compression',       pts:1 },
            { label:'Burst fracture',    pts:2 },
            { label:'Translation / rot.',pts:3 },
            { label:'Distraction',       pts:4 },
          ],
        },
        {
          title:'PLC INTEGRITY', x:118, w:98, accentColor:'#a78bfa', bgColor:'#130c2e',
          items:[
            { label:'Intact',            pts:0 },
            { label:'Indeterminate',     pts:2 },
            { label:'Disrupted',         pts:3 },
          ],
        },
        {
          title:'NEUROLOGIC', x:226, w:104, accentColor:'#f472b6', bgColor:'#2e0c1e',
          items:[
            { label:'Intact',            pts:0 },
            { label:'Nerve root injury', pts:2 },
            { label:'Complete cord',     pts:2 },
            { label:'Incomplete cord',   pts:3 },
          ],
        },
      ].map(({ title, x, w, accentColor, bgColor, items }) => (
        <g key={title}>
          {/* Column header */}
          <rect x={x} y={36} width={w} height={18} rx={3} fill={accentColor} opacity={0.2}/>
          <rect x={x} y={36} width={w} height={18} rx={3}
            fill="none" stroke={accentColor} strokeWidth={0.8}/>
          <text x={x + w/2} y={48} textAnchor="middle" fontSize={8}
            fill={accentColor} fontWeight="700" letterSpacing="0.04em">{title}</text>

          {/* Items */}
          <rect x={x} y={54} width={w} height={items.length * 22 + 8} rx={3}
            fill={bgColor} stroke={accentColor} strokeWidth={0.6} opacity={0.8}/>
          {items.map(({ label, pts }, ii) => (
            <g key={label}>
              <text x={x + 8} y={70 + ii*22} fontSize={8} fill="#e2e8f0">{label}</text>
              {/* Points badge */}
              <rect x={x + w - 26} y={60 + ii*22} width={20} height={14} rx={3}
                fill={accentColor} opacity={0.2}/>
              <rect x={x + w - 26} y={60 + ii*22} width={20} height={14} rx={3}
                fill="none" stroke={accentColor} strokeWidth={0.7}/>
              <text x={x + w - 16} y={70 + ii*22} textAnchor="middle"
                fontSize={9} fill={accentColor} fontWeight="700">+{pts}</text>
              {ii < items.length-1 && (
                <line x1={x+6} y1={74+ii*22} x2={x+w-6} y2={74+ii*22}
                  stroke={accentColor} strokeWidth={0.3} opacity={0.3}/>
              )}
            </g>
          ))}
        </g>
      ))}

      {/* Score formula */}
      <text x="170" y="166" textAnchor="middle" fontSize="9" fill="#64748b">
        TOTAL SCORE = Morphology + PLC + Neurologic (max 10)
      </text>

      {/* Management bands */}
      {[
        { range:'Score ≤ 3', rec:'Conservative management',    color:'#4ade80', bg:'#052e16', x:10,  w:98  },
        { range:'Score = 4', rec:'Surgeon discretion',         color:'#fbbf24', bg:'#2e1a05', x:118, w:98  },
        { range:'Score ≥ 5', rec:'Surgical recommended',       color:'#f87171', bg:'#2e0505', x:226, w:104 },
      ].map(({ range, rec, color, bg, x, w }) => (
        <g key={range}>
          <rect x={x} y={174} width={w} height={46} rx={4}
            fill={bg} stroke={color} strokeWidth={1}/>
          <text x={x + w/2} y={190} textAnchor="middle"
            fontSize={9} fill={color} fontWeight="700">{range}</text>
          <text x={x + w/2} y={203} textAnchor="middle"
            fontSize={8} fill={color} opacity={0.8}>{rec}</text>
        </g>
      ))}

      {/* Instructions */}
      <rect x="10" y="228" width="320" height="34" rx="4"
        fill="#0f1e2e" stroke="#1d4ed8" strokeWidth="0.8"/>
      <text x="18" y="241" fontSize="8" fill="#60a5fa" fontWeight="700">USAGE:</text>
      <text x="58" y="241" fontSize="8" fill="#94a3b8">Score all 3 categories independently, then sum</text>
      <text x="18" y="254" fontSize="8" fill="#94a3b8">PLC assessed on T2/STIR: interspinous edema, facet widening, ligament signal</text>
    </svg>
  ),


  // ── SPINAL IMBALANCE — with plumb line drawing instructions ───────────────
  'spine-imbalance': (
    <svg viewBox="0 0 340 310" style={{width:'100%'}} aria-label="Spinal imbalance SVA and coronal balance">
      <defs>
        <linearGradient id="si-bone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddd0b8"/>
          <stop offset="100%" stopColor="#b8a888"/>
        </linearGradient>
      </defs>

      <rect width="340" height="310" fill="#0a0e14" rx="6"/>
      <text x="170" y="16" textAnchor="middle" fontSize="10" fill="#94a3b8"
        fontWeight="600" letterSpacing="0.06em">SAGITTAL &amp; CORONAL SPINAL BALANCE</text>

      {/* ── LEFT PANEL: SAGITTAL SVA ── */}
      <rect x="8" y="22" width="150" height="182" rx="4"
        fill="#0d1520" stroke="#1e3a5f" strokeWidth="0.8"/>
      <text x="83" y="36" textAnchor="middle" fontSize="9" fill="#38bdf8"
        fontWeight="700" letterSpacing="0.06em">SAGITTAL (SVA)</text>

      {/* Vertebral column — realistic S-curve */}
      {[
        [83,  44, 18, 10],   // C7
        [82,  58, 17, 9 ],
        [80,  72, 18, 10],   // thoracic kyphosis starts
        [76,  86, 19, 10],
        [72, 100, 19, 11],
        [70, 114, 20, 11],   // apex kyphosis
        [73, 128, 20, 11],
        [78, 142, 20, 11],   // lumbar lordosis
        [84, 156, 20, 11],
        [83, 170, 20, 11],   // L5
      ].map(([vx, vy, vw, vh], i) => (
        <g key={i}>
          <rect x={vx - vw/2} y={vy} width={vw} height={vh-2} rx={2}
            fill="url(#si-bone)" stroke="#9a8060" strokeWidth={0.6}/>
          {/* Disc space */}
          {i < 9 && (
            <rect x={vx - vw/2 + 1} y={vy + vh - 2} width={vw - 2} height={3}
              fill="#1a3040" rx={1}/>
          )}
        </g>
      ))}

      {/* Sacrum */}
      <path d="M68 184 Q83 180 98 184 L95 204 Q83 210 71 204 Z"
        fill="url(#si-bone)" stroke="#9a8060" strokeWidth={0.8}/>

      {/* C7 plumb line — vertical from C7 down */}
      <line x1="83" y1="44" x2="83" y2="210"
        stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 3"/>
      <circle cx="83" cy="44" r="4" fill="#ef4444"/>
      <text x="92" y="42" fontSize="8" fill="#ef4444" fontWeight="700">C7</text>

      {/* S1 posterior point */}
      <circle cx="83" cy="192" r="4" fill="#fb923c"/>
      <text x="92" y="196" fontSize="8" fill="#fb923c" fontWeight="700">S1</text>

      {/* SVA offset measurement */}
      <line x1="83" y1="192" x2="105" y2="192"
        stroke="#ef4444" strokeWidth={1.5}/>
      <line x1="105" y1="185" x2="105" y2="199"
        stroke="#ef4444" strokeWidth={1.5}/>
      <text x="108" y="190" fontSize="7" fill="#ef4444" fontWeight="700">SVA</text>
      <text x="108" y="199" fontSize="7" fill="#ef4444">&lt;50mm</text>

      {/* ── RIGHT PANEL: CORONAL BALANCE ── */}
      <rect x="168" y="22" width="162" height="182" rx="4"
        fill="#0d1520" stroke="#1e3a5f" strokeWidth="0.8"/>
      <text x="249" y="36" textAnchor="middle" fontSize="9" fill="#a78bfa"
        fontWeight="700" letterSpacing="0.06em">CORONAL BALANCE</text>

      {/* Vertebral column — coronal scoliosis curve */}
      {[
        [249, 44, 18, 10],
        [252, 58, 17, 9 ],
        [256, 72, 19, 10],
        [260, 86, 20, 10],
        [262,100, 20, 11],
        [258,114, 20, 11],
        [252,128, 20, 11],
        [248,142, 20, 11],
        [247,156, 20, 11],
        [249,170, 20, 11],
      ].map(([vx, vy, vw, vh], i) => (
        <g key={i}>
          <rect x={vx - vw/2} y={vy} width={vw} height={vh-2} rx={2}
            fill="url(#si-bone)" stroke="#9a8060" strokeWidth={0.6}/>
          {i < 9 && (
            <rect x={vx - vw/2 + 1} y={vy + vh - 2} width={vw - 2} height={3}
              fill="#1a3040" rx={1}/>
          )}
        </g>
      ))}

      {/* Sacrum coronal */}
      <path d="M238 184 Q249 180 260 184 L258 204 Q249 210 240 204 Z"
        fill="url(#si-bone)" stroke="#9a8060" strokeWidth={0.8}/>

      {/* CSVL — central sacral vertical line */}
      <line x1="249" y1="22" x2="249" y2="210"
        stroke="#64748b" strokeWidth={1} strokeDasharray="4 3"/>
      <text x="255" y="30" fontSize="7" fill="#64748b">CSVL</text>

      {/* C7 coronal */}
      <circle cx="249" cy="44" r="4" fill="#a78bfa"/>
      <text x="258" y="48" fontSize="8" fill="#a78bfa" fontWeight="700">C7</text>

      {/* Offset measurement */}
      <line x1="249" y1="192" x2="262" y2="192"
        stroke="#a78bfa" strokeWidth={1.5}/>
      <text x="264" y="190" fontSize="7" fill="#a78bfa" fontWeight="700">Offset</text>
      <text x="264" y="199" fontSize="7" fill="#a78bfa">&lt;20mm</text>

      {/* Cobb angle annotation */}
      <path d="M 244 90 A 18 18 0 0 1 268 100" fill="none"
        stroke="#fbbf24" strokeWidth={1.5}/>
      <text x="270" y="98" fontSize="7" fill="#fbbf24">Cobb°</text>

      {/* ── HOW TO DRAW PLUMB LINES ── */}
      <rect x="8" y="210" width="322" height="90" rx="4"
        fill="#0f1e2e" stroke="#1d4ed8" strokeWidth="0.8"/>
      <text x="16" y="224" fontSize="9" fill="#38bdf8" fontWeight="700">
        HOW TO DRAW THE PLUMB LINES:
      </text>

      {/* SVA instructions */}
      <text x="16" y="238" fontSize="8" fill="#fbbf24" fontWeight="600">Sagittal Vertical Axis (SVA):</text>
      <text x="16" y="249" fontSize="8" fill="#94a3b8">1. Identify C7 vertebral body center on lateral standing radiograph</text>
      <text x="16" y="260" fontSize="8" fill="#94a3b8">2. Drop a vertical plumb line straight down from C7</text>
      <text x="16" y="271" fontSize="8" fill="#94a3b8">3. Measure horizontal distance to posterior-superior corner of S1</text>
      <text x="16" y="282" fontSize="8" fill="#4ade80">Normal: C7 plumb line falls within 50 mm of S1 posterior corner</text>

      {/* Coronal instructions */}
      <text x="16" y="294" fontSize="8" fill="#a78bfa" fontWeight="600">Coronal Balance:</text>
      <text x="130" y="294" fontSize="8" fill="#94a3b8">Draw CSVL through S1 center — C7 center should be within 20 mm</text>
    </svg>
  ),
