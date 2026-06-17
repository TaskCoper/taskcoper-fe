import type { TenantLocaleLoader } from '@/lib/feature-flags/types'
import i18n from './i18n'

const loaded = new Set<string>()
const inFlight = new Map<string, Promise<void>>()

const pickLoader = (locales: Record<string, TenantLocaleLoader>, lng: string): TenantLocaleLoader | undefined => {
  return locales[lng] ?? locales[lng.split('-')[0]] ?? locales['en']
}

export const loadTenantNamespace = (namespace: string, locales: Record<string, TenantLocaleLoader>): Promise<void> => {
  const lng = i18n.resolvedLanguage ?? i18n.language ?? 'en'
  const key = `${namespace}:${lng}`

  if (loaded.has(key)) return Promise.resolve()
  const existing = inFlight.get(key)
  if (existing) return existing

  const loader = pickLoader(locales, lng)
  if (!loader) return Promise.resolve()

  const promise = loader()
    .then((mod) => {
      i18n.addResourceBundle(lng, namespace, mod.default, true, true)
      loaded.add(key)
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, promise)
  return promise
}
