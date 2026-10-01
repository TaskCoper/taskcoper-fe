import { Badge } from '@/components/ui/badge'
import { cn } from '@/shared/utils'
import { useState } from 'react'

// Các tỉ lệ hay gặp khi đăng social. Ảnh thật hiếm khi đúng số tròn nên phải snap về nhãn gần nhất,
// không thì 1200x630 sẽ hiện thành 40:21 - đúng về toán nhưng không ai đọc ra được.
const COMMON_RATIOS = [
  { label: '9:16', value: 9 / 16 },
  { label: '2:3', value: 2 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '4:5', value: 4 / 5 },
  { label: '1:1', value: 1 },
  { label: '5:4', value: 5 / 4 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '1.91:1', value: 1.91 },
  { label: '21:9', value: 21 / 9 },
  { label: '8:3', value: 8 / 3 }
]

const RATIO_TOLERANCE = 0.02

const formatAspectRatio = (width: number, height: number) => {
  if (!width || !height) return null

  const ratio = width / height
  const closest = COMMON_RATIOS.reduce((best, item) =>
    Math.abs(item.value - ratio) < Math.abs(best.value - ratio) ? item : best
  )

  // Lệch quá ngưỡng thì hiện số thực, ép vào nhãn gần nhất sẽ sai thấy rõ
  if (Math.abs(closest.value - ratio) / ratio <= RATIO_TOLERANCE) return closest.label

  return ratio >= 1 ? `${ratio.toFixed(2)}:1` : `1:${(1 / ratio).toFixed(2)}`
}

const MarketingPostGalleryImage = ({
  src,
  alt,
  openLabel,
  onOpen,
  className
}: {
  src: string
  alt: string
  openLabel: string
  onOpen: () => void
  className?: string
}) => {
  const [aspectRatio, setAspectRatio] = useState<string | null>(null)

  return (
    <button
      type='button'
      aria-label={openLabel}
      onClick={onOpen}
      className={cn(
        'relative block w-full rounded-xl outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        loading='lazy'
        onLoad={(event) =>
          setAspectRatio(formatAspectRatio(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight))
        }
        className='h-auto w-full rounded-xl border bg-muted/40'
      />

      {aspectRatio && (
        <Badge
          variant='outline'
          className='absolute right-2 bottom-2 bg-background/90 font-mono text-[0.7rem] font-normal shadow-sm backdrop-blur-sm'
        >
          {aspectRatio}
        </Badge>
      )}
    </button>
  )
}

export default MarketingPostGalleryImage
