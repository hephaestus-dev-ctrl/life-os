import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

// Monday of the current week as YYYY-MM-DD
function currentWeekStart() {
  const d   = new Date()
  const day  = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export function useNotes() {
  const [userId,        setUserId]        = useState(null)
  const [notes,         setNotes]         = useState([])
  const [workNotes,     setWorkNotes]     = useState([])
  const [meetingTracks, setMeetingTracks] = useState([])
  const [meetingTopics, setMeetingTopics] = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchData = useCallback(async (uid) => {
    const [notesRes, workNotesRes, tracksRes, topicsRes] = await Promise.all([
      supabase
        .from('notes')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false }),
      supabase
        .from('work_notes')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false }),
      supabase
        .from('meeting_tracks')
        .select('*')
        .eq('user_id', uid)
        .order('created_at'),
      supabase
        .from('meeting_topics')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false }),
    ])

    if (!notesRes.error)     setNotes(notesRes.data ?? [])
    if (!workNotesRes.error) setWorkNotes(workNotesRes.data ?? [])
    if (!topicsRes.error)    setMeetingTopics(topicsRes.data ?? [])

    // Create default meeting tracks if none exist yet (only if the table exists)
    if (!tracksRes.error) {
      let tracks = tracksRes.data ?? []
      if (tracks.length === 0) {
        const defaults = ['1-on-1 with Supervisor', 'Team Meeting']
        const { data: created } = await supabase
          .from('meeting_tracks')
          .insert(defaults.map((name) => ({ user_id: uid, name })))
          .select()
        if (created) tracks = created
      }
      setMeetingTracks(tracks)
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchData(userId).finally(() => setLoading(false))
  }, [userId, fetchData])

  // ── Notes CRUD (existing `notes` table) ───────────────────

  const addNote = async ({ title = '', content, category = 'note', tags = [] }) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: userId, title, content, category, tags })
      .select()
      .single()
    if (!error) setNotes((prev) => [data, ...prev])
    return { error }
  }

  const updateNote = async (noteId, updates) => {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single()
    if (!error) setNotes((prev) => prev.map((n) => (n.id === noteId ? data : n)))
    return { error }
  }

  const deleteNote = async (noteId) => {
    const { error } = await supabase.from('notes').delete().eq('id', noteId)
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== noteId))
    return { error }
  }

  // ── Work Notes CRUD ───────────────────────────────────────

  const addWorkNote = async ({ title = '', content, project_label = '' }) => {
    const { data, error } = await supabase
      .from('work_notes')
      .insert({ user_id: userId, title: title || null, content, project_label: project_label.trim() || null })
      .select()
      .single()
    if (!error) setWorkNotes((prev) => [data, ...prev])
    return { error }
  }

  const updateWorkNote = async (noteId, updates) => {
    const { data, error } = await supabase
      .from('work_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single()
    if (!error) setWorkNotes((prev) => prev.map((n) => (n.id === noteId ? data : n)))
    return { error }
  }

  const deleteWorkNote = async (noteId) => {
    const { error } = await supabase.from('work_notes').delete().eq('id', noteId)
    if (!error) setWorkNotes((prev) => prev.filter((n) => n.id !== noteId))
    return { error }
  }

  // ── Meeting Tracks CRUD ───────────────────────────────────

  const addMeetingTrack = async (name) => {
    const { data, error } = await supabase
      .from('meeting_tracks')
      .insert({ user_id: userId, name })
      .select()
      .single()
    if (!error) setMeetingTracks((prev) => [...prev, data])
    return { error }
  }

  const deleteMeetingTrack = async (trackId) => {
    const { error } = await supabase.from('meeting_tracks').delete().eq('id', trackId)
    if (!error) {
      setMeetingTracks((prev) => prev.filter((t) => t.id !== trackId))
      setMeetingTopics((prev) => prev.filter((t) => t.track_id !== trackId))
    }
    return { error }
  }

  // ── Meeting Topics CRUD ───────────────────────────────────

  const addMeetingTopic = async (trackId, { content, context = '', action_item = '' }) => {
    const weekStart = currentWeekStart()
    const { data, error } = await supabase
      .from('meeting_topics')
      .insert({
        track_id:    trackId,
        user_id:     userId,
        content,
        context:     context.trim()     || null,
        action_item: action_item.trim() || null,
        status:      'pending',
        week_start:  weekStart,
        archived:    false,
      })
      .select()
      .single()

    if (!error) {
      setMeetingTopics((prev) => [data, ...prev])
      // Auto-create a todo if an action item was provided
      if (action_item.trim()) {
        await supabase.from('todos').insert({
          user_id:  userId,
          title:    action_item.trim(),
          status:   'open',
          priority: 'medium',
          notes:    `Action from meeting: ${content.slice(0, 100)}`,
        })
      }
    }
    return { error }
  }

  const toggleMeetingTopic = async (topicId) => {
    const topic = meetingTopics.find((t) => t.id === topicId)
    if (!topic) return { error: null }
    const newStatus = topic.status === 'pending' ? 'discussed' : 'pending'
    const { data, error } = await supabase
      .from('meeting_topics')
      .update({ status: newStatus })
      .eq('id', topicId)
      .select()
      .single()
    if (!error) setMeetingTopics((prev) => prev.map((t) => (t.id === topicId ? data : t)))
    return { error }
  }

  const updateMeetingTopic = async (topicId, updates) => {
    const original = meetingTopics.find((t) => t.id === topicId)
    const { data, error } = await supabase
      .from('meeting_topics')
      .update(updates)
      .eq('id', topicId)
      .select()
      .single()

    if (!error) {
      setMeetingTopics((prev) => prev.map((t) => (t.id === topicId ? data : t)))
      // Auto-create a todo when an action_item is newly added or changed
      const newAction = updates.action_item?.trim()
      const oldAction = original?.action_item?.trim()
      if (newAction && newAction !== oldAction) {
        await supabase.from('todos').insert({
          user_id:  userId,
          title:    newAction,
          status:   'open',
          priority: 'medium',
          notes:    `Action from meeting: ${original?.content?.slice(0, 100) ?? ''}`,
        })
      }
    }
    return { error }
  }

  const deleteMeetingTopic = async (topicId) => {
    const { error } = await supabase.from('meeting_topics').delete().eq('id', topicId)
    if (!error) setMeetingTopics((prev) => prev.filter((t) => t.id !== topicId))
    return { error }
  }

  // Mark all non-archived topics in a track as archived
  const archiveMeetingWeek = async (trackId) => {
    const toArchive = meetingTopics.filter((t) => t.track_id === trackId && !t.archived)
    if (toArchive.length === 0) return { error: null }
    const ids = toArchive.map((t) => t.id)
    const { error } = await supabase
      .from('meeting_topics')
      .update({ archived: true })
      .in('id', ids)
    if (!error) {
      setMeetingTopics((prev) =>
        prev.map((t) => (ids.includes(t.id) ? { ...t, archived: true } : t))
      )
    }
    return { error }
  }

  return {
    notes, workNotes, meetingTracks, meetingTopics, loading,
    addNote, updateNote, deleteNote,
    addWorkNote, updateWorkNote, deleteWorkNote,
    addMeetingTrack, deleteMeetingTrack,
    addMeetingTopic, toggleMeetingTopic, updateMeetingTopic, deleteMeetingTopic, archiveMeetingWeek,
  }
}
