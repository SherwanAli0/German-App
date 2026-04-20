import { useState, useEffect, useRef, useCallback } from 'react'
import { useProfileStore } from '../../stores/profileStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useVoiceStore } from '../../stores/voiceStore'
import { useCacheStore } from '../../stores/cacheStore'
import { streamChat, generate } from '../../services/apiClient'
import {
  detectCapabilities,
  startListening,
  stopListening,
  speak,
  stopSpeaking,
} from '../../services/voiceService'
import {
  buildConversationSystemPrompt,
  buildGrammarCheckPrompt,
  buildRepeatCheckPrompt,
  pickRandomTopic,
  buildOpeningMessage,
} from './conversationHelpers'

const XP_PER_TURN = 5
const ROLLING_CONTEXT_TURNS = 6 // last 3 exchanges (user + ai)

export function useConversation() {
  const profile = useProfileStore((s) => s.profile)
  const grammarCache = useCacheStore((s) => s.grammarCache)
  const { addTurn, incrementCorrections, startSession, endSession, resetSession, turns, correctionCount } =
    useSessionStore((s) => s)
  const addXP = useGamificationStore((s) => s.addXP)
  const voiceStore = useVoiceStore()

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [topic, setTopic] = useState(null)
  const [streamingText, setStreamingText] = useState('')      // live AI token buffer
  const [correctionData, setCorrectionData] = useState(null) // { error, rule, corrected, original }
  const [isWaitingForRepeat, setIsWaitingForRepeat] = useState(false)
  const [repeatStatus, setRepeatStatus] = useState(null)     // null | 'correct' | 'incorrect'
  const [repeatHint, setRepeatHint] = useState(null)
  const [sessionSummary, setSessionSummary] = useState(null) // set when session ends
  const [inputText, setInputText] = useState('')             // text fallback

  const abortRef = useRef(null)
  const pendingUserTextRef = useRef(null) // text waiting after correction is resolved

  const isSpeechAvailable = voiceStore.isSpeechAvailable
  const isSynthesisAvailable = voiceStore.isSynthesisAvailable
  const voiceStatus = voiceStore.status
  const fallbackMode = voiceStore.fallbackMode

  // ── Init voice capabilities ─────────────────────────────────────────────────
  useEffect(() => {
    const { speechAvailable, synthesisAvailable } = detectCapabilities()
    voiceStore.setSpeechAvailable(speechAvailable)
    voiceStore.setSynthesisAvailable(synthesisAvailable)
    if (!speechAvailable) voiceStore.setFallbackMode('text-input')
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getRecentContext() {
    return turns.slice(-ROLLING_CONTEXT_TURNS)
  }

  function getRecentGrammarTopics() {
    const visited = grammarCache?.visitedTopicIds ?? []
    const allTopics = grammarCache?.topics ?? []
    return visited
      .slice(-3) // last 3 visited topics
      .map((id) => allTopics.find((t) => t.id === id)?.title)
      .filter(Boolean)
  }

  function speakText(text) {
    if (!isSynthesisAvailable) return // NFR14: silently skip, text is already shown
    voiceStore.setStatus('speaking')
    speak({
      text,
      lang: 'de-DE',
      onEnd: () => voiceStore.setStatus('idle'),
      onError: () => voiceStore.setStatus('idle'), // NFR14: synthesis failure → show text, continue
    })
  }

  // ── Stream AI response ──────────────────────────────────────────────────────

  function streamAIResponse(userText, systemPrompt) {
    voiceStore.setStatus('processing')
    setStreamingText('')

    const messages = [{ role: 'user', content: userText }]
    let accumulated = ''

    abortRef.current = streamChat({
      systemPrompt,
      messages,
      maxTokens: 200,
      onToken: (token) => {
        accumulated += token
        setStreamingText(accumulated)
      },
      onDone: () => {
        setStreamingText('')
        addTurn('assistant', accumulated)
        addXP(XP_PER_TURN, 'conversation_turn')
        speakText(accumulated)
      },
      onError: (err) => {
        voiceStore.setError(err)
        setStreamingText('')
      },
    })
  }

  // ── Grammar check + main turn handler ───────────────────────────────────────

  async function processTurn(userText) {
    if (!userText.trim()) return

    voiceStore.setStatus('transcribing')
    addTurn('user', userText)

    // Grammar check (FR8)
    let checkResult = { hasError: false }
    try {
      voiceStore.setStatus('processing')
      const { text: rawCheck } = await generate({
        prompt: buildGrammarCheckPrompt(userText),
        maxTokens: 150,
      })
      const match = rawCheck.match(/\{[\s\S]*\}/)
      if (match) checkResult = JSON.parse(match[0])
    } catch {
      // Grammar check failure is non-fatal; continue conversation
    }

    if (checkResult.hasError) {
      // FR8, FR9: show inline correction overlay
      incrementCorrections()
      setCorrectionData({
        original: userText,
        error: checkResult.error,
        rule: checkResult.rule,
        corrected: checkResult.corrected,
      })
      setIsWaitingForRepeat(true)
      setRepeatStatus(null)
      pendingUserTextRef.current = checkResult.corrected // resume with corrected text
      voiceStore.setStatus('idle')
    } else {
      // No error — go straight to AI response (FR11)
      const systemPrompt = buildConversationSystemPrompt(profile, topic, getRecentContext(), getRecentGrammarTopics())
      streamAIResponse(userText, systemPrompt)
    }
  }

  // ── Repeat verification (FR10) ───────────────────────────────────────────────

  async function processRepeat(repeatText) {
    if (!correctionData) return
    voiceStore.setStatus('processing')

    let isCorrect = false
    try {
      const { text: raw } = await generate({
        prompt: buildRepeatCheckPrompt(correctionData.corrected, repeatText),
        maxTokens: 80,
      })
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        const result = JSON.parse(match[0])
        isCorrect = result.isCorrect
        if (!isCorrect) setRepeatHint(result.hint ?? null)
      }
    } catch {
      isCorrect = true // network failure — give benefit of the doubt
    }

    if (isCorrect) {
      setRepeatStatus('correct')
      setTimeout(() => {
        setCorrectionData(null)
        setIsWaitingForRepeat(false)
        setRepeatStatus(null)
        setRepeatHint(null)
        // Resume conversation with the corrected sentence
        const systemPrompt = buildConversationSystemPrompt(profile, topic, getRecentContext(), getRecentGrammarTopics())
        streamAIResponse(pendingUserTextRef.current ?? correctionData.corrected, systemPrompt)
        pendingUserTextRef.current = null
      }, 1200)
    } else {
      setRepeatStatus('incorrect')
      voiceStore.setStatus('idle')
    }
  }

  // ── Voice input ─────────────────────────────────────────────────────────────

  function handleStartListening() {
    if (voiceStatus !== 'idle') return
    voiceStore.setStatus('listening')
    voiceStore.setTranscript('')

    startListening({
      lang: 'de-DE',
      onInterim: (text) => voiceStore.setInterimTranscript(text),
      onFinal: (text) => {
        voiceStore.setTranscript(text)
        voiceStore.setInterimTranscript('')
        stopListening()
        if (isWaitingForRepeat) {
          processRepeat(text)
        } else {
          processTurn(text)
        }
      },
      onError: (err) => {
        if (err.code === 'MIC_DENIED') voiceStore.setFallbackMode('text-input')
        voiceStore.setError(err)
      },
    })
  }

  function handleStopListening() {
    stopListening()
    voiceStore.setStatus('idle')
  }

  // ── Text input (fallback, FR7) ───────────────────────────────────────────────

  function handleTextSubmit() {
    if (!inputText.trim()) return
    const text = inputText.trim()
    setInputText('')
    if (isWaitingForRepeat) {
      processRepeat(text)
    } else {
      processTurn(text)
    }
  }

  // ── Session lifecycle ───────────────────────────────────────────────────────

  function handleStartSession() {
    resetSession()
    startSession()
    const newTopic = pickRandomTopic(profile)
    setTopic(newTopic)
    setIsSessionActive(true)
    setSessionSummary(null)

    const opening = buildOpeningMessage(newTopic, profile)
    addTurn('assistant', opening)
    speakText(opening)
  }

  function handleNewTopic() {
    // FR13
    const newTopic = pickRandomTopic(profile, topic)
    setTopic(newTopic)
    const message = `Kein Problem! Neues Thema: "${newTopic}". Los geht's!`
    addTurn('assistant', message)
    speakText(message)
  }

  function handleEndSession() {
    // FR15
    stopSpeaking()
    stopListening()
    voiceStore.reset()
    endSession()
    setIsSessionActive(false)
    setCorrectionData(null)
    setIsWaitingForRepeat(false)

    const xpEarned = turns.filter((t) => t.role === 'user').length * XP_PER_TURN
    setSessionSummary({
      turnCount: turns.filter((t) => t.role === 'user').length,
      correctionCount,
      xpEarned,
      topic,
    })
    addXP(xpEarned, 'conversation_session')
  }

  function handleDismissSummary() {
    setSessionSummary(null)
  }

  // ── Abort on unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      stopListening()
      stopSpeaking()
      voiceStore.reset()
    }
  }, [])

  return {
    // state
    isSessionActive,
    topic,
    turns,
    streamingText,
    correctionData,
    isWaitingForRepeat,
    repeatStatus,
    repeatHint,
    sessionSummary,
    voiceStatus,
    isSpeechAvailable,
    isSynthesisAvailable,
    fallbackMode,
    correctionCount,
    inputText,
    transcript: voiceStore.transcript,
    interimTranscript: voiceStore.interimTranscript,
    voiceError: voiceStore.error,
    // actions
    setInputText,
    handleStartListening,
    handleStopListening,
    handleTextSubmit,
    handleStartSession,
    handleNewTopic,
    handleEndSession,
    handleDismissSummary,
  }
}
