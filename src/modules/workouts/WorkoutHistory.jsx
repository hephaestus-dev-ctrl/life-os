import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline'

const TYPE_STYLE = {
  tonal: 'bg-blue-950 text-blue-300',
  swedish_ladder: 'bg-purple-950 text-purple-300',
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function WorkoutHistory({ sessions, templates, getSessionExercises, deleteSession }) {
  const [expanded, setExpanded] = useState({})
  const [deleting, setDeleting] = useState(null)

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleDelete = async (id) => {
    if (!confirm('Delete this session?')) return
    setDeleting(id)
    await deleteSession(id)
    setDeleting(null)
  }

  const getTemplate = (templateId) => templates.find((t) => t.id === templateId)

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl text-gray-600">
        <p className="text-lg">No sessions logged yet.</p>
        <p className="text-sm mt-1">Log your first workout in the "Log Session" tab.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const template = getTemplate(session.template_id)
        const exercises = getSessionExercises(session.id)
        const open = expanded[session.id]

        return (
          <div
            key={session.id}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
          >
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/40 transition-colors"
              onClick={() => toggle(session.id)}
            >
              {open ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-100">
                    {formatDate(session.session_date)}
                  </span>
                  {template && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLE[template.type] ?? 'bg-gray-800 text-gray-400'}`}
                    >
                      {template.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{exercises.length} exercises</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(session.id)
                }}
                disabled={deleting === session.id}
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 disabled:opacity-40 transition-colors shrink-0"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>

            {open && (
              <div className="border-t border-gray-800 px-4 py-3 space-y-3">
                {session.notes && (
                  <p className="text-sm text-gray-400 italic">{session.notes}</p>
                )}
                {exercises.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="text-left pb-2">Exercise</th>
                        <th className="text-center pb-2 w-14">Sets</th>
                        <th className="text-center pb-2 w-14">Reps</th>
                        <th className="text-right pb-2 w-24">Weight (lbs)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {exercises.map((ex) => (
                        <tr key={ex.id}>
                          <td className="py-1.5 text-gray-200">{ex.exercise_name}</td>
                          <td className="py-1.5 text-center text-gray-400">
                            {ex.planned_sets ?? '—'}
                          </td>
                          <td className="py-1.5 text-center text-gray-400">
                            {ex.planned_reps ?? '—'}
                          </td>
                          <td className="py-1.5 text-right font-medium">
                            {ex.actual_weight_lbs != null ? (
                              <span className="text-gray-100">{ex.actual_weight_lbs}</span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-600 italic">No exercises recorded.</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
