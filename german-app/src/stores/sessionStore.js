import { create } from 'zustand'

export const useSessionStore = create((set, get) => ({
  // state
  turns: [],          // [{ role: 'user'|'assistant', content: string, timestamp: string }]
  correctionCount: 0,
  sessionStartedAt: null,
  status: 'idle',     // idle | active | ended

  // actions
  startSession: () => set({ turns: [], correctionCount: 0, sessionStartedAt: new Date().toISOString(), status: 'active' }),

  addTurn: (role, content) =>
    set((s) => ({
      turns: [...s.turns, { role, content, timestamp: new Date().toISOString() }],
    })),

  incrementCorrections: () => set((s) => ({ correctionCount: s.correctionCount + 1 })),

  endSession: () => set({ status: 'ended' }),

  resetSession: () => set({ turns: [], correctionCount: 0, sessionStartedAt: null, status: 'idle' }),
}))
