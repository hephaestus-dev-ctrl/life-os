import { useState } from 'react'
import { useWorkouts } from './useWorkouts'
import { TemplateLibrary } from './TemplateLibrary'
import { LogSession } from './LogSession'
import { WorkoutHistory } from './WorkoutHistory'
import { ProgressTracker } from './ProgressTracker'
import {
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

const TABS = [
  { id: 'templates', label: 'Templates', Icon: ClipboardDocumentListIcon },
  { id: 'log', label: 'Log Session', Icon: PlusCircleIcon },
  { id: 'history', label: 'History', Icon: ClockIcon },
  { id: 'progress', label: 'Progress', Icon: ChartBarIcon },
]

export default function Workouts() {
  const [tab, setTab] = useState('templates')
  const workouts = useWorkouts()

  if (workouts.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Workouts</h1>
        <p className="text-sm text-gray-500 mt-1">
          {workouts.templates.length} templates · {workouts.sessions.length} sessions logged
        </p>
      </div>

      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
              tab === id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === 'templates' && <TemplateLibrary {...workouts} />}
      {tab === 'log' && <LogSession {...workouts} onSaved={() => setTab('history')} />}
      {tab === 'history' && <WorkoutHistory {...workouts} />}
      {tab === 'progress' && <ProgressTracker {...workouts} />}
    </div>
  )
}
