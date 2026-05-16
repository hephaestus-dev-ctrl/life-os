import { useState, useEffect, useCallback } from 'react'
import { SparklesIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
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

function formatDateRange(start, end) {
  const s = new Date(start + 'T12:00:00')
  const e = new Date(end   + 'T12:00:00')
  const opts = { month: 'short', day: 'numeric' }
  if (s.getFullYear() !== e.getFullYear()) {
    return (
      s.toLocaleDateString('en-US', { ...opts, year: 'numeric' }) + ' – ' +
      e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
    )
  }
  return (
    s.toLocaleDateString('en-US', opts) + ' – ' +
    e.toLocaleDateString('en-US', opts)
  )
}

function formatRelativeDate(dateStr) {
  const date     = new Date(dateStr)
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)  return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Advisor definitions ───────────────────────────────────────

const ADVISOR_LIST = [
  { key: 'psychologist',  name: 'The Psychologist',      emoji: '🧠', description: 'Emotional patterns, mood trends, behavioral loops' },
  { key: 'performance',   name: 'The Performance Coach',  emoji: '⚡', description: 'Productivity, deep work, output vs input ratios' },
  { key: 'fitness',       name: 'The Fitness Coach',      emoji: '💪', description: 'Workout consistency, recovery, physical discipline' },
  { key: 'mentor',        name: 'The Mentor',             emoji: '📖', description: 'Reading vs living: books, ideas, and application' },
  { key: 'drillsergeant', name: 'The Drill Sergeant',     emoji: '⚔️', description: 'Zero excuses — where you fell short and what to fix' },
  { key: 'spiritual',     name: 'The Spiritual Advisor',  emoji: '🙏', description: 'Values alignment, meaning, spiritual discipline' },
  { key: 'career',        name: 'The Career Advisor',     emoji: '💼', description: 'Career trajectory, skills, 90-day strategy' },
  { key: 'mirror',        name: 'The Mirror',             emoji: '🪞', description: 'Pure data — no emotion, just the numbers' },
]

// ── Advisor Modal ─────────────────────────────────────────────

function AdvisorModal({ advisor, session, onClose }) {
  if (!advisor) return null

  const review    = session?.advisor_responses?.[advisor.key]
  const hasReview = Boolean(review)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full flex flex-col rounded-2xl overflow-hidden"
        style={{
          backgroundColor: '#1a1d27',
          border: '1px solid rgba(255,255,255,0.12)',
          maxWidth: '700px',
          maxHeight: '80vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div>
            <div className="text-3xl mb-2">{advisor.emoji}</div>
            <h2 className="text-base font-semibold text-gray-100">{advisor.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{advisor.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-1 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {hasReview ? (
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{review}</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4 opacity-20">{advisor.emoji}</div>
              <p className="text-gray-500 text-sm">No review yet for this period</p>
              <p className="text-gray-600 text-xs mt-1">Click Generate Review above to get started</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {session && hasReview && (
          <div
            className="px-6 py-3 flex-shrink-0 text-xs text-gray-600"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            Generated {formatRelativeDate(session.created_at)}
            {' · '}
            {formatDateRange(session.period_start, session.period_end)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────

function Toast({ message }) {
  if (!message) return null
  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-xl"
      style={{ backgroundColor: '#6366f1' }}
    >
      {message}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export default function AIReview({ session }) {
  const [periodTab,       setPeriodTab]       = useState('weekly')
  const [generating,      setGenerating]      = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)
  const [activeSession,   setActiveSession]   = useState(null)
  const [history,         setHistory]         = useState([])
  const [selectedAdvisor, setSelectedAdvisor] = useState(null)
  const [loadingSession,  setLoadingSession]  = useState(null)
  const [toast,           setToast]           = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchReviews = useCallback(async (type) => {
    setLoading(true)
    try {
      // History metadata — no advisor_responses to keep payload light
      const { data: histRows, error: histErr } = await supabase
        .from('ai_reviews')
        .select('id, created_at, period_start, period_end')
        .eq('review_type', type)
        .order('created_at', { ascending: false })
        .limit(20)

      if (histErr) throw histErr

      const hist = histRows ?? []
      setHistory(hist)

      if (hist.length > 0) {
        // Load full data for most recent session
        const { data: latest, error: latestErr } = await supabase
          .from('ai_reviews')
          .select('id, created_at, period_start, period_end, advisor_responses')
          .eq('id', hist[0].id)
          .single()

        if (latestErr) throw latestErr
        setActiveSession(latest ?? null)
      } else {
        setActiveSession(null)
      }
    } catch (err) {
      console.error('fetch reviews error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews(periodTab)
  }, [periodTab, fetchReviews])

  async function loadHistorySession(sessionId) {
    setLoadingSession(sessionId)
    try {
      const { data, error: fetchErr } = await supabase
        .from('ai_reviews')
        .select('id, created_at, period_start, period_end, advisor_responses')
        .eq('id', sessionId)
        .single()

      if (fetchErr) throw fetchErr
      setActiveSession(data)
    } catch (err) {
      console.error('load session error:', err)
    } finally {
      setLoadingSession(null)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    try {
      const now   = new Date()
      const start = periodTab === 'weekly' ? isoWeekStart(now) : monthStart(now)
      const end   = today()

      const { data: { session: sess } } = await supabase.auth.getSession()
      if (!sess) {
        setError('Not authenticated. Please refresh the page.')
        return
      }

      const { error: fnErr } = await supabase.functions.invoke('ai-review', {
        body: { review_type: periodTab, period_start: start, period_end: end },
        headers: { Authorization: `Bearer ${sess.access_token}` },
      })
      if (fnErr) throw fnErr

      await fetchReviews(periodTab)
      showToast('Review generated — click any advisor card to read')
    } catch (err) {
      setError(err.message ?? 'Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const advisorReady = (key) => Boolean(activeSession?.advisor_responses?.[key])

  const periodTabs = [
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
          8 expert perspectives on your habits, workouts, journal, and more.
        </p>
      </div>

      {/* Period tabs + Generate button */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {periodTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriodTab(key)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={
                periodTab === key
                  ? { backgroundColor: '#6366f1', color: '#fff' }
                  : { color: '#6b7280' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: '#6366f1', color: '#fff' }}
          >
            {generating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SparklesIcon className="w-4 h-4" />
            )}
            {generating ? 'Generating…' : 'Generate Review'}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>

      {/* Active session label */}
      {activeSession && !loading && (
        <p className="text-xs text-gray-600 mb-4">
          Showing {formatDateRange(activeSession.period_start, activeSession.period_end)}
          {' · '}generated {formatRelativeDate(activeSession.created_at)}
          {' · '}click any card to read
        </p>
      )}

      {/* Advisor cards grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {ADVISOR_LIST.map(({ key }) => (
            <div
              key={key}
              className="rounded-2xl p-4 animate-pulse"
              style={{
                backgroundColor: '#1a1d27',
                border: '1px solid rgba(255,255,255,0.07)',
                height: '108px',
              }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {ADVISOR_LIST.map((advisor) => {
            const ready = advisorReady(advisor.key)
            return (
              <button
                key={advisor.key}
                onClick={() => setSelectedAdvisor(advisor)}
                className="relative text-left rounded-2xl p-4 transition-all"
                style={{
                  backgroundColor: '#1a1d27',
                  border: '1px solid rgba(255,255,255,0.07)',
                  opacity: ready ? 1 : 0.55,
                  transition: 'opacity 0.2s, border-color 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)'; e.currentTarget.style.transform = 'scale(1.015)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                {ready && (
                  <div
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}
                  >
                    <CheckIcon className="w-3 h-3 text-indigo-400" />
                  </div>
                )}
                <div className="text-2xl mb-2">{advisor.emoji}</div>
                <p className="text-sm font-medium text-gray-200 mb-1 pr-6">{advisor.name}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{advisor.description}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* History section */}
      {!loading && history.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Past Reviews
          </h2>
          <div className="space-y-2">
            {history.map((row) => {
              const isActive      = activeSession?.id === row.id
              const isLoadingThis = loadingSession === row.id
              return (
                <button
                  key={row.id}
                  onClick={() => !isActive && loadHistorySession(row.id)}
                  disabled={isActive || isLoadingThis}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(99,102,241,0.08)' : '#1a1d27',
                    border: `1px solid ${isActive ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    cursor: isActive ? 'default' : 'pointer',
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {formatDateRange(row.period_start, row.period_end)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        {formatRelativeDate(row.created_at)}
                        {isActive && (
                          <span className="text-indigo-400 font-medium">· Active</span>
                        )}
                        {isLoadingThis && (
                          <span
                            className="inline-block w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin"
                          />
                        )}
                      </p>
                    </div>
                    <div className="flex gap-0.5 text-sm flex-shrink-0">
                      {ADVISOR_LIST.map(a => <span key={a.key}>{a.emoji}</span>)}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Advisor modal */}
      {selectedAdvisor && (
        <AdvisorModal
          advisor={selectedAdvisor}
          session={activeSession}
          onClose={() => setSelectedAdvisor(null)}
        />
      )}

      {/* Toast */}
      <Toast message={toast} />
    </div>
  )
}
