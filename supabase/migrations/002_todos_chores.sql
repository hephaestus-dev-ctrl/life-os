-- ============================================================
-- Phase 3: To-Do List + Recurring Chores
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- todos table
create table if not exists todos (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users(id) on delete cascade not null,
  title        text        not null,
  notes        text,
  due_date     date,
  priority     text        check (priority in ('high', 'medium', 'low')) default 'medium',
  status       text        check (status in ('open', 'done')) default 'open',
  project      text,
  tags         text[],
  created_at   timestamptz default now()
);

-- chores table
create table if not exists chores (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users(id) on delete cascade not null,
  title        text        not null,
  cadence      text        check (cadence in ('daily', 'weekly', 'monthly')) not null,
  assigned_day text,
  created_at   timestamptz default now()
);

-- chore_logs table
create table if not exists chore_logs (
  id             uuid        primary key default gen_random_uuid(),
  chore_id       uuid        references chores(id) on delete cascade not null,
  user_id        uuid        references auth.users(id) on delete cascade not null,
  completed_date date        not null,
  created_at     timestamptz default now()
);

-- Enable Row Level Security
alter table todos      enable row level security;
alter table chores     enable row level security;
alter table chore_logs enable row level security;

-- ---- todos policies ----
create policy "todos: select own"
  on todos for select using (auth.uid() = user_id);

create policy "todos: insert own"
  on todos for insert with check (auth.uid() = user_id);

create policy "todos: update own"
  on todos for update using (auth.uid() = user_id);

create policy "todos: delete own"
  on todos for delete using (auth.uid() = user_id);

-- ---- chores policies ----
create policy "chores: select own"
  on chores for select using (auth.uid() = user_id);

create policy "chores: insert own"
  on chores for insert with check (auth.uid() = user_id);

create policy "chores: update own"
  on chores for update using (auth.uid() = user_id);

create policy "chores: delete own"
  on chores for delete using (auth.uid() = user_id);

-- ---- chore_logs policies ----
create policy "chore_logs: select own"
  on chore_logs for select using (auth.uid() = user_id);

create policy "chore_logs: insert own"
  on chore_logs for insert with check (auth.uid() = user_id);

create policy "chore_logs: delete own"
  on chore_logs for delete using (auth.uid() = user_id);
