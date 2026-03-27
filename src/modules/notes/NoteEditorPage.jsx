import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'

export default function NoteEditorPage() {
  const { id }              = useParams()
  const [searchParams]      = useSearchParams()
  const noteType            = searchParams.get('type') || 'note' // 'work' | 'note'
  const navigate            = useNavigate()

  const [userId,       setUserId]       = useState(null)
  const [title,        setTitle]        = useState('')
  const [content,      setContent]      = useState('')
  const [projectLabel, setProjectLabel] = useState('')
  const [tags,         setTags]         = useState('')
  const [saveStatus,   setSaveStatus]   = useState('') // '' | 'Saving…' | 'Saved'
  const [noteId,       setNoteId]       = useState(id || null)
  const [loaded,       setLoaded]       = useState(false)

  const saveTimer    = useRef(null)
  const pendingSave  = useRef(null) // holds latest values for flush-on-back
  const table        = noteType === 'work' ? 'work_notes' : 'notes'

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  // Load existing note
  useEffect(() => {
    if (!id || !userId) {
      setLoaded(true)
      return
    }
    supabase.from(table).select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setTitle(data.title || '')
        setContent(data.content || '')
        if (noteType === 'work') {
          setProjectLabel(data.project_label || '')
        } else {
          setTags((data.tags || []).join(', '))
        }
        setNoteId(data.id)
      }
      setLoaded(true)
    })
  }, [id, userId, table, noteType])

  const doSave = async (titleVal, contentVal, projVal, tagsVal, currentId) => {
    if (!contentVal.trim() && !titleVal.trim()) return currentId

    const payload =
      noteType === 'work'
        ? {
            title:         titleVal.trim() || null,
            content:       contentVal,
            project_label: projVal.trim() || null,
          }
        : {
            title:    titleVal.trim() || null,
            content:  contentVal,
            category: 'note',
            tags:     tagsVal
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          }

    if (currentId) {
      await supabase.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq('id', currentId)
      return currentId
    } else {
      const { data } = await supabase
        .from(table)
        .insert({ ...payload, user_id: userId })
        .select()
        .single()
      return data?.id ?? null
    }
  }

  const scheduleAutoSave = (titleVal, contentVal, projVal, tagsVal) => {
    // Store latest values for flush
    pendingSave.current = { titleVal, contentVal, projVal, tagsVal }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus('Saving…')
    saveTimer.current = setTimeout(async () => {
      const { titleVal: t, contentVal: c, projVal: p, tagsVal: tg } = pendingSave.current
      const newId = await doSave(t, c, p, tg, noteId)
      if (newId && !noteId) setNoteId(newId)
      setSaveStatus('Saved')
      setTimeout(() => setSaveStatus(''), 2000)
    }, 2000)
  }

  const handleTitleChange = (v) => {
    setTitle(v)
    scheduleAutoSave(v, content, projectLabel, tags)
  }
  const handleContentChange = (v) => {
    setContent(v)
    scheduleAutoSave(title, v, projectLabel, tags)
  }
  const handleProjectChange = (v) => {
    setProjectLabel(v)
    scheduleAutoSave(title, content, v, tags)
  }
  const handleTagsChange = (v) => {
    setTags(v)
    scheduleAutoSave(title, content, projectLabel, v)
  }

  const handleBack = async () => {
    // Flush any pending auto-save immediately
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      if (pendingSave.current) {
        const { titleVal, contentVal, projVal, tagsVal } = pendingSave.current
        await doSave(titleVal, contentVal, projVal, tagsVal, noteId)
      }
    }
    navigate('/notes')
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Notes
        </button>
        {saveStatus && (
          <span className="text-xs text-gray-500 transition-opacity">{saveStatus}</span>
        )}
      </div>

      <div className="space-y-4">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Title…"
          className="w-full bg-transparent border-none text-2xl font-bold text-gray-100 placeholder-gray-700 focus:outline-none"
        />

        {/* Project label (work notes only) */}
        {noteType === 'work' && (
          <input
            value={projectLabel}
            onChange={(e) => handleProjectChange(e.target.value)}
            placeholder="Project label (e.g. Q2 Planning, Onboarding)"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        )}

        {/* Tags (general notes only) */}
        {noteType !== 'work' && (
          <input
            value={tags}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        )}

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing…"
          autoFocus={!id}
          style={{ minHeight: 'calc(100vh - 320px)' }}
          className="w-full bg-transparent border-none text-gray-300 placeholder-gray-700 focus:outline-none resize-none leading-relaxed text-sm"
        />
      </div>
    </div>
  )
}
