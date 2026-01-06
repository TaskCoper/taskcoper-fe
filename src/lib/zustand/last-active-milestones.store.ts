import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const STORAGE_KEY = 'last-active-milestones'

interface MilestonePreferencesState {
  lastActiveMilestones: Record<string, string> // projectId -> milestoneId
  setLastActiveMilestone: (projectId: string, milestoneId: string) => void
  getLastActiveMilestone: (projectId: string) => string | undefined
  removeLastActiveMilestone: (projectId: string) => void
  clearAll: () => void
}

export const useMilestonePreferencesStore = create<MilestonePreferencesState>()(
  persist(
    (set, get) => ({
      lastActiveMilestones: {},
      setLastActiveMilestone: (projectId: string, milestoneId: string) => {
        set((state) => ({
          lastActiveMilestones: {
            ...state.lastActiveMilestones,
            [projectId]: milestoneId
          }
        }))
      },
      getLastActiveMilestone: (projectId: string) => {
        return get().lastActiveMilestones[projectId]
      },
      removeLastActiveMilestone: (projectId: string) => {
        set((state) => {
          const { [projectId]: _, ...rest } = state.lastActiveMilestones
          return { lastActiveMilestones: rest }
        })
      },
      clearAll: () => {
        set({ lastActiveMilestones: {} })
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage)
    }
  )
)
