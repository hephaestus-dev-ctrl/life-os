-- =============================================================
-- Life OS — Sisyphus Test Account: Rich Journal Entries
-- User ID: e27a8c4c-2864-480e-955c-8b4e0754bfdb
-- 30 entries across Nov 2025 – May 2026
-- Run in Supabase Dashboard → SQL Editor
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- NOVEMBER 2025 · Book: Can't Hurt Me — David Goggins
-- Arc: raw start, humbled by the data, discovering the 40% rule
-- ─────────────────────────────────────────────────────────────

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-11-03',
  'okay',
  'Bible study this morning landed on Psalm 46 — "God is our refuge and strength." That felt right for where I am right now. Grateful for the structure this app is forcing on me, even when what I see in the data stings.',
  'Started tracking seriously with Life OS this week and the numbers are already telling on me. I said I work out six days a week but this week was four. I said I''m consistent but the app doesn''t care what I said — it shows what I did. Reading Goggins right now and he talks about the accountability mirror — staring at yourself and admitting every single thing you''re hiding from. I did that this morning and it wasn''t comfortable. The commute on Tuesday was two hours of Goggins'' voice telling me about his 300-pound childhood and I sat there eating a granola bar feeling like I''d been exposed. I''m not starting from zero but I''m starting from honest, which might be harder. November is for finding out what''s true.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-11-08',
  'bad',
  'Grateful that I woke up at all this morning even if it was 5:20 instead of 4:00. Grateful that my Bible study — Proverbs 4 today — still happened even if it was late. Grateful for the alarm that actually did go off and the fact that I chose to move.',
  'This was a bad week and I''m not going to dress it up. I missed the alarm twice, got to Bible study late twice, and only hit three workouts. Goggins would look at this week and call it exactly what it is — a week where I let comfort win. The 40% rule he talks about is real though: when I wanted to quit my run on Wednesday morning at mile two, I pushed to mile four. That''s something. The commute on Thursday gave me two hours with the book and he was describing the hell of SEAL training and I thought about how my hard thing is waking up at 4am and honestly felt embarrassed by that comparison. But he also says the only way to callus your mind is to do the thing that hurts. I did the run. I didn''t do it six times. Own it and move.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-11-14',
  'good',
  'Grateful that this morning''s Bible study — Luke 9, "take up your cross daily" — felt like it was written for this exact season I''m in. Grateful for a working body that showed up to the gym four times this week and didn''t quit. Grateful for the 4am alarm that I actually hit today.',
  'Better week. Four workouts, 4am wake-up hit four out of seven days, Bible study every single morning without exception — that streak is the one I''m most proud of right now. On the commute Tuesday I read the section where Goggins describes the Cookie Jar — the mental vault of hard things you''ve already done that you draw on when the present moment is killing you. I started building mine in my head on the bus. The times I showed up when I didn''t want to. Small list right now. I want it to grow. The Life OS data is still humbling but it''s at least showing a trend in the right direction. Cybersecurity work this week was heavy — two incidents to respond to — and instead of using it as an excuse to skip the gym I used it as a reason to go. That''s a shift. Small, but real.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-11-20',
  'okay',
  'Grateful for Matthew 5 this morning — the beatitudes are a framework for character I keep returning to. Grateful that even an inconsistent week still had three solid workouts in it. Grateful that the commute gives me something to do with my mind besides scroll.',
  'Three workouts this week instead of six. That''s the fact. No excuse beyond distraction — I let the week run me instead of running the week. Goggins talks about the governor — the artificial limit your brain puts on you before you''re actually done — and I think my governor is showing up at the end of the work day when I''m tired from the commute and telling me I already did enough. I didn''t. The WGU coursework is picking up and I''ve been using that as a reason to skip the gym on commute days, which is backwards — those are the days I need the gym most. Bible study is holding though. Every single morning, Proverbs or Luke, and it grounds the day no matter what happens after. I''m inconsistent everywhere except that. It''s the one thing I won''t negotiate.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-11-26',
  'good',
  'It''s Thanksgiving and I''m grateful for the fact that I got up at 4am today anyway — that choice felt like a statement. Grateful for Goggins finishing with the challenge to figure out who you actually are, not who you think you are. Grateful for parents who modeled work ethic even when I wasn''t paying attention.',
  'Thanksgiving morning, 4:15am, Bible study done, workout done — all before my family was awake. Finished Can''t Hurt Me today on the couch while everyone else slept in. The last chapter hits different: he asks who are you when no one is watching, what do you do when there''s no accountability structure, no race to train for, no deployment coming. I looked at my Life OS data for November and it told the truth. Four and a half weeks in and I''m not the guy I wanted to be yet but I''m more honest about the gap than I was on November 1st. That''s not nothing. The cold is coming and the 4am wakeups are about to get harder. Good. I need to know who I am when it''s hard.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

