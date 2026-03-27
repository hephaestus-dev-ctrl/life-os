import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export function useBooks() {
  const [userId, setUserId] = useState(null)
  const [books, setBooks] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchData = useCallback(async (uid) => {
    const [booksRes, notesRes] = await Promise.all([
      supabase.from('books').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('book_notes').select('*').eq('user_id', uid).order('created_at'),
    ])
    if (!booksRes.error) setBooks(booksRes.data ?? [])
    if (!notesRes.error) setNotes(notesRes.data ?? [])
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchData(userId).finally(() => setLoading(false))
  }, [userId, fetchData])

  const addBook = async ({ title, author, status, cover_url, review }) => {
    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: userId,
        title,
        author: author || null,
        status: status || 'want_to_read',
        cover_url: cover_url || null,
        review: review || null,
      })
      .select()
      .single()
    if (!error) setBooks((prev) => [...prev, data])
    return { data, error }
  }

  const updateBook = async (bookId, updates) => {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', bookId)
      .select()
      .single()
    if (!error) setBooks((prev) => prev.map((b) => (b.id === bookId ? data : b)))
    return { data, error }
  }

  const deleteBook = async (bookId) => {
    const { error } = await supabase.from('books').delete().eq('id', bookId)
    if (!error) {
      setBooks((prev) => prev.filter((b) => b.id !== bookId))
      setNotes((prev) => prev.filter((n) => n.book_id !== bookId))
    }
    return { error }
  }

  const addNote = async ({ book_id, content, note_type, location_ref }) => {
    const { data, error } = await supabase
      .from('book_notes')
      .insert({ book_id, user_id: userId, content, note_type: note_type || 'note', location_ref: location_ref || null })
      .select()
      .single()
    if (!error) setNotes((prev) => [...prev, data])
    return { data, error }
  }

  const deleteNote = async (noteId) => {
    const { error } = await supabase.from('book_notes').delete().eq('id', noteId)
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== noteId))
    return { error }
  }

  const getBookNotes = (bookId) => notes.filter((n) => n.book_id === bookId)

  const shelves = {
    library: books.filter((b) => b.status === 'library'),
    want_to_read: books.filter((b) => b.status === 'want_to_read'),
    reading: books.filter((b) => b.status === 'reading'),
    finished: books
      .filter((b) => b.status === 'finished')
      .sort((a, b) => {
        if (a.finished_date && b.finished_date) return b.finished_date.localeCompare(a.finished_date)
        return 0
      }),
  }

  return {
    books,
    notes,
    loading,
    shelves,
    addBook,
    updateBook,
    deleteBook,
    addNote,
    deleteNote,
    getBookNotes,
  }
}
