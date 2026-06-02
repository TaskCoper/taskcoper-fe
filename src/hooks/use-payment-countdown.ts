import { useEffect, useMemo, useState } from 'react'

interface UsePaymentCountdownProps {
  createdOnUtc?: string | null
  isDisabled?: boolean
}

const PAYMENT_WINDOW_MS = 2 * 60 * 1000
const ISO_TIME_PATTERN = /[tT\s]\d{2}:\d{2}/
const TIME_ZONE_PATTERN = /(?:z|[+-]\d{2}:?\d{2})$/i

const parseUtcTimestampMs = (value: string) => {
  const trimmedValue = value.trim()
  const normalizedValue =
    ISO_TIME_PATTERN.test(trimmedValue) && !TIME_ZONE_PATTERN.test(trimmedValue) ? `${trimmedValue}Z` : trimmedValue
  const parsed = Date.parse(normalizedValue)

  return Number.isFinite(parsed) ? parsed : null
}

export const usePaymentCountdown = ({ createdOnUtc, isDisabled }: UsePaymentCountdownProps) => {
  const createdAtMs = useMemo(() => {
    if (!createdOnUtc) return null
    return parseUtcTimestampMs(createdOnUtc)
  }, [createdOnUtc])

  const expiresAtMs = useMemo(() => (createdAtMs == null ? null : createdAtMs + PAYMENT_WINDOW_MS), [createdAtMs])
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (expiresAtMs == null || isDisabled) return
    const id = window.setInterval(() => setNowMs(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [expiresAtMs, isDisabled])

  const remainingMs = expiresAtMs == null ? null : Math.max(0, expiresAtMs - nowMs)
  const isExpired = remainingMs != null && remainingMs <= 0

  const progress = useMemo(() => {
    if (remainingMs == null) return null
    const elapsed = PAYMENT_WINDOW_MS - remainingMs
    return Math.max(0, Math.min(100, (elapsed / PAYMENT_WINDOW_MS) * 100))
  }, [remainingMs])

  return { remainingMs, isExpired, progress }
}
