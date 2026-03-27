import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useWorkouts } from './useWorkouts'
import AddWorkoutModal from './AddWorkoutModal'
import WorkoutDetail from './WorkoutDetail'
import ProgressChart from './ProgressChart'

const TABS = [
  { key: 'history',  label: 'History' },
  { key: 'log',      label: 'Log Workout' },
  { key: 'progress', label: 'Progress' },
  { key: 'planner',  label: 'Planner' },
]

const TYPE_META = {
  tonal:          { label: 'Tonal',          badge: 'text-blue-300 bg-blue-950',     dot: 'bg-blue-400' },
  swedish_ladder: { label: 'Swedish Ladder',  badge: 'text-purple-300 bg-purple-950', dot: 'bg-purple-400' },
  cardio:         { label: 'Cardio',          badge: 'text-emerald-300 bg-emerald-950', dot: 'bg-emerald-400' },
  other:          { label: 'Other',           badge: 'text-gray-400 bg-gray-800',     dot: 'bg-gray-500' },
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const EMPTY_PLAN = DAYS.reduce((acc, d) => ({ ...acc, [d]: '' }), {})

export default function Workouts() {
  const {
    workouts,
    loading,
    addWorkout,
    deleteWorkout,
    addExercise,
    addExercisesBatch,
    deleteExercise,
    getWorkoutExercises,
    getExerciseHistory,
    allExerciseNames,
    parseTonalCSV,
  } = useWorkouts()

  const [tab, setTab]                   = useState('history')
  const [selectedWorkout, setSelected]  = useState(null)
  const [showAddModal, setShowModal]    = useState(false)
  const [selectedExercise, setExercise] = useState('')
  const [plan, setPlan]                 = useState(EMPTY_PLAN)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Drill into a workout
  if (selectedWorkout) {
    const workout = workouts.find((w) => w.id === selectedWorkout)
    if (!workout) { setSelected(null); return null }
    return (
      <WorkoutDetail
        workout={workout}
        exercises={getWorkoutExercises(workout.id)}
        onBack={() => setSelected(null)}
        onDelete={() => { deleteWorkout(workout.id); setSelected(null) }}
        onAddExercise={(data) => addExercise({ ...data, workout_id: workout.id })}
        onDeleteExercise={deleteExercise}
      />
    )
  }

  // Group history by date (already sorted desc from hook)
  const byDate = {}
  workouts.forEach((w) => {
    if (!byDate[w.workout_date]) byDate[w.workout_date] = []
    byDate[w.workout_date].push(w)
  })
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

  const tonalCount  = workouts.filter((w) => w.workout_type === 'tonal').length
  const ladderCount = workouts.filter((w) => w.workout_type === 'swedish_ladder').length

  const exerciseHistory = selectedExercise ? getExerciseHistory(selectedExercise) : []

  const handleSave = async (workoutData, exercisesData) => {
    const { data: workout, error } = await addWorkout(workoutData)
    if (!error && workout && exercisesData.length > 0) {
      await addExercisesBatch(exercisesData.map((ex) => ({ ...ex, workout_id: workout.id })))
    }
    setShowModal(false)
    setTab('history')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Workouts</h1>
          <p className="text-gray-500 text-sm mt-0.5">{workouts.length} sessions logged</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Log Workout
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-950/40 border border-blue-900/40 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-blue-300">{tonalCount}</p>
          <p className="text-xs text-blue-400 mt-0.5">Tonal</p>
        </div>
        <div className="bg-purple-950/40 border border-purple-900/40 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-purple-300">{ladderCount}</p>
          <p className="text-xs text-purple-400 mt-0.5">Swedish Ladder</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-gray-100">{workouts.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Sessions</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-gray-100">{allExerciseNames.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unique Exercises</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 min-w-max rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              tab === key
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── History ── */}
      {tab === 'history' && (
        <div>
          {sortedDates.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-sm">No workouts logged yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                Log your first workout →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    {date}
                  </p>
                  <div className="space-y-2">
                    {byDate[date].map((workout) => {
                      const meta = TYPE_META[workout.workout_type] ?? TYPE_META.other
                      const exCount = getWorkoutExercises(workout.id).length
                      return (
                        <div
                          key={workout.id}
                          onClick={() => setSelected(workout.id)}
                          className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-indigo-600 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-100 truncate">
                                  {workout.title || meta.label}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {workout.duration_minutes
                                    ? `${workout.duration_minutes} min · `
                                    : ''}
                                  {exCount} exercise{exCount !== 1 ? 's' : ''}
                                  {workout.source === 'import' ? ' · CSV' : ''}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${meta.badge}`}>
                              {meta.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Log Workout ── */}
      {tab === 'log' && (
        <div className="py-8">
          <p className="text-sm text-gray-400 text-center mb-6">Choose your workout type to get started:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* Tonal card */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-950/40 border border-blue-900/50 rounded-2xl p-6 text-left hover:border-blue-500 hover:bg-blue-950/60 transition-all"
            >
              <p className="text-3xl mb-3">💪</p>
              <p className="font-semibold text-blue-300">Tonal</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Paste or import CSV data from your Tonal workout. Sets, reps, and weight are parsed automatically.
              </p>
            </button>

            {/* Swedish Ladder card */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-950/40 border border-purple-900/50 rounded-2xl p-6 text-left hover:border-purple-500 hover:bg-purple-950/60 transition-all"
            >
              <p className="text-3xl mb-3">🪜</p>
              <p className="font-semibold text-purple-300">Swedish Ladder</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Manually log your ladder session. Enter each rung as a set or summarize the whole session.
              </p>
            </button>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Or log cardio / other workout →
            </button>
          </div>
        </div>
      )}

      {/* ── Progress ── */}
      {tab === 'progress' && (
        <div>
          <div className="mb-5">
            <label className="block text-sm text-gray-400 mb-2">Select Exercise</label>
            <select
              value={selectedExercise}
              onChange={(e) => setExercise(e.target.value)}
              className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">— choose an exercise —</option>
              {allExerciseNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {selectedExercise && exerciseHistory.length > 0 ? (
            <ProgressChart exerciseName={selectedExercise} history={exerciseHistory} />
          ) : selectedExercise ? (
            <p className="text-gray-600 text-center py-10 text-sm">
              No data yet for <strong className="text-gray-400">{selectedExercise}</strong>.
            </p>
          ) : (
            <p className="text-gray-600 text-center py-10 text-sm">
              Select an exercise above to see your weight / reps progress over time.
            </p>
          )}
        </div>
      )}

      {/* ── Planner ── */}
      {tab === 'planner' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-100">Weekly Workout Planner</h2>
            <button
              onClick={() => setPlan(EMPTY_PLAN)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
              >
                <p className="w-24 text-sm font-medium text-gray-400 flex-shrink-0">{day}</p>
                <input
                  type="text"
                  value={plan[day]}
                  onChange={(e) => setPlan((p) => ({ ...p, [day]: e.target.value }))}
                  placeholder="Rest day or workout type…"
                  className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-700 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-700 mt-4 text-center">
            Planner is session-only — it resets on page refresh. Use it to plan your upcoming week.
          </p>
        </div>
      )}

      {/* Add workout modal */}
      {showAddModal && (
        <AddWorkoutModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          parseTonalCSV={parseTonalCSV}
        />
      )}
    </div>
  )
}
