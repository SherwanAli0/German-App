import { useGrammar } from './useGrammar'
import TopicCard from './TopicCard'

const LEVELS = ['all', 'A1', 'A2', 'B1', 'B2']

const LEVEL_COLORS = {
  A1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  A2: 'bg-sky-100 text-sky-700 border-sky-200',
  B1: 'bg-violet-100 text-violet-700 border-violet-200',
  B2: 'bg-orange-100 text-orange-700 border-orange-200',
}

export default function GrammarPage() {
  const {
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
    handleRetryGeneration,
  } = useGrammar()

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loadStatus === 'loading') {
    const batchNum = generationStep === 'batch-0' ? 1 : 2
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Generating grammar curriculum… (batch {batchNum}/2)</p>
          <p className="text-xs text-gray-400">This only happens once.</p>
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (loadStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-red-600">Couldn't generate grammar content</p>
          <p className="text-sm text-gray-500">{loadError}</p>
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

  // ── Topic card (FR24) ───────────────────────────────────────────────────────
  if (activeTopic) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <TopicCard
            topic={activeTopic}
            onClose={handleCloseTopic}
            onExerciseComplete={handleExerciseComplete}
          />
        </div>
      </div>
    )
  }

  // ── Topic browser ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Grammar</h1>
          <p className="mt-1 text-sm text-gray-500">{filteredTopics.length} topics</p>
        </div>

        {/* Search (FR23) */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics… (e.g. 'weil', 'dative', 'word order')"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Level filter (FR22) */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeLevel === level
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'
              }`}
            >
              {level === 'all' ? 'All levels' : level}
            </button>
          ))}
        </div>

        {/* Topic list */}
        {filteredTopics.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No topics match "{searchQuery}"
          </div>
        )}

        <div className="flex flex-col gap-2">
          {filteredTopics.map((topic) => {
            const isVisited = visitedIds.includes(topic.id)
            const hasContent = Boolean(topic.explanation)
            return (
              <button
                key={topic.id}
                onClick={() => handleOpenTopic(topic)}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5 text-left hover:border-indigo-200 hover:bg-indigo-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${LEVEL_COLORS[topic.level] ?? ''}`}>
                    {topic.level}
                  </span>
                  <span className="font-medium text-gray-800 group-hover:text-indigo-700 truncate">
                    {topic.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {isVisited && (
                    <span className="text-xs text-gray-400">✓ visited</span>
                  )}
                  {!hasContent && loadStatus !== 'ready' && (
                    <span className="text-xs text-gray-300">generating…</span>
                  )}
                  <span className="text-gray-300 group-hover:text-indigo-400">→</span>
                </div>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
