import type { TenantConfig } from './types'

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  modules: {
    home: true,
    taskManagement: true,
    mentorNetworking: true,
    meetings: true,
    news: true
  },
  custom: {},
  defaultLanding: '/projects',
  logoUrl: '/'
}
