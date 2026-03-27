import { NAV_ITEMS } from '../../config/navItems'
import { Link } from 'react-router-dom'

const MODULE_DESCRIPTIONS = {
  '/habits': 'Track your daily habits and streaks',
  '/todo': 'Manage your tasks and to-dos',
  '/chores': 'Keep on top of household chores',
  '/journal': 'Daily reflections and entries',
  '/notes': 'Capture ideas and notes',
  '/books': 'Your reading list and reviews',
  '/workouts': 'Log workouts and track fitness',
}

export default function Dashboard({ session }) {
  const moduleItems = NAV_ITEMS.filter((item) => item.path !== '/')

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">
          Welcome back{session?.user?.email ? `, ${session.user.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here's your Life OS overview</p>
      </div>

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
              Coming soon →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
