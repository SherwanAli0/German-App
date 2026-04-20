import { useState } from 'react'

/**
 * FR25 — Multiple-choice exercise with immediate correct/incorrect feedback.
 */
export default function GrammarExercise({ exercise, onComplete }) {
  const [selected, setSelected] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [done, setDone] = useState(false)

  if (!exercise) return null

  function handleSelect(option) {
    if (selected) return
    setSelected(option)
    if (option === exercise.answer) {
      setTimeout(() => {
        setDone(true)
        onComplete()
      }, 800)
    }
  }

  function getOptionStyle(option) {
    if (!selected) {
      return 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
    }
    if (option === exercise.answer) {
      return 'border-green-400 bg-green-50 text-green-800'
    }
    if (option === selected) {
      return 'border-red-300 bg-red-50 text-red-700'
    }
    return 'border-gray-100 bg-gray-50 text-gray-400'
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
        <span>✅</span>
        <p className="text-sm font-semibold text-green-700">Correct! +8 XP</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-gray-800">{exercise.question}</p>

      <div className="flex flex-col gap-2">
        {exercise.options?.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={Boolean(selected)}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${getOptionStyle(option)}`}
          >
            {option}
            {selected && option === exercise.answer && (
              <span className="ml-2 text-green-600">✓</span>
            )}
            {selected && option === selected && option !== exercise.answer && (
              <span className="ml-2 text-red-500">✗</span>
            )}
          </button>
        ))}
      </div>

      {selected && selected !== exercise.answer && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
          <strong>Correct answer:</strong> {exercise.answer}
        </div>
      )}

      {!selected && exercise.hint && (
        <button
          onClick={() => setShowHint((v) => !v)}
          className="self-start text-xs text-indigo-400 hover:text-indigo-600"
        >
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
      )}
      {showHint && exercise.hint && !selected && (
        <p className="text-xs text-gray-500 italic">{exercise.hint}</p>
      )}
    </div>
  )
}
