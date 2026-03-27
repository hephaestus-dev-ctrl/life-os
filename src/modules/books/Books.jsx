import { useState } from 'react'
import { PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useBooks } from './useBooks'
import AddBookModal from './AddBookModal'
import BookCard from './BookCard'
import BookDetail from './BookDetail'

const SHELF_TABS = [
  { key: 'library',      label: 'My Library' },
  { key: 'reading',      label: 'Currently Reading' },
  { key: 'finished',     label: 'Finished' },
  { key: 'want_to_read', label: 'Want to Read' },
  { key: 'history',      label: 'History' },
]

// ── CSV helpers ───────────────────────────────────────────────

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase())
  const titleIdx  = headers.findIndex((h) => h === 'title')
  const authorIdx = headers.findIndex((h) => h === 'author')
  const blurbIdx  = headers.findIndex((h) => h === 'blurb')
  if (titleIdx === -1) return null
  return lines
    .slice(1)
    .map((line) => {
      const cols = parseCSVLine(line)
      return {
        title:  (cols[titleIdx]  ?? '').trim(),
        author: authorIdx >= 0 ? (cols[authorIdx] ?? '').trim() : '',
        blurb:  blurbIdx  >= 0 ? (cols[blurbIdx]  ?? '').trim() : '',
      }
    })
    .filter((r) => r.title)
}

// ── Library Import Modal ──────────────────────────────────────

