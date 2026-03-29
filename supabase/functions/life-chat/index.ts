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
      return new Response(JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { messages } = await req.json()
    const userId = user.id
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10)

    // Fetch all user data in parallel
    const [
      habitsRes, habitLogsRes,
      journalsRes,
      todosRes,
      choresRes, choreLogsRes,
      notesRes,
      booksRes,
      workoutsRes,
      coursesRes, assignmentsRes,
    ] = await Promise.all([
      supabaseAdmin.from('habits').select('id, name').eq('user_id', userId).is('routine_type', null),
      supabaseAdmin.from('habit_logs').select('habit_id, completed_date').eq('user_id', userId).gte('completed_date', thirtyDaysAgo),
      supabaseAdmin.from('journal_entries').select('entry_date, mood, gratitude, reflection').eq('user_id', userId).gte('entry_date', thirtyDaysAgo).order('entry_date', { ascending: false }),
      supabaseAdmin.from('todos').select('title, status, priority, due_date').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabaseAdmin.from('chores').select('id, title, cadence').eq('user_id', userId),
      supabaseAdmin.from('chore_logs').select('chore_id, completed_date').eq('user_id', userId).gte('completed_date', thirtyDaysAgo),
      supabaseAdmin.from('notes').select('title, content, category').eq('user_id', userId).gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }).limit(20),
      supabaseAdmin.from('books').select('title, author, status, rating').eq('user_id', userId),
      supabaseAdmin.from('workout_sessions').select('session_date, notes').eq('user_id', userId).gte('session_date', thirtyDaysAgo).order('session_date', { ascending: false }),
      supabaseAdmin.from('courses').select('name, status, grade_pct, course_type').eq('user_id', userId),
      supabaseAdmin.from('assignments').select('title, due_date, status, courses(name)').eq('user_id', userId).eq('status', 'pending').order('due_date', { ascending: true }).limit(10),
    ])

    // Build life context summary
    const habits = habitsRes.data ?? []
    const habitLogs = habitLogsRes.data ?? []
    const completions: Record<string, number> = {}
    for (const log of habitLogs) {
      completions[log.habit_id] = (completions[log.habit_id] ?? 0) + 1
    }

    const ctx: string[] = [
      `Today: ${now.toISOString().slice(0, 10)}`,
      `User: ${user.email?.split('@')[0] ?? 'there'}`,
      '',
      habits.length > 0
        ? `HABITS (last 30 days):\n${habits.map(h => `- ${h.name}: ${completions[h.id] ?? 0}/30 days`).join('\n')}`
        : 'HABITS: None tracked.',
      (journalsRes.data ?? []).length > 0
        ? `JOURNAL (recent):\n${(journalsRes.data ?? []).slice(0, 10).map(j => `- ${j.entry_date}: mood=${j.mood}, "${(j.reflection ?? '').slice(0, 100)}"`).join('\n')}`
        : 'JOURNAL: No recent entries.',
      (todosRes.data ?? []).length > 0
        ? `TODOS:\nOpen: ${(todosRes.data ?? []).filter(t => t.status === 'open').slice(0, 10).map(t => t.title).join(', ')}`
        : 'TODOS: None.',
      (workoutsRes.data ?? []).length > 0
        ? `WORKOUTS (last 30 days): ${(workoutsRes.data ?? []).length} sessions`
        : 'WORKOUTS: None logged.',
      (booksRes.data ?? []).length > 0
        ? `BOOKS: ${(booksRes.data ?? []).filter(b => b.status === 'reading').map(b => b.title).join(', ') || 'none currently reading'}`
        : 'BOOKS: None.',
      (coursesRes.data ?? []).length > 0
        ? `EDUCATION:\n${(coursesRes.data ?? []).filter(c => c.status === 'in_progress').map(c => `- ${c.name} (${c.course_type})`).join('\n')}`
        : 'EDUCATION: No active courses.',
      (assignmentsRes.data ?? []).length > 0
        ? `UPCOMING ASSIGNMENTS:\n${(assignmentsRes.data ?? []).map(a => `- ${a.title} (${(a as any).courses?.name}) due ${a.due_date}`).join('\n')}`
        : 'ASSIGNMENTS: None pending.',
    ].filter(Boolean).join('\n\n')

    const systemPrompt = `You are Muninn — a warm, insightful personal life coach and AI assistant living inside this person's Life OS app. You have full access to their life data: habits, journal, workouts, todos, chores, books, education, and more.

Your role: Be a trusted friend, coach, and thinking partner. You can:
- Answer questions about their data
- Notice patterns and trends they might miss
- Give honest, caring advice
- Help them plan and prioritize
- Celebrate wins and support during struggles
- Reference specific data points to make insights concrete

Tone: Warm, direct, personal. Like a brilliant friend who happens to know everything about their life. Not corporate, not robotic. Use their name when natural.

Current life data snapshot:
${ctx}

Important: The user's conversation history is in the messages array. Maintain continuity — remember what was said earlier in this conversation.`

    // Call OpenRouter with full conversation history
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
          ...messages,
        ],
        max_tokens: 1000,
      }),
    })

    if (!orRes.ok) {
      const text = await orRes.text()
      throw new Error(`OpenRouter ${orRes.status}: ${text}`)
    }

    const orData = await orRes.json()
    const reply: string = orData.choices?.[0]?.message?.content?.trim() ?? ''

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('life-chat error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
