/**
 * Renders one onboarding question with the appropriate input type:
 *   text   → text input
 *   single → radio-style option cards
 *   multi  → checkbox-style option cards
 */
export default function InterviewStep({ question, answer, onChange }) {
  if (!question) return null

  function handleTextChange(e) {
    onChange(e.target.value)
  }

  function handleSingleSelect(option) {
    onChange(option)
  }

  function handleMultiToggle(option) {
    const current = Array.isArray(answer) ? answer : []
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl font-semibold text-gray-800">{question.question}</p>

      {question.type === 'text' && (
        <input
          type="text"
          value={answer}
          onChange={handleTextChange}
          placeholder={question.placeholder}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          autoFocus
        />
      )}

      {question.type === 'single' && (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleSingleSelect(option)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                answer === option
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === 'multi' && (
        <div className="flex flex-wrap gap-2">
          {question.options.map((option) => {
            const selected = Array.isArray(answer) && answer.includes(option)
            return (
              <button
                key={option}
                onClick={() => handleMultiToggle(option)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-300'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
