// impressionPreviewUtils.js — LucidMSK Impression Style Preview
// Named export, imported by ImpressionStyleModal.jsx.
// Generates a short, isolated IMPRESSION-only preview for the fixed sample
// shoulder case, using the exact same rule text as real report generation
// (imported from reportStyleRules.js) so previews never drift from reality.

import { SAMPLE_SHOULDER_FINDINGS } from './sampleShoulderCase';
import { LENGTH_RULE_TEXT, STYLE_RULE_TEXT, NEGATIVES_RULE_TEXT } from './reportStyleRules';

function buildImpressionPreviewPrompt({ lengthKey, styleKey, includeNegatives }) {
  const overrides = [];
  if (LENGTH_RULE_TEXT[lengthKey]) overrides.push(LENGTH_RULE_TEXT[lengthKey]);
  if (STYLE_RULE_TEXT[styleKey]) overrides.push(STYLE_RULE_TEXT[styleKey]);
  if (includeNegatives) overrides.push(NEGATIVES_RULE_TEXT);

  return `You are a subspecialty MSK radiologist. Below is the completed FINDINGS section of a shoulder MRI report — treat it as final and do not alter it. Your ONLY task is to generate the IMPRESSION section that would accompany these findings.

DEFAULT IMPRESSION RULES: Group related findings under a unifying clinical diagnosis, aim for 1-4 items, avoid a laundry list, order acute findings first then by severity, and do not restate pertinent negatives in the impression.
${overrides.length ? '\n' + overrides.map(o => `- ${o}`).join('\n') : ''}

FORMATTING: No markdown. Begin your response with "IMPRESSION:" as the literal first characters, then numbered items each on its own line. Output ONLY the IMPRESSION section — no findings restated, no commentary, no preamble.

FINDINGS:
${SAMPLE_SHOULDER_FINDINGS}`;
}

// Returns the generated impression text, or throws on error.
export async function generateImpressionPreview({ lengthKey = 'standard', styleKey = 'standard', includeNegatives = false }) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: buildImpressionPreviewPrompt({ lengthKey, styleKey, includeNegatives }),
      messages: [{ role: 'user', content: 'Generate the impression.' }],
    }),
  });
  const data = await res.json();
  if (data?.error) throw new Error(data.error);
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('No response from preview service.');
  return text.trim();
}
