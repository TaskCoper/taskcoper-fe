import type { TenantConfig } from './types'

export const TENANT_CONFIGS: Record<string, Partial<TenantConfig>> = {
  'b7438510-a0f7-4bea-b652-b787c01294e5': {
    modules: {
      home: false,
      taskManagement: true,
      mentorNetworking: false,
      meetings: false,
      news: false
    },
    custom: {
      orderManagement: true,
      recruitmentPortal: true,
      addressManagement: true,
      customNewsPage: true
    },
    defaultLanding: '/projects',
    logoUrl: '/projects'
  }
}
