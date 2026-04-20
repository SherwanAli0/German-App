/**
 * FR2: Shows the Claude-generated profile summary before the app begins.
 * User can confirm (saves profile) or go back to edit answers.
 */
export default function ProfileSummary({ answers, persona, onConfirm, onEdit }) {
  const chips = [
    { label: 'Level', value: answers.level },
    { label: 'Humor', value: answers.humorStyle },
    { label: 'Challenge', value: answers.biggestChallenge },
    { label: 'Corrections', value: answers.correctionStyle },
    { label: 'Practice time', value: answers.dailySchedule },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* AI summary message */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <p className="text-base leading-relaxed text-indigo-900">{persona.summary}</p>
      </div>

      {/* Key profile fields */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Your profile</h3>

        <div className="flex flex-wrap gap-2">
          {chips.map(({ label, value }) => (
            <span
              key={label}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
            >
              <span className="font-medium text-gray-500">{label}: </span>
              {value}
            </span>
          ))}
        </div>

        {answers.topicInterests?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {answers.topicInterests.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {answers.learningGoal && (
          <p className="text-sm italic text-gray-500 mt-1">
            Goal: "{answers.learningGoal}"
          </p>
        )}
      </div>

      {/* AI persona tone preview */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">How I'll sound</p>
        <p className="text-sm text-gray-600">{persona.aiTone}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Looks good — let's start
        </button>
        <button
          onClick={onEdit}
          className="rounded-xl border border-gray-200 px-6 py-3 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Edit answers
        </button>
      </div>
    </div>
  )
}
