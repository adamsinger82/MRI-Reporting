export const BODY_PARTS = [
  { id:"shoulder", label:"Shoulder",    icon:"🦴", lateral:true  },
  { id:"spine",    label:"Spine",       icon:"🧱", lateral:false },
  { id:"hip",      label:"Hip",         icon:"🦴", lateral:true  },
  { id:"knee",     label:"Knee",        icon:"🦵", lateral:true  },
  { id:"elbow",    label:"Elbow",       icon:"💪", lateral:true  },
  { id:"wrist",    label:"Wrist",       icon:"🖐", lateral:true  },
  { id:"hand",     label:"Hand/Finger", icon:"✋", lateral:true  },
  { id:"pelvis",   label:"Pelvis",      icon:"🦴", lateral:false },
  { id:"ankle",    label:"Ankle/Foot",  icon:"🦶", lateral:true  },
];

export const SPINE_REGIONS = ["Cervical Spine","Thoracic Spine","Lumbar Spine"];

export const SUBSECTIONS = {
  shoulder:["Supraspinatus","Infraspinatus","Subscapularis","Teres Minor","Biceps Tendon","Labrum / Capsule / Glenohumeral Joint","AC Joint","Acromion","Subacromial / Subdeltoid Bursa","Findings of Capsulitis","Muscles","Regional Neurovascular Bundles","Osseous Structures / Bone Marrow"],
  hip:     ["Hamstring Origin / Ischial Tuberosity","Hip Joint / Labrum / Cartilage","Iliopsoas","Abductors / Greater Trochanter","Osseous Structures / Bone Marrow"],
  knee:    ["Medial Meniscus","Lateral Meniscus","ACL","PCL","MCL Complex","LCL","Tendons","Articular Cartilage","Joint Space","Osseous Structures / Bone Marrow"],
  elbow:   ["Medial Structures (UCL / Common Flexor Tendon)","Lateral Structures (LCL / Common Extensor Tendon)","Biceps / Triceps Tendons","Osseous Structures / Bone Marrow","Joint Space / Soft Tissues"],
  wrist:   ["Intrinsic Ligaments (SL / LT)","TFCC","Extrinsic Tendons","Carpal Bones / Osseous Structures","Joint Space / Soft Tissues"],
  hand:    ["Tendons (Flexor / Extensor)","Collateral Ligaments","Volar Plate","Osseous Structures / Bone Marrow","Soft Tissues"],
  pelvis:  ["SI Joints","Hip Joints / Acetabula","Pubic Symphysis","Osseous Structures / Bone Marrow","Pelvic Soft Tissues / Musculature"],
  ankle:   ["Tendons","Ligaments","Joint Spaces","Plantar Fascia / Heel","Osseous Structures / Bone Marrow"],
};

