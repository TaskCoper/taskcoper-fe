import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { Role } from '@/features/users/types'
import { hoaTheoMuaConfig } from '@/tenants/hoa-theo-mua/config'
import { useMemo } from 'react'
import type { FeatureKey } from './types'
import { resolveFeatureCheck } from './use-feature-flags'

export type GuardedNavItem = {
  roles?: Role[]
  feature?: FeatureKey
}

// Filter a list of nav items by the current tenant config + user role.
// Single source of truth for nav visibility - keep top-nav and sidebar in sync.
export function useFilteredNavItems<T extends GuardedNavItem>(items: T[]): T[] {
  const { me } = useGetMe()
  // const config = useTenantConfig()
  const config = hoaTheoMuaConfig

  return useMemo(
    () =>
      items.filter((item) => {
        if (item.roles && !item.roles.includes(me?.role as Role)) return false
        if (item.feature && !resolveFeatureCheck(config, item.feature)) return false
        return true
      }),
    [items, me?.role, config]
  )
}
