import { Button } from '@/components/ui/button'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle2Icon, CircleAlertIcon, LockIcon, SendIcon, TriangleAlertIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import type { MarketingPostChannel, MarketingPostNotReadyReason } from '../../types'
import { getMarketingStudioIssues, hasBlockingIssue } from '../checklist'
import type {
  MarketingStudioChannelDraft,
  MarketingStudioChannelSender,
  MarketingStudioIssue,
  MarketingStudioPoolImage
} from '../types'
import MarketingStudioChannelPublish from './marketing-studio-channel-publish'

function IssueRow({ issue }: { issue: MarketingStudioIssue }) {
  const { t } = useTenantTranslation()
  const isError = issue.level === 'error'

  return (
    <li className={cn('flex items-start gap-1.5 text-xs', isError ? 'text-destructive' : 'text-amber-600')}>
      {isError ? (
        <CircleAlertIcon className='mt-0.5 size-3.5 shrink-0' />
      ) : (
        <TriangleAlertIcon className='mt-0.5 size-3.5 shrink-0' />
      )}
      <span>{t(`marketingPosts.studio.issue.${issue.key}`, issue.values)}</span>
    </li>
  )
}

// Chốt đăng cho cả bài: mỗi kênh tự chọn tài khoản và cách đăng của nó, rồi một nút bấm
// một lần gửi hết những kênh đã đủ điều kiện.
const MarketingStudioPublishPanel = ({
  postId,
  channelDrafts,
  pool,
  isGenerating,
  isEditing,
  failedImageCount,
  notReadyReasons
}: {
  postId?: string
  channelDrafts: MarketingStudioChannelDraft[]
  pool: MarketingStudioPoolImage[]
  isGenerating: boolean
  isEditing: boolean
  failedImageCount: number
  notReadyReasons: Partial<Record<MarketingPostChannel, MarketingPostNotReadyReason[]>>
}) => {
  const { t } = useTenantTranslation()

  // Mỗi hàng kênh tự báo lên nó đã sẵn sàng chưa kèm hàm gửi của riêng nó. Gom ở đây vì
  // hash bản chốt, tài khoản và cách đăng đều là của từng kênh, không dùng chung được.
  const sendersRef = useRef(new Map<MarketingPostChannel, MarketingStudioChannelSender>())
  const [readyChannels, setReadyChannels] = useState<MarketingPostChannel[]>([])
  const [busyChannels, setBusyChannels] = useState<MarketingPostChannel[]>([])

  const register = useCallback((channel: MarketingPostChannel, sender: MarketingStudioChannelSender | null) => {
    if (sender) sendersRef.current.set(channel, sender)
    else sendersRef.current.delete(channel)

    setReadyChannels((previous) => {
      const next = [...sendersRef.current.keys()]

      // Giữ nguyên mảng cũ khi không đổi, không thì mỗi lần con render lại là cha render theo
      return previous.length === next.length && previous.every((item, index) => item === next[index]) ? previous : next
    })
  }, [])

  const registerBusy = useCallback((channel: MarketingPostChannel, isBusy: boolean) => {
    setBusyChannels((previous) => {
      const wasBusy = previous.includes(channel)

      // Giữ nguyên mảng cũ khi không đổi, không thì mỗi lần con render lại là cha render theo
      if (isBusy === wasBusy) return previous

      return isBusy ? [...previous, channel] : previous.filter((item) => item !== channel)
    })
  }, [])

  const channelIssues = channelDrafts.map((channelDraft) => ({
    channelDraft,
    issues: getMarketingStudioIssues(channelDraft, pool, notReadyReasons[channelDraft.channel] ?? [])
  }))

  // Lệnh đăng gọi tới Meta nên chạy vài giây; khoá nút lại trong lúc đó vừa cho thấy nó đã ăn,
  // vừa chặn bấm lần hai (lần hai chỉ ăn 409 vì hash bản chốt đã bị khoá)
  const isSending = busyChannels.length > 0
  const canSend = readyChannels.length > 0 && !isGenerating && !isSending

  const sendAll = () => {
    if (!canSend) return

    sendersRef.current.forEach((send) => send())
  }

  return (
    <section className='space-y-3 rounded-2xl border bg-card p-5 shadow-sm'>
      <div>
        <h2 className='font-bold'>
          {t(isEditing ? 'marketingPosts.studio.publish.editTitle' : 'marketingPosts.studio.publish.title')}
        </h2>
        <p className='mt-0.5 text-xs text-muted-foreground'>
          {t(isEditing ? 'marketingPosts.studio.publish.editDescription' : 'marketingPosts.studio.publish.description')}
        </p>
      </div>

      {/* Sửa gì trong Studio cũng lưu ngay lúc sửa, không còn bước chốt nào nữa */}
      <p className='text-xs text-muted-foreground'>{t('marketingPosts.studio.publish.autoSaved')}</p>

      {/* Ảnh cắt hỏng không chặn đăng - admin có quyền bỏ qua, nhưng phải biết là nó còn đó */}
      {failedImageCount > 0 && (
        <p className='flex items-start gap-1.5 rounded-lg border border-amber-300/60 bg-amber-50 p-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'>
          <TriangleAlertIcon className='mt-0.5 size-3.5 shrink-0' />
          {t('marketingPosts.studio.publish.failedImages', { count: failedImageCount })}
        </p>
      )}

      <div className='space-y-2'>
        {channelIssues.map(({ channelDraft, issues }) => (
          <div key={channelDraft.channel} className='space-y-2 rounded-xl border p-3'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-sm font-medium'>{t(`marketingPosts.channel.${channelDraft.channel}`)}</p>
              {channelDraft.isLocked ? (
                <LockIcon className='size-3.5 text-muted-foreground' />
              ) : (
                issues.length === 0 && <CheckCircle2Icon className='size-4 text-emerald-600' />
              )}
            </div>

            {issues.length > 0 && (
              <ul className='space-y-1'>
                {issues.map((issue) => (
                  <IssueRow key={issue.key} issue={issue} />
                ))}
              </ul>
            )}

            <MarketingStudioChannelPublish
              postId={postId}
              channel={channelDraft.channel}
              isBlockedByChecklist={hasBlockingIssue(issues)}
              onRegister={register}
              onBusyChange={registerBusy}
            />
          </div>
        ))}
      </div>

      {/* Mỗi kênh tự chọn đăng ngay hay hẹn giờ ở hàng của nó; nút này chỉ bấm một lần cho hết */}
      <Button type='button' className='w-full' disabled={!canSend} onClick={sendAll}>
        {isSending ? <Spinner /> : <SendIcon />}
        {isSending
          ? t('marketingPosts.studio.publish.submitting')
          : t('marketingPosts.studio.publish.submitAll', { count: readyChannels.length })}
      </Button>

      {readyChannels.length === 0 && !isSending && (
        <p className='text-xs text-muted-foreground'>{t('marketingPosts.studio.publish.noReadyChannel')}</p>
      )}

      {isGenerating && <p className='text-xs text-muted-foreground'>{t('marketingPosts.studio.publish.waiting')}</p>}
    </section>
  )
}

export default MarketingStudioPublishPanel
