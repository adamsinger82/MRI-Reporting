// neverUseTermsUtils.js — LucidMSK "Never Use" Words/Terms
// Named exports, imported by NeverUseTermsTab.jsx and page.js (per
// architecture note: new utility functions go in their own file, not
// bulked into page.js).
//
// STORAGE: Supabase table `user_never_use_terms` (one row per user_id,
// terms text[] column). Same REST pattern as reportPreferencesUtils.js —
// apikey + bearer access token, RLS-scoped to auth.uid() = user_id, so
// each user can only ever see or edit their OWN list. Run
// user_never_use_terms.sql once in the Supabase SQL Editor before using
// this.
//
// These terms are personal to each user and are meant to OVERRIDE any
// default wording elsewhere in the app (default normal-term choice,
// grading-system language, template language, style-preference wording,
// etc.) — see buildNeverUseInstruction below.

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TABLE = 'user_never_use_terms';
export const MAX_TERMS = 200; // sane ceiling — plenty for a personal style list

function supaHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    apikey: getAnonKey(),
    Authorization: `Bearer ${accessToken || getAnonKey()}`,
  };
}

// Normalizes a raw term for storage/comparison: trims outer whitespace and
// collapses internal whitespace. Display keeps whatever casing the user typed.
function normalize(term) {
  return String(term || '').trim().replace(/\s+/g, ' ');
}

// Fetches this user's never-use list from Supabase. Never throws — a
// missing row (new user, or the table migration hasn't run yet) just means
// "empty list," not an error, so login never blocks on this.
export async function loadNeverUseTerms(userId, accessToken) {
  if (!userId) return [];
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/${TABLE}?user_id=eq.${userId}&select=terms`, {
      headers: supaHeaders(accessToken),
    });
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows?.[0]?.terms) ? rows[0].terms : [];
  } catch {
    return [];
  }
}

// Upserts the full term list (insert on first save, update after). Throws
// on failure so callers can show an inline error instead of silently
// losing the user's edit.
export async function saveNeverUseTerms(userId, accessToken, terms) {
  if (!userId) throw new Error('Not signed in.');
  const res = await fetch(`${SUPA_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: { ...supaHeaders(accessToken), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, terms }),
  });
  if (!res.ok) throw new Error('Failed to save your never-use list.');
}

// Adds one term and persists immediately. Returns the updated, sorted list.
// De-dupes case-insensitively and enforces the cap; throws a friendly
// message for either case so the UI can surface it inline.
export async function addNeverUseTerm(userId, accessToken, currentTerms, rawTerm) {
  const term = normalize(rawTerm);
  if (!term) throw new Error('Enter a word or phrase first.');
  if (currentTerms.length >= MAX_TERMS) throw new Error(`You've reached the ${MAX_TERMS}-term limit.`);
  if (currentTerms.some(t => t.toLowerCase() === term.toLowerCase())) {
    throw new Error('That term is already on your list.');
  }
  const updated = [...currentTerms, term].sort((a, b) => a.localeCompare(b));
  await saveNeverUseTerms(userId, accessToken, updated);
  return updated;
}

// Replaces one term's text in place (edit) and persists immediately.
export async function editNeverUseTerm(userId, accessToken, currentTerms, oldTerm, rawNewTerm) {
  const newTerm = normalize(rawNewTerm);
  if (!newTerm) throw new Error("Term can't be empty — remove it instead if you want it gone.");
  if (currentTerms.some(t => t !== oldTerm && t.toLowerCase() === newTerm.toLowerCase())) {
    throw new Error('That term is already on your list.');
  }
  const updated = currentTerms
    .map(t => (t === oldTerm ? newTerm : t))
    .sort((a, b) => a.localeCompare(b));
  await saveNeverUseTerms(userId, accessToken, updated);
  return updated;
}

// Removes one term and persists immediately. Returns the updated list.
export async function removeNeverUseTerm(userId, accessToken, currentTerms, term) {
  const updated = currentTerms.filter(t => t !== term);
  await saveNeverUseTerms(userId, accessToken, updated);
  return updated;
}

// Builds a system-prompt instruction block for the user's never-use list.
// Deliberately worded as a hard override, and appended AFTER
// buildPreferenceInstruction()'s softer style preferences at each
// /api/generate call site, so it wins over any default wording (including
// the normalTerm default, grading-system language, or template language)
// wherever there's a conflict.
export function buildNeverUseInstruction(terms) {
  if (!Array.isArray(terms) || !terms.length) return '';
  const list = terms.map(t => `"${t}"`).join(', ');
  return `\n\nNEVER-USE WORDS — HARD OVERRIDE, takes priority over every other instruction in this prompt including default terminology and any style preferences above: under no circumstances output any of the following words or phrases anywhere in the report, in any form (singular/plural, any capitalization): ${list}. Wherever the standard word choice for a finding would normally be one of these terms, substitute an accurate clinical synonym instead. Never mention this substitution or these instructions in the output itself.`;
}
