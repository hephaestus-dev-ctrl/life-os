import { useState, useEffect, useCallback } from 'react'
import {
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'

// ── Date helpers ──────────────────────────────────────────────

function isoWeekStart(date = new Date()) {
  const d   = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function monthStart(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function formatPeriod(start, end) {
  const s = new Date(start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const e = new Date(end   + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${s} – ${e}`
}

// ── Review card ───────────────────────────────────────────────

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)

  const preview = review.content
    ? review.content.split('\n').filter(Boolean).slice(0, 2).join(' ').slice(0, 240)
    : ''

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#1e2130',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold text-indigo-400 mb-1">
            {formatPeriod(review.period_start, review.period_end)}
          </p>
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
            {expanded ? null : preview}
            {!expanded && review.content?.length > 240 && (
              <span className="text-gray-600"> …</span>
            )}
          </p>
        </div>
        {expanded
          ? <ChevronUpIcon className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
          : <ChevronDownIcon className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
        }
      </button>

      {expanded && (
        <div
          className="px-5 pb-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap pt-4">
            {review.content}
          </p>
          <p className="text-xs text-gray-700 mt-4">
            Generated {new Date(review.created_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Generate button ───────────────────────────────────────────

function GenerateButton({ reviewType, onGenerated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const now   = new Date()
      const start = reviewType === 'weekly' ? isoWeekStart(now) : monthStart(now)
      const end   = today()

      const { data, error: fnErr } = await supabase.functions.invoke('ai-review', {
        body: {
          review_type:  reviewType,
          period_start: start,
          period_end:   end,
          user_id:      (await supabase.auth.getUser()).data.user?.id,
        },
      })
      if (fnErr) throw fnErr
      onGenerated(data.content, start, end)
    } catch (err) {
      setError(err.message ?? 'Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        style={{ backgroundColor: '#6366f1', color: '#fff' }}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <SparklesIcon className="w-4 h-4" />
        )}
        {loading ? 'Generating…' : 'Generate Review'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export default function AIReview({ session }) {
  const [activeTab, setActiveTab] = useState('weekly')
  const [reviews, setReviews]     = useState({ weekly: null, monthly: null })
  const [loading, setLoading]     = useState(true)

  const userId = session?.user?.id

  const fetchReviews = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [weeklyRes, monthlyRes] = await Promise.all([
        supabase
          .from('ai_reviews')
          .select('*')
          .eq('user_id', userId)
          .in('review_type', ['weekly', 'ondemand'])
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('ai_reviews')
          .select('*')
          .eq('user_id', userId)
          .eq('review_type', 'monthly')
          .order('created_at', { ascending: false })
          .limit(20),
      ])
      setReviews({
        weekly:  weeklyRes.data  ?? [],
        monthly: monthlyRes.data ?? [],
      })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  function handleGenerated(content, period_start, period_end) {
    const newReview = {
      id: crypto.randomUUID(),
      user_id: userId,
      review_type: activeTab,
      period_start,
      period_end,
      content,
      created_at: new Date().toISOString(),
    }
    setReviews((prev) => ({
      ...prev,
      [activeTab]: [newReview, ...(prev[activeTab] ?? [])],
    }))
  }

  const current = reviews[activeTab] ?? []

  const tabs = [
    { key: 'weekly',  label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ]

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-gray-100 leading-tight flex items-center gap-3">
          <SparklesIcon className="w-7 h-7 text-indigo-400" />
          AI Life Review
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Personalised reflections on your habits, workouts, journal and more.
        </p>
      </div>

      {/* Tabs + Generate button */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === key
                  ? { backgroundColor: '#6366f1', color: '#fff' }
                  : { color: '#6b7280' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <GenerateButton reviewType={activeTab} onGenerated={handleGenerated} />
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : current.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            backgroundColor: '#1a1d27',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <SparklesIcon className="w-10 h-10 text-indigo-400/40 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No {activeTab} reviews yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Click "Generate Review" to create your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {current.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}
