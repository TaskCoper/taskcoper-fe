import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formatDate as formatDateRaw,
  formatDateTime as formatDateTimeRaw,
  formatRelative as formatRelativeRaw,
  formatTime as formatTimeRaw,
  type FormatInput,
  type RelativeFormatOptions
} from './format'
import { resolveAppLocale } from './locale'
import type { DateFormatPreset } from './presets'

type PresetArg = DateFormatPreset | (string & {})

export const useDateFormat = () => {
  const { i18n } = useTranslation()
  const locale = resolveAppLocale(i18n.language)

  return useMemo(
    () => ({
      locale,
      formatDate: (input: FormatInput, preset?: PresetArg) => formatDateRaw(input, preset, { locale }),
      formatTime: (input: FormatInput, preset?: PresetArg) => formatTimeRaw(input, preset, { locale }),
      formatDateTime: (input: FormatInput, preset?: PresetArg) => formatDateTimeRaw(input, preset, { locale }),
      formatRelative: (input: FormatInput, opts?: Omit<RelativeFormatOptions, 'locale'>) =>
        formatRelativeRaw(input, { ...opts, locale })
    }),
    [locale]
  )
}
