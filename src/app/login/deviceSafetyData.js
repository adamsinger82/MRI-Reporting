// deviceSafetyData.js — LucidMSK MRI Device ID & Safety reference
// Static, pre-authored content — no runtime AI/API calls, no ACR licensing.
// Educational reference only. NOT Clinical Decision Support: always confirm
// device identity and MR conditions against official manufacturer documentation
// and institutional MRI safety policy before scanning.

export const BOOKMARKS_TABLE = 'device_bookmarks';

// Supabase row shape (for reference):
// { id: uuid, user_id: uuid, device_id: text, created_at: timestamptz }
//
// SQL to run in Supabase once:
// CREATE TABLE device_bookmarks (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
//   device_id text NOT NULL,
//   created_at timestamptz DEFAULT now(),
//   UNIQUE(user_id, device_id)
// );
// ALTER TABLE device_bookmarks ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users manage own device bookmarks"
//   ON device_bookmarks FOR ALL
//   USING (auth.uid() = user_id);

// Anatomic-location categories, in display order
export const DEVICE_CATEGORIES = [
  { id: 'head',       label: 'Head / Intracranial', icon: '🧠' },
  { id: 'neck',       label: 'Neck / Upper Chest', icon: '🦴' },
  { id: 'chest',      label: 'Chest',               icon: '🫀' },
  { id: 'abdopelvis', label: 'Abdomen / Pelvis',    icon: '🩻' },
  { id: 'spine',      label: 'Spine',               icon: '🦴' },
  { id: 'extremity',  label: 'Extremities / Other', icon: '🦵' },
  { id: 'foreign',    label: 'Foreign Bodies (Retained)', icon: '🎯' },
];

