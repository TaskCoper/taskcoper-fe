import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { marketingPostImageRatios, type MarketingPostImageRatio } from '../../image-ratios'
import type { CreateMarketingPostImage } from '../../types'

interface PendingRatio {
  sourceIndex: number
  ratio: MarketingPostImageRatio
}

const toKey = ({ sourceIndex, ratio }: PendingRatio) => `${sourceIndex}|${ratio}`

// Chọn bao nhiêu tỉ lệ cũng được rồi cắt một lượt. Bấm phát đóng luôn thì muốn thêm ba tỉ lệ
// phải mở popover ba lần.
const MarketingStudioRatioAdder = ({
  isBusy,
  sourceImages,
  onAddImageRatios
}: {
  isBusy: boolean
  sourceImages: CreateMarketingPostImage[]
  onAddImageRatios: (entries: PendingRatio[]) => void
}) => {
  const { t } = useTenantTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [pending, setPending] = useState<PendingRatio[]>([])

  if (sourceImages.length === 0) return null

  const togglePending = (entry: PendingRatio) => {
    setPending((previous) =>
      previous.some((item) => toKey(item) === toKey(entry))
        ? previous.filter((item) => toKey(item) !== toKey(entry))
        : [...previous, entry]
    )
  }

  const submit = () => {
    onAddImageRatios(pending)
    setIsOpen(false)
    setPending([])
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        // Đóng giữa chừng thì bỏ luôn phần đang chọn, mở lại không dính lựa chọn cũ
        if (!open) setPending([])
      }}
    >
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' size='sm' disabled={isBusy} className='h-7 px-2 text-xs'>
          <PlusIcon className='size-3' />
          {t('marketingPosts.studio.ratioAdder.add')}
        </Button>
      </PopoverTrigger>

      <PopoverContent align='start' className='w-72 space-y-3'>
        <p className='text-sm font-medium'>{t('marketingPosts.studio.ratioAdder.title')}</p>

        <div className='space-y-3'>
          {sourceImages.map((image, sourceIndex) => (
            <div key={image.url} className='space-y-1.5'>
              <div className='flex items-center gap-2'>
                <img src={image.url} alt={image.name} className='size-8 rounded border object-cover' />
                <p className='min-w-0 truncate text-xs font-medium'>{image.name}</p>
              </div>

              <div className='flex flex-wrap gap-1'>
                {marketingPostImageRatios.map((ratio) => {
                  const entry = { sourceIndex, ratio }
                  const isGenerated = image.ratios.includes(ratio)
                  const isPending = pending.some((item) => toKey(item) === toKey(entry))

                  return (
                    <button
                      key={ratio}
                      type='button'
                      disabled={isGenerated}
                      aria-pressed={isPending}
                      title={
                        isGenerated
                          ? t('marketingPosts.studio.ratioAdder.alreadyGenerated')
                          : t('marketingPosts.studio.ratioAdder.generate', { name: image.name, ratio })
                      }
                      onClick={() => togglePending(entry)}
                      className={cn(
                        'rounded-full border px-2 py-0.5 font-mono text-[0.7rem] transition-colors',
                        isGenerated && 'cursor-not-allowed border-dashed text-muted-foreground/50',
                        !isGenerated && !isPending && 'hover:border-primary hover:bg-primary/10 hover:text-primary',
                        isPending && 'border-primary bg-primary/10 text-primary'
                      )}
                    >
                      {ratio}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <Button type='button' size='sm' className='w-full' disabled={pending.length === 0} onClick={submit}>
          {t('marketingPosts.studio.ratioAdder.submit', { count: pending.length })}
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export default MarketingStudioRatioAdder
