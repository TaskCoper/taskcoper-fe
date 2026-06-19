import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { Role } from '@/features/users/types'
import { HOA_THEO_MUA_ORG_ID } from '@/tenants/hoa-theo-mua/config'
import { hoaTheoMuaNavMain } from '@/tenants/hoa-theo-mua/nav-items'
import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import type { FeatureKey } from './types'
import { resolveFeatureCheck, useTenantConfig } from './use-feature-flags'

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

// Tenant-specific NavMain sections, keyed by organizationId. The shared sidebar
// concatenates these after the global NAV_MAIN_CONFIG, so a tenant branch only
// touches src/tenants/<TENANT>/ to add menu entries — no edits to shared sidebar
// files needed.
const TENANT_NAV_MAIN: Record<string, TenantNavMainItem[]> = {
  [HOA_THEO_MUA_ORG_ID]: hoaTheoMuaNavMain
}

const EMPTY_NAV_MAIN: TenantNavMainItem[] = []

export function useTenantNavMain(): TenantNavMainItem[] {
  const { me } = useGetMe()
  const config = useTenantConfig()
  const items = me?.organizationId ? (TENANT_NAV_MAIN[me.organizationId] ?? EMPTY_NAV_MAIN) : EMPTY_NAV_MAIN

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
