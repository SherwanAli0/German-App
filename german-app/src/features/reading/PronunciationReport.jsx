/**
 * FR36 — End-of-read-aloud pronunciation report.
 */
export default function PronunciationReport({ report, onDone }) {
  const { totalSentences, flaggedWords, flaggedCount, passedCount, totalWords, score } = report

  const failed = flaggedWords.filter((w) => !w.passed)
  const passed = flaggedWords.filter((w) => w.passed)

  const scoreColor =
    score >= 90 ? 'text-green-600' : score >= 70 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="flex flex-col gap-6">
      {/* Score */}
      <div className="text-center py-4">
        <p className={`text-6xl font-bold ${scoreColor}`}>{score}%</p>
        <p className="text-sm text-gray-500 mt-1">pronunciation score</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox value={totalSentences} label="sentences" color="indigo" />
        <StatBox value={totalWords} label="words read" color="indigo" />
        <StatBox value={flaggedCount} label="flagged" color={flaggedCount === 0 ? 'green' : 'amber'} />
      </div>

      {/* Perfect session */}
      {flaggedCount === 0 && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-center text-sm font-semibold text-green-700">
          🌟 Perfect pronunciation — no errors detected!
        </div>
      )}

      {/* Words that needed work */}
      {passed.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Fixed after practice ✓
          </p>
          <div className="flex flex-wrap gap-2">
            {passed.map((w, i) => (
              <span
                key={i}
                className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-sm text-green-700"
              >
                {w.word}
                <span className="ml-1 text-xs text-green-400">({w.retries} try)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Words not yet mastered */}
      {failed.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Queued for next session
          </p>
          <div className="flex flex-wrap gap-2">
            {failed.map((w, i) => (
              <span
                key={i}
                className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-sm text-red-600"
              >
                {w.word}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onDone}
        className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Done
      </button>
    </div>
  )
}

function StatBox({ value, label, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className={`rounded-xl p-4 text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-70">{label}</p>
    </div>
  )
}
