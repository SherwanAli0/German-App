/**
 * FR15 — End-of-session summary modal.
 * Shows corrections made, XP earned, and streak status.
 */
export default function SessionSummary({ summary, onDismiss }) {
  if (!summary) return null

  const { turnCount, correctionCount, xpEarned, topic } = summary

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">Session complete!</h2>
          <p className="text-sm text-gray-400 mt-1">Topic: {topic}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard value={turnCount} label="turns" color="indigo" />
          <StatCard value={correctionCount} label="corrections" color="amber" />
          <StatCard value={`+${xpEarned}`} label="XP earned" color="green" />
        </div>

        {correctionCount === 0 && (
          <p className="mb-6 rounded-xl bg-green-50 p-3 text-center text-sm font-medium text-green-700">
            🌟 Perfect session — zero grammar corrections!
          </p>
        )}

        {correctionCount > 0 && (
          <p className="mb-6 text-center text-sm text-gray-500">
            You corrected <strong>{correctionCount}</strong> grammar{' '}
            {correctionCount === 1 ? 'error' : 'errors'} during this session.
            {correctionCount <= 2 ? ' Great progress!' : ' Keep practising!'}
          </p>
        )}

        <button
          onClick={onDismiss}
          className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function StatCard({ value, label, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700',
  }
  return (
    <div className={`rounded-xl p-4 text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-70">{label}</p>
    </div>
  )
}
