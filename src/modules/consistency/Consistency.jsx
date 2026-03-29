import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useConsistency } from './useConsistency'

// ── Score colour ──────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 80) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function scoreLabel(score) {
  if (score >= 80) return 'Great'
  if (score >= 50) return 'Ok'
  return 'Low'
}

// ── SVG Line Chart ────────────────────────────────────────────

function LineChart({ data, height = 120 }) {
  if (!data?.length) return null

  const w         = 600
  const h         = height
  const padX      = 32
  const padXRight = 8
  const padY      = 8
  const chartW    = w - padX - padXRight
  const chartH    = h - padY * 2

  const maxVal = 100
  const minVal = 0

  const pts = data.map((d, i) => ({
    x: padX + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padY + chartH - ((d.score - minVal) / (maxVal - minVal)) * chartH,
    ...d,
  }))

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const areaD = [
    `M ${pts[0].x} ${padY + chartH}`,
    ...pts.map((p) => `L ${p.x} ${p.y}`),
    `L ${pts[pts.length - 1].x} ${padY + chartH}`,
    'Z',
  ].join(' ')

  const yTicks = [0, 25, 50, 75, 100]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y-axis gridlines and labels */}
      {yTicks.map((v) => {
        const y = padY + chartH - (v / 100) * chartH
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={w - padXRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={padX - 4} y={y} dy="0.35em" fontSize="10" fill="#4b5563" textAnchor="end">{v}</text>
          </g>
        )
      })}
      {/* Area fill */}
      <path d={areaD} fill="url(#lineGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots at start and end */}
      {[pts[0], pts[pts.length - 1]].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#6366f1" />
      ))}
    </svg>
  )
}

// ── SVG Bar Chart (workouts) ──────────────────────────────────

function BarChart({ data, color = '#10b981' }) {
  if (!data?.length) return null

  const w       = 600
  const h       = 80
  const padX    = 4
  const padY    = 4
  const chartW  = w - padX * 2
  const chartH  = h - padY * 2
  const maxVal  = Math.max(...data.map((d) => d.count), 1)
  const barW    = Math.max(4, (chartW / data.length) * 0.65)
  const gap     = chartW / data.length

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 80 }}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.count / maxVal) * chartH)
        const x    = padX + i * gap + (gap - barW) / 2
        const y    = padY + chartH - barH
        return (
          <g key={d.week}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill={color} fillOpacity="0.85" />
          </g>
        )
      })}
    </svg>
  )
}

// ── Mini bar chart for dashboard widget ──────────────────────

export function ConsistencyMiniChart({ dailyScores, className = 'h-8', count = 7 }) {
  if (!dailyScores?.length) return null

  const last7  = dailyScores.slice(-count)
  const maxVal = 100

  return (
    <div className={`flex items-end gap-0.5 ${className}`}>
      {last7.map((d) => {
        const frac = d.score / maxVal
        const col  = scoreColor(d.score)
        return (
          <div
            key={d.date}
            className="flex-1 rounded-sm"
            style={{
              height: `${Math.max(10, frac * 100)}%`,
              backgroundColor: col,
              opacity: 0.85,
            }}
            title={`${d.date}: ${d.score}`}
          />
        )
      })}
    </div>
  )
}

// ── Breakdown card ────────────────────────────────────────────

