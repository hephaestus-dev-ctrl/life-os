-- ============================================================
-- Migration 005: Workouts Redesign
-- Replaces old workouts/workout_exercises tables with:
--   workout_templates, template_exercises, workout_sessions,
--   session_exercises, swedish_ladder_stages
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop old tables (cascade removes all RLS policies too)
drop table if exists workout_exercises cascade;
drop table if exists workouts cascade;

-- ---- Workout Template Library ----
create table if not exists workout_templates (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade not null,
  name       text        not null,
  type       text        check (type in ('tonal', 'swedish_ladder')) not null,
  created_at timestamptz default now()
);

-- Exercises defined in a template (planned sets/reps, no weight)
create table if not exists template_exercises (
  id            uuid        primary key default gen_random_uuid(),
  template_id   uuid        references workout_templates(id) on delete cascade not null,
  exercise_name text        not null,
  sets          int,
  reps          int,
  order_index   int         default 0,
  created_at    timestamptz default now()
);

-- ---- Logged Workout Sessions ----
create table if not exists workout_sessions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users(id) on delete cascade not null,
  template_id  uuid        references workout_templates(id) on delete set null,
  session_date date        not null default current_date,
  notes        text,
  created_at   timestamptz default now()
);

-- Actual weights logged per exercise per session
create table if not exists session_exercises (
  id                uuid        primary key default gen_random_uuid(),
  session_id        uuid        references workout_sessions(id) on delete cascade not null,
  exercise_name     text        not null,
  planned_sets      int,
  planned_reps      int,
  actual_weight_lbs numeric,
  notes             text,
  order_index       int         default 0,
  created_at        timestamptz default now()
);

-- ---- Swedish Ladder Stage History ----
-- Each row = a stage-start event; latest row = current stage
create table if not exists swedish_ladder_stages (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users(id) on delete cascade not null,
  stage_number int         not null,
  started_at   timestamptz default now()
);

-- ---- Enable Row Level Security ----
alter table workout_templates     enable row level security;
alter table template_exercises    enable row level security;
alter table workout_sessions      enable row level security;
alter table session_exercises     enable row level security;
alter table swedish_ladder_stages enable row level security;

-- ---- workout_templates policies ----
create policy "workout_templates: select own"
  on workout_templates for select using (auth.uid() = user_id);

create policy "workout_templates: insert own"
  on workout_templates for insert with check (auth.uid() = user_id);

create policy "workout_templates: update own"
  on workout_templates for update using (auth.uid() = user_id);

create policy "workout_templates: delete own"
  on workout_templates for delete using (auth.uid() = user_id);

-- ---- template_exercises policies (no direct user_id — join through parent) ----
create policy "template_exercises: select own"
  on template_exercises for select
  using (
    exists (
      select 1 from workout_templates t
      where t.id = template_exercises.template_id
        and t.user_id = auth.uid()
    )
  );

create policy "template_exercises: insert own"
  on template_exercises for insert
  with check (
    exists (
      select 1 from workout_templates t
      where t.id = template_exercises.template_id
        and t.user_id = auth.uid()
    )
  );

create policy "template_exercises: delete own"
  on template_exercises for delete
  using (
    exists (
      select 1 from workout_templates t
      where t.id = template_exercises.template_id
        and t.user_id = auth.uid()
    )
  );

-- ---- workout_sessions policies ----
create policy "workout_sessions: select own"
  on workout_sessions for select using (auth.uid() = user_id);

create policy "workout_sessions: insert own"
  on workout_sessions for insert with check (auth.uid() = user_id);

create policy "workout_sessions: update own"
  on workout_sessions for update using (auth.uid() = user_id);

create policy "workout_sessions: delete own"
  on workout_sessions for delete using (auth.uid() = user_id);

-- ---- session_exercises policies (join through parent session) ----
create policy "session_exercises: select own"
  on session_exercises for select
  using (
    exists (
      select 1 from workout_sessions s
      where s.id = session_exercises.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "session_exercises: insert own"
  on session_exercises for insert
  with check (
    exists (
      select 1 from workout_sessions s
      where s.id = session_exercises.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "session_exercises: delete own"
  on session_exercises for delete
  using (
    exists (
      select 1 from workout_sessions s
      where s.id = session_exercises.session_id
        and s.user_id = auth.uid()
    )
  );

-- ---- swedish_ladder_stages policies ----
create policy "swedish_ladder_stages: select own"
  on swedish_ladder_stages for select using (auth.uid() = user_id);

create policy "swedish_ladder_stages: insert own"
  on swedish_ladder_stages for insert with check (auth.uid() = user_id);

create policy "swedish_ladder_stages: delete own"
  on swedish_ladder_stages for delete using (auth.uid() = user_id);
