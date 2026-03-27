import { useState, useRef } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

function parseCSV(text) {
  const lines = text.trim().split('\n').filter((l) => l.trim())
  if (lines.length < 2) {
    return { exercises: [], error: 'Need a header row + at least one exercise row.' }
  }

  const raw = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''))
  const exerciseIdx = raw.findIndex((h) =>
    ['exercise', 'name', 'movement', 'exercise name', 'move'].some((k) => h.includes(k))
  )
  const setsIdx = raw.findIndex((h) => h.includes('set'))
  const repsIdx = raw.findIndex((h) => h.includes('rep'))

  if (exerciseIdx === -1) {
    return { exercises: [], error: 'Could not find an exercise/name column in the CSV.' }
  }

  const exercises = lines
    .slice(1)
    .map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/["']/g, ''))
      return {
        exercise_name: cols[exerciseIdx] ?? '',
        sets: setsIdx >= 0 ? parseInt(cols[setsIdx]) || null : null,
        reps: repsIdx >= 0 ? parseInt(cols[repsIdx]) || null : null,
      }
    })
    .filter((r) => r.exercise_name)

  return { exercises, error: null }
}

const emptyRow = () => ({ exercise_name: '', sets: '', reps: '' })

export function CreateTemplateModal({ onClose, onSave }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [type, setType] = useState('tonal')
  const [inputMode, setInputMode] = useState('manual')
  const [csvText, setCsvText] = useState('')
  const [csvError, setCsvError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [rows, setRows] = useState([emptyRow()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const handleParseCSV = () => {
    const result = parseCSV(csvText)
    setCsvError(result.error)
    setPreview(result.error ? null : result.exercises)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      setCsvText(text)
      const result = parseCSV(text)
      setCsvError(result.error)
      setPreview(result.error ? null : result.exercises)
    }
    reader.readAsText(file)
  }

  const updateRow = (i, field, val) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)))

  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!name.trim()) { setError('Template name is required.'); return }

    let exercises
    if (inputMode === 'csv') {
      if (!preview?.length) { setError('Parse your CSV first — or switch to Manual Entry.'); return }
      exercises = preview
    } else {
      exercises = rows
        .filter((r) => r.exercise_name.trim())
        .map((r) => ({
          exercise_name: r.exercise_name.trim(),
          sets: parseInt(r.sets) || null,
          reps: parseInt(r.reps) || null,
        }))
      if (!exercises.length) { setError('Add at least one exercise.'); return }
    }

    setSaving(true)
    const { error: saveError } = await onSave({ name: name.trim(), type, exercises })
    setSaving(false)
    if (saveError) setError(saveError.message)
  }

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
                <div className="flex gap-3">
                  {[
                    { value: 'tonal', label: 'Tonal', active: 'bg-blue-950 border-blue-600 text-blue-300' },
                    { value: 'swedish_ladder', label: 'Swedish Ladder', active: 'bg-purple-950 border-purple-600 text-purple-300' },
                  ].map(({ value, label, active }) => (
                    <button
                      key={value}
                      onClick={() => setType(value)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                        type === value ? active : 'border-gray-700 text-gray-500 hover:border-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Input mode toggle */}
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

              {inputMode === 'manual' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_56px_56px_36px] gap-2 px-1">
                    <span className="text-xs text-gray-500 uppercase">Exercise</span>
                    <span className="text-xs text-gray-500 uppercase text-center">Sets</span>
                    <span className="text-xs text-gray-500 uppercase text-center">Reps</span>
                    <span />
                  </div>
                  {rows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_56px_56px_36px] gap-2 items-center">
                      <input
                        value={row.exercise_name}
                        onChange={(e) => updateRow(i, 'exercise_name', e.target.value)}
                        placeholder="Exercise name"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        value={row.sets}
                        onChange={(e) => updateRow(i, 'sets', e.target.value)}
                        placeholder="3"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-100 text-center focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        value={row.reps}
                        onChange={(e) => updateRow(i, 'reps', e.target.value)}
                        placeholder="10"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-100 text-center focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => removeRow(i)}
                        disabled={rows.length === 1}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addRow}
                    className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add exercise
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Paste CSV with columns:{' '}
                    <span className="text-gray-300">Exercise, Sets, Reps</span>
                    <br />
                    Column names are detected automatically — order doesn't matter.
                  </p>
                  <textarea
                    value={csvText}
                    onChange={(e) => {
                      setCsvText(e.target.value)
                      setPreview(null)
                      setCsvError(null)
                    }}
                    rows={6}
                    placeholder={'Exercise,Sets,Reps\nChest Press,3,10\nRow,3,12\nShoulder Press,3,8'}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleParseCSV}
                      className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Parse CSV
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
                    >
                      Upload File
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {csvError && <p className="text-sm text-red-400">{csvError}</p>}

                  {preview && (
                    <div className="bg-gray-800 rounded-xl p-3 space-y-2">
                      <p className="text-xs text-green-400 font-medium">
                        {preview.length} exercises parsed — looks good!
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {preview.map((ex, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-200">{ex.exercise_name}</span>
                            <span className="text-gray-500">
                              {ex.sets ?? '?'} × {ex.reps ?? '?'}
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
                setStep(2)
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Next: Add Exercises
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Saving…' : 'Save Template'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
