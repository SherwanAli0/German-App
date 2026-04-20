import { useState, useEffect, useMemo } from 'react'
import { useCacheStore } from '../../stores/cacheStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { generate } from '../../services/apiClient'
import { parseJSONArray } from '../../services/cacheService'
import { buildGrammarBatchPrompt, mergeTopicContent } from './grammarHelpers'
import topics, { GRAMMAR_VERSION } from './grammarTopics'

export function useGrammar() {
  const cacheStore = useCacheStore()
  const addXP = useGamificationStore((s) => s.addXP)

  const [loadStatus, setLoadStatus] = useState('idle')  // idle | loading | ready | error
  const [loadError, setLoadError] = useState(null)
  const [generationStep, setGenerationStep] = useState(null) // 'batch-0' | 'batch-1'
  const [activeTopic, setActiveTopic] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLevel, setActiveLevel] = useState('all')

  const isStale = cacheStore.isGrammarStale(GRAMMAR_VERSION)
  const cachedTopics = cacheStore.grammarCache?.topics ?? []
  const visitedIds = cacheStore.grammarCache?.visitedTopicIds ?? []

  // ── Load / generate on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!isStale) {
      setLoadStatus('ready')
      return
    }
    generateAllTopics()
  }, [])

  async function generateAllTopics() {
    setLoadStatus('loading')
    setLoadError(null)

    const batches = [
      topics.filter((t) => t.batch === 0),
      topics.filter((t) => t.batch === 1),
    ]

    let allGenerated = []
    try {
      for (let i = 0; i < batches.length; i++) {
        setGenerationStep(`batch-${i}`)
        const prompt = buildGrammarBatchPrompt(batches[i])
        const { text } = await generate({ prompt, maxTokens: 3000 })
        const parsed = parseJSONArray(text)
        allGenerated = [...allGenerated, ...parsed]
      }

      const fullTopics = mergeTopicContent(topics, allGenerated)
      cacheStore.setGrammarCache({ version: GRAMMAR_VERSION, topics: fullTopics })
      setLoadStatus('ready')
      setGenerationStep(null)
    } catch (err) {
      setLoadError(err.message ?? 'Failed to generate grammar content.')
      setLoadStatus('error')
      setGenerationStep(null)
    }
  }

  // ── Filtering (FR22 levels, FR23 search) ────────────────────────────────────
  const filteredTopics = useMemo(() => {
    let result = cachedTopics.length > 0 ? cachedTopics : topics // show stubs if not yet generated

    if (activeLevel !== 'all') {
      result = result.filter((t) => t.level === activeLevel)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.keywords ?? []).some((k) => k.toLowerCase().includes(q))
      )
    }

    return result
  }, [cachedTopics, activeLevel, searchQuery])

  // ── Open a topic card (FR24, FR26) ──────────────────────────────────────────
  function handleOpenTopic(topic) {
    setActiveTopic(topic)
    cacheStore.markTopicVisited(topic.id) // FR26
  }

  function handleCloseTopic() {
    setActiveTopic(null)
  }

  // ── Exercise complete (FR25) ────────────────────────────────────────────────
  function handleExerciseComplete() {
    addXP(8, 'grammar_exercise')
  }

  return {
    loadStatus,
    loadError,
    generationStep,
    filteredTopics,
    activeTopic,
    visitedIds,
    searchQuery,
    activeLevel,
    setSearchQuery,
    setActiveLevel,
    handleOpenTopic,
    handleCloseTopic,
    handleExerciseComplete,
    handleRetryGeneration: generateAllTopics,
  }
}
