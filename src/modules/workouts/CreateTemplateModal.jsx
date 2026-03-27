import { useState } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

// ── CSV parser ────────────────────────────────────────────────
function parseCSV(text, type) {
  const lines = text.trim().split('\n').filter((l) => l.trim())
  if (lines.length < 2) {
    return { exercises: [], error: 'Need a header row + at least one data row.' }
  }
  const raw = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''))

  if (type === 'cardio') {
    const activityIdx = raw.findIndex((h) => h.includes('activity'))
    const durationIdx = raw.findIndex((h) => h.includes('duration'))
    const distanceIdx = raw.findIndex((h) => h.includes('distance'))
    const notesIdx    = raw.findIndex((h) => h.includes('note'))
    if (activityIdx === -1) return { exercises: [], error: 'Could not find an Activity column.' }
    const exercises = lines.slice(1)
      .map((line) => {
        const cols = line.split(',').map((c) => c.trim().replace(/["']/g, ''))
        return {
          exercise_name:        cols[activityIdx] ?? '',
          activity_type:        cols[activityIdx] ?? '',
          target_duration_secs: durationIdx >= 0 && cols[durationIdx] ? Number(cols[durationIdx]) * 60 : null,
          target_distance:      distanceIdx >= 0 ? (cols[distanceIdx] || null) : null,
          target_pace:          notesIdx >= 0    ? (cols[notesIdx]    || null) : null,
        }
      })
      .filter((r) => r.activity_type)
    return { exercises, error: null }
  }

  if (type === 'flexibility') {
    const exIdx       = raw.findIndex((h) => h.includes('exercise') || h.includes('name'))
    const durationIdx = raw.findIndex((h) => h.includes('duration'))
    if (exIdx === -1) return { exercises: [], error: 'Could not find an Exercise column.' }
    const exercises = lines.slice(1)
      .map((line) => {
        const cols = line.split(',').map((c) => c.trim().replace(/["']/g, ''))
        return {
          exercise_name:        (cols[exIdx] ?? '').trim(),
          target_duration_secs: durationIdx >= 0 && cols[durationIdx] ? Number(cols[durationIdx]) : null,
        }
      })
      .filter((r) => r.exercise_name)
    return { exercises, error: null }
  }

  // tonal / swedish_ladder
  const exIdx    = raw.findIndex((h) => ['exercise', 'name', 'movement', 'exercise name'].some((k) => h.includes(k)))
  const setsIdx  = raw.findIndex((h) => h.includes('set'))
  const repsIdx  = raw.findIndex((h) => h.includes('rep'))
  const muscleIdx = raw.findIndex((h) => h.includes('muscle') || h.includes('group'))
  const skillIdx  = raw.findIndex((h) => h.includes('skill') || h.includes('level'))
  if (exIdx === -1) return { exercises: [], error: 'Could not find an Exercise/Name column.' }
  const exercises = lines
    .slice(1)
    .map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/["']/g, ''))
      const row = {
        exercise_name: cols[exIdx] ?? '',
        sets: setsIdx >= 0 ? parseInt(cols[setsIdx]) || null : null,
        reps: repsIdx >= 0 ? parseInt(cols[repsIdx]) || null : null,
      }
      if (type === 'tonal' && muscleIdx >= 0) row.muscle_group = cols[muscleIdx] || ''
      if (type === 'swedish_ladder' && skillIdx >= 0) row.skill_level = cols[skillIdx] || 'beginner'
      return row
    })
    .filter((r) => r.exercise_name)
  return { exercises, error: null }
}

// ── Empty row factories per type ──────────────────────────────
const EMPTY = {
  tonal: () => ({ exercise_name: '', muscle_group: '', sets: '', reps: '' }),
  swedish_ladder: () => ({ exercise_name: '', skill_level: 'beginner', sets: '', reps: '' }),
  cardio: () => ({ exercise_name: 'Running', activity_type: 'Running', target_distance: '', target_duration_secs: '', target_pace: '' }),
  flexibility: () => ({ exercise_name: '', target_duration_secs: '' }),
}

// ── Type config ───────────────────────────────────────────────
const TYPES = [
  {
    value: 'tonal',
    label: 'Tonal',
    desc: 'Cable machine strength training',
    active: 'bg-blue-950 border-blue-600 text-blue-300',
  },
  {
    value: 'swedish_ladder',
    label: 'Swedish Ladder',
    desc: 'Calisthenics bodyweight progression',
    active: 'bg-purple-950 border-purple-600 text-purple-300',
  },
  {
    value: 'cardio',
    label: 'Cardio',
    desc: 'Running, cycling, rowing',
    active: 'bg-green-950 border-green-600 text-green-300',
  },
  {
    value: 'flexibility',
    label: 'Flexibility',
    desc: 'Stretching routines',
    active: 'bg-orange-950 border-orange-600 text-orange-300',
  },
]

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core']
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced']
const CARDIO_ACTIVITIES = ['Running', 'Cycling', 'Rowing']

// ── Exercise row editors ──────────────────────────────────────
const inp = 'bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 w-full'
const sel = inp + ' appearance-none'

function TonalRow({ row, i, update, remove, canRemove }) {
  return (
    <div className="grid grid-cols-[1fr_108px_48px_48px_32px] gap-2 items-center">
      <input
        value={row.exercise_name}
        onChange={(e) => update(i, 'exercise_name', e.target.value)}
        placeholder="Exercise name"
        className={inp}
      />
      <select
        value={row.muscle_group}
        onChange={(e) => update(i, 'muscle_group', e.target.value)}
        className={sel}
      >
        <option value="">Muscle…</option>
        {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
      </select>
      <input
        value={row.sets}
        onChange={(e) => update(i, 'sets', e.target.value)}
        placeholder="Sets"
        className={inp + ' text-center'}
      />
      <input
        value={row.reps}
        onChange={(e) => update(i, 'reps', e.target.value)}
        placeholder="Reps"
        className={inp + ' text-center'}
      />
      <button
        onClick={() => remove(i)}
        disabled={!canRemove}
        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

function LadderRow({ row, i, update, remove, canRemove }) {
  return (
    <div className="grid grid-cols-[1fr_120px_48px_48px_32px] gap-2 items-center">
      <input
        value={row.exercise_name}
        onChange={(e) => update(i, 'exercise_name', e.target.value)}
        placeholder="Exercise name"
        className={inp}
      />
      <select
        value={row.skill_level}
        onChange={(e) => update(i, 'skill_level', e.target.value)}
        className={sel}
      >
        {SKILL_LEVELS.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      <input
        value={row.sets}
        onChange={(e) => update(i, 'sets', e.target.value)}
        placeholder="Sets"
        className={inp + ' text-center'}
      />
      <input
        value={row.reps}
        onChange={(e) => update(i, 'reps', e.target.value)}
        placeholder="Reps"
        className={inp + ' text-center'}
      />
      <button
        onClick={() => remove(i)}
        disabled={!canRemove}
        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

function CardioRow({ row, i, update, remove, canRemove }) {
  return (
    <div className="grid grid-cols-[120px_80px_80px_1fr_32px] gap-2 items-center">
      <select
        value={row.activity_type}
        onChange={(e) => update(i, 'activity_type', e.target.value)}
        className={sel}
      >
        {CARDIO_ACTIVITIES.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <input
        value={row.target_distance}
        onChange={(e) => update(i, 'target_distance', e.target.value)}
        placeholder="Dist (km)"
        className={inp + ' text-center'}
      />
      <input
        value={row.target_duration_secs}
        onChange={(e) => update(i, 'target_duration_secs', e.target.value)}
        placeholder="Dur (min)"
        className={inp + ' text-center'}
        title="Enter duration in minutes"
      />
      <input
        value={row.target_pace}
        onChange={(e) => update(i, 'target_pace', e.target.value)}
        placeholder="Pace (e.g. 5:30/km)"
        className={inp}
      />
      <button
        onClick={() => remove(i)}
        disabled={!canRemove}
        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

function FlexRow({ row, i, update, remove, canRemove }) {
  return (
    <div className="grid grid-cols-[1fr_100px_32px] gap-2 items-center">
      <input
        value={row.exercise_name}
        onChange={(e) => update(i, 'exercise_name', e.target.value)}
        placeholder="Stretch / exercise name"
        className={inp}
      />
      <input
        value={row.target_duration_secs}
        onChange={(e) => update(i, 'target_duration_secs', e.target.value)}
        placeholder="Hold (sec)"
        className={inp + ' text-center'}
      />
      <button
        onClick={() => remove(i)}
        disabled={!canRemove}
        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────
export function CreateTemplateModal({ onClose, onSave }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [type, setType] = useState('tonal')
  const [inputMode, setInputMode] = useState('manual')
  const [csvText, setCsvText] = useState('')
  const [csvError, setCsvError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [rows, setRows] = useState([EMPTY.tonal()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const update = (i, field, val) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)))
  const addRow = () => setRows((prev) => [...prev, EMPTY[type]()])
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i))

  const handleParseCSV = () => {
    const result = parseCSV(csvText, type)
    setCsvError(result.error)
    setPreview(result.error ? null : result.exercises)
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Template name is required.'); return }

    let exercises
    if (inputMode === 'csv') {
      if (!preview?.length) { setError('Parse your CSV first — or switch to Manual Entry.'); return }
      exercises = preview
    } else {
      if (type === 'cardio') {
        exercises = rows
          .filter((r) => r.activity_type)
          .map((r) => ({
            exercise_name: r.activity_type,
            activity_type: r.activity_type,
            target_distance: r.target_distance || null,
            // convert minutes → seconds
            target_duration_secs: r.target_duration_secs ? Number(r.target_duration_secs) * 60 : null,
            target_pace: r.target_pace || null,
          }))
      } else if (type === 'flexibility') {
        exercises = rows
          .filter((r) => r.exercise_name.trim())
          .map((r) => ({
            exercise_name: r.exercise_name.trim(),
            target_duration_secs: r.target_duration_secs ? Number(r.target_duration_secs) : null,
          }))
      } else {
        exercises = rows
          .filter((r) => r.exercise_name.trim())
          .map((r) => ({
            exercise_name: r.exercise_name.trim(),
            sets: parseInt(r.sets) || null,
            reps: parseInt(r.reps) || null,
            muscle_group: r.muscle_group || null,
            skill_level: r.skill_level || null,
          }))
      }
      if (!exercises.length) { setError('Add at least one exercise.'); return }
    }

    setSaving(true)
    const { error: saveError } = await onSave({ name: name.trim(), type, exercises })
    setSaving(false)
    if (saveError) setError(saveError.message)
  }

  const showCSV = true

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">
            {step === 1 ? 'New Template' : name}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Template Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Full Body Push A"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {TYPES.map(({ value, label, desc, active }) => (
                    <button
                      key={value}
                      onClick={() => setType(value)}
                      className={`py-3 px-4 rounded-xl border-2 text-left transition-colors ${
                        type === value ? active : 'border-gray-700 text-gray-500 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs mt-0.5 opacity-70">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Input mode toggle — CSV only for tonal/swedish_ladder */}
              {showCSV && (
                <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                  {['manual', 'csv'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setInputMode(m)}
                      className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        inputMode === m ? 'bg-gray-700 text-gray-100' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {m === 'manual' ? 'Manual Entry' : 'Import CSV'}
                    </button>
                  ))}
                </div>
              )}

              {(inputMode === 'manual' || !showCSV) ? (
                <div className="space-y-2">
                  {/* Column headers */}
                  {type === 'tonal' && (
                    <div className="grid grid-cols-[1fr_108px_48px_48px_32px] gap-2 px-0.5">
                      <span className="text-xs text-gray-500 uppercase">Exercise</span>
                      <span className="text-xs text-gray-500 uppercase">Muscle</span>
                      <span className="text-xs text-gray-500 uppercase text-center">Sets</span>
                      <span className="text-xs text-gray-500 uppercase text-center">Reps</span>
                      <span />
                    </div>
                  )}
                  {type === 'swedish_ladder' && (
                    <div className="grid grid-cols-[1fr_120px_48px_48px_32px] gap-2 px-0.5">
                      <span className="text-xs text-gray-500 uppercase">Exercise</span>
                      <span className="text-xs text-gray-500 uppercase">Skill Level</span>
                      <span className="text-xs text-gray-500 uppercase text-center">Sets</span>
                      <span className="text-xs text-gray-500 uppercase text-center">Reps</span>
                      <span />
                    </div>
                  )}
                  {type === 'cardio' && (
                    <div className="grid grid-cols-[120px_80px_80px_1fr_32px] gap-2 px-0.5">
                      <span className="text-xs text-gray-500 uppercase">Activity</span>
                      <span className="text-xs text-gray-500 uppercase text-center">Dist (km)</span>
                      <span className="text-xs text-gray-500 uppercase text-center">Dur (min)</span>
                      <span className="text-xs text-gray-500 uppercase">Pace</span>
                      <span />
                    </div>
                  )}
                  {type === 'flexibility' && (
                    <div className="grid grid-cols-[1fr_100px_32px] gap-2 px-0.5">
                      <span className="text-xs text-gray-500 uppercase">Exercise</span>
                      <span className="text-xs text-gray-500 uppercase text-center">Hold (sec)</span>
                      <span />
                    </div>
                  )}

                  {rows.map((row, i) =>
                    type === 'tonal' ? (
                      <TonalRow key={i} row={row} i={i} update={update} remove={removeRow} canRemove={rows.length > 1} />
                    ) : type === 'swedish_ladder' ? (
                      <LadderRow key={i} row={row} i={i} update={update} remove={removeRow} canRemove={rows.length > 1} />
                    ) : type === 'cardio' ? (
                      <CardioRow key={i} row={row} i={i} update={(idx, field, val) => {
                        if (field === 'activity_type') {
                          setRows(prev => prev.map((r, ri) => ri === idx ? { ...r, activity_type: val, exercise_name: val } : r))
                        } else {
                          update(idx, field, val)
                        }
                      }} remove={removeRow} canRemove={rows.length > 1} />
                    ) : (
                      <FlexRow key={i} row={row} i={i} update={update} remove={removeRow} canRemove={rows.length > 1} />
                    )
                  )}

                  <button
                    onClick={addRow}
                    className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add {type === 'cardio' ? 'activity' : type === 'flexibility' ? 'stretch' : 'exercise'}
                  </button>
                </div>
              ) : (
                // CSV import
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    {type === 'tonal' && <>Columns: <span className="text-gray-300">Exercise, Muscle, Sets, Reps</span></>}
                    {type === 'swedish_ladder' && <>Columns: <span className="text-gray-300">Exercise, Sets, Reps, Skill Level</span></>}
                    {type === 'cardio' && <>Columns: <span className="text-gray-300">Activity, Duration (min), Distance, Notes</span></>}
                    {type === 'flexibility' && <>Columns: <span className="text-gray-300">Exercise, Duration (sec), Notes</span></>}
                    <br />Column names are detected automatically.
                  </p>
                  <textarea
                    value={csvText}
                    onChange={(e) => { setCsvText(e.target.value); setPreview(null); setCsvError(null) }}
                    rows={6}
                    placeholder={
                      type === 'tonal'
                        ? 'Exercise,Muscle,Sets,Reps\nChest Press,Chest,3,10\nRow,Back,3,12'
                        : type === 'swedish_ladder'
                        ? 'Exercise,Sets,Reps,Skill Level\nPull-up,3,8,intermediate\nDip,3,10,beginner'
                        : type === 'cardio'
                        ? 'Activity,Duration (min),Distance,Notes\nRunning,30,3.1,Easy pace recovery run\nCycling,45,12,Moderate effort'
                        : 'Exercise,Duration (sec),Notes\nHip Flexor Stretch,60,Hold each side\nHamstring Stretch,45,Slow and controlled'
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <button
                    onClick={handleParseCSV}
                    className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Parse CSV
                  </button>

                  {csvError && <p className="text-sm text-red-400">{csvError}</p>}

                  {preview && (
                    <div className="bg-gray-800 rounded-xl p-3 space-y-2">
                      <p className="text-xs text-green-400 font-medium">
                        {preview.length} {type === 'cardio' ? 'activities' : type === 'flexibility' ? 'exercises' : 'exercises'} parsed
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {preview.map((ex, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-200">{ex.exercise_name || ex.activity_type}</span>
                            <span className="text-gray-500">
                              {type === 'cardio' && (
                                <>
                                  {ex.target_duration_secs ? `${Math.round(ex.target_duration_secs / 60)} min` : '—'}
                                  {ex.target_distance ? ` · ${ex.target_distance}` : ''}
                                </>
                              )}
                              {type === 'flexibility' && (
                                <>{ex.target_duration_secs ? `${ex.target_duration_secs}s` : '—'}</>
                              )}
                              {(type === 'tonal' || type === 'swedish_ladder') && (
                                <>
                                  {ex.sets ?? '?'} × {ex.reps ?? '?'}
                                  {ex.muscle_group && ` · ${ex.muscle_group}`}
                                  {ex.skill_level && ` · ${ex.skill_level}`}
                                </>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-800 flex gap-3 justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button
              onClick={() => {
                if (!name.trim()) { setError('Name is required.'); return }
                setError(null)
                setRows([EMPTY[type]()])
                setInputMode('manual')
                setCsvText('')
                setPreview(null)
                setCsvError(null)
                setStep(2)
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Next: Add Exercises
            </button>
          ) : (
            <>
              <button
                onClick={() => { setStep(1); setError(null) }}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? 'Saving…' : 'Save Template'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
