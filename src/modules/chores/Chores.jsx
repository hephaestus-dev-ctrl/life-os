import { useState } from 'react'
import { PlusIcon, SunIcon, CalendarDaysIcon, Squares2X2Icon, FireIcon } from '@heroicons/react/24/outline'
import { useChores } from './useChores'
import ChoreItem from './ChoreItem'
import AddChoreModal from './AddChoreModal'

const SECTIONS = [
  { cadence: 'daily',   label: 'Daily',   Icon: SunIcon,           color: 'text-amber-400'  },
  { cadence: 'weekly',  label: 'Weekly',  Icon: CalendarDaysIcon,  color: 'text-indigo-400' },
  { cadence: 'monthly', label: 'Monthly', Icon: Squares2X2Icon,    color: 'text-purple-400' },
]

const CADENCE_BADGE = {
  daily:   'bg-amber-950 text-amber-300',
  weekly:  'bg-indigo-950 text-indigo-300',
  monthly: 'bg-purple-950 text-purple-300',
}

// ── Streak bar ────────────────────────────────────────────────

function StreakBar({ history }) {
  // history[0] = oldest, history[7] = most recent
  return (
    <div className="flex gap-1" title="8-period completion history (oldest → newest)">
      {history.map((done, i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-sm transition-colors ${done ? 'bg-indigo-500' : 'bg-gray-800'}`}
        />
      ))}
    </div>
  )
}

// ── Streak card ───────────────────────────────────────────────

function StreakCard({ chore, streakData }) {
  const { current, longest, history } = streakData
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-100 truncate">{chore.title}</p>
          <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${CADENCE_BADGE[chore.cadence]}`}>
            {chore.cadence.charAt(0).toUpperCase() + chore.cadence.slice(1)}
          </span>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-2xl font-bold text-indigo-400 leading-none">{current}</p>
          <p className="text-xs text-gray-600 mt-0.5">current streak</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <StreakBar history={history} />
        <p className="text-xs text-gray-600 shrink-0">Best: <span className="text-gray-400">{longest}</span></p>
      </div>
    </div>
  )
}

// ── Chore section ─────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────

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
    getStreakData,
  } = useChores()

  const [addModal,      setAddModal]      = useState(null)   // null | 'daily' | 'weekly' | 'monthly'
  const [view,          setView]          = useState('chores') // 'chores' | 'streaks'
  const [overdueFilter, setOverdueFilter] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const overdueChores = chores.filter(isOverdue)
  const overdueCount  = overdueChores.length

  const handleDelete = async (choreId) => {
    if (window.confirm('Delete this chore and all its history?')) {
      await deleteChore(choreId)
    }
  }

  // Streak data sorted by current streak descending
  const streakList = chores
    .map((c) => ({ chore: c, streakData: getStreakData(c.id, c.cadence) }))
    .sort((a, b) => b.streakData.current - a.streakData.current)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Chores</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            {chores.length} total
            {overdueCount > 0 && (
              <button
                onClick={() => {
                  setView('chores')
                  setOverdueFilter((f) => !f)
                }}
                className={`ml-1 transition-colors ${
                  overdueFilter
                    ? 'text-red-300 font-semibold underline underline-offset-2'
                    : 'text-red-400 hover:text-red-300'
                }`}
              >
                · {overdueCount} overdue{overdueFilter ? ' (filtered)' : ''}
              </button>
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

      {/* View tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6">
        <button
          onClick={() => { setView('chores'); setOverdueFilter(false) }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            view === 'chores'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Chores
        </button>
        <button
          onClick={() => { setView('streaks'); setOverdueFilter(false) }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            view === 'streaks'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FireIcon className="w-4 h-4" />
          Streaks
        </button>
      </div>

      {/* Chores view */}
      {view === 'chores' && (
        <>
          {overdueFilter ? (
            /* Overdue-only flat list */
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-red-400">
                  Overdue — {overdueCount} {overdueCount === 1 ? 'chore' : 'chores'}
                </h2>
                <button
                  onClick={() => setOverdueFilter(false)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Show All
                </button>
              </div>
              <div className="space-y-2">
                {overdueChores.map((chore) => (
                  <ChoreItem
                    key={chore.id}
                    chore={chore}
                    completed={isCompletedInPeriod(chore.id, chore.cadence)}
                    overdue={true}
                    lastCompleted={getLastCompleted(chore.id)}
                    onToggle={toggleLog}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Normal three-section layout */
            SECTIONS.map(({ cadence, label, Icon, color }) => (
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
            ))
          )}
        </>
      )}

      {/* Streaks view */}
      {view === 'streaks' && (
        <div>
          {chores.length === 0 ? (
            <p className="text-gray-600 text-center py-16">No chores yet — add some to track streaks.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {streakList.map(({ chore, streakData }) => (
                <StreakCard
                  key={chore.id}
                  chore={chore}
                  streakData={streakData}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
