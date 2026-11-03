// spinePromptUtils.js — spine MRI LEVELS handling (added 2026-11-03).
//
// Three pieces, all used only for spine MRI (CT spine is unchanged):
//   1. buildSpineLevelsTemplate(region)  — the LEVELS section of the prompt: every level
//      always lists Canal/thecal sac + Right neural foramen + Left neural foramen,
//      defaulting to "No significant narrowing." when not dictated.
//   2. buildSpineLevelIndex(dictation, region) — deterministic, code-side index of which
//      dictated sentences name which level. Appended to the user message so the model
//      cannot shift findings from one level to another (e.g. C1-C2 pushing C2-C3... down).
//   3. ensureSpineLevelCoverage(report, region) — post-generation guard that re-inserts any
//      level (or canal / right foramen / left foramen statement) the model dropped.

const CERVICAL = ['C1-C2', 'C2-C3', 'C3-C4', 'C4-C5', 'C5-C6', 'C6-C7', 'C7-T1', 'T1-T2'];
const THORACIC = ['T1-T2', 'T2-T3', 'T3-T4', 'T4-T5', 'T5-T6', 'T6-T7', 'T7-T8', 'T8-T9', 'T9-T10', 'T10-T11', 'T11-T12', 'T12-L1'];
const LUMBAR = ['L1-L2', 'L2-L3', 'L3-L4', 'L4-L5', 'L5-S1'];
export const SPINE_LEVELS = { cervical: CERVICAL, thoracic: THORACIC, lumbar: LUMBAR };
const MASTER = [...CERVICAL, ...THORACIC.slice(1), ...LUMBAR];

const NSN = 'No significant narrowing.';
const CANAL = 'Canal/thecal sac';
const RFOR = 'Right neural foramen';
const LFOR = 'Left neural foramen';

export function defaultLevelLine(level) {
  if (level === 'C1-C2') return `${level}: ${CANAL}: ${NSN}`;
  return `${level}: ${CANAL}: ${NSN} ${RFOR}: ${NSN} ${LFOR}: ${NSN}`;
}

// ── 1. Prompt block (replaces the old LEVELS template for MRI spine) ─────────
export function buildSpineLevelsTemplate(region) {
  const levels = SPINE_LEVELS[region] || LUMBAR;
  const list = levels.join(', ');
  return `
LEVELS:
Write exactly one line for EACH of these levels, in this order, with no level skipped, merged or added: ${list}.
EVERY level line, without exception, must contain all three statements below, in this order. If the dictation does not describe one of them for that level, write "${NSN}" for it:
"[Level]: [dictated cause at that level, only if dictated, e.g. disc bulge / protrusion / facet hypertrophy / ligamentum flavum thickening]. ${CANAL}: [dictated or ${NSN}] ${RFOR}: [dictated or ${NSN}] ${LFOR}: [dictated or ${NSN}]"
Example of a level with nothing dictated: "${defaultLevelLine(levels.find(l => l !== 'C1-C2'))}"${region === 'cervical' ? `
C1-C2 is the one exception: it has no true neural foramen, so its line contains the ${CANAL} statement ONLY (default: "${defaultLevelLine('C1-C2')}") — unless the dictation itself describes foraminal narrowing at C1-C2.` : ''}

LEVEL ACCURACY RULES (MANDATORY — ZERO TOLERANCE):
1. Each level's line is built ONLY from dictated text that names THAT level. A finding dictated at one level must never appear at any other level — not above it, not below it, and not as a "carry-over". Findings at one level never shift the levels below it: if C1-C2 has a finding, C2-C3 still gets only what was dictated for C2-C3.
2. Never renumber, re-label, merge or skip levels. Use the dictated level exactly (normalize only spelling such as "C4-5" to "C4-C5").
3. A range such as "C3-C4 through C5-C6" applies to every level inside the range. A list such as "C4-C5 and C5-C6" applies to each named level. Nothing else is inferred.
4. Do NOT drop any dictated finding. Every dictated level-specific finding, severity word, side (right/left/bilateral) and cause must appear at its level, using the dictated words.
5. SIDE: report right and left separately. "Bilateral" = write the dictated degree on BOTH the right and the left lines. If foraminal narrowing is dictated at a level with NO side stated, do not guess a side: replace the two foramen statements with one statement "Neural foramina: [dictated degree] (side not specified)."
6. Canal stenosis and "thecal sac" compression/effacement go on the ${CANAL} statement. Foraminal narrowing goes on the matching foramen statement. Never put a foraminal finding on the canal statement or the reverse.
7. A finding dictated for "multiple levels"/"throughout" with no level named is NOT distributed to individual levels; do not copy it onto each level.
8. A "LEVEL-BY-LEVEL DICTATION INDEX" is appended to the dictation. Use it to double-check that each level's line matches the sentences listed for that level and that levels listed as "NOT mentioned" contain defaults only.
`;
}

