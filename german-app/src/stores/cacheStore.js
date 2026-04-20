import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCacheStore = create(
  persist(
    (set, get) => ({
      // state
      vocabularyCache: null,    // { weekKey: string, items: [], generatedAt: string }
      grammarCache: null,       // { version: string, topics: [], generatedAt: string }
      articleCache: null,       // { weekKey: string, articles: [], generatedAt: string }

      // actions
      setVocabularyCache: (data) => set({ vocabularyCache: { struggledWordIds: [], ...data, generatedAt: new Date().toISOString() } }),

      markWordStruggled: (wordId) =>
        set((s) => {
          if (!s.vocabularyCache) return s
          const current = s.vocabularyCache.struggledWordIds ?? []
          if (current.includes(wordId)) return s
          return { vocabularyCache: { ...s.vocabularyCache, struggledWordIds: [...current, wordId] } }
        }),
      setGrammarCache: (data) => set({ grammarCache: { visitedTopicIds: [], ...data, generatedAt: new Date().toISOString() } }),

      markTopicVisited: (topicId) =>
        set((s) => {
          if (!s.grammarCache) return s
          const visited = s.grammarCache.visitedTopicIds ?? []
          if (visited.includes(topicId)) return s
          return { grammarCache: { ...s.grammarCache, visitedTopicIds: [...visited, topicId] } }
        }),
      setArticleCache: (data) => set({ articleCache: { ...data, generatedAt: new Date().toISOString() } }),

      clearCache: () => set({ vocabularyCache: null, grammarCache: null, articleCache: null }),

      isVocabStale: (weekKey) => {
        const cache = get().vocabularyCache
        return !cache || cache.weekKey !== weekKey
      },
      isGrammarStale: (versionHash) => {
        const cache = get().grammarCache
        return !cache || cache.version !== versionHash
      },
      isArticleStale: (weekKey) => {
        const cache = get().articleCache
        return !cache || cache.weekKey !== weekKey
      },
    }),
    { name: 'german_app_v1.cache' }
  )
)
