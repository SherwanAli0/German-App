---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: []
workflowType: 'prd'
classification:
  projectType: web_app
  domain: edtech
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document — German-App

**Author:** Shero
**Date:** 2026-04-06

---

## Executive Summary

German-App is a personalized, AI-powered German language learning web application built exclusively for Chrome. It targets adult learners living in Germany who have functional comprehension of German (A2–B1) but cannot confidently produce spoken language in real situations. The core problem is not a lack of exposure — users hear German daily — but the absence of a safe, corrective, engaging environment in which to *produce* German out loud. The app functions as an always-available AI language partner that speaks back, corrects in real time, and adapts its personality, humor, topics, and difficulty through onboarding-based personalization.

Built for a single primary user (Shero, a Computer Engineering student at B1 level interning in Germany), the goal is B2 conversational fluency. All content — vocabulary, grammar, conversation topics, reading articles, pronunciation drills — is grounded in real-life German contexts (workplace, daily errands, social situations, tech, food, travel, culture).

Every major language app (Duolingo, Babbel, Busuu) teaches German *at* the user via structured lessons and passive repetition. German-App teaches German *with* the user through active two-way voice conversation, live grammar correction with explanations, and a gamified loop that exploits competitive instincts rather than fighting distraction tendencies. The core differentiator is **radical personalization from session zero**: a pre-session interview shapes the AI's tone, topics, difficulty curve, joke style, and challenge type across all sessions — applied at the conversation-loop level, not just topic selection. The second differentiator is **voice-first correction**: spoken German is transcribed, grammar errors are identified with plain-language explanations, and the conversation continues only after the user repeats the correction. This replaces the social anxiety of speaking with strangers with a low-stakes daily practice loop.

## Project Classification

- **Project Type:** Web Application (Chrome SPA, local only, no app store)
- **Domain:** EdTech — Consumer Language Learning, AI-Powered
- **Complexity:** Medium (AI API integration, Web Speech API, real-time voice, gamification engine, personalization layer)
- **Project Context:** Greenfield — no existing codebase

---

## Success Criteria

### User Success

- **Conversational fluency:** User sustains a natural German conversation at the internship without freezing or defaulting to English. Target: 5+ minutes unscripted.
- **Humor comprehension:** User understands and responds to German jokes and cultural humor in real time — a B2-level social fluency marker.
- **Grammar correction rate:** Fewer than 2 word-order/grammar corrections per conversation session (down from current near-every-sentence state).
- **Vocabulary activation:** User produces newly learned vocabulary in spontaneous speech within 3–5 days of first exposure.
- **Pronunciation accuracy:** User passes read-aloud pronunciation check on common phonemes (ü, ö, ä, ch, r) without retry.

### Engagement Success

- **Daily streak:** 30+ consecutive days of use — confirms habit formation.
- **Session depth:** Average session exceeds 20 minutes — app earns sustained attention.
- **Level progression:** Visible B1 → B1+ → B2 advancement over 3–6 months of consistent use.
- **Streak retention:** User does not break a 7-day streak after first establishing it.
- **Re-engagement:** User returns to complete an unfinished challenge within 24 hours.

### Technical Success

- **Voice transcription accuracy:** Web Speech API correctly transcribes German input ≥85% of the time.
- **AI response latency:** Claude API response delivered and spoken within 3 seconds of user finishing a sentence.
- **Pronunciation detection reliability:** Read-aloud correction flags genuine mispronunciations without over-triggering on accent variation.
- **Graceful degradation:** App communicates clearly when voice/AI features are unavailable — no silent failures.
- **Chrome compatibility:** Full feature set functional on Chrome desktop without extensions or special configuration.

### Measurable Outcomes

| Metric | Target |
|---|---|
| Grammar corrections per session | < 2 by month 2 |
| Daily streak | 30+ days unbroken |
| Average session length | 20+ minutes |
| Vocabulary retention (7-day recall) | ≥ 70% of daily words |
| Conversation length without freeze | 5+ minutes by month 3 |
| Claude API cost (30 days daily use) | < €5 total |

