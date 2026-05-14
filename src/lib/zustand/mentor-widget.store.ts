import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const MENTOR_WIDGET_STORAGE_KEY = 'mentor-widget'

const WEEK = 7 * 24 * 60 * 60 * 1000

interface MentorWidgetState {
  dismissedAt: number | null
  dismiss: () => void
  isDismissed: () => boolean
  clearAll: () => void
}

export const useMentorWidgetStore = create<MentorWidgetState>()(
  persist(
    (set, get) => ({
      dismissedAt: null,
      dismiss: () => set({ dismissedAt: Date.now() }),
      isDismissed: () => {
        const { dismissedAt } = get()
        if (!dismissedAt) return false
        return Date.now() - dismissedAt < WEEK
      },
      clearAll: () => {
        set({ dismissedAt: null })
      }
    }),
    {
      name: MENTOR_WIDGET_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage)
    }
  )
)
