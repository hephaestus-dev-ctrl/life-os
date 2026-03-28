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
// weights: habits 40%, journal 20%, workout 30%, chores 10%

function computeDailyScore({ date, habitLogs, totalHabits, journals, workoutWeeks, weeklyWorkoutCounts, workoutDates, choreLogs, chores }) {

  // ── HABITS (0-100, weight 40%) ──
  const completedHabitIds = new Set(
    habitLogs
      .filter((l) => l.completed_date === date)
      .map((l) => l.habit_id)
  )
  const uniqueHabitsToday = completedHabitIds.size
  const habitPct = totalHabits > 0 ? uniqueHabitsToday / totalHabits : 0
  const habitsRaw = totalHabits === 0 ? 0
    : uniqueHabitsToday >= totalHabits ? 100
    : habitPct >= 0.8 ? 80
    : habitPct >= 0.6 ? 60
    : 0

  // ── JOURNAL (0-100, weight 20%) ──
  const journalEntry = journals.find((j) => j.entry_date === date)
  const journalRaw = journalEntry
    ? (journalEntry.entry_date ? 60 : 0)
      + (journalEntry.mood     ? 20 : 0)
      + (journalEntry.gratitude && journalEntry.gratitude.trim() ? 20 : 0)
    : 0

  // ── WORKOUTS (0-100 capped for score, raw can exceed 100, weight 30%) ──
  const week = isoWeekStart(date)
  const weekCount = weeklyWorkoutCounts[week] ?? 0
  const workedOutToday = workoutDates.has(date)
  const workoutRaw = workedOutToday ? 100 : 0
  const workoutDisplay = weekCount >= 6
    ? Math.round((weekCount / 6) * 100)
    : Math.round((weekCount / 6) * 100) || 0
  const onFire = weekCount >= 6

  // ── CHORES (0-100, weight 10%) ──
  // Only count chores that are due on this specific date
  const dateObj = new Date(date + 'T00:00:00')
  const dayOfWeek = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1 // Mon=0 Sun=6
  const WEEK_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

  const choresToday = chores.filter((c) => {
    if (c.cadence === 'daily') return true
    if (c.cadence === 'weekly') {
      if (!c.assigned_day) return true // no assigned day = due any day this week
      return WEEK_DAYS.indexOf(c.assigned_day) === dayOfWeek
    }
    if (c.cadence === 'monthly') {
      // Due on the 1st of each month
      return dateObj.getDate() === 1
    }
    return false
  })

  const completedTodayChores = choresToday.filter((c) =>
    choreLogs.some((l) => l.chore_id === c.id && l.completed_date === date)
  )

  const chorePct = choresToday.length > 0
    ? completedTodayChores.length / choresToday.length
    : 0

  const choresRaw = choresToday.length === 0 ? 0
    : chorePct === 1   ? 100
    : chorePct >= 0.8  ? 75
    : chorePct >= 0.6  ? 50
    : 25

  // ── FINAL SCORE (weighted, 0-100) ──
  const score = Math.min(100, Math.round(
    habitsRaw  * 0.40 +
    workoutRaw * 0.30 +
    journalRaw * 0.20 +
    choresRaw  * 0.10
  ))

  return {
    date,
    score,
    habits:         habitsRaw,
    journal:        journalRaw,
    workout:        workoutRaw,
    workoutDisplay, // raw display value — can exceed 100
    onFire,         // true when 6+ workouts this week
    chores:         choresRaw,
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
        supabase.from('journal_entries').select('entry_date, mood, gratitude').eq('user_id', userId).gte('entry_date', start).lte('entry_date', end),
        supabase.from('workout_sessions').select('session_date').eq('user_id', userId).gte('session_date', startExtra).lte('session_date', end),
        supabase.from('chores').select('id, title, cadence, assigned_day').eq('user_id', userId),
        supabase.from('chore_logs').select('chore_id, completed_date').eq('user_id', userId).gte('completed_date', start).lte('completed_date', end),
      ])

      const habits    = habitsRes.data ?? []
      const habitLogs = habitLogsRes.data ?? []
      const journals  = journalsRes.data ?? []
      const workouts  = workoutsRes.data ?? []
      const chores    = choresRes.data ?? []
      const choreLogs = choreLogsRes.data ?? []

      // Pre-compute lookup sets
      const workoutWeeks = new Set(workouts.map((w) => isoWeekStart(w.session_date)))

      const weeklyWorkoutCounts = {}
      for (const w of workouts) {
        const wk = isoWeekStart(w.session_date)
        weeklyWorkoutCounts[wk] = (weeklyWorkoutCounts[wk] ?? 0) + 1
      }

      // ── Daily scores ──────────────────────────────────────
      const workoutDates = new Set(workouts.map((w) => w.session_date))
      const allDates  = dateRange(start, end)
      const dailyScores = allDates.map((date) =>
        computeDailyScore({
          date,
          habitLogs,
          totalHabits: habits.length,
          journals,
          workoutWeeks,
          weeklyWorkoutCounts,
          workoutDates,
          choreLogs,
          chores,
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