---

## Product Scope

### MVP — All Features Ship Together

No phasing. Shero is the only user; a partial app has no value. All capabilities below are required on day one.

| Capability | Justification |
|---|---|
| Personalization onboarding | Without it, the AI is generic — the core differentiator is gone |
| Two-way voice conversation with inline correction | The primary reason the app exists |
| Daily vocabulary (10 words, context sentences, games) | Daily habit anchor |
| Grammar curriculum (A1–B2+, all topics, exercises) | Grammar quick-reference and word-order training |
| Sentence Builder game | Targets Shero's specific word-order weakness |
| Reading articles with comprehension questions | Bridges passive comprehension to active production |
| Read-aloud + pronunciation retry loop | Active drilling; no other tool does this |
| Gamification (streaks, XP, levels, badges, challenges) | Primary retention mechanism |
| Wholesome humor layer in AI | Core personality; without it the app is just another tool |
| Emergency quick-session mode | Streak preservation under time pressure |
| Browser push notifications | Streak reminders and re-engagement |
| Data export / backup | Protects against localStorage loss |
| Local Node.js proxy | API key security; non-negotiable |

**Solo developer (Shero).** Build in vertical slices — one full feature working end-to-end before starting the next.

### Phase 2 — Growth (Post-30 days)

- Multiplayer / invite-a-friend challenge mode
- Leaderboard against other users
- Custom topic packs (user-requested vocabulary domains)
- Shareable progress stats card
- Spaced repetition algorithm upgrade
- Correction style preference (strict vs natural)

### Phase 3 — Vision

- B2 exam preparation mode with mock tests
- Real German media integration (news clips, YouTube subtitles)
- Voice persona options (different AI characters)
- Community challenges and seasonal events

---

## User Journeys

### Journey 1: First Contact — Onboarding

**Opening Scene:** Shero arrives home after a day at the internship. A German colleague made a joke at lunch; everyone laughed except him. He opens the app for the first time.

**Rising Action:** The app doesn't open a lesson. An AI character says: *"Before we start, I want to get to know you."* A conversational interview follows: humor style, topic interests, study schedule, biggest German embarrassment. The app reflects back: *"Got it — you're competitive, you like wholesome humor, you work in tech, and your biggest enemy is German word order. Let's fix that."*

**Climax:** A personalized home screen appears. His name and B1 level are displayed. His first daily challenge is waiting. The AI's first lesson already sounds like it knows him — it makes a joke about engineers and coffee.

**Resolution:** Shero completes onboarding and his first vocabulary set. He closes the app 35 minutes later. Streak: Day 1.

*Capabilities: Onboarding interview, user profile persistence, personalized AI persona, dynamic home screen, streak initialization, vocabulary module.*

---

### Journey 2: The Daily Loop — Typical Evening Session

**Opening Scene:** Day 11 streak. Home screen banner: *"You left a challenge unfinished yesterday. Want to finish it?"*

**Rising Action:** He finishes the sentence-builder challenge — correct on the second try. Today's 10 words appear in workplace context sentences. Flashcard game, then fill-in-the-blank. One word stumps him twice; flagged for extra repetition tomorrow.

**Climax:** He opens "Talk to Max." Max proposes: *"Erzähl mir von deinem Tag."* Shero speaks. Word order is off. Max: *"Fast! Das Verb kommt immer an zweiter Stelle. Versuch es nochmal."* Shero repeats correctly. They continue 12 minutes.

**Resolution:** Session ends. XP added. Level bar advances. Badge: "First 10-minute conversation." Summary: 2 corrections this session vs. 6 last week.

*Capabilities: Streak display, unfinished challenge hook, vocabulary games, AI conversation with inline correction, session summary, XP/badges.*

---

### Journey 3: Pronunciation Drill — Read Aloud Mode

**Opening Scene:** Shero finishes reading a German work-culture article silently, then clicks *"Read it aloud."*

