import { useState, useEffect, useRef } from 'react'
import { useVoiceStore } from '../../stores/voiceStore'
import { startListening, stopListening, speak, stopSpeaking } from '../../services/voiceService'
import { compareSentence, wordMatchesExpected } from './readingHelpers'

const MAX_RETRIES = 3 // FR35: max attempts per flagged word

export function useReadAloud(sentences) {
  const voiceStore = useVoiceStore()

  // ── Phase state machine ─────────────────────────────────────────────────────
  // idle → reading → checking → correcting → done
  const [phase, setPhase] = useState('idle')
  const [sentenceIndex, setSentenceIndex] = useState(0)

  // Current sentence correction state
  const [flaggedWords, setFlaggedWords] = useState([])   // [{word, tokenIndex}]
  const [flagWordIdx, setFlagWordIdx] = useState(0)      // which flagged word we're on
  const [retryCount, setRetryCount] = useState(0)
  const [lastRepeatResult, setLastRepeatResult] = useState(null) // null | 'correct' | 'incorrect'

  // Accumulate all flagged words for the report (FR36)
  const [reportWords, setReportWords] = useState([]) // [{word, retries, passed}]

  const [done, setDone] = useState(false)

  const currentSentence = sentences[sentenceIndex] ?? ''
  const currentFlaggedWord = flaggedWords[flagWordIdx] ?? null
  const isLastSentence = sentenceIndex >= sentences.length - 1

  // ── Start read-aloud ────────────────────────────────────────────────────────
  function startReadAloud() {
    setSentenceIndex(0)
    setReportWords([])
    setDone(false)
    setPhase('ready')
    voiceStore.setStatus('idle')
  }

  // ── User taps mic to read a sentence ────────────────────────────────────────
  function handleReadSentence() {
    if (phase !== 'ready') return
    setPhase('reading')
    voiceStore.setStatus('listening')
    voiceStore.setTranscript('')

    startListening({
      lang: 'de-DE',
      onInterim: (t) => voiceStore.setInterimTranscript(t),
      onFinal: (transcript) => {
        voiceStore.setTranscript(transcript)
        voiceStore.setInterimTranscript('')
        stopListening()
        voiceStore.setStatus('idle')
        checkSentence(transcript)
      },
      onError: (err) => {
        voiceStore.setError(err)
        setPhase('ready')
      },
    })
  }

  function checkSentence(transcript) {
    setPhase('checking')
    const flagged = compareSentence(currentSentence, transcript)

    if (flagged.length === 0) {
      advanceSentence()
    } else {
      setFlaggedWords(flagged)
      setFlagWordIdx(0)
      setRetryCount(0)
      setLastRepeatResult(null)
      setPhase('correcting')
      // Play the first flagged word immediately (FR34)
      playFlaggedWord(flagged[0].word)
    }
  }

  // ── Play the correct pronunciation (FR34) ───────────────────────────────────
  function playFlaggedWord(word) {
    voiceStore.setStatus('speaking')
    speak({
      text: word,
      lang: 'de-DE',
      rate: 0.8,
      onEnd: () => {
        voiceStore.setStatus('idle')
        setPhase('waiting-repeat')
      },
      onError: () => {
        voiceStore.setStatus('idle')
        setPhase('waiting-repeat')
      },
    })
  }

  // ── User repeats the flagged word ────────────────────────────────────────────
  function handleRepeatWord() {
    if (phase !== 'waiting-repeat') return
    setPhase('listening-repeat')
    voiceStore.setStatus('listening')

    startListening({
      lang: 'de-DE',
      onInterim: () => {},
      onFinal: (transcript) => {
        stopListening()
        voiceStore.setStatus('idle')
        verifyRepeat(transcript)
      },
      onError: () => {
        voiceStore.setStatus('idle')
        setPhase('waiting-repeat')
      },
    })
  }

  function verifyRepeat(transcript) {
    const isCorrect = wordMatchesExpected(currentFlaggedWord.word, transcript)
    setLastRepeatResult(isCorrect ? 'correct' : 'incorrect')

    if (isCorrect) {
      // Record this word as passed
      setReportWords((prev) => [
        ...prev,
        { word: currentFlaggedWord.word, retries: retryCount + 1, passed: true },
      ])
      advanceFlaggedWord()
    } else if (retryCount + 1 >= MAX_RETRIES) {
      // Exhausted retries — log as failed and move on (FR35)
      setReportWords((prev) => [
        ...prev,
        { word: currentFlaggedWord.word, retries: MAX_RETRIES, passed: false },
      ])
      advanceFlaggedWord()
    } else {
      setRetryCount((n) => n + 1)
      setPhase('correcting')
      // Play the word again
      setTimeout(() => playFlaggedWord(currentFlaggedWord.word), 600)
    }
  }

  function advanceFlaggedWord() {
    const nextIdx = flagWordIdx + 1
    if (nextIdx >= flaggedWords.length) {
      // All flagged words for this sentence handled
      advanceSentence()
    } else {
      setFlagWordIdx(nextIdx)
      setRetryCount(0)
      setLastRepeatResult(null)
      setPhase('correcting')
      playFlaggedWord(flaggedWords[nextIdx].word)
    }
  }

  function advanceSentence() {
    setFlaggedWords([])
    setFlagWordIdx(0)
    setLastRepeatResult(null)

    if (isLastSentence) {
      setPhase('done')
      setDone(true)
      voiceStore.reset()
    } else {
      setSentenceIndex((i) => i + 1)
      setPhase('ready')
    }
  }

  // ── Replay current flagged word ──────────────────────────────────────────────
  function handleReplay() {
    if (currentFlaggedWord) playFlaggedWord(currentFlaggedWord.word)
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopListening()
      stopSpeaking()
      voiceStore.reset()
    }
  }, [])

  // ── Report (FR36) ────────────────────────────────────────────────────────────
  const report = {
    totalSentences: sentences.length,
    flaggedWords: reportWords,
    flaggedCount: reportWords.length,
    passedCount: reportWords.filter((w) => w.passed).length,
    totalWords: sentences.join(' ').split(/\s+/).length,
    score: reportWords.length === 0
      ? 100
      : Math.round(
          ((sentences.join(' ').split(/\s+/).length - reportWords.filter((w) => !w.passed).length) /
            sentences.join(' ').split(/\s+/).length) *
            100
        ),
  }

  return {
    phase,
    sentenceIndex,
    currentSentence,
    sentences,
    flaggedWords,
    currentFlaggedWord,
    retryCount,
    lastRepeatResult,
    done,
    report,
    voiceStatus: voiceStore.status,
    interimTranscript: voiceStore.interimTranscript,
    transcript: voiceStore.transcript,
    startReadAloud,
    handleReadSentence,
    handleRepeatWord,
    handleReplay,
  }
}
