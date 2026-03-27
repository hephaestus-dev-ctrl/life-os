import { useState } from 'react'
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useTodos } from './useTodos'
import TodoItem from './TodoItem'
import AddTodoModal from './AddTodoModal'

const FILTERS = ['All', 'Today', 'High Priority', 'By Project']

function groupByProject(items) {
  const groups = {}
  items.forEach((t) => {
    const key = t.project || 'Inbox'
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })
  return Object.entries(groups).sort(([a], [b]) => {
    if (a === 'Inbox') return 1
    if (b === 'Inbox') return -1
    return a.localeCompare(b)
  })
}

export default function Todos() {
  const { todos, loading, today, addTodo, toggleStatus, deleteTodo, isOverdue } = useTodos()
  const [filter, setFilter]           = useState('All')
  const [projectFilter, setProjectFilter] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showAddModal, setShowAddModal]   = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const open = todos.filter((t) => t.status === 'open')
  const done = todos.filter((t) => t.status === 'done')
  const projects = [...new Set(open.map((t) => t.project).filter(Boolean))].sort()
  const overdueIds = new Set(open.filter(isOverdue).map((t) => t.id))

  // Apply active filter
  let filtered = open
  if (filter === 'Today')         filtered = open.filter((t) => t.due_date === today)
  if (filter === 'High Priority') filtered = open.filter((t) => t.priority === 'high')
  if (filter === 'By Project')    filtered = open.filter((t) =>
    projectFilter ? t.project === projectFilter : !t.project
  )

  const renderList = (items) => {
    if (!items.length) {
      return (
        <div className="text-center py-14 text-gray-600">
          <p className="mb-2">No tasks here.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            Add a task →
          </button>
        </div>
      )
    }

    if (filter === 'All') {
      return (
        <div className="space-y-6">
          {groupByProject(items).map(([project, group]) => (
            <div key={project}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                {project}
              </h3>
              <div className="space-y-2">
                {group.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleStatus}
                    onDelete={deleteTodo}
                    isOverdue={overdueIds.has(todo.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {items.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleStatus}
            onDelete={deleteTodo}
            isOverdue={overdueIds.has(todo.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">To-Do</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {open.length} open
            {overdueIds.size > 0 && (
              <span className="text-red-400 ml-2">· {overdueIds.size} overdue</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setProjectFilter(null) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Project sub-filter */}
      {filter === 'By Project' && (
        <div className="flex flex-wrap gap-2 mb-5 pl-1">
          <button
            onClick={() => setProjectFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !projectFilter
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800/50 text-gray-500 hover:text-gray-300'
            }`}
          >
            Inbox
          </button>
          {projects.map((p) => (
            <button
              key={p}
              onClick={() => setProjectFilter(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                projectFilter === p
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800/50 text-gray-500 hover:text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      {renderList(filtered)}

      {/* Completed section */}
      {done.length > 0 && (
        <div className="mt-10 border-t border-gray-800 pt-6">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-400 transition-colors mb-3"
          >
            {showCompleted
              ? <ChevronUpIcon className="w-4 h-4" />
              : <ChevronDownIcon className="w-4 h-4" />}
            Completed ({done.length})
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {done.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleStatus}
                  onDelete={deleteTodo}
                  isOverdue={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddTodoModal
          onAdd={addTodo}
          onClose={() => setShowAddModal(false)}
          existingProjects={projects}
        />
      )}
    </div>
  )
}
