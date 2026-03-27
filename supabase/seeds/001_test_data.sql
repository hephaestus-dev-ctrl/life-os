-- ============================================================
-- Life OS — Test Data Seed
-- User  : 7fdca7f5-83f4-4847-b214-9ed0ff55e3c5
-- Range : 2026-01-26 → 2026-03-27 (60-day window)
-- Run once in Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- HABITS (6 tracked + 7 routine items)
-- ============================================================
INSERT INTO habits (id, user_id, name, category, routine_type, routine_order) VALUES
  ('a1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Morning Routine',       'Personal', null,      0),
  ('a1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Workout',               'Health',   null,      0),
  ('a1000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Read 30 minutes',       'Mind',     null,      0),
  ('a1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Meditate',              'Mind',     null,      0),
  ('a1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Journal',               'Personal', null,      0),
  ('a1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Sleep by 10:30pm',      'Health',   null,      0),
  -- Morning routine items
  ('a1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Make bed',              'Personal', 'morning', 1),
  ('a1000008-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Cold shower',           'Personal', 'morning', 2),
  ('a1000009-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Review goals',          'Personal', 'morning', 3),
  ('a1000010-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Breakfast',             'Personal', 'morning', 4),
  -- Evening routine items
  ('a1000011-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Plan tomorrow',         'Personal', 'evening', 1),
  ('a1000012-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Read',                  'Personal', 'evening', 2),
  ('a1000013-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Lights out by 10:30pm', 'Personal', 'evening', 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- HABIT LOGS
-- ============================================================

-- Morning Routine (~85% — skip 9 days)
INSERT INTO habit_logs (id, habit_id, user_id, completed_date)
SELECT gen_random_uuid(),
       'a1000001-0000-0000-0000-000000000001',
       '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
       d::date
FROM generate_series('2026-01-26'::date, '2026-03-27'::date, '1 day'::interval) d
WHERE d::date NOT IN (
  '2026-01-28','2026-02-02','2026-02-09','2026-02-16','2026-02-22',
  '2026-03-01','2026-03-08','2026-03-15','2026-03-22'
)
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Workout (~70% — skip 18 days)
INSERT INTO habit_logs (id, habit_id, user_id, completed_date)
SELECT gen_random_uuid(),
       'a1000002-0000-0000-0000-000000000001',
       '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
       d::date
FROM generate_series('2026-01-26'::date, '2026-03-27'::date, '1 day'::interval) d
WHERE d::date NOT IN (
  '2026-01-27','2026-01-30','2026-02-03','2026-02-07','2026-02-10',
  '2026-02-13','2026-02-17','2026-02-20','2026-02-24','2026-02-27',
  '2026-03-04','2026-03-07','2026-03-11','2026-03-14','2026-03-18',
  '2026-03-21','2026-03-25','2026-03-27'
)
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Read 30 minutes (~75% — skip 15 days)
INSERT INTO habit_logs (id, habit_id, user_id, completed_date)
SELECT gen_random_uuid(),
       'a1000003-0000-0000-0000-000000000001',
       '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
       d::date
FROM generate_series('2026-01-26'::date, '2026-03-27'::date, '1 day'::interval) d
WHERE d::date NOT IN (
  '2026-01-27','2026-01-31','2026-02-04','2026-02-08','2026-02-12',
  '2026-02-15','2026-02-19','2026-02-23','2026-02-27','2026-03-03',
  '2026-03-06','2026-03-10','2026-03-14','2026-03-18','2026-03-24'
)
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Meditate (~60% — skip 24 days)
INSERT INTO habit_logs (id, habit_id, user_id, completed_date)
SELECT gen_random_uuid(),
       'a1000004-0000-0000-0000-000000000001',
       '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
       d::date
FROM generate_series('2026-01-26'::date, '2026-03-27'::date, '1 day'::interval) d
WHERE d::date NOT IN (
  '2026-01-26','2026-01-28','2026-01-30',
  '2026-02-01','2026-02-03','2026-02-06','2026-02-08','2026-02-11',
  '2026-02-13','2026-02-15','2026-02-18','2026-02-20','2026-02-22',
  '2026-02-25','2026-02-27',
  '2026-03-02','2026-03-04','2026-03-06','2026-03-09','2026-03-11',
  '2026-03-14','2026-03-17','2026-03-20','2026-03-23'
)
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Journal (~65% — skip 21 days)
INSERT INTO habit_logs (id, habit_id, user_id, completed_date)
SELECT gen_random_uuid(),
       'a1000005-0000-0000-0000-000000000001',
       '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
       d::date
FROM generate_series('2026-01-26'::date, '2026-03-27'::date, '1 day'::interval) d
WHERE d::date NOT IN (
  '2026-01-27','2026-01-29','2026-01-31',
  '2026-02-02','2026-02-05','2026-02-08','2026-02-11','2026-02-14',
  '2026-02-17','2026-02-20','2026-02-23','2026-02-26',
  '2026-03-01','2026-03-04','2026-03-07','2026-03-10','2026-03-13',
  '2026-03-16','2026-03-19','2026-03-22','2026-03-26'
)
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Sleep by 10:30pm (~55% — skip 27 days)
INSERT INTO habit_logs (id, habit_id, user_id, completed_date)
SELECT gen_random_uuid(),
       'a1000006-0000-0000-0000-000000000001',
       '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
       d::date
FROM generate_series('2026-01-26'::date, '2026-03-27'::date, '1 day'::interval) d
WHERE d::date NOT IN (
  '2026-01-26','2026-01-28','2026-01-30',
  '2026-02-01','2026-02-03','2026-02-05','2026-02-07','2026-02-09',
  '2026-02-11','2026-02-13','2026-02-15','2026-02-17','2026-02-19',
  '2026-02-21','2026-02-23','2026-02-25','2026-02-27',
  '2026-03-01','2026-03-03','2026-03-05','2026-03-07','2026-03-10',
  '2026-03-13','2026-03-16','2026-03-19','2026-03-22','2026-03-26'
)
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- ============================================================
-- JOURNAL ENTRIES (35 entries)
-- ============================================================
INSERT INTO journal_entries (id, user_id, entry_date, mood, gratitude, what_happened, reflection) VALUES

('f1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-01-26', 'good',
 'Started the new habit system today. Feeling hopeful about the structure it will bring.',
 'First day using Life OS consistently. Got a workout in, made the bed, read for 45 minutes in the evening. Small wins.',
 'The hardest part of any new habit is the first day. I did it. That is all that matters right now.'),

('f1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-01-28', 'good',
 'Good night''s sleep. Coffee tasted excellent this morning. My mom texted out of nowhere just to check in.',
 'Productive day at work. Had a solid 1:1 with my manager. Got through my reading and journaling in the evening.',
 'I notice I feel better on days when I start with intention. The morning routine isn''t a burden — it''s a frame for the rest of the day.'),

('f1000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-01-29', 'bad',
 'Grateful the day is over. Also grateful for chamomile tea.',
 'Rough day. Got a critical comment on a project I worked hard on. Struggled to focus all afternoon. Didn''t workout. Watched TV until too late.',
 'I took the feedback too personally. It was about the work, not about me. I need to learn to separate those two things faster.'),

('f1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-01-30', 'okay',
 'Had a really good lunch. Weather was nice enough to take a short walk.',
 'Recovered somewhat from yesterday. Got back to the gym for a quick session. Still distracted but functional.',
 'Bounce-back days are underrated. You don''t need a perfect day to get back on track. You just need to start again.'),

('f1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-01', 'good',
 'Sunday morning quiet. A full day to do whatever I want with no agenda.',
 'Did laundry, grocery run, read for two hours, and watched a documentary. Slow Sunday in the best way.',
 'Rest is productive. I keep forgetting this. Recovery is not a reward you earn — it is a requirement.'),

('f1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-03', 'good',
 'Grateful for a strong cup of coffee and a clear agenda for the day.',
 'Two great work blocks, finished a task I''d been avoiding for two weeks, worked out, meditated, journaled. Full day.',
 'When I plan the night before, the next day runs smoother. Almost without exception. Evening planning is worth protecting.'),

('f1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-04', 'okay',
 'Lunch was good. That is genuinely about it for today.',
 'Slow day. Not much energy. Got through work but nothing exceptional. Skipped the workout, told myself I''d make up for it tomorrow.',
 'Low energy days happen. The goal is not to let one bad day turn into three. Tomorrow, just start.'),

('f1000008-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-06', 'good',
 'Grateful for a team that communicates well. And for the fact that it is almost the weekend.',
 'Good momentum at work. Got a compliment on a presentation. Had a long walk during lunch that cleared my head.',
 'Recognition feels good but I want to do good work regardless of whether anyone notices. The standard has to be internal.'),

('f1000009-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-07', 'great',
 'Long run this morning. Clear sky, crisp air, felt like I could run forever. Grateful for a healthy body that still works.',
 'Saturday. Morning run, brunch with a friend I haven''t seen in months, afternoon reading session, cooked a real dinner from scratch.',
 'Days like this are what I am aiming for more of. Present, active, connected. No screens until after dinner. That was the difference.'),

('f1000010-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-08', 'bad',
 'Grateful my apartment has heat and I do not have to go anywhere.',
 'Came down with something. Stayed in bed most of the day. Could not focus on anything. Cancelled evening plans.',
 'Getting sick is a reminder that health is the foundation. Everything else is built on it. Do not take it for granted.'),

('f1000011-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-09', 'good',
 'Starting to feel better. Grateful the illness was short-lived. Also grateful for soup.',
 'Still recovering but managed a light walk and some reading. Got back to the morning routine which felt grounding.',
 'The routines are like guardrails. Even on compromised days, having the structure means I do something rather than nothing.'),

('f1000012-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-10', 'okay',
 'Back to work. Grateful for normalcy.',
 'Slower than usual. Had a meeting that could have been an email. Worked out finally after skipping several days.',
 'I let the inbox dictate my morning again. Need to block the first hour for focused work before touching email. Every time I forget this I regret it.'),

('f1000013-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-12', 'good',
 'Grateful for a chapter of Meditations I read this morning that hit at exactly the right time.',
 'Productive work day, good workout, finished reading Meditations in the evening. Stayed up a bit late reading.',
 'Aurelius wrote about mortality not as a downer but as a clarifier. What would I do today if I actually acted like time was limited?'),

('f1000014-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-13', 'okay',
 'Had a decent conversation with a coworker I rarely talk to. Good to connect outside the usual orbit.',
 'Average day. Meetings all morning, scrambled in the afternoon to get work done. Meditated before bed which helped settle things.',
 'I am reactive rather than proactive too often at work. Need to carve out thinking time instead of just responding all day.'),

('f1000015-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-15', 'good',
 'Sunday. Grateful for a slow morning with coffee and nowhere to be.',
 'Deep cleaned the kitchen, did laundry, read, and took a long walk. Finished the day with a good workout session.',
 'Sundays done right set the whole week''s tone. I should protect them from creeping obligations.'),

('f1000016-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-16', 'okay',
 'Grateful the week is starting with a reasonable workload for once.',
 'Got through a heavy email backlog. Had a Tonal session that went well. Skipped meditating because I told myself I was too tired.',
 'I keep skipping meditation when I am tired. But that is exactly when I need it most. The excuse and the need are the same thing.'),

('f1000017-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-18', 'great',
 'Incredible workout. Hit a new weight on the chest press. Feeling strong and clear-headed going into the evening.',
 'Nailed the morning routine, focused work session, set a new Tonal PR, read for an hour, journaled before bed. Everything clicked.',
 'On days like this I feel like I am becoming the person I want to be. What made today work? Morning routine completed, no phone until 9am, workout scheduled early.'),

('f1000018-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-19', 'good',
 'Grateful for a friend who texts to check in for no reason. That kind of friendship is rare and worth protecting.',
 'Solid day. Good work output, workout, and had a nice catch-up call with an old friend in the evening.',
 'Connection matters. I think I underinvest in relationships because I am busy building solo. The solo work is less meaningful without people to share it with.'),

('f1000019-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-21', 'okay',
 'The weekend arrived. Grateful for the permission to rest without guilt.',
 'Did chores in the morning, went for a walk, read. Nothing remarkable. Did not work out but did not feel bad about it.',
 'Not every weekend needs to be eventful. This was restorative, not exciting. I am learning to be okay with that distinction.'),

('f1000020-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-22', 'bad',
 'Grateful this day is a one-off and not a pattern. That is genuinely all I have.',
 'Woke up late, missed the morning routine entirely, got into a frustrating email back-and-forth with a colleague, skipped the workout, doom-scrolled until midnight.',
 'I know the cascade: poor sleep leads to missed routine leads to no workout leads to no structure. It''s predictable. I need to break it at the first link.'),

('f1000021-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-24', 'good',
 'Coffee, sunshine through the window, a clear to-do list. The trifecta.',
 'Snapped back from Sunday''s low. Good workout, strong work session, finished a chapter of Man''s Search for Meaning before bed.',
 'Frankl''s logotherapy idea keeps pulling at me: suffering is bearable when it has meaning. What does that mean practically for low days like Sunday?'),

('f1000022-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-25', 'okay',
 'Nothing spectacular today. Grateful for a functioning life.',
 'Routine day. Hit my habits. Nothing exciting happened but nothing bad either. Made dinner, read, went to bed on time.',
 'I used to think ordinary days were wasted days. I am revising that. Ordinary days done well are the foundation of everything.'),

('f1000023-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-02-28', 'good',
 'End of February. Grateful for the momentum built over the last month even with the rough patches.',
 'Good last day of the month. Reflected on February''s habits. Not perfect but better than January. Morning routine is getting sticky.',
 'I am building evidence that I can do the things I say I will do. That self-trust matters more than any individual habit check.'),

('f1000024-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-02', 'good',
 'Grateful for spring beginning to hint at its arrival. The days are getting noticeably longer.',
 'Strong Tonal session. Hit a new PR. Work was smooth. Read more Frankl in the evening.',
 'The weight progression in workouts is a perfect metaphor. You can''t rush it. You just show up, do the work, and add a little more each time.'),

('f1000025-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-03', 'okay',
 'Had a really good sandwich for lunch. Genuinely a highlight of the day.',
 'Mediocre day. Some friction with a coworker. Workout was low energy. Skipped meditating again.',
 'The coworker situation is worth addressing directly instead of letting it simmer. I should bring it up in a calm moment this week.'),

('f1000026-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-05', 'great',
 'Truly grateful for good health, a peaceful apartment, and books that actually challenge how I think.',
 'One of the best days in weeks. Morning routine completed, meditation was surprisingly clear, workout felt strong, finished Man''s Search for Meaning in the evening.',
 'Finished Frankl. The last line: live as if you were living already for the second time and had acted as wrongly the first time as you are about to act now. Sitting with that.'),

('f1000027-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-06', 'good',
 'Friday. Grateful the week is closing well and I delivered what I said I would.',
 'Wrapped up a project I have been chipping away at for two weeks. Team was happy with the output. Evening reading.',
 'Completion feels different from progress. Progress is motion. Completion is arrival. I need more completions in my life.'),

('f1000028-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-08', 'okay',
 'Daylight saving. An extra hour of light in the evening. Small thing, real lift.',
 'Lazy Sunday. Slept in, did chores, took a walk. Read but skipped the workout. Changed the bed sheets.',
 'Recovery days are fine. I used to feel guilty about them. The trick is not letting guilt become shame become a spiral into avoidance.'),

('f1000029-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-09', 'great',
 'Back to full energy. Grateful for sleep and the routine that catches me when I drift.',
 'Exceptional Monday. Morning routine, meditation, solid workout, deep work block, read and journaled. Everything clicked again.',
 'When all the habits align the day has a different quality. It is not willpower — it is systems making good choices automatic.'),

('f1000030-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-11', 'bad',
 'Tomorrow is a new day. That is enough.',
 'Terrible night''s sleep led to a difficult day. Irritable all morning. Unproductive at work. Skipped the workout. Ate garbage food.',
 'Sleep is the keystone habit. When it fails everything else follows. I stayed up too late Monday and paid for it all day Tuesday.'),

('f1000031-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-12', 'good',
 'Grateful for a good night''s sleep finally. The difference is genuinely astounding.',
 'Recovered. Got back on track. Good Tonal session. Read for an hour in the evening.',
 'Recovery speed matters. Tuesday was a write-off. Wednesday I''m back. That''s something. I am getting better at not spiraling.'),

('f1000032-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-15', 'okay',
 'The week is almost done. Grateful for the weekend approaching.',
 'Average Saturday. Chores, some reading, a walk. Skipped the workout. Spent too long on YouTube.',
 'I need better defaults for leisure. YouTube is a time sink. Reading gives me something YouTube never does — a thought I own.'),

('f1000033-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-17', 'great',
 'Sunshine and a great Tonal session. Grateful for physical capability and the slow evidence of progress.',
 'Hit a new PR on chest press — 55 lbs for 3 sets of 10. Morning routine complete, meditation, work finished by 4pm, evening reading.',
 '55 lbs. Eight weeks ago I was at 40. Steady, unrushed, consistent. This is what progress looks like when you stop being impatient.'),

('f1000034-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-20', 'good',
 'First day of spring. Longer light, warmer air. The year is turning.',
 'Spring equinox. Took a long walk at sunset. Good work day, read in the evening, went to bed close to on time.',
 'I want to be outside more. The winter was productive but indoor-heavy. Time to rebalance toward light and movement.'),

('f1000035-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 '2026-03-27', 'great',
 '60 days of this system. Grateful for the data it has given me about who I actually am versus who I think I am.',
 'Quiet Saturday. Morning routine, long workout, afternoon reading, journaled more than usual. Felt like a completion.',
 'Two months in. The streak data does not lie. The gaps are instructive — they point to the habits I still resist. The wins are real. Both things are true. Keep going.')

ON CONFLICT (user_id, entry_date) DO NOTHING;

-- ============================================================
-- NOTES (19 in notes table)
-- ============================================================
INSERT INTO notes (id, user_id, title, content, category, created_at) VALUES

-- Work observations (8)
('e2000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Standup format drift',
 'Noticed the standup format has been drifting. People are giving status updates instead of surfacing blockers. The original purpose has been lost. Worth raising with the team — maybe a quick retro on the format itself.',
 'work', '2026-02-03 09:15:00+00'),

('e2000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Onboarding doc is actually working',
 'The new onboarding doc is saving real time. First person got set up in under a day — first time that has happened in months. Small investment, outsized return. Good reminder that documentation compounds.',
 'work', '2026-02-07 11:30:00+00'),

('e2000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Cross-team dependency gaps',
 'Cross-team dependencies keep catching us off guard at the last minute. We discover them in standup when it is already too late to course-correct. Need a lightweight way to surface these earlier — even a shared doc updated weekly would help.',
 'work', '2026-02-14 14:00:00+00'),

('e2000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Meeting culture observation',
 'Most calendar invites still have no agenda. It is the norm that should not be. When there is no agenda, there is no preparation, and when there is no preparation the meeting is just improvisation with extra steps. Could raise this in the next team retrospective.',
 'work', '2026-02-20 16:45:00+00'),

('e2000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Async communication improving',
 'The team is defaulting to Slack threads instead of spinning up calls for everything. This feels like a real culture shift. People are thinking through their questions before sending them. The quality of communication has gone up.',
 'work', '2026-03-05 10:20:00+00'),

('e2000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Manual data transfer — automation opportunity',
 'Still copying data manually between two internal systems. It takes about 20 minutes every Thursday and it is pure toil. No logic involved, just moving numbers. This is exactly the kind of thing that should be automated. Worth flagging to the team.',
 'work', '2026-03-10 13:00:00+00'),

('e2000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Leadership moment — decision delegation',
 'Manager deferred a decision to the team today instead of deciding solo. It was a small call but notable. The effect on the room was immediate — people engaged differently. Delegating decisions is a leadership skill I want to develop.',
 'work', '2026-03-17 15:30:00+00'),

('e2000008-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Doc review cycle is too slow',
 'By the time a document gets approved the context has shifted and the decisions in it are partially stale. The review cycle is too long and involves too many people. Need to think about what minimum viable review looks like — maybe two reviewers max with a 48-hour window.',
 'work', '2026-03-24 09:45:00+00'),

-- Random thoughts (6)
('e2000009-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Habits as automated decisions',
 'Been thinking about how habits are just automated decisions. Every habit I build is one fewer decision to make under pressure. The goal is to automate the right things so willpower is reserved for genuinely novel situations.',
 'thought', '2026-01-28 20:00:00+00'),

('e2000010-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Attention span and quality of life',
 'Read somewhere that the length of your attention span determines the quality of your life. Feels true lately. The more I fragment my attention across tabs and notifications, the less any single thing feels real or meaningful. Protecting attention might be the highest-leverage thing I can do.',
 'thought', '2026-02-03 21:30:00+00'),

('e2000011-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Compounding outside finance',
 'Compounding is not just about money. Skills, relationships, knowledge, trust — all compound. Small daily inputs have enormous long-run payoffs. The problem is that the payoff is invisible for so long that most people quit before it arrives.',
 'thought', '2026-02-17 19:00:00+00'),

('e2000012-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Why mornings feel sacred',
 'Why do mornings feel different? Something about the quiet before the world wakes up. No obligations have accumulated yet. The day is still open. Protect the mornings. They are the only part of the day that is genuinely mine.',
 'thought', '2026-03-02 07:45:00+00'),

('e2000013-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Books as the slow medium',
 'Books are the only medium that forces you to slow down and match the author''s pace. Every other format is optimized for speed and stimulus. Reading a book is an act of patience. Maybe that is why it feels different — it is training something other media atrophy.',
 'thought', '2026-03-12 21:00:00+00'),

('e2000014-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Sleep as character management',
 'I am noticeably more patient, more creative, and more decent to be around when I have slept well. Sleep is not just recovery — it is character management. The version of me that shows up on bad sleep is a worse person in every measurable way.',
 'thought', '2026-03-20 22:00:00+00'),

-- Personal reflections (5)
('e2000015-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'What do I actually want — 5 year version',
 'Spent the afternoon thinking about what I actually want out of the next five years. Career has a legible path. The rest of life is murkier — where to live, what kind of relationships to invest in, what I want to have built or experienced. The career clarity might be masking the harder questions.',
 'note', '2026-01-30 18:00:00+00'),

('e2000016-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Busy-ness as avoidance',
 'I default to busy-ness when I am avoiding something. The calendar fills up and it feels productive but sometimes it is just noise. Worth asking: what am I avoiding right now? Stillness tends to surface the answer quickly, which is probably why I resist it.',
 'note', '2026-02-11 20:30:00+00'),

('e2000017-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Social media and comparison',
 'Comparison creeps in when I''m on social media too long. Twenty minutes is fine. An hour rewires how I see my own life — suddenly everything feels insufficient. The solution is not willpower, it is friction. Deleting the app from the phone worked for two weeks. Need to try it again.',
 'note', '2026-02-26 21:00:00+00'),

('e2000018-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'The version I am building',
 'The version of me I''m trying to build doesn''t happen by accident. It requires intent every single day. The habits are the intent made operational. When I skip them it is not just a skipped habit — it is a small vote for the wrong version of myself.',
 'note', '2026-03-08 22:15:00+00'),

('e2000019-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Long phone call with old friend',
 'Had a two-hour phone call with a college friend tonight. We have not talked properly in eight months. Easy to forget how much those conversations matter until one reminds you. Some friendships are low-maintenance but high-value. Worth scheduling, not just hoping it happens.',
 'note', '2026-03-22 23:00:00+00')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ONE-ON-ONE ITEMS (6)
-- ============================================================
INSERT INTO one_on_one_items (id, user_id, question, context, status, created_at) VALUES

-- Discussed (3 — older)
('c3000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'What does success look like for me in Q1?',
 'Want to align on concrete outcomes rather than effort metrics so I know if I''m actually on track.',
 'discussed', '2026-02-05 09:00:00+00'),

('c3000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'I would like to talk about the onboarding experience for new team members.',
 'I think there are some gaps in the current process that are costing us ramp-up time. Have some ideas to share.',
 'discussed', '2026-02-12 09:00:00+00'),

('c3000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'How can I get more visibility into the decisions being made above our team?',
 'Sometimes I feel like context arrives too late to be useful. Curious if there is a better way to stay informed.',
 'discussed', '2026-02-20 09:00:00+00'),

-- Pending (3 — recent)
('c3000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'How are you thinking about growth paths for individual contributors on the team?',
 'I want to understand what the ladder looks like beyond my current level and what signals you use to evaluate readiness.',
 'pending', '2026-03-15 10:00:00+00'),

('c3000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'I have noticed some process friction in how we hand off work across teams — is that something you are seeing too?',
 'Specifically the late-stage dependency surprises. Want to know if this is a known issue or something worth raising more formally.',
 'pending', '2026-03-20 11:00:00+00'),

('c3000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'I would love to get your perspective on how you decide which meetings to attend versus which to delegate.',
 'Trying to get better at protecting deep work time without missing things that actually matter. Your calendar management seems intentional.',
 'pending', '2026-03-25 09:00:00+00')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TODOS (20)
-- ============================================================
INSERT INTO todos (id, user_id, title, notes, due_date, priority, status, project, created_at) VALUES

-- Completed (5)
('d3000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Schedule dentist appointment', null, '2026-02-15', 'medium', 'done', null, '2026-01-28 10:00:00+00'),

('d3000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Buy birthday gift for mom', 'She mentioned wanting a new cookbook', '2026-02-20', 'medium', 'done', null, '2026-02-01 09:00:00+00'),

('d3000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Return library books', null, '2026-02-10', 'low', 'done', null, '2026-02-03 08:00:00+00'),

('d3000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Fix leaky faucet in bathroom', 'Need to replace the washer — YouTube video saved', null, 'high', 'done', 'Home', '2026-02-08 11:00:00+00'),

('d3000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Prepare Q1 report slides', 'Due for leadership review', '2026-03-01', 'high', 'done', 'Work', '2026-02-20 09:00:00+00'),

-- Home project (3 open)
('d3000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Organize garage', 'Have been putting this off for months', '2026-04-15', 'medium', 'open', 'Home', '2026-02-15 10:00:00+00'),

('d3000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Replace smoke detector batteries', 'Three units need new batteries', '2026-03-10', 'high', 'open', 'Home', '2026-03-01 08:00:00+00'),

('d3000008-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Deep clean oven', null, null, 'low', 'open', 'Home', '2026-03-10 09:00:00+00'),

-- Work project (2 open)
('d3000009-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Draft performance review self-assessment', 'Due end of Q1', '2026-04-01', 'high', 'open', 'Work', '2026-03-05 09:00:00+00'),

('d3000010-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Update project documentation', 'Three docs are still on the old template', '2026-04-10', 'medium', 'open', 'Work', '2026-03-12 10:00:00+00'),

-- Open — no project (10)
('d3000011-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Grocery run', 'Need produce, coffee, and olive oil', '2026-03-28', 'medium', 'open', null, '2026-03-26 08:00:00+00'),

('d3000012-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Call insurance company about claim', 'Reference number in email from Feb 12', '2026-03-15', 'high', 'open', null, '2026-03-10 09:00:00+00'),

('d3000013-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Research new laptop options', 'Current one is 4 years old', null, 'low', 'open', null, '2026-02-25 20:00:00+00'),

('d3000014-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Schedule annual physical', null, '2026-04-05', 'high', 'open', null, '2026-03-15 10:00:00+00'),

('d3000015-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Renew car registration', 'Expired March 10 — do not forget', '2026-03-10', 'high', 'open', null, '2026-03-01 09:00:00+00'),

('d3000016-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Order new running shoes', 'Current pair has 400+ miles', '2026-04-01', 'medium', 'open', null, '2026-03-18 11:00:00+00'),

('d3000017-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Review investment portfolio allocation', 'Has not been touched since last year', '2026-03-31', 'medium', 'open', null, '2026-03-20 10:00:00+00'),

('d3000018-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Finish reading The Daily Stoic summary', 'Saved in Pocket', null, 'low', 'open', null, '2026-03-22 21:00:00+00'),

('d3000019-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Plan spring hiking trip', 'Looking at mid-April weekend', '2026-04-20', 'low', 'open', null, '2026-03-25 09:00:00+00'),

('d3000020-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Research competitor products for context', 'Three new tools launched in Q1', null, 'medium', 'open', null, '2026-03-26 14:00:00+00')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CHORES (10)
-- ============================================================
INSERT INTO chores (id, user_id, title, cadence, assigned_day) VALUES
  ('e1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Make bed',           'daily',   null),
  ('e1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Wash dishes',        'daily',   null),
  ('e1000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Tidy living room',   'daily',   null),
  ('e1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Vacuum',             'weekly',  'Saturday'),
  ('e1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Laundry',            'weekly',  'Sunday'),
  ('e1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Clean bathroom',     'weekly',  'Saturday'),
  ('e1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Grocery shopping',   'weekly',  'Sunday'),
  ('e1000008-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Deep clean kitchen', 'monthly', null),
  ('e1000009-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Pay bills',          'monthly', null),
  ('e1000010-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Change bed sheets',  'monthly', null)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CHORE LOGS
-- ============================================================

-- Make bed (daily, ~85% — same skip pattern as morning routine)
INSERT INTO chore_logs (id, chore_id, user_id, completed_date)
SELECT gen_random_uuid(), 'e1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', d::date
FROM generate_series('2026-01-26'::date, '2026-03-27'::date, '1 day'::interval) d
WHERE d::date NOT IN (
  '2026-01-28','2026-02-02','2026-02-09','2026-02-16','2026-02-22',
  '2026-03-01','2026-03-08','2026-03-15','2026-03-22'
);

-- Wash dishes (daily, ~85% — offset skip pattern)
INSERT INTO chore_logs (id, chore_id, user_id, completed_date)
SELECT gen_random_uuid(), 'e1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', d::date
FROM generate_series('2026-01-26'::date, '2026-03-27'::date, '1 day'::interval) d
WHERE d::date NOT IN (
  '2026-01-29','2026-02-04','2026-02-11','2026-02-18','2026-02-25',
  '2026-03-04','2026-03-11','2026-03-18','2026-03-25'
);

-- Tidy living room (daily, ~75%)
INSERT INTO chore_logs (id, chore_id, user_id, completed_date)
SELECT gen_random_uuid(), 'e1000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', d::date
FROM generate_series('2026-01-26'::date, '2026-03-27'::date, '1 day'::interval) d
WHERE d::date NOT IN (
  '2026-01-27','2026-01-30','2026-02-03','2026-02-07','2026-02-10',
  '2026-02-14','2026-02-17','2026-02-21','2026-02-24','2026-02-28',
  '2026-03-05','2026-03-09','2026-03-12','2026-03-20','2026-03-26'
);

-- Vacuum (weekly, Saturdays: Jan 31, Feb 7, 14, 21, 28, Mar 7, 14, 21 — completed 6 of 8)
INSERT INTO chore_logs (id, chore_id, user_id, completed_date) VALUES
  (gen_random_uuid(), 'e1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-01-31'),
  (gen_random_uuid(), 'e1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-07'),
  (gen_random_uuid(), 'e1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-14'),
  -- skipped Feb 21
  (gen_random_uuid(), 'e1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-28'),
  (gen_random_uuid(), 'e1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-07'),
  -- skipped Mar 14
  (gen_random_uuid(), 'e1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-21');

-- Laundry (weekly, Sundays: Feb 1, 8, 15, 22, Mar 1, 8, 15, 22 — completed 7 of 8)
INSERT INTO chore_logs (id, chore_id, user_id, completed_date) VALUES
  (gen_random_uuid(), 'e1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-01'),
  (gen_random_uuid(), 'e1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-08'),
  (gen_random_uuid(), 'e1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-15'),
  (gen_random_uuid(), 'e1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-22'),
  (gen_random_uuid(), 'e1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-01'),
  (gen_random_uuid(), 'e1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-08'),
  -- skipped Mar 15
  (gen_random_uuid(), 'e1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-22');

-- Clean bathroom (weekly, Saturdays — completed 5 of 8)
INSERT INTO chore_logs (id, chore_id, user_id, completed_date) VALUES
  (gen_random_uuid(), 'e1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-01-31'),
  -- skipped Feb 7
  (gen_random_uuid(), 'e1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-14'),
  -- skipped Feb 21
  (gen_random_uuid(), 'e1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-28'),
  (gen_random_uuid(), 'e1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-07'),
  -- skipped Mar 14
  (gen_random_uuid(), 'e1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-21');

-- Grocery shopping (weekly, Sundays — completed 7 of 8)
INSERT INTO chore_logs (id, chore_id, user_id, completed_date) VALUES
  (gen_random_uuid(), 'e1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-01'),
  (gen_random_uuid(), 'e1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-08'),
  (gen_random_uuid(), 'e1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-15'),
  (gen_random_uuid(), 'e1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-22'),
  (gen_random_uuid(), 'e1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-01'),
  -- skipped Mar 8
  (gen_random_uuid(), 'e1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-15'),
  (gen_random_uuid(), 'e1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-22');

-- Monthly chores
INSERT INTO chore_logs (id, chore_id, user_id, completed_date) VALUES
  -- Deep clean kitchen
  (gen_random_uuid(), 'e1000008-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-15'),
  -- Pay bills
  (gen_random_uuid(), 'e1000009-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-01'),
  (gen_random_uuid(), 'e1000009-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-01'),
  -- Change bed sheets
  (gen_random_uuid(), 'e1000010-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-02-08'),
  (gen_random_uuid(), 'e1000010-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', '2026-03-08');

-- ============================================================
-- BOOKS
-- ============================================================
INSERT INTO books (id, user_id, title, author, status, rating, review, started_date, finished_date) VALUES

('b1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Meditations', 'Marcus Aurelius', 'finished', 5,
 'Marcus Aurelius wrote this for himself, not for us — and somehow that makes it more powerful. These are not motivational platitudes; they are a man wrestling with power, ego, loss, and mortality in real time. I returned to certain passages every morning for weeks. The Stoic framework reframes suffering as material for growth, and that shift alone is worth the read.',
 '2026-01-26', '2026-02-28'),

('b1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Sapiens', 'Yuval Noah Harari', 'finished', 4,
 'A sweeping, often uncomfortable look at how Homo sapiens came to dominate the planet. Harari is a gifted storyteller and the cognitive revolution chapter is genuinely mind-expanding. Some of the later sections feel more speculative than I would like, and the ending is bleaker than expected, but the core thesis is one I keep returning to.',
 '2025-11-15', '2026-01-15'),

('b1000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'The Obstacle Is the Way', 'Ryan Holiday', 'finished', 5,
 'This is a book I needed at the right moment. Holiday''s retelling of Stoic philosophy through historical examples made the ideas land in a way that abstract philosophy did not at first. Obstacle, Persistence, Will — the three-part framework is simple but it works. I have already recommended it to three people.',
 '2025-10-01', '2025-11-10'),

('b1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Man''s Search for Meaning', 'Viktor Frankl', 'reading', null, null,
 '2026-02-25', null),

('b1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'The Daily Stoic', 'Ryan Holiday', 'want_to_read', null, null, null, null),

('b1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Guns, Germs, and Steel', 'Jared Diamond', 'want_to_read', null, null, null, null)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BOOK NOTES
-- ============================================================
INSERT INTO book_notes (id, book_id, user_id, content, note_type, created_at) VALUES

-- Meditations (4 notes)
('b0000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'You have power over your mind, not outside events. Realize this, and you will find strength.',
 'highlight', '2026-02-03 21:00:00+00'),

('b0000002-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'The impediment to action advances action. What stands in the way becomes the way.',
 'highlight', '2026-02-12 21:30:00+00'),

('b0000003-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Aurelius constantly returns to the idea that time is short and we waste it on things that don''t matter. The urgency he felt is remarkable given he had every earthly comfort available to a Roman emperor. It was not circumstance that made him wise — it was practice.',
 'note', '2026-02-19 20:00:00+00'),

('b0000004-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Does Stoicism conflict with ambition? Aurelius seemed to think not — equanimity and effort can coexist. The key is detachment from outcomes, not from the work itself. You can care deeply about doing good work without being destroyed by the results.',
 'discussion', '2026-02-28 22:00:00+00'),

-- Sapiens (3 notes)
('b0000005-0000-0000-0000-000000000001', 'b1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Ever since the Cognitive Revolution, Sapiens have been living in a dual reality. On the one hand, the objective reality of rivers, trees and lions; and on the other hand, the imagined reality of gods, nations and corporations.',
 'highlight', '2025-12-10 21:00:00+00'),

('b0000006-0000-0000-0000-000000000001', 'b1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'The chapter on the Agricultural Revolution reframes it as a trap rather than progress — humans worked harder, ate worse, and lived shorter lives than hunter-gatherers. Counterintuitive and very convincing. Progress for the species, regression for the individual.',
 'note', '2025-12-22 20:30:00+00'),

('b0000007-0000-0000-0000-000000000001', 'b1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Harari argues that history has no justice and progress is not inevitable. Uncomfortable but probably true. What do you do with that? I think you stop expecting the arc to bend on its own and start asking what you are going to do about it.',
 'discussion', '2026-01-10 21:00:00+00'),

-- The Obstacle Is the Way (3 notes)
('b0000008-0000-0000-0000-000000000001', 'b1000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'The obstacle in the path becomes the path. Never forget, within every obstacle is an opportunity to improve our condition.',
 'highlight', '2025-10-15 20:00:00+00'),

('b0000009-0000-0000-0000-000000000001', 'b1000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Think progress, not perfection.',
 'highlight', '2025-10-28 21:00:00+00'),

('b0000010-0000-0000-0000-000000000001', 'b1000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'The chapter on Thomas Edison reframing the factory fire as an opportunity to rebuild better stuck with me. The reflex of experienced people seems to be: what is the upside here? That is a trained response, not a natural one. Worth training.',
 'note', '2025-11-05 20:30:00+00'),

-- Man's Search for Meaning (2 notes — currently reading)
('b0000011-0000-0000-0000-000000000001', 'b1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Everything can be taken from a man but one thing: the last of the human freedoms — to choose one''s attitude in any given set of circumstances, to choose one''s own way.',
 'highlight', '2026-02-27 21:00:00+00'),

('b0000012-0000-0000-0000-000000000001', 'b1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5',
 'Frankl''s concept of logotherapy — that meaning is the primary human drive, not pleasure or power — feels more true than Freud''s or Adler''s frameworks. Only 80 pages in and it has already shifted how I think about motivation and what I am actually trying to do.',
 'note', '2026-03-05 22:00:00+00')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- WORKOUT TEMPLATES
-- ============================================================
INSERT INTO workout_templates (id, user_id, name, type) VALUES
  ('c1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Tonal Upper Body A',    'tonal'),
  ('c1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'Swedish Ladder Stage 1', 'swedish_ladder')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TEMPLATE EXERCISES
-- ============================================================
INSERT INTO template_exercises (id, template_id, exercise_name, sets, reps, order_index) VALUES
  -- Tonal Upper Body A
  (gen_random_uuid(), 'c1000001-0000-0000-0000-000000000001', 'Chest Press',       3, 10, 1),
  (gen_random_uuid(), 'c1000001-0000-0000-0000-000000000001', 'Shoulder Press',    3, 10, 2),
  (gen_random_uuid(), 'c1000001-0000-0000-0000-000000000001', 'Lat Pulldown',      3, 12, 3),
  (gen_random_uuid(), 'c1000001-0000-0000-0000-000000000001', 'Bicep Curl',        3, 12, 4),
  (gen_random_uuid(), 'c1000001-0000-0000-0000-000000000001', 'Tricep Extension',  3, 12, 5),
  -- Swedish Ladder Stage 1
  (gen_random_uuid(), 'c1000002-0000-0000-0000-000000000001', 'Dead Hang',         3,  5, 1),
  (gen_random_uuid(), 'c1000002-0000-0000-0000-000000000001', 'Scapular Pull',     3,  8, 2),
  (gen_random_uuid(), 'c1000002-0000-0000-0000-000000000001', 'Incline Row',       3, 10, 3),
  (gen_random_uuid(), 'c1000002-0000-0000-0000-000000000001', 'Knee Push-up',      3, 10, 4),
  (gen_random_uuid(), 'c1000002-0000-0000-0000-000000000001', 'Bodyweight Squat',  3, 15, 5),
  (gen_random_uuid(), 'c1000002-0000-0000-0000-000000000001', 'Plank Hold',        3, 30, 6);

-- ============================================================
-- WORKOUT SESSIONS (12 sessions)
-- ============================================================
INSERT INTO workout_sessions (id, user_id, template_id, session_date, notes) VALUES
  -- Tonal sessions (7) — weight progression
  ('d1000001-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000001-0000-0000-0000-000000000001', '2026-02-02', 'First session back on the Tonal. Started conservative to feel things out.'),
  ('d1000002-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000001-0000-0000-0000-000000000001', '2026-02-09', 'Bumped weights slightly across the board. Felt strong.'),
  ('d1000003-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000001-0000-0000-0000-000000000001', '2026-02-16', 'Good session. Shoulder press is the weakest link. Keeping lat pulldown at 45.'),
  ('d1000004-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000001-0000-0000-0000-000000000001', '2026-02-23', 'Chest press PR. Last rep was hard but clean.'),
  ('d1000005-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000001-0000-0000-0000-000000000001', '2026-03-02', 'Hit 50 on chest press. New milestone. Triceps were burning.'),
  ('d1000006-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000001-0000-0000-0000-000000000001', '2026-03-09', 'Great session. Everything moving in the right direction.'),
  ('d1000007-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000001-0000-0000-0000-000000000001', '2026-03-16', '55 lbs on chest press. That is a real milestone. 8 weeks of steady work.'),
  -- Swedish Ladder sessions (5)
  ('d1000008-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000002-0000-0000-0000-000000000001', '2026-01-26', 'Starting Stage 1. Everything felt hard. Dead hang barely lasted 5 seconds.'),
  ('d1000009-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000002-0000-0000-0000-000000000001', '2026-02-01', 'Scapular pulls getting smoother. Hang is still rough. Bodyweight squats easy.'),
  ('d1000010-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000002-0000-0000-0000-000000000001', '2026-02-08', 'Good session overall. Was sick earlier this week so took this easy.'),
  ('d1000011-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000002-0000-0000-0000-000000000001', '2026-02-15', 'Hang is up to 8 seconds consistently. Incline rows feel solid. Progress.'),
  ('d1000012-0000-0000-0000-000000000001', '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 'c1000002-0000-0000-0000-000000000001', '2026-02-22', 'Strong session despite bad day overall. The workout was the best part of the day.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SESSION EXERCISES
-- ============================================================

-- Session 1 (Feb 2) — starter weights
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, order_index) VALUES
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'Chest Press',      3, 10, 40.0,  1),
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'Shoulder Press',   3, 10, 30.0,  2),
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'Lat Pulldown',     3, 12, 40.0,  3),
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'Bicep Curl',       3, 12, 20.0,  4),
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'Tricep Extension', 3, 12, 20.0,  5);

