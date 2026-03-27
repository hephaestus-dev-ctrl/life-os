import { useState, useMemo } from 'react'
import { ArrowLeftIcon, ArrowUpIcon } from '@heroicons/react/24/outline'
import { ProgressChart } from './ProgressChart'

// ── Utilities ─────────────────────────────────────────────────
const CATEGORY_MAP = {
  tonal: 'strength',
  swedish_ladder: 'calisthenics',
  cardio: 'cardio',
  flexibility: 'flexibility',
}

function getCategory(session, templates) {
  const tmpl = templates.find((t) => t.id === session.template_id)
  if (!tmpl) return null
  return tmpl.workout_category || CATEGORY_MAP[tmpl.type] || null
}

function formatDateShort(str) {
  const d = new Date(str)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

// ── Mini sparkline ────────────────────────────────────────────
function Sparkline({ data, width = 72, height = 28 }) {
  if (!data || data.length < 2) {
    return <span className="text-xs text-gray-700 w-[72px] inline-block text-center">—</span>
  }
  const vals = data.map((d) => d.weight)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const pts = vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * width,
    y: (height - 4) - ((v - min) / range) * (height - 8) + 2,
  }))
  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={polyline}
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x.toFixed(1)} cy={last.y.toFixed(1)} r="2.5" fill="#6366f1" />
    </svg>
  )
}

// ── Mini activity bar (last N days) ──────────────────────────
function ActivityBar({ sessions, days = 8 }) {
  const today = new Date()
  const bars = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1 - i))
    const dateStr = d.toISOString().split('T')[0]
    return sessions.some((s) => s.session_date === dateStr)
  })
  return (
    <div className="flex gap-0.5 items-end h-5">
      {bars.map((active, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm transition-colors ${active ? 'h-5' : 'h-2 bg-gray-800'}`}
          style={active ? { height: '20px', backgroundColor: 'currentColor' } : undefined}
        />
      ))}
    </div>
  )
}

// Tailwind-safe color classes per category
const CAT_COLORS = {
  strength: {
    bar: 'bg-blue-600',
    border: 'hover:border-blue-700',
    count: 'text-blue-400',
    pill: 'bg-blue-950 text-blue-300',
    ring: 'ring-blue-700',
    bg: 'bg-blue-950/40 border-blue-800/50',
    accent: 'text-blue-300',
    btn: 'bg-blue-700 hover:bg-blue-600',
  },
  cardio: {
    bar: 'bg-green-600',
    border: 'hover:border-green-700',
    count: 'text-green-400',
    pill: 'bg-green-950 text-green-300',
    ring: 'ring-green-700',
    bg: 'bg-green-950/40 border-green-800/50',
    accent: 'text-green-300',
    btn: 'bg-green-700 hover:bg-green-600',
  },
  calisthenics: {
    bar: 'bg-purple-600',
    border: 'hover:border-purple-700',
    count: 'text-purple-400',
    pill: 'bg-purple-950 text-purple-300',
    ring: 'ring-purple-700',
    bg: 'bg-purple-950/40 border-purple-800/50',
    accent: 'text-purple-300',
    btn: 'bg-purple-700 hover:bg-purple-600',
  },
  flexibility: {
    bar: 'bg-orange-600',
    border: 'hover:border-orange-700',
    count: 'text-orange-400',
    pill: 'bg-orange-950 text-orange-300',
    ring: 'ring-orange-700',
    bg: 'bg-orange-950/40 border-orange-800/50',
    accent: 'text-orange-300',
    btn: 'bg-orange-700 hover:bg-orange-600',
  },
}

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core']
const CARDIO_ACTIVITIES = ['All', 'Running', 'Cycling', 'Rowing']

// ── Landing — 4 category cards ────────────────────────────────
function LandingView({ sessions, templates, onSelect }) {
  const categories = [
    { key: 'strength', label: 'Strength' },
    { key: 'cardio', label: 'Cardio' },
    { key: 'calisthenics', label: 'Calisthenics' },
    { key: 'flexibility', label: 'Flexibility' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map(({ key, label }) => {
        const catSessions = sessions.filter((s) => getCategory(s, templates) === key)
        const c = CAT_COLORS[key]
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`bg-gray-900 border border-gray-800 ${c.border} rounded-2xl p-5 text-left transition-colors group`}
          >
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {label}
            </div>
            <div className={`text-4xl font-bold mb-1 ${c.count}`}>{catSessions.length}</div>
            <div className="text-xs text-gray-600 mb-3">sessions</div>
            {/* Mini activity bar */}
            <div className="flex gap-0.5 items-end h-5">
              {Array.from({ length: 8 }, (_, i) => {
                const today = new Date()
                const d = new Date(today)
                d.setDate(d.getDate() - (7 - i))
                const dateStr = d.toISOString().split('T')[0]
                const active = catSessions.some((s) => s.session_date === dateStr)
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${active ? c.bar + ' h-5' : 'bg-gray-800 h-2'}`}
                  />
                )
              })}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Strength drill-down ───────────────────────────────────────
