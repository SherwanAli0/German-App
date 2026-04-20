---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
workflowType: 'architecture'
project_name: 'German-App'
user_name: 'Shero'
date: '2026-04-06'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
51 FRs across 8 capability areas: Onboarding & Profile (5), AI Conversation (11), Vocabulary Learning (6), Grammar Learning (5), Sentence Building (3), Reading & Pronunciation (7), Gamification & Progress Tracking (10), Content Caching & Data Management (4). All ship in MVP — no phasing; single user.

**Non-Functional Requirements:**
16 NFRs across three clusters:
- Performance: 3s AI response ceiling (P95), 500ms cache renders, 100ms game interactions, 60fps animations, 2s app load, 500ms transcription start
- Security: API key never in frontend, proxy accepts localhost only, no third-party analytics, per-turn minimal context sent to Claude
- Integration Reliability: Explicit graceful degradation required for Web Speech failure, proxy unavailability, synthesis failure, and Claude 429s

**Scale & Complexity:**

- Primary domain: Chrome SPA + local Node.js proxy
- Complexity level: Medium
- Single user (Shero), local-only, no multi-tenancy, no cloud infrastructure
- Estimated architectural components: ~8 discrete subsystems

### Technical Constraints & Dependencies

| Constraint | Implication |
|---|---|
| Chrome desktop only | Web Speech API and Synthesis API are first-class; no polyfills needed |
| Local-only hosting | Frontend on localhost (required for mic access); proxy on separate port |
| localStorage only | All persistence is client-side; schema versioning required from day 1 |
| Claude API key in proxy | Two-process architecture mandatory: SPA + Node.js proxy |
| Cost ceiling ~€5/30 days | Claude called only for conversation turns, correction, onboarding profile |
| No external DB | All content (vocab, grammar, articles) pre-generated and cached locally |

### Cross-Cutting Concerns Identified

- **API cost governance:** Determines what is dynamically AI-generated vs. bulk-generated-and-cached
- **localStorage schema & versioning:** Shared data layer for all modules; migration strategy required
- **Personalization context:** Onboarding profile must be accessible across all features without repeated reads
- **Voice pipeline reliability:** Microphone → transcription → AI → synthesis chain with fallbacks at each stage
- **Gamification state consistency:** XP, streak, and badge events emitted by all learning modules; centralized engine required
- **Graceful degradation strategy:** Explicit fallback behavior required for voice, proxy, synthesis, and API rate limits

---

## Starter Template Evaluation

### Primary Technology Domain

Chrome SPA (local-only) + local Node.js proxy — based on PRD constraints.
No cloud deployment. No SSR. No mobile. Desktop Chrome only.

### Technical Preferences

| Concern | Decision | Rationale |
|---|---|---|
| Language | JavaScript (no TypeScript) | Faster iteration for solo MVP dev |
| Framework | React 18 + Vite 8 | Component model suits modular feature set; Chrome DevTools excellent |
| Styling | Tailwind CSS v4 | Utility-first; zero config with Vite plugin; fast builds |
| Node.js proxy | Plain Node.js / Express | Simple, lightweight; no framework overhead for a local proxy |

### Starter Options Considered

- **Vite + React (JS template):** Official, maintained, minimal — exactly what's needed
- **create-react-app:** Deprecated — ruled out
- **Next.js:** Overkill — no SSR needed, local-only
- **SvelteKit / Vue:** Valid but React gives better Chrome DevTools experience for voice/audio debugging

### Selected Starter: Vite + React (JavaScript)

**Rationale:** Vite 8 + React is the leanest path to a modern SPA. No TypeScript overhead for a solo project. React's component model maps cleanly to German-App's modular feature areas (Conversation, Vocabulary, Grammar, Reading, Gamification). Tailwind v4 integrates as a Vite plugin — zero PostCSS config required.

**Initialization Commands:**

```bash
# Step 1: Scaffold the SPA
npm create vite@latest german-app -- --template react
cd german-app
npm install

# Step 2: Add Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite
```

**`vite.config.js` after Tailwind integration:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**`src/index.css`:**
```css
@import "tailwindcss";
```