-- Session 2 (Feb 9)
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, order_index) VALUES
  (gen_random_uuid(), 'd1000002-0000-0000-0000-000000000001', 'Chest Press',      3, 10, 42.5, 1),
  (gen_random_uuid(), 'd1000002-0000-0000-0000-000000000001', 'Shoulder Press',   3, 10, 32.5, 2),
  (gen_random_uuid(), 'd1000002-0000-0000-0000-000000000001', 'Lat Pulldown',     3, 12, 42.5, 3),
  (gen_random_uuid(), 'd1000002-0000-0000-0000-000000000001', 'Bicep Curl',       3, 12, 20.0, 4),
  (gen_random_uuid(), 'd1000002-0000-0000-0000-000000000001', 'Tricep Extension', 3, 12, 22.5, 5);

-- Session 3 (Feb 16)
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, order_index) VALUES
  (gen_random_uuid(), 'd1000003-0000-0000-0000-000000000001', 'Chest Press',      3, 10, 45.0, 1),
  (gen_random_uuid(), 'd1000003-0000-0000-0000-000000000001', 'Shoulder Press',   3, 10, 35.0, 2),
  (gen_random_uuid(), 'd1000003-0000-0000-0000-000000000001', 'Lat Pulldown',     3, 12, 45.0, 3),
  (gen_random_uuid(), 'd1000003-0000-0000-0000-000000000001', 'Bicep Curl',       3, 12, 22.5, 4),
  (gen_random_uuid(), 'd1000003-0000-0000-0000-000000000001', 'Tricep Extension', 3, 12, 22.5, 5);

