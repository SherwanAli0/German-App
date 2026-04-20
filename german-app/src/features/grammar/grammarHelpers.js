import { parseJSONArray } from '../../services/cacheService'

/**
 * Builds the /api/generate prompt for a batch of grammar topics.
 * Each topic gets an explanation, 2 examples, and a multiple-choice exercise.
 */
export function buildGrammarBatchPrompt(topicBatch) {
  const topicList = topicBatch
    .map((t) => `- id: "${t.id}", title: "${t.title}", level: ${t.level}`)
    .join('\n')

  return `Generate German grammar learning content for these topics:
${topicList}

Return ONLY a raw JSON array — no markdown, no prose:
[
  {
    "id": "topic-id",
    "explanation": "Plain-language explanation in 2-3 sentences. Use simple English. Include the German term in brackets.",
    "examples": [
      {"german": "German example sentence.", "english": "English translation."},
      {"german": "Second German example.", "english": "Translation."}
    ],
    "exercise": {
      "type": "multiple-choice",
      "question": "A question that tests understanding of this rule (in English)",
      "options": ["Option A (German)", "Option B (German)", "Option C (German)", "Option D (German)"],
      "answer": "The exact text of the correct option",
      "hint": "One short hint if stuck"
    }
  }
]

Requirements:
- explanations must be beginner-friendly, no jargon without explanation
- example sentences must be realistic everyday German
- exercise options must all look plausible — no obvious wrong answers
- exactly one correct answer per exercise`
}

/**
 * Merges generated content into the static topic manifest.
 * Returns the full topic objects ready for the cache.
 */
export function mergeTopicContent(staticTopics, generatedBatch) {
  const contentMap = {}
  for (const item of generatedBatch) {
    contentMap[item.id] = item
  }

  return staticTopics.map((topic) => ({
    ...topic,
    ...(contentMap[topic.id] ?? {}),
  }))
}

export { parseJSONArray }
