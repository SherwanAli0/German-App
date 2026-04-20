import { NavLink } from 'react-router'
import { useGamificationStore, LEVEL_NAMES } from '../stores/gamificationStore'

const NAV_ITEMS = [
  { to: '/',             icon: '🏠', label: 'Home' },
  { to: '/conversation', icon: '🎙️', label: 'Conversation' },
  { to: '/vocabulary',   icon: '📚', label: 'Vocabulary' },
  { to: '/grammar',      icon: '📖', label: 'Grammar' },
  { to: '/reading',      icon: '🗞️', label: 'Reading' },
  { to: '/progress',     icon: '📊', label: 'Progress' },
]

export default function NavBar() {
  const { streak, level, xp } = useGamificationStore((s) => s)
  const levelName = LEVEL_NAMES[level - 1] ?? 'A1'

  return (
    <nav className="flex flex-col justify-between w-52 shrink-0 border-r border-gray-100 bg-white px-3 py-6 min-h-screen">
      {/* Logo */}
      <div className="flex flex-col gap-6">
        <div className="px-3">
          <p className="text-base font-bold text-indigo-700 tracking-tight">German-App</p>
          <p className="text-xs text-gray-400">Dein KI-Sprachpartner</p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="flex flex-col gap-2 px-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Streak</span>
          <span className="text-sm font-bold text-orange-500">🔥 {streak}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Level</span>
          <span className="text-sm font-bold text-indigo-600">{levelName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">XP</span>
          <span className="text-sm font-semibold text-gray-700">{xp}</span>
        </div>
      </div>
    </nav>
  )
}