-- Session 4 (Feb 23)
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, order_index) VALUES
  (gen_random_uuid(), 'd1000004-0000-0000-0000-000000000001', 'Chest Press',      3, 10, 47.5, 1),
  (gen_random_uuid(), 'd1000004-0000-0000-0000-000000000001', 'Shoulder Press',   3, 10, 35.0, 2),
  (gen_random_uuid(), 'd1000004-0000-0000-0000-000000000001', 'Lat Pulldown',     3, 12, 47.5, 3),
  (gen_random_uuid(), 'd1000004-0000-0000-0000-000000000001', 'Bicep Curl',       3, 12, 22.5, 4),
  (gen_random_uuid(), 'd1000004-0000-0000-0000-000000000001', 'Tricep Extension', 3, 12, 25.0, 5);

-- Session 5 (Mar 2)
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, order_index) VALUES
  (gen_random_uuid(), 'd1000005-0000-0000-0000-000000000001', 'Chest Press',      3, 10, 50.0, 1),
  (gen_random_uuid(), 'd1000005-0000-0000-0000-000000000001', 'Shoulder Press',   3, 10, 37.5, 2),
  (gen_random_uuid(), 'd1000005-0000-0000-0000-000000000001', 'Lat Pulldown',     3, 12, 50.0, 3),
  (gen_random_uuid(), 'd1000005-0000-0000-0000-000000000001', 'Bicep Curl',       3, 12, 25.0, 4),
  (gen_random_uuid(), 'd1000005-0000-0000-0000-000000000001', 'Tricep Extension', 3, 12, 25.0, 5);