-- ─────────────────────────────────────────────────────────────
-- DECEMBER 2025 · Book: Extreme Ownership — Jocko Willink
-- Arc: holiday disruption, honest collapse, ownership, rebound
-- ─────────────────────────────────────────────────────────────

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-12-02',
  'good',
  'Grateful for Jocko starting Extreme Ownership with a war story that immediately reframed how I think about leadership — including self-leadership. Grateful that Bible study this morning in Romans 12 said "be transformed by the renewing of your mind" and I actually felt that. Grateful for the commute because it gave me two hours with this book today.',
  'Started Extreme Ownership on the train Tuesday and by the time I got to the office I had already filled half a page of notes in my phone. The Ramadi chapter where Jocko takes responsibility for friendly fire — publicly, in front of everyone — is one of the most striking things I''ve read. There''s a version of me that would have looked at last month''s data and found something to blame. The commute. The incidents at work. The WGU deadline. Jocko would say: no. You made the calls that produced those results. Own them. December is starting fresh and I have five workouts already this week for the first time since I started tracking. The accountability mirror from Goggins is now getting filtered through Jocko''s ownership framework and together they''re building something that feels less like motivation and more like discipline.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-12-09',
  'okay',
  'Grateful for Proverbs 16 this morning — "commit to the LORD whatever you do, and he will establish your plans." Grateful for three solid workouts this week even in the middle of holiday noise. Grateful for a WGU instructor who gives real feedback instead of soft grades.',
  'Holiday season is showing me exactly where my systems are weak. Three workouts instead of six because two company events and a WGU deadline stacked on top of each other in a week I didn''t protect. Jocko''s chapter on prioritize and execute keeps echoing — when multiple problems hit simultaneously you don''t freeze, you figure out what matters most and do that first. I prioritized the coursework. I deprioritized the gym. That was a decision, not a victim story. But I also need to figure out how to not get into a position where I''m making that tradeoff every December. The Bible study held. That''s the anchor. Two hours on the train Wednesday gave me the Decentralized Command chapter and I started thinking about how I run my own life like a poorly organized platoon — reactive, no clear intent, no defined tasks for each zone of my day. That changes now.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-12-17',
  'bad',
  'Grateful that I still opened my Bible this morning even though I almost didn''t. Grateful that my one workout this week happened at all and that I showed up for it when I could have stayed on the couch. Grateful for the honesty this journal requires — even ugly honesty.',
  'One workout this week. One. I''m not going to pretend that''s fine. The holiday parties, the late nights, the extra drinks at the company gathering — I let all of it happen to me like someone who doesn''t have a plan. Jocko says there are no bad teams, only bad leaders. I am the leader and the team right now and I failed both. Bible study has been happening but rushed — I''ve been doing it in bed instead of at my desk with coffee, which feels different, less real, less chosen. The 4am wakeup collapsed by December 15th. I''m getting up at 5:30 or 6. This is the December dip and I''m living it. The only thing I''m proud of right now is that I''m writing this entry instead of pretending December was fine. It wasn''t. Own it. Fix it. The rebound starts tomorrow, not January 1st.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-12-22',
  'okay',
  'Grateful that the rebound is real — three workouts since the worst week, 4am restored twice already. Grateful that Jocko''s concept of "default aggressive" is actually working: when I feel like waiting, I''m choosing to act instead. Grateful for Christmas week giving me more quiet time to rebuild.',
  'Rallied hard this past week. The December 17th entry shook something loose — I re-read it twice and each time I felt something between shame and determination. Jocko calls it good: when something goes wrong and you say "good," now I know what to fix. Three workouts since then. Bible study back at the desk with coffee. 4am on Monday and today. It''s not December 1st levels yet but the needle is moving. WGU final submitted yesterday which takes a massive weight off my week. The commute today was quiet — post-Christmas travel making the train half-empty — and I sat there reading the Cover and Move chapter and thinking about how I cover my own weaknesses. Which habits carry me when others fail. Bible study carries everything. It hasn''t broken once. That''s my cover.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2025-12-29',
  'good',
  'Grateful to close out a messy December with four workouts in the last ten days and a clear-eyed review of the whole year. Grateful for Extreme Ownership ending with the concept that discipline equals freedom — I wrote that on a notecard and put it on my desk. Grateful for Life OS data that made it impossible to lie to myself about what December actually was.',
  'Ran a full year-end review through Life OS today and December''s numbers are humbling but I''m choosing to see them as data, not verdict. Extreme Ownership is finished and the final concept lands hard: discipline equals freedom. The more you hold yourself to the schedule, the more energy you have for everything that actually matters. December showed me what freedom without discipline looks like — it looks like one workout in a week and Bible study in bed at 6:30am. I don''t want that freedom. January is planned. I mean really planned — workout schedule on paper, WGU calendar blocked, commute reading slots committed. Peterson''s 12 Rules for Life is queued up. I want January to be the month I stop saying I''m building discipline and start seeing the evidence that I have it.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

