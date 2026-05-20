// referenceData.js — MSK MRI/CT Reference Panel Data
// All joints with finalized measurement slots and schematic SVG diagrams

const JOINT_DATA = {

  // ─── KNEE (5 slots) ───────────────────────────────────────────────────────
  knee: {
    label: 'Knee',
    measurements: [
      {
        id: 'blumensaat',
        label: "ACL Angle (Blumensaat's Line)",
        plane: 'Sagittal',
        description: "ACL lies parallel to Blumensaat's line (roof of intercondylar notch) on sagittal MRI. Angulation or non-parallelism suggests ACL tear or laxity.",
        normalValues: [
          { label: 'Normal', value: 'ACL parallel to Blumensaat line' },
          { label: 'ACL angle', value: '< 15° from Blumensaat line' },
          { label: 'Concern', value: '> 15° angulation = ACL tear likely' },
        ],
        citations: [
          { label: "Stäubli HU et al. Blumensaat line ACL angle. J Bone Joint Surg 1990", url: "https://pubmed.ncbi.nlm.nih.gov/2312163/" },
        ],
        diagram: 'knee-blumensaat',
      },
      {
        id: 'tibial-slope',
        label: 'Posterior Tibial Slope',
        plane: 'Sagittal',
        description: 'Angle of tibial plateau relative to tibial long axis. Increased slope increases ACL strain and is a modifiable surgical risk factor.',
        normalValues: [
          { label: 'Normal bony slope', value: '5–7°' },
          { label: 'ACL risk', value: '> 12°' },
          { label: 'Method', value: 'Hudek: tibial long-axis reference' },
        ],
        citations: [
          { label: "Hudek R et al. Posterior tibial slope measurement on MRI. Knee Surg Sports Traumatol 2009", url: "https://pubmed.ncbi.nlm.nih.gov/19205714/" },
        ],
        diagram: 'knee-tibial-slope',
      },
      {
        id: 'trochlear-depth',
        label: 'Trochlear Depth / Sulcus Angle',
        plane: 'Axial',
        description: 'Sulcus angle measured between medial and lateral trochlear facets. Shallow trochlea predisposes to patellar instability.',
        normalValues: [
          { label: 'Normal sulcus angle', value: '138–142°' },
          { label: 'Trochlear dysplasia', value: '> 145°' },
          { label: 'Trochlear depth', value: 'Normal > 3 mm' },
        ],
        citations: [
          { label: "Dejour H et al. Trochlear dysplasia classification. Rev Chir Orthop 1994", url: "https://pubmed.ncbi.nlm.nih.gov/7863498/" },
        ],
        diagram: 'knee-trochlear',
      },
      {
        id: 'tt-tg',
        label: 'TT-TG Distance',
        plane: 'Axial (superimposed)',
        description: 'Tibial tubercle to trochlear groove distance. Measured on axial images by superimposing the level of the trochlear groove and tibial tubercle.',
        normalValues: [
          { label: 'Normal', value: '< 20 mm' },
          { label: 'Borderline', value: '15–20 mm' },
          { label: 'Abnormal', value: '> 20 mm (patellar instability)' },
          { label: 'Surgical threshold', value: '> 20 mm → tibial tubercle osteotomy' },
        ],
        citations: [
          { label: "Goutallier D et al. TT-TG distance measurement. Rev Chir Orthop 2002", url: "https://pubmed.ncbi.nlm.nih.gov/12124570/" },
          { label: "Dejour D et al. TT-TG on CT/MRI. Knee Surg Sports Traumatol 2004", url: "https://pubmed.ncbi.nlm.nih.gov/15024619/" },
        ],
        diagram: 'knee-tt-tg',
      },
      {
        id: 'insall-salvati',
        label: 'Insall-Salvati Index',
        plane: 'Sagittal',
        description: 'Patellar tendon length divided by patellar length. Assesses patellar height (alta vs baja).',
        normalValues: [
          { label: 'Normal', value: '0.8–1.2' },
          { label: 'Patella alta', value: '> 1.2' },
          { label: 'Patella baja', value: '< 0.8' },
        ],
        citations: [
          { label: "Insall J, Salvati E. Patella position in the normal knee. Radiology 1971", url: "https://pubmed.ncbi.nlm.nih.gov/5111961/" },
        ],
        diagram: 'knee-insall-salvati',
      },
    ],
  },

  // ─── SHOULDER (8 slots) ──────────────────────────────────────────────────
  shoulder: {
    label: 'Shoulder',
    measurements: [
      {
        id: 'csa',
        label: 'Critical Shoulder Angle (CSA)',
        plane: 'Coronal oblique',
        description: 'Angle between a line along the glenoid face and a line from inferior glenoid to lateral acromion. Predicts rotator cuff tears vs glenohumeral OA.',
        normalValues: [
          { label: 'Normal', value: '30–35°' },
          { label: 'RCT risk', value: '> 35°' },
          { label: 'GH OA risk', value: '< 30°' },
        ],
        citations: [
          { label: "Moor BK et al. Critical shoulder angle predicts rotator cuff tears. JSES 2013", url: "https://pubmed.ncbi.nlm.nih.gov/23684441/" },
        ],
        diagram: 'shoulder-csa',
      },
      {
        id: 'goutallier',
        label: 'Goutallier Classification',
        plane: 'Coronal oblique / axial',
        description: 'Fatty infiltration of rotator cuff musculature graded 0–4. Higher grade predicts worse surgical outcomes. Assessed on T1 sequences.',
        normalValues: [
          { label: 'Grade 0', value: 'No fat — normal muscle' },
          { label: 'Grade 1', value: 'Some fat streaks' },
          { label: 'Grade 2', value: 'Fat < muscle volume' },
          { label: 'Grade 3', value: 'Fat = muscle volume' },
          { label: 'Grade 4', value: 'Fat > muscle volume' },
          { label: 'Surgical cutoff', value: 'Grade ≥ 3 = poor prognosis' },
        ],
        citations: [
          { label: "Goutallier D et al. Fatty muscle degeneration in cuff ruptures. Clin Orthop 1994", url: "https://pubmed.ncbi.nlm.nih.gov/7955462/" },
        ],
        diagram: 'shoulder-goutallier',
      },
      {
        id: 'patte',
        label: 'Patte Classification (Cuff Retraction)',
        plane: 'Coronal oblique',
        description: 'Classifies degree of supraspinatus tendon retraction after full-thickness tear. Correlates with repairability.',
        normalValues: [
          { label: 'Stage 1', value: 'Stump near footprint' },
          { label: 'Stage 2', value: 'Retracted to humeral head' },
          { label: 'Stage 3', value: 'Retracted to glenoid' },
          { label: 'Repairable', value: 'Stage 1–2 usually' },
          { label: 'Irreparable', value: 'Stage 3 + Goutallier ≥ 3' },
        ],
        citations: [
          { label: "Patte D. Classification of rotator cuff lesions. Clin Orthop 1990", url: "https://pubmed.ncbi.nlm.nih.gov/2199453/" },
        ],
        diagram: 'shoulder-patte',
      },
      {
        id: 'stump-length',
        label: 'Tendon Stump Length',
        plane: 'Coronal oblique',
        description: 'Length of remaining tendon from footprint to tear edge. Longer stump = better tissue quality for repair.',
        normalValues: [
          { label: 'Good quality', value: '> 10 mm stump' },
          { label: 'Marginal', value: '5–10 mm' },
          { label: 'Poor', value: '< 5 mm (poor repair tissue)' },
        ],
        diagram: 'shoulder-stump',
      },
      {
        id: 'walch',
        label: 'Walch Classification (Glenoid Wear)',
        plane: 'Axial',
        description: 'Classifies posterior glenoid wear pattern in glenohumeral OA. Guides implant selection for shoulder arthroplasty.',
        normalValues: [
          { label: 'Type A1', value: 'Centered head, minor wear' },
          { label: 'Type A2', value: 'Centered head, major central erosion' },
          { label: 'Type B1', value: 'Posterior subluxation, no erosion' },
          { label: 'Type B2', value: 'Posterior subluxation + biconcave glenoid' },
          { label: 'Type B3', value: 'Posterior subluxation + monoconcave posterior wear ≥ 15°' },
          { label: 'Type C', value: 'Glenoid retroversion ≥ 25° (dysplastic)' },
          { label: 'Type D', value: 'Anterior subluxation / anteverted glenoid' },
        ],
        citations: [
          { label: "Walch G et al. Morphologic study of the glenoid in primary glenohumeral OA. JSES 1999", url: "https://pubmed.ncbi.nlm.nih.gov/10073312/" },
          { label: "Bercik MJ et al. Modified Walch classification. J Shoulder Elbow Surg 2016", url: "https://pubmed.ncbi.nlm.nih.gov/26687301/" },
        ],
        diagram: 'shoulder-walch',
      },
      {
        id: 'seebauer',
        label: 'Seebauer Classification (Cuff Arthropathy)',
        plane: 'Coronal oblique',
        description: 'Classifies glenohumeral joint in massive rotator cuff tear arthropathy based on humeral head centering and acetabularization of acromion.',
        normalValues: [
          { label: 'Type 1A', value: 'Centered, stable; no superior migration; AHI normal' },
          { label: 'Type 1B', value: 'Centered, medializing; early superior migration' },
          { label: 'Type 2A', value: 'Decentered, limited stability; superior migration' },
          { label: 'Type 2B', value: 'Decentered, unstable; femoralization of humeral head' },
          { label: 'AHI', value: 'Normal 9–10 mm; < 6 mm = large RCT' },
        ],
        citations: [
          { label: "Seebauer L et al. Classification of cuff tear arthropathy. Orthopade 2001", url: "https://pubmed.ncbi.nlm.nih.gov/11820073/" },
        ],
        diagram: 'shoulder-seebauer',
      },
      {
        id: 'glenoid-track',
        label: 'Glenoid Track / On-Track vs Off-Track',
        plane: 'Axial + coronal',
        description: 'Determines if a Hill-Sachs lesion engages the anterior glenoid during shoulder motion. Guides decision for Latarjet vs Bankart repair.',
        normalValues: [
          { label: 'Glenoid track width', value: '(Glenoid width × 0.83) − bone loss' },
          { label: 'On-track', value: 'Hill-Sachs interval > glenoid track' },
          { label: 'Off-track (engaging)', value: 'Hill-Sachs interval < glenoid track' },
          { label: 'Critical bone loss', value: '> 25% glenoid = Latarjet indicated' },
        ],
        citations: [
          { label: "Itoi E et al. Glenoid track concept. JSES 2011", url: "https://pubmed.ncbi.nlm.nih.gov/21478062/" },
          { label: "Di Giacomo G et al. Evolving concept of bipolar bone loss. Arthroscopy 2014", url: "https://pubmed.ncbi.nlm.nih.gov/24581244/" },
        ],
        diagram: 'shoulder-glenoid-track',
      },
      {
        id: 'habermeyer',
        label: 'Habermeyer Classification',
        plane: 'Sagittal oblique',
        description: 'Classifies subscapularis tears by extent of tendon involvement. Guides surgical planning.',
        normalValues: [
          { label: 'Type 1', value: 'Partial tear upper 25%' },
          { label: 'Type 2', value: 'Complete upper 25% tear' },
          { label: 'Type 3', value: 'Complete upper 50% tear' },
          { label: 'Type 4', value: 'Complete tear entire tendon' },
          { label: 'Key landmark', value: 'Comma sign = intact superior 25%' },
        ],
        citations: [
          { label: "Habermeyer P et al. Subscapularis tears classification. JSES 2008", url: "https://pubmed.ncbi.nlm.nih.gov/17997318/" },
        ],
        diagram: 'shoulder-habermeyer',
      },
    ],
  },

  // ─── HIP (6 slots) ───────────────────────────────────────────────────────
  hip: {
    label: 'Hip',
    measurements: [
      {
        id: 'alpha-angle',
        label: 'Alpha Angle (Cam FAI)',
        plane: 'Oblique axial / radial',
        description: 'Angle at which femoral head departs from spherical outline at head-neck junction. Best measured on radial MRI sequences.',
        normalValues: [
          { label: 'Normal', value: '< 55°' },
          { label: 'Cam morphology', value: '≥ 55°' },
          { label: 'Severe cam', value: '> 78°' },
          { label: 'Best plane', value: 'Radial MRI > oblique axial' },
        ],
        citations: [
          { label: "Nötzli HP et al. Alpha angle for cam deformity. JBJS Br 2002", url: "https://pubmed.ncbi.nlm.nih.gov/12463652/" },
        ],
        diagram: 'hip-alpha',
      },
      {
        id: 'lce-angle',
        label: 'Lateral Center-Edge Angle (LCEA)',
        plane: 'Coronal',
        description: 'Angle measuring superolateral acetabular coverage of femoral head. Low = dysplasia; high = overcoverage (pincer FAI).',
        normalValues: [
          { label: 'Normal', value: '25–39°' },
          { label: 'Dysplasia', value: '< 20°' },
          { label: 'Borderline dysplasia', value: '20–25°' },
          { label: 'Pincer FAI', value: '≥ 40°' },
        ],
        citations: [
          { label: "Wiberg G. Studies on dysplastic acetabula. Acta Chir Scand 1939", url: "https://pubmed.ncbi.nlm.nih.gov/" },
          { label: "Tannast M et al. Radiographic analysis of femoroacetabular impingement. JBJS 2007", url: "https://pubmed.ncbi.nlm.nih.gov/17360019/" },
        ],
        diagram: 'hip-lce',
      },
      {
        id: 'femoral-anteversion',
        label: 'Femoral Anteversion',
        plane: 'Axial (2-level method)',
        description: 'Angle between femoral neck axis and posterior condylar axis. Measured by comparing axial images at femoral neck and condylar levels.',
        normalValues: [
          { label: 'Normal adult', value: '10–20°' },
          { label: 'Increased', value: '> 25° (in-toeing, impingement)' },
          { label: 'Decreased / retroversion', value: '< 5°' },
        ],
        citations: [
          { label: "Murphy SB et al. Femoral anteversion measurement. JBJS 1987", url: "https://pubmed.ncbi.nlm.nih.gov/3818685/" },
        ],
        diagram: 'hip-anteversion',
      },
      {
        id: 'ifi-qfs',
        label: 'IFI + QFS (Ischiofemoral Space)',
        plane: 'Axial / coronal',
        description: 'Ischiofemoral interval (IFI): narrowest space between ischium and lesser trochanter. Quadratus femoris space (QFS): space available for quadratus femoris muscle.',
        normalValues: [
          { label: 'IFI normal', value: '> 17 mm' },
          { label: 'IFI narrow', value: '< 15 mm (ischiofemoral impingement)' },
          { label: 'QFS normal', value: '> 10 mm' },
          { label: 'QFS narrow', value: '< 10 mm' },
        ],
        citations: [
          { label: "Torriani M et al. Ischiofemoral impingement syndrome on MRI. AJR 2009", url: "https://pubmed.ncbi.nlm.nih.gov/19789914/" },
        ],
        diagram: 'hip-ifi-qfs',
      },
      {
        id: 'tonnis',
        label: 'Tönnis Grading (Hip OA)',
        plane: 'Coronal',
        description: 'Grades glenohumeral osteoarthritis severity. Guides timing of surgical intervention for FAI and dysplasia.',
        normalValues: [
          { label: 'Grade 0', value: 'No OA — normal joint' },
          { label: 'Grade 1', value: 'Mild: subchondral sclerosis, slight joint space loss' },
          { label: 'Grade 2', value: 'Moderate: cysts, moderate JSL, head flattening' },
          { label: 'Grade 3', value: 'Severe: large cysts, severe JSL, head deformity' },
          { label: 'Surgical limit', value: 'Tönnis ≤ 1 for FAI/PAO surgery' },
        ],
        citations: [
          { label: "Tönnis D. Normal values of the hip joint for evaluation of X-rays. Clin Orthop 1976", url: "https://pubmed.ncbi.nlm.nih.gov/1277129/" },
        ],
        diagram: 'hip-tonnis',
      },
      {
        id: 'cup-overhang',
        label: 'Acetabular Cup Overhang',
        plane: 'Coronal / axial',
        description: 'Extent to which the acetabular rim/cup extends beyond the femoral head, contributing to pincer-type impingement or post-arthroplasty impingement.',
        normalValues: [
          { label: 'Normal rim', value: 'Lateral edge at or medial to sourcil' },
          { label: 'Overhang', value: 'Rim > 2 mm lateral to sourcil' },
          { label: 'Post-arthroplasty', value: 'Cup overhang > 5 mm = impingement risk' },
        ],
        diagram: 'hip-cup-overhang',
      },
    ],
  },

  // ─── WRIST (6 slots) ─────────────────────────────────────────────────────
  wrist: {
    label: 'Wrist',
    measurements: [
      {
        id: 'sl-gap',
        label: 'Scapholunate Gap',
        plane: 'Coronal',
        description: 'Gap between scaphoid and lunate on coronal sequences. Widening indicates scapholunate ligament disruption.',
        normalValues: [
          { label: 'Normal', value: '< 3 mm' },
          { label: 'SLL disruption', value: '> 3 mm' },
          { label: 'Complete SLL tear', value: '> 5 mm (Terry Thomas sign)' },
        ],
        diagram: 'wrist-sl-gap',
      },
      {
        id: 'radial-inclination',
        label: 'Radial Inclination Angle',
        plane: 'Coronal',
        description: 'Angle between a line perpendicular to the radial shaft and a line along the radial articular surface. Flattening indicates malunion.',
        normalValues: [
          { label: 'Normal', value: '21–25°' },
          { label: 'Malunion concern', value: '< 15°' },
          { label: 'Post-fracture loss', value: 'Loss > 5° from normal = significant' },
        ],
        diagram: 'wrist-radial-inclination',
      },
      {
        id: 'ulnar-variance',
        label: 'Ulnar Variance',
        plane: 'Coronal T1/PD',
        description: 'Longitudinal difference between distal ulnar and radial articular surfaces. Positive variance increases TFCC perforation and ulnar impaction risk.',
        normalValues: [
          { label: 'Neutral', value: '−1 to +1 mm' },
          { label: 'Positive (> 2 mm)', value: 'TFCC perforation risk, ulnar impaction' },
          { label: 'Negative', value: 'Kienbock disease risk' },
        ],
        diagram: 'wrist-ulnar-variance',
      },
      {
        id: 'sl-angle',
        label: 'Scapholunate Angle',
        plane: 'Sagittal',
        description: 'Angle between long axes of scaphoid and lunate on sagittal images. DISI pattern: lunate extended. VISI pattern: lunate flexed.',
        normalValues: [
          { label: 'Normal', value: '30–60°' },
          { label: 'DISI pattern', value: '> 70° (dorsal intercalated)' },
          { label: 'VISI pattern', value: '< 30° (volar intercalated)' },
        ],
        citations: [
          { label: "Larsen CF et al. Scapholunate angle in carpal instability. J Hand Surg 1995", url: "https://pubmed.ncbi.nlm.nih.gov/7775782/" },
        ],
        diagram: 'wrist-sl-angle',
      },
      {
        id: 'capitolunate-angle',
        label: 'Capitolunate Angle',
        plane: 'Sagittal',
        description: 'Angle between long axis of capitate and long axis of lunate. Assesses midcarpal alignment.',
        normalValues: [
          { label: 'Normal', value: '0–15°' },
          { label: 'Abnormal', value: '> 20°' },
          { label: 'Used with', value: 'SL angle to classify instability pattern' },
        ],
        diagram: 'wrist-capitolunate',
      },
      {
        id: 'ecu',
        label: 'ECU Dynamic Instability',
        plane: 'Axial (dynamic / pronation-supination)',
        description: 'Extensor carpi ulnaris tendon subluxation from its groove with forearm rotation. Best evaluated dynamically or in supination/pronation series.',
        normalValues: [
          { label: 'Normal', value: 'ECU seated in ulnar groove in all positions' },
          { label: 'Subluxation', value: 'ECU displaces radially with supination' },
          { label: 'Dislocation', value: 'Complete displacement out of groove' },
          { label: 'Sheath integrity', value: 'Assess subsheath / retinaculum continuity' },
        ],
        diagram: 'wrist-ecu',
      },
    ],
  },

  // ─── ELBOW (5 slots) ─────────────────────────────────────────────────────
  elbow: {
    label: 'Elbow',
    measurements: [
      {
        id: 'medial-joint-space',
        label: 'Medial Joint Space Width',
        plane: 'Coronal',
        description: 'Width of medial ulnohumeral joint space. Asymmetric widening on valgus stress indicates UCL insufficiency.',
        normalValues: [
          { label: 'Normal', value: '< 3 mm' },
          { label: 'UCL laxity', value: '> 3 mm on valgus stress' },
          { label: 'Asymmetry', value: '> 1 mm vs contralateral = significant' },
        ],
        diagram: 'elbow-medial-joint',
      },
      {
        id: 'ucl-thickness',
        label: 'UCL Thickness (Medial)',
        plane: 'Coronal',
        description: 'Anterior bundle of ulnar collateral ligament thickness at midsubstance.',
        normalValues: [
          { label: 'Normal', value: '3–4 mm' },
          { label: 'Partial tear', value: 'Thinning with T2 signal (T-sign)' },
          { label: 'Full tear', value: 'Discontinuity / fluid-filled gap' },
        ],
        diagram: 'elbow-ucl',
      },
      {
        id: 'radiocapitellar',
        label: 'Radiocapitellar Alignment',
        plane: 'Sagittal / lateral',
        description: 'Line through center of radial neck should bisect capitellum in all projections. Malalignment indicates radial head dislocation.',
        normalValues: [
          { label: 'Normal', value: 'Line bisects capitellum' },
          { label: 'Dislocation', value: 'Line misses capitellum' },
          { label: 'All planes', value: 'Must align on AP, lateral, and oblique' },
        ],
        diagram: 'elbow-radiocapitellar',
      },
      {
        id: 'olecranon-fossa',
        label: 'Olecranon Fossa Depth',
        plane: 'Sagittal',
        description: 'Depth of olecranon fossa. Shallow fossa may contribute to posterior impingement; abnormal fluid or loose bodies may fill the fossa.',
        normalValues: [
          { label: 'Normal depth', value: '4–8 mm' },
          { label: 'Impingement', value: 'Osteophyte filling / fossa obliteration' },
          { label: 'Loose bodies', value: 'Filling defects in posterior fat pad' },
        ],
        diagram: 'elbow-olecranon',
      },
      {
        id: 'carrying-angle',
        label: 'Carrying Angle',
        plane: 'Coronal / AP (full extension)',
        description: 'Valgus angle between humerus and ulna long axes in full extension.',
        normalValues: [
          { label: 'Male', value: '5–10°' },
          { label: 'Female', value: '10–15°' },
          { label: 'Cubitus valgus', value: '> 15°' },
          { label: 'Cubitus varus', value: '< 5°' },
        ],
        diagram: 'elbow-carrying',
      },
    ],
  },

  // ─── ANKLE (5 slots) ─────────────────────────────────────────────────────
  ankle: {
    label: 'Ankle',
    measurements: [
      {
        id: 'atfl-thickness',
        label: 'ATFL Thickness',
        plane: 'Axial PD FS',
        description: 'Thickness of anterior talofibular ligament. Thickening with signal change indicates chronic sprain; discontinuity = tear.',
        normalValues: [
          { label: 'Normal', value: '2–3 mm' },
          { label: 'Chronic sprain', value: '> 3 mm with signal' },
          { label: 'Tear', value: 'Discontinuity / non-visualization' },
        ],
        diagram: 'ankle-atfl',
      },
      {
        id: 'tibiotalar-joint',
        label: 'Tibiotalar Joint Space',
        plane: 'Coronal',
        description: 'Superior tibiotalar joint space width. Uniform narrowing indicates OA; focal loss may indicate osteochondral lesion.',
        normalValues: [
          { label: 'Normal', value: '3–4 mm uniform' },
          { label: 'OA', value: 'Focal or diffuse loss < 2 mm' },
          { label: 'Uniform talar tilt', value: '< 5° asymmetry' },
        ],
        diagram: 'ankle-tibiotalar',
      },
      {
        id: 'achilles-diameter',
        label: 'Achilles Tendon AP Diameter',
        plane: 'Sagittal',
        description: 'AP diameter at narrowest point, 2–6 cm above calcaneal insertion (zone of relative avascularity).',
        normalValues: [
          { label: 'Normal', value: '< 6 mm AP diameter' },
          { label: 'Tendinosis', value: '6–8 mm with signal change' },
          { label: 'High tear risk', value: '> 8 mm focal thickening' },
        ],
        citations: [
          { label: "Bleakney RR et al. Ultrasound and MRI of the Achilles tendon. AJR 2002", url: "https://pubmed.ncbi.nlm.nih.gov/11850436/" },
        ],
        diagram: 'ankle-achilles',
      },
      {
        id: 'kager-fat-pad',
        label: "Kager's Fat Pad",
        plane: 'Sagittal',
        description: "Triangular fat pad anterior to Achilles tendon. Obliteration or signal change indicates retrocalcaneal bursitis, Haglund deformity, or Achilles pathology.",
        normalValues: [
          { label: 'Normal', value: 'Triangular, homogeneous fat signal' },
          { label: 'Bursitis', value: 'Fluid anterior to Achilles insertion' },
          { label: 'Haglund', value: 'Superior calcaneal prominence + obliteration' },
        ],
        diagram: 'ankle-kager',
      },
      {
        id: 'syndesmosis',
        label: 'Syndesmotic Width',
        plane: 'Axial 1 cm above plafond',
        description: 'Tibiofibular clear space measured 1 cm above tibial plafond on axial images. Widening indicates syndesmotic injury.',
        normalValues: [
          { label: 'Clear space', value: '< 6 mm (axial MRI)' },
          { label: 'Diastasis', value: '> 6 mm or asymmetry > 2 mm' },
          { label: 'AITFL', value: 'Assess anterior and posterior bands' },
        ],
        diagram: 'ankle-syndesmosis',
      },
      {
        id: 'sanders',
        label: 'Sanders Classification (Calcaneal Fractures)',
        plane: 'Coronal CT (primary) / MRI',
        description: 'CT-based classification of intra-articular calcaneal fractures based on fracture lines in the posterior facet. Guides surgical vs conservative management.',
        normalValues: [
          { label: 'Type I', value: 'Non-displaced — conservative treatment' },
          { label: 'Type IIA/B/C', value: 'Two-part — ORIF indicated' },
          { label: 'Type IIIAB/AC/BC', value: 'Three-part — ORIF; worse prognosis' },
          { label: 'Type IV', value: 'Four-part comminuted — primary subtalar fusion' },
        ],
        citations: [
          { label: "Sanders R et al. Operative treatment of displaced intraarticular calcaneal fractures. JBJS 1992", url: "https://pubmed.ncbi.nlm.nih.gov/1619703/" },
        ],
        diagram: 'ankle-sanders',
      },
    ],
  },

  // ─── SPINE (6 slots) ─────────────────────────────────────────────────────
  spine: {
    label: 'Spine',
    measurements: [
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
          { label: "Modic MT et al. Degenerative disc disease: assessment by MR. Radiology 1988", url: "https://pubmed.ncbi.nlm.nih.gov/3336678/" },
        ],
        diagram: 'spine-modic',
      },
      {
        id: 'disc-nomenclature',
        label: 'Disc Nomenclature',
        plane: 'Sagittal + axial T2',
        description: 'Standardized disc pathology terminology per NASS/ASSR/ASNR guidelines. Based on percent of disc extending beyond endplates.',
        normalValues: [
          { label: 'Bulge', value: 'Broad-based: > 50% circumference, < 3 mm' },
          { label: 'Protrusion', value: 'Focal: < 25% circumference, base > AP extent' },
          { label: 'Extrusion', value: 'AP extent > base width (herniated nucleus)' },
          { label: 'Sequestration', value: 'Free fragment separated from parent disc' },
          { label: 'Migration', value: 'Displaced above/below parent disc level' },
        ],
        citations: [
          { label: "Fardon DF et al. Lumbar disc nomenclature: NASS/ASSR/ASNR. Spine J 2014", url: "https://pubmed.ncbi.nlm.nih.gov/25007080/" },
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
          { label: "Vaccaro AR et al. AO Spine subaxial cervical classification. Global Spine J 2016", url: "https://pubmed.ncbi.nlm.nih.gov/27433434/" },
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
          { label: "Vaccaro AR et al. AO Spine thoracolumbar fracture classification. Spine 2013", url: "https://pubmed.ncbi.nlm.nih.gov/24108666/" },
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
          { label: 'Normal', value: '< 10°' },
          { label: 'Mild scoliosis', value: '10–25°' },
          { label: 'Moderate', value: '25–45°' },
          { label: 'Surgical threshold', value: '> 40–50°' },
          { label: 'Progression risk', value: 'High if > 30° before skeletal maturity' },
        ],
        diagram: 'spine-cobb',
      },
    ],
  },

  // ─── PELVIS (5 slots) ────────────────────────────────────────────────────
  pelvis: {
    label: 'Pelvis / SI Joints',
    measurements: [
      {
        id: 'si-joint-width',
        label: 'SI Joint Width',
        plane: 'Coronal / axial',
        description: 'Width of sacroiliac joint space. Narrowing indicates sacroiliitis or fusion; widening indicates trauma or pregnancy-related diastasis.',
        normalValues: [
          { label: 'Normal adult', value: '2–5 mm' },
          { label: 'Fusion', value: '< 1 mm or complete bridging' },
          { label: 'Widening', value: '> 5 mm (trauma, pregnancy)' },
        ],
        diagram: 'pelvis-si-joint',
      },
      {
        id: 'symphysis-width',
        label: 'Pubic Symphysis Width',
        plane: 'Coronal',
        description: 'Width of pubic symphysis fibrocartilaginous disc. Widening indicates diastasis or instability.',
        normalValues: [
          { label: 'Normal', value: '< 6 mm' },
          { label: 'Diastasis', value: '> 10 mm' },
          { label: 'Postpartum accepted', value: 'Up to 9 mm' },
        ],
        diagram: 'pelvis-symphysis',
      },
      {
        id: 'iliolumbar-ligament',
        label: 'Iliolumbar Ligament Thickness',
        plane: 'Coronal / axial',
        description: 'Thickness of iliolumbar ligament connecting L4–L5 transverse processes to iliac crest. Injury seen in pelvic ring fractures.',
        normalValues: [
          { label: 'Normal', value: '3–5 mm thickness' },
          { label: 'Sprain', value: 'Edema / thickening with signal' },
          { label: 'Disruption', value: 'Non-visualization or avulsion' },
        ],
        diagram: 'pelvis-iliolumbar',
      },
      {
        id: 'acetabular-depth',
        label: 'Acetabular Depth',
        plane: 'Coronal',
        description: 'Relationship of femoral head / medial wall to ilioischial line. Assesses protrusio acetabuli and coxa profunda.',
        normalValues: [
          { label: 'Normal', value: 'Medial wall lateral to ilioischial line' },
          { label: 'Coxa profunda', value: 'Wall touches ilioischial line' },
          { label: 'Protrusio', value: '> 3 mm medial to ilioischial line' },
        ],
        diagram: 'pelvis-acetabular-depth',
      },
      {
        id: 'neck-shaft-angle',
        label: 'Femoral Neck-Shaft Angle',
        plane: 'Coronal',
        description: 'Angle between femoral neck axis and femoral shaft axis. Coxa vara or valga affects hip biomechanics and implant planning.',
        normalValues: [
          { label: 'Normal adult', value: '120–135°' },
          { label: 'Coxa vara', value: '< 120°' },
          { label: 'Coxa valga', value: '> 140°' },
        ],
        diagram: 'pelvis-neck-shaft',
      },
      {
        id: 'young-burgess',
        label: 'Young-Burgess Classification (Pelvic Ring Fractures)',
        plane: 'CT axial + coronal',
        description: 'Classifies pelvic ring fractures by mechanism of injury. Predicts hemodynamic instability and ligamentous injury pattern.',
        normalValues: [
          { label: 'LC I', value: 'Lateral compression: sacral buckle fx, ipsilateral pubic rami' },
          { label: 'LC II', value: 'Lateral compression: iliac wing fx (crescent fx)' },
          { label: 'LC III', value: 'Lateral compression: contralateral APC (windswept)' },
          { label: 'APC I', value: 'Ant-post compression: symphysis < 2.5 cm, SI joint intact' },
          { label: 'APC II', value: 'Ant-post compression: symphysis > 2.5 cm, ant SI disrupted' },
          { label: 'APC III', value: 'Complete SI disruption, posterior ligaments torn (open book)' },
          { label: 'VS', value: 'Vertical shear: complete hemipelvic displacement (Malgaigne)' },
          { label: 'CM', value: 'Combined mechanism' },
        ],
        citations: [
          { label: "Young JW, Burgess AR. Radiologic Management of Pelvic Ring Fractures. 1987", url: "https://pubmed.ncbi.nlm.nih.gov/3544852/" },
          { label: "Tile M. Pelvic ring fractures — should they be fixed? JBJS Br 1988", url: "https://pubmed.ncbi.nlm.nih.gov/3339015/" },
        ],
        diagram: 'pelvis-young-burgess',
      },
      {
        id: 'denis',
        label: 'Denis Classification (Sacral Fractures)',
        plane: 'Coronal CT / MRI',
        description: 'Classifies sacral fractures by zone of involvement relative to the sacral foramina. Higher zone = higher neurologic risk.',
        normalValues: [
          { label: 'Zone I (Ala)', value: 'Lateral to foramina — 5.9% neurologic injury' },
          { label: 'Zone II (Foraminal)', value: 'Through foramina — 28.4% neurologic injury' },
          { label: 'Zone III (Central)', value: 'Medial to foramina / central canal — 56.7% neurologic injury' },
          { label: 'Zone III risks', value: 'Cauda equina, bowel/bladder dysfunction' },
          { label: 'H-type / U-type', value: 'Bilateral Zone II + transverse = spinopelvic dissociation' },
        ],
        citations: [
          { label: "Denis F et al. Sacral fractures: an important problem. Clin Orthop 1988", url: "https://pubmed.ncbi.nlm.nih.gov/3349114/" },
        ],
        diagram: 'pelvis-denis',
      },
    ],
  },

  // ─── FOOT (5 slots) ──────────────────────────────────────────────────────
  foot: {
    label: 'Foot',
    measurements: [
      {
        id: 'plantar-fascia',
        label: 'Plantar Fascia Thickness',
        plane: 'Sagittal',
        description: 'Thickness at calcaneal origin. Thickening with edema is the hallmark of plantar fasciitis.',
        normalValues: [
          { label: 'Normal', value: '2–4 mm' },
          { label: 'Fasciitis', value: '≥ 4 mm with edema/signal' },
          { label: 'Tear', value: 'Discontinuity at origin' },
        ],
        diagram: 'foot-plantar-fascia',
      },
      {
        id: 'lisfranc',
        label: 'Lisfranc Diastasis',
        plane: 'Coronal / axial',
        description: 'Gap between medial cuneiform and 2nd metatarsal base. Best evaluated on coronal MRI. Lisfranc ligament runs obliquely between these two bones.',
        normalValues: [
          { label: 'Normal', value: '< 2 mm' },
          { label: 'Sprain', value: '2–5 mm' },
          { label: 'Dislocation', value: '> 5 mm' },
        ],
        diagram: 'foot-lisfranc',
      },
      {
        id: 'peroneal-subluxation',
        label: 'Peroneal Tendon Subluxation',
        plane: 'Axial',
        description: 'Position of peroneal tendons relative to fibular groove. Superior peroneal retinaculum integrity determines stability.',
        normalValues: [
          { label: 'Normal', value: 'Both tendons in retromalleolar groove' },
          { label: 'Subluxation', value: 'Tendon at rim or partially displaced' },
          { label: 'Dislocation', value: 'Tendon anterior to fibula' },
          { label: 'SPR', value: 'Assess superior peroneal retinaculum' },
        ],
        diagram: 'foot-peroneal',
      },
      {
        id: 'spring-ligament',
        label: 'Spring Ligament Thickness',
        plane: 'Coronal / axial',
        description: 'Superomedial calcaneonavicular ligament thickness. Key stabilizer of longitudinal arch; tears cause progressive flatfoot deformity.',
        normalValues: [
          { label: 'Normal', value: '3–5 mm' },
          { label: 'Sprain', value: 'Thickening with signal change' },
          { label: 'Tear', value: 'Thinning < 2 mm or discontinuity' },
        ],
        diagram: 'foot-spring',
      },
      {
        id: 'talar-coverage',
        label: 'Talar Head Coverage Ratio',
        plane: 'Coronal',
        description: 'Ratio of talar head covered by the navicular on coronal MRI. Reduced coverage indicates spring ligament failure and flatfoot.',
        normalValues: [
          { label: 'Normal', value: '> 75% talar head covered' },
          { label: 'Flatfoot concern', value: '< 65% coverage' },
          { label: 'Severe', value: '< 50% (spring lig tear likely)' },
        ],
        diagram: 'foot-talar-coverage',
      },
    ],
  },

};

