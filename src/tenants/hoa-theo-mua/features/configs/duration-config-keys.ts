// Keys whose numeric value is persisted in seconds but should be shown/edited in minutes to avoid confusion.
export const SECONDS_AS_MINUTES_CONFIG_KEYS: ReadonlySet<string> = new Set(['ahamove.idle_time'])

export const isSecondsAsMinutesConfigKey = (key: string | undefined): boolean =>
  !!key && SECONDS_AS_MINUTES_CONFIG_KEYS.has(key)

export const secondsToMinutes = (seconds: unknown): number | undefined => {
  const n = typeof seconds === 'number' ? seconds : Number(seconds)
  return Number.isFinite(n) ? n / 60 : undefined
}

export const minutesToSeconds = (minutes: unknown): number | undefined => {
  const n = typeof minutes === 'number' ? minutes : Number(minutes)
  return Number.isFinite(n) ? Math.round(n * 60) : undefined
}
