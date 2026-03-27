import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'

const TYPE_STYLE = {
  tonal: 'bg-blue-950 text-blue-300',
  swedish_ladder: 'bg-purple-950 text-purple-300',
}

const TYPE_LABEL = {
  tonal: 'Tonal',
  swedish_ladder: 'Swedish Ladder',
}

export function LogSession({ templates, logSession, onSaved }) {
  const [selectedId, setSelectedId] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [weights, setWeights] = useState({}) // exercise id → weight string
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const template = templates.find((t) => t.id === selectedId)
  const exercises = template
    ? [...(template.template_exercises ?? [])].sort((a, b) => a.order_index - b.order_index)
    : []

  const handleTemplateChange = (id) => {
    setSelectedId(id)
    setWeights({})
    setError(null)
  }

  const handleSave = async () => {
    if (!selectedId) { setError('Select a template first.'); return }
    setSaving(true)
    setError(null)

    const exData = exercises.map((ex) => ({
      exercise_name: ex.exercise_name,
      planned_sets: ex.sets,
      planned_reps: ex.reps,
      actual_weight_lbs:
        weights[ex.id] != null && weights[ex.id] !== '' ? weights[ex.id] : null,
    }))

    const { error: saveErr } = await logSession({
      templateId: selectedId,
      sessionDate,
      notes,
      exercises: exData,
    })

    setSaving(false)
    if (saveErr) { setError(saveErr.message); return }

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setSelectedId('')
      setNotes('')
      setWeights({})
      onSaved?.()
    }, 800)
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
        <p className="text-gray-500">No templates yet.</p>
        <p className="text-sm text-gray-600 mt-1">Create a template in the Templates tab first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Setup card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Session Setup
        </h2>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Template</label>
          <select
            value={selectedId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">— Select a template —</option>
            {['tonal', 'swedish_ladder'].map((type) => {
              const group = templates.filter((t) => t.type === type)
              if (!group.length) return null
              return (
                <optgroup key={type} label={TYPE_LABEL[type]}>
                  {group.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Date</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Session Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="How did it feel? Any adjustments?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>
      </div>

      {/* Exercise weight inputs */}
      {template && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[template.type]}`}>
              {TYPE_LABEL[template.type]}
            </span>
            <span className="font-medium text-gray-100">{template.name}</span>
          </div>

          {exercises.length === 0 ? (
            <p className="text-sm text-gray-500 italic p-5">This template has no exercises.</p>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_64px_64px_96px] gap-3 px-5 py-2 border-b border-gray-800">
                <span className="text-xs text-gray-500 uppercase">Exercise</span>
                <span className="text-xs text-gray-500 uppercase text-center">Sets</span>
                <span className="text-xs text-gray-500 uppercase text-center">Reps</span>
                <span className="text-xs text-gray-500 uppercase text-center">Weight (lbs)</span>
              </div>
              <div className="divide-y divide-gray-800">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="grid grid-cols-[1fr_64px_64px_96px] gap-3 items-center px-5 py-3"
                  >
                    <span className="text-sm text-gray-200">{ex.exercise_name}</span>
                    <span className="text-center text-sm text-gray-400">{ex.sets ?? '—'}</span>
                    <span className="text-center text-sm text-gray-400">{ex.reps ?? '—'}</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={weights[ex.id] ?? ''}
                      onChange={(e) =>
                        setWeights((prev) => ({ ...prev, [ex.id]: e.target.value }))
                      }
                      placeholder="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-100 text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || !selectedId || saved}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
          saved
            ? 'bg-green-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white'
        }`}
      >
        <CheckIcon className="w-5 h-5" />
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Session'}
      </button>
    </div>
  )
}
