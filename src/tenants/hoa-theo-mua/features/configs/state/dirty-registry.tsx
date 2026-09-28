import { useMemo, type ReactNode } from 'react'
import { DirtyRegistryContext } from './dirty-registry-context'
import { createDirtyRegistryStore } from './dirty-registry-store'

/**
 * Cố ý bó hẹp trong phạm vi trang: mỗi lần mount là một store mới, không dùng singleton toàn app
 * trong `lib/zustand`. Bản nháp không được sống sót khi rời trang hay rò sang lần vào sau.
 */
export function DirtyRegistryProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => createDirtyRegistryStore(), [])
  return <DirtyRegistryContext.Provider value={store}>{children}</DirtyRegistryContext.Provider>
}
