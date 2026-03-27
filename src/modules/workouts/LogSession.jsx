import { useState } from 'react'
import { CheckIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'

const TYPE_STYLE = {
  tonal: 'bg-blue-950 text-blue-300',
  swedish_ladder: 'bg-purple-950 text-purple-300',
  cardio: 'bg-green-950 text-green-300',
  flexibility: 'bg-orange-950 text-orange-300',
}

const TYPE_LABEL = {
  tonal: 'Tonal',
  swedish_ladder: 'Swedish Ladder',
  cardio: 'Cardio',
  flexibility: 'Flexibility',
}

const ALL_TYPES = ['tonal', 'swedish_ladder', 'cardio', 'flexibility']

// ── Quick Import Modal ─────────────────────────────────────────
function parseImportCSV(text) {
  const lines = text.trim().split('\n').filter((l) => l.trim())
  if (lines.length < 2) return { rows: [], error: 'Need a header row + at least one data row.' }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''))
  const exIdx = headers.findIndex((h) => ['exercise', 'name', 'movement'].some((k) => h.includes(k)))
  const setsIdx = headers.findIndex((h) => h.includes('set'))
  const repsIdx = headers.findIndex((h) => h.includes('rep'))
  const weightIdx = headers.findIndex((h) => h.includes('weight') || h.includes('lbs'))

  if (exIdx === -1) return { rows: [], error: 'Could not find an Exercise column.' }

  const rows = lines
    .slice(1)
    .map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/["']/g, ''))
      return {
        exercise_name: cols[exIdx] ?? '',
        actual_sets: setsIdx >= 0 ? (parseInt(cols[setsIdx]) || null) : null,
        actual_reps: repsIdx >= 0 ? (parseInt(cols[repsIdx]) || null) : null,
        actual_weight_lbs: weightIdx >= 0 ? (parseFloat(cols[weightIdx]) || null) : null,
      }
    })
    .filter((r) => r.exercise_name)

  if (!rows.length) return { rows: [], error: 'No valid rows found.' }
  return { rows, error: null }
}

