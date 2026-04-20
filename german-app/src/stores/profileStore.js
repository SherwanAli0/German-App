import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProfileStore = create(
  persist(
    (set) => ({
      // state
      profile: null,
      // actions
      setProfile: (profile) => set({ profile }),
      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      resetProfile: () => set({ profile: null }),
    }),
    { name: 'german_app_v1.profile' }
  )
)
