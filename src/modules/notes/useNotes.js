import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export function useNotes() {
  const [userId,        setUserId]        = useState(null)
  const [notes,         setNotes]         = useState([])
  const [oneOnOneItems, setOneOnOneItems] = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchData = useCallback(async (uid) => {
    const [notesRes, oneOnOneRes] = await Promise.all([
      supabase
        .from('notes')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false }),
      supabase
        .from('one_on_one_items')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false }),
    ])
    if (!notesRes.error)    setNotes(notesRes.data ?? [])
    if (!oneOnOneRes.error) setOneOnOneItems(oneOnOneRes.data ?? [])
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchData(userId).finally(() => setLoading(false))
  }, [userId, fetchData])

  // ---- Notes CRUD ----

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

  // ---- 1-on-1 CRUD ----

  const addOneOnOne = async ({ question, context = '' }) => {
    const { data, error } = await supabase
      .from('one_on_one_items')
      .insert({ user_id: userId, question, context, status: 'pending' })
      .select()
      .single()
    if (!error) setOneOnOneItems((prev) => [data, ...prev])
    return { error }
  }

  const toggleOneOnOne = async (itemId) => {
    const item = oneOnOneItems.find((i) => i.id === itemId)
    if (!item) return { error: null }
    const newStatus = item.status === 'pending' ? 'discussed' : 'pending'
    const { data, error } = await supabase
      .from('one_on_one_items')
      .update({ status: newStatus })
      .eq('id', itemId)
      .select()
      .single()
    if (!error) setOneOnOneItems((prev) => prev.map((i) => (i.id === itemId ? data : i)))
    return { error }
  }

  const deleteOneOnOne = async (itemId) => {
    const { error } = await supabase.from('one_on_one_items').delete().eq('id', itemId)
    if (!error) setOneOnOneItems((prev) => prev.filter((i) => i.id !== itemId))
    return { error }
  }

  return {
    notes,
    oneOnOneItems,
    loading,
    addNote,
    updateNote,
    deleteNote,
    addOneOnOne,
    toggleOneOnOne,
    deleteOneOnOne,
  }
}