**Rising Action:** He reads out loud. On *"Berufserfahrung"* the app highlights the word in red and plays correct pronunciation. Two more attempts. Third — passes. Green highlight.

**Climax:** He nails *"Verantwortung"* — a word that has always tripped him up. *"Endlich! That one's been getting you for a week."* He laughs.

**Resolution:** Read-aloud complete. Report: 4 words flagged, 2 needed multiple attempts, score 87%. Hard words queued for tomorrow.

*Capabilities: Article reader, read-aloud mode, real-time mispronunciation detection, phoneme drill with retry loop, pronunciation progress tracking.*

---

### Journey 4: Grammar Emergency — Quick Reference Mid-Day

**Opening Scene:** 10:30am at the internship. Shero needs to write a German email and can't remember if *"weil"* sends the verb to the end.

**Rising Action:** He opens the app, searches "weil subordinate clause." Topic card: explanation, two examples, one exercise. Done in 45 seconds.

**Climax:** Email written correctly: *"Ich schreibe Ihnen, weil ich eine Frage habe."*

**Resolution:** App logs the grammar visit. In the next conversation session, Max uses *"weil"* naturally — reinforcing the lookup.

*Capabilities: Grammar curriculum with search, topic cards, cross-feature AI reinforcement.*

---

### Journey 5: Streak Crisis — Don't Break the Chain

**Opening Scene:** 23:45. Day 19 streak. Shero forgot to open the app. Browser notification: *"Tag 19 — noch 15 Minuten!"*

**Rising Action:** Emergency mode: *"Quick 5-minute session to keep your streak alive."* Rapid-fire vocabulary — 10 words, multiple choice, no voice.

**Climax:** Done in 4 minutes. Streak saved: Day 20.

**Resolution:** *"Streak gerettet! Du bist unaufhaltbar."* Celebration animation.

*Capabilities: Push notifications, streak countdown, emergency quick-session, streak preservation.*

---

### Journey Requirements Summary

| Journey | Key Capabilities |
|---|---|
| Onboarding | Interview flow, profile persistence, AI persona config, streak init |
| Daily Loop | Dashboard, challenge hook, vocabulary games, voice conversation, session summary, XP/badges |
| Pronunciation Drill | Article reader, read-aloud, phoneme detection, retry loop, progress report |
| Grammar Emergency | Curriculum search, topic cards, cross-feature AI reinforcement |
| Streak Crisis | Push notifications, countdown, emergency quick-session |

---

## Domain-Specific Requirements

### Compliance & Regulatory

- **GDPR (Germany/EU):** Conversations and user profile data are personal data. No unnecessary retention. Conversations stay in localStorage; only the current turn is sent to Claude API per call — no conversation history accumulated server-side.
- **Claude API Terms of Use:** Raw conversation transcripts are not logged beyond localStorage on the user's machine. API responses are not stored to train competing models.
- **Web Speech API:** Chrome sends audio to Google servers for transcription. Accepted tradeoff for MVP; user is aware.

### Architecture & Cost Constraints

- **Hosting:** Local only. No cloud hosting, no deployment costs.
- **Data persistence:** All user data in browser localStorage. No server database.
- **API key security:** Claude API key held in a local Node.js proxy (`localhost:PORT`). Frontend calls proxy; proxy calls Anthropic. Key never in frontend JS, never leaves the local machine, never committed to git.
- **API call minimization:**
  - Claude is called **only** for live conversation turns, inline grammar correction, and onboarding profile generation.
  - Vocabulary batches, grammar content, and reading articles are **generated once and cached** — zero API calls for static content after initial generation.
  - System prompts kept under 300 tokens. User profile is summarized, not dumped verbatim.
  - Max tokens per conversation turn is hard-capped.

### Integrations

