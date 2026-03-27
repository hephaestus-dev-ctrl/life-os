import { useState, useMemo } from 'react'
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

// Label for Monday of the current week
function currentWeekLabel() {
  const d   = new Date()
  const day  = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Human-readable label for an archived week_start date string
function weekLabel(weekStart) {
  // Parse as local date to avoid timezone shift
  const [y, m, d] = weekStart.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

// ── Add Topic Modal ───────────────────────────────────────────

function AddTopicModal({ onAdd, onClose }) {
  const [content, setContent] = useState('')
  const [context, setContext] = useState('')
  const [saving,  setSaving]  = useState(false)

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    await onAdd({ content: content.trim(), context: context.trim() })
    setSaving(false)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey) handleSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-5">Add Topic</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Topic or agenda item
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to raise in this meeting?"
              rows={3}
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Notes / context <span className="text-gray-700">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Background, data, or context…"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Adding…' : 'Add Topic'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add Track Modal ───────────────────────────────────────────

function AddTrackModal({ onAdd, onClose }) {
  const [name,   setName]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onAdd(name.trim())
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-100 mb-5">Add Meeting Track</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="e.g. Weekly Standup, Skip-level, Design Review…"
          autoFocus
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Creating…' : 'Create Track'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Topic Row ─────────────────────────────────────────────────

function TopicRow({ topic, onToggle, onDelete, onUpdate }) {
  const [showActionInput, setShowActionInput] = useState(false)
  const [actionItem,      setActionItem]      = useState(topic.action_item ?? '')
  const [savingAction,    setSavingAction]    = useState(false)
  const discussed = topic.status === 'discussed'

  const handleSaveAction = async () => {
    const trimmed = actionItem.trim()
    setSavingAction(true)
    await onUpdate(topic.id, { action_item: trimmed || null })
    setSavingAction(false)
    setShowActionInput(false)
  }

  return (
    <div
      className={`p-3 rounded-xl border transition-colors ${
        discussed
          ? 'border-gray-800 bg-gray-800/20'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Discussed toggle */}
        <button
          onClick={() => onToggle(topic.id)}
          className={`mt-0.5 shrink-0 transition-colors ${
            discussed ? 'text-green-500 hover:text-green-400' : 'text-gray-600 hover:text-green-400'
          }`}
          title={discussed ? 'Mark as pending' : 'Mark as discussed'}
        >
          {discussed
            ? <CheckCircleSolid className="w-5 h-5" />
            : <CheckCircleIcon  className="w-5 h-5" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${discussed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
            {topic.content}
          </p>
          {topic.context && (
            <p className="text-xs text-gray-600 mt-0.5">{topic.context}</p>
          )}

          {/* Action item display */}
          {topic.action_item && !showActionInput && (
            <button
              onClick={() => { setActionItem(topic.action_item ?? ''); setShowActionInput(true) }}
              className="text-xs text-teal-400 hover:text-teal-300 mt-1 block transition-colors"
              title="Edit action item"
            >
              → {topic.action_item}
            </button>
          )}

          {/* Action item inline input */}
          {showActionInput && (
            <div className="mt-2 flex items-center gap-2">
              <input
                value={actionItem}
                onChange={(e) => setActionItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAction()}
                placeholder="Action item (creates a todo)…"
                autoFocus
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button
                onClick={handleSaveAction}
                disabled={savingAction}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                {savingAction ? '…' : 'Save'}
              </button>
              <button
                onClick={() => setShowActionInput(false)}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Add action item prompt */}
          {!topic.action_item && !showActionInput && (
            <button
              onClick={() => setShowActionInput(true)}
              className="text-xs text-gray-700 hover:text-teal-500 mt-1 transition-colors"
            >
              + action item
            </button>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(topic.id)}
          className="p-1 text-gray-700 hover:text-red-400 transition-colors shrink-0"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Individual Meeting Track ──────────────────────────────────

function MeetingTrack({ track, topics, onAddTopic, onToggle, onDelete, onUpdate, onArchive, onDeleteTrack }) {
  const [showAddModal,    setShowAddModal]    = useState(false)
  const [collapsedWeeks,  setCollapsedWeeks]  = useState({})
  const [confirmDelete,   setConfirmDelete]   = useState(false)

  const currentTopics  = topics.filter((t) => t.track_id === track.id && !t.archived)
  const archivedTopics = topics.filter((t) => t.track_id === track.id && t.archived)

  // Group archived topics by week_start, sorted newest first
  const archivedByWeek = useMemo(() => {
    const groups = {}
    archivedTopics.forEach((t) => {
      if (!groups[t.week_start]) groups[t.week_start] = []
      groups[t.week_start].push(t)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [archivedTopics])

  const pending   = currentTopics.filter((t) => t.status === 'pending')
  const discussed = currentTopics.filter((t) => t.status === 'discussed')

  const toggleWeek = (weekStart) => {
    setCollapsedWeeks((prev) => ({ ...prev, [weekStart]: !prev[weekStart] }))
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
      {/* Track header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-200">{track.name}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Topic
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDeleteTrack(track.id)}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors ml-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-gray-700 hover:text-red-400 transition-colors rounded"
              title="Delete track"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Current week label */}
      <p className="text-xs text-gray-600 font-medium mb-2">Week of {currentWeekLabel()}</p>

      {/* Current topics */}
      {currentTopics.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-5">
          No topics added yet for this week
        </p>
      ) : (
        <div className="space-y-2">
          {pending.map((t) => (
            <TopicRow
              key={t.id}
              topic={t}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
          {discussed.length > 0 && (
            <div className={pending.length > 0 ? 'border-t border-gray-800 pt-2 mt-1 space-y-2' : 'space-y-2'}>
              {discussed.map((t) => (
                <TopicRow
                  key={t.id}
                  topic={t}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Archive current week */}
      {currentTopics.length > 0 && (
        <button
          onClick={onArchive}
          className="mt-3 text-xs text-gray-700 hover:text-gray-500 transition-colors"
        >
          Archive this week →
        </button>
      )}

      {/* Archived history */}
      {archivedByWeek.length > 0 && (
        <div className="border-t border-gray-800 mt-4 pt-4">
          <p className="text-xs text-gray-700 font-semibold uppercase tracking-wider mb-3">Archive</p>
          <div className="space-y-3">
            {archivedByWeek.map(([weekStart, weekTopics]) => (
              <div key={weekStart}>
                <button
                  onClick={() => toggleWeek(weekStart)}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors mb-1"
                >
                  {collapsedWeeks[weekStart]
                    ? <ChevronDownIcon className="w-3 h-3" />
                    : <ChevronUpIcon   className="w-3 h-3" />
                  }
                  {weekLabel(weekStart)}
                  <span className="text-gray-700 ml-0.5">({weekTopics.length})</span>
                </button>
                {!collapsedWeeks[weekStart] && (
                  <div className="space-y-2 pl-2 border-l border-gray-800 ml-1">
                    {weekTopics.map((t) => (
                      <TopicRow
                        key={t.id}
                        topic={t}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddModal && (
        <AddTopicModal
          onAdd={(data) => onAddTopic(track.id, data)}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

// ── Main MeetingsSection ──────────────────────────────────────

export default function MeetingsSection({
  tracks,
  topics,
  onAddTrack,
  onDeleteTrack,
  onAddTopic,
  onToggle,
  onDelete,
  onUpdate,
  onArchive,
}) {
  const [showAddTrackModal, setShowAddTrackModal] = useState(false)

  const pendingCount = topics.filter((t) => !t.archived && t.status === 'pending').length

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Meetings
          </h3>
          {pendingCount > 0 && (
            <p className="text-xs text-amber-400 mt-0.5">
              {pendingCount} pending topic{pendingCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddTrackModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg border border-gray-700 transition-colors"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Meeting Track
        </button>
      </div>

      {/* Meeting tracks */}
      {tracks.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-8">No meeting tracks yet.</p>
      ) : (
        tracks.map((track) => (
          <MeetingTrack
            key={track.id}
            track={track}
            topics={topics}
            onAddTopic={onAddTopic}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onArchive={() => onArchive(track.id)}
            onDeleteTrack={onDeleteTrack}
          />
        ))
      )}

      {showAddTrackModal && (
        <AddTrackModal
          onAdd={onAddTrack}
          onClose={() => setShowAddTrackModal(false)}
        />
      )}
    </div>
  )
}
