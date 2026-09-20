import { createContext } from 'react'
import type { DirtyRegistryStore } from './dirty-registry-store'

// Tách khỏi `dirty-registry.tsx` để file đó chỉ export component, thoả react-refresh/only-export-components.
export const DirtyRegistryContext = createContext<DirtyRegistryStore | null>(null)
