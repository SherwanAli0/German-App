import { useState, useEffect } from 'react'
import { useProfileStore } from '../../stores/profileStore'
import { useCacheStore } from '../../stores/cacheStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { generate } from '../../services/apiClient'
import { getCurrentWeekKey, parseJSONArray } from '../../services/cacheService'
import { buildVocabGenerationPrompt } from './vocabularyHelpers'

export function useVocabulary() {
  const profile = useProfileStore((s) => s.profile)
  const cacheStore = useCacheStore()
  const addXP = useGamificationStore((s) => s.addXP)

  const [loadStatus, setLoadStatus] = useState('idle') // idle | loading | ready | error
  const [loadError, setLoadError] = useState(null)
  const [activeGame, setActiveGame] = useState(null) // null | 'flashcard' | 'fill' | 'match'

  const weekKey = getCurrentWeekKey()
  const isStale = cacheStore.isVocabStale(weekKey)
  const cache = cacheStore.vocabularyCache
  const words = cache?.items ?? []
  const struggledIds = cache?.struggledWordIds ?? []
  const struggledWords = words.filter((w) => struggledIds.includes(w.id))

  // ── Load / generate vocab on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!isStale) {
      setLoadStatus('ready')
      return
    }
    generateVocab()
  }, [weekKey])

  async function generateVocab() {
    setLoadStatus('loading')
    setLoadError(null)
    try {
      const prompt = buildVocabGenerationPrompt(profile)
      const { text } = await generate({ prompt, maxTokens: 1200 })
      const items = parseJSONArray(text)
      cacheStore.setVocabularyCache({ weekKey, items })
      setLoadStatus('ready')
    } catch (err) {
      setLoadError(err.message ?? 'Failed to generate vocabulary. Is the proxy running?')
      setLoadStatus('error')
    }
  }

  function handleMarkStruggled(wordId) {
    cacheStore.markWordStruggled(wordId)
  }

  function handleGameComplete(xp) {
    addXP(xp, 'vocabulary_session')
    setActiveGame(null)
  }

  return {
    loadStatus,
    loadError,
    words,
    struggledWords,
    activeGame,
    weekKey,
    setActiveGame,
    handleMarkStruggled,
    handleGameComplete,
    handleRetryGeneration: generateVocab,
  }
}
