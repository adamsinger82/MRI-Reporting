// clipboardUtils.js — auto-copy the freshly generated report to the clipboard
// so PowerScribe/Dragon/Fluency users can paste with one keystroke instead of
// clicking Copy first. Silent — no toast, no UI change. The Col 2 Copy button
// in CopyButton.js remains the reliable manual fallback (and lets users pick
// a different platform format if they're not using PS One).
//
// USAGE IN page.js:
//   import { autoCopyReport } from './clipboardUtils';
//   ...inside generateReport() and generateRheumReport(), right after
//   setGeneratedReport(cleanText):
//   autoCopyReport(cleanText);

import { formatForPSOne } from './CopyButton';

// Invisible zero-width marker — lets the optional AHK auto-paste script (off
// by default, opt-in per user) recognize LucidMSK reports on the clipboard
// without ever showing up in the pasted text itself. Must match the marker
// used in CopyButton.js's manual Copy button so both paths are interchangeable.
export const LUCIDMSK_MARKER = '\u200B[[LUCIDMSK]]\u200B';

export async function autoCopyReport(reportText) {
  if (!reportText?.trim()) return;
  try {
    const formatted = formatForPSOne(reportText);
    await navigator.clipboard.writeText(LUCIDMSK_MARKER + formatted);
  } catch {
    // Clipboard write can silently fail (permissions, tab not focused, etc).
    // Not a problem — the report is still visible in Col 2 and can be copied
    // manually via the Copy button, so we swallow this rather than surface
    // an error for what's meant to be an invisible convenience feature.
  }
}