function QuickImportModal({ templates, logSession, onClose, onSaved }) {
  const [selectedId, setSelectedId] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [csvText, setCsvText] = useState('')
  const [parsed, setParsed] = useState(null) // array of rows
  const [parseError, setParseError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const template = templates.find((t) => t.id === selectedId)
  const tmplExs = template
    ? [...(template.template_exercises ?? [])].sort((a, b) => a.order_index - b.order_index)
    : []

  const handleParse = () => {
    const result = parseImportCSV(csvText)
    setParseError(result.error)
    setParsed(result.error ? null : result.rows)
  }

  const updateParsedWeight = (i, val) =>
    setParsed((prev) => prev.map((r, idx) => (idx === i ? { ...r, actual_weight_lbs: val } : r)))

  const handleSave = async () => {
    if (!selectedId) { setSaveError('Select a template first.'); return }
    if (!parsed?.length) { setSaveError('Parse the CSV first.'); return }

    const exercises = parsed.map((row) => {
      const tmplEx = tmplExs.find(
        (te) => te.exercise_name.toLowerCase() === row.exercise_name.toLowerCase()
      )
      return {
        exercise_name: row.exercise_name,
        planned_sets: tmplEx?.sets ?? null,
        planned_reps: tmplEx?.reps ?? null,
        actual_sets: row.actual_sets,
        actual_reps: row.actual_reps,
        actual_weight_lbs:
          row.actual_weight_lbs != null && row.actual_weight_lbs !== ''
            ? Number(row.actual_weight_lbs)
            : null,
      }
    })

    setSaving(true)
    const { error } = await logSession({ templateId: selectedId, sessionDate, notes: '', exercises })
    setSaving(false)
    if (error) { setSaveError(error.message); return }
    onSaved?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">Quick Import Session</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Template + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Template</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="">— Select —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* CSV paste area */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Paste CSV{' '}
              <span className="text-gray-600">— Exercise, Sets, Reps, Weight (lbs)</span>
            </label>
            <textarea
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setParsed(null); setParseError(null) }}
              rows={5}
              placeholder={'Exercise,Sets,Reps,Weight\nChest Press,3,10,45\nRow,3,12,35'}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={handleParse}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors"
          >
            Parse CSV
          </button>

          {parseError && <p className="text-sm text-red-400">{parseError}</p>}

          {/* Preview table with editable weight */}
          {parsed && (
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_56px_56px_80px] gap-2 px-4 py-2 border-b border-gray-700">
                <span className="text-xs text-gray-500 uppercase">Exercise</span>
                <span className="text-xs text-gray-500 uppercase text-center">Sets</span>
                <span className="text-xs text-gray-500 uppercase text-center">Reps</span>
                <span className="text-xs text-gray-500 uppercase text-center">Wt (lbs)</span>
              </div>
              <div className="divide-y divide-gray-700">
                {parsed.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_56px_56px_80px] gap-2 items-center px-4 py-2">
                    <span className="text-sm text-gray-200">{row.exercise_name}</span>
                    <span className="text-sm text-gray-400 text-center">{row.actual_sets ?? '—'}</span>
                    <span className="text-sm text-gray-400 text-center">{row.actual_reps ?? '—'}</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={row.actual_weight_lbs ?? ''}
                      onChange={(e) => updateParsedWeight(i, e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm text-gray-100 text-center focus:outline-none focus:border-indigo-500 w-full"
                    />
                  </div>
                ))}
              </div>
              <p className="px-4 py-2 text-xs text-green-400">{parsed.length} exercises ready to save</p>
            </div>
          )}

          {saveError && <p className="text-sm text-red-400">{saveError}</p>}
        </div>

        <div className="p-5 border-t border-gray-800 flex gap-3 justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !parsed?.length || !selectedId}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? 'Saving…' : 'Save Session'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Exercise rows by template type ────────────────────────────
const cellInp = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-100 text-center focus:outline-none focus:border-indigo-500'

function TonalExRow({ ex, v, update }) {
  return (
    <div className="grid grid-cols-[1fr_72px_72px_96px] gap-3 items-center px-5 py-3">
      <span className="text-sm text-gray-200">{ex.exercise_name}</span>
      <input type="number" min="1" value={v.sets ?? ''} onChange={(e) => update('sets', e.target.value)} className={cellInp} placeholder={ex.sets ?? '—'} />
      <input type="number" min="1" value={v.reps ?? ''} onChange={(e) => update('reps', e.target.value)} className={cellInp} placeholder={ex.reps ?? '—'} />
      <input type="number" step="0.5" min="0" value={v.weight ?? ''} onChange={(e) => update('weight', e.target.value)} className={cellInp} placeholder="0" />
    </div>
  )
}

