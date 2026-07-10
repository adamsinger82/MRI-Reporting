// reportPreferencesData.js — LucidMSK Report Style Preferences
// Toggle-only preference definitions (no free text) so there is nothing here
// a user could accidentally paste patient information into.
// Imported by ReportPreferencesPanel.jsx and reportPreferencesUtils.js.

export const NORMAL_TERM_OPTIONS = [
  { val: 'intact', label: 'Intact' },
  { val: 'unremarkable', label: 'Unremarkable' },
  { val: 'normal', label: 'Normal' },
];

export const DEFAULT_MASS_MODE_OPTIONS = [
  { val: 'auto', label: 'Auto-detect' },
  { val: 'new', label: 'New case' },
  { val: 'followup', label: 'Follow-up' },
  { val: 'postresection', label: 'Post-resection' },
];

export const DEFAULT_LAY_SUMMARY_OPTIONS = [
  { val: false, label: 'Off by default' },
  { val: true, label: 'On by default' },
];

export const DEFAULT_REPORT_PREFS = {
  normalTerm: 'intact',
  impressionLength: 'standard',       // 'concise' | 'standard' | 'detailed'
  impressionStyle: 'standard',        // 'standard' | 'gradingFocus' | 'itemizedNumbered' | 'lumpedByMechanism'
  includePertinentNegatives: false,
  appendSeeAboveLine: false,
  digitNaming: 'numbered',
  hedgingLanguage: 'allow',
  alwaysDifferential: false,
  defaultLayPersonSummary: false,
  defaultMassMode: 'auto',
};
