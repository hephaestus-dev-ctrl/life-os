-- ============================================================
-- Phase 5: Books & Workouts modules
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- books
create table if not exists books (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users(id) on delete cascade not null,
  title         text        not null,
  author        text,
  status        text        check (status in ('want_to_read','reading','finished')) default 'want_to_read',
  rating        int         check (rating >= 1 and rating <= 5),
  review        text,
  started_date  date,
  finished_date date,
  cover_url     text,
  created_at    timestamptz default now()
);

-- book_notes (highlights, notes, discussion thoughts per book)
create table if not exists book_notes (
  id         uuid        primary key default gen_random_uuid(),
  book_id    uuid        references books(id) on delete cascade not null,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  content    text        not null,
  note_type  text        check (note_type in ('highlight','note','discussion')) default 'note',
  created_at timestamptz default now()
);

-- workouts
create table if not exists workouts (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        references auth.users(id) on delete cascade not null,
  workout_date     date        not null,
  title            text,
  workout_type     text        check (workout_type in ('tonal','swedish_ladder','cardio','other')) default 'other',
  duration_minutes int,
  notes            text,
  source           text        check (source in ('manual','import')) default 'manual',
  created_at       timestamptz default now()
);

-- workout_exercises (exercises within a session)
create table if not exists workout_exercises (
  id            uuid        primary key default gen_random_uuid(),
  workout_id    uuid        references workouts(id) on delete cascade not null,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  exercise_name text        not null,
  sets          int,
  reps          int,
  weight_lbs    numeric,
  notes         text,
  created_at    timestamptz default now()
);

-- Enable Row Level Security
alter table books             enable row level security;
alter table book_notes        enable row level security;
alter table workouts          enable row level security;
alter table workout_exercises enable row level security;

-- ---- books policies ----
create policy "books: select own"
  on books for select using (auth.uid() = user_id);

create policy "books: insert own"
  on books for insert with check (auth.uid() = user_id);

create policy "books: update own"
  on books for update using (auth.uid() = user_id);

create policy "books: delete own"
  on books for delete using (auth.uid() = user_id);

-- ---- book_notes policies ----
create policy "book_notes: select own"
  on book_notes for select using (auth.uid() = user_id);

create policy "book_notes: insert own"
  on book_notes for insert with check (auth.uid() = user_id);

create policy "book_notes: update own"
  on book_notes for update using (auth.uid() = user_id);

create policy "book_notes: delete own"
  on book_notes for delete using (auth.uid() = user_id);

-- ---- workouts policies ----
create policy "workouts: select own"
  on workouts for select using (auth.uid() = user_id);

create policy "workouts: insert own"
  on workouts for insert with check (auth.uid() = user_id);

create policy "workouts: update own"
  on workouts for update using (auth.uid() = user_id);

create policy "workouts: delete own"
  on workouts for delete using (auth.uid() = user_id);

-- ---- workout_exercises policies ----
create policy "workout_exercises: select own"
  on workout_exercises for select using (auth.uid() = user_id);

create policy "workout_exercises: insert own"
  on workout_exercises for insert with check (auth.uid() = user_id);

create policy "workout_exercises: update own"
  on workout_exercises for update using (auth.uid() = user_id);

create policy "workout_exercises: delete own"
  on workout_exercises for delete using (auth.uid() = user_id);
