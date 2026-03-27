import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useBooks } from './useBooks'
import AddBookModal from './AddBookModal'
import BookCard from './BookCard'
import BookDetail from './BookDetail'

const SHELF_TABS = [
  { key: 'reading',      label: 'Currently Reading' },
  { key: 'want_to_read', label: 'Want to Read' },
  { key: 'finished',     label: 'Finished' },
  { key: 'history',      label: 'History' },
]

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

  const [tab, setTab] = useState('reading')
  const [selectedBook, setSelectedBook] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

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

  const handleMove = (book, status) => {
    const updates = { status }
    if (status === 'reading' && !book.started_date) {
      updates.started_date = new Date().toISOString().slice(0, 10)
    }
    if (status === 'finished' && !book.finished_date) {
      updates.finished_date = new Date().toISOString().slice(0, 10)
    }
    updateBook(book.id, updates)
  }

  const currentShelf = tab === 'history' ? shelves.finished : (shelves[tab] ?? [])

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
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Book
        </button>
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
              <p className="text-gray-600 text-sm">
                {tab === 'want_to_read' && 'No books on your wishlist yet.'}
                {tab === 'reading' && "You're not reading anything right now."}
                {tab === 'finished' && 'No finished books yet.'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                Add a book →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentShelf.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => setSelectedBook(book.id)}
                  onMove={(status) => handleMove(book, status)}
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
    </div>
  )
}
