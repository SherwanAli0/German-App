import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 6000]
export const LEVEL_NAMES = ['A1', 'A2', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2', 'C2+']

function computeLevel(xp) {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return level
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

function getCurrentWeekKey() {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const dayOfWeek = startOfYear.getDay() || 7
  const startOfFirstWeek = new Date(startOfYear)
  if (dayOfWeek !== 1) startOfFirstWeek.setDate(startOfYear.getDate() - dayOfWeek + 1)
  const weekNum = Math.ceil(((now - startOfFirstWeek) / 86400000 + 1) / 7)
  return `${year}-W${String(weekNum).padStart(2, '0')}`
}

export const useGamificationStore = create(
  persist(
    (set, get) => ({
      // ── Core ──────────────────────────────────────────────────────────────
      xp: 0,
      level: 1,
      streak: 0,
      lastActivityDate: null,
      badges: [],

      // ── XP history (last 30 days) for progress chart ──────────────────────
      xpHistory: [], // [{ date: string, xp: number }]

      // ── Challenge tracking ────────────────────────────────────────────────
      dailyChallenge: null,   // { title, type, completed, date }
      weeklyChallenge: null,  // { weekKey, activitiesCompleted: [], target: 5, completed }

      // ── Notifications ─────────────────────────────────────────────────────
      notificationsEnabled: false,

      // ── Actions ───────────────────────────────────────────────────────────

      addXP: (amount, source) => {
        const prev = get()
        const newXP = prev.xp + amount
        const newLevel = computeLevel(newXP)

        // Update XP history — add to today's total
        const today = todayString()
        const history = [...prev.xpHistory]
        const todayIdx = history.findIndex((h) => h.date === today)
        if (todayIdx >= 0) {
          history[todayIdx] = { date: today, xp: history[todayIdx].xp + amount }
        } else {
          history.push({ date: today, xp: amount })
        }
        // Keep last 30 days
        const trimmed = history.slice(-30)

        // Check level-up badge
        const newBadges = [...prev.badges]
        if (newLevel > prev.level && !newBadges.includes('level-up')) {
          newBadges.push('level-up')
        }

        set({ xp: newXP, level: newLevel, xpHistory: trimmed, badges: newBadges })
        get().incrementStreak()
      },

      incrementStreak: () => {
        const today = todayString()
        const { lastActivityDate, streak } = get()
        if (lastActivityDate === today) return
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const newStreak = lastActivityDate === yesterday ? streak + 1 : 1
        set({ streak: newStreak, lastActivityDate: today })

        // Check streak badges
        const { badges } = get()
        const earned = [...badges]
        if (newStreak >= 7 && !earned.includes('streak-7')) earned.push('streak-7')
        if (newStreak >= 30 && !earned.includes('streak-30')) earned.push('streak-30')
        if (earned.length !== badges.length) set({ badges: earned })
      },

      awardBadge: (badgeId) => {
        if (get().badges.includes(badgeId)) return
        set((s) => ({ badges: [...s.badges, badgeId] }))
      },

      // ── Challenges ────────────────────────────────────────────────────────

      setDailyChallenge: (challenge) =>
        set({ dailyChallenge: { ...challenge, date: todayString(), completed: false } }),

      completeDailyChallenge: () =>
        set((s) => ({
          dailyChallenge: s.dailyChallenge ? { ...s.dailyChallenge, completed: true } : null,
        })),

      initWeeklyChallenge: () => {
        const weekKey = getCurrentWeekKey()
        const { weeklyChallenge } = get()
        if (weeklyChallenge?.weekKey === weekKey) return // already current
        set({
          weeklyChallenge: {
            weekKey,
            title: 'Complete 5 different learning activities this week',
            activitiesCompleted: [],
            target: 5,
            completed: false,
          },
        })
      },

      logWeeklyActivity: (type) => {
        const { weeklyChallenge } = get()
        if (!weeklyChallenge) return
        const weekKey = getCurrentWeekKey()
        if (weeklyChallenge.weekKey !== weekKey) return
        const activities = weeklyChallenge.activitiesCompleted ?? []
        if (activities.includes(type)) return
        const next = [...activities, type]
        const completed = next.length >= weeklyChallenge.target
        set({
          weeklyChallenge: { ...weeklyChallenge, activitiesCompleted: next, completed },
        })
        if (completed) get().awardBadge('weekly-complete')
      },

      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),

      resetGamification: () =>
        set({
          xp: 0,
          level: 1,
          streak: 0,
          lastActivityDate: null,
          badges: [],
          xpHistory: [],
          dailyChallenge: null,
          weeklyChallenge: null,
        }),
    }),
    { name: 'german_app_v1.gamification' }
  )
)
