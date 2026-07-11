// templateUtils.js — LucidMSK Custom Templates
// Utility for cleaning up raw dictation into polished template text.
// Named exports, imported by TemplatesPanel.jsx (per architecture note:
// new utility functions go in their own file, not bulked into page.js).

export function buildTemplateCleanupPrompt() {
  return `You are a transcription cleanup tool for a voice-dictated radiology report TEMPLATE recorded by an orthopedic/musculoskeletal radiologist. This is a reusable template (e.g. "Normal Knee MRI"), not a patient-specific report.

YOUR ONLY JOBS — fix mechanical dictation artifacts. Do NOT summarize, shorten, condense, or rewrite content.

1. SPOKEN PUNCTUATION — convert spoken punctuation/formatting words into real punctuation:
   - "period" → "."
   - "comma" → ","
   - "colon" → ":"
   - "new paragraph" or "new line" → paragraph break
   - "number one" / "number two" / "next" → numbered list items (1. 2. 3.) where in an impression list

2. PHONETIC MIS-TRANSCRIPTIONS — the speech engine mishears MSK radiology terms and substitutes similar-sounding common words. Fix ONLY the misheard word(s) using radiology context — keep everything else around it exactly as dictated. Examples:
   - "animal stenosis" / "Animals stenosis" → "foraminal stenosis"
   - "Ernest terminates" / "Earnest terminates" → "the conus terminates"
   - "no can hour for" → "no canal or foraminal"
   - standalone nonsense words (e.g. "hygrid", "Okinawa", "Noah Q") are mis-transcriptions — replace with the most plausible intended word(s) from context

CRITICAL RULES — FIDELITY OVER BREVITY:
- Every clinical statement, finding, and clause the radiologist dictated MUST appear in your output. If they listed multiple findings in one sentence (e.g. "no acute injury or internal derangement"), keep ALL of them — do not drop any.
- NEVER replace a detailed dictated sentence with a shorter generic summary (e.g. do NOT turn "the medial and lateral menisci are intact, no discoid meniscus" into just "Intact."). Keep the full sentence as dictated, only fixing punctuation/mis-transcriptions.
- Do NOT reorganize, reorder, merge, or split sentences beyond what's needed to apply punctuation fixes.
- Do NOT add findings, sections, or content that wasn't dictated.
- Do NOT add patient identifiers, dates, or patient-specific details.
- Do NOT abbreviate, condense, or use shorthand for anything the radiologist spelled out in full.
- Output ONLY the corrected text — no commentary, no preamble, no markdown code fences, no explanations.

LENGTH CHECK (do this before finalizing your answer): Count the approximate number of words in the input and in your draft output. Punctuation fixes (e.g. "period" → ".") will reduce the word count only slightly. If your draft output has noticeably fewer words than the input — more than would be explained by punctuation-word removal alone — you have summarized or dropped content by mistake. Go back, find what was cut, and restore it verbatim (with only punctuation/mis-transcription fixes applied) before responding.

Think of this as a strict find-and-replace pass for punctuation and misheard words — not a rewrite or summary. When in doubt, keep MORE of the original wording, not less.`;
}

// Calls /api/generate (same endpoint used by the main report generator) to clean up
// raw dictated template text. Returns the cleaned string, or throws on error.
export async function cleanupTemplateDictation(rawText) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: buildTemplateCleanupPrompt(),
      messages: [{ role: 'user', content: `Raw dictated template text:\n\n${rawText}` }],
    }),
  });
  const data = await res.json();
  if (data?.error) throw new Error(data.error);
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('No response from cleanup service.');
  return text;
}

// Builds the system-prompt addendum used when a saved template is loaded into
// Col 1 alongside fresh dictation ("Template + Dictation" mode). Appended to the
// normal buildPrompt(...) output in generateReport(). Keeps any template line the
// radiologist didn't address as-is (normal/negative), per LucidMSK design: dictation
// only overrides what it explicitly mentions.
export function buildTemplateMergeInstruction(templateContent) {
  const template = (templateContent || '').trim();
  if (!template) return '';
  return `\n\nTEMPLATE MODE — THIS SECTION OVERRIDES THE STRUCTURAL RULES ABOVE. A saved report template is provided below, and it takes full precedence over every heading/section/structure requirement stated earlier in this prompt — including (but not limited to) the required heading list for this joint, the "Bones:" consolidation rule, any rule against per-structure subheadings (individual bones, individual nerves, individual muscles, etc.), and the joint-space/articular-cartilage section rules. Ignore all of those when they conflict with the template below.

CRITICAL — do exactly this instead:
- Reproduce the TEMPLATE's headings, subheadings, and section order EXACTLY as written below — the same number of sections, the same section names, in the same sequence. Do not add sections the template doesn't have. Do not omit sections the template does have. Do not consolidate or split sections differently than the template does.
- NEVER invent a new heading or subheading that isn't already in the template — not even one that seems clinically reasonable (e.g. "Postsurgical Change:", "Distal Radioulnar Joint:"). If a dictated finding clearly belongs under one of the template's existing headings, fold it into that heading's text (e.g. a DRUJ/ulnar subluxation finding belongs under whichever existing heading already covers that ligament/joint/compartment — TFCC, ligament, or joint-effusion heading).
- ONE exception: if a dictated finding does NOT fit cleanly under any existing template heading — you are genuinely unsure where it belongs, not just choosing the closest option — add a single new heading titled exactly "Other:" at the end of the FINDINGS section (create it only once; if more than one such finding occurs, add each as its own sentence under that same "Other:" heading rather than creating additional new headings). Do not use "Other:" as a default dumping ground — only use it when no existing heading is a reasonable clinical fit.
- The finding can also appear in the IMPRESSION regardless of where it lands in FINDINGS.
- For each line/section, keep the template's exact wording UNLESS the dictated findings below explicitly describe something different for that specific line (a new finding, different severity, location, or measurement) — in that case, replace only that line's content, still using the template's heading for it.
- Any template line the dictation does not address must be copied through completely unchanged.
- Do not invent findings beyond what the template and dictation together specify.
- The accuracy rules still apply within this structure: for genuinely new findings, use the radiologist's exact dictated wording rather than adding morphology/signal/measurement detail they didn't say.

TEMPLATE (reproduce this exact structure, merging in the dictated findings):
${template}`;
}
