// fidelityGuards.js — "only what was dictated" + MRI soft-tissue rules (added 2026-11-03).
//   DICTATION_FIDELITY_RULE  prompt rule (all MRI/CT body parts, not rheum)
//   MRI_SOFT_TISSUE_RULE     prompt rule (MRI only) — soft tissue heading only if dictated, or if the whole exam is normal
//   stripNormalSoftTissues   post-generation guard that enforces the soft-tissue rule in code (MRI only)

export const DICTATION_FIDELITY_RULE = `
ONLY WHAT WAS DICTATED — NO ADDED FINDINGS (MANDATORY, ZERO TOLERANCE, OVERRIDES EVERYTHING ELSE):
1. Every abnormal word in FINDINGS and IMPRESSION must trace to a phrase the radiologist actually dictated as an imaging observation of THAT structure. If you cannot point to the dictated words, do not write it.
2. A structure that was not described is reported with its default text ONLY (e.g. "intact", "No acute abnormality"). Never add signal change, degeneration, tearing, thickening, edema, effusion, grade, size, chronicity or any other descriptor to an undescribed structure.
3. The referring clinician's suspicion, the clinical question or the history (e.g. "clinician suspects lateral meniscus tear", "rule out ACL tear", "pain over the medial side") is NOT a finding. It never creates, implies or "fills in" a finding. Example: if the dictation describes a medial meniscus tear and only the history mentions the lateral meniscus, the lateral meniscus gets its default text and nothing else.
4. A finding dictated for one structure, side, compartment or level is never copied, mirrored or inferred for a different one (medial vs lateral, anterior vs posterior, left vs right, one spinal level vs another).
5. Do not add qualifiers the radiologist did not say (e.g. "degenerative", "chronic", "mild", "associated", "likely") and do not add descriptors of signal or morphology that were not dictated.
6. Before finishing, silently check every non-default sentence against the dictation and delete any that has no dictated source.
`;

export const MRI_SOFT_TISSUE_RULE = `
SOFT TISSUES — MRI (MANDATORY, OVERRIDES EVERY OTHER SOFT TISSUE / PARASPINAL SOFT TISSUE DEFAULT IN THIS PROMPT):
- Do NOT write a default "Soft Tissues:" line (for spine: "Paraspinal Soft Tissues:") when the exam contains ANY dictated abnormality. In an abnormal exam, a statement such as "intact", "normal", "unremarkable" or "No acute abnormality" for soft tissues is forbidden — omit the heading.
- Generate the heading ONLY in one of two cases: (a) a soft tissue finding was actually dictated (e.g. soft tissue edema, hematoma, fluid collection, mass, subcutaneous change, incidental visceral finding) — then the heading contains exactly the dictated finding(s) and never a normal statement; or (b) the ENTIRE exam is normal (nothing abnormal dictated anywhere) — then and only then write the default "No acute abnormality."
- Dictated soft tissue edema or other soft tissue abnormality must never be dropped and must never be described as normal or intact.
`;

// ── Guard ────────────────────────────────────────────────────────────────────
const NORMAL_VALUE = /^(?:no acute (?:soft tissue )?abnormality(?: identified| seen)?|no (?:significant |acute )?soft tissue abnormality|intact|normal|unremarkable|within normal limits|no abnormality)\.?$/i;
const ST_HEADING = /^(?:paraspinal )?soft tissues?:\s*(.*)$/i;
const SECTION = /^(TECHNIQUE|FINDINGS|LEVELS|IMPRESSION|NUMBERING CONVENTION|REFERENCES?|FOOTNOTE|UNDERSTANDING YOUR RESULTS):?\s*$/i;

export function stripNormalSoftTissues(text, isCT) {
  if (!text || isCT) return text;
  const lines = text.split('\n');
  const imp = lines.findIndex(l => /^IMPRESSION:?\s*$/i.test(l.trim()));
  // "completely normal" = the standard normal-exam impression line
  let examNormal = false;
  if (imp !== -1) {
    const firstItem = lines.slice(imp + 1).find(l => l.trim());
    if (firstItem && /^\s*(?:1\.\s*)?No significant (?:MRI|CT) findings\b/i.test(firstItem)) examNormal = true;
  }
  if (examNormal) return text;
  const out = [];
  let inFindings = false;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (SECTION.test(t)) inFindings = /^(FINDINGS|LEVELS)/i.test(t);
    if (inFindings) {
      const m = t.match(ST_HEADING);
      if (m && NORMAL_VALUE.test(m[1].trim())) {
        // drop one trailing blank line, but keep the blank that separates the next section header
        if (lines[i + 1] !== undefined && lines[i + 1].trim() === '' && !(lines[i + 2] !== undefined && SECTION.test(lines[i + 2].trim()))) i++;
        continue;
      }
    }
    out.push(lines[i]);
  }
  return out.join('\n');
}