-- ─────────────────────────────────────────────────────────────
-- JANUARY 2026 · Book: 12 Rules for Life — Jordan Peterson
-- Arc: new year momentum, things clicking, cold shower streak
-- ─────────────────────────────────────────────────────────────

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-01-03',
  'good',
  'Grateful to start this year with a plan that actually has specificity — not "work out more" but "gym at 5am Monday Wednesday Friday Saturday and run Tuesday Thursday." Grateful that Proverbs 1 in Bible study this morning felt like wisdom calling out in the street and I was finally close enough to hear it. Grateful for the cold shower that started today, day one, which was miserable and exactly what I needed.',
  'Day one of the cold shower streak. Not because it''s January 1st — I started on the third on purpose because I didn''t want it to feel like a resolution. This is a practice. Peterson''s first rule is stand up straight with your shoulders back and he uses the lobster dominance hierarchy to make the point that posture signals your internal state to yourself, not just to others. I stood in that cold water for two minutes and it was terrible and I did not quit and I stood there with my shoulders back. Bible study this morning was longer than usual — I sat with Proverbs 1 for twenty minutes. On the commute Tuesday I started the Peterson book and he''s already challenging me in a way neither Goggins nor Jocko did: he''s not motivating you, he''s confronting you. The Life OS entry tonight feels like a promise I''m making to the app and to myself.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-01-10',
  'great',
  'Grateful for eight consecutive days of cold showers — the habit is forming faster than I expected. Grateful that Bible study this morning in Proverbs 4 felt like Peterson wrote it: "Get wisdom, get understanding; do not forget my words or turn away from them." Grateful for a body that has hit six workouts this week for the first time in this entire journey.',
  'Something shifted this week. Six workouts. Eight cold showers. Bible study every morning at 4:10am without exception. The data in Life OS is reflecting something that feels different from November — it''s not urgency, it''s rhythm. Peterson has a chapter on telling the truth and I sat with it on the Wednesday commute and came to terms with something I''d been avoiding: I''ve been inconsistent because I kept telling myself stories about why each miss was okay. The miss was okay. The story was the problem. The WGU cybersecurity coursework is hard right now — cloud security module that''s genuinely challenging — and instead of treating the work as a reason to skip the gym, I''ve started treating the gym as the thing that makes the work possible. Cold shower after the workout is the signal that the hard part of the day is done and now I get to think clearly. That signal is working.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-01-17',
  'good',
  'Grateful for fifteen cold showers and the realization that the first thirty seconds is always the worst and then it''s just cold water — which is a metaphor I''m carrying everywhere now. Grateful for Luke 14 in Bible study this morning and the parable about counting the cost before you build a tower. Grateful for a commute that gives me six hours a week of uninterrupted reading time that I didn''t used to value.',
  'Peterson''s Rule 6 is "set your house in perfect order before you criticize the world" and I''ve been sitting with it for three days. My house is not in perfect order. My desk at home is a mess. My WGU schedule has slipped by four days. My workout log has a gap on Friday that I blamed on a 7pm security incident at work. But none of those things are about the world — they''re about my choices and my planning. I spent two hours on the commute Wednesday doing a full Life OS audit: workouts, wake times, study hours, journal entry frequency. The data is better than November by every metric but I''m not done. Cold shower streak is holding at fifteen days and the weird thing is I''m starting to look forward to them. I look forward to the misery in the way Goggins described the pleasure of choosing the hard thing deliberately. Peterson is working on my mind the way Goggins worked on my body — forcing me to stand straighter on the inside.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-01-24',
  'great',
  'Grateful for twenty-two consecutive cold showers and the first week where six workouts felt like the expected baseline instead of a heroic achievement. Grateful for Proverbs 8 in Bible study — wisdom as a craftsman beside the Creator — I read it three times before moving on. Grateful for a WGU module I finally cracked after two weeks of banging my head against it.',
  'Week four of January and the momentum is real. Peterson''s concept of the dragon you need to face — the voluntary confrontation with the thing you fear most — is something I''ve been applying outside the gym. I finally sent the email I''d been avoiding to my WGU advisor about my course load. I finally had the conversation with my supervisor about career trajectory that I''d been deferring for two months. Both conversations were fine. Both had lived in my head for weeks as monsters. The commute Thursday gave me the chapter on Rule 11 — about letting people struggle because the struggle is how they grow — and I thought about how I''ve been trying to soften my own hard things instead of letting them be hard. Let them be hard. Do it anyway. The Life OS dashboard is starting to look like something I''m proud to look at rather than something I have to look at.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-01-31',
  'great',
  'Grateful for a January that delivered on what I promised myself on December 29th. Grateful for twenty-nine cold showers that have made 4am feel sacred instead of brutal. Grateful for Peterson finishing with Rule 12 — pet a cat when you encounter one on the street — which is about noticing beauty in the specific ordinary moment, something I didn''t know I needed to hear.',
  'Month-end. Twenty-nine cold showers. Twenty-four workouts from twenty-four possible training days in January. Bible study every single morning. WGU caught up and one module ahead of schedule. Life OS data looks nothing like November. I closed the Peterson book on the commute home today and felt the particular kind of tired you feel after being genuinely changed by something. His central argument — that life is suffering and the question is whether you have meaning sufficient to carry it — landed in a way I didn''t expect. Not pessimistic. Clarifying. I know why I''m doing the 4am. I know why I''m getting in the cold water. It''s not to prove something to anyone. It''s to build the kind of person who can carry what''s coming without breaking. February starts tomorrow. Atomic Habits is loaded on the Kindle.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

