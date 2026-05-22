'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

type BreakpointMode = 'min' | 'max'

/**
 * Hook to detect whether the current viewport matches a given breakpoint rule.
 * Example:
 *   useIsBreakpoint("max", 768)   // true when width < 768
 *   useIsBreakpoint("min", 1024)  // true when width >= 1024
 */
export function useIsBreakpoint(mode: BreakpointMode = 'max', breakpoint = 768) {
  const query = useMemo(() => {
    return mode === 'min' ? `(min-width: ${breakpoint}px)` : `(max-width: ${breakpoint - 1}px)`
  }, [mode, breakpoint])

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query)
      const onChange = () => onStoreChange()

      mediaQueryList.addEventListener('change', onChange)
      return () => mediaQueryList.removeEventListener('change', onChange)
    },
    [query]
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  const getServerSnapshot = useCallback(() => false, [])

  const matches = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return matches
}
