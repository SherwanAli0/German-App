import { useReading } from './useReading'
import ArticleReader from './ArticleReader'
import ReadAloudMode from './ReadAloudMode'

const LEVEL_COLORS = {
  A2: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B1: 'bg-violet-100 text-violet-700 border-violet-200',
  B2: 'bg-orange-100 text-orange-700 border-orange-200',
}

export default function ReadingPage() {
  const {
    loadStatus,
    loadError,
    articles,
    activeArticle,
    mode,
    handleOpenArticle,
    handleStartReadAloud,
    handleFinishReading,
    handleBack,
    handleRetryGeneration,
  } = useReading()

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loadStatus === 'idle' || loadStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Generating this week's articles…</p>
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (loadStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-red-600">Couldn't load articles</p>
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

  // ── Read-aloud mode ─────────────────────────────────────────────────────────
  if (mode === 'readaloud' && activeArticle) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <ReadAloudMode
            article={activeArticle}
            onComplete={handleFinishReading}
            onBack={handleBack}
          />
        </div>
      </div>
    )
  }

  // ── Article reader ──────────────────────────────────────────────────────────
  if (mode === 'read' && activeArticle) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <ArticleReader
            article={activeArticle}
            onStartReadAloud={handleStartReadAloud}
            onBack={handleBack}
          />
        </div>
      </div>
    )
  }

  // ── Article list ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reading</h1>
          <p className="mt-1 text-sm text-gray-500">
            {articles.length} articles this week — read, answer questions, then practise pronunciation.
          </p>
        </div>

        {articles.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No articles cached yet.</div>
        )}

        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <button
              key={article.id}
              onClick={() => handleOpenArticle(article)}
              className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 text-left hover:border-indigo-200 hover:bg-indigo-50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LEVEL_COLORS[article.level] ?? ''}`}>
                  {article.level}
                </span>
                <span className="text-xs text-gray-400">{article.topic}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-800 group-hover:text-indigo-700">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">{article.text}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                <span>{article.sentences?.length ?? 0} sentences</span>
                <span>{article.questions?.length ?? 0} questions</span>
                <span className="text-indigo-400">🎙️ Read-aloud available</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
