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

// ── Promised clipboard write (2026-10-23) ─────────────────────────────────
// Chromium (Chrome/Edge) rejects clipboard writes whenever the tab is not
// focused — e.g. you switch to PowerScribe while the AI is still generating,
// which is the normal workflow. The fix: start the clipboard write RIGHT NOW,
// inside the Generate click while the tab is focused, handing the browser a
// ClipboardItem whose text is a Promise. The browser accepts the write at
// click time, and autoCopyReport() fills the text in later when the report
// arrives — even if focus has since moved to another window.
let deferred = null; // { resolve, reject, writePromise }

function dropDeferred(reason) {
  if (!deferred) return;
  try { deferred.reject(new Error(reason)); } catch {}
  deferred.writePromise?.catch?.(() => {});
  deferred = null;
}

export function primeClipboardPermission() {
  try {
    dropDeferred('superseded by a newer generate click');
    if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
      // Older browsers: fall back to the old priming write.
      navigator.clipboard?.writeText(' ')?.catch(() => {});
      return;
    }
    let resolve, reject;
    const textPromise = new Promise((res, rej) => { resolve = res; reject = rej; });
    const blobPromise = textPromise.then((t) => new Blob([t], { type: 'text/plain' }));
    blobPromise.catch(() => {});
    // MUST be called synchronously inside the click handler (before any await).
    const writePromise = navigator.clipboard.write([new ClipboardItem({ 'text/plain': blobPromise })]);
    writePromise.catch(() => {});
    const mine = { resolve, reject, writePromise };
    deferred = mine;
    // Safety: never leave a write hanging forever (e.g. generation errored out).
    setTimeout(() => { if (deferred === mine) dropDeferred('timed out waiting for report'); }, 120000);
  } catch {
    deferred = null;
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

// ── Late retry (2026-10-23) ───────────────────────────────────────────────
// Most "Auto-copy failed" banners happen because the user switches to
// PowerScribe/PACS while the AI call is running: the browser tab no longer has
// focus when the report arrives, and BOTH clipboard APIs refuse to write while
// the document is unfocused. Instead of just giving up, the copy is retried the
// moment the user comes back to this tab/window (focus / visibilitychange), plus
// a light poll while the tab is focused. onLateSuccess() lets page.js flip the
// banner to the green "Ready to paste" state.
let pending = null; // { cleanup }

function cancelPending() {
  if (pending) { pending.cleanup(); pending = null; }
}

async function writeNow(formatted) {
  try {
    await navigator.clipboard.writeText(formatted);
    return true;
  } catch {
    return legacyCopy(formatted);
  }
}

function armLateRetry(formatted, onLateSuccess) {
  if (typeof window === 'undefined') return;
  let done = false;
  let poll = null;
  let giveUp = null;
  const attempt = async () => {
    if (done) return;
    if (typeof document !== 'undefined' && document.hasFocus && !document.hasFocus()) return;
    if (await writeNow(formatted)) {
      cleanup();
      pending = null;
      try { onLateSuccess?.(); } catch {}
    }
  };
  const cleanup = () => {
    done = true;
    window.removeEventListener('focus', attempt);
    document.removeEventListener('visibilitychange', attempt);
    if (poll) clearInterval(poll);
    if (giveUp) clearTimeout(giveUp);
  };
  window.addEventListener('focus', attempt);
  document.addEventListener('visibilitychange', attempt);
  poll = setInterval(attempt, 1500);
  giveUp = setTimeout(() => { cleanup(); pending = null; }, 10 * 60 * 1000);
  pending = { cleanup };
}

// Returns true if the copy succeeded, false if it did not (yet) — so callers
// can show a fallback ("click to copy") instead of assuming success. If the
// first attempt fails, a late retry is armed; onLateSuccess fires if it works.
export async function autoCopyReport(reportText, onLateSuccess) {
  const d = deferred; deferred = null;
  if (!reportText?.trim()) { if (d) { try { d.reject(new Error('empty report')); } catch {} d.writePromise.catch(() => {}); } return false; }
  cancelPending(); // a newer report supersedes any pending older retry
  const formatted = formatForPSOne(reportText);
  if (d) {
    // Fill in the clipboard write that was started at click time.
    d.resolve(formatted);
    try { await d.writePromise; return true; } catch { /* fall through to the normal paths */ }
  }
  if (await writeNow(formatted)) return true;
  armLateRetry(formatted, onLateSuccess);
  return false;
}
