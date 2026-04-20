/**
 * FR8, FR9, FR10 — Inline grammar correction overlay.
 * Shown after a grammar error is detected in the user's speech.
 * Waits for the user to repeat the corrected sentence before continuing.
 */
export default function CorrectionOverlay({
  correctionData,
  isWaitingForRepeat,
  repeatStatus,
  repeatHint,
}) {
  if (!correctionData) return null

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      {/* Error identified */}
      <div className="mb-4 flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">Grammar check</p>
          <p className="text-sm text-amber-800 mt-0.5">{correctionData.error}</p>
          <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {correctionData.rule}
          </span>
        </div>
      </div>

      {/* Original vs corrected */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-red-50 border border-red-100 p-3">
          <p className="text-xs font-medium text-red-400 mb-1">You said</p>
          <p className="text-red-700 line-through">{correctionData.original}</p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-100 p-3">
          <p className="text-xs font-medium text-green-500 mb-1">Corrected</p>
          <p className="font-semibold text-green-800">{correctionData.corrected}</p>
        </div>
      </div>

      {/* Repeat prompt */}
      {isWaitingForRepeat && repeatStatus === null && (
        <p className="text-sm font-medium text-amber-900">
          🎤 Now repeat the corrected sentence out loud to continue.
        </p>
      )}

      {/* Feedback after repeat */}
      {repeatStatus === 'correct' && (
        <div className="flex items-center gap-2 text-green-700">
          <span className="text-lg">✅</span>
          <p className="text-sm font-semibold">Gut gemacht! Continuing the conversation…</p>
        </div>
      )}

      {repeatStatus === 'incorrect' && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-red-600">
            <span className="text-lg">❌</span>
            <p className="text-sm font-semibold">Not quite — try again.</p>
          </div>
          {repeatHint && <p className="text-xs text-red-500 ml-7">{repeatHint}</p>}
        </div>
      )}
    </div>
  )
}
