import { cn } from '@/shared/utils'
import { marketingPostImageRatioSizes, marketingPostImageRatios, type MarketingPostImageRatio } from '../image-ratios'

// Khung xem trước nhỏ vẽ đúng hình dạng của tỉ lệ, giúp nhìn phát là biết ảnh sẽ ra dọc hay ngang
function RatioPreview({ ratio, isSelected }: { ratio: MarketingPostImageRatio; isSelected: boolean }) {
  const { width, height } = marketingPostImageRatioSizes[ratio]
  const scale = 26 / Math.max(width, height)

  return (
    <div className='flex h-8 items-center justify-center'>
      <div
        style={{ width: width * scale, height: height * scale }}
        className={cn('rounded-[3px] transition-colors', isSelected ? 'bg-primary' : 'bg-muted-foreground/35')}
      />
    </div>
  )
}

const MarketingPostRatioPicker = ({
  value,
  onChange,
  describedBy
}: {
  value: MarketingPostImageRatio[]
  onChange: (ratios: MarketingPostImageRatio[]) => void
  describedBy?: string
}) => {
  const toggleRatio = (ratio: MarketingPostImageRatio) => {
    onChange(value.includes(ratio) ? value.filter((selected) => selected !== ratio) : [...value, ratio])
  }

  return (
    <div aria-describedby={describedBy} className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>
      {marketingPostImageRatios.map((ratio) => {
        const isSelected = value.includes(ratio)
        const { width, height } = marketingPostImageRatioSizes[ratio]

        return (
          <button
            key={ratio}
            type='button'
            aria-pressed={isSelected}
            onClick={() => toggleRatio(ratio)}
            className={cn(
              'rounded-lg border px-2 py-2 text-center transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring',
              isSelected && 'border-primary bg-primary/5 hover:bg-primary/5'
            )}
          >
            <RatioPreview ratio={ratio} isSelected={isSelected} />
            <p className={cn('mt-1 font-mono text-xs font-medium', isSelected && 'text-primary')}>{ratio}</p>
            <p className='font-mono text-[0.65rem] text-muted-foreground'>
              {width} × {height}
            </p>
          </button>
        )
      })}
    </div>
  )
}

export default MarketingPostRatioPicker
