import { useState } from 'react'
import { TrashIcon, ChevronDownIcon, ChevronUpIcon, FireIcon } from '@heroicons/react/24/outline'
import HeatmapCalendar from './HeatmapCalendar'

const CATEGORY_COLORS = {
  Health: 'bg-emerald-950 text-emerald-400',
  Mind: 'bg-purple-950 text-purple-400',
  Work: 'bg-amber-950 text-amber-400',
  Personal: 'bg-blue-950 text-blue-400',
}

function Checkmark() {
  return (
    <svg className="w-3.5 h-3.5 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function HabitCard({
  habit,
  isCompleted,
  streaks,
  logs,
  getLast30Days,
  onToggle,
  onDelete,
}) {
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${habit.name}"? All logs will be removed.`)) return
    setDeleting(true)
    await onDelete(habit.id)
  }

  const colorClass = CATEGORY_COLORS[habit.category] ?? 'bg-gray-800 text-gray-400'

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-4 transition-colors ${
        isCompleted ? 'border-indigo-800' : 'border-gray-800'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3">
        {/* Circle checkbox */}
        <button
          onClick={() => onToggle(habit.id)}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150 ${
            isCompleted
              ? 'bg-indigo-600 border-indigo-600'
              : 'border-gray-600 hover:border-indigo-400'
          }`}
        >
          {isCompleted && <Checkmark />}
        </button>

        {/* Name + badge */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isCompleted ? 'text-gray-500 line-through' : 'text-gray-100'
            }`}
          >
            {habit.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-1.5 py-0.5 rounded ${colorClass}`}>
              {habit.category}
            </span>
            {streaks.current > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-orange-400">
                <FireIcon className="w-3 h-3" />
                {streaks.current}d
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowHeatmap((v) => !v)}
            title="Show 30-day history"
            className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors"
          >
            {showHeatmap ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete habit"
            className="p-1.5 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Streak row */}
      {(streaks.current > 0 || streaks.longest > 0) && (
        <div className="flex gap-4 mt-2 pl-9">
          <span className="text-xs text-gray-600">
            Current{' '}
            <span className="text-orange-400 font-medium">{streaks.current}d</span>
          </span>
          <span className="text-xs text-gray-600">
            Longest{' '}
            <span className="text-indigo-400 font-medium">{streaks.longest}d</span>
          </span>
        </div>
      )}

      {/* Heatmap */}
      {showHeatmap && (
        <div className="pl-9">
          <HeatmapCalendar
            habitId={habit.id}
            logs={logs}
            getLast30Days={getLast30Days}
          />
        </div>
      )}
    </div>
  )
}
