import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-opus-4-7'

const ADVISORS = {
  psychologist: {
    name: 'The Psychologist',
    emoji: '🧠',
    prompt: `You are a behavioral psychologist analyzing this
    person's life data. Focus on: emotional patterns in journal
    entries, mood trends over time, behavioral loops (habits they
    keep vs habits they avoid), signs of self-sabotage, identity
    formation, the gap between stated values and actual behavior.
    Be clinically observant but warm. Reference specific data
    points. Ask one probing question at the end that invites
    genuine self-reflection. 3-4 paragraphs.`,
  },
  performance: {
    name: 'The Performance Coach',
    emoji: '⚡',
    prompt: `You are an elite performance coach. Focus on:
    productivity patterns, deep work consistency, output vs
    input ratios, time optimization, energy management across
    the week, office days vs WFH days performance differences,
    education progress rate, skill acquisition velocity.
    Be data-driven and specific. Identify the single highest
    leverage change they could make. 3-4 paragraphs.`,
  },
  fitness: {
    name: 'The Fitness Coach',
    emoji: '💪',
    prompt: `You are a world-class fitness coach. Focus on:
    workout frequency and consistency, workout types and
    progression, recovery patterns, the relationship between
    workout days and mood/energy in journal entries, physical
    discipline as a leading indicator of overall discipline.
    Be specific about what the data shows. Push them toward
    higher standards while acknowledging real progress.
    3-4 paragraphs.`,
  },
  mentor: {
    name: 'The Mentor',
    emoji: '📖',
    prompt: `You are a wise mentor who bridges reading and life.
    Focus on: books being read and how their concepts appear
    (or don't appear) in daily behavior and journal entries,
    intellectual growth trajectory, the gap between consuming
    ideas and actually applying them, education coursework
    progress. Ask: what are they learning vs what are they
    living? Be warm, Socratic, challenging. 3-4 paragraphs.`,
  },
  drillsergeant: {
    name: 'The Drill Sergeant',
    emoji: '⚔️',
    prompt: `You are a Goggins/Jocko inspired accountability
    coach with zero tolerance for excuses. Focus on: where
    they fell short, habits that are consistently missed,
    the gap between their stated standard and actual performance,
    comfort zones they're not pushing. Be direct, demanding,
    and honest — but not cruel. Call out specific failures by
    name. End with a clear non-negotiable standard for next
    week. 3-4 paragraphs. No soft language.`,
  },
  spiritual: {
    name: 'The Spiritual Advisor',
    emoji: '🙏',
    prompt: `You are a spiritually grounded advisor. Focus on:
    Bible study consistency and what it signals about their
    spiritual discipline, alignment between their values and
    their actions, moments of gratitude and meaning in journal
    entries, whether their daily life reflects their stated
    purpose, Frankl-inspired meaning analysis. Be reflective,
    grounded, and non-preachy. 3-4 paragraphs.`,
  },
  career: {
    name: 'The Career Advisor',
    emoji: '💼',
    prompt: `You are a senior career strategist. Focus on:
    education and certification progress, skill building
    velocity, work notes and professional observations,
    the connection between current daily habits and long-term
    career trajectory, cybersecurity specialization progress,
    meeting topics and professional relationships. Be strategic
    and forward-looking. Identify the most important career
    move for the next 90 days. 3-4 paragraphs.`,
  },
  mirror: {
    name: 'The Mirror',
    emoji: '🪞',
    prompt: `You are a pure data analyst. No emotion, no
    encouragement, no criticism. Just facts. State exactly
    what the numbers show: habit completion percentages by
    habit, workout count, journal entry count, mood distribution,
    chore completion rate, books finished, study hours,
    consistency score average. Then identify the top 3
    statistical patterns — positive and negative. End with
    one sentence: what the data says about this person.
    Be precise. Use numbers. 3-4 paragraphs.`,
  },
}

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
      // On-demand from client — verify JWT via auth client
      const authHeader = req.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
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

    type AdvisorResult = { name: string; emoji: string; content: string }
    type AdvisorsMap = Record<string, AdvisorResult>
    type AdvisorsPayload = { period: string; generated_at: string; advisors: AdvisorsMap }
    const results: { userId: string; advisors?: AdvisorsPayload; error?: string }[] = []

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

        // ── Call all 8 advisors in parallel ───────────────────
        async function callAdvisor(
          key: string,
          advisor: { name: string; emoji: string; prompt: string }
        ): Promise<[string, AdvisorResult]> {
          const apiRes = await fetch(ANTHROPIC_URL, {
            method: 'POST',
            headers: {
              'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: MODEL,
              max_tokens: 800,
              system: advisor.prompt,
              messages: [{ role: 'user', content: dataCtx }],
            }),
          })
          if (!apiRes.ok) {
            const text = await apiRes.text()
            throw new Error(`Anthropic API ${apiRes.status}: ${text}`)
          }
          const apiData = await apiRes.json()
          return [key, {
            name: advisor.name,
            emoji: advisor.emoji,
            content: apiData.content?.[0]?.text?.trim() ?? '',
          }]
        }

        const advisorEntries = await Promise.all(
          Object.entries(ADVISORS).map(([key, advisor]) => callAdvisor(key, advisor))
        )
        const advisors: AdvisorsMap = Object.fromEntries(advisorEntries)

        const period = review_type === 'ondemand' ? 'weekly' : review_type
        const advisorPayload: AdvisorsPayload = {
          period,
          generated_at: new Date().toISOString(),
          advisors,
        }

        // ── Save review ───────────────────────────────────────
        const advisorResponsesJson: Record<string, string> = Object.fromEntries(
          Object.entries(advisors).map(([key, val]) => [key, val.content])
        )

        await supabaseAdmin.from('ai_reviews').insert({
          user_id: userId,
          review_type,
          period_start: periodStart,
          period_end:   periodEnd,
          content: JSON.stringify(advisorPayload),
          advisor_responses: advisorResponsesJson,
        })

        results.push({ userId, advisors: advisorPayload })
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
      JSON.stringify({ ...primary?.advisors, generated: results.length }),
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
