import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import type { MarketingPostChannel } from '../../types'

// Bỏ sót nền tảng ở bước tạo bài là chuyện thường. Thêm ngay tại Studio thì chỉ tốn một job
// caption, còn ảnh thì lấy sẵn từ pool chung - không phải nhập lại gì.
const MarketingStudioChannelPicker = ({
  isBusy,
  availableChannels,
  onAddChannel
}: {
  isBusy: boolean
  availableChannels: MarketingPostChannel[]
  onAddChannel: (channel: MarketingPostChannel) => void
}) => {
  const { t } = useTenantTranslation()
  const [isOpen, setIsOpen] = useState(false)

  if (availableChannels.length === 0) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' size='sm' disabled={isBusy} className='shrink-0'>
          <PlusIcon />
          {t('marketingPosts.studio.channelPicker.add')}
        </Button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-64 space-y-2'>
        <div>
          <p className='text-sm font-medium'>{t('marketingPosts.studio.channelPicker.title')}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>{t('marketingPosts.studio.channelPicker.hint')}</p>
        </div>

        <div className='space-y-1'>
          {availableChannels.map((channel) => {
            const channelLabel = t(`marketingPosts.channel.${channel}`)

            return (
              <button
                key={channel}
                type='button'
                onClick={() => {
                  onAddChannel(channel)
                  setIsOpen(false)
                }}
                className='flex w-full items-center gap-2.5 rounded-lg border p-2 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring'
              >
                <span
                  aria-hidden='true'
                  className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'
                >
                  {channelLabel.charAt(0)}
                </span>
                <span className='min-w-0'>
                  <span className='block truncate text-sm font-medium'>{channelLabel}</span>
                  <span className='block truncate text-xs text-muted-foreground'>
                    {t(`marketingPosts.channelAccount.${channel}`)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MarketingStudioChannelPicker