| Integration | Purpose | Cost |
|---|---|---|
| Claude API (Anthropic) | Conversation, grammar correction, onboarding | Pay-per-token (minimized via caching) |
| Web Speech API | Voice input transcription | Free (Chrome built-in) |
| Web Speech Synthesis API | AI voice output in German | Free (Chrome built-in) |
| Browser Notifications API | Streak alerts, re-engagement | Free |
| Local Node.js proxy | API key protection | Free (local machine) |

### Risk Mitigations

| Risk | Mitigation |
|---|---|
| Web Speech transcription quality degrades with accent | Show transcription for user confirmation before processing; fallback to text input |
| Claude API latency breaks conversation flow | Stream responses; show typing indicator; cap tokens per turn |
| localStorage cleared accidentally | Export/backup button generates downloadable JSON snapshot |
| API costs spiral | Cache all non-conversational content; hard cap on daily conversation turns if needed |
| Local proxy not running | Ping `localhost:3001/health` on load; show setup banner if unavailable |

---

## Innovation & Novel Patterns

### Innovation Areas

**1. Onboarding-Driven AI Persona Customization**
No existing consumer language app customizes the AI's personality, humor style, and topic focus at the conversation level based on a pre-session interview. German-App generates a persistent profile that shapes every Claude prompt — tone, subject matter, correction style, joke type — across all sessions.

**2. Conversation-Loop Grammar Correction with Explanation**
Standard pattern: complete exercise → see score → move on. German-App's pattern: AI hears a grammar error mid-conversation, identifies the broken rule, explains it in plain language, and waits for the user to repeat the correction correctly before continuing. This mirrors skilled human tutoring.

**3. Read-Aloud Pronunciation Retry Loop**
Read-aloud features exist elsewhere (Google Translate, Duolingo stories). The retry loop does not: the app refuses to advance past a mispronounced word until the user gets it right, with phoneme-level breakdown between attempts. Transforms passive feedback into active drilling.

**4. Cost-Optimized Local-First AI Architecture**
LLM called only for conversations and corrections. All other content (vocabulary, grammar, articles) generated once, cached in localStorage, and served locally indefinitely — making a personal AI language app financially sustainable at near-zero ongoing cost.

### Competitive Landscape

| Competitor | Gap |
|---|---|
| Duolingo / Babbel / Busuu | Gamified but passive; no free-speech conversation; no personality customization |
| iTalki / Preply | Human tutors; expensive (€15–50/hr); requires scheduling; unavailable at 11pm |
| ChatGPT / Claude.ai | Capable conversation but no gamification, no curriculum, no pronunciation mode, no persistence |
| **German-App** | AI conversation + structured curriculum + gamification + persona personalization + local-first cost model |

### Validation Targets

| Innovation | Validation Signal |
|---|---|
| Onboarding persona | After session 1, Shero feels the AI "sounds like it knows him" |
| Inline grammar correction | Correction rate decreases measurably session over session |
| Pronunciation retry loop | Flagged words pass after 1–3 retries within the same session |
| Cost-optimized architecture | Total Claude API cost < €5 after 30 days of daily use |

### Innovation Risks

| Risk | Mitigation |
|---|---|
| Onboarding profile becomes stale | User can re-run onboarding or edit individual fields at any time |
| Inline correction breaks flow | Correction style tunable (strict vs natural); corrections can be deferred to session summary |
| Pronunciation retry loop frustrates on hard words | 3-retry maximum; word logged for next session's drill |
| Cached content becomes repetitive | Content versioned by week; rolling batch generation |

---

## Web App Technical Requirements

### Architecture

- **SPA:** Single HTML entry point, client-side routing between sections (Home, Conversation, Vocabulary, Grammar, Reading, Progress). Session state managed in-memory; persisted to localStorage at key checkpoints.
- **Local serving:** Frontend on `http://localhost` (required for Web Speech API microphone access).
- **Proxy:** Node.js proxy on separate port (e.g., `localhost:3001`). Claude API key in `.env`, gitignored.
- **Build complexity:** Minimal for MVP — vanilla JS or lightweight framework, debuggable in Chrome DevTools.