-- ─────────────────────────────────────────────────────────────
-- FEBRUARY 2026 · Book: Atomic Habits — James Clear
-- Arc: plateau, trusting the process, identity landing
-- ─────────────────────────────────────────────────────────────

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-02-04',
  'okay',
  'Grateful that thirty-four cold showers in a row is a number I own completely and no bad day can take it from me. Grateful for Matthew 6 in Bible study this morning — "give us this day our daily bread" — asking for only what I need for today is the right mindset for a plateau. Grateful that the plateau itself is teaching me something about patience.',
  'Thirty-four days. The cold showers are automatic now in the worst possible sense — automatic, not chosen. I step in without the decision, without the little internal battle, and that should feel like victory but instead it feels like I''ve lost something. Clear opens Atomic Habits with "you don''t rise to the level of your goals, you fall to the level of your systems" and that hit me sideways because my systems are running but the feeling that drove them is quieter now. Plateau. The workouts are happening but I''m not growing in them — same weights, same distances, same routine. I need progressive overload in the gym and in the journal. The WGU content is dense this month and I''m studying on the commute, which means the gym stays protected. The identity concept is the one thing from Atomic Habits I''m chewing on: I am not trying to work out more, I am a person who works out. Does that feel completely true yet? Mostly. Getting closer.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-02-10',
  'good',
  'Grateful for forty consecutive cold showers and the moment this morning when I realized I was thinking about something else during the cold instead of counting seconds for the first time. Grateful for Romans 8 in Bible study — "those who live according to the Spirit have their minds set on what the Spirit desires" — I want my mind set on what matters. Grateful that a coworker noticed my energy this week without me saying a word about any of this.',
  'Forty days of cold showers and I''m noticing the compound effect that Clear describes — not a dramatic change, a quiet accumulation. He uses the metaphor of ice in a room that gets one degree warmer: nothing happens at 31 degrees, nothing at 32, nothing at 33, and then at 34 the ice breaks. I don''t know which degree I''m at. But I added weight to my squat for the first time in six weeks. Something shifted. The commute Tuesday was the best two hours of my week — read the chapter on the four laws of behavior change and immediately saw places in my Life OS design where I''m fighting friction instead of removing it. The habit stack is solid: 4am → Bible study → workout → cold shower → commute with book. Unbroken for nineteen straight days. Clear says what you repeat you become. I am becoming this.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-02-17',
  'okay',
  'Grateful for Bible study this morning in James 1 — "the testing of your faith produces endurance" — which I needed on day forty-seven of cold showers when the plateau is still real and I''m not sure the ceiling has moved. Grateful for the commute forcing me to read instead of scroll. Grateful for honest data in Life OS even when I don''t want to look at it.',
  'Mid-plateau and I''m starting to question all of it. Not in a crisis way — more like the examination that happens when the novelty is gone and you have to decide if the thing is actually worth doing or if you were chasing the feeling of doing it. Atomic Habits calls this the plateau of latent potential: you''re doing the work but the results haven''t shown up yet because they''re compounding below the surface. I''m taking that on faith right now. The habit stack hasn''t broken but it feels mechanical some mornings. The cold showers happen. The workouts happen. The Bible study happens. But the asking — the deliberate engagement with what I''m doing and why — needs work. I added a new prompt to my journal review: "what did I notice today?" Starting to pay attention differently. The WGU cybersecurity module on threat intelligence is actually fascinating and I''m losing commute reading time to it. That''s not a failure. That''s curiosity, which might be the thing I was missing.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-02-23',
  'good',
  'Grateful for fifty-three cold showers and the fact that I am not the same person who stood in front of an accountability mirror in November — the data proves it even when the mirror feels the same. Grateful for Psalm 37 this morning — "commit your way to the LORD; trust in him and he will do this" — trusting the process has a theological dimension I hadn''t fully connected before. Grateful for Life OS showing me my own patterns without flinching.',
  'Fifty-three days. The plateau hasn''t broken yet but I feel something underneath it, the way you feel a wave before it''s visible. Clear''s two-minute rule has been useful this month — when I don''t want to do the thing, I commit to two minutes. Start the workout. Two minutes always becomes the whole workout. Start the Bible study. The two minutes opens into something I can''t predict. The commute today was a full chapter on identity-based habits and I sat there thinking about what the real difference is between "I work out" and "I am someone who works out." The second one doesn''t have an exit ramp. I don''t decide each morning whether to do Bible study any more than I decide whether to brush my teeth. It''s who I am. That''s what Clear is trying to install. I think it''s installing.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-02-28',
  'good',
  'Grateful for fifty-eight cold showers — not the streak itself but the person the streak has been making. Grateful for Atomic Habits being exactly the book I needed at exactly this point in the journey, when discipline was established but meaning was getting thin. Grateful for Life OS giving me a place to be accountable when no one else is watching.',
  'Last day of February and the month''s data is solid: six workouts every week, Bible study every morning, cold shower streak intact at fifty-eight days, WGU on schedule. The feeling of the month was quiet and persistent, which I''m learning to value more than the loud motivated weeks. Clear''s final chapters are about the dark side of habits — when systems become rigid, when you optimize for the metric and lose the goal. I need to watch that in myself. The Life OS building has been on my mind this month. I''m using it more intentionally — not just logging but reviewing patterns, asking what the data means. The app I''m building is the habit that reviews all the other habits. March starts tomorrow and Man''s Search for Meaning is loaded and ready. Something tells me Frankl is going to change the frame on everything.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

