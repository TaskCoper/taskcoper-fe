import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { getRoleHomePath, getUserType } from '@/shared/utils'
import { useMemo } from 'react'
import { resolveTenantConfig } from './resolve-tenant-config'
import type { FeatureKey, ModuleKey, TenantConfig } from './types'

// Get tenant config base on current user organization and return whether the feature is enabled or not
export function useTenantConfig(): TenantConfig {
  const { me } = useGetMe()
  return useMemo(() => resolveTenantConfig(me?.organizationId), [me?.organizationId])
}

// Helper to resolve the feature key to check if the feature is enabled in the tenant config
export function resolveFeatureCheck(config: TenantConfig, key: FeatureKey): boolean {
  if (key.startsWith('module.')) {
    const moduleKey = key.slice('module.'.length) as ModuleKey
    return config.modules[moduleKey] ?? false
  }

  if (key.startsWith('custom.')) {
    return config.custom[key.slice('custom.'.length)] ?? false
  }

  return false
}

// Hook to check if a specific feature is enabled for the current tenant
export function useFeature(key: FeatureKey): boolean {
  const config = useTenantConfig()

  return resolveFeatureCheck(config, key)
}

// Utility function to check if a specific feature is enabled for a given organization ID, can be used outside of React components
export function isFeatureEnabled(organizationId: string | null | undefined, key: FeatureKey): boolean {
  return resolveFeatureCheck(resolveTenantConfig(organizationId), key)
}

export function useRoleHomePath(): string {
  const { me } = useGetMe()
  const config = useTenantConfig()
  const userType = getUserType(me)

  // if the current user is not a regular user, redirect to the role specific home page instead of the default landing page
  if (userType !== 'user') {
    return getRoleHomePath(userType)
  }

  return config.defaultLanding
}
