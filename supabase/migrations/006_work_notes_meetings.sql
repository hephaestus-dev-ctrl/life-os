-- ============================================================
-- Migration 006 — Work Notes & Meetings
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- work_notes: structured work notes with project labels
CREATE TABLE IF NOT EXISTS work_notes (
  id            uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text,
  content       text        NOT NULL,
  project_label text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- meeting_tracks: named meeting series (e.g. "1-on-1 with Supervisor")
CREATE TABLE IF NOT EXISTS meeting_tracks (
  id         uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- meeting_topics: agenda items within a meeting track
CREATE TABLE IF NOT EXISTS meeting_topics (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id    uuid        NOT NULL REFERENCES meeting_tracks(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text        NOT NULL,
  context     text,
  action_item text,
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'discussed')),
  week_start  date        NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::date,
  archived    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ──────────────────────────────────────

ALTER TABLE work_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_topics ENABLE ROW LEVEL SECURITY;

-- work_notes policies
CREATE POLICY "work_notes_select" ON work_notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "work_notes_insert" ON work_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "work_notes_update" ON work_notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "work_notes_delete" ON work_notes
  FOR DELETE USING (auth.uid() = user_id);

-- meeting_tracks policies
CREATE POLICY "meeting_tracks_select" ON meeting_tracks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meeting_tracks_insert" ON meeting_tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meeting_tracks_update" ON meeting_tracks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "meeting_tracks_delete" ON meeting_tracks
  FOR DELETE USING (auth.uid() = user_id);

-- meeting_topics policies
CREATE POLICY "meeting_topics_select" ON meeting_topics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meeting_topics_insert" ON meeting_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meeting_topics_update" ON meeting_topics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "meeting_topics_delete" ON meeting_topics
  FOR DELETE USING (auth.uid() = user_id);
