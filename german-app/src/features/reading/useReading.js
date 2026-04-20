import { useState, useEffect } from 'react'
import { useProfileStore } from '../../stores/profileStore'
import { useCacheStore } from '../../stores/cacheStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { generate } from '../../services/apiClient'
import { getCurrentWeekKey, parseJSONArray } from '../../services/cacheService'
import { buildArticleGenerationPrompt, splitIntoSentences } from './readingHelpers'

export function useReading() {
  const profile = useProfileStore((s) => s.profile)
  const cacheStore = useCacheStore()
  const addXP = useGamificationStore((s) => s.addXP)

  const [loadStatus, setLoadStatus] = useState('idle')
  const [loadError, setLoadError] = useState(null)
  const [activeArticle, setActiveArticle] = useState(null)
  const [mode, setMode] = useState('list') // list | read | readaloud

  const weekKey = getCurrentWeekKey()
  const isStale = cacheStore.isArticleStale(weekKey)
  const articles = (cacheStore.articleCache?.items ?? []).map((a) => ({
    ...a,
    sentences: splitIntoSentences(a.text),
  }))

  // ── Load / generate on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!isStale) {
      setLoadStatus('ready')
      return
    }
    generateArticles()
  }, [weekKey])

  async function generateArticles() {
    setLoadStatus('loading')
    setLoadError(null)
    try {
      const prompt = buildArticleGenerationPrompt(profile)
      const { text } = await generate({ prompt, maxTokens: 2000 })
      const items = parseJSONArray(text)
      cacheStore.setArticleCache({ weekKey, items })
      setLoadStatus('ready')
    } catch (err) {
      setLoadError(err.message ?? 'Failed to generate articles.')
      setLoadStatus('error')
    }
  }

  function handleOpenArticle(article) {
    setActiveArticle(article)
    setMode('read')
  }

  function handleStartReadAloud() {
    setMode('readaloud')
  }

  function handleFinishReading(xp) {
    addXP(xp, 'reading_session')
    setMode('read')
  }

  function handleBack() {
    if (mode === 'readaloud') {
      setMode('read')
    } else {
      setActiveArticle(null)
      setMode('list')
    }
  }

  return {
    loadStatus,
    loadError,
    articles,
    activeArticle,
    mode,
    handleOpenArticle,
    handleStartReadAloud,
    handleFinishReading,
    handleBack,
    handleRetryGeneration: generateArticles,
  }
}
