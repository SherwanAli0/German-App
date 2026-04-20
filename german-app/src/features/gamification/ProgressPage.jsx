import { useProfileStore } from '../../stores/profileStore'
import { useGamificationStore, LEVEL_THRESHOLDS, LEVEL_NAMES } from '../../stores/gamificationStore'
import { useCacheStore } from '../../stores/cacheStore'
import { getBadge } from './badgeDefinitions'

export default function ProgressPage() {
  const profile = useProfileStore((s) => s.profile)
  const gam = useGamificationStore((s) => s)
  const cacheStore = useCacheStore()

  const levelName = LEVEL_NAMES[gam.level - 1] ?? 'A1'
  const nextLevelName = LEVEL_NAMES[gam.level] ?? '—'
  const nextThreshold = LEVEL_THRESHOLDS[gam.level] ?? gam.xp
  const prevThreshold = LEVEL_THRESHOLDS[gam.level - 1] ?? 0
  const xpProgress = gam.xp - prevThreshold
  const xpNeeded = nextThreshold - prevThreshold
  const levelPct = Math.min(100, Math.round((xpProgress / xpNeeded) * 100))

  const vocabCoverage = cacheStore.vocabularyCache?.items?.length ?? 0
  const grammarVisited = cacheStore.grammarCache?.visitedTopicIds?.length ?? 0
  const grammarTotal = cacheStore.grammarCache?.topics?.length ?? 16

  // Last 7 days XP for chart
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const date = d.toISOString().split('T')[0]
    const entry = gam.xpHistory.find((h) => h.date === date)
    return { date, xp: entry?.xp ?? 0, label: d.toLocaleDateString('en', { weekday: 'short' }) }
  })
  const maxXP = Math.max(...last7.map((d) => d.xp), 1)

  // Last 30 days activity heatmap
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    const date = d.toISOString().split('T')[0]
    const active = gam.xpHistory.some((h) => h.date === date && h.xp > 0)
    return { date, active }
  })

  // ── Data export (FR49) ────────────────────────────────────────────────────
  function handleExport() {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      profile: profile ?? {},
      gamification: {
        xp: gam.xp,
        level: gam.level,
        levelName,
        streak: gam.streak,
        badges: gam.badges,
        xpHistory: gam.xpHistory,
      },
      vocabulary: cacheStore.vocabularyCache ?? {},
      grammar: {
        version: cacheStore.grammarCache?.version,
        visitedTopicIds: cacheStore.grammarCache?.visitedTopicIds ?? [],
      },
      articles: cacheStore.articleCache ?? {},
    }
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `german-app-backup-${today.toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-8 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
          <button
            onClick={handleExport}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ↓ Export backup
          </button>
        </div>

        {/* Level progression (FR39) */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Level</h2>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-indigo-700">{levelName}</span>
            <span className="text-sm text-gray-400">→ {nextLevelName}</span>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{gam.xp} XP total</span>
              <span>{xpProgress} / {xpNeeded} to next level</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${levelPct}%` }}
              />
            </div>
          </div>
        </section>

        {/* Streak + activity heatmap */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Streak</h2>
            <span className="text-2xl font-bold text-orange-500">🔥 {gam.streak} days</span>
          </div>
          {/* 30-day heatmap */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Last 30 days</p>
            <div className="flex flex-wrap gap-1">
              {last30.map(({ date, active }) => (
                <div
                  key={date}
                  title={date}
                  className={`h-4 w-4 rounded-sm ${active ? 'bg-indigo-500' : 'bg-gray-100'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* XP over time — 7-day bar chart */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">XP this week</h2>
          <div className="flex items-end gap-2 h-24">
            {last7.map(({ date, xp, label }) => {
              const pct = (xp / maxXP) * 100
              const today = new Date().toISOString().split('T')[0]
              return (
                <div key={date} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{xp > 0 ? xp : ''}</span>
                  <div className="w-full flex flex-col justify-end" style={{ height: '64px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all ${date === today ? 'bg-indigo-600' : 'bg-indigo-200'}`}
                      style={{ height: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <span className={`text-xs ${date === today ? 'font-bold text-indigo-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Coverage stats */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Coverage</h2>
          <CoverageRow label="Vocabulary words this week" value={vocabCoverage} max={10} color="violet" />
          <CoverageRow label="Grammar topics visited" value={grammarVisited} max={grammarTotal} color="sky" />
        </section>

        {/* Badges (FR40) */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Badges — {gam.badges.length} earned
          </h2>
          {gam.badges.length === 0 && (
            <p className="text-sm text-gray-400">Complete activities to earn badges.</p>
          )}
          <div className="grid grid-cols-3 gap-4">
            {gam.badges.map((id) => {
              const badge = getBadge(id)
              return (
                <div key={id} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-3xl">{badge.icon}</span>
                  <p className="text-xs font-semibold text-gray-700">{badge.title}</p>
                  <p className="text-xs text-gray-400">{badge.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}

function CoverageRow({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100))
  const colors = {
    violet: 'bg-violet-400',
    sky: 'bg-sky-400',
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${colors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
