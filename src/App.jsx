import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './modules/dashboard/Dashboard'
import Habits from './modules/habits/Habits'
import Todo from './modules/todos/Todos'
import Chores from './modules/chores/Chores'
import Journal from './modules/journal/Journal'
import Notes from './modules/notes/Notes'
import NoteEditorPage from './modules/notes/NoteEditorPage'
import Books from './modules/books/Books'
import Workouts from './modules/workouts/Workouts'
import AIReview from './modules/aireview/AIReview'
import Consistency from './modules/consistency/Consistency'
import Education from './modules/education/Education'
import CourseDetail from './modules/education/CourseDetail'
import StudyNoteEditor from './modules/education/StudyNoteEditor'

function ProtectedRoute({ session, children }) {
  if (session === undefined) return null // still loading
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute session={session}>
              <Layout session={session}>
                <Routes>
                  <Route path="/" element={<Dashboard session={session} />} />
                  <Route path="/habits" element={<Habits />} />
                  <Route path="/todo" element={<Todo />} />
                  <Route path="/chores" element={<Chores />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/notes/new" element={<NoteEditorPage />} />
                  <Route path="/notes/edit/:id" element={<NoteEditorPage />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/workouts" element={<Workouts />} />
                  <Route path="/ai-review" element={<AIReview session={session} />} />
                  <Route path="/consistency" element={<Consistency session={session} />} />
                  <Route path="/education" element={<Education session={session} />} />
                  <Route path="/education/:courseId" element={<CourseDetail session={session} />} />
                  <Route path="/education/:courseId/notes/new" element={<StudyNoteEditor />} />
                  <Route path="/education/:courseId/notes/:noteId/edit" element={<StudyNoteEditor />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
