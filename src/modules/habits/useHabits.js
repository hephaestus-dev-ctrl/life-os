import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function getLast30Days() {
  const dates = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export function useHabits() {
  const [userId, setUserId] = useState(null)
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchData = useCallback(async (uid) => {
    const [habitsRes, logsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('habit_logs').select('*').eq('user_id', uid).order('completed_date'),
    ])
    if (!habitsRes.error) setHabits(habitsRes.data ?? [])
    if (!logsRes.error) setLogs(logsRes.data ?? [])
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchData(userId).finally(() => setLoading(false))
  }, [userId, fetchData])

  // ---- mutations ----

  const addHabit = async ({ name, category, routine_type, routine_order }) => {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name,
        category,
        routine_type: routine_type || null,
        routine_order: routine_type ? (routine_order || 1) : 0,
      })
      .select()
      .single()
    if (!error) setHabits((prev) => [...prev, data])
    return { error }
  }

  const deleteHabit = async (habitId) => {
    const { error } = await supabase.from('habits').delete().eq('id', habitId)
    if (!error) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
      setLogs((prev) => prev.filter((l) => l.habit_id !== habitId))
    }
    return { error }
  }

  const toggleLog = async (habitId, date = todayStr()) => {
    const existing = logs.find((l) => l.habit_id === habitId && l.completed_date === date)
    if (existing) {
      const { error } = await supabase.from('habit_logs').delete().eq('id', existing.id)
      if (!error) setLogs((prev) => prev.filter((l) => l.id !== existing.id))
    } else {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: userId, completed_date: date })
        .select()
        .single()
      if (!error) setLogs((prev) => [...prev, data])
    }
  }

  // ---- derived ----

  const isCompleted = (habitId, date = todayStr()) =>
    logs.some((l) => l.habit_id === habitId && l.completed_date === date)

  const getStreaks = (habitId) => {
    const dates = logs
      .filter((l) => l.habit_id === habitId)
      .map((l) => l.completed_date)
      .sort()

    if (!dates.length) return { current: 0, longest: 0 }

    // current streak — walk backwards from today
    let current = 0
    const cursor = new Date()
    while (true) {
      const ds = cursor.toISOString().slice(0, 10)
      if (dates.includes(ds)) {
        current++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    }

    // longest streak ever
    let longest = 1
    let run = 1
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000
      if (diff === 1) {
        run++
        if (run > longest) longest = run
      } else {
        run = 1
      }
    }

    return { current, longest: Math.max(longest, current) }
  }

  const todaySummary = () => {
    const regular = habits.filter((h) => !h.routine_type)
    const completed = regular.filter((h) => isCompleted(h.id)).length
    return { completed, total: regular.length }
  }

  return {
    habits,
    logs,
    loading,
    today: todayStr(),
    getLast30Days,
    addHabit,
    deleteHabit,
    toggleLog,
    isCompleted,
    getStreaks,
    todaySummary,
  }
}
