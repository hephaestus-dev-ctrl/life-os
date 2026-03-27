import { TrashIcon } from '@heroicons/react/24/outline'

const PRIORITY_BORDER = {
  high:   'border-l-[3px] border-l-red-500',
  medium: 'border-l-[3px] border-l-amber-500',
  low:    'border-l-[3px] border-l-gray-700',
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TodoItem({ todo, onToggle, onDelete, isOverdue }) {
  const done = todo.status === 'done'
  const priorityBorder = PRIORITY_BORDER[todo.priority] ?? PRIORITY_BORDER.medium

  return (
    <div
      className={`flex items-start gap-3 group bg-gray-900 border rounded-xl px-4 py-3 transition-all ${priorityBorder} ${
        isOverdue
          ? 'border-red-900/50 bg-red-950/20 hover:border-red-800/60'
          : done
          ? 'border-gray-800/40 opacity-60'
          : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      {/* Square checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          done
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-gray-700 hover:border-indigo-500'
        }`}
      >
        {done && (
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            done ? 'line-through text-gray-600' : 'text-gray-100'
          }`}
        >
          {todo.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {todo.notes && (
            <p className="text-xs text-gray-600 truncate max-w-xs">{todo.notes}</p>
          )}
          {todo.due_date && (
            <span
              className={`text-xs font-medium ${
                isOverdue ? 'text-red-400' : 'text-gray-600'
              }`}
            >
              {isOverdue && '⚠ '}
              {formatDate(todo.due_date)}
            </span>
          )}
        </div>
      </div>

      {/* Delete — shown on hover */}
      <button
        onClick={() => onDelete(todo.id)}
        className="mt-0.5 opacity-0 group-hover:opacity-100 p-1 text-gray-700 hover:text-red-400 transition-all flex-shrink-0 rounded hover:bg-gray-800"
        title="Delete"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
