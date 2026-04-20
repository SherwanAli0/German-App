import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router'
import { checkHealth } from './services/apiClient'
import { useProfileStore } from './stores/profileStore'
import { useUIStore } from './stores/uiStore'
import ProxyUnavailableBanner from './components/ProxyUnavailableBanner'
import NavBar from './components/NavBar'
import HomePage from './features/gamification/HomePage'
import OnboardingPage from './features/onboarding/OnboardingPage'
import ConversationPage from './features/conversation/ConversationPage'
import VocabularyPage from './features/vocabulary/VocabularyPage'
import GrammarPage from './features/grammar/GrammarPage'
import ReadingPage from './features/reading/ReadingPage'
import ProgressPage from './features/gamification/ProgressPage'

// Routes that render full-screen without the sidebar
const FULL_SCREEN_ROUTES = ['/onboarding', '/conversation']

function AppShell() {
  const profile = useProfileStore((s) => s.profile)
  const setProxyAvailable = useUIStore((s) => s.setProxyAvailable)
  const location = useLocation()

  // Check proxy health on mount (NFR13)
  useEffect(() => {
    checkHealth().then(setProxyAvailable)
  }, [setProxyAvailable])

  const hasProfile = Boolean(profile?.completedAt)
  const isFullScreen = FULL_SCREEN_ROUTES.some((r) => location.pathname.startsWith(r))
  const showNav = hasProfile && !isFullScreen

  return (
    <div className="flex min-h-screen bg-white">
      {showNav && <NavBar />}

      <div className="flex flex-1 flex-col min-w-0">
        <ProxyUnavailableBanner />
        <Routes>
          <Route
            path="/"
            element={hasProfile ? <HomePage /> : <Navigate to="/onboarding" replace />}
          />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/conversation"
            element={hasProfile ? <ConversationPage /> : <Navigate to="/onboarding" replace />}
          />
          <Route
            path="/vocabulary"
            element={hasProfile ? <VocabularyPage /> : <Navigate to="/onboarding" replace />}
          />
          <Route
            path="/grammar"
            element={hasProfile ? <GrammarPage /> : <Navigate to="/onboarding" replace />}
          />
          <Route
            path="/reading"
            element={hasProfile ? <ReadingPage /> : <Navigate to="/onboarding" replace />}
          />
          <Route
            path="/progress"
            element={hasProfile ? <ProgressPage /> : <Navigate to="/onboarding" replace />}
          />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
