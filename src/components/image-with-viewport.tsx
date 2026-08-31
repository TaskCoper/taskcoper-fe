import { useElementSize } from '@/hooks/use-element-size'
import { decodeImageViewport, resolveViewportLayout, type ImageViewport } from '@/lib/image-viewport'
import { useStagedUpload } from '@/lib/staged-uploads'
import { cn } from '@/shared/utils'
import { useCallback, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'

export type ImageWithViewportProps = {
  /** May carry an `#iv=` fragment; it is stripped before reaching `<img src>`. */
  src: string
  /** Overrides the framing `src` carries; pass for staged `blob:` previews, which have no fragment to read from. */
  viewport?: ImageViewport | null
  alt?: string
  /** Applied to the box. The caller owns its aspect, rounding and background. */
  className?: string
  /** Also applied to the box - for an aspect that is computed rather than a static utility class. */
  style?: CSSProperties
  imgClassName?: string
  loading?: 'eager' | 'lazy'
  /** Rendered in place of the image when `src` is empty. */
  fallback?: ReactNode
}

/**
 * Renders an image showing only the region its viewport selects, using CSS alone; the asset
 * itself is never modified.
 *
 * Falls back to plain `object-cover` whenever a framing can't be produced (no viewport, still
 * loading, unmeasured box, malformed fragment) - matching pre-viewport behavior exactly.
 */
export function ImageWithViewport({
  src,
  viewport,
  alt = '',
  className,
  style,
  imgClassName,
  loading = 'lazy',
  fallback = null
}: ImageWithViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)
  const [measuredSrc, setMeasuredSrc] = useState('')

  const decoded = useMemo(() => decodeImageViewport(src), [src])
  const stagedUpload = useStagedUpload(src)

  // An explicit prop wins; otherwise a staged file's framing comes from the registry (its `blob:` URL can't carry one).
  const activeViewport = viewport !== undefined ? viewport : stagedUpload ? stagedUpload.viewport : decoded.viewport

  const { width: containerWidth, height: containerHeight } = useElementSize(containerRef)

  // Reset the moment `src` changes so a stale aspect never applies to the new image. Done during
  // render, not in an effect, to avoid painting one frame with the wrong framing first.
  if (measuredSrc !== decoded.src) {
    setMeasuredSrc(decoded.src)
    setNatural(null)
  }

  // A cached or reused image can already be complete before `onLoad` would fire for it.
  const readNaturalSize = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setNatural({ width: image.naturalWidth, height: image.naturalHeight })
    }
  }, [])

  const layout = useMemo(() => {
    if (!activeViewport || !natural) return null

    return resolveViewportLayout({
      viewport: activeViewport,
      containerWidth,
      containerHeight,
      naturalWidth: natural.width,
      naturalHeight: natural.height
    })
  }, [activeViewport, natural, containerWidth, containerHeight])

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)} style={style}>
      {decoded.src ? (
        <img
          ref={readNaturalSize}
          src={decoded.src}
          alt={alt}
          loading={loading}
          onLoad={(event) =>
            setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })
          }
          // `max-w-none` needed: Tailwind's preflight caps images at max-width:100%, shrinking one meant to overflow its box.
          className={cn(layout ? 'absolute max-w-none' : 'size-full object-cover', imgClassName)}
          style={
            layout ? { left: layout.left, top: layout.top, width: layout.width, height: layout.height } : undefined
          }
        />
      ) : (
        fallback
      )}
    </div>
  )
}
