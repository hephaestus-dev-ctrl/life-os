import { useState } from 'react'
import { ProgressChart } from './ProgressChart'

export function ProgressTracker({ allExerciseNames, getExerciseProgress }) {
  const [selected, setSelected] = useState('')

  const data = selected ? getExerciseProgress(selected) : []

  return (
    <div className="space-y-5">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Select Exercise
        </h2>
        {allExerciseNames.length === 0 ? (
          <p className="text-sm text-gray-600">
            No exercises found. Create a template with exercises first.
          </p>
        ) : (
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">— Choose an exercise —</option>
            {allExerciseNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {selected && (
        data.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl text-gray-600">
            <p>
              No weight data logged for{' '}
              <span className="text-gray-400 font-medium">{selected}</span> yet.
            </p>
            <p className="text-sm mt-1">
              Log sessions with weights to see your progress chart here.
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-4">
              {selected} — Weight Over Time ({data.length} sessions)
            </h3>
            <ProgressChart data={data} />
          </div>
        )
      )}
    </div>
  )
}
