// ─────────────────────────────────────────────────────────────
// OpenRouter configuration reference
//
// NOTE: This file is for reference only.
// All actual API calls happen inside Supabase Edge Functions.
// Never import OPENROUTER_BASE_URL or DEFAULT_MODEL into React
// components or any other client-side code — the API key must
// never be exposed in the browser bundle.
//
// To change the model for all AI features, update DEFAULT_MODEL
// here and mirror the value in each edge function's MODEL const.
// ─────────────────────────────────────────────────────────────

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
export const DEFAULT_MODEL       = 'anthropic/claude-sonnet-4-5'
export const APP_REFERER         = 'https://life-os.vercel.app'
export const APP_TITLE           = 'Life OS'
