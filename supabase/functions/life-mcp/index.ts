// ============================================================
// life-mcp — MCP (Model Context Protocol) server for Life OS
//
// Deploy:
//   supabase functions deploy life-mcp --no-verify-jwt
//
// Secrets required (set once):
//   supabase secrets set LIFE_MCP_OWNER_EMAIL=sisyphus@12.app
//   supabase secrets set LIFE_MCP_TOKEN=<your-secret-token>
//
// Connect in Claude.ai:
//   Settings → Integrations → Add MCP Server
//   URL:  https://<project-ref>.supabase.co/functions/v1/life-mcp
//   Auth: Bearer <LIFE_MCP_TOKEN>
// ============================================================

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// ── Module-level singletons (survive across requests in same worker) ──────────

let _supabase: SupabaseClient | null = null
let _ownerId: string | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
  }
  return _supabase
}

async function getOwnerId(): Promise<string> {
  if (_ownerId) return _ownerId
  const db = getSupabase()
  const email = Deno.env.get('LIFE_MCP_OWNER_EMAIL') ?? ''
  const { data, error } = await db.auth.admin.listUsers()
  if (error) throw new Error(`Failed to list users: ${error.message}`)
  const user = data?.users?.find((u) => u.email === email)
  if (!user) throw new Error(`Owner not found for email: ${email}`)
  _ownerId = user.id
  return _ownerId
}

// ── Utility helpers ───────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

async function findCourseId(ownerId: string, courseName: string): Promise<string> {
  const db = getSupabase()
  const { data, error } = await db
    .from('courses')
    .select('id, name')
    .eq('user_id', ownerId)
    .ilike('name', courseName)
    .maybeSingle()
  if (error) throw new Error(`Course lookup failed: ${error.message}`)
  if (!data) throw new Error(`No course found matching "${courseName}"`)
  return (data as { id: string }).id
}

async function findOrCreateTrackId(ownerId: string, trackName: string): Promise<string> {
  const db = getSupabase()
  const { data: existing } = await db
    .from('meeting_tracks')
    .select('id')
    .eq('user_id', ownerId)
    .ilike('name', trackName)
    .maybeSingle()
  if (existing) return (existing as { id: string }).id
  const { data: created, error } = await db
    .from('meeting_tracks')
    .insert({ user_id: ownerId, name: trackName })
    .select('id')
    .single()
  if (error) throw new Error(`Failed to create meeting track: ${error.message}`)
  return (created as { id: string }).id
}

// ── Tool definitions (MCP schema) ─────────────────────────────────────────────

