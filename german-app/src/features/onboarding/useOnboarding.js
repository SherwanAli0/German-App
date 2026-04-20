import { useState } from 'react'
import { generate } from '../../services/apiClient'
import { buildPersonaPrompt, parsePersonaResponse } from './onboardingHelpers'
import questions from './onboardingQuestions'
import { useProfileStore } from '../../stores/profileStore'
import { useGamificationStore } from '../../stores/gamificationStore'

export function useOnboarding() {
  const setProfile = useProfileStore((s) => s.setProfile)
  const incrementStreak = useGamificationStore((s) => s.incrementStreak)

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [status, setStatus] = useState('idle') // idle | generating | success | error
  const [persona, setPersona] = useState(null)
  const [error, setError] = useState(null)

  const currentQuestion = questions[stepIndex]
  const isLastQuestion = stepIndex === questions.length - 1
  const isComplete = status === 'success'

  function handleAnswer(value) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function handleNext() {
    if (isLastQuestion) {
      handleGeneratePersona()
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  async function handleGeneratePersona() {
    setStatus('generating')
    setError(null)
    try {
      const prompt = buildPersonaPrompt(answers)
      const { text } = await generate({ prompt, maxTokens: 800 })
      const parsed = parsePersonaResponse(text)
      setPersona(parsed)
      setStatus('success')
    } catch (err) {
      setError(err.message || 'Could not generate your profile. Please try again.')
      setStatus('error')
    }
  }

  function handleConfirm() {
    const profile = {
      ...answers,
      aiPersona: persona,
      completedAt: new Date().toISOString(),
    }
    setProfile(profile)
    incrementStreak()
  }

  function handleRetry() {
    setStatus('idle')
    setError(null)
    setStepIndex(questions.length - 1)
  }

  function handleEditAnswers() {
    setStatus('idle')
    setPersona(null)
    setStepIndex(0)
  }

  const currentAnswer = answers[currentQuestion?.id] ?? ''
  const canAdvance = Array.isArray(currentAnswer)
    ? currentAnswer.length > 0
    : currentAnswer.toString().trim().length > 0

  return {
    questions,
    stepIndex,
    answers,
    currentQuestion,
    currentAnswer,
    canAdvance,
    isLastQuestion,
    isComplete,
    status,
    persona,
    error,
    handleAnswer,
    handleNext,
    handleBack,
    handleConfirm,
    handleRetry,
    handleEditAnswers,
  }
}
