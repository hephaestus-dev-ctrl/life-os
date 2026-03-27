import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'

const MOODS = [
  { value: 'great', label: 'Great', emoji: '😄', selected: 'border-green-600 bg-green-950/50 text-green-300' },
  { value: 'good',  label: 'Good',  emoji: '😊', selected: 'border-teal-600 bg-teal-950/50 text-teal-300' },
  { value: 'okay',  label: 'Okay',  emoji: '😐', selected: 'border-amber-600 bg-amber-950/50 text-amber-300' },
  { value: 'bad',   label: 'Bad',   emoji: '😕', selected: 'border-orange-600 bg-orange-950/50 text-orange-300' },
  { value: 'awful', label: 'Awful', emoji: '😔', selected: 'border-red-600 bg-red-950/50 text-red-300' },
]

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function JournalEntryForm({ entry, date, onSave, onDelete, isToday }) {
  const [mood,       setMood]       = useState(entry?.mood          ?? '')
  const [gratitude,  setGratitude]  = useState(entry?.gratitude     ?? '')
  const [happened,   setHappened]   = useState(entry?.what_happened ?? '')
  const [reflection, setReflection] = useState(entry?.reflection    ?? '')
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await onSave({
      entry_date: date, mood, gratitude, what_happened: happened, reflection,
    })
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const isDirty =
    mood       !== (entry?.mood          ?? '') ||
    gratitude  !== (entry?.gratitude     ?? '') ||
    happened   !== (entry?.what_happened ?? '') ||
    reflection !== (entry?.reflection    ?? '')

  return (
    <div className="space-y-6">
      {/* Date header */}
      <div className="flex items-start justify-between">
        <div>
          {isToday ? (
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Today</p>
          ) : (
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Past Entry</p>
          )}
          <p className="text-base text-gray-300 mt-0.5">{formatDate(date)}</p>
        </div>
        {entry && onDelete && (
          <button
            onClick={() => onDelete(entry.id)}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors mt-1"
          >
            Delete
          </button>
        )}
      </div>

      {/* Mood selector */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">
          How are you feeling?
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? '' : m.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                mood === m.value
                  ? m.selected
                  : 'border-gray-700 bg-gray-800/50 text-gray-500 hover:border-gray-600 hover:text-gray-300'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gratitude */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Grateful for…
        </label>
        <textarea
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          placeholder="What are you grateful for today?"
          rows={3}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* What happened */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          What happened today?
        </label>
        <textarea
          value={happened}
          onChange={(e) => setHappened(e.target.value)}
          placeholder="Capture the key moments of your day…"
          rows={4}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Reflection */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Reflection
        </label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What did you learn? What would you do differently?"
          rows={3}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saved ? (
            <><CheckIcon className="w-4 h-4" />Saved</>
          ) : saving ? (
            'Saving…'
          ) : (
            entry ? 'Update Entry' : 'Save Entry'
          )}
        </button>
        {isDirty && !saving && !saved && (
          <span className="text-xs text-gray-600">Unsaved changes</span>
        )}
      </div>
    </div>
  )
}
