import { useState } from 'react'
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ItemRow({ item, onToggle, onDelete }) {
  const discussed = item.status === 'discussed'
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
      discussed
        ? 'border-gray-800 bg-gray-800/20'
        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
    }`}>
      <button
        onClick={() => onToggle(item.id)}
        className={`mt-0.5 shrink-0 transition-colors ${
          discussed ? 'text-green-500 hover:text-green-400' : 'text-gray-600 hover:text-green-400'
        }`}
        title={discussed ? 'Mark as pending' : 'Mark as discussed'}
      >
        {discussed
          ? <CheckCircleSolid className="w-5 h-5" />
          : <CheckCircleIcon  className="w-5 h-5" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${discussed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
          {item.question}
        </p>
        {item.context && (
          <p className="text-xs text-gray-600 mt-0.5">{item.context}</p>
        )}
        <p className="text-xs text-gray-700 mt-1">{timeAgo(item.created_at)}</p>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="p-1 text-gray-700 hover:text-red-400 transition-colors shrink-0"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function OneOnOneSection({ items, onToggle, onDelete }) {
  const [showDiscussed, setShowDiscussed] = useState(false)

  const pending   = items.filter((i) => i.status === 'pending')
  const discussed = items.filter((i) => i.status === 'discussed')

  return (
    <div className="space-y-5">
      {/* Pending count banner */}
      {pending.length > 0 && (
        <div className="px-4 py-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-sm text-amber-300">
          <span className="font-semibold">{pending.length}</span> pending question{pending.length !== 1 ? 's' : ''} to raise in your next 1-on-1
        </div>
      )}

      {/* Pending questions */}
      {pending.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
            Pending ({pending.length})
          </p>
          {pending.map((item) => (
            <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600 text-sm">
          No pending questions — click "Add Question" to add one.
        </div>
      )}

      {/* Discussed — collapsible */}
      {discussed.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setShowDiscussed((v) => !v)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-400 transition-colors mb-3"
          >
            {showDiscussed
              ? <ChevronUpIcon   className="w-4 h-4" />
              : <ChevronDownIcon className="w-4 h-4" />}
            Discussed ({discussed.length})
          </button>
          {showDiscussed && (
            <div className="space-y-2">
              {discussed.map((item) => (
                <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
