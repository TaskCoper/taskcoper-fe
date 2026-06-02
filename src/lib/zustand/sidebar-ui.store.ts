import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarUIStore {
  isWorkspaceSidebarOpen: boolean
  isProjectSecondSidebarOpen: boolean
  setWorkspaceSidebarOpen: (open: boolean) => void
  setProjectSecondSidebarOpen: (open: boolean) => void
}

export const useSidebarUIStore = create<SidebarUIStore>()(
  persist(
    (set) => ({
      isWorkspaceSidebarOpen: true,
      isProjectSecondSidebarOpen: true,
      setWorkspaceSidebarOpen: (open) => set({ isWorkspaceSidebarOpen: open }),
      setProjectSecondSidebarOpen: (open) => set({ isProjectSecondSidebarOpen: open })
    }),
    { name: 'sidebar-ui' }
  )
)
