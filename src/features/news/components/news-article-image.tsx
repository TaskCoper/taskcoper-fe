import { cn } from '@/shared/utils'
import { useState } from 'react'

interface NewsArticleImageProps {
  src: string
  alt: string
  seed: string
  className?: string
  loading?: 'eager' | 'lazy'
}

// Hot-linked publisher images can fail when a CDN sets a strict Referer policy.
// On error we fall back to a seeded picsum image so the layout never breaks.
export function NewsArticleImage({ src, alt, seed, className, loading = 'lazy' }: NewsArticleImageProps) {
  const [failed, setFailed] = useState(false)
  const resolvedSrc = failed ? `https://picsum.photos/seed/${seed}/1200/800` : src

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      referrerPolicy='no-referrer'
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
