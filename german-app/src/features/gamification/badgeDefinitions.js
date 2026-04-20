const badges = [
  {
    id: 'first-conversation',
    title: 'First Words',
    desc: 'Completed your first conversation with Max',
    icon: '💬',
  },
  {
    id: 'no-corrections',
    title: 'Flawless',
    desc: 'Zero grammar corrections in a conversation session',
    icon: '💎',
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    desc: 'Kept a 7-day learning streak',
    icon: '🔥',
  },
  {
    id: 'streak-30',
    title: 'Month Master',
    desc: 'Kept a 30-day learning streak',
    icon: '👑',
  },
  {
    id: 'first-article',
    title: 'Book Worm',
    desc: 'Read and answered questions on your first article',
    icon: '📖',
  },
  {
    id: 'pronunciation-ace',
    title: 'Pronunciation Pro',
    desc: 'Scored 90%+ in a read-aloud session',
    icon: '🎙️',
  },
  {
    id: 'level-up',
    title: 'Level Up',
    desc: 'Advanced to a new proficiency level',
    icon: '⬆️',
  },
  {
    id: 'perfect-vocab',
    title: 'Word Wizard',
    desc: 'Known every card in a flashcard session',
    icon: '✨',
  },
  {
    id: 'grammar-master',
    title: 'Grammar Guru',
    desc: 'Completed 5 grammar exercises',
    icon: '📚',
  },
  {
    id: 'quick-save',
    title: 'Streak Saver',
    desc: 'Saved a streak with the emergency quick session',
    icon: '⚡',
  },
  {
    id: 'weekly-complete',
    title: 'All-Rounder',
    desc: 'Completed 5 different activities in one week',
    icon: '🏆',
  },
]

export default badges

export function getBadge(id) {
  return badges.find((b) => b.id === id) ?? { id, title: id, desc: '', icon: '🏅' }
}
