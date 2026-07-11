// reportPreferencesUtils.js — LucidMSK Report Style Preferences
// Named exports, imported by page.js (per architecture note: new utility
// functions go in their own file, not bulked into page.js).
//
// STORAGE: Supabase table `user_report_preferences` (one row per user_id),
// same REST pattern already used in TemplatesPanel.jsx — apikey + bearer
// access token, RLS-scoped to auth.uid() = user_id. Run
// user_report_preferences.sql once in the Supabase SQL Editor before using
// this. Preferences now sync across devices/browsers for a given account.

import { DEFAULT_REPORT_PREFS } from './reportPreferencesData';
import {
  LENGTH_RULE_TEXT, STYLE_RULE_TEXT, DIFFERENTIAL_RULE_TEXT, NEGATIVES_RULE_TEXT,
  SEE_ABOVE_RULE_TEXT, DIGIT_NAMING_RULE_TEXT, HEDGING_AVOID_RULE_TEXT,
  NERVE_LISTING_RULE_TEXT, SPINE_CANAL_TERM_RULE_TEXT, GRADING_SYSTEMS_DISABLED_RULE_TEXT,
  IMPRESSION_NUMBERING_RULE_TEXT, CONCISE_ITEMIZED_RECONCILIATION_TEXT,
  GRADING_DISABLED_FOCUS_RECONCILIATION_TEXT, HEDGING_DIFFERENTIAL_RECONCILIATION_TEXT,
} from './reportStyleRules';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TABLE = 'user_report_preferences';

function supaHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    apikey: getAnonKey(),
    Authorization: `Bearer ${accessToken || getAnonKey()}`,
  };
}

// camelCase (app state) <-> snake_case (db columns)
function toRow(userId, prefs) {
  return {
    user_id: userId,
    normal_term: prefs.normalTerm,
    impression_length: prefs.impressionLength,
    impression_style: prefs.impressionStyle,
    include_pertinent_negatives: prefs.includePertinentNegatives,
    append_see_above_line: prefs.appendSeeAboveLine,
    digit_naming: prefs.digitNaming,
    hedging_language: prefs.hedgingLanguage,
    always_differential: prefs.alwaysDifferential,
    nerve_listing: prefs.nerveListing,
    spine_canal_foraminal_term: prefs.spineCanalForaminalTerm,
    use_grading_systems: prefs.useGradingSystems,
    impression_numbering: prefs.impressionNumbering,
  };
}

function fromRow(row) {
  if (!row) return { ...DEFAULT_REPORT_PREFS };
  return {
    normalTerm: row.normal_term ?? DEFAULT_REPORT_PREFS.normalTerm,
    impressionLength: row.impression_length ?? DEFAULT_REPORT_PREFS.impressionLength,
    impressionStyle: row.impression_style ?? DEFAULT_REPORT_PREFS.impressionStyle,
    includePertinentNegatives: row.include_pertinent_negatives ?? DEFAULT_REPORT_PREFS.includePertinentNegatives,
    appendSeeAboveLine: row.append_see_above_line ?? DEFAULT_REPORT_PREFS.appendSeeAboveLine,
    digitNaming: row.digit_naming ?? DEFAULT_REPORT_PREFS.digitNaming,
    hedgingLanguage: row.hedging_language ?? DEFAULT_REPORT_PREFS.hedgingLanguage,
    alwaysDifferential: row.always_differential ?? DEFAULT_REPORT_PREFS.alwaysDifferential,
    nerveListing: row.nerve_listing ?? DEFAULT_REPORT_PREFS.nerveListing,
    spineCanalForaminalTerm: row.spine_canal_foraminal_term ?? DEFAULT_REPORT_PREFS.spineCanalForaminalTerm,
    useGradingSystems: row.use_grading_systems ?? DEFAULT_REPORT_PREFS.useGradingSystems,
    impressionNumbering: row.impression_numbering ?? DEFAULT_REPORT_PREFS.impressionNumbering,
  };
}

