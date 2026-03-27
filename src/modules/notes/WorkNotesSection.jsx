import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60)        return 'just now'
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Work Note Card ────────────────────────────────────────────

function WorkNoteCard({ note, onDelete, onOpen }) {
  const [expanded, setExpanded] = useState(false)

  const isLong         = (note.content?.length ?? 0) > 200
  const displayContent = expanded ? note.content : note.content?.slice(0, 200)

  return (
    <div
      className="bg-gray-950 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          {note.title && (
            <p className="text-sm font-semibold text-gray-200 truncate mb-0.5">{note.title}</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
          className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded shrink-0"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {note.content && (
        <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
          {displayContent}
          {isLong && !expanded && '…'}
        </p>
      )}

      {isLong && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
          className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      <p className="text-xs text-gray-700 mt-3">{timeAgo(note.created_at)}</p>
    </div>
  )
}

// ── Month helpers ─────────────────────────────────────────────

function buildMonthList(count = 24) {
  const now = new Date()
  const list = []
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    list.push({
      year:  d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    })
  }
  return list
}

const ALL_MONTHS = buildMonthList()

// ── Main WorkNotesSection ─────────────────────────────────────

export default function WorkNotesSection({ notes, onDelete }) {
  const navigate = useNavigate()
  const [search,       setSearch]       = useState('')
  const [archiveMode,  setArchiveMode]  = useState(false)
  const [archiveIdx,   setArchiveIdx]   = useState(1) // index into ALL_MONTHS; 0 = current

  const now          = new Date()
  const currentYear  = now.getFullYear()
  const currentMonth = now.getMonth()

  const activeYear  = archiveMode ? ALL_MONTHS[archiveIdx].year  : currentYear
  const activeMonth = archiveMode ? ALL_MONTHS[archiveIdx].month : currentMonth

  // Filter to active month
  const monthNotes = useMemo(() => {
    return notes.filter((n) => {
      const d = new Date(n.created_at)
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth
    })
  }, [notes, activeYear, activeMonth])

  // Apply search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return monthNotes
    return monthNotes.filter(
      (n) =>
        n.content?.toLowerCase().includes(q) ||
        n.title?.toLowerCase().includes(q) ||
        n.project_label?.toLowerCase().includes(q)
    )
  }, [monthNotes, search])

  // Group by project label
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach((n) => {
      const label = n.project_label || 'General'
      if (!groups[label]) groups[label] = []
      groups[label].push(n)
    })
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'General') return 1
      if (b === 'General') return -1
      return a.localeCompare(b)
    })
  }, [filtered])

  const monthLabel = ALL_MONTHS[archiveMode ? archiveIdx : 0].label

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Work Notes
          {notes.length > 0 && <span className="ml-1.5 text-gray-700">({notes.length})</span>}
        </h3>
        <button
          onClick={() => navigate('/notes/new?type=work')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Work Note
        </button>
      </div>

      {/* Month indicator */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-gray-500">
          {archiveMode ? (
            <>
              Showing <span className="text-gray-300">{monthLabel}</span>
            </>
          ) : (
            <>
              <span className="text-gray-300">{monthLabel}</span>
            </>
          )}
        </span>
        {archiveMode && (
          <button
            onClick={() => { setArchiveMode(false); setSearch('') }}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ← Back to current month
          </button>
        )}
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
            onClick={() => navigate('/notes/new?type=work')}
            className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            Add your first work note →
          </button>
        </div>
      ) : monthNotes.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-8">No notes in {monthLabel}.</p>
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
                    onDelete={onDelete}
                    onOpen={() => navigate(`/notes/edit/${note.id}?type=work`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archive link */}
      {!archiveMode && notes.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setArchiveMode(true)}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline underline-offset-2"
          >
            Archive
          </button>
        </div>
      )}

      {/* Month picker (archive mode) */}
      {archiveMode && (
        <div className="mt-5">
          <label className="block text-xs text-gray-500 mb-1.5">Browse a past month</label>
          <select
            value={archiveIdx}
            onChange={(e) => { setArchiveIdx(Number(e.target.value)); setSearch('') }}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {ALL_MONTHS.map((m, i) => (
              <option key={i} value={i}>
                {m.label}{i === 0 ? ' (current)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