function StrengthView({ templates, sessions, sessionExercises, getExerciseProgress, onBack }) {
  const [muscleFilter, setMuscleFilter] = useState('All')
  const [selectedEx, setSelectedEx] = useState(null)

  const strengthTemplates = templates.filter(
    (t) => (t.workout_category || CATEGORY_MAP[t.type]) === 'strength'
  )

  const exercises = useMemo(() => {
    const map = new Map()
    strengthTemplates.forEach((tmpl) => {
      ;(tmpl.template_exercises ?? []).forEach((ex) => {
        if (!map.has(ex.exercise_name)) {
          map.set(ex.exercise_name, { name: ex.exercise_name, muscle_group: ex.muscle_group })
        }
      })
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [strengthTemplates])

  const filtered =
    muscleFilter === 'All'
      ? exercises
      : exercises.filter((e) => e.muscle_group === muscleFilter)

  if (selectedEx) {
    const data = getExerciseProgress(selectedEx.name)
    const weights = data.map((d) => d.weight)
    const peak = weights.length ? Math.max(...weights) : null
    const avg = weights.length
      ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
      : null
    const latest = weights.length ? weights[weights.length - 1] : null

    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedEx(null)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to exercises
        </button>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold text-gray-100">{selectedEx.name}</h3>
            {selectedEx.muscle_group && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300">
                {selectedEx.muscle_group}
              </span>
            )}
          </div>
          {data.length === 0 ? (
            <p className="text-sm text-gray-600 mt-4">
              No weight data logged for this exercise yet.
            </p>
          ) : (
            <ProgressChart data={data} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        All categories
      </button>

      {/* Muscle group filter pills */}
      <div className="flex gap-2 flex-wrap">
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setMuscleFilter(g)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              muscleFilter === g
                ? 'bg-blue-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-600 italic py-4">
          {exercises.length === 0
            ? 'No exercises found. Add exercises to a Tonal template.'
            : `No exercises tagged with "${muscleFilter}".`}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((ex) => {
            const data = getExerciseProgress(ex.name)
            const latest = data.length ? data[data.length - 1].weight : null
            return (
              <button
                key={ex.name}
                onClick={() => setSelectedEx(ex)}
                className="bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-xl p-4 text-left transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-200 group-hover:text-gray-100">
                      {ex.name}
                    </p>
                    {ex.muscle_group && (
                      <span className="text-xs text-blue-400 mt-0.5 block">{ex.muscle_group}</span>
                    )}
                  </div>
                  {latest != null && (
                    <span className="text-sm font-semibold text-gray-300">{latest} lbs</span>
                  )}
                </div>
                <Sparkline data={data} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Calisthenics drill-down (absorbs Sw. Ladder) ──────────────
function CalisthenicsView({ templates, currentStage, ladderStages, advanceStage, setStage, onBack }) {
  const [advancing, setAdvancing] = useState(false)
  const [customStage, setCustomStage] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [error, setError] = useState(null)

  const handleAdvance = async () => {
    setAdvancing(true)
    setError(null)
    const { error: err } = await advanceStage()
    if (err) setError(err.message)
    setAdvancing(false)
  }

  const handleSetCustom = async () => {
    const n = parseInt(customStage)
    if (!n || n < 1) { setError('Enter a valid stage number (1 or higher).'); return }
    setError(null)
    const { error: err } = await setStage(n)
    if (err) { setError(err.message); return }
    setCustomStage('')
    setShowCustom(false)
  }

  // Exercises from swedish_ladder templates
  const calisthenicsTemplates = templates.filter(
    (t) => (t.workout_category || CATEGORY_MAP[t.type]) === 'calisthenics'
  )
  const exercises = useMemo(() => {
    const map = new Map()
    calisthenicsTemplates.forEach((tmpl) => {
      ;(tmpl.template_exercises ?? []).forEach((ex) => {
        if (!map.has(ex.exercise_name)) {
          map.set(ex.exercise_name, { name: ex.exercise_name, skill_level: ex.skill_level })
        }
      })
    })
    return Array.from(map.values())
  }, [calisthenicsTemplates])

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        All categories
      </button>

      {/* Current stage display */}
      <div className="bg-purple-950/40 border border-purple-800/50 rounded-2xl p-8 text-center">
        <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">
          Current Stage
        </p>
        {currentStage ? (
          <>
            <div className="text-8xl font-bold text-purple-300 leading-none mb-3">
              {currentStage.stage_number}
            </div>
            <p className="text-sm text-purple-500">
              Started {formatDateShort(currentStage.started_at)}
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl font-bold text-purple-800 mb-2">—</div>
            <p className="text-sm text-purple-700">No stage set yet</p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleAdvance}
          disabled={advancing}
          className="flex-1 flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors"
        >
          <ArrowUpIcon className="w-5 h-5" />
          {advancing
            ? 'Advancing…'
            : `Advance to Stage ${(currentStage?.stage_number ?? 0) + 1}`}
        </button>
        <button
          onClick={() => { setShowCustom((v) => !v); setError(null) }}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
        >
          Set Stage
        </button>
      </div>

      {showCustom && (
        <div className="flex gap-2">
          <input
            type="number"
            value={customStage}
            onChange={(e) => setCustomStage(e.target.value)}
            placeholder="Stage number"
            min={1}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSetCustom()}
          />
          <button
            onClick={handleSetCustom}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Set
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Stage history */}
      {ladderStages.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage History</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {[...ladderStages].reverse().map((s, i) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      i === 0 ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {s.stage_number}
                  </span>
                  <span className={`text-sm ${i === 0 ? 'text-purple-300 font-medium' : 'text-gray-400'}`}>
                    Stage {s.stage_number}
                    {i === 0 && ' (current)'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDateShort(s.started_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercises with skill levels */}
      {exercises.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Exercise Skill Levels
            </h3>
          </div>
          <div className="divide-y divide-gray-800">
            {exercises.map((ex) => (
              <div key={ex.name} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-gray-200">{ex.name}</span>
                {ex.skill_level ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      ex.skill_level === 'advanced'
                        ? 'bg-purple-900 text-purple-300'
                        : ex.skill_level === 'intermediate'
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {ex.skill_level}
                  </span>
                ) : (
                  <span className="text-xs text-gray-600">—</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Cardio drill-down ─────────────────────────────────────────
function CardioView({ sessions, sessionExercises, templates, onBack }) {
  const [actFilter, setActFilter] = useState('All')

  const cardioSessions = sessions.filter((s) => getCategory(s, templates) === 'cardio')

  const allData = useMemo(() => {
    return cardioSessions
      .flatMap((session) => {
        const exs = sessionExercises.filter((se) => se.session_id === session.id)
        return exs.map((ex) => ({
          date: session.session_date,
          activity: ex.exercise_name,
          distance: ex.actual_distance,
          duration_secs: ex.actual_duration_secs,
          pace: ex.actual_pace,
        }))
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [cardioSessions, sessionExercises])

  const filtered = actFilter === 'All' ? allData : allData.filter((d) => d.activity === actFilter)

  // Personal bests
  const distances = filtered.map((d) => d.distance).filter(Boolean)
  const durations = filtered.map((d) => d.duration_secs).filter(Boolean)
  const longestDist = distances.length ? Math.max(...distances) : null
  const longestDur = durations.length ? Math.max(...durations) : null

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        All categories
      </button>

      {/* Activity filter */}
      <div className="flex gap-2 flex-wrap">
        {CARDIO_ACTIVITIES.map((a) => (
          <button
            key={a}
            onClick={() => setActFilter(a)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              actFilter === a
                ? 'bg-green-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Personal bests */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Longest Distance</p>
            <p className="text-2xl font-bold text-green-400">
              {longestDist != null ? `${longestDist} km` : '—'}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Longest Duration</p>
            <p className="text-2xl font-bold text-green-400">
              {longestDur != null ? fmtDuration(longestDur) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Session log */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl text-gray-600">
          <p>No cardio sessions logged yet.</p>
          <p className="text-sm mt-1">Log a session using a Cardio template.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-3 px-5 py-3 border-b border-gray-800">
            <span className="text-xs text-gray-500 uppercase">Date</span>
            <span className="text-xs text-gray-500 uppercase text-center">Activity</span>
            <span className="text-xs text-gray-500 uppercase text-center">Dist</span>
            <span className="text-xs text-gray-500 uppercase text-center">Time</span>
            <span className="text-xs text-gray-500 uppercase text-center">Pace</span>
          </div>
          <div className="divide-y divide-gray-800 max-h-80 overflow-y-auto">
            {[...filtered].reverse().map((d, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-3 items-center px-5 py-3">
                <span className="text-sm text-gray-300">{formatDateShort(d.date)}</span>
                <span className="text-sm text-gray-400 text-center">{d.activity ?? '—'}</span>
                <span className="text-sm text-gray-400 text-center">
                  {d.distance != null ? `${d.distance}km` : '—'}
                </span>
                <span className="text-sm text-gray-400 text-center">
                  {d.duration_secs != null ? fmtDuration(d.duration_secs) : '—'}
                </span>
                <span className="text-sm text-gray-400 text-center">{d.pace ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Flexibility drill-down ────────────────────────────────────
function FlexibilityView({ sessions, sessionExercises, templates, onBack }) {
  const flexSessions = sessions.filter((s) => getCategory(s, templates) === 'flexibility')

  const sessionData = useMemo(() => {
    return flexSessions.map((session) => {
      const exs = sessionExercises.filter((se) => se.session_id === session.id)
      const totalSecs = exs.reduce((sum, ex) => sum + (ex.actual_duration_secs || 0), 0)
      return { session, exs, totalSecs }
    })
  }, [flexSessions, sessionExercises])

  // Most practiced stretches
  const stretchCounts = useMemo(() => {
    const counts = {}
    sessionData.forEach(({ exs }) => {
      exs.forEach((ex) => {
        counts[ex.exercise_name] = (counts[ex.exercise_name] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [sessionData])

  // Weekly / monthly totals
  const now = new Date()
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1)

  const weekSecs = sessionData
    .filter(({ session }) => new Date(session.session_date + 'T00:00:00') >= weekAgo)
    .reduce((sum, { totalSecs }) => sum + totalSecs, 0)
  const monthSecs = sessionData
    .filter(({ session }) => new Date(session.session_date + 'T00:00:00') >= monthAgo)
    .reduce((sum, { totalSecs }) => sum + totalSecs, 0)

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        All categories
      </button>

      {/* Time stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">This Week</p>
          <p className="text-2xl font-bold text-orange-400">
            {weekSecs > 0 ? fmtDuration(weekSecs) : '—'}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">This Month</p>
          <p className="text-2xl font-bold text-orange-400">
            {monthSecs > 0 ? fmtDuration(monthSecs) : '—'}
          </p>
        </div>
      </div>

      {/* Most practiced stretches */}
      {stretchCounts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Most Practiced
            </h3>
          </div>
          <div className="divide-y divide-gray-800">
            {stretchCounts.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-gray-200">{name}</span>
                <span className="text-sm text-orange-400 font-medium">{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session list */}
      {sessionData.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl text-gray-600">
          <p>No flexibility sessions logged yet.</p>
          <p className="text-sm mt-1">Log a session using a Flexibility template.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</h3>
          </div>
          <div className="divide-y divide-gray-800 max-h-72 overflow-y-auto">
            {sessionData.map(({ session, exs, totalSecs }) => (
              <div key={session.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{formatDateShort(session.session_date)}</span>
                  <span className="text-sm text-orange-400">
                    {totalSecs > 0 ? fmtDuration(totalSecs) : `${exs.length} exercises`}
                  </span>
                </div>
                {exs.length > 0 && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {exs.map((e) => e.exercise_name).join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Root component ────────────────────────────────────────────
export function ProgressTracker({
  templates,
  sessions,
  sessionExercises,
  ladderStages,
  currentStage,
  advanceStage,
  setStage,
  getExerciseProgress,
}) {
  const [view, setView] = useState('landing')

  if (view === 'strength') {
    return (
      <StrengthView
        templates={templates}
        sessions={sessions}
        sessionExercises={sessionExercises}
        getExerciseProgress={getExerciseProgress}
        onBack={() => setView('landing')}
      />
    )
  }

  if (view === 'calisthenics') {
    return (
      <CalisthenicsView
        templates={templates}
        currentStage={currentStage}
        ladderStages={ladderStages}
        advanceStage={advanceStage}
        setStage={setStage}
        onBack={() => setView('landing')}
      />
    )
  }

  if (view === 'cardio') {
    return (
      <CardioView
        sessions={sessions}
        sessionExercises={sessionExercises}
        templates={templates}
        onBack={() => setView('landing')}
      />
    )
  }

  if (view === 'flexibility') {
    return (
      <FlexibilityView
        sessions={sessions}
        sessionExercises={sessionExercises}
        templates={templates}
        onBack={() => setView('landing')}
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Select a category to explore your progress.</p>
      <LandingView sessions={sessions} templates={templates} onSelect={setView} />
    </div>
  )
}