// ── 2. Level index built in code from the raw dictation ──────────────────────
function canonLevel(l1, n1, l2, n2) {
  l1 = l1.toUpperCase();
  n1 = parseInt(n1, 10);
  n2 = parseInt(n2, 10);
  if (!l2) {
    if (l1 === 'C' && n1 === 7 && n2 === 1) l2 = 'T';
    else if (l1 === 'T' && n1 === 12 && n2 === 1) l2 = 'L';
    else if (l1 === 'L' && n1 === 5 && n2 === 1) l2 = 'S';
    else l2 = l1;
  }
  const key = `${l1}${n1}-${l2.toUpperCase()}${n2}`;
  return MASTER.includes(key) ? key : null;
}

const TOKEN_RE = /\b([CTLS])\s?(\d{1,2})\s?(?:-|–|\/|\s)\s?(?:([CTLS])\s?)?(\d{1,2})(?!\d)(?!\s?(?:mm|cm|millimeters?|centimeters?)\b)/gi;

function findTokens(sentence) {
  const out = [];
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(sentence)) !== null) {
    const key = canonLevel(m[1], m[2], m[3], m[4]);
    if (key) out.push({ key, start: m.index, end: m.index + m[0].length });
    else TOKEN_RE.lastIndex = m.index + 1;
  }
  return out;
}

function expandRange(a, b) {
  const i = MASTER.indexOf(a), j = MASTER.indexOf(b);
  if (i === -1 || j === -1 || j < i) return [a, b];
  return MASTER.slice(i, j + 1);
}

export function buildSpineLevelIndex(dictation, region) {
  const text = (dictation || '').trim();
  if (!text) return '';
  const regionLevels = SPINE_LEVELS[region] || LUMBAR;
  const sentences = text.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const byLevel = {};        // level -> [sentence,...]
  const multi = [];          // [{levels, sentence}]
  const mentioned = new Set();
  for (const s of sentences) {
    const toks = findTokens(s);
    if (!toks.length) continue;
    // expand "A through B" ranges
    const levels = [];
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k];
      const next = toks[k + 1];
      if (next && /^\s*(through|thru|to|-)\s*$/i.test(s.slice(t.end, next.start))) {
        expandRange(t.key, next.key).forEach(l => levels.push(l));
        k++;
      } else levels.push(t.key);
    }
    const uniq = [...new Set(levels)];
    uniq.forEach(l => mentioned.add(l));
    // groups joined only by "and"/commas or ranges share the sentence; otherwise it is multi-level
    const joined = toks.every((t, k) => k === 0 || /^\s*(,|and|&|through|thru|to|-|\/|or|,\s*and)?\s*$/i.test(s.slice(toks[k - 1].end, t.start)));
    if (uniq.length === 1 || joined) uniq.forEach(l => { (byLevel[l] = byLevel[l] || []).push(s); });
    else multi.push({ levels: uniq, sentence: s });
  }
  const lines = [];
  regionLevels.forEach(l => {
    if (byLevel[l]) lines.push(`- ${l}: ${byLevel[l].map(x => `"${x}"`).join(' | ')}`);
  });
  Object.keys(byLevel).filter(l => !regionLevels.includes(l)).forEach(l => {
    lines.push(`- ${l} (outside the ${region} coverage list; report it only if the report would otherwise lose a dictated finding): ${byLevel[l].map(x => `"${x}"`).join(' | ')}`);
  });
  multi.forEach(({ levels, sentence }) => {
    lines.push(`- MULTI-LEVEL SENTENCE naming ${levels.join(', ')} — assign each clause ONLY to the level it names: "${sentence}"`);
  });
  const none = regionLevels.filter(l => !mentioned.has(l));
  return `\n\nLEVEL-BY-LEVEL DICTATION INDEX (built automatically from the dictation above; use it only to verify level assignment — the dictation above is still the only source of findings):
${lines.length ? lines.join('\n') : '- (no level was named in the dictation)'}
Levels NOT mentioned anywhere in the dictation — defaults only: ${none.length ? none.join(', ') : '(none)'}
A sentence that names no level is not level-specific unless it clearly continues the sentence just before it. Never move a listed sentence to a different level.`;
}

