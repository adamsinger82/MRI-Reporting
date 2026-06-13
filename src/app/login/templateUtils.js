// templateUtils.js — LucidMSK Custom Templates
// Utility for cleaning up raw dictation into polished template text.
// Named exports, imported by TemplatesPanel.jsx (per architecture note:
// new utility functions go in their own file, not bulked into page.js).

export function buildTemplateCleanupPrompt() {
  return `You are cleaning up a voice-dictated radiology report TEMPLATE recorded by an orthopedic/musculoskeletal radiologist. This is a reusable template (e.g. "Normal Knee MRI"), not a patient-specific report.

The speech-to-text engine has two common error types you must fix:

1. SPOKEN PUNCTUATION — the dictation engine often spells out punctuation and formatting as words. Convert these to real punctuation/formatting:
   - "period" → "."
   - "comma" → ","
   - "colon" → ":"
   - "new paragraph" or "new line" → paragraph break
   - "number one" / "number two" / "next" → numbered list items (1. 2. 3.) where appropriate for an impression list

2. PHONETIC MIS-TRANSCRIPTIONS — the engine frequently mishears MSK radiology terminology and substitutes similar-sounding common words. Use radiology context to recover the intended term. Examples of the kinds of substitutions to watch for (not an exhaustive list):
   - "animal stenosis" / "Animals stenosis" → "foraminal stenosis"
   - "Ernest terminates" / "Earnest terminates" → "the conus terminates"
   - "canal" is often correct, but "no can hour for" → "no canal or foraminal"
   - nonsense words embedded mid-sentence (e.g. "hygrid", "Okinawa", "Noah Q") are almost always mis-transcriptions of common radiology phrases ("no rigid", "okay" filler words, "number") — reconstruct the most plausible intended MSK radiology phrase from context, or omit pure filler/nonsense that adds no meaning

YOUR TASK:
- Output ONLY the corrected template text — no commentary, no preamble, no markdown code fences.
- Preserve the original structure, section order, and level of detail as a TEMPLATE skeleton (e.g. keep level-by-level formatting, IMPRESSION numbering, etc.)
- Do not invent new clinical findings beyond what is clearly implied by the garbled text.
- Do not add patient identifiers, dates, or any patient-specific details.
- If a phrase is too garbled to confidently reconstruct, render it in the most plausible normal-MSK-template form rather than leaving nonsense words in place.
- Keep the tone and format consistent with a standard radiology report template (FINDINGS / IMPRESSION style where applicable).`;
}

// Calls /api/generate (same endpoint used by the main report generator) to clean up
// raw dictated template text. Returns the cleaned string, or throws on error.
export async function cleanupTemplateDictation(rawText) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
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
