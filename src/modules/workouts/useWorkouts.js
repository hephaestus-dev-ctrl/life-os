import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export function useWorkouts() {
  const [userId, setUserId] = useState(null)
  const [templates, setTemplates] = useState([])
  const [sessions, setSessions] = useState([])
  const [sessionExercises, setSessionExercises] = useState([])
  const [ladderStages, setLadderStages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchData = useCallback(async (uid) => {
    const [tRes, sRes, lRes] = await Promise.all([
      supabase
        .from('workout_templates')
        .select('*, template_exercises(*)')
        .eq('user_id', uid)
        .order('created_at', { ascending: false }),
      supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', uid)
        .order('session_date', { ascending: false }),
      supabase
        .from('swedish_ladder_stages')
        .select('*')
        .eq('user_id', uid)
        .order('started_at', { ascending: true }),
    ])

    if (!tRes.error) setTemplates(tRes.data ?? [])
    if (!lRes.error) setLadderStages(lRes.data ?? [])

    const sessionsData = sRes.data ?? []
    if (!sRes.error) setSessions(sessionsData)

    if (sessionsData.length > 0) {
      const ids = sessionsData.map((s) => s.id)
      const { data: seData } = await supabase
        .from('session_exercises')
        .select('*')
        .in('session_id', ids)
        .order('order_index')
      setSessionExercises(seData ?? [])
    } else {
      setSessionExercises([])
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchData(userId).finally(() => setLoading(false))
  }, [userId, fetchData])

  // ---- Templates ----

  const createTemplate = async ({ name, type, exercises }) => {
    const { data: tmpl, error } = await supabase
      .from('workout_templates')
      .insert({ name, type, user_id: userId })
      .select()
      .single()
    if (error) return { error }

    if (exercises?.length) {
      const rows = exercises.map((ex, i) => ({
        template_id: tmpl.id,
        exercise_name: ex.exercise_name,
        sets: ex.sets ?? null,
        reps: ex.reps ?? null,
        order_index: i,
      }))
      await supabase.from('template_exercises').insert(rows)
    }

    await fetchData(userId)
    return { data: tmpl }
  }

  const deleteTemplate = async (templateId) => {
    const { error } = await supabase.from('workout_templates').delete().eq('id', templateId)
    if (!error) setTemplates((prev) => prev.filter((t) => t.id !== templateId))
  }

  // ---- Sessions ----

  const logSession = async ({ templateId, sessionDate, notes, exercises }) => {
    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        template_id: templateId || null,
        session_date: sessionDate,
        notes: notes || null,
      })
      .select()
      .single()
    if (error) return { error }

    if (exercises?.length) {
      const rows = exercises.map((ex, i) => ({
        session_id: session.id,
        exercise_name: ex.exercise_name,
        planned_sets: ex.planned_sets ?? null,
        planned_reps: ex.planned_reps ?? null,
        actual_weight_lbs:
          ex.actual_weight_lbs != null && ex.actual_weight_lbs !== ''
            ? Number(ex.actual_weight_lbs)
            : null,
        notes: ex.notes ?? null,
        order_index: i,
      }))
      await supabase.from('session_exercises').insert(rows)
    }

    await fetchData(userId)
    return { data: session }
  }

  const deleteSession = async (sessionId) => {
    const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId)
    if (!error) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      setSessionExercises((prev) => prev.filter((se) => se.session_id !== sessionId))
    }
  }

  const getSessionExercises = (sessionId) =>
    sessionExercises
      .filter((se) => se.session_id === sessionId)
      .sort((a, b) => a.order_index - b.order_index)

  // ---- Swedish Ladder ----

  const currentStage = ladderStages.length ? ladderStages[ladderStages.length - 1] : null

  const advanceStage = async () => {
    const nextStage = (currentStage?.stage_number ?? 0) + 1
    const { data, error } = await supabase
      .from('swedish_ladder_stages')
      .insert({ user_id: userId, stage_number: nextStage })
      .select()
      .single()
    if (!error) setLadderStages((prev) => [...prev, data])
    return { data, error }
  }

  const setStage = async (stageNumber) => {
    const { data, error } = await supabase
      .from('swedish_ladder_stages')
      .insert({ user_id: userId, stage_number: stageNumber })
      .select()
      .single()
    if (!error) setLadderStages((prev) => [...prev, data])
    return { data, error }
  }

  // ---- Progress ----

  const getExerciseProgress = (exerciseName) => {
    if (!exerciseName) return []
    const lower = exerciseName.toLowerCase()
    return sessionExercises
      .filter((se) => se.exercise_name.toLowerCase() === lower && se.actual_weight_lbs != null)
      .map((se) => {
        const session = sessions.find((s) => s.id === se.session_id)
        return session ? { date: session.session_date, weight: Number(se.actual_weight_lbs) } : null
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const allExerciseNames = [
    ...new Set(
      templates.flatMap((t) => (t.template_exercises ?? []).map((te) => te.exercise_name))
    ),
  ].sort()

  return {
    templates,
    sessions,
    sessionExercises,
    ladderStages,
    currentStage,
    loading,
    createTemplate,
    deleteTemplate,
    logSession,
    deleteSession,
    getSessionExercises,
    getExerciseProgress,
    advanceStage,
    setStage,
    allExerciseNames,
    refresh: () => userId && fetchData(userId),
  }
}