-- ─────────────────────────────────────────────────────────────
-- MARCH 2026 · Book: Man's Search for Meaning — Viktor Frankl
-- Arc: breakthrough, identity shift, meaning, peak performance
-- ─────────────────────────────────────────────────────────────

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-03-03',
  'good',
  'Grateful for Frankl''s opening pages on the train this morning — the dehumanization described with such clinical precision that I had to put the book down twice just to breathe. Grateful for Proverbs 19 in Bible study — "plans fail for lack of counsel, but with many advisers they succeed" — grateful I''m building counsel into my life even when it comes from books written decades ago. Grateful for the cold shower today which felt, for the first time in weeks, like a deliberate choice rather than a habit running on autopilot.',
  'Man''s Search for Meaning started today and the first twenty pages are unlike anything I''ve read across this whole six-month run. Frankl is describing the arrival at the concentration camp and the loss of every external identity — name replaced by number, clothes replaced by rags, every possession taken — and he does it without self-pity, which makes it harder to read than self-pity would. I kept thinking about my own attachments while I read it on the commute. The workout this morning was back to intentional — added ten pounds to the deadlift, didn''t back down. Sixty-one cold showers. The habit stack is running clean and something about starting Frankl has made me ask why in a fundamentally different way. Not why do I do the habits but what is the meaning underneath the discipline. That''s a harder question and March is apparently when I''m going to sit with it.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-03-09',
  'great',
  'Grateful for Frankl''s logotherapy concept landing this week like a stone dropped into still water — meaning as the primary human drive, not pleasure, not power. Grateful that 1 Corinthians 9 in Bible study this morning — running the race with purpose, not beating the air — connects directly to what I''m reading. Grateful for six straight workouts this week and a body that feels different than the one that started this in November.',
  'Frankl''s logotherapy: the primary human drive is the search for meaning, and neurosis comes not from trauma but from existential vacuum — a life where you''ve stopped asking what you''re for. I''ve been asking this on every commute this week. Not as a crisis but as an orientation. Why cybersecurity? Because systems that protect information protect people, and protecting people is meaningful work. Why WGU? Because competence is respect I give to the people who depend on me. Why 4am? Why cold showers? Why Life OS? Because I decided to find out who I am when I stop negotiating with comfort. That''s meaning — not a mission statement, an answer. Something is breaking open this week. The workouts feel different. I''m not grinding through them, I''m choosing them. Frankl says the last human freedom is the freedom to choose your response to any circumstance. I choose hard things every morning on purpose.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-03-18',
  'great',
  'Grateful for the sentence I read on the train Wednesday — "everything can be taken from a man but one thing: the last of the human freedoms — to choose one''s attitude in any given set of circumstances" — and grateful that I''ve read enough by now to know Frankl earned every word of that. Grateful for Romans 5 in Bible study — suffering produces perseverance, perseverance character, character hope — a lineage I''m living. Grateful for seventy-six consecutive cold showers.',
  'Peak week. I don''t know how else to say it. Six workouts, each one intentional, each one heavier or faster than the week before. Bible study hitting different because Frankl is making Romans 5 feel three-dimensional — Paul is talking about the same thing Viktor is talking about, just in different centuries and different catastrophes. The suffering produces something. You can''t buy the thing it produces. You can only earn it by going through and not around. The commute this week was four hours of Frankl and I arrived at both locations — work and home — with my head in a fundamentally different state than I left in. The WGU coursework in network forensics is hard and I''m finding that hard interesting in a way I wasn''t three months ago. The meaning reframe is real: I''m not studying to get a grade, I''m studying because understanding how systems get compromised helps me protect systems, and protecting systems is part of what I''m for. Identity shift isn''t too strong a phrase.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-03-24',
  'great',
  'Grateful for eighty-two consecutive cold showers, grateful for six consecutive weeks of six workouts, grateful for a March that has exceeded everything I dared to hope for when I was writing that December 29th entry. Grateful for Proverbs 24 — "for though the righteous fall seven times, they rise again" — which is the whole story of November through March in one verse.',
  'Ran a mid-point analysis in Life OS today. November Sisyphus vs March Sisyphus: average wake time moved from 5:47am to 4:12am. Workout consistency went from 62% to 100% for seven straight weeks. Cold shower streak: eighty-two days. The numbers are telling a story I couldn''t have written in November. Frankl is nearly finished and the concept that''s staying with me is the distinction between fate and attitude — you don''t always choose what happens to you but you always choose who you are in response to it. I''ve been applying this to the commute. Two hours each way Tuesday Wednesday Thursday used to feel like time being taken from me. Now it''s mine — I own those hours, I''ve decided what they''re for. The WGU forensics final is in two weeks and I''m more prepared than I''ve been for any exam in the program. Everything is compounding. Clear was right about the plateau of latent potential. March is where it broke.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-03-30',
  'great',
  'Grateful for a March that I will point to as the month things became real instead of aspirational. Grateful for Frankl finishing with the call to live as though you''re living for the second time — as if the choices you''re making today are the ones you''ll wish you''d made yesterday. Grateful for Bible study this morning in Micah 6 — "act justly, love mercy, walk humbly" — a complete life philosophy in nine words.',
  'Month-end. Frankl finished on the commute home tonight. I''ve read Goggins, Jocko, Peterson, Clear, and Frankl across five months and each one added a layer the others didn''t have. Goggins gave me the body. Jocko gave me the framework. Peterson gave me the confrontation. Clear gave me the systems. Frankl gave me the reason. The reason matters more than any of it — without it the rest is just an impressive performance with no audience. The Life OS data for March is the best month I''ve ever logged. But more than the data: the person writing this entry is not the person who started writing entries in November. He''s less impressed with his ideas and more interested in his actions. He argues with himself less at 4am and gets up more. He goes into the cold water without the internal negotiation. He''s becoming what he wanted to be when he started. April tomorrow. Deep Work is queued up.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

