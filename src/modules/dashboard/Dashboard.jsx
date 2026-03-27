import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/navItems'
import { supabase } from '../../lib/supabase'

const MODULE_DESCRIPTIONS = {
  '/habits': 'Track your daily habits and streaks',
  '/todo':   'Manage your tasks and to-dos',
  '/chores': 'Keep on top of household chores',
  '/journal':  'Daily reflections and entries',
  '/notes':    'Capture ideas and notes',
  '/books':    'Your reading list and reviews',
  '/workouts': 'Log workouts and track fitness',
}

// Monday of the current week
function weekStartStr() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function monthStartStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function useDashboardSummary(userId) {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (!userId) return
    const today      = new Date().toISOString().slice(0, 10)
    const weekStart  = weekStartStr()
    const monthStart = monthStartStr()

    async function load() {
      const [
        habitsRes, habitLogsRes,
        todosRes,
        choresRes, choreLogsRes,
        journalRes,
        oneOnOneRes,
        thoughtRes,
      ] = await Promise.all([
        supabase.from('habits').select('id').eq('user_id', userId).is('routine_type', null),
        supabase.from('habit_logs').select('habit_id').eq('user_id', userId).eq('completed_date', today),
        supabase.from('todos').select('id, due_date, status').eq('user_id', userId).eq('status', 'open'),
        supabase.from('chores').select('id, cadence, assigned_day').eq('user_id', userId),
        supabase.from('chore_logs').select('chore_id, completed_date').eq('user_id', userId),
        supabase.from('journal_entries').select('id').eq('user_id', userId).eq('entry_date', today).maybeSingle(),
        supabase.from('one_on_one_items').select('id').eq('user_id', userId).eq('status', 'pending'),
        supabase.from('notes').select('content, created_at').eq('user_id', userId).eq('category', 'thought').order('created_at', { ascending: false }).limit(1),
      ])

      // Habits
      const habitTotal     = habitsRes.data?.length ?? 0
      const habitCompleted = habitLogsRes.data?.length ?? 0

      // Todos
      const openTodos    = todosRes.data ?? []
      const todosDueToday = openTodos.filter((t) => t.due_date === today).length
      const todosOverdue  = openTodos.filter((t) => t.due_date && t.due_date < today).length

      // Chores — count incomplete for current period
      const choreLogs = choreLogsRes.data ?? []
      const choresIncomplete = (choresRes.data ?? []).filter((c) => {
        const periodStart = c.cadence === 'daily'   ? today
                          : c.cadence === 'weekly'  ? weekStart
                          : monthStart
        return !choreLogs.some(
          (l) => l.chore_id === c.id && l.completed_date >= periodStart
        )
      }).length

      const hasJournalToday   = !journalRes.error && journalRes.data !== null
      const pendingOneOnOne   = oneOnOneRes.data?.length ?? 0
      const latestThought     = thoughtRes.data?.[0]?.content ?? null

      setSummary({
        habitTotal, habitCompleted,
        todosDueToday, todosOverdue,
        choresIncomplete,
        hasJournalToday,
        pendingOneOnOne,
        latestThought,
      })
    }

    load()
  }, [userId])

  return summary
}

function StatCard({ to, label, value, sub, accent }) {
  const accentMap = {
    indigo: 'bg-indigo-950 border-indigo-800 hover:bg-indigo-900',
    red:    'bg-red-950/40 border-red-900/60 hover:bg-red-950/60',
    amber:  'bg-amber-950/40 border-amber-900/60 hover:bg-amber-950/60',
    purple: 'bg-purple-950/40 border-purple-900/60 hover:bg-purple-950/60',
  }
  const valMap = {
    indigo: 'text-white',
    red:    'text-red-300',
    amber:  'text-amber-300',
    purple: 'text-purple-300',
  }
  const labelMap = {
    indigo: 'text-indigo-300',
    red:    'text-red-400',
    amber:  'text-amber-400',
    purple: 'text-purple-400',
  }

  return (
    <Link
      to={to}
      className={`flex items-center justify-between border rounded-xl px-5 py-4 transition-colors ${accentMap[accent]}`}
    >
      <div>
        <p className={`text-sm font-medium ${labelMap[accent]}`}>{label}</p>
        {sub && <p className={`text-xs mt-0.5 ${labelMap[accent]} opacity-70`}>{sub}</p>}
      </div>
      <p className={`text-2xl font-bold ${valMap[accent]}`}>{value}</p>
    </Link>
  )
}