### Browser Support

| Browser | Support |
|---|---|
| Chrome desktop (latest) | Full — primary target |
| Chrome mobile | Not required for MVP |
| Firefox / Safari / Edge | Not supported |

**Layout:** Desktop-only (1280px+ viewport). No mobile responsiveness for MVP.

### Implementation Notes

- **Microphone permission:** Requested on first launch. Denial degrades all voice features to text-input mode with a visible notice.
- **localStorage schema:** Versioned. Covers user profile, streak, XP, vocabulary cache, grammar cache, article cache, session history. Includes migration path for schema changes.
- **Proxy health check:** On app load, ping `localhost:3001/health`. No response within 1s → banner: *"Local proxy not running. Start with `node proxy.js`."*
- **Cache invalidation:** Vocabulary batches tagged by week; grammar by version hash; articles by generation date. Stale content refreshed silently in background.

---

## Functional Requirements

### User Onboarding & Profile Management

- **FR1:** User can complete a conversational onboarding interview capturing personality type, humor style, learning goals, topic interests, and daily schedule
- **FR2:** User can view a generated profile summary reflecting onboarding answers before the app begins
- **FR3:** User can re-run the onboarding interview at any time to update their profile
- **FR4:** User can edit individual profile fields without re-running the full onboarding flow
- **FR5:** System persists the user profile across all sessions and uses it to personalize AI tone, topics, correction style, and humor

### AI Conversation Practice

- **FR6:** User can initiate a two-way spoken conversation with an AI character in German
- **FR7:** System transcribes user's spoken German and displays the transcription for confirmation before processing
- **FR8:** System detects grammar errors in spoken input and interrupts the conversation to correct them inline
- **FR9:** System explains the grammar rule behind each correction in plain language before resuming the conversation
- **FR10:** User can repeat a corrected sentence and receive confirmation that it is now grammatically correct
- **FR11:** System responds in spoken German, continuing the conversation naturally after corrections
- **FR12:** System proposes conversation topics based on the user's profile (work, tech, daily life, food, travel, relationships, culture)
- **FR13:** User can request a new conversation topic at any time during a session
- **FR14:** System tracks grammar corrections per session and displays a running correction count
- **FR15:** User can end a conversation session and receive a summary of errors made and corrections accepted
- **FR51:** The AI conversation character incorporates humor, personality, and jokes into responses based on the humor style from onboarding — at least one contextually appropriate humor element (joke, wordplay, or cultural reference) must appear per 5 conversation turns

### Vocabulary Learning

- **FR16:** System presents 10 new German vocabulary words each day, each in a full context sentence
- **FR17:** User can practice daily vocabulary through a flashcard game (German → English, English → German)
- **FR18:** User can practice daily vocabulary through fill-in-the-blank sentence exercises
- **FR19:** User can practice daily vocabulary through a word-matching game
- **FR20:** System tracks struggled vocabulary words and surfaces them for additional repetition
- **FR21:** System refreshes the daily vocabulary set on a rolling weekly schedule, avoiding repetition within the same week

### Grammar Learning

- **FR22:** User can browse all grammar topics organized by proficiency level (A1, A2, B1, B2)
- **FR23:** User can search grammar topics by keyword or concept
- **FR24:** User can open a grammar topic card containing a plain-language explanation, example sentences, and an interactive exercise
- **FR25:** User can complete a grammar exercise and receive immediate correct/incorrect feedback
- **FR26:** System records visited grammar topics and surfaces them in conversation practice for reinforcement

### Sentence Building

- **FR27:** User can play a Sentence Builder game where shuffled German words must be arranged in the correct grammatical order
- **FR28:** System provides a hint in Sentence Builder after 3 failed attempts
- **FR29:** System explains the correct word order after each Sentence Builder round, referencing the specific grammar rule applied

### Reading & Pronunciation

