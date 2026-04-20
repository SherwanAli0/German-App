import { useState } from 'react'
import { shuffle, isAnswerCorrect } from './vocabularyHelpers'

const XP_PER_CORRECT = 4

/**
 * FR18 — Fill-in-the-blank: context sentence shown with the word replaced by ___.
 * Accepts answers with or without the article.
 */
export default function FillBlankGame({ words, onComplete, onMarkStruggled }) {
  const [items] = useState(() => shuffle(words))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null) // null | 'correct' | 'incorrect'
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const item = items[index]
  // Replace the German word in the sentence with ___
  const sentenceWithBlank = item.contextSentence.replace(
    new RegExp(item.german.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    '___'
  )

  function handleSubmit() {
    if (!input.trim() || result) return
    const correct = isAnswerCorrect(input, item.german)
    setResult(correct ? 'correct' : 'incorrect')
    if (correct) {
      setCorrectCount((n) => n + 1)
    } else {
      onMarkStruggled(item.id)
    }
  }

  function handleNext() {
    setInput('')
    setResult(null)
    if (index + 1 >= items.length) {
      setDone(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (done) {
    const xp = correctCount * XP_PER_CORRECT
    return (
      <div className="flex flex-col items-center gap-6 text-center py-12">
        <div className="text-5xl">✏️</div>
        <h3 className="text-xl font-bold text-gray-900">Fill-in-the-blank done!</h3>
        <div className="grid grid-cols-2 gap-4 w-64">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-700">{correctCount}</p>
            <p className="text-xs text-green-600">correct</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-2xl font-bold text-red-500">{items.length - correctCount}</p>
            <p className="text-xs text-red-500">missed</p>
          </div>
        </div>
        <p className="text-sm text-indigo-600 font-medium">+{xp} XP earned</p>
        <button
          onClick={() => onComplete(xp)}
          className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Question {index + 1} of {items.length}</span>
          <span>{correctCount} correct</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${(index / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Hint: English meaning */}
      <p className="text-sm text-gray-500">
        English: <span className="font-medium text-gray-700">{item.english}</span>
        {item.article && <span className="ml-2 text-indigo-400 text-xs">(hint: {item.article}…)</span>}
      </p>

      {/* Sentence with blank */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
        <p className="text-base leading-relaxed text-gray-800">{sentenceWithBlank}</p>
        <p className="text-xs text-gray-400 mt-2 italic">{item.contextTranslation}</p>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Type the missing German word…"
          disabled={Boolean(result)}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
          autoFocus
        />
        {!result && (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            Check
          </button>
        )}
      </div>

      {/* Feedback */}
      {result === 'correct' && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 flex items-center gap-2">
          <span>✅</span>
          <p className="text-sm font-semibold text-green-700">Richtig! Well done.</p>
        </div>
      )}
      {result === 'incorrect' && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm font-semibold text-red-600">
            ❌ Not quite. The answer is: <strong>{item.german}</strong>
          </p>
        </div>
      )}

      {result && (
        <button
          onClick={handleNext}
          className="self-end rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          {index + 1 >= items.length ? 'See results' : 'Next →'}
        </button>
      )}
    </div>
  )
}
