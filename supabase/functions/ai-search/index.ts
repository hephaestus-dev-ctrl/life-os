import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'anthropic/claude-sonnet-4-5'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Auth client — validates the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Admin client — reads all user data
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { query } = await req.json()
    if (!query?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id
    const now = new Date()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10)
    const sixtyDaysAgo  = new Date(now.getTime() - 60 * 86400000).toISOString().slice(0, 10)

    // Pull data from all modules in parallel
    const [
      habitsRes, habitLogsRes,
      journalsRes,
      notesRes,
      booksRes, bookNotesRes,
      todosRes,
      workoutsRes,
      workNotesRes,
      meetingsRes,
    ] = await Promise.all([
      supabaseAdmin.from('habits').select('id, name, routine_type').eq('user_id', userId),
      supabaseAdmin.from('habit_logs').select('habit_id, completed_date').eq('user_id', userId).gte('completed_date', ninetyDaysAgo),
      supabaseAdmin.from('journal_entries').select('entry_date, mood, gratitude, reflection').eq('user_id', userId).gte('entry_date', ninetyDaysAgo).order('entry_date', { ascending: false }),
      supabaseAdmin.from('notes').select('id, title, content, category, tags, created_at').eq('user_id', userId).gte('created_at', ninetyDaysAgo).order('created_at', { ascending: false }),
      supabaseAdmin.from('books').select('id, title, author, status, rating, started_at, finished_at').eq('user_id', userId),
      supabaseAdmin.from('book_notes').select('book_id, type, content, created_at').eq('user_id', userId).gte('created_at', ninetyDaysAgo).order('created_at', { ascending: false }),
      supabaseAdmin.from('todos').select('id, title, status, priority, due_date, completed_at').eq('user_id', userId).order('created_at', { ascending: false }),
      supabaseAdmin.from('workout_sessions').select('id, session_date, template_name, duration_minutes, notes').eq('user_id', userId).gte('session_date', sixtyDaysAgo).order('session_date', { ascending: false }),
      supabaseAdmin.from('work_notes').select('id, title, content, project, created_at').eq('user_id', userId).gte('created_at', ninetyDaysAgo).order('created_at', { ascending: false }),
      supabaseAdmin.from('meeting_topics').select('id, content, status, week_start, created_at').eq('user_id', userId).gte('created_at', ninetyDaysAgo).order('created_at', { ascending: false }),
    ])

    // ── Build context ──────────────────────────────────────────
    const ctx: string[] = []

    // Habits
    const habits = habitsRes.data ?? []
    if (habits.length > 0) {
      const completions: Record<string, number> = {}
      for (const log of habitLogsRes.data ?? []) {
        completions[log.habit_id] = (completions[log.habit_id] ?? 0) + 1
      }
      const lines = habits.map((h) => {
        const n = completions[h.id] ?? 0
        const rate = Math.round((n / 90) * 100)
        return `- ${h.name}: ${n} completions in last 90 days (~${rate}% rate)`
      })
      ctx.push(`HABITS (last 90 days):\n${lines.join('\n')}`)
    }

    // Journal
    const journals = journalsRes.data ?? []
    if (journals.length > 0) {
      const lines = journals.slice(0, 25).map((j) =>
        `- ${j.entry_date}: mood="${j.mood ?? 'n/a'}", gratitude="${(j.gratitude ?? '').slice(0, 100)}", reflection="${(j.reflection ?? '').slice(0, 150)}"`
      )
      ctx.push(`JOURNAL ENTRIES (recent):\n${lines.join('\n')}`)
    }

    // Notes
    const notes = notesRes.data ?? []
    if (notes.length > 0) {
      const lines = notes.slice(0, 20).map((n) =>
        `- [${n.category}] "${n.title ?? 'Untitled'}" (${n.created_at?.slice(0, 10)}): "${(n.content ?? '').slice(0, 200)}"`
      )
      ctx.push(`NOTES:\n${lines.join('\n')}`)
    }

    // Books + highlights
    const books = booksRes.data ?? []
    if (books.length > 0) {
      const bookLines = books.map((b) =>
        `- "${b.title}" by ${b.author ?? 'unknown'}: ${b.status}, rating=${b.rating ?? 'n/a'}`
      )
      ctx.push(`BOOKS:\n${bookLines.join('\n')}`)
      const bnLines = (bookNotesRes.data ?? []).slice(0, 10).map((n) =>
        `- [${n.type}] "${(n.content ?? '').slice(0, 150)}"`
      )
      if (bnLines.length > 0) ctx.push(`BOOK NOTES/HIGHLIGHTS:\n${bnLines.join('\n')}`)
    }

    // Todos
    const todos = todosRes.data ?? []
    if (todos.length > 0) {
      const open   = todos.filter((t) => t.status === 'open').slice(0, 20)
      const done   = todos.filter((t) => t.status !== 'open').slice(0, 10)
      const lines  = []
      if (open.length)  lines.push(`Open (${open.length}): ${open.map((t) => t.title).join(', ')}`)
      if (done.length)  lines.push(`Recently done: ${done.map((t) => t.title).join(', ')}`)
      ctx.push(`TODOS:\n${lines.join('\n')}`)
    }

    // Workouts
    const workouts = workoutsRes.data ?? []
    if (workouts.length > 0) {
      const lines = workouts.map((w) =>
        `- ${w.session_date}: ${w.template_name ?? 'workout'}, ${w.duration_minutes ?? '?'} min`
      )
      ctx.push(`WORKOUTS (last 60 days):\n${lines.join('\n')}`)
    }

    // Work notes
    const workNotes = workNotesRes.data ?? []
    if (workNotes.length > 0) {
      const lines = workNotes.slice(0, 10).map((n) =>
        `- [${n.project ?? 'general'}] "${n.title}" (${n.created_at?.slice(0, 10)}): "${(n.content ?? '').slice(0, 200)}"`
      )
      ctx.push(`WORK NOTES:\n${lines.join('\n')}`)
    }

    // Meeting topics
    const meetings = meetingsRes.data ?? []
    if (meetings.length > 0) {
      const lines = meetings.slice(0, 10).map((m) =>
        `- Week ${m.week_start}: "${(m.content ?? '').slice(0, 150)}" [${m.status}]`
      )
      ctx.push(`MEETING TOPICS:\n${lines.join('\n')}`)
    }

    // ── Build prompts ──────────────────────────────────────────
    const systemPrompt = `You are a personal life assistant with access to the user's life data. Answer their question helpfully and specifically based on their actual data. When referencing specific entries, include the module name and date so they can find it. Be concise and personal.`

    const userMessage = `Here is the user's life data:\n\n${ctx.join('\n\n')}\n\n---\n\nUser question: ${query.trim()}\n\nAfter your answer, output a line that contains exactly "RESULTS_JSON:" followed by a JSON array of the most relevant entries you referenced. Each object must have: module (one of: habits, journal, notes, books, todos, workouts), title (string), date (YYYY-MM-DD or empty string), deeplink (the route path, e.g. /journal?date=2026-03-15). Output at most 8 results. If no specific entries apply, output an empty array.`

    // ── Call OpenRouter ────────────────────────────────────────
    const orRes = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://life-os.vercel.app',
        'X-Title': 'Life OS',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1000,
      }),
    })

    if (!orRes.ok) {
      const text = await orRes.text()
      throw new Error(`OpenRouter error ${orRes.status}: ${text}`)
    }

    const orData = await orRes.json()
    const fullContent: string = orData.choices?.[0]?.message?.content ?? ''

    // Parse AI response vs. structured results
    let aiResponse = fullContent.trim()
    let results: unknown[] = []

    const splitIdx = fullContent.indexOf('RESULTS_JSON:')
    if (splitIdx !== -1) {
      aiResponse = fullContent.slice(0, splitIdx).trim()
      try {
        const jsonStr = fullContent.slice(splitIdx + 'RESULTS_JSON:'.length).trim()
        results = JSON.parse(jsonStr)
      } catch {
        // leave results empty
      }
    }

    // ── Save to search history ─────────────────────────────────
    await supabaseAdmin.from('ai_search_history').insert({
      user_id: userId,
      query: query.trim(),
      response: aiResponse,
      results,
    })

    return new Response(
      JSON.stringify({ response: aiResponse, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('ai-search error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
