import { useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'

// ── CSV helpers ───────────────────────────────────────────────

function toCSV(rows) {
  if (!rows?.length) return ''
  const headers = Object.keys(rows[0])
  const lines = rows.map((row) =>
    headers.map((h) => {
      const val = row[h] ?? ''
      const str = String(val).replace(/"/g, '""')
      return str.includes(',') || str.includes('\n') || str.includes('"')
        ? `"${str}"`
        : str
    }).join(',')
  )
  return [headers.join(','), ...lines].join('\n')
}

function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Export function ───────────────────────────────────────────

async function exportAllData(userId) {
  const [
    habitsRes,
    habitLogsRes,
    journalRes,
    todosRes,
    choresRes,
    choreLogsRes,
    notesRes,
    booksRes,
    bookNotesRes,
    workoutsRes,
    coursesRes,
    assignmentsRes,
    studyNotesRes,
    keyConceptsRes,
  ] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('habit_logs').select('*').eq('user_id', userId),
    supabase.from('journal_entries').select('*').eq('user_id', userId),
    supabase.from('todos').select('*').eq('user_id', userId),
    supabase.from('chores').select('*').eq('user_id', userId),
    supabase.from('chore_logs').select('*').eq('user_id', userId),
    supabase.from('notes').select('*').eq('user_id', userId),
    supabase.from('books').select('*').eq('user_id', userId),
    supabase.from('book_notes').select('*').eq('user_id', userId),
    supabase.from('workout_sessions').select('*').eq('user_id', userId),
    supabase.from('courses').select('*').eq('user_id', userId),
    supabase.from('assignments').select('*').eq('user_id', userId),
    supabase.from('study_notes').select('*').eq('user_id', userId),
    supabase.from('key_concepts').select('*').eq('user_id', userId),
  ])

  const files = [
    ['habits.csv',       habitsRes.data],
    ['habit_logs.csv',   habitLogsRes.data],
    ['journal.csv',      journalRes.data],
    ['todos.csv',        todosRes.data],
    ['chores.csv',       choresRes.data],
    ['chore_logs.csv',   choreLogsRes.data],
    ['notes.csv',        notesRes.data],
    ['books.csv',        booksRes.data],
    ['book_notes.csv',   bookNotesRes.data],
    ['workouts.csv',     workoutsRes.data],
    ['courses.csv',      coursesRes.data],
    ['assignments.csv',  assignmentsRes.data],
    ['study_notes.csv',  studyNotesRes.data],
    ['key_concepts.csv', keyConceptsRes.data],
  ]

  for (const [filename, data] of files) {
    downloadCSV(filename, toCSV(data))
    await new Promise((r) => setTimeout(r, 100))
  }

  return files.length
}

// ── Module badges ─────────────────────────────────────────────

const MODULES = [
  'Habits', 'Habit Logs', 'Journal', 'Todos',
  'Chores', 'Chore Logs', 'Notes', 'Books',
  'Book Notes', 'Workouts', 'Courses', 'Assignments',
  'Study Notes', 'Key Concepts',
]

// ── Component ─────────────────────────────────────────────────

export default function DataExport({ userId }) {
  const [loading,  setLoading]  = useState(false)
  const [fileCount, setCount]   = useState(null)

  async function handleExport() {
    if (!userId || loading) return
    setLoading(true)
    setCount(null)
    try {
      const n = await exportAllData(userId)
      setCount(n)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: '#1e2130',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <p className="text-sm font-semibold text-gray-300 mb-1">Export Your Data</p>
      <p className="text-xs text-gray-500 mb-4">
        Download all your Life OS data as CSV files — one file per module.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {MODULES.map((m) => (
          <span
            key={m}
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#242736', color: '#6b7280' }}
          >
            {m}
          </span>
        ))}
      </div>

      <button
        onClick={handleExport}
        disabled={loading || !userId}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        style={{ backgroundColor: '#6366f1', color: '#fff' }}
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        {loading ? 'Exporting…' : 'Export All Data'}
      </button>

      {fileCount !== null && !loading && (
        <p className="text-xs text-emerald-400 mt-3">
          {fileCount} files downloaded successfully
        </p>
      )}
    </div>
  )
}
