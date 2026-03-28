import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export function useEducation() {
  const [userId, setUserId] = useState(null)
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [studyNotes, setStudyNotes] = useState([])
  const [keyConcepts, setKeyConcepts] = useState([])
  const [studyBlocks, setStudyBlocks] = useState([])
  const [studySessions, setStudySessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchAll = useCallback(async (uid) => {
    const [
      { data: coursesData },
      { data: assignmentsData },
      { data: notesData },
      { data: conceptsData },
      { data: blocksData },
      { data: sessionsData },
    ] = await Promise.all([
      supabase.from('courses').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('assignments').select('*').eq('user_id', uid).order('due_date', { ascending: true }),
      supabase.from('study_notes').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('key_concepts').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('study_blocks').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('study_sessions').select('*').eq('user_id', uid).order('session_date', { ascending: false }),
    ])
    setCourses(coursesData ?? [])
    setAssignments(assignmentsData ?? [])
    setStudyNotes(notesData ?? [])
    setKeyConcepts(conceptsData ?? [])
    setStudyBlocks(blocksData ?? [])
    setStudySessions(sessionsData ?? [])
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchAll(userId).finally(() => setLoading(false))
  }, [userId, fetchAll])

  // ── Courses ──────────────────────────────────────────────────────────────

  const addCourse = async (payload) => {
    const { data, error } = await supabase
      .from('courses')
      .insert({ user_id: userId, ...payload })
      .select()
      .single()
    if (!error) setCourses((prev) => [data, ...prev])
    return { data, error }
  }

  const updateCourse = async (id, payload) => {
    const { data, error } = await supabase
      .from('courses')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (!error) setCourses((prev) => prev.map((c) => (c.id === id ? data : c)))
    return { data, error }
  }

  const deleteCourse = async (id) => {
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (!error) {
      setCourses((prev) => prev.filter((c) => c.id !== id))
      setAssignments((prev) => prev.filter((a) => a.course_id !== id))
      setStudyNotes((prev) => prev.filter((n) => n.course_id !== id))
      setKeyConcepts((prev) => prev.filter((k) => k.course_id !== id))
      setStudyBlocks((prev) => prev.filter((b) => b.course_id !== id))
      setStudySessions((prev) => prev.filter((s) => s.course_id !== id))
    }
    return { error }
  }

  // ── Assignments ──────────────────────────────────────────────────────────

  const addAssignment = async (payload) => {
    const { data, error } = await supabase
      .from('assignments')
      .insert({ user_id: userId, ...payload })
      .select()
      .single()
    if (!error) {
      setAssignments((prev) =>
        [...prev, data].sort((a, b) => {
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date) - new Date(b.due_date)
        })
      )
    }
    return { data, error }
  }

  const updateAssignment = async (id, payload) => {
    const { data, error } = await supabase
      .from('assignments')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (!error) setAssignments((prev) => prev.map((a) => (a.id === id ? data : a)))
    return { data, error }
  }

  const deleteAssignment = async (id) => {
    const { error } = await supabase.from('assignments').delete().eq('id', id)
    if (!error) setAssignments((prev) => prev.filter((a) => a.id !== id))
    return { error }
  }

  // ── Study Notes ──────────────────────────────────────────────────────────

  const addStudyNote = async (payload) => {
    const { data, error } = await supabase
      .from('study_notes')
      .insert({ user_id: userId, ...payload })
      .select()
      .single()
    if (!error) setStudyNotes((prev) => [data, ...prev])
    return { data, error }
  }

  const deleteStudyNote = async (id) => {
    const { error } = await supabase.from('study_notes').delete().eq('id', id)
    if (!error) setStudyNotes((prev) => prev.filter((n) => n.id !== id))
    return { error }
  }

  // ── Key Concepts ─────────────────────────────────────────────────────────

  const addKeyConcept = async (payload) => {
    const { data, error } = await supabase
      .from('key_concepts')
      .insert({ user_id: userId, ...payload })
      .select()
      .single()
    if (!error) setKeyConcepts((prev) => [data, ...prev])
    return { data, error }
  }

  const deleteKeyConcept = async (id) => {
    const { error } = await supabase.from('key_concepts').delete().eq('id', id)
    if (!error) setKeyConcepts((prev) => prev.filter((k) => k.id !== id))
    return { error }
  }

  // ── Study Blocks ─────────────────────────────────────────────────────────

  const addStudyBlock = async (payload) => {
    const { data, error } = await supabase
      .from('study_blocks')
      .insert({ user_id: userId, ...payload })
      .select()
      .single()
    if (!error) setStudyBlocks((prev) => [data, ...prev])
    return { data, error }
  }

  const deleteStudyBlock = async (id) => {
    const { error } = await supabase.from('study_blocks').delete().eq('id', id)
    if (!error) setStudyBlocks((prev) => prev.filter((b) => b.id !== id))
    return { error }
  }

  // ── Study Sessions ────────────────────────────────────────────────────────

  const logStudySession = async (payload) => {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({ user_id: userId, ...payload })
      .select()
      .single()
    if (!error) setStudySessions((prev) => [data, ...prev])
    return { data, error }
  }

  const deleteStudySession = async (id) => {
    const { error } = await supabase.from('study_sessions').delete().eq('id', id)
    if (!error) setStudySessions((prev) => prev.filter((s) => s.id !== id))
    return { error }
  }

  return {
    loading,
    userId,
    courses,
    assignments,
    studyNotes,
    keyConcepts,
    studyBlocks,
    studySessions,
    addCourse,
    updateCourse,
    deleteCourse,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addStudyNote,
    deleteStudyNote,
    addKeyConcept,
    deleteKeyConcept,
    addStudyBlock,
    deleteStudyBlock,
    logStudySession,
    deleteStudySession,
  }
}