-- Session 6 (Mar 9)
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, order_index) VALUES
  (gen_random_uuid(), 'd1000006-0000-0000-0000-000000000001', 'Chest Press',      3, 10, 52.5, 1),
  (gen_random_uuid(), 'd1000006-0000-0000-0000-000000000001', 'Shoulder Press',   3, 10, 40.0, 2),
  (gen_random_uuid(), 'd1000006-0000-0000-0000-000000000001', 'Lat Pulldown',     3, 12, 50.0, 3),
  (gen_random_uuid(), 'd1000006-0000-0000-0000-000000000001', 'Bicep Curl',       3, 12, 25.0, 4),
  (gen_random_uuid(), 'd1000006-0000-0000-0000-000000000001', 'Tricep Extension', 3, 12, 27.5, 5);

-- Session 7 (Mar 16) — PR day
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, order_index) VALUES
  (gen_random_uuid(), 'd1000007-0000-0000-0000-000000000001', 'Chest Press',      3, 10, 55.0, 1),
  (gen_random_uuid(), 'd1000007-0000-0000-0000-000000000001', 'Shoulder Press',   3, 10, 40.0, 2),
  (gen_random_uuid(), 'd1000007-0000-0000-0000-000000000001', 'Lat Pulldown',     3, 12, 52.5, 3),
  (gen_random_uuid(), 'd1000007-0000-0000-0000-000000000001', 'Bicep Curl',       3, 12, 27.5, 4),
  (gen_random_uuid(), 'd1000007-0000-0000-0000-000000000001', 'Tricep Extension', 3, 12, 27.5, 5);

