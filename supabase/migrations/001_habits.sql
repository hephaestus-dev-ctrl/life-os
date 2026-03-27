-- ============================================================
-- Phase 2: Habits & Routines
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- habits table
create table if not exists habits (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        references auth.users(id) on delete cascade not null,
  name           text        not null,
  category       text        not null default 'Personal',
  routine_type   text        check (routine_type in ('morning', 'evening')),
  routine_order  int         default 0,
  created_at     timestamptz default now()
);

-- habit_logs table
create table if not exists habit_logs (
  id             uuid        primary key default gen_random_uuid(),
  habit_id       uuid        references habits(id) on delete cascade not null,
  user_id        uuid        references auth.users(id) on delete cascade not null,
  completed_date date        not null,
  created_at     timestamptz default now(),
  unique (habit_id, completed_date)
);

-- Enable Row Level Security
alter table habits     enable row level security;
alter table habit_logs enable row level security;

-- ---- habits policies ----
create policy "habits: select own"
  on habits for select using (auth.uid() = user_id);

create policy "habits: insert own"
  on habits for insert with check (auth.uid() = user_id);

create policy "habits: update own"
  on habits for update using (auth.uid() = user_id);

create policy "habits: delete own"
  on habits for delete using (auth.uid() = user_id);

-- ---- habit_logs policies ----
create policy "habit_logs: select own"
  on habit_logs for select using (auth.uid() = user_id);

create policy "habit_logs: insert own"
  on habit_logs for insert with check (auth.uid() = user_id);

create policy "habit_logs: delete own"
  on habit_logs for delete using (auth.uid() = user_id);
