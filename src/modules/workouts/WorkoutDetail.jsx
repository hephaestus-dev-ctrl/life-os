import { useState } from 'react'
import { ArrowLeftIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

const TYPE_LABELS = {
  tonal:          { label: 'Tonal',          color: 'text-blue-300 bg-blue-950' },
  swedish_ladder: { label: 'Swedish Ladder',  color: 'text-purple-300 bg-purple-950' },
  cardio:         { label: 'Cardio',          color: 'text-emerald-300 bg-emerald-950' },
  other:          { label: 'Other',           color: 'text-gray-400 bg-gray-800' },
}

const EMPTY_EX = { exercise_name: '', sets: '', reps: '', weight_lbs: '' }

export default function WorkoutDetail({
  workout,
  exercises,
  onBack,
  onDelete,
  onAddExercise,
  onDeleteExercise,
}) {
  const [showForm, setShowForm] = useState(false)
  const [newEx, setNewEx] = useState({ ...EMPTY_EX })
  const [saving, setSaving] = useState(false)

  const type = TYPE_LABELS[workout.workout_type] ?? TYPE_LABELS.other

  const handleAdd = async () => {
    if (!newEx.exercise_name.trim()) return
    setSaving(true)
    await onAddExercise({
      exercise_name: newEx.exercise_name.trim(),
      sets:       newEx.sets       ? parseInt(newEx.sets)        : null,
      reps:       newEx.reps       ? parseInt(newEx.reps)        : null,
      weight_lbs: newEx.weight_lbs ? parseFloat(newEx.weight_lbs) : null,
      notes: null,
    })
    setNewEx({ ...EMPTY_EX })
    setSaving(false)
    setShowForm(false)
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors text-sm"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Workouts
      </button>

      {/* Workout header card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-100">
              {workout.title || type.label}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{workout.workout_date}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${type.color}`}>
                {type.label}
              </span>
              {workout.duration_minutes && (
                <span className="text-xs text-gray-500">{workout.duration_minutes} min</span>
              )}
              {workout.source === 'import' && (
                <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                  CSV import
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onDelete}
            className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        {workout.notes && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-xl">
            <p className="text-sm text-gray-400 leading-relaxed">{workout.notes}</p>
          </div>
        )}
      </div>

      {/* Exercises card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-100">
            Exercises
            <span className="ml-2 text-sm text-gray-500 font-normal">({exercises.length})</span>
          </h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Inline add form */}
        {showForm && (
          <div className="mb-5 p-4 bg-gray-800/60 rounded-xl space-y-3">
            <input
              type="text"
              value={newEx.exercise_name}
              onChange={(e) => setNewEx((f) => ({ ...f, exercise_name: e.target.value }))}
              placeholder="Exercise name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sets</label>
                <input
                  type="number"
                  value={newEx.sets}
                  onChange={(e) => setNewEx((f) => ({ ...f, sets: e.target.value }))}
                  placeholder="3"
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reps</label>
                <input
                  type="number"
                  value={newEx.reps}
                  onChange={(e) => setNewEx((f) => ({ ...f, reps: e.target.value }))}
                  placeholder="10"
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  value={newEx.weight_lbs}
                  onChange={(e) => setNewEx((f) => ({ ...f, weight_lbs: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setNewEx({ ...EMPTY_EX }) }}
                className="flex-1 py-1.5 rounded-lg border border-gray-700 text-gray-400 text-sm transition-colors hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newEx.exercise_name.trim() || saving}
                className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm transition-colors"
              >
                {saving ? 'Adding…' : 'Add Exercise'}
              </button>
            </div>
          </div>
        )}

        {exercises.length === 0 ? (
          <p className="text-gray-600 text-center py-10 text-sm">No exercises logged yet.</p>
        ) : (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-2 pb-2 border-b border-gray-800">
              <p className="col-span-5 text-xs text-gray-600">Exercise</p>
              <p className="col-span-2 text-xs text-gray-600 text-center">Sets</p>
              <p className="col-span-2 text-xs text-gray-600 text-center">Reps</p>
              <p className="col-span-2 text-xs text-gray-600 text-center">Weight</p>
              <p className="col-span-1" />
            </div>

            {/* Exercise rows */}
            <div className="divide-y divide-gray-800/50">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="grid grid-cols-12 gap-2 items-center px-2 py-2.5 hover:bg-gray-800/30 rounded-lg group"
                >
                  <p className="col-span-5 text-sm text-gray-200">{ex.exercise_name}</p>
                  <p className="col-span-2 text-sm text-gray-400 text-center">{ex.sets ?? '—'}</p>
                  <p className="col-span-2 text-sm text-gray-400 text-center">{ex.reps ?? '—'}</p>
                  <p className="col-span-2 text-sm text-gray-400 text-center">
                    {ex.weight_lbs != null ? `${ex.weight_lbs}` : '—'}
                  </p>
                  <button
                    onClick={() => onDeleteExercise(ex.id)}
                    className="col-span-1 flex items-center justify-center opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Volume summary */}
            {exercises.some((e) => e.weight_lbs) && (
              <div className="mt-4 pt-3 border-t border-gray-800 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-100">{exercises.length}</p>
                  <p className="text-xs text-gray-500">Exercises</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-100">
                    {exercises.reduce((s, e) => s + (e.sets || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500">Total Sets</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-indigo-300">
                    {exercises
                      .reduce((s, e) => s + ((e.sets || 0) * (e.reps || 0) * (e.weight_lbs || 0)), 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total Volume (lbs)</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
