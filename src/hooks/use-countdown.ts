import { useCallback, useEffect, useRef, useState } from 'react'

export const useCountdown = ({
  seconds,
  onFinish,
  autoStart = false
}: {
  seconds: number
  onFinish?: () => void
  autoStart?: boolean
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onFinishRef = useRef(onFinish)
  const secondsRef = useRef(seconds)

  useEffect(() => {
    onFinishRef.current = onFinish
    secondsRef.current = seconds
  }, [onFinish, seconds])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    stopTimer()
    setTimeLeft(secondsRef.current)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer()
          onFinishRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer])

  useEffect(() => {
    if (autoStart) {
      start()
    }
    return () => {
      stopTimer()
    }
  }, [autoStart, start, stopTimer])

  const displayTime = timeLeft < 10 ? `0${timeLeft}` : `${timeLeft}`

  return {
    timeLeft: displayTime,
    canResend: timeLeft === 0,
    resetCountdown: start
  }
}
