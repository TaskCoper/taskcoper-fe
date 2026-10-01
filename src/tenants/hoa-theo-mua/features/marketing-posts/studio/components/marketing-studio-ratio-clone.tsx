import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { CropIcon } from 'lucide-react'
import { useState } from 'react'
import type { MarketingPostImageRatio } from '../../image-ratios'

// Ưng một bản cắt rồi muốn có đúng kiểu đó ở tỉ lệ khác. Backend không cho lấy bản 1:1
// làm gốc cho bản 9:16 ("Source image does not match the requested ratio"), nên chỉ cắt lại
// được từ ảnh gốc - bù lại mang theo đúng yêu cầu đã tạo ra bản đang ưng.
const MarketingStudioRatioClone = ({
  ratio,
  isBusy,
  availableRatios,
  note,
  onClone
}: {
  ratio: MarketingPostImageRatio
  isBusy: boolean
  availableRatios: MarketingPostImageRatio[]
  note: string
  onClone: (ratio: MarketingPostImageRatio) => void
}) => {
  const { t } = useTenantTranslation()
  const [isOpen, setIsOpen] = useState(false)

  if (availableRatios.length === 0) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={isBusy}
          title={t('marketingPosts.studio.ratioClone.trigger')}
          className='flex items-center gap-0.5 rounded border px-1 font-mono text-[0.6rem] text-muted-foreground transition-colors hover:bg-muted'
        >
          <CropIcon className='size-2.5' />
          {t('marketingPosts.studio.ratioClone.badge')}
        </button>
      </PopoverTrigger>

      <PopoverContent side='right' align='start' collisionPadding={12} className='w-64 space-y-2'>
        <div>
          <p className='text-sm font-medium'>{t('marketingPosts.studio.ratioClone.title', { ratio })}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            {note
              ? t('marketingPosts.studio.ratioClone.withNote', { note })
              : t('marketingPosts.studio.ratioClone.description')}
          </p>
        </div>

        <div className='flex flex-wrap gap-1'>
          {availableRatios.map((item) => (
            <Button
              key={item}
              type='button'
              variant='outline'
              size='sm'
              className='h-7 px-2 font-mono text-[0.7rem]'
              onClick={() => {
                onClone(item)
                setIsOpen(false)
              }}
            >
              {item}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MarketingStudioRatioClone