// ── 3. Post-generation guard ─────────────────────────────────────────────────
const SECTION_END = /^(IMPRESSION|FINDINGS|NUMBERING CONVENTION|REFERENCES?|FOOTNOTE|UNDERSTANDING YOUR RESULTS):?\s*$/i;
const LEVEL_LINE = /^\s*(?:\d+\.\s*)?([CTLS])\s?(\d{1,2})\s?(?:-|–|\/)\s?(?:([CTLS])\s?)?(\d{1,2})\s*:/i;

export function ensureSpineLevelCoverage(text, region) {
  if (!text) return text;
  const expected = SPINE_LEVELS[region];
  if (!expected) return text;
  if (/\bL6\b|\bL5-L6\b|\bS1-S2\b/.test(text)) return text; // transitional numbering — leave alone
  const lines = text.split('\n');
  const start = lines.findIndex(l => /^LEVELS:?\s*$/i.test(l.trim()));
  if (start === -1) return text;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) { if (SECTION_END.test(lines[i].trim())) { end = i; break; } }
  const body = lines.slice(start + 1, end);
  const preamble = [];
  const blocks = []; // {key, lines}
  for (const l of body) {
    const m = l.match(LEVEL_LINE);
    const key = m ? canonLevel(m[1], m[2], m[3], m[4]) : null;
    if (key) blocks.push({ key, lines: [l] });
    else if (!l.trim()) { /* drop blank lines inside LEVELS */ }
    else if (blocks.length) blocks[blocks.length - 1].lines.push(l);
    else preamble.push(l);
  }
  const fixBlock = (b) => {
    const joined = b.lines.join(' ');
    const adds = [];
    if (!/canal|thecal/i.test(joined)) adds.push(`${CANAL}: ${NSN}`);
    if (b.key !== 'C1-C2' && !/side not specified/i.test(joined)) {
      if (!/foram/i.test(joined)) { adds.push(`${RFOR}: ${NSN}`); adds.push(`${LFOR}: ${NSN}`); }
      else {
        if (!/\bright\b|bilateral|\bboth\b/i.test(joined)) adds.push(`${RFOR}: ${NSN}`);
        if (!/\bleft\b|bilateral|\bboth\b/i.test(joined)) adds.push(`${LFOR}: ${NSN}`);
      }
    }
    if (adds.length) b.lines[b.lines.length - 1] = b.lines[b.lines.length - 1].replace(/\s*$/, '') + ' ' + adds.join(' ');
    return b.lines;
  };
  const outBody = [...preamble];
  const used = new Set();
  expected.forEach(level => {
    const b = blocks.find(x => x.key === level && !used.has(x));
    if (b) { used.add(b); outBody.push(...fixBlock(b)); }
    else outBody.push(defaultLevelLine(level));
  });
  blocks.filter(b => !used.has(b)).forEach(b => outBody.push(...b.lines)); // levels outside the list: keep as written
  return [...lines.slice(0, start + 1), ...outBody, ...(end < lines.length ? [''] : []), ...lines.slice(end)].join('\n');
}
