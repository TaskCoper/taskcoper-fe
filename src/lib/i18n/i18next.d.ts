import type hoaTheoMuaEn from '@/tenants/hoa-theo-mua/locales/en.json'

import type en from './locales/en.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof en
      hoaTheoMua: typeof hoaTheoMuaEn
    }
  }
}
