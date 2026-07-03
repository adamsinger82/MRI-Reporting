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
  { id: 'neck',       label: 'Neck / Upper Chest', icon: '🦴' },
  { id: 'chest',      label: 'Chest',               icon: '🫀' },
  { id: 'abdopelvis', label: 'Abdomen / Pelvis',    icon: '🩻' },
  { id: 'spine',      label: 'Spine',               icon: '🦴' },
  { id: 'extremity',  label: 'Extremities / Other', icon: '🦵' },
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
];

// Convenience lookup
export const getDeviceById = (id) => DEVICES.find(d => d.id === id);
export const getDevicesByCategory = (categoryId) => DEVICES.filter(d => d.category === categoryId);

export const MR_STATUS_META = {
  safe:        { label: 'MR Safe',        color: '#4ade80' },
  conditional: { label: 'MR Conditional', color: '#facc15' },
  unsafe:      { label: 'MR Unsafe',      color: '#f87171' },
  unknown:     { label: 'Verify Before Scanning', color: '#94a3b8' },
};
