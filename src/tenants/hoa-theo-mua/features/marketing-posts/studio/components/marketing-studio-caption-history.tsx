import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { HistoryIcon } from 'lucide-react'
import type { MarketingStudioChannelDraft } from '../types'

// Mỗi lượt AI viết là một mục, kèm hướng điều chỉnh đã yêu cầu để biết vì sao ra bản đó.
const MarketingStudioCaptionHistory = ({
  channelDraft,
  isLocked,
  onSelectRevision
}: {
  channelDraft: MarketingStudioChannelDraft
  // Bài đã đăng thì backend từ chối đổi bản chốt (409). Vẫn cho xem lại lịch sử, chỉ không
  // cho bấm chọn - bấm vào chỉ ăn toast lỗi chứ không đổi được gì.
  isLocked: boolean
  onSelectRevision: (revision: number) => void
}) => {
  const { t } = useTenantTranslation()

  if (channelDraft.revisions.length <= 1) return null

  const activeIndex = channelDraft.revisions.findIndex((revision) => revision.revision === channelDraft.activeRevision)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          className='flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted'
        >
          <HistoryIcon className='size-3' />
          {t('marketingPosts.studio.captionHistory.badge', {
            current: activeIndex + 1,
            total: channelDraft.revisions.length
          })}
        </button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-72 space-y-2'>
        <div>
          <p className='text-sm font-medium'>{t('marketingPosts.studio.captionHistory.title')}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            {t(
              isLocked ? 'marketingPosts.studio.captionHistory.lockedHint' : 'marketingPosts.studio.captionHistory.hint'
            )}
          </p>
        </div>

        <div className='space-y-1'>
          {channelDraft.revisions.map((revision, index) => {
            const isActive = revision.revision === channelDraft.activeRevision
            const askedFor = [
              ...revision.tweaks.map((tweak) => t(`marketingPosts.studio.regenerate.tweak.${tweak}`)),
              revision.note
            ].filter(Boolean)

            return (
              <button
                key={revision.revision}
                type='button'
                aria-pressed={isActive}
                disabled={isLocked}
                onClick={() => onSelectRevision(revision.revision)}
                className={cn(
                  'w-full rounded-lg border p-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'border-primary bg-primary/5' : 'hover:bg-muted',
                  isLocked && 'cursor-not-allowed opacity-60 hover:bg-transparent'
                )}
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className={cn('text-xs font-medium', isActive && 'text-primary')}>
                    {t('marketingPosts.studio.captionHistory.entry', { index: index + 1 })}
                  </span>
                  <span className='font-mono text-[0.65rem] text-muted-foreground'>
                    {formatTime(revision.createdAt)}
                  </span>
                </div>

                <p className='mt-0.5 truncate text-[0.7rem] text-muted-foreground'>
                  {askedFor.length > 0
                    ? t('marketingPosts.studio.captionHistory.askedFor', { asked: askedFor.join(', ') })
                    : t('marketingPosts.studio.captionHistory.firstRun')}
                </p>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MarketingStudioCaptionHistory
