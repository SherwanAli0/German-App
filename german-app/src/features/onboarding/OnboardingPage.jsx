import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useOnboarding } from './useOnboarding'
import InterviewStep from './InterviewStep'
import ProfileSummary from './ProfileSummary'
import { useProfileStore } from '../../stores/profileStore'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.profile)

  const {
    questions,
    stepIndex,
    answers,
    currentQuestion,
    currentAnswer,
    canAdvance,
    isLastQuestion,
    status,
    persona,
    error,
    handleAnswer,
    handleNext,
    handleBack,
    handleConfirm,
    handleRetry,
    handleEditAnswers,
  } = useOnboarding()

  // Once profile is saved, navigate home
  useEffect(() => {
    if (profile?.completedAt) {
      navigate('/')
    }
  }, [profile, navigate])

  const progress = ((stepIndex + 1) / questions.length) * 100

  // ── Generating state ──────────────────────────────────────────────────────
  if (status === 'generating') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-gray-600">Building your profile…</p>
        </div>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <p className="text-lg font-semibold text-red-600">Something went wrong</p>
          <p className="text-sm text-gray-500">{error}</p>
          <p className="text-xs text-gray-400">Make sure the proxy is running: <code className="bg-gray-100 px-1 rounded">npm run dev:proxy</code></p>
          <button
            onClick={handleRetry}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // ── Profile summary (FR2) ─────────────────────────────────────────────────
  if (status === 'success' && persona) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="w-full max-w-lg">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Here's what I've got</h2>
          <ProfileSummary
            answers={answers}
            persona={persona}
            onConfirm={handleConfirm}
            onEdit={handleEditAnswers}
          />
        </div>
      </div>
    )
  }

  // ── Interview flow ────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-8">
      <div className="w-full max-w-lg">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
            <span>Getting to know you</span>
            <span>{stepIndex + 1} / {questions.length}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <InterviewStep
          question={currentQuestion}
          answer={currentAnswer}
          onChange={handleAnswer}
        />

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={stepIndex === 0}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
          >
            {isLastQuestion ? 'Build my profile →' : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  )
}
