import { useVocabulary } from './useVocabulary'
import FlashcardGame from './FlashcardGame'
import FillBlankGame from './FillBlankGame'
import MatchingGame from './MatchingGame'

const GAMES = [
  { id: 'flashcard', label: 'Flashcards', emoji: '🎴', desc: 'Flip cards to test your recall' },
  { id: 'fill', label: 'Fill in the blank', emoji: '✏️', desc: 'Complete sentences with the right word' },
  { id: 'match', label: 'Word matching', emoji: '🎯', desc: 'Pair German words with their translations' },
]

export default function VocabularyPage() {
  const {
    loadStatus,
    loadError,
    words,
    struggledWords,
    activeGame,
    weekKey,
    setActiveGame,
    handleMarkStruggled,
    handleGameComplete,
    handleRetryGeneration,
  } = useVocabulary()

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loadStatus === 'idle' || loadStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Generating this week's vocabulary…</p>
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (loadStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-red-600">Couldn't load vocabulary</p>
          <p className="text-sm text-gray-500">{loadError}</p>
          <p className="text-xs text-gray-400">
            Make sure the proxy is running: <code className="rounded bg-gray-100 px-1">npm run dev:proxy</code>
          </p>
          <button
            onClick={handleRetryGeneration}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // ── Active game ─────────────────────────────────────────────────────────────
  if (activeGame) {
    const gameWords = activeGame === 'flashcard' && struggledWords.length > 0
      ? [...words, ...struggledWords].slice(0, 12) // surface struggled words (FR20)
      : words

    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <button
            onClick={() => setActiveGame(null)}
            className="mb-6 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to vocabulary
          </button>

          {activeGame === 'flashcard' && (
            <FlashcardGame
              words={gameWords}
              onComplete={handleGameComplete}
              onMarkStruggled={handleMarkStruggled}
            />
          )}
          {activeGame === 'fill' && (
            <FillBlankGame
              words={words}
              onComplete={handleGameComplete}
              onMarkStruggled={handleMarkStruggled}
            />
          )}
          {activeGame === 'match' && (
            <MatchingGame
              words={words}
              onComplete={handleGameComplete}
              onMarkStruggled={handleMarkStruggled}
            />
          )}
        </div>
      </div>
    )
  }

  // ── Word list + game selection ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Daily Vocabulary</h1>
            <span className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-400">{weekKey}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{words.length} words this week</p>
        </div>

        {/* Struggled word banner (FR20) */}
        {struggledWords.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>{struggledWords.length} word{struggledWords.length !== 1 ? 's' : ''}</strong> flagged for extra practice — they'll appear in your Flashcard session.
          </div>
        )}

        {/* Word list (FR16) */}
        <div className="mb-8 flex flex-col gap-2">
          {words.map((word) => (
            <div
              key={word.id}
              className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-gray-900">{word.german}</span>
                  <span className="text-sm text-gray-400">{word.english}</span>
                  {struggledWords.some((s) => s.id === word.id) && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">review</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400 italic">{word.contextSentence}</p>
              </div>
              <span className="shrink-0 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-400">
                {word.difficulty}
              </span>
            </div>
          ))}
        </div>

        {/* Game selection */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-700">Practice games</h2>
          <div className="grid grid-cols-3 gap-3">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <span className="text-3xl">{game.emoji}</span>
                <span className="text-sm font-semibold text-gray-800">{game.label}</span>
                <span className="text-xs text-gray-400">{game.desc}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
