import { useState } from 'react'
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline'

const NOTE_TYPES = [
  { key: 'highlight',  label: 'Highlights',  color: 'text-amber-300',  bg: 'bg-amber-950/40 border-amber-800/40' },
  { key: 'note',       label: 'Notes',       color: 'text-blue-300',   bg: 'bg-blue-950/40 border-blue-800/40' },
  { key: 'discussion', label: 'Discussion',  color: 'text-purple-300', bg: 'bg-purple-950/40 border-purple-800/40' },
]

const STATUS_LABELS = {
  want_to_read: 'Want to Read',
  reading:      'Currently Reading',
  finished:     'Finished',
}

const MOVE_OPTIONS = {
  want_to_read: [
    { status: 'reading',   label: 'Start Reading' },
    { status: 'finished',  label: 'Mark Finished' },
  ],
  reading: [
    { status: 'want_to_read', label: 'Move to Wishlist' },
    { status: 'finished',     label: 'Mark Finished' },
  ],
  finished: [
    { status: 'reading', label: 'Re-reading' },
  ],
}

function StarRating({ rating, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const val = i + 1
        const filled = val <= (hover || rating || 0)
        return (
          <button
            key={i}
            onMouseEnter={() => setHover(val)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(val === rating ? null : val)}
            className={`text-2xl transition-colors ${filled ? 'text-amber-400' : 'text-gray-700 hover:text-amber-500'}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

export default function BookDetail({ book, notes, onBack, onUpdate, onDelete, onAddNote, onDeleteNote }) {
  const [noteTab, setNoteTab] = useState('highlight')
  const [noteInput, setNoteInput] = useState('')
  const [review, setReview] = useState(book.review ?? '')
  const [editingReview, setEditingReview] = useState(false)
  const [saving, setSaving] = useState(false)

  const filteredNotes = notes.filter((n) => n.note_type === noteTab)
  const moveOptions = MOVE_OPTIONS[book.status] ?? []

  const handleMove = (status) => {
    const updates = { status }
    if (status === 'reading' && !book.started_date) {
      updates.started_date = new Date().toISOString().slice(0, 10)
    }
    if (status === 'finished' && !book.finished_date) {
      updates.finished_date = new Date().toISOString().slice(0, 10)
    }
    onUpdate(book.id, updates)
  }

  const handleAddNote = async () => {
    const content = noteInput.trim()
    if (!content) return
    setSaving(true)
    await onAddNote({ book_id: book.id, content, note_type: noteTab })
    setNoteInput('')
    setSaving(false)
  }

  const handleSaveReview = async () => {
    await onUpdate(book.id, { review: review.trim() || null })
    setEditingReview(false)
  }

  const handleRating = (rating) => {
    onUpdate(book.id, { rating })
  }

  const handleDelete = () => {
    onDelete(book.id)
    onBack()
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors text-sm"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Books
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: book info & actions */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            {/* Cover */}
            <div className="w-32 h-44 mx-auto mb-4 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <span className="text-5xl">📚</span>
              )}
            </div>

            <h1 className="text-lg font-bold text-gray-100 text-center">{book.title}</h1>
            {book.author && (
              <p className="text-gray-400 text-center mt-1 text-sm">{book.author}</p>
            )}

            <div className="flex justify-center mt-3">
              <span className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                {STATUS_LABELS[book.status]}
              </span>
            </div>

            {/* Move shelf buttons */}
            {moveOptions.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                {moveOptions.map(({ status, label }) => (
                  <button
                    key={status}
                    onClick={() => handleMove(status)}
                    className="w-full text-sm py-2 rounded-lg border border-indigo-800 text-indigo-300 hover:bg-indigo-950 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Dates */}
            {(book.started_date || book.finished_date) && (
              <div className="mt-4 space-y-1 text-xs text-gray-500">
                {book.started_date && <p>Started: {book.started_date}</p>}
                {book.finished_date && <p>Finished: {book.finished_date}</p>}
              </div>
            )}

            {/* Star rating */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Rating</p>
              <StarRating rating={book.rating} onChange={handleRating} />
              {book.rating && (
                <p className="text-xs text-gray-600 mt-1">{book.rating} of 5 stars</p>
              )}
            </div>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="mt-6 w-full text-sm text-red-500 hover:text-red-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <TrashIcon className="w-4 h-4" />
              Delete Book
            </button>
          </div>
        </div>

        {/* Right column: review + notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-100">Review</h2>
              {!editingReview && (
                <button
                  onClick={() => setEditingReview(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {book.review ? 'Edit' : 'Write review'}
                </button>
              )}
            </div>

            {editingReview ? (
              <div className="space-y-3">
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={5}
                  placeholder="Write your thoughts about this book…"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setReview(book.review ?? ''); setEditingReview(false) }}
                    className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm transition-colors hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReview}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-sm leading-relaxed ${book.review ? 'text-gray-300' : 'text-gray-600'}`}>
                {book.review || 'No review yet. Click "Write review" to add one.'}
              </p>
            )}
          </div>

          {/* Annotations */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-100 mb-4">Annotations</h2>

            {/* Note type tabs */}
            <div className="flex gap-1 bg-gray-800/60 rounded-lg p-1 mb-4">
              {NOTE_TYPES.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setNoteTab(key)}
                  className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
                    noteTab === key
                      ? `bg-gray-700 ${color}`
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {label}
                  <span className="ml-1 text-xs opacity-60">
                    ({notes.filter((n) => n.note_type === key).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Add note input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote() }}
                placeholder={
                  noteTab === 'highlight'
                    ? 'Add a highlighted passage…'
                    : noteTab === 'note'
                    ? 'Add a note…'
                    : 'Add a discussion thought…'
                }
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={handleAddNote}
                disabled={!noteInput.trim() || saving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
              >
                Add
              </button>
            </div>

            {/* Notes list */}
            {filteredNotes.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">
                No {noteTab === 'highlight' ? 'highlights' : noteTab === 'note' ? 'notes' : 'discussion thoughts'} yet.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredNotes.map((note) => {
                  const type = NOTE_TYPES.find((t) => t.key === note.note_type)
                  return (
                    <div
                      key={note.id}
                      className={`flex items-start gap-3 border rounded-lg p-3 ${type?.bg}`}
                    >
                      <p className="flex-1 text-sm text-gray-200 leading-relaxed">{note.content}</p>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="flex-shrink-0 text-gray-600 hover:text-red-400 transition-colors mt-0.5"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
