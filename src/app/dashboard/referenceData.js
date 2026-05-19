// Joint measurement data and SVG diagrams for MSK MRI Reference Panel

const JOINT_DATA = {
  knee: {
    label: 'Knee',
    measurements: [
      {
        id: 'meniscal-extrusion',
        label: 'Meniscal extrusion',
        plane: 'Coronal PD',
        description: 'Distance from outer meniscal edge to tibial plateau cartilage margin',
        normalValues: [
          { label: 'Normal', value: '< 3 mm' },
          { label: 'Abnormal', value: '≥ 3 mm' },
          { label: 'Significance', value: '≥3 mm: 10× more likely with posterior root tear' },
        ],
        diagram: 'knee-meniscal-extrusion',
      },
      {
        id: 'tibial-slope',
        label: 'Posterior tibial slope',
        plane: 'Sagittal',
        description: 'Angle of tibial plateau relative to tibial long axis',
        normalValues: [
          { label: 'Normal bony', value: '5–7°' },
          { label: 'ACL risk', value: '> 12° posterolateral' },
          { label: 'Method', value: 'Hudek: long-axis reference' },
        ],
        diagram: 'knee-tibial-slope',
      },
      {
        id: 'cartilage-thickness',
        label: 'Cartilage thickness',
        plane: 'Sagittal 3D',
        description: 'Femoral and tibial articular cartilage thickness',
        normalValues: [
          { label: 'Femoral avg', value: '2.1 mm' },
          { label: 'Tibial avg', value: '2.3 mm' },
          { label: 'Thin', value: '< 1.5 mm (concern)' },
        ],
        diagram: 'knee-cartilage',
      },
      {
        id: 'notch-width',
        label: 'Notch width index',
        plane: 'Coronal',
        description: 'Intercondylar notch width / total femoral width at level of popliteal groove',
        normalValues: [
          { label: 'Normal', value: '> 0.23' },
          { label: 'Narrow', value: '< 0.20 (ACL risk factor)' },
        ],
        diagram: 'knee-notch',
      },
    ],
  },

  shoulder: {
    label: 'Shoulder',
    measurements: [
      {
        id: 'ahi',
        label: 'Acromiohumeral interval (AHI)',
        plane: 'Coronal oblique',
        description: 'Vertical distance: inferior acromion to superior humeral head',
        normalValues: [
          { label: 'Normal (MRI)', value: '9–10 mm' },
          { label: 'Concern', value: '< 7 mm on radiograph' },
          { label: 'Large RCT', value: '< 6 mm (standing)' },
        ],
        diagram: 'shoulder-ahi',
      },
      {
        id: 'chi',
        label: 'Coracohumeral interval (CHI)',
        plane: 'Axial',
        description: 'Distance from lesser tuberosity to coracoid process',
        normalValues: [
          { label: 'Normal', value: '7–11 mm' },
          { label: 'Subcoracoid impingement', value: '< 6 mm' },
        ],
        diagram: 'shoulder-chi',
      },
      {
        id: 'rc-thickness',
        label: 'Rotator cuff thickness',
        plane: 'Coronal oblique',
        description: 'Supraspinatus tendon thickness at footprint',
        normalValues: [
          { label: 'Normal supraspinatus', value: '6–9 mm' },
          { label: 'Atrophy concern', value: '< 5 mm' },
          { label: 'Goutallier grade', value: '0–4 (fat infiltration)' },
        ],
        diagram: 'shoulder-rc',
      },
      {
        id: 'glenohumeral-cartilage',
        label: 'Glenohumeral cartilage',
        plane: 'Axial / coronal',
        description: 'Humeral head and glenoid cartilage thickness',
        normalValues: [
          { label: 'Humeral head', value: '1.2–1.8 mm' },
          { label: 'Glenoid', value: '1.0–1.5 mm' },
        ],
        diagram: 'shoulder-cartilage',
      },
    ],
  },

  hip: {
    label: 'Hip',
    measurements: [
      {
        id: 'alpha-angle',
        label: 'Alpha angle (cam FAI)',
        plane: 'Oblique axial / radial',
        description: 'Angle at which femoral head departs from spherical outline at head-neck junction',
        normalValues: [
          { label: 'Normal', value: '< 55°' },
          { label: 'Abnormal (cam)', value: '≥ 55°' },
          { label: 'Best plane', value: 'Radial MRI > oblique axial' },
        ],
        diagram: 'hip-alpha',
      },
      {
        id: 'lce-angle',
        label: 'Lateral center-edge (LCE) angle',
        plane: 'Coronal',
        description: 'Angle measuring superolateral acetabular coverage of femoral head',
        normalValues: [
          { label: 'Normal', value: '25–39°' },
          { label: 'Dysplasia', value: '< 20°' },
          { label: 'Pincer FAI', value: '≥ 40°' },
        ],
        diagram: 'hip-lce',
      },
      {
        id: 'fn-offset',
        label: 'Femoral head-neck offset',
        plane: 'Oblique axial',
        description: 'Anterior offset distance of femoral head relative to neck',
        normalValues: [
          { label: 'Normal', value: '≥ 8 mm' },
          { label: 'Cam deformity', value: '< 8 mm' },
          { label: 'Offset ratio', value: '> 0.17 normal' },
        ],
        diagram: 'hip-offset',
      },
      {
        id: 'acetabular-depth',
        label: 'Acetabular depth (coxa profunda)',
        plane: 'Coronal',
        description: 'Relationship of femoral head center to acetabular rim line',
        normalValues: [
          { label: 'Pincer (protrusio)', value: '> 3 mm medial to ilioischial line' },
          { label: 'Coxa profunda', value: 'Medial wall touches or crosses ilioischial line' },
        ],
        diagram: 'hip-depth',
      },
    ],
  },

  wrist: {
    label: 'Wrist',
    measurements: [
      {
        id: 'ulnar-variance',
        label: 'Ulnar variance',
        plane: 'Coronal T1/PD',
        description: 'Longitudinal difference between distal ulnar and radial articular surfaces',
        normalValues: [
          { label: 'Neutral', value: '−1 to +1 mm' },
          { label: 'Positive (> 2 mm)', value: 'TFCC perforation risk, ulnar impaction' },
          { label: 'Kienbock risk', value: 'Negative variance' },
        ],
        diagram: 'wrist-ulnar-variance',
      },
      {
        id: 'sl-interval',
        label: 'Scapholunate interval',
        plane: 'Coronal',
        description: 'Gap between scaphoid and lunate on coronal sequences',
        normalValues: [
          { label: 'Normal', value: '< 3 mm' },
          { label: 'SLL disruption', value: '> 3 mm' },
          { label: 'Complete SLL tear', value: '> 5 mm (Terry Thomas sign)' },
        ],
        diagram: 'wrist-sl-interval',
      },
      {
        id: 'median-nerve',
        label: 'Median nerve CSA',
        plane: 'Axial T1 at pisiform',
        description: 'Cross-sectional area of median nerve at carpal tunnel inlet',
        normalValues: [
          { label: 'Normal', value: '< 9 mm²' },
          { label: 'CTS threshold', value: '> 9–10 mm²' },
          { label: 'Severe CTS', value: '> 15 mm²' },
        ],
        diagram: 'wrist-median-nerve',
      },
      {
        id: 'carpal-height',
        label: 'Carpal height ratio',
        plane: 'Coronal',
        description: 'Carpal column height / length of 3rd metacarpal',
        normalValues: [
          { label: 'Normal', value: '0.52–0.57' },
          { label: 'Collapsed', value: '< 0.45 (severe carpal collapse)' },
        ],
        diagram: 'wrist-carpal-height',
      },
    ],
  },

  elbow: {
    label: 'Elbow',
    measurements: [
      {
        id: 'carrying-angle',
        label: 'Carrying angle (valgus)',
        plane: 'Coronal / AP',
        description: 'Angle between long axes of humerus and ulna in full extension',
        normalValues: [
          { label: 'Male', value: '5–10°' },
          { label: 'Female', value: '10–15°' },
          { label: 'Cubitus valgus', value: '> 15°' },
        ],
        diagram: 'elbow-carrying',
      },
      {
        id: 'radiocapitellar-line',
        label: 'Radiocapitellar line',
        plane: 'Sagittal / lateral',
        description: 'Line through center of radial neck should bisect capitellum',
        normalValues: [
          { label: 'Normal', value: 'Bisects capitellum' },
          { label: 'Radial head dislocation', value: 'Line misses capitellum' },
        ],
        diagram: 'elbow-radiocapitellar',
      },
      {
        id: 'ucl-thickness',
        label: 'UCL thickness (medial)',
        plane: 'Coronal',
        description: 'Anterior bundle of ulnar collateral ligament thickness',
        normalValues: [
          { label: 'Normal', value: '3–4 mm' },
          { label: 'Tear (full)', value: 'Discontinuity / fluid signal' },
          { label: 'T-sign', value: 'Undersurface partial tear' },
        ],
        diagram: 'elbow-ucl',
      },
      {
        id: 'common-extensor',
        label: 'Common extensor tendon',
        plane: 'Coronal',
        description: 'Thickness of common extensor origin at lateral epicondyle',
        normalValues: [
          { label: 'Normal', value: '4–6 mm' },
          { label: 'Tendinosis', value: 'T2 signal ↑, thickened' },
          { label: 'Tear', value: 'Discontinuity, thinning < 2 mm' },
        ],
        diagram: 'elbow-extensor',
      },
    ],
  },

  ankle: {
    label: 'Ankle',
    measurements: [
      {
        id: 'talar-tilt',
        label: 'Talar tilt angle',
        plane: 'Coronal (stress or standard)',
        description: 'Angle between tibial plafond and talar dome on coronal images',
        normalValues: [
          { label: 'Normal', value: '0–5°' },
          { label: 'ATFL instability', value: '> 5–10° asymmetry' },
          { label: 'Severe instability', value: '> 15°' },
        ],
        diagram: 'ankle-talar-tilt',
      },
      {
        id: 'syndesmosis',
        label: 'Syndesmosis width (AITFL)',
        plane: 'Axial 1 cm above plafond',
        description: 'Tibiofibular clear space and overlap measurement',
        normalValues: [
          { label: 'Clear space', value: '< 5 mm (radiograph)' },
          { label: 'Overlap', value: '> 10 mm on AP' },
          { label: 'Diastasis', value: 'Clear space > 5 mm or overlap loss' },
        ],
        diagram: 'ankle-syndesmosis',
      },
      {
        id: 'achilles-thickness',
        label: 'Achilles tendon thickness',
        plane: 'Sagittal',
        description: 'AP diameter of Achilles at narrowest point (2–6 cm above insertion)',
        normalValues: [
          { label: 'Normal', value: '< 6 mm AP diameter' },
          { label: 'Tendinosis', value: '6–8 mm with signal change' },
          { label: 'Tear risk', value: '> 8 mm focal thickening' },
        ],
        diagram: 'ankle-achilles',
      },
      {
        id: 'plantar-fascia',
        label: 'Plantar fascia thickness',
        plane: 'Sagittal',
        description: 'Thickness at calcaneal origin',
        normalValues: [
          { label: 'Normal', value: '2–4 mm' },
          { label: 'Fasciitis', value: '≥ 4 mm with edema' },
        ],
        diagram: 'ankle-plantar-fascia',
      },
    ],
  },

  spine: {
    label: 'Spine',
    measurements: [
      {
        id: 'disc-height',
        label: 'Disc height index',
        plane: 'Sagittal T2',
        description: 'Disc height / adjacent vertebral body height (Farfan method)',
        normalValues: [
          { label: 'Lumbar normal', value: '0.35–0.50' },
          { label: 'Cervical normal', value: '0.25–0.45' },
          { label: 'Loss', value: '< 0.25 significant narrowing' },
        ],
        diagram: 'spine-disc-height',
      },
      {
        id: 'canal-diameter',
        label: 'Spinal canal AP diameter',
        plane: 'Axial T2',
        description: 'Anterior-posterior diameter of bony spinal canal',
        normalValues: [
          { label: 'Cervical normal', value: '> 13 mm' },
          { label: 'Cervical stenosis', value: '< 10 mm' },
          { label: 'Lumbar normal', value: '> 15 mm' },
          { label: 'Lumbar stenosis', value: '< 10 mm (absolute)' },
        ],
        diagram: 'spine-canal',
      },
      {
        id: 'cobb-angle',
        label: 'Cobb angle (scoliosis)',
        plane: 'Coronal',
        description: 'Angle between endplates of most tilted vertebrae at curve apex',
        normalValues: [
          { label: 'Normal', value: '< 10°' },
          { label: 'Mild scoliosis', value: '10–25°' },
          { label: 'Moderate', value: '25–45°' },
          { label: 'Surgical threshold', value: '> 40–50°' },
        ],
        diagram: 'spine-cobb',
      },
      {
        id: 'foraminal-height',
        label: 'Neural foraminal height',
        plane: 'Sagittal',
        description: 'Height of neural foramen at pedicle level',
        normalValues: [
          { label: 'Lumbar normal', value: '> 15 mm' },
          { label: 'Stenosis', value: '< 10 mm' },
          { label: 'Severe', value: '< 7 mm' },
        ],
        diagram: 'spine-foramen',
      },
    ],
  },

  pelvis: {
    label: 'Pelvis / SI Joints',
    measurements: [
      {
        id: 'si-joint-width',
        label: 'SI joint width',
        plane: 'Coronal / axial',
        description: 'Width of sacroiliac joint space',
        normalValues: [
          { label: 'Normal adult', value: '2–5 mm' },
          { label: 'Fusion', value: '< 1 mm or complete bridging' },
          { label: 'Widening', value: '> 5 mm (trauma, pregnancy)' },
        ],
        diagram: 'pelvis-si-joint',
      },
      {
        id: 'symphysis-width',
        label: 'Pubic symphysis width',
        plane: 'Coronal',
        description: 'Width of pubic symphysis fibrocartilaginous disc',
        normalValues: [
          { label: 'Normal', value: '< 6 mm' },
          { label: 'Diastasis', value: '> 10 mm' },
          { label: 'Postpartum', value: 'Up to 9 mm accepted' },
        ],
        diagram: 'pelvis-symphysis',
      },
      {
        id: 'hip-dysplasia',
        label: 'Acetabular index (AI)',
        plane: 'Coronal',
        description: 'Angle of acetabular roof relative to horizontal (Hilgenreiner line)',
        normalValues: [
          { label: 'Normal adult', value: '< 10°' },
          { label: 'Dysplasia', value: '> 13°' },
          { label: 'Severe dysplasia', value: '> 20°' },
        ],
        diagram: 'pelvis-ai',
      },
    ],
  },

  foot: {
    label: 'Foot',
    measurements: [
      {
        id: 'talar-first-met',
        label: 'Talo-first metatarsal angle (Meary)',
        plane: 'Sagittal weightbearing',
        description: 'Alignment of talar axis with first metatarsal axis',
        normalValues: [
          { label: 'Normal', value: '0° (straight line)' },
          { label: 'Pes planus', value: '> 4° (sag plantar)' },
          { label: 'Pes cavus', value: '> 4° (sag dorsal)' },
        ],
        diagram: 'foot-meary',
      },
      {
        id: 'calcaneal-pitch',
        label: 'Calcaneal pitch angle',
        plane: 'Sagittal lateral',
        description: 'Angle between calcaneal long axis and floor',
        normalValues: [
          { label: 'Normal', value: '18–30°' },
          { label: 'Flatfoot', value: '< 15°' },
          { label: 'Cavus foot', value: '> 30°' },
        ],
        diagram: 'foot-calcaneal-pitch',
      },
      {
        id: 'plantar-plate',
        label: 'Plantar plate thickness',
        plane: 'Sagittal',
        description: 'Thickness of plantar plate at 2nd MTP joint',
        normalValues: [
          { label: 'Normal', value: '2–3 mm' },
          { label: 'Tear', value: 'Thinning < 1.5 mm or discontinuity' },
        ],
        diagram: 'foot-plantar-plate',
      },
      {
        id: 'lisfranc',
        label: 'Lisfranc interval',
        plane: 'Coronal / axial',
        description: 'Gap between medial cuneiform and 2nd metatarsal base',
        normalValues: [
          { label: 'Normal', value: '< 2 mm' },
          { label: 'Sprain', value: '2–5 mm' },
          { label: 'Dislocation', value: '> 5 mm' },
        ],
        diagram: 'foot-lisfranc',
      },
    ],
  },
};

