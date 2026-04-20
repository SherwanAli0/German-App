import { create } from 'zustand'

export const useUIStore = create((set) => ({
  // state
  proxyAvailable: null,   // null = unchecked, true, false
  banners: [],            // [{ id: string, type: 'error'|'warning'|'info', message: string }]
  activeModal: null,      // string | null

  // actions
  setProxyAvailable: (proxyAvailable) => set({ proxyAvailable }),
  addBanner: (banner) => set((s) => ({ banners: [...s.banners, banner] })),
  removeBanner: (id) => set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),
  clearBanners: () => set({ banners: [] }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}))
