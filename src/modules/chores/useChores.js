import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// ISO week start — Monday of the current week
function weekStartStr() {
  const d = new Date()
  const day = d.getDay() // 0=Sun, 1=Mon, …
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

// First day of the current month
function monthStartStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

const WEEK_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function dayIndex(name) {
  return WEEK_DAYS.indexOf(name) // Mon=0 … Sun=6, -1 if not found
}

function todayDayIndex() {
  const d = new Date().getDay() // 0=Sun
  return d === 0 ? 6 : d - 1   // Mon=0 … Sun=6
}

export function useChores() {
  const [userId, setUserId] = useState(null)
  const [chores, setChores] = useState([])
  const [logs, setLogs]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchData = useCallback(async (uid) => {
    const [choresRes, logsRes] = await Promise.all([
      supabase.from('chores').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('chore_logs').select('*').eq('user_id', uid).order('completed_date'),
    ])
    if (!choresRes.error) setChores(choresRes.data ?? [])
    if (!logsRes.error)   setLogs(logsRes.data ?? [])
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchData(userId).finally(() => setLoading(false))
  }, [userId, fetchData])

  // ---- mutations ----

  const addChore = async ({ title, cadence, assigned_day }) => {
    const { data, error } = await supabase
      .from('chores')
      .insert({
        user_id: userId,
        title,
        cadence,
        assigned_day: cadence === 'weekly' ? (assigned_day || null) : null,
      })
      .select()
      .single()
    if (!error) setChores((prev) => [...prev, data])
    return { error }
  }

  const deleteChore = async (choreId) => {
    const { error } = await supabase.from('chores').delete().eq('id', choreId)
    if (!error) {
      setChores((prev) => prev.filter((c) => c.id !== choreId))
      setLogs((prev) => prev.filter((l) => l.chore_id !== choreId))
    }
    return { error }
  }

  const toggleLog = async (choreId, cadence) => {
    const periodStart = cadence === 'daily'   ? todayStr()
                      : cadence === 'weekly'  ? weekStartStr()
                      : monthStartStr()

    const existing = logs.find(
      (l) => l.chore_id === choreId && l.completed_date >= periodStart
    )

    if (existing) {
      const { error } = await supabase.from('chore_logs').delete().eq('id', existing.id)
      if (!error) setLogs((prev) => prev.filter((l) => l.id !== existing.id))
    } else {
      const { data, error } = await supabase
        .from('chore_logs')
        .insert({ chore_id: choreId, user_id: userId, completed_date: todayStr() })
        .select()
        .single()
      if (!error) setLogs((prev) => [...prev, data])
    }
  }

  // ---- derived ----

  const isCompletedInPeriod = (choreId, cadence) => {
    const periodStart = cadence === 'daily'   ? todayStr()
                      : cadence === 'weekly'  ? weekStartStr()
                      : monthStartStr()
    return logs.some((l) => l.chore_id === choreId && l.completed_date >= periodStart)
  }

  const isOverdue = (chore) => {
    if (isCompletedInPeriod(chore.id, chore.cadence)) return false

    if (chore.cadence === 'daily') return true

    if (chore.cadence === 'weekly') {
      if (!chore.assigned_day) {
        // No specific day — overdue if it's past Monday with no completion
        return todayStr() > weekStartStr()
      }
      // Overdue if today's weekday index is past the assigned day's index
      return todayDayIndex() > dayIndex(chore.assigned_day)
    }

    if (chore.cadence === 'monthly') {
      // Overdue if we're past the 1st and it hasn't been done this month
      return new Date().getDate() > 1
    }

    return false
  }

  const getLastCompleted = (choreId) => {
    const c = logs
      .filter((l) => l.chore_id === choreId)
      .sort((a, b) => b.completed_date.localeCompare(a.completed_date))
    return c.length ? c[0].completed_date : null
  }

  return {
    chores,
    loading,
    addChore,
    deleteChore,
    toggleLog,
    isCompletedInPeriod,
    isOverdue,
    getLastCompleted,
  }
}
