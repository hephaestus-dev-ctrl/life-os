import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function useTodos() {
  const [userId, setUserId] = useState(null)
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const fetchTodos = useCallback(async (uid) => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (!error) setTodos(data ?? [])
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchTodos(userId).finally(() => setLoading(false))
  }, [userId, fetchTodos])

  const addTodo = async ({ title, notes, due_date, priority, project }) => {
    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: userId,
        title,
        notes: notes || null,
        due_date: due_date || null,
        priority: priority || 'medium',
        project: project || null,
        status: 'open',
      })
      .select()
      .single()
    if (!error) setTodos((prev) => [data, ...prev])
    return { error }
  }

  const toggleStatus = async (todoId) => {
    const todo = todos.find((t) => t.id === todoId)
    if (!todo) return
    const newStatus = todo.status === 'open' ? 'done' : 'open'
    const { error } = await supabase
      .from('todos')
      .update({ status: newStatus })
      .eq('id', todoId)
    if (!error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, status: newStatus } : t))
      )
    }
  }

  const deleteTodo = async (todoId) => {
    const { error } = await supabase.from('todos').delete().eq('id', todoId)
    if (!error) setTodos((prev) => prev.filter((t) => t.id !== todoId))
    return { error }
  }

  const isOverdue = (todo) =>
    todo.status === 'open' && !!todo.due_date && todo.due_date < todayStr()

  return {
    todos,
    loading,
    today: todayStr(),
    addTodo,
    toggleStatus,
    deleteTodo,
    isOverdue,
  }
}
