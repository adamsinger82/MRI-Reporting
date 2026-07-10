-- ─────────────────────────────────────────────────────────────────────────
-- LucidMSK — Report Style Preferences table
-- Safe to run whether or not you already ran an earlier version of this
-- script — every statement is idempotent (CREATE ... IF NOT EXISTS / DROP
-- ... IF EXISTS then CREATE). Run this once in Supabase SQL Editor
-- (Project → SQL Editor → New query).
-- ─────────────────────────────────────────────────────────────────────────

-- Full table, in case this is the first time you're running this script
create table if not exists public.user_report_preferences (
  user_id                        uuid primary key references auth.users(id) on delete cascade,
  normal_term                    text not null default 'intact',
  impression_length              text not null default 'standard',
  impression_style               text not null default 'standard',
  include_pertinent_negatives    boolean not null default false,
  append_see_above_line          boolean not null default false,
  digit_naming                   text not null default 'numbered',
  hedging_language               text not null default 'allow',
  always_differential            boolean not null default false,
  default_lay_person_summary     boolean not null default false,
  default_mass_mode              text not null default 'auto',
  updated_at                     timestamptz not null default now()
);

-- In case the table already existed from an earlier version of this script —
-- adds only the two new columns, does nothing if they're already there
alter table public.user_report_preferences add column if not exists digit_naming text not null default 'numbered';
alter table public.user_report_preferences add column if not exists hedging_language text not null default 'allow';

-- Row Level Security — each user can only ever read/write their own row
alter table public.user_report_preferences enable row level security;

drop policy if exists "Users can view own report preferences" on public.user_report_preferences;
create policy "Users can view own report preferences"
  on public.user_report_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own report preferences" on public.user_report_preferences;
create policy "Users can insert own report preferences"
  on public.user_report_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own report preferences" on public.user_report_preferences;
create policy "Users can update own report preferences"
  on public.user_report_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at current automatically on every save
create or replace function public.set_report_prefs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_report_preferences_updated_at on public.user_report_preferences;
create trigger trg_user_report_preferences_updated_at
before update on public.user_report_preferences
for each row execute function public.set_report_prefs_updated_at();
