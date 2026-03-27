import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'

const MODULE_COLORS = {
  habits:   '#6366f1',
  journal:  '#f59e0b',
  notes:    '#60a5fa',
  books:    '#3b82f6',
  todos:    '#ef4444',
  workouts: '#10b981',
}

const SUGGESTIONS = [
  'What habits did I miss most this week?',
  'How has my mood been lately?',
  'What books have I finished?',
  'What todos are overdue?',
  'How many workouts did I do last month?',
]

export default function AISearch({ isOpen, onClose }) {
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)   // { response, results }
  const [error, setError]     = useState(null)
  const inputRef              = useRef(null)
  const navigate              = useNavigate()

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setResult(null)
      setError(null)
    } else {
      setQuery('')
    }
  }, [isOpen])

  async function handleSearch() {
    if (!query.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('ai-search', {
        body: { query: query.trim() },
      })
      if (fnErr) throw fnErr
      setResult(data)
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') onClose()
  }

  function navigate_and_close(deeplink) {
    navigate(deeplink)
    onClose()
  }

  // Group results by module
  const grouped = {}
  for (const r of result?.results ?? []) {
    if (!grouped[r.module]) grouped[r.module] = []
    grouped[r.module].push(r)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#1a1d27',
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: '75vh',
        }}
      >
        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your life data..."
            className="flex-1 bg-transparent text-gray-100 text-base placeholder-gray-600 outline-none"
          />
          <div className="flex items-center gap-2">
            {loading && (
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            )}
            {!loading && query.trim() && (
              <button
                onClick={handleSearch}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: '#6366f1', color: '#fff' }}
              >
                Search
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-600 hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Error state */}
          {error && (
            <div className="px-5 py-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="px-5 py-10 flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Searching your life data…</p>
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div className="px-5 py-5 space-y-6">
              {/* AI response */}
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                {result.response}
              </p>

              {/* Grouped result cards */}
              {Object.entries(grouped).length > 0 && (
                <div className="space-y-5">
                  {Object.entries(grouped).map(([module, items]) => (
                    <div key={module}>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2"
                        style={{ color: MODULE_COLORS[module] ?? '#6b7280' }}
                      >
                        {module}
                      </p>
                      <div className="space-y-1.5">
                        {items.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => navigate_and_close(item.deeplink || `/${module}`)}
                            className="w-full text-left px-4 py-3 rounded-xl transition-all hover:-translate-y-px"
                            style={{
                              backgroundColor: '#242736',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = (MODULE_COLORS[module] ?? '#6366f1') + '80'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                            }}
                          >
                            <p className="text-sm font-medium text-gray-200">{item.title}</p>
                            {item.date && (
                              <p className="text-xs text-gray-600 mt-0.5">{item.date}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state / suggestions */}
          {!loading && !result && !error && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-700 mb-5">
                Ask a question about your habits, journal, todos, workouts, books, or notes.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s)
                      setTimeout(() => inputRef.current?.focus(), 50)
                    }}
                    className="text-xs px-3 py-1.5 rounded-full text-gray-500 hover:text-gray-300 transition-colors"
                    style={{
                      backgroundColor: '#242736',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[11px] text-gray-700">
            <kbd className="font-mono">Esc</kbd> to close · <kbd className="font-mono">↵</kbd> to search
          </p>
          <p className="text-[11px] text-gray-700">Powered by Claude</p>
        </div>
      </div>
    </div>
  )
}
