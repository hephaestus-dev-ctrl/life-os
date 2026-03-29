import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
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

const PRESET_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b',
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function letterGrade(pct) {
  if (pct == null) return null
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    in_progress: { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', label: 'In Progress' },
    finished:    { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', label: 'Finished'    },
    wishlist:    { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', label: 'Wishlist'    },
  }
  const s = map[status] ?? { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', label: status }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
    }}>
      {s.label}
    </span>
  )
}

function TypeBadge({ type }) {
  const isCollege = type === 'college'
  return (
    <span style={{
      background: isCollege ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
      color: isCollege ? COLLEGE : SELFP,
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
    }}>
      {isCollege ? 'College' : 'Self-Paced'}
    </span>
  )
}

function inputStyle(extra = {}) {
  return {
    width: '100%', background: CARD2, border: `1px solid ${BORDER}`,
    borderRadius: 8, padding: '8px 12px', color: TEXT, fontSize: 14,
    outline: 'none', boxSizing: 'border-box', ...extra,
  }
}

// ── Add Course Modal ──────────────────────────────────────────────────────────
function AddCourseModal({ onClose, onAdd, defaultType = 'college' }) {
  const [name, setCName]           = useState('')
  const [provider, setProvider]   = useState('')
  const [courseType, setType]      = useState(defaultType)
  const [status, setStatus]        = useState('in_progress')
  const [url, setUrl]              = useState('')
  const [startedAt, setStartedAt]  = useState('')
  const [color, setColor]          = useState('#6366f1')
  const [saving, setSaving]        = useState(false)
  const [error, setError]          = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const { error } = await onAdd({
      name: name.trim(),
      provider: provider.trim() || null,
      course_type: courseType,
      status,
      url: url.trim() || null,
      started_at: startedAt || null,
      color,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: 12, padding: 24, width: '100%', maxWidth: 480,
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: TEXT, fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>
          Add Course
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Course Name *</label>
            <input
              value={name} onChange={(e) => setCName(e.target.value)}
              required placeholder="e.g. Linear Algebra"
              style={inputStyle()}
            />
          </div>
          <div>
            <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Provider / Institution</label>
            <input
              value={provider} onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. MIT OpenCourseWare"
              style={inputStyle()}
            />
          </div>
          <div>
            <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 6 }}>Course Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['college', 'College'], ['self_paced', 'Self-Paced']].map(([val, lbl]) => {
                const active = courseType === val
                const c = val === 'college' ? COLLEGE : SELFP
                return (
                  <button key={val} type="button" onClick={() => setType(val)} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: `1px solid ${active ? c : BORDER}`,
                    background: active ? (val === 'college' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)') : 'transparent',
                    color: active ? c : MUTED, cursor: 'pointer',
                  }}>
                    {lbl}
                  </button>
                )
              })}
            </div>
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
            <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>URL (optional)</label>
            <input
              value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..." type="url"
              style={inputStyle()}
            />
          </div>
          <div>
            <label style={{ color: MUTED, fontSize: 12, display: 'block', marginBottom: 4 }}>Start Date (optional)</label>
            <input
              value={startedAt} onChange={(e) => setStartedAt(e.target.value)}
              type="date" style={inputStyle({ colorScheme: 'dark' })}
            />
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
                    boxShadow: color === c ? `0 0 0 2px #0f1117, 0 0 0 4px #fff` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              padding: '8px 16px', borderRadius: 8, background: 'transparent',
              border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer', fontSize: 14,
            }}>Cancel</button>
            <button type="submit" disabled={saving || !name.trim()} style={{
              padding: '8px 20px', borderRadius: 8, background: ACCENT,
              border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              opacity: saving || !name.trim() ? 0.6 : 1,
            }}>
              {saving ? 'Saving…' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Education() {
  const edu      = useEducation()
  const navigate = useNavigate()
  const [tab, setTab]               = useState('college')
  const [filter, setFilter]         = useState('all')
  const [showAddCourse, setAdd]     = useState(false)

  const switchTab = (key) => { setTab(key); setFilter('all') }

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

  const typedCourses =
    tab === 'college'    ? edu.courses.filter((c) => c.course_type === 'college') :
    tab === 'self_paced' ? edu.courses.filter((c) => c.course_type === 'self_paced') :
    edu.courses
  const filteredCourses =
    filter === 'all' ? typedCourses : typedCourses.filter((c) => c.status === filter)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming  = edu.assignments.filter((a) => a.status === 'pending' && (!a.due_date || new Date(a.due_date + 'T00:00:00') >= today))
  const overdue   = edu.assignments.filter((a) => a.status === 'pending' && a.due_date && new Date(a.due_date + 'T00:00:00') < today)
  const completed = edu.assignments.filter((a) => a.status === 'done')

  const getCourse = (id) => edu.courses.find((c) => c.id === id)

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 48 }}>
      {/* ── Header ── */}
      <div style={{ padding: '24px 24px 0' }}>
        <h1 style={{ color: TEXT, fontSize: 26, fontWeight: 700, margin: 0 }}>Education</h1>
        <p style={{ color: MUTED, fontSize: 14, margin: '4px 0 0' }}>
          Courses, assignments, and study tracking.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        padding: '20px 24px 0',
        display: 'flex', gap: 2,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {[['college', 'College'], ['self_paced', 'Self-Paced'], ['assignments', 'Assignments']].map(([key, label]) => (
          <button key={key} onClick={() => switchTab(key)} style={{
            padding: '8px 22px',
            borderRadius: '8px 8px 0 0',
            fontSize: 14, fontWeight: 600,
            background: tab === key ? CARD : 'transparent',
            color: tab === key ? TEXT : MUTED,
            border: tab === key ? `1px solid ${BORDER}` : '1px solid transparent',
            borderBottom: tab === key ? `1px solid ${CARD}` : `1px solid transparent`,
            cursor: 'pointer', marginBottom: -1,
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 24px' }}>

        {/* ════════════════════════════════════════
            COLLEGE / SELF-PACED TABS
        ════════════════════════════════════════ */}
        {(tab === 'college' || tab === 'self_paced') && (
          <>
            {/* Filter row + Add button */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24,
            }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[['all', 'All'], ['in_progress', 'In Progress'], ['finished', 'Finished'], ['wishlist', 'Wishlist']].map(([key, label]) => (
                  <button key={key} onClick={() => setFilter(key)} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: filter === key ? ACCENT : CARD2,
                    color: filter === key ? '#fff' : MUTED,
                    border: `1px solid ${filter === key ? ACCENT : BORDER}`,
                    cursor: 'pointer',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={() => setAdd(tab)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8, background: ACCENT,
                border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}>
                <PlusIcon style={{ width: 16, height: 16 }} />
                Add Course
              </button>
            </div>

            {/* Course cards */}
            {filteredCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: MUTED }}>
                <p style={{ fontSize: 16, margin: '0 0 6px' }}>No courses found.</p>
                {filter === 'all' && (
                  <p style={{ fontSize: 13, margin: 0 }}>Click "Add Course" to get started.</p>
                )}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 16,
              }}>
                {filteredCourses.map((course) => {
                  const courseAssignments = edu.assignments.filter((a) => a.course_id === course.id)
                  const courseNotes       = edu.studyNotes.filter((n) => n.course_id === course.id)
                  const courseConcepts    = edu.keyConcepts.filter((k) => k.course_id === course.id)
                  const typeColor         = course.color || COLLEGE
                  const grade             = course.grade_pct != null ? Number(course.grade_pct) : null

                  return (
                    <div key={course.id} style={{
                      background: CARD,
                      border: `1px solid ${BORDER}`,
                      borderLeft: `4px solid ${typeColor}`,
                      borderRadius: 12,
                      padding: 20,
                      display: 'flex', flexDirection: 'column', gap: 14,
                    }}>
                      {/* Name + provider */}
                      <div>
                        <h3 style={{ color: TEXT, fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
                          {course.name}
                        </h3>
                        {course.provider && (
                          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>{course.provider}</p>
                        )}
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <StatusBadge status={course.status} />
                        <TypeBadge type={course.course_type} />
                      </div>

                      {/* Grade */}
                      {grade != null && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ color: MUTED, fontSize: 13 }}>Grade</span>
                            <span style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>
                              {grade.toFixed(1)}% &mdash; {letterGrade(grade)}
                            </span>
                          </div>
                          <div style={{ background: CARD2, borderRadius: 4, height: 6, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(grade, 100)}%`,
                              background: grade >= 70 ? '#10b981' : grade >= 60 ? '#f59e0b' : '#ef4444',
                              borderRadius: 4, transition: 'width 0.4s ease',
                            }} />
                          </div>
                        </div>
                      )}

                      {/* Quick stats */}
                      <div style={{ display: 'flex', gap: 20 }}>
                        {[
                          ['Assignments', courseAssignments.length],
                          ['Notes',       courseNotes.length],
                          ['Concepts',    courseConcepts.length],
                        ].map(([label, count]) => (
                          <div key={label} style={{ textAlign: 'center' }}>
                            <span style={{ color: TEXT, fontSize: 18, fontWeight: 700, display: 'block' }}>
                              {count}
                            </span>
                            <span style={{ color: MUTED, fontSize: 11 }}>{label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Open */}
                      <button
                        onClick={() => navigate(`/education/${course.id}`)}
                        style={{
                          padding: '8px 0', borderRadius: 8,
                          background: `${typeColor}1a`,
                          border: `1px solid ${typeColor}40`,
                          color: typeColor, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        }}
                      >
                        Open →
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            ASSIGNMENTS TAB
        ════════════════════════════════════════ */}
        {tab === 'assignments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {[
              { label: 'Overdue',   items: overdue,   dotColor: '#ef4444' },
              { label: 'Upcoming',  items: upcoming,  dotColor: ACCENT    },
              { label: 'Completed', items: completed, dotColor: '#10b981' },
            ].map(({ label, items, dotColor }) => (
              <section key={label}>
                <h3 style={{
                  color: TEXT, fontSize: 14, fontWeight: 700,
                  margin: '0 0 12px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{
                    width: 8, height: 8, background: dotColor,
                    borderRadius: '50%', display: 'inline-block', flexShrink: 0,
                  }} />
                  {label}
                  <span style={{ color: MUTED, fontSize: 13, fontWeight: 400 }}>
                    ({items.length})
                  </span>
                </h3>

                {items.length === 0 ? (
                  <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>None.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map((a) => {
                      const course    = getCourse(a.course_id)
                      const typeColor = course?.color || COLLEGE
                      const pastDue   = a.due_date && new Date(a.due_date + 'T00:00:00') < today && a.status === 'pending'

                      return (
                        <div key={a.id} style={{
                          background: CARD, border: `1px solid ${BORDER}`,
                          borderRadius: 10, padding: '12px 16px',
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                        }}>
                          <input
                            type="checkbox"
                            checked={a.status === 'done'}
                            onChange={() =>
                              edu.updateAssignment(a.id, { status: a.status === 'done' ? 'pending' : 'done' })
                            }
                            style={{ width: 16, height: 16, accentColor: ACCENT, flexShrink: 0, marginTop: 2 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                              {course && (
                                <span style={{
                                  display: 'flex', alignItems: 'center', gap: 4,
                                  color: MUTED, fontSize: 12,
                                }}>
                                  <span style={{
                                    width: 6, height: 6, background: typeColor,
                                    borderRadius: '50%', display: 'inline-block',
                                  }} />
                                  {course.name}
                                </span>
                              )}
                              <span style={{
                                color: a.status === 'done' ? MUTED : TEXT,
                                fontSize: 14, fontWeight: 600,
                                textDecoration: a.status === 'done' ? 'line-through' : 'none',
                              }}>
                                {a.title}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 14 }}>
                              {a.due_date && (
                                <span style={{ color: pastDue ? '#ef4444' : MUTED, fontSize: 12 }}>
                                  Due: {formatDate(a.due_date)}{pastDue ? ' — Overdue' : ''}
                                </span>
                              )}
                              {a.grade_pct != null && (
                                <span style={{ color: '#10b981', fontSize: 12 }}>
                                  Grade: {Number(a.grade_pct).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      {showAddCourse && (
        <AddCourseModal onClose={() => setAdd(false)} onAdd={edu.addCourse} defaultType={showAddCourse} />
      )}
    </div>
  )
}
