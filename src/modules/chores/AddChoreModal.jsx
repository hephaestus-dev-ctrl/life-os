import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function AddChoreModal({ onAdd, onClose, defaultCadence = 'daily' }) {
  const [title, setTitle]           = useState('')
  const [cadence, setCadence]       = useState(defaultCadence)
  const [assignedDay, setAssignedDay] = useState('Monday')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    const { error: err } = await onAdd({
      title: title.trim(),
      cadence,
      assigned_day: cadence === 'weekly' ? assignedDay : null,
    })
    if (err) { setError(err.message); setSaving(false) }
    else onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-100">Add Chore</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Take out trash"
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Frequency</label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCadence(c)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    cadence === c
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {cadence === 'weekly' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Assigned day</label>
              <select
                value={assignedDay}
                onChange={(e) => setAssignedDay(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Adding…' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
