import { ImageOffIcon } from 'lucide-react'
import { useState } from 'react'

export function AiCardOutputImage({ src, alt }: { src: string | null; alt: string }) {
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

  return (
    <img
      src={src}
      alt={alt}
      className='aspect-[4/3] w-full rounded-xl border bg-muted/40 object-contain'
      onError={() => setFailedSrc(src)}
    />
  )
}