export default function Dashboard({ session }) {
  const moduleItems = NAV_ITEMS.filter((item) => item.path !== '/')
  const s = useDashboardSummary(session?.user?.id)

  const habitAllDone = s && s.habitTotal > 0 && s.habitCompleted === s.habitTotal

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">
          Welcome back
          {session?.user?.email ? `, ${session.user.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here's your Life OS overview</p>
      </div>

      {/* At-a-glance summary cards */}
      {s !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {/* Habits */}
          {s.habitTotal > 0 && (
            <StatCard
              to="/habits"
              label="Habits today"
              value={`${s.habitCompleted}/${s.habitTotal}`}
              sub={habitAllDone ? 'All done!' : `${s.habitTotal - s.habitCompleted} remaining`}
              accent="indigo"
            />
          )}

          {/* Tasks due today */}
          {(s.todosDueToday > 0 || s.todosOverdue > 0) && (
            <StatCard
              to="/todo"
              label="Tasks due today"
              value={s.todosDueToday}
              sub={s.todosOverdue > 0 ? `${s.todosOverdue} overdue` : 'on schedule'}
              accent={s.todosOverdue > 0 ? 'red' : 'amber'}
            />
          )}

          {/* Overdue tasks — separate card when significant */}
          {s.todosOverdue > 0 && (
            <StatCard
              to="/todo"
              label="Overdue tasks"
              value={s.todosOverdue}
              sub="needs attention"
              accent="red"
            />
          )}

          {/* Chores incomplete */}
          {s.choresIncomplete > 0 && (
            <StatCard
              to="/chores"
              label="Chores pending"
              value={s.choresIncomplete}
              sub="this period"
              accent="purple"
            />
          )}

          {/* Journal today */}
          {!s.hasJournalToday && (
            <StatCard
              to="/journal"
              label="Journal"
              value="—"
              sub="No entry yet today"
              accent="amber"
            />
          )}

          {/* Pending 1-on-1 questions */}
          {s.pendingOneOnOne > 0 && (
            <StatCard
              to="/notes"
              label="1-on-1 queue"
              value={s.pendingOneOnOne}
              sub={`pending question${s.pendingOneOnOne !== 1 ? 's' : ''}`}
              accent="purple"
            />
          )}
        </div>
      )}

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleItems.map(({ label, path, icon: Icon }) => {
          let blurb = 'Coming soon →'
          if (path === '/habits' && s?.habitTotal > 0)
            blurb = `${s.habitCompleted} of ${s.habitTotal} completed today`
          if (path === '/todo' && s !== null && (s.todosDueToday > 0 || s.todosOverdue > 0))
            blurb = s.todosOverdue > 0
              ? `${s.todosOverdue} overdue · ${s.todosDueToday} due today`
              : `${s.todosDueToday} due today`
          if (path === '/chores' && s?.choresIncomplete > 0)
            blurb = `${s.choresIncomplete} pending this period`
          if (path === '/journal' && s !== null)
            blurb = s.hasJournalToday ? "Today's entry saved ✓" : "No entry yet today — write now"
          if (path === '/notes' && s !== null) {
            if (s.pendingOneOnOne > 0)
              blurb = `${s.pendingOneOnOne} pending 1-on-1 question${s.pendingOneOnOne !== 1 ? 's' : ''}`
            else if (s.latestThought)
              blurb = `"${s.latestThought.slice(0, 60)}${s.latestThought.length > 60 ? '…' : ''}"`
          }

          return (
            <Link
              key={path}
              to={path}
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-600 hover:bg-gray-800 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-950 rounded-xl group-hover:bg-indigo-900 transition-colors">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100 group-hover:text-white">{label}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{MODULE_DESCRIPTIONS[path]}</p>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600 group-hover:text-indigo-400 transition-colors">
                {blurb}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
