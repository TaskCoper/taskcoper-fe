import { format, formatDistanceToNow } from 'date-fns'
import { getCurrentAppLocale, getDateFnsLocale, resolveAppLocale, type AppLocale } from './locale'
import { DATE_PATTERNS, type DateFormatPreset } from './presets'

export type FormatInput = Date | string | number | null | undefined

export type FormatOptions = {
  locale?: string | AppLocale
}

export type RelativeFormatOptions = FormatOptions & {
  addSuffix?: boolean
}

/**
 * Convert a Unix timestamp in **seconds** to a `Date` so it can be passed to the formatters
 * (they treat plain numbers as milliseconds). Returns `null` for empty or invalid values.
 */
export const fromUnixSeconds = (seconds: number | null | undefined): Date | null => {
  if (seconds == null || !Number.isFinite(seconds)) return null
  const date = new Date(seconds * 1000)
  return Number.isNaN(date.getTime()) ? null : date
}

const toDate = (input: FormatInput): Date | null => {
  if (input == null || input === '') return null
  const date = input instanceof Date ? input : new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

const resolvePattern = (preset: DateFormatPreset | (string & {}), locale: AppLocale): string => {
  const table = DATE_PATTERNS[locale]
  if (Object.prototype.hasOwnProperty.call(table, preset)) {
    return table[preset as DateFormatPreset]
  }
  return preset
}

const formatWithPreset = (
  input: FormatInput,
  preset: DateFormatPreset | (string & {}),
  opts?: FormatOptions
): string => {
  const date = toDate(input)
  if (!date) return ''
  const locale = opts?.locale ? resolveAppLocale(opts.locale) : getCurrentAppLocale()
  const pattern = resolvePattern(preset, locale)
  try {
    return format(date, pattern, { locale: getDateFnsLocale(locale) })
  } catch {
    return ''
  }
}

export const formatDate = (
  input: FormatInput,
  preset: DateFormatPreset | (string & {}) = 'dateShort',
  opts?: FormatOptions
): string => formatWithPreset(input, preset, opts)

export const formatTime = (
  input: FormatInput,
  preset: DateFormatPreset | (string & {}) = 'time',
  opts?: FormatOptions
): string => formatWithPreset(input, preset, opts)

export const formatDateTime = (
  input: FormatInput,
  preset: DateFormatPreset | (string & {}) = 'dateTimeShort',
  opts?: FormatOptions
): string => formatWithPreset(input, preset, opts)

export const formatRelative = (input: FormatInput, opts?: RelativeFormatOptions): string => {
  const date = toDate(input)
  if (!date) return ''
  const locale = opts?.locale ? resolveAppLocale(opts.locale) : getCurrentAppLocale()
  try {
    return formatDistanceToNow(date, {
      locale: getDateFnsLocale(locale),
      addSuffix: opts?.addSuffix ?? true
    })
  } catch {
    return ''
  }
}