-- ─────────────────────────────────────────────────────────────
-- APRIL 2026 · Book: Deep Work — Cal Newport
-- Arc: maintaining peak, Deep Work philosophy, MCP connected
-- ─────────────────────────────────────────────────────────────

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-04-04',
  'great',
  'Grateful for Newport''s opening argument that deep work is becoming rare at exactly the moment it''s becoming most valuable — and that I''ve been accidentally building the prerequisite for it across five months without knowing it. Grateful for Philippians 4 in Bible study — "whatever is true, whatever is noble, whatever is right... think about such things" — which is Newport''s attention argument made sacred. Grateful for the MCP integration finally connecting to Life OS this week.',
  'Two things happened this week that feel significant. First: started Deep Work and immediately felt like Newport wrote it for the person I''ve been building toward, not the person who started in November. He argues that the ability to focus without distraction on cognitively demanding tasks is the superpower of the knowledge economy and that it''s trainable, not innate. Every cold shower and 4am and commute hour has been training it without my knowing. Second: the MCP server connected to Life OS and I queried my own journal data for the first time through the interface. Saw patterns I couldn''t see in individual entries — the February plateau shows up clearly in the data, flattening of reflection length, mood variance narrowing. Then March breaks clean. Seeing myself from the outside like that — six months of daily data rendered as pattern — was strange and deeply motivating. The discipline created the data. The data shows the discipline. Deep Work is going to show me what to do with it.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-04-12',
  'great',
  'Grateful for Newport''s craftsman approach to work — that you don''t discover your passion, you develop mastery and passion follows — which reframes my cybersecurity career in a way I''ve needed for a while. Grateful for 2 Timothy 2 in Bible study — "a worker who does not need to be ashamed, who correctly handles the word of truth" — skill and integrity as inseparable partners. Grateful for one hundred and one consecutive cold showers.',
  'One hundred and one cold showers. I didn''t notice until I checked the Life OS data today. Newport''s chapter on the craftsman mindset is reshaping how I think about my work as a cybersecurity professional. I''ve been treating the job as something I do competently — responsive, thorough, present. The craftsman framing says: treat it as a skill to be developed with the same deliberateness as the 4am habit or the workout program. What does deep work look like in incident response? What does it look like in the WGU coursework? I''ve been reading and consuming and attending — Newport says that''s shallow work that feels productive. Deep work is the hard cognitive focus that produces actual output. The MCP interface queried my habit data and surfaced a pattern: my best journal entries all followed a workout. Causation or correlation I don''t know. But I''m going to protect the workout for that reason now either way.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-04-22',
  'great',
  'Grateful for Newport''s "schedule every minute of your day" chapter which sounded tyrannical and turned out to be the most liberating thing I''ve read all year. Grateful for Acts 17 in Bible study — the Bereans who examined the Scriptures daily — which is the same discipline Newport is asking for applied to time. Grateful that the WGU cybersecurity capstone is going better than any project I''ve done in the program.',
  'I time-blocked my entire day for the first time this week — every hour accounted for on paper the night before. The 4am hour is Bible study and journaling, non-negotiable. The 5am hour is workout, non-negotiable. The commute is reading or coursework, non-negotiable. The rest gets divided into deep work blocks and shallow work blocks at the office. Three days in and I got more done in the deep blocks than I normally get done in a full day of half-focused work. Newport''s argument is that most knowledge workers never actually focus — they respond, attend, manage. The focused creation happens in concentrated bursts that most people never protect because no one teaches you to protect them. I''m protecting them now. The WGU capstone project on network threat detection is going better than anything I''ve done in the program. Life OS is recording all of this. I can see the arc from November: the person who let the week run him is now the person who schedules the week so the habits can run themselves.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-04-30',
  'great',
  'Grateful for five months of data in Life OS showing me more about myself than five years of pen-and-paper journaling ever did. Grateful for Jeremiah 29 in Bible study — "for I know the plans I have for you... plans to give you hope and a future" — which has meant something different to me every single month since November. Grateful for a body that has not missed a single workout in eight weeks.',
  'End of April. Ran a full five-month review through Life OS with the MCP interface and the numbers are something I couldn''t have invented in November. Cold shower streak: one hundred and nineteen days. Workouts missed in the last eight weeks: zero. Bible study broken: never, not since November 8th when it broke once and I never let it break again. WGU GPA this semester: highest of the program. Newport''s deep work philosophy is fully adopted — I schedule my hours, I protect my focus, I treat distraction as a choice I''m making rather than something that happens to me. The commute hours are the most productive hours of my week: four hours of uninterrupted focus three days a week that I used to waste. I started in November reading Goggins and being humbled by the gap between who I said I was and what the data said I did. The gap has closed. Not because I became someone different — because I stopped lying to myself about who I was and started doing the work to become who I claimed.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