**Step 3: Local Node.js proxy (separate `proxy/` subfolder)**
```bash
mkdir proxy && cd proxy
npm init -y
npm install express dotenv cors
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
Plain JavaScript (ES modules). React 18 with JSX. Node.js 20.19+ required.

**Styling Solution:**
Tailwind CSS v4 via `@tailwindcss/vite` plugin. Single `@import "tailwindcss"` in index.css. No tailwind.config.js required (v4 is zero-config).

**Build Tooling:**
Vite 8.0.4 — native ESM dev server, HMR, optimized production builds. `npm run dev` for development on localhost.

**Testing Framework:**
Not included in base template — addressed in architectural decisions.

**Code Organization:**
Standard Vite React structure: `src/`, `public/`, `src/components/`, `src/assets/`. Feature-based sub-folders to be established in architecture step.

**Development Experience:**
Hot Module Replacement (HMR), React DevTools in Chrome, Vite dev server on localhost (required for Web Speech API microphone access).

**Current Versions:**
- Vite: 8.0.4
- React: 18 (via @vitejs/plugin-react v6)
- Tailwind CSS: 4.2.0
- Node.js requirement: 20.19+

**Note:** Project initialization using these commands should be the first implementation story.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State management library — Zustand 5.0.12
- Client-side routing — React Router v7.14.0
- Claude API response strategy — Streaming (SSE)
- Dev process management — concurrently 9.2.1
- localStorage schema versioning strategy

**Important Decisions (Shape Architecture):**
- Feature-based folder structure
- Proxy REST API surface
- Zustand store topology (which stores exist)

**Deferred Decisions (Post-MVP):**
- Testing framework (Vitest likely; deferred until first feature ships)
- Error monitoring / logging tooling
- Spaced repetition algorithm upgrade (Phase 2)

---

### Data Architecture

**Persistence Layer: localStorage only**
All user data lives in the browser. No external database. Schema is versioned from day one to enable safe migrations.

**localStorage Schema Strategy:**
- Top-level key: `german_app_v1` (bump version on breaking changes)
- Sub-keys: `profile`, `gamification`, `vocabulary_cache`, `grammar_cache`, `article_cache`, `session_history`, `settings`
- On app load: read schema version, run migration if version mismatch, write new version
- Content caches (vocab, grammar, articles) tagged with `week_key` or `version_hash`; stale detection runs silently in background

**Zustand + localStorage Integration:**
Zustand's built-in `persist` middleware serializes store state to localStorage automatically. Each store maps to one top-level key.

**Zustand Store Topology:**

| Store | Persisted | Contents |
|---|---|---|
| `useProfileStore` | Yes | Onboarding answers, AI persona config |
| `useGamificationStore` | Yes | XP, streak, badges, level |
| `useVoiceStore` | No (session) | Mic status, transcription, synthesis state |
| `useSessionStore` | No (session) | Current conversation turns, correction count |
| `useCacheStore` | Yes | Vocab/grammar/article cache with version tags |
| `useUIStore` | No | Active route, modals, banners |

**Install:**
```bash
npm install zustand
```

---

### Authentication & Security

**Auth:** None — single user, local-only, no login required.

**API Key Security:**
- Claude API key stored in `proxy/.env`, gitignored
- Proxy reads key via `dotenv` at startup; never passed to frontend
- CORS on proxy restricted to `http://localhost:5173` (Vite dev port) only
- All non-localhost origins rejected with 403

**Proxy Security Middleware:**
```javascript
// proxy/index.js
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '10kb' })) // prevent oversized payloads
```

---

### API & Communication Patterns

**Proxy REST Surface (minimal):**

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Checked on app load (NFR13) |
| `/api/chat` | POST | Streaming conversation turn → Claude |
| `/api/generate` | POST | Bulk content generation (vocab/grammar/articles) |

**Streaming Implementation:**
- Proxy pipes Claude's SSE stream directly to frontend response
- Frontend uses `fetch()` with `response.body.getReader()` (ReadableStream)
- First token triggers Web Speech Synthesis — perceived latency < 1s
- Proxy sets `Content-Type: text/event-stream`, `Cache-Control: no-cache`

**Error Handling Standard:**
All proxy errors return structured JSON: `{ error: true, code: string, message: string }`
- `PROXY_UNAVAILABLE` → frontend shows setup banner
- `CLAUDE_RATE_LIMITED` → frontend shows retry message, auto-retries after delay
- `STREAM_INTERRUPTED` → frontend surfaces error, offers retry button

---

### Frontend Architecture

**Client-Side Routing: React Router v7**
6 top-level routes, no nested dynamic segments.

```javascript
// Route map
/              → Home / Dashboard
/onboarding    → Onboarding interview
/conversation  → AI conversation practice
/vocabulary    → Daily vocabulary + games
/grammar       → Grammar curriculum + search
/reading       → Articles + read-aloud
/progress      → Progress dashboard
```

**Feature-Based Folder Structure:**
```
src/
  features/
    onboarding/       # Interview flow, profile generation
    conversation/     # Voice pipeline, AI chat, correction UI
    vocabulary/       # Flashcards, fill-in-blank, matching game
    grammar/          # Topic cards, search, exercises
    reading/          # Article reader, read-aloud, pronunciation
    gamification/     # XP, streak, badges, challenges, session summary
  components/         # Shared UI components (Button, Card, Banner, etc.)
  stores/             # Zustand stores (one file per store)
  services/           # API client, voice service, cache service
  hooks/              # Shared React hooks
  assets/
  main.jsx
  App.jsx
```

