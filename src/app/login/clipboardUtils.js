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
//
// WHY autoCopyReport() ALSO HAS A LEGACY FALLBACK:
// Even with priming, some browser states still reject the async Clipboard
// API write — most commonly when the tab loses focus (user alt-tabs or
// clicks another window) while the AI call is running, which is a very
// normal thing to do during a multi-second wait. That's what was causing
// the "Auto-copy failed" banner to show up intermittently rather than on
// a predictable trigger. document.execCommand('copy') is deprecated but
// tends to succeed in some of these focus-related states where the modern
// API fails, so it's tried as a second attempt before giving up and
// surfacing the manual "click to copy" fallback in CopyButton.js.

import { formatForPSOne } from './CopyButton';

export function primeClipboardPermission() {
  try {
    // Fire-and-forget: writes a harmless single space to "unlock" persistent
    // clipboard-write access for this origin. Must be called synchronously,
    // before any await, inside the same click handler that starts generation.
    // The .catch() below just silences an unhandled-rejection warning if this
    // priming write itself gets rejected (e.g. document not focused yet) —
    // autoCopyReport()'s own return value is what callers actually rely on.
    navigator.clipboard?.writeText(' ')?.catch(() => {});
  } catch {
    // Some browsers/contexts disallow this entirely — autoCopyReport's own
    // return value still tells the caller whether the real copy succeeded.
  }
}

// Legacy copy path used only when navigator.clipboard.writeText() fails.
// Builds a hidden, off-screen textarea, selects its contents, and uses the
// older execCommand('copy') API, which is tolerant of some browser states
// (e.g. recently-lost tab focus) that the async Clipboard API is not.
function legacyCopy(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

// Returns true if the copy succeeded, false if it silently failed — so
// callers can show a fallback ("click to copy") instead of assuming success.
export async function autoCopyReport(reportText) {
  if (!reportText?.trim()) return false;
  const formatted = formatForPSOne(reportText);
  try {
    await navigator.clipboard.writeText(formatted);
    return true;
  } catch {
    // Modern Clipboard API failed (most often a lost-focus/activation
    // issue) — try the legacy execCommand path before reporting failure.
    return legacyCopy(formatted);
  }
}
