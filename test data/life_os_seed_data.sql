-- ============================================================
-- Life OS: 90-Day Realistic Test Data Seed Script
-- User ID: 7fdca7f5-83f4-4847-b214-9ed0ff55e3c5
-- Range: 90 days ago → yesterday
-- ============================================================

DO $$
DECLARE
  v_user_id     UUID := '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5';
  v_start_date  DATE := CURRENT_DATE - INTERVAL '90 days';
  v_end_date    DATE := CURRENT_DATE - INTERVAL '1 day';
  v_date        DATE;

  -- Journal
  v_moods       TEXT[] := ARRAY['great','great','good','good','good','good','okay','okay','okay','bad'];
  v_gratitudes  TEXT[] := ARRAY[
    'Grateful for a productive morning and a good cup of coffee.',
    'Thankful for quality time with family today.',
    'Appreciative of making progress on a challenging project.',
    'Grateful for a restful night of sleep.',
    'Thankful for a walk outside in the fresh air.',
    'Grateful for supportive friends who check in.',
    'Thankful for a healthy meal and time to cook.',
    'Appreciative of a quiet evening to recharge.',
    'Grateful for a small win at work today.',
    'Thankful for the ability to move and exercise.'
  ];
  v_reflections TEXT[] := ARRAY[
    'Today felt balanced. I stayed focused and avoided distractions for the most part.',
    'Could have managed my energy better in the afternoon, but overall a solid day.',
    'Made real progress on my goals. Need to keep this momentum going.',
    'Felt a bit scattered today. Tomorrow I will start with a clear priority list.',
    'Good day overall. The morning routine made a noticeable difference.',
    'Struggled with motivation mid-day but pushed through. Proud of the consistency.',
    'Took time to be present instead of rushing. That felt right.',
    'Things did not go as planned, but I adapted and still moved forward.',
    'Energy was high today. Exercise in the morning definitely helps.',
    'Quiet and reflective day. Sometimes that is exactly what is needed.'
  ];

  -- Workouts
  v_templates    TEXT[] := ARRAY['Tonal','Tonal','Swedish Ladder','Cardio','Flexibility'];
  v_workout_day_seed INT;

BEGIN

  v_date := v_start_date;

  WHILE v_date <= v_end_date LOOP

    -- --------------------------------------------------------
    -- 1. HABIT LOGS (~75% completion per habit per day)
    -- --------------------------------------------------------
    INSERT INTO habit_logs (habit_id, user_id, completed_date)
    SELECT h.id, v_user_id, v_date
    FROM habits h
    WHERE h.user_id = v_user_id
      AND h.routine_type IS NULL
      AND random() < 0.75
    ON CONFLICT DO NOTHING;

    -- --------------------------------------------------------
    -- 2. JOURNAL ENTRIES (~80% of days)
    -- --------------------------------------------------------
    IF random() < 0.80 THEN
      INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
      VALUES (
        v_user_id,
        v_date,
        v_moods[1 + floor(random() * array_length(v_moods, 1))::INT],
        v_gratitudes[1 + floor(random() * array_length(v_gratitudes, 1))::INT],
        v_reflections[1 + floor(random() * array_length(v_reflections, 1))::INT]
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- --------------------------------------------------------
    -- 3. WORKOUT SESSIONS (~4-5 days/week ≈ 64% daily chance)
    -- --------------------------------------------------------
    IF random() < 0.64 THEN
      INSERT INTO workout_sessions (user_id, session_date, template_name, duration_minutes)
      VALUES (
        v_user_id,
        v_date,
        v_templates[1 + floor(random() * array_length(v_templates, 1))::INT],
        30 + floor(random() * 46)::INT   -- 30 to 75 minutes
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- --------------------------------------------------------
    -- 4a. CHORE LOGS — daily chores (~85% completion)
    -- --------------------------------------------------------
    INSERT INTO chore_logs (chore_id, user_id, completed_date)
    SELECT c.id, v_user_id, v_date
    FROM chores c
    WHERE c.user_id = v_user_id
      AND c.cadence = 'daily'
      AND random() < 0.85
    ON CONFLICT DO NOTHING;

    -- --------------------------------------------------------
    -- 4b. CHORE LOGS — weekly chores (~80% of weeks)
    --     Fire on Mondays only so each week gets one attempt.
    -- --------------------------------------------------------
    IF EXTRACT(DOW FROM v_date) = 1 THEN   -- 1 = Monday
      INSERT INTO chore_logs (chore_id, user_id, completed_date)
      SELECT c.id, v_user_id, v_date
      FROM chores c
      WHERE c.user_id = v_user_id
        AND c.cadence = 'weekly'
        AND random() < 0.80
      ON CONFLICT DO NOTHING;
    END IF;

    v_date := v_date + INTERVAL '1 day';
  END LOOP;

END $$;
