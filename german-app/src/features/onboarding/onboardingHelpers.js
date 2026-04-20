/**
 * Builds the prompt sent to /api/generate to synthesise a structured AI persona
 * from the user's raw onboarding answers.
 *
 * Returns a string the user can inspect; the response is expected to be a JSON
 * object matching the PersonaConfig shape documented below.
 *
 * PersonaConfig {
 *   summary: string          // "Got it, {name} — ..." (1–2 friendly sentences)
 *   aiTone: string           // how the AI character should sound overall
 *   jokeStyle: string        // specific humor instructions for prompts
 *   correctionApproach: string // how to handle inline corrections
 *   topicFocus: string[]     // 3–5 prioritised topics
 *   systemPromptFragment: string // ~100-word paragraph injected into every system prompt
 * }
 */
export function buildPersonaPrompt(answers) {
  const topicsFormatted = Array.isArray(answers.topicInterests)
    ? answers.topicInterests.join(', ')
    : answers.topicInterests

  return `
You are generating a personalised AI language-tutor persona config for a German learning app.

The user completed an onboarding interview. Here are their answers:

- Name: ${answers.name}
- Current German level: ${answers.level}
- Humor style preference: ${answers.humorStyle}
- Topic interests: ${topicsFormatted}
- Biggest German challenge: ${answers.biggestChallenge}
- Preferred correction style: ${answers.correctionStyle}
- Learning goal: ${answers.learningGoal}
- Practice schedule: ${answers.dailySchedule}

Generate a JSON persona config with exactly these keys (no extra keys, no markdown — raw JSON only):

{
  "summary": "A warm 1–2 sentence reflection of what you heard. Address the user by name. Note their key challenge and goal.",
  "aiTone": "A short description (10–15 words) of how the AI tutor should sound — e.g. 'friendly and direct, with dry engineering wit'",
  "jokeStyle": "Specific instruction for the type of humor to use — e.g. 'tech analogies, self-deprecating programmer jokes, occasional pun'",
  "correctionApproach": "How to handle grammar corrections based on their preference — be specific about timing and phrasing",
  "topicFocus": ["3–5 topics from their interests, ordered by enthusiasm"],
  "systemPromptFragment": "A ~100-word paragraph written in second person ('You are...') that can be dropped directly into a conversation system prompt. Capture tone, humor, topics, correction style, and the user's specific challenge."
}
`.trim()
}

/**
 * Extracts JSON from the raw Claude response text (which may contain prose).
 * Returns a parsed object or throws if no valid JSON is found.
 */
export function parsePersonaResponse(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON object found in persona response')
  return JSON.parse(match[0])
}
