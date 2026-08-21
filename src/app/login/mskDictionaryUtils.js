// mskDictionaryUtils.js — LucidMSK Dictation Dictionary (logic layer)
// Per architecture rule: utility functions live in their own file, named exports,
// imported by page.js / TemplatesPanel.jsx. No bulk added to page.js.
//
// RECONCILIATION NOTE (2026-08-21): This is the authentic file from the
// original design session, restored as the canonical version unchanged in
// logic. IMPORTANT for callers: applyHardCorrections() returns an object
// { text, corrections }, NOT a plain string — use .text at the call site.
//
// TWO-STAGE CORRECTION MODEL
//   Stage 1 (free, instant, deterministic): applyHardCorrections()
//     Runs in the browser on the raw transcript. Only boost-10 entries whose
//     garbled forms are NOT valid English (auto !== false). Zero token cost,
//     zero latency, and it fixes the text before the user even reads it.
//   Stage 2 (model-side, contextual): buildDictionaryInstruction()
//     Emits a weighted lexicon block appended to the system prompt. Handles
//     everything ambiguous — the entries where a blind swap would be wrong.

import { MSK_DICTIONARY, BOOST_MAX } from './mskDictionaryData';

// Human-readable meaning of each boost tier. Sent to the model verbatim so the
// numbers actually mean something instead of being decorative.
export const BOOST_LEGEND = {
  10: 'ABSOLUTE. Any phonetically similar token becomes this term. No exceptions.',
  9: 'NEAR-ABSOLUTE. Use this term unless another listed MSK term fits the sentence better.',
  8: 'VERY STRONG. Strongly prefer over any common-English interpretation.',
  7: 'STRONG. Prefer whenever the surrounding sentence is anatomic or pathologic.',
  6: 'MODERATE-HIGH. Correct clear errors; leave plausible readings alone.',
  5: 'MODERATE. Correct only when the transcript reads as an error.',
  4: 'LIGHT. Correct only when surrounding words are nonsense.',
  3: 'LIGHT. Correct only when surrounding words are nonsense.',
  2: 'WATCH ONLY. Do not correct.',
  1: 'WATCH ONLY. Do not correct.',
};

// Map LucidMSK body-part keys to dictionary scopes. Anything unmapped falls back
// to 'global' only, which is the safe behavior.
const SCOPE_ALIASES = {
  spine: 'spine', 'c-spine': 'spine', 'l-spine': 'spine', 't-spine': 'spine',
  shoulder: 'shoulder',
  knee: 'knee',
  hip: 'hip', pelvis: 'hip',
  foot: 'foot', ankle: 'foot',
  wrist: 'wrist', hand: 'wrist',
  elbow: 'elbow',
};

export function resolveScope(bodyPart) {
  if (!bodyPart) return null;
  return SCOPE_ALIASES[String(bodyPart).toLowerCase().trim()] || null;
}

// Returns global entries plus the entries scoped to this body part, sorted
// highest-boost first so the most important terms lead the prompt block.
export function getDictionaryEntries(bodyPart, { minBoost = 3 } = {}) {
  const scope = resolveScope(bodyPart);
  return MSK_DICTIONARY
    .filter(e => e.boost >= minBoost && (e.scope === 'global' || e.scope === scope))
    .sort((a, b) => b.boost - a.boost || a.term.localeCompare(b.term));
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── STAGE 1 ────────────────────────────────────────────────────────────────
// Deterministic pre-pass. Only boost-10, auto-safe entries. Word-boundary
// matched, case-insensitive, longest garble first so multi-word forms win.
// Returns { text, corrections: [{ from, to }] } — the corrections array is
// useful for a debug toggle or for feeding the worklist file.
export function applyHardCorrections(rawText, bodyPart) {
  if (!rawText) return { text: rawText || '', corrections: [] };
  const scope = resolveScope(bodyPart);
  const pairs = [];

  MSK_DICTIONARY
    .filter(e => e.boost === BOOST_MAX && e.auto !== false && (e.scope === 'global' || e.scope === scope))
    .forEach(e => (e.heard || []).forEach(h => {
      if (h && h.length >= 5) pairs.push({ from: h, to: e.term });
    }));

  pairs.sort((a, b) => b.from.length - a.from.length);

  let text = rawText;
  const corrections = [];
  pairs.forEach(({ from, to }) => {
    const re = new RegExp(`\\b${escapeRegExp(from)}\\b`, 'gi');
    if (re.test(text)) {
      // Preserve the dictated capitalization: if the engine capitalized the
      // garble (sentence start), capitalize the replacement too. Eponyms that
      // are already capitalized in `term` are left untouched.
      text = text.replace(re, (match) => (
        /^[A-Z]/.test(match) ? to.charAt(0).toUpperCase() + to.slice(1) : to
      ));
      corrections.push({ from, to });
    }
  });

  return { text, corrections };
}

// ── STAGE 2 ────────────────────────────────────────────────────────────────
// Builds the system-prompt block. Appended AFTER the base prompt at each
// /api/generate call site, alongside buildPreferenceInstruction() and
// buildNeverUseInstruction().
export function buildDictionaryInstruction(bodyPart, { minBoost = 5 } = {}) {
  const entries = getDictionaryEntries(bodyPart, { minBoost });
  if (!entries.length) return '';

  const tiers = [...new Set(entries.map(e => e.boost))].sort((a, b) => b - a);
  const legend = tiers.map(b => `  ${b}/10 — ${BOOST_LEGEND[b]}`).join('\n');

  const lines = entries.map(e => {
    const heard = (e.heard || []).length ? ` <= ${e.heard.map(h => `"${h}"`).join(', ')}` : '';
    return `  [${e.boost}] ${e.term}${heard}`;
  }).join('\n');

  return `

MSK DICTATION LEXICON — WEIGHTED VOCABULARY BIAS (boost scale 1-${BOOST_MAX}).
This dictation was produced by a browser speech engine with a general-English language model, spoken by a subspecialty musculoskeletal radiologist. The engine has no medical vocabulary and systematically replaces MSK terms with common English words that sound similar. Assume a garbled token is an MSK term, not the common word it transcribed to.

HOW TO USE THE BOOST NUMBER — the bracketed value is the strength of preference for that term over any common-English reading:
${legend}

CORRECTION RULES:
- Apply corrections SILENTLY. Never annotate, flag, footnote, or mention that a correction was made. This is subordinate to the existing zero-tolerance rule against commentary.
- The forms after "<=" are garbles actually observed from this engine. They are examples, not an exhaustive list — correct any phonetically similar variant at the same strength.
- Never invent a finding to justify a correction. If a boost-10 term would require asserting pathology that was not dictated, leave the text as dictated instead.
- Anatomic plausibility overrides the boost number. Do not place a term in a compartment, joint, or level where it cannot exist.
- Correct only the misheard token. Leave every surrounding word exactly as dictated.

LEXICON:
${lines}`;
}

// Small helper for a settings/debug panel — counts by tier and scope.
export function summarizeDictionary() {
  const byScope = {};
  const byBoost = {};
  MSK_DICTIONARY.forEach(e => {
    byScope[e.scope] = (byScope[e.scope] || 0) + 1;
    byBoost[e.boost] = (byBoost[e.boost] || 0) + 1;
  });
  return { total: MSK_DICTIONARY.length, byScope, byBoost };
}
