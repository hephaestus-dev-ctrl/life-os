export default function HeatmapCalendar({ habitId, logs, getLast30Days }) {
  const days = getLast30Days()

  return (
    <div className="mt-3 pb-1">
      <p className="text-[11px] text-gray-600 uppercase tracking-[0.04em] mb-2">Last 30 days</p>
      <div className="flex flex-wrap gap-1">
        {days.map((date) => {
          const done = logs.some(
            (l) => l.habit_id === habitId && l.completed_date === date
          )
          return (
            <div
              key={date}
              title={date}
              className={`w-4 h-4 rounded-sm transition-colors ${
                done ? 'bg-indigo-500' : 'bg-gray-800'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
