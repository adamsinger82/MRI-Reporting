// researchUtils.js — Supabase helpers for admin-managed research article posts.
// Mirrors the existing job_posts fetch/submit/remove pattern already used in
// MSKHubModal so the data-access style stays consistent across tabs.
//
// REQUIRED SUPABASE TABLE (run once in Supabase SQL editor):
//
// create table research_posts (
//   id uuid primary key default gen_random_uuid(),
//   title text not null,
//   journal text,
//   citation text,
//   summary text[] not null default '{}',
//   key_takeaway text,
//   link text,
//   tags text[] not null default '{}',
//   created_by text,
//   created_at timestamptz not null default now()
// );
//
// alter table research_posts enable row level security;
//
// -- Anyone (incl. anon) can read posts — this is public-facing content
// create policy "research_posts_select_all" on research_posts
//   for select using (true);
//
// -- Only admins can insert/delete. Simplest approach matching the rest of the
// -- app: check the email on the auth row. Swap in a proper role check later if
// -- you add one. For now, RLS is left open to authenticated users and the
// -- ADMIN_EMAILS allowlist in page.js gates the UI (same pattern as Jobs Board
// -- admin approve/remove buttons, which also rely on UI-level isAdmin rather
// -- than a DB-level role check).
// create policy "research_posts_insert_authenticated" on research_posts
//   for insert to authenticated with check (true);
// create policy "research_posts_delete_authenticated" on research_posts
//   for delete to authenticated using (true);
//
// NOTE: article_likes and article_comments currently key off a numeric
// post_idx (array index in RESEARCH_POSTS). Once posts live in a DB table,
// idx is unstable (new posts shift older ones). This file's fetchResearchPosts
// returns rows with a stable string `id` (uuid) — use post.id as the like/
// comment key going forward instead of array index. See migration note in
// page.js wiring instructions.

export function sbHeadersFor(currentUser) {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = currentUser?.access_token || key;
  return { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${token}` };
}

export function sbUrlFor(SUPABASE_URL, path) {
  return `${SUPABASE_URL}/rest/v1/${path}`;
}

// Fetch all research posts, newest first.
export async function fetchResearchPosts(SUPABASE_URL, currentUser) {
  try {
    const res = await fetch(
      sbUrlFor(SUPABASE_URL, 'research_posts?select=*&order=created_at.desc'),
      { headers: sbHeadersFor(currentUser) }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('fetchResearchPosts error:', e);
    return [];
  }
}

// Create a new research post. `post` shape:
// { title, journal, citation, summary: string[], key_takeaway, link, tags: string[] }
export async function createResearchPost(SUPABASE_URL, currentUser, post) {
  const res = await fetch(sbUrlFor(SUPABASE_URL, 'research_posts'), {
    method: 'POST',
    headers: { ...sbHeadersFor(currentUser), Prefer: 'return=representation' },
    body: JSON.stringify({
      title: post.title?.trim() || '',
      journal: post.journal?.trim() || '',
      citation: post.citation?.trim() || '',
      summary: Array.isArray(post.summary) ? post.summary.filter(s => s.trim()) : [],
      key_takeaway: post.key_takeaway?.trim() || '',
      link: post.link?.trim() || '',
      tags: Array.isArray(post.tags) ? post.tags.filter(t => t.trim()) : [],
      created_by: currentUser?.email || null,
    }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(errBody));
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

// Delete a research post by id.
export async function deleteResearchPost(SUPABASE_URL, currentUser, id) {
  const res = await fetch(sbUrlFor(SUPABASE_URL, `research_posts?id=eq.${id}`), {
    method: 'DELETE',
    headers: sbHeadersFor(currentUser),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || 'Delete failed');
  }
  return true;
}