-- ─────────────────────────────────────────────────────────────
-- MAY 2026 · Book: Deep Work — Cal Newport (continuing)
-- Arc: six-month reflection, maintaining peak, accelerating
-- ─────────────────────────────────────────────────────────────

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-05-05',
  'great',
  'Grateful for the specific Tuesday commute this week where I put the book down, looked out the train window at the city waking up, and felt genuinely content — not satisfied, content — for the first time I can consciously remember. Grateful for Psalm 1 in Bible study — the tree planted by streams of water, yielding fruit in season — which is what consistent practice looks like from the outside. Grateful for a Life OS that made the invisible visible.',
  'Newport''s chapter on digital minimalism and the shallow work that poses as real work has me rethinking my entire relationship with my phone during off-hours. I responded to seventy-three Slack messages last Tuesday and produced one piece of original work. Newport would call that a terrible ratio and he''d be right. The cybersecurity profession runs on fast response, I understand that, but the deep security work — the threat hunting, the detection engineering, the architecture review — happens in the blocks I protect and nowhere else. I''m protecting them now consistently. The May data is shaping up to be the best month since March. Six months ago I was writing in this app because I wanted to build accountability infrastructure. The infrastructure is built. The question for the next six months is what I build with it. WGU is accelerating — half a semester ahead and the material is getting genuinely complex, which means I need exactly the deep work capacity I''ve been building. The habits are the prerequisite for the work. I see that now with clarity I didn''t have in November.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;

