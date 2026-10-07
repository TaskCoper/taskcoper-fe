import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { RotateCcwIcon } from 'lucide-react'
import { useId, useState } from 'react'
import ImageLightbox from '@/tenants/hoa-theo-mua/components/image-lightbox'
import MarketingPostHashtagInput from '../../components/marketing-post-hashtag-input'
import { parseHashtags } from '../../hashtags'
import type { MarketingStudioDraft } from '../types'

// Nội dung gốc sửa được ngay tại đây. Sửa xong chỉ chạy lại phần caption - pool ảnh
// không dính dáng tới chữ nghĩa nên được giữ nguyên, khỏi chờ cắt lại từ đầu.
const MarketingStudioSourcePanel = ({
  draft,
  isBusy,
  pinnedCount,
  channelCount,
  onRegenerateAll
}: {
  draft: MarketingStudioDraft
  isBusy: boolean
  pinnedCount: number
  channelCount: number
  onRegenerateAll: (source: { content: string; hashtags: string[] }) => void
}) => {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const contentId = useId()
  const hashtagsId = useId()

  const [content, setContent] = useState(draft.content)
  const [hashtags, setHashtags] = useState(draft.hashtags.join(' '))
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const trimmedContent = content.trim()
  const parsedHashtags = parseHashtags(hashtags)
  const isDirty = trimmedContent !== draft.content.trim() || parsedHashtags.join(' ') !== draft.hashtags.join(' ')
  // Ghim hết thì chẳng còn kênh nào để viết lại - bấm vào chỉ tổ không thấy gì xảy ra
  const isEveryChannelPinned = channelCount > 0 && pinnedCount >= channelCount

  const submit = async () => {
    if (!trimmedContent) return

    const isConfirmed = await confirm({
      title: t('marketingPosts.studio.source.confirm.title'),
      description: t('marketingPosts.studio.source.confirm.description'),
      confirmText: t('marketingPosts.studio.source.confirm.confirmText'),
      cancelText: t('common.button.cancel')
    })
    if (!isConfirmed) return

    onRegenerateAll({ content: trimmedContent, hashtags: parsedHashtags })
  }

  return (
    <section className='space-y-3 rounded-2xl border bg-card p-5 shadow-sm'>
      <div>
        <h2 className='font-bold'>{t('marketingPosts.studio.source.title')}</h2>
        <p className='mt-0.5 text-xs text-muted-foreground'>{t('marketingPosts.studio.source.description')}</p>
      </div>

      {/* Ảnh gốc admin tải lên - bấm vào xem to để soi trước khi bảo AI cắt lại */}
      {draft.images.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {draft.images.map((image, index) => (
            <button
              key={image.url}
              type='button'
              title={image.name}
              aria-label={t('marketingPosts.studio.source.zoom', { name: image.name })}
              onClick={() => setLightboxIndex(index)}
              className='size-11 cursor-zoom-in overflow-hidden rounded-md border outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring'
            >
              <img src={image.url} alt={image.name} className='size-full object-cover' />
            </button>
          ))}
        </div>
      )}

      <ImageLightbox
        slides={draft.images.map((image) => ({ src: image.url, alt: image.name, description: image.name }))}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        label={t('marketingPosts.studio.lightbox.source')}
      />

      <Field className='gap-1.5'>
        <FieldLabel htmlFor={contentId}>{t('marketingPosts.studio.source.content')}</FieldLabel>
        <Textarea
          id={contentId}
          rows={6}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className='resize-y text-sm'
        />
      </Field>

      <Field className='gap-1.5'>
        <FieldLabel htmlFor={hashtagsId}>{t('marketingPosts.studio.source.hashtags')}</FieldLabel>
        <MarketingPostHashtagInput
          id={hashtagsId}
          value={hashtags}
          onChange={(event) => setHashtags(event.target.value)}
          autoComplete='off'
          placeholder={t('marketingPosts.create.field.hashtagsPlaceholder')}
        />
      </Field>

      <Button
        type='button'
        variant='outline'
        className='w-full'
        disabled={isBusy || !isDirty || !trimmedContent || isEveryChannelPinned}
        onClick={submit}
      >
        <RotateCcwIcon />
        {t('marketingPosts.studio.source.regenerateAll')}
      </Button>

      <p className={cn('text-xs text-muted-foreground', isEveryChannelPinned && 'text-amber-600 dark:text-amber-400')}>
        {isEveryChannelPinned ? (
          t('marketingPosts.studio.source.allPinnedNote')
        ) : (
          <>
            {t('marketingPosts.studio.source.regenerateAllHint')}
            {/* Kênh đã ghim được chừa ra, phải nói trước không admin tưởng nút hỏng */}
            {pinnedCount > 0 && ` ${t('marketingPosts.studio.source.pinnedNote', { count: pinnedCount })}`}
          </>
        )}
      </p>
    </section>
  )
}

export default MarketingStudioSourcePanel
