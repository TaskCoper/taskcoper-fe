import { DEFAULT_TENANT_CONFIG } from './default.config'
import { TENANT_CONFIGS } from './tenants.config'
import type { TenantConfig } from './types'

// Resolve the tenant config based on the organization id, if there is no specific config for the organization,
// return the default config, else merge the default config with the specific config for the organization and return it
export function resolveTenantConfig(organizationId: string | null | undefined): TenantConfig {
  if (!organizationId) {
    return DEFAULT_TENANT_CONFIG
  }

  const override = TENANT_CONFIGS[organizationId]
  if (!override) {
    return DEFAULT_TENANT_CONFIG
  }

  return {
    modules: { ...DEFAULT_TENANT_CONFIG.modules, ...override.modules },
    custom: { ...DEFAULT_TENANT_CONFIG.custom, ...override.custom },
    defaultLanding: override.defaultLanding ?? DEFAULT_TENANT_CONFIG.defaultLanding,
    logoUrl: override.logoUrl ?? DEFAULT_TENANT_CONFIG.logoUrl,
    i18nNamespace: override.i18nNamespace,
    locales: override.locales,
    navMain: override.navMain,
    workspaceRoutes: override.workspaceRoutes
  }
}
