import { useState } from 'react'
import { shuffle } from './vocabularyHelpers'

const XP_PER_CARD = 3

/**
 * FR17 — Flashcard game: German → English (and English → German on retry).
 * Cards the user doesn't know are marked as struggled (FR20).
 */
export default function FlashcardGame({ words, onComplete, onMarkStruggled }) {
  const [deck, setDeck] = useState(() => shuffle(words))
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [knownCount, setKnownCount] = useState(0)
  const [done, setDone] = useState(false)

  const card = deck[index]
  const progress = index / deck.length

  function handleKnow() {
    setKnownCount((n) => n + 1)
    advance()
  }

  function handleDontKnow() {
    onMarkStruggled(card.id)
    advance()
  }

  function advance() {
    setIsFlipped(false)
    if (index + 1 >= deck.length) {
      setDone(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (done) {
    const xp = knownCount * XP_PER_CARD
    return (
      <div className="flex flex-col items-center gap-6 text-center py-12">
        <div className="text-5xl">🎴</div>
        <h3 className="text-xl font-bold text-gray-900">Flashcards complete!</h3>
        <div className="grid grid-cols-2 gap-4 w-64">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-700">{knownCount}</p>
            <p className="text-xs text-green-600">knew it</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-2xl font-bold text-amber-700">{deck.length - knownCount}</p>
            <p className="text-xs text-amber-600">to review</p>
          </div>
        </div>
        <p className="text-sm text-indigo-600 font-medium">+{xp} XP earned</p>
        <button
          onClick={() => onComplete(xp)}
          className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Card {index + 1} of {deck.length}</span>
          <span>{knownCount} known</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setIsFlipped((f) => !f)}
        className="w-full max-w-md cursor-pointer rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow min-h-52 flex flex-col items-center justify-center p-8 select-none"
      >
        {!isFlipped ? (
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{card.german}</p>
            {card.article && (
              <p className="text-sm text-indigo-500 mt-1">{card.article}</p>
            )}
            <p className="text-xs text-gray-400 mt-6">Tap to reveal</p>
          </div>
        ) : (
          <div className="text-center flex flex-col gap-3">
            <p className="text-2xl font-semibold text-gray-700">{card.english}</p>
            <p className="text-sm text-gray-500 italic">"{card.contextSentence}"</p>
            <p className="text-xs text-gray-400">{card.contextTranslation}</p>
          </div>
        )}
      </div>

      {/* Actions — only shown after flip */}
      {isFlipped && (
        <div className="flex gap-4 w-full max-w-md">
          <button
            onClick={handleDontKnow}
            className="flex-1 rounded-xl border border-red-200 bg-red-50 py-3 font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            ✗ Review again
          </button>
          <button
            onClick={handleKnow}
            className="flex-1 rounded-xl border border-green-200 bg-green-50 py-3 font-semibold text-green-700 hover:bg-green-100 transition-colors"
          >
            ✓ Got it
          </button>
        </div>
      )}

      {!isFlipped && (
        <p className="text-xs text-gray-300">Click the card to see the translation</p>
      )}
    </div>
  )
}
