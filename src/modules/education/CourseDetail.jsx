import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEducation } from './useEducation'

// ── Theme ────────────────────────────────────────────────────────────────────
const BG      = '#0f1117'
const CARD    = '#1e2130'
const CARD2   = '#242736'
const BORDER  = 'rgba(255,255,255,0.07)'
const TEXT    = '#e2e8f0'
const MUTED   = '#6b7280'
const ACCENT  = '#6366f1'
const COLLEGE = '#6366f1'
const SELFP   = '#10b981'
const RED     = '#ef4444'

const PRESET_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b',
]

function colorAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function letterGrade(pct) {
  if (pct == null) return null
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

function gradeColor(pct) {
  if (pct >= 90) return '#10b981'
  if (pct >= 80) return '#34d399'
  if (pct >= 70) return '#f59e0b'
  if (pct >= 60) return '#fb923c'
  return '#ef4444'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function inputStyle(extra = {}) {
  return {
    width: '100%', background: CARD2, border: `1px solid ${BORDER}`,
    borderRadius: 8, padding: '8px 12px', color: TEXT, fontSize: 14,
    outline: 'none', boxSizing: 'border-box', ...extra,
  }
}

// ── Modal Shell ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: 12, padding: 24, width: '100%', maxWidth: 460,
        maxHeight: '90vh', overflowY: 'auto',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: TEXT, fontSize: 17, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: MUTED, padding: 4,
          }}>
            <XMarkIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SaveCancel({ onCancel, saving, disabled, label = 'Save' }) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
      <button type="button" onClick={onCancel} style={{
        padding: '8px 16px', borderRadius: 8, background: 'transparent',
        border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer', fontSize: 14,
      }}>Cancel</button>
      <button type="submit" disabled={saving || disabled} style={{
        padding: '8px 20px', borderRadius: 8, background: ACCENT,
        border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        opacity: saving || disabled ? 0.6 : 1,
      }}>
        {saving ? 'Saving…' : label}
      </button>
    </div>
  )
}

// ── Add Assignment Modal ───────────────────────────────────────────────────────
function AddAssignmentModal({ courseId, onClose, onAdd }) {
  const [title, setTitle]     = useState('')
  const [dueDate, setDue]     = useState('')
  const [notes, setNotes]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const { error } = await onAdd({
      course_id: courseId,
      title: title.trim(),
      due_date: dueDate || null,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    onClose()
  }

  return (
    <Modal title="Add Assignment" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Problem Set 3" style={inputStyle()} />
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Due Date</label>
          <input value={dueDate} onChange={(e) => setDue(e.target.value)} type="date" style={inputStyle({ colorScheme: 'dark' })} />
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional notes…" style={inputStyle({ resize: 'vertical' })} />
        </div>
        {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
        <SaveCancel onCancel={onClose} saving={saving} disabled={!title.trim()} label="Add Assignment" />
      </form>
    </Modal>
  )
}

// ── Add Key Concept Modal ──────────────────────────────────────────────────────
function AddConceptModal({ courseId, onClose, onAdd }) {
  const [term, setTerm]         = useState('')
  const [definition, setDef]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!term.trim()) return
    setSaving(true)
    const { error } = await onAdd({ course_id: courseId, term: term.trim(), definition: definition.trim() || null })
    setSaving(false)
    if (error) { setError(error.message); return }
    onClose()
  }

  return (
    <Modal title="Add Key Concept" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Term *</label>
          <input value={term} onChange={(e) => setTerm(e.target.value)} required placeholder="e.g. Eigenvalue" style={inputStyle()} />
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Definition</label>
          <textarea value={definition} onChange={(e) => setDef(e.target.value)} rows={4} placeholder="Define the term…" style={inputStyle({ resize: 'vertical' })} />
        </div>
        {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
        <SaveCancel onCancel={onClose} saving={saving} disabled={!term.trim()} label="Add Concept" />
      </form>
    </Modal>
  )
}

// ── Add Study Block Modal ──────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DURATIONS = [30, 60, 90, 120]

function AddBlockModal({ courseId, onClose, onAdd }) {
  const [day, setDay]           = useState('Monday')
  const [startTime, setStart]   = useState('09:00')
  const [duration, setDuration] = useState(60)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await onAdd({
      course_id: courseId,
      day_of_week: day,
      start_time: startTime,
      duration_minutes: duration,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    onClose()
  }

  return (
    <Modal title="Add Study Block" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Day of Week</label>
          <select value={day} onChange={(e) => setDay(e.target.value)} style={inputStyle()}>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Start Time</label>
          <input value={startTime} onChange={(e) => setStart(e.target.value)} type="time" style={inputStyle({ colorScheme: 'dark' })} />
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 6 }}>Duration</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {DURATIONS.map((d) => (
              <button key={d} type="button" onClick={() => setDuration(d)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: `1px solid ${duration === d ? ACCENT : BORDER}`,
                background: duration === d ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: duration === d ? '#818cf8' : MUTED, cursor: 'pointer',
              }}>
                {d}m
              </button>
            ))}
          </div>
        </div>
        {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
        <SaveCancel onCancel={onClose} saving={saving} disabled={false} label="Add Block" />
      </form>
    </Modal>
  )
}