**Install:**
```bash
npm install react-router zustand
```

---

### Infrastructure & Deployment

**Local Development: concurrently**
Single `npm run dev` starts both Vite SPA and Node proxy.

```json
// package.json (root)
"scripts": {
  "dev": "concurrently \"npm run dev:app\" \"npm run dev:proxy\"",
  "dev:app": "vite",
  "dev:proxy": "node proxy/index.js"
}
```

**No production build/deployment needed** — local-only by design.

**Port conventions:**
- Vite SPA: `http://localhost:5173`
- Node proxy: `http://localhost:3001`
- Proxy health: `http://localhost:3001/health`

**Install:**
```bash
npm install -D concurrently
```

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Scaffold Vite + React + Tailwind (starter template)
2. Set up proxy with health endpoint
3. Wire concurrently dev script
4. Establish folder structure + router
5. Create Zustand stores with persist middleware + localStorage schema
6. Implement proxy /api/chat with streaming
7. Build features in vertical slices (Onboarding → Conversation → Vocabulary → ...)

**Cross-Component Dependencies:**
- All features read from `useProfileStore` (personalization context)
- All features write to `useGamificationStore` (XP/streak events)
- Conversation and Reading features share `useVoiceStore`
- `useCacheStore` feeds Vocabulary, Grammar, and Reading features

---

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified
6 areas where AI agents could make different choices without explicit rules:
file naming, component structure, Zustand patterns, API communication,
error/loading states, and localStorage key conventions.

---

### Naming Patterns

**File & Directory Naming:**
- React components: PascalCase — `ConversationPanel.jsx`, `VoiceButton.jsx`
- Non-component files: camelCase — `voiceService.js`, `profileStore.js`
- Feature directories: camelCase — `conversation/`, `vocabulary/`
- Test files: co-located, `.test.jsx` suffix — `VoiceButton.test.jsx`
- Constants files: camelCase — `grammarTopics.js`, `badgeDefinitions.js`

**Component & Function Naming:**
- React components: PascalCase — `SessionSummary`, `StreakBadge`
- Event handlers: `handle` prefix — `handleSpeechEnd`, `handleCorrectionAccept`
- Boolean props/state: `is`/`has` prefix — `isListening`, `hasStreak`, `isLoading`
- Async functions: verb + noun — `fetchConversationTurn`, `generateVocabBatch`
- Zustand stores: `use` + PascalCase + `Store` — `useProfileStore`, `useGamificationStore`
- Zustand actions: verb + noun — `setProfile`, `addXP`, `resetSession`, `incrementStreak`

**localStorage Keys:**
- Top-level namespace: `german_app_v1`
- All keys snake_case: `german_app_v1.profile`, `german_app_v1.gamification`,
  `german_app_v1.vocabulary_cache`, `german_app_v1.grammar_cache`,
  `german_app_v1.article_cache`, `german_app_v1.session_history`

**API & Proxy Naming:**
- Endpoints: lowercase with hyphens — `/api/chat`, `/api/generate`, `/health`
- Request/response JSON fields: camelCase — `systemPrompt`, `maxTokens`, `errorCode`

---

### Structure Patterns

**Component File Structure (each feature component):**
```
features/conversation/
  ConversationPanel.jsx      # Main feature component
  VoiceButton.jsx            # Sub-component
  CorrectionOverlay.jsx      # Sub-component
  useConversation.js         # Feature-specific hook
  conversationHelpers.js     # Pure utility functions
  ConversationPanel.test.jsx # Co-located test
```

**Shared vs. Feature-Local:**
- If a component is used in 2+ features → move to `src/components/`
- If a hook is used in 2+ features → move to `src/hooks/`
- If a utility is used in 2+ features → move to `src/services/` or `src/utils/`
- Feature-internal helpers stay in the feature folder

**Services (`src/services/`):**
- `apiClient.js` — all fetch calls to the proxy
- `voiceService.js` — Web Speech API + Web Speech Synthesis abstraction
- `cacheService.js` — localStorage read/write + staleness checks
- `gamificationService.js` — XP calculation, badge evaluation logic

---

### Format Patterns

**Proxy API Response Format:**
All proxy responses use this envelope:
```javascript
// Success
{ data: { ...payload }, error: false }

// Error
{ error: true, code: 'CLAUDE_RATE_LIMITED', message: 'Human-readable message' }
```

**Streaming Response:**
- Proxy streams raw SSE tokens: `data: {"token": "..."}\n\n`
- Frontend accumulates tokens, passes full sentence to synthesis
- Final event: `data: {"done": true}\n\n`