const TOOLS = [
  // ── BOOKS ──────────────────────────────────────────────────────────────────
  {
    name: 'update-reading-status',
    description: 'Update the reading status of a book. Optionally set rating and review when finishing.',
    inputSchema: {
      type: 'object',
      properties: {
        title:  { type: 'string', description: 'Book title (partial match ok)' },
        author: { type: 'string', description: 'Author name to disambiguate if multiple matches' },
        status: {
          type: 'string',
          enum: ['want_to_read', 'reading', 'finished', 'library'],
          description: 'New reading status',
        },
        rating: { type: 'number', minimum: 1, maximum: 5, description: '1–5 star rating' },
        review: { type: 'string', description: 'Written review or thoughts on the book' },
      },
      required: ['title', 'status'],
    },
  },
  {
    name: 'add-book',
    description: 'Add a new book to the reading list.',
    inputSchema: {
      type: 'object',
      properties: {
        title:  { type: 'string', description: 'Book title' },
        author: { type: 'string', description: 'Author name' },
        status: {
          type: 'string',
          enum: ['want_to_read', 'reading', 'finished', 'library'],
          description: 'Initial status (default: want_to_read)',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'add-book-note',
    description: 'Add a highlight, note, or discussion thought to a book.',
    inputSchema: {
      type: 'object',
      properties: {
        book_title:   { type: 'string', description: 'Book title to look up' },
        content:      { type: 'string', description: 'Note or highlight content' },
        note_type:    {
          type: 'string',
          enum: ['highlight', 'note', 'discussion'],
          description: 'Type of annotation (default: note)',
        },
        location_ref: { type: 'string', description: 'Page or chapter reference, e.g. "p. 47" or "Ch. 3"' },
      },
      required: ['book_title', 'content'],
    },
  },

  // ── HABITS ─────────────────────────────────────────────────────────────────
  {
    name: 'log-habit',
    description: 'Mark a single habit as completed for a given date.',
    inputSchema: {
      type: 'object',
      properties: {
        habit_name: { type: 'string', description: 'Habit name (partial match ok)' },
        date:       { type: 'string', description: 'ISO date YYYY-MM-DD (default: today)' },
      },
      required: ['habit_name'],
    },
  },
  {
    name: 'log-routine',
    description: 'Mark all habits in a morning or evening routine as completed at once.',
    inputSchema: {
      type: 'object',
      properties: {
        routine: { type: 'string', enum: ['morning', 'evening'], description: 'Which routine to log' },
        date:    { type: 'string', description: 'ISO date YYYY-MM-DD (default: today)' },
      },
      required: ['routine'],
    },
  },
  {
    name: 'create-habit',
    description: 'Create a new habit to track. Use this to add a habit to Life OS before logging it.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Habit name' },
        category: {
          type: 'string',
          enum: ['Health', 'Mind', 'Work', 'Personal'],
          description: 'Habit category (default: Personal)',
        },
        routine_type: {
          type: 'string',
          enum: ['morning', 'evening'],
          description: 'Assign to morning or evening routine (optional — leave out for standalone habits)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'create-chore',
    description: 'Create a new chore with a cadence. Use this to add a chore to Life OS before logging it.',
    inputSchema: {
      type: 'object',
      properties: {
        title:   { type: 'string', description: 'Chore title' },
        cadence: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: 'How often the chore repeats',
        },
        assigned_day: {
          type: 'string',
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          description: 'For weekly chores — which day of the week (optional)',
        },
      },
      required: ['title', 'cadence'],
    },
  },

  // ── TODOS ──────────────────────────────────────────────────────────────────
  {
    name: 'add-todo',
    description: 'Add a new to-do item.',
    inputSchema: {
      type: 'object',
      properties: {
        title:    { type: 'string', description: 'Todo title' },
        notes:    { type: 'string', description: 'Additional notes or description' },
        due_date: { type: 'string', description: 'Due date ISO YYYY-MM-DD' },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority level (default: medium)',
        },
        tags:    { type: 'array', items: { type: 'string' }, description: 'Tags array' },
        project: { type: 'string', description: 'Project label' },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete-todo',
    description: 'Mark an open to-do as done. Errors if zero or multiple open todos match the title.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title to search for (partial match)' },
      },
      required: ['title'],
    },
  },

  // ── CHORES ─────────────────────────────────────────────────────────────────
  {
    name: 'log-chore',
    description: 'Log a chore as completed for a given date. Skips silently if already logged today.',
    inputSchema: {
      type: 'object',
      properties: {
        chore_name: { type: 'string', description: 'Chore title (partial match ok)' },
        date:       { type: 'string', description: 'ISO date YYYY-MM-DD (default: today)' },
      },
      required: ['chore_name'],
    },
  },

  // ── JOURNAL ────────────────────────────────────────────────────────────────
  {
    name: 'add-journal-entry',
    description: "Add or update today's journal entry. Only fields you provide are written — existing fields are preserved on conflict.",
    inputSchema: {
      type: 'object',
      properties: {
        mood:          { type: 'string', enum: ['great', 'good', 'okay', 'bad', 'awful'] },
        gratitude:     { type: 'string', description: 'What you are grateful for' },
        what_happened: { type: 'string', description: 'Events of the day' },
        reflection:    { type: 'string', description: 'Thoughts and reflections' },
        date:          { type: 'string', description: 'ISO date YYYY-MM-DD (default: today)' },
      },
    },
  },
  {
    name: 'add-quick-thought',
    description: 'Capture a quick thought or idea. Stored in notes with category="thought".',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'The thought or idea to capture' },
        tags:    { type: 'array', items: { type: 'string' }, description: 'Tags array' },
      },
      required: ['content'],
    },
  },

  // ── WORK ───────────────────────────────────────────────────────────────────
  {
    name: 'add-work-note',
    description: 'Add a work note, optionally labelled with a project.',
    inputSchema: {
      type: 'object',
      properties: {
        content:       { type: 'string', description: 'Note body (required)' },
        title:         { type: 'string', description: 'Optional title' },
        project_label: { type: 'string', description: 'Optional project tag' },
      },
      required: ['content'],
    },
  },

  // ── MEETING TOPICS ─────────────────────────────────────────────────────────
  {
    name: 'add-meeting-topic',
    description: 'Add a topic or agenda item to a meeting track. Creates the track if it does not exist.',
    inputSchema: {
      type: 'object',
      properties: {
        track_name:  {
          type: 'string',
          description: 'Name of the meeting series, e.g. "1-on-1 with Supervisor"',
        },
        content:     { type: 'string', description: 'Topic or agenda item text' },
        context:     { type: 'string', description: 'Background context for the topic' },
        action_item: { type: 'string', description: 'Follow-up action required' },
      },
      required: ['track_name', 'content'],
    },
  },

  // ── NOTES ──────────────────────────────────────────────────────────────────
  {
    name: 'add-note',
    description: 'Add a general note with an optional category.',
    inputSchema: {
      type: 'object',
      properties: {
        content:  { type: 'string', description: 'Note body' },
        title:    { type: 'string', description: 'Optional title' },
        category: {
          type: 'string',
          enum: ['thought', 'note', 'work', 'one-on-one'],
          description: 'Category (default: note)',
        },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags array' },
      },
      required: ['content'],
    },
  },

  // ── EDUCATION ──────────────────────────────────────────────────────────────
  {
    name: 'add-assignment',
    description: 'Add a new assignment to a course.',
    inputSchema: {
      type: 'object',
      properties: {
        course_name: { type: 'string', description: 'Course name to look up' },
        title:       { type: 'string', description: 'Assignment title' },
        due_date:    { type: 'string', description: 'Due date ISO YYYY-MM-DD' },
      },
      required: ['course_name', 'title'],
    },
  },
  {
    name: 'complete-assignment',
    description: 'Mark a pending assignment as done. Provide course_name to disambiguate if multiple matches.',
    inputSchema: {
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Assignment title (partial match)' },
        course_name: { type: 'string', description: 'Course name to filter by (optional disambiguator)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'add-study-note',
    description: 'Add a study note for a course.',
    inputSchema: {
      type: 'object',
      properties: {
        course_name: { type: 'string', description: 'Course name to look up (required — study notes must link to a course)' },
        content:     { type: 'string', description: 'Note content' },
        title:       { type: 'string', description: 'Optional note title' },
      },
      required: ['course_name', 'content'],
    },
  },
  {
    name: 'log-study-session',
    description: 'Log a study session. Course is optional — omit for general study time.',
    inputSchema: {
      type: 'object',
      properties: {
        course_name:      { type: 'string', description: 'Course name (optional)' },
        duration_minutes: { type: 'number', description: 'Session duration in minutes' },
        notes:            { type: 'string', description: 'Session notes' },
        date:             { type: 'string', description: 'ISO date YYYY-MM-DD (default: today)' },
      },
    },
  },
]

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function handleTool(name: string, args: Record<string, unknown>): Promise<string> {
  const db = getSupabase()
  const ownerId = await getOwnerId()

  try {
  switch (name) {

    // ── update-reading-status ───────────────────────────────────────────────
    case 'update-reading-status': {
      const { title, author, status, rating, review } = args as {
        title: string; author?: string; status: string; rating?: number; review?: string
      }
      let query = db
        .from('books')
        .select('id, title')
        .eq('user_id', ownerId)
        .ilike('title', `%${title}%`)
      if (author) query = query.ilike('author', `%${author}%`)
      const { data: matches, error } = await query
      if (error) throw new Error(error.message)
      if (!matches || matches.length === 0) throw new Error(`No book found matching "${title}"`)
      if (matches.length > 1) {
        const titles = (matches as { title: string }[]).map((b) => `"${b.title}"`).join(', ')
        throw new Error(`Multiple books match "${title}": ${titles} — add author to disambiguate`)
      }
      const book = matches[0] as { id: string; title: string }
      const updates: Record<string, unknown> = { status }
      if (status === 'reading') updates.started_date = today()
      if (status === 'finished') {
        updates.finished_date = today()
        if (rating !== undefined) updates.rating = rating
        if (review) updates.review = review
      }
      const { error: upErr } = await db.from('books').update(updates).eq('id', book.id)
      if (upErr) throw new Error(upErr.message)
      return `Updated "${book.title}" → ${status}${rating !== undefined ? `, rated ${rating}/5` : ''}`
    }

    // ── add-book ────────────────────────────────────────────────────────────
    case 'add-book': {
      const { title, author, status = 'want_to_read' } = args as {
        title: string; author?: string; status?: string
      }
      const { error } = await db
        .from('books')
        .insert({ user_id: ownerId, title, author, status })
      if (error) throw new Error(error.message)
      return `Added "${title}"${author ? ` by ${author}` : ''} with status "${status}"`
    }

    // ── add-book-note ───────────────────────────────────────────────────────
    case 'add-book-note': {
      const { book_title, content, note_type = 'note', location_ref } = args as {
        book_title: string; content: string; note_type?: string; location_ref?: string
      }
      const { data: book, error: bookErr } = await db
        .from('books')
        .select('id, title')
        .eq('user_id', ownerId)
        .ilike('title', `%${book_title}%`)
        .maybeSingle()
      if (bookErr) throw new Error(bookErr.message)
      let b: { id: string; title: string }
      let bookAutoCreated = false
      if (!book) {
        const { data: newBook, error: createErr } = await db
          .from('books')
          .insert({ user_id: ownerId, title: book_title, status: 'want_to_read' })
          .select('id, title')
          .single()
        if (createErr) throw new Error(createErr.message)
        b = newBook as { id: string; title: string }
        bookAutoCreated = true
      } else {
        b = book as { id: string; title: string }
      }
      const { error } = await db.from('book_notes').insert({
        book_id: b.id,
        user_id: ownerId,
        content,
        note_type,
        location_ref,
      })
      if (error) throw new Error(error.message)
      if (bookAutoCreated) {
        return `Book "${b.title}" was added to your library automatically. Note saved.`
      }
      return `Added ${note_type} to "${b.title}"${location_ref ? ` (${location_ref})` : ''}`
    }

    // ── log-habit ───────────────────────────────────────────────────────────
    case 'log-habit': {
      const { habit_name, date: dateArg } = args as { habit_name: string; date?: string }
      const completedDate = dateArg ?? today()
      const { data: habit, error: habitErr } = await db
        .from('habits')
        .select('id, name')
        .eq('user_id', ownerId)
        .ilike('name', `%${habit_name}%`)
        .maybeSingle()
      if (habitErr) throw new Error(habitErr.message)
      if (!habit) throw new Error(`No habit found matching "${habit_name}"`)
      const h = habit as { id: string; name: string }
      const { error } = await db
        .from('habit_logs')
        .upsert(
          { habit_id: h.id, user_id: ownerId, completed_date: completedDate },
          { onConflict: 'habit_id,completed_date' }
        )
      if (error) throw new Error(error.message)
      return `Logged "${h.name}" as completed on ${completedDate}`
    }

    // ── log-routine ─────────────────────────────────────────────────────────
    case 'log-routine': {
      const { routine, date: dateArg } = args as { routine: string; date?: string }
      const completedDate = dateArg ?? today()
      const { data: habits, error: habitsErr } = await db
        .from('habits')
        .select('id, name')
        .eq('user_id', ownerId)
        .eq('routine_type', routine)
        .order('routine_order', { ascending: true })
      if (habitsErr) throw new Error(habitsErr.message)
      if (!habits || habits.length === 0) {
        return JSON.stringify({
          success: false,
          message: `No habits are configured for your ${routine} routine yet. Open Life OS → Habits → Add Habit and set the routine type to Morning or Evening to get started.`,
        })
      }
      const rows = (habits as { id: string; name: string }[]).map((h) => ({
        habit_id: h.id,
        user_id: ownerId,
        completed_date: completedDate,
      }))
      const { error } = await db
        .from('habit_logs')
        .upsert(rows, { onConflict: 'habit_id,completed_date' })
      if (error) throw new Error(error.message)
      const names = (habits as { name: string }[]).map((h) => h.name).join(', ')
      return `Logged ${habits.length} ${routine} habits on ${completedDate}: ${names}`
    }

    // ── create-habit ────────────────────────────────────────────────────────
    case 'create-habit': {
      const { name, category = 'Personal', routine_type } = args as {
        name: string; category?: string; routine_type?: string
      }
      const { data: existing } = await db
        .from('habits')
        .select('id, name')
        .eq('user_id', ownerId)
        .ilike('name', name)
        .maybeSingle()
      if (existing) {
        return `Habit "${(existing as { name: string }).name}" already exists — skipped.`
      }
      const { error } = await db.from('habits').insert({
        user_id: ownerId,
        name,
        category,
        routine_type: routine_type ?? null,
      })
      if (error) throw new Error(error.message)
      return `Habit created: "${name}" [${category}]${routine_type ? ` — ${routine_type} routine` : ''}`
    }

    // ── create-chore ────────────────────────────────────────────────────────
    case 'create-chore': {
      const { title, cadence, assigned_day } = args as {
        title: string; cadence: string; assigned_day?: string
      }
      const { data: existing } = await db
        .from('chores')
        .select('id, title')
        .eq('user_id', ownerId)
        .ilike('title', title)
        .maybeSingle()
      if (existing) {
        return `Chore "${(existing as { title: string }).title}" already exists — skipped.`
      }
      const { error } = await db.from('chores').insert({
        user_id: ownerId,
        title,
        cadence,
        assigned_day: cadence === 'weekly' ? (assigned_day ?? null) : null,
      })
      if (error) throw new Error(error.message)
      return `Chore created: "${title}" [${cadence}]${assigned_day ? ` — every ${assigned_day}` : ''}`
    }

    // ── add-todo ────────────────────────────────────────────────────────────
    case 'add-todo': {
      const { title, notes, due_date, priority = 'medium', tags, project } = args as {
        title: string; notes?: string; due_date?: string
        priority?: string; tags?: string[]; project?: string
      }
      const { error } = await db.from('todos').insert({
        user_id: ownerId, title, notes, due_date, priority, status: 'open', tags, project,
      })
      if (error) throw new Error(error.message)
      return `Added todo: "${title}"${due_date ? ` (due ${due_date})` : ''}${priority !== 'medium' ? `, priority: ${priority}` : ''}${project ? `, project: ${project}` : ''}${tags?.length ? `, tags: [${tags.join(', ')}]` : ''}`
    }

    // ── complete-todo ───────────────────────────────────────────────────────
    case 'complete-todo': {
      const { title } = args as { title: string }
      const { data: matches, error } = await db
        .from('todos')
        .select('id, title')
        .eq('user_id', ownerId)
        .eq('status', 'open')
        .ilike('title', `%${title}%`)
      if (error) throw new Error(error.message)
      if (!matches || matches.length === 0) {
        throw new Error(`No open todo found matching "${title}"`)
      }
      if (matches.length > 1) {
        const titles = (matches as { title: string }[]).map((t) => `"${t.title}"`).join(', ')
        throw new Error(`Multiple open todos match "${title}": ${titles} — be more specific`)
      }
      const todo = matches[0] as { id: string; title: string }
      const { error: upErr } = await db.from('todos').update({ status: 'done' }).eq('id', todo.id)
      if (upErr) throw new Error(upErr.message)
      return `Completed todo: "${todo.title}"`
    }

    // ── log-chore ───────────────────────────────────────────────────────────
    case 'log-chore': {
      const { chore_name, date: dateArg } = args as { chore_name: string; date?: string }
      const completedDate = dateArg ?? today()
      const { data: chore, error: choreErr } = await db
        .from('chores')
        .select('id, title')
        .eq('user_id', ownerId)
        .ilike('title', `%${chore_name}%`)
        .maybeSingle()
      if (choreErr) throw new Error(choreErr.message)
      if (!chore) throw new Error(`No chore found matching "${chore_name}"`)
      const c = chore as { id: string; title: string }
      // Guard against duplicates (no DB-level UNIQUE constraint on chore_logs)
      const { data: existing } = await db
        .from('chore_logs')
        .select('id')
        .eq('chore_id', c.id)
        .eq('user_id', ownerId)
        .eq('completed_date', completedDate)
        .maybeSingle()
      if (existing) return `"${c.title}" already logged for ${completedDate}`
      const { error } = await db.from('chore_logs').insert({
        chore_id: c.id, user_id: ownerId, completed_date: completedDate,
      })
      if (error) throw new Error(error.message)
      return `Logged chore "${c.title}" as completed on ${completedDate}`
    }

    // ── add-journal-entry ───────────────────────────────────────────────────
    case 'add-journal-entry': {
      const { mood, gratitude, what_happened, reflection, date: dateArg } = args as {
        mood?: string; gratitude?: string; what_happened?: string
        reflection?: string; date?: string
      }
      const entryDate = dateArg ?? today()
      // Only include fields that were provided — preserve existing values on conflict
      const payload: Record<string, unknown> = { user_id: ownerId, entry_date: entryDate }
      if (mood !== undefined) payload.mood = mood
      if (gratitude !== undefined) payload.gratitude = gratitude
      if (what_happened !== undefined) payload.what_happened = what_happened
      if (reflection !== undefined) payload.reflection = reflection
      const { error } = await db
        .from('journal_entries')
        .upsert(payload, { onConflict: 'user_id,entry_date' })
      if (error) throw new Error(error.message)
      return `Journal entry saved for ${entryDate}${mood ? ` — mood: ${mood}` : ''}`
    }

    // ── add-quick-thought ───────────────────────────────────────────────────
    case 'add-quick-thought': {
      const { content, tags } = args as { content: string; tags?: string[] }
      const { error } = await db.from('notes').insert({
        user_id: ownerId, content, category: 'thought', title: null, tags,
      })
      if (error) throw new Error(error.message)
      return `Captured thought${tags?.length ? ` [${tags.join(', ')}]` : ''}: "${content.slice(0, 60)}${content.length > 60 ? '…' : ''}"`
    }

    // ── add-work-note ───────────────────────────────────────────────────────
    case 'add-work-note': {
      const { content, title, project_label } = args as {
        content: string; title?: string; project_label?: string
      }
      const { error } = await db.from('work_notes').insert({
        user_id: ownerId, content, title, project_label,
      })
      if (error) throw new Error(error.message)
      return `Work note saved${title ? ` — "${title}"` : ''}${project_label ? ` [${project_label}]` : ''}`
    }

    // ── add-meeting-topic ───────────────────────────────────────────────────
    case 'add-meeting-topic': {
      const { track_name, content, context, action_item } = args as {
        track_name: string; content: string; context?: string; action_item?: string
      }
      const trackId = await findOrCreateTrackId(ownerId, track_name)
      const { error } = await db.from('meeting_topics').insert({
        track_id: trackId,
        user_id: ownerId,
        content,
        context,
        action_item,
        // status, week_start, archived all use DB defaults
      })
      if (error) throw new Error(error.message)
      const preview = content.length > 80 ? `${content.slice(0, 80)}…` : content
      return `Meeting topic added to "${track_name}": "${preview}"`
    }

    // ── add-note ────────────────────────────────────────────────────────────
    case 'add-note': {
      const { content, title, category = 'note', tags } = args as {
        content: string; title?: string; category?: string; tags?: string[]
      }
      const { error } = await db.from('notes').insert({
        user_id: ownerId, content, title, category, tags,
      })
      if (error) throw new Error(error.message)
      return `Note saved${title ? ` — "${title}"` : ''}${category && category !== 'note' ? ` [${category}]` : ''}${tags?.length ? ` tags: [${tags.join(', ')}]` : ''}`
    }

    // ── add-assignment ──────────────────────────────────────────────────────
    case 'add-assignment': {
      const { course_name, title, due_date } = args as {
        course_name: string; title: string; due_date?: string
      }
      let courseId: string
      let courseAutoCreated = false
      try {
        courseId = await findCourseId(ownerId, course_name)
      } catch (e) {
        const err = e as Error
        if (!err.message.includes('No course found')) throw err
        const { data: newCourse, error: createErr } = await db
          .from('courses')
          .insert({
            user_id: ownerId,
            name: course_name,
            course_type: 'college',
            status: 'in_progress',
            color: '#6366f1',
          })
          .select('id')
          .single()
        if (createErr) throw new Error(createErr.message)
        courseId = (newCourse as { id: string }).id
        courseAutoCreated = true
      }
      const { error } = await db.from('assignments').insert({
        user_id: ownerId, course_id: courseId, title, due_date, status: 'pending',
      })
      if (error) throw new Error(error.message)
      if (courseAutoCreated) {
        return `Course "${course_name}" was created automatically. Assignment added: "${title}"${due_date ? ` (due ${due_date})` : ''}`
      }
      return `Assignment added: "${title}"${due_date ? ` (due ${due_date})` : ''} for "${course_name}"`
    }

    // ── complete-assignment ─────────────────────────────────────────────────
    case 'complete-assignment': {
      const { title, course_name } = args as { title: string; course_name?: string }
      let courseId: string | undefined
      if (course_name) courseId = await findCourseId(ownerId, course_name)
      let query = db
        .from('assignments')
        .select('id, title')
        .eq('user_id', ownerId)
        .eq('status', 'pending')
        .ilike('title', `%${title}%`)
      if (courseId) query = query.eq('course_id', courseId)
      const { data: matches, error } = await query
      if (error) throw new Error(error.message)
      if (!matches || matches.length === 0) {
        throw new Error(`No pending assignment found matching "${title}"`)
      }
      if (matches.length > 1) {
        const titles = (matches as { title: string }[]).map((a) => `"${a.title}"`).join(', ')
        throw new Error(`Multiple pending assignments match "${title}": ${titles} — add course_name to disambiguate`)
      }
      const assignment = matches[0] as { id: string; title: string }
      const { error: upErr } = await db
        .from('assignments')
        .update({ status: 'done' })
        .eq('id', assignment.id)
      if (upErr) throw new Error(upErr.message)
      return `Completed assignment: "${assignment.title}"`
    }

    // ── add-study-note ──────────────────────────────────────────────────────
    case 'add-study-note': {
      const { course_name, content, title } = args as {
        course_name: string; content: string; title?: string
      }
      const courseId = await findCourseId(ownerId, course_name)
      const { error } = await db.from('study_notes').insert({
        user_id: ownerId, course_id: courseId, content, title,
      })
      if (error) throw new Error(error.message)
      return `Study note added for "${course_name}"${title ? `: "${title}"` : ''}`
    }

    // ── log-study-session ───────────────────────────────────────────────────
    case 'log-study-session': {
      const { course_name, duration_minutes, notes, date: dateArg } = args as {
        course_name?: string; duration_minutes?: number; notes?: string; date?: string
      }
      const sessionDate = dateArg ?? today()
      let courseId: string | null = null
      let courseAutoCreated = false
      if (course_name) {
        try {
          courseId = await findCourseId(ownerId, course_name)
        } catch (e) {
          const err = e as Error
          if (!err.message.includes('No course found')) throw err
          const { data: newCourse, error: createErr } = await db
            .from('courses')
            .insert({
              user_id: ownerId,
              name: course_name,
              course_type: 'college',
              status: 'in_progress',
              color: '#6366f1',
            })
            .select('id')
            .single()
          if (createErr) throw new Error(createErr.message)
          courseId = (newCourse as { id: string }).id
          courseAutoCreated = true
        }
      }
      const { error } = await db.from('study_sessions').insert({
        user_id: ownerId,
        course_id: courseId,
        session_date: sessionDate,
        duration_minutes,
        notes,
      })
      if (error) throw new Error(error.message)
      const coursePart = course_name
        ? courseAutoCreated
          ? ` for "${course_name}" (course created automatically)`
          : ` for "${course_name}"`
        : ''
      return `Study session logged on ${sessionDate}${coursePart}${duration_minutes ? ` (${duration_minutes} min)` : ''}`
    }

    default: {
      const err = new Error(`Unknown tool: ${name}`) as Error & { code: number }
      err.code = -32601
      throw err
    }
  }
  } catch (topErr) {
    const e = topErr as Error & { code?: number }
    if (e.code !== undefined) throw topErr
    return JSON.stringify({
      success: false,
      error: e.message,
      hint: 'Check that the referenced item exists in Life OS before trying again.',
    })
  }
}

// ── JSON-RPC 2.0 types and dispatcher ────────────────────────────────────────

interface RpcMessage {
  jsonrpc: '2.0'
  method: string
  params?: Record<string, unknown>
  id?: string | number | null
}

function isNotification(msg: RpcMessage): boolean {
  return msg.id === undefined || msg.id === null
}

function okResponse(id: string | number | null | undefined, result: unknown) {
  return { jsonrpc: '2.0', id: id ?? null, result }
}

function errResponse(id: string | number | null | undefined, code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } }
}

