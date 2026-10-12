import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CalendarClockIcon, CircleAlertIcon, InfoIcon, SendIcon, TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import { usePlatformAccounts } from '../../../platform-accounts/hooks/use-platform-accounts'
import { PlatformAccountStatus, connectablePlatforms } from '../../../platform-accounts/types'
import type { MarketingPostPlatform } from '../../types'
import { getPublicationReasonLabelKey } from '../error-codes'
import { getPublicationMediaIssues, hasBlockingMediaIssue, type PublicationMediaIssue } from '../media-rules'
import { useGetPublicationPreview } from '../hooks/use-get-publication-preview'
import { useGetPublications } from '../hooks/use-get-publications'
import { usePublicationActions } from '../hooks/use-publication-actions'
import { PublicationStatus } from '../types'
import { validateScheduleAt } from '../schedule'
import MarketingStudioSchedulePicker from '../../studio/components/marketing-studio-schedule-picker'
import MarketingPublicationErrorNotice from './publication-error-notice'
import MarketingPublicationJobCard from './publication-job-card'

const ACCOUNTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/accounts`

// Cảnh báo ảnh và độ dài caption tính ở frontend theo giới hạn của từng nền tảng.
// Trước đây nằm trong hộp xem trước; bỏ hộp rồi thì phải đưa ra ngoài, không thì mất luôn.
function MediaIssueRow({ issue }: { issue: PublicationMediaIssue }) {
  const { t } = useTenantTranslation()
  const isError = issue.level === 'error'

  return (
    <li className={cn('flex items-start gap-1.5 text-xs', isError ? 'text-destructive' : 'text-amber-600')}>
      {isError ? (
        <CircleAlertIcon className='mt-0.5 size-3.5 shrink-0' />
      ) : (
        <TriangleAlertIcon className='mt-0.5 size-3.5 shrink-0' />
      )}
      <span>
        {issue.imageOrder !== undefined && (
          <b className='font-medium'>
            {t('marketingPosts.publication.media.imagePrefix', { order: issue.imageOrder })}{' '}
          </b>
        )}
        {t(`marketingPosts.publication.media.${issue.key}`, issue.values)}
      </span>
    </li>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className='flex items-start gap-1.5 rounded-lg border bg-muted/30 p-2.5 text-xs text-muted-foreground'>
      <InfoIcon className='mt-0.5 size-3.5 shrink-0' />
      {children}
    </p>
  )
}

// Luồng đăng của một nền tảng: chọn tài khoản -> xem trước bản chốt -> đăng ngay hoặc đặt lịch
// -> theo dõi job. Mỗi PlatformPost chỉ có một job hoạt động nên panel này luôn chỉ hiện một thẻ.
const MarketingPublicationPanel = ({ id, platform }: { id?: string; platform: MarketingPostPlatform }) => {
  const { t } = useTenantTranslation()
  const [accountId, setAccountId] = useState<string | undefined>(undefined)
  const [isPickingSchedule, setIsPickingSchedule] = useState(false)
  const [scheduledAt, setScheduledAt] = useState<string | null>(null)

  const { accountsByPlatform, isGettingAccounts } = usePlatformAccounts()
  const { activeJob, blockingJob, lastFailedJob, isGettingPublications } = useGetPublications({
    id,
    platform
  })
  const actions = usePublicationActions({ id, platform })

  const isSupported = connectablePlatforms.includes(platform)
  const accounts = isSupported ? accountsByPlatform(platform) : []
  // Account `Disabled` đã bị gỡ credential nên không đăng được; `ReauthRequired` vẫn cho chọn để
  // admin thấy lý do, nhưng backend sẽ chặn ở bước preview.
  const usableAccounts = accounts.filter((account) => account.status !== PlatformAccountStatus.Disabled)

  // Mặc định là tài khoản đang Connected, nhưng suy ra chứ không set vào state trong effect:
  // danh sách account tải sau nên effect sẽ chạy một vòng render thừa, và lúc admin đã tự chọn
  // rồi thì effect còn có nguy cơ giật lựa chọn về mặc định.
  const defaultAccount =
    usableAccounts.find((account) => account.status === PlatformAccountStatus.Connected) ?? usableAccounts[0]
  const selectedAccountId = accountId ?? defaultAccount?.id

  // Hash bản chốt phải đọc ngay trước khi gửi, gửi hash cũ là ăn 409
  const { preview, isGettingPreview } = useGetPublicationPreview({ id, platform, accountId: selectedAccountId })
  const scheduleIssue = isPickingSchedule ? validateScheduleAt(scheduledAt) : null
  const mediaIssues = preview ? getPublicationMediaIssues(preview.snapshot) : []
  const canSend = Boolean(selectedAccountId && preview?.canPublish) && !hasBlockingMediaIssue(mediaIssues)

  if (!isSupported) return <Note>{t('marketingPosts.publication.unsupportedPlatform')}</Note>

  if (isGettingAccounts || isGettingPublications) return <Skeleton className='h-20 w-full rounded-xl' />

  return (
    <div className='space-y-3'>
      {/* Đăng lỗi thì mở lại cho đăng lần mới, nhưng phải nói lần trước hỏng vì sao để sửa đúng chỗ */}
      {lastFailedJob?.errorCode && (
        <MarketingPublicationErrorNotice
          errorCode={lastFailedJob.errorCode}
          title={t('marketingPosts.publication.lastFailed')}
        />
      )}

      {activeJob ? (
        <MarketingPublicationJobCard job={activeJob} actions={actions} />
      ) : blockingJob ? (
        <>
          <MarketingPublicationJobCard job={blockingJob} actions={actions} />
          {/* Đã đóng xử lý mà chưa rõ kết quả thì phải nói vì sao không mở lại quyền đăng.
              Đã đăng xong thì thẻ job tự nói lên rồi, không cần nhắc thêm. */}
          {blockingJob.status !== PublicationStatus.Succeeded && (
            <Note>{t('marketingPosts.publication.hint.alreadyClosed')}</Note>
          )}
        </>
      ) : usableAccounts.length === 0 ? (
        <div className='space-y-2'>
          <Note>{t('marketingPosts.publication.noAccount')}</Note>
          <Button size='sm' variant='outline' asChild>
            <Link to={ACCOUNTS_PATH}>{t('marketingPosts.publication.action.manageAccounts')}</Link>
          </Button>
        </div>
      ) : (
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Select value={selectedAccountId} onValueChange={setAccountId}>
              <SelectTrigger className='h-9 min-w-0 flex-1' aria-label={t('marketingPosts.publication.account')}>
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

            <Button
              type='button'
              size='sm'
              disabled={!canSend || actions.isBusy}
              onClick={() =>
                preview && actions.publishPost({ accountId: selectedAccountId!, revision: preview.revision })
              }
            >
              <SendIcon />
              {t('marketingPosts.publication.action.publish')}
            </Button>

            <Button
              type='button'
              size='sm'
              variant='outline'
              disabled={!canSend || actions.isBusy}
              onClick={() => setIsPickingSchedule((previous) => !previous)}
            >
              <CalendarClockIcon />
              {t('marketingPosts.publication.action.schedule')}
            </Button>
          </div>

          {/* Bản chốt đã xem ngay trên màn này rồi, không bắt mở thêm hộp xem trước nữa.
              Vẫn phải đọc preview để lấy hash bản chốt và lý do backend chặn. */}
          {preview?.snapshot.article && (
            <Note>
              {t('marketingPosts.publication.zaloArticle', {
                author: preview.snapshot.article.author,
                description: preview.snapshot.article.description
              })}
            </Note>
          )}

          {isGettingPreview && <Skeleton className='h-9 w-full rounded-lg' />}

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
                <MediaIssueRow key={`${issue.key}-${issue.imageOrder ?? index}`} issue={issue} />
              ))}
            </ul>
          )}

          {isPickingSchedule && (
            <div className='space-y-2 rounded-lg border p-2'>
              <MarketingStudioSchedulePicker
                value={scheduledAt}
                isDisabled={actions.isBusy}
                onChange={setScheduledAt}
              />
              {scheduleIssue && (
                <p className='text-xs text-destructive'>{t(`marketingPosts.publication.schedule.${scheduleIssue}`)}</p>
              )}
              <Button
                type='button'
                size='sm'
                className='w-full'
                disabled={!canSend || actions.isBusy || scheduleIssue !== null || !scheduledAt}
                onClick={() =>
                  preview &&
                  scheduledAt &&
                  actions.schedulePost({ accountId: selectedAccountId!, revision: preview.revision, scheduledAt })
                }
              >
                {t('marketingPosts.publication.action.confirmSchedule')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MarketingPublicationPanel
