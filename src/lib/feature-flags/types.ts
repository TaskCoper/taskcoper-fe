import type { Role } from '@/features/users/types'
import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router'

export type ModuleKey = 'home' | 'taskManagement' | 'mentorNetworking' | 'meetings' | 'news'

export type TenantLocaleLoader = () => Promise<{ default: Record<string, unknown> }>

export type TenantNavSubItem = {
  title: string
  url: string
  activePatterns?: string[]
  activeExcludePatterns?: string[]
}

export type TenantNavMainItem = {
  title: string
  url: string
  icon: LucideIcon
  items: TenantNavSubItem[]
  roles?: Role[]
  feature?: FeatureKey
}

export type TenantConfig = {
  modules: Record<ModuleKey, boolean>
  custom: Record<string, boolean>
  // Where users are sent after auth and when a guard blocks a route.
  // Must point to a path that the tenant has enabled — otherwise the
  // FeatureFlagGuardLayout loop detector kicks in.
  defaultLanding: string
  // Where the header logo links to. Free to point at the marketing home
  // (e.g. `/`) when `module.home` is enabled; for tenants without a home page,
  // set this to a path inside an enabled module (often the same as
  // defaultLanding) so clicking the logo doesn't bounce.
  logoUrl: string
  // i18next namespace this tenant's strings register under. When set, the
  // tenant's locale bundle is layered on top of the base `translation` ns —
  // matching keys override the base, missing keys fall back to the base.
  i18nNamespace?: string
  // Per-language dynamic loaders. Each is a `() => import('./locales/<lng>.json')`
  // so Vite code-splits the bundle and only the tenant's user downloads it.
  locales?: Record<string, TenantLocaleLoader>
  // NavMain sections appended after the global sidebar items. Filtered at
  // runtime by role (`item.roles`) and feature flag (`item.feature`).
  navMain?: TenantNavMainItem[]
  // RouteObjects mounted inside the user-workspace layout. Read from
  // TENANT_CONFIGS at module load, so adding/removing tenant pages doesn't
  // touch src/routes/user.route.tsx.
  workspaceRoutes?: RouteObject[]
}

export type FeatureKey = `module.${ModuleKey}` | `custom.${string}`
