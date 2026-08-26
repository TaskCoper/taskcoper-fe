import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { Role } from '@/features/users/types'
import { hoaTheoMuaConfig } from '@/tenants/hoa-theo-mua/config'
import { hoaTheoMuaNavMain, hoaTheoMuaNavQuickActions } from '@/tenants/hoa-theo-mua/nav-items'
import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import type { FeatureKey } from './types'
import { resolveFeatureCheck } from './use-feature-flags'

export type TenantNavSubItem = {
  titleKey: string
  url: string
  activePatterns?: string[]
  activeExcludePatterns?: string[]
}

export type TenantNavMainItem = {
  titleKey: string
  url: string
  icon: LucideIcon
  items: TenantNavSubItem[]
  roles?: Role[]
  feature?: FeatureKey
}

export type TenantNavQuickActionItem = {
  titleKey: string
  url: string
  icon: LucideIcon
  activePatterns?: string[]
  activeExcludePatterns?: string[]
  roles?: Role[]
  feature?: FeatureKey
}

// Tenant-specific NavMain sections, keyed by organizationId. The shared sidebar
// concatenates these after the global NAV_MAIN_CONFIG, so a tenant branch only
// touches src/tenants/<TENANT>/ to add menu entries - no edits to shared sidebar
// files needed.
// const TENANT_NAV_MAIN: Record<string, TenantNavMainItem[]> = {
//   [HOA_THEO_MUA_ORG_ID]: hoaTheoMuaNavMain
// }

// const TENANT_NAV_QUICK_ACTIONS: Record<string, TenantNavQuickActionItem[]> = {
//   [HOA_THEO_MUA_ORG_ID]: hoaTheoMuaNavQuickActions
// }

// const EMPTY_NAV_MAIN: TenantNavMainItem[] = []
// const EMPTY_NAV_QUICK_ACTIONS: TenantNavQuickActionItem[] = []

export function useTenantNavMain(): TenantNavMainItem[] {
  const { me } = useGetMe()
  // const config = useTenantConfig()
  // const items = me?.organizationId ? (TENANT_NAV_MAIN[me.organizationId] ?? EMPTY_NAV_MAIN) : EMPTY_NAV_MAIN

  const config = hoaTheoMuaConfig
  const items = hoaTheoMuaNavMain

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

export function useTenantNavQuickActions(): TenantNavQuickActionItem[] {
  const { me } = useGetMe()
  // const config = useTenantConfig()
  // const items = me?.organizationId
  //   ? (TENANT_NAV_QUICK_ACTIONS[me.organizationId] ?? EMPTY_NAV_QUICK_ACTIONS)
  //   : EMPTY_NAV_QUICK_ACTIONS

  const config = hoaTheoMuaConfig
  const items = hoaTheoMuaNavQuickActions

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
