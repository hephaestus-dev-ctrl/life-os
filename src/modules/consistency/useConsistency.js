import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

// ── Date helpers ──────────────────────────────────────────────

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function daysAgoStr(n) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
}

export function isoWeekStart(dateStr) {
  const d   = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function dateRange(startStr, endStr) {
  const dates = []
  const cur   = new Date(startStr + 'T00:00:00')
  const end   = new Date(endStr   + 'T00:00:00')
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

// Mood string → numeric value
function moodValue(mood) {
  const map = { great: 5, good: 4, okay: 3, neutral: 3, bad: 2, terrible: 1, awful: 1 }
  return map[(mood ?? '').toLowerCase()] ?? null
}

// ── Score calculation ─────────────────────────────────────────
// weights: habits 40%, journal 20%, workout 20%, chores 20%

function computeDailyScore({ date, habitLogs, totalHabits, journalSet, workoutWeeks, choreLogSet }) {
  const habitsScore = totalHabits > 0
    ? Math.round((habitLogs.filter((l) => l.completed_date === date).length / totalHabits) * 40)
    : 0

  const journalScore = journalSet.has(date) ? 20 : 0

  const week = isoWeekStart(date)
  const workoutScore = workoutWeeks.has(week) ? 20 : 0

  const choreScore = choreLogSet.has(date) ? 20 : 0

  return {
    date,
    score:   habitsScore + journalScore + workoutScore + choreScore,
    habits:  habitsScore,
    journal: journalScore,
    workout: workoutScore,
    chores:  choreScore,
  }
}

// ── Streak helpers ────────────────────────────────────────────

function computeStreaks(dailyScores) {
  // streak = consecutive days with score > 0 (at least something done)
  let current = 0
  let best    = 0
  let run     = 0

  for (let i = dailyScores.length - 1; i >= 0; i--) {
    if (dailyScores[i].score > 0) {
      if (i === dailyScores.length - 1) current++   // counting backwards from today
      run++
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }

  // Re-compute current streak from the end of the array (today = last entry)
  current = 0
  for (let i = dailyScores.length - 1; i >= 0; i--) {
    if (dailyScores[i].score > 0) current++
    else break
  }

  return { current, best }
}

// ── Main hook ─────────────────────────────────────────────────

export function useConsistency(userId, days = 30) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    try {
      const end   = todayStr()
      const start = daysAgoStr(days - 1)
      // Extra buffer for workouts (need prev week data for first day's ISO-week)
      const startExtra = daysAgoStr(days + 6)

      const [
        habitsRes, habitLogsRes,
        journalsRes,
        workoutsRes,
        choresRes, choreLogsRes,
      ] = await Promise.all([
        supabase.from('habits').select('id, name').eq('user_id', userId).is('routine_type', null),
        supabase.from('habit_logs').select('habit_id, completed_date').eq('user_id', userId).gte('completed_date', start).lte('completed_date', end),
        supabase.from('journal_entries').select('entry_date, mood').eq('user_id', userId).gte('entry_date', start).lte('entry_date', end),
        supabase.from('workout_sessions').select('session_date').eq('user_id', userId).gte('session_date', startExtra).lte('session_date', end),
        supabase.from('chores').select('id, title, cadence').eq('user_id', userId),
        supabase.from('chore_logs').select('chore_id, completed_date').eq('user_id', userId).gte('completed_date', start).lte('completed_date', end),
      ])

      const habits    = habitsRes.data ?? []
      const habitLogs = habitLogsRes.data ?? []
      const journals  = journalsRes.data ?? []
      const workouts  = workoutsRes.data ?? []
      const chores    = choresRes.data ?? []
      const choreLogs = choreLogsRes.data ?? []

      // Pre-compute lookup sets
      const journalSet   = new Set(journals.map((j) => j.entry_date))
      const workoutWeeks = new Set(workouts.map((w) => isoWeekStart(w.session_date)))
      const choreLogSet  = new Set(choreLogs.map((l) => l.completed_date))

      // ── Daily scores ──────────────────────────────────────
      const allDates  = dateRange(start, end)
      const dailyScores = allDates.map((date) =>
        computeDailyScore({
          date,
          habitLogs,
          totalHabits: habits.length,
          journalSet,
          workoutWeeks,
          choreLogSet,
        })
      )

      // Today's breakdown
      const todayScore = dailyScores[dailyScores.length - 1] ?? {
        date: end, score: 0, habits: 0, journal: 0, workout: 0, chores: 0,
      }

      // ── Habit stats ───────────────────────────────────────
      const habitCompletionMap = {}
      for (const log of habitLogs) {
        habitCompletionMap[log.habit_id] = (habitCompletionMap[log.habit_id] ?? 0) + 1
      }
      const habitStats = {
        completionRate: habits.length > 0
          ? Math.round(
              (habitLogs.length / (habits.length * days)) * 100
            )
          : 0,
        habits: habits.map((h) => ({
          name: h.name,
          completions: habitCompletionMap[h.id] ?? 0,
          rate: habits.length > 0
            ? Math.round(((habitCompletionMap[h.id] ?? 0) / days) * 100)
            : 0,
        })),
        ...computeStreaks(dailyScores),
      }

      // ── Journal stats ─────────────────────────────────────
      const moodTrend = journals
        .filter((j) => j.mood)
        .map((j) => ({ date: j.entry_date, mood: j.mood, value: moodValue(j.mood) }))
        .filter((j) => j.value !== null)
        .sort((a, b) => a.date.localeCompare(b.date))

      const journalStats = {
        entriesCount: journals.length,
        moodTrend,
      }

      // ── Workout stats: sessions per week (last 8 weeks) ───
      const weekCounts = {}
      for (const w of workouts) {
        const wk = isoWeekStart(w.session_date)
        weekCounts[wk] = (weekCounts[wk] ?? 0) + 1
      }
      const sortedWeeks = Object.keys(weekCounts).sort()
      const sessionsPerWeek = sortedWeeks.map((wk) => ({
        week: wk,
        count: weekCounts[wk],
      }))

      const workoutStats = { sessionsPerWeek }

      // ── Chore stats ───────────────────────────────────────
      const completedChoreIds = new Set(choreLogs.map((l) => l.chore_id))
      const choreStats = {
        onTimeRate: chores.length > 0
          ? Math.round((completedChoreIds.size / chores.length) * 100)
          : null,
        total:     chores.length,
        completed: completedChoreIds.size,
      }

      setData({
        todayScore,
        dailyScores,
        habitStats,
        journalStats,
        workoutStats,
        choreStats,
      })
    } finally {
      setLoading(false)
    }
  }, [userId, days])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, refetch: fetch }
}
