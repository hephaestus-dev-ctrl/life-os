import { useState } from 'react'
import { PlusIcon, SunIcon, MoonIcon, ListBulletIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useHabits } from './useHabits'
import HabitCard from './HabitCard'
import AddHabitModal from './AddHabitModal'

const CATEGORIES = ['All', 'Health', 'Mind', 'Work', 'Personal']

const TABS = [
  { id: 'all', label: 'All Habits', Icon: ListBulletIcon },
  { id: 'morning', label: 'Morning', Icon: SunIcon },
  { id: 'evening', label: 'Evening', Icon: MoonIcon },
]

function Checkmark() {
  return (
    <svg className="w-3.5 h-3.5 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function RoutineList({ items, onToggle, onDelete, isCompleted, onAdd }) {
  if (!items.length) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p>No habits in this routine yet.</p>
        <button
          onClick={onAdd}
          className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          Add one →
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((habit, index) => {
        const done = isCompleted(habit.id)
        return (
          <div
            key={habit.id}
            className={`flex items-center gap-3 bg-gray-900 border rounded-xl px-4 py-3 transition-colors ${
              done ? 'border-indigo-800' : 'border-gray-800'
            }`}
          >
            <span className="text-gray-600 text-sm w-5 text-right shrink-0">
              {index + 1}.
            </span>
            <button
              onClick={() => onToggle(habit.id)}
              className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150 ${
                done
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-gray-600 hover:border-indigo-400'
              }`}
            >
              {done && <Checkmark />}
            </button>
            <span
              className={`flex-1 text-sm ${
                done ? 'text-gray-500 line-through' : 'text-gray-100'
              }`}
            >
              {habit.name}
            </span>
            <button
              onClick={async () => {
                if (window.confirm(`Delete "${habit.name}"?`)) await onDelete(habit.id)
              }}
              className="p-1 text-gray-700 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default function Habits() {
  const {
    habits,
    logs,
    loading,
    getLast30Days,
    addHabit,
    deleteHabit,
    toggleLog,
    isCompleted,
    getStreaks,
  } = useHabits()

  const [tab, setTab] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const regularHabits = habits.filter((h) => !h.routine_type)
  const morningHabits = habits
    .filter((h) => h.routine_type === 'morning')
    .sort((a, b) => a.routine_order - b.routine_order)
  const eveningHabits = habits
    .filter((h) => h.routine_type === 'evening')
    .sort((a, b) => a.routine_order - b.routine_order)

  const filteredHabits =
    categoryFilter === 'All'
      ? regularHabits
      : regularHabits.filter((h) => h.category === categoryFilter)

  const completedToday = regularHabits.filter((h) => isCompleted(h.id)).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Habits & Routines</h1>
          {tab === 'all' && regularHabits.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {completedToday} of {regularHabits.length} completed today
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-5">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* All Habits tab */}
      {tab === 'all' && (
        <>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredHabits.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p className="mb-2">
                {regularHabits.length === 0
                  ? 'No habits yet.'
                  : 'No habits in this category.'}
              </p>
              {regularHabits.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Add your first habit →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompleted(habit.id)}
                  streaks={getStreaks(habit.id)}
                  logs={logs}
                  getLast30Days={getLast30Days}
                  onToggle={toggleLog}
                  onDelete={deleteHabit}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Morning Routine tab */}
      {tab === 'morning' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <SunIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-gray-200">Morning Routine</h2>
            <span className="text-xs text-gray-600 ml-auto">
              {morningHabits.filter((h) => isCompleted(h.id)).length}/{morningHabits.length} done
            </span>
          </div>
          <RoutineList
            items={morningHabits}
            onToggle={toggleLog}
            onDelete={deleteHabit}
            isCompleted={isCompleted}
            onAdd={() => setShowAddModal(true)}
          />
        </>
      )}

      {/* Evening Routine tab */}
      {tab === 'evening' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <MoonIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-gray-200">Evening Routine</h2>
            <span className="text-xs text-gray-600 ml-auto">
              {eveningHabits.filter((h) => isCompleted(h.id)).length}/{eveningHabits.length} done
            </span>
          </div>
          <RoutineList
            items={eveningHabits}
            onToggle={toggleLog}
            onDelete={deleteHabit}
            isCompleted={isCompleted}
            onAdd={() => setShowAddModal(true)}
          />
        </>
      )}

      {/* Add Habit modal */}
      {showAddModal && (
        <AddHabitModal onAdd={addHabit} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