- **FR30:** User can read German articles on real-life topics (work, food, tech, travel, relationships, culture, daily life) at varied difficulty levels
- **FR31:** User can answer comprehension questions after reading an article
- **FR32:** User can activate read-aloud mode on any article and read the text out loud
- **FR33:** System detects mispronounced words during read-aloud and highlights them in real time
- **FR34:** System plays the correct pronunciation of a flagged word and prompts the user to repeat it
- **FR35:** User must correctly pronounce a flagged word (or exhaust the retry limit) before advancing past it
- **FR36:** System generates a pronunciation report at the end of each read-aloud session showing words flagged, retries needed, and overall score

### Gamification & Progress Tracking

- **FR37:** System maintains a daily streak counter incrementing on any completed learning activity
- **FR38:** System awards XP for completed activities (conversation turns, vocabulary sessions, grammar exercises, read-aloud sessions)
- **FR39:** User can view a proficiency level indicator (A1 → A2 → B1 → B1+ → B2) advancing based on XP
- **FR40:** System awards achievement badges for defined milestones (first conversation, 7-day streak, 30-day streak, first article, etc.)
- **FR41:** System presents a daily challenge completable for bonus XP
- **FR42:** System presents a weekly challenge requiring sustained effort across multiple days
- **FR43:** System displays an end-of-session summary: XP earned, badges unlocked, streak status, corrections made
- **FR44:** User can view a progress dashboard showing streak history, XP over time, level progression, and vocabulary/grammar coverage
- **FR45:** System sends a browser notification when streak is at risk (within 15 minutes of midnight with no activity)
- **FR46:** System offers an emergency quick-session mode (≤5 minutes, no voice required) to preserve a streak at risk

### Content Caching & Data Management

- **FR47:** System generates vocabulary batches, grammar content, and reading articles in bulk and caches locally — not on demand per session
- **FR48:** System detects stale cached content and refreshes it in the background without interrupting the user
- **FR49:** User can export all personal data (profile, progress, streak, XP, vocabulary history) as a downloadable backup file
- **FR50:** System detects when the local API proxy is unavailable and displays clear setup instructions

---

## Non-Functional Requirements

### Performance

- **NFR1:** AI conversation response (end of user speech → first spoken AI word) completes within 3 seconds for the 95th percentile of turns, as measured in Chrome DevTools Network tab during a live session
- **NFR2:** Vocabulary, grammar, and article content served from cache loads and renders within 500ms
- **NFR3:** Sentence Builder responds to user interactions within 100ms
- **NFR4:** Gamification animations (XP gain, badge unlock, level up) run at 60fps
- **NFR5:** App initial load on localhost completes within 2 seconds to interactive home screen
- **NFR6:** Web Speech API transcription begins processing within 500ms of user stopping speech

### Security

- **NFR7:** Claude API key never appears in frontend JavaScript, HTML, or any Chrome DevTools-visible network request — held exclusively by the local Node.js proxy
- **NFR8:** Local proxy accepts requests only from `localhost` — all external origins rejected
- **NFR9:** `.env` containing the API key is gitignored and never committed to the repository
- **NFR10:** Conversation transcripts and user profile data are not transmitted to any server other than the local proxy and Anthropic API — no third-party analytics or tracking
- **NFR11:** Each Claude API call sends only the current conversation turn and a condensed system prompt — no full history or raw profile data beyond what the single response requires

### Integration Reliability

- **NFR12:** Web Speech API initialization failure degrades to text input mode within 2 seconds with a visible banner message that identifies the failure and states the fallback action — no silent failures
- **NFR13:** Local proxy error or timeout produces an on-screen error message within 3 seconds that identifies the problem and offers a retry button — conversation sessions do not silently hang
- **NFR14:** Web Speech Synthesis failure falls back to displaying the AI response as text — voice output failure does not block the conversation
- **NFR15:** Claude API rate limit responses (HTTP 429) are handled gracefully — brief wait message displayed, auto-retry after specified delay, no crash
- **NFR16:** Browser notification permission denial does not affect any core learning functionality
