import type { TenantConfig } from '@/lib/feature-flags/types'

export const HOA_THEO_MUA_ORG_ID = 'b7438510-a0f7-4bea-b652-b787c01294e5'

export const hoaTheoMuaConfig: Partial<TenantConfig> = {
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
    customNewsPage: true,
    systemConfigs: true
  },
  defaultLanding: '/projects',
  logoUrl: '/projects',
  i18nNamespace: 'hoaTheoMua',
  locales: {
    en: () => import('./locales/en.json'),
    vi: () => import('./locales/vi.json')
  }
}
