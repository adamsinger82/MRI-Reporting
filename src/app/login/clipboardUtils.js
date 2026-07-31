// clipboardUtils.js — auto-copy the freshly generated report to the clipboard
// so PowerScribe/Dragon/Fluency users can paste with one keystroke instead of
// clicking Copy first. Silent by default — no toast, no UI change — but
// reports success/failure so page.js can show a fallback if it fails.
//
// USAGE IN page.js:
//   import { primeClipboardPermission, autoCopyReport } from './clipboardUtils';
//
//   In the Generate button handler, as the very FIRST line (before any
//   await — see note below):
//     primeClipboardPermission();
//
//   After setGeneratedReport(cleanText):
//     const copied = await autoCopyReport(cleanText);
//     setClipboardStatus(copied ? 'copied' : 'failed');
//
// WHY primeClipboardPermission() EXISTS:
// Browsers only allow navigator.clipboard.writeText() to run silently
// within a short window of "user activation" after a click. Report
// generation waits on an AI call that can take several seconds — by the
// time autoCopyReport() runs, that activation window may have expired,
// and the write fails silently (this is what caused the second report's
// copy to be skipped, leaving the first report's text on the clipboard).
// Calling writeText() synchronously at the very start of the click
// handler — before any `await` — uses the fresh activation from the
// click itself. Once a site successfully writes to the clipboard during
// an activated gesture, browsers persist clipboard-write access for that
// origin, so the later write (after the AI call finishes, activation long
// expired) goes through too.

import { formatForPSOne } from './CopyButton';

export function primeClipboardPermission() {
  try {
    // Fire-and-forget: writes a harmless single space to "unlock" persistent
    // clipboard-write access for this origin. Must be called synchronously,
    // before any await, inside the same click handler that starts generation.
    navigator.clipboard.writeText(' ');
  } catch {
    // Some browsers/contexts disallow this entirely — autoCopyReport's own
    // return value still tells the caller whether the real copy succeeded.
  }
}

// Returns true if the copy succeeded, false if it silently failed — so
// callers can show a fallback ("click to copy") instead of assuming success.
export async function autoCopyReport(reportText) {
  if (!reportText?.trim()) return false;
  try {
    const formatted = formatForPSOne(reportText);
    await navigator.clipboard.writeText(formatted);
    return true;
  } catch {
    return false;
  }
}


