import { useLayoutEffect, useState, type RefObject } from 'react'

export type ElementSize = {
  width: number
  height: number
}

const EMPTY_SIZE: ElementSize = { width: 0, height: 0 }

/**
 * Tracks the border-box size of an element.
 *
 * Returns `{ width: 0, height: 0 }` until the first measurement, which callers should treat as
 * "not measured yet" rather than "empty" and fall back accordingly.
 */
export const useElementSize = <T extends HTMLElement>(ref: RefObject<T | null>): ElementSize => {
  const [size, setSize] = useState<ElementSize>(EMPTY_SIZE)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const apply = (width: number, height: number) => {
      // Rounding and bailing on no-ops keeps sub-pixel reflows from looping the observer.
      const next = { width: Math.round(width), height: Math.round(height) }
      setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next))
    }

    const rect = element.getBoundingClientRect()
    apply(rect.width, rect.height)

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const box = entry.borderBoxSize?.[0]
      if (box) apply(box.inlineSize, box.blockSize)
      else apply(entry.contentRect.width, entry.contentRect.height)
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [ref])

  return size
}
