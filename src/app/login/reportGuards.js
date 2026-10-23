// reportGuards.js — deterministic post-generation guards + a few shared prompt
// rules (added 2026-10-23). Same pattern as spineReportGuard.js: prompt rules
// alone were not 100% reliable, so these run in code on every generated report.
//
// USAGE IN page.js (generateReport only):
//   import { enforceTechniqueSide, stripRedundantNeurovascular,
//            KNEE_ITB_HEADING_RULE, NERVE_VS_NEUROVASCULAR_RULE } from './reportGuards';
//   const guarded = stripRedundantNeurovascular(enforceTechniqueSide(text, lat));

// ── 1. Laterality in TECHNIQUE (and the "normal exam" impression line) ───────
// The exam heading and the contrast wording were already forced from the UI
// selection by sanitizeReportOutput(), but the TECHNIQUE sentence was not — so
// the model could occasionally write "right knee" under a "LEFT KNEE" heading.
// The side is known in code (the Side dropdown), so it is enforced here.
// No-op for bilateral exams or exams with no side (spine, pelvis).
export function enforceTechniqueSide(text, lat) {
  if (!text) return text;
  const side = (lat || '').toLowerCase().trim();
  if (side !== 'left' && side !== 'right') return text;
  const fix = (m) => {
    // preserve capitalization of the original word
    const out = side;
    if (m === m.toUpperCase()) return out.toUpperCase();
    if (m[0] === m[0].toUpperCase()) return out[0].toUpperCase() + out.slice(1);
    return out;
  };
  return text
    .split('\n')
    .map((line) => {
      const t = line.trim();
      // TECHNIQUE line, or the standard "No significant MRI/CT findings of the <side> ..." line
      if (/^TECHNIQUE:/i.test(t) || /^\d*\.?\s*No significant (MRI|CT) findings of the\b/i.test(t)) {
        return line.replace(/\b(left|right)\b/gi, fix);
      }
      return line;
    })
    .join('\n');
}

// ── 2. Individual nerves vs. a neurovascular-bundle section: never both ──────
// If the findings contain a heading for an individual nerve (e.g. "Ulnar Nerve:",
// "Median Nerve:", "Radial Nerve / Posterior Interosseous Nerve:"), any separate
// neurovascular-bundle / "Regional Neurovascular Structures" heading is removed.
export function stripRedundantNeurovascular(text) {
  if (!text) return text;
  const lines = text.split('\n');
  const headingOf = (l) => {
    const m = l.trim().match(/^([A-Z][^:\n]{0,80}):/);
    return m ? m[1] : null;
  };
  const inFindings = (() => {
    const f = lines.findIndex((l) => /^FINDINGS:?\s*$/i.test(l.trim()));
    const i = lines.findIndex((l) => /^IMPRESSION:?\s*$/i.test(l.trim()));
    return { start: f, end: i === -1 ? lines.length : i };
  })();
  if (inFindings.start === -1) return text;
  let hasNerveHeading = false;
  for (let i = inFindings.start + 1; i < inFindings.end; i++) {
    const h = headingOf(lines[i]);
    if (h && /\bnerve\b/i.test(h) && !/neurovascular/i.test(h)) { hasNerveHeading = true; break; }
  }
  if (!hasNerveHeading) return text;
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const h = i > inFindings.start && i < inFindings.end ? headingOf(lines[i]) : null;
    if (h && /neurovascular|neuro-vascular|vascular bundle/i.test(h)) {
      // drop this heading line; also drop one blank line that followed it, if any
      if (lines[i + 1] !== undefined && lines[i + 1].trim() === '') i++;
      continue;
    }
    out.push(lines[i]);
  }
  return out.join('\n');
}

// ── 3. Prompt rules (kept here so page.js only needs the import) ─────────────
export const NERVE_VS_NEUROVASCULAR_RULE = `
NERVES vs NEUROVASCULAR BUNDLE — NEVER BOTH (MANDATORY, ALL JOINTS): If the FINDINGS contain a separate heading for any individual nerve (e.g. Ulnar Nerve, Median Nerve, Radial Nerve / Posterior Interosseous Nerve, Axillary Nerve, Common Peroneal Nerve, Tibial Nerve, Sciatic Nerve), do NOT also generate a "Regional Neurovascular Structures:" heading or any other neurovascular bundle heading (for example "Femoral Neurovascular Bundle:") anywhere in the report. It is ALWAYS one or the other: either separate individual-nerve headings, or a single neurovascular-structures heading — never both. This overrides the GLOBAL DEFAULTS neurovascular default and any anatomy list. The elbow, humerus, forearm and wrist anatomy lists already use individual nerve headings, so they never get a neurovascular heading.
`;

export const KNEE_ITB_HEADING_RULE = `
KNEE MRI — IT BAND / BICEPS FEMORIS / POPLITEUS HEADING (MANDATORY): Generate exactly ONE additional subheading on every knee MRI, with this exact heading text: "IT band, biceps femoris and popliteus tendon:" — place it immediately after the Lateral Collateral Ligament Complex heading. It is a single combined heading — never split it into three headings and never rename it. Default when none of these structures is dictated: "intact." If any of the iliotibial band, the biceps femoris tendon, or the popliteus tendon is dictated, describe the dictated finding(s) for each named structure within this one heading, and state "intact" for any of the three that were not mentioned only if at least one of the three has a dictated finding (e.g. "Iliotibial band friction signal. Biceps femoris tendon and popliteus tendon intact."). Muscle-belly edema/atrophy of the biceps femoris or popliteus still goes under Muscles, never here.
`;
