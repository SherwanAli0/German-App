import { useState, useEffect } from 'react'
import { useCacheStore } from '../../stores/cacheStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { shuffle } from '../vocabulary/vocabularyHelpers'

const SESSION_DURATION = 5 * 60  // 5 minutes in seconds
const WORDS_PER_SESSION = 10
const XP_QUICK = 30

/**
 * FR46 — Emergency quick session: rapid-fire vocabulary multiple-choice,
 * no voice required, ≤5 minutes. Preserves the streak.
 */
export default function QuickSession({ onComplete, onCancel }) {
  const words = useCacheStore((s) => s.vocabularyCache?.items ?? [])
  const { addXP, awardBadge } = useGamificationStore((s) => s)

  const [questions] = useState(() => buildQuestions(words))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATION)

  // Countdown timer
  useEffect(() => {
    if (done) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval)
          finishSession()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [done])

  function handleSelect(option) {
    if (selected) return
    setSelected(option)
    if (option === questions[index].answer) {
      setCorrectCount((n) => n + 1)
    }
    setTimeout(advance, 600)
  }

  function advance() {
    if (index + 1 >= questions.length) {
      finishSession()
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
    }
  }

  function finishSession() {
    setDone(true)
    addXP(XP_QUICK, 'quick_session')
    awardBadge('quick-save')
  }

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-gray-500">No vocabulary loaded yet. Complete the vocabulary section first.</p>
        <button onClick={onCancel} className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm text-gray-500 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="text-5xl">⚡</div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Streak gerettet!</h3>
          <p className="text-sm text-gray-500 mt-1">Du bist unaufhaltbar. 🎉</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-64">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-700">{correctCount}</p>
            <p className="text-xs text-green-600">correct</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-4">
            <p className="text-2xl font-bold text-indigo-700">+{XP_QUICK}</p>
            <p className="text-xs text-indigo-600">XP earned</p>
          </div>
        </div>
        <button
          onClick={onComplete}
          className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Done
        </button>
      </div>
    )
  }

  const q = questions[index]
  const minutes = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timerColor = secondsLeft < 60 ? 'text-red-500' : 'text-gray-400'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Quick Session ⚡</h3>
          <p className="text-xs text-gray-400">Question {index + 1} of {questions.length}</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold tabular-nums ${timerColor}`}>
            {minutes}:{String(secs).padStart(2, '0')}
          </p>
          <p className="text-xs text-gray-400">remaining</p>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${secondsLeft < 60 ? 'bg-red-400' : 'bg-indigo-500'}`}
          style={{ width: `${(secondsLeft / SESSION_DURATION) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
        <p className="text-xs text-gray-400 mb-1">What does this mean?</p>
        <p className="text-2xl font-bold text-gray-900">{q.word}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {q.options.map((opt) => {
          let style = 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
          if (selected) {
            if (opt === q.answer) style = 'border-green-400 bg-green-50 text-green-800'
            else if (opt === selected) style = 'border-red-300 bg-red-50 text-red-700'
            else style = 'border-gray-100 bg-gray-50 text-gray-400'
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={Boolean(selected)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${style}`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <button onClick={onCancel} className="self-center text-xs text-gray-300 hover:text-gray-400">
        Cancel
      </button>
    </div>
  )
}

function buildQuestions(words) {
  if (words.length < 4) return []
  const selected = shuffle(words).slice(0, WORDS_PER_SESSION)
  return selected.map((word) => {
    const distractors = shuffle(words.filter((w) => w.id !== word.id))
      .slice(0, 3)
      .map((w) => w.english)
    const options = shuffle([word.english, ...distractors])
    return { word: word.german, answer: word.english, options }
  })
}
