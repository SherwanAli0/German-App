/**
 * Builds the /api/generate prompt for a weekly vocabulary batch (FR16, FR21).
 * profile.level and profile.topicInterests shape the output.
 */
export function buildVocabGenerationPrompt(profile) {
  const level = profile?.level ?? 'B1'
  const topics = (profile?.topicInterests ?? []).slice(0, 4).join(', ') || 'daily life in Germany'

  return `Generate exactly 10 German vocabulary words for a ${level}-level learner whose interests are: ${topics}.

Return ONLY a raw JSON array — no markdown, no prose, no extra keys:
[
  {
    "id": "1",
    "german": "die Besprechung",
    "article": "die",
    "english": "meeting",
    "contextSentence": "Wir haben morgen eine wichtige Besprechung mit dem Team.",
    "contextTranslation": "We have an important meeting with the team tomorrow.",
    "difficulty": "B1",
    "topic": "Workplace"
  }
]

Rules:
- Mix nouns (with correct der/die/das article), verbs (infinitive), and adjectives
- All nouns must include the article field; verbs/adjectives use ""
- Context sentences must be realistic, everyday situations at ${level} level
- Topics must relate to: ${topics}
- Words must be genuinely useful for daily life in Germany — no textbook-only words
- IDs must be unique strings "1" through "10"`
}

/**
 * Normalises a user's typed answer for comparison.
 * Strips leading article (der/die/das/ein/eine) and lowercases.
 */
export function normaliseAnswer(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/^(der|die|das|ein|eine)\s+/, '')
}

/**
 * Checks whether the user's typed answer matches the target word.
 * Accepts with or without article, case-insensitive.
 */
export function isAnswerCorrect(userInput, targetGerman) {
  const a = normaliseAnswer(userInput)
  const b = normaliseAnswer(targetGerman)
  return a === b
}

/**
 * Shuffles an array (Fisher-Yates) — used for matching and flashcard order.
 */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
