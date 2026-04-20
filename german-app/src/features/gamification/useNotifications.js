import { useEffect } from 'react'
import { useGamificationStore } from '../../stores/gamificationStore'

/**
 * FR45 — Requests notification permission and schedules a streak-risk alert
 * if no activity has happened by 23:45.
 */
export function useNotifications() {
  const { streak, lastActivityDate, notificationsEnabled, setNotificationsEnabled } =
    useGamificationStore((s) => s)

  async function requestPermission() {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotificationsEnabled(permission === 'granted')
  }

  // Schedule a 23:45 streak-risk notification (FR45)
  useEffect(() => {
    if (!notificationsEnabled || streak === 0) return

    const today = new Date().toISOString().split('T')[0]
    const hasActivityToday = lastActivityDate === today
    if (hasActivityToday) return // streak is safe, no need to notify

    const now = new Date()
    const target = new Date()
    target.setHours(23, 45, 0, 0)

    const msUntilTarget = target.getTime() - now.getTime()
    if (msUntilTarget <= 0) return // already past 23:45

    const timer = setTimeout(() => {
      // Re-check — user might have practiced since this was set
      const currentDate = useGamificationStore.getState().lastActivityDate
      if (currentDate === today) return

      new Notification('🔥 Streak alert!', {
        body: `Tag ${streak} — noch 15 Minuten! Open the app to keep your streak alive.`,
        icon: '/favicon.ico',
      })
    }, msUntilTarget)

    return () => clearTimeout(timer)
  }, [notificationsEnabled, streak, lastActivityDate])

  return { notificationsEnabled, requestPermission }
}