-- Session 8 (Jan 26) — Swedish Ladder, first session, bodyweight
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, notes, order_index) VALUES
  (gen_random_uuid(), 'd1000008-0000-0000-0000-000000000001', 'Dead Hang',        3,  5, null, 'Barely held 5 sec each set', 1),
  (gen_random_uuid(), 'd1000008-0000-0000-0000-000000000001', 'Scapular Pull',    3,  8, null, 'Hard to feel the movement', 2),
  (gen_random_uuid(), 'd1000008-0000-0000-0000-000000000001', 'Incline Row',      3, 10, null, null, 3),
  (gen_random_uuid(), 'd1000008-0000-0000-0000-000000000001', 'Knee Push-up',     3, 10, null, null, 4),
  (gen_random_uuid(), 'd1000008-0000-0000-0000-000000000001', 'Bodyweight Squat', 3, 15, null, null, 5),
  (gen_random_uuid(), 'd1000008-0000-0000-0000-000000000001', 'Plank Hold',       3, 30, null, 'In seconds', 6);

-- Session 9 (Feb 1)
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, notes, order_index) VALUES
  (gen_random_uuid(), 'd1000009-0000-0000-0000-000000000001', 'Dead Hang',        3,  5, null, 'A little better. Grip still gives out', 1),
  (gen_random_uuid(), 'd1000009-0000-0000-0000-000000000001', 'Scapular Pull',    3,  8, null, 'Starting to feel the scap engage', 2),
  (gen_random_uuid(), 'd1000009-0000-0000-0000-000000000001', 'Incline Row',      3, 10, null, null, 3),
  (gen_random_uuid(), 'd1000009-0000-0000-0000-000000000001', 'Knee Push-up',     3, 10, null, null, 4),
  (gen_random_uuid(), 'd1000009-0000-0000-0000-000000000001', 'Bodyweight Squat', 3, 15, null, null, 5),
  (gen_random_uuid(), 'd1000009-0000-0000-0000-000000000001', 'Plank Hold',       3, 30, null, null, 6);

