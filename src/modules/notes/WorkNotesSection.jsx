import { useState, useMemo } from 'react'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60)        return 'just now'
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Add Work Note Modal ───────────────────────────────────────

function AddWorkNoteModal({ onAdd, onClose }) {
  const [title,        setTitle]        = useState('')
  const [content,      setContent]      = useState('')
  const [projectLabel, setProjectLabel] = useState('')
  const [saving,       setSaving]       = useState(false)

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    await onAdd({ title: title.trim(), content: content.trim(), project_label: projectLabel.trim() })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-5">Add Work Note</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note content…"
            rows={6}
            autoFocus
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <input
            type="text"
            value={projectLabel}
            onChange={(e) => setProjectLabel(e.target.value)}
            placeholder="Project label (e.g. Q2 Planning, Onboarding, Team Restructure)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save Note'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Work Note Card ────────────────────────────────────────────

function WorkNoteCard({ note, onUpdate, onDelete }) {
  const [editing,  setEditing]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [title,    setTitle]    = useState(note.title    ?? '')
  const [content,  setContent]  = useState(note.content  ?? '')
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(note.id, { title: title.trim() || null, content })
    setSaving(false)
    setEditing(false)
  }

  const handleCancel = () => {
    setTitle(note.title    ?? '')
    setContent(note.content ?? '')
    setEditing(false)
  }

  const isLong         = (note.content?.length ?? 0) > 200
  const displayContent = expanded || editing ? note.content : note.content?.slice(0, 200)

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      {editing ? (
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
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
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
        <>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              {note.title && (
                <p className="text-sm font-semibold text-gray-200 truncate mb-0.5">{note.title}</p>
              )}
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
              {isLong && !expanded && '…'}
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

          <p className="text-xs text-gray-700 mt-3">{timeAgo(note.created_at)}</p>
        </>
      )}
    </div>
  )
}

// ── Main WorkNotesSection ─────────────────────────────────────

export default function WorkNotesSection({ notes, onAdd, onUpdate, onDelete }) {
  const [search,    setSearch]    = useState('')
  const [showModal, setShowModal] = useState(false)

  // Filter by search query
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return notes
    return notes.filter(
      (n) =>
        n.content?.toLowerCase().includes(q) ||
        n.title?.toLowerCase().includes(q) ||
        n.project_label?.toLowerCase().includes(q)
    )
  }, [notes, search])

  // Group by project label (null/empty → "General")
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach((n) => {
      const label = n.project_label || 'General'
      if (!groups[label]) groups[label] = []
      groups[label].push(n)
    })
    // Sort: named labels first (alphabetical), General last
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'General') return 1
      if (b === 'General') return -1
      return a.localeCompare(b)
    })
  }, [filtered])

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Work Notes
          {notes.length > 0 && <span className="ml-1.5 text-gray-700">({notes.length})</span>}
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Work Note
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 mb-5 focus-within:border-indigo-500 transition-colors">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-600 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search work notes…"
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grouped notes */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-600 text-sm">
          <p>No work notes yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            Add your first work note →
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-8">No notes matching "{search}"</p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([label, labelNotes]) => (
            <div key={label}>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 px-0.5">
                {label}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {labelNotes.map((note) => (
                  <WorkNoteCard
                    key={note.id}
                    note={note}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddWorkNoteModal onAdd={onAdd} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
