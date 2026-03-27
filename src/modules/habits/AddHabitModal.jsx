import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const CATEGORIES = ['Health', 'Mind', 'Work', 'Personal']

const ROUTINE_OPTIONS = [
  { value: '', label: 'None — regular habit' },
  { value: 'morning', label: 'Morning routine' },
  { value: 'evening', label: 'Evening routine' },
]

export default function AddHabitModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Health')
  const [routineType, setRoutineType] = useState('')
  const [routineOrder, setRoutineOrder] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    const { error: err } = await onAdd({
      name: name.trim(),
      category,
      routine_type: routineType || null,
      routine_order: routineType ? routineOrder : 0,
    })
    if (err) {
      setError(err.message)
      setSaving(false)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-100">Add Habit</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Drink 8 glasses of water"
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select
              value={routineType}
              onChange={(e) => setRoutineType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {ROUTINE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {routineType && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Order in routine
              </label>
              <input
                type="number"
                min="1"
                value={routineOrder}
                onChange={(e) => setRoutineOrder(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
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
              disabled={!name.trim() || saving}
              className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Adding…' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