**Date/Time:**
- All stored dates: ISO 8601 strings — `"2026-04-06T22:00:00.000Z"`
- Streak tracking: date-only strings — `"2026-04-06"` (compare with `new Date().toISOString().split('T')[0]`)

**Zustand Store Shape:**
Each persisted store follows this pattern:
```javascript
// stores/profileStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProfileStore = create(
  persist(
    (set, get) => ({
      // state
      profile: null,
      // actions
      setProfile: (profile) => set({ profile }),
      resetProfile: () => set({ profile: null }),
    }),
    { name: 'german_app_v1.profile' }
  )
)
```

---

### Communication Patterns

**Voice Pipeline State (`useVoiceStore` — not persisted):**
Status flows in one direction only:
`idle → listening → transcribing → processing → speaking → idle`
No skipping states. Reset to `idle` on any error.

**Gamification Events:**
All features award XP through the store action, never directly:
```javascript
// CORRECT
useGamificationStore.getState().addXP(10, 'vocabulary_session')

// WRONG — never update gamification state directly from a component
setXP(xp + 10)
```

**Cross-Feature Communication:**
Features do not import from each other. Shared state flows through Zustand stores only.
```javascript
// CORRECT: feature reads from store
const profile = useProfileStore(state => state.profile)

// WRONG: feature imports from another feature
import { someHelper } from '../conversation/conversationHelpers'
```

---

### Process Patterns

**Loading States:**
Use status strings, not boolean flags — prevents impossible states:
```javascript
// CORRECT
const [status, setStatus] = useState('idle') // idle | loading | success | error

// WRONG
const [isLoading, setIsLoading] = useState(false)
const [hasError, setHasError] = useState(false) // can be both true simultaneously
```

**Error Handling:**
All async operations use try/catch with the standard error shape:
```javascript
try {
  const result = await apiClient.chat(payload)
  // handle success
} catch (err) {
  setError({ code: err.code || 'UNKNOWN', message: err.message })
}
```

**Graceful Degradation Pattern:**
Each integration has an explicit fallback:
- Voice unavailable → `useVoiceStore.setFallbackMode('text-input')`
- Proxy unavailable → show `<ProxyUnavailableBanner />`, block AI features only
- Synthesis unavailable → display AI text response, continue conversation

**React Component Pattern:**
Prefer focused components. Each component has one clear responsibility.
Props are explicit — no spreading unknown props (`{...props}`) onto DOM elements.

---

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `handle` prefix for event handlers, never `on` prefix on handler functions
- Use status strings (`idle/loading/success/error`) not boolean loading flags
- Access cross-feature state through Zustand stores only — no cross-feature imports
- Award XP exclusively via `useGamificationStore.getState().addXP()`
- Use `apiClient.js` for all proxy calls — no raw `fetch()` to proxy outside this service
- Follow the localStorage key namespace `german_app_v1.*` exactly
- Co-locate test files with the component they test

**Anti-Patterns to Avoid:**
- ❌ `const [isLoading, setIsLoading] = useState(false)` — use status enum
- ❌ `import { x } from '../conversation/...'` — no cross-feature imports
- ❌ `localStorage.setItem('profile', ...)` — always go through Zustand persist
- ❌ Direct DOM manipulation — React controls the DOM
- ❌ Inline styles — use Tailwind classes only

---

## Project Structure & Boundaries

### Requirements to Structure Mapping

| FR Category | FRs | Location |
|---|---|---|
| Onboarding & Profile | FR1–5 | `src/features/onboarding/` |
| AI Conversation | FR6–15, FR51 | `src/features/conversation/` |
| Vocabulary Learning | FR16–21 | `src/features/vocabulary/` |
| Grammar Learning | FR22–26 | `src/features/grammar/` |
| Sentence Building | FR27–29 | `src/features/sentenceBuilder/` |
| Reading & Pronunciation | FR30–36 | `src/features/reading/` |
| Gamification & Progress | FR37–46 | `src/features/gamification/` + `src/stores/gamificationStore.js` |
| Content Caching & Data | FR47–50 | `src/services/cacheService.js` + `src/services/migrationService.js` |
| Security (NFR7–9) | — | `proxy/middleware/corsGuard.js`, `proxy/.env` |
| Graceful Degradation (NFR12–16) | — | `src/services/voiceService.js`, `src/components/ProxyUnavailableBanner.jsx` |

---

### Complete Project Directory Structure

