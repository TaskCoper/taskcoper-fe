import { useEffect, useMemo, useState } from 'react'

interface UsePaymentCountdownProps {
  createdOnUtc?: string | null
  isDisabled?: boolean
}

const PAYMENT_WINDOW_MS = 2 * 60 * 1000

export const usePaymentCountdown = ({ createdOnUtc, isDisabled }: UsePaymentCountdownProps) => {
  const createdAtMs = useMemo(() => {
    if (!createdOnUtc) return null
    const parsed = Date.parse(createdOnUtc)
    return Number.isFinite(parsed) ? parsed : null
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