-- Session 10 (Feb 8) — took it easy (recovering from illness)
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, notes, order_index) VALUES
  (gen_random_uuid(), 'd1000010-0000-0000-0000-000000000001', 'Dead Hang',        2,  5, null, 'Only 2 sets, still recovering', 1),
  (gen_random_uuid(), 'd1000010-0000-0000-0000-000000000001', 'Scapular Pull',    2,  8, null, null, 2),
  (gen_random_uuid(), 'd1000010-0000-0000-0000-000000000001', 'Incline Row',      2, 10, null, null, 3),
  (gen_random_uuid(), 'd1000010-0000-0000-0000-000000000001', 'Knee Push-up',     2, 10, null, null, 4),
  (gen_random_uuid(), 'd1000010-0000-0000-0000-000000000001', 'Bodyweight Squat', 2, 15, null, null, 5),
  (gen_random_uuid(), 'd1000010-0000-0000-0000-000000000001', 'Plank Hold',       2, 30, null, null, 6);

-- Session 11 (Feb 15) — back to full
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, notes, order_index) VALUES
  (gen_random_uuid(), 'd1000011-0000-0000-0000-000000000001', 'Dead Hang',        3,  5, null, 'Consistent 8 sec holds now', 1),
  (gen_random_uuid(), 'd1000011-0000-0000-0000-000000000001', 'Scapular Pull',    3,  8, null, 'Feeling solid', 2),
  (gen_random_uuid(), 'd1000011-0000-0000-0000-000000000001', 'Incline Row',      3, 10, null, null, 3),
  (gen_random_uuid(), 'd1000011-0000-0000-0000-000000000001', 'Knee Push-up',     3, 12, null, 'Did 12 instead of 10, felt easy', 4),
  (gen_random_uuid(), 'd1000011-0000-0000-0000-000000000001', 'Bodyweight Squat', 3, 15, null, null, 5),
  (gen_random_uuid(), 'd1000011-0000-0000-0000-000000000001', 'Plank Hold',       3, 35, null, 'Extended hold by 5 sec', 6);

