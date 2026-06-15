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
          { label: "Staubli HU, Jakob RP. Anterior knee instability with intact cruciate ligaments. KSSTA 1990", url: "https://scholar.google.com/scholar?q=Staubli%20Jakob%20anterior%20knee%20instability%20intact%20cruciate%20ligaments%201990" },
          { label: "Dejour H et al. Factors of patellar instability: anatomic radiographic study. KSSTA 1994", url: "https://scholar.google.com/scholar?q=Dejour%20Walch%20Nove-Josserand%20factors%20patellar%20instability%201994" },
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
          { label: "Hudek R et al. Novel measurement technique of tibial slope on conventional MRI. Clin Orthop 2009", url: "https://scholar.google.com/scholar?q=Hudek%20tibial%20slope%20MRI%20measurement%20technique%202009" },
          { label: "Giffin JR et al. Effects of increasing tibial slope on ACL in situ forces. Am J Sports Med 2004", url: "https://scholar.google.com/scholar?q=Giffin%20tibial%20slope%20ACL%20in%20situ%20forces%20knee%202004" },
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
          { label: "Dejour H et al. Factors of patellar instability: an anatomic radiographic study. KSSTA 1994", url: "https://scholar.google.com/scholar?q=Dejour%20Walch%20Nove-Josserand%20Guier%20factors%20patellar%20instability%20anatomic%20radiographic%201994" },
          { label: "Beaconsfield T et al. The sulcus angle and malalignment of the extensor mechanism. JBJS Br 1994", url: "https://scholar.google.com/scholar?q=Beaconsfield%20sulcus%20angle%20malalignment%20extensor%20mechanism%20patella%201994" },
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
          { label: "Dejour H et al. Factors of patellar instability: anatomic radiographic study. KSSTA 1994", url: "https://scholar.google.com/scholar?q=Dejour%20Walch%20Nove-Josserand%20factors%20patellar%20instability%201994%20knee%20surgery%20sports%20traumatology" },
          { label: "Dickschas J et al. Tibial tubercle osteotomies: the TT-TG distance. Knee Surg Sports Traumatol Arthrosc 2012", url: "https://scholar.google.com/scholar?q=Dickschas%20tibial%20tubercle%20osteotomy%20TT-TG%20distance%20patellofemoral%20instability%202012" },
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
          { label: "Insall J, Salvati E. Patella position in the normal knee joint. Radiology 1971", url: "https://scholar.google.com/scholar?q=Insall%20Salvati%20patella%20position%20normal%20knee%20joint%20Radiology%201971" },
          { label: "Caton J et al. A propos de 27 cas de rotule basse. Rev Chir Orthop 1982 (Caton-Deschamps index)", url: "https://scholar.google.com/scholar?q=Caton%20Deschamps%20patella%20alta%20baja%20index%20measurement%20lateral%20radiograph%201982" },
        ],
        diagram: 'knee-insall-salvati',
      },
      {
        id: 'modified-outerbridge',
        label: 'Modified Outerbridge Classification (Cartilage)',
        plane: 'All planes',
        description: 'Grades articular cartilage damage on MRI. Applied to medial, lateral, and patellofemoral compartments independently. When 2+ compartments involved, impression should summarize as osteoarthrosis.',
        isGradingScale: true,
        normalValues: [
          { label: 'Grade 0', value: 'Normal — homogeneous signal, intact surface' },
          { label: 'Grade 1', value: 'Softening/swelling — intact surface, internal signal change' },
          { label: 'Grade 2', value: 'Fissuring < 50% cartilage depth, partial thickness' },
          { label: 'Grade 3', value: 'Deep fissuring > 50% depth, subchondral bone intact' },
          { label: 'Grade 4', value: 'Full-thickness loss, subchondral bone exposed' },
          { label: 'Impression rule', value: '2+ compartments involved → osteoarthrosis, most notable in worst compartment' },
        ],
        citations: [
          { label: "Outerbridge RE. The etiology of chondromalacia patellae. J Bone Joint Surg Br 1961", url: "https://scholar.google.com/scholar?q=Outerbridge+etiology+chondromalacia+patellae+1961" },
          { label: "Carey JL et al. Modified Outerbridge classification for MRI cartilage grading. Am J Sports Med 2010", url: "https://scholar.google.com/scholar?q=modified+outerbridge+classification+MRI+cartilage+grading+knee" },
        ],
        diagram: 'knee-insall-salvati',
      },
      {
        id: 'isakos-meniscus',
        label: 'ISAKOS Meniscus Tear Classification',
        plane: 'All planes',
        description: 'Comprehensive meniscus tear classification covering tear type, zone, and stability. Applied to both medial and lateral meniscus.',
        isGradingScale: true,
        normalValues: [
          { label: 'Vertical-longitudinal', value: 'Parallel to circumference; bucket-handle = displaced variant' },
          { label: 'Horizontal', value: 'Parallel to tibial plateau; cleavage/degenerative' },
          { label: 'Radial', value: 'Perpendicular to circumference; disrupts hoop stress' },
          { label: 'Oblique/flap', value: 'Oblique with mobile flap component' },
          { label: 'Complex', value: 'Multiple planes; degenerative' },
          { label: 'Root tear', value: 'Radial tear at posterior horn root; functionally equivalent to total meniscectomy' },
          { label: 'Red-red zone', value: '0–3 mm from capsule; vascular; good healing potential' },
          { label: 'Red-white zone', value: '3–5 mm; partial vascularity; variable healing' },
          { label: 'White-white zone', value: '>5 mm inner; avascular; poor healing' },
        ],
        citations: [
          { label: "Anderson AF et al. ISAKOS meniscal tear classification. Arthroscopy 1993", url: "https://scholar.google.com/scholar?q=ISAKOS+meniscal+tear+classification+Anderson+1993" },
          { label: "Abrams GD et al. ISAKOS classification reliability for meniscal tears. Am J Sports Med 2013", url: "https://scholar.google.com/scholar?q=ISAKOS+meniscus+classification+reliability+MRI+2013" },
        ],
        diagram: 'knee-insall-salvati',
      },
      {
        id: 'ligament-grading',
        label: 'Universal Ligament Tear Grading (ACL / PCL / MCL / LCL)',
        plane: 'All planes',
        description: 'Universal MRI grading applied to all knee ligaments: ACL, PCL, MCL complex, LCL complex.',
        isGradingScale: true,
        normalValues: [
          { label: 'Grade 1', value: 'Intact fibers with periligamentous edema/hemorrhage; no instability' },
          { label: 'Grade 2', value: 'Partial tear — < 50% fiber disruption; partial continuity maintained' },
          { label: 'Grade 3', value: 'Complete tear — full discontinuity; possible fiber retraction' },
          { label: 'ACL note', value: 'Grade 3: assess tibial spine, Segond fracture, pivot shift' },
          { label: 'MCL note', value: 'Grade 3: assess Pellegrini-Stieda, posteromedial corner' },
        ],
        citations: [
          { label: "Stoller DW. MRI in Orthopaedics and Sports Medicine. 3rd ed. Lippincott Williams & Wilkins 2007", url: "https://scholar.google.com/scholar?q=Stoller+MRI+orthopaedics+sports+medicine+ligament+grading" },
          { label: "Gentili A et al. Ligament and tendon injuries: MRI grading. Radiol Clin North Am 1997", url: "https://scholar.google.com/scholar?q=Gentili+ligament+tendon+MRI+grading+radiology+1997" },
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
          { label: "Moor BK et al. Critical shoulder angle and rotator cuff tears / glenohumeral OA. Bone Joint J 2013", url: "https://scholar.google.com/scholar?q=Moor%20Bouaicha%20Rothenfluh%20critical%20shoulder%20angle%20rotator%20cuff%20osteoarthritis%202013" },
          { label: "Gerber C et al. Supraspinatus tendon load is dependent on the critical shoulder angle. J Orthop Res 2014", url: "https://scholar.google.com/scholar?q=Gerber%20supraspinatus%20tendon%20load%20critical%20shoulder%20angle%20biomechanical%202014" },
        ],
        diagram: 'shoulder-csa',
      },
      {
        id: 'goutallier',
        label: 'Goutallier Classification (Muscle Belly Fatty Infiltration)',
        isGradingScale: true,
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
          { label: "Goutallier D et al. Fatty muscle degeneration in cuff ruptures. Clin Orthop Relat Res 1994", url: "https://scholar.google.com/scholar?q=Goutallier%20Postel%20Bernageau%20fatty%20muscle%20degeneration%20cuff%20ruptures%201994" },
          { label: "Fuchs B et al. Fatty degeneration of rotator cuff: CT versus MRI. J Shoulder Elbow Surg 2000", url: "https://scholar.google.com/scholar?q=Fuchs%20Weishaupt%20Zanetti%20fatty%20degeneration%20rotator%20cuff%20CT%20MRI%202000" },
        ],
        diagram: 'shoulder-goutallier',
      },
      {
        id: 'patte',
        label: 'Patte Classification (Cuff Retraction)',
        isGradingScale: true,
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
          { label: "Patte D. Classification of rotator cuff lesions. Clin Orthop Relat Res 1990", url: "https://scholar.google.com/scholar?q=Patte%20classification%20rotator%20cuff%20lesions%20clinical%20orthopaedics%201990" },
          { label: "Thomazeau H et al. Atrophy of the supraspinatus belly: assessment by MRI. KSSTA 1996", url: "https://scholar.google.com/scholar?q=Thomazeau%20atrophy%20supraspinatus%20belly%20assessment%20MRI%201996" },
        ],
        diagram: 'shoulder-patte',
      },
      {
        id: 'stump-length',
        label: 'Tendon Stump Length (Tendon Quality)',
        isGradingScale: true,
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
        isGradingScale: true,
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
          { label: "Walch G et al. Morphologic study of the glenoid in primary glenohumeral osteoarthritis. J Arthroplasty 1999", url: "https://scholar.google.com/scholar?q=Walch%20Badet%20Boulahia%20morphologic%20study%20glenoid%20primary%20glenohumeral%20osteoarthritis%201999" },
          { label: "Bercik MJ et al. A modification to the Walch classification using 3D imaging. J Shoulder Elbow Surg 2016", url: "https://scholar.google.com/scholar?q=Bercik%20modification%20Walch%20classification%20glenohumeral%20osteoarthritis%203D%20imaging%202016" },
          { label: "Goutallier D et al. Influence of cuff muscle fatty degeneration on outcomes after repair. J Shoulder Elbow Surg 2003", url: "https://scholar.google.com/scholar?q=Goutallier%20influence%20cuff%20muscle%20fatty%20degeneration%20outcomes%20repair%202003" },
          { label: "Iannotti JP et al. Glenoid morphology as a predictor of surgical complications. J Bone Joint Surg Am 2003", url: "https://scholar.google.com/scholar?q=Iannotti%20glenoid%20morphology%20predictor%20surgical%20complications%20shoulder%20arthroplasty%202003" },
        ],
        diagram: 'shoulder-walch',
      },
      {
        id: 'seebauer',
        label: 'Seebauer Classification (Cuff Arthropathy)',
        isGradingScale: true,
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
          { label: "Seebauer L et al. Classification of cuff tear arthropathy. Orthopade 2001", url: "https://scholar.google.com/scholar?q=Seebauer%20cuff%20tear%20arthropathy%20classification%20Orthopade%202001" },
          { label: "Hamada K et al. Roentgenographic findings in massive rotator cuff tears. Clin Orthop 1990", url: "https://scholar.google.com/scholar?q=Hamada%20roentgenographic%20findings%20massive%20rotator%20cuff%20tears%20long-term%201990" },
        ],
        diagram: 'shoulder-seebauer',
      },
      {
        id: 'glenoid-track',
        label: 'Glenoid Track (Engaging Hill-Sachs Lesion)',
        isGradingScale: true,
        plane: 'Axial + coronal',
        description: 'Determines if a Hill-Sachs lesion engages the anterior glenoid during shoulder motion. Guides decision for Latarjet vs Bankart repair.',
        normalValues: [
          { label: 'Glenoid track width', value: '(Glenoid width × 0.83) − bone loss' },
          { label: 'On-track', value: 'Hill-Sachs interval > glenoid track' },
          { label: 'Off-track (engaging)', value: 'Hill-Sachs interval < glenoid track' },
          { label: 'Critical bone loss', value: '> 25% glenoid = Latarjet indicated' },
        ],
        citations: [
          { label: "Di Giacomo G et al. Evolving concept of bipolar bone loss and the Hill-Sachs lesion. Arthroscopy 2014", url: "https://scholar.google.com/scholar?q=Di%20Giacomo%20evolving%20concept%20bipolar%20bone%20loss%20Hill-Sachs%20glenoid%20track%202014" },
          { label: "Yamamoto N et al. Relationship between Hill-Sachs lesion and glenoid defect. Arthroscopy 2008", url: "https://scholar.google.com/scholar?q=Yamamoto%20Hill-Sachs%20lesion%20glenoid%20defect%20track%20engagement%20instability%202008" },
        ],
        diagram: 'shoulder-glenoid-track',
      },
      {
        id: 'habermeyer',
        label: 'Habermeyer Classification (Biceps Pulley Instability)',
        isGradingScale: true,
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
          { label: "Habermeyer P et al. Anterosuperior impingement of the shoulder as a result of pulley lesions. J Shoulder Elbow Surg 2004", url: "https://scholar.google.com/scholar?q=Habermeyer%20anterosuperior%20impingement%20shoulder%20pulley%20lesions%202004" },
          { label: "Lafosse L et al. Structural integrity and clinical outcomes after arthroscopic subscapularis repair. J Bone Joint Surg Am 2007", url: "https://scholar.google.com/scholar?q=Lafosse%20structural%20integrity%20clinical%20outcomes%20arthroscopic%20subscapularis%20repair%202007" },
        ],
        diagram: 'shoulder-habermeyer',
      },
      {
        id: 'modified-outerbridge-shoulder',
        label: 'Modified Outerbridge Classification (Cartilage Wear)',
        plane: 'All planes',
        description: 'Grades glenohumeral articular cartilage damage on MRI. Applied independently to humeral head and glenoid articular surfaces.',
        isGradingScale: true,
        normalValues: [
          { label: 'Grade 0', value: 'Normal — homogeneous signal, intact surface' },
          { label: 'Grade 1', value: 'Softening/swelling — intact surface, internal signal change' },
          { label: 'Grade 2', value: 'Fissuring < 50% cartilage depth, partial thickness' },
          { label: 'Grade 3', value: 'Deep fissuring > 50% depth, subchondral bone intact' },
          { label: 'Grade 4', value: 'Full-thickness loss, subchondral bone exposed' },
          { label: 'Apply to', value: 'Humeral head articular surface and glenoid articular surface separately' },
        ],
        citations: [
          { label: "Outerbridge RE. The etiology of chondromalacia patellae. J Bone Joint Surg Br 1961", url: "https://scholar.google.com/scholar?q=Outerbridge+etiology+chondromalacia+patellae+1961" },
          { label: "Yeh LR et al. Shoulder MRI arthrography: cartilage evaluation. AJR 2005", url: "https://scholar.google.com/scholar?q=shoulder+glenohumeral+cartilage+MRI+grading+Outerbridge" },
        ],
        diagram: 'shoulder-csa',
      },
      {
        id: 'cruess-humeral-avn',
        label: 'Cruess Classification (Humeral Head AVN)',
        isGradingScale: true,
        plane: 'Coronal',
        description: 'Cruess (modified Ficat) staging of avascular necrosis of the humeral head on MRI. Based on morphologic changes from early signal abnormality to collapse and secondary glenohumeral arthritis.',
        normalValues: [
          { label: 'Stage I', value: 'Normal radiograph/morphology; MRI: abnormal marrow signal only (low T1, high STIR)' },
          { label: 'Stage II', value: 'Sclerosis/cysts/osteopenia on CT/X-ray; MRI: "double line sign" — inner high T2 + outer low T1/T2 rim; no collapse' },
          { label: 'Stage III', value: 'Subchondral fracture ("crescent sign") without humeral head collapse' },
          { label: 'Stage IV', value: 'Flattening/collapse of the humeral head; glenohumeral joint space preserved' },
          { label: 'Stage V', value: 'Collapse + secondary glenohumeral joint space narrowing / osteoarthritis' },
        ],
        citations: [
          { label: 'Cruess RL. — Steroid-induced osteonecrosis. J R Coll Surg Edinb 1981;26(2):69-77.', url: 'https://scholar.google.com/scholar?q=Cruess%20steroid-induced%20osteonecrosis%20humeral%20head%20classification%201981' },
        ],
        diagram: null,
      },
      {
        id: 'ficat-arlet-avn',
        label: 'Ficat-Arlet Classification (AVN Staging)',
        isGradingScale: true,
        plane: 'Coronal / Axial',
        description: 'Original Ficat-Arlet staging of osteonecrosis, applicable to the humeral head as well as the femoral head. Distinguishes Stage 0 (silent, normal imaging) from Stage I (abnormal MRI only) — MRI is the only modality that detects disease at these earliest, potentially reversible stages.',
        normalValues: [
          { label: 'Stage 0', value: 'Pre-clinical — normal radiograph AND normal MRI (diagnosis only by contralateral biopsy/risk factors)' },
          { label: 'Stage I', value: 'Normal radiograph; MRI abnormal — marrow edema pattern, no double-line sign yet' },
          { label: 'Stage II', value: 'Radiograph shows sclerosis/cysts (mottled appearance); no subchondral collapse; MRI shows classic double-line sign' },
          { label: 'Stage III', value: 'Subchondral lucency/"crescent sign" — early subchondral fracture/collapse; head contour still round' },
          { label: 'Stage IV', value: 'Flattening of articular surface with joint space narrowing and secondary degenerative changes' },
        ],
        citations: [
          { label: 'Ficat RP. — Idiopathic bone necrosis of the femoral head: early diagnosis and treatment. J Bone Joint Surg Br 1985;67(1):3-9.', url: 'https://scholar.google.com/scholar?q=Ficat+idiopathic+bone+necrosis+femoral+head+early+diagnosis+treatment+1985' },
        ],
        diagram: null,
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
          { label: "Notzli HP et al. Contour of the femoral head-neck junction as predictor of anterior impingement. J Bone Joint Surg Br 2002", url: "https://scholar.google.com/scholar?q=Notzli%20Wyss%20Stoecklin%20contour%20femoral%20head%20neck%20junction%20anterior%20impingement%202002" },
          { label: "Clohisy JC et al. A systematic approach to the plain radiographic evaluation of the hip. J Bone Joint Surg Am 2008", url: "https://scholar.google.com/scholar?q=Clohisy%20systematic%20approach%20plain%20radiographic%20evaluation%20hip%202008" },
        ],
        diagram: null,
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
          { label: "Tannast M et al. Radiographic analysis of femoroacetabular impingement. J Bone Joint Surg Am 2007", url: "https://scholar.google.com/scholar?q=Tannast%20radiographic%20analysis%20femoroacetabular%20impingement%202007" },
          { label: "Wiberg G. Studies on dysplastic acetabula and congenital subluxation. Acta Chir Scand 1939 (supplement)", url: "https://scholar.google.com/scholar?q=Wiberg%20studies%20dysplastic%20acetabula%20congenital%20subluxation%20center%20edge%20angle%201939" },
        ],
        diagram: null,
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
          { label: "Murphy SB et al. Measurement of femoral anteversion by MRI. J Pediatr Orthop 1987", url: "https://scholar.google.com/scholar?q=Murphy%20measurement%20femoral%20anteversion%20MRI%201987" },
          { label: "Tönnis D, Heinecke A. Diminished femoral anteversion and functional changes in knee joint. J Pediatr Orthop 1991", url: "https://scholar.google.com/scholar?q=Tonnis%20Heinecke%20diminished%20femoral%20anteversion%20functional%20changes%20knee%20joint%201991" },
        ],
        diagram: null,
      },
      {
        id: 'ifi-qfs',
        label: 'IFI + QFS (Ischiofemoral Space)',
        plane: 'Axial / coronal',
        description: 'Ischiofemoral interval (IFI): narrowest space between ischium and lesser trochanter. Quadratus femoris space (QFS): space available for quadratus femoris muscle.',
        normalValues: [
          { label: 'IFI / QFS normal', value: 'IFI > 15 mm  |  QFS > 10 mm' },
          { label: 'IFI normal', value: '> 15 mm' },
          { label: 'IFI narrow', value: '< 10 mm' },
          { label: 'QFS normal', value: '> 10 mm' },
          { label: 'QFS narrow', value: '< 10 mm' },
          { label: 'IFI borderline', value: '10–15 mm' },
        ],
        citations: [
          { label: "Singer AD et al. Ischiofemoral impingement syndrome: a meta-analysis. Skeletal Radiol 2015", url: "https://scholar.google.com/scholar?q=Singer%20Subhawong%20Jose%20Tresley%20Clifford%20ischiofemoral%20impingement%20syndrome%20meta-analysis%20Skeletal%20Radiology%202015" },
          { label: "Torriani M et al. Ischiofemoral impingement syndrome on MRI. AJR 2009", url: "https://scholar.google.com/scholar?q=Torriani%20ischiofemoral%20impingement%20syndrome%20MRI%20quadratus%20femoris%202009" },
        ],
        diagram: null,
      },
      {
        id: 'tonnis',
        label: 'Tönnis Grading (Hip OA)',
        isGradingScale: true,
        plane: 'Coronal',
        description: 'Grades hip osteoarthritis severity. Guides timing of surgical intervention for FAI and dysplasia.',
        normalValues: [
          { label: 'Grade 0', value: 'No OA — normal joint' },
          { label: 'Grade 1', value: 'Mild: subchondral sclerosis, slight joint space loss' },
          { label: 'Grade 2', value: 'Moderate: cysts, moderate JSL, head flattening' },
          { label: 'Grade 3', value: 'Severe: large cysts, severe JSL, head deformity' },
          { label: 'Surgical limit', value: 'Tönnis ≤ 1 for FAI/PAO surgery' },
        ],
        citations: [
          { label: "Tonnis D, Heinecke A. Acetabular and femoral anteversion: relationship with hip osteoarthritis. J Bone Joint Surg Am 1999", url: "https://scholar.google.com/scholar?q=Tonnis%20Heinecke%20acetabular%20femoral%20anteversion%20relationship%20osteoarthritis%20hip%201999" },
          { label: "Clohisy JC et al. A systematic approach to the plain radiographic evaluation of the young adult hip. J Bone Joint Surg Am 2008", url: "https://scholar.google.com/scholar?q=Clohisy%20systematic%20plain%20radiographic%20evaluation%20young%20adult%20hip%20Tonnis%202008" },
        ],
        diagram: null,
      },
      {
        id: 'ficat-arlet-femoral-avn',
        label: 'Ficat-Arlet Classification (Femoral Head AVN)',
        isGradingScale: true,
        plane: 'Coronal / Axial',
        description: 'Original 5-stage (0–IV) staging of femoral head avascular necrosis. MRI is the only modality that detects Stage 0–I disease (normal radiograph, abnormal marrow signal).',
        normalValues: [
          { label: 'Stage 0', value: 'Pre-clinical — normal radiograph AND normal MRI (diagnosis only by contralateral risk factors/biopsy)' },
          { label: 'Stage I', value: 'Normal radiograph; MRI abnormal — marrow edema pattern, no double-line sign yet' },
          { label: 'Stage II', value: 'Radiograph shows sclerosis/cysts (mottled appearance); no subchondral collapse; MRI shows classic double-line sign' },
          { label: 'Stage III', value: 'Subchondral lucency/"crescent sign" — early subchondral fracture/collapse; femoral head contour still round' },
          { label: 'Stage IV', value: 'Flattening of articular surface with joint space narrowing and secondary degenerative changes' },
        ],
        citations: [
          { label: 'Ficat RP. — Idiopathic bone necrosis of the femoral head: early diagnosis and treatment. J Bone Joint Surg Br 1985;67(1):3-9.', url: 'https://scholar.google.com/scholar?q=Ficat+idiopathic+bone+necrosis+femoral+head+early+diagnosis+treatment+1985' },
        ],
        diagram: null,
      },
      {
        id: 'arco-femoral-avn',
        label: 'ARCO Classification (Femoral Head AVN)',
        isGradingScale: true,
        plane: 'Coronal / Axial',
        description: 'Association Research Circulation Osseous (ARCO) staging of femoral head osteonecrosis. Refines Ficat-Arlet by adding quantitative extent of involvement (A/B/C subtypes) at each stage — important for predicting collapse risk and surgical planning (core decompression vs arthroplasty).',
        normalValues: [
          { label: 'Stage 0', value: 'Biopsy-proven necrosis; all imaging (radiograph, CT, bone scan, MRI) normal' },
          { label: 'Stage I', value: 'Normal radiograph; abnormal MRI/bone scan. Subtype by location (medial/central/lateral) and extent: A < 15%, B 15–30%, C > 30% of femoral head' },
          { label: 'Stage II', value: 'Radiograph shows mottled sclerosis/lysis/osteopenia without collapse or crescent sign. Same A/B/C extent subtyping' },
          { label: 'Stage III', value: 'Crescent sign and/or subchondral collapse without femoral head flattening. A/B/C by extent of collapse/depression' },
          { label: 'Stage IV', value: 'Flattening of femoral head with joint space narrowing, acetabular changes, and secondary osteoarthritis' },
          { label: 'Clinical note', value: 'Combined necrotic angle (sagittal + coronal) on MRI is the key quantitative measure for risk of collapse' },
        ],
        citations: [
          { label: 'Gardeniers JWM. — ARCO committee on terminology and staging: report on the meeting. ARCO Newsletter 1993.', url: 'https://scholar.google.com/scholar?q=ARCO+classification+staging+osteonecrosis+femoral+head+1993' },
          { label: 'Yoon BH et al. — The 2019 revised version of ARCO staging system for osteonecrosis of the femoral head. J Arthroplasty 2020.', url: 'https://scholar.google.com/scholar?q=ARCO+2019+revised+staging+system+osteonecrosis+femoral+head+2020' },
        ],
        diagram: null,
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
        diagram: null,
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
          { label: "Larsen CF et al. Scapholunate angle in 200 normal individuals. Acta Orthop Scand 1991", url: "https://scholar.google.com/scholar?q=Larsen%20scapholunate%20angle%20200%20normal%20individuals%20Acta%20Orthop%20Scand%201991" },
          { label: "Ringler MD. MRI of wrist ligaments. J Hand Surg Am 2013", url: "https://scholar.google.com/scholar?q=Ringler%20MRI%20wrist%20ligaments%20scapholunate%20diagnosis%202013" },
          { label: "Linscheid RL et al. Traumatic instability of the wrist. J Bone Joint Surg Am 1972", url: "https://scholar.google.com/scholar?q=Linscheid%20Dobyns%20Beabout%20Rogers%20traumatic%20instability%20wrist%20DISI%20VISI%201972" },
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
      {
        id: 'tfcc-palmer',
        label: 'TFCC Injury — Palmer Classification',
        isGradingScale: true,
        plane: 'Coronal PD/T2',
        description: 'Classifies triangular fibrocartilage complex (TFCC) tears as traumatic (Class 1) or degenerative (Class 2, ulnar impaction spectrum) based on location and associated findings.',
        normalValues: [
          { label: 'Class 1A', value: 'Traumatic — central perforation/tear of the articular disc, away from peripheral attachments' },
          { label: 'Class 1B', value: 'Traumatic — ulnar-sided peripheral avulsion, ± ulnar styloid fracture' },
          { label: 'Class 1C', value: 'Traumatic — distal avulsion from the ulnocarpal ligaments (lunate/triquetral attachment)' },
          { label: 'Class 1D', value: 'Traumatic — radial-sided avulsion from the sigmoid notch, ± distal radius fracture' },
          { label: 'Class 2A', value: 'Degenerative — TFCC wear/thinning, no perforation' },
          { label: 'Class 2B', value: '2A + lunate and/or ulnar chondromalacia' },
          { label: 'Class 2C', value: '2B + TFCC perforation' },
          { label: 'Class 2D', value: '2C + lunotriquetral ligament perforation' },
          { label: 'Class 2E', value: '2D + ulnocarpal arthritis' },
        ],
        citations: [
          { label: 'Palmer AK. — Triangular fibrocartilage complex lesions: a classification. J Hand Surg Am 1989;14(4):594-606.', url: 'https://scholar.google.com/scholar?q=Palmer+triangular+fibrocartilage+complex+lesions+classification+1989' },
        ],
        diagram: null,
      },
      {
        id: 'tfcc-atzei',
        label: 'TFCC Ulnar-Sided Tears — Atzei/Luchetti Classification',
        isGradingScale: true,
        plane: 'Coronal PD/T2',
        description: 'Refines Palmer Class 1B peripheral ulnar-sided TFCC tears by depth (distal vs proximal/foveal lamina) and DRUJ stability — guides arthroscopic repair strategy (debridement vs open-door vs foveal reinsertion).',
        normalValues: [
          { label: 'Class 1', value: 'Distal lamina tear only; DRUJ stable — debridement/suture of the distal layer' },
          { label: 'Class 2', value: 'Proximal (foveal) tear; DRUJ unstable — foveal reinsertion required' },
          { label: 'Class 3', value: 'Combined distal + proximal (foveal) tear; DRUJ unstable — repair of both layers' },
          { label: 'Class 4', value: 'Tear with associated radial-sided/sigmoid notch component; DRUJ unstable — complex/combined repair' },
        ],
        citations: [
          { label: 'Atzei A. — New trends in arthroscopic management of TFCC lesions. J Hand Surg Eur 2009.', url: 'https://scholar.google.com/scholar?q=Atzei+arthroscopic+management+TFCC+lesions+foveal+classification+2009' },
          { label: 'Atzei A, Luchetti R. — Foveal TFCC tear classification and treatment. Hand Clin 2011;27(3):263-272.', url: 'https://scholar.google.com/scholar?q=Atzei+Luchetti+foveal+TFCC+tear+classification+treatment+2011' },
        ],
        diagram: null,
      },
      {
        id: 'eaton-cmc-oa',
        label: 'Eaton Classification (1st CMC Joint OA)',
        isGradingScale: true,
        plane: 'Coronal / Axial',
        description: 'Staging of trapeziometacarpal (basal thumb) osteoarthritis, used to guide treatment from conservative management to arthroplasty.',
        normalValues: [
          { label: 'Stage I', value: 'Slight joint space widening (synovitis); subluxation < 1/3 of articular surface; no degenerative change' },
          { label: 'Stage II', value: 'Joint space narrowing; subchondral sclerosis; osteophytes/loose bodies < 2 mm; mild subluxation' },
          { label: 'Stage III', value: 'Marked joint space narrowing; osteophytes/loose bodies ≥ 2 mm; subchondral cysts; significant subluxation' },
          { label: 'Stage IV', value: 'Stage III changes + scaphotrapezial joint involvement (pantrapezial arthritis)' },
        ],
        citations: [
          { label: 'Eaton RG, Glickel SZ. — Trapeziometacarpal osteoarthritis: staging as a rationale for treatment. Hand Clin 1987;3(4):455-471.', url: 'https://scholar.google.com/scholar?q=Eaton+Glickel+trapeziometacarpal+osteoarthritis+staging+rationale+treatment+1987' },
        ],
        diagram: null,
      },
      {
        id: 'carpal-instability-classification',
        label: 'Carpal Instability Classification (CID/CIND/CIC/CIA)',
        isGradingScale: true,
        plane: 'Coronal + Sagittal',
        description: 'Mayo classification of carpal instability based on which ligaments are disrupted and whether malalignment occurs within or between carpal rows.',
        normalValues: [
          { label: 'CID — Dissociative', value: 'Disruption of an interosseous ligament within a carpal row (SL or LT) — produces DISI (SL tear) or VISI (LT tear) patterns' },
          { label: 'CIND — Non-Dissociative', value: 'Interosseous ligaments intact; instability between carpal rows or between carpus and radius/ulna (e.g., midcarpal instability, extrinsic ligament laxity)' },
          { label: 'CIC — Complex', value: 'Combination of dissociative and non-dissociative patterns (e.g., perilunate dislocation spectrum injuries)' },
          { label: 'CIA — Adaptive', value: 'Normal intrinsic/extrinsic ligaments with abnormal carpal alignment secondary to extrinsic deformity (e.g., malunited distal radius fracture)' },
        ],
        citations: [
          { label: 'Larsen CF et al. — Observer variability in measurements of carpal bone angles on lateral wrist radiographs. J Hand Surg Am 1991.', url: 'https://scholar.google.com/scholar?q=Larsen+carpal+instability+classification+dissociative+nondissociative+1991' },
          { label: 'Garcia-Elias M et al. — Carpal instability: classification and treatment. Hand Clin 2006.', url: 'https://scholar.google.com/scholar?q=Garcia-Elias+carpal+instability+classification+nondissociative+adaptive+2006' },
        ],
        diagram: null,
      },
      {
        id: 'geissler',
        label: 'Geissler Classification (SL/LT Ligament Tears)',
        isGradingScale: true,
        plane: 'Coronal',
        description: 'Originally an arthroscopic grading of scapholunate/lunotriquetral interosseous ligament tears; commonly referenced when correlating MRI signal and morphology with degree of instability.',
        normalValues: [
          { label: 'Grade I', value: 'Attenuation/hemorrhage of the ligament; no carpal malalignment' },
          { label: 'Grade II', value: 'Partial tear with incongruity/step-off of carpal alignment' },
          { label: 'Grade III', value: 'Complete tear with a visible gap between carpal bones' },
          { label: 'Grade IV', value: 'Complete tear with gross instability and abnormal carpal motion' },
        ],
        citations: [
          { label: 'Geissler WB et al. — Intracarpal soft-tissue lesions associated with an intra-articular fracture of the distal end of the radius. J Bone Joint Surg Am 1996.', url: 'https://scholar.google.com/scholar?q=Geissler+intracarpal+soft+tissue+lesions+scapholunate+lunotriquetral+classification+1996' },
        ],
        diagram: null,
      },
      {
        id: 'lichtman',
        label: 'Lichtman Classification (Kienböck Disease — Lunate AVN)',
        isGradingScale: true,
        plane: 'Coronal T1/T2',
        description: 'Staging of avascular necrosis of the lunate (Kienböck disease), combining radiographic and MRI findings. MRI is the only modality that detects Stage I disease.',
        normalValues: [
          { label: 'Stage I', value: 'Normal radiographs; MRI shows diffuse marrow signal change (low T1, variable T2) — detectable only by MRI' },
          { label: 'Stage II', value: 'Sclerosis of the lunate on radiographs without collapse; normal lunate shape and carpal alignment' },
          { label: 'Stage IIIA', value: 'Lunate collapse without fixed scaphoid rotation' },
          { label: 'Stage IIIB', value: 'Lunate collapse with fixed scaphoid flexion/rotation and decreased carpal height' },
          { label: 'Stage IV', value: 'Pancarpal osteoarthritis' },
        ],
        citations: [
          { label: 'Lichtman DM et al. — Kienböck disease: the role of imaging in evaluation and treatment. J Am Acad Orthop Surg 2010;18(6):352-362.', url: 'https://scholar.google.com/scholar?q=Lichtman+Kienbock+disease+imaging+evaluation+treatment+classification+2010' },
        ],
        diagram: null,
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
      {
        id: 'ocd-capitellum',
        label: 'Osteochondral Lesion of the Capitellum (OCD Staging)',
        isGradingScale: true,
        plane: 'Coronal / Sagittal T1, T2/STIR',
        description: 'MRI staging of osteochondral lesions (OCD) of the capitellum in adolescent throwers/gymnasts. Stability of the fragment — assessed by the presence of fluid undermining the fragment — is the key determinant for conservative vs surgical management.',
        normalValues: [
          { label: 'Stage I', value: 'Articular cartilage flattening/softening with intact subchondral bone; bone marrow edema only — stable' },
          { label: 'Stage II', value: 'Cartilage breach with underlying bony fragmentation; fragment remains in situ without surrounding fluid — stable' },
          { label: 'Stage III', value: 'High-signal (fluid) rim undermining the fragment on T2/STIR — unstable but non-displaced' },
          { label: 'Stage IV', value: 'Displaced osteochondral fragment / loose body within the joint — unstable' },
          { label: 'Clinical note', value: 'Stage I–II often managed conservatively (activity modification); Stage III–IV typically require surgical fixation, drilling, or fragment removal' },
        ],
        citations: [
          { label: 'Kijowski R, De Smet AA. — MRI findings of osteochondritis dissecans of the capitellum with surgical correlation. AJR 2005;185(6):1453-1459.', url: 'https://scholar.google.com/scholar?q=Kijowski+De+Smet+MRI+osteochondritis+dissecans+capitellum+surgical+correlation+2005' },
          { label: 'Itoh Y et al. — Radiographic stages of osteochondritis dissecans of the capitellum. Skeletal Radiol 2014.', url: 'https://scholar.google.com/scholar?q=Itoh+radiographic+stages+osteochondritis+dissecans+capitellum+skeletal+radiology' },
        ],
        diagram: null,
      },
      {
        id: 'ulnar-nerve-cubital-tunnel',
        label: 'Ulnar Nerve — Cubital Tunnel (Normal Measurements)',
        plane: 'Axial T2',
        description: 'Cross-sectional area (CSA) and signal of the ulnar nerve within the cubital tunnel. Enlargement and/or T2 hyperintensity relative to a proximal reference segment indicate cubital tunnel syndrome.',
        normalValues: [
          { label: 'Normal CSA', value: '< 0.08 cm² (8 mm²) at the level of the medial epicondyle' },
          { label: 'Cubital tunnel syndrome', value: 'CSA > 0.1 cm² (10 mm²), or focal enlargement ≥ 2× the proximal arm segment' },
          { label: 'Signal', value: 'Normal nerve is isointense to muscle on T2; diffuse T2 hyperintensity supports neuropathy' },
          { label: 'Dynamic subluxation', value: 'Anterior subluxation of the nerve out of the cubital tunnel with elbow flexion — assess on flexion-position imaging if available' },
          { label: 'Associated findings', value: 'Look for anconeus epitrochlearis (accessory muscle), ganglion cysts, or heterotopic bone narrowing the tunnel' },
        ],
        citations: [
          { label: 'Bordalo-Rodrigues M, Rosenberg ZS. — MR imaging of entrapment neuropathies at the elbow. Magn Reson Imaging Clin N Am 2004;12(2):247-263.', url: 'https://scholar.google.com/scholar?q=Bordalo-Rodrigues+Rosenberg+MRI+entrapment+neuropathies+elbow+ulnar+nerve+2004' },
        ],
        diagram: null,
      },
      {
        id: 'distal-biceps-tear',
        label: 'Distal Biceps Tendon Tear (Tear Classification)',
        isGradingScale: true,
        plane: 'Axial + Sagittal',
        description: 'Classification of distal biceps brachii tendon injuries at the radial tuberosity. Degree of retraction and lacertus fibrosus integrity guide surgical timing and approach.',
        normalValues: [
          { label: 'Partial tear', value: '< 50% or > 50% fiber thickness involvement; tendon remains continuous' },
          { label: 'Complete tear', value: 'Full-thickness discontinuity at the radial tuberosity footprint' },
          { label: 'Lacertus fibrosus intact', value: 'Limits proximal retraction even with complete tear ("anchor effect") — measure retraction regardless' },
          { label: 'Retraction distance', value: 'Measure from radial tuberosity to tendon stump; > 4 cm often favors two-incision/graft technique' },
          { label: 'Bicipitoradial bursitis', value: 'Fluid distending the bursa — may mimic or accompany partial tears' },
        ],
        citations: [
          { label: 'Giuffrè BM, Moss MJ. — Optimal positioning for MRI of the distal biceps brachii tendon: flexed abducted supinated view. AJR 2004;182(4):944-946.', url: 'https://scholar.google.com/scholar?q=Giuffre+Moss+MRI+distal+biceps+brachii+tendon+FABS+view+2004' },
          { label: 'Festa A et al. — Anatomical classification of distal biceps tendon ruptures. Am J Sports Med 2010.', url: 'https://scholar.google.com/scholar?q=Festa+anatomical+classification+distal+biceps+tendon+ruptures+2010' },
        ],
        diagram: null,
      },
      {
        id: 'ucl-injury-grading',
        label: 'UCL Injury Grading (Sprain Classification)',
        isGradingScale: true,
        plane: 'Coronal',
        description: 'Grading of ulnar (medial) collateral ligament injury in throwing athletes, based on fiber continuity and the "T-sign" of undersurface tearing at the sublime tubercle.',
        normalValues: [
          { label: 'Grade 1 (sprain)', value: 'Ligament thickened with intrasubstance T2 signal/edema; fibers continuous; no laxity' },
          { label: 'Grade 2 (partial tear)', value: 'Partial fiber discontinuity ± "T-sign" — fluid undermining the deep (undersurface) fibers at the ulnar (sublime tubercle) attachment' },
          { label: 'Grade 3 (complete tear)', value: 'Full-thickness discontinuity ± proximal/distal retraction; correlates with valgus instability' },
          { label: 'T-sign', value: 'Contrast/fluid extending perpendicular to the ligament along the ulnar footprint — classic for partial undersurface tears in throwers' },
          { label: 'Associated findings', value: 'Flexor-pronator strain, medial epicondyle marrow edema, ulnar nerve signal change' },
        ],
        citations: [
          { label: 'Schickendantz MS et al. — Idiopathic elbow pain in throwing athletes: MRI of the ulnar collateral ligament. Am J Sports Med 2002.', url: 'https://scholar.google.com/scholar?q=Schickendantz+MRI+ulnar+collateral+ligament+throwing+athletes+T-sign+2002' },
          { label: 'Timmerman LA et al. — Preoperative evaluation of the ulnar collateral ligament by magnetic resonance imaging and computed tomography arthrography. Am J Sports Med 1994.', url: 'https://scholar.google.com/scholar?q=Timmerman+preoperative+evaluation+ulnar+collateral+ligament+MRI+CT+arthrography+1994' },
        ],
        diagram: null,
      },
      {
        id: 'plri-pmri',
        label: 'PLRI / PMRI (Rotatory Instability)',
        isGradingScale: true,
        plane: 'Axial + Coronal',
        description: 'MRI findings of posterolateral rotatory instability (PLRI — lateral ulnar collateral ligament injury) and posteromedial rotatory instability (PMRI — varus posteromedial pattern with anteromedial coronoid facet fracture).',
        normalValues: [
          { label: 'LUCL (PLRI)', value: 'Lateral ulnar collateral ligament should be a thin, continuous band from the lateral epicondyle to the crista supinatoris of the ulna; tear/avulsion is the key MRI finding in PLRI' },
          { label: 'PLRI — radiocapitellar', value: 'Posterolateral subluxation of the radial head relative to the capitellum on axial images; associated radial head/capitellum impaction or "drop sign"' },
          { label: 'PMRI mechanism', value: 'Varus posteromedial rotatory instability — combination of anteromedial coronoid facet fracture + LCL complex injury' },
          { label: 'O\'Driscoll Type 1', value: 'Anteromedial facet fracture — tip only' },
          { label: 'O\'Driscoll Type 2', value: 'Anteromedial facet fracture — anteromedial rim, ± sublime tubercle' },
          { label: 'O\'Driscoll Type 3', value: 'Anteromedial facet fracture extends to base of coronoid, including sublime tubercle' },
        ],
        citations: [
          { label: 'O\'Driscoll SW et al. — Difficult elbow fractures: pearls and pitfalls. Instr Course Lect 2003.', url: 'https://scholar.google.com/scholar?q=ODriscoll+varus+posteromedial+rotatory+instability+coronoid+classification+2003' },
          { label: 'Sanchez-Sotelo J et al. — Posteromedial rotatory instability of the elbow. J Bone Joint Surg Am 2005.', url: 'https://scholar.google.com/scholar?q=Sanchez-Sotelo+posteromedial+rotatory+instability+elbow+2005' },
        ],
        diagram: null,
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
          { label: "Khan KM et al. Histopathology of common overuse tendon conditions. Sports Med 1999", url: "https://scholar.google.com/scholar?q=Achilles%20tendon%20MRI%20thickness%20diameter%20normal%20measurement%20AP" },
          { label: "Sarrafian SK et al. Partial and complete lacerations of the wrist ligaments. JBJS Am 1977", url: "https://scholar.google.com/scholar?q=Sarrafian%20wrist%20ligament%20lacerations%20carpal%20instability%20capitolunate%201977" },
          { label: "MacLennan AJ et al. ECU tendon instability and wrist pain. J Hand Surg Am 2008", url: "https://scholar.google.com/scholar?q=ECU%20extensor%20carpi%20ulnaris%20tendon%20instability%20subluxation%20wrist%20MRI" },
          { label: "Fleisig GS et al. Kinetics of baseball pitching: implications for elbow valgus stress. Am J Sports Med 1995", url: "https://scholar.google.com/scholar?q=elbow%20medial%20joint%20space%20valgus%20stress%20UCL%20measurement%20MRI" },
          { label: "Timmerman LA et al. Undersurface tears of the UCL: diagnosis with MRI arthrography. Am J Sports Med 1994", url: "https://scholar.google.com/scholar?q=Timmerman%20undersurface%20tears%20ulnar%20collateral%20ligament%20MRI%20arthrography%20elbow%201994" },
          { label: "Schwartz ML et al. Elbow arthrography with radiocapitellar line assessment. Radiology 1994", url: "https://scholar.google.com/scholar?q=radiocapitellar%20line%20alignment%20elbow%20MRI%20dislocation%20assessment" },
          { label: "Kooima CL et al. Elbow impingement and posterior olecranon fossa findings on MRI. Am J Sports Med 2004", url: "https://scholar.google.com/scholar?q=olecranon%20fossa%20depth%20elbow%20impingement%20posterior%20MRI%20findings" },
          { label: "Steel FL, Tomlinson JD. The carrying angle in man. J Anat 1958", url: "https://scholar.google.com/scholar?q=Steel%20Tomlinson%20carrying%20angle%20man%20elbow%20cubitus%20valgus%201958" },
          { label: "Dimmick S et al. ATFL and CFL MRI measurement. Clin Radiol 2008", url: "https://scholar.google.com/scholar?q=anterior%20talofibular%20ligament%20MRI%20measurement%20thickness%20diagnosis%20tear%20ankle%202008" },
          { label: "Yao L et al. Tibiotalar joint space narrowing and ankle osteoarthritis. Radiology 1998", url: "https://scholar.google.com/scholar?q=tibiotalar%20joint%20space%20MRI%20ankle%20osteoarthritis%20measurement%20normal" },
          { label: "Gibbon WW et al. Sonographic incidence of tendon microtears in athletes with Achilles symptoms. Br J Sports Med 1999", url: "https://scholar.google.com/scholar?q=Gibbon%20Achilles%20tendon%20microtears%20sonographic%20incidence%20athletes%20symptoms%201999" },
        ],
        diagram: 'ankle-achilles',
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
        isGradingScale: true,
        plane: 'Coronal CT (primary) / MRI',
        description: 'CT-based classification of intra-articular calcaneal fractures based on fracture lines in the posterior facet. Guides surgical vs conservative management.',
        normalValues: [
          { label: 'Type I', value: 'Non-displaced — conservative treatment' },
          { label: 'Type IIA/B/C', value: 'Two-part — ORIF indicated' },
          { label: 'Type IIIAB/AC/BC', value: 'Three-part — ORIF; worse prognosis' },
          { label: 'Type IV', value: 'Four-part comminuted — primary subtalar fusion' },
        ],
        citations: [
          { label: "Sanders R et al. Operative treatment of displaced intraarticular calcaneal fractures. J Bone Joint Surg Am 1992", url: "https://scholar.google.com/scholar?q=Sanders%20operative%20treatment%20displaced%20intraarticular%20calcaneal%20fractures%20J%20Bone%20Joint%20Surg%201992" },
          { label: "Rammelt S, Zwipp H. Calcaneus fractures: facts, controversies and recent developments. Injury 2004", url: "https://scholar.google.com/scholar?q=Rammelt%20Zwipp%20calcaneus%20fractures%20facts%20controversies%20Sanders%20classification%202004" },
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
          { label: "Modic MT et al. Degenerative disk disease: assessment with MR imaging. Radiology 1988", url: "https://scholar.google.com/scholar?q=Modic%20Steinberg%20Ross%20Masaryk%20degenerative%20disk%20disease%20vertebral%20body%20marrow%20MR%20imaging%201988" },
          { label: "Rahme R, Moussa R. Modic vertebral endplate and marrow changes: pathologic significance. AJNR 2008", url: "https://scholar.google.com/scholar?q=Rahme%20Moussa%20Modic%20vertebral%20endplate%20marrow%20changes%20pathologic%20significance%20low%20back%20pain%202008" },
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
          { label: "Fardon DF et al. Lumbar disc nomenclature version 2.0. Spine J 2014", url: "https://scholar.google.com/scholar?q=Fardon%20lumbar%20disc%20nomenclature%20version%202%20Spine%20Journal%202014" },
          { label: "Jensen MC et al. MRI of the lumbar spine in asymptomatic subjects. N Engl J Med 1994", url: "https://scholar.google.com/scholar?q=Jensen%20MRI%20lumbar%20spine%20asymptomatic%20subjects%20disc%20nomenclature%201994" },
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
          { label: "Vaccaro AR et al. AO Spine subaxial cervical spine injury classification. Global Spine J 2016", url: "https://scholar.google.com/scholar?q=Vaccaro%20AO%20Spine%20subaxial%20cervical%20injury%20classification%20system%202016" },
          { label: "Patel AA et al. The cervical facet injury nomenclature. Spine 2008", url: "https://scholar.google.com/scholar?q=Patel%20cervical%20facet%20injury%20nomenclature%20classification%20AO%20spine%202008" },
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
          { label: "Vaccaro AR et al. AO Spine thoracolumbar fracture classification system. Spine 2013", url: "https://scholar.google.com/scholar?q=Vaccaro%20AO%20Spine%20thoracolumbar%20fracture%20classification%202013" },
          { label: "Vaccaro AR et al. TLICS: a new classification for thoracolumbar injuries. Spine 2005", url: "https://scholar.google.com/scholar?q=Vaccaro%20TLICS%20thoracolumbar%20injury%20classification%20system%20Spine%202005" },
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
      {
        id: 'pfirrmann',
        label: 'Pfirrmann Disc Grading',
        plane: 'Sagittal T2',
        isGradingScale: true,
        description: 'MRI grading of intervertebral disc degeneration based on T2 signal, disc structure, NP/AF distinction, and disc height. Grade I–II normal, III–V degenerate.',
        normalValues: [
          { label: 'Grade I', value: 'Homogeneous bright white NP, normal height' },
          { label: 'Grade II', value: 'Inhomogeneous, horizontal gray band, normal height' },
          { label: 'Grade III', value: 'Gray NP, NP/AF boundary indistinct, normal or slight ↓ height' },
          { label: 'Grade IV', value: 'Dark gray/black NP, no NP/AF distinction, ↓ height' },
          { label: 'Grade V', value: 'Black collapsed disc, no disc space, ± osteophytes' },
        ],
        citations: [
          { label: "Pfirrmann CW et al. Magnetic resonance classification of lumbar intervertebral disc degeneration. Spine 2001", url: "https://scholar.google.com/scholar?q=Pfirrmann+magnetic+resonance+classification+lumbar+intervertebral+disc+degeneration+Spine+2001" },
        ],
        diagram: 'spine-pfirrmann',
      },
      {
        id: 'canal-stenosis',
        label: 'Central Canal Stenosis',
        plane: 'Axial T2 + Sagittal T2',
        isGradingScale: true,
        description: 'Grading of central spinal canal stenosis based on thecal sac compression and residual CSF signal on T2 MRI. Assessed at disc level on axial images.',
        normalValues: [
          { label: 'Normal', value: 'Round thecal sac, full CSF halo, no compression' },
          { label: 'Mild', value: 'CSF present, sac mildly deformed, > 50% CSF remaining' },
          { label: 'Moderate', value: 'CSF markedly reduced, sac flattened/triangular' },
          { label: 'Severe', value: 'No CSF signal, sac/cauda effaced, nerve roots packed' },
        ],
        citations: [
          { label: "Schizas C et al. Qualitative grading of severity of lumbar spinal stenosis based on MRI. Spine 2010", url: "https://scholar.google.com/scholar?q=Schizas+qualitative+grading+lumbar+spinal+stenosis+MRI+2010" },
          { label: "Lee GY et al. A new grading system of lumbar central canal stenosis on MRI. Skeletal Radiol 2011", url: "https://scholar.google.com/scholar?q=Lee+grading+lumbar+central+canal+stenosis+MRI+skeletal+radiology+2011" },
        ],
        diagram: 'spine-stenosis',
      },
      {
        id: 'foraminal-stenosis',
        label: 'Foraminal Stenosis',
        plane: 'Axial T2 + Sagittal T2',
        isGradingScale: true,
        description: 'Grading of neural foraminal stenosis based on residual epidural fat and nerve root deformation. Assessed on axial and sagittal T2 images.',
        normalValues: [
          { label: 'Grade 0', value: 'Normal — fat fills foramen, root freely mobile' },
          { label: 'Grade 1', value: 'Mild — fat > 25%, root not deformed' },
          { label: 'Grade 2', value: 'Moderate — fat < 25%, root deformed' },
          { label: 'Grade 3', value: 'Severe — no fat, root obliterated' },
        ],
        citations: [
          { label: "Lee S et al. Nerve root contact and foraminal stenosis grading in lumbar spine. Spine 2010", url: "https://scholar.google.com/scholar?q=foraminal+stenosis+grading+nerve+root+MRI+lumbar+spine" },
          { label: "Wildermuth S et al. Lumbar spine: quantitative and qualitative assessment of positional MR. Radiology 1998", url: "https://scholar.google.com/scholar?q=Wildermuth+lumbar+spine+positional+MRI+foraminal+stenosis+1998" },
        ],
        diagram: 'spine-foraminal',
      },
      {
        id: 'meyerding',
        label: 'Meyerding Spondylolisthesis',
        plane: 'Sagittal',
        isGradingScale: true,
        description: 'Grading of anterior vertebral slip (anterolisthesis) as a percentage of the inferior endplate width of the lower vertebra. Grade V = spondyloptosis (complete fall-off).',
        normalValues: [
          { label: 'Grade I', value: '0–25% slip — canal open' },
          { label: 'Grade II', value: '25–50% slip — mild canal kink' },
          { label: 'Grade III', value: '50–75% slip — significant canal angulation' },
          { label: 'Grade IV', value: '75–100% slip — severe canal compromise' },
          { label: 'Grade V', value: 'Spondyloptosis — L5 anterior to S1, canal obliterated' },
        ],
        citations: [
          { label: "Meyerding HW. Spondylolisthesis. Surg Gynecol Obstet 1932", url: "https://scholar.google.com/scholar?q=Meyerding+spondylolisthesis+classification+1932" },
          { label: "Wiltse LL et al. Classification of spondylolysis and spondylolisthesis. Clin Orthop 1976", url: "https://scholar.google.com/scholar?q=Wiltse+Newman+Macnab+classification+spondylolysis+spondylolisthesis+1976" },
        ],
        diagram: 'spine-meyerding',
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
        isGradingScale: true,
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
          { label: "Burgess AR et al. Pelvic ring disruptions: effective classification and treatment protocols. J Trauma 1990", url: "https://scholar.google.com/scholar?q=Burgess%20pelvic%20ring%20disruptions%20effective%20classification%20treatment%20protocols%20J%20Trauma%201990" },
        ],
        diagram: 'pelvis-young-burgess',
      },
      {
        id: 'denis',
        label: 'Denis Classification (Sacral Fractures)',
        isGradingScale: true,
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
          { label: "Denis F et al. Sacral fractures: an important problem. Clin Orthop Relat Res 1988", url: "https://scholar.google.com/scholar?q=Denis%20sacral%20fractures%20important%20problem%20clinical%20orthopaedics%201988" },
          { label: "Strange-Vognsen HH, Lebech A. Fractures of the sacrum with neurological injury. J Orthop Trauma 1991", url: "https://scholar.google.com/scholar?q=Strange-Vognsen%20Lebech%20fractures%20sacrum%20neurological%20injury%20Denis%20classification%201991" },
        ],
        singleImage: '/images/msk/denis.jpg',
      },
    ],
  },

  // ─── FOOT (5 slots) ──────────────────────────────────────────────────────
  foot: {
    label: 'Foot',
    measurements: [
      {
        id: 'turf-toe',
        label: 'Turf Toe Grading (1st MTP Plantar Plate Injury)',
        isGradingScale: true,
        plane: 'Sagittal + Axial',
        description: 'Grading of 1st metatarsophalangeal (MTP) joint plantar plate / capsuloligamentous complex injury ("turf toe"), based on degree of disruption and sesamoid involvement.',
        normalValues: [
          { label: 'Grade 0', value: 'Normal plantar plate; sprain/strain with edema only, no structural disruption' },
          { label: 'Grade 1', value: 'Attenuation/stretching of plantar plate and capsuloligamentous complex; no discrete tear' },
          { label: 'Grade 2', value: 'Partial tear of the plantar plate/capsule ± mild sesamoid diastasis or proximal migration' },
          { label: 'Grade 3', value: 'Complete plantar plate tear ± sesamoid fracture, diastasis, or retraction; collateral ligament disruption' },
          { label: 'Associated findings', value: 'Sesamoid position/diastasis, flexor hallucis brevis tendon involvement, articular cartilage injury' },
        ],
        citations: [
          { label: 'Rodeo SA et al. — Turf toe: an analysis of metatarsophalangeal joint sprains in professional football players. Am J Sports Med 1990.', url: 'https://scholar.google.com/scholar?q=Rodeo+turf+toe+metatarsophalangeal+joint+sprains+football+1990' },
          { label: 'Crain JM et al. — MRI of turf toe. Skeletal Radiol 2010.', url: 'https://scholar.google.com/scholar?q=Crain+MRI+turf+toe+plantar+plate+grading+2010' },
        ],
        diagram: null,
      },
      {
        id: 'freiberg-infraction',
        label: 'Freiberg Infraction (Smillie Classification)',
        isGradingScale: true,
        plane: 'Sagittal + Coronal',
        description: 'Smillie staging of avascular necrosis/osteochondrosis of a lesser metatarsal head (most commonly the 2nd), progressing from marrow edema to collapse and secondary degenerative joint disease.',
        normalValues: [
          { label: 'Stage I', value: 'Marrow edema/fissure fracture of the metatarsal head; subchondral bone and articular surface intact' },
          { label: 'Stage II', value: 'Resorption of subchondral bone leading to central depression of the articular surface' },
          { label: 'Stage III', value: 'Central depression progresses; peripheral articular cartilage remains, central portion collapses' },
          { label: 'Stage IV', value: 'Fracture/fragmentation of the central depressed segment with loose bodies' },
          { label: 'Stage V', value: 'Flattening/deformity of the metatarsal head with secondary degenerative arthritis' },
        ],
        citations: [
          { label: 'Smillie IS. — Freiberg\'s infraction (Köhler\'s second disease). J Bone Joint Surg Br 1957;39(1):580-585.', url: 'https://scholar.google.com/scholar?q=Smillie+Freiberg+infraction+Kohler+second+disease+classification+1957' },
        ],
        diagram: null,
      },
      {
        id: 'eichenholtz-charcot',
        label: 'Eichenholtz Classification (Charcot Neuroarthropathy)',
        isGradingScale: true,
        plane: 'Sagittal + Axial T1/T2/STIR',
        description: 'Staging of Charcot neuroarthropathy progression. MRI is most useful in Stage 0 (clinically active, radiographs may be normal/near-normal) to distinguish from osteomyelitis and guide immobilization timing.',
        normalValues: [
          { label: 'Stage 0 (Prodromal)', value: 'Clinical edema/erythema with normal or near-normal radiographs; MRI shows diffuse marrow edema and soft tissue edema without fragmentation — earliest detectable stage' },
          { label: 'Stage I (Development/Fragmentation)', value: 'Osseous fragmentation, joint subluxation/dislocation, debris formation; marked marrow edema' },
          { label: 'Stage II (Coalescence)', value: 'Resorption of debris, fusion of larger fragments, decreasing edema, early sclerosis' },
          { label: 'Stage III (Reconstruction/Consolidation)', value: 'Remodeling and consolidation of bone with restoration of a (often deformed) stable architecture' },
          { label: 'Key distinction', value: 'Symmetric, multi-joint involvement and absence of sinus tract/ulcer favor Charcot over osteomyelitis, which tends to be focal and contiguous with a skin defect' },
        ],
        citations: [
          { label: 'Eichenholtz SN. — Charcot Joints. Springfield, IL: Charles C Thomas, 1966.', url: 'https://scholar.google.com/scholar?q=Eichenholtz+Charcot+joints+classification+staging+1966' },
          { label: 'Chantelau EA, Grützner G. — Is the Eichenholtz classification still valid for the diabetic Charcot foot? Swiss Med Wkly 2014.', url: 'https://scholar.google.com/scholar?q=Chantelau+Eichenholtz+classification+diabetic+Charcot+foot+MRI+2014' },
        ],
        diagram: null,
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
      <defs><marker id="arr-patte" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#888" strokeWidth="1.5"/></marker></defs>
      <line x1="148" y1="76" x2="94" y2="107" stroke="#888" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arr-patte)"/>
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
    <svg viewBox="0 0 680 340" aria-label="Modic endplate changes types 1 2 3">
      <defs>
        <pattern id="trab1" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.8" fill="#c8a882" opacity="0.6"/>
          <circle cx="4.5" cy="4.5" r="0.8" fill="#c8a882" opacity="0.6"/>
        </pattern>
        <pattern id="trab2" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.8" fill="#d4b896" opacity="0.5"/>
          <circle cx="4.5" cy="4.5" r="0.8" fill="#d4b896" opacity="0.5"/>
        </pattern>
        <pattern id="trab3" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.8" fill="#b0a090" opacity="0.55"/>
          <circle cx="4.5" cy="4.5" r="0.8" fill="#b0a090" opacity="0.55"/>
        </pattern>
      </defs>
      {/* TYPE 1 — Edema */}
      <rect x="60" y="28" width="148" height="88" rx="14" fill="#e8d0b0" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="60" y="28" width="148" height="88" rx="14" fill="url(#trab1)" opacity="0.7"/>
      <rect x="62" y="90" width="144" height="22" rx="4" fill="#c83020" opacity="0.55"/>
      <rect x="60" y="113" width="148" height="9" rx="3" fill="#e8c8c0" stroke="#b86060" strokeWidth="0.8"/>
      <rect x="64" y="122" width="140" height="32" rx="6" fill="#8ab4c8" stroke="#5890aa" strokeWidth="1"/>
      <ellipse cx="134" cy="138" rx="38" ry="10" fill="#6898b0" opacity="0.5"/>
      <rect x="60" y="154" width="148" height="9" rx="3" fill="#e8c8c0" stroke="#b86060" strokeWidth="0.8"/>
      <rect x="62" y="162" width="144" height="22" rx="4" fill="#c83020" opacity="0.55"/>
      <rect x="60" y="163" width="148" height="88" rx="14" fill="#d8b888" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="60" y="163" width="148" height="88" rx="14" fill="url(#trab1)" opacity="0.5"/>
      <text x="134" y="272" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1e293b">Type 1</text>
      <text x="134" y="288" textAnchor="middle" fontSize="12" fill="#c0392b" fontWeight="600">Edema / inflammation</text>
      <text x="134" y="303" textAnchor="middle" fontSize="11" fill="#555">T1 &#8595;  T2 &#8593;  (active)</text>
      {/* TYPE 2 — Fatty */}
      <rect x="266" y="28" width="148" height="88" rx="14" fill="#f0e0a0" stroke="#c8a840" strokeWidth="1.2"/>
      <rect x="266" y="28" width="148" height="88" rx="14" fill="url(#trab2)" opacity="0.6"/>
      <rect x="268" y="90" width="144" height="22" rx="4" fill="#e8c840" opacity="0.6"/>
      <rect x="266" y="113" width="148" height="9" rx="3" fill="#f0e090" stroke="#c8a830" strokeWidth="0.8"/>
      <rect x="270" y="122" width="140" height="32" rx="6" fill="#8ab4c8" stroke="#5890aa" strokeWidth="1"/>
      <ellipse cx="340" cy="138" rx="38" ry="10" fill="#6898b0" opacity="0.5"/>
      <rect x="266" y="154" width="148" height="9" rx="3" fill="#f0e090" stroke="#c8a830" strokeWidth="0.8"/>
      <rect x="268" y="162" width="144" height="22" rx="4" fill="#e8c840" opacity="0.6"/>
      <rect x="266" y="163" width="148" height="88" rx="14" fill="#e8c860" stroke="#c8a840" strokeWidth="1.2"/>
      <rect x="266" y="163" width="148" height="88" rx="14" fill="url(#trab2)" opacity="0.5"/>
      <text x="340" y="272" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1e293b">Type 2</text>
      <text x="340" y="288" textAnchor="middle" fontSize="12" fill="#b07800" fontWeight="600">Fatty replacement</text>
      <text x="340" y="303" textAnchor="middle" fontSize="11" fill="#555">T1 &#8593;  T2 &#8593;  (chronic stable)</text>
      {/* TYPE 3 — Sclerosis */}
      <rect x="472" y="28" width="148" height="88" rx="14" fill="#e8e0d0" stroke="#a09080" strokeWidth="1.2"/>
      <rect x="472" y="28" width="148" height="88" rx="14" fill="url(#trab3)" opacity="0.6"/>
      <rect x="474" y="90" width="144" height="22" rx="4" fill="#606060" opacity="0.55"/>
      <rect x="472" y="113" width="148" height="9" rx="3" fill="#808080" stroke="#606060" strokeWidth="0.8"/>
      <rect x="476" y="122" width="140" height="32" rx="6" fill="#7090a0" stroke="#508090" strokeWidth="1"/>
      <rect x="472" y="154" width="148" height="9" rx="3" fill="#808080" stroke="#606060" strokeWidth="0.8"/>
      <rect x="474" y="162" width="144" height="22" rx="4" fill="#606060" opacity="0.55"/>
      <rect x="472" y="163" width="148" height="88" rx="14" fill="#d0c8b8" stroke="#a09080" strokeWidth="1.2"/>
      <rect x="472" y="163" width="148" height="88" rx="14" fill="url(#trab3)" opacity="0.5"/>
      <text x="546" y="272" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1e293b">Type 3</text>
      <text x="546" y="288" textAnchor="middle" fontSize="12" fill="#444" fontWeight="600">Sclerosis / end-stage</text>
      <text x="546" y="303" textAnchor="middle" fontSize="11" fill="#555">T1 &#8595;  T2 &#8595;  (sclerotic)</text>
    </svg>
  ),

  'spine-pfirrmann': (
    <svg viewBox="0 0 680 320" aria-label="Pfirrmann disc grading I through V">
      <defs>
        <pattern id="vbp" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.7" fill="#c8a882" opacity="0.55"/>
          <circle cx="4" cy="4" r="0.7" fill="#c8a882" opacity="0.55"/>
        </pattern>
      </defs>
      {/* GRADE I */}
      <rect x="30" y="30" width="96" height="70" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="30" y="30" width="96" height="70" rx="10" fill="url(#vbp)" opacity="0.7"/>
      <rect x="30" y="104" width="96" height="60" rx="6" fill="#9ab870" stroke="#6a9050" strokeWidth="1.2"/>
      <rect x="44" y="110" width="68" height="48" rx="8" fill="#f0f8ff"/>
      <ellipse cx="78" cy="134" rx="26" ry="15" fill="#e0f0ff" opacity="0.85"/>
      <rect x="30" y="164" width="96" height="70" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="30" y="164" width="96" height="70" rx="10" fill="url(#vbp)" opacity="0.7"/>
      <text x="78" y="252" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1d4ed8">Grade I</text>
      <text x="78" y="267" textAnchor="middle" fontSize="11" fill="#1d4ed8">Bright white NP</text>
      <text x="78" y="280" textAnchor="middle" fontSize="10" fill="#64748b">Normal height</text>
      {/* GRADE II */}
      <rect x="142" y="30" width="96" height="70" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="142" y="30" width="96" height="70" rx="10" fill="url(#vbp)" opacity="0.7"/>
      <rect x="142" y="104" width="96" height="58" rx="6" fill="#a0c078" stroke="#6a9050" strokeWidth="1.2"/>
      <rect x="156" y="110" width="68" height="46" rx="8" fill="#e8f4d8"/>
      <ellipse cx="190" cy="133" rx="24" ry="13" fill="#d8eecc" opacity="0.85"/>
      <line x1="158" y1="133" x2="222" y2="133" stroke="#8aaa60" strokeWidth="1.5" opacity="0.7"/>
      <rect x="142" y="162" width="96" height="70" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="142" y="162" width="96" height="70" rx="10" fill="url(#vbp)" opacity="0.7"/>
      <text x="190" y="252" textAnchor="middle" fontSize="14" fontWeight="700" fill="#16a34a">Grade II</text>
      <text x="190" y="267" textAnchor="middle" fontSize="11" fill="#16a34a">Horizontal gray band</text>
      <text x="190" y="280" textAnchor="middle" fontSize="10" fill="#64748b">Normal height</text>
      {/* GRADE III */}
      <rect x="254" y="30" width="96" height="70" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="254" y="30" width="96" height="70" rx="10" fill="url(#vbp)" opacity="0.7"/>
      <rect x="254" y="104" width="96" height="50" rx="6" fill="#b0b878" stroke="#7a8850" strokeWidth="1.2"/>
      <rect x="268" y="108" width="68" height="42" rx="6" fill="#c8c890"/>
      <rect x="254" y="154" width="96" height="70" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="254" y="154" width="96" height="70" rx="10" fill="url(#vbp)" opacity="0.7"/>
      <text x="302" y="242" textAnchor="middle" fontSize="14" fontWeight="700" fill="#d97706">Grade III</text>
      <text x="302" y="257" textAnchor="middle" fontSize="11" fill="#d97706">Gray, NP/AF indistinct</text>
      <text x="302" y="270" textAnchor="middle" fontSize="10" fill="#64748b">Normal or slight &#8595; ht</text>
      {/* GRADE IV */}
      <rect x="366" y="36" width="96" height="68" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="366" y="36" width="96" height="68" rx="10" fill="url(#vbp)" opacity="0.7"/>
      <rect x="366" y="108" width="96" height="36" rx="5" fill="#b0a068" stroke="#807848" strokeWidth="1.2"/>
      <rect x="378" y="111" width="72" height="30" rx="5" fill="#907850"/>
      <rect x="366" y="144" width="96" height="68" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="366" y="144" width="96" height="68" rx="10" fill="url(#vbp)" opacity="0.7"/>
      <text x="414" y="232" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ea580c">Grade IV</text>
      <text x="414" y="247" textAnchor="middle" fontSize="11" fill="#ea580c">Dark, no NP/AF distinction</text>
      <text x="414" y="260" textAnchor="middle" fontSize="10" fill="#64748b">Moderate &#8595; height</text>
      {/* GRADE V */}
      <rect x="478" y="42" width="96" height="68" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="478" y="42" width="96" height="68" rx="10" fill="url(#vbp)" opacity="0.7"/>
      <polygon points="478,108 496,100 514,108" fill="#b89060" stroke="#987040" strokeWidth="0.8"/>
      <polygon points="560,108 578,100 596,108" fill="#b89060" stroke="#987040" strokeWidth="0.8"/>
      <rect x="478" y="108" width="96" height="18" rx="3" fill="#807060" stroke="#605040" strokeWidth="1"/>
      <rect x="486" y="110" width="80" height="14" rx="3" fill="#504840"/>
      <polygon points="478,126 496,136 514,126" fill="#b89060" stroke="#987040" strokeWidth="0.8"/>
      <polygon points="560,126 578,136 596,126" fill="#b89060" stroke="#987040" strokeWidth="0.8"/>
      <rect x="478" y="126" width="96" height="68" rx="10" fill="#dcc898" stroke="#b8905a" strokeWidth="1.2"/>
      <rect x="478" y="126" width="96" height="68" rx="10" fill="url(#vbp)" opacity="0.5"/>
      <text x="526" y="214" textAnchor="middle" fontSize="14" fontWeight="700" fill="#dc2626">Grade V</text>
      <text x="526" y="229" textAnchor="middle" fontSize="11" fill="#dc2626">Collapsed / black disc</text>
      <text x="526" y="242" textAnchor="middle" fontSize="10" fill="#64748b">Disc space lost &#177; osteophytes</text>
    </svg>
  ),

  'spine-stenosis': (
    <svg viewBox="0 0 680 580" aria-label="Canal and foraminal stenosis MRI style grades normal to severe">
      <defs>
        <radialGradient id="csf_n" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="80%" stopColor="#e0e0e0"/>
          <stop offset="100%" stopColor="#c0c0c0"/>
        </radialGradient>
        <radialGradient id="muscle_g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#585858"/>
          <stop offset="100%" stopColor="#303030"/>
        </radialGradient>
      </defs>
      <text x="170" y="18" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">Spinal canal stenosis</text>
      <text x="510" y="18" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">Foraminal stenosis</text>
      <text x="100" y="34" textAnchor="middle" fontSize="10" fill="#64748b">Axial T2</text>
      <text x="242" y="34" textAnchor="middle" fontSize="10" fill="#64748b">Sagittal T2</text>
      <text x="440" y="34" textAnchor="middle" fontSize="10" fill="#64748b">Axial T2</text>
      <text x="590" y="34" textAnchor="middle" fontSize="10" fill="#64748b">Sagittal T2</text>
      {/* ROW 1: NORMAL */}
      <text x="28" y="110" textAnchor="middle" fontSize="12" fontWeight="700" fill="#16a34a">Normal</text>
      <rect x="42" y="42" width="116" height="116" rx="5" fill="#141414"/>
      <ellipse cx="100" cy="100" rx="52" ry="50" fill="url(#muscle_g)"/>
      <ellipse cx="100" cy="97" rx="33" ry="30" fill="#484848" stroke="#686868" strokeWidth="1.5"/>
      <path d="M75 116 Q100 130 125 116" fill="none" stroke="#585858" strokeWidth="7" strokeLinecap="round"/>
      <rect x="96" y="128" width="8" height="18" rx="3" fill="#484848"/>
      <ellipse cx="100" cy="72" rx="26" ry="10" fill="#3a3a3a"/>
      <ellipse cx="100" cy="97" rx="22" ry="20" fill="#aaaaaa"/>
      <ellipse cx="100" cy="97" rx="16" ry="16" fill="url(#csf_n)"/>
      <circle cx="96" cy="95" r="2.5" fill="#555"/>
      <circle cx="104" cy="95" r="2.5" fill="#555"/>
      <circle cx="100" cy="101" r="2" fill="#666"/>
      <rect x="184" y="42" width="116" height="116" rx="5" fill="#141414"/>
      <rect x="190" y="48" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="190" y="98" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="192" y="84" width="54" height="14" rx="2" fill="#222"/>
      <rect x="254" y="50" width="38" height="100" rx="5" fill="#e8e8e8"/>
      <rect x="290" y="54" width="6" height="92" rx="2" fill="#888"/>
      {/* Foraminal Normal */}
      <rect x="382" y="42" width="116" height="116" rx="5" fill="#141414"/>
      <ellipse cx="440" cy="100" rx="52" ry="50" fill="url(#muscle_g)"/>
      <ellipse cx="440" cy="97" rx="33" ry="30" fill="#484848" stroke="#686868" strokeWidth="1.5"/>
      <path d="M415 116 Q440 130 465 116" fill="none" stroke="#585858" strokeWidth="7" strokeLinecap="round"/>
      <ellipse cx="440" cy="72" rx="26" ry="10" fill="#3a3a3a"/>
      <ellipse cx="440" cy="97" rx="22" ry="20" fill="#aaaaaa"/>
      <ellipse cx="440" cy="97" rx="15" ry="15" fill="url(#csf_n)"/>
      <ellipse cx="414" cy="93" rx="10" ry="13" fill="#cccccc"/>
      <circle cx="414" cy="93" r="5" fill="#3a3a3a" stroke="#555" strokeWidth="0.8"/>
      <ellipse cx="466" cy="93" rx="10" ry="13" fill="#cccccc"/>
      <circle cx="466" cy="93" r="5" fill="#3a3a3a" stroke="#555" strokeWidth="0.8"/>
      <rect x="532" y="42" width="116" height="116" rx="5" fill="#141414"/>
      <rect x="538" y="48" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="538" y="98" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="540" y="84" width="54" height="14" rx="2" fill="#222"/>
      <ellipse cx="618" cy="72" rx="14" ry="17" fill="#bbbbbb"/>
      <circle cx="618" cy="72" r="6" fill="#2a2a2a"/>
      <ellipse cx="618" cy="112" rx="14" ry="17" fill="#bbbbbb"/>
      <circle cx="618" cy="112" r="6" fill="#2a2a2a"/>
      {/* ROW 2: MILD */}
      <text x="28" y="244" textAnchor="middle" fontSize="12" fontWeight="700" fill="#3b82f6">Mild</text>
      <rect x="42" y="176" width="116" height="116" rx="5" fill="#141414"/>
      <ellipse cx="100" cy="234" rx="52" ry="50" fill="url(#muscle_g)"/>
      <ellipse cx="100" cy="231" rx="33" ry="30" fill="#484848" stroke="#686868" strokeWidth="1.5"/>
      <path d="M75 250 Q100 264 125 250" fill="none" stroke="#585858" strokeWidth="7" strokeLinecap="round"/>
      <ellipse cx="100" cy="207" rx="30" ry="12" fill="#4a4a4a"/>
      <ellipse cx="100" cy="229" rx="20" ry="18" fill="#909090"/>
      <ellipse cx="100" cy="231" rx="14" ry="14" fill="url(#csf_n)"/>
      <circle cx="96" cy="229" r="2.5" fill="#555"/>
      <circle cx="104" cy="229" r="2.5" fill="#555"/>
      <rect x="184" y="176" width="116" height="116" rx="5" fill="#141414"/>
      <rect x="190" y="182" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="190" y="232" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="192" y="218" width="54" height="14" rx="2" fill="#282828"/>
      <path d="M254 184 L290 184 L290 284 L254 284 Q276 268 274 249 Q272 232 262 222 Q268 208 254 196 Z" fill="#d8d8d8"/>
      <rect x="382" y="176" width="116" height="116" rx="5" fill="#141414"/>
      <ellipse cx="440" cy="234" rx="52" ry="50" fill="url(#muscle_g)"/>
      <ellipse cx="440" cy="231" rx="33" ry="30" fill="#484848" stroke="#686868" strokeWidth="1.5"/>
      <path d="M415 250 Q440 264 465 250" fill="none" stroke="#585858" strokeWidth="7" strokeLinecap="round"/>
      <ellipse cx="440" cy="206" rx="26" ry="10" fill="#3a3a3a"/>
      <ellipse cx="440" cy="229" rx="20" ry="18" fill="#909090"/>
      <ellipse cx="440" cy="231" rx="14" ry="14" fill="url(#csf_n)"/>
      <ellipse cx="414" cy="227" rx="8" ry="11" fill="#909090"/>
      <circle cx="414" cy="227" r="4.5" fill="#3a3a3a"/>
      <ellipse cx="466" cy="227" rx="8" ry="11" fill="#909090"/>
      <circle cx="466" cy="227" r="4.5" fill="#3a3a3a"/>
      <rect x="532" y="176" width="116" height="116" rx="5" fill="#141414"/>
      <rect x="538" y="182" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="538" y="232" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="540" y="218" width="54" height="14" rx="2" fill="#282828"/>
      <ellipse cx="618" cy="206" rx="12" ry="15" fill="#888888"/>
      <circle cx="618" cy="206" r="5" fill="#2a2a2a"/>
      <ellipse cx="618" cy="244" rx="12" ry="15" fill="#888888"/>
      <circle cx="618" cy="244" r="5" fill="#2a2a2a"/>
      {/* ROW 3: MODERATE */}
      <text x="28" y="378" textAnchor="middle" fontSize="12" fontWeight="700" fill="#d97706">Moderate</text>
      <rect x="42" y="310" width="116" height="116" rx="5" fill="#141414"/>
      <ellipse cx="100" cy="368" rx="52" ry="50" fill="url(#muscle_g)"/>
      <ellipse cx="100" cy="365" rx="33" ry="30" fill="#484848" stroke="#686868" strokeWidth="1.5"/>
      <path d="M75 382 Q100 396 125 382" fill="none" stroke="#606060" strokeWidth="8" strokeLinecap="round"/>
      <ellipse cx="100" cy="341" rx="32" ry="14" fill="#585858"/>
      <ellipse cx="74" cy="368" rx="9" ry="6" fill="#545454"/>
      <ellipse cx="126" cy="368" rx="9" ry="6" fill="#545454"/>
      <ellipse cx="100" cy="363" rx="16" ry="15" fill="#686868"/>
      <path d="M88 354 Q100 370 112 354 Q107 347 100 345 Q93 347 88 354 Z" fill="#d0d0d0"/>
      <circle cx="97" cy="360" r="2" fill="#555"/>
      <circle cx="103" cy="360" r="2" fill="#555"/>
      <rect x="184" y="310" width="116" height="116" rx="5" fill="#141414"/>
      <rect x="190" y="316" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="190" y="366" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="192" y="352" width="54" height="14" rx="2" fill="#383838"/>
      <path d="M254 318 L290 318 L290 418 L254 418 Q280 402 278 384 Q276 366 258 354 Q274 342 254 328 Z" fill="#b0b0b0"/>
      <rect x="382" y="310" width="116" height="116" rx="5" fill="#141414"/>
      <ellipse cx="440" cy="368" rx="52" ry="50" fill="url(#muscle_g)"/>
      <ellipse cx="440" cy="365" rx="33" ry="30" fill="#484848" stroke="#686868" strokeWidth="1.5"/>
      <path d="M415 382 Q440 396 465 382" fill="none" stroke="#585858" strokeWidth="7" strokeLinecap="round"/>
      <ellipse cx="440" cy="341" rx="28" ry="11" fill="#484848"/>
      <ellipse cx="440" cy="363" rx="15" ry="14" fill="#c8c8c8"/>
      <ellipse cx="414" cy="362" rx="6" ry="8" fill="#555555"/>
      <circle cx="414" cy="362" r="3.5" fill="#2a2a2a"/>
      <ellipse cx="466" cy="362" rx="6" ry="8" fill="#555555"/>
      <circle cx="466" cy="362" r="3.5" fill="#2a2a2a"/>
      <rect x="532" y="310" width="116" height="116" rx="5" fill="#141414"/>
      <rect x="538" y="316" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="538" y="366" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="540" y="352" width="54" height="14" rx="2" fill="#383838"/>
      <ellipse cx="618" cy="340" rx="10" ry="12" fill="#484848"/>
      <circle cx="618" cy="340" r="4" fill="#282828"/>
      <ellipse cx="618" cy="376" rx="10" ry="12" fill="#484848"/>
      <circle cx="618" cy="376" r="4" fill="#282828"/>
      {/* ROW 4: SEVERE */}
      <text x="28" y="512" textAnchor="middle" fontSize="12" fontWeight="700" fill="#dc2626">Severe</text>
      <rect x="42" y="444" width="116" height="116" rx="5" fill="#141414"/>
      <ellipse cx="100" cy="502" rx="52" ry="50" fill="url(#muscle_g)"/>
      <ellipse cx="100" cy="499" rx="33" ry="30" fill="#484848" stroke="#686868" strokeWidth="1.5"/>
      <path d="M75 515 Q100 530 125 515" fill="none" stroke="#686868" strokeWidth="9" strokeLinecap="round"/>
      <ellipse cx="100" cy="474" rx="34" ry="16" fill="#606060"/>
      <ellipse cx="71" cy="500" rx="12" ry="8" fill="#606060"/>
      <ellipse cx="129" cy="500" rx="12" ry="8" fill="#606060"/>
      <ellipse cx="100" cy="494" rx="7" ry="5" fill="#999999"/>
      <rect x="184" y="444" width="116" height="116" rx="5" fill="#141414"/>
      <rect x="190" y="450" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="190" y="500" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="192" y="486" width="54" height="14" rx="2" fill="#444"/>
      <path d="M254 452 L290 452 L290 552 L254 552 Q282 536 280 519 Q278 504 260 490 Q276 476 254 462 Z" fill="#888888"/>
      <rect x="382" y="444" width="116" height="116" rx="5" fill="#141414"/>
      <ellipse cx="440" cy="502" rx="52" ry="50" fill="url(#muscle_g)"/>
      <ellipse cx="440" cy="499" rx="33" ry="30" fill="#484848" stroke="#686868" strokeWidth="1.5"/>
      <path d="M415 515 Q440 530 465 515" fill="none" stroke="#585858" strokeWidth="7" strokeLinecap="round"/>
      <ellipse cx="440" cy="474" rx="30" ry="13" fill="#585858"/>
      <ellipse cx="440" cy="497" rx="14" ry="13" fill="#b0b0b0"/>
      <ellipse cx="414" cy="497" rx="5" ry="6" fill="#2c2c2c"/>
      <ellipse cx="466" cy="497" rx="5" ry="6" fill="#2c2c2c"/>
      <rect x="532" y="444" width="116" height="116" rx="5" fill="#141414"/>
      <rect x="538" y="450" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="538" y="500" width="58" height="36" rx="5" fill="#3c3c3c"/>
      <rect x="540" y="486" width="54" height="14" rx="2" fill="#444"/>
      <ellipse cx="618" cy="474" rx="8" ry="10" fill="#282828"/>
      <ellipse cx="618" cy="510" rx="8" ry="10" fill="#282828"/>
      <line x1="38" y1="174" x2="642" y2="174" stroke="#e2e8f0" strokeWidth="0.5"/>
      <line x1="38" y1="308" x2="642" y2="308" stroke="#e2e8f0" strokeWidth="0.5"/>
      <line x1="38" y1="442" x2="642" y2="442" strokeWidth="0.5" stroke="#e2e8f0"/>
      <line x1="340" y1="38" x2="340" y2="562" stroke="#e2e8f0" strokeWidth="0.5"/>
      <text x="340" y="576" textAnchor="middle" fontSize="10" fill="#94a3b8">T2 MRI — bright = CSF/fat  &#8226;  dark = bone/disc/fibrous tissue</text>
    </svg>
  ),

  'spine-foraminal': (
    <svg viewBox="0 0 680 200" aria-label="Foraminal stenosis grades 0 to 3">
      <defs>
        <radialGradient id="fat_f2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#cccccc"/>
          <stop offset="100%" stopColor="#999999"/>
        </radialGradient>
      </defs>
      <text x="85" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="#16a34a">Grade 0 — Normal</text>
      <rect x="34" y="28" width="102" height="72" rx="8" fill="#141414"/>
      <rect x="40" y="34" width="90" height="60" rx="6" fill="#2a2a2a" stroke="#505050" strokeWidth="1"/>
      <ellipse cx="85" cy="64" rx="30" ry="22" fill="url(#fat_f2)"/>
      <circle cx="85" cy="64" r="9" fill="#1a1a1a" stroke="#444" strokeWidth="0.8"/>
      <text x="85" y="116" textAnchor="middle" fontSize="11" fill="#16a34a">Fat fills foramen</text>
      <text x="85" y="130" textAnchor="middle" fontSize="10" fill="#64748b">Root freely mobile</text>
      <text x="255" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="#d97706">Grade 1 — Mild</text>
      <rect x="204" y="28" width="102" height="72" rx="8" fill="#141414"/>
      <rect x="210" y="34" width="90" height="60" rx="6" fill="#2a2a2a" stroke="#505050" strokeWidth="1"/>
      <rect x="212" y="34" width="86" height="14" rx="4" fill="#505050"/>
      <ellipse cx="255" cy="68" rx="24" ry="18" fill="#aaaaaa"/>
      <circle cx="255" cy="68" r="8" fill="#1a1a1a" stroke="#444" strokeWidth="0.8"/>
      <text x="255" y="116" textAnchor="middle" fontSize="11" fill="#d97706">Fat &gt;25% remaining</text>
      <text x="255" y="130" textAnchor="middle" fontSize="10" fill="#64748b">Root not deformed</text>
      <text x="425" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ea580c">Grade 2 — Moderate</text>
      <rect x="374" y="28" width="102" height="72" rx="8" fill="#141414"/>
      <rect x="380" y="34" width="90" height="60" rx="6" fill="#2a2a2a" stroke="#505050" strokeWidth="1"/>
      <rect x="382" y="34" width="86" height="16" rx="4" fill="#606060"/>
      <rect x="382" y="78" width="86" height="16" rx="4" fill="#606060"/>
      <ellipse cx="425" cy="64" rx="16" ry="12" fill="#666666"/>
      <ellipse cx="425" cy="64" rx="10" ry="7" fill="#1a1a1a" stroke="#555" strokeWidth="1"/>
      <text x="425" y="116" textAnchor="middle" fontSize="11" fill="#ea580c">Fat &lt;25%</text>
      <text x="425" y="130" textAnchor="middle" fontSize="10" fill="#64748b">Root deformed</text>
      <text x="595" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="#dc2626">Grade 3 — Severe</text>
      <rect x="544" y="28" width="102" height="72" rx="8" fill="#141414"/>
      <rect x="550" y="34" width="90" height="60" rx="6" fill="#2a2a2a" stroke="#505050" strokeWidth="1"/>
      <rect x="552" y="34" width="86" height="20" rx="5" fill="#707070"/>
      <rect x="552" y="74" width="86" height="20" rx="5" fill="#707070"/>
      <ellipse cx="595" cy="64" rx="8" ry="5" fill="#444444" stroke="#dc2626" strokeWidth="1.2"/>
      <text x="595" y="116" textAnchor="middle" fontSize="11" fill="#dc2626">No fat visible</text>
      <text x="595" y="130" textAnchor="middle" fontSize="10" fill="#64748b">Root obliterated</text>
    </svg>
  ),

  'spine-meyerding': (
    <svg viewBox="0 0 680 400" aria-label="Meyerding spondylolisthesis grades I through V">
      <defs>
        <marker id="marr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
      </defs>
      {/* GRADES I–IV top row */}
      {/* Grade I */}
      <text x="65" y="15" textAnchor="middle" fontSize="12" fontWeight="700" fill="#16a34a">Grade I</text>
      <text x="65" y="28" textAnchor="middle" fontSize="10" fill="#16a34a">0–25%</text>
      <path d="M10 200 Q10 160 30 150 Q50 138 80 145 Q108 152 108 170 Q108 220 80 235 Q50 248 28 238 Q10 228 10 200 Z" fill="#f0e6c8" stroke="#c8a860" strokeWidth="2"/>
      <rect x="10" y="143" width="24" height="30" fill="#93c5fd" opacity="0.7"/>
      <rect x="34" y="140" width="24" height="30" fill="#86efac" opacity="0.7"/>
      <rect x="58" y="141" width="24" height="30" fill="#fca5a5" opacity="0.7"/>
      <rect x="82" y="145" width="26" height="28" fill="#fde68a" opacity="0.7"/>
      <line x1="34" y1="140" x2="34" y2="175" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="58" y1="139" x2="58" y2="175" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="82" y1="140" x2="82" y2="175" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="106" y1="144" x2="106" y2="175" stroke="#1d4ed8" strokeWidth="1.2"/>
      <path d="M16 143 Q55 156 112 148 L112 158 Q55 166 16 153 Z" fill="#a8d0e8" stroke="#5090b8" strokeWidth="1" opacity="0.8"/>
      <path d="M16 140 Q34 86 88 84 Q112 83 116 108 Q116 153 88 164 Q56 172 30 163 Q14 155 16 140 Z" fill="#f0e6c8" stroke="#c8a860" strokeWidth="2"/>
      <path d="M108 94 Q116 120 114 152 Q118 162 118 202 Q118 232 114 247" fill="none" stroke="#93c5fd" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
      <text x="65" y="270" textAnchor="middle" fontSize="11" fill="#64748b">Minimal slip</text>
      <text x="65" y="283" textAnchor="middle" fontSize="11" fill="#16a34a">Canal: open</text>
      {/* Grade II */}
      <text x="195" y="15" textAnchor="middle" fontSize="12" fontWeight="700" fill="#d97706">Grade II</text>
      <text x="195" y="28" textAnchor="middle" fontSize="10" fill="#d97706">25–50%</text>
      <path d="M143 205 Q143 165 163 153 Q183 140 212 148 Q240 155 240 175 Q240 225 212 238 Q182 250 160 242 Q143 232 143 205 Z" fill="#f0e6c8" stroke="#c8a860" strokeWidth="2"/>
      <rect x="143" y="146" width="24" height="30" fill="#93c5fd" opacity="0.7"/>
      <rect x="167" y="143" width="24" height="30" fill="#86efac" opacity="0.7"/>
      <rect x="191" y="144" width="24" height="30" fill="#fca5a5" opacity="0.7"/>
      <rect x="215" y="148" width="25" height="28" fill="#fde68a" opacity="0.7"/>
      <line x1="167" y1="143" x2="167" y2="177" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="191" y1="142" x2="191" y2="177" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="215" y1="144" x2="215" y2="177" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="239" y1="148" x2="239" y2="177" stroke="#1d4ed8" strokeWidth="1.2"/>
      <path d="M145 148 Q184 160 242 153 L242 164 Q184 172 145 160 Z" fill="#a8d0e8" stroke="#5090b8" strokeWidth="1" opacity="0.8"/>
      <path d="M170 143 Q170 102 190 90 Q212 77 240 84 Q268 90 268 112 Q268 153 240 164 Q212 172 188 166 Q170 158 170 143 Z" fill="#f0e6c8" stroke="#c8a860" strokeWidth="2"/>
      <path d="M240 96 Q250 122 248 155 Q242 163 242 177 Q246 200 242 237" fill="none" stroke="#93c5fd" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
      <circle cx="244" cy="158" r="5" fill="#3b82f6" opacity="0.9"/>
      <text x="195" y="270" textAnchor="middle" fontSize="11" fill="#64748b">Moderate slip</text>
      <text x="195" y="283" textAnchor="middle" fontSize="11" fill="#d97706">Canal: mild kink</text>
      {/* Grade III */}
      <text x="325" y="15" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ea580c">Grade III</text>
      <text x="325" y="28" textAnchor="middle" fontSize="10" fill="#ea580c">50–75%</text>
      <path d="M273 210 Q273 168 293 156 Q315 143 343 150 Q370 157 370 177 Q370 228 343 242 Q313 255 290 247 Q273 237 273 210 Z" fill="#f0e6c8" stroke="#c8a860" strokeWidth="2"/>
      <rect x="273" y="150" width="24" height="30" fill="#93c5fd" opacity="0.7"/>
      <rect x="297" y="147" width="24" height="30" fill="#86efac" opacity="0.7"/>
      <rect x="321" y="148" width="24" height="30" fill="#fca5a5" opacity="0.7"/>
      <rect x="345" y="151" width="25" height="28" fill="#fde68a" opacity="0.7"/>
      <line x1="297" y1="147" x2="297" y2="181" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="321" y1="147" x2="321" y2="181" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="345" y1="149" x2="345" y2="181" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="369" y1="152" x2="369" y2="181" stroke="#1d4ed8" strokeWidth="1.2"/>
      <path d="M275 153 Q314 164 372 158 L372 168 Q314 176 275 164 Z" fill="#a8d0e8" stroke="#5090b8" strokeWidth="1" opacity="0.8"/>
      <path d="M316 147 Q316 105 336 92 Q358 78 385 86 Q412 92 412 114 Q412 155 385 167 Q357 176 333 170 Q316 162 316 147 Z" fill="#f0e6c8" stroke="#c8a860" strokeWidth="2"/>
      <path d="M384 98 Q394 125 392 150 Q386 162 374 170 Q372 185 370 210 Q374 230 370 244" fill="none" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      <circle cx="380" cy="163" r="6" fill="#f59e0b" opacity="0.9"/>
      <text x="325" y="270" textAnchor="middle" fontSize="11" fill="#64748b">Severe slip</text>
      <text x="325" y="283" textAnchor="middle" fontSize="11" fill="#ea580c">Canal: kinked</text>
      {/* Grade IV */}
      <text x="455" y="15" textAnchor="middle" fontSize="12" fontWeight="700" fill="#dc2626">Grade IV</text>
      <text x="455" y="28" textAnchor="middle" fontSize="10" fill="#dc2626">75–100%</text>
      <path d="M403 215 Q403 172 423 159 Q445 145 474 153 Q502 160 502 181 Q502 232 474 246 Q444 260 421 252 Q403 242 403 215 Z" fill="#f0e6c8" stroke="#c8a860" strokeWidth="2"/>
      <rect x="403" y="153" width="25" height="30" fill="#93c5fd" opacity="0.7"/>
      <rect x="428" y="150" width="25" height="30" fill="#86efac" opacity="0.7"/>
      <rect x="453" y="151" width="24" height="30" fill="#fca5a5" opacity="0.7"/>
      <rect x="477" y="154" width="25" height="28" fill="#fde68a" opacity="0.7"/>
      <line x1="428" y1="150" x2="428" y2="184" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="452" y1="150" x2="452" y2="184" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="476" y1="152" x2="476" y2="184" stroke="#1d4ed8" strokeWidth="1.2"/>
      <line x1="500" y1="155" x2="500" y2="184" stroke="#1d4ed8" strokeWidth="1.2"/>
      <path d="M405 158 Q444 168 505 163 L505 173 Q444 181 405 170 Z" fill="#a8d0e8" stroke="#5090b8" strokeWidth="1" opacity="0.8"/>
      <path d="M470 152 Q470 108 490 95 Q512 81 539 89 Q566 96 566 118 Q566 160 539 172 Q511 182 487 176 Q470 168 470 152 Z" fill="#f0e6c8" stroke="#c8a860" strokeWidth="2"/>
      <path d="M538 101 Q550 128 546 155 Q540 165 506 175 Q503 191 502 216 Q506 237 502 248" fill="none" stroke="#93c5fd" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      <circle cx="522" cy="167" r="7" fill="#ef4444" opacity="0.95"/>
      <text x="455" y="270" textAnchor="middle" fontSize="11" fill="#64748b">Near-complete</text>
      <text x="455" y="283" textAnchor="middle" fontSize="11" fill="#dc2626">Canal: severe</text>
      {/* Grade V — Spondyloptosis — bottom row centered */}
      <text x="340" y="308" textAnchor="middle" fontSize="13" fontWeight="700" fill="#7c2d12">Grade V — Spondyloptosis</text>
      <path d="M200 375 Q200 345 220 333 Q245 320 272 327 Q300 334 300 352 Q300 385 272 370 Q245 358 222 362 Q200 364 200 375 Z" fill="#f0e6c8" stroke="#c8a860" strokeWidth="2"/>
      <path d="M300 350 Q305 362 300 374" fill="none" stroke="#c8a860" strokeWidth="2.5"/>
      <path d="M120 350 Q120 318 142 307 Q166 295 194 302 Q222 309 222 328 Q222 362 194 374 Q166 384 144 376 Q120 367 120 350 Z" fill="#f0e6c8" stroke="#991b1b" strokeWidth="2.2"/>
      <path d="M125 350 Q170 364 222 357 Q215 370 175 372 Q148 372 125 362 Z" fill="#a8d0e8" stroke="#5090b8" strokeWidth="0.8" opacity="0.6"/>
      <path d="M218 305 Q228 322 226 348" fill="none" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" opacity="0.7"/>
      <line x1="220" y1="354" x2="232" y2="366" stroke="#dc2626" strokeWidth="2.5"/>
      <line x1="232" y1="354" x2="220" y2="366" stroke="#dc2626" strokeWidth="2.5"/>
      <path d="M304 354 Q309 364 307 378" fill="none" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" opacity="0.4"/>
      <line x1="222" y1="302" x2="172" y2="377" stroke="#991b1b" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.8" markerEnd="url(#marr)"/>
      {/* Legend */}
      <rect x="380" y="320" width="14" height="12" rx="2" fill="#93c5fd" opacity="0.8"/>
      <text x="398" y="330" fontSize="10" fill="#1d4ed8">Grade I zone (0–25%)</text>
      <rect x="380" y="336" width="14" height="12" rx="2" fill="#86efac" opacity="0.8"/>
      <text x="398" y="346" fontSize="10" fill="#16a34a">Grade II zone (25–50%)</text>
      <rect x="380" y="352" width="14" height="12" rx="2" fill="#fca5a5" opacity="0.8"/>
      <text x="398" y="362" fontSize="10" fill="#dc2626">Grade III zone (50–75%)</text>
      <rect x="380" y="368" width="14" height="12" rx="2" fill="#fde68a" opacity="0.8"/>
      <text x="398" y="378" fontSize="10" fill="#b45309">Grade IV zone (75–100%)</text>
      <text x="340" y="397" textAnchor="middle" fontSize="10" fill="#94a3b8">Blue = spinal canal  &#8226;  &#10005; = canal obliteration  &#8226;  Color zones = % of S1 endplate displaced</text>
    </svg>
  ),

  'spine-disc-nomen': (
    <svg viewBox="0 0 680 300" aria-label="Lumbar disc nomenclature bulge protrusion extrusion sequestration">
      <defs>
        <pattern id="vbd" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.7" fill="#c8a882" opacity="0.5"/>
          <circle cx="3.8" cy="3.8" r="0.7" fill="#c8a882" opacity="0.5"/>
        </pattern>
      </defs>
      {/* Helper: sagittal view of L4-L5 disc segment for each type */}
      {/* NORMAL */}
      <text x="60" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="#16a34a">Normal</text>
      <rect x="12" y="28" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="12" y="28" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <rect x="14" y="82" width="92" height="28" rx="5" fill="#8ab4c8" stroke="#5090b0" strokeWidth="1.2"/>
      <ellipse cx="60" cy="96" rx="28" ry="10" fill="#6898b0" opacity="0.6"/>
      <rect x="12" y="112" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="12" y="112" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <text x="60" y="185" textAnchor="middle" fontSize="11" fill="#16a34a">Intact disc</text>
      <text x="60" y="198" textAnchor="middle" fontSize="10" fill="#64748b">Normal height</text>
      <text x="60" y="211" textAnchor="middle" fontSize="10" fill="#64748b">NP bright T2</text>
      {/* BULGE */}
      <text x="200" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="#d97706">Bulge</text>
      <rect x="152" y="28" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="152" y="28" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <path d="M154 82 Q200 72 246 82 L248 110 Q200 120 152 110 Z" fill="#7ab4cc" stroke="#4890b0" strokeWidth="1.2"/>
      {/* Broad symmetric bulge anterior */}
      <path d="M152 82 Q200 68 248 82 Q252 96 248 96 Q200 84 152 96 Z" fill="#6898b8" opacity="0.8"/>
      <rect x="152" y="112" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="152" y="112" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <text x="200" y="185" textAnchor="middle" fontSize="11" fill="#d97706">Broad-based</text>
      <text x="200" y="198" textAnchor="middle" fontSize="10" fill="#64748b">&gt;50% circumference</text>
      <text x="200" y="211" textAnchor="middle" fontSize="10" fill="#64748b">&lt;3mm beyond EP</text>
      {/* PROTRUSION */}
      <text x="340" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ea580c">Protrusion</text>
      <rect x="292" y="28" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="292" y="28" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <path d="M294 82 Q340 78 386 82 L386 110 Q340 106 294 110 Z" fill="#7ab4cc" stroke="#4890b0" strokeWidth="1.2"/>
      {/* Focal posterior protrusion — base wider than AP extent */}
      <ellipse cx="340" cy="84" rx="16" ry="12" fill="#4878a8" opacity="0.9"/>
      <rect x="292" y="112" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="292" y="112" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <text x="340" y="185" textAnchor="middle" fontSize="11" fill="#ea580c">Focal / asymmetric</text>
      <text x="340" y="198" textAnchor="middle" fontSize="10" fill="#64748b">&lt;25% circumference</text>
      <text x="340" y="211" textAnchor="middle" fontSize="10" fill="#64748b">Base &gt; AP extent</text>
      {/* EXTRUSION */}
      <text x="480" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="#dc2626">Extrusion</text>
      <rect x="432" y="28" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="432" y="28" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <path d="M434 82 Q480 78 526 82 L526 110 Q480 106 434 110 Z" fill="#7ab4cc" stroke="#4890b0" strokeWidth="1.2"/>
      {/* AP extent > base — mushroom shape */}
      <path d="M468 82 Q480 60 492 82 Q488 90 492 96 Q480 92 468 96 Q472 90 468 82 Z" fill="#3060a0" opacity="0.9"/>
      <rect x="432" y="112" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="432" y="112" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <text x="480" y="185" textAnchor="middle" fontSize="11" fill="#dc2626">AP extent &gt; base</text>
      <text x="480" y="198" textAnchor="middle" fontSize="10" fill="#64748b">Herniated NP</text>
      <text x="480" y="211" textAnchor="middle" fontSize="10" fill="#64748b">Breaks annulus</text>
      {/* SEQUESTRATION */}
      <text x="620" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="#7c2d12">Sequestration</text>
      <rect x="572" y="28" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="572" y="28" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <path d="M574 82 Q620 78 666 82 L666 110 Q620 106 574 110 Z" fill="#7ab4cc" stroke="#4890b0" strokeWidth="1.2"/>
      {/* Free fragment migrated away from disc */}
      <ellipse cx="616" cy="72" rx="11" ry="9" fill="#2850a0" opacity="0.95" stroke="#1a3880" strokeWidth="0.8"/>
      <rect x="572" y="112" width="96" height="52" rx="8" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="572" y="112" width="96" height="52" rx="8" fill="url(#vbd)" opacity="0.6"/>
      <text x="620" y="185" textAnchor="middle" fontSize="11" fill="#7c2d12">Free fragment</text>
      <text x="620" y="198" textAnchor="middle" fontSize="10" fill="#64748b">Separated from disc</text>
      <text x="620" y="211" textAnchor="middle" fontSize="10" fill="#64748b">May migrate up/down</text>
      <text x="340" y="240" textAnchor="middle" fontSize="10" fill="#94a3b8">Per NASS/ASSR/ASNR 2014 nomenclature guidelines — sagittal T2 MRI view</text>
    </svg>
  ),

  'spine-ao-cervical': (
    <svg viewBox="0 0 680 320" aria-label="AO Spine cervical fracture classification types A B C">
      <defs>
        <pattern id="vbao" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.7" fill="#c8a882" opacity="0.5"/>
          <circle cx="3.8" cy="3.8" r="0.7" fill="#c8a882" opacity="0.5"/>
        </pattern>
      </defs>
      <text x="340" y="18" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">AO Spine Cervical Classification (C3–C7)</text>
      {/* TYPE A — COMPRESSION */}
      <text x="110" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#d97706">Type A — Compression</text>
      <text x="55" y="58" textAnchor="middle" fontSize="10" fill="#d97706">A0 Minor</text>
      <rect x="14" y="64" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="14" y="64" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      <line x1="14" y1="76" x2="96" y2="76" stroke="#c8a860" strokeWidth="0.8" strokeDasharray="3 2"/>
      <rect x="14" y="124" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="14" y="124" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      <text x="55" y="195" textAnchor="middle" fontSize="10" fill="#64748b">Spinous/transverse Fx</text>
      <text x="110" y="58" textAnchor="middle" fontSize="10" fill="#d97706">A3 Burst partial</text>
      <rect x="100" y="64" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="100" y="64" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      {/* Burst — comminuted VB, retropulsed fragment */}
      <line x1="100" y1="85" x2="182" y2="85" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 1"/>
      <line x1="100" y1="95" x2="182" y2="95" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 1"/>
      <line x1="141" y1="64" x2="141" y2="120" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 1"/>
      <rect x="152" y="72" width="10" height="30" rx="2" fill="#b04020" opacity="0.7"/>
      <rect x="100" y="124" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="100" y="124" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      <text x="141" y="195" textAnchor="middle" fontSize="10" fill="#64748b">Burst — retropulsion</text>
      {/* TYPE B — TENSION BAND */}
      <text x="340" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ea580c">Type B — Tension Band Failure</text>
      <text x="270" y="58" textAnchor="middle" fontSize="10" fill="#ea580c">B1 Posterior bony</text>
      <rect x="228" y="64" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="228" y="64" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      {/* Posterior element fracture — tension band failure */}
      <path d="M290 64 Q298 80 290 96" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
      <line x1="285" y1="70" x2="295" y2="82" stroke="#dc2626" strokeWidth="1.5"/>
      <rect x="228" y="124" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="228" y="124" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      <text x="270" y="195" textAnchor="middle" fontSize="10" fill="#64748b">Posterior Fx, bony</text>
      <text x="355" y="58" textAnchor="middle" fontSize="10" fill="#ea580c">B2 PLC disruption</text>
      <rect x="314" y="64" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="314" y="64" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      {/* Ligamentous distraction — gap posteriorly */}
      <path d="M375 64 Q385 80 375 96" fill="none" stroke="#7c2d12" strokeWidth="1.5" strokeDasharray="3 2"/>
      <path d="M366 64 Q358 72 366 80" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round"/>
      <rect x="314" y="124" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="314" y="124" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      <text x="355" y="195" textAnchor="middle" fontSize="10" fill="#64748b">Lig disruption (PLC)</text>
      {/* TYPE C — TRANSLATION */}
      <text x="570" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#dc2626">Type C — Translation</text>
      <text x="570" y="58" textAnchor="middle" fontSize="10" fill="#dc2626">All columns displaced</text>
      <rect x="445" y="64" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="445" y="64" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      {/* Translation — VB shifted anterior on lower VB */}
      <rect x="466" y="124" width="82" height="56" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="466" y="124" width="82" height="56" rx="7" fill="url(#vbao)" opacity="0.6"/>
      <line x1="466" y1="120" x2="527" y2="120" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 1"/>
      <defs><marker id="marr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="#dc2626" strokeWidth="1.5"/></marker></defs>
      <path d="M452 118 L462 126" fill="none" stroke="#dc2626" strokeWidth="2" markerEnd="url(#marr2)"/>
      <text x="570" y="195" textAnchor="middle" fontSize="10" fill="#64748b">Anterior translation</text>
      <text x="570" y="208" textAnchor="middle" fontSize="10" fill="#64748b">All 3 columns disrupted</text>
      {/* Severity note */}
      <rect x="40" y="220" width="600" height="50" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="1"/>
      <text x="340" y="238" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400e">Modifiers: N0–N4 neurological status  |  F1–F4 facet injury severity</text>
      <text x="340" y="254" textAnchor="middle" fontSize="10" fill="#78350f">Stability: A (least) &#8594; B &#8594; C (most unstable)  |  SLICS &amp; AO Spine score guide surgical decision</text>
    </svg>
  ),

  'spine-ao-tl': (
    <svg viewBox="0 0 680 300" aria-label="AO Spine thoracolumbar fracture classification TLICS">
      <defs>
        <pattern id="vbtl" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.7" fill="#c8a882" opacity="0.5"/>
          <circle cx="3.8" cy="3.8" r="0.7" fill="#c8a882" opacity="0.5"/>
        </pattern>
      </defs>
      <text x="340" y="18" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">AO Spine Thoracolumbar Classification (T1–L5)</text>
      {/* TYPE A */}
      <text x="100" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#d97706">Type A — Compression</text>
      <text x="50" y="58" textAnchor="middle" fontSize="10" fill="#d97706">A1 Wedge</text>
      <rect x="10" y="62" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="10" y="62" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      {/* Anterior wedge */}
      <path d="M10 62 L90 62 L90 120 L10 105 Z" fill="#c8a060" opacity="0.4"/>
      <rect x="10" y="124" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="10" y="124" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      <text x="50" y="198" textAnchor="middle" fontSize="10" fill="#64748b">Ant wedge Fx</text>
      <text x="130" y="58" textAnchor="middle" fontSize="10" fill="#d97706">A4 Burst</text>
      <rect x="98" y="62" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="98" y="62" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      <line x1="98" y1="80" x2="178" y2="80" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 1"/>
      <line x1="98" y1="92" x2="178" y2="92" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 1"/>
      <line x1="138" y1="62" x2="138" y2="120" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 1"/>
      <rect x="150" y="70" width="10" height="36" rx="2" fill="#b04020" opacity="0.7"/>
      <rect x="98" y="124" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="98" y="124" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      <text x="138" y="198" textAnchor="middle" fontSize="10" fill="#64748b">Burst + retropulsion</text>
      {/* TYPE B */}
      <text x="340" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ea580c">Type B — Posterior Tension</text>
      <text x="258" y="58" textAnchor="middle" fontSize="10" fill="#ea580c">B1 Bony PLC</text>
      <rect x="218" y="62" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="218" y="62" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      <path d="M280 62 Q290 78 280 95" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
      <rect x="218" y="124" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="218" y="124" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      <text x="258" y="198" textAnchor="middle" fontSize="10" fill="#64748b">Chance fracture</text>
      <text x="340" y="58" textAnchor="middle" fontSize="10" fill="#ea580c">B2 Ligamentous</text>
      <rect x="302" y="62" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="302" y="62" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      <path d="M364 58 Q375 75 364 92" fill="none" stroke="#7c2d12" strokeWidth="1.5" strokeDasharray="3 2"/>
      <path d="M354 58 Q344 68 354 78" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round"/>
      <rect x="302" y="124" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="302" y="124" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      <text x="342" y="198" textAnchor="middle" fontSize="10" fill="#64748b">PLC disruption</text>
      {/* TYPE C */}
      <text x="570" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#dc2626">Type C — Dislocation</text>
      <text x="570" y="58" textAnchor="middle" fontSize="10" fill="#dc2626">All columns</text>
      <rect x="446" y="62" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="446" y="62" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      <rect x="470" y="124" width="80" height="58" rx="7" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.5"/>
      <rect x="470" y="124" width="80" height="58" rx="7" fill="url(#vbtl)" opacity="0.6"/>
      <line x1="470" y1="120" x2="526" y2="120" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 1"/>
      <text x="570" y="198" textAnchor="middle" fontSize="10" fill="#64748b">Translational / rotational</text>
      {/* TLICS table */}
      <rect x="40" y="215" width="600" height="66" rx="8" fill="#f0f4ff" stroke="#6366f1" strokeWidth="1"/>
      <text x="340" y="232" textAnchor="middle" fontSize="11" fontWeight="700" fill="#3730a3">TLICS Score (Thoracolumbar Injury Classification and Severity Score)</text>
      <text x="100" y="248" textAnchor="middle" fontSize="10" fill="#1e293b">Morphology: A1=1 A2=2 A3/B=3 B3/C=4</text>
      <text x="340" y="248" textAnchor="middle" fontSize="10" fill="#1e293b">PLC: Intact=0  Suspected=2  Disrupted=3</text>
      <text x="560" y="248" textAnchor="middle" fontSize="10" fill="#1e293b">Neuro: Intact=0  Root=2  Complete=2  Incomplete=3</text>
      <text x="200" y="264" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16a34a">&#8804;3 = Conservative</text>
      <text x="340" y="264" textAnchor="middle" fontSize="10" fontWeight="600" fill="#d97706">4 = Either (surgeon discretion)</text>
      <text x="490" y="264" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">&#8805;5 = Surgical</text>
      <text x="340" y="278" textAnchor="middle" fontSize="9" fill="#64748b">PLC = posterior ligamentous complex  |  Neuro = neurological status</text>
    </svg>
  ),

  'spine-imbalance': (
    <svg viewBox="0 0 680 300" aria-label="Spinal sagittal and coronal imbalance SVA pelvic incidence">
      <text x="340" y="18" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">Global Spinal Alignment Parameters</text>
      {/* SAGITTAL — left panel */}
      <text x="170" y="36" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1d4ed8">Sagittal Alignment</text>
      {/* Full spine silhouette — lateral view */}
      {/* Vertebral column simplified */}
      <path d="M160 52 Q148 80 152 110 Q156 140 148 170 Q140 200 148 230 Q154 255 160 268" fill="none" stroke="#c8a860" strokeWidth="3" strokeLinecap="round"/>
      {/* Vertebral bodies as rounded rects along curve */}
      {[52,72,92,112,132,152,172,192,212,232].map((y,i) => (
        <rect key={i} x={148-(i<5?i*1.5:12-(i-5)*1.5)} y={y} width="24" height="16" rx="3" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1"/>
      ))}
      {/* Sacrum */}
      <path d="M142 252 Q155 258 162 268 Q150 272 140 265 Z" fill="#d4c090" stroke="#c8a860" strokeWidth="1.2"/>
      {/* C7 plumb line */}
      <line x1="160" y1="52" x2="160" y2="268" stroke="#1d4ed8" strokeWidth="1.2" strokeDasharray="5 3"/>
      {/* SVA measurement — horizontal distance C7 to S1 */}
      <line x1="152" y1="268" x2="160" y2="268" stroke="#dc2626" strokeWidth="2"/>
      <text x="140" y="265" fontSize="9" fill="#dc2626">S1</text>
      <line x1="160" y1="52" x2="200" y2="52" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x="202" y="55" fontSize="9" fill="#dc2626">C7</text>
      <text x="172" y="280" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">SVA &lt;50mm = balanced</text>
      {/* Pelvic parameters */}
      <text x="90" y="200" fontSize="9" fill="#16a34a">PI = PT + SS</text>
      <path d="M108 210 Q100 225 108 240" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="68" y="218" fontSize="9" fill="#16a34a">PT</text>
      <text x="68" y="234" fontSize="9" fill="#16a34a">SS</text>
      <text x="170" y="294" textAnchor="middle" fontSize="10" fill="#64748b">PI–LL mismatch &lt;10° ideal</text>
      {/* CORONAL — right panel */}
      <text x="490" y="36" textAnchor="middle" fontSize="13" fontWeight="600" fill="#7c3aed">Coronal Alignment</text>
      {/* Spine with scoliotic curve */}
      <path d="M490 52 Q470 90 490 130 Q510 165 490 205 Q475 235 490 265" fill="none" stroke="#c8a860" strokeWidth="3" strokeLinecap="round"/>
      {[52,72,92,112,132,152,172,192,212,232].map((y,i) => {
        const x = 490 + (i<3?-i*4:i<6?(i-5)*4:(i-7)*3);
        return <rect key={i} x={x-12} y={y} width="24" height="16" rx="3" fill="#e8d8a8" stroke="#c8a860" strokeWidth="1"/>;
      })}
      {/* Pelvis */}
      <path d="M462 252 Q490 260 518 252 L518 270 Q490 278 462 270 Z" fill="#d4c090" stroke="#c8a860" strokeWidth="1.2"/>
      {/* C7 plumb line */}
      <line x1="490" y1="52" x2="490" y2="280" stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="5 3"/>
      {/* CSVL */}
      <line x1="490" y1="258" x2="490" y2="280" stroke="#dc2626" strokeWidth="2"/>
      <text x="495" y="278" fontSize="9" fill="#dc2626">CSVL</text>
      {/* Coronal balance line */}
      <line x1="480" y1="52" x2="490" y2="52" stroke="#7c3aed" strokeWidth="1.5"/>
      <text x="495" y="55" fontSize="9" fill="#7c3aed">C7</text>
      <text x="490" y="294" textAnchor="middle" fontSize="10" fontWeight="600" fill="#7c3aed">Coronal balance &lt;20mm</text>
      {/* Normal values box */}
      <rect x="330" y="108" width="200" height="90" rx="7" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1"/>
      <text x="430" y="124" textAnchor="middle" fontSize="10" fontWeight="700" fill="#166534">Normal Values</text>
      <text x="340" y="138" fontSize="9" fill="#1e293b">SVA (C7 to S1):  &lt;50 mm</text>
      <text x="340" y="151" fontSize="9" fill="#1e293b">Coronal balance:  &lt;20 mm</text>
      <text x="340" y="164" fontSize="9" fill="#1e293b">Pelvic tilt:  &lt;20° (normal)</text>
      <text x="340" y="177" fontSize="9" fill="#1e293b">PI–LL mismatch:  &lt;10°</text>
      <text x="340" y="190" fontSize="9" fill="#1e293b">Pelvic tilt &gt;25° = compensation</text>
    </svg>
  ),

  'spine-cobb': (
    <svg viewBox="0 0 680 280" aria-label="Cobb angle scoliosis measurement">
      <text x="340" y="18" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">Cobb Angle — Scoliosis Grading</text>
      {/* Coronal spine with S-curve */}
      <text x="170" y="38" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1d4ed8">Cobb Angle Measurement</text>
      {/* Vertebrae along S-curve */}
      {[
        [170,50,8],[168,68,5],[165,86,2],[162,104,-2],[160,122,-5],
        [162,140,-2],[165,158,2],[168,176,5],[170,194,8],[170,212,6],[170,230,2]
      ].map(([x,y,rot],i) => (
        <rect key={i} x={x-15} y={y} width="30" height="14" rx="3"
          fill="#e8d8a8" stroke="#c8a860" strokeWidth="1.2"
          transform={`rotate(${rot} ${x} ${y+7})`}/>
      ))}
      {/* Cobb angle lines */}
      <line x1="135" y1="50" x2="210" y2="42" stroke="#c0392b" strokeWidth="2"/>
      <line x1="135" y1="236" x2="210" y2="244" stroke="#c0392b" strokeWidth="2"/>
      {/* Perpendiculars */}
      <line x1="172" y1="30" x2="172" y2="60" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="3 2"/>
      <line x1="172" y1="228" x2="172" y2="258" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Cobb angle arc */}
      <path d="M172 58 Q195 148 172 238" fill="none" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 2"/>
      <text x="198" y="155" fontSize="13" fontWeight="700" fill="#c0392b">Cobb°</text>
      {/* Grade boxes */}
      <rect x="280" y="40" width="370" height="200" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
      <text x="465" y="60" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e293b">Severity Classification</text>
      {[
        ['< 10°', 'Normal — no scoliosis', '#16a34a'],
        ['10–25°', 'Mild — observe, brace if progressive', '#d97706'],
        ['25–45°', 'Moderate — brace therapy', '#ea580c'],
        ['> 40–50°', 'Severe — surgical threshold', '#dc2626'],
        ['> 30° (skeletally immature)', 'High progression risk — early intervention', '#7c2d12'],
      ].map(([range, desc, color], i) => (
        <g key={i}>
          <rect x="292" y={75+i*30} width="90" height="22" rx="4" fill={color} opacity="0.15"/>
          <text x="337" y={90+i*30} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{range}</text>
          <text x="400" y={90+i*30} fontSize="11" fill="#374151">{desc}</text>
        </g>
      ))}
      <text x="465" y="228" textAnchor="middle" fontSize="10" fill="#94a3b8">Measured from superior EP of uppermost tilted VB to inferior EP of lowermost tilted VB</text>
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
        {label:'LC', x:20, y:30, desc:'Lateral Compression', color:'#fde68a', border:'#d97706', arrow:'LC'},
        {label:'APC', x:175, y:30, desc:'Ant-Post Compression', color:'#fca5a5', border:'#dc2626', arrow:'APC'},
        {label:'VS', x:20, y:155, desc:'Vertical Shear', color:'#c4b5fd', border:'#7c3aed', arrow:'VS'},
        {label:'CM', x:175, y:155, desc:'Combined Mechanism', color:'#bbf7d0', border:'#16a34a', arrow:'CM'},
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
          <text x={x+62} y={y+116} textAnchor="middle" fontSize="8" fill="#555">{desc}</text>
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
