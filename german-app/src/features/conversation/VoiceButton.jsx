/**
 * Mic button with visual status — idle, listening (pulse), processing (spin).
 */
export default function VoiceButton({ voiceStatus, onStart, onStop, disabled }) {
  const isListening = voiceStatus === 'listening'
  const isProcessing = voiceStatus === 'processing' || voiceStatus === 'transcribing'
  const isSpeaking = voiceStatus === 'speaking'

  function handleClick() {
    if (disabled) return
    if (isListening) onStop()
    else if (voiceStatus === 'idle') onStart()
  }

  let label = 'Start speaking'
  if (isListening) label = 'Stop (tap to send)'
  if (isProcessing) label = 'Processing…'
  if (isSpeaking) label = 'Max is speaking…'

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing || isSpeaking}
        aria-label={label}
        className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all focus:outline-none disabled:opacity-40 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600'
            : isProcessing || isSpeaking
            ? 'bg-indigo-300 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {/* Pulse ring when listening */}
        {isListening && (
          <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-60" />
        )}

        {/* Spinner when processing */}
        {isProcessing && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </span>
        )}

        {/* Mic icon */}
        {!isProcessing && (
          <svg
            className="relative h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {isListening ? (
              // Square (stop) icon when listening
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
            ) : isSpeaking ? (
              // Speaker icon when AI is speaking
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.95 6.05a8 8 0 010 11.9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9h2l5-5v16l-5-5H6a1 1 0 01-1-1v-4a1 1 0 011-1z" />
              </>
            ) : (
              // Mic icon at idle
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v4M8 23h8" />
              </>
            )}
          </svg>
        )}
      </button>

      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}
