// ── System prompt ─────────────────────────────────────────────────────────────

/**
 * Builds the system prompt injected into every /api/chat call.
 * Kept under 300 tokens (NFR11).
 * recentTurns: last 3 turns for minimal coherence context.
 */
export function buildConversationSystemPrompt(profile, topic, recentTurns = [], recentGrammarTopics = []) {
  const persona = profile.aiPersona
  const contextBlock =
    recentTurns.length > 0
      ? `\nRECENT CONTEXT (last ${recentTurns.length} turns):\n` +
        recentTurns.map((t) => `${t.role === 'user' ? 'Learner' : 'Max'}: ${t.content}`).join('\n')
      : ''

  return `You are Max, a German language tutor and conversation partner.
${persona?.systemPromptFragment ?? 'Be friendly, encouraging, and use clear B1-level German.'}
CURRENT TOPIC: ${topic}
RULES:
- Always respond in German at B1 level (clear sentences, no very complex grammar)
- Maximum 2-3 sentences per response — this is a spoken exchange
- ${persona?.jokeStyle ? `Humor: ${persona.jokeStyle}. Weave in a natural joke, pun, or cultural reference every 4–5 turns.` : 'Occasionally use light humour.'}
- Never mention grammar corrections — the app handles that separately
- Continue the conversation naturally; ask a follow-up question to keep it going${
  recentGrammarTopics.length > 0
    ? `\n- Naturally reinforce these recently studied grammar topics when opportunities arise: ${recentGrammarTopics.join(', ')}`
    : ''
}${contextBlock}`
}

// ── Grammar check ─────────────────────────────────────────────────────────────

/**
 * Prompt for the non-streaming grammar check call to /api/generate.
 * Returns a minimal prompt to keep token cost low.
 */
export function buildGrammarCheckPrompt(text) {
  return `You are a strict German grammar checker. Check this sentence for errors in word order (Wortstellung), verb conjugation, case usage, or article agreement.

Sentence: "${text}"

Respond with ONLY raw JSON — no markdown, no explanation outside the JSON:
• If there is a grammar error: {"hasError":true,"error":"plain-language description","rule":"grammar rule name","corrected":"corrected sentence"}
• If the sentence is correct: {"hasError":false}`
}

// ── Repeat verification ───────────────────────────────────────────────────────

/**
 * Prompt to verify the user's repeated sentence after a correction (FR10).
 */
export function buildRepeatCheckPrompt(correctedSentence, userRepeat) {
  return `A German learner was asked to repeat this corrected sentence: "${correctedSentence}"
They said: "${userRepeat}"

Is the grammar now correct? Respond with ONLY raw JSON:
• If correct or acceptably close: {"isCorrect":true}
• If still has an error: {"isCorrect":false,"hint":"one short sentence hint"}`
}

// ── Topic options ─────────────────────────────────────────────────────────────

const TOPIC_MAP = {
  'Tech & engineering': [
    'Dein letztes Coding-Projekt',
    'KI und die Zukunft der Arbeit',
    'Dein Arbeitsalltag als Ingenieur',
  ],
  'Workplace & internship': [
    'Dein Tag im Praktikum',
    'Eine schwierige Situation bei der Arbeit',
    'Wie schreibt man eine professionelle E-Mail auf Deutsch?',
  ],
  'Food & cooking': [
    'Dein Lieblingsessen in Deutschland',
    'Kochen für Anfänger',
    'Restaurant- oder Café-Empfehlungen',
  ],
  'Travel & cities': [
    'Wochenendausflug planen',
    'Deutsche Städte vergleichen',
    'Öffentliche Verkehrsmittel in Deutschland',
  ],
  'Culture & history': [
    'Deutsche Traditionen und Bräuche',
    'Ein aktueller Nachrichtenartikel',
    'Deutsches Kino und Fernsehen',
  ],
  'Sports': ['Die Bundesliga', 'Dein Lieblingssport', 'Sporterlebnisse in Deutschland'],
  'Music & film': [
    'Dein Lieblingsfilm auf Deutsch',
    'Musik-Empfehlungen',
    'Konzerte und Veranstaltungen',
  ],
  'Daily life in Germany': [
    'Behörden und Bürokratie navigieren',
    'Einkaufen und Besorgungen',
    'Freunde finden in Deutschland',
  ],
}

const FALLBACK_TOPICS = [
  'Erzähl mir von deinem Tag',
  'Was hast du letztes Wochenende gemacht?',
  'Was sind deine Pläne für diese Woche?',
]

export function buildTopicOptions(profile) {
  const interests = profile?.topicInterests ?? []
  const topics = interests.flatMap((interest) => TOPIC_MAP[interest] ?? [])
  return topics.length >= 3 ? topics : [...topics, ...FALLBACK_TOPICS]
}

export function pickRandomTopic(profile, excludeTopic = null) {
  const options = buildTopicOptions(profile).filter((t) => t !== excludeTopic)
  return options[Math.floor(Math.random() * options.length)] ?? FALLBACK_TOPICS[0]
}

// ── Opening message ───────────────────────────────────────────────────────────

export function buildOpeningMessage(topic, profile) {
  const name = profile?.name ?? ''
  return `Hallo${name ? ', ' + name : ''}! Heute sprechen wir über: "${topic}". Fang einfach an — ich bin gespannt!`
}
