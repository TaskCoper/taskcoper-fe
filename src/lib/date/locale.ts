import type { Locale } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import i18next from 'i18next'

export type AppLocale = 'en-US' | 'vi-VN'

const APP_LOCALES: readonly AppLocale[] = ['en-US', 'vi-VN']
const DEFAULT_APP_LOCALE: AppLocale = 'en-US'

const DATE_FNS_LOCALES: Record<AppLocale, Locale> = {
  'en-US': enUS,
  'vi-VN': vi
}

export const resolveAppLocale = (input?: string | null): AppLocale => {
  if (!input) {
    return DEFAULT_APP_LOCALE
  }

  if ((APP_LOCALES as readonly string[]).includes(input)) {
    return input as AppLocale
  }

  const normalized = input.toLowerCase()
  if (normalized.startsWith('vi')) return 'vi-VN'
  if (normalized.startsWith('en')) return 'en-US'

  return DEFAULT_APP_LOCALE
}

export const getDateFnsLocale = (tag: AppLocale): Locale => DATE_FNS_LOCALES[tag]

export const getCurrentAppLocale = (): AppLocale => resolveAppLocale(i18next.language)