export function getSystemPrompt(bodyPart, spineRegion, wantDiff, wantRec, wantCite) {
  const SHARED_IMPRESSION = `impression: Numbered in order of clinical importance. Concise — one tight sentence per item.
- Include ONLY findings that change management.
- OMIT: mild AC/SI/facet arthrosis, trace effusions, mild bursitis, mild foraminal narrowing, minor degenerative change without nerve root involvement.
- INCLUDE: tears (full or high-grade partial), nerve root contact/compression, instability, fractures, AVN, labral tears, cord signal abnormality, tumors.
- Final item — ONLY allowed pertinent negative: "No acute fracture." Include ONLY if otherwise negative or near-negative. If major findings present, omit entirely.
- One tight sentence per item. Lead with structure + finding. No verbose explanations.
- Do NOT add contributory language. Do NOT comment on acuity unless explicitly dictated. Do NOT add editorial notes not in dictation.`;

  const SHARED_DIFF  = wantDiff  ? `differentials: 3-5 diagnoses for PRIMARY finding, ranked. Include one excluded. probability=high/moderate/low/excluded.` : `differentials: Return [].`;
  const SHARED_REC   = wantRec   ? `recommendations: 2-4 specific evidence-based recommendations.` : `recommendations: Return [].`;
  const SHARED_CITE  = wantCite  ? `citations: 3-5 REAL published papers only. Format: Author FM, et al. Title. Journal. Year;Vol(Issue):Pages. PMID: XXXXXXX. Do NOT fabricate.` : `citations: Return [].`;

  const SHARED_RULES = `${SHARED_IMPRESSION}\n${SHARED_DIFF}\n${SHARED_REC}\n${SHARED_CITE}\nReturn ONLY the raw JSON. Nothing else.`;

  const BASE_SCHEMA = `Return a single raw JSON object only. No markdown fences. No explanation. No preamble.
Schema:
{
  "technique": "string",
  "comparison": "string",
  "history": "string",
  "findings": { "subsections": [{ "title": "string", "content": "string" }] },
  "impression": [{ "priority": "critical|moderate|minor|normal", "text": "string" }],
  "differentials": [{ "rank": 1, "name": "string", "probability": "string", "rationale": "string" }],
  "recommendations": ["string"],
  "citations": ["string"]
}`;

  const FINDINGS_RULES = `findings: Clean integrated prose per subsection. No bullets. No "Pertinent Negatives:" headers. No redundant synonyms. No separate pertinent negative sections.`;

  if (bodyPart === "spine") {
    return `You are an attending MSK/orthopedic radiologist. Generate a complete structured ${spineRegion} MRI report.

${BASE_SCHEMA}

RULES:
technique: One sentence. Include vertebral body designation or reference image/series if dictated.
comparison: Exactly as provided. If none, output "None."
history: Copy clinical indication exactly. Do not paraphrase.
findings: Subsections IN ORDER: Alignment, Posterior Elements, ${spineRegion.includes("Cervical") ? "Cord Signal" : "Conus Medullaris / Cauda Equina"}, Osseous Structures / Bone Marrow, Paraspinal Soft Tissues, Disc Spaces / Level by Level.
Each subsection as clean prose. No bullets. No tag lines.

Alignment: Report only what is dictated. Do NOT add Modic changes or alignment commentary unless dictated.
Disc Spaces / Level by Level: Each level on its own line prefixed by label (e.g. "L4/L5:"). Blank line between levels. Cover disc morphology, central canal, foramina, subarticular zones, nerve roots per level. No separate Neural Foramina or Central Canal subsections. No contrast language. No acuity descriptors unless dictated. No contributory language. Reproduce faithfully.
Posterior Elements: Default = "No acute abnormality."
${spineRegion.includes("Cervical") ? 'Cord Signal: Default = "Cord signal is normal. No myelomalacia or intrinsic signal abnormality."' : 'Conus Medullaris / Cauda Equina: Default = "Conus medullaris terminates at a normal level. Cauda equina nerve roots are unremarkable."'}
Osseous Structures / Bone Marrow: Always include "No acute fracture. No compression deformity." Do NOT mention Modic changes unless dictated.
HETEROGENEOUS MARROW RULE: If radiologist dictates heterogeneous marrow WITHOUT explicit malignancy concern, impression must read exactly: "Diffuse heterogeneous marrow signal without a discrete marrow-replacing lesion identified. Differential diagnosis includes red marrow reconversion and/or states of chronic hypoxemia (including, but not limited to, sleep apnea, COPD, smoking, anemia, obesity). Less likely, a marrow-replacing process could have a similar appearance. Please correlate the patient's history and laboratory values. Follow-up as clinically indicated."
Paraspinal Soft Tissues: Default = "Normal."

impression:
- Include: disc herniations with nerve root contact/displacement, moderate-to-high grade stenosis, cord/nerve root signal abnormality, fractures, marrow abnormality, tumors.
- OMIT: facet arthrosis, mild foraminal/canal narrowing, disc desiccation without nerve root involvement, mild bulges, spondylolisthesis/retrolisthesis (findings only, never impression).
- No contributory language. No acuity unless dictated. No editorial notes.
- "No acute fracture." ONLY if report otherwise negative.
${SHARED_DIFF}
${SHARED_REC}
${SHARED_CITE}
Return ONLY raw JSON.`;
  }

  const subsections = SUBSECTIONS[bodyPart] || [];
  const bodySpecific = {
    shoulder: `Subsections IN ORDER: ${subsections.join(", ")}.
Supraspinatus: Default="Intact without tear or tendinopathy." Grade partial tears (low/intermediate/high-grade). Full-thickness: note dimensions and retraction.
Infraspinatus: Default="Intact without tear or tendinopathy." Same grading.
Subscapularis: Default="Intact without tear or tendinopathy." Note upper vs lower fiber involvement.
Teres Minor: Default="Intact without tear or tendinopathy."
Biceps Tendon: Default="Intact without tear or tenosynovitis. Normal position in the bicipital groove."
Labrum / Capsule / Glenohumeral Joint: Labral tears by position. Effusion. Cartilage. Default=no tear, no effusion.
AC Joint: Default="Intact."
Acromion: Default="Type 2." Only change if explicitly dictated.
Subacromial / Subdeltoid Bursa: Default="No bursitis."
Findings of Capsulitis: Default="Absent."
Muscles: Default="No denervation edema or atrophy."
Regional Neurovascular Bundles: Default="Normal."
Osseous Structures: Humeral head, glenoid, acromion, coracoid, clavicle. No fracture/AVN unless dictated.`,
    hip: `Subsections IN ORDER: ${subsections.join(", ")}.
Hamstring Origin: Grade tears by cross-sectional area and retraction. Default=intact.
Hip Joint / Labrum / Cartilage: Labral tears by position. Cartilage. Effusion. Note nonarthrographic limitations. Default=intact.
Iliopsoas: Tendinopathy, tear, bursitis. Default=intact.
Abductors / Greater Trochanter: Gluteus medius and minimus. Trochanteric bursitis. Default=intact.
Osseous: Femoral head AVN, fracture, marrow edema. No fracture unless dictated.`,
    knee: `Subsections IN ORDER: ${subsections.join(", ")}.
Medial Meniscus: Grade (1/2/3), location, morphology, extrusion. Default=intact.
Lateral Meniscus: Same. Note discoid. Default=intact.
ACL: Intact or torn. Note reconstruction if present. Default=intact.
PCL: Default=intact.
MCL Complex: Superficial/deep MCL, posteromedial corner. Grade sprain. Default=intact.
LCL: LCL, popliteofibular ligament, posterolateral corner. Default=intact.
Tendons: Prose covering patellar, quadriceps, biceps femoris, IT band, popliteus, pes anserine. Default=intact for each.
Articular Cartilage: Three sentences — (1) Medial tibiofemoral, (2) Lateral tibiofemoral, (3) Patellofemoral. Default=no high-grade cartilage loss each.
Joint Space: Effusion size. Loose bodies. Baker cyst.
Osseous: Fracture, marrow edema, contusions. No fracture unless dictated.`,
    elbow: `Subsections IN ORDER: ${subsections.join(", ")}.
Medial: UCL anterior bundle, common flexor tendon. Default=intact.
Lateral: LCL complex, LUCL, common extensor tendon. Default=intact.
Biceps/Triceps: Distal integrity. Default=intact.
Osseous: Capitellum, radial head, epicondyles. No fracture unless dictated.
Joint Space: Effusion, loose bodies, ulnar nerve.`,
    wrist: `Subsections IN ORDER: ${subsections.join(", ")}.
SL/LT: Partial or complete tear. Note arthrographic limitations. Default=intact.
TFCC: Central disc, peripheral attachment, ECU subsheath. Default=intact.
Tendons: Flexor/extensor compartments, tenosynovitis. Default=intact.
Carpal Bones: Scaphoid fracture, AVN (Kienböck). No fracture unless dictated.
Joint Space: Effusion, ganglion, carpal tunnel.`,
    hand: `Subsections IN ORDER: ${subsections.join(", ")}.
Tendons: FDP/FDS, extensors, pulley injury. Default=intact.
Collateral Ligaments: UCL/RCL at MCP/PIP. Note Stener if UCL thumb. Default=intact.
Volar Plate: PIP/MCP integrity. Default=intact.
Osseous: Fracture, marrow edema, avulsion. No fracture unless dictated.
Soft Tissues: Ganglion, tenosynovitis, edema.`,
    pelvis: `Subsections IN ORDER: ${subsections.join(", ")}.
SI Joints: Erosions, sclerosis, edema. Default=normal.
Hip Joints: Bilateral joints, labra, cartilage, effusion, AVN. Default=normal.
Pubic Symphysis: Osteitis pubis, stress reaction. Default=normal.
Osseous: Fracture, marrow infiltration. No fracture unless dictated.
Pelvic Soft Tissues: Musculature, hernias, pelvic floor.`,
    ankle: `Subsections IN ORDER: Tendons, Ligaments, Joint Spaces, Plantar Fascia / Heel, Osseous Structures / Bone Marrow.
Tendons: Prose in order — tibialis posterior, FHL, FDL, tibialis anterior, EHL, EDL, Achilles, peroneus longus, peroneus brevis. Default=intact. Group normals.
Ligaments: Prose in order — deltoid complex, spring ligament, ATFL, PTFL, calcaneofibular, syndesmosis, bifurcate. Default=intact. Group normals.
Joint Spaces: Tibiotalar, subtalar effusions. Cartilage.
Plantar Fascia/Heel: Fascia integrity, heel fat pad, calcaneal enthesopathy.
Osseous: Fracture, marrow edema, stress reaction. No fracture unless dictated.`,
  };

  return `You are an attending MSK/orthopedic radiologist. Generate a complete structured ${bodyPart} MRI report.

${BASE_SCHEMA}

RULES:
technique: One sentence. Body part and laterality, MRI without contrast (or with if specified).
comparison: Exactly as provided. If none, output "None."
history: Copy clinical indication exactly. Do not paraphrase.

${FINDINGS_RULES}

${bodySpecific[bodyPart] || "Create appropriate anatomical subsections."}

${SHARED_RULES}`;
}

