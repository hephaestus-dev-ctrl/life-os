import { useState } from 'react'
import { TrashIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const TYPE_STYLE = {
  tonal: 'bg-blue-950 text-blue-300',
  swedish_ladder: 'bg-purple-950 text-purple-300',
  cardio: 'bg-green-950 text-green-300',
  flexibility: 'bg-orange-950 text-orange-300',
}

function formatDateLong(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Session detail modal ──────────────────────────────────────
function SessionModal({ session, template, exercises, onClose }) {
  const type = template?.type ?? 'tonal'

  // For strength/ladder — show planned vs actual comparison
  const isStrengthLike = type === 'tonal' || type === 'swedish_ladder'
  const isCardio = type === 'cardio'
  const isFlexibility = type === 'flexibility'

  const differs = (a, b) => a != null && b != null && Number(a) !== Number(b)

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800 shrink-0">
          <div>
            <p className="text-sm text-gray-500">{formatDateLong(session.session_date)}</p>
            <h2 className="text-lg font-semibold text-gray-100 mt-0.5">
              {template?.name ?? 'Session'}
            </h2>
            {template && (
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${TYPE_STYLE[type] ?? 'bg-gray-800 text-gray-400'}`}>
                {template.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors shrink-0 mt-0.5"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {session.notes && (
            <p className="text-sm text-gray-400 italic bg-gray-800 rounded-xl px-4 py-3">
              {session.notes}
            </p>
          )}

          {exercises.length === 0 && (
            <p className="text-sm text-gray-600 italic">No exercises recorded for this session.</p>
          )}

          {/* Strength / Ladder table — Planned vs Actual */}
          {isStrengthLike && exercises.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="text-left pb-3">Exercise</th>
                  <th className="text-center pb-3 w-32">Planned</th>
                  <th className="text-center pb-3 w-32">Actual</th>
                  <th className="text-right pb-3 w-24">Weight (lbs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {exercises.map((ex) => {
                  const pSets = ex.planned_sets
                  const pReps = ex.planned_reps
                  const aSets = ex.actual_sets ?? ex.planned_sets
                  const aReps = ex.actual_reps ?? ex.planned_reps
                  const setSdiff = differs(aSets, pSets)
                  const repsDiff = differs(aReps, pReps)

                  return (
                    <tr key={ex.id}>
                      <td className="py-2.5 text-gray-200">{ex.exercise_name}</td>
                      <td className="py-2.5 text-center text-gray-500">
                        {pSets != null || pReps != null
                          ? `${pSets ?? '?'} × ${pReps ?? '?'}`
                          : '—'}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={setSdiff || repsDiff ? 'text-yellow-400 font-medium' : 'text-gray-300'}>
                          {aSets != null || aReps != null
                            ? `${aSets ?? '?'} × ${aReps ?? '?'}`
                            : '—'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium">
                        {ex.actual_weight_lbs != null
                          ? <span className="text-gray-100">{ex.actual_weight_lbs} lbs</span>
                          : <span className="text-gray-600">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {/* Cardio table */}
          {isCardio && exercises.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="text-left pb-3">Activity</th>
                  <th className="text-center pb-3 w-28">Distance</th>
                  <th className="text-center pb-3 w-28">Duration</th>
                  <th className="text-center pb-3 w-24">Pace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {exercises.map((ex) => (
                  <tr key={ex.id}>
                    <td className="py-2.5 text-gray-200">{ex.exercise_name}</td>
                    <td className="py-2.5 text-center text-gray-300">
                      {ex.actual_distance != null ? `${ex.actual_distance} km` : '—'}
                    </td>
                    <td className="py-2.5 text-center text-gray-300">
                      {ex.actual_duration_secs != null
                        ? `${Math.floor(ex.actual_duration_secs / 60)}m ${ex.actual_duration_secs % 60}s`
                        : '—'}
                    </td>
                    <td className="py-2.5 text-center text-gray-300">{ex.actual_pace ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Flexibility table */}
          {isFlexibility && exercises.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="text-left pb-3">Exercise</th>
                  <th className="text-center pb-3 w-32">Hold Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {exercises.map((ex) => (
                  <tr key={ex.id}>
                    <td className="py-2.5 text-gray-200">{ex.exercise_name}</td>
                    <td className="py-2.5 text-center text-gray-300">
                      {ex.actual_duration_secs != null ? `${ex.actual_duration_secs}s` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export function WorkoutHistory({ sessions, templates, getSessionExercises, deleteSession }) {
  const [openSession, setOpenSession] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this session?')) return
    setDeleting(id)
    await deleteSession(id)
    setDeleting(null)
  }

  const getTemplate = (templateId) => templates.find((t) => t.id === templateId)

  const openDetail = sessions.find((s) => s.id === openSession)
  const openTemplate = openDetail ? getTemplate(openDetail.template_id) : null
  const openExercises = openDetail ? getSessionExercises(openDetail.id) : []

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl text-gray-600">
        <p className="text-lg">No sessions logged yet.</p>
        <p className="text-sm mt-1">Log your first workout in the "Log Session" tab.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {sessions.map((session) => {
          const template = getTemplate(session.template_id)
          const isDeleting = deleting === session.id

          return (
            <div
              key={session.id}
              onClick={() => setOpenSession(session.id)}
              className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center gap-3 cursor-pointer hover:bg-gray-800/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <span className="text-gray-100 font-medium">
                  {formatDateLong(session.session_date)}
                </span>
                {template && (
                  <>
                    <span className="text-gray-600 mx-2">·</span>
                    <span className="text-gray-400">{template.name}</span>
                  </>
                )}
              </div>

              <button
                onClick={(e) => handleDelete(e, session.id)}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-950/30 disabled:opacity-40 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              >
                <TrashIcon className="w-4 h-4" />
              </button>

              <ChevronRightIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
            </div>
          )
        })}
      </div>

      {openDetail && (
        <SessionModal
          session={openDetail}
          template={openTemplate}
          exercises={openExercises}
          onClose={() => setOpenSession(null)}
        />
      )}
    </>
  )
}
