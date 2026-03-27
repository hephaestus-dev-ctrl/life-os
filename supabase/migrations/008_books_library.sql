-- ============================================================
-- Migration 008 — Books: Add 'library' Status
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop the existing 3-value check constraint and replace with
-- a 4-value one that includes 'library' (physically owned books).

ALTER TABLE books
  DROP CONSTRAINT IF EXISTS books_status_check;

ALTER TABLE books
  ADD CONSTRAINT books_status_check
  CHECK (status IN ('want_to_read', 'reading', 'finished', 'library'));
