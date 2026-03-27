-- ============================================================
-- Migration 007 — Workouts Overhaul
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Expand workout_templates type constraint ──────────────
-- Drop old 2-value check; replace with 4-value check.

ALTER TABLE workout_templates
  DROP CONSTRAINT IF EXISTS workout_templates_type_check;

ALTER TABLE workout_templates
  ADD CONSTRAINT workout_templates_type_check
  CHECK (type IN ('tonal', 'swedish_ladder', 'cardio', 'flexibility'));

-- ── 2. Add workout_category to workout_templates ─────────────

ALTER TABLE workout_templates
  ADD COLUMN IF NOT EXISTS workout_category text
  CHECK (workout_category IN ('strength', 'calisthenics', 'cardio', 'flexibility'));

-- Backfill existing rows from type
UPDATE workout_templates
SET workout_category = CASE
  WHEN type = 'tonal'          THEN 'strength'
  WHEN type = 'swedish_ladder' THEN 'calisthenics'
  WHEN type = 'cardio'         THEN 'cardio'
  WHEN type = 'flexibility'    THEN 'flexibility'
  ELSE NULL
END
WHERE workout_category IS NULL;

-- ── 3. New columns on template_exercises ────────────────────

ALTER TABLE template_exercises
  ADD COLUMN IF NOT EXISTS muscle_group         text
    CHECK (muscle_group IN ('Chest','Back','Shoulders','Arms','Legs','Core')),
  ADD COLUMN IF NOT EXISTS skill_level          text
    CHECK (skill_level IN ('beginner','intermediate','advanced')),
  ADD COLUMN IF NOT EXISTS activity_type        text,
  ADD COLUMN IF NOT EXISTS target_distance      numeric,
  ADD COLUMN IF NOT EXISTS target_duration_secs int,
  ADD COLUMN IF NOT EXISTS target_pace          text,
  ADD COLUMN IF NOT EXISTS weight_lbs           numeric;

-- ── 4. New columns on session_exercises ─────────────────────
-- actual_sets / actual_reps: what was truly performed (vs planned_*)
-- planned_weight: template target weight at time of logging
-- actual_distance, actual_duration_secs, actual_pace: for cardio logs
-- actual_duration_secs also used for flexibility hold times

ALTER TABLE session_exercises
  ADD COLUMN IF NOT EXISTS actual_sets          int,
  ADD COLUMN IF NOT EXISTS actual_reps          int,
  ADD COLUMN IF NOT EXISTS planned_weight       numeric,
  ADD COLUMN IF NOT EXISTS actual_distance      numeric,
  ADD COLUMN IF NOT EXISTS actual_duration_secs int,
  ADD COLUMN IF NOT EXISTS actual_pace          text;
