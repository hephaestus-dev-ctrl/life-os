-- Courses
create table if not exists public.courses (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  name         text        not null,
  provider     text,
  course_type  text        not null check (course_type in ('college', 'self_paced')),
  status       text        not null default 'in_progress'
                           check (status in ('in_progress', 'finished', 'wishlist')),
  grade_pct    numeric,
  url          text,
  notes        text,
  started_at   date,
  finished_at  date,
  created_at   timestamptz not null default now()
);

-- Assignments
create table if not exists public.assignments (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  course_id   uuid        not null references public.courses(id) on delete cascade,
  title       text        not null,
  due_date    date,
  status      text        not null default 'pending'
                          check (status in ('pending', 'done')),
  grade_pct   numeric,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Study notes
create table if not exists public.study_notes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  course_id   uuid        not null references public.courses(id) on delete cascade,
  title       text        not null,
  content     text,
  created_at  timestamptz not null default now()
);

-- Key concepts
create table if not exists public.key_concepts (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  course_id   uuid        not null references public.courses(id) on delete cascade,
  term        text        not null,
  definition  text,
  created_at  timestamptz not null default now()
);

-- Study schedule blocks (planned recurring)
create table if not exists public.study_blocks (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  course_id   uuid        references public.courses(id) on delete set null,
  day_of_week text        not null
                          check (day_of_week in ('Monday','Tuesday','Wednesday',
                          'Thursday','Friday','Saturday','Sunday')),
  start_time  text        not null,
  duration_minutes int    not null default 60,
  created_at  timestamptz not null default now()
);

-- Study sessions (actual logged sessions)
create table if not exists public.study_sessions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  course_id    uuid        references public.courses(id) on delete set null,
  session_date date        not null default current_date,
  duration_minutes int,
  notes        text,
  created_at   timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.courses         enable row level security;
alter table public.assignments     enable row level security;
alter table public.study_notes     enable row level security;
alter table public.key_concepts    enable row level security;
alter table public.study_blocks    enable row level security;
alter table public.study_sessions  enable row level security;

-- RLS policies (user can only access their own data)
create policy "courses: user access" on public.courses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "assignments: user access" on public.assignments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "study_notes: user access" on public.study_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "key_concepts: user access" on public.key_concepts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "study_blocks: user access" on public.study_blocks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "study_sessions: user access" on public.study_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
