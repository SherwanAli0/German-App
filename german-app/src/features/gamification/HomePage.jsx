import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useProfileStore } from '../../stores/profileStore'
import { useGamificationStore, LEVEL_THRESHOLDS, LEVEL_NAMES } from '../../stores/gamificationStore'
import { useCacheStore } from '../../stores/cacheStore'
import { useNotifications } from './useNotifications'
import { getTodayChallenge, isChallengeStale } from './challengeHelpers'
import QuickSession from './QuickSession'
import { getBadge } from './badgeDefinitions'

export default function HomePage() {
  const profile = useProfileStore((s) => s.profile)
  const gam = useGamificationStore((s) => s)
  const grammarCache = useCacheStore((s) => s.grammarCache)
  const vocabCache = useCacheStore((s) => s.vocabularyCache)
  const { notificationsEnabled, requestPermission } = useNotifications()
  const [showQuickSession, setShowQuickSession] = useState(false)

  const levelName = LEVEL_NAMES[gam.level - 1] ?? 'A1'
  const nextThreshold = LEVEL_THRESHOLDS[gam.level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const prevThreshold = LEVEL_THRESHOLDS[gam.level - 1] ?? 0
  const xpProgress = gam.xp - prevThreshold
  const xpNeeded = nextThreshold - prevThreshold
  const levelPct = Math.min(100, Math.round((xpProgress / xpNeeded) * 100))

  const today = new Date().toISOString().split('T')[0]
  const hasActivityToday = gam.lastActivityDate === today
  const streakAtRisk = gam.streak > 0 && !hasActivityToday

  // Init / refresh daily challenge and weekly challenge
  useEffect(() => {
    if (isChallengeStale(gam.dailyChallenge)) {
      gam.setDailyChallenge(getTodayChallenge())
    }
    gam.initWeeklyChallenge()
  }, [])

  const challenge = gam.dailyChallenge
  const weekly = gam.weeklyChallenge
  const weeklyProgress = weekly?.activitiesCompleted?.length ?? 0
  const recentBadges = gam.badges.slice(-3).map(getBadge)

  if (showQuickSession) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-lg px-6 py-8">
          <QuickSession
            onComplete={() => setShowQuickSession(false)}
            onCancel={() => setShowQuickSession(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-8 flex flex-col gap-6">

        {/* ── Greeting ────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Guten Tag, {profile?.name ?? 'Shero'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {hasActivityToday ? "You've practised today — great work." : "Ready for today's German?"}
          </p>
        </div>

        {/* ── Streak-at-risk banner ────────────────────────────────────────── */}
        {streakAtRisk && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-700">🔥 Streak at risk!</p>
              <p className="text-xs text-red-500 mt-0.5">Day {gam.streak} — do at least one activity today to keep it alive.</p>
            </div>
            <button
              onClick={() => setShowQuickSession(true)}
              className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Quick save ⚡
            </button>
          </div>
        )}

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            value={gam.streak}
            label="day streak"
            icon="🔥"
            highlight={gam.streak >= 7}
          />
          <StatCard value={gam.xp} label="total XP" icon="⭐" />
          <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Level</span>
              <span className="text-sm font-bold text-indigo-700">{levelName}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 mt-1">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{xpProgress} / {xpNeeded} XP</p>
          </div>
        </div>

        {/* ── Daily challenge (FR41) ───────────────────────────────────────── */}
        {challenge && (
          <div className={`rounded-2xl border p-5 ${challenge.completed ? 'border-green-200 bg-green-50' : 'border-indigo-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Daily Challenge
                </p>
                <p className="text-sm font-semibold text-gray-800">{challenge.title}</p>
              </div>
              {challenge.completed
                ? <span className="text-xl shrink-0">✅</span>
                : <span className="text-xl shrink-0">🎯</span>
              }
            </div>
            {!challenge.completed && (
              <p className="text-xs text-indigo-500 mt-2">+50 bonus XP on completion</p>
            )}
          </div>
        )}

        {/* ── Weekly challenge (FR42) ──────────────────────────────────────── */}
        {weekly && (
          <div className={`rounded-2xl border p-5 ${weekly.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Weekly Challenge
            </p>
            <p className="text-sm font-semibold text-gray-800">{weekly.title}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{weeklyProgress} / {weekly.target} activities</span>
                {weekly.completed && <span className="text-green-600 font-medium">Complete! 🏆</span>}
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(100, (weeklyProgress / weekly.target) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Feature shortcuts ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard to="/conversation" icon="🎙️" label="Conversation" desc="Talk to Max" color="indigo" />
          <FeatureCard to="/vocabulary" icon="📚" label="Vocabulary" desc={`${vocabCache?.items?.length ?? 0} words this week`} color="violet" />
          <FeatureCard to="/grammar" icon="📖" label="Grammar" desc={`${grammarCache?.visitedTopicIds?.length ?? 0} topics visited`} color="sky" />
          <FeatureCard to="/reading" icon="🗞️" label="Reading" desc="Articles + read-aloud" color="emerald" />
        </div>

        {/* ── Recent badges ────────────────────────────────────────────────── */}
        {recentBadges.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500">Recent badges</p>
              <Link to="/progress" className="text-xs text-indigo-500 hover:underline">View all →</Link>
            </div>
            <div className="flex gap-3">
              {recentBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-3xl">{badge.icon}</span>
                  <span className="text-xs font-medium text-gray-600">{badge.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Notifications opt-in ─────────────────────────────────────────── */}
        {!notificationsEnabled && gam.streak >= 1 && (
          <button
            onClick={requestPermission}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 text-left"
          >
            🔔 <strong>Enable notifications</strong> — get a reminder before your streak breaks at midnight.
          </button>
        )}

      </div>
    </div>
  )
}

function StatCard({ value, label, icon, highlight }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-1 ${highlight ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'}`}>
      <span className="text-xl">{icon}</span>
      <p className={`text-2xl font-bold ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}

function FeatureCard({ to, icon, label, desc, color }) {
  const colors = {
    indigo: 'border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200',
    violet: 'border-violet-100 hover:bg-violet-50 hover:border-violet-200',
    sky: 'border-sky-100 hover:bg-sky-50 hover:border-sky-200',
    emerald: 'border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200',
  }
  return (
    <Link
      to={to}
      className={`rounded-2xl border bg-white p-4 flex flex-col gap-1 transition-colors ${colors[color]}`}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-400">{desc}</p>
    </Link>
  )
}
