import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sortable, SortableContent, SortableItem, SortableItemHandle } from '@/components/ui/sortable'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import ImageLightbox from '@/tenants/hoa-theo-mua/components/image-lightbox'
import { LockIcon, PinIcon, PinOffIcon, XIcon, ZoomInIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { MarketingPostChannel } from '../../types'
import { marketingPostChannelRules } from '../channel-rules'
import { isMarketingStudioCaptionEdited, resolveChannelImages, resolveMarketingStudioCaption } from '../checklist'
import type {
  MarketingStudioCaptionEdit,
  MarketingStudioChannelDraft,
  MarketingStudioPoolImage,
  MarketingStudioTweak
} from '../types'
import MarketingStudioCaptionEditor from './marketing-studio-caption-editor'
import MarketingStudioCaptionHistory from './marketing-studio-caption-history'
import MarketingStudioPreviewDialog from './marketing-studio-preview-dialog'
import MarketingStudioRegenerate from './marketing-studio-regenerate'

const MarketingStudioChannelPanel = ({
  channel,
  templateEditor,
  channelDraft,
  pool,
  isRegenerating,
  onRegenerate,
  onReorderImages,
  onToggleImage,
  onUpdateCaption,
  onRevertCaption,
  onTogglePin,
  onSelectRevision
}: {
  channel: MarketingPostChannel
  templateEditor?: ReactNode
  channelDraft?: MarketingStudioChannelDraft
  pool: MarketingStudioPoolImage[]
  isRegenerating: boolean
  onRegenerate: (options: { tweaks: MarketingStudioTweak[]; note: string; source: string | null }) => void
  onReorderImages: (imageIds: string[]) => void
  onToggleImage: (imageId: string) => void
  onUpdateCaption: (edit: MarketingStudioCaptionEdit) => void
  onRevertCaption: () => void
  onTogglePin: () => void
  onSelectRevision: (revision: number) => void
}) => {
  const { t } = useTenantTranslation()
  const { captionMax, maxImages } = marketingPostChannelRules[channel]
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!channelDraft) {
    return (
      <div className='space-y-3 rounded-2xl border bg-card p-5 shadow-sm'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-24 w-full rounded-xl' />
        <Skeleton className='h-64 w-full rounded-xl' />
      </div>
    )
  }

  const { isLocked } = channelDraft
  const caption = resolveMarketingStudioCaption(channelDraft)
  const isEdited = isMarketingStudioCaptionEdited(channelDraft)
  const selectedImages = resolveChannelImages(channelDraft, pool)

  return (
    <div className='space-y-5'>
      {channelDraft.isScheduled && (
        <p className='rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground'>
          {t('marketingPosts.studio.scheduledEditNotice')}
        </p>
      )}
      {/* Nói thẳng lý do khóa, không thì admin bấm mãi không ăn rồi tưởng hỏng */}
      {isLocked && (
        <p className='flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200'>
          <LockIcon className='mt-0.5 size-4 shrink-0' />
          {t('marketingPosts.studio.locked.notice')}
        </p>
      )}

      <section className='space-y-3 rounded-2xl border bg-card p-5 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='font-bold'>{t('marketingPosts.studio.caption.title')}</h2>
              {/* Mỗi lượt AI ra đúng một bài, lượt cũ nằm trong lịch sử này */}
              <MarketingStudioCaptionHistory
                channelDraft={channelDraft}
                isLocked={isLocked}
                onSelectRevision={onSelectRevision}
              />
            </div>
            <p className='mt-0.5 text-xs text-muted-foreground'>{t('marketingPosts.studio.caption.description')}</p>
          </div>

          <div className='flex items-center gap-1'>
            <MarketingStudioPreviewDialog
              channel={channel}
              caption={caption}
              images={selectedImages}
              isDisabled={isRegenerating}
            />

            <Button
              type='button'
              variant={channelDraft.isPinned ? 'secondary' : 'ghost'}
              size='sm'
              aria-pressed={channelDraft.isPinned}
              disabled={isLocked}
              title={t('marketingPosts.studio.pin.hint')}
              onClick={onTogglePin}
              className={cn(channelDraft.isPinned && 'text-primary')}
            >
              {channelDraft.isPinned ? <PinIcon /> : <PinOffIcon />}
              {t(channelDraft.isPinned ? 'marketingPosts.studio.pin.pinned' : 'marketingPosts.studio.pin.pin')}
            </Button>

            <MarketingStudioRegenerate
              isBusy={isRegenerating || isLocked || Boolean(channelDraft.isScheduled)}
              sources={channelDraft.revisions.map((revision, index) => ({
                value: revision.generationId,
                label: t('marketingPosts.studio.captionHistory.entry', { index: index + 1 })
              }))}
              onRegenerate={onRegenerate}
            />
          </div>
        </div>

        {isRegenerating ? (
          <div className='space-y-2'>
            <Skeleton className='h-32 w-full rounded-xl' />
            <Skeleton className='h-8 w-full rounded-lg' />
          </div>
        ) : (
          caption && (
            <MarketingStudioCaptionEditor
              channel={channel}
              caption={caption}
              captionMax={captionMax}
              isEdited={isEdited}
              // AI đang viết lại thì gõ vào đây cũng bị bản mới đè lên, khoá luôn cho gọn
              isLocked={isLocked || isRegenerating}
              onChange={onUpdateCaption}
              onRevert={onRevertCaption}
            />
          )
        )}
      </section>

      {templateEditor}

      <section className='space-y-3 rounded-2xl border bg-card p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='font-bold'>{t('marketingPosts.studio.selected.title')}</h2>
            <p className='mt-0.5 text-xs text-muted-foreground'>{t('marketingPosts.studio.selected.description')}</p>
          </div>
          <Badge
            variant='outline'
            className={cn(
              'font-mono font-normal',
              selectedImages.length > maxImages && 'border-destructive text-destructive'
            )}
          >
            {selectedImages.length}/{maxImages}
          </Badge>
        </div>

        {selectedImages.length === 0 ? (
          <p className='rounded-xl border border-dashed p-5 text-center text-xs text-muted-foreground'>
            {t('marketingPosts.studio.selected.empty')}
          </p>
        ) : (
          <Sortable
            value={selectedImages}
            onValueChange={(images) => onReorderImages(images.map((image) => image.id))}
            getItemValue={(image) => image.id}
            orientation='mixed'
          >
            <SortableContent asChild>
              <div className='flex flex-wrap gap-2'>
                {selectedImages.map((image, index) => (
                  <SortableItem
                    key={image.id}
                    value={image.id}
                    disabled={isLocked || Boolean(channelDraft.imageTemplateId)}
                    asChild
                  >
                    <div className='relative size-18 overflow-hidden rounded-lg border bg-muted/30'>
                      <SortableItemHandle asChild>
                        <button
                          type='button'
                          aria-label={t('marketingPosts.studio.selected.reorder', { name: image.sourceName })}
                          className='size-full cursor-grab active:cursor-grabbing'
                        >
                          <img src={image.url} alt={image.sourceName} className='size-full object-cover' />
                        </button>
                      </SortableItemHandle>

                      <span className='absolute top-1 left-1 flex size-4.5 items-center justify-center rounded-full bg-foreground/70 text-[0.6rem] font-bold text-background'>
                        {index + 1}
                      </span>

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        aria-label={t('marketingPosts.studio.selected.remove', { name: image.sourceName })}
                        disabled={isLocked || Boolean(channelDraft.imageTemplateId)}
                        onClick={() => onToggleImage(image.id)}
                        className='absolute top-0.5 right-0.5 size-5 rounded-full bg-background/85 hover:bg-background'
                      >
                        <XIcon className='size-3' />
                      </Button>

                      {/* Ô này kéo để xếp thứ tự, nên muốn soi ảnh phải bấm nút riêng.
                          Bài đã đăng thì ô bị khoá kéo thả (pointer-events-none) - xem ảnh
                          vẫn phải bấm được nên nút này tự bật lại pointer events cho mình. */}
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        aria-label={t('marketingPosts.studio.selected.zoom', { name: image.sourceName })}
                        onClick={() => setLightboxIndex(index)}
                        className='pointer-events-auto absolute right-0.5 bottom-0.5 size-5 rounded-full bg-background/85 hover:bg-background'
                      >
                        <ZoomInIcon className='size-3' />
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContent>
          </Sortable>
        )}

        <ImageLightbox
          slides={selectedImages.map((image) => ({
            src: image.url,
            alt: image.sourceName,
            description: t('marketingPosts.studio.pool.caption', { name: image.sourceName, ratio: image.ratio })
          }))}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          label={t('marketingPosts.studio.lightbox.selected')}
        />
      </section>
    </div>
  )
}

export default MarketingStudioChannelPanel
