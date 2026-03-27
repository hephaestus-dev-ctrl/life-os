import { useState } from 'react'
import { ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline'

const STATUS_BADGE = {
  library:      { label: 'My Library',   cls: 'text-teal-300 bg-teal-950' },
  want_to_read: { label: 'Want to Read', cls: 'text-gray-400 bg-gray-800' },
  reading:      { label: 'Reading',      cls: 'text-blue-300 bg-blue-950' },
  finished:     { label: 'Finished',     cls: 'text-emerald-300 bg-emerald-950' },
}

function RatingModal({ onConfirm, onCancel }) {
  const [rating, setRating] = useState(0)
  const [hover,  setHover]  = useState(0)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-100 mb-1">Mark as Finished</h3>
        <p className="text-sm text-gray-500 mb-4">How would you rate this book?</p>
        <div className="flex justify-center gap-1 mb-5">
          {Array.from({ length: 5 }).map((_, i) => {
            const val = i + 1
            const filled = val <= (hover || rating)
            return (
              <button
                key={i}
                onMouseEnter={() => setHover(val)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(val === rating ? 0 : val)}
                className={`text-3xl transition-colors ${filled ? 'text-amber-400' : 'text-gray-700 hover:text-amber-500'}`}
              >
                ★
              </button>
            )
          })}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm transition-colors hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(rating || null)}
            className="flex-1 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
          >
            Mark Finished
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BookCard({ book, onClick, onMove, onDelete }) {
  const badge = STATUS_BADGE[book.status] ?? STATUS_BADGE.want_to_read
  const [showRatingModal, setShowRatingModal] = useState(false)

  const handleConfirmFinished = (rating) => {
    setShowRatingModal(false)
    onMove('finished', rating)
  }

  return (
    <>
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-indigo-600 transition-colors group">
        {/* Main clickable area */}
        <div
          className="flex gap-3 p-4 cursor-pointer"
          onClick={onClick}
        >
          {/* Cover */}
          <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <span className="text-2xl">📚</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-100 line-clamp-2 text-sm">{book.title}</p>
            {book.author && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>
            )}
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
              {badge.label}
            </span>
            {book.status === 'finished' && book.rating && (
              <div className="flex gap-0.5 mt-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-xs ${i < book.rating ? 'text-amber-400' : 'text-gray-700'}`}>
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>

          <ChevronRightIcon className="w-4 h-4 text-gray-600 flex-shrink-0 self-center" />
        </div>

        {/* Action bar */}
        <div className="border-t border-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex gap-3">
            {book.status === 'finished' && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onClick() }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Write Review
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onClick() }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View Notes
                </button>
              </>
            )}
            {book.status === 'library' && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onMove('reading') }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Start Reading
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowRatingModal(true) }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Mark as Finished
                </button>
              </>
            )}
            {book.status === 'want_to_read' && (
              <button
                onClick={(e) => { e.stopPropagation(); onMove('reading') }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Start Reading
              </button>
            )}
            {book.status === 'reading' && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowRatingModal(true) }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Mark Finished
              </button>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          onConfirm={handleConfirmFinished}
          onCancel={() => setShowRatingModal(false)}
        />
      )}
    </>
  )
}
