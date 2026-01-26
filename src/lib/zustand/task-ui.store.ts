import { create } from 'zustand'

interface TaskUIStore {
  areLabelsExpanded: boolean
  toggleLabelsExpanded: () => void
}

export const useTaskUIStore = create<TaskUIStore>((set) => ({
  areLabelsExpanded: false,
  toggleLabelsExpanded: () => set((state) => ({ areLabelsExpanded: !state.areLabelsExpanded }))
}))