-- Session 12 (Feb 22) — strong session on a bad day
INSERT INTO session_exercises (id, session_id, exercise_name, planned_sets, planned_reps, actual_weight_lbs, notes, order_index) VALUES
  (gen_random_uuid(), 'd1000012-0000-0000-0000-000000000001', 'Dead Hang',        3,  5, null, 'Held 10 sec — new personal best', 1),
  (gen_random_uuid(), 'd1000012-0000-0000-0000-000000000001', 'Scapular Pull',    3,  8, null, 'Controlled and clean', 2),
  (gen_random_uuid(), 'd1000012-0000-0000-0000-000000000001', 'Incline Row',      3, 10, null, null, 3),
  (gen_random_uuid(), 'd1000012-0000-0000-0000-000000000001', 'Knee Push-up',     3, 12, null, null, 4),
  (gen_random_uuid(), 'd1000012-0000-0000-0000-000000000001', 'Bodyweight Squat', 3, 15, null, null, 5),
  (gen_random_uuid(), 'd1000012-0000-0000-0000-000000000001', 'Plank Hold',       3, 35, null, null, 6);

-- ============================================================
-- SWEDISH LADDER STAGES
-- ============================================================
INSERT INTO swedish_ladder_stages (id, user_id, stage_number, started_at) VALUES
  (gen_random_uuid(), '7fdca7f5-83f4-4847-b214-9ed0ff55e3c5', 1, '2026-01-26 08:00:00+00')
ON CONFLICT DO NOTHING;