```
german-app/                          # Root — concurrently orchestrates both processes
├── package.json                     # Root scripts: dev, dev:app, dev:proxy
├── .gitignore                       # Ignores node_modules, proxy/.env, dist
├── README.md                        # Setup instructions (start proxy, run app)
│
├── proxy/                           # Local Node.js proxy (API key security)
│   ├── package.json
│   ├── .env                         # CLAUDE_API_KEY — gitignored
│   ├── .env.example                 # Template: CLAUDE_API_KEY=your_key_here
│   ├── index.js                     # Express app entry — CORS, middleware, routes
│   ├── routes/
│   │   ├── health.js                # GET /health — proxy liveness check (FR50, NFR13)
│   │   ├── chat.js                  # POST /api/chat — SSE stream to Claude (FR6–15)
│   │   └── generate.js              # POST /api/generate — bulk content gen (FR47)
│   └── middleware/
│       ├── corsGuard.js             # Restrict to localhost:5173 only (NFR8)
│       └── errorHandler.js          # Structured error responses
│
└── src-app/                         # Vite + React SPA
    ├── package.json
    ├── vite.config.js               # Vite 8 + @tailwindcss/vite plugin
    ├── index.html                   # Single HTML entry point
    ├── public/
    │   ├── favicon.ico
    │   └── notification-icon.png    # Used by Browser Notifications API (FR45)
    └── src/
        ├── main.jsx                 # React root, router provider
        ├── App.jsx                  # Route definitions (7 routes)
        ├── index.css                # @import "tailwindcss"
        │
        ├── features/
        │   ├── onboarding/          # FR1–5: Interview, profile, persona config
        │   │   ├── OnboardingPage.jsx
        │   │   ├── InterviewFlow.jsx
        │   │   ├── ProfileSummary.jsx
        │   │   ├── ProfileEditor.jsx        # FR4: edit individual fields
        │   │   ├── useOnboarding.js
        │   │   └── onboardingHelpers.js     # Prompt builder for persona generation
        │   │
        │   ├── conversation/        # FR6–15, FR51: Voice AI conversation + correction
        │   │   ├── ConversationPage.jsx
        │   │   ├── VoiceButton.jsx          # Mic start/stop, fallback to text (NFR12)
        │   │   ├── TranscriptionDisplay.jsx # FR7: show transcript before processing
        │   │   ├── CorrectionOverlay.jsx    # FR8–10: inline grammar correction + retry
        │   │   ├── ConversationHistory.jsx  # FR14: running correction count
        │   │   ├── TopicSelector.jsx        # FR12–13: topic proposals + change
        │   │   ├── SessionSummary.jsx       # FR15: end-of-session error/correction report
        │   │   ├── useConversation.js
        │   │   └── conversationHelpers.js   # System prompt assembly, token budget
        │   │
        │   ├── vocabulary/          # FR16–21: Daily words + 3 game types
        │   │   ├── VocabularyPage.jsx
        │   │   ├── WordCard.jsx             # FR16: word + context sentence display
        │   │   ├── FlashcardGame.jsx        # FR17: DE→EN, EN→DE flashcards
        │   │   ├── FillInBlankGame.jsx      # FR18: fill-in-the-blank exercises
        │   │   ├── MatchingGame.jsx         # FR19: word-matching game
        │   │   ├── useVocabulary.js
        │   │   └── vocabularyHelpers.js     # Struggle tracking, rolling week logic
        │   │
        │   ├── grammar/             # FR22–26: Curriculum browse, search, exercises
        │   │   ├── GrammarPage.jsx
        │   │   ├── TopicList.jsx            # FR22: browse by level (A1–B2)
        │   │   ├── GrammarSearch.jsx        # FR23: keyword/concept search
        │   │   ├── TopicCard.jsx            # FR24: explanation + examples + exercise
        │   │   ├── GrammarExercise.jsx      # FR25: interactive exercise + feedback
        │   │   └── useGrammar.js            # FR26: track visited topics for AI reinforcement
        │   │
        │   ├── sentenceBuilder/     # FR27–29: Word-order game
        │   │   ├── SentenceBuilderPage.jsx
        │   │   ├── WordTile.jsx             # Draggable/clickable word tiles
        │   │   ├── SentenceSlot.jsx         # Drop target slots
        │   │   ├── HintPanel.jsx            # FR28: hint after 3 failures
        │   │   ├── RuleExplanation.jsx      # FR29: post-round grammar rule explanation
        │   │   └── useSentenceBuilder.js
        │   │
        │   ├── reading/             # FR30–36: Articles + read-aloud + pronunciation
        │   │   ├── ReadingPage.jsx
        │   │   ├── ArticleList.jsx          # FR30: browse articles by topic/difficulty
        │   │   ├── ArticleReader.jsx        # FR30–31: article display + comprehension Qs
        │   │   ├── ReadAloudMode.jsx        # FR32: activate read-aloud on article
        │   │   ├── PronunciationOverlay.jsx # FR33–35: highlight, play, retry mispronounced words
        │   │   ├── PronunciationReport.jsx  # FR36: end-of-session pronunciation score
        │   │   ├── useReading.js
        │   │   └── readingHelpers.js        # Phoneme comparison, retry logic
        │   │
        │   └── gamification/        # FR37–46: XP, streaks, badges, challenges, dashboard
        │       ├── HomePage.jsx             # FR37, FR41–43: dashboard + daily challenge hook
        │       ├── StreakDisplay.jsx        # FR37: streak counter + at-risk indicator
        │       ├── XPBar.jsx               # FR38–39: XP + level progress bar
        │       ├── BadgeGrid.jsx           # FR40: achievement badges display
        │       ├── DailyChallenge.jsx      # FR41: daily challenge card + completion
        │       ├── WeeklyChallenge.jsx     # FR42: weekly challenge tracker
        │       ├── SessionSummaryModal.jsx # FR43: post-session XP/badges/streak/corrections
        │       ├── ProgressDashboard.jsx   # FR44: full history — streak, XP, level, coverage
        │       ├── EmergencyQuickSession.jsx # FR46: ≤5 min vocab-only streak saver
        │       └── useGamification.js
        │
        ├── components/              # Shared UI — used in 2+ features
        │   ├── Navigation.jsx               # Top nav bar with route links
        │   ├── Button.jsx                   # Primary/secondary/danger variants
        │   ├── Card.jsx                     # Content container
        │   ├── Modal.jsx                    # Overlay modal wrapper
        │   ├── Banner.jsx                   # Info/warning/error banners
        │   ├── ProxyUnavailableBanner.jsx   # FR50, NFR13: proxy not running notice
        │   ├── VoiceFallbackNotice.jsx      # NFR12: mic unavailable → text input notice
        │   ├── LoadingSpinner.jsx
        │   └── ErrorBoundary.jsx            # React error boundary for runtime errors
        │
        ├── stores/                  # Zustand stores — one file per store
        │   ├── profileStore.js              # useProfileStore — persisted
        │   ├── gamificationStore.js         # useGamificationStore — persisted
        │   ├── cacheStore.js               # useCacheStore — persisted
        │   ├── voiceStore.js               # useVoiceStore — session only
        │   ├── sessionStore.js             # useSessionStore — session only
        │   └── uiStore.js                  # useUIStore — session only
        │
        ├── services/                # External integrations + cross-feature logic
        │   ├── apiClient.js                 # All fetch calls to proxy (SSE + JSON)
        │   ├── voiceService.js              # Web Speech API input + Synthesis output
        │   ├── cacheService.js              # localStorage cache reads/writes + staleness
        │   ├── gamificationService.js       # XP calculation rules, badge evaluation
        │   ├── migrationService.js          # localStorage schema version migration
        │   └── notificationService.js       # Browser Notifications API (FR45)
        │
        ├── hooks/                   # Shared hooks — used in 2+ features
        │   ├── useProxyHealth.js            # Polls /health on mount (FR50)
        │   ├── useStreakGuard.js            # Monitors streak midnight deadline (FR45–46)
        │   └── useNotifications.js         # Notification permission + scheduling
        │
        └── utils/                   # Pure utility functions
            ├── dateHelpers.js               # ISO date strings, streak date comparison
            ├── storageHelpers.js            # Schema version check, migration helpers
            └── promptBuilder.js            # Assemble Claude system prompts from profile
```

