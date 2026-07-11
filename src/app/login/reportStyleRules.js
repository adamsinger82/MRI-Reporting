// reportStyleRules.js — LucidMSK Report Style Preferences
// Single source of truth for the instruction text behind each style toggle.
// Imported by BOTH reportPreferencesUtils.js (applied to real report
// generation) and impressionPreviewUtils.js (applied to the style preview
// popup) so the preview a user sees is guaranteed to match what they'll
// actually get — no risk of the two drifting apart over time.

export const IMPRESSION_LENGTH_OPTIONS = [
  { val: 'concise', label: 'Concise', desc: '1–2 items, most critical finding only' },
  { val: 'standard', label: 'Standard', desc: 'Default — up to 4 items as clinically warranted' },
  { val: 'detailed', label: 'Verbose', desc: 'Fuller explanatory phrasing per item' },
];

export const LENGTH_RULE_TEXT = {
  concise: 'IMPRESSION LENGTH OVERRIDE — CONCISE: Keep the impression as short as possible — 1-2 items maximum, covering only the single most clinically significant finding plus any acute finding. Omit secondary/incidental impression items entirely rather than collapsing them into an extra line.',
  detailed: 'IMPRESSION LENGTH OVERRIDE — VERBOSE: Where the existing impression rules allow up to 4 items, prefer the fuller end of that range and add one additional explanatory clause per item (e.g. brief clinical relevance) without violating the "as above" or laundry-list restrictions already specified above.',
};

export const IMPRESSION_STYLE_OPTIONS = [
  { val: 'standard', label: 'Standard', desc: 'Default grouping — as already specified above' },
  { val: 'gradingFocus', label: 'Grading-Scale Focus', desc: 'States the formal grade/type wherever one applies' },
  { val: 'itemizedNumbered', label: 'Itemized, Numbered', desc: 'Every damaged structure gets its own numbered line' },
  { val: 'lumpedByMechanism', label: 'Lumped by Mechanism', desc: 'Groups related structures into one item (e.g. "rotator cuff")' },
];

export const STYLE_RULE_TEXT = {
  gradingFocus: 'IMPRESSION STYLE OVERRIDE — GRADING-SCALE FOCUS: For every impression item where a formal grading scale or standard MSK grading convention applies to the described finding (tendon tear grade/thickness, chondrosis/cartilage grade, labral tear type, AC joint osteoarthrosis grade, and similar), explicitly state that grade/type within the impression item (e.g. "Full-thickness supraspinatus tear" plus grade if a tear-thickness grading convention applies, "Grade 3 chondrosis of the humeral head"). Never state a grade that is not actually supported by the findings described.',
  itemizedNumbered: 'IMPRESSION STYLE OVERRIDE — ITEMIZED, NUMBERED BY STRUCTURE: This explicitly overrides the default "group related findings, 1-4 items, no laundry list" principle stated elsewhere in this prompt. Instead, list each distinct abnormal structure as its own separate numbered impression item (1. 2. 3. ...), even when several structures share a common injury mechanism or anatomic region — do not combine them into a single item. Still order items by clinical significance (acute findings first, as already specified above).',
  lumpedByMechanism: 'IMPRESSION STYLE OVERRIDE — LUMPED BY MECHANISM/REGION: Explicitly group findings that share a common injury mechanism or anatomic complex into a single impression item rather than listing them individually — for example, combine supraspinatus/infraspinatus/subscapularis tendon abnormalities into one "rotator cuff" item, or combine labral tear, biceps anchor, and biceps tendon abnormalities into one "superior labrum-biceps complex" item. State the grouped structures within that single sentence.',
};

export const DIFFERENTIAL_RULE_TEXT = 'DIFFERENTIAL PREFERENCE: When any finding is indeterminate or its etiology is not definitively established by the described imaging features — not limited to mass/tumor cases — include a brief differential (most likely first) rather than a single-diagnosis impression line, as long as this does not conflict with a case type that explicitly excludes a differential (e.g. mass follow-up or post-resection cases).';

export const NEGATIVES_RULE_TEXT = 'PERTINENT NEGATIVES IN IMPRESSION — USER OVERRIDE: This explicitly overrides the default rule elsewhere in this prompt that excludes pertinent negatives from the impression. Add ONE brief additional impression item listing the most clinically relevant pertinent negative(s) actually dictated (e.g. "No fracture, dislocation, or quadrilateral space abnormality."). Keep it to a single concise sentence — do not list every negative finding dictated, only the one(s) most relevant to the clinical question.';

export const SEE_ABOVE_RULE_TEXT = 'CLOSING IMPRESSION LINE — USER OVERRIDE: After the last substantive impression item, add one final impression line reading exactly: "Please see above for additional observations." This is a closing reference line, not a clinical finding — it must always come last, numbered as the final item, and must never be combined with or attached to another impression item on the same line.';

export const DIGIT_NAMING_OPTIONS = [
  { val: 'numbered', label: 'Numbered (1st–5th)' },
  { val: 'named', label: 'Named (thumb, index, etc.)' },
];