// ─── PLACEHOLDER SVG DIAGRAMS ────────────────────────────────────────────────
// Each SVG is a schematic annotation diagram keyed by diagram ID
const DIAGRAM_SVGS = {
  // KNEE
  'knee-meniscal-extrusion': (
    <svg viewBox="0 0 320 220" style={{width:"100%"}} aria-label="Meniscal extrusion measurement diagram">
      {/* Tibial plateau */}
      <rect x="40" y="110" width="240" height="18" rx="3" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="122" textAnchor="middle" fontSize="10" fill="#2a5a7a">Tibial plateau</text>
      {/* Medial meniscus body */}
      <ellipse cx="90" cy="105" rx="32" ry="12" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="90" y="107" textAnchor="middle" fontSize="9" fill="#1a4a3a">Meniscus</text>
      {/* Cartilage margin reference line */}
      <line x1="62" y1="90" x2="62" y2="130" stroke="#e07030" strokeWidth="1.5" strokeDasharray="4 2"/>
      <text x="20" y="88" fontSize="9" fill="#e07030">Cartilage</text>
      <text x="20" y="98" fontSize="9" fill="#e07030">margin</text>
      {/* Extrusion arrow */}
      <line x1="58" y1="100" x2="40" y2="100" stroke="#c0392b" strokeWidth="2" markerEnd="url(#arr-r)"/>
      <defs>
        <marker id="arr-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
        </marker>
      </defs>
      {/* Extrusion bracket */}
      <line x1="40" y1="95" x2="40" y2="115" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="58" y1="95" x2="58" y2="115" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="40" y1="105" x2="58" y2="105" stroke="#c0392b" strokeWidth="2"/>
      <text x="20" y="136" fontSize="10" fill="#c0392b" fontWeight="bold">Extrusion</text>
      <text x="20" y="148" fontSize="9" fill="#c0392b">≥ 3 mm = abnormal</text>
      {/* Femoral condyle suggestion */}
      <ellipse cx="90" cy="75" rx="38" ry="22" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5" opacity="0.7"/>
      <text x="90" y="78" textAnchor="middle" fontSize="9" fill="#2a5a7a">Femoral condyle</text>
      <text x="230" y="170" fontSize="11" fill="#555" fontStyle="italic">Coronal PD view</text>
    </svg>
  ),

  'knee-tibial-slope': (
    <svg viewBox="0 0 320 220" aria-label="Posterior tibial slope measurement">
      {/* Tibia long axis */}
      <line x1="160" y1="30" x2="160" y2="200" stroke="#888" strokeWidth="1" strokeDasharray="4 3"/>
      {/* Tibial plateau line */}
      <line x1="80" y1="110" x2="240" y2="130" stroke="#4a7fa5" strokeWidth="2.5"/>
      <text x="245" y="134" fontSize="9" fill="#4a7fa5">Plateau</text>
      {/* Perpendicular reference */}
      <line x1="80" y1="110" x2="240" y2="110" stroke="#aaa" strokeWidth="1" strokeDasharray="3 2"/>
      {/* Angle arc */}
      <path d="M 145 110 A 15 15 0 0 0 143 123" fill="none" stroke="#e07030" strokeWidth="2"/>
      <text x="115" y="125" fontSize="11" fill="#e07030" fontWeight="bold">β = 5–7°</text>
      {/* Tibial body */}
      <rect x="125" y="130" width="70" height="65" rx="4" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="168" textAnchor="middle" fontSize="9" fill="#2a5a7a">Tibia</text>
      <text x="160" y="210" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view</text>
    </svg>
  ),

  'knee-cartilage': (
    <svg viewBox="0 0 320 220" aria-label="Knee cartilage thickness measurement">
      <ellipse cx="160" cy="90" rx="65" ry="50" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="92" textAnchor="middle" fontSize="10" fill="#2a5a7a">Femoral condyle</text>
      <path d="M95 125 Q160 108 225 125" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="2"/>
      <text x="160" y="135" textAnchor="middle" fontSize="9" fill="#1a4a3a">Articular cartilage ~2.1 mm</text>
      <rect x="100" y="138" width="120" height="30" rx="3" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="157" textAnchor="middle" fontSize="9" fill="#2a5a7a">Tibial plateau</text>
      <path d="M100 138 Q160 120 220 138" fill="#9cccbc" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="160" y="176" textAnchor="middle" fontSize="9" fill="#1a4a3a">Tibial cartilage ~2.3 mm</text>
      {/* Measurement arrows */}
      <line x1="228" y1="118" x2="228" y2="138" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="218" y1="118" x2="238" y2="118" stroke="#c0392b" strokeWidth="1"/>
      <line x1="218" y1="138" x2="238" y2="138" stroke="#c0392b" strokeWidth="1"/>
      <text x="245" y="132" fontSize="9" fill="#c0392b">T</text>
      <text x="160" y="210" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal 3D sequence</text>
    </svg>
  ),

  'knee-notch': (
    <svg viewBox="0 0 320 220" aria-label="Intercondylar notch width measurement">
      {/* Distal femur */}
      <path d="M60 60 Q160 40 260 60 L260 140 Q220 160 200 150 Q170 130 160 128 Q150 130 120 150 Q100 160 60 140 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
      <text x="160" y="80" textAnchor="middle" fontSize="10" fill="#2a5a7a">Distal femur</text>
      {/* Notch */}
      <path d="M120 150 Q160 128 200 150" fill="white" stroke="#4a7fa5" strokeWidth="1.5"/>
      {/* Notch width arrow */}
      <line x1="120" y1="162" x2="200" y2="162" stroke="#c0392b" strokeWidth="2"/>
      <line x1="120" y1="155" x2="120" y2="169" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="200" y1="155" x2="200" y2="169" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="160" y="178" textAnchor="middle" fontSize="10" fill="#c0392b">Notch width (N)</text>
      {/* Total condyle width */}
      <line x1="60" y1="192" x2="260" y2="192" stroke="#e07030" strokeWidth="1.5"/>
      <line x1="60" y1="185" x2="60" y2="199" stroke="#e07030" strokeWidth="1.5"/>
      <line x1="260" y1="185" x2="260" y2="199" stroke="#e07030" strokeWidth="1.5"/>
      <text x="160" y="210" textAnchor="middle" fontSize="10" fill="#e07030">Condyle width (W) — NWI = N/W &gt; 0.23</text>
    </svg>
  ),

  // SHOULDER
  'shoulder-ahi': (
    <svg viewBox="0 0 320 220" aria-label="Acromiohumeral interval measurement">
      {/* Acromion */}
      <path d="M60 60 L200 60 L200 80 L80 80 L60 100 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="130" y="74" textAnchor="middle" fontSize="10" fill="#2a5a7a">Acromion</text>
      {/* Humeral head */}
      <ellipse cx="160" cy="150" rx="70" ry="55" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="153" textAnchor="middle" fontSize="10" fill="#2a5a7a">Humeral head</text>
      {/* AHI measurement */}
      <line x1="160" y1="80" x2="160" y2="95" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="145" y1="80" x2="175" y2="80" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="145" y1="95" x2="175" y2="95" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="185" y="91" fontSize="11" fill="#c0392b" fontWeight="bold">AHI</text>
      <text x="185" y="103" fontSize="9" fill="#c0392b">9–10 mm</text>
      <text x="160" y="215" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal oblique view</text>
    </svg>
  ),

  'shoulder-chi': (
    <svg viewBox="0 0 320 220" aria-label="Coracohumeral interval measurement">
      {/* Coracoid process */}
      <path d="M80 70 L120 70 L130 110 L90 110 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="105" y="90" textAnchor="middle" fontSize="9" fill="#2a5a7a">Coracoid</text>
      {/* Lesser tuberosity / humeral head */}
      <ellipse cx="210" cy="130" rx="80" ry="65" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="210" y="133" textAnchor="middle" fontSize="10" fill="#2a5a7a">Humeral head</text>
      {/* Lesser tuberosity marker */}
      <ellipse cx="138" cy="110" rx="12" ry="8" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="138" y="113" textAnchor="middle" fontSize="7" fill="#1a4a3a">LT</text>
      {/* CHI bracket */}
      <line x1="130" y1="110" x2="90" y2="110" stroke="#c0392b" strokeWidth="2"/>
      <line x1="130" y1="103" x2="130" y2="117" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="90" y1="103" x2="90" y2="117" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="110" y="132" textAnchor="middle" fontSize="10" fill="#c0392b" fontWeight="bold">CHI 7–11 mm</text>
      <text x="160" y="215" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial view</text>
    </svg>
  ),

  'shoulder-rc': (
    <svg viewBox="0 0 320 220" aria-label="Rotator cuff thickness measurement">
      {/* Humeral head */}
      <ellipse cx="160" cy="155" rx="75" ry="55" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="158" textAnchor="middle" fontSize="10" fill="#2a5a7a">Humeral head</text>
      {/* Supraspinatus tendon */}
      <path d="M85 100 Q160 85 235 105 L235 118 Q160 100 85 113 Z" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="2"/>
      <text x="160" y="107" textAnchor="middle" fontSize="9" fill="#1a4a3a">Supraspinatus tendon</text>
      {/* Thickness measurement */}
      <line x1="200" y1="90" x2="200" y2="118" stroke="#c0392b" strokeWidth="2"/>
      <line x1="190" y1="90" x2="210" y2="90" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="190" y1="118" x2="210" y2="118" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="220" y="107" fontSize="10" fill="#c0392b" fontWeight="bold">6–9 mm</text>
      {/* Acromion */}
      <rect x="70" y="70" width="180" height="20" rx="3" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="84" textAnchor="middle" fontSize="9" fill="#2a5a7a">Acromion</text>
      <text x="160" y="215" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal oblique view</text>
    </svg>
  ),

  'shoulder-cartilage': (
    <svg viewBox="0 0 320 220" aria-label="Glenohumeral cartilage measurement">
      {/* Glenoid */}
      <ellipse cx="90" cy="120" rx="20" ry="55" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="90" y="123" textAnchor="middle" fontSize="9" fill="#2a5a7a">Glenoid</text>
      {/* Glenoid cartilage */}
      <path d="M108 75 Q115 120 108 165" fill="none" stroke="#2d7a5a" strokeWidth="5" opacity="0.7"/>
      <text x="125" y="80" fontSize="8" fill="#2d7a5a">1.0–1.5 mm</text>
      {/* Humeral head */}
      <ellipse cx="210" cy="120" rx="75" ry="70" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="210" y="123" textAnchor="middle" fontSize="10" fill="#2a5a7a">Humeral head</text>
      {/* Humeral cartilage */}
      <path d="M138 75 Q130 120 138 165" fill="none" stroke="#9cccbc" strokeWidth="6" opacity="0.8"/>
      <text x="125" y="175" fontSize="8" fill="#2d7a5a">1.2–1.8 mm</text>
      <text x="160" y="215" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial / coronal view</text>
    </svg>
  ),

  // HIP
  'hip-alpha': (
    <svg viewBox="0 0 320 240" aria-label="Alpha angle measurement for cam FAI">
      {/* Femoral head circle */}
      <circle cx="160" cy="120" r="60" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="123" textAnchor="middle" fontSize="10" fill="#2a5a7a">Femoral head</text>
      {/* Femoral neck */}
      <path d="M200 160 L260 210" stroke="#4a7fa5" strokeWidth="10" strokeLinecap="round"/>
      <text x="248" y="205" fontSize="9" fill="#2a5a7a" transform="rotate(40 248 205)">Neck axis</text>
      {/* Best-fit circle center */}
      <circle cx="160" cy="120" r="3" fill="#c0392b"/>
      {/* Alpha angle lines */}
      <line x1="160" y1="120" x2="260" y2="190" stroke="#e07030" strokeWidth="2"/>
      <line x1="160" y1="120" x2="210" y2="65" stroke="#c0392b" strokeWidth="2"/>
      {/* Cam bump */}
      <ellipse cx="208" cy="80" rx="18" ry="10" fill="#f0a070" stroke="#c0392b" strokeWidth="1.5" transform="rotate(-30 208 80)"/>
      <text x="230" y="72" fontSize="8" fill="#c0392b">Cam bump</text>
      {/* Angle arc */}
      <path d="M 175 127 A 20 20 0 0 1 167 108" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="188" y="112" fontSize="11" fill="#c0392b" fontWeight="bold">α &gt; 55°</text>
      <text x="160" y="230" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Oblique axial / radial plane</text>
    </svg>
  ),

  'hip-lce': (
    <svg viewBox="0 0 320 230" aria-label="Lateral center-edge angle measurement">
      {/* Acetabulum */}
      <path d="M80 60 Q160 30 240 60 L240 140 Q200 170 160 175 Q120 170 80 140 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5" opacity="0.8"/>
      <text x="160" y="90" textAnchor="middle" fontSize="9" fill="#2a5a7a">Acetabulum</text>
      {/* Femoral head */}
      <circle cx="160" cy="140" r="38" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="143" textAnchor="middle" fontSize="10" fill="#2a5a7a">Femoral head</text>
      {/* Center point */}
      <circle cx="160" cy="140" r="3" fill="#c0392b"/>
      {/* Vertical reference */}
      <line x1="160" y1="50" x2="160" y2="200" stroke="#aaa" strokeWidth="1" strokeDasharray="4 2"/>
      {/* LCE angle line */}
      <line x1="160" y1="140" x2="240" y2="68" stroke="#c0392b" strokeWidth="2"/>
      {/* Angle arc */}
      <path d="M 160 108 A 32 32 0 0 1 187 117" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="190" y="105" fontSize="11" fill="#c0392b" fontWeight="bold">LCE</text>
      <text x="190" y="118" fontSize="10" fill="#c0392b">25–39° normal</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'hip-offset': (
    <svg viewBox="0 0 320 230" aria-label="Femoral head-neck offset measurement">
      {/* Femoral head */}
      <circle cx="120" cy="100" r="55" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="120" y="103" textAnchor="middle" fontSize="10" fill="#2a5a7a">Femoral head</text>
      {/* Neck */}
      <rect x="155" y="110" width="90" height="40" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="200" y="134" textAnchor="middle" fontSize="9" fill="#2a5a7a">Femoral neck</text>
      {/* Offset lines */}
      <line x1="155" y1="80" x2="155" y2="185" stroke="#aaa" strokeWidth="1" strokeDasharray="3 2"/>
      <line x1="175" y1="80" x2="175" y2="185" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Offset bracket */}
      <line x1="155" y1="178" x2="175" y2="178" stroke="#c0392b" strokeWidth="2"/>
      <line x1="155" y1="170" x2="155" y2="186" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="175" y1="170" x2="175" y2="186" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="180" y="183" fontSize="10" fill="#c0392b">≥ 8 mm normal</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Oblique axial view</text>
    </svg>
  ),

  'hip-depth': (
    <svg viewBox="0 0 320 230" aria-label="Acetabular depth measurement">
      {/* Ilioischial line */}
      <line x1="50" y1="155" x2="270" y2="155" stroke="#e07030" strokeWidth="2" strokeDasharray="5 2"/>
      <text x="275" y="158" fontSize="9" fill="#e07030">Ilioischial line</text>
      {/* Acetabulum */}
      <path d="M90 80 Q160 55 230 80 L230 155 Q200 175 160 180 Q120 175 90 155 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      {/* Femoral head */}
      <circle cx="160" cy="140" r="38" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="143" textAnchor="middle" fontSize="9" fill="#2a5a7a">Femoral head</text>
      {/* Depth measurement */}
      <line x1="160" y1="102" x2="160" y2="155" stroke="#c0392b" strokeWidth="2"/>
      <text x="168" y="133" fontSize="9" fill="#c0392b">Depth</text>
      <text x="168" y="145" fontSize="9" fill="#c0392b">&gt;3 mm = protrusio</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  // WRIST
  'wrist-ulnar-variance': (
    <svg viewBox="0 0 320 230" aria-label="Ulnar variance measurement">
      {/* Radius */}
      <rect x="90" y="40" width="60" height="130" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="120" y="105" textAnchor="middle" fontSize="10" fill="#2a5a7a">Radius</text>
      {/* Radius articular surface */}
      <line x1="90" y1="170" x2="150" y2="170" stroke="#4a7fa5" strokeWidth="2.5"/>
      {/* Ulna */}
      <rect x="170" y="55" width="60" height="115" rx="8" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="200" y="115" textAnchor="middle" fontSize="10" fill="#2a5a7a">Ulna</text>
      {/* Ulna articular surface (neutral) */}
      <line x1="170" y1="170" x2="230" y2="170" stroke="#4a7fa5" strokeWidth="2.5" strokeDasharray="4 2"/>
      {/* Positive variance example */}
      <line x1="170" y1="155" x2="230" y2="155" stroke="#c0392b" strokeWidth="2"/>
      {/* Variance bracket */}
      <line x1="240" y1="155" x2="240" y2="170" stroke="#c0392b" strokeWidth="2"/>
      <line x1="232" y1="155" x2="248" y2="155" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="232" y1="170" x2="248" y2="170" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="252" y="166" fontSize="9" fill="#c0392b">UV</text>
      <text x="50" y="185" fontSize="9" fill="#888">Neutral = 0, Pos &gt; 2mm = impaction risk</text>
      <text x="160" y="220" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal T1/PD at sigmoid notch</text>
    </svg>
  ),

  'wrist-sl-interval': (
    <svg viewBox="0 0 320 230" aria-label="Scapholunate interval measurement">
      {/* Radius */}
      <rect x="80" y="30" width="160" height="50" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="60" textAnchor="middle" fontSize="10" fill="#2a5a7a">Distal radius</text>
      {/* Scaphoid */}
      <ellipse cx="110" cy="135" rx="30" ry="35" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="110" y="138" textAnchor="middle" fontSize="9" fill="#2a5a7a">Scaphoid</text>
      {/* Lunate */}
      <ellipse cx="195" cy="132" rx="32" ry="33" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="195" y="135" textAnchor="middle" fontSize="9" fill="#2a5a7a">Lunate</text>
      {/* SL interval */}
      <line x1="140" y1="132" x2="163" y2="132" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="140" y1="124" x2="140" y2="140" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="163" y1="124" x2="163" y2="140" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="152" y="155" textAnchor="middle" fontSize="9" fill="#c0392b" fontWeight="bold">SL gap</text>
      <text x="152" y="167" textAnchor="middle" fontSize="9" fill="#c0392b">&lt; 3 mm normal</text>
      <text x="160" y="220" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'wrist-median-nerve': (
    <svg viewBox="0 0 320 230" aria-label="Median nerve cross-sectional area measurement">
      {/* Carpal tunnel outline */}
      <rect x="70" y="60" width="180" height="130" rx="30" fill="#f0f0f0" stroke="#aaa" strokeWidth="1.5"/>
      <text x="160" y="205" textAnchor="middle" fontSize="9" fill="#888">Carpal tunnel (axial)</text>
      {/* Flexor tendons */}
      {[100,125,150,175,200].map((x,i) => (
        <circle key={i} cx={x} cy={140} r={10} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1"/>
      ))}
      {[112,137,162,187].map((x,i) => (
        <circle key={i} cx={x} cy={115} r={10} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1"/>
      ))}
      {/* Median nerve */}
      <ellipse cx="160" cy="85" rx="18" ry="14" fill="#f0c090" stroke="#c0392b" strokeWidth="2"/>
      <text x="160" y="88" textAnchor="middle" fontSize="8" fill="#c0392b" fontWeight="bold">MN</text>
      {/* CSA annotation */}
      <line x1="178" y1="80" x2="215" y2="65" stroke="#c0392b" strokeWidth="1" strokeDasharray="3 2"/>
      <text x="220" y="63" fontSize="9" fill="#c0392b">CSA</text>
      <text x="220" y="74" fontSize="9" fill="#c0392b">&lt; 9 mm² normal</text>
      <text x="160" y="220" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial T1 at pisiform level</text>
    </svg>
  ),

  'wrist-carpal-height': (
    <svg viewBox="0 0 320 230" aria-label="Carpal height ratio measurement">
      {/* 3rd metacarpal */}
      <rect x="140" y="30" width="40" height="90" rx="5" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="80" textAnchor="middle" fontSize="8" fill="#2a5a7a">3rd MC</text>
      {/* Carpal bones block */}
      <rect x="100" y="120" width="120" height="60" rx="6" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="154" textAnchor="middle" fontSize="9" fill="#2a5a7a">Carpal column</text>
      {/* Carpal height bracket */}
      <line x1="72" y1="120" x2="72" y2="180" stroke="#c0392b" strokeWidth="2"/>
      <line x1="64" y1="120" x2="80" y2="120" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="64" y1="180" x2="80" y2="180" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="35" y="153" fontSize="9" fill="#c0392b">CH</text>
      {/* MC length bracket */}
      <line x1="240" y1="30" x2="240" y2="120" stroke="#e07030" strokeWidth="2"/>
      <line x1="232" y1="30" x2="248" y2="30" stroke="#e07030" strokeWidth="1.5"/>
      <line x1="232" y1="120" x2="248" y2="120" stroke="#e07030" strokeWidth="1.5"/>
      <text x="252" y="79" fontSize="9" fill="#e07030">MC</text>
      <text x="80" y="210" fontSize="9" fill="#555">CHR = CH / MC length  →  normal 0.52–0.57</text>
    </svg>
  ),

  // ELBOW
  'elbow-carrying': (
    <svg viewBox="0 0 320 240" aria-label="Elbow carrying angle measurement">
      {/* Humerus */}
      <rect x="125" y="20" width="50" height="120" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="150" y="80" textAnchor="middle" fontSize="9" fill="#2a5a7a">Humerus</text>
      {/* Ulna (angled) */}
      <path d="M155 140 L175 230" stroke="#4a7fa5" strokeWidth="12" strokeLinecap="round"/>
      <text x="185" y="195" fontSize="9" fill="#2a5a7a">Ulna</text>
      {/* Humerus axis */}
      <line x1="150" y1="20" x2="150" y2="230" stroke="#aaa" strokeWidth="1" strokeDasharray="4 2"/>
      {/* Carrying angle arc */}
      <path d="M 150 148 A 24 24 0 0 1 166 158" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="172" y="148" fontSize="11" fill="#c0392b" fontWeight="bold">5–15°</text>
      <text x="172" y="160" fontSize="9" fill="#c0392b">valgus</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">AP / coronal view (full extension)</text>
    </svg>
  ),

  'elbow-radiocapitellar': (
    <svg viewBox="0 0 320 230" aria-label="Radiocapitellar line">
      {/* Humerus distal */}
      <ellipse cx="145" cy="80" rx="40" ry="30" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="145" y="83" textAnchor="middle" fontSize="9" fill="#2a5a7a">Capitellum</text>
      {/* Radius */}
      <rect x="165" y="110" width="35" height="100" rx="6" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="182" y="165" textAnchor="middle" fontSize="8" fill="#2a5a7a">Radius</text>
      {/* Radial neck center line */}
      <line x1="182" y1="30" x2="182" y2="210" stroke="#c0392b" strokeWidth="2" strokeDasharray="5 2"/>
      <text x="200" y="45" fontSize="9" fill="#c0392b">Radiocapitellar</text>
      <text x="200" y="56" fontSize="9" fill="#c0392b">line should bisect</text>
      <text x="200" y="67" fontSize="9" fill="#c0392b">capitellum ✓</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal / lateral view</text>
    </svg>
  ),

  'elbow-ucl': (
    <svg viewBox="0 0 320 230" aria-label="Ulnar collateral ligament thickness">
      {/* Medial epicondyle */}
      <ellipse cx="90" cy="90" rx="35" ry="28" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="90" y="93" textAnchor="middle" fontSize="8" fill="#2a5a7a">Med. epicondyle</text>
      {/* UCL band */}
      <path d="M110 105 Q160 125 200 160" fill="none" stroke="#2d7a5a" strokeWidth="8" strokeLinecap="round" opacity="0.8"/>
      <text x="165" y="120" fontSize="9" fill="#1a4a3a" transform="rotate(35 165 120)">UCL anterior bundle</text>
      {/* Ulna attachment */}
      <ellipse cx="215" cy="175" rx="35" ry="22" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="215" y="178" textAnchor="middle" fontSize="8" fill="#2a5a7a">Ulna (coronoid)</text>
      {/* Thickness annotation */}
      <line x1="140" y1="112" x2="170" y2="100" stroke="#c0392b" strokeWidth="1" strokeDasharray="3 2"/>
      <text x="175" y="98" fontSize="9" fill="#c0392b">3–4 mm normal</text>
      <text x="160" y="220" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'elbow-extensor': (
    <svg viewBox="0 0 320 230" aria-label="Common extensor tendon thickness">
      {/* Lateral epicondyle */}
      <ellipse cx="110" cy="90" rx="38" ry="28" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="110" y="93" textAnchor="middle" fontSize="8" fill="#2a5a7a">Lat. epicondyle</text>
      {/* Common extensor tendon */}
      <path d="M140 100 Q200 110 240 115" fill="none" stroke="#8bb8a8" strokeWidth="12" strokeLinecap="round" opacity="0.8"/>
      <text x="195" y="108" textAnchor="middle" fontSize="8" fill="#1a4a3a">Common extensor origin</text>
      {/* Thickness lines */}
      <line x1="175" y1="96" x2="175" y2="116" stroke="#c0392b" strokeWidth="2"/>
      <line x1="167" y1="96" x2="183" y2="96" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="167" y1="116" x2="183" y2="116" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="190" y="109" fontSize="9" fill="#c0392b">4–6 mm</text>
      <text x="160" y="220" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  // ANKLE
  'ankle-talar-tilt': (
    <svg viewBox="0 0 320 230" aria-label="Talar tilt angle measurement">
      {/* Tibia */}
      <rect x="100" y="20" width="120" height="70" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="58" textAnchor="middle" fontSize="10" fill="#2a5a7a">Tibia plafond</text>
      {/* Fibula */}
      <rect x="225" y="30" width="30" height="65" rx="5" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      {/* Tibia plafond line */}
      <line x1="100" y1="90" x2="220" y2="90" stroke="#4a7fa5" strokeWidth="2"/>
      {/* Talus (tilted) */}
      <path d="M90 100 L230 100 L225 155 L95 140 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="130" textAnchor="middle" fontSize="10" fill="#2a5a7a">Talus</text>
      {/* Talar dome line */}
      <line x1="95" y1="100" x2="225" y2="100" stroke="#aaa" strokeWidth="1" strokeDasharray="3 2"/>
      {/* Tilt line */}
      <line x1="95" y1="100" x2="235" y2="108" stroke="#c0392b" strokeWidth="2"/>
      {/* Tilt angle arc */}
      <path d="M 130 100 A 18 18 0 0 1 132 107" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="108" y="117" fontSize="10" fill="#c0392b">Tilt &lt; 5°</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal mortise view</text>
    </svg>
  ),

  'ankle-syndesmosis': (
    <svg viewBox="0 0 320 230" aria-label="Syndesmosis measurement">
      {/* Tibia */}
      <rect x="80" y="50" width="110" height="100" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="135" y="105" textAnchor="middle" fontSize="10" fill="#2a5a7a">Tibia</text>
      {/* Fibula */}
      <rect x="200" y="70" width="55" height="80" rx="5" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="227" y="113" textAnchor="middle" fontSize="9" fill="#2a5a7a">Fibula</text>
      {/* Syndesmotic space bracket */}
      <line x1="190" y1="100" x2="200" y2="100" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="190" y1="92" x2="190" y2="108" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="200" y1="92" x2="200" y2="108" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="160" y="125" textAnchor="middle" fontSize="9" fill="#c0392b">Clear space &lt; 5 mm</text>
      {/* AITFL label */}
      <line x1="195" y1="80" x2="235" y2="60" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="238" y="58" fontSize="8" fill="#2d7a5a">AITFL</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial view, 1 cm above plafond</text>
    </svg>
  ),

  'ankle-achilles': (
    <svg viewBox="0 0 320 230" aria-label="Achilles tendon thickness measurement">
      {/* Calcaneus */}
      <ellipse cx="165" cy="190" rx="70" ry="35" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="165" y="193" textAnchor="middle" fontSize="10" fill="#2a5a7a">Calcaneus</text>
      {/* Achilles tendon */}
      <path d="M140 30 Q148 120 152 155" fill="none" stroke="#8bb8a8" strokeWidth="16" strokeLinecap="round" opacity="0.85"/>
      <text x="80" y="80" fontSize="9" fill="#1a4a3a">Achilles tendon</text>
      {/* Thickness at critical zone */}
      <line x1="133" y1="100" x2="160" y2="100" stroke="#c0392b" strokeWidth="2"/>
      <line x1="133" y1="92" x2="133" y2="108" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="160" y1="92" x2="160" y2="108" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="168" y="103" fontSize="9" fill="#c0392b">AP &lt; 6 mm</text>
      <text x="168" y="115" fontSize="8" fill="#888">2–6 cm above insertion</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view</text>
    </svg>
  ),

  'ankle-plantar-fascia': (
    <svg viewBox="0 0 320 210" aria-label="Plantar fascia thickness">
      {/* Foot lateral silhouette */}
      <path d="M40 120 Q80 80 160 75 Q230 70 280 100 L280 155 Q200 180 100 175 Z" fill="#f8f0e8" stroke="#aaa" strokeWidth="1"/>
      {/* Calcaneus */}
      <ellipse cx="80" cy="140" rx="45" ry="30" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="80" y="143" textAnchor="middle" fontSize="9" fill="#2a5a7a">Calcaneus</text>
      {/* Plantar fascia band */}
      <path d="M110 162 Q190 168 270 155" fill="none" stroke="#8bb8a8" strokeWidth="7" strokeLinecap="round" opacity="0.85"/>
      <text x="190" y="180" textAnchor="middle" fontSize="8" fill="#1a4a3a">Plantar fascia</text>
      {/* Thickness at origin */}
      <line x1="110" y1="156" x2="110" y2="168" stroke="#c0392b" strokeWidth="2"/>
      <line x1="103" y1="156" x2="117" y2="156" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="103" y1="168" x2="117" y2="168" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="122" y="162" fontSize="9" fill="#c0392b">2–4 mm</text>
      <text x="122" y="174" fontSize="8" fill="#c0392b">≥ 4 mm = fasciitis</text>
      <text x="160" y="205" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view — calcaneal origin</text>
    </svg>
  ),

  // SPINE
  'spine-disc-height': (
    <svg viewBox="0 0 320 230" aria-label="Disc height index measurement">
      {/* Vertebral bodies */}
      {[20, 80, 140].map((y, i) => (
        <rect key={i} x="100" y={y} width="120" height="45" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      ))}
      {/* Disc 1 */}
      <rect x="100" y="65" width="120" height="15" rx="3" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="160" y="76" textAnchor="middle" fontSize="8" fill="#1a4a3a">Disc</text>
      {/* Disc 2 */}
      <rect x="100" y="125" width="120" height="15" rx="3" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      {/* Height brackets */}
      <line x1="232" y1="20" x2="232" y2="65" stroke="#c0392b" strokeWidth="2"/>
      <line x1="224" y1="20" x2="240" y2="20" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="224" y1="65" x2="240" y2="65" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="245" y="46" fontSize="8" fill="#c0392b">VB ht</text>
      <line x1="232" y1="65" x2="232" y2="80" stroke="#e07030" strokeWidth="2"/>
      <line x1="224" y1="65" x2="240" y2="65" stroke="#e07030" strokeWidth="1.5"/>
      <line x1="224" y1="80" x2="240" y2="80" stroke="#e07030" strokeWidth="1.5"/>
      <text x="245" y="75" fontSize="8" fill="#e07030">Disc ht</text>
      <text x="80" y="200" fontSize="9" fill="#555">DHI = disc ht / VB ht  →  normal 0.35–0.50</text>
      <text x="160" y="220" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal T2 view</text>
    </svg>
  ),

  'spine-canal': (
    <svg viewBox="0 0 320 220" aria-label="Spinal canal AP diameter measurement">
      {/* Vertebral body */}
      <rect x="70" y="60" width="140" height="80" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="140" y="105" textAnchor="middle" fontSize="10" fill="#2a5a7a">Vertebral body</text>
      {/* Pedicles */}
      <rect x="210" y="75" width="25" height="50" rx="4" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <rect x="45" y="75" width="25" height="50" rx="4" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      {/* Lamina / spinous process */}
      <path d="M235 80 Q260 100 240 125 L215 125" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <path d="M45 80 Q20 100 40 125 L65 125" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      {/* Spinal canal */}
      <rect x="210" y="80" width="5" height="45" fill="white"/>
      <rect x="65" y="80" width="5" height="45" fill="white"/>
      <rect x="65" y="80" width="150" height="45" rx="0" fill="white" stroke="none"/>
      {/* AP diameter measurement */}
      <line x1="140" y1="80" x2="140" y2="125" stroke="#c0392b" strokeWidth="2"/>
      <line x1="130" y1="80" x2="150" y2="80" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="130" y1="125" x2="150" y2="125" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="155" y="106" fontSize="9" fill="#c0392b">AP</text>
      <text x="155" y="118" fontSize="8" fill="#c0392b">&gt;13 mm Cx</text>
      <text x="155" y="130" fontSize="8" fill="#c0392b">&gt;15 mm Lu</text>
      <text x="160" y="215" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial T2 view</text>
    </svg>
  ),

  'spine-cobb': (
    <svg viewBox="0 0 320 240" aria-label="Cobb angle scoliosis measurement">
      {/* Curved spine suggestion */}
      {[0,1,2,3,4].map((i) => {
        const y = 30 + i * 38;
        const xOffset = [0, 15, 25, 15, 0][i];
        return <rect key={i} x={100 + xOffset} y={y} width={100} height={26} rx={5} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>;
      })}
      {/* Top endplate line */}
      <line x1="100" y1="30" x2="200" y2="30" stroke="#c0392b" strokeWidth="2"/>
      {/* Bottom endplate line (tilted) */}
      <line x1="115" y1="220" x2="215" y2="216" stroke="#c0392b" strokeWidth="2"/>
      {/* Cobb angle lines extended */}
      <line x1="100" y1="30" x2="60" y2="120" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      <line x1="115" y1="220" x2="55" y2="130" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      {/* Cobb angle arc */}
      <path d="M 68 115 A 22 22 0 0 0 70 132" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="28" y="128" fontSize="11" fill="#c0392b" fontWeight="bold">Cobb °</text>
      <text x="40" y="165" fontSize="9" fill="#888">Normal &lt;10°</text>
      <text x="40" y="177" fontSize="9" fill="#888">Scoliosis ≥10°</text>
      <text x="160" y="235" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'spine-foramen': (
    <svg viewBox="0 0 320 220" aria-label="Neural foraminal height measurement">
      {/* Two vertebral bodies with foramen */}
      <rect x="80" y="30" width="130" height="60" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <rect x="80" y="130" width="130" height="60" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="145" y="63" textAnchor="middle" fontSize="10" fill="#2a5a7a">Vertebra</text>
      <text x="145" y="163" textAnchor="middle" fontSize="10" fill="#2a5a7a">Vertebra</text>
      {/* Disc */}
      <rect x="80" y="90" width="130" height="40" rx="4" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="145" y="114" textAnchor="middle" fontSize="9" fill="#1a4a3a">Disc</text>
      {/* Foramen */}
      <ellipse cx="240" cy="110" rx="20" ry="35" fill="#fff8e8" stroke="#e07030" strokeWidth="2"/>
      <text x="240" y="113" textAnchor="middle" fontSize="8" fill="#e07030">Foramen</text>
      {/* Height measurement */}
      <line x1="265" y1="75" x2="265" y2="145" stroke="#c0392b" strokeWidth="2"/>
      <line x1="257" y1="75" x2="273" y2="75" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="257" y1="145" x2="273" y2="145" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="278" y="113" fontSize="9" fill="#c0392b">&gt;15 mm</text>
      <text x="278" y="125" fontSize="9" fill="#c0392b">normal</text>
      <text x="160" y="215" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view</text>
    </svg>
  ),

  // PELVIS
  'pelvis-si-joint': (
    <svg viewBox="0 0 320 220" aria-label="SI joint width measurement">
      {/* Sacrum */}
      <path d="M120 60 L200 60 L195 170 L125 170 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="118" textAnchor="middle" fontSize="10" fill="#2a5a7a">Sacrum</text>
      {/* Left ilium */}
      <path d="M70 40 L118 60 L122 170 L65 175 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="88" y="108" textAnchor="middle" fontSize="9" fill="#2a5a7a">Ilium</text>
      {/* Right ilium */}
      <path d="M250 40 L202 60 L198 170 L255 175 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="230" y="108" textAnchor="middle" fontSize="9" fill="#2a5a7a">Ilium</text>
      {/* SI joint bracket left */}
      <line x1="118" y1="110" x2="122" y2="110" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="118" y1="102" x2="118" y2="118" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="122" y1="102" x2="122" y2="118" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="95" y="130" fontSize="8" fill="#c0392b">2–5 mm</text>
      <text x="160" y="212" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal / axial view</text>
    </svg>
  ),

  'pelvis-symphysis': (
    <svg viewBox="0 0 320 220" aria-label="Pubic symphysis width measurement">
      {/* Left pubis */}
      <path d="M60 80 L148 80 L148 160 L60 160 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5" rx="8"/>
      <text x="104" y="123" textAnchor="middle" fontSize="9" fill="#2a5a7a">L pubis</text>
      {/* Right pubis */}
      <path d="M172 80 L260 80 L260 160 L172 160 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="216" y="123" textAnchor="middle" fontSize="9" fill="#2a5a7a">R pubis</text>
      {/* Fibrocartilage disc */}
      <rect x="148" y="85" width="24" height="70" rx="2" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="160" y="125" textAnchor="middle" fontSize="7" fill="#1a4a3a" transform="rotate(90 160 125)">Fibrocart.</text>
      {/* Width bracket */}
      <line x1="148" y1="175" x2="172" y2="175" stroke="#c0392b" strokeWidth="2"/>
      <line x1="148" y1="167" x2="148" y2="183" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="172" y1="167" x2="172" y2="183" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="100" y="200" fontSize="9" fill="#c0392b">Width &lt; 6 mm normal; &gt;10 mm = diastasis</text>
      <text x="160" y="215" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'pelvis-ai': (
    <svg viewBox="0 0 320 220" aria-label="Acetabular index measurement">
      {/* Hilgenreiner line */}
      <line x1="40" y1="120" x2="280" y2="120" stroke="#e07030" strokeWidth="2" strokeDasharray="5 2"/>
      <text x="285" y="123" fontSize="9" fill="#e07030">H line</text>
      {/* Acetabular roofs */}
      <path d="M60 60 Q100 80 130 120" stroke="#4a7fa5" strokeWidth="3" fill="none"/>
      <path d="M260 60 Q220 80 190 120" stroke="#4a7fa5" strokeWidth="3" fill="none"/>
      {/* AI angle left */}
      <line x1="60" y1="120" x2="130" y2="120" stroke="#aaa" strokeWidth="1" strokeDasharray="3 2"/>
      <line x1="60" y1="60" x2="130" y2="120" stroke="#c0392b" strokeWidth="2"/>
      <path d="M 80 120 A 20 20 0 0 0 74 104" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="40" y="100" fontSize="10" fill="#c0392b" fontWeight="bold">AI</text>
      <text x="32" y="114" fontSize="9" fill="#c0392b">&lt;10° nl</text>
      {/* Femoral heads */}
      <circle cx="95" cy="148" r="30" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <circle cx="225" cy="148" r="30" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="212" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  // FOOT
  'foot-meary': (
    <svg viewBox="0 0 320 200" aria-label="Talo-first metatarsal angle Meary measurement">
      {/* Floor */}
      <line x1="20" y1="175" x2="300" y2="175" stroke="#aaa" strokeWidth="1.5"/>
      {/* Calcaneus */}
      <ellipse cx="75" cy="150" rx="50" ry="28" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      {/* Talus */}
      <ellipse cx="145" cy="110" rx="45" ry="28" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="145" y="113" textAnchor="middle" fontSize="9" fill="#2a5a7a">Talus</text>
      {/* Talar axis */}
      <line x1="105" y1="115" x2="195" y2="105" stroke="#4a7fa5" strokeWidth="1.5" strokeDasharray="4 2"/>
      {/* First metatarsal */}
      <rect x="185" y="110" width="100" height="22" rx="6" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="235" y="125" textAnchor="middle" fontSize="9" fill="#2a5a7a">1st Met</text>
      {/* Met axis */}
      <line x1="185" y1="121" x2="285" y2="121" stroke="#4a7fa5" strokeWidth="1.5" strokeDasharray="4 2"/>
      {/* Angle at junction */}
      <path d="M 200 110 A 12 12 0 0 0 200 121" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="215" y="107" fontSize="9" fill="#c0392b">Meary 0°</text>
      <text x="215" y="118" fontSize="8" fill="#c0392b">normal = straight</text>
      <text x="160" y="195" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal weightbearing lateral</text>
    </svg>
  ),

  'foot-calcaneal-pitch': (
    <svg viewBox="0 0 320 200" aria-label="Calcaneal pitch angle">
      {/* Floor */}
      <line x1="20" y1="168" x2="300" y2="168" stroke="#aaa" strokeWidth="1.5"/>
      {/* Calcaneus */}
      <path d="M50 100 Q100 70 160 100 L165 165 L45 165 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="100" y="135" textAnchor="middle" fontSize="10" fill="#2a5a7a">Calcaneus</text>
      {/* Calcaneal long axis */}
      <line x1="50" y1="165" x2="160" y2="100" stroke="#4a7fa5" strokeWidth="1.5" strokeDasharray="4 2"/>
      {/* Floor reference */}
      <line x1="50" y1="165" x2="200" y2="165" stroke="#aaa" strokeWidth="1" strokeDasharray="3 2"/>
      {/* Angle arc */}
      <path d="M 80 165 A 30 30 0 0 1 68 143" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="92" y="150" fontSize="11" fill="#c0392b" fontWeight="bold">18–30°</text>
      <text x="160" y="192" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal lateral view</text>
    </svg>
  ),

  'foot-plantar-plate': (
    <svg viewBox="0 0 320 210" aria-label="Plantar plate thickness measurement">
      {/* 2nd metatarsal head */}
      <ellipse cx="130" cy="90" rx="40" ry="32" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="130" y="93" textAnchor="middle" fontSize="9" fill="#2a5a7a">2nd Met head</text>
      {/* Proximal phalanx */}
      <rect x="155" y="100" width="80" height="28" rx="6" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="195" y="117" textAnchor="middle" fontSize="9" fill="#2a5a7a">Prox phalanx</text>
      {/* Plantar plate */}
      <path d="M100 118 Q155 128 165 126" fill="none" stroke="#8bb8a8" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
      <text x="135" y="148" textAnchor="middle" fontSize="9" fill="#1a4a3a">Plantar plate</text>
      {/* Thickness measurement */}
      <line x1="140" y1="116" x2="140" y2="128" stroke="#c0392b" strokeWidth="2"/>
      <line x1="132" y1="116" x2="148" y2="116" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="132" y1="128" x2="148" y2="128" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="155" y="126" fontSize="9" fill="#c0392b">2–3 mm</text>
      <text x="160" y="200" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view at 2nd MTP</text>
    </svg>
  ),

  'foot-lisfranc': (
    <svg viewBox="0 0 320 210" aria-label="Lisfranc interval measurement">
      {/* Medial cuneiform */}
      <rect x="60" y="60" width="90" height="80" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="105" y="103" textAnchor="middle" fontSize="9" fill="#2a5a7a">Med. cuneiform</text>
      {/* 2nd metatarsal base */}
      <rect x="175" y="75" width="75" height="65" rx="6" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="212" y="110" textAnchor="middle" fontSize="9" fill="#2a5a7a">2nd Met base</text>
      {/* Lisfranc interval bracket */}
      <line x1="150" y1="105" x2="175" y2="105" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="150" y1="97" x2="150" y2="113" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="175" y1="97" x2="175" y2="113" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="158" y="132" textAnchor="middle" fontSize="9" fill="#c0392b" fontWeight="bold">Lisfranc gap</text>
      <text x="158" y="144" textAnchor="middle" fontSize="9" fill="#c0392b">&lt; 2 mm normal</text>
      {/* Lisfranc ligament */}
      <line x1="150" y1="105" x2="175" y2="108" stroke="#2d7a5a" strokeWidth="3" opacity="0.7"/>
      <text x="162" y="78" textAnchor="middle" fontSize="8" fill="#2d7a5a">Lisfranc lig.</text>
      <text x="160" y="200" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal / axial view</text>
    </svg>
  ),
};

// ─── BODY PARTS CONFIG (must match existing app) ─────────────────────────────
const BODY_PARTS = [
  { id: 'knee', label: 'Knee' },
  { id: 'shoulder', label: 'Shoulder' },
  { id: 'hip', label: 'Hip' },
  { id: 'wrist', label: 'Wrist' },
  { id: 'elbow', label: 'Elbow' },
  { id: 'ankle', label: 'Ankle' },
  { id: 'spine', label: 'Spine' },
  { id: 'pelvis', label: 'Pelvis / SI Joints' },
  { id: 'foot', label: 'Foot' },
];


export { JOINT_DATA, DIAGRAM_SVGS };