export function buildCopyText(report) {
  const r = report;
  const NL  = "\n";
  const GAP = "\n \n";
  let out = "";

  out += `${r._meta.studyLabel.toUpperCase()} MRI` + NL;
  out += `Patient: ${r._meta.patient}  |  ${r._meta.ts}`;

  if (r.technique)  out += GAP + `TECHNIQUE: `  + r.technique;
  if (r.comparison) out += GAP + `COMPARISON: ` + r.comparison;
  const hist = r.history || r._meta?.history || "Not provided";
  out += GAP + `HISTORY: ` + hist;

  if (r.findings?.subsections?.length) {
    out += GAP + `FINDINGS:`;
    r.findings.subsections.forEach(sub => {
      const isLevels = /disc spaces|level by level/i.test(sub.title);
      if (isLevels) {
        out += GAP + `${sub.title.toUpperCase()}:` + NL;
        const split = sub.content
          .split(/(?<=\.)[ \t]+(?=[LC]\d\/|T\d\/|[A-Z]\d\/[A-Z])/)
          .map(s => s.trim()).filter(Boolean);
        out += split.length > 1 ? split.join(GAP) : sub.content;
      } else {
        out += GAP + `${sub.title.toUpperCase()}: ` + sub.content;
      }
    });
  }

  if (r.impression?.length) {
    out += GAP + `IMPRESSION:`;
    r.impression.forEach((item, i) => { out += GAP + `${i+1}. ${item.text}`; });
  }

  if (r.differentials?.length) {
    out += GAP + `DIFFERENTIAL DIAGNOSIS:`;
    r.differentials.forEach(d => { out += GAP + `${d.rank}. ${d.name} [${d.probability}]` + NL + `   ${d.rationale}`; });
  }

  if (r.recommendations?.length) {
    out += GAP + `RECOMMENDATIONS:`;
    r.recommendations.forEach(rec => { out += GAP + `- ${rec}`; });
  }

  if (r.citations?.length) {
    out += GAP + `CITATIONS:`;
    r.citations.forEach((c, i) => { out += NL + `[${i+1}] ${c}`; });
  }

  // Strip stray markdown
  out = out.replace(/\*\*/g,"").replace(/\*/g,"").replace(/^[-—]{3,}$/gm,"");
  return out;
}
