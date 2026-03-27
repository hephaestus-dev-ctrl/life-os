import { useState } from 'react'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, TagIcon } from '@heroicons/react/24/outline'

const CATEGORY_BADGE = {
  thought:    'bg-purple-950/60 text-purple-300 border-purple-800',
  note:       'bg-gray-800 text-gray-400 border-gray-700',
  work:       'bg-blue-950/60 text-blue-300 border-blue-800',
  'one-on-one': 'bg-teal-950/60 text-teal-300 border-teal-800',
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60)        return 'just now'
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NoteCard({ note, onUpdate, onDelete }) {
  const [editing,  setEditing]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [title,    setTitle]    = useState(note.title    ?? '')
  const [content,  setContent]  = useState(note.content  ?? '')
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(note.id, { title, content })
    setSaving(false)
    setEditing(false)
  }

  const handleCancel = () => {
    setTitle(note.title    ?? '')
    setContent(note.content ?? '')
    setEditing(false)
  }

  const isLong    = (note.content?.length ?? 0) > 200
  const showFull  = expanded || editing
  const displayContent = showFull ? note.content : note.content?.slice(0, 200)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      {editing ? (
        /* Edit mode */
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-medium rounded-lg transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* View mode */
        <>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {note.title && (
                <span className="text-sm font-semibold text-gray-200 truncate">{note.title}</span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_BADGE[note.category] ?? CATEGORY_BADGE.note}`}>
                {note.category}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors rounded"
              >
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {note.content && (
            <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
              {displayContent}
              {isLong && !showFull && '…'}
            </p>
          )}

          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-600">{timeAgo(note.created_at)}</span>
            {note.tags?.length > 0 && (
              <div className="flex items-center gap-1">
                <TagIcon className="w-3 h-3 text-gray-600" />
                {note.tags.map((t) => (
                  <span key={t} className="text-xs text-gray-600">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
