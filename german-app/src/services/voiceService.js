/**
 * Abstraction over Web Speech API (recognition) and Web Speech Synthesis API.
 * Module-level instances are intentional — only one recognition/synthesis session
 * runs at a time across the whole app.
 *
 * Voice pipeline: idle → listening → transcribing → processing → speaking → idle
 * Reset to idle on any error (architecture rule).
 */

let recognition = null

// ── Capability detection ──────────────────────────────────────────────────────

export function detectCapabilities() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  return {
    speechAvailable: Boolean(SpeechRecognition),
    synthesisAvailable: Boolean(window.speechSynthesis),
  }
}

// ── Speech Recognition ────────────────────────────────────────────────────────

/**
 * Starts the microphone and calls back on each result.
 *
 * onInterim(text)   — called with in-progress transcription (display only)
 * onFinal(text)     — called when the user has finished speaking
 * onError({ code, message })
 */
export function startListening({ lang = 'de-DE', onInterim, onFinal, onError }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    onError({ code: 'SPEECH_UNAVAILABLE', message: 'Web Speech API is not available in this browser.' })
    return
  }

  stopListening() // cancel any previous session

  recognition = new SpeechRecognition()
  recognition.lang = lang
  recognition.continuous = false
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    let interim = ''
    let final = ''
    for (const result of event.results) {
      if (result.isFinal) {
        final += result[0].transcript
      } else {
        interim += result[0].transcript
      }
    }
    if (interim) onInterim(interim)
    if (final) onFinal(final)
  }

  recognition.onerror = (event) => {
    const code = event.error === 'not-allowed' ? 'MIC_DENIED' : 'SPEECH_ERROR'
    const message =
      event.error === 'not-allowed'
        ? 'Microphone access was denied. Please allow microphone access in Chrome settings.'
        : `Speech recognition error: ${event.error}`
    onError({ code, message })
  }

  recognition.onend = () => {
    recognition = null
  }

  try {
    recognition.start()
  } catch (err) {
    onError({ code: 'SPEECH_ERROR', message: err.message })
  }
}

export function stopListening() {
  if (recognition) {
    try { recognition.stop() } catch (_) {}
    recognition = null
  }
}

// ── Speech Synthesis ──────────────────────────────────────────────────────────

/**
 * Speaks text aloud.
 *
 * onEnd()  — called when speech finishes
 * onError({ code, message })  — called on synthesis failure (NFR14)
 */
export function speak({ text, lang = 'de-DE', rate = 0.9, onEnd, onError }) {
  if (!window.speechSynthesis) {
    onError?.({ code: 'SYNTHESIS_UNAVAILABLE', message: 'Speech synthesis not available.' })
    return
  }

  stopSpeaking()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate

  utterance.onend = () => onEnd?.()
  utterance.onerror = (e) => {
    if (e.error === 'interrupted') return // intentional cancellation
    onError?.({ code: 'SYNTHESIS_ERROR', message: `Synthesis error: ${e.error}` })
  }

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