export const DIGIT_NAMING_RULE_TEXT = {
  named: 'DIGIT NAMING OVERRIDE: When referring to individual fingers in descriptive finding text, use their common names — thumb, index finger, middle finger, ring finger, small finger — instead of ordinal digit numbers (e.g. write "index finger" rather than "2nd digit"). This applies to how fingers are described within findings; it does not change any joint/structure heading already specified elsewhere in this prompt (e.g. keep "First CMC Joint" as written).',
};

export const HEDGING_LANGUAGE_OPTIONS = [
  { val: 'allow', label: 'Allow' },
  { val: 'avoid', label: 'Avoid' },
];

export const HEDGING_AVOID_RULE_TEXT = 'AMBIGUOUS/HEDGING LANGUAGE OVERRIDE: Avoid hedging or noncommittal phrasing — such as "cannot exclude," "not excluded," "unclear," "possible," "questionable," or "clinical correlation recommended" — wherever the dictated findings support a more definitive statement. State findings and impression items as directly and definitively as the described imaging features allow. This does not apply where the dictation itself is genuinely ambiguous and no more definitive statement is actually supported by the findings described — do not manufacture false certainty in a truly indeterminate case.';

export const NERVE_LISTING_OPTIONS = [
  { val: 'lumped', label: 'Lumped (Regional Neurovascular)' },
  { val: 'separate', label: 'Separate, Named Nerves' },
];

export const NERVE_LISTING_RULE_TEXT = {
  separate: 'NERVE LISTING OVERRIDE — SEPARATE, NAMED HEADINGS: Instead of a single lumped "Regional Neurovascular Structures" heading, generate a separate heading for each named nerve relevant to the imaged region (e.g. shoulder: "Axillary Nerve," "Suprascapular Nerve"; elbow: "Ulnar Nerve," "Radial Nerve," "Median Nerve"; wrist/hand: "Median Nerve," "Ulnar Nerve"; knee: "Peroneal Nerve," "Tibial Nerve"; ankle/foot: "Tibial Nerve," "Peroneal Nerve," "Sural Nerve," as applicable to the region). Each nerve heading defaults to "Normal caliber and signal. No compression or mass effect." when not otherwise dictated. Do NOT also generate a separate "Regional Vascular Structures" (or similarly named vessel-only) heading in this mode — that would be redundant with the per-nerve compression assessment above. If a dictated finding specifically concerns a named vessel (artery/vein), fold it into the most anatomically related nerve heading\'s text rather than creating its own heading.',
};

export const SPINE_CANAL_TERM_OPTIONS = [
  { val: 'narrowing', label: 'Narrowing' },
  { val: 'stenosis', label: 'Stenosis' },
];

export const SPINE_CANAL_TERM_RULE_TEXT = {
  stenosis: 'SPINE CANAL/FORAMINAL TERMINOLOGY OVERRIDE — STENOSIS: Wherever this report would otherwise use the word "narrowing" to describe central canal or neural foraminal caliber at a level (e.g. "No significant canal or foraminal narrowing," "moderate foraminal narrowing"), use "stenosis" instead (e.g. "No significant canal or foraminal stenosis," "moderate foraminal stenosis"). Applies to cervical, thoracic, and lumbar spine, on both MRI and CT.',
};

export const GRADING_SYSTEMS_OPTIONS = [
  { val: true, label: 'Enabled' },
  { val: false, label: 'Disabled' },
];

export const GRADING_SYSTEMS_DISABLED_RULE_TEXT = 'NAMED GRADING SYSTEMS — DISABLED: Do not cite any named grading/classification system anywhere in this report (e.g. Goutallier, Patte, Favard, Hamada, Outerbridge, Kellgren-Lawrence, Modic, Tönnis, Ficat, or any other eponymous grading/staging scale) — even where the built-in rules elsewhere in this prompt would normally reference one. Describe the underlying finding descriptively instead (e.g. describe the degree of fatty atrophy, osteoarthrosis, or cartilage loss in plain descriptive terms rather than citing a grade/stage number tied to a named system).';

export const IMPRESSION_NUMBERING_OPTIONS = [
  { val: 'numbered', label: 'Numbered (1. 2. 3.)' },
  { val: 'hyphen', label: 'Hyphen, No Numbers' },
  { val: 'plain', label: 'Plain, No Numbers/Hyphens' },
];

export const IMPRESSION_NUMBERING_RULE_TEXT = {
  hyphen: 'IMPRESSION FORMAT OVERRIDE — HYPHEN, NO NUMBERS: Do not number impression items (no "1.", "2.", etc.). Instead, write each impression item on its own line preceded by a hyphen and a space (e.g. "- Massive rotator cuff tear.") with a blank line between items — only the numeral is replaced by a hyphen; the one-item-per-line structure is otherwise unchanged.',
  plain: 'IMPRESSION FORMAT OVERRIDE — NO NUMBERS, NO HYPHENS: Do not number or bullet impression items in any way. Write each impression item on its own line/sentence with a blank line between items for clear visual separation — no numeral, hyphen, or bullet character preceding any item.',
};
