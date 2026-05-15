-- ============================================================
-- Delete ALL data for a specific Life OS user
-- Replace USER_ID_HERE with the actual UUID
-- Run in: Supabase Dashboard → SQL Editor
-- WARNING: This is irreversible. Double-check the user ID.
-- ============================================================

DO $$
DECLARE
  v_uid UUID := 'USER_ID_HERE';
BEGIN

-- Education
DELETE FROM key_concepts      WHERE user_id = v_uid;
DELETE FROM study_notes       WHERE user_id = v_uid;
DELETE FROM study_sessions    WHERE user_id = v_uid;
DELETE FROM study_blocks      WHERE user_id = v_uid;
DELETE FROM assignments       WHERE user_id = v_uid;
DELETE FROM courses           WHERE user_id = v_uid;

-- Books
DELETE FROM book_notes        WHERE user_id = v_uid;
DELETE FROM books             WHERE user_id = v_uid;

-- Habits
DELETE FROM habit_logs        WHERE user_id = v_uid;
DELETE FROM habits            WHERE user_id = v_uid;

-- Chores
DELETE FROM chore_logs        WHERE user_id = v_uid;
DELETE FROM chores            WHERE user_id = v_uid;

-- Journal & Notes
DELETE FROM journal_entries   WHERE user_id = v_uid;
DELETE FROM notes             WHERE user_id = v_uid;
DELETE FROM work_notes        WHERE user_id = v_uid;
DELETE FROM meeting_topics    WHERE user_id = v_uid;
DELETE FROM meeting_tracks    WHERE user_id = v_uid;

-- Todos
DELETE FROM todos             WHERE user_id = v_uid;

-- Workouts
DELETE FROM session_exercises
  WHERE session_id IN (
    SELECT id FROM workout_sessions WHERE user_id = v_uid
  );
DELETE FROM workout_sessions  WHERE user_id = v_uid;
DELETE FROM workout_templates WHERE user_id = v_uid;
DELETE FROM swedish_ladder_stages WHERE user_id = v_uid;

-- AI features
DELETE FROM ai_reviews        WHERE user_id = v_uid;
DELETE FROM ai_search_history WHERE user_id = v_uid;
DELETE FROM chat_sessions     WHERE user_id = v_uid;

-- Consistency (no separate table — driven by other tables)

RAISE NOTICE 'All data deleted for user: %', v_uid;
END $$;
