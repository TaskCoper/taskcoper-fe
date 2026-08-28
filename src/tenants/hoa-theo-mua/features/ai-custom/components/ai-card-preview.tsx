import { ImageOffIcon } from 'lucide-react'
import { useState } from 'react'

export function AiCardPreview({
  src,
  alt,
  openLabel,
  onOpen
}: {
  src: string | null
  alt: string
  openLabel: string
  onOpen: () => void
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasError = Boolean(src && failedSrc === src)

  if (!src || hasError) {
    return (
      <div
        role='img'
        aria-label={alt}
        className='flex h-16 w-24 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground'
      >
        <ImageOffIcon className='size-5' aria-hidden='true' />
      </div>
    )
  }

  return (
    <button
      type='button'
      onClick={onOpen}
      className='group relative block h-16 w-24 overflow-hidden rounded-lg border bg-muted/40 outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      aria-label={openLabel}
    >
      <img
        src={src}
        alt={alt}
        loading='lazy'
        className='size-full object-cover transition-transform duration-200 group-hover:scale-105'
        onError={() => setFailedSrc(src)}
      />
    </button>
  )
}