INSERT INTO journal_entries (user_id, entry_date, mood, gratitude, reflection)
VALUES (
  'e27a8c4c-2864-480e-955c-8b4e0754bfdb',
  '2026-05-14',
  'great',
  'Grateful for six months of showing up to this journal and for the fact that every single entry, even the bad ones in December, was an honest account of a real day. Grateful for Lamentations 3 in Bible study — "his mercies are new every morning" — which is the entire philosophy of the 4am alarm: every day is a new chance to be who I said I was yesterday. Grateful for Newport''s final chapter arguing that a deep life is a good life, which is the thesis of everything I''ve been doing since November 3rd.',
  'Today marks roughly six months since I started using Life OS as an accountability system and I want to write the entry that November-me would be unable to believe but that every entry between then and now makes inevitable. Cold shower streak: one hundred and twenty-eight days. Not one missed workout in ten weeks. Bible study: not one morning without it since November 8th, which was the only break and I never let it break again. WGU cybersecurity program performing the best I ever have academically. The MCP integration is running and my journal data is queryable and I have been changed by looking at my own patterns rendered as data. Newport''s argument at the end of Deep Work is that the deep life isn''t about discipline for its own sake — it''s about being able to be fully present for the things that matter because you''ve spent your shallow hours carefully and your deep hours completely. November-me was scattered, reactive, honest about the gap but not yet willing to close it. May-me closes the gap. Not because May-me is special — because November-me decided to stop negotiating with discomfort, and every entry since has been the record of that decision compounding.'
)
ON CONFLICT (user_id, entry_date) DO UPDATE SET
  mood       = EXCLUDED.mood,
  gratitude  = EXCLUDED.gratitude,
  reflection = EXCLUDED.reflection;
