import { useState } from 'react'
import { PlusIcon, SunIcon, CalendarDaysIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { useChores } from './useChores'
import ChoreItem from './ChoreItem'
import AddChoreModal from './AddChoreModal'

const SECTIONS = [
  { cadence: 'daily',   label: 'Daily',   Icon: SunIcon,           color: 'text-amber-400'  },
  { cadence: 'weekly',  label: 'Weekly',  Icon: CalendarDaysIcon,  color: 'text-indigo-400' },
  { cadence: 'monthly', label: 'Monthly', Icon: Squares2X2Icon,    color: 'text-purple-400' },
]

function ChoreSection({ cadence, label, Icon, color, chores, isCompletedInPeriod, isOverdue, getLastCompleted, onToggle, onDelete, onAdd }) {
  const items = chores.filter((c) => c.cadence === cadence)
  const doneCount = items.filter((c) => isCompletedInPeriod(c.id, cadence)).length

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h2 className="text-base font-semibold text-gray-200">{label}</h2>
          <span className="text-xs text-gray-600">{doneCount}/{items.length}</span>
        </div>
        <button
          onClick={() => onAdd(cadence)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-400 transition-colors"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-700 border border-dashed border-gray-800 rounded-xl">
          No {label.toLowerCase()} chores.{' '}
          <button
            onClick={() => onAdd(cadence)}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Add one →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((chore) => (
            <ChoreItem
              key={chore.id}
              chore={chore}
              completed={isCompletedInPeriod(chore.id, cadence)}
              overdue={isOverdue(chore)}
              lastCompleted={getLastCompleted(chore.id)}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Chores() {
  const {
    chores,
    loading,
    addChore,
    deleteChore,
    toggleLog,
    isCompletedInPeriod,
    isOverdue,
    getLastCompleted,
  } = useChores()

  const [addModal, setAddModal] = useState(null) // null | 'daily' | 'weekly' | 'monthly'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const overdueCount = chores.filter(isOverdue).length

  const handleDelete = async (choreId) => {
    if (window.confirm('Delete this chore and all its history?')) {
      await deleteChore(choreId)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Chores</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {chores.length} total
            {overdueCount > 0 && (
              <span className="text-red-400 ml-2">· {overdueCount} overdue</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setAddModal('daily')}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Chore
        </button>
      </div>

      {/* Daily / Weekly / Monthly sections */}
      {SECTIONS.map(({ cadence, label, Icon, color }) => (
        <ChoreSection
          key={cadence}
          cadence={cadence}
          label={label}
          Icon={Icon}
          color={color}
          chores={chores}
          isCompletedInPeriod={isCompletedInPeriod}
          isOverdue={isOverdue}
          getLastCompleted={getLastCompleted}
          onToggle={toggleLog}
          onDelete={handleDelete}
          onAdd={(c) => setAddModal(c)}
        />
      ))}

      {addModal && (
        <AddChoreModal
          defaultCadence={addModal}
          onAdd={addChore}
          onClose={() => setAddModal(null)}
        />
      )}
    </div>
  )
}
