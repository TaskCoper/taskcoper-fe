import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CircleAlertIcon, InfoIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import { usePlatformAccounts } from '../../../platform-accounts/hooks/use-platform-accounts'
import { PlatformAccountStatus, connectablePlatforms } from '../../../platform-accounts/types'
import { channelPlatforms } from '../../platform-channels'
import MarketingPublicationJobCard from '../../publications/components/publication-job-card'
import { getPublicationReasonLabelKey } from '../../publications/error-codes'
import { useGetPublicationPreview } from '../../publications/hooks/use-get-publication-preview'
import { useGetPublications } from '../../publications/hooks/use-get-publications'
import { usePublicationActions } from '../../publications/hooks/use-publication-actions'
import { getPublicationMediaIssues, hasBlockingMediaIssue } from '../../publications/media-rules'
import { validateScheduleAt } from '../../publications/schedule'
import MarketingPublicationErrorNotice from '../../publications/components/publication-error-notice'
import { PublicationStatus } from '../../publications/types'
import type { MarketingPostChannel } from '../../types'
import { MarketingStudioPublishMode, type MarketingStudioChannelSender } from '../types'
import MarketingStudioSchedulePicker from './marketing-studio-schedule-picker'

const ACCOUNTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/accounts`

const modes = [MarketingStudioPublishMode.PublishNow, MarketingStudioPublishMode.Schedule]

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className='flex items-start gap-1.5 rounded-lg border bg-muted/30 p-2 text-xs text-muted-foreground'>
      <InfoIcon className='mt-0.5 size-3.5 shrink-0' />
      {children}
    </p>
  )
}

// Một hàng kênh trong khối chốt đăng: chọn tài khoản, chọn đăng ngay hay hẹn lịch. Không có nút
// bấm riêng - hàng này đăng ký hàm gửi của mình lên nút gộp bên dưới khi đã đủ điều kiện.
const MarketingStudioChannelPublish = ({
  postId,
  channel,
  isBlockedByChecklist,
  onRegister,
  onBusyChange
}: {
  postId?: string
  channel: MarketingPostChannel
  isBlockedByChecklist: boolean
  onRegister: (channel: MarketingPostChannel, sender: MarketingStudioChannelSender | null) => void
  onBusyChange: (channel: MarketingPostChannel, isBusy: boolean) => void
}) => {
  const { t } = useTenantTranslation()
  const platform = channelPlatforms[channel]
  const [accountId, setAccountId] = useState<string | undefined>(undefined)
  const [mode, setMode] = useState<MarketingStudioPublishMode>(MarketingStudioPublishMode.PublishNow)
  const [scheduledAt, setScheduledAt] = useState<string | null>(null)

  const { accountsByPlatform, isGettingAccounts } = usePlatformAccounts()
  const { activeJob, blockingJob, lastFailedJob, isGettingPublications } = useGetPublications({ id: postId, platform })
  const actions = usePublicationActions({ id: postId, platform })
  // Lấy riêng hai hàm cần dùng: cả object `actions` đổi tham chiếu mỗi render nên đưa vào
  // dependency sẽ làm hàm gửi dựng lại liên tục.
  const { publishPost, schedulePost } = actions

  const isSupported = connectablePlatforms.includes(platform)
  const accounts = isSupported ? accountsByPlatform(platform) : []
  const usableAccounts = accounts.filter((account) => account.status !== PlatformAccountStatus.Disabled)
  const defaultAccount =
    usableAccounts.find((account) => account.status === PlatformAccountStatus.Connected) ?? usableAccounts[0]
  const selectedAccountId = accountId ?? defaultAccount?.id

  // Hash bản chốt đọc ngay trước khi gửi; gửi hash cũ là ăn 409
  const { preview, isGettingPreview } = useGetPublicationPreview({ id: postId, platform, accountId: selectedAccountId })
  const mediaIssues = preview ? getPublicationMediaIssues(preview.snapshot) : []
  const isScheduling = mode === MarketingStudioPublishMode.Schedule
  const scheduleIssue = isScheduling ? validateScheduleAt(scheduledAt) : null

  const canSend =
    !isBlockedByChecklist &&
    !activeJob &&
    !blockingJob &&
    Boolean(selectedAccountId && preview?.canPublish) &&
    !hasBlockingMediaIssue(mediaIssues) &&
    scheduleIssue === null

  const revision = preview?.revision

  const doSend = () => {
    if (!selectedAccountId || !revision) return

    if (!isScheduling) {
      publishPost({ accountId: selectedAccountId, revision })

      return
    }

    if (scheduledAt) schedulePost({ accountId: selectedAccountId, revision, scheduledAt })
  }

  // Giữ hàm gửi mới nhất trong ref rồi chỉ đăng ký một wrapper cố định: đăng ký lại mỗi lần
  // tài khoản hay hash đổi sẽ làm cha render theo liên tục.
  const sendRef = useRef(doSend)

  useEffect(() => {
    sendRef.current = doSend
  })

  const send = useCallback(() => sendRef.current(), [])

  useEffect(() => {
    onRegister(channel, canSend ? send : null)

    return () => onRegister(channel, null)
  }, [onRegister, channel, canSend, send])

  // Lệnh đăng nằm ở hàng này nhưng nút bấm nằm ở cha, nên trạng thái đang gửi phải báo ngược
  // lên - không thì bấm xong nút đứng im như chưa ăn, admin bấm lại lần nữa.
  useEffect(() => {
    onBusyChange(channel, actions.isBusy)

    return () => onBusyChange(channel, false)
  }, [onBusyChange, channel, actions.isBusy])

  if (isGettingAccounts || isGettingPublications) return <Skeleton className='h-9 w-full rounded-lg' />

  if (!isSupported) return <Note>{t('marketingPosts.publication.unsupportedPlatform')}</Note>

  if (activeJob) return <MarketingPublicationJobCard job={activeJob} actions={actions} />

  if (blockingJob) {
    return (
      <div className='space-y-2'>
        <MarketingPublicationJobCard job={blockingJob} actions={actions} />
        {/* Đã đăng xong thì thẻ job tự nói lên rồi, chỉ nhắc khi đóng xử lý mà chưa rõ kết quả */}
        {blockingJob.status !== PublicationStatus.Succeeded && (
          <Note>{t('marketingPosts.publication.hint.alreadyClosed')}</Note>
        )}
      </div>
    )
  }

  // Đăng lỗi thì mở lại cho sửa và đăng lần mới, nhưng phải nói lần trước hỏng vì sao
  const lastFailureNotice = lastFailedJob?.errorCode && (
    <MarketingPublicationErrorNotice
      errorCode={lastFailedJob.errorCode}
      title={t('marketingPosts.publication.lastFailed')}
    />
  )

  if (usableAccounts.length === 0) {
    return (
      <div className='space-y-2'>
        {lastFailureNotice}
        <Note>{t('marketingPosts.publication.noAccount')}</Note>
        <Button size='sm' variant='outline' asChild>
          <Link to={ACCOUNTS_PATH}>{t('marketingPosts.publication.action.manageAccounts')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-1.5'>
      {lastFailureNotice}

      <Select value={selectedAccountId} onValueChange={setAccountId}>
        <SelectTrigger size='sm' className='w-full' aria-label={t('marketingPosts.publication.account')}>
          <SelectValue placeholder={t('marketingPosts.publication.account')} />
        </SelectTrigger>
        <SelectContent>
          {usableAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.displayName}
              {account.status !== PlatformAccountStatus.Connected &&
                ` · ${t(`platformAccounts.status.${account.status}`)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Mỗi kênh tự chọn: có kênh đăng ngay, kênh khác hẹn giờ đẹp hơn */}
      <div className='grid grid-cols-2 gap-1'>
        {modes.map((item) => (
          <button
            key={item}
            type='button'
            aria-pressed={mode === item}
            onClick={() => setMode(item)}
            className={cn(
              'rounded-lg border px-2 py-1 text-[0.7rem] transition-colors hover:bg-muted',
              mode === item && 'border-primary bg-primary/10 text-primary hover:bg-primary/10'
            )}
          >
            {t(`marketingPosts.studio.publishMode.${item}`)}
          </button>
        ))}
      </div>

      {isScheduling && (
        <>
          <MarketingStudioSchedulePicker value={scheduledAt} isDisabled={actions.isBusy} onChange={setScheduledAt} />
          {scheduleIssue && (
            <p className='text-xs text-destructive'>{t(`marketingPosts.publication.schedule.${scheduleIssue}`)}</p>
          )}
        </>
      )}

      {isGettingPreview && <Skeleton className='h-4 w-32' />}

      {/* Backend chặn thì nói đúng lý do nó trả về, đừng để admin bấm rồi mới biết */}
      {preview && !preview.canPublish && preview.reasons.length > 0 && (
        <ul className='space-y-1'>
          {preview.reasons.map((reason) => {
            const labelKey = getPublicationReasonLabelKey(reason)

            return (
              <li key={reason} className='flex items-start gap-1.5 text-xs text-destructive'>
                <CircleAlertIcon className='mt-0.5 size-3.5 shrink-0' />
                <span>{t(labelKey ?? 'marketingPosts.publication.reason.unknown', { code: reason })}</span>
              </li>
            )
          })}
        </ul>
      )}

      {mediaIssues.length > 0 && (
        <ul className='space-y-1'>
          {mediaIssues.map((issue, index) => (
            <li
              key={`${issue.key}-${issue.imageOrder ?? index}`}
              className={cn('text-xs', issue.level === 'error' ? 'text-destructive' : 'text-amber-600')}
            >
              {issue.imageOrder !== undefined &&
                `${t('marketingPosts.publication.media.imagePrefix', { order: issue.imageOrder })} `}
              {t(`marketingPosts.publication.media.${issue.key}`, issue.values)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MarketingStudioChannelPublish
