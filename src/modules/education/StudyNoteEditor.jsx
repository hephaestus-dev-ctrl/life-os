import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ── Theme ─────────────────────────────────────────────────────────────────────
const BG     = '#0f1117'
const CARD   = '#1e2130'
const CARD2  = '#242736'
const BORDER = 'rgba(255,255,255,0.07)'
const TEXT   = '#e2e8f0'
const MUTED  = '#6b7280'
const ACCENT = '#6366f1'

// ── Markdown Renderer ─────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inlineFormat(str) {
  str = escapeHtml(str)
  str = str.replace(/`([^`]+)`/g, '<code>$1</code>')
  str = str.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  str = str.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return str
}

function renderMarkdown(md) {
  if (!md) return ''

  const lines = md.split('\n')
  let html = ''
  let inUl  = false
  let inOl  = false
  let inPre = false
  let preContent = ''

  for (const line of lines) {
    // Code block toggle
    if (line.startsWith('```')) {
      if (!inPre) {
        if (inUl) { html += '</ul>'; inUl = false }
        if (inOl) { html += '</ol>'; inOl = false }
        inPre = true
        preContent = ''
      } else {
        inPre = false
        html += `<pre><code>${escapeHtml(preContent.trimEnd())}</code></pre>`
        preContent = ''
      }
      continue
    }

    if (inPre) {
      preContent += line + '\n'
      continue
    }

    // Close lists when leaving list context
    if (inUl && !line.startsWith('- '))  { html += '</ul>'; inUl = false }
    if (inOl && !/^\d+\. /.test(line))   { html += '</ol>'; inOl = false }

    if (line.startsWith('### '))      html += `<h3>${inlineFormat(line.slice(4))}</h3>`
    else if (line.startsWith('## ')) html += `<h2>${inlineFormat(line.slice(3))}</h2>`
    else if (line.startsWith('# '))  html += `<h1>${inlineFormat(line.slice(2))}</h1>`
    else if (line === '---')         html += '<hr/>'
    else if (line.startsWith('> ')) html += `<blockquote>${inlineFormat(line.slice(2))}</blockquote>`
    else if (line.startsWith('- ')) {
      if (!inUl) { html += '<ul>'; inUl = true }
      html += `<li>${inlineFormat(line.slice(2))}</li>`
    } else if (/^\d+\. /.test(line)) {
      if (!inOl) { html += '<ol>'; inOl = true }
      html += `<li>${inlineFormat(line.replace(/^\d+\. /, ''))}</li>`
    } else if (line.trim() === '') {
      html += '<div style="height:0.5em"></div>'
    } else {
      html += `<p>${inlineFormat(line)}</p>`
    }
  }

  if (inUl) html += '</ul>'
  if (inOl) html += '</ol>'
  if (inPre) html += `<pre><code>${escapeHtml(preContent.trimEnd())}</code></pre>`

  return html
}

// ── Preview Styles ─────────────────────────────────────────────────────────────
const previewCss = `
  .md-preview h1, .md-preview h2, .md-preview h3 { color: #e2e8f0; margin: 0.8em 0 0.4em; font-weight: 700; }
  .md-preview h1 { font-size: 1.5em; }
  .md-preview h2 { font-size: 1.25em; }
  .md-preview h3 { font-size: 1.1em; }
  .md-preview p  { color: #d1d5db; margin: 0.3em 0; line-height: 1.7; }
  .md-preview strong { color: #e2e8f0; font-weight: 700; }
  .md-preview em { font-style: italic; color: #c4b5fd; }
  .md-preview code {
    background: #111827; color: #10b981;
    padding: 2px 6px; border-radius: 4px;
    font-family: 'Courier New', Courier, monospace; font-size: 0.88em;
  }
  .md-preview pre {
    background: #111827; border-radius: 8px;
    padding: 14px 16px; overflow-x: auto; margin: 0.8em 0;
  }
  .md-preview pre code { padding: 0; background: none; color: #10b981; font-size: 0.85em; }
  .md-preview ul, .md-preview ol { color: #d1d5db; padding-left: 1.5em; margin: 0.4em 0; }
  .md-preview li { margin: 0.2em 0; line-height: 1.65; }
  .md-preview blockquote {
    border-left: 3px solid #6366f1; margin: 0.8em 0;
    padding: 6px 14px; color: #9ca3af; font-style: italic;
  }
  .md-preview hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1em 0; }
`

