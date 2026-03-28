import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'anthropic/claude-sonnet-4-5'

function isoWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function periodDates(reviewType: string): { start: string; end: string } {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  if (reviewType === 'weekly') {
    const start = isoWeekStart(now)
    return { start, end: today }
  } else {
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    return { start, end: today }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { review_type, period_start: bodyStart, period_end: bodyEnd, auto } = body

    if (!['weekly', 'monthly', 'ondemand'].includes(review_type)) {
      return new Response(
        JSON.stringify({ error: 'review_type must be weekly, monthly, or ondemand' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Admin client — used for both auto (all users) and on-demand
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ── Determine user(s) ──────────────────────────────────────
    let userIds: string[] = []

    if (auto) {
      // pg_cron trigger — generate for all users
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      userIds = (users?.users ?? []).map((u) => u.id)
    } else {
      // On-demand from client — validate JWT and extract user
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      // Use admin client to verify the JWT and get the user
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      userIds = [user.id]
    }

    // Compute period
    const { start: autoStart, end: autoEnd } = periodDates(review_type)
    const periodStart = bodyStart ?? autoStart
    const periodEnd   = bodyEnd   ?? autoEnd

    const results: { userId: string; content?: string; error?: string }[] = []

    for (const userId of userIds) {
      try {
        // Fetch user's email for personalisation
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
        const userEmail = userData?.user?.email ?? ''
        const userName  = userEmail ? userEmail.split('@')[0] : 'there'

        // ── Pull all data for the period ──────────────────────
        const [
          habitsRes, habitLogsRes,
          journalsRes,
          todosCreatedRes, todosDoneRes,
          choresRes, choreLogsRes,
          booksRes,
          notesRes,
          workoutsRes,
          workNotesRes,
          meetingsRes,
        ] = await Promise.all([
          supabaseAdmin.from('habits').select('id, name').eq('user_id', userId),
          supabaseAdmin.from('habit_logs').select('habit_id, completed_date').eq('user_id', userId).gte('completed_date', periodStart).lte('completed_date', periodEnd),
          supabaseAdmin.from('journal_entries').select('entry_date, mood, gratitude, reflection').eq('user_id', userId).gte('entry_date', periodStart).lte('entry_date', periodEnd).order('entry_date', { ascending: true }),
          supabaseAdmin.from('todos').select('id, title, created_at').eq('user_id', userId).gte('created_at', periodStart).lte('created_at', periodEnd),
          supabaseAdmin.from('todos').select('id, title, completed_at').eq('user_id', userId).eq('status', 'done').gte('completed_at', periodStart).lte('completed_at', periodEnd),
          supabaseAdmin.from('chores').select('id, title, cadence').eq('user_id', userId),
          supabaseAdmin.from('chore_logs').select('chore_id, completed_date').eq('user_id', userId).gte('completed_date', periodStart).lte('completed_date', periodEnd),
          supabaseAdmin.from('books').select('title, status, started_at, finished_at').eq('user_id', userId),
          supabaseAdmin.from('notes').select('title, category, content, created_at').eq('user_id', userId).gte('created_at', periodStart).lte('created_at', periodEnd).order('created_at', { ascending: false }),
          supabaseAdmin.from('workout_sessions').select('session_date, template_name, duration_minutes').eq('user_id', userId).gte('session_date', periodStart).lte('session_date', periodEnd).order('session_date', { ascending: false }),
          supabaseAdmin.from('work_notes').select('title, project, created_at').eq('user_id', userId).gte('created_at', periodStart).lte('created_at', periodEnd),
          supabaseAdmin.from('meeting_topics').select('content, status, week_start').eq('user_id', userId).gte('created_at', periodStart).lte('created_at', periodEnd),
        ])

        // ── Build data summary ────────────────────────────────
        const habits    = habitsRes.data ?? []
        const habitLogs = habitLogsRes.data ?? []
        const journals  = journalsRes.data ?? []
        const chores    = choresRes.data ?? []
        const choreLogs = choreLogsRes.data ?? []
        const books     = booksRes.data ?? []
        const workouts  = workoutsRes.data ?? []

        // Habit completion rates
        const habitCompletions: Record<string, number> = {}
        for (const log of habitLogs) {
          habitCompletions[log.habit_id] = (habitCompletions[log.habit_id] ?? 0) + 1
        }
        const periodDays = Math.max(1, Math.round(
          (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / 86400000
        ) + 1)
        const habitLines = habits.map((h) => {
          const n    = habitCompletions[h.id] ?? 0
          const rate = Math.round((n / periodDays) * 100)
          return `- ${h.name}: ${n}/${periodDays} days completed (${rate}%)`
        })

        // Journal summary
        const moodMap: Record<string, string> = {}
        for (const j of journals) moodMap[j.entry_date] = j.mood ?? ''
        const moods = Object.values(moodMap).filter(Boolean)
        const journalLines = journals.slice(0, 10).map((j) =>
          `- ${j.entry_date}: mood="${j.mood ?? 'n/a'}", "${(j.reflection ?? '').slice(0, 120)}"`
        )

        // Workout summary
        const workoutLines = workouts.map((w) =>
          `- ${w.session_date}: ${w.template_name ?? 'workout'}, ${w.duration_minutes ?? '?'} min`
        )

        // Chore completion
        const completedChoreIds = new Set(choreLogs.map((l) => l.chore_id))
        const choreRate = chores.length > 0
          ? Math.round((completedChoreIds.size / chores.length) * 100)
          : null

        // Books
        const readingBooks  = books.filter((b) => b.status === 'reading').map((b) => b.title)
        const finishedBooks = books.filter((b) =>
          b.status === 'finished' && b.finished_at && b.finished_at >= periodStart
        ).map((b) => b.title)

        // Tasks
        const created   = (todosCreatedRes.data ?? []).length
        const completed = (todosDoneRes.data ?? []).length

        // Notes
        const notesCount = (notesRes.data ?? []).length
        const workNotesCount = (workNotesRes.data ?? []).length
        const meetingsCount  = (meetingsRes.data ?? []).length

        // ── Build data message ────────────────────────────────
        const dataCtx = [
          `REVIEW PERIOD: ${periodStart} to ${periodEnd} (${periodDays} days)`,
          `USER NAME: ${userName}`,
          '',
          habits.length > 0
            ? `HABIT COMPLETION:\n${habitLines.join('\n')}`
            : 'HABITS: No habits tracked.',
          journals.length > 0
            ? `JOURNAL: ${journals.length} entries written.\nMoods: ${moods.join(', ') || 'none recorded'}.\nRecent entries:\n${journalLines.join('\n')}`
            : 'JOURNAL: No entries this period.',
          workouts.length > 0
            ? `WORKOUTS: ${workouts.length} sessions logged.\n${workoutLines.join('\n')}`
            : 'WORKOUTS: No sessions logged.',
          `TASKS: ${completed} completed, ${created} created this period.`,
          choreRate !== null
            ? `CHORES: ${choreRate}% completion rate (${completedChoreIds.size} of ${chores.length} chores done).`
            : 'CHORES: No chores tracked.',
          finishedBooks.length > 0
            ? `BOOKS FINISHED: ${finishedBooks.join(', ')}`
            : readingBooks.length > 0
            ? `BOOKS IN PROGRESS: ${readingBooks.join(', ')}`
            : 'BOOKS: Nothing tracked this period.',
          (notesCount + workNotesCount) > 0
            ? `NOTES CAPTURED: ${notesCount} personal notes, ${workNotesCount} work notes, ${meetingsCount} meeting topics.`
            : '',
        ].filter(Boolean).join('\n\n')

        const periodLabel = review_type === 'weekly' ? 'week' : 'month'
        const systemPrompt = `You are a warm, insightful personal life coach reviewing this person's ${periodLabel}. Write a personal, thoughtful review in a conversational tone — like a trusted friend who has been watching their progress. Cover: what went well, what struggled, patterns you notice, one or two specific suggestions for next ${periodLabel}. Reference their actual data specifically. Use their name if available. Keep it under 400 words. Do not use bullet points — write in flowing paragraphs.`

        // ── Call OpenRouter ───────────────────────────────────
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
              { role: 'user', content: dataCtx },
            ],
            max_tokens: 800,
          }),
        })

        if (!orRes.ok) {
          const text = await orRes.text()
          throw new Error(`OpenRouter ${orRes.status}: ${text}`)
        }

        const orData = await orRes.json()
        const content: string = orData.choices?.[0]?.message?.content?.trim() ?? ''

        // ── Save review ───────────────────────────────────────
        await supabaseAdmin.from('ai_reviews').insert({
          user_id: userId,
          review_type,
          period_start: periodStart,
          period_end:   periodEnd,
          content,
        })

        results.push({ userId, content })
      } catch (userErr) {
        console.error(`Error for user ${userId}:`, userErr)
        results.push({ userId, error: (userErr as Error).message })
      }
    }

    // Return first user's result for on-demand calls
    const primary = results[0]
    if (primary?.error) {
      return new Response(
        JSON.stringify({ error: primary.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ content: primary?.content, generated: results.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('ai-review error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
