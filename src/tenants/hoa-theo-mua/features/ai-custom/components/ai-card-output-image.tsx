import { cn } from '@/shared/utils'
import { ImageOffIcon, ZoomInIcon } from 'lucide-react'
import { useState } from 'react'

const AiCardOutputImage = ({
  src,
  alt,
  openLabel,
  onOpen,
  className,
  imageClassName,
  placeholderClassName,
  showZoomOverlay = false
}: {
  src: string | null
  alt: string
  openLabel?: string
  onOpen?: () => void
  className?: string
  imageClassName?: string
  placeholderClassName?: string
  showZoomOverlay?: boolean
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasError = Boolean(src && failedSrc === src)

  if (!src || hasError) {
    return (
      <div
        role='img'
        aria-label={alt}
        className={cn(
          'flex aspect-[4/3] w-full items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground',
          className,
          placeholderClassName
        )}
      >
        <ImageOffIcon className='size-10' aria-hidden='true' />
      </div>
    )
  }

  const image = (
    <img
      src={src}
      alt={alt}
      className={cn('aspect-[4/3] w-full rounded-xl border bg-muted/40 object-contain', imageClassName)}
      onError={() => setFailedSrc(src)}
    />
  )

  if (!onOpen) return image

  return (
    <button
      type='button'
      aria-label={openLabel ?? alt}
      onClick={onOpen}
      className={cn(
        'group relative block w-full overflow-hidden rounded-xl outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      {image}
      {showZoomOverlay && (
        <span className='absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/25 group-hover:opacity-100 group-focus-visible:bg-black/25 group-focus-visible:opacity-100'>
          <span className='flex size-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-sm'>
            <ZoomInIcon className='size-5' aria-hidden='true' />
          </span>
        </span>
      )}
    </button>
  )
}

export default AiCardOutputImage
