/**
 * Builds the /api/generate prompt for a weekly article batch (FR30, FR47).
 * Generates 3 articles at varied difficulty levels based on user interests.
 */
export function buildArticleGenerationPrompt(profile) {
  const level = profile?.level ?? 'B1'
  const topics = (profile?.topicInterests ?? []).slice(0, 4).join(', ') || 'daily life in Germany'

  return `Generate 3 short German reading articles for a ${level}-level learner interested in: ${topics}.

Return ONLY a raw JSON array — no markdown, no prose:
[
  {
    "id": "1",
    "title": "Article title in German",
    "level": "A2",
    "topic": "Topic category",
    "text": "The full article text in German. Write 4-5 sentences at the specified level. Use realistic, everyday language.",
    "questions": [
      {
        "question": "Comprehension question in English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "The exact text of the correct option"
      },
      {
        "question": "Second comprehension question in English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Correct option"
      }
    ]
  }
]

Requirements:
- Article 1: ${level === 'A2' ? 'A2' : 'A2'} level — short, simple vocabulary, daily life topic
- Article 2: B1 level — moderate complexity, workplace or tech topic from interests
- Article 3: B1 level — cultural or lifestyle topic from interests
- Each article text must be 4-5 complete German sentences (NOT a paragraph with sub-sentences)
- Comprehension questions must be answerable from the text alone
- IDs must be "1", "2", "3"`
}

/**
 * Splits article text into sentences for the read-aloud pipeline.
 * Returns array of sentence strings with their punctuation preserved.
 */
export function splitIntoSentences(text) {
  // Split on sentence-ending punctuation followed by a space or end of string
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// ── Pronunciation comparison ──────────────────────────────────────────────────

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"""''„–—]/g, '')
    .split(/\s+/)
    .filter(Boolean)
}

/** Simple Levenshtein distance for short words */
function levenshtein(a, b) {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function wordsMatch(expected, got) {
  if (expected === got) return true
  // Allow 1 edit for short words, 2 edits for longer words
  const tolerance = expected.length <= 4 ? 1 : 2
  return levenshtein(expected, got) <= tolerance
}

/**
 * Compares an expected sentence to the user's transcription.
 * Returns an array of flagged word objects: { word: string, tokenIndex: number }
 */
export function compareSentence(expected, transcribed) {
  const expTokens = tokenize(expected)
  const gotTokens = tokenize(transcribed)
  const flagged = []

  for (let i = 0; i < expTokens.length; i++) {
    const exp = expTokens[i]
    const got = gotTokens[i] ?? ''
    if (!wordsMatch(exp, got)) {
      flagged.push({ word: exp, tokenIndex: i })
    }
  }
  return flagged
}

/**
 * Checks whether a single repeated word matches the expected word.
 */
export function wordMatchesExpected(expected, spoken) {
  const [expToken] = tokenize(expected)
  const [spokenToken] = tokenize(spoken ?? '')
  if (!expToken || !spokenToken) return false
  return wordsMatch(expToken, spokenToken)
}