// mrStatus: 'safe' | 'conditional' | 'unsafe' | 'unknown'
// images: paths under public/devices/ (hyphenated folders, no spaces)
export const DEVICES = [
  {
    id: 'inspire-hypoglossal',
    name: 'Inspire Hypoglossal Nerve Stimulator',
    category: 'neck',
    aliases: ['Inspire UAS', 'hypoglossal nerve stimulator'],
    mrStatus: 'conditional',
    conditions: 'MR Conditional at 1.5T only under specific manufacturer parameters (head/neck coil restrictions, SAR limits). Confirm current conditions directly with Inspire Medical Systems before scanning — conditions have changed across device generations.',
    distinguishing: [
      'Small pulse generator in right upper chest, similar position to a pacemaker — but look for the separate sensing lead running toward the chest wall (respiratory sensing lead) in addition to the stimulation lead running up into the neck.',
      'Stimulation lead courses cephalad into the submandibular/neck region toward the hypoglossal nerve — pacemakers and ICDs do not have a lead in this location.',
      'No leads enter the heart/great vessels, distinguishing it from cardiac devices.',
    ],
    lookalikes: ['pacemaker', 'vagal-nerve-stimulator'],
    referenceLinks: [
      { label: 'Inspire Medical Systems — official site', url: 'https://www.inspiresleep.com' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/inspire-hypoglossal/xray-ap.jpg',
    notes: 'First-build "wow factor" device — frequently misidentified as a pacemaker on chest X-ray.',
  },
  {
    id: 'vagal-nerve-stimulator',
    name: 'Vagal Nerve Stimulator (VNS)',
    category: 'neck',
    aliases: ['VNS', 'LivaNova VNS'],
    mrStatus: 'conditional',
    conditions: 'MR Conditional under manufacturer-specific parameters; some generators require the device be turned off and specific coil/SAR restrictions apply. Verify against current manufacturer labeling.',
    distinguishing: [
      'Generator sits in left upper chest (classically left, unlike Inspire which is typically right-sided).',
      'Single lead courses cephalad along the left neck toward the vagus nerve, wrapping the carotid sheath — no intracardiac or intrathoracic lead course.',
    ],
    lookalikes: ['inspire-hypoglossal', 'pacemaker'],
    referenceLinks: [
      { label: 'LivaNova — official site', url: 'https://www.livanova.com' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/vagal-nerve-stimulator/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'pacemaker',
    name: 'Pacemaker',
    category: 'chest',
    aliases: ['permanent pacemaker', 'PPM'],
    mrStatus: 'conditional',
    conditions: 'Most modern pacemakers are MR Conditional; legacy/abandoned-lead systems may be unsafe. MR Conditional status, allowed field strength, and required device settings must be confirmed per specific make/model — never assume from appearance alone.',
    distinguishing: [
      'Generator can (thin), typically 1–2 leads seen coursing through the subclavian vein into the right atrium and/or right ventricle.',
      'Leads terminate WITHIN the cardiac chambers (atrial and/or ventricular tip) — this is the key differentiator from an ICD, which has a visibly thicker shock coil segment.',
      'No lead should be seen coursing toward the neck (that would suggest Inspire/VNS) or coiled in the epidural/intrathecal space (spinal cord stimulator/pump).',
    ],
    lookalikes: ['icd', 'loop-recorder'],
    referenceLinks: [
      { label: 'Medtronic — MR Conditional Search Tool', url: 'https://www.medtronic.com/en-us/healthcare-professionals/mri-resources/mr-conditional-search-tool.html' },
      { label: 'Abbott — MRI Safety for Cardiac Devices', url: 'https://www.cardiovascular.abbott/us/en/hcp/mri-safety.html' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/pacemaker/xray-ap.jpg',
    notes: 'Part of the cardiac-device differentiation trio — pair with ICD and loop recorder entries.',
  },
  {
    id: 'icd',
    name: 'Implantable Cardioverter-Defibrillator (ICD)',
    category: 'chest',
    aliases: ['ICD', 'AICD'],
    mrStatus: 'conditional',
    conditions: 'Many current-generation ICDs are MR Conditional, but confirmation of make/model and completeness of the lead system (no abandoned or fractured leads) is mandatory before scanning. Legacy ICDs are frequently MR Unsafe.',
    distinguishing: [
      'Generator can is typically larger/thicker than a pacemaker can.',
      'Look for one or two radiodense "shock coil" segments along the lead — a longer, denser, coiled segment in the right ventricle (and sometimes SVC) — this is the single most reliable distinguishing feature from a pacemaker lead.',
      'Leads terminate in the right ventricle ± right atrium, same general course as a pacemaker.',
    ],
    lookalikes: ['pacemaker', 'loop-recorder'],
    referenceLinks: [
      { label: 'Medtronic — MR Conditional Search Tool', url: 'https://www.medtronic.com/en-us/healthcare-professionals/mri-resources/mr-conditional-search-tool.html' },
      { label: 'Abbott — MRI Safety for Cardiac Devices', url: 'https://www.cardiovascular.abbott/us/en/hcp/mri-safety.html' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/icd/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'loop-recorder',
    name: 'Implantable Loop Recorder (ILR)',
    category: 'chest',
    aliases: ['ILR', 'Reveal LINQ', 'insertable cardiac monitor', 'ICM'],
    mrStatus: 'safe',
    conditions: 'Modern loop recorders (e.g., LINQ-type devices) are generally MR Conditional/labeled safe with no special restrictions — but confirm generation/model, as this simplifies workflow considerably compared to pacemakers/ICDs.',
    distinguishing: [
      'No leads at all — small (matchstick-sized), thin radiodense strip typically implanted subcutaneously over the left parasternal chest, NOT connected to the heart.',
      'Absence of any transvenous lead is the key differentiator from every other cardiac device on this list.',
    ],
    lookalikes: ['pacemaker', 'icd'],
    referenceLinks: [
      { label: 'Medtronic — MR Conditional Search Tool', url: 'https://www.medtronic.com/en-us/healthcare-professionals/mri-resources/mr-conditional-search-tool.html' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/loop-recorder/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'sacral-nerve-stimulator',
    name: 'Sacral Nerve Stimulator (InterStim / Axonics)',
    category: 'abdopelvis',
    aliases: ['InterStim', 'Axonics', 'sacral neuromodulation'],
    mrStatus: 'conditional',
    conditions: 'Newer InterStim Micro and Axonics systems are MR Conditional (full-body, specific field strength) under manufacturer parameters. Older InterStim II systems have more restrictive, region-limited conditions. Model identification is essential before clearing.',
    distinguishing: [
      'Small generator implanted in the upper buttock/posterior pelvis (not abdominal wall), with a lead coursing to the S3 sacral foramen — the sacral foramen lead entry point is the hallmark finding.',
      'Distinguish from an intrathecal pump: pumps sit in the anterior abdominal wall with a catheter coursing posteriorly into the spinal canal, whereas sacral stimulators are entirely posterior/pelvic.',
    ],
    lookalikes: ['intrathecal-pump'],
    referenceLinks: [
      { label: 'Medtronic — MRI Resources for Implanted Devices', url: 'https://www.medtronic.com/en-us/healthcare-professionals/mri-resources.html' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/sacral-nerve-stimulator/xray-ap.jpg',
    notes: 'First-build "wow factor" device.',
  },
  {
    id: 'ivc-filter',
    name: 'IVC Filter',
    category: 'abdopelvis',
    aliases: ['inferior vena cava filter', 'Greenfield filter'],
    mrStatus: 'safe',
    conditions: 'The large majority of contemporary IVC filters are MR Safe/Conditional at 1.5T and 3T. Confirm filter type if uncertain — extremely rare legacy filters may carry restrictions.',
    distinguishing: [
      'Conical or cage-like metallic structure in the midline at the level of the renal veins, oriented along the course of the IVC — distinct silhouette from any stimulator or pump.',
    ],
    lookalikes: [],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/ivc-filter/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'spinal-cord-stimulator',
    name: 'Spinal Cord Stimulator (SCS) + Battery Pack',
    category: 'spine',
    aliases: ['SCS', 'dorsal column stimulator'],
    mrStatus: 'conditional',
    conditions: 'MR Conditional status is highly device- and lead-specific; many systems require specific body-part-only scanning or exclude head/neck imaging. Full-body MR Conditional systems exist but must not be assumed — verify exact model.',
    distinguishing: [
      'Battery/generator implanted in the buttock or abdominal wall (flank), connected to one or two thin percutaneous or paddle-type leads that course into the epidural space and run cephalad along the spinal canal, typically to the thoracic level.',
      'Leads sit in the EPIDURAL space, parallel to and just posterior to the vertebral bodies on lateral views — never enter the thecal sac itself.',
      'Key differentiator from an intrathecal pump: SCS leads run cephalad within the epidural space (spinal cord stimulation target); pump catheters terminate at a single low lumbar level (intrathecal drug delivery target) and the pump reservoir is visibly larger/rounder than an SCS battery.',
    ],
    lookalikes: ['intrathecal-pump'],
    referenceLinks: [
      { label: 'Boston Scientific — ImageReady MR-Conditional SCS Systems', url: 'https://www.bostonscientific.com/imageready/uk/en/scs-systems.html' },
      { label: 'Medtronic — MRI Resources for Implanted Devices', url: 'https://www.medtronic.com/en-us/healthcare-professionals/mri-resources.html' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/spinal-cord-stimulator/xray-ap.jpg',
    notes: 'First-build "wow factor" device — classic mix-up with intrathecal pump.',
  },
  {
    id: 'intrathecal-pump',
    name: 'Intrathecal Pain Pump',
    category: 'spine',
    aliases: ['baclofen pump', 'morphine pump', 'implantable drug pump'],
    mrStatus: 'conditional',
    conditions: 'Most intrathecal pumps are MR Conditional, but scanning can transiently suspend or alter pump function (rotor stall) — coordination with the prescribing/programming service before and after MRI is required regardless of MR labeling.',
    distinguishing: [
      'Round, disc-shaped reservoir implanted in the anterior abdominal wall (subcutaneous, often lower quadrant) — visibly larger and rounder than any neurostimulator battery.',
      'Single catheter courses from the pump posteriorly around the flank into the spinal canal, terminating at a single low lumbar level within the thecal sac (intrathecal) — it does not run cephalad along multiple levels the way an SCS lead does.',
    ],
    lookalikes: ['spinal-cord-stimulator'],
    referenceLinks: [
      { label: 'Medtronic — SynchroMed III Intrathecal Pump', url: 'https://www.medtronic.com/en-us/healthcare-professionals/products/neurological/drug-infusion-systems/synchromed-iii-intrathecal-pump.html' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/intrathecal-pump/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'penile-implant',
    name: 'Penile Implant (Inflatable / Malleable Prosthesis)',
    category: 'abdopelvis',
    aliases: ['penile pump', 'inflatable penile prosthesis', 'IPP'],
    mrStatus: 'conditional',
    conditions: 'Modern penile prostheses (silicone cylinders, titanium/silicone pump and reservoir) are generally MR Conditional/Safe with minimal ferromagnetic content. Confirm manufacturer if an older or unusual construct is suspected.',
    distinguishing: [
      'Paired radiopaque cylinders within the corpora cavernosa (penile shaft), a pump in the scrotum, and a fluid reservoir in the pelvis near the bladder — this three-component layout is the hallmark.',
      'Distinguish from an artificial urinary sphincter (AUS): AUS has a periurethral cuff instead of paired corporal cylinders, even though both use a scrotal pump and pelvic reservoir.',
    ],
    lookalikes: [],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/penile-implant/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'vaginal-mesh-sling',
    name: 'Vaginal Mesh / Suburethral Sling',
    category: 'abdopelvis',
    aliases: ['transvaginal mesh', 'midurethral sling', 'TVT', 'TOT'],
    mrStatus: 'safe',
    conditions: 'Synthetic mesh/sling material (polypropylene) is nonmetallic and MR Safe. Any associated bone anchors (older sling techniques) are typically nonferromagnetic, but confirm if present.',
    distinguishing: [
      'Often invisible or only a faint, thin curvilinear soft-tissue density along the urethra or vaginal wall on radiographs — usually confirmed on cross-sectional imaging rather than X-ray.',
      'Distinguish from older bone-anchor sling systems, which show discrete small metallic anchors fixed to the pubic bone.',
    ],
    lookalikes: [],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/vaginal-mesh-sling/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'hip-arthroplasty',
    name: 'Hip Arthroplasty (Total / Partial)',
    category: 'extremity',
    aliases: ['THA', 'hemiarthroplasty', 'hip replacement'],
    mrStatus: 'conditional',
    conditions: 'The large majority of modern hip implants (titanium, cobalt-chromium, ceramic) are MR Conditional at 1.5T and 3T with routine protocols; expect local susceptibility artifact. Confirm component material if an unusual or very old construct is suspected.',
    distinguishing: [
      'Femoral stem with a head component articulating within an acetabular cup indicates total hip arthroplasty.',
      'Hemiarthroplasty (partial replacement) lacks the acetabular cup — the femoral head component articulates directly with the native acetabulum. This presence/absence of a cup is the key differentiator.',
    ],
    lookalikes: [],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/hip-arthroplasty/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'deep-brain-stimulator',
    name: 'Deep Brain Stimulator (DBS)',
    category: 'head',
    aliases: ['DBS', 'neurostimulator for Parkinson\u2019s'],
    mrStatus: 'conditional',
    conditions: 'Modern DBS systems (Medtronic Percept, Boston Scientific Vercise, Abbott Infinity) are MR Conditional for head-only or full-body scans depending on the exact model and generator settings. Confirm device family and required parameters before scanning — incomplete, fractured, or abandoned lead systems are a contraindication.',
    distinguishing: [
      'Battery/generator implanted in the chest, similar position to a pacemaker, with thin leads running subcutaneously up the neck and through bilateral burr holes into the brain.',
      'Bilateral, symmetric intracranial lead tips are the hallmark — this distinguishes DBS from VNS/Inspire (single, unilateral, neck-only lead) and from cardiac devices (leads stay within the heart, never intracranial).',
    ],
    lookalikes: ['vagal-nerve-stimulator', 'inspire-hypoglossal'],
    referenceLinks: [
      { label: 'Medtronic — DBS MRI Information', url: 'https://www.medtronic.com/en-us/healthcare-professionals/specialties/neurology/therapies-procedures/deep-brain-stimulation/mri-information.html' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/deep-brain-stimulator/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'aneurysm-coils',
    name: 'Intracranial Aneurysm Coils',
    category: 'head',
    aliases: ['GDC coils', 'endovascular coiling', 'platinum coils'],
    mrStatus: 'safe',
    conditions: 'Virtually all modern detachable platinum embolization coils are nonferromagnetic and MR Safe at 1.5T and 3T, including immediately after placement.',
    distinguishing: [
      'Tightly wound, tangled, ball-like cluster of fine radiodense wire confined to the expected aneurysm location — no discrete rigid blades or hinges.',
      'Distinguish from aneurysm clips by the coiled, amorphous wire-mesh appearance rather than a rigid, discrete blade shape.',
    ],
    lookalikes: ['aneurysm-clips'],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/aneurysm-coils/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'aneurysm-clips',
    name: 'Intracranial Aneurysm Clips',
    category: 'head',
    aliases: ['cerebral aneurysm clip', 'Yasargil clip', 'Sugita clip'],
    mrStatus: 'unknown',
    conditions: 'CRITICAL SAFETY POINT: clips placed before the mid-1990s may be made of ferromagnetic stainless steel and are MR UNSAFE. Clips made of titanium, titanium alloy, Elgiloy, Phynox, or MP35N are nonferromagnetic and MR Safe/Conditional. Never assume safety from appearance alone — confirm the specific clip material via operative records or manufacturer documentation. If the material cannot be confirmed, treat as unsafe.',
    distinguishing: [
      'Rigid, discrete blade-shaped hardware (straight or curved spring-clip configuration) fixed at the expected aneurysm neck location.',
      'Distinguish from coils by the rigid, hinge-and-blade shape rather than a wound, amorphous wire mass.',
    ],
    lookalikes: ['aneurysm-coils'],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (aneurysm clip lookup by brand/model)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/aneurysm-clips/xray-ap.jpg',
    notes: 'Classic radiology safety teaching point — always verify material before clearing for MRI.',
  },
  {
    id: 'tips-shunt',
    name: 'TIPS (Transjugular Intrahepatic Portosystemic Shunt)',
    category: 'abdopelvis',
    aliases: ['TIPS stent', 'portosystemic shunt'],
    mrStatus: 'safe',
    conditions: 'Modern TIPS stents (nitinol or stainless steel, often ePTFE-covered) are MR Safe/Conditional and can typically be scanned safely without a required waiting period.',
    distinguishing: [
      'Tubular metallic stent traversing the liver parenchyma in an oblique course, connecting the portal vein to a hepatic vein.',
      'The transhepatic oblique course is the hallmark, distinguishing it from biliary or other abdominal vascular stents.',
    ],
    lookalikes: ['cbd-stent'],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/tips-shunt/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'cbd-stent',
    name: 'Common Bile Duct (Biliary) Stent',
    category: 'abdopelvis',
    aliases: ['biliary stent', 'CBD stent', 'ERCP stent'],
    mrStatus: 'safe',
    conditions: 'Both plastic and metallic (nitinol) biliary stents are MR Safe/Conditional; no special precautions are typically required.',
    distinguishing: [
      'Thin tubular stent along the expected biliary tree — plastic stents are faintly radiopaque or radiolucent; metallic self-expanding stents show a radiodense mesh pattern.',
      'Often has a pigtail or flanged end projecting into the duodenum. Distinguish from TIPS by its biliary-tree location rather than a transhepatic portal-to-hepatic-vein course.',
    ],
    lookalikes: ['tips-shunt'],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/cbd-stent/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'esophageal-stent',
    name: 'Esophageal Stent',
    category: 'chest',
    aliases: ['esophageal SEMS'],
    mrStatus: 'safe',
    conditions: 'Self-expanding metallic esophageal stents (nitinol) are MR Safe/Conditional.',
    distinguishing: [
      'Long, tubular, self-expanding mesh stent coursing vertically in the posterior mediastinum along the expected esophageal course.',
      'Distinguish from an airway (tracheobronchial) stent by its posterior, retrocardiac position rather than the airway\u2019s more central/anterior course.',
    ],
    lookalikes: [],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/esophageal-stent/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'laac-device',
    name: 'Left Atrial Appendage Closure Device (e.g., WATCHMAN)',
    category: 'chest',
    aliases: ['WATCHMAN', 'Amplatzer Amulet', 'LAAO device'],
    mrStatus: 'conditional',
    conditions: 'WATCHMAN and WATCHMAN FLX devices are MR Conditional; specific conditions vary by device generation (check the patient\u2019s implant card). Implants placed before 2022 require limiting continuous scan duration to 15 minutes. Confirm device generation before scanning.',
    distinguishing: [
      'Small, rounded, parachute- or umbrella-shaped self-expanding nitinol mesh device at the left atrial appendage, near the left heart border.',
      'Distinguish from a coronary stent (elongated, tubular, within a coronary artery) or a prosthetic valve (ring/frame at a valve annulus) by its rounded, cap-like shape and characteristic left atrial appendage location.',
    ],
    lookalikes: ['cardiac-valve-replacement'],
    referenceLinks: [
      { label: 'Boston Scientific — WATCHMAN MRI Guidelines', url: 'https://www.bostonscientific.com/imageready/en-US/watchman-mri-guidelines.html' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/laac-device/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'carotid-stent',
    name: 'Carotid Artery Stent',
    category: 'neck',
    aliases: ['carotid stenting', 'CAS'],
    mrStatus: 'safe',
    conditions: 'Modern self-expanding nitinol carotid stents are MR Safe/Conditional. Older teaching of a mandatory waiting period is largely outdated for current nitinol designs, but confirm manufacturer labeling if an older stent type is suspected.',
    distinguishing: [
      'Thin, tubular, self-expanding mesh stent at the carotid bifurcation in the neck, following the vessel lumen.',
      'Distinguish from surgical clips or staples (from prior carotid endarterectomy) by its mesh, tubular conformation rather than discrete point hardware.',
    ],
    lookalikes: [],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/carotid-stent/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'aortic-stent-graft',
    name: 'Aortic Stent Graft (EVAR / TEVAR)',
    category: 'abdopelvis',
    aliases: ['EVAR', 'TEVAR', 'endograft', 'AAA stent graft'],
    mrStatus: 'conditional',
    conditions: 'Most modern aortic stent grafts (e.g., Medtronic Endurant, Gore Excluder, Cook Zenith) are MR Conditional at 1.5T and 3T. Confirm manufacturer/model, as exact conditions and scan parameters vary by device.',
    distinguishing: [
      'Large-caliber tubular metallic stent-graft skeleton conforming to the abdominal aorta (EVAR) or thoracic aorta (TEVAR), often bifurcated into the iliac arteries for EVAR.',
      'The large caliber and aortic/iliac distribution distinguish it from smaller peripheral or visceral vascular stents.',
    ],
    lookalikes: ['tips-shunt'],
    referenceLinks: [
      { label: 'Medtronic — Endurant Stent Graft MRI Safety Information', url: 'https://www.medtronic.com/en-us/l/patients/treatments-therapies/stent-graft-aaa/important-safety-information.html' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/aortic-stent-graft/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'cardiac-valve-replacement',
    name: 'Cardiac Valve Replacement (Surgical or Transcatheter)',
    category: 'chest',
    aliases: ['TAVR', 'prosthetic heart valve', 'mechanical valve', 'bioprosthetic valve'],
    mrStatus: 'conditional',
    conditions: 'Essentially all modern surgical and transcatheter heart valves (Edwards SAPIEN, Medtronic CoreValve/Evolut, mechanical valves) are MR Conditional/Safe at 1.5T and 3T with no clinically significant heating or displacement expected. Confirm valve type per implant card if documentation is unclear.',
    distinguishing: [
      'Ring- or frame-shaped radiodense hardware at the expected location of a cardiac valve annulus (aortic, mitral, etc.).',
      'Surgical mechanical valves show a discrete rigid ring with occluder leaflets; transcatheter valves (TAVR) show a shorter stent-like frame directly at the aortic annulus, often with adjacent native leaflet calcification.',
    ],
    lookalikes: ['laac-device'],
    referenceLinks: [
      { label: 'Edwards Lifesciences — Heart Valve MRI Safety Information', url: 'https://edwardsprod.blob.core.windows.net/media/Gb/devices/heart%20valves/hvt/edwards-us-mri-safety-information.pdf' },
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/cardiac-valve-replacement/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'bullets-fragments',
    name: 'Retained Bullet / Fragment',
    category: 'foreign',
    aliases: ['gunshot fragment', 'retained bullet', 'shrapnel'],
    mrStatus: 'unknown',
    conditions: 'Most lead-core bullets and fragments are nonferromagnetic and low risk, but some military or steel-jacketed/steel-core ammunition is ferromagnetic and can migrate or heat. Screening for ferromagnetic potential (or a ballistics/manufacturer consult) is recommended before scanning, especially for fragments near the eye, spinal canal, or major vessels/nerves.',
    distinguishing: [
      'Irregular, often mushroomed or fragmented metallic density with an associated soft-tissue trauma tract; may be single or multiple.',
      'Location relative to critical structures (globe, spinal canal, vasculature) determines the urgency of pre-scan risk assessment.',
    ],
    lookalikes: ['bbs'],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/bullets-fragments/xray-ap.jpg',
    notes: '',
  },
  {
    id: 'bbs',
    name: 'Retained BB',
    category: 'foreign',
    aliases: ['BB pellet', 'airsoft/BB gun pellet'],
    mrStatus: 'unknown',
    conditions: 'Steel BBs are ferromagnetic and pose a migration/heating risk. Copper-coated or lead BBs are generally safer, but composition often cannot be confirmed radiographically — treat as ferromagnetic until proven otherwise, particularly for periorbital or intraocular BBs, where even a small ferromagnetic fragment can cause vision-threatening injury.',
    distinguishing: [
      'Small (roughly 4\u20135 mm), uniformly round, smooth spherical density.',
      'The perfectly spherical shape (versus the irregular shape of bullet fragments) is the key distinguishing feature. Frequently periorbital/facial or in extremity soft tissue.',
    ],
    lookalikes: ['bullets-fragments'],
    referenceLinks: [
      { label: 'MRIsafety.com — THE List (cross-manufacturer reference)', url: 'https://www.mrisafety.com' },
    ],
    imagePath: '/devices/bbs/xray-ap.jpg',
    notes: '',
  },
];
export const getDeviceById = (id) => DEVICES.find(d => d.id === id);
export const getDevicesByCategory = (categoryId) => DEVICES.filter(d => d.category === categoryId);

export const MR_STATUS_META = {
  safe:        { label: 'MR Safe',        color: '#4ade80' },
  conditional: { label: 'MR Conditional', color: '#facc15' },
  unsafe:      { label: 'MR Unsafe',      color: '#f87171' },
  unknown:     { label: 'Verify Before Scanning', color: '#94a3b8' },
};
