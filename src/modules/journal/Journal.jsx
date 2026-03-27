import { useState } from 'react'
import { CalendarDaysIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { useJournal } from './useJournal'
import JournalEntryForm from './JournalEntryForm'
import JournalCalendar from './JournalCalendar'

const MOOD_LABEL = {
  great: '😄 Great',
  good:  '😊 Good',
  okay:  '😐 Okay',
  bad:   '😕 Bad',
  awful: '😔 Awful',
}

export default function Journal() {
  const {
    entries, loading, today, getLast30Days,
    getEntryForDate, saveEntry, deleteEntry, moodTrend,
  } = useJournal()

  const [view,         setView]         = useState('today')   // 'today' | 'calendar'
  const [selectedDate, setSelectedDate] = useState(today)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const days     = getLast30Days()
  const entryMap = Object.fromEntries(entries.map((e) => [e.entry_date, e]))
  const trend    = moodTrend()
  const todayEntry = getEntryForDate(today)

  const handleSelectDate = (date) => {
    setSelectedDate(date)
    setView('today')
  }

  const viewEntry      = getEntryForDate(selectedDate)
  const isViewingToday = selectedDate === today

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Journal</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in the last 30 days
            {trend && (
              <span className="ml-2 text-gray-600">
                · Recent mood: {MOOD_LABEL[trend]}
              </span>
            )}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => { setView('today'); setSelectedDate(today) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === 'today'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <PencilSquareIcon className="w-4 h-4" />
            Today
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === 'calendar'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <CalendarDaysIcon className="w-4 h-4" />
            30 Days
          </button>
        </div>
      </div>

      {/* Today status banner */}
      {view === 'today' && isViewingToday && !todayEntry && (
        <div className="mb-4 px-4 py-3 bg-indigo-950/50 border border-indigo-800/60 rounded-xl text-sm text-indigo-300">
          No entry yet for today — fill in the form below to capture your day.
        </div>
      )}

      {/* Calendar view */}
      {view === 'calendar' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Past 30 Days — click a day to view or edit
          </p>
          <JournalCalendar
            days={days}
            entryMap={entryMap}
            today={today}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </div>
      )}

      {/* Entry form */}
      {view === 'today' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          {!isViewingToday && (
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-800">
              <button
                onClick={() => { setSelectedDate(today); setView('today') }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                ← Back to today
              </button>
            </div>
          )}
          <JournalEntryForm
            key={selectedDate}
            entry={viewEntry}
            date={selectedDate}
            isToday={isViewingToday}
            onSave={saveEntry}
            onDelete={deleteEntry}
          />
        </div>
      )}
    </div>
  )
}