// ── Log Session Modal ──────────────────────────────────────────────────────────
function LogSessionModal({ courseId, onClose, onLog }) {
  const today = new Date().toISOString().split('T')[0]
  const [sessionDate, setDate]   = useState(today)
  const [duration, setDuration]  = useState('')
  const [notes, setNotes]        = useState('')
  const [saving, setSaving]      = useState(false)
  const [error, setError]        = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!duration) return
    setSaving(true)
    const { error } = await onLog({
      course_id: courseId,
      session_date: sessionDate,
      duration_minutes: parseInt(duration, 10),
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    onClose()
  }

  return (
    <Modal title="Log Study Session" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Date</label>
          <input value={sessionDate} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle({ colorScheme: 'dark' })} />
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Duration (minutes) *</label>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min="1" max="600" required placeholder="e.g. 60" style={inputStyle()} />
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What did you study?" style={inputStyle({ resize: 'vertical' })} />
        </div>
        {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
        <SaveCancel onCancel={onClose} saving={saving} disabled={!duration} label="Log Session" />
      </form>
    </Modal>
  )
}

// ── Edit Course Modal ──────────────────────────────────────────────────────────
function EditCourseModal({ course, onClose, onSave }) {
  const [name, setName]         = useState(course.name)
  const [provider, setProvider] = useState(course.provider || '')
  const [status, setStatus]     = useState(course.status)
  const [color, setColor]       = useState(course.color || '#6366f1')
  const [gradePct, setGradePct] = useState(course.grade_pct != null ? String(course.grade_pct) : '')
  const [url, setUrl]           = useState(course.url || '')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const updates = {
      name: name.trim(),
      provider: provider.trim() || null,
      status,
      color,
      grade_pct: gradePct !== '' ? parseFloat(gradePct) : null,
      url: url.trim() || null,
    }
    const { error } = await onSave(updates)
    setSaving(false)
    if (error) { setError(error.message); return }
    onClose()
  }

  return (
    <Modal title="Edit Course" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Course Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle()} />
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Provider / Institution</label>
          <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. MIT OpenCourseWare" style={inputStyle()} />
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle()}>
            <option value="in_progress">In Progress</option>
            <option value="finished">Finished</option>
            <option value="wishlist">Wishlist</option>
          </select>
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 8 }}>Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: '50%', background: c,
                  border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                  boxShadow: color === c ? '0 0 0 2px #0f1117, 0 0 0 4px #fff' : 'none',
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Grade % (optional)</label>
          <input
            value={gradePct} onChange={(e) => setGradePct(e.target.value)}
            type="number" min="0" max="100" step="0.1" placeholder="0–100"
            style={inputStyle()}
          />
        </div>
        <div>
          <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>URL (optional)</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." type="url" style={inputStyle()} />
        </div>
        {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
        <SaveCancel onCancel={onClose} saving={saving} disabled={!name.trim()} label="Save Changes" />
      </form>
    </Modal>
  )
}

