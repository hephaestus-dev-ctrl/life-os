-- ============================================================
-- Migration 009 — Book Notes: Add 'location_ref' column
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Add an optional location reference to each book annotation
-- (e.g. "p. 47", "Chapter 3 — The Forge")

ALTER TABLE book_notes
  ADD COLUMN IF NOT EXISTS location_ref text;