function LibraryImportModal({ onImport, onClose }) {
  const [csv,        setCsv]        = useState('')
  const [preview,    setPreview]    = useState(null)
  const [selected,   setSelected]   = useState({})
  const [parseError, setParseError] = useState('')
  const [importing,  setImporting]  = useState(false)

  const handleParse = () => {
    if (!csv.trim()) return
    const result = parseCSV(csv)
    if (result === null) {
      setParseError('No "Title" column found. Make sure the first row contains column headers.')
      return
    }
    if (result.length === 0) {
      setParseError('No rows found after the header row.')
      return
    }
    setParseError('')
    setPreview(result)
    // Select all by default
    setSelected(Object.fromEntries(result.map((_, i) => [i, true])))
  }

  const handleImport = async () => {
    if (!preview) return
    setImporting(true)
    const toImport = preview.filter((_, i) => selected[i])
    await onImport(toImport)
    setImporting(false)
    onClose()
  }

  const selectedCount = preview ? Object.values(selected).filter(Boolean).length : 0
  const allSelected   = preview && preview.every((_, i) => selected[i])

  const toggleAll = () => {
    setSelected(Object.fromEntries(preview.map((_, i) => [i, !allSelected])))
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">Import Library from CSV</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Paste your CSV here. Expected columns: <span className="text-gray-400">Title, Author, Blurb</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* CSV textarea */}
          {!preview && (
            <>
              <textarea
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                placeholder={`Title,Author,Blurb\n"Atomic Habits","James Clear","How tiny changes produce remarkable results"\n"Deep Work","Cal Newport","Rules for focused success in a distracted world"`}
                rows={8}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 font-mono resize-none focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {parseError && (
                <p className="text-xs text-red-400">{parseError}</p>
              )}
              <button
                onClick={handleParse}
                disabled={!csv.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Parse CSV
              </button>
            </>
          )}

          {/* Preview table */}
          {preview && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">
                  {preview.length} book{preview.length !== 1 ? 's' : ''} found
                  {selectedCount !== preview.length && (
                    <span className="text-indigo-400"> · {selectedCount} selected</span>
                  )}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={toggleAll}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                  <button
                    onClick={() => { setPreview(null); setParseError('') }}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Edit CSV
                  </button>
                </div>
              </div>

              <div className="border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800/60">
                      <th className="w-8 px-3 py-2.5 text-left">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          className="rounded accent-indigo-500"
                        />
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase w-40">Author</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Blurb</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {preview.map((book, i) => (
                      <tr
                        key={i}
                        className={`cursor-pointer transition-colors ${selected[i] ? 'bg-gray-900' : 'bg-gray-900/40 opacity-50'}`}
                        onClick={() => setSelected((s) => ({ ...s, [i]: !s[i] }))}
                      >
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={!!selected[i]}
                            onChange={() => setSelected((s) => ({ ...s, [i]: !s[i] }))}
                            className="rounded accent-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-gray-200 font-medium">{book.title}</td>
                        <td className="px-3 py-2.5 text-gray-400 truncate max-w-[10rem]">{book.author || '—'}</td>
                        <td className="px-3 py-2.5 text-gray-500 text-xs line-clamp-2">{book.blurb || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 shrink-0 flex gap-3">
          {preview ? (
            <button
              onClick={handleImport}
              disabled={importing || selectedCount === 0}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {importing
                ? 'Importing…'
                : `Import ${selectedCount} Book${selectedCount !== 1 ? 's' : ''} to My Library`}
            </button>
          ) : (
            <div className="flex-1" />
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export default function Books() {
  const {
    books,
    loading,
    shelves,
    addBook,
    updateBook,
    deleteBook,
    addNote,
    deleteNote,
    getBookNotes,
  } = useBooks()

  const [tab,             setTab]             = useState('library')
  const [selectedBook,    setSelectedBook]    = useState(null)
  const [showAddModal,    setShowAddModal]    = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show book detail view
  if (selectedBook) {
    const book = books.find((b) => b.id === selectedBook)
    if (!book) {
      setSelectedBook(null)
      return null
    }
    return (
      <BookDetail
        book={book}
        notes={getBookNotes(book.id)}
        onBack={() => setSelectedBook(null)}
        onUpdate={updateBook}
        onDelete={deleteBook}
        onAddNote={addNote}
        onDeleteNote={deleteNote}
      />
    )
  }

  const handleMove = (book, status, rating = null) => {
    const updates = { status }
    if (status === 'reading' && !book.started_date) {
      updates.started_date = new Date().toISOString().slice(0, 10)
    }
    if (status === 'finished' && !book.finished_date) {
      updates.finished_date = new Date().toISOString().slice(0, 10)
    }
    if (rating !== null) updates.rating = rating
    updateBook(book.id, updates)
  }

  const handleImportLibrary = async (rows) => {
    for (const row of rows) {
      await addBook({
        title:     row.title,
        author:    row.author || null,
        status:    'library',
        cover_url: null,
        review:    row.blurb || null,
      })
    }
  }

  const currentShelf = tab === 'history' ? shelves.finished : (shelves[tab] ?? [])

  const EMPTY_MESSAGES = {
    library:      "Your physical library is empty. Add books you own or import from CSV.",
    reading:      "You're not reading anything right now.",
    finished:     'No finished books yet.',
    want_to_read: 'No books on your wishlist yet.',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Books</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {books.length} total · {shelves.finished.length} finished
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === 'library' && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Import Library
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Book
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
        {SHELF_TABS.map(({ key, label }) => {
          const count = key === 'history' ? shelves.finished.length : (shelves[key]?.length ?? 0)
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 min-w-max flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                tab === key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 ${
                  tab === key ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* History timeline */}
      {tab === 'history' && (
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            Reading History — {shelves.finished.length} {shelves.finished.length === 1 ? 'book' : 'books'} finished
          </h2>
          {shelves.finished.length === 0 ? (
            <p className="text-gray-600 text-center py-16">No finished books yet.</p>
          ) : (
            <div className="space-y-1">
              {shelves.finished.map((book, i) => (
                <div key={book.id} className="flex gap-4 items-start">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center pt-1 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    {i < shelves.finished.length - 1 && (
                      <div className="w-0.5 bg-gray-800 flex-1 mt-1 min-h-[2.5rem]" />
                    )}
                  </div>
                  {/* Book entry */}
                  <div
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-indigo-600 transition-colors mb-3"
                    onClick={() => setSelectedBook(book.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-100">{book.title}</p>
                        {book.author && (
                          <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
                        )}
                      </div>
                      {book.rating && (
                        <div className="flex gap-0.5 flex-shrink-0">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx} className={idx < book.rating ? 'text-amber-400' : 'text-gray-700'}>
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {book.finished_date && (
                      <p className="text-xs text-gray-600 mt-2">Finished {book.finished_date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shelf view */}
      {tab !== 'history' && (
        <>
          {currentShelf.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-sm">{EMPTY_MESSAGES[tab]}</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Add a book →
                </button>
                {tab === 'library' && (
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="text-teal-400 hover:text-teal-300 text-sm transition-colors"
                  >
                    Import CSV →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentShelf.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => setSelectedBook(book.id)}
                  onMove={(status, rating) => handleMove(book, status, rating)}
                  onDelete={() => deleteBook(book.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <AddBookModal
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            await addBook(data)
            setShowAddModal(false)
          }}
        />
      )}

      {showImportModal && (
        <LibraryImportModal
          onImport={handleImportLibrary}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  )
}
