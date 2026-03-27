import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

// ── Date helpers ─────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function weekStartStr() {
  const d   = new Date()
  const day  = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function monthStartStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

// Mon=0 … Sun=6
function dayNameToIndex(name) {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(name)
}

function todayDayIndex() {
  const d = new Date().getDay() // 0=Sun
  return d === 0 ? 6 : d - 1
}

// ── Data hook ────────────────────────────────────────────────

function useDashboardSummary(userId) {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (!userId) return

    const today      = todayStr()
    const weekStart  = weekStartStr()
    const monthStart = monthStartStr()
    const todayIdx   = todayDayIndex()

    async function load() {
      const [
        habitsRes, habitLogsRes,
        todosRes,
        choresRes, choreLogsRes,
        journalRes,
        oneOnOneRes,
        meetingTopicsRes,
        readingRes,
        finishedRes,
      ] = await Promise.all([
        supabase.from('habits').select('id, name').eq('user_id', userId).is('routine_type', null),
        supabase.from('habit_logs').select('habit_id').eq('user_id', userId).eq('completed_date', today),
        supabase.from('todos').select('id, title, due_date').eq('user_id', userId).eq('status', 'open'),
        supabase.from('chores').select('id, title, cadence, assigned_day').eq('user_id', userId),
        supabase.from('chore_logs').select('chore_id, completed_date').eq('user_id', userId).gte('completed_date', monthStart),
        supabase.from('journal_entries').select('id').eq('user_id', userId).eq('entry_date', today).maybeSingle(),
        supabase.from('one_on_one_items').select('id, question').eq('user_id', userId).eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('meeting_topics').select('id, content').eq('user_id', userId).eq('status', 'pending').eq('archived', false).order('created_at', { ascending: false }),
        supabase.from('books').select('title').eq('user_id', userId).eq('status', 'reading').order('created_at', { ascending: false }).limit(1),
        supabase.from('books').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'finished'),
      ])

      // ── Habits ──
      const habits            = habitsRes.data ?? []
      const completedHabitIds = new Set((habitLogsRes.data ?? []).map((l) => l.habit_id))
      const habitTotal        = habits.length
      const habitCompleted    = habits.filter((h) => completedHabitIds.has(h.id)).length
      const incompleteHabits  = habits.filter((h) => !completedHabitIds.has(h.id))

      // ── Todos ──
      const openTodos     = todosRes.data ?? []
      const overdueTodos  = openTodos.filter((t) => t.due_date && t.due_date < today)
      const dueTodayTodos = openTodos.filter((t) => t.due_date === today)

      // ── Chores ──
      const choreLogs = choreLogsRes.data ?? []
      const allChores = choresRes.data ?? []

      const choresIncomplete = allChores.filter((c) => {
        const periodStart = c.cadence === 'daily' ? today : c.cadence === 'weekly' ? weekStart : monthStart
        return !choreLogs.some((l) => l.chore_id === c.id && l.completed_date >= periodStart)
      }).length

      const choresToday = allChores.filter((c) => {
        const periodStart = c.cadence === 'daily' ? today : c.cadence === 'weekly' ? weekStart : monthStart
        const done = choreLogs.some((l) => l.chore_id === c.id && l.completed_date >= periodStart)
        if (done) return false
        if (c.cadence === 'daily') return true
        if (c.cadence === 'weekly' && c.assigned_day) {
          return dayNameToIndex(c.assigned_day) === todayIdx
        }
        return false
      })

      // ── Journal ──
      const hasJournalToday = !journalRes.error && journalRes.data !== null

      // ── Meetings ──
      const pendingTopics = [
        ...(oneOnOneRes.data  ?? []).map((i) => ({ id: i.id, text: i.question })),
        ...(meetingTopicsRes.data ?? []).map((i) => ({ id: i.id, text: i.content })),
      ]

      // ── Books ──
      const currentlyReading = readingRes.data?.[0]?.title ?? null
      const booksFinished    = finishedRes.count ?? 0

      setSummary({
        habitTotal, habitCompleted, incompleteHabits,
        overdueTodos, dueTodayTodos,
        choresIncomplete, choresToday,
        hasJournalToday,
        pendingTopics,
        currentlyReading, booksFinished,
      })
    }

    load()
  }, [userId])

  return summary
}

// ── Stat card ─────────────────────────────────────────────────

