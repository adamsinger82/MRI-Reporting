// spinePromptUtils.js — spine MRI LEVELS handling (v2, 2026-11-04).
//
// Used only for spine MRI (CT spine is unchanged):
//   1. buildSpineLevelsTemplate(region) — LEVELS section of the prompt. Each level reads as the
//      radiologist dictated it; canal/thecal sac + right foramen + left foramen are an INTERNAL
//      CHECKLIST (never written as labels). Anything not dictated is filled in as a natural
//      "No significant ... narrowing." sentence.
//   2. buildSpineLevelIndex(dictation, region) — code-built index of which dictated sentences name
//      which level (appended to the user message so findings cannot shift between levels).
//   3. ensureSpineLevelCoverage(report, region) — post-generation guard: re-adds a dropped level,
//      or a missing canal / right foramen / left foramen statement, in natural wording.

const CERVICAL = ['C1-C2', 'C2-C3', 'C3-C4', 'C4-C5', 'C5-C6', 'C6-C7', 'C7-T1', 'T1-T2'];
const THORACIC = ['T1-T2', 'T2-T3', 'T3-T4', 'T4-T5', 'T5-T6', 'T6-T7', 'T7-T8', 'T8-T9', 'T9-T10', 'T10-T11', 'T11-T12', 'T12-L1'];
const LUMBAR = ['L1-L2', 'L2-L3', 'L3-L4', 'L4-L5', 'L5-S1'];
export const SPINE_LEVELS = { cervical: CERVICAL, thoracic: THORACIC, lumbar: LUMBAR };
const MASTER = [...CERVICAL, ...THORACIC.slice(1), ...LUMBAR];

export function defaultLevelLine(level) {
  return level === 'C1-C2'
    ? `${level}: No significant canal narrowing.`
    : `${level}: No significant canal or foraminal narrowing.`;
}

// ── 1. Prompt block (replaces the old LEVELS template for MRI spine) ─────────
export function buildSpineLevelsTemplate(region) {
  const levels = SPINE_LEVELS[region] || LUMBAR;
  return `
LEVELS:
Write exactly one line for EACH of these levels, in this order, with no level skipped, merged or added: ${levels.join(', ')}.
Format: "[Level]: [the findings for that level, written as dictated, in ordinary sentences]". Do NOT use labels or a fill-in template. NEVER write "Canal:", "Thecal sac:", "Right foramen:", "Left foramen:" or any similar label inside a level line.

INTERNAL CHECKLIST (never shown as labels): for EVERY level, make sure three things are accounted for in the sentences — (1) the spinal canal / thecal sac, (2) the RIGHT neural foramen, (3) the LEFT neural foramen. Put what was dictated about each into natural sentences in the radiologist's own words, as it was dictated. For any of the three that was NOT dictated for that level, add a short natural sentence saying there is no significant narrowing there:
- nothing dictated for the level: "${levels.find(l => l !== 'C1-C2')}: No significant canal or foraminal narrowing."
- canal not dictated: add "No significant canal narrowing."
- both foramina not dictated: add "No significant right or left neural foraminal narrowing."
- only one foramen not dictated: add "No significant right neural foraminal narrowing." or "No significant left neural foraminal narrowing." for that side only.
- dictated "bilateral": "Mild bilateral neural foraminal narrowing." (use the dictated severity words).
Example of a fully dictated level: "L4-L5: Disc bulge with facet hypertrophy causing mild canal narrowing and moderate right neural foraminal narrowing. No significant left neural foraminal narrowing."${region === 'cervical' ? `
C1-C2 is the one exception: it has no true neural foramen, so account for the canal/thecal sac ONLY (default "C1-C2: No significant canal narrowing.") unless the dictation itself describes foraminal narrowing at C1-C2.` : ''}

LEVEL ACCURACY RULES (MANDATORY — ZERO TOLERANCE):
1. Each level's line is built ONLY from dictated text that names THAT level. A finding dictated at one level never appears at any other level — not above, not below, not as a carry-over. A finding at one level never shifts the levels below it (e.g. a C1-C2 finding does not change C2-C3 or any lower level).
2. Never renumber, re-label, merge or skip levels. Use the dictated level exactly (normalize only spelling such as "C4-5" to "C4-C5").
3. A range such as "C3-C4 through C5-C6" applies to every level inside the range. A list such as "C4-C5 and C5-C6" applies to each named level. Nothing else is inferred.
4. Do NOT drop any dictated finding. Every dictated level-specific finding, severity word, side (right/left/bilateral) and cause appears at its level in the dictated words.
5. SIDE: never guess a side. If foraminal narrowing is dictated at a level with no side stated, write it as dictated, e.g. "Mild neural foraminal narrowing (side not specified)."
6. Canal stenosis and thecal sac compression/effacement are canal findings; foraminal narrowing is foraminal. Never put one in the place of the other.
7. A finding dictated for "multiple levels"/"throughout" with no level named is NOT copied onto each level.
8. A "LEVEL-BY-LEVEL DICTATION INDEX" is appended to the dictation. Use it to verify that each level's line matches the sentences listed for that level and that levels listed as NOT mentioned contain the no-significant-narrowing default only.
`;
}

