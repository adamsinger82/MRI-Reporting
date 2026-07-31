// reportHeaderUtils.js — optional custom report header/letterhead line
// (e.g. "LUCID MSK ORTHOPEDIC IMAGING"), prepended to the top of every
// generated report.
//
// Deliberately kept separate from reportPreferencesUtils.js /
// reportPreferencesData.js — those are toggle-only by design specifically
// so nothing free-text (and therefore nothing a user could accidentally
// paste patient-identifying info into) lives there. This is the one
// intentional free-text field, isolated in its own file so it stays easy
// to find and audit. Users should be told to enter a practice/site name
// only — never patient information.
//
// STORAGE: reuses the same `user_report_preferences` table/row (one row
// per user_id, RLS-scoped to auth.uid()) as reportPreferencesUtils.js —
// just a dedicated column + dedicated accessors here.
//
// Run once in Supabase SQL Editor before using:
//   alter table public.user_report_preferences add column if not exists custom_header text not null default '';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TABLE = 'user_report_preferences';

function supaHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    apikey: getAnonKey(),
    Authorization: `Bearer ${accessToken || getAnonKey()}`,
  };
}

// Fetches this user's saved header. Never throws — a missing row or failed
// fetch just means "no header," not an error, so login never blocks on this.
export async function loadCustomHeader(userId, accessToken) {
  if (!userId) return '';
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/${TABLE}?user_id=eq.${userId}&select=custom_header`, {
      headers: supaHeaders(accessToken),
    });
    if (!res.ok) return '';
    const rows = await res.json();
    return rows?.[0]?.custom_header ?? '';
  } catch {
    return '';
  }
}

// Upserts just the custom_header column on this user's preferences row —
// same merge-duplicates pattern as saveReportPrefs, so it never clobbers
// the other report-style columns on that row.
export async function saveCustomHeader(userId, accessToken, headerText) {
  if (!userId) throw new Error('Not signed in.');
  const res = await fetch(`${SUPA_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: { ...supaHeaders(accessToken), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, custom_header: (headerText || '').trim() }),
  });
  if (!res.ok) throw new Error('Failed to save header.');
}

// Fire-and-forget save for use in a 'beforeunload' handler — regular fetch
// calls can get cancelled mid-flight when a tab closes, so this uses
// keepalive:true, which lets the browser finish a short in-flight request
// even after the page starts unloading. Not awaited by the caller; errors
// are swallowed since there's no UI left to show them to by the time this
// fires. This is a safety net only — the primary save is still the onBlur
// handler in page.js, which gives a normal awaited save with confirmation.
export function saveCustomHeaderKeepalive(userId, accessToken, headerText) {
  if (!userId) return;
  try {
    fetch(`${SUPA_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: { ...supaHeaders(accessToken), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: userId, custom_header: (headerText || '').trim() }),
      keepalive: true,
    });
  } catch {
    // Nothing to do — page is unloading.
  }
}

// Prepends the header (if set) to the top of a report, with a blank-line
// separator. Applied only at display/copy time — never sent to the AI, so
// it can never influence generation or leak into the model prompt.
export function applyCustomHeader(reportText, headerText) {
  const h = (headerText || '').trim();
  if (!h || !reportText) return reportText;
  return `${h.toUpperCase()}\n\n${reportText}`;
}