// ── Tab Button ────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px', borderRadius: '8px 8px 0 0', fontSize: 14, fontWeight: 600,
      background: active ? CARD2 : 'transparent',
      color: active ? TEXT : MUTED,
      border: active ? `1px solid ${BORDER}` : '1px solid transparent',
      borderBottom: active ? `1px solid ${CARD2}` : `1px solid transparent`,
      cursor: 'pointer', marginBottom: -1,
    }}>
      {children}
    </button>
  )
}

function SectionHeader({ title, onAdd, addLabel = '+ Add' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ color: TEXT, fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
      <button onClick={onAdd} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '6px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.12)',
        border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8',
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
      }}>
        <PlusIcon style={{ width: 14, height: 14 }} />
        {addLabel}
      </button>
    </div>
  )
}

function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: MUTED, padding: 4, flexShrink: 0,
      transition: 'color 0.15s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.color = RED }}
      onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
    >
      <TrashIcon style={{ width: 15, height: 15 }} />
    </button>
  )
}

function EmptyMsg({ msg }) {
  return <p style={{ color: MUTED, fontSize: 14, margin: '24px 0', textAlign: 'center' }}>{msg}</p>
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate     = useNavigate()
  const location     = useLocation()
  const edu          = useEducation()

  const [tab, setTab]               = useState(location.state?.tab || 'assignments')
  const [modal, setModal]           = useState(null) // 'addAssignment'|'addConcept'|'addBlock'|'logSession'
  const [showEditCourse, setShowEditCourse] = useState(false)
  const [editGrade, setEditGrade]   = useState(false)
  const [gradeInput, setGradeInput] = useState('')
  const [gradeError, setGradeError] = useState(null)
  const [gradeSaving, setGradeSave] = useState(false)
  // For assignment grade editing
  const [editingGradeId, setEditingGradeId] = useState(null)
  const [assignGradeVal, setAssignGrade]    = useState('')

  if (edu.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240, background: BG }}>
        <div style={{
          width: 32, height: 32,
          border: `2px solid ${ACCENT}`, borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  const course = edu.courses.find((c) => c.id === courseId)
  if (!course) {
    return (
      <div style={{ background: BG, minHeight: '100vh', padding: 24 }}>
        <button onClick={() => navigate('/education')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 14,
        }}>
          <ArrowLeftIcon style={{ width: 16, height: 16 }} /> Back
        </button>
        <p style={{ color: MUTED, marginTop: 40, textAlign: 'center' }}>Course not found.</p>
      </div>
    )
  }

  const typeColor = course.color || ACCENT
  const grade     = course.grade_pct != null ? Number(course.grade_pct) : null

  // Filtered data for this course
  const courseAssignments = edu.assignments.filter((a) => a.course_id === courseId)
  const courseNotes       = edu.studyNotes.filter((n) => n.course_id === courseId)
  const courseConcepts    = edu.keyConcepts.filter((k) => k.course_id === courseId)
  const courseBlocks      = edu.studyBlocks.filter((b) => b.course_id === courseId)
  const courseSessions    = edu.studySessions.filter((s) => s.course_id === courseId)

  const totalMinutes  = courseSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
  const totalHours    = (totalMinutes / 60).toFixed(1)

  // Grade save
  const saveGrade = async () => {
    const val = parseFloat(gradeInput)
    if (isNaN(val) || val < 0 || val > 100) { setGradeError('Enter a number 0–100.'); return }
    setGradeSave(true)
    const { error } = await edu.updateCourse(courseId, { grade_pct: val })
    setGradeSave(false)
    if (error) { setGradeError(error.message); return }
    setEditGrade(false)
    setGradeError(null)
  }

  // Assignment mark done / grade
  const toggleAssignment = async (a) => {
    const next = a.status === 'done' ? 'pending' : 'done'
    await edu.updateAssignment(a.id, { status: next })
    if (next === 'done') {
      setEditingGradeId(a.id)
      setAssignGrade('')
    }
  }

  const saveAssignGrade = async (id) => {
    const val = parseFloat(assignGradeVal)
    if (!isNaN(val)) await edu.updateAssignment(id, { grade_pct: val })
    setEditingGradeId(null)
    setAssignGrade('')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isOverdue = (a) => a.due_date && new Date(a.due_date + 'T00:00:00') < today && a.status === 'pending'

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 48 }}>
      {/* ── Header ── */}
      <div style={{
        padding: '20px 24px 0',
        borderBottom: `1px solid ${BORDER}`,
        paddingBottom: 20,
      }}>
        <button onClick={() => navigate('/education')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', color: MUTED,
          cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 14,
        }}>
          <ArrowLeftIcon style={{ width: 14, height: 14 }} />
          Back to Education
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              color: TEXT, fontSize: 24, fontWeight: 700, margin: '0 0 4px',
              borderLeft: `4px solid ${typeColor}`, paddingLeft: 12,
            }}>
              {course.name}
            </h1>
            {course.provider && (
              <p style={{ color: MUTED, fontSize: 14, margin: '0 0 10px', paddingLeft: 16 }}>{course.provider}</p>
            )}
            <div style={{ display: 'flex', gap: 8, paddingLeft: 16 }}>
              <span style={{
                background: colorAlpha(typeColor, 0.15),
                color: typeColor, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
              }}>
                {course.course_type === 'college' ? 'College' : 'Self-Paced'}
              </span>
              {(() => {
                const map = {
                  in_progress: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: 'In Progress' },
                  finished:    { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Finished'    },
                  wishlist:    { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Wishlist'    },
                }
                const s = map[course.status] ?? { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', label: course.status }
                return (
                  <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    {s.label}
                  </span>
                )
              })()}
            </div>
          </div>

          {/* Grade section */}
          <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: '14px 18px', minWidth: 180,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: MUTED, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Grade
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setShowEditCourse(true)} title="Edit course" style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', color: MUTED, padding: 2,
                }}>
                  <PencilIcon style={{ width: 13, height: 13 }} />
                </button>
                <button onClick={() => { setEditGrade(!editGrade); setGradeInput(grade?.toString() ?? ''); setGradeError(null) }} title="Edit grade" style={{
                  background: 'transparent', border: `1px solid ${BORDER}`, cursor: 'pointer', color: MUTED, padding: '1px 6px', borderRadius: 4, fontSize: 11,
                }}>
                  %
                </button>
              </div>
            </div>

            {editGrade ? (
              <div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    type="number" min="0" max="100" step="0.1"
                    placeholder="0–100"
                    style={{ ...inputStyle(), padding: '6px 10px', fontSize: 13 }}
                    autoFocus
                  />
                  <button onClick={saveGrade} disabled={gradeSaving} style={{
                    padding: '6px 10px', borderRadius: 8, background: ACCENT,
                    border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, flexShrink: 0,
                  }}>
                    <CheckIcon style={{ width: 14, height: 14 }} />
                  </button>
                  <button onClick={() => { setEditGrade(false); setGradeError(null) }} style={{
                    padding: '6px 8px', borderRadius: 8, background: 'transparent',
                    border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer', flexShrink: 0,
                  }}>
                    <XMarkIcon style={{ width: 14, height: 14 }} />
                  </button>
                </div>
                {gradeError && <p style={{ color: '#f87171', fontSize: 12, margin: '4px 0 0' }}>{gradeError}</p>}
              </div>
            ) : grade != null ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                  <span style={{ color: gradeColor(grade), fontSize: 26, fontWeight: 700 }}>
                    {grade.toFixed(1)}%
                  </span>
                  <span style={{ color: gradeColor(grade), fontSize: 18, fontWeight: 700 }}>
                    {letterGrade(grade)}
                  </span>
                </div>
                <div style={{ background: CARD2, borderRadius: 3, height: 5, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${Math.min(grade, 100)}%`,
                    background: gradeColor(grade), borderRadius: 3,
                  }} />
                </div>
              </div>
            ) : (
              <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>No grade set.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Inner Tabs ── */}
      <div style={{
        padding: '0 24px',
        display: 'flex', gap: 2,
        borderBottom: `1px solid ${BORDER}`,
        marginTop: 20,
      }}>
        {[['assignments', 'Assignments'], ['notes', 'Study Notes'], ['concepts', 'Key Concepts'], ['schedule', 'Schedule']].map(([key, label]) => (
          <TabBtn key={key} active={tab === key} onClick={() => setTab(key)}>{label}</TabBtn>
        ))}
      </div>

      <div style={{ padding: '24px 24px' }}>

        {/* ════════════════════════════════════════
            TAB 1 — ASSIGNMENTS
        ════════════════════════════════════════ */}
        {tab === 'assignments' && (
          <>
            <SectionHeader title={`Assignments (${courseAssignments.length})`} onAdd={() => setModal('addAssignment')} addLabel="Add Assignment" />
            {courseAssignments.length === 0 ? (
              <EmptyMsg msg="No assignments yet. Add one to get started." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {courseAssignments.map((a) => {
                  const past  = isOverdue(a)
                  const isDone = a.status === 'done'
                  return (
                    <div key={a.id} style={{
                      background: CARD, border: `1px solid ${BORDER}`,
                      borderRadius: 10, padding: '12px 16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <input
                          type="checkbox" checked={isDone}
                          onChange={() => toggleAssignment(a)}
                          style={{ width: 16, height: 16, accentColor: ACCENT, flexShrink: 0, marginTop: 3 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            color: isDone ? MUTED : TEXT,
                            fontSize: 15, fontWeight: 600,
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}>
                            {a.title}
                          </span>
                          <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                            {a.due_date && (
                              <span style={{ color: past ? RED : MUTED, fontSize: 12 }}>
                                Due: {formatDate(a.due_date)}{past ? ' — Overdue' : ''}
                              </span>
                            )}
                            {a.grade_pct != null && (
                              <span style={{ color: '#10b981', fontSize: 12 }}>
                                Grade: {Number(a.grade_pct).toFixed(1)}%
                              </span>
                            )}
                            {a.notes && (
                              <span style={{ color: MUTED, fontSize: 12 }}>{a.notes}</span>
                            )}
                          </div>
                          {/* Grade input when just marked done */}
                          {editingGradeId === a.id && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                              <span style={{ color: MUTED, fontSize: 12 }}>Grade %:</span>
                              <input
                                value={assignGradeVal}
                                onChange={(e) => setAssignGrade(e.target.value)}
                                type="number" min="0" max="100" step="0.1"
                                placeholder="e.g. 92"
                                style={{ ...inputStyle(), width: 100, padding: '4px 8px', fontSize: 13 }}
                                autoFocus
                              />
                              <button onClick={() => saveAssignGrade(a.id)} style={{
                                padding: '4px 10px', borderRadius: 6, background: ACCENT,
                                border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12,
                              }}>
                                Save
                              </button>
                              <button onClick={() => setEditingGradeId(null)} style={{
                                padding: '4px 8px', borderRadius: 6, background: 'transparent',
                                border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer', fontSize: 12,
                              }}>
                                Skip
                              </button>
                            </div>
                          )}
                        </div>
                        <DeleteBtn onClick={() => edu.deleteAssignment(a.id)} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            TAB 2 — STUDY NOTES
        ════════════════════════════════════════ */}
        {tab === 'notes' && (
          <>
            <SectionHeader
              title={`Study Notes (${courseNotes.length})`}
              onAdd={() => navigate(`/education/${courseId}/notes/new`)}
              addLabel="Add Note"
            />
            {courseNotes.length === 0 ? (
              <EmptyMsg msg="No notes yet. Add your first study note." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {courseNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => navigate(`/education/${courseId}/notes/${note.id}/edit`)}
                    style={{
                      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
                      padding: '14px 16px', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: TEXT, fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>
                        {note.title}
                      </p>
                      {note.content && (
                        <p style={{
                          color: MUTED, fontSize: 13, margin: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {note.content}
                        </p>
                      )}
                      <span style={{ color: MUTED, fontSize: 11, marginTop: 4, display: 'block' }}>
                        {formatDate(note.created_at?.split('T')[0])}
                      </span>
                    </div>
                    <DeleteBtn onClick={(e) => { e.stopPropagation(); edu.deleteStudyNote(note.id) }} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            TAB 3 — KEY CONCEPTS
        ════════════════════════════════════════ */}
        {tab === 'concepts' && (
          <>
            <SectionHeader title={`Key Concepts (${courseConcepts.length})`} onAdd={() => setModal('addConcept')} addLabel="Add Concept" />
            {courseConcepts.length === 0 ? (
              <EmptyMsg msg="No key concepts yet. Add terms and definitions to build your flashcards." />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12,
              }}>
                {courseConcepts.map((concept) => (
                  <div key={concept.id} style={{
                    background: CARD, border: `1px solid ${BORDER}`,
                    borderRadius: 10, padding: 16,
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ color: TEXT, fontSize: 15, fontWeight: 700, margin: 0 }}>
                        {concept.term}
                      </p>
                      <DeleteBtn onClick={() => edu.deleteKeyConcept(concept.id)} />
                    </div>
                    {concept.definition ? (
                      <p style={{ color: MUTED, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                        {concept.definition}
                      </p>
                    ) : (
                      <p style={{ color: MUTED, fontSize: 13, margin: 0, fontStyle: 'italic' }}>
                        No definition.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            TAB 4 — SCHEDULE
        ════════════════════════════════════════ */}
        {tab === 'schedule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Planned Blocks */}
            <div>
              <SectionHeader title="Planned Blocks" onAdd={() => setModal('addBlock')} addLabel="Add Block" />
              {courseBlocks.length === 0 ? (
                <EmptyMsg msg="No recurring study blocks. Add weekly blocks to plan your schedule." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {courseBlocks.map((block) => (
                    <div key={block.id} style={{
                      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
                      padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{
                          background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                          padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600, minWidth: 90, textAlign: 'center',
                        }}>
                          {block.day_of_week}
                        </span>
                        <span style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>{block.start_time}</span>
                        <span style={{ color: MUTED, fontSize: 13 }}>{block.duration_minutes} min</span>
                      </div>
                      <DeleteBtn onClick={() => edu.deleteStudyBlock(block.id)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logged Sessions */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ color: TEXT, fontSize: 15, fontWeight: 700, margin: '0 0 2px' }}>Logged Sessions</h3>
                  <span style={{ color: MUTED, fontSize: 13 }}>
                    {courseSessions.length} session{courseSessions.length !== 1 ? 's' : ''} &mdash;&nbsp;
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>{totalHours}h</span> total
                  </span>
                </div>
                <button onClick={() => setModal('logSession')} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}>
                  <PlusIcon style={{ width: 14, height: 14 }} />
                  Log Session
                </button>
              </div>

              {courseSessions.length === 0 ? (
                <EmptyMsg msg="No sessions logged yet. Track your study time here." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {courseSessions.map((s) => (
                    <div key={s.id} style={{
                      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
                      padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>
                            {formatDate(s.session_date)}
                          </span>
                          <span style={{
                            background: 'rgba(16,185,129,0.1)', color: '#34d399',
                            padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 600,
                          }}>
                            {s.duration_minutes} min
                          </span>
                        </div>
                        {s.notes && (
                          <p style={{ color: MUTED, fontSize: 13, margin: '4px 0 0' }}>{s.notes}</p>
                        )}
                      </div>
                      <DeleteBtn onClick={() => edu.deleteStudySession(s.id)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal === 'addAssignment' && (
        <AddAssignmentModal courseId={courseId} onClose={() => setModal(null)} onAdd={edu.addAssignment} />
      )}
      {modal === 'addConcept' && (
        <AddConceptModal courseId={courseId} onClose={() => setModal(null)} onAdd={edu.addKeyConcept} />
      )}
      {modal === 'addBlock' && (
        <AddBlockModal courseId={courseId} onClose={() => setModal(null)} onAdd={edu.addStudyBlock} />
      )}
      {modal === 'logSession' && (
        <LogSessionModal courseId={courseId} onClose={() => setModal(null)} onLog={edu.logStudySession} />
      )}
      {showEditCourse && (
        <EditCourseModal
          course={course}
          onClose={() => setShowEditCourse(false)}
          onSave={(updates) => edu.updateCourse(courseId, updates)}
        />
      )}
    </div>
  )
}