function LadderExRow({ ex, v, update }) {
  return (
    <div className="grid grid-cols-[1fr_120px_72px_72px] gap-3 items-center px-5 py-3">
      <span className="text-sm text-gray-200">{ex.exercise_name}</span>
      <select
        value={v.skill_level ?? 'beginner'}
        onChange={(e) => update('skill_level', e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 w-full"
      >
        {['beginner', 'intermediate', 'advanced'].map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      <input type="number" min="1" value={v.sets ?? ''} onChange={(e) => update('sets', e.target.value)} className={cellInp} placeholder={ex.sets ?? '—'} />
      <input type="number" min="1" value={v.reps ?? ''} onChange={(e) => update('reps', e.target.value)} className={cellInp} placeholder={ex.reps ?? '—'} />
    </div>
  )
}

function CardioExRow({ ex, v, update }) {
  return (
    <div className="grid grid-cols-[1fr_88px_88px_88px] gap-3 items-center px-5 py-3">
      <span className="text-sm text-gray-200">{ex.exercise_name}</span>
      <input
        type="number" step="0.1" min="0"
        value={v.distance ?? ''}
        onChange={(e) => update('distance', e.target.value)}
        className={cellInp}
        placeholder={ex.target_distance != null ? `${ex.target_distance}` : 'km'}
      />
      <input
        type="number" min="0"
        value={v.duration ?? ''}
        onChange={(e) => update('duration', e.target.value)}
        className={cellInp}
        placeholder={ex.target_duration_secs != null ? `${Math.round(ex.target_duration_secs / 60)}` : 'min'}
      />
      <input
        type="text"
        value={v.pace ?? ''}
        onChange={(e) => update('pace', e.target.value)}
        className={cellInp}
        placeholder={ex.target_pace ?? '5:30/km'}
      />
    </div>
  )
}

function FlexExRow({ ex, v, update }) {
  return (
    <div className="grid grid-cols-[1fr_120px] gap-3 items-center px-5 py-3">
      <span className="text-sm text-gray-200">{ex.exercise_name}</span>
      <input
        type="number" min="0"
        value={v.duration ?? ''}
        onChange={(e) => update('duration', e.target.value)}
        className={cellInp}
        placeholder={ex.target_duration_secs != null ? `${ex.target_duration_secs}` : 'sec'}
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export function LogSession({ templates, logSession, onSaved }) {
  const [selectedId, setSelectedId] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [values, setValues] = useState({}) // ex.id → { sets, reps, weight, skill_level, distance, duration, pace }
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [showImport, setShowImport] = useState(false)

  const template = templates.find((t) => t.id === selectedId)
  const exercises = template
    ? [...(template.template_exercises ?? [])].sort((a, b) => a.order_index - b.order_index)
    : []

  const handleTemplateChange = (id) => {
    setSelectedId(id)
    setError(null)
    const tmpl = templates.find((t) => t.id === id)
    const exs = tmpl
      ? [...(tmpl.template_exercises ?? [])].sort((a, b) => a.order_index - b.order_index)
      : []
    const init = {}
    exs.forEach((ex) => {
      init[ex.id] = {
        sets: ex.sets?.toString() ?? '',
        reps: ex.reps?.toString() ?? '',
        weight: '',
        skill_level: ex.skill_level ?? 'beginner',
        distance: ex.target_distance?.toString() ?? '',
        duration: ex.target_duration_secs != null
          ? (tmpl.type === 'flexibility' ? ex.target_duration_secs.toString() : Math.round(ex.target_duration_secs / 60).toString())
          : '',
        pace: ex.target_pace ?? '',
      }
    })
    setValues(init)
  }

  const updateValue = (exId, field, val) =>
    setValues((prev) => ({ ...prev, [exId]: { ...(prev[exId] || {}), [field]: val } }))

  const handleSave = async () => {
    if (!selectedId) { setError('Select a template first.'); return }
    setSaving(true)
    setError(null)

    const exData = exercises.map((ex) => {
      const v = values[ex.id] || {}
      if (template.type === 'tonal') {
        return {
          exercise_name: ex.exercise_name,
          planned_sets: ex.sets,
          planned_reps: ex.reps,
          actual_sets: v.sets !== '' ? v.sets : (ex.sets ?? null),
          actual_reps: v.reps !== '' ? v.reps : (ex.reps ?? null),
          actual_weight_lbs: v.weight !== '' ? v.weight : null,
        }
      }
      if (template.type === 'swedish_ladder') {
        return {
          exercise_name: ex.exercise_name,
          planned_sets: ex.sets,
          planned_reps: ex.reps,
          actual_sets: v.sets !== '' ? v.sets : (ex.sets ?? null),
          actual_reps: v.reps !== '' ? v.reps : (ex.reps ?? null),
          notes: v.skill_level ? `skill_level:${v.skill_level}` : null,
        }
      }
      if (template.type === 'cardio') {
        return {
          exercise_name: ex.exercise_name,
          planned_sets: null,
          planned_reps: null,
          actual_distance: v.distance !== '' ? v.distance : null,
          actual_duration_secs: v.duration !== '' ? Number(v.duration) * 60 : null,
          actual_pace: v.pace || null,
        }
      }
      if (template.type === 'flexibility') {
        return {
          exercise_name: ex.exercise_name,
          planned_sets: null,
          planned_reps: null,
          actual_duration_secs: v.duration !== '' ? Number(v.duration) : null,
        }
      }
      return { exercise_name: ex.exercise_name }
    })

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
      setValues({})
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
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Session Setup</h2>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Quick Import
          </button>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Template</label>
          <select
            value={selectedId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">— Select a template —</option>
            {ALL_TYPES.map((type) => {
              const group = templates.filter((t) => t.type === type)
              if (!group.length) return null
              return (
                <optgroup key={type} label={TYPE_LABEL[type]}>
                  {group.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
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

      {/* Exercise entry — type-specific */}
      {template && exercises.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[template.type]}`}>
              {TYPE_LABEL[template.type]}
            </span>
            <span className="font-medium text-gray-100">{template.name}</span>
            <span className="text-xs text-gray-600 ml-auto">Fields pre-filled from template — edit before saving</span>
          </div>

          {/* Column headers */}
          {template.type === 'tonal' && (
            <div className="grid grid-cols-[1fr_72px_72px_96px] gap-3 px-5 py-2 border-b border-gray-800">
              <span className="text-xs text-gray-500 uppercase">Exercise</span>
              <span className="text-xs text-gray-500 uppercase text-center">Sets</span>
              <span className="text-xs text-gray-500 uppercase text-center">Reps</span>
              <span className="text-xs text-gray-500 uppercase text-center">Weight (lbs)</span>
            </div>
          )}
          {template.type === 'swedish_ladder' && (
            <div className="grid grid-cols-[1fr_120px_72px_72px] gap-3 px-5 py-2 border-b border-gray-800">
              <span className="text-xs text-gray-500 uppercase">Exercise</span>
              <span className="text-xs text-gray-500 uppercase">Skill Level</span>
              <span className="text-xs text-gray-500 uppercase text-center">Sets</span>
              <span className="text-xs text-gray-500 uppercase text-center">Reps</span>
            </div>
          )}
          {template.type === 'cardio' && (
            <div className="grid grid-cols-[1fr_88px_88px_88px] gap-3 px-5 py-2 border-b border-gray-800">
              <span className="text-xs text-gray-500 uppercase">Activity</span>
              <span className="text-xs text-gray-500 uppercase text-center">Dist (km)</span>
              <span className="text-xs text-gray-500 uppercase text-center">Dur (min)</span>
              <span className="text-xs text-gray-500 uppercase text-center">Pace</span>
            </div>
          )}
          {template.type === 'flexibility' && (
            <div className="grid grid-cols-[1fr_120px] gap-3 px-5 py-2 border-b border-gray-800">
              <span className="text-xs text-gray-500 uppercase">Exercise</span>
              <span className="text-xs text-gray-500 uppercase text-center">Hold (sec)</span>
            </div>
          )}

          <div className="divide-y divide-gray-800">
            {exercises.map((ex) => {
              const v = values[ex.id] || {}
              const upd = (field, val) => updateValue(ex.id, field, val)
              if (template.type === 'tonal') return <TonalExRow key={ex.id} ex={ex} v={v} update={upd} />
              if (template.type === 'swedish_ladder') return <LadderExRow key={ex.id} ex={ex} v={v} update={upd} />
              if (template.type === 'cardio') return <CardioExRow key={ex.id} ex={ex} v={v} update={upd} />
              if (template.type === 'flexibility') return <FlexExRow key={ex.id} ex={ex} v={v} update={upd} />
              return null
            })}
          </div>
        </div>
      )}

      {template && exercises.length === 0 && (
        <div className="text-center py-8 bg-gray-900 border border-gray-800 rounded-xl text-gray-600">
          <p>This template has no exercises.</p>
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

      {showImport && (
        <QuickImportModal
          templates={templates}
          logSession={logSession}
          onClose={() => setShowImport(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
