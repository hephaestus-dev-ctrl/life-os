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

export function useJournal() {
  const [userId, setUserId] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchData = useCallback(async (uid) => {
    const thirtyDaysAgo = getLast30Days()[0]
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', uid)
      .gte('entry_date', thirtyDaysAgo)
      .order('entry_date', { ascending: false })
    if (!error) setEntries(data ?? [])
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchData(userId).finally(() => setLoading(false))
  }, [userId, fetchData])

  const getEntryForDate = (date) => entries.find((e) => e.entry_date === date) ?? null

  const saveEntry = async ({ entry_date, mood, gratitude, what_happened, reflection }) => {
    const existing = getEntryForDate(entry_date)
    let result
    if (existing) {
      result = await supabase
        .from('journal_entries')
        .update({ mood, gratitude, what_happened, reflection, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('journal_entries')
        .insert({ user_id: userId, entry_date, mood, gratitude, what_happened, reflection })
        .select()
        .single()
    }
    if (!result.error) {
      if (existing) {
        setEntries((prev) => prev.map((e) => (e.id === result.data.id ? result.data : e)))
      } else {
        setEntries((prev) =>
          [result.data, ...prev].sort((a, b) => b.entry_date.localeCompare(a.entry_date))
        )
      }
    }
    return { error: result.error }
  }

  const deleteEntry = async (entryId) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', entryId)
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== entryId))
    return { error }
  }

  // Returns the average mood for the last 7 entries
  const moodTrend = () => {
    const moodScore = { great: 5, good: 4, okay: 3, bad: 2, awful: 1 }
    const recent = entries.slice(0, 7).filter((e) => e.mood)
    if (!recent.length) return null
    const avg = recent.reduce((sum, e) => sum + (moodScore[e.mood] ?? 3), 0) / recent.length
    if (avg >= 4.5) return 'great'
    if (avg >= 3.5) return 'good'
    if (avg >= 2.5) return 'okay'
    if (avg >= 1.5) return 'bad'
    return 'awful'
  }

  return {
    entries,
    loading,
    today: todayStr(),
    getLast30Days,
    getEntryForDate,
    saveEntry,
    deleteEntry,
    moodTrend,
  }
}