// ── Component ─────────────────────────────────────────────────────────────────
export default function StudyNoteEditor() {
  const { courseId, noteId } = useParams()
  const navigate = useNavigate()
  const isNew = !noteId

  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [courseName, setCourseName] = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const fileInputRef = useRef(null)

  // Fetch course name + note data (if editing)
  useEffect(() => {
    async function load() {
      const { data: course } = await supabase
        .from('courses')
        .select('name')
        .eq('id', courseId)
        .single()
      if (course) setCourseName(course.name)

      if (!isNew) {
        const { data: note } = await supabase
          .from('study_notes')
          .select('title, content')
          .eq('id', noteId)
          .single()
        if (note) {
          setTitle(note.title ?? '')
          setContent(note.content ?? '')
        }
      }
    }
    load()
  }, [courseId, noteId, isNew])

  const goBack = () => navigate(`/education/${courseId}`, { state: { tab: 'notes' } })

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (isNew) {
      const { error: err } = await supabase
        .from('study_notes')
        .insert({ user_id: user.id, course_id: courseId, title: title.trim(), content: content.trim() || null })
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase
        .from('study_notes')
        .update({ title: title.trim(), content: content.trim() || null })
        .eq('id', noteId)
        .eq('user_id', user.id)
      if (err) { setError(err.message); setSaving(false); return }
    }

    setSaving(false)
    goBack()
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setContent((prev) => prev ? prev + '\n' + text : text)
    } catch {
      setError('Clipboard access denied.')
    }
  }

  const importFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setContent(ev.target.result ?? '')
    reader.readAsText(file)
    e.target.value = ''
  }

  const previewHtml = renderMarkdown(content)

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{previewCss}</style>

      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: `1px solid ${BORDER}`,
        background: CARD, flexShrink: 0, gap: 16,
      }}>
        <button
          onClick={goBack}
          style={{
            background: 'transparent', border: 'none', color: MUTED,
            cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center',
            gap: 6, padding: 0, whiteSpace: 'nowrap',
          }}
        >
          ← Back{courseName ? ` to ${courseName}` : ''}
        </button>

        <span style={{ color: TEXT, fontSize: 15, fontWeight: 700, flex: 1, textAlign: 'center' }}>
          {isNew ? 'New Note' : (title || 'Edit Note')}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {error && <span style={{ color: '#f87171', fontSize: 12 }}>{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{
              padding: '8px 22px', borderRadius: 8, background: ACCENT,
              border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14,
              fontWeight: 600, opacity: saving || !title.trim() ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── Editor + Preview ── */}
      <div style={{
        display: 'flex', flex: 1, overflow: 'hidden',
        flexWrap: 'wrap',
      }}>

        {/* LEFT — Editor pane */}
        <div style={{
          flex: '1 1 320px', display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${BORDER}`, minWidth: 0,
        }}>
          {/* Course label */}
          <div style={{ padding: '10px 20px 0', flexShrink: 0 }}>
            <span style={{ color: MUTED, fontSize: 12 }}>{courseName}</span>
          </div>

          {/* Title input */}
          <div style={{ padding: '8px 20px', flexShrink: 0 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              style={{
                width: '100%', background: 'transparent', border: 'none',
                color: TEXT, fontSize: 22, fontWeight: 700, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: BORDER, flexShrink: 0, margin: '0 20px' }} />

          {/* Content textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'Write your notes here...\nMarkdown supported: # headers, **bold**, - lists, `code`'}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: TEXT, fontSize: 14, lineHeight: 1.75, resize: 'none',
              fontFamily: "'Courier New', Courier, monospace",
              padding: '16px 20px', boxSizing: 'border-box', minHeight: 200,
            }}
          />

          {/* Import tools */}
          <div style={{
            padding: '12px 20px', borderTop: `1px solid ${BORDER}`,
            display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap',
          }}>
            <button
              onClick={pasteFromClipboard}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13,
                background: CARD2, border: `1px solid ${BORDER}`,
                color: MUTED, cursor: 'pointer',
              }}
            >
              📋 Paste from clipboard
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13,
                background: CARD2, border: `1px solid ${BORDER}`,
                color: MUTED, cursor: 'pointer',
              }}
            >
              📄 Import .txt file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={importFile}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* RIGHT — Preview pane */}
        <div style={{
          flex: '1 1 320px', display: 'flex', flexDirection: 'column',
          minWidth: 0, overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 20px', borderBottom: `1px solid ${BORDER}`,
            flexShrink: 0,
          }}>
            <span style={{ color: MUTED, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Preview
            </span>
          </div>
          <div
            className="md-preview"
            style={{
              flex: 1, overflowY: 'auto', padding: '16px 24px',
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: previewHtml || `<p style="color:${MUTED};font-style:italic">Nothing to preview yet…</p>` }}
          />
        </div>
      </div>
    </div>
  )
}
