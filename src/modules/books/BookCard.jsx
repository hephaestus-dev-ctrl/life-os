import { useState } from 'react'
import { ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline'

const STATUS_BADGE = {
  want_to_read: { label: 'Want to Read', cls: 'text-gray-400 bg-gray-800' },
  reading:      { label: 'Reading',       cls: 'text-blue-300 bg-blue-950' },
  finished:     { label: 'Finished',      cls: 'text-emerald-300 bg-emerald-950' },
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
    { status: 'reading',      label: 'Re-reading' },
    { status: 'want_to_read', label: 'Move to Wishlist' },
  ],
}

export default function BookCard({ book, onClick, onMove, onDelete }) {
  const badge = STATUS_BADGE[book.status] ?? STATUS_BADGE.want_to_read
  const moveOptions = MOVE_OPTIONS[book.status] ?? []

  return (
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
          {moveOptions.map(({ status, label }) => (
            <button
              key={status}
              onClick={(e) => { e.stopPropagation(); onMove(status) }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
