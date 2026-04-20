import GrammarExercise from './GrammarExercise'

const LEVEL_COLORS = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2: 'bg-sky-100 text-sky-700',
  B1: 'bg-violet-100 text-violet-700',
  B2: 'bg-orange-100 text-orange-700',
}

/**
 * FR24 — Full grammar topic card: explanation, examples, exercise.
 */
export default function TopicCard({ topic, onClose, onExerciseComplete }) {
  const hasContent = Boolean(topic.explanation)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_COLORS[topic.level] ?? 'bg-gray-100 text-gray-600'}`}>
              {topic.level}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{topic.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {!hasContent && (
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
          Content not yet generated. Generate the grammar cache first.
        </div>
      )}

      {hasContent && (
        <>
          {/* Explanation */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-2">Explanation</p>
            <p className="text-base leading-relaxed text-indigo-900">{topic.explanation}</p>
          </div>

          {/* Examples */}
          {topic.examples?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Examples</p>
              <div className="flex flex-col gap-3">
                {topic.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="font-medium text-gray-900">{ex.german}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{ex.english}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercise */}
          {topic.exercise && (
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Exercise</p>
              <GrammarExercise
                exercise={topic.exercise}
                onComplete={onExerciseComplete}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
