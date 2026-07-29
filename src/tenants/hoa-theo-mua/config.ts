import type { TenantConfig } from '@/lib/feature-flags/types'

export const HOA_THEO_MUA_ORG_ID = 'b9a1f46e-7c35-4e82-9a10-2f6d83c4b921'
export const HOA_THEO_MUA_ROUTE_PREFIX = 'htm'

export const hoaTheoMuaConfig: TenantConfig = {
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
    systemConfigs: true,
    productManagement: true
  },
  defaultLanding: '/projects',
  logoUrl: '/projects',
  i18nNamespace: 'hoaTheoMua',
  locales: {
    en: () => import('./locales/en.json'),
    vi: () => import('./locales/vi.json')
  }
}
