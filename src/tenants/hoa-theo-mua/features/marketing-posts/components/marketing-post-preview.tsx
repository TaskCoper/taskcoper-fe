import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { HeartIcon, MessageCircleIcon, SendIcon, ThumbsUpIcon } from 'lucide-react'
import { MarketingPostChannel } from '../types'
import type { MarketingPostImageRatio } from '../image-ratios'
import type { MarketingStudioCaptionEdit, MarketingStudioPoolImage } from '../studio/types'

// Trang chi tiết chỉ có sẵn URL ảnh chứ không biết tỉ lệ, nên tỉ lệ là tuỳ chọn:
// thiếu thì để ảnh hiện theo kích thước thật.
type PreviewImage = Pick<MarketingStudioPoolImage, 'id' | 'url' | 'sourceName'> & {
  ratio?: MarketingPostImageRatio
}

function PreviewImages({
  channel,
  images,
  onOpenImage
}: {
  channel: MarketingPostChannel
  images: PreviewImage[]
  onOpenImage?: (index: number) => void
}) {
  const { t } = useTenantTranslation()

  if (images.length === 0) return null

  const [first, ...rest] = images

  // Chỉ bọc trong nút khi nơi dùng thật sự cần bấm (trang chi tiết mở ảnh phóng to).
  // Ở Studio thì preview chỉ để ngắm nên giữ nguyên thẻ ảnh, khỏi thêm vùng bấm thừa.
  const renderImage = (image: PreviewImage, index: number) => {
    const picture = <img src={image.url} alt={image.sourceName} className='size-full object-cover' />

    if (!onOpenImage) return picture

    return (
      <button
        type='button'
        aria-label={t('marketingPosts.detail.openImage', { index: index + 1 })}
        onClick={() => onOpenImage(index)}
        className='size-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
      >
        {picture}
      </button>
    )
  }

  // Instagram chỉ hiện ảnh đầu rồi chấm tròn báo số ảnh, giống carousel thật
  if (channel === MarketingPostChannel.Instagram) {
    return (
      <div className='space-y-2'>
        <div style={{ aspectRatio: first.ratio?.replace(':', ' / ') }} className='w-full bg-muted/40'>
          {renderImage(first, 0)}
        </div>
        {rest.length > 0 && (
          <div className='flex justify-center gap-1 pb-1'>
            {images.map((image, index) => (
              <span
                key={image.id}
                className={cn('size-1.5 rounded-full', index === 0 ? 'bg-primary' : 'bg-muted-foreground/30')}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div style={{ aspectRatio: first.ratio?.replace(':', ' / ') }} className='w-full bg-muted/40'>
        {renderImage(first, 0)}
      </div>
    )
  }

  const visibleRest = rest.slice(0, 3)
  const hiddenCount = rest.length - visibleRest.length

  return (
    <div className='space-y-0.5'>
      <div className='aspect-video w-full bg-muted/40'>{renderImage(first, 0)}</div>
      <div className='grid grid-cols-3 gap-0.5'>
        {visibleRest.map((image, index) => (
          <div key={image.id} className='relative aspect-square bg-muted/40'>
            {renderImage(image, index + 1)}
            {hiddenCount > 0 && index === visibleRest.length - 1 && (
              <span className='pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/55 text-sm font-bold text-background'>
                {t('marketingPosts.studio.preview.moreImages', { count: hiddenCount })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Xem trước giống feed thật của kênh để soát nội dung đúng cái khách sẽ thấy,
// thay vì đọc một cục text trần.
const MarketingPostPreview = ({
  channel,
  caption,
  images,
  isRegenerating,
  onOpenImage
}: {
  channel: MarketingPostChannel
  caption: MarketingStudioCaptionEdit | null
  images: PreviewImage[]
  isRegenerating: boolean
  onOpenImage?: (index: number) => void
}) => {
  const { t } = useTenantTranslation()
  const channelLabel = t(`marketingPosts.channel.${channel}`)

  return (
    <div className='overflow-hidden rounded-2xl border bg-background shadow-sm'>
      <div className='flex items-center gap-2.5 px-4 py-3'>
        <span
          aria-hidden='true'
          className='flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary'
        >
          {channelLabel.charAt(0)}
        </span>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold'>{t(`marketingPosts.channelAccount.${channel}`)}</p>
          <p className='text-xs text-muted-foreground'>{t('marketingPosts.studio.preview.justNow')}</p>
        </div>
      </div>

      {isRegenerating ? (
        <div className='space-y-2 px-4 pb-3'>
          <Skeleton className='h-3.5 w-full' />
          <Skeleton className='h-3.5 w-[92%]' />
          <Skeleton className='h-3.5 w-[70%]' />
        </div>
      ) : caption ? (
        <div className='space-y-2 px-4 pb-3'>
          <p className='text-sm whitespace-pre-line'>{caption.content}</p>
          {caption.hashtags.length > 0 && (
            <p className='text-sm text-sky-700 dark:text-sky-400'>{caption.hashtags.join(' ')}</p>
          )}
        </div>
      ) : (
        <p className='px-4 pb-3 text-sm text-muted-foreground'>{t('marketingPosts.studio.preview.noCaption')}</p>
      )}

      <PreviewImages channel={channel} images={images} onOpenImage={onOpenImage} />

      <div className='flex items-center gap-5 border-t px-4 py-2.5 text-muted-foreground'>
        {channel === MarketingPostChannel.Instagram ? (
          <HeartIcon className='size-4' />
        ) : (
          <ThumbsUpIcon className='size-4' />
        )}
        <MessageCircleIcon className='size-4' />
        <SendIcon className='size-4' />
      </div>
    </div>
  )
}

export default MarketingPostPreview
