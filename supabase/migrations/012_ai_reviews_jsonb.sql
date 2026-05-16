-- ──────────────────────────────────────────────────────────────
-- Phase 6b – AI Reviews: JSONB advisor_responses column
-- One row per generation session; all 8 advisor texts in JSONB.
-- Shape: { "psychologist": "text...", "performance": "text...", ... }
-- ──────────────────────────────────────────────────────────────

ALTER TABLE public.ai_reviews
  ADD COLUMN IF NOT EXISTS advisor_responses JSONB;

-- Migrate existing rows: extract advisor text from the content column.
-- content is JSON: { "period": "...", "generated_at": "...",
--   "advisors": { key: { "name": "...", "emoji": "...", "content": "..." } } }
UPDATE public.ai_reviews
SET advisor_responses = (
  SELECT jsonb_object_agg(key, value->>'content')
  FROM jsonb_each((content::jsonb)->'advisors')
)
WHERE advisor_responses IS NULL
  AND content IS NOT NULL
  AND content <> '';

-- Fast history queries: user + period type + newest first
CREATE INDEX IF NOT EXISTS ai_reviews_user_review_type_created_at
  ON public.ai_reviews (user_id, review_type, created_at DESC);
