const MOOD_DOT = {
  great: 'bg-green-500',
  good:  'bg-teal-500',
  okay:  'bg-amber-500',
  bad:   'bg-orange-500',
  awful: 'bg-red-500',
}

const MOOD_EMOJI = {
  great: '😄',
  good:  '😊',
  okay:  '😐',
  bad:   '😕',
  awful: '😔',
}

const MOOD_CELL = {
  great: 'bg-green-900/60 border-green-700 text-green-200 hover:bg-green-900',
  good:  'bg-teal-900/60 border-teal-700 text-teal-200 hover:bg-teal-900',
  okay:  'bg-amber-900/60 border-amber-700 text-amber-200 hover:bg-amber-900',
  bad:   'bg-orange-900/60 border-orange-700 text-orange-200 hover:bg-orange-900',
  awful: 'bg-red-900/60 border-red-700 text-red-200 hover:bg-red-900',
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function JournalCalendar({ days, entryMap, today, selectedDate, onSelectDate }) {
  // Pad so the first day aligns to the correct weekday column (Mon=0)
  const firstDayJs = new Date(days[0] + 'T12:00:00').getDay() // 0=Sun
  const padCount   = firstDayJs === 0 ? 6 : firstDayJs - 1

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-600 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells */}
        {Array.from({ length: padCount }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {days.map((date) => {
          const entry   = entryMap[date]
          const isToday = date === today
          const isSel   = date === selectedDate
          const dayNum  = new Date(date + 'T12:00:00').getDate()

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              title={entry ? `${MOOD_EMOJI[entry.mood] ?? ''} ${date}` : date}
              className={`
                aspect-square rounded-lg border text-xs flex flex-col items-center justify-center gap-0.5 transition-all
                ${isSel ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-gray-900' : ''}
                ${entry
                  ? (MOOD_CELL[entry.mood] ?? 'bg-indigo-900/60 border-indigo-700 text-indigo-200 hover:bg-indigo-900')
                  : isToday
                    ? 'border-gray-500 bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-800 bg-gray-800/30 text-gray-600 hover:bg-gray-800 hover:text-gray-400'
                }
              `}
            >
              {entry ? (
                <>
                  <span className="text-sm leading-none">{MOOD_EMOJI[entry.mood] ?? '✓'}</span>
                  <span className="text-[10px] leading-none opacity-70">{dayNum}</span>
                </>
              ) : (
                <span>{dayNum}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-500">
        {Object.entries(MOOD_EMOJI).map(([mood, emoji]) => (
          <span key={mood} className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-sm ${MOOD_DOT[mood]}`} />
            {emoji} {mood}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-800 border border-gray-700" />
          no entry
        </span>
      </div>
    </div>
  )
}
