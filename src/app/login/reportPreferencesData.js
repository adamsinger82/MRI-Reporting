// reportPreferencesData.js — LucidMSK Report Style Preferences
// Toggle-only preference definitions (no free text) so there is nothing here
// a user could accidentally paste patient information into.
// Imported by ReportPreferencesPanel.jsx and reportPreferencesUtils.js.
//
// NOTE: default mass/tumor case type and default patient-friendly summary
// were intentionally removed from here — they're already available as
// their own per-report controls in the main UI, so duplicating them as
// account-level preferences was redundant.

export const NORMAL_TERM_OPTIONS = [
  { val: 'intact', label: 'Intact' },
  { val: 'unremarkable', label: 'Unremarkable' },
  { val: 'normal', label: 'Normal' },
];

export const DEFAULT_REPORT_PREFS = {
  normalTerm: 'intact',
  impressionLength: 'standard',        // 'concise' | 'standard' | 'detailed'
  impressionStyle: 'standard',         // 'standard' | 'gradingFocus' | 'itemizedNumbered' | 'lumpedByMechanism'
  includePertinentNegatives: false,
  appendSeeAboveLine: false,
  digitNaming: 'numbered',             // 'numbered' | 'named'
  hedgingLanguage: 'allow',            // 'allow' | 'avoid'
  alwaysDifferential: false,
  nerveListing: 'lumped',              // 'lumped' | 'separate'
  spineCanalForaminalTerm: 'narrowing',// 'narrowing' | 'stenosis'
  useGradingSystems: true,             // true | false
  impressionNumbering: 'numbered',     // 'numbered' | 'hyphen' | 'plain'
};
