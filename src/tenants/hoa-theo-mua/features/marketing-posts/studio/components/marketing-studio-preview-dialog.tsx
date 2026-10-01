import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { EyeIcon } from 'lucide-react'
import type { MarketingPostChannel } from '../../types'
import type { MarketingStudioCaptionEdit, MarketingStudioPoolImage } from '../types'
import MarketingPostPreview from '../../components/marketing-post-preview'

// Xem trước để trong modal thay vì nằm luôn trong cột: khung feed cao gần bằng một màn,
// để inline thì nó đẩy mọi thứ khác xuống dưới trong khi phần lớn thời gian admin đang sửa chữ.
const MarketingStudioPreviewDialog = ({
  channel,
  caption,
  images,
  isDisabled
}: {
  channel: MarketingPostChannel
  caption: MarketingStudioCaptionEdit | null
  images: MarketingStudioPoolImage[]
  isDisabled: boolean
}) => {
  const { t } = useTenantTranslation()
  const channelLabel = t(`marketingPosts.channel.${channel}`)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type='button' variant='outline' size='sm' disabled={isDisabled}>
          <EyeIcon />
          {t('marketingPosts.studio.preview.trigger')}
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('marketingPosts.studio.preview.title', { channel: channelLabel })}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[70svh] overflow-y-auto'>
          <MarketingPostPreview channel={channel} caption={caption} images={images} isRegenerating={false} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MarketingStudioPreviewDialog
