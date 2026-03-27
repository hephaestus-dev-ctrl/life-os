import { TrashIcon } from '@heroicons/react/24/outline'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ChoreItem({ chore, completed, overdue, lastCompleted, onToggle, onDelete }) {
  return (
    <div
      className={`flex items-center gap-3 group bg-gray-900 border rounded-xl px-4 py-3 transition-colors ${
        overdue && !completed
          ? 'border-red-900/60 hover:border-red-800'
          : completed
          ? 'border-gray-800/40'
          : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      {/* Circle checkbox */}
      <button
        onClick={() => onToggle(chore.id, chore.cadence)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150 ${
          completed
            ? 'bg-indigo-600 border-indigo-600'
            : overdue
            ? 'border-red-700 hover:border-red-400'
            : 'border-gray-600 hover:border-indigo-400'
        }`}
      >
        {completed && (
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            completed ? 'text-gray-500 line-through' : 'text-gray-100'
          }`}
        >
          {chore.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {chore.assigned_day && (
            <span className="text-xs text-gray-600">{chore.assigned_day}</span>
          )}
          {overdue && !completed && (
            <span className="text-xs text-red-400 font-medium">Overdue</span>
          )}
          <span className="text-xs text-gray-700">
            {lastCompleted ? `Last done ${formatDate(lastCompleted)}` : 'Never done'}
          </span>
        </div>
      </div>

      {/* Delete — shown on hover */}
      <button
        onClick={() => onDelete(chore.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-700 hover:text-red-400 transition-all flex-shrink-0"
        title="Delete"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