async function dispatchMessage(msg: RpcMessage): Promise<unknown | null> {
  const { method, params, id } = msg

  if (method === 'notifications/initialized') return null

  switch (method) {
    case 'initialize':
      return okResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'life-os', version: '1.0.0' },
      })

    case 'ping':
      return okResponse(id, {})

    case 'tools/list':
      return okResponse(id, { tools: TOOLS })

    case 'tools/call': {
      const toolName = params?.name as string
      const toolArgs = (params?.arguments ?? {}) as Record<string, unknown>
      try {
        const result = await handleTool(toolName, toolArgs)
        return okResponse(id, { content: [{ type: 'text', text: result }] })
      } catch (err) {
        const e = err as Error & { code?: number }
        return errResponse(id, e.code ?? -32603, e.message)
      }
    }

    default:
      if (isNotification(msg)) return null
      return errResponse(id, -32601, `Method not found: ${method}`)
  }
}

// ── Deno.serve entry point (MCP 2025-11-25 Streamable HTTP) ──────────────────

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const pathname = url.pathname

  // ── CORS preflight ──────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    })
  }

  // ── OAuth Protected Resource Metadata ──────────────────────────────────────
  if (pathname.includes('/.well-known/oauth-protected-resource')) {
    const baseUrl = `${url.protocol}//${url.host}/functions/v1/life-mcp`
    return new Response(JSON.stringify({
      resource: baseUrl,
      authorization_servers: [`${baseUrl}`],
      bearer_methods_supported: ['header'],
      resource_documentation: 'https://life-os.vercel.app',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── OAuth Authorization Server Metadata ────────────────────────────────────
  if (pathname.includes('/.well-known/oauth-authorization-server')) {
    const baseUrl = `${url.protocol}//${url.host}/functions/v1/life-mcp`
    return new Response(JSON.stringify({
      issuer: baseUrl,
      token_endpoint: `${baseUrl}/token`,
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
      grant_types_supported: ['client_credentials'],
      response_types_supported: ['token'],
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── Token endpoint ──────────────────────────────────────────────────────────
  if (pathname.includes('/token') && req.method === 'POST') {
    const expectedToken = Deno.env.get('LIFE_MCP_TOKEN') ?? ''

    let clientSecret = ''
    const authHeader = req.headers.get('Authorization') ?? ''
    if (authHeader.startsWith('Basic ')) {
      try {
        const decoded = atob(authHeader.slice(6))
        clientSecret = decoded.includes(':')
          ? decoded.slice(decoded.indexOf(':') + 1)
          : decoded
      } catch { /* ignore */ }
    }
    if (!clientSecret) {
      try {
        const params = new URLSearchParams(await req.text())
        clientSecret = params.get('client_secret') ?? ''
      } catch { /* ignore */ }
    }

    if (!expectedToken || clientSecret !== expectedToken) {
      return new Response(JSON.stringify({
        error: 'invalid_client',
        error_description: 'Invalid client credentials',
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      access_token: expectedToken,
      token_type: 'Bearer',
      expires_in: 86400,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── Main MCP endpoint — POST / only ────────────────────────────────────────
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── Auth validation ─────────────────────────────────────────────────────────
  const expectedToken = Deno.env.get('LIFE_MCP_TOKEN') ?? ''
  const authHeader = req.headers.get('Authorization') ?? ''
  const queryToken = url.searchParams.get('token') ?? ''

  let authenticated = false

  if (expectedToken) {
    if (authHeader === `Bearer ${expectedToken}`) {
      authenticated = true
    } else if (queryToken === expectedToken) {
      authenticated = true
    } else if (authHeader.startsWith('Basic ')) {
      try {
        const decoded = atob(authHeader.slice(6))
        const password = decoded.includes(':')
          ? decoded.slice(decoded.indexOf(':') + 1)
          : decoded
        if (password === expectedToken) authenticated = true
      } catch { /* invalid base64 */ }
    }
  }

  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── JSON-RPC dispatch ───────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify(errResponse(null, -32700, 'Parse error')),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const isBatch = Array.isArray(body)
  const messages: RpcMessage[] = isBatch ? (body as RpcMessage[]) : [body as RpcMessage]

  const responses: unknown[] = []
  for (const msg of messages) {
    const resp = await dispatchMessage(msg)
    if (resp !== null) responses.push(resp)
  }

  // Notification-only batch → 204 No Content
  if (responses.length === 0) {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  return new Response(
    JSON.stringify(isBatch ? responses : responses[0]),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
