/**
 * Shared cache utilities used across Vocabulary, Grammar, and Reading features.
 */

/**
 * Returns the ISO week key for the current date — e.g. "2026-W15".
 * Vocabulary and article caches are keyed by week so content refreshes weekly (FR21).
 */
export function getCurrentWeekKey() {
  const now = new Date()
  const year = now.getFullYear()
  // ISO week: Monday = start of week
  const startOfYear = new Date(year, 0, 1)
  const dayOfWeek = startOfYear.getDay() || 7 // 1=Mon … 7=Sun
  const startOfFirstWeek = new Date(startOfYear)
  if (dayOfWeek !== 1) startOfFirstWeek.setDate(startOfYear.getDate() - dayOfWeek + 1)
  const weekNum = Math.ceil(((now - startOfFirstWeek) / 86400000 + 1) / 7)
  return `${year}-W${String(weekNum).padStart(2, '0')}`
}

/**
 * Parses a JSON array from a raw Claude response string.
 * Throws if no valid JSON array is found.
 */
export function parseJSONArray(text) {
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON array found in response')
  return JSON.parse(match[0])
}

/**
 * Parses a JSON object from a raw Claude response string.
 */
export function parseJSONObject(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON object found in response')
  return JSON.parse(match[0])
}
