import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export function useWorkouts() {
  const [userId, setUserId] = useState(null)
  const [workouts, setWorkouts] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchData = useCallback(async (uid) => {
    const [workoutsRes, exercisesRes] = await Promise.all([
      supabase
        .from('workouts')
        .select('*')
        .eq('user_id', uid)
        .order('workout_date', { ascending: false }),
      supabase
        .from('workout_exercises')
        .select('*')
        .eq('user_id', uid)
        .order('created_at'),
    ])
    if (!workoutsRes.error) setWorkouts(workoutsRes.data ?? [])
    if (!exercisesRes.error) setExercises(exercisesRes.data ?? [])
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchData(userId).finally(() => setLoading(false))
  }, [userId, fetchData])

  const addWorkout = async ({ workout_date, title, workout_type, duration_minutes, notes, source }) => {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        workout_date,
        title: title || null,
        workout_type,
        duration_minutes: duration_minutes || null,
        notes: notes || null,
        source: source || 'manual',
      })
      .select()
      .single()
    if (!error) setWorkouts((prev) => [data, ...prev])
    return { data, error }
  }

  const updateWorkout = async (workoutId, updates) => {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)
      .select()
      .single()
    if (!error) setWorkouts((prev) => prev.map((w) => (w.id === workoutId ? data : w)))
    return { data, error }
  }

  const deleteWorkout = async (workoutId) => {
    const { error } = await supabase.from('workouts').delete().eq('id', workoutId)
    if (!error) {
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId))
      setExercises((prev) => prev.filter((e) => e.workout_id !== workoutId))
    }
    return { error }
  }

  const addExercise = async ({ workout_id, exercise_name, sets, reps, weight_lbs, notes }) => {
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({ workout_id, user_id: userId, exercise_name, sets, reps, weight_lbs, notes })
      .select()
      .single()
    if (!error) setExercises((prev) => [...prev, data])
    return { data, error }
  }

  const addExercisesBatch = async (exercisesArr) => {
    const rows = exercisesArr.map((ex) => ({ ...ex, user_id: userId }))
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert(rows)
      .select()
    if (!error) setExercises((prev) => [...prev, ...(data ?? [])])
    return { data, error }
  }

  const deleteExercise = async (exerciseId) => {
    const { error } = await supabase.from('workout_exercises').delete().eq('id', exerciseId)
    if (!error) setExercises((prev) => prev.filter((e) => e.id !== exerciseId))
    return { error }
  }

  const getWorkoutExercises = (workoutId) =>
    exercises.filter((e) => e.workout_id === workoutId)

  // Per-exercise history for progress charts, joined with workout date
  const getExerciseHistory = (exerciseName) =>
    exercises
      .filter((e) => e.exercise_name.toLowerCase() === exerciseName.toLowerCase())
      .map((e) => {
        const workout = workouts.find((w) => w.id === e.workout_id)
        return { ...e, workout_date: workout?.workout_date ?? null }
      })
      .filter((e) => e.workout_date)
      .sort((a, b) => a.workout_date.localeCompare(b.workout_date))

  // All unique exercise names across all workouts
  const allExerciseNames = [...new Set(exercises.map((e) => e.exercise_name))].sort()

  // Parse Tonal-style CSV: expects header row with Exercise/Name, Sets, Reps, Weight columns
  const parseTonalCSV = (csvText) => {
    const lines = csvText.trim().split('\n').filter((l) => l.trim())
    if (lines.length < 2) return []

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))
    const exerciseIdx = header.findIndex((h) => h.includes('exercise') || h.includes('name') || h === 'move')
    const setsIdx     = header.findIndex((h) => h.includes('set'))
    const repsIdx     = header.findIndex((h) => h.includes('rep'))
    const weightIdx   = header.findIndex((h) => h.includes('weight') || h.includes('lb') || h.includes('kg'))

    return lines
      .slice(1)
      .map((line) => {
        const cols = line.split(',').map((c) => c.trim().replace(/"/g, ''))
        const name = exerciseIdx >= 0 ? cols[exerciseIdx] : cols[0]
        if (!name) return null
        return {
          exercise_name: name,
          sets:       setsIdx   >= 0 ? (parseInt(cols[setsIdx])    || null) : null,
          reps:       repsIdx   >= 0 ? (parseInt(cols[repsIdx])    || null) : null,
          weight_lbs: weightIdx >= 0 ? (parseFloat(cols[weightIdx]) || null) : null,
        }
      })
      .filter(Boolean)
  }

  return {
    workouts,
    exercises,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addExercise,
    addExercisesBatch,
    deleteExercise,
    getWorkoutExercises,
    getExerciseHistory,
    allExerciseNames,
    parseTonalCSV,
  }
}