---

### Architectural Boundaries

**API Boundaries:**

| Caller | Target | Transport | Auth |
|---|---|---|---|
| SPA (`src/services/apiClient.js`) | Proxy `localhost:3001` | HTTP/SSE | None (localhost only) |
| Proxy (`proxy/routes/chat.js`) | Anthropic API | HTTPS | Bearer token from `.env` |
| SPA (`src/services/voiceService.js`) | Web Speech API | Browser API | Mic permission |
| SPA (`src/services/notificationService.js`) | Browser Notifications API | Browser API | Notification permission |

**Component Boundaries:**
- Features consume store state via Zustand selectors — no prop drilling across features
- Shared UI components in `src/components/` accept explicit props only — no store access inside them
- `src/services/` modules are stateless — they read/write stores via passed references or direct `getState()` calls

**Data Boundaries:**

| Data Type | Storage | Lifetime |
|---|---|---|
| User profile + persona | localStorage (`german_app_v1.profile`) | Persistent |
| XP, streak, badges | localStorage (`german_app_v1.gamification`) | Persistent |
| Vocab/grammar/article cache | localStorage (`german_app_v1.*_cache`) | Persistent, versioned |
| Current conversation session | In-memory (`useSessionStore`) | Session only |
| Voice pipeline state | In-memory (`useVoiceStore`) | Session only |

