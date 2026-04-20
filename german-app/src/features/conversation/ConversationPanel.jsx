import { useEffect, useRef } from 'react'
import VoiceButton from './VoiceButton'
import CorrectionOverlay from './CorrectionOverlay'

/**
 * Main conversation UI: chat history, voice button, text fallback, topic controls.
 */
export default function ConversationPanel({
  topic,
  turns,
  streamingText,
  correctionData,
  isWaitingForRepeat,
  repeatStatus,
  repeatHint,
  voiceStatus,
  isSpeechAvailable,
  fallbackMode,
  correctionCount,
  inputText,
  interimTranscript,
  voiceError,
  onStartListening,
  onStopListening,
  onTextChange,
  onTextSubmit,
  onNewTopic,
  onEndSession,
}) {
  const messagesEndRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns, streamingText])

  const useTextInput = fallbackMode === 'text-input' || !isSpeechAvailable

  return (
    <div className="flex h-full flex-col">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Conversation with Max</h2>
          {topic && <p className="text-xs text-gray-400 mt-0.5">Topic: {topic}</p>}
        </div>
        <div className="flex items-center gap-3">
          {correctionCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {correctionCount} correction{correctionCount !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={onNewTopic}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            New topic
          </button>
          <button
            onClick={onEndSession}
            className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            End session
          </button>
        </div>
      </div>

      {/* ── Chat messages ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {turns.map((turn, i) => (
          <MessageBubble key={i} role={turn.role} content={turn.content} />
        ))}

        {/* Live streaming token display */}
        {streamingText && (
          <MessageBubble role="assistant" content={streamingText} isStreaming />
        )}

        {/* Live interim transcript */}
        {interimTranscript && (
          <div className="flex justify-end">
            <span className="max-w-xs rounded-2xl bg-indigo-50 px-4 py-2 text-sm italic text-indigo-400">
              {interimTranscript}…
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Correction overlay ─────────────────────────────────────────────── */}
      {correctionData && (
        <div className="px-6 pb-4">
          <CorrectionOverlay
            correctionData={correctionData}
            isWaitingForRepeat={isWaitingForRepeat}
            repeatStatus={repeatStatus}
            repeatHint={repeatHint}
          />
        </div>
      )}

      {/* ── Voice error banner ────────────────────────────────────────────── */}
      {voiceError && (
        <div className="mx-6 mb-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {voiceError.message}
        </div>
      )}

      {/* ── Input area ────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-100 px-6 py-5">
        {useTextInput ? (
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => onTextChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onTextSubmit()}
              placeholder={
                isWaitingForRepeat
                  ? 'Type the corrected sentence…'
                  : 'Type your message in German…'
              }
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              onClick={onTextSubmit}
              disabled={!inputText.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <VoiceButton
              voiceStatus={voiceStatus}
              onStart={onStartListening}
              onStop={onStopListening}
              disabled={Boolean(correctionData && !isWaitingForRepeat)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ role, content, isStreaming }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
          M
        </div>
      )}
      <div
        className={`max-w-sm rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-600 text-white'
            : `bg-gray-100 text-gray-800 ${isStreaming ? 'opacity-80' : ''}`
        }`}
      >
        {content}
        {isStreaming && <span className="ml-1 animate-pulse">▋</span>}
      </div>
    </div>
  )
}