// ─── SVG DIAGRAMS ─────────────────────────────────────────────────────────────
const DIAGRAM_SVGS = {

  // ══════════════════════════════════════════════════════════════════════════
  // KNEE
  // ══════════════════════════════════════════════════════════════════════════

  'knee-blumensaat': (
    <svg viewBox="0 0 320 230" style={{width:'100%'}} aria-label="ACL angle Blumensaat line">
      {/* Femoral condyle */}
      <ellipse cx="160" cy="85" rx="70" ry="50" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="88" textAnchor="middle" fontSize="10" fill="#2a5a7a">Femoral condyle</text>
      {/* Tibial plateau */}
      <rect x="80" y="138" width="160" height="22" rx="4" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="153" textAnchor="middle" fontSize="10" fill="#2a5a7a">Tibia</text>
      {/* Blumensaat line — notch roof */}
      <line x1="115" y1="134" x2="205" y2="110" stroke="#e07030" strokeWidth="2.5" strokeDasharray="6 2"/>
      <text x="210" y="108" fontSize="9" fill="#e07030">Blumensaat</text>
      {/* ACL */}
      <line x1="135" y1="136" x2="185" y2="98" stroke="#2d7a5a" strokeWidth="3" strokeLinecap="round"/>
      <text x="188" y="128" fontSize="9" fill="#2d7a5a">ACL</text>
      {/* Parallel indicator */}
      <path d="M148 128 A12 12 0 0 1 156 122" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="130" y="115" fontSize="9" fill="#c0392b" fontWeight="bold">∠&lt;15° = normal</text>
      <text x="160" y="225" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view</text>
    </svg>
  ),

  'knee-tibial-slope': (
    <svg viewBox="0 0 320 220" aria-label="Posterior tibial slope">
      <line x1="160" y1="20" x2="160" y2="200" stroke="#bbb" strokeWidth="1" strokeDasharray="4 3"/>
      <line x1="85" y1="108" x2="245" y2="128" stroke="#4a7fa5" strokeWidth="2.5"/>
      <text x="250" y="132" fontSize="9" fill="#4a7fa5">Plateau</text>
      <line x1="85" y1="108" x2="245" y2="108" stroke="#aaa" strokeWidth="1" strokeDasharray="3 2"/>
      <path d="M 148 108 A 15 15 0 0 0 146 122" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="108" y="125" fontSize="11" fill="#c0392b" fontWeight="bold">β = 5–7°</text>
      <rect x="120" y="128" width="80" height="60" rx="4" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="162" textAnchor="middle" fontSize="9" fill="#2a5a7a">Tibia</text>
      <text x="160" y="212" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view</text>
    </svg>
  ),

  'knee-trochlear': (
    <svg viewBox="0 0 320 230" aria-label="Trochlear depth sulcus angle">
      {/* Axial trochlea cross section */}
      <path d="M60 80 Q120 70 160 110 Q200 70 260 80 L260 120 Q200 105 160 140 Q120 105 60 120 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
      <text x="100" y="100" fontSize="9" fill="#2a5a7a">Med facet</text>
      <text x="205" y="100" fontSize="9" fill="#2a5a7a">Lat facet</text>
      {/* Sulcus lowest point */}
      <circle cx="160" cy="138" r="4" fill="#c0392b"/>
      <text x="168" y="142" fontSize="8" fill="#c0392b">Sulcus</text>
      {/* Sulcus angle lines */}
      <line x1="160" y1="138" x2="80" y2="88" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      <line x1="160" y1="138" x2="240" y2="88" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      <path d="M 138 118 A 25 25 0 0 1 182 118" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="160" y="116" textAnchor="middle" fontSize="10" fill="#c0392b" fontWeight="bold">138–142°</text>
      {/* Depth measurement */}
      <line x1="160" y1="85" x2="160" y2="138" stroke="#e07030" strokeWidth="1.5"/>
      <text x="168" y="108" fontSize="9" fill="#e07030">Depth &gt;3mm</text>
      <text x="160" y="225" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial view — trochlear level</text>
    </svg>
  ),

  'knee-tt-tg': (
    <svg viewBox="0 0 320 230" aria-label="TT-TG distance measurement">
      {/* Trochlear groove level */}
      <rect x="50" y="40" width="220" height="55" rx="6" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5"/>
      <text x="160" y="71" textAnchor="middle" fontSize="9" fill="#2a5a7a">Trochlear groove level (axial)</text>
      <circle cx="142" cy="62" r="5" fill="#4a7fa5"/>
      <text x="152" y="65" fontSize="9" fill="#4a7fa5">TG</text>
      {/* Tibial tubercle level */}
      <rect x="50" y="130" width="220" height="55" rx="6" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5"/>
      <text x="160" y="161" textAnchor="middle" fontSize="9" fill="#2a5a7a">Tibial tubercle level (axial)</text>
      <circle cx="178" cy="152" r="5" fill="#16a34a"/>
      <text x="188" y="155" fontSize="9" fill="#16a34a">TT</text>
      {/* TT-TG measurement */}
      <line x1="142" y1="67" x2="142" y2="147" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      <line x1="178" y1="67" x2="178" y2="147" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      <line x1="142" y1="107" x2="178" y2="107" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="142" y1="100" x2="142" y2="114" stroke="#c0392b" strokeWidth="2"/>
      <line x1="178" y1="100" x2="178" y2="114" stroke="#c0392b" strokeWidth="2"/>
      <text x="160" y="100" textAnchor="middle" fontSize="11" fill="#c0392b" fontWeight="bold">TT-TG</text>
      <text x="160" y="126" textAnchor="middle" fontSize="10" fill="#c0392b">&lt; 20 mm normal</text>
      <text x="160" y="224" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Superimposed axial levels</text>
    </svg>
  ),

  'knee-insall-salvati': (
    <svg viewBox="0 0 320 240" aria-label="Insall-Salvati index measurement">
      {/* Femur */}
      <rect x="130" y="20" width="60" height="60" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="54" textAnchor="middle" fontSize="9" fill="#2a5a7a">Femur</text>
      {/* Patella */}
      <ellipse cx="160" cy="115" rx="30" ry="22" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="2"/>
      <text x="160" y="118" textAnchor="middle" fontSize="9" fill="#2a5a7a">Patella</text>
      {/* Patellar length bracket */}
      <line x1="196" y1="93" x2="196" y2="137" stroke="#e07030" strokeWidth="2"/>
      <line x1="188" y1="93" x2="204" y2="93" stroke="#e07030" strokeWidth="1.5"/>
      <line x1="188" y1="137" x2="204" y2="137" stroke="#e07030" strokeWidth="1.5"/>
      <text x="208" y="118" fontSize="9" fill="#e07030">LP</text>
      {/* Patellar tendon */}
      <path d="M155 137 L158 192" stroke="#8bb8a8" strokeWidth="8" strokeLinecap="round" opacity="0.85"/>
      {/* Tendon length bracket */}
      <line x1="116" y1="137" x2="116" y2="192" stroke="#c0392b" strokeWidth="2"/>
      <line x1="108" y1="137" x2="124" y2="137" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="108" y1="192" x2="124" y2="192" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="90" y="168" fontSize="9" fill="#c0392b">LT</text>
      {/* Tibial tuberosity */}
      <rect x="130" y="192" width="60" height="30" rx="4" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="212" textAnchor="middle" fontSize="9" fill="#2a5a7a">Tibia</text>
      <text x="160" y="235" textAnchor="middle" fontSize="10" fill="#c0392b" fontStyle="italic">IS = LT/LP — normal 0.8–1.2</text>
    </svg>
  ),

  // ══════════════════════════════════════════════════════════════════════════
  // SHOULDER
  // ══════════════════════════════════════════════════════════════════════════

  'shoulder-csa': (
    <svg viewBox="0 0 320 230" aria-label="Critical shoulder angle CSA">
      {/* Glenoid */}
      <line x1="110" y1="60" x2="110" y2="175" stroke="#4a7fa5" strokeWidth="3" strokeLinecap="round"/>
      <text x="80" y="120" fontSize="9" fill="#2a5a7a">Glenoid</text>
      {/* Inferior glenoid point */}
      <circle cx="110" cy="173" r="4" fill="#4a7fa5"/>
      {/* Acromion */}
      <path d="M110 60 L230 55 L235 80 L115 82 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="175" y="73" fontSize="9" fill="#2a5a7a">Acromion</text>
      {/* Lateral acromion point */}
      <circle cx="235" cy="68" r="4" fill="#4a7fa5"/>
      {/* Glenoid face line extended */}
      <line x1="110" y1="60" x2="110" y2="200" stroke="#aaa" strokeWidth="1" strokeDasharray="4 2"/>
      {/* CSA line */}
      <line x1="110" y1="173" x2="235" y2="68" stroke="#c0392b" strokeWidth="2"/>
      {/* Glenoid inclination line */}
      <line x1="110" y1="60" x2="110" y2="173" stroke="#e07030" strokeWidth="2"/>
      {/* Angle arc */}
      <path d="M 110 150 A 23 23 0 0 1 128 138" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="135" y="155" fontSize="11" fill="#c0392b" fontWeight="bold">CSA 30–35°</text>
      <text x="135" y="168" fontSize="9" fill="#c0392b">&gt;35° = RCT risk</text>
      {/* Humeral head suggestion */}
      <ellipse cx="195" cy="155" rx="55" ry="50" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5" opacity="0.6"/>
      <text x="195" y="158" textAnchor="middle" fontSize="9" fill="#2a5a7a">Humeral head</text>
      <text x="160" y="225" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal oblique</text>
    </svg>
  ),

  'shoulder-goutallier': (
    <svg viewBox="0 0 320 240" aria-label="Goutallier classification fatty infiltration">
      {/* 5 muscle cross-sections in a row */}
      {[0,1,2,3,4].map(g => {
        const x = 30 + g * 56;
        const y = 60;
        // fat percentage per grade: 0%, 10%, 40%, 50%, 70%
        const fatPcts = [0, 0.1, 0.4, 0.5, 0.7];
        const fp = fatPcts[g];
        return (
          <g key={g}>
            {/* muscle circle */}
            <circle cx={x+22} cy={y+25} r={22} fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
            {/* fat overlay as arc/fill */}
            {fp > 0 && (
              <circle cx={x+22} cy={y+25} r={22*Math.sqrt(fp)} fill="#fde68a" stroke="#d97706" strokeWidth="1" opacity="0.8"/>
            )}
            {/* grade label */}
            <text x={x+22} y={y+65} textAnchor="middle" fontSize="11" fill="#c0392b" fontWeight="bold">G{g}</text>
            <text x={x+22} y={y+78} textAnchor="middle" fontSize="8" fill="#555">{Math.round(fp*100)}% fat</text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x="25" y="155" width="14" height="10" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1"/>
      <text x="43" y="164" fontSize="9" fill="#555">Muscle</text>
      <rect x="95" y="155" width="14" height="10" fill="#fde68a" stroke="#d97706" strokeWidth="1"/>
      <text x="113" y="164" fontSize="9" fill="#555">Fat</text>
      <text x="160" y="190" textAnchor="middle" fontSize="10" fill="#c0392b" fontWeight="bold">Grade ≥ 3 = poor surgical prognosis</text>
      <text x="160" y="230" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial T1 — supraspinatus fossa</text>
    </svg>
  ),

  'shoulder-patte': (
    <svg viewBox="0 0 320 230" aria-label="Patte classification cuff retraction">
      {/* Acromion */}
      <rect x="55" y="30" width="160" height="20" rx="4" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="135" y="44" textAnchor="middle" fontSize="9" fill="#2a5a7a">Acromion</text>
      {/* Humeral head */}
      <ellipse cx="215" cy="130" rx="65" ry="60" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="215" y="133" textAnchor="middle" fontSize="9" fill="#2a5a7a">Humeral head</text>
      {/* Glenoid */}
      <rect x="55" y="80" width="18" height="100" rx="4" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="64" y="210" textAnchor="middle" fontSize="8" fill="#2a5a7a">Glen.</text>
      {/* Stage markers */}
      {/* Stage 1: near footprint */}
      <circle cx="152" cy="76" r="7" fill="#2d7a5a"/>
      <text x="152" y="79" textAnchor="middle" fontSize="7" fill="white">1</text>
      <text x="152" y="65" textAnchor="middle" fontSize="8" fill="#2d7a5a">Near FP</text>
      {/* Stage 2: humeral head level */}
      <circle cx="175" cy="95" r="7" fill="#e07030"/>
      <text x="175" y="98" textAnchor="middle" fontSize="7" fill="white">2</text>
      <text x="195" y="90" fontSize="8" fill="#e07030">Hum. head</text>
      {/* Stage 3: glenoid level */}
      <circle cx="90" cy="110" r="7" fill="#c0392b"/>
      <text x="90" y="113" textAnchor="middle" fontSize="7" fill="white">3</text>
      <text x="102" y="108" fontSize="8" fill="#c0392b">Glenoid</text>
      {/* Arrow showing direction of retraction */}
      <line x1="148" y1="76" x2="94" y2="107" stroke="#888" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arr-patte)"/>
      <defs><marker id="arr-patte" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#888" strokeWidth="1.5"/></marker></defs>
      <text x="160" y="225" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal oblique — retraction stages</text>
    </svg>
  ),

  'shoulder-stump': (
    <svg viewBox="0 0 320 220" aria-label="Tendon stump length measurement">
      {/* Humeral head */}
      <ellipse cx="195" cy="140" rx="80" ry="65" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="195" y="143" textAnchor="middle" fontSize="9" fill="#2a5a7a">Humeral head</text>
      {/* Footprint */}
      <rect x="140" y="78" width="30" height="14" rx="3" fill="#f0a070" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="155" y="88" textAnchor="middle" fontSize="7" fill="#c0392b">FP</text>
      {/* Tendon stump */}
      <rect x="80" y="78" width="60" height="14" rx="3" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="110" y="88" textAnchor="middle" fontSize="8" fill="#1a4a3a">Stump</text>
      {/* Tear gap */}
      <rect x="140" y="78" width="2" height="14" fill="#fff" stroke="#c0392b" strokeWidth="1"/>
      {/* Stump length bracket */}
      <line x1="80" y1="102" x2="140" y2="102" stroke="#c0392b" strokeWidth="2"/>
      <line x1="80" y1="95" x2="80" y2="109" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="140" y1="95" x2="140" y2="109" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="110" y="120" textAnchor="middle" fontSize="10" fill="#c0392b" fontWeight="bold">Stump length</text>
      <text x="110" y="132" textAnchor="middle" fontSize="9" fill="#c0392b">&gt;10 mm = good tissue</text>
      <text x="160" y="215" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal oblique</text>
    </svg>
  ),

  'shoulder-walch': (
    <svg viewBox="0 0 320 240" aria-label="Walch classification glenoid wear">
      {/* Draw 4 glenoid cross sections for A1, A2, B1, B2 */}
      {[
        {label:'A1', x:45, cx:70, wear:'none', sub:0},
        {label:'A2', x:125, cx:150, wear:'central', sub:0},
        {label:'B1', x:195, cx:220, wear:'none', sub:12},
        {label:'B2', x:255, cx:275, wear:'posterior', sub:15},
      ].map(({label,x,cx,wear,sub},i) => (
        <g key={i}>
          {/* Glenoid face */}
          <ellipse cx={cx} cy={100} rx={18} ry={32} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
          {/* Central erosion for A2 */}
          {wear==='central' && <ellipse cx={cx} cy={108} rx={10} ry={14} fill="#f8d7b0" stroke="#c0392b" strokeWidth="1"/>}
          {/* Posterior erosion for B2 */}
          {wear==='posterior' && <ellipse cx={cx+10} cy={110} rx={12} ry={14} fill="#f8d7b0" stroke="#c0392b" strokeWidth="1"/>}
          {/* Humeral head subluxation */}
          <circle cx={cx+sub} cy={100} r={16} fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5" opacity="0.7"/>
          <text x={cx} y={150} textAnchor="middle" fontSize="11" fill="#c0392b" fontWeight="bold">{label}</text>
        </g>
      ))}
      <text x="160" y="175" textAnchor="middle" fontSize="9" fill="#888">A=centered  B=post sublux  C=dysplastic  D=ant sublux</text>
      <rect x="25" y="185" width="12" height="10" fill="#f8d7b0" stroke="#c0392b" strokeWidth="1"/>
      <text x="42" y="194" fontSize="9" fill="#555">Glenoid wear</text>
      <rect x="115" y="185" width="12" height="10" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1"/>
      <text x="132" y="194" fontSize="9" fill="#555">Humeral head</text>
      <text x="160" y="230" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial view — glenoid wear patterns</text>
    </svg>
  ),

  'shoulder-seebauer': (
    <svg viewBox="0 0 320 240" aria-label="Seebauer classification cuff arthropathy">
      {[
        {label:'1A',x:50,mig:0,note:'Centered'},
        {label:'1B',x:130,mig:6,note:'Early mig'},
        {label:'2A',x:210,mig:14,note:'Sup mig'},
        {label:'2B',x:275,mig:22,note:'Unstable'},
      ].map(({label,x,mig,note},i) => (
        <g key={i}>
          {/* Acromion */}
          <rect x={x} y={40} width={44} height={12} rx={3} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.2"/>
          {/* Glenoid */}
          <ellipse cx={x+6} cy={105} rx={8} ry={28} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.2"/>
          {/* Humeral head shifted up by mig */}
          <circle cx={x+28} cy={110-mig} r={22} fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
          {/* AHI arrow */}
          <line x1={x+28} y1={52} x2={x+28} y2={88-mig} stroke="#c0392b" strokeWidth="1.5"/>
          <text x={x+22} y={160} textAnchor="middle" fontSize="10" fill="#c0392b" fontWeight="bold">{label}</text>
          <text x={x+22} y={172} textAnchor="middle" fontSize="8" fill="#555">{note}</text>
        </g>
      ))}
      <text x="160" y="200" textAnchor="middle" fontSize="9" fill="#888">Red line = AHI (acromiohumeral interval)</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal oblique — cuff arthropathy staging</text>
    </svg>
  ),

  'shoulder-glenoid-track': (
    <svg viewBox="0 0 320 230" aria-label="Glenoid track on-track off-track Hill-Sachs">
      {/* Humeral head circle */}
      <circle cx="160" cy="115" r="75" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="118" textAnchor="middle" fontSize="10" fill="#2a5a7a">Humeral head</text>
      {/* Glenoid track — shaded band on medial humeral head */}
      <path d="M 106 65 A 75 75 0 0 0 106 165" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2" opacity="0.7"/>
      <text x="72" y="118" textAnchor="middle" fontSize="8" fill="#16a34a">Glenoid</text>
      <text x="72" y="128" textAnchor="middle" fontSize="8" fill="#16a34a">Track</text>
      {/* On-track Hill-Sachs — within track */}
      <ellipse cx="128" cy="75" rx="18" ry="10" fill="#fde68a" stroke="#d97706" strokeWidth="2" transform="rotate(-30 128 75)"/>
      <text x="108" y="52" fontSize="8" fill="#16a34a">ON-track ✓</text>
      {/* Off-track Hill-Sachs — outside track */}
      <ellipse cx="188" cy="60" rx="18" ry="10" fill="#fca5a5" stroke="#c0392b" strokeWidth="2" transform="rotate(-45 188 60)"/>
      <text x="195" y="45" fontSize="8" fill="#c0392b">OFF-track ✗</text>
      <line x1="188" y1="52" x2="200" y2="47" stroke="#c0392b" strokeWidth="1"/>
      <text x="160" y="225" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial view — engagement assessment</text>
    </svg>
  ),

  'shoulder-habermeyer': (
    <svg viewBox="0 0 320 240" aria-label="Habermeyer subscapularis classification">
      {/* Subscapularis shown as 4 horizontal bands — Types 1-4 */}
      {[
        {t:'Type 1', y:45, torn:0.25, color:'#fde68a', border:'#d97706'},
        {t:'Type 2', y:95, torn:0.25, color:'#fdba74', border:'#ea580c'},
        {t:'Type 3', y:145, torn:0.5, color:'#fca5a5', border:'#dc2626'},
        {t:'Type 4', y:185, torn:1.0, color:'#f87171', border:'#b91c1c'},
      ].map(({t,y,torn,color,border},i) => {
        const tW = 120 * torn;
        return (
          <g key={i}>
            {/* Intact portion */}
            <rect x={60} y={y} width={120-tW} height={28} rx={3} fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
            {/* Torn portion */}
            {tW > 0 && <rect x={60+(120-tW)} y={y} width={tW} height={28} rx={3} fill={color} stroke={border} strokeWidth="1.5"/>}
            <text x={195} y={y+17} fontSize="10" fill="#333" fontWeight="600">{t}</text>
            <text x={195} y={y+28} fontSize="8" fill="#888">{Math.round(torn*100)}% tear</text>
          </g>
        );
      })}
      <rect x="60" y="225" width="14" height="8" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1"/>
      <text x="78" y="232" fontSize="8" fill="#555">Intact</text>
      <rect x="120" y="225" width="14" height="8" fill="#fca5a5" stroke="#dc2626" strokeWidth="1"/>
      <text x="138" y="232" fontSize="8" fill="#555">Torn</text>
      <text x="55" y="35" fontSize="10" fill="#2a5a7a" fontWeight="bold">Subscapularis tendon (sagittal)</text>
    </svg>
  ),

  // ══════════════════════════════════════════════════════════════════════════
  // HIP
  // ══════════════════════════════════════════════════════════════════════════

  'hip-alpha': (
    <svg viewBox="0 0 320 240" aria-label="Alpha angle cam FAI">
      <circle cx="155" cy="115" r="62" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="155" y="118" textAnchor="middle" fontSize="10" fill="#2a5a7a">Femoral head</text>
      <path d="M197 153 L262 205" stroke="#4a7fa5" strokeWidth="10" strokeLinecap="round"/>
      <text x="252" y="200" fontSize="9" fill="#2a5a7a" transform="rotate(40 252 200)">Neck</text>
      <circle cx="155" cy="115" r="3" fill="#c0392b"/>
      <line x1="155" y1="115" x2="262" y2="186" stroke="#e07030" strokeWidth="2"/>
      <line x1="155" y1="115" x2="207" y2="60" stroke="#c0392b" strokeWidth="2"/>
      <ellipse cx="205" cy="75" rx="18" ry="10" fill="#f0a070" stroke="#c0392b" strokeWidth="1.5" transform="rotate(-30 205 75)"/>
      <text x="228" y="68" fontSize="8" fill="#c0392b">Cam bump</text>
      <path d="M 172 122 A 20 20 0 0 1 168 104" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="185" y="108" fontSize="11" fill="#c0392b" fontWeight="bold">α≥55°=cam</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Oblique axial / radial</text>
    </svg>
  ),

  'hip-lce': (
    <svg viewBox="0 0 320 230" aria-label="Lateral center-edge angle LCEA">
      <path d="M75 55 Q160 28 245 55 L245 140 Q200 172 160 175 Q120 172 75 140 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5" opacity="0.8"/>
      <text x="160" y="88" textAnchor="middle" fontSize="9" fill="#2a5a7a">Acetabulum</text>
      <circle cx="160" cy="138" r="38" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="141" textAnchor="middle" fontSize="10" fill="#2a5a7a">Femoral head</text>
      <circle cx="160" cy="138" r="3" fill="#c0392b"/>
      <line x1="160" y1="46" x2="160" y2="200" stroke="#aaa" strokeWidth="1" strokeDasharray="4 2"/>
      <line x1="160" y1="138" x2="245" y2="65" stroke="#c0392b" strokeWidth="2"/>
      <path d="M 160 105 A 33 33 0 0 1 188 114" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="192" y="102" fontSize="11" fill="#c0392b" fontWeight="bold">LCE</text>
      <text x="192" y="115" fontSize="9" fill="#c0392b">25–39° normal</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'hip-anteversion': (
    <svg viewBox="0 0 320 240" aria-label="Femoral anteversion two-level method">
      {/* Level 1: femoral neck axial */}
      <rect x="30" y="30" width="120" height="80" rx="8" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5"/>
      <text x="90" y="50" textAnchor="middle" fontSize="9" fill="#1d4ed8">Neck level (axial)</text>
      <ellipse cx="90" cy="80" rx="28" ry="18" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <line x1="62" y1="80" x2="118" y2="68" stroke="#c0392b" strokeWidth="2.5"/>
      <text x="90" y="105" textAnchor="middle" fontSize="8" fill="#c0392b">Neck axis</text>
      {/* Level 2: condylar axial */}
      <rect x="170" y="30" width="120" height="80" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5"/>
      <text x="230" y="50" textAnchor="middle" fontSize="9" fill="#16a34a">Condylar level (axial)</text>
      <ellipse cx="230" cy="80" rx="40" ry="22" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <line x1="190" y1="80" x2="270" y2="80" stroke="#e07030" strokeWidth="2.5"/>
      <text x="230" y="105" textAnchor="middle" fontSize="8" fill="#e07030">Condylar axis</text>
      {/* Angle between them */}
      <path d="M 155 140 Q 160 125 165 140" fill="none" stroke="#555" strokeWidth="1"/>
      <text x="160" y="160" textAnchor="middle" fontSize="9" fill="#555">Angle between</text>
      <text x="160" y="172" textAnchor="middle" fontSize="9" fill="#555">axes = anteversion</text>
      <text x="160" y="195" textAnchor="middle" fontSize="11" fill="#c0392b" fontWeight="bold">Normal: 10–20°</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Two-level axial method</text>
    </svg>
  ),

  'hip-ifi-qfs': (
    <svg viewBox="0 0 320 240" aria-label="Ischiofemoral interval and quadratus femoris space">
      {/* Ischium */}
      <ellipse cx="90" cy="130" rx="45" ry="55" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="90" y="133" textAnchor="middle" fontSize="9" fill="#2a5a7a">Ischium</text>
      {/* Lesser trochanter */}
      <ellipse cx="220" cy="130" rx="40" ry="50" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="220" y="125" textAnchor="middle" fontSize="8" fill="#2a5a7a">Lesser</text>
      <text x="220" y="136" textAnchor="middle" fontSize="8" fill="#2a5a7a">trochanter</text>
      {/* QF muscle in space */}
      <rect x="136" y="105" width="44" height="52" rx="6" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" opacity="0.8"/>
      <text x="158" y="128" textAnchor="middle" fontSize="8" fill="#166534">QF</text>
      <text x="158" y="139" textAnchor="middle" fontSize="7" fill="#166534">muscle</text>
      {/* IFI bracket — narrowest space */}
      <line x1="135" y1="165" x2="180" y2="165" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="135" y1="157" x2="135" y2="173" stroke="#c0392b" strokeWidth="2"/>
      <line x1="180" y1="157" x2="180" y2="173" stroke="#c0392b" strokeWidth="2"/>
      <text x="158" y="185" textAnchor="middle" fontSize="9" fill="#c0392b" fontWeight="bold">IFI &gt;17mm</text>
      {/* QFS bracket — full space */}
      <line x1="135" y1="200" x2="180" y2="200" stroke="#e07030" strokeWidth="2"/>
      <line x1="135" y1="193" x2="135" y2="207" stroke="#e07030" strokeWidth="1.5"/>
      <line x1="180" y1="193" x2="180" y2="207" stroke="#e07030" strokeWidth="1.5"/>
      <text x="158" y="220" textAnchor="middle" fontSize="9" fill="#e07030">QFS &gt;10mm</text>
      <text x="160" y="234" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial / coronal view</text>
    </svg>
  ),

  'hip-tonnis': (
    <svg viewBox="0 0 320 240" aria-label="Tonnis grading hip osteoarthritis">
      {[0,1,2,3].map(grade => {
        const x = 25 + grade * 72;
        const jSpace = [14, 10, 6, 2][grade];
        const cysts = grade >= 2;
        const sclerosis = grade >= 1;
        return (
          <g key={grade}>
            {/* Acetabular roof */}
            <path d={`M${x} 65 Q${x+35} 45 ${x+68} 65 L${x+68} 95 Q${x+35} 105 ${x} 95 Z`}
              fill={sclerosis ? '#b0c4de' : '#c8d8e8'} stroke="#4a7fa5" strokeWidth="1.5"/>
            {/* Joint space */}
            <rect x={x+8} y={95} width={52} height={jSpace} rx={2} fill="white" stroke="#aaa" strokeWidth="0.5"/>
            {/* Femoral head */}
            <circle cx={x+34} cy={95+jSpace+22} r={22}
              fill={grade===3?"#e8c8b8":"#d8e8f8"} stroke="#4a7fa5" strokeWidth="1.5"/>
            {/* Cysts */}
            {cysts && <circle cx={x+20} cy={90} r={5} fill="#fde68a" stroke="#d97706" strokeWidth="1"/>}
            {cysts && <circle cx={x+48} cy={88} r={4} fill="#fde68a" stroke="#d97706" strokeWidth="1"/>}
            {/* Osteophyte G3 */}
            {grade===3 && <ellipse cx={x+62} cy={100} rx={8} ry={5} fill="#c0392b" opacity="0.5"/>}
            <text x={x+34} y={175} textAnchor="middle" fontSize="11" fill="#c0392b" fontWeight="bold">G{grade}</text>
          </g>
        );
      })}
      <text x="160" y="200" textAnchor="middle" fontSize="9" fill="#888">G0=normal  G1=mild  G2=moderate  G3=severe</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view — OA severity</text>
    </svg>
  ),

  'hip-cup-overhang': (
    <svg viewBox="0 0 320 230" aria-label="Acetabular cup overhang">
      {/* Pelvis floor / sourcil */}
      <line x1="60" y1="90" x2="260" y2="90" stroke="#e07030" strokeWidth="2" strokeDasharray="5 2"/>
      <text x="265" y="93" fontSize="8" fill="#e07030">Sourcil</text>
      {/* Normal acetabulum */}
      <path d="M75 55 Q130 35 155 90 L75 90 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="105" y="75" textAnchor="middle" fontSize="8" fill="#2a5a7a">Normal</text>
      {/* Overhang acetabulum */}
      <path d="M170 55 Q235 30 265 90 L170 90 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      {/* Overhanging portion highlight */}
      <path d="M248 55 Q265 65 265 90 L248 90 Z" fill="#fca5a5" stroke="#c0392b" strokeWidth="1.5" opacity="0.7"/>
      <text x="218" y="75" textAnchor="middle" fontSize="8" fill="#2a5a7a">Overhang</text>
      <text x="255" y="78" fontSize="8" fill="#c0392b">↑</text>
      {/* Femoral heads */}
      <circle cx="105" cy="125" r="32" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <circle cx="215" cy="125" r="32" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      {/* Overhang measurement */}
      <line x1="248" y1="100" x2="265" y2="100" stroke="#c0392b" strokeWidth="2"/>
      <text x="268" y="103" fontSize="8" fill="#c0392b">&gt;2mm</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal — rim overhang</text>
    </svg>
  ),

  // ══════════════════════════════════════════════════════════════════════════
  // WRIST
  // ══════════════════════════════════════════════════════════════════════════

  'wrist-sl-gap': (
    <svg viewBox="0 0 320 230" aria-label="Scapholunate gap measurement">
      <rect x="75" y="28" width="170" height="50" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="57" textAnchor="middle" fontSize="10" fill="#2a5a7a">Distal radius</text>
      <ellipse cx="108" cy="135" rx="32" ry="36" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="108" y="138" textAnchor="middle" fontSize="9" fill="#2a5a7a">Scaphoid</text>
      <ellipse cx="198" cy="132" rx="34" ry="34" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="198" y="135" textAnchor="middle" fontSize="9" fill="#2a5a7a">Lunate</text>
      <line x1="140" y1="132" x2="164" y2="132" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="140" y1="124" x2="140" y2="140" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="164" y1="124" x2="164" y2="140" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="152" y="155" textAnchor="middle" fontSize="9" fill="#c0392b" fontWeight="bold">SL gap</text>
      <text x="152" y="167" textAnchor="middle" fontSize="9" fill="#c0392b">&lt;3mm normal</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'wrist-radial-inclination': (
    <svg viewBox="0 0 320 230" aria-label="Radial inclination angle">
      <rect x="90" y="35" width="65" height="130" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="122" y="100" textAnchor="middle" fontSize="10" fill="#2a5a7a">Radius</text>
      {/* Articular surface line (inclined) */}
      <line x1="90" y1="165" x2="155" y2="145" stroke="#4a7fa5" strokeWidth="2.5"/>
      {/* Perpendicular to shaft */}
      <line x1="90" y1="165" x2="155" y2="165" stroke="#aaa" strokeWidth="1" strokeDasharray="3 2"/>
      {/* Angle arc */}
      <path d="M 112 165 A 22 22 0 0 1 108 148" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="160" y="155" fontSize="10" fill="#c0392b" fontWeight="bold">21–25°</text>
      <text x="160" y="168" fontSize="9" fill="#c0392b">&lt;15° = malunion</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'wrist-ulnar-variance': (
    <svg viewBox="0 0 320 230" aria-label="Ulnar variance measurement">
      <rect x="90" y="40" width="60" height="130" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="120" y="105" textAnchor="middle" fontSize="10" fill="#2a5a7a">Radius</text>
      <line x1="90" y1="170" x2="150" y2="170" stroke="#4a7fa5" strokeWidth="2.5"/>
      <rect x="170" y="55" width="60" height="115" rx="8" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="200" y="115" textAnchor="middle" fontSize="10" fill="#2a5a7a">Ulna</text>
      <line x1="170" y1="170" x2="230" y2="170" stroke="#4a7fa5" strokeWidth="2.5" strokeDasharray="4 2"/>
      <line x1="170" y1="155" x2="230" y2="155" stroke="#c0392b" strokeWidth="2"/>
      <line x1="240" y1="155" x2="240" y2="170" stroke="#c0392b" strokeWidth="2"/>
      <line x1="232" y1="155" x2="248" y2="155" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="232" y1="170" x2="248" y2="170" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="252" y="165" fontSize="9" fill="#c0392b">UV</text>
      <text x="50" y="195" fontSize="9" fill="#888">Positive UV &gt;2mm = TFCC/ulnar impaction risk</text>
      <text x="160" y="220" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal T1/PD</text>
    </svg>
  ),

  'wrist-sl-angle': (
    <svg viewBox="0 0 320 230" aria-label="Scapholunate angle sagittal">
      {/* Scaphoid long axis */}
      <ellipse cx="115" cy="125" rx="25" ry="52" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5" transform="rotate(-18 115 125)"/>
      <text x="115" y="128" textAnchor="middle" fontSize="8" fill="#2a5a7a">Scaphoid</text>
      <line x1="104" y1="80" x2="126" y2="170" stroke="#c0392b" strokeWidth="2" strokeDasharray="4 2"/>
      {/* Lunate */}
      <ellipse cx="205" cy="120" rx="32" ry="28" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="205" y="123" textAnchor="middle" fontSize="8" fill="#2a5a7a">Lunate</text>
      <line x1="178" y1="100" x2="232" y2="140" stroke="#e07030" strokeWidth="2" strokeDasharray="4 2"/>
      {/* Angle arc between axes */}
      <path d="M 152 110 A 25 25 0 0 1 165 128" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="168" y="108" fontSize="10" fill="#c0392b" fontWeight="bold">SL: 30–60°</text>
      <text x="168" y="120" fontSize="9" fill="#c0392b">&gt;70°= DISI</text>
      <text x="168" y="132" fontSize="9" fill="#c0392b">&lt;30°= VISI</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view</text>
    </svg>
  ),

  'wrist-capitolunate': (
    <svg viewBox="0 0 320 230" aria-label="Capitolunate angle">
      {/* Capitate */}
      <ellipse cx="160" cy="80" rx="28" ry="40" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="83" textAnchor="middle" fontSize="9" fill="#2a5a7a">Capitate</text>
      <line x1="160" y1="40" x2="160" y2="120" stroke="#e07030" strokeWidth="2" strokeDasharray="4 2"/>
      {/* Lunate */}
      <ellipse cx="160" cy="155" rx="30" ry="26" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="158" textAnchor="middle" fontSize="9" fill="#2a5a7a">Lunate</text>
      <line x1="140" y1="138" x2="180" y2="172" stroke="#c0392b" strokeWidth="2" strokeDasharray="4 2"/>
      {/* Angle */}
      <path d="M 152 125 A 18 18 0 0 1 164 134" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="170" y="125" fontSize="10" fill="#c0392b" fontWeight="bold">CL: 0–15°</text>
      <text x="170" y="138" fontSize="9" fill="#c0392b">&gt;20° = abnormal</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view</text>
    </svg>
  ),

  'wrist-ecu': (
    <svg viewBox="0 0 320 230" aria-label="ECU dynamic instability">
      {/* Two axial images side by side: pronation vs supination */}
      {/* Pronation — ECU in groove */}
      <rect x="20" y="30" width="125" height="155" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5"/>
      <text x="82" y="50" textAnchor="middle" fontSize="9" fill="#555" fontWeight="bold">Pronation</text>
      <ellipse cx="82" cy="115" rx="42" ry="50" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="82" y="118" textAnchor="middle" fontSize="8" fill="#2a5a7a">Distal ulna</text>
      {/* Groove */}
      <path d="M55 80 Q82 70 109 80" fill="none" stroke="#4a7fa5" strokeWidth="2"/>
      {/* ECU in groove */}
      <circle cx="82" cy="73" r="9" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="82" y="76" textAnchor="middle" fontSize="7" fill="white">ECU</text>
      <text x="82" y="172" textAnchor="middle" fontSize="9" fill="#16a34a">Normal ✓</text>

      {/* Supination — ECU subluxed */}
      <rect x="175" y="30" width="125" height="155" rx="8" fill="#fff5f5" stroke="#fca5a5" strokeWidth="1.5"/>
      <text x="237" y="50" textAnchor="middle" fontSize="9" fill="#555" fontWeight="bold">Supination</text>
      <ellipse cx="237" cy="115" rx="42" ry="50" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="237" y="118" textAnchor="middle" fontSize="8" fill="#2a5a7a">Distal ulna</text>
      <path d="M210 80 Q237 70 264 80" fill="none" stroke="#4a7fa5" strokeWidth="2"/>
      {/* ECU subluxed radially */}
      <circle cx="215" cy="68" r="9" fill="#fca5a5" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="215" y="71" textAnchor="middle" fontSize="7" fill="#c0392b">ECU</text>
      <line x1="224" y1="68" x2="237" y2="72" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="3 1"/>
      <text x="237" y="172" textAnchor="middle" fontSize="9" fill="#c0392b">Subluxed ✗</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial — dynamic comparison</text>
    </svg>
  ),

  // ══════════════════════════════════════════════════════════════════════════
  // ELBOW
  // ══════════════════════════════════════════════════════════════════════════

  'elbow-medial-joint': (
    <svg viewBox="0 0 320 230" aria-label="Medial joint space width elbow">
      {/* Medial epicondyle */}
      <ellipse cx="95" cy="90" rx="40" ry="30" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="95" y="93" textAnchor="middle" fontSize="8" fill="#2a5a7a">Med. epicondyle</text>
      {/* Ulna coronoid */}
      <ellipse cx="215" cy="150" rx="40" ry="25" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="215" y="153" textAnchor="middle" fontSize="8" fill="#2a5a7a">Ulna</text>
      {/* Trochlea */}
      <ellipse cx="160" cy="120" rx="35" ry="28" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="123" textAnchor="middle" fontSize="8" fill="#2a5a7a">Trochlea</text>
      {/* Medial joint space */}
      <line x1="125" y1="130" x2="175" y2="130" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="125" y1="122" x2="125" y2="138" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="175" y1="122" x2="175" y2="138" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="150" y="150" textAnchor="middle" fontSize="9" fill="#c0392b" fontWeight="bold">&lt;3mm normal</text>
      <text x="150" y="162" textAnchor="middle" fontSize="8" fill="#c0392b">&gt;3mm valgus stress = UCL laxity</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'elbow-ucl': (
    <svg viewBox="0 0 320 230" aria-label="UCL thickness elbow">
      <ellipse cx="90" cy="90" rx="38" ry="28" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="90" y="93" textAnchor="middle" fontSize="8" fill="#2a5a7a">Med. epicondyle</text>
      <path d="M112 105 Q162 125 202 158" fill="none" stroke="#2d7a5a" strokeWidth="9" strokeLinecap="round" opacity="0.8"/>
      <text x="165" y="120" fontSize="8" fill="#1a4a3a" transform="rotate(35 165 120)">UCL ant bundle</text>
      <ellipse cx="218" cy="172" rx="38" ry="22" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="218" y="175" textAnchor="middle" fontSize="8" fill="#2a5a7a">Ulna (coronoid)</text>
      <line x1="140" y1="112" x2="172" y2="100" stroke="#c0392b" strokeWidth="1" strokeDasharray="3 2"/>
      <text x="176" y="98" fontSize="9" fill="#c0392b">3–4 mm normal</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'elbow-radiocapitellar': (
    <svg viewBox="0 0 320 230" aria-label="Radiocapitellar line">
      <ellipse cx="145" cy="80" rx="42" ry="30" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="145" y="83" textAnchor="middle" fontSize="9" fill="#2a5a7a">Capitellum</text>
      <rect x="168" y="110" width="36" height="100" rx="6" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="186" y="165" textAnchor="middle" fontSize="8" fill="#2a5a7a">Radius</text>
      <line x1="186" y1="28" x2="186" y2="212" stroke="#c0392b" strokeWidth="2" strokeDasharray="5 2"/>
      <text x="205" y="46" fontSize="8" fill="#c0392b">Line bisects</text>
      <text x="205" y="57" fontSize="8" fill="#c0392b">capitellum ✓</text>
      <circle cx="145" cy="80" r="5" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal / lateral view</text>
    </svg>
  ),

  'elbow-olecranon': (
    <svg viewBox="0 0 320 230" aria-label="Olecranon fossa depth">
      {/* Distal humerus posterior */}
      <path d="M70 50 Q160 35 250 50 L250 130 Q220 155 200 148 Q170 130 160 128 Q150 130 120 148 Q100 155 70 130 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="85" textAnchor="middle" fontSize="10" fill="#2a5a7a">Distal humerus (posterior)</text>
      {/* Olecranon fossa — depression */}
      <ellipse cx="160" cy="130" rx="38" ry="18" fill="#f0f8ff" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="133" textAnchor="middle" fontSize="9" fill="#2a5a7a">Olecranon fossa</text>
      {/* Depth measurement */}
      <line x1="160" y1="112" x2="160" y2="148" stroke="#c0392b" strokeWidth="2"/>
      <line x1="150" y1="112" x2="170" y2="112" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="150" y1="148" x2="170" y2="148" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="180" y="133" fontSize="9" fill="#c0392b">4–8 mm</text>
      {/* Olecranon tip */}
      <ellipse cx="160" cy="175" rx="28" ry="18" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="178" textAnchor="middle" fontSize="8" fill="#2a5a7a">Olecranon tip</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view — posterior</text>
    </svg>
  ),

  'elbow-carrying': (
    <svg viewBox="0 0 320 240" aria-label="Elbow carrying angle">
      <rect x="128" y="20" width="50" height="120" rx="8" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="153" y="80" textAnchor="middle" fontSize="9" fill="#2a5a7a">Humerus</text>
      <path d="M158 140 L178 230" stroke="#4a7fa5" strokeWidth="12" strokeLinecap="round"/>
      <text x="188" y="195" fontSize="9" fill="#2a5a7a">Ulna</text>
      <line x1="153" y1="20" x2="153" y2="230" stroke="#aaa" strokeWidth="1" strokeDasharray="4 2"/>
      <path d="M 153 148 A 24 24 0 0 1 169 158" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="175" y="148" fontSize="10" fill="#c0392b" fontWeight="bold">5–15°</text>
      <text x="175" y="160" fontSize="9" fill="#c0392b">valgus</text>
      <text x="160" y="234" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">AP / coronal — full extension</text>
    </svg>
  ),

  // ══════════════════════════════════════════════════════════════════════════
  // ANKLE
  // ══════════════════════════════════════════════════════════════════════════

  'ankle-atfl': (
    <svg viewBox="0 0 320 230" aria-label="ATFL thickness measurement">
      {/* Fibula */}
      <ellipse cx="95" cy="115" rx="28" ry="55" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="95" y="118" textAnchor="middle" fontSize="8" fill="#2a5a7a">Fibula</text>
      {/* Talus */}
      <ellipse cx="220" cy="140" rx="60" ry="48" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="220" y="143" textAnchor="middle" fontSize="9" fill="#2a5a7a">Talus</text>
      {/* ATFL band */}
      <path d="M120 100 Q168 112 162 122" fill="none" stroke="#2d7a5a" strokeWidth="8" strokeLinecap="round" opacity="0.85"/>
      <text x="148" y="95" textAnchor="middle" fontSize="8" fill="#1a4a3a">ATFL</text>
      {/* Thickness measurement */}
      <line x1="128" y1="96" x2="128" y2="108" stroke="#c0392b" strokeWidth="2"/>
      <line x1="120" y1="96" x2="136" y2="96" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="120" y1="108" x2="136" y2="108" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="142" y="105" fontSize="9" fill="#c0392b">2–3 mm</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial PD FS view</text>
    </svg>
  ),

  'ankle-tibiotalar': (
    <svg viewBox="0 0 320 230" aria-label="Tibiotalar joint space">
      {/* Tibia */}
      <rect x="90" y="30" width="140" height="75" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="72" textAnchor="middle" fontSize="10" fill="#2a5a7a">Tibia (plafond)</text>
      {/* Fibula */}
      <rect x="232" y="40" width="30" height="68" rx="4" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      {/* Joint space */}
      <rect x="90" y="105" width="140" height="12" fill="white" stroke="#94a3b8" strokeWidth="0.5"/>
      {/* Joint space bracket */}
      <line x1="74" y1="105" x2="74" y2="117" stroke="#c0392b" strokeWidth="2"/>
      <line x1="66" y1="105" x2="82" y2="105" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="66" y1="117" x2="82" y2="117" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="46" y="115" fontSize="9" fill="#c0392b">3–4mm</text>
      {/* Talus */}
      <path d="M80 117 Q160 112 242 117 L242 165 Q200 185 160 188 Q120 185 80 165 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="155" textAnchor="middle" fontSize="10" fill="#2a5a7a">Talus</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'ankle-achilles': (
    <svg viewBox="0 0 320 230" aria-label="Achilles tendon AP diameter">
      <ellipse cx="168" cy="190" rx="72" ry="32" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="168" y="193" textAnchor="middle" fontSize="10" fill="#2a5a7a">Calcaneus</text>
      <path d="M143 28 Q150 120 154 158" fill="none" stroke="#8bb8a8" strokeWidth="16" strokeLinecap="round" opacity="0.85"/>
      <text x="82" y="78" fontSize="9" fill="#1a4a3a">Achilles tendon</text>
      <line x1="134" y1="98" x2="162" y2="98" stroke="#c0392b" strokeWidth="2"/>
      <line x1="134" y1="90" x2="134" y2="106" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="162" y1="90" x2="162" y2="106" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="170" y="101" fontSize="9" fill="#c0392b">AP &lt;6 mm</text>
      <text x="170" y="113" fontSize="8" fill="#888">2–6 cm above insertion</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view</text>
    </svg>
  ),

  'ankle-kager': (
    <svg viewBox="0 0 320 220" aria-label="Kager fat pad ankle">
      {/* Tibia */}
      <rect x="100" y="20" width="80" height="70" rx="5" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="140" y="58" textAnchor="middle" fontSize="9" fill="#2a5a7a">Tibia</text>
      {/* Calcaneus */}
      <ellipse cx="105" cy="168" rx="60" ry="30" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="105" y="171" textAnchor="middle" fontSize="9" fill="#2a5a7a">Calcaneus</text>
      {/* Achilles tendon */}
      <rect x="162" y="20" width="20" height="145" rx="5" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="172" y="92" textAnchor="middle" fontSize="7" fill="#1a4a3a" transform="rotate(90 172 92)">Achilles</text>
      {/* Kager fat pad triangle */}
      <path d="M130 90 Q155 85 162 90 L162 155 Q145 162 130 155 Z" fill="#fef9c3" stroke="#d97706" strokeWidth="1.5"/>
      <text x="148" y="125" textAnchor="middle" fontSize="8" fill="#d97706">Kager</text>
      <text x="148" y="136" textAnchor="middle" fontSize="8" fill="#d97706">fat pad</text>
      {/* Retrocalcaneal bursa marker */}
      <circle cx="162" cy="155" r="7" fill="#fca5a5" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="176" y="158" fontSize="8" fill="#c0392b">Bursa</text>
      <text x="160" y="212" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal view</text>
    </svg>
  ),

  'ankle-syndesmosis': (
    <svg viewBox="0 0 320 230" aria-label="Syndesmosis width measurement">
      <rect x="78" y="50" width="112" height="100" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="134" y="105" textAnchor="middle" fontSize="10" fill="#2a5a7a">Tibia</text>
      <rect x="198" y="68" width="55" height="82" rx="5" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="225" y="112" textAnchor="middle" fontSize="9" fill="#2a5a7a">Fibula</text>
      <line x1="190" y1="100" x2="198" y2="100" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="190" y1="92" x2="190" y2="108" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="198" y1="92" x2="198" y2="108" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="158" y="126" textAnchor="middle" fontSize="9" fill="#c0392b">Clear space &lt;6mm</text>
      <line x1="193" y1="78" x2="232" y2="58" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="235" y="56" fontSize="8" fill="#2d7a5a">AITFL</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial — 1 cm above plafond</text>
    </svg>
  ),

  // ══════════════════════════════════════════════════════════════════════════
  // SPINE
  // ══════════════════════════════════════════════════════════════════════════

  'spine-modic': (
    <svg viewBox="0 0 320 240" aria-label="Modic changes classification">
      {/* Three vertebral units side by side */}
      {[
        {label:'Type 1', x:20, t1:'dark', t2:'bright', color:'#93c5fd', note:'Edema'},
        {label:'Type 2', x:115, t1:'bright', t2:'bright', color:'#fde68a', note:'Fatty'},
        {label:'Type 3', x:210, t1:'dark', t2:'dark', color:'#94a3b8', note:'Sclerosis'},
      ].map(({label,x,t1,t2,color,note},i) => {
        const endpColor = color;
        return (
          <g key={i}>
            {/* Upper vertebra */}
            <rect x={x} y={40} width={85} height={48} rx={5} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
            {/* Upper endplate signal */}
            <rect x={x} y={84} width={85} height={10} rx={2} fill={endpColor} stroke="#4a7fa5" strokeWidth="1"/>
            {/* Disc */}
            <rect x={x} y={94} width={85} height={20} rx={2} fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.2"/>
            {/* Lower endplate signal */}
            <rect x={x} y={114} width={85} height={10} rx={2} fill={endpColor} stroke="#4a7fa5" strokeWidth="1"/>
            {/* Lower vertebra */}
            <rect x={x} y={124} width={85} height={48} rx={5} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
            <text x={x+42} y={188} textAnchor="middle" fontSize="9" fill="#c0392b" fontWeight="bold">{label}</text>
            <text x={x+42} y={200} textAnchor="middle" fontSize="8" fill="#555">{note}</text>
            <text x={x+42} y={212} textAnchor="middle" fontSize="7" fill="#888">T1:{t1} T2:{t2}</text>
          </g>
        );
      })}
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal T1/T2 — endplate signal</text>
    </svg>
  ),

  'spine-disc-nomen': (
    <svg viewBox="0 0 320 240" aria-label="Disc nomenclature bulge protrusion extrusion sequestration">
      {[
        {label:'Bulge', x:22, shape:'bulge'},
        {label:'Protrusion', x:92, shape:'protrusion'},
        {label:'Extrusion', x:175, shape:'extrusion'},
        {label:'Sequestration', x:248, shape:'sequestration'},
      ].map(({label,x,shape},i) => {
        const cx = x + 30;
        return (
          <g key={i}>
            {/* Vertebrae */}
            <rect x={x} y={30} width={60} height={35} rx={4} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.2"/>
            <rect x={x} y={115} width={60} height={35} rx={4} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.2"/>
            {/* Disc base */}
            <rect x={x} y={65} width={60} height={50} rx={2} fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.2"/>
            {/* Herniation shapes */}
            {shape==='bulge' && <rect x={x-8} y={72} width={76} height={36} rx={10} fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5" opacity="0.7"/>}
            {shape==='protrusion' && <ellipse cx={cx+18} cy={90} rx={12} ry={18} fill="#fde68a" stroke="#d97706" strokeWidth="1.5"/>}
            {shape==='extrusion' && <ellipse cx={cx+18} cy={85} rx={14} ry={24} fill="#fca5a5" stroke="#c0392b" strokeWidth="1.5"/>}
            {shape==='sequestration' && <>
              <ellipse cx={cx+18} cy={82} rx={10} ry={16} fill="#fca5a5" stroke="#c0392b" strokeWidth="1" opacity="0.5"/>
              <ellipse cx={cx+20} cy={62} rx={9} ry={12} fill="#c0392b" stroke="#991b1b" strokeWidth="1.5"/>
              <text x={cx+20} y={65} textAnchor="middle" fontSize="7" fill="white">frag</text>
            </>}
            <text x={cx} y={170} textAnchor="middle" fontSize="8" fill="#c0392b" fontWeight="bold">{label}</text>
          </g>
        );
      })}
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial view — disc morphology types</text>
    </svg>
  ),

  'spine-ao-cervical': (
    <svg viewBox="0 0 320 240" aria-label="AO Spine cervical classification">
      {[
        {label:'A0\nMinor', x:18, color:'#bbf7d0', border:'#16a34a', shape:'intact'},
        {label:'A4\nBurst', x:90, color:'#fde68a', border:'#d97706', shape:'burst'},
        {label:'B2\nTension', x:175, color:'#fdba74', border:'#ea580c', shape:'tension'},
        {label:'C\nTranslate', x:250, color:'#fca5a5', border:'#dc2626', shape:'translate'},
      ].map(({label,x,color,border,shape},i) => {
        const cx = x + 32;
        return (
          <g key={i}>
            {/* Vertebral body */}
            <rect x={x} y={50} width={64} height={45} rx={4}
              fill={shape==='translate'?'#fca5a5':color} stroke={border} strokeWidth="2"/>
            {/* Disc */}
            <rect x={x} y={95} width={64} height={16} rx={2} fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1"/>
            {/* Below vertebra */}
            <rect x={x + (shape==='translate'?12:0)} y={111} width={64} height={45} rx={4}
              fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
            {/* Burst fracture lines */}
            {shape==='burst' && <>
              <line x1={x+32} y1={50} x2={x+18} y2={95} stroke="#c0392b" strokeWidth="1.5"/>
              <line x1={x+32} y1={50} x2={x+46} y2={95} stroke="#c0392b" strokeWidth="1.5"/>
            </>}
            {/* Tension band */}
            {shape==='tension' && <>
              <line x1={x+32} y1={50} x2={x+32} y2={30} stroke="#c0392b" strokeWidth="2"/>
              <line x1={x+15} y1={30} x2={x+49} y2={30} stroke="#c0392b" strokeWidth="2"/>
              <text x={cx} y={27} textAnchor="middle" fontSize="7" fill="#c0392b">PLC disruption</text>
            </>}
            <text x={cx} y={180} textAnchor="middle" fontSize="9" fill="#333" fontWeight="600">{label.split('\n')[0]}</text>
            <text x={cx} y={191} textAnchor="middle" fontSize="8" fill="#555">{label.split('\n')[1]}</text>
          </g>
        );
      })}
      <text x="160" y="215" textAnchor="middle" fontSize="9" fill="#888">A=compression  B=tension band  C=displacement</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal — AO Cervical types</text>
    </svg>
  ),

  'spine-ao-tl': (
    <svg viewBox="0 0 320 240" aria-label="AO Spine thoracolumbar classification">
      {[
        {label:'A1\nWedge', x:18, shape:'wedge', color:'#bbf7d0', border:'#16a34a'},
        {label:'A4\nBurst', x:90, shape:'burst', color:'#fde68a', border:'#d97706'},
        {label:'B1\nBony PLC', x:168, shape:'bony', color:'#fdba74', border:'#ea580c'},
        {label:'C\nDisplace', x:248, shape:'translate', color:'#fca5a5', border:'#dc2626'},
      ].map(({label,x,shape,color,border},i) => {
        const cx = x + 32;
        const vbPath = shape==='wedge'
          ? `M${x} 50 L${x+64} 50 L${x+55} 95 L${x+9} 95 Z`
          : `M${x} 50 L${x+64} 50 L${x+64} 95 L${x} 95 Z`;
        return (
          <g key={i}>
            <path d={vbPath} fill={color} stroke={border} strokeWidth="2"/>
            <rect x={x} y={95} width={64} height={14} rx={2} fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1"/>
            <rect x={x+(shape==='translate'?16:0)} y={109} width={64} height={44} rx={4} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
            {shape==='burst' && <>
              <line x1={x+32} y1={50} x2={x+16} y2={95} stroke="#c0392b" strokeWidth="1.5"/>
              <line x1={x+32} y1={50} x2={x+48} y2={95} stroke="#c0392b" strokeWidth="1.5"/>
              <ellipse cx={x+40} cy={105} rx={8} ry={5} fill="#c0392b" opacity="0.6"/>
            </>}
            {shape==='bony' && <>
              <line x1={x+32} y1={95} x2={x+32} y2={65} stroke="#c0392b" strokeWidth="2"/>
              <line x1={x+10} y1={65} x2={x+54} y2={65} stroke="#c0392b" strokeWidth="2"/>
            </>}
            <text x={cx} y={178} textAnchor="middle" fontSize="9" fill="#333" fontWeight="600">{label.split('\n')[0]}</text>
            <text x={cx} y={190} textAnchor="middle" fontSize="8" fill="#555">{label.split('\n')[1]}</text>
          </g>
        );
      })}
      <text x="160" y="214" textAnchor="middle" fontSize="9" fill="#888">TLICS: ≤3 = conservative  ≥5 = surgical</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal — AO Thoracolumbar types</text>
    </svg>
  ),

  'spine-imbalance': (
    <svg viewBox="0 0 320 240" aria-label="Coronal and sagittal spinal imbalance">
      {/* Sagittal view left */}
      <rect x="18" y="20" width="130" height="200" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1"/>
      <text x="83" y="38" textAnchor="middle" fontSize="9" fill="#1d4ed8" fontWeight="bold">Sagittal</text>
      {/* Spine curve */}
      <path d="M70 50 Q90 90 75 130 Q60 165 80 200" fill="none" stroke="#4a7fa5" strokeWidth="3"/>
      {/* C7 plumb line */}
      <line x1="74" y1="55" x2="74" y2="210" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      <circle cx="74" cy="55" r="4" fill="#c0392b"/>
      <text x="85" y="53" fontSize="8" fill="#c0392b">C7</text>
      <circle cx="80" cy="200" r="4" fill="#e07030"/>
      <text x="86" y="203" fontSize="8" fill="#e07030">S1</text>
      {/* SVA offset */}
      <line x1="74" y1="200" x2="80" y2="200" stroke="#c0392b" strokeWidth="2"/>
      <text x="55" y="175" fontSize="8" fill="#c0392b">SVA</text>
      <text x="50" y="186" fontSize="8" fill="#c0392b">&lt;50mm</text>

      {/* Coronal view right */}
      <rect x="172" y="20" width="130" height="200" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1"/>
      <text x="237" y="38" textAnchor="middle" fontSize="9" fill="#1d4ed8" fontWeight="bold">Coronal</text>
      {/* Spine curve */}
      <path d="M237 50 Q255 90 240 130 Q225 165 242 200" fill="none" stroke="#4a7fa5" strokeWidth="3"/>
      {/* CSVL */}
      <line x1="237" y1="50" x2="237" y2="210" stroke="#aaa" strokeWidth="1" strokeDasharray="4 2"/>
      {/* C7 to CSVL offset */}
      <circle cx="237" cy="55" r="4" fill="#c0392b"/>
      <text x="248" y="53" fontSize="8" fill="#c0392b">C7</text>
      <line x1="237" y1="195" x2="253" y2="195" stroke="#c0392b" strokeWidth="2"/>
      <text x="254" y="183" fontSize="8" fill="#c0392b">Coronal</text>
      <text x="254" y="194" fontSize="8" fill="#c0392b">bal &lt;20mm</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal (SVA) + Coronal balance</text>
    </svg>
  ),

  'spine-cobb': (
    <svg viewBox="0 0 320 240" aria-label="Cobb angle scoliosis">
      {[0,1,2,3,4].map(i => {
        const y = 28 + i * 38;
        const xOffset = [0,14,24,14,0][i];
        return <rect key={i} x={98+xOffset} y={y} width={100} height={26} rx={5} fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>;
      })}
      <line x1="98" y1="28" x2="198" y2="28" stroke="#c0392b" strokeWidth="2"/>
      <line x1="112" y1="218" x2="212" y2="214" stroke="#c0392b" strokeWidth="2"/>
      <line x1="98" y1="28" x2="58" y2="120" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      <line x1="112" y1="218" x2="52" y2="128" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      <path d="M 65 115 A 22 22 0 0 0 67 132" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="26" y="128" fontSize="11" fill="#c0392b" fontWeight="bold">Cobb°</text>
      <text x="38" y="165" fontSize="9" fill="#888">Normal &lt;10°</text>
      <text x="38" y="177" fontSize="9" fill="#888">Surgery &gt;45°</text>
      <text x="160" y="235" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view — scoliosis</text>
    </svg>
  ),

  // ══════════════════════════════════════════════════════════════════════════
  // PELVIS
  // ══════════════════════════════════════════════════════════════════════════

  'pelvis-si-joint': (
    <svg viewBox="0 0 320 220" aria-label="SI joint width measurement">
      <path d="M120 58 L200 58 L196 170 L124 170 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="118" textAnchor="middle" fontSize="10" fill="#2a5a7a">Sacrum</text>
      <path d="M68 38 L118 58 L122 170 L63 175 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="88" y="108" textAnchor="middle" fontSize="9" fill="#2a5a7a">Ilium</text>
      <path d="M252 38 L202 58 L198 170 L256 175 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="230" y="108" textAnchor="middle" fontSize="9" fill="#2a5a7a">Ilium</text>
      <line x1="118" y1="110" x2="122" y2="110" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="118" y1="102" x2="118" y2="118" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="122" y1="102" x2="122" y2="118" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="94" y="130" fontSize="8" fill="#c0392b">2–5 mm</text>
      <text x="160" y="212" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal / axial view</text>
    </svg>
  ),

  'pelvis-symphysis': (
    <svg viewBox="0 0 320 220" aria-label="Pubic symphysis width">
      <path d="M58 80 L148 80 L148 162 L58 162 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5" rx="8"/>
      <text x="103" y="124" textAnchor="middle" fontSize="9" fill="#2a5a7a">L pubis</text>
      <path d="M172 80 L262 80 L262 162 L172 162 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="217" y="124" textAnchor="middle" fontSize="9" fill="#2a5a7a">R pubis</text>
      <rect x="148" y="86" width="24" height="70" rx="2" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="160" y="125" textAnchor="middle" fontSize="7" fill="#1a4a3a" transform="rotate(90 160 125)">Fibrocart.</text>
      <line x1="148" y1="177" x2="172" y2="177" stroke="#c0392b" strokeWidth="2"/>
      <line x1="148" y1="169" x2="148" y2="185" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="172" y1="169" x2="172" y2="185" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="100" y="202" fontSize="9" fill="#c0392b">Width &lt;6mm normal; &gt;10mm = diastasis</text>
      <text x="160" y="215" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'pelvis-iliolumbar': (
    <svg viewBox="0 0 320 230" aria-label="Iliolumbar ligament">
      {/* L5 transverse process */}
      <rect x="125" y="40" width="70" height="35" rx="5" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="61" textAnchor="middle" fontSize="9" fill="#2a5a7a">L4–L5 TP</text>
      {/* Left iliac crest */}
      <path d="M40 110 Q80 80 120 105 L120 145 Q80 160 40 145 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="78" y="128" textAnchor="middle" fontSize="9" fill="#2a5a7a">Iliac crest</text>
      {/* Right iliac crest */}
      <path d="M280 110 Q240 80 200 105 L200 145 Q240 160 280 145 Z" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="242" y="128" textAnchor="middle" fontSize="9" fill="#2a5a7a">Iliac crest</text>
      {/* Iliolumbar ligaments */}
      <line x1="125" y1="58" x2="118" y2="110" stroke="#2d7a5a" strokeWidth="5" strokeLinecap="round" opacity="0.85"/>
      <line x1="195" y1="58" x2="202" y2="110" stroke="#2d7a5a" strokeWidth="5" strokeLinecap="round" opacity="0.85"/>
      <text x="80" y="150" fontSize="8" fill="#2d7a5a">ILL</text>
      <text x="210" y="150" fontSize="8" fill="#2d7a5a">ILL</text>
      {/* Thickness annotation */}
      <text x="160" y="185" textAnchor="middle" fontSize="10" fill="#c0392b">Thickness 3–5 mm normal</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'pelvis-acetabular-depth': (
    <svg viewBox="0 0 320 230" aria-label="Acetabular depth protrusio">
      <line x1="48" y1="155" x2="272" y2="155" stroke="#e07030" strokeWidth="2" strokeDasharray="5 2"/>
      <text x="278" y="158" fontSize="8" fill="#e07030">Ilioischial line</text>
      <path d="M88 78 Q160 53 232 78 L232 155 Q198 177 160 182 Q122 177 88 155 Z" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <circle cx="160" cy="138" r="38" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="141" textAnchor="middle" fontSize="9" fill="#2a5a7a">Femoral head</text>
      <line x1="160" y1="100" x2="160" y2="155" stroke="#c0392b" strokeWidth="2"/>
      <text x="168" y="131" fontSize="8" fill="#c0392b">Depth</text>
      <text x="168" y="143" fontSize="8" fill="#c0392b">&gt;3mm past line</text>
      <text x="168" y="154" fontSize="8" fill="#c0392b">= protrusio</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  'pelvis-neck-shaft': (
    <svg viewBox="0 0 320 230" aria-label="Femoral neck shaft angle">
      {/* Femoral shaft */}
      <rect x="148" y="100" width="32" height="110" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="164" y="158" textAnchor="middle" fontSize="8" fill="#2a5a7a" transform="rotate(0 164 158)">Shaft</text>
      {/* Femoral neck */}
      <path d="M148 105 Q108 90 88 72" stroke="#4a7fa5" strokeWidth="12" strokeLinecap="round" fill="none"/>
      {/* Femoral head */}
      <circle cx="76" cy="62" r="26" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="76" y="65" textAnchor="middle" fontSize="8" fill="#2a5a7a">Head</text>
      {/* Shaft axis */}
      <line x1="164" y1="95" x2="164" y2="215" stroke="#aaa" strokeWidth="1" strokeDasharray="4 2"/>
      {/* Neck axis */}
      <line x1="148" y1="105" x2="78" y2="60" stroke="#e07030" strokeWidth="1.5" strokeDasharray="4 2"/>
      {/* Angle arc */}
      <path d="M 155 108 A 28 28 0 0 0 164 118" fill="none" stroke="#c0392b" strokeWidth="2"/>
      <text x="170" y="115" fontSize="10" fill="#c0392b" fontWeight="bold">120–135°</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view</text>
    </svg>
  ),

  // ══════════════════════════════════════════════════════════════════════════
  // FOOT
  // ══════════════════════════════════════════════════════════════════════════

  'foot-plantar-fascia': (
    <svg viewBox="0 0 320 210" aria-label="Plantar fascia thickness">
      <path d="M38 118 Q80 78 162 73 Q232 68 282 98 L282 153 Q202 178 102 173 Z" fill="#f8f0e8" stroke="#aaa" strokeWidth="1"/>
      <ellipse cx="78" cy="138" rx="46" ry="30" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="78" y="141" textAnchor="middle" fontSize="9" fill="#2a5a7a">Calcaneus</text>
      <path d="M108 160 Q192 166 272 153" fill="none" stroke="#8bb8a8" strokeWidth="7" strokeLinecap="round" opacity="0.85"/>
      <text x="192" y="178" textAnchor="middle" fontSize="8" fill="#1a4a3a">Plantar fascia</text>
      <line x1="108" y1="154" x2="108" y2="166" stroke="#c0392b" strokeWidth="2"/>
      <line x1="100" y1="154" x2="116" y2="154" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="100" y1="166" x2="116" y2="166" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="120" y="160" fontSize="9" fill="#c0392b">2–4 mm</text>
      <text x="120" y="172" fontSize="8" fill="#c0392b">≥4mm = fasciitis</text>
      <text x="160" y="205" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Sagittal — calcaneal origin</text>
    </svg>
  ),

  'foot-lisfranc': (
    <svg viewBox="0 0 320 210" aria-label="Lisfranc interval measurement">
      <rect x="58" y="58" width="90" height="82" rx="6" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="103" y="103" textAnchor="middle" fontSize="9" fill="#2a5a7a">Med. cuneiform</text>
      <rect x="173" y="73" width="78" height="67" rx="6" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="212" y="110" textAnchor="middle" fontSize="9" fill="#2a5a7a">2nd Met base</text>
      <line x1="148" y1="103" x2="173" y2="103" stroke="#c0392b" strokeWidth="2.5"/>
      <line x1="148" y1="95" x2="148" y2="111" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="173" y1="95" x2="173" y2="111" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="160" y="130" textAnchor="middle" fontSize="9" fill="#c0392b" fontWeight="bold">Lisfranc gap</text>
      <text x="160" y="142" textAnchor="middle" fontSize="9" fill="#c0392b">&lt;2mm normal</text>
      <line x1="148" y1="103" x2="173" y2="106" stroke="#2d7a5a" strokeWidth="3" opacity="0.7"/>
      <text x="160" y="78" textAnchor="middle" fontSize="8" fill="#2d7a5a">Lisfranc lig.</text>
      <text x="160" y="200" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal / axial view</text>
    </svg>
  ),

  'foot-peroneal': (
    <svg viewBox="0 0 320 230" aria-label="Peroneal tendon subluxation">
      {/* Two axial images: normal vs subluxed */}
      <rect x="18" y="28" width="130" height="155" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5"/>
      <text x="83" y="48" textAnchor="middle" fontSize="9" fill="#555" fontWeight="bold">Normal</text>
      {/* Fibula */}
      <ellipse cx="83" cy="115" rx="38" ry="48" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="83" y="118" textAnchor="middle" fontSize="8" fill="#2a5a7a">Fibula</text>
      {/* Retrofibular groove */}
      <path d="M55 78 Q83 68 111 78" fill="none" stroke="#4a7fa5" strokeWidth="2"/>
      {/* Peroneus brevis (inner) */}
      <circle cx="72" cy="72" r="8" fill="#8bb8a8" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="72" y="75" textAnchor="middle" fontSize="6" fill="white">PB</text>
      {/* Peroneus longus (outer) */}
      <circle cx="92" cy="70" r="8" fill="#6ba88a" stroke="#2d7a5a" strokeWidth="1.5"/>
      <text x="92" y="73" textAnchor="middle" fontSize="6" fill="white">PL</text>
      <text x="83" y="170" textAnchor="middle" fontSize="9" fill="#16a34a">In groove ✓</text>

      {/* Subluxed */}
      <rect x="172" y="28" width="130" height="155" rx="8" fill="#fff5f5" stroke="#fca5a5" strokeWidth="1.5"/>
      <text x="237" y="48" textAnchor="middle" fontSize="9" fill="#555" fontWeight="bold">Subluxed</text>
      <ellipse cx="237" cy="115" rx="38" ry="48" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="237" y="118" textAnchor="middle" fontSize="8" fill="#2a5a7a">Fibula</text>
      <path d="M209 78 Q237 68 265 78" fill="none" stroke="#4a7fa5" strokeWidth="2"/>
      {/* Subluxed PB — displaced anteriorly */}
      <circle cx="210" cy="66" r="8" fill="#fca5a5" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="210" y="69" textAnchor="middle" fontSize="6" fill="#c0392b">PB</text>
      <circle cx="228" cy="64" r="8" fill="#f87171" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="228" y="67" textAnchor="middle" fontSize="6" fill="#c0392b">PL</text>
      <text x="237" y="170" textAnchor="middle" fontSize="9" fill="#c0392b">Anterior ✗</text>
      <text x="160" y="222" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Axial view — retromalleolar</text>
    </svg>
  ),

  'foot-spring': (
    <svg viewBox="0 0 320 220" aria-label="Spring ligament thickness">
      {/* Calcaneus */}
      <ellipse cx="85" cy="140" rx="60" ry="35" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="85" y="143" textAnchor="middle" fontSize="9" fill="#2a5a7a">Calcaneus</text>
      {/* Talus head */}
      <ellipse cx="160" cy="95" rx="38" ry="30" fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="160" y="98" textAnchor="middle" fontSize="9" fill="#2a5a7a">Talar head</text>
      {/* Navicular */}
      <ellipse cx="245" cy="105" rx="32" ry="25" fill="#c8d8e8" stroke="#4a7fa5" strokeWidth="1.5"/>
      <text x="245" y="108" textAnchor="middle" fontSize="9" fill="#2a5a7a">Navicular</text>
      {/* Spring ligament */}
      <path d="M120 155 Q160 120 213 112" fill="none" stroke="#2d7a5a" strokeWidth="7" strokeLinecap="round" opacity="0.85"/>
      <text x="168" y="148" textAnchor="middle" fontSize="8" fill="#1a4a3a">Spring lig.</text>
      {/* Thickness measurement */}
      <line x1="148" y1="130" x2="148" y2="142" stroke="#c0392b" strokeWidth="2"/>
      <line x1="140" y1="130" x2="156" y2="130" stroke="#c0392b" strokeWidth="1.5"/>
      <line x1="140" y1="142" x2="156" y2="142" stroke="#c0392b" strokeWidth="1.5"/>
      <text x="162" y="139" fontSize="9" fill="#c0392b">3–5 mm</text>
      <text x="160" y="212" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal / axial view</text>
    </svg>
  ),

  'foot-talar-coverage': (
    <svg viewBox="0 0 320 220" aria-label="Talar head coverage ratio">
      {/* Two coronal sections: normal vs flatfoot */}
      {[
        {x:28, label:'Normal', cov:0.82, color:'#bbf7d0', border:'#16a34a'},
        {x:178, label:'Flatfoot', cov:0.52, color:'#fca5a5', border:'#dc2626'},
      ].map(({x,label,cov,border,color},i) => {
        const tw = 110; // total talar head width
        const covW = tw * cov;
        return (
          <g key={i}>
            <rect x={x} y={20} width={130} height={175} rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2"/>
            <text x={x+65} y={40} textAnchor="middle" fontSize="9" fill="#333" fontWeight="bold">{label}</text>
            {/* Talar head */}
            <ellipse cx={x+65} cy={105} rx={55} ry={40} fill="#d8e8f8" stroke="#4a7fa5" strokeWidth="1.5"/>
            <text x={x+65} y={108} textAnchor="middle" fontSize="8" fill="#2a5a7a">Talar head</text>
            {/* Navicular covering portion */}
            <ellipse cx={x+65-(55*(1-cov)/2)} cy={92} rx={55*cov/2} ry={22} fill={color} stroke={border} strokeWidth="1.5" opacity="0.7"/>
            <text x={x+65} y={150} textAnchor="middle" fontSize="9" fill={border} fontWeight="bold">{Math.round(cov*100)}% covered</text>
            <text x={x+65} y={162} textAnchor="middle" fontSize="8" fill="#555">{cov > 0.65 ? '✓ Normal' : '✗ Flatfoot'}</text>
          </g>
        );
      })}
      <text x="160" y="210" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view — navicular coverage</text>
    </svg>
  ),

  // Sanders calcaneal fracture classification
  'ankle-sanders': (
    <svg viewBox="0 0 320 240" style={{width:'100%'}} aria-label="Sanders calcaneal fracture classification">
      {/* Four calcaneal cross-sections showing Types I-IV */}
      {[
        {label:'Type I', x:18, lines:[], color:'#bbf7d0', border:'#16a34a'},
        {label:'Type II', x:95, lines:[0.5], color:'#fde68a', border:'#d97706'},
        {label:'Type III', x:172, lines:[0.3,0.7], color:'#fdba74', border:'#ea580c'},
        {label:'Type IV', x:245, lines:[0.25,0.5,0.75], color:'#fca5a5', border:'#dc2626'},
      ].map(({label,x,lines,color,border},i) => (
        <g key={i}>
          {/* Calcaneus outline */}
          <path d={`M${x+5} 55 Q${x+35} 35 ${x+65} 55 L${x+68} 120 Q${x+35} 135 ${x+2} 120 Z`}
            fill={color} stroke={border} strokeWidth="2"/>
          {/* Posterior facet */}
          <path d={`M${x+10} 58 Q${x+35} 45 ${x+60} 58`} fill="none" stroke={border} strokeWidth="2.5"/>
          {/* Fracture lines across posterior facet */}
          {lines.map((p, li) => {
            const fx = x + 10 + p * 50;
            return <line key={li} x1={fx} y1={42} x2={fx+2} y2={130} stroke="#991b1b" strokeWidth="2.5" strokeDasharray="3 2"/>;
          })}
          <text x={x+35} y={155} textAnchor="middle" fontSize="10" fill="#333" fontWeight="700">{label}</text>
          <text x={x+35} y={167} textAnchor="middle" fontSize="8" fill="#555">{lines.length===0?'Non-disp':lines.length===1?'2-part':lines.length===2?'3-part':'Commin.'}</text>
        </g>
      ))}
      <text x="35" y="195" fontSize="9" fill="#888">Lines through posterior facet = fracture lines</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal CT — posterior facet view</text>
    </svg>
  ),

  // Young-Burgess pelvic ring fracture classification
  'pelvis-young-burgess': (
    <svg viewBox="0 0 320 260" style={{width:'100%'}} aria-label="Young-Burgess pelvic fracture classification">
      {[
        {label:'LC', x:20, y:30, desc:'Lateral
Compression', color:'#fde68a', border:'#d97706', arrow:'→'},
        {label:'APC', x:175, y:30, desc:'Ant-Post
Compression', color:'#fca5a5', border:'#dc2626', arrow:'↕'},
        {label:'VS', x:20, y:155, desc:'Vertical
Shear', color:'#c4b5fd', border:'#7c3aed', arrow:'↑'},
        {label:'CM', x:175, y:155, desc:'Combined
Mechanism', color:'#bbf7d0', border:'#16a34a', arrow:'✕'},
      ].map(({label,x,y,desc,color,border,arrow}) => (
        <g key={label}>
          <rect x={x} y={y} width={125} height={100} rx={8} fill={color} stroke={border} strokeWidth="2" opacity="0.8"/>
          {/* Simple pelvis outline */}
          <path d={`M${x+15} ${y+40} Q${x+62} ${y+20} ${x+110} ${y+40} L${x+110} ${y+75} Q${x+62} ${y+88} ${x+15} ${y+75} Z`}
            fill="rgba(255,255,255,0.5)" stroke={border} strokeWidth="1.5"/>
          {/* SI joints */}
          <circle cx={x+28} cy={y+55} r={5} fill={border} opacity="0.7"/>
          <circle cx={x+97} cy={y+55} r={5} fill={border} opacity="0.7"/>
          {/* Pubic symphysis */}
          <line x1={x+52} y1={y+70} x2={x+73} y2={y+70} stroke={border} strokeWidth="3"/>
          {/* Force arrow */}
          <text x={x+62} y={y+18} textAnchor="middle" fontSize="16" fill={border}>{arrow}</text>
          <text x={x+62} y={y+105} textAnchor="middle" fontSize="10" fill="#333" fontWeight="700">{label}</text>
          <text x={x+62} y={y+116} textAnchor="middle" fontSize="8" fill="#555">{desc.split('
')[0]}</text>
          <text x={x+62} y={y+126} textAnchor="middle" fontSize="8" fill="#555">{desc.split('
')[1]}</text>
        </g>
      ))}
      <text x="160" y="250" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Young-Burgess — injury mechanism types</text>
    </svg>
  ),

  // Denis sacral fracture zones
  'pelvis-denis': (
    <svg viewBox="0 0 320 240" style={{width:'100%'}} aria-label="Denis sacral fracture zones">
      {/* Sacrum outline */}
      <path d="M90 30 Q160 15 230 30 L240 180 Q160 200 80 180 Z" fill="#e2e8f0" stroke="#4a7fa5" strokeWidth="2"/>
      <text x="160" y="105" textAnchor="middle" fontSize="11" fill="#2a5a7a">Sacrum</text>
      {/* Zone I — Ala (lateral) */}
      <path d="M90 30 Q115 22 130 30 L135 180 Q105 192 80 180 Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2" opacity="0.8"/>
      <text x="105" y="108" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="700">Zone I</text>
      <text x="105" y="120" textAnchor="middle" fontSize="8" fill="#166534">Ala</text>
      <text x="105" y="130" textAnchor="middle" fontSize="7" fill="#166534">6% neuro</text>
      {/* Zone II — Foraminal */}
      <path d="M130 30 Q160 22 190 30 L192 180 Q160 192 135 180 Z" fill="#fde68a" stroke="#d97706" strokeWidth="2" opacity="0.8"/>
      <text x="162" y="108" textAnchor="middle" fontSize="9" fill="#92400e" fontWeight="700">Zone II</text>
      <text x="162" y="120" textAnchor="middle" fontSize="8" fill="#92400e">Foraminal</text>
      <text x="162" y="130" textAnchor="middle" fontSize="7" fill="#92400e">28% neuro</text>
      {/* Sacral foramina */}
      {[55,85,115,145].map((yo, i) => (
        <ellipse key={i} cx={162} cy={yo} rx={8} ry={5} fill="#d97706" opacity="0.5"/>
      ))}
      {/* Zone III — Central */}
      <path d="M190 30 Q215 22 230 30 L240 180 Q215 192 192 180 Z" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" opacity="0.8"/>
      <text x="215" y="108" textAnchor="middle" fontSize="9" fill="#991b1b" fontWeight="700">Zone III</text>
      <text x="215" y="120" textAnchor="middle" fontSize="8" fill="#991b1b">Central</text>
      <text x="215" y="130" textAnchor="middle" fontSize="7" fill="#991b1b">57% neuro</text>
      {/* Legend */}
      <text x="160" y="215" textAnchor="middle" fontSize="9" fill="#555">Neurologic risk increases medially (I→III)</text>
      <text x="160" y="232" textAnchor="middle" fontSize="10" fill="#555" fontStyle="italic">Coronal view — Denis zones</text>
    </svg>
  ),

};

export { JOINT_DATA, DIAGRAM_SVGS };
