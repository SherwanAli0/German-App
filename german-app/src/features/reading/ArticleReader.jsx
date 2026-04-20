import { useState } from 'react'

const LEVEL_COLORS = {
  A2: 'bg-emerald-100 text-emerald-700',
  B1: 'bg-violet-100 text-violet-700',
  B2: 'bg-orange-100 text-orange-700',
}

/**
 * FR30, FR31 — Displays an article and comprehension questions.
 * Leads into read-aloud mode (FR32) via onStartReadAloud.
 */
export default function ArticleReader({ article, onStartReadAloud, onBack }) {
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [submitted, setSubmitted] = useState({})

  function handleSelect(qIdx, option) {
    if (submitted[qIdx]) return
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }))
  }

  function handleSubmit(qIdx) {
    if (!selectedAnswers[qIdx]) return
    setSubmitted((prev) => ({ ...prev, [qIdx]: true }))
  }

  const allAnswered = article.questions?.every((_, i) => submitted[i])

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button onClick={onBack} className="self-start text-sm text-gray-400 hover:text-gray-600">
        ← All articles
      </button>

      {/* Article header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_COLORS[article.level] ?? 'bg-gray-100 text-gray-600'}`}>
            {article.level}
          </span>
          <span className="text-xs text-gray-400">{article.topic}</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{article.title}</h2>
      </div>

      {/* Article text (FR30) */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
        <p className="text-base leading-relaxed text-gray-800">{article.text}</p>
      </div>

      {/* Read aloud button (FR32) */}
      <button
        onClick={onStartReadAloud}
        className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 py-3 font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
      >
        🎙️ Read it aloud
      </button>

      {/* Comprehension questions (FR31) */}
      {article.questions?.length > 0 && (
        <div className="flex flex-col gap-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Comprehension questions
          </h3>

          {article.questions.map((q, qIdx) => {
            const selected = selectedAnswers[qIdx]
            const isSubmitted = submitted[qIdx]
            const isCorrect = selected === q.answer

            return (
              <div key={qIdx} className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-800">{q.question}</p>

                <div className="flex flex-col gap-2">
                  {q.options.map((option) => {
                    let style = 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                    if (isSubmitted) {
                      if (option === q.answer) style = 'border-green-400 bg-green-50 text-green-800'
                      else if (option === selected) style = 'border-red-300 bg-red-50 text-red-700'
                      else style = 'border-gray-100 bg-gray-50 text-gray-400'
                    } else if (option === selected) {
                      style = 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleSelect(qIdx, option)}
                        disabled={isSubmitted}
                        className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${style}`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>

                {!isSubmitted && selected && (
                  <button
                    onClick={() => handleSubmit(qIdx)}
                    className="self-end rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Check answer
                  </button>
                )}

                {isSubmitted && (
                  <p className={`text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✅ Correct!' : `❌ The answer was: ${q.answer}`}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
