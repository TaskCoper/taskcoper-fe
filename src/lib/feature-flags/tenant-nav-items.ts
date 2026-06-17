import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { Role } from '@/features/users/types'
import { useMemo } from 'react'
import type { TenantNavMainItem } from './types'
import { resolveFeatureCheck, useTenantConfig } from './use-feature-flags'

export type { TenantNavMainItem, TenantNavSubItem } from './types'

const EMPTY_NAV_MAIN: TenantNavMainItem[] = []

// Reads tenant NavMain from the resolved tenant config (TENANT_CONFIGS[orgId].navMain).
// The shared sidebar concatenates the result after the global NAV_MAIN_CONFIG, so
// adding a tenant section only requires populating `navMain` in the tenant config —
// no edits to this file or to the sidebar.
export function useTenantNavMain(): TenantNavMainItem[] {
  const { me } = useGetMe()
  const config = useTenantConfig()
  const items = config.navMain ?? EMPTY_NAV_MAIN

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
