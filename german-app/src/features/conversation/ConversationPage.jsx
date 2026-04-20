import { useConversation } from './useConversation'
import ConversationPanel from './ConversationPanel'
import SessionSummary from './SessionSummary'

export default function ConversationPage() {
  const conv = useConversation()

  // ── Not started ─────────────────────────────────────────────────────────────
  if (!conv.isSessionActive && !conv.sessionSummary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="flex max-w-sm flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-4xl">
            🎙️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Talk to Max</h1>
            <p className="mt-2 text-sm text-gray-500">
              Max will propose a topic based on your profile, correct your grammar inline, and keep the conversation going.
            </p>
          </div>

          {!conv.isSpeechAvailable && (
            <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Microphone not available — you'll use text input instead.
            </p>
          )}

          <button
            onClick={conv.handleStartSession}
            className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Start conversation
          </button>
        </div>
      </div>
    )
  }

  // ── Active session ──────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-white">
      {conv.isSessionActive && (
        <ConversationPanel
          topic={conv.topic}
          turns={conv.turns}
          streamingText={conv.streamingText}
          correctionData={conv.correctionData}
          isWaitingForRepeat={conv.isWaitingForRepeat}
          repeatStatus={conv.repeatStatus}
          repeatHint={conv.repeatHint}
          voiceStatus={conv.voiceStatus}
          isSpeechAvailable={conv.isSpeechAvailable}
          fallbackMode={conv.fallbackMode}
          correctionCount={conv.correctionCount}
          inputText={conv.inputText}
          interimTranscript={conv.interimTranscript}
          voiceError={conv.voiceError}
          onStartListening={conv.handleStartListening}
          onStopListening={conv.handleStopListening}
          onTextChange={conv.setInputText}
          onTextSubmit={conv.handleTextSubmit}
          onNewTopic={conv.handleNewTopic}
          onEndSession={conv.handleEndSession}
        />
      )}

      {/* FR15 — session summary modal */}
      <SessionSummary
        summary={conv.sessionSummary}
        onDismiss={conv.handleDismissSummary}
      />
    </div>
  )
}
