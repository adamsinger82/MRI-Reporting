// sampleReportExamples.js — LucidMSK Report Style Preview
// A single fixed, entirely fictional shoulder MRI case (massive rotator
// cuff tear with cuff arthropathy) written out ONCE and hardcoded here as
// static text — never regenerated live, never calls the API. Used only by
// the "Report Styles" tab in ReportPreferencesPanel.jsx so users can pick a
// starting style by reading real examples instead of abstract toggle names.
//
// Every example below follows the app's permanent rules: Goutallier is the
// only atrophy grading system referenced, and no example states or implies
// surgical necessity or calls a tear "significant" as a bare descriptor.

export const SAMPLE_SHOULDER_FINDINGS = `Rotator Cuff: Full-thickness, full-width tear of the supraspinatus and infraspinatus tendons with retraction of the tendon stump to the level of the glenoid. Goutallier grade 3-4 fatty atrophy of the supraspinatus and infraspinatus muscle bellies. Subscapularis and teres minor tendons are intact.
Acromiohumeral Interval: Narrowed acromiohumeral interval with acetabularization of the undersurface of the acromion and femoralization of the humeral head, compatible with chronic rotator cuff tear arthropathy.
Glenohumeral Joint: Severe glenohumeral joint osteoarthrosis with superior humeral head migration, compatible with rotator cuff tear arthropathy, Favard E2 glenoid wear pattern.
Biceps Tendon: Full-thickness rupture of the long head of the biceps tendon.
Labrum: SLAP tear of the superior labrum.
AC Joint: Mild AC joint osteoarthrosis.
Joint Effusion: Moderate glenohumeral joint effusion.
Bones: No acute fracture, AVN or marrow infiltration.
Regional Neurovascular Structures: Axillary nerve and quadrilateral space are normal.`;

// Each card's `patch` is what gets merged into the user's preference draft
// when they click "Use This Style" — same shape as reportPreferencesData's
// DEFAULT_REPORT_PREFS fields. See ReportPreferencesPanel.jsx for how
// Checklist-tab edits take precedence over these when the two conflict.
export const REPORT_STYLE_EXAMPLES = [
  {
    id: 'concise',
    label: 'Concise',
    desc: 'Brief — most critical finding only',
    patch: { impressionLength: 'concise' },
    impressionText:
`1. Massive rotator cuff tear.
2. Severe secondary osteoarthrosis with rotator cuff arthropathy pattern. Associated labral tear and biceps tendon rupture.`,
  },
  {
    id: 'verbose',
    label: 'Verbose',
    desc: 'Fuller explanatory phrasing per item',
    patch: { impressionLength: 'detailed' },
    impressionText:
`1. Full-thickness, full-width supraspinatus and infraspinatus tears with the tendon stump retracted to the glenoid, narrowed acromiohumeral interval, acetabularization of the acromion, femoralization of the humeral head, and Goutallier grade 3-4 fatty atrophy of the supraspinatus and infraspinatus muscle bellies.
2. Severe glenohumeral joint osteoarthrosis secondary to rotator cuff failure (cuff arthropathy), with Favard E2 glenoid wear pattern.
3. Associated SLAP tear with rupture of the long head of the biceps tendon.`,
  },
  {
    id: 'grading',
    label: 'Grading-Scale Focus',
    desc: 'States the formal grade/type where one applies',
    patch: { impressionStyle: 'gradingFocus' },
    impressionText:
`1. Massive full-thickness, full-width tear of the supraspinatus and infraspinatus tendons with Goutallier grade 3-4 fatty atrophy, and Favard E2 glenoid wear pattern compatible with rotator cuff tear arthropathy.
2. Severe glenohumeral osteoarthrosis secondary to rotator cuff arthropathy.
3. SLAP tear with full-thickness rupture of the long head of the biceps tendon.`,
  },
  {
    id: 'itemized',
    label: 'Itemized, Numbered',
    desc: 'Every damaged structure gets its own line',
    patch: { impressionStyle: 'itemizedNumbered' },
    impressionText:
`1. Full-thickness tear of the supraspinatus tendon with retraction to the glenoid.
2. Full-thickness tear of the infraspinatus tendon with retraction to the glenoid.
3. Goutallier grade 3-4 fatty atrophy of the supraspinatus and infraspinatus muscle bellies.
4. Severe glenohumeral joint osteoarthrosis with superior humeral head migration and Favard E2 glenoid wear pattern, compatible with rotator cuff tear arthropathy.
5. SLAP tear of the superior labrum.
6. Full-thickness rupture of the long head of the biceps tendon.`,
  },
  {
    id: 'lumped',
    label: 'Lumped by Mechanism',
    desc: 'Groups cuff tendons, labrum/biceps, etc.',
    patch: { impressionStyle: 'lumpedByMechanism' },
    impressionText:
`1. Massive rotator cuff tear with associated rotator cuff arthropathy, as above.`,
  },
  {
    id: 'negatives',
    label: '+ Pertinent Negatives',
    desc: 'Adds one line of key negative findings',
    patch: { includePertinentNegatives: true },
    impressionText:
`1. Massive full-thickness rotator cuff tear involving the supraspinatus and infraspinatus tendons, with Goutallier grade 3-4 muscle atrophy and findings of rotator cuff tear arthropathy.
2. Severe glenohumeral osteoarthrosis secondary to rotator cuff arthropathy.
3. Associated SLAP tear with rupture of the long head of the biceps tendon.
4. No acute fracture, AVN or marrow infiltration. Axillary nerve and quadrilateral space are normal.`,
  },
];
