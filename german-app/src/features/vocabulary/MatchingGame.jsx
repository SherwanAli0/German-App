import { useState } from 'react'
import { shuffle } from './vocabularyHelpers'

const XP_COMPLETE = 20

/**
 * FR19 — Word-matching game: click a German word then its English translation.
 * Matched pairs disappear; wrong pairs flash red.
 */
export default function MatchingGame({ words, onComplete, onMarkStruggled }) {
  const [germanCol] = useState(() => shuffle(words.map((w) => ({ id: w.id, text: w.german }))))
  const [englishCol] = useState(() => shuffle(words.map((w) => ({ id: w.id, text: w.english }))))

  const [selectedGerman, setSelectedGerman] = useState(null) // id
  const [selectedEnglish, setSelectedEnglish] = useState(null) // id
  const [matched, setMatched] = useState(new Set())
  const [wrong, setWrong] = useState(new Set()) // ids flashing red this round
  const [done, setDone] = useState(false)
  const [mistakes, setMistakes] = useState(0)

  function handleSelectGerman(id) {
    if (matched.has(id) || wrong.has(id)) return
    setSelectedGerman(id)
    if (selectedEnglish !== null) checkMatch(id, selectedEnglish)
  }

  function handleSelectEnglish(id) {
    if (matched.has(id) || wrong.has(id)) return
    setSelectedEnglish(id)
    if (selectedGerman !== null) checkMatch(selectedGerman, id)
  }

  function checkMatch(gId, eId) {
    if (gId === eId) {
      // Correct match
      const next = new Set(matched)
      next.add(gId)
      setMatched(next)
      setSelectedGerman(null)
      setSelectedEnglish(null)
      if (next.size === words.length) setDone(true)
    } else {
      // Wrong match
      setMistakes((m) => m + 1)
      onMarkStruggled(gId)
      setWrong(new Set([gId, eId]))
      setTimeout(() => {
        setWrong(new Set())
        setSelectedGerman(null)
        setSelectedEnglish(null)
      }, 700)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 text-center py-12">
        <div className="text-5xl">🎯</div>
        <h3 className="text-xl font-bold text-gray-900">All matched!</h3>
        <div className="grid grid-cols-2 gap-4 w-64">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-700">{words.length}</p>
            <p className="text-xs text-green-600">matched</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-2xl font-bold text-amber-700">{mistakes}</p>
            <p className="text-xs text-amber-600">mistakes</p>
          </div>
        </div>
        <p className="text-sm text-indigo-600 font-medium">+{XP_COMPLETE} XP earned</p>
        <button
          onClick={() => onComplete(XP_COMPLETE)}
          className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 text-center">
        Match each German word to its English translation.
        {mistakes > 0 && <span className="ml-2 text-amber-500">{mistakes} mistake{mistakes !== 1 ? 's' : ''}</span>}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* German column */}
        <div className="flex flex-col gap-2">
          {germanCol.map(({ id, text }) => (
            <MatchTile
              key={id}
              text={text}
              isSelected={selectedGerman === id}
              isMatched={matched.has(id)}
              isWrong={wrong.has(id)}
              onClick={() => handleSelectGerman(id)}
            />
          ))}
        </div>

        {/* English column */}
        <div className="flex flex-col gap-2">
          {englishCol.map(({ id, text }) => (
            <MatchTile
              key={id}
              text={text}
              isSelected={selectedEnglish === id}
              isMatched={matched.has(id)}
              isWrong={wrong.has(id)}
              onClick={() => handleSelectEnglish(id)}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        {matched.size} / {words.length} matched
      </p>
    </div>
  )
}

function MatchTile({ text, isSelected, isMatched, isWrong, onClick }) {
  let classes = 'rounded-xl border px-3 py-2.5 text-sm font-medium text-center cursor-pointer transition-all select-none '

  if (isMatched) {
    classes += 'border-green-200 bg-green-50 text-green-600 line-through opacity-50 cursor-default'
  } else if (isWrong) {
    classes += 'border-red-300 bg-red-50 text-red-600 scale-95'
  } else if (isSelected) {
    classes += 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm scale-105'
  } else {
    classes += 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
  }

  return (
    <button className={classes} onClick={isMatched ? undefined : onClick} disabled={isMatched}>
      {text}
    </button>
  )
}
