-- MSK-Consult schema
-- Run this in the Supabase SQL editor for the LucidMSK project
-- (https://tqwdkisqqvbujcjvzdlw.supabase.co)

-- ── Daily budget ledger ───────────────────────────────────────────────────────
-- One row per user per local calendar day. Written ONLY by the server route
-- (src/app/api/msk-consult/route.js) using the service-role key, so a user
-- cannot reset or edit their own spend from the browser.
create table if not exists msk_consult_usage (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  usage_date     date not null,          -- YYYY-MM-DD in the user's local timezone
  spent_usd      numeric(10,6) not null default 0,
  input_tokens   bigint not null default 0,
  output_tokens  bigint not null default 0,
  message_count  int not null default 0,
  updated_at     timestamptz not null default now(),
  unique (user_id, usage_date)
);

alter table msk_consult_usage enable row level security;

-- Users may READ their own usage row (so the meter can render), but cannot
-- insert/update/delete — only the service role (server) can write.
create policy "msk_consult_usage_select_own"
  on msk_consult_usage for select
  using (auth.uid() = user_id);

-- ── Conversation log ────────────────────────────────────────────────────────
-- Chat clears client-side on refresh, but every turn is saved here for the
-- user's history / audit trail. Written only by the server route.
create table if not exists msk_consult_messages (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  conversation_id  uuid,
  role             text not null check (role in ('user','assistant')),
  content          text not null,
  input_tokens     int,
  output_tokens    int,
  cost_usd         numeric(10,6),
  created_at       timestamptz not null default now()
);

alter table msk_consult_messages enable row level security;

create policy "msk_consult_messages_select_own"
  on msk_consult_messages for select
  using (auth.uid() = user_id);

create index if not exists idx_msk_consult_messages_user_conv
  on msk_consult_messages (user_id, conversation_id, created_at);

create index if not exists idx_msk_consult_usage_user_date
  on msk_consult_usage (user_id, usage_date);
