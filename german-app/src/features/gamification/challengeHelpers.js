// Daily challenges rotate deterministically by day-of-week (no API call)
const DAILY_TEMPLATES = [
  { type: 'conversation', title: 'Have a conversation with Max — at least 6 turns' },
  { type: 'vocabulary',   title: 'Complete all three vocabulary practice games' },
  { type: 'grammar',      title: 'Open and complete 2 grammar topic exercises' },
  { type: 'reading',      title: 'Read an article and answer all comprehension questions' },
  { type: 'readaloud',    title: 'Complete a read-aloud session on any article' },
  { type: 'vocabulary',   title: 'Flashcard session — get 8 out of 10 correct' },
  { type: 'conversation', title: 'Talk to Max for at least 10 minutes' },
]

export function getTodayChallenge() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  const template = DAILY_TEMPLATES[dayOfYear % DAILY_TEMPLATES.length]
  return { ...template, id: `daily-${dayOfYear}` }
}

export function isChallengeStale(challenge) {
  if (!challenge) return true
  return challenge.date !== new Date().toISOString().split('T')[0]
}