function StatCard({ to, label, value, sub, alert, borderColor }) {
  return (
    <Link
      to={to}
      className={`flex flex-col gap-1 rounded-xl px-4 py-3 transition-all hover:-translate-y-px ${
        alert ? 'hover:brightness-110' : ''
      }`}
      style={{
        backgroundColor: alert ? 'rgba(239,68,68,0.1)' : '#1e2130',
        border: alert ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <p className={`text-[11px] font-medium uppercase tracking-[0.06em] truncate ${
        alert ? 'text-red-400' : 'text-gray-500'
      }`}>
        {label}
      </p>
      <p className={`text-[28px] font-bold leading-none ${
        alert ? 'text-red-300' : 'text-gray-100'
      }`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs truncate mt-0.5 ${
          alert ? 'text-red-500/70' : 'text-gray-600'
        }`}>
          {sub}
        </p>
      )}
    </Link>
  )
}

// ── Attention card ────────────────────────────────────────────

function AttentionCard({ to, label, accentClass, children }) {
  return (
    <Link
      to={to}
      className="block bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 hover:-translate-y-px transition-all"
    >
      <p className={`text-[11px] font-semibold uppercase tracking-[0.06em] mb-3 ${accentClass}`}>
        {label}
      </p>
      {children}
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────

export default function Dashboard({ session }) {
  const s = useDashboardSummary(session?.user?.id)

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const userName = session?.user?.email
    ? session.user.email.split('@')[0]
    : null

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-gray-100 leading-tight">
          {userName ? `Hey, ${userName}` : 'Dashboard'}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">{todayFormatted}</p>
      </div>

      {s === null ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            <StatCard
              to="/habits"
              label="Habits today"
              borderColor="#6366f1"
              value={`${s.habitCompleted}/${s.habitTotal}`}
              sub={
                s.habitTotal === 0 ? 'none tracked'
                : s.habitCompleted === s.habitTotal ? 'All done!'
                : `${s.habitTotal - s.habitCompleted} remaining`
              }
            />
            <StatCard
              to="/todo"
              label="Due today"
              borderColor="#f59e0b"
              value={s.dueTodayTodos.length}
              sub={s.dueTodayTodos.length === 1 ? '1 task' : `${s.dueTodayTodos.length} tasks`}
            />
            <StatCard
              to="/todo"
              label="Overdue"
              borderColor="#ef4444"
              value={s.overdueTodos.length}
              sub={s.overdueTodos.length > 0 ? 'needs attention' : 'all clear'}
              alert={s.overdueTodos.length > 0}
            />
            <StatCard
              to="/chores"
              label="Chores pending"
              borderColor="#14b8a6"
              value={s.choresIncomplete}
              sub="this period"
            />
            <StatCard
              to="/books"
              label="Reading"
              borderColor="#3b82f6"
              value={s.currentlyReading ? '📖' : '—'}
              sub={
                s.currentlyReading
                  ? s.currentlyReading.length > 28
                    ? s.currentlyReading.slice(0, 28) + '…'
                    : s.currentlyReading
                  : 'nothing yet'
              }
            />
            <StatCard
              to="/books"
              label="Books finished"
              borderColor="#10b981"
              value={s.booksFinished}
              sub="total"
            />
          </div>

          {/* ── Needs attention ── */}
          <h2 className="text-[11px] font-semibold text-gray-700 uppercase tracking-[0.06em] mb-4">
            Needs attention today
          </h2>

          {(() => {
            const cards = []

            if (s.incompleteHabits.length > 0) {
              cards.push(
                <AttentionCard key="habits" to="/habits" label="Habits" accentClass="text-indigo-400">
                  <div className="flex flex-wrap gap-1.5">
                    {s.incompleteHabits.map((h) => (
                      <span
                        key={h.id}
                        className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-full"
                      >
                        {h.name}
                      </span>
                    ))}
                  </div>
                </AttentionCard>
              )
            }

            if (!s.hasJournalToday) {
              cards.push(
                <AttentionCard key="journal" to="/journal" label="Journal" accentClass="text-amber-400">
                  <p className="text-sm text-gray-300">{todayFormatted}</p>
                  <p className="text-xs text-gray-600 mt-1">Today's entry isn't written yet →</p>
                </AttentionCard>
              )
            }

            if (s.overdueTodos.length > 0 || s.dueTodayTodos.length > 0) {
              cards.push(
                <AttentionCard key="todos" to="/todo" label="To-Do" accentClass="text-red-400">
                  {s.overdueTodos.length > 0 && (
                    <div className={s.dueTodayTodos.length > 0 ? 'mb-3' : ''}>
                      <p className="text-xs text-red-500 font-medium mb-1.5">
                        Overdue ({s.overdueTodos.length})
                      </p>
                      <div className="space-y-1">
                        {s.overdueTodos.slice(0, 4).map((t) => (
                          <p key={t.id} className="text-sm text-gray-300 truncate">— {t.title}</p>
                        ))}
                        {s.overdueTodos.length > 4 && (
                          <p className="text-xs text-gray-600">+{s.overdueTodos.length - 4} more</p>
                        )}
                      </div>
                    </div>
                  )}
                  {s.dueTodayTodos.length > 0 && (
                    <div>
                      <p className="text-xs text-amber-400 font-medium mb-1.5">
                        Due today ({s.dueTodayTodos.length})
                      </p>
                      <div className="space-y-1">
                        {s.dueTodayTodos.slice(0, 4).map((t) => (
                          <p key={t.id} className="text-sm text-gray-300 truncate">— {t.title}</p>
                        ))}
                        {s.dueTodayTodos.length > 4 && (
                          <p className="text-xs text-gray-600">+{s.dueTodayTodos.length - 4} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </AttentionCard>
              )
            }

            if (s.choresToday.length > 0) {
              cards.push(
                <AttentionCard key="chores" to="/chores" label="Chores" accentClass="text-purple-400">
                  <div className="flex flex-wrap gap-1.5">
                    {s.choresToday.map((c) => (
                      <span
                        key={c.id}
                        className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-full"
                      >
                        {c.title}
                      </span>
                    ))}
                  </div>
                </AttentionCard>
              )
            }

            if (s.pendingTopics.length > 0) {
              cards.push(
                <AttentionCard key="meetings" to="/notes" label="Meetings" accentClass="text-teal-400">
                  <p className="text-sm text-gray-300">
                    {s.pendingTopics.length} pending topic{s.pendingTopics.length !== 1 ? 's' : ''}
                  </p>
                  {s.pendingTopics[0] && (
                    <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                      "{s.pendingTopics[0].text.length > 100
                        ? s.pendingTopics[0].text.slice(0, 100) + '…'
                        : s.pendingTopics[0].text}"
                    </p>
                  )}
                </AttentionCard>
              )
            }

            if (cards.length === 0) {
              return (
                <div className="text-center py-14 bg-gray-900/40 border border-gray-800 rounded-2xl">
                  <CheckCircleIcon className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-gray-200 font-medium">You're all caught up today</p>
                  <p className="text-gray-600 text-sm mt-1">{todayFormatted}</p>
                </div>
              )
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards}
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
