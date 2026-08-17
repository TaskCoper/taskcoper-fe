import type { ImageViewport } from './types'

// No runtime imports here — see the note in `viewport-url.ts`.

/** Absolute placement of the `<img>` inside its container, in CSS pixels. */
export type ViewportLayout = {
  left: number
  top: number
  width: number
  height: number
}

export type ResolveViewportLayoutParams = {
  viewport: ImageViewport
  /** Container size in CSS pixels. */
  containerWidth: number
  containerHeight: number
  /** Intrinsic size of the loaded image. */
  naturalWidth: number
  naturalHeight: number
}

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

/**
 * Places an image so that `viewport` is the part on show, scaling both axes by one factor and
 * clamping so the image never pulls away from an edge. Exact when the container's aspect matches
 * the viewport's; otherwise the region covers the container and overflows on the other axis
 * (cover semantics applied to the region, never letterboxed or stretched). Returns `null` for
 * unusable input so the caller can fall back to plain `object-cover`.
 */
export const resolveViewportLayout = ({
  viewport,
  containerWidth,
  containerHeight,
  naturalWidth,
  naturalHeight
}: ResolveViewportLayoutParams): ViewportLayout | null => {
  const x = viewport.x / 100
  const y = viewport.y / 100
  const w = viewport.w / 100
  const h = viewport.h / 100

  // Written as a positive assertion so `NaN` fails it too.
  const isUsable = w > 0 && h > 0 && containerWidth > 0 && containerHeight > 0 && naturalWidth > 0 && naturalHeight > 0
  if (!isUsable) return null

  const naturalAspect = naturalWidth / naturalHeight
  const rectAspect = (w / h) * naturalAspect

  const widthLimited = containerWidth / containerHeight >= rectAspect
  const width = widthLimited ? containerWidth / w : (containerHeight / h) * naturalAspect
  const height = widthLimited ? width / naturalAspect : containerHeight / h

  return {
    left: clamp(containerWidth / 2 - (x + w / 2) * width, Math.min(containerWidth - width, 0), 0),
    top: clamp(containerHeight / 2 - (y + h / 2) * height, Math.min(containerHeight - height, 0), 0),
    width,
    height
  }
}
