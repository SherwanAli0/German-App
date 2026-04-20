import { useEffect } from 'react'
import { useReadAloud } from './useReadAloud'
import PronunciationReport from './PronunciationReport'

const XP_READALOUD = 15

/**
 * FR32–FR36 — Sentence-by-sentence read-aloud with pronunciation detection.
 */
export default function ReadAloudMode({ article, onComplete, onBack }) {
  const ra = useReadAloud(article.sentences)

  // Auto-start on mount
  useEffect(() => {
    ra.startReadAloud()
  }, [])

  // ── Report screen (FR36) ─────────────────────────────────────────────────────
  if (ra.done) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Pronunciation report</h2>
        </div>
        <PronunciationReport
          report={ra.report}
          onDone={() => onComplete(XP_READALOUD)}
        />
      </div>
    )
  }

  const progress = (ra.sentenceIndex / ra.sentences.length) * 100

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Read aloud: {article.title}</h2>
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">
          ← Back
        </button>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Sentence {ra.sentenceIndex + 1} of {ra.sentences.length}</span>
          <span>{ra.report.flaggedCount} flagged so far</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* All sentences — current one highlighted */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
        {ra.sentences.map((sentence, i) => {
          const isCurrent = i === ra.sentenceIndex
          const isPast = i < ra.sentenceIndex
          return (
            <span
              key={i}
              className={`${i > 0 ? ' ' : ''}${
                isCurrent
                  ? 'font-semibold text-indigo-700 bg-indigo-50 rounded px-0.5'
                  : isPast
                  ? 'text-gray-300 line-through'
                  : 'text-gray-400'
              }`}
            >
              {sentence}
            </span>
          )
        })}
      </div>

      {/* Correction overlay */}
      {(ra.phase === 'correcting' || ra.phase === 'waiting-repeat' || ra.phase === 'listening-repeat') && ra.currentFlaggedWord && (
        <CorrectionPanel
          word={ra.currentFlaggedWord.word}
          flaggedWords={ra.flaggedWords}
          flagWordIdx={ra.flaggedWords.indexOf(ra.currentFlaggedWord)}
          retryCount={ra.retryCount}
          phase={ra.phase}
          lastRepeatResult={ra.lastRepeatResult}
          voiceStatus={ra.voiceStatus}
          onRepeat={ra.handleRepeatWord}
          onReplay={ra.handleReplay}
        />
      )}

      {/* Interim transcript */}
      {ra.interimTranscript && (
        <p className="text-center text-sm italic text-indigo-400">{ra.interimTranscript}…</p>
      )}

      {/* Primary action button */}
      {ra.phase === 'ready' && (
        <button
          onClick={ra.handleReadSentence}
          className="flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <span className="text-xl">🎙️</span>
          Read this sentence aloud
        </button>
      )}

      {ra.phase === 'reading' && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-4 px-6 w-full justify-center">
            <span className="h-3 w-3 animate-ping rounded-full bg-red-500" />
            <span className="font-semibold text-red-700">Listening… read the highlighted sentence</span>
          </div>
        </div>
      )}

      {ra.phase === 'checking' && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
          Checking pronunciation…
        </div>
      )}
    </div>
  )
}

function CorrectionPanel({ word, flaggedWords, flagWordIdx, retryCount, phase, lastRepeatResult, voiceStatus, onRepeat, onReplay }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col gap-4">
      {/* Which word */}
      <div>
        <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1">
          Pronunciation check — word {flagWordIdx + 1} of {flaggedWords.length}
        </p>
        <p className="text-2xl font-bold text-amber-900">{word}</p>
      </div>

      {/* Play again button */}
      <button
        onClick={onReplay}
        disabled={voiceStatus === 'speaking'}
        className="flex items-center gap-2 self-start rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50 transition-colors"
      >
        🔊 Play again
      </button>

      {/* Retry counter */}
      <p className="text-xs text-amber-600">
        Attempt {retryCount + 1} of {3} — {3 - retryCount - 1 > 0 ? `${3 - retryCount - 1} remaining` : 'last attempt'}
      </p>

      {/* Feedback */}
      {lastRepeatResult === 'correct' && (
        <p className="text-sm font-semibold text-green-700">✅ Gut gemacht!</p>
      )}
      {lastRepeatResult === 'incorrect' && (
        <p className="text-sm font-semibold text-red-600">❌ Try again — listen carefully to the audio first.</p>
      )}

      {/* Repeat button */}
      {phase === 'waiting-repeat' && (
        <button
          onClick={onRepeat}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 font-semibold text-white hover:bg-amber-700 transition-colors"
        >
          🎙️ Repeat this word
        </button>
      )}

      {phase === 'listening-repeat' && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-100 py-3 text-sm font-semibold text-amber-800">
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-amber-500" />
          Listening…
        </div>
      )}
    </div>
  )
}