function BreakdownCard({ title, accent, children }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: '#1e2130',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-4"
        style={{ color: accent }}
      >
        {title}
      </p>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

const TIME_FILTERS = [
  { label: '7d',  days: 7  },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

export default function Consistency({ session }) {
  const [days, setDays] = useState(30)
  const { data, loading } = useConsistency(session?.user?.id, days)

  const today = data?.todayScore

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-gray-100 leading-tight">
            Consistency
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            How consistently you're showing up — every day.
          </p>
        </div>

        {/* Time filter */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {TIME_FILTERS.map(({ label, days: d }) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
              style={
                days === d
                  ? { backgroundColor: '#6366f1', color: '#fff' }
                  : { color: '#6b7280' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today's score */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#1e2130',
              border: `1px solid rgba(255,255,255,0.07)`,
              borderLeft: `4px solid ${scoreColor(today.score)}`,
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 mb-1">
                  Today's Score
                </p>
                <div className="flex items-end gap-2">
                  <span
                    className="text-5xl font-bold leading-none"
                    style={{ color: scoreColor(today.score) }}
                  >
                    {today.score}
                  </span>
                  <span className="text-xl text-gray-600 font-medium mb-0.5">/100</span>
                  <span
                    className="text-sm font-medium mb-0.5 ml-1"
                    style={{ color: scoreColor(today.score) }}
                  >
                    {scoreLabel(today.score)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Habits',  val: today.habits,  max: 100, color: '#6366f1' },
                { label: 'Journal', val: today.journal, max: 100, color: '#f59e0b' },
                { label: 'Workout', val: today.workout, max: 100, color: '#10b981' },
                { label: 'Chores',  val: today.chores,  max: 100, color: '#14b8a6' },
              ].map(({ label, val, max, color }) => (
                <div
                  key={label}
                  className="rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: '#242736' }}
                >
                  <p className="text-[10px] font-medium text-gray-600 uppercase tracking-[0.06em] mb-1.5">
                    {label}
                  </p>
                  <div className="flex items-end gap-1 mb-1.5">
                    <span className="text-lg font-bold leading-none" style={{ color }}>
                      {val}
                    </span>
                    <span className="text-xs text-gray-500 mb-px">/{max}</span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(val / max) * 100}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 30-day line chart */}
          <div
            className="rounded-2xl px-5 py-5"
            style={{
              backgroundColor: '#1e2130',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 mb-4">
              Daily Scores — last {days} days
            </p>
            <LineChart data={data.dailyScores} height={120} />

            {/* x-axis labels: weekly intervals */}
            {data.dailyScores.length > 1 && (() => {
              const n = data.dailyScores.length
              const svgW = 600
              const svgPadX = 32
              const svgPadXRight = 8
              const svgChartW = svgW - svgPadX - svgPadXRight
              const indices = []
              for (let i = 0; i < n; i += 7) indices.push(i)
              if (indices[indices.length - 1] !== n - 1) indices.push(n - 1)
              return (
                <div className="relative mt-1" style={{ height: 16 }}>
                  {indices.map((idx) => {
                    const leftPct = ((svgPadX + (idx / Math.max(n - 1, 1)) * svgChartW) / svgW) * 100
                    return (
                      <span
                        key={idx}
                        className="absolute text-[10px] text-gray-700 -translate-x-1/2"
                        style={{ left: `${leftPct}%` }}
                      >
                        {new Date(data.dailyScores[idx].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* Per-module breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Habits */}
            <Link to="/habits" className="block hover:-translate-y-px transition-all">
            <BreakdownCard title="Habits" accent="#6366f1">
              <div className="mb-3 flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold text-gray-100">
                    {data.habitStats.completionRate}%
                  </p>
                  <p className="text-xs text-gray-600">completion rate</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-lg font-semibold text-indigo-400">
                    {data.habitStats.current}d
                  </p>
                  <p className="text-xs text-gray-600">current streak</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-400">
                    {data.habitStats.best}d
                  </p>
                  <p className="text-xs text-gray-600">best streak</p>
                </div>
              </div>
              {data.habitStats.habits.length > 0 && (
                <div className="space-y-2 mt-3">
                  {data.habitStats.habits.slice(0, 5).map((h) => (
                    <div key={h.name} className="flex items-center gap-2">
                      <p className="text-xs text-gray-400 flex-1 truncate">{h.name}</p>
                      <p className="text-xs text-gray-600 w-8 text-right">{h.rate}%</p>
                      <div className="w-20 h-1 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${h.rate}%`, backgroundColor: '#6366f1' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BreakdownCard>
            </Link>

            {/* Journal */}
            <Link to="/journal" className="block hover:-translate-y-px transition-all">
            <BreakdownCard title="Journal" accent="#f59e0b">
              <div className="mb-3 flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold text-gray-100">
                    {data.journalStats.entriesCount}
                  </p>
                  <p className="text-xs text-gray-600">entries in {days} days</p>
                </div>
              </div>
              {data.journalStats.moodTrend.length > 0 ? (
                <>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-2">
                    Mood trend
                  </p>
                  <div className="flex items-end gap-1 h-8">
                    {data.journalStats.moodTrend.slice(-14).map((m) => {
                      const frac = m.value / 5
                      return (
                        <div
                          key={m.date}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${Math.max(15, frac * 100)}%`,
                            backgroundColor: '#f59e0b',
                            opacity: 0.5 + frac * 0.5,
                          }}
                          title={`${m.date}: ${m.mood}`}
                        />
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-gray-700 mt-1">
                    Last {Math.min(14, data.journalStats.moodTrend.length)} mood entries
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-600">No mood data recorded.</p>
              )}
            </BreakdownCard>
            </Link>

            {/* Workouts */}
            <Link to="/workouts" className="block hover:-translate-y-px transition-all">
            <BreakdownCard title="Workouts" accent="#10b981">
              {data.workoutStats.sessionsPerWeek.length > 0 ? (
                <>
                  <div className="mb-3">
                    <p className="text-2xl font-bold text-gray-100">
                      {(
                        data.workoutStats.sessionsPerWeek.reduce((s, w) => s + w.count, 0) /
                        Math.max(1, data.workoutStats.sessionsPerWeek.length)
                      ).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-600">sessions / week avg</p>
                  </div>
                  <BarChart data={data.workoutStats.sessionsPerWeek.slice(-8)} color="#10b981" />
                  <p className="text-[10px] text-gray-700 mt-1">Sessions per week</p>
                </>
              ) : (
                <p className="text-xs text-gray-600">No workouts logged yet.</p>
              )}
            </BreakdownCard>
            </Link>

            {/* Chores */}
            <Link to="/chores" className="block hover:-translate-y-px transition-all">
            <BreakdownCard title="Chores" accent="#14b8a6">
              {data.choreStats.onTimeRate !== null ? (
                <div>
                  <p className="text-2xl font-bold text-gray-100">
                    {data.choreStats.onTimeRate}%
                  </p>
                  <p className="text-xs text-gray-600">
                    {data.choreStats.completed} of {data.choreStats.total} chores done this period
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${data.choreStats.onTimeRate}%`,
                        backgroundColor: '#14b8a6',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-600">No chores tracked.</p>
              )}
            </BreakdownCard>
            </Link>
          </div>

          {/* Link to AI Review */}
          <Link
            to="/ai-review"
            className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all hover:-translate-y-px"
            style={{
              backgroundColor: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <div>
              <p className="text-sm font-medium text-indigo-300">Want a deeper analysis?</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Generate a personalised AI review of your week or month →
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
