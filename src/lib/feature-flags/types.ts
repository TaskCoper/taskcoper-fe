export type ModuleKey = 'home' | 'taskManagement' | 'mentorNetworking' | 'meetings' | 'news'

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
}

export type FeatureKey = `module.${ModuleKey}` | `custom.${string}`