---

### Data Flow

**Primary flow — voice conversation turn:**
```
User speaks
  → voiceService (Web Speech API) transcribes
  → useSessionStore stores raw transcript
  → TranscriptionDisplay shows transcript for confirmation
  → apiClient.chat() POSTs to proxy /api/chat (streaming)
  → Proxy calls Claude API, pipes SSE tokens back
  → apiClient accumulates tokens → passes to voiceService synthesis
  → voiceService speaks response (Web Speech Synthesis)
  → Grammar error detected → CorrectionOverlay interrupts flow
  → User repeats correction → confirmed → conversation resumes
  → Session ends → useGamificationStore.addXP() → SessionSummaryModal
```

**Content cache refresh flow:**
```
App loads
  → cacheService checks week_key / version_hash for each cache
  → Stale cache detected → apiClient.generate() → proxy /api/generate
  → Proxy calls Claude API (bulk, not streaming)
  → Response cached in useCacheStore → persisted to localStorage
  → Feature reads from store — zero additional API calls
```

---

### Development Workflow

**Starting the project:**
```bash
# From root
npm run dev
# Starts: Vite SPA on localhost:5173 + Node proxy on localhost:3001
```

**Environment setup:**
```bash
# proxy/.env (gitignored)
CLAUDE_API_KEY=sk-ant-...
PORT=3001
```

**On first launch:**
1. SPA loads → `useProxyHealth` pings `/health`
2. If proxy not running → `<ProxyUnavailableBanner>` shown
3. If no profile in localStorage → redirect to `/onboarding`
4. If profile exists → load `/` (Home/Dashboard)

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology versions are compatible:
- React 18 + Vite 8 + Tailwind v4 + @tailwindcss/vite — verified compatible
- Zustand 5 + React 18 + persist middleware — no conflicts
- React Router v7 + React 18 — compatible
- SSE streaming via `fetch` ReadableStream — fully supported in Chrome (primary target)
- concurrently orchestrating Vite + Node — no process conflicts

No contradictory decisions identified.

**Pattern Consistency:**
- Status enum (`idle/loading/success/error`) is consistent with Zustand store shape and component error handling
- Zustand `persist` middleware correctly maps to the localStorage-only constraint
- Feature-based folder structure aligns with the no-cross-feature-imports rule
- `apiClient.js` central proxy access aligns with NFR7–9 security requirements
- `promptBuilder.js` + token cap in `conversationHelpers.js` supports NFR11 (minimal per-turn context)

**Structure Alignment:**
- `proxy/` fully isolates API key security (NFR7–9)
- `src/services/` separates external integrations from UI components
- `src/stores/` provides single source of truth for all shared state
- Feature folders map 1:1 to FR category groups

---

### Requirements Coverage Validation

**Functional Requirements Coverage:**

| FR Group | FRs | Covered By | Status |
|---|---|---|---|
| Onboarding & Profile | FR1–5 | `features/onboarding/`, `useProfileStore` | ✅ |
| AI Conversation | FR6–15, FR51 | `features/conversation/`, `voiceService`, `apiClient` | ✅ |
| Vocabulary Learning | FR16–21 | `features/vocabulary/`, `useCacheStore` | ✅ |
| Grammar Learning | FR22–26 | `features/grammar/`, `useCacheStore` | ✅ |
| Sentence Building | FR27–29 | `features/sentenceBuilder/` | ✅ |
| Reading & Pronunciation | FR30–36 | `features/reading/`, `voiceService` | ✅ |
| Gamification & Progress | FR37–46 | `features/gamification/`, `gamificationStore`, `notificationService` | ✅ |
| Content Caching & Data | FR47–50 | `cacheService`, `migrationService`, `useProxyHealth` | ✅ |

**Non-Functional Requirements Coverage:**

| NFR | Requirement | Covered By | Status |
|---|---|---|---|
| NFR1 | 3s AI response P95 | Streaming SSE + token cap in `conversationHelpers.js` | ✅ |
| NFR2 | 500ms cache renders | `useCacheStore` + `cacheService` (pre-loaded) | ✅ |
| NFR3 | 100ms game interactions | Pure React state, no async in game loop | ✅ |
| NFR4 | 60fps animations | Tailwind CSS transitions, no heavy JS in render | ✅ |
| NFR5 | 2s app load | Vite bundle optimization, minimal dependencies | ✅ |
| NFR6 | 500ms transcription start | `voiceService` Web Speech API event handling | ✅ |
| NFR7 | API key not in frontend | `proxy/.env` + proxy-only key access | ✅ |
| NFR8 | Localhost-only proxy | `corsGuard.js` restricts to `localhost:5173` | ✅ |
| NFR9 | `.env` gitignored | `.gitignore` entry | ✅ |
| NFR10 | No third-party analytics | No analytics libs in stack | ✅ |
| NFR11 | Minimal per-turn context | `promptBuilder.js` + token cap | ✅ |
| NFR12 | Voice failure → text | `VoiceButton` fallback + `VoiceFallbackNotice` | ✅ |
| NFR13 | Proxy error → message | `ProxyUnavailableBanner` + `useProxyHealth` | ✅ |
| NFR14 | Synthesis failure → text | `voiceService` fallback to text display | ✅ |
| NFR15 | 429 rate limit handling | `apiClient.js` CLAUDE_RATE_LIMITED error code + retry | ✅ |
| NFR16 | Notification denial safe | `notificationService` permission check before scheduling | ✅ |

