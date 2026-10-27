import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useState } from 'react'
import ImageLightbox from '../../../components/image-lightbox'
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, MessageCircleIcon, SendIcon, ThumbsUpIcon } from 'lucide-react'
import { MarketingPostChannel } from '../types'
import type { MarketingPostImageRatio } from '../image-ratios'
import type { MarketingStudioCaptionEdit, MarketingStudioPoolImage } from '../studio/types'

type PreviewImage = Pick<MarketingStudioPoolImage, 'id' | 'url' | 'sourceName'> & {
  ratio?: MarketingPostImageRatio
}

// Shared by detail and Studio. These layouts approximate the feed, not the platform's renderer.
function PreviewImages({
  channel,
  images,
  onOpenImage
}: {
  channel: MarketingPostChannel
  images: PreviewImage[]
  onOpenImage: (index: number) => void
}) {
  const { t } = useTenantTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [naturalRatio, setNaturalRatio] = useState<number>()
  if (images.length === 0) return null

  const first = images[0]
  const [width, height] = first.ratio?.split(':').map(Number) ?? []
  const ratio = naturalRatio ?? (width && height ? width / height : 1)
  const current = Math.min(activeIndex, images.length - 1)
  const renderImage = (image: PreviewImage, index: number, intrinsic = false) => (
    <button
      type='button'
      aria-label={t('marketingPosts.detail.openImage', { index: index + 1 })}
      onClick={() => onOpenImage(index)}
      className='block size-full min-h-0 min-w-0 cursor-zoom-in overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
    >
      <img
        src={image.url}
        alt={image.sourceName}
        onLoad={
          index === 0
            ? (event) => {
                const image = event.currentTarget
                if (image.naturalHeight) setNaturalRatio(image.naturalWidth / image.naturalHeight)
              }
            : undefined
        }
        className={cn('block w-full', intrinsic ? 'h-auto' : 'h-full object-cover')}
      />
    </button>
  )

  if (channel === MarketingPostChannel.Instagram) {
    return (
      <div className='space-y-2'>
        <div className='relative w-full overflow-hidden bg-muted/40' style={{ aspectRatio: ratio }}>
          {images.map((image, index) => (
            <div key={image.id} hidden={index !== current} className='size-full'>
              {renderImage(image, index)}
            </div>
          ))}
          {images.length > 1 && (
            <>
              <span
                className='pointer-events-none absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white'
                aria-live='polite'
              >
                {current + 1} / {images.length}
              </span>
              <button
                type='button'
                disabled={current === 0}
                aria-label={t('lightbox.previous')}
                onClick={() => setActiveIndex(current - 1)}
                className='absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow disabled:hidden'
              >
                <ChevronLeftIcon className='size-5' />
              </button>
              <button
                type='button'
                disabled={current === images.length - 1}
                aria-label={t('lightbox.next')}
                onClick={() => setActiveIndex(current + 1)}
                className='absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow disabled:hidden'
              >
                <ChevronRightIcon className='size-5' />
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (images.length === 1) return <div className='w-full bg-muted/40'>{renderImage(first, 0, true)}</div>

  const visible = images.slice(0, 4)
  const hiddenCount = images.length - visible.length
  const threeImages = images.length === 3
  const landscape = ratio > 1
  return (
    <div className={cn('grid grid-cols-2 gap-0.5', images.length === 2 ? 'aspect-[2/1]' : 'aspect-square grid-rows-2')}>
      {visible.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            'relative min-h-0 min-w-0 overflow-hidden bg-muted/40',
            threeImages && index === 0 && (landscape ? 'col-span-2' : 'row-span-2')
          )}
        >
          {renderImage(image, index)}
          {hiddenCount > 0 && index === visible.length - 1 && (
            <span className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-bold text-white'>
              {t('marketingPosts.studio.preview.moreImages', { count: hiddenCount })}
            </span>
          )}
        </div>
      ))}
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
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

      <PreviewImages
        key={JSON.stringify([channel, images.map(({ id, url }) => [id, url])])}
        channel={channel}
        images={images}
        onOpenImage={onOpenImage ?? setLightboxIndex}
      />
      {!onOpenImage && (
        <ImageLightbox
          slides={images.map((image) => ({ src: image.url, alt: image.sourceName }))}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
      )}

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
