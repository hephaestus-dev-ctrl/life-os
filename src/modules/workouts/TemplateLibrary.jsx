import { useState } from 'react'
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { CreateTemplateModal } from './CreateTemplateModal'

const TYPE_STYLE = {
  tonal: 'bg-blue-950 text-blue-300',
  swedish_ladder: 'bg-purple-950 text-purple-300',
}

const TYPE_LABEL = {
  tonal: 'Tonal',
  swedish_ladder: 'Swedish Ladder',
}

function TemplateSection({ title, items, onDelete, deleting }) {
  const [expanded, setExpanded] = useState({})
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-600 italic py-2">No templates yet.</p>
      ) : (
        items.map((tmpl) => {
          const exs = [...(tmpl.template_exercises ?? [])].sort(
            (a, b) => a.order_index - b.order_index
          )
          const open = expanded[tmpl.id]
          return (
            <div
              key={tmpl.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => toggle(tmpl.id)}
              >
                {open ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-500 shrink-0" />
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPE_STYLE[tmpl.type]}`}
                >
                  {TYPE_LABEL[tmpl.type]}
                </span>
                <span className="font-medium text-gray-100 flex-1 truncate">{tmpl.name}</span>
                <span className="text-xs text-gray-500 shrink-0">{exs.length} exercises</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(tmpl.id)
                  }}
                  disabled={deleting === tmpl.id}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 disabled:opacity-40 transition-colors shrink-0"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {open && (
                <div className="border-t border-gray-800 px-4 py-3">
                  {exs.length === 0 ? (
                    <p className="text-sm text-gray-600 italic">No exercises in this template.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase">
                          <th className="text-left pb-2">Exercise</th>
                          <th className="text-center pb-2 w-16">Sets</th>
                          <th className="text-center pb-2 w-16">Reps</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {exs.map((ex) => (
                          <tr key={ex.id}>
                            <td className="py-1.5 text-gray-200">{ex.exercise_name}</td>
                            <td className="py-1.5 text-center text-gray-400">{ex.sets ?? '—'}</td>
                            <td className="py-1.5 text-center text-gray-400">{ex.reps ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export function TemplateLibrary({ templates, createTemplate, deleteTemplate }) {
  const [showCreate, setShowCreate] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (id) => {
    if (!confirm('Delete this template? Logged sessions using it will not be affected.')) return
    setDeleting(id)
    await deleteTemplate(id)
    setDeleting(null)
  }

  const tonal = templates.filter((t) => t.type === 'tonal')
  const ladder = templates.filter((t) => t.type === 'swedish_ladder')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{templates.length} saved templates</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New Template
        </button>
      </div>

      <TemplateSection
        title="Tonal"
        items={tonal}
        onDelete={handleDelete}
        deleting={deleting}
      />
      <TemplateSection
        title="Swedish Ladder"
        items={ladder}
        onDelete={handleDelete}
        deleting={deleting}
      />

      {showCreate && (
        <CreateTemplateModal
          onClose={() => setShowCreate(false)}
          onSave={async (data) => {
            const result = await createTemplate(data)
            if (!result.error) setShowCreate(false)
            return result
          }}
        />
      )}
    </div>
  )
}