---

### Gap Analysis & Resolutions

**Gap 1 — Sentence Builder route missing (Minor, resolved)**
The original route map omitted `/sentence-builder`. Without a route, the feature cannot be navigated to.

**Resolution:** Route map updated to 8 routes:
```javascript
/                  → Home / Dashboard
/onboarding        → Onboarding interview
/conversation      → AI conversation practice
/vocabulary        → Daily vocabulary + games
/grammar           → Grammar curriculum + search
/sentence-builder  → Sentence Builder game
/reading           → Articles + read-aloud
/progress          → Progress dashboard
```

**Gap 2 — FR49 data export location undefined (Minor, resolved)**
FR49 requires a downloadable JSON backup of all user data. No component or service method was originally defined.

**Resolution:** Add `ExportDataButton.jsx` to `src/components/`. Add `exportBackup()` method to `migrationService.js` (generates downloadable JSON blob from all persisted stores). Surface the button in `ProgressDashboard.jsx`.

---

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions documented with current versions. Rationale recorded for each. No ambiguous decisions remain.

**Structure Completeness:** Complete directory tree defined. All 51 FRs map to specific files. Both gaps resolved. Integration points fully specified.

**Pattern Completeness:** All 6 conflict categories addressed with examples and anti-patterns.

---

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (medium, single-user, local-only)
- [x] Technical constraints identified (Chrome-only, localStorage, local proxy)
- [x] Cross-cutting concerns mapped (6 identified)

**Architectural Decisions**
- [x] Critical decisions documented with verified versions
- [x] Technology stack fully specified (Vite 8, React 18, Tailwind 4.2, Zustand 5, React Router 7)
- [x] Integration patterns defined (SSE streaming, REST proxy surface)
- [x] Performance constraints addressed (streaming, caching, token caps)

**Implementation Patterns**
- [x] Naming conventions established (files, components, handlers, stores, keys)
- [x] Structure patterns defined (shared vs. feature-local rules)
- [x] Communication patterns specified (voice pipeline state machine, XP event flow)
- [x] Process patterns documented (status enums, error handling, graceful degradation)

**Project Structure**
- [x] Complete directory structure defined (all files named and annotated)
- [x] Component boundaries established (no cross-feature imports)
- [x] Integration points mapped (API boundaries table)
- [x] Requirements to structure mapping complete (all 51 FRs + 16 NFRs)

---

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all requirements covered, decisions are non-contradictory, patterns are concrete and enforceable, structure is specific.

**Key Strengths:**
- Cost model is architecturally enforced: Claude is called only via `/api/chat` and `/api/generate` — no accidental API calls possible from features
- Voice pipeline state machine prevents impossible UI states
- localStorage schema versioning built in from day one — no future migration debt
- Every FR traces to a specific file — no ambiguity for agents implementing features

**Areas for Future Enhancement (Post-MVP):**
- Testing framework (Vitest recommended when first feature ships)
- Consider service worker for offline resilience if localStorage is at risk
- Spaced repetition algorithm in `vocabularyHelpers.js` can be upgraded without architectural change

---

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and component boundaries
- Refer to this document for all architectural questions
- Never call the proxy directly — always use `src/services/apiClient.js`
- Never write to localStorage directly — always use Zustand `persist` stores

**First Implementation Steps:**
```bash
# 1. Scaffold SPA
npm create vite@latest german-app -- --template react
cd german-app && npm install
npm install tailwindcss @tailwindcss/vite
npm install react-router zustand
npm install -D concurrently

# 2. Set up proxy
mkdir proxy && cd proxy
npm init -y && npm install express dotenv cors

# 3. Wire root package.json scripts
# 4. Establish folder structure
# 5. Initialize Zustand stores with persist + localStorage schema
# 6. Implement proxy /health and /api/chat with streaming
# 7. Build features in vertical slices: Onboarding → Conversation → Vocabulary → ...
```
