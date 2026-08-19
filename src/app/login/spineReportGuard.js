// spineReportGuard.js — post-processing safety net for spine reports.
//
// The prompt in page.js's buildPrompt() already instructs the model, in the
// strongest terms, to never give listhesis (any grade/direction) or Modic /
// endplate changes their own IMPRESSION line — see "IMPRESSION EXCLUSIONS —
// SPINE DEGENERATIVE FINDINGS" under the SPINE section of buildPrompt(). In
// practice that prompt-level rule has not been followed 100% of the time.
// Since this is a hard, deterministic rule (these findings must NEVER appear
// in IMPRESSION, regardless of severity) rather than a judgment call, we
// enforce it here in code too — mirroring the sanitizeReportOutput() pattern
// already used in page.js for the exam heading/contrast label, which exists
// for the same reason: don't rely on prompt compliance alone for something
// we can just guarantee mechanically.
//
// This only ever touches the IMPRESSION section of spine reports. FINDINGS
// content (Vertebral Alignment, Intervertebral Discs, LEVELS — where
// listhesis/Modic language is supposed to live) is left completely alone.
//
// USAGE IN page.js:
//   import { stripSpineImpressionViolations } from './spineReportGuard';
//   const cleanReport = stripSpineImpressionViolations(
//     applyCustomHeader(sanitizeReportOutput(rawText, expectedHeading, contrastLbl), customHeader),
//     selectedBodyPart
//   );

const VIOLATION_PATTERN = /\b(retrolisthesis|anterolisthesis|listhesis|spondylolisthesis|modic\b|endplate\s+change)/i;

export function stripSpineImpressionViolations(reportText, part) {
  if (!reportText || part !== 'spine') return reportText;

  const impressionHeaderMatch = reportText.match(/^IMPRESSION:?[ \t]*$/im);
  if (!impressionHeaderMatch) return reportText; // no recognizable IMPRESSION heading — leave untouched

  const impressionStart = impressionHeaderMatch.index + impressionHeaderMatch[0].length;
  const afterImpression = reportText.slice(impressionStart);

  // IMPRESSION ends at the next section header (FOOTNOTE/REFERENCES, or the
  // patient-facing UNDERSTANDING YOUR RESULTS section) or at the end of the
  // report, whichever comes first.
  const nextHeaderMatch = afterImpression.match(/\n(?=(FOOTNOTES?|REFERENCES?|UNDERSTANDING YOUR RESULTS)\b)/i);
  const impressionEnd = nextHeaderMatch ? nextHeaderMatch.index : afterImpression.length;
  const impressionBody = afterImpression.slice(0, impressionEnd);
  const tail = afterImpression.slice(impressionEnd);

  const lines = impressionBody.split('\n');
  let removedAny = false;
  const kept = lines.filter(line => {
    if (line.trim() && VIOLATION_PATTERN.test(line)) { removedAny = true; return false; }
    return true;
  });
  if (!removedAny) return reportText;

  // If stripping violations would leave no substantive impression content at
  // all, bail out rather than silently producing an empty IMPRESSION section
  // — surfacing the rule-violating text for the radiologist to catch/edit is
  // safer than hiding that generation went wrong.
  const hasSubstantiveLine = kept.some(l => /\S/.test(l));
  if (!hasSubstantiveLine) return reportText;

  // Renumber any remaining numbered items (1. 2. 3. ...) sequentially so
  // removed lines don't leave gaps like "1. ... 3. ...".
  let n = 0;
  const renumbered = kept.map(line => {
    const m = line.match(/^(\s*)(\d+)\.(\s*)(.*)$/);
    if (!m) return line;
    n += 1;
    return `${m[1]}${n}.${m[3]}${m[4]}`;
  });

  return reportText.slice(0, impressionStart) + renumbered.join('\n') + tail;
}
