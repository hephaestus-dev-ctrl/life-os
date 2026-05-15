import { useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
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

// ── Advisor definitions (for UI only) ────────────────────────

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

// ── Skeleton loading state ────────────────────────────────────

function SkeletonGrid() {
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {ADVISOR_LIST.map(({ key, emoji, name }) => (
          <div
            key={key}
            className="flex-shrink-0 px-3 py-2 rounded-xl animate-pulse"
            style={{ backgroundColor: '#1e2130', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="text-sm text-gray-400">{emoji} {name.replace('The ', '')}</span>
          </div>
        ))}
      </div>
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: '#1e2130', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="h-5 w-48 rounded mb-5 animate-pulse" style={{ backgroundColor: '#2a2f45' }} />
        {[100, 100, 100, 60].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded mb-3 animate-pulse"
            style={{ backgroundColor: '#2a2f45', width: `${w}%` }}
          />
        ))}
        <div className="mt-5 mb-2 h-3 rounded animate-pulse" style={{ backgroundColor: '#2a2f45', width: '100%' }} />
        {[100, 100, 75].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded mb-3 animate-pulse"
            style={{ backgroundColor: '#2a2f45', width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Empty state — advisor preview grid ────────────────────────

function EmptyStateGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
      {ADVISOR_LIST.map(({ key, emoji, name, description }) => (
        <div
          key={key}
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="text-2xl mb-2">{emoji}</div>
          <p className="text-sm font-medium text-gray-200 mb-1">{name}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export default function AIReview({ session }) {
  const [periodTab,     setPeriodTab]     = useState('weekly')
  const [generating,    setGenerating]    = useState(false)
  const [error,         setError]         = useState(null)
  const [advisorData,   setAdvisorData]   = useState(null)
  const [activeAdvisor, setActiveAdvisor] = useState('psychologist')

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

      const { data, error: fnErr } = await supabase.functions.invoke('ai-review', {
        body: { review_type: periodTab, period_start: start, period_end: end },
        headers: { Authorization: `Bearer ${sess.access_token}` },
      })
      if (fnErr) throw fnErr
      setAdvisorData(data.advisors)
      setActiveAdvisor('psychologist')
    } catch (err) {
      setError(err.message ?? 'Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const selected = advisorData?.[activeAdvisor]

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

      {/* Content */}
      {generating ? (
        <SkeletonGrid />
      ) : advisorData ? (
        <div>
          {/* Advisor tab row */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
            {ADVISOR_LIST.map(({ key, emoji, name }) => (
              <button
                key={key}
                onClick={() => setActiveAdvisor(key)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={
                  activeAdvisor === key
                    ? { backgroundColor: '#6366f1', color: '#fff' }
                    : { backgroundColor: '#1e2130', color: '#6b7280', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                {emoji} {name.replace('The ', '')}
              </button>
            ))}
          </div>

          {/* Active advisor content */}
          {selected && (
            <div
              key={activeAdvisor}
              className="rounded-2xl p-6 advisor-panel"
              style={{ backgroundColor: '#1e2130', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h2 className="text-base font-semibold text-gray-100 mb-4">
                {selected.emoji} {selected.name}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {selected.content}
              </p>
            </div>
          )}
        </div>
      ) : (
        <EmptyStateGrid />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .advisor-panel { animation: advisorFadeIn 0.18s ease; }
        @keyframes advisorFadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
