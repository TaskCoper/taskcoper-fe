import { ImageOffIcon } from 'lucide-react'
import { useState } from 'react'

export function AiCardOutputImage({
  src,
  alt,
  openLabel,
  onOpen
}: {
  src: string | null
  alt: string
  openLabel?: string
  onOpen?: () => void
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasError = Boolean(src && failedSrc === src)

  if (!src || hasError) {
    return (
      <div
        role='img'
        aria-label={alt}
        className='flex aspect-[4/3] w-full items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground'
      >
        <ImageOffIcon className='size-10' aria-hidden='true' />
      </div>
    )
  }

  const image = (
    <img
      src={src}
      alt={alt}
      className='aspect-[4/3] w-full rounded-xl border bg-muted/40 object-contain'
      onError={() => setFailedSrc(src)}
    />
  )

  if (!onOpen) return image

  return (
    <button
      type='button'
      aria-label={openLabel ?? alt}
      onClick={onOpen}
      className='block w-full rounded-xl outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    >
      {image}
    </button>
  )
}
