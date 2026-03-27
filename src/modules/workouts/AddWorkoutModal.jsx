import { useState } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const TYPE_OPTIONS = [
  { value: 'tonal',          label: '💪 Tonal',          desc: 'Paste or import CSV data from Tonal' },
  { value: 'swedish_ladder', label: '🪜 Swedish Ladder',  desc: 'Manually log your ladder session' },
  { value: 'cardio',         label: '🏃 Cardio',          desc: 'Runs, cycling, rowing, etc.' },
  { value: 'other',          label: '🏋️ Other',            desc: 'Any other workout' },
]

const EMPTY_EXERCISE = { exercise_name: '', sets: '', reps: '', weight_lbs: '' }

export default function AddWorkoutModal({ onClose, onSave, parseTonalCSV }) {
  const today = new Date().toISOString().slice(0, 10)
  const [step, setStep] = useState('type')
  const [workoutType, setWorkoutType] = useState('')
  const [form, setForm] = useState({
    workout_date: today,
    title: '',
    duration_minutes: '',
    notes: '',
  })
  const [exercises, setExercises] = useState([{ ...EMPTY_EXERCISE }])
  const [csvText, setCsvText] = useState('')
  const [csvParsed, setCsvParsed] = useState([])
  const [csvError, setCsvError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleTypeSelect = (type) => {
    setWorkoutType(type)
    setStep('details')
  }

  const handleCSVParse = () => {
    const parsed = parseTonalCSV(csvText)
    if (parsed.length === 0) {
      setCsvError('Could not parse any exercises. Check that your CSV has a header row and exercise names.')
      return
    }
    setCsvParsed(parsed)
    setCsvError('')
  }

  const addRow = () => setExercises((prev) => [...prev, { ...EMPTY_EXERCISE }])

  const updateRow = (idx, field, value) =>
    setExercises((prev) => prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)))

  const removeRow = (idx) =>
    setExercises((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const workoutData = {
      workout_date:     form.workout_date,
      title:            form.title.trim() || null,
      workout_type:     workoutType,
      duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
      notes:            form.notes.trim() || null,
      source:           workoutType === 'tonal' && csvParsed.length > 0 ? 'import' : 'manual',
    }

    let exercisesData = []
    if (workoutType === 'tonal' && csvParsed.length > 0) {
      exercisesData = csvParsed.map((ex) => ({
        exercise_name: ex.exercise_name,
        sets:       ex.sets       ?? null,
        reps:       ex.reps       ?? null,
        weight_lbs: ex.weight_lbs ?? null,
        notes: null,
      }))
    } else {
      exercisesData = exercises
        .filter((ex) => ex.exercise_name.trim())
        .map((ex) => ({
          exercise_name: ex.exercise_name.trim(),
          sets:       ex.sets       ? parseInt(ex.sets)        : null,
          reps:       ex.reps       ? parseInt(ex.reps)        : null,
          weight_lbs: ex.weight_lbs ? parseFloat(ex.weight_lbs) : null,
          notes: null,
        }))
    }

    await onSave(workoutData, exercisesData)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">
            {step === 'type'
              ? 'Log Workout'
              : `Log ${TYPE_OPTIONS.find((t) => t.value === workoutType)?.label ?? 'Workout'}`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Type selection */}
        {step === 'type' && (
          <div className="p-6">
            <p className="text-sm text-gray-400 mb-4">What kind of workout?</p>
            <div className="grid grid-cols-2 gap-3">
              {TYPE_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => handleTypeSelect(value)}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-left hover:border-indigo-500 hover:bg-gray-750 transition-colors"
                >
                  <p className="font-medium text-gray-100 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details form */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <button
              type="button"
              onClick={() => { setStep('type'); setCsvParsed([]); setCsvError('') }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Change workout type
            </button>

            {/* Date & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date *</label>
                <input
                  type="date"
                  value={form.workout_date}
                  onChange={(e) => setForm((f) => ({ ...f, workout_date: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                  placeholder="45"
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Workout Title (optional)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Upper Body Push"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Session notes */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Session Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="How did it feel? Energy level, any PRs, notes…"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 resize-none transition-colors"
              />
            </div>

            {/* Tonal: CSV import section */}
            {workoutType === 'tonal' && (
              <div className="space-y-3">
                <label className="block text-sm text-gray-400">
                  Paste Tonal CSV Data
                  <span className="ml-1 text-xs text-gray-600">(header row required)</span>
                </label>
                <textarea
                  value={csvText}
                  onChange={(e) => { setCsvText(e.target.value); setCsvParsed([]); setCsvError('') }}
                  rows={5}
                  placeholder={"Exercise,Sets,Reps,Weight\nBench Press,3,8,120\nBicep Curl,3,10,30"}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                />
                {csvError && <p className="text-red-400 text-xs">{csvError}</p>}
                <button
                  type="button"
                  onClick={handleCSVParse}
                  disabled={!csvText.trim()}
                  className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors"
                >
                  Parse CSV →
                </button>
                {csvParsed.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-emerald-400 font-medium">{csvParsed.length} exercises parsed ✓</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {csvParsed.map((ex, i) => (
                        <div key={i} className="text-xs bg-gray-800 rounded px-3 py-1.5 flex justify-between">
                          <span className="text-gray-300">{ex.exercise_name}</span>
                          <span className="text-gray-500">
                            {[
                              ex.sets && ex.reps && `${ex.sets}×${ex.reps}`,
                              ex.weight_lbs && `${ex.weight_lbs} lbs`,
                            ].filter(Boolean).join(' · ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!csvParsed.length && (
                  <p className="text-xs text-gray-600">— or enter exercises manually below —</p>
                )}
              </div>
            )}

            {/* Manual exercise table (Swedish Ladder, Cardio, Other, or Tonal fallback) */}
            {(workoutType !== 'tonal' || csvParsed.length === 0) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Exercises</label>
                  <button
                    type="button"
                    onClick={addRow}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add row
                  </button>
                </div>

                {/* Swedish Ladder hint */}
                {workoutType === 'swedish_ladder' && (
                  <div className="mb-3 p-3 bg-purple-950/30 border border-purple-900/30 rounded-lg">
                    <p className="text-xs text-purple-300 leading-relaxed">
                      <strong>Swedish Ladder:</strong> Log each rung as a set (e.g. 1 rep, 2 reps, 3 reps…)
                      or summarize the whole session in one row.
                    </p>
                  </div>
                )}

                {/* Column headers */}
                <div className="grid grid-cols-12 gap-1 px-1 mb-1">
                  <p className="col-span-4 text-xs text-gray-600">Exercise</p>
                  <p className="col-span-2 text-xs text-gray-600">Sets</p>
                  <p className="col-span-2 text-xs text-gray-600">Reps</p>
                  <p className="col-span-3 text-xs text-gray-600">Weight (lbs)</p>
                  <p className="col-span-1" />
                </div>

                <div className="space-y-1.5">
                  {exercises.map((ex, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1 items-center">
                      <input
                        type="text"
                        value={ex.exercise_name}
                        onChange={(e) => updateRow(idx, 'exercise_name', e.target.value)}
                        placeholder="Exercise name"
                        className="col-span-4 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => updateRow(idx, 'sets', e.target.value)}
                        placeholder="3"
                        min="1"
                        className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <input
                        type="number"
                        value={ex.reps}
                        onChange={(e) => updateRow(idx, 'reps', e.target.value)}
                        placeholder="10"
                        min="1"
                        className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <input
                        type="number"
                        value={ex.weight_lbs}
                        onChange={(e) => updateRow(idx, 'weight_lbs', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.5"
                        className="col-span-3 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="col-span-1 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!form.workout_date || saving}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {saving ? 'Saving…' : 'Save Workout'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
