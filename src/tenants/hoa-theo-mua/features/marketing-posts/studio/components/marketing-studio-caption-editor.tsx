import { Button } from '@/components/ui/button'
import MarketingPostHashtagInput from '../../components/marketing-post-hashtag-input'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { PlusIcon, RotateCcwIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { parseHashtags } from '../../hashtags'
import type { MarketingPostChannel } from '../../types'
import { getMarketingHashtagSuggestions } from '../hashtag-suggestions'
import type { MarketingStudioCaptionEdit } from '../types'

// Sửa tay đè lên bản AI, và hashtag chỉnh riêng cho từng kênh - Instagram cần nhiều,
// Zalo OA gần như không dùng, nên không thể để chung một bộ.
const MarketingStudioCaptionEditor = ({
  channel,
  caption,
  captionMax,
  isEdited,
  isLocked,
  onChange,
  onRevert
}: {
  channel: MarketingPostChannel
  caption: MarketingStudioCaptionEdit
  captionMax: number
  isEdited: boolean
  isLocked: boolean
  onChange: (edit: MarketingStudioCaptionEdit) => void
  onRevert: () => void
}) => {
  const { t } = useTenantTranslation()
  const [hashtagInput, setHashtagInput] = useState('')
  const suggestions = isLocked ? [] : getMarketingHashtagSuggestions(channel, caption.hashtags)

  const setHashtags = (hashtags: string[]) => onChange({ ...caption, hashtags: [...new Set(hashtags)] })

  // Gõ tay rồi Enter hoặc dấu phẩy là thành chip. Phải có dấu '#' mới tính - chữ trần bị bỏ qua,
  // giống hệt ô hashtag ở trang tạo bài.
  const commitHashtagInput = () => {
    const parsed = parseHashtags(hashtagInput)
    if (parsed.length === 0) return

    setHashtags([...caption.hashtags, ...parsed])
    setHashtagInput('')
  }

  return (
    <div className='space-y-2.5'>
      <Textarea
        rows={7}
        value={caption.content}
        readOnly={isLocked}
        onChange={(event) => onChange({ ...caption, content: event.target.value })}
        className='resize-y text-sm'
      />

      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap gap-1'>
          {caption.hashtags.map((hashtag) => (
            <span
              key={hashtag}
              className='flex items-center gap-0.5 rounded-full border border-sky-200 bg-sky-50 py-0.5 pr-0.5 pl-2 text-xs font-medium text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
            >
              {hashtag}
              <button
                type='button'
                disabled={isLocked}
                aria-label={t('marketingPosts.studio.caption.removeHashtag', { hashtag })}
                onClick={() => setHashtags(caption.hashtags.filter((item) => item !== hashtag))}
                className='rounded-full p-0.5 text-sky-600/70 transition-colors hover:bg-background hover:text-destructive dark:text-sky-400/70'
              >
                <XIcon className='size-3' />
              </button>
            </span>
          ))}
        </div>

        <p
          className={cn(
            'ml-auto font-mono text-xs text-muted-foreground',
            caption.content.length > captionMax && 'text-destructive'
          )}
        >
          {caption.content.length}/{captionMax}
        </p>
      </div>

      {!isLocked && (
        <MarketingPostHashtagInput
          value={hashtagInput}
          onChange={(event) => setHashtagInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ',') return

            // Enter trong form sẽ submit, dấu phẩy thì lọt vào tên tag - chặn cả hai
            event.preventDefault()
            commitHashtagInput()
          }}
          onBlur={commitHashtagInput}
          autoComplete='off'
          placeholder={t('marketingPosts.studio.caption.hashtagPlaceholder')}
          className='h-8 text-sm'
        />
      )}

      {suggestions.length > 0 && (
        <div className='flex flex-wrap items-center gap-1'>
          <span className='text-xs text-muted-foreground'>{t('marketingPosts.studio.caption.suggestHashtags')}</span>
          {suggestions.map((hashtag) => (
            <button
              key={hashtag}
              type='button'
              onClick={() => setHashtags([...caption.hashtags, hashtag])}
              className='flex items-center gap-0.5 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary'
            >
              <PlusIcon className='size-3' />
              {hashtag}
            </button>
          ))}
        </div>
      )}

      {isEdited && (
        <div className='flex items-center justify-between gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-2.5 py-1.5 dark:border-amber-900/60 dark:bg-amber-950/30'>
          <p className='text-xs text-amber-700 dark:text-amber-300'>{t('marketingPosts.studio.caption.edited')}</p>
          <Button type='button' variant='ghost' size='sm' onClick={onRevert} className='h-6 px-2 text-xs'>
            <RotateCcwIcon className='size-3' />
            {t('marketingPosts.studio.caption.revert')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default MarketingStudioCaptionEditor