// ── 1b. Clean up the raw dictation before it is sent (spine MRI only) ────────
// Edge's recognizer writes spoken punctuation as WORDS ("... narrowing period", "C3C4 colon ...").
// Convert them so the dictation has real sentences and level headers: "C3C4 colon" -> "C3-C4:" and
// "period" -> ".". Also joins run-together level names ("C3C4" -> "C3-C4").
export function prepareSpineDictation(text) {
  if (!text) return text;
  let t = text;
  t = t.replace(/\b([CTLS])(\d{1,2})([CTLS])(\d{1,2})\b/gi, (m, a, b, c, d) => {
    const key = canonLevel(a, b, c, d);
    return key || m;
  });
  // "<level> colon" -> "<level>:"
  t = t.replace(/(\b[CTLS]\s?\d{1,2}\s?(?:[-\/–]\s?)?(?:[CTLS]\s?)?\d{1,2})\s+colon\b/gi, (m, lv) => {
    const mm = lv.match(/^([CTLS])\s?(\d{1,2})\s?(?:[-\/–]\s?)?(?:([CTLS])\s?)?(\d{1,2})$/i);
    const key = mm ? canonLevel(mm[1], mm[2], mm[3], mm[4]) : null;
    return key ? `${key}:` : m;
  });
  // spoken "period" -> "."
  t = t.replace(/\s*\bperiod\b\.?\s*/gi, '. ').replace(/\.\s*\./g, '.').replace(/\s+\./g, '.');
  t = t.replace(/,\s*\./g, '.').replace(/\.\s*,\s*/g, ', ').replace(/:\s*\./g, ':').replace(/\.\s*\./g, '.');
  return t.trim();
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
  // Dictation in "C3-C4: ...." header style: everything up to the next level header belongs to that level.
  const HEADER_RE = /([CTLS]\s?\d{1,2}\s?(?:[-\/–]\s?)?(?:[CTLS]\s?)?\d{1,2})\s*:/gi;
  const heads = [];
  let hm;
  while ((hm = HEADER_RE.exec(text)) !== null) {
    const mm = hm[1].match(/^([CTLS])\s?(\d{1,2})\s?(?:[-\/–]\s?)?(?:([CTLS])\s?)?(\d{1,2})$/i);
    const key = mm ? canonLevel(mm[1], mm[2], mm[3], mm[4]) : null;
    if (key) heads.push({ key, start: hm.index, end: hm.index + hm[0].length });
  }
  if (heads.length) {
    const seg = {};
    heads.forEach((h, i) => {
      const body = text.slice(h.end, i + 1 < heads.length ? heads[i + 1].start : text.length).trim();
      if (body) (seg[h.key] = seg[h.key] || []).push(body);
    });
    const pre = text.slice(0, heads[0].start).trim();
    const out = [];
    regionLevels.forEach(l => { if (seg[l]) out.push(`- ${l}: "${seg[l].join(' ')}"`); });
    Object.keys(seg).filter(l => !regionLevels.includes(l)).forEach(l => out.push(`- ${l} (outside the ${region} coverage list): "${seg[l].join(' ')}"`));
    const none = regionLevels.filter(l => !seg[l]);
    return `\n\nLEVEL-BY-LEVEL DICTATION INDEX (built automatically from the dictation above; every sentence after a level header up to the next level header belongs ONLY to that level; use it to verify level assignment — the dictation above is still the only source of findings):
${out.join('\n')}
Levels NOT mentioned anywhere in the dictation — no-significant-narrowing default only: ${none.length ? none.join(', ') : '(none)'}${pre ? `\nText before the first level header (history / general findings, not level-specific): "${pre}"` : ''}
Never move a listed sentence to a different level.`;
  }
  const sentences = text.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const byLevel = {};
  const multi = [];
  const mentioned = new Set();
  for (const s of sentences) {
    const toks = findTokens(s);
    if (!toks.length) continue;
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
Levels NOT mentioned anywhere in the dictation — no-significant-narrowing default only: ${none.length ? none.join(', ') : '(none)'}
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
  const blocks = [];
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
    const needCanal = !/canal|thecal/i.test(joined);
    let needR = false, needL = false;
    if (b.key !== 'C1-C2' && !/side not specified/i.test(joined)) {
      if (!/foram/i.test(joined)) { needR = true; needL = true; }
      else {
        const hasR = /\bright\b|bilateral|\bboth\b/i.test(joined);
        const hasL = /\bleft\b|bilateral|\bboth\b/i.test(joined);
        // a generic foraminal statement with no side at all (e.g. "No significant canal or foraminal narrowing") covers both foramina
        if (hasR || hasL) { needR = !hasR; needL = !hasL; }
      }
    }
    const adds = [];
    if (needCanal && needR && needL) adds.push('No significant canal or foraminal narrowing.');
    else {
      if (needCanal) adds.push('No significant canal narrowing.');
      if (needR && needL) adds.push('No significant right or left neural foraminal narrowing.');
      else if (needR) adds.push('No significant right neural foraminal narrowing.');
      else if (needL) adds.push('No significant left neural foraminal narrowing.');
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
  blocks.filter(b => !used.has(b)).forEach(b => outBody.push(...b.lines));
  return [...lines.slice(0, start + 1), ...outBody, ...(end < lines.length ? [''] : []), ...lines.slice(end)].join('\n');
}
