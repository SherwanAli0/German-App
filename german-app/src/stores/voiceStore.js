import { create } from 'zustand'

// Status flows one direction only:
// idle → listening → transcribing → processing → speaking → idle
// Reset to idle on any error.

export const useVoiceStore = create((set) => ({
  // state
  status: 'idle', // idle | listening | transcribing | processing | speaking
  transcript: '',
  interimTranscript: '',
  isSpeechAvailable: false,
  isSynthesisAvailable: false,
  fallbackMode: null, // null | 'text-input'
  error: null,

  // actions
  setStatus: (status) => set({ status, error: null }),
  setTranscript: (transcript) => set({ transcript }),
  setInterimTranscript: (interimTranscript) => set({ interimTranscript }),
  setSpeechAvailable: (isSpeechAvailable) => set({ isSpeechAvailable }),
  setSynthesisAvailable: (isSynthesisAvailable) => set({ isSynthesisAvailable }),
  setFallbackMode: (fallbackMode) => set({ fallbackMode }),
  setError: (error) => set({ error, status: 'idle' }),
  reset: () => set({ status: 'idle', transcript: '', interimTranscript: '', error: null }),
}))
