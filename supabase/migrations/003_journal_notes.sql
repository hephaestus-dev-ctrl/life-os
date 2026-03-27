-- ============================================================
-- Phase 4: Journal, Notes & Work modules
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- journal_entries (one per user per day)
create table if not exists journal_entries (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users(id) on delete cascade not null,
  entry_date    date        not null,
  mood          text        check (mood in ('great','good','okay','bad','awful')),
  gratitude     text,
  what_happened text,
  reflection    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id, entry_date)
);

-- notes (thoughts, work notes, general notes)
create table if not exists notes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade not null,
  title      text,
  content    text,
  category   text        check (category in ('thought','note','work','one-on-one')) default 'note',
  tags       text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- one_on_one_items (questions/topics for supervisor 1:1 meetings)
create table if not exists one_on_one_items (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade not null,
  question   text        not null,
  context    text,
  status     text        check (status in ('pending','discussed')) default 'pending',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table journal_entries  enable row level security;
alter table notes             enable row level security;
alter table one_on_one_items  enable row level security;

-- ---- journal_entries policies ----
create policy "journal: select own"
  on journal_entries for select using (auth.uid() = user_id);

create policy "journal: insert own"
  on journal_entries for insert with check (auth.uid() = user_id);

create policy "journal: update own"
  on journal_entries for update using (auth.uid() = user_id);

create policy "journal: delete own"
  on journal_entries for delete using (auth.uid() = user_id);

-- ---- notes policies ----
create policy "notes: select own"
  on notes for select using (auth.uid() = user_id);

create policy "notes: insert own"
  on notes for insert with check (auth.uid() = user_id);

create policy "notes: update own"
  on notes for update using (auth.uid() = user_id);

create policy "notes: delete own"
  on notes for delete using (auth.uid() = user_id);

-- ---- one_on_one_items policies ----
create policy "one_on_one: select own"
  on one_on_one_items for select using (auth.uid() = user_id);

create policy "one_on_one: insert own"
  on one_on_one_items for insert with check (auth.uid() = user_id);

create policy "one_on_one: update own"
  on one_on_one_items for update using (auth.uid() = user_id);

create policy "one_on_one: delete own"
  on one_on_one_items for delete using (auth.uid() = user_id);