// Fetches this user's saved preferences from Supabase. Never throws — a
// missing row (new user, or the table migration hasn't run yet) just means
// "use defaults," not an error, so login/report-generation never blocks on this.
export async function loadReportPrefs(userId, accessToken) {
  if (!userId) return { ...DEFAULT_REPORT_PREFS };
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/${TABLE}?user_id=eq.${userId}&select=*`, {
      headers: supaHeaders(accessToken),
    });
    if (!res.ok) return { ...DEFAULT_REPORT_PREFS };
    const rows = await res.json();
    return fromRow(rows?.[0]);
  } catch {
    return { ...DEFAULT_REPORT_PREFS };
  }
}

// Upserts this user's preferences row (insert on first save, update after).
// Throws on failure so the Save button in ReportPreferencesPanel can show
// an error instead of silently no-op'ing.
export async function saveReportPrefs(userId, accessToken, prefs) {
  if (!userId) throw new Error('Not signed in.');
  const res = await fetch(`${SUPA_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: { ...supaHeaders(accessToken), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(toRow(userId, prefs)),
  });
  if (!res.ok) throw new Error('Failed to save preferences.');
}

// Builds an additive system-prompt instruction block reflecting only the
// preferences that differ from default — keeps the prompt short and avoids
// contradicting hardcoded report rules unnecessarily. Append the result to
// the existing system prompt string at each /api/generate call site.
export function buildPreferenceInstruction(prefs) {
  if (!prefs) return '';
  const lines = [];

  if (prefs.normalTerm && prefs.normalTerm !== 'intact') {
    lines.push(`- For normal/negative findings, use the word "${prefs.normalTerm}" in place of the default "intact" wherever that substitution reads naturally (do not change cases where "intact" is structurally required, e.g. "No fracture or contusion.").`);
  }

  if (LENGTH_RULE_TEXT[prefs.impressionLength]) {
    lines.push(`- ${LENGTH_RULE_TEXT[prefs.impressionLength]}`);
  }

  if (STYLE_RULE_TEXT[prefs.impressionStyle]) {
    lines.push(`- ${STYLE_RULE_TEXT[prefs.impressionStyle]}`);
  }

  if (prefs.includePertinentNegatives) {
    lines.push(`- ${NEGATIVES_RULE_TEXT}`);
  }

  if (prefs.alwaysDifferential) {
    lines.push(`- ${DIFFERENTIAL_RULE_TEXT}`);
  }

  if (DIGIT_NAMING_RULE_TEXT[prefs.digitNaming]) {
    lines.push(`- ${DIGIT_NAMING_RULE_TEXT[prefs.digitNaming]}`);
  }

  if (prefs.hedgingLanguage === 'avoid') {
    lines.push(`- ${HEDGING_AVOID_RULE_TEXT}`);
  }

  if (NERVE_LISTING_RULE_TEXT[prefs.nerveListing]) {
    lines.push(`- ${NERVE_LISTING_RULE_TEXT[prefs.nerveListing]}`);
  }

  if (SPINE_CANAL_TERM_RULE_TEXT[prefs.spineCanalForaminalTerm]) {
    lines.push(`- ${SPINE_CANAL_TERM_RULE_TEXT[prefs.spineCanalForaminalTerm]}`);
  }

  if (prefs.useGradingSystems === false) {
    lines.push(`- ${GRADING_SYSTEMS_DISABLED_RULE_TEXT}`);
  }

  if (IMPRESSION_NUMBERING_RULE_TEXT[prefs.impressionNumbering]) {
    lines.push(`- ${IMPRESSION_NUMBERING_RULE_TEXT[prefs.impressionNumbering]}`);
  }

  // Reconciliation lines — only fire when both sides of a genuinely conflicting
  // preference pair are active together; otherwise the individual rules above
  // never contradict each other.
  if (prefs.impressionLength === 'concise' && prefs.impressionStyle === 'itemizedNumbered') {
    lines.push(`- ${CONCISE_ITEMIZED_RECONCILIATION_TEXT}`);
  }

  if (prefs.useGradingSystems === false && prefs.impressionStyle === 'gradingFocus') {
    lines.push(`- ${GRADING_DISABLED_FOCUS_RECONCILIATION_TEXT}`);
  }

  if (prefs.hedgingLanguage === 'avoid' && prefs.alwaysDifferential) {
    lines.push(`- ${HEDGING_DIFFERENTIAL_RECONCILIATION_TEXT}`);
  }

  // Kept last so the model applies it after every other impression-shaping
  // preference above — it must always be the final line, not an inserted one.
  if (prefs.appendSeeAboveLine) {
    lines.push(`- ${SEE_ABOVE_RULE_TEXT}`);
  }

  if (!lines.length) return '';
  return `\n\nUSER STYLE PREFERENCES — apply these silently, exactly like any other formatting rule above; never mention or reference these preferences in the output itself:\n${lines.join('\n')}`;
}
