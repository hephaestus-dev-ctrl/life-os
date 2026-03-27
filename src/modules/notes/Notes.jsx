import { useState, useMemo } from 'react'
import { PlusIcon, MagnifyingGlassIcon, BoltIcon } from '@heroicons/react/24/outline'
import { useNotes } from './useNotes'
import NoteCard from './NoteCard'
import OneOnOneSection from './OneOnOneSection'

const TABS = [
  { key: 'all',      label: 'All Notes' },
  { key: 'thoughts', label: 'Thoughts'  },
  { key: 'work',     label: 'Work'      },
  { key: '1on1',     label: '1-on-1'   },
]

// Quick thought: inline capture, no modal
function QuickThought({ onAdd }) {
  const [text,   setText]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const t = text.trim()
    if (!t) return
    setSaving(true)
    await onAdd({ content: t, category: 'thought' })
    setSaving(false)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="flex gap-2 mb-6">
      <div className="flex items-center gap-2 flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 focus-within:border-indigo-500 transition-colors">
        <BoltIcon className="w-4 h-4 text-purple-400 shrink-0" />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Quick thought… (Enter to save)"
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600 focus:outline-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={!text.trim() || saving}
        className="px-3 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
      >
        {saving ? '…' : <PlusIcon className="w-4 h-4" />}
      </button>
    </div>
  )
}

// Modal for adding a 1-on-1 question
function AddQuestionModal({ onAdd, onClose }) {
  const [question, setQuestion] = useState('')
  const [context,  setContext]  = useState('')
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    const q = question.trim()
    if (!q) return
    setSaving(true)
    await onAdd({ question: q, context: context.trim() })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-5">Add Question</h2>
        <div className="space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question or topic to raise in your 1-on-1…"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
            autoFocus
          />
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Context or background (optional)…"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!question.trim() || saving}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Adding…' : 'Add Question'}
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

// Modal for adding a full note (with title, category)
function AddNoteModal({ onAdd, onClose }) {
  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')
  const [category, setCategory] = useState('note')
  const [tags,     setTagsRaw]  = useState('')
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    const c = content.trim()
    if (!c) return
    setSaving(true)
    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean)
    await onAdd({ title: title.trim(), content: c, category, tags: parsedTags })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-5">New Note</h2>
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
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="note">Note</option>
              <option value="thought">Thought</option>
              <option value="work">Work</option>
            </select>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
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

export default function Notes() {
  const {
    notes, oneOnOneItems, loading,
    addNote, updateNote, deleteNote,
    addOneOnOne, toggleOneOnOne, deleteOneOnOne,
  } = useNotes()

  const [tab,      setTab]      = useState('all')
  const [search,   setSearch]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false)

  const pendingOneOnOne = oneOnOneItems.filter((i) => i.status === 'pending').length

  // Filter notes by tab
  const tabNotes = useMemo(() => {
    let list = notes
    if (tab === 'thoughts') list = notes.filter((n) => n.category === 'thought')
    if (tab === 'work')     list = notes.filter((n) => n.category === 'work')
    return list
  }, [notes, tab])

  // Apply search
  const visibleNotes = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return tabNotes
    return tabNotes.filter(
      (n) =>
        n.content?.toLowerCase().includes(q) ||
        n.title?.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }, [tabNotes, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Notes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            {pendingOneOnOne > 0 && (
              <span className="ml-2 text-amber-400">· {pendingOneOnOne} pending 1-on-1</span>
            )}
          </p>
        </div>
        {tab === '1on1' ? (
          <button
            onClick={() => setShowAddQuestionModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Question
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            New Note
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSearch('') }}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {label}
            {key === '1on1' && pendingOneOnOne > 0 && (
              <span className="ml-1.5 text-xs bg-amber-500 text-black rounded-full px-1.5 py-0.5 font-bold">
                {pendingOneOnOne}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 1-on-1 tab */}
      {tab === '1on1' ? (
        <OneOnOneSection
          items={oneOnOneItems}
          onToggle={toggleOneOnOne}
          onDelete={deleteOneOnOne}
        />
      ) : (
        <>
          {/* Quick thought capture — only on All & Thoughts tabs */}
          {(tab === 'all' || tab === 'thoughts') && (
            <QuickThought onAdd={addNote} />
          )}

          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 mb-5 focus-within:border-indigo-500 transition-colors">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-600 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
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

          {/* Notes list */}
          {visibleNotes.length > 0 ? (
            <div className="space-y-3">
              {visibleNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 text-gray-600">
              <p className="mb-2">
                {search ? `No notes matching "${search}"` : 'No notes here yet.'}
              </p>
              {!search && (
                <button
                  onClick={() => tab === 'thoughts' ? null : setShowModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  {tab === 'thoughts'
                    ? 'Use the quick capture above to save a thought'
                    : 'Add your first note →'}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {showModal && (
        <AddNoteModal onAdd={addNote} onClose={() => setShowModal(false)} />
      )}

      {showAddQuestionModal && (
        <AddQuestionModal onAdd={addOneOnOne} onClose={() => setShowAddQuestionModal(false)} />
      )}
    </div>
  )
}
