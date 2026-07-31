// clipboardUtils.js — auto-copy the freshly generated report to the clipboard
// so PowerScribe/Dragon/Fluency users can paste with one keystroke instead of
// clicking Copy first. Silent — no toast, no UI change. The Col 2 status text
// in CopyButton.js confirms it's ready.
//
// USAGE IN page.js:
//   import { autoCopyReport } from './clipboardUtils';
//   ...inside generateReport() and generateRheumReport(), right after
//   setGeneratedReport(cleanText):
//   autoCopyReport(cleanText);
//
// NOTE: an earlier version of this file prepended an invisible marker
// (LUCIDMSK_MARKER) for a planned AHK auto-paste script. That script was
// never adopted (browser-only auto-copy was chosen instead), and the
// marker's bracket text wasn't actually invisible when pasted — so it has
// been removed. Do not reintroduce a visible-text marker here.

import { formatForPSOne } from './CopyButton';

export async function autoCopyReport(reportText) {
  if (!reportText?.trim()) return;
  try {
    const formatted = formatForPSOne(reportText);
    await navigator.clipboard.writeText(formatted);
  } catch {
    // Clipboard write can silently fail (permissions, tab not focused, etc).
    // Not a problem — the report is still visible in Col 2 and can be copied
    // manually, so we swallow this rather than surface an error for what's
    // meant to be an invisible convenience feature.
  }
}

