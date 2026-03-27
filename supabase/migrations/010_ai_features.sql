-- ──────────────────────────────────────────────────────────────
-- Phase 6 – AI Life Intelligence
-- ──────────────────────────────────────────────────────────────

-- ── AI Search History ────────────────────────────────────────

create table if not exists public.ai_search_history (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  query       text        not null,
  response    text,
  results     jsonb       default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

alter table public.ai_search_history enable row level security;

create policy "ai_search_history: user full access"
  on public.ai_search_history
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists ai_search_history_user_id_created_at
  on public.ai_search_history (user_id, created_at desc);

-- ── AI Reviews ───────────────────────────────────────────────

create table if not exists public.ai_reviews (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  review_type  text        not null check (review_type in ('weekly', 'monthly', 'ondemand')),
  period_start date        not null,
  period_end   date        not null,
  content      text        not null,
  created_at   timestamptz not null default now()
);

alter table public.ai_reviews enable row level security;

create policy "ai_reviews: user full access"
  on public.ai_reviews
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists ai_reviews_user_id_created_at
  on public.ai_reviews (user_id, created_at desc);

-- ──────────────────────────────────────────────────────────────
-- pg_cron: Automated review generation
-- ──────────────────────────────────────────────────────────────
--
-- PREREQUISITES:
--   1. Enable pg_cron in Supabase Dashboard:
--      Database → Extensions → search "pg_cron" → Enable
--   2. Enable pg_net in Supabase Dashboard:
--      Database → Extensions → search "pg_net" → Enable
--   3. Set your app settings (run once in SQL editor):
--      ALTER DATABASE postgres SET app.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';
--      ALTER DATABASE postgres SET app.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
--
-- WEEKLY REVIEW — Every Sunday at 9 PM UTC:
--
-- SELECT cron.schedule(
--   'weekly-ai-review',
--   '0 21 * * 0',
--   $$
--     SELECT net.http_post(
--       url     := current_setting('app.supabase_url') || '/functions/v1/ai-review',
--       headers := jsonb_build_object(
--         'Content-Type',  'application/json',
--         'Authorization', 'Bearer ' || current_setting('app.service_role_key')
--       ),
--       body    := '{"review_type":"weekly","auto":true}'
--     );
--   $$
-- );
--
-- MONTHLY REVIEW — 1st of every month at 9 AM UTC:
--
-- SELECT cron.schedule(
--   'monthly-ai-review',
--   '0 9 1 * *',
--   $$
--     SELECT net.http_post(
--       url     := current_setting('app.supabase_url') || '/functions/v1/ai-review',
--       headers := jsonb_build_object(
--         'Content-Type',  'application/json',
--         'Authorization', 'Bearer ' || current_setting('app.service_role_key')
--       ),
--       body    := '{"review_type":"monthly","auto":true}'
--     );
--   $$
-- );
--
-- LIST SCHEDULED JOBS:    SELECT * FROM cron.job;
-- UNSCHEDULE:             SELECT cron.unschedule('weekly-ai-review');
-- ──────────────────────────────────────────────────────────────
