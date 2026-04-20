// Each question drives one InterviewStep.
// type: 'text' | 'single' | 'multi'

const questions = [
  {
    id: 'name',
    type: 'text',
    question: "First things first — what should I call you?",
    placeholder: "Your name or nickname",
  },
  {
    id: 'level',
    type: 'single',
    question: "How would you describe your current German?",
    options: ['A1 – Beginner', 'A2 – Elementary', 'B1 – Intermediate', 'B2 – Upper Intermediate'],
  },
  {
    id: 'humorStyle',
    type: 'single',
    question: "What kind of humor do you actually enjoy?",
    options: ['Wholesome & warm', 'Dry & sarcastic', 'Dad jokes & puns', 'Tech / nerd humor', 'Dark & absurdist'],
  },
  {
    id: 'topicInterests',
    type: 'multi',
    question: "Which topics do you actually want to talk about? Pick as many as you like.",
    options: ['Tech & engineering', 'Workplace & internship', 'Food & cooking', 'Travel & cities', 'Culture & history', 'Sports', 'Music & film', 'Daily life in Germany'],
  },
  {
    id: 'biggestChallenge',
    type: 'single',
    question: "What trips you up most in German right now?",
    options: [
      'Word order (Wortstellung)',
      'Cases (Nominativ / Akkusativ / Dativ)',
      'Freezing when I need to speak',
      'Vocabulary gaps',
      'Pronunciation',
      'Understanding fast native speech',
    ],
  },
  {
    id: 'correctionStyle',
    type: 'single',
    question: "When you make a grammar mistake during a conversation, how do you want to be corrected?",
    options: [
      'Stop me immediately and explain the rule',
      'Quick inline fix — full explanation at session end',
      'Save everything for the summary — don\'t interrupt the flow',
    ],
  },
  {
    id: 'learningGoal',
    type: 'text',
    question: "One sentence: what does German fluency mean to you?",
    placeholder: "e.g. Hold a full conversation at my internship without freezing",
  },
  {
    id: 'dailySchedule',
    type: 'single',
    question: "When do you usually have time to practise?",
    options: ['Morning (before work)', 'Lunch break', 'Evening (after work)', 'Late night', 'It varies a lot'],
  },
]

export default questions
