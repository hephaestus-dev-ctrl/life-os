import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/navItems'
import { supabase } from '../../lib/supabase'

const MODULE_DESCRIPTIONS = {
  '/habits': 'Track your daily habits and streaks',
  '/todo': 'Manage your tasks and to-dos',
  '/chores': 'Keep on top of household chores',
  '/journal': 'Daily reflections and entries',
  '/notes': 'Capture ideas and notes',
  '/books': 'Your reading list and reviews',
  '/workouts': 'Log workouts and track fitness',
}

function useHabitSummary(userId) {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (!userId) return
    const today = new Date().toISOString().slice(0, 10)

    async function load() {
      const [habitsRes, logsRes] = await Promise.all([
        supabase
          .from('habits')
          .select('id')
          .eq('user_id', userId)
          .is('routine_type', null),
        supabase
          .from('habit_logs')
          .select('habit_id')
          .eq('user_id', userId)
          .eq('completed_date', today),
      ])
      if (!habitsRes.error && !logsRes.error) {
        setSummary({
          total: habitsRes.data?.length ?? 0,
          completed: logsRes.data?.length ?? 0,
        })
      }
    }

    load()
  }, [userId])

  return summary
}

export default function Dashboard({ session }) {
  const moduleItems = NAV_ITEMS.filter((item) => item.path !== '/')
  const habitSummary = useHabitSummary(session?.user?.id)

  const allDone =
    habitSummary && habitSummary.total > 0 && habitSummary.completed === habitSummary.total

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

      {/* Today's habit summary banner */}
      {habitSummary !== null && habitSummary.total > 0 && (
        <Link
          to="/habits"
          className="flex items-center justify-between bg-indigo-950 border border-indigo-800 rounded-xl px-5 py-4 mb-6 hover:bg-indigo-900 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-indigo-300">Today's Habits</p>
            <p className="text-xs text-indigo-400/80 mt-0.5">
              {allDone
                ? 'All done — great work!'
                : `${habitSummary.total - habitSummary.completed} remaining`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {habitSummary.completed}
              <span className="text-indigo-400 text-lg">/{habitSummary.total}</span>
            </p>
          </div>
        </Link>
      )}

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleItems.map(({ label, path, icon: Icon }) => (
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
              {path === '/habits' && habitSummary !== null && habitSummary.total > 0
                ? `${habitSummary.completed} of ${habitSummary.total} completed today`
                : 'Coming soon →'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
