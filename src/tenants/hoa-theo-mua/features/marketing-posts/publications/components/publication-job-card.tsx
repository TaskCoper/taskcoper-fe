import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { formatDateTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  CalendarClockIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SearchCheckIcon,
  TriangleAlertIcon,
  XIcon
} from 'lucide-react'
import { useState } from 'react'
import MarketingStudioSchedulePicker from '../../studio/components/marketing-studio-schedule-picker'
import { useGetPublication } from '../hooks/use-get-publication'
import type { usePublicationActions } from '../hooks/use-publication-actions'
import { canEditSchedule, validateScheduleAt } from '../schedule'
import { publicationStatusBadgeClasses } from '../status-badge'
import { PublicationStatus, type PublicationJob } from '../types'
import MarketingPublicationErrorNotice from './publication-error-notice'
import MarketingPublicationReviewDialog from './publication-review-dialog'

type PublicationActions = ReturnType<typeof usePublicationActions>

// `actions` đã gắn sẵn bài và nền tảng, nên ở đây chỉ cần job
function ScheduleEditor({ job, actions }: { job: PublicationJob; actions: PublicationActions }) {
  const { t } = useTenantTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [scheduledAt, setScheduledAt] = useState<string | null>(null)
  const issue = validateScheduleAt(scheduledAt)

  if (!isEditing) {
    return (
      <div className='flex flex-wrap gap-2'>
        <Button type='button' size='sm' variant='outline' onClick={() => setIsEditing(true)} disabled={actions.isBusy}>
          <CalendarClockIcon />
          {t('marketingPosts.publication.action.reschedule')}
        </Button>
        <Button
          type='button'
          size='sm'
          variant='outline'
          disabled={actions.isBusy}
          onClick={() => actions.cancelSchedule({ publicationId: job.publicationId, expectedRevision: job.revision })}
        >
          {actions.isCancellingSchedule ? <Spinner /> : <XIcon />}
          {t('marketingPosts.publication.action.cancelSchedule')}
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-2 rounded-xl border p-3'>
      {/* Đổi giờ KHÔNG đụng tới text/ảnh/account - muốn sửa nội dung phải hủy lịch rồi làm lại */}
      <p className='text-xs text-muted-foreground'>{t('marketingPosts.publication.schedule.rescheduleHint')}</p>

      <MarketingStudioSchedulePicker value={scheduledAt} isDisabled={actions.isBusy} onChange={setScheduledAt} />
      {issue && <p className='text-xs text-destructive'>{t(`marketingPosts.publication.schedule.${issue}`)}</p>}

      <div className='flex gap-2'>
        <Button
          type='button'
          size='sm'
          disabled={Boolean(issue) || actions.isBusy}
          onClick={() => {
            if (!scheduledAt) return

            actions.reschedulePost({
              publicationId: job.publicationId,
              expectedRevision: job.revision,
              scheduledAt
            })
            setIsEditing(false)
          }}
        >
          {actions.isRescheduling ? <Spinner /> : <CalendarClockIcon />}
          {t('marketingPosts.publication.action.saveSchedule')}
        </Button>
        <Button type='button' size='sm' variant='ghost' onClick={() => setIsEditing(false)}>
          {t('common.button.cancel')}
        </Button>
      </div>
    </div>
  )
}

function JobActions({
  job,
  actions,
  onReview
}: {
  job: PublicationJob
  actions: PublicationActions
  onReview: () => void
}) {
  const { t } = useTenantTranslation()

  if (job.status === PublicationStatus.Queued) {
    return (
      <Button
        type='button'
        size='sm'
        variant='outline'
        disabled={actions.isBusy}
        onClick={() => actions.cancelPublication({ publicationId: job.publicationId, expectedRevision: job.revision })}
      >
        {actions.isCancelling ? <Spinner /> : <XIcon />}
        {t('marketingPosts.publication.action.cancel')}
      </Button>
    )
  }

  if (canEditSchedule(job)) return <ScheduleEditor job={job} actions={actions} />

  // Đang chạy: khoá mọi thao tác ghi, kể cả hủy
  if (job.status === PublicationStatus.Publishing) {
    return (
      <p className='flex items-center gap-2 text-xs text-muted-foreground'>
        <Spinner className='size-3.5' />
        {t('marketingPosts.publication.hint.publishing')}
      </p>
    )
  }

  if (job.status === PublicationStatus.Failed) {
    // `canRetry` là quyết định của backend. Không tự suy ra từ mã lỗi.
    if (!job.canRetry)
      return <p className='text-xs text-muted-foreground'>{t('marketingPosts.publication.hint.noRetry')}</p>

    return (
      <div className='space-y-1.5'>
        <Button
          type='button'
          size='sm'
          variant='outline'
          disabled={actions.isBusy}
          onClick={() => actions.retryPublication({ publicationId: job.publicationId, expectedRevision: job.revision })}
        >
          {actions.isRetrying ? <Spinner /> : <RotateCcwIcon />}
          {t('marketingPosts.publication.action.retry')}
        </Button>
        {/* Nói rõ retry chạy lại NGAY với snapshot cũ, không phải đặt lại lịch */}
        <p className='text-xs text-muted-foreground'>{t('marketingPosts.publication.hint.retryKeepsSnapshot')}</p>
      </div>
    )
  }

  if (job.status === PublicationStatus.NeedsReview) {
    return (
      <div className='space-y-1.5'>
        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            disabled={actions.isBusy}
            onClick={() =>
              actions.recheckPublication({ publicationId: job.publicationId, expectedRevision: job.revision })
            }
          >
            {actions.isRechecking ? <Spinner /> : <SearchCheckIcon />}
            {t('marketingPosts.publication.action.recheck')}
          </Button>
          <Button type='button' size='sm' variant='outline' disabled={actions.isBusy} onClick={onReview}>
            <RefreshCwIcon />
            {t('marketingPosts.publication.action.review')}
          </Button>
        </div>
        <p className='text-xs text-muted-foreground'>{t('marketingPosts.publication.hint.needsReview')}</p>
      </div>
    )
  }

  return null
}

const MarketingPublicationJobCard = ({
  job: fallbackJob,
  actions
}: {
  job: PublicationJob
  actions: PublicationActions
}) => {
  const { t } = useTenantTranslation()
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  // Detail tự poll khi job còn đang chạy; danh sách chỉ dùng làm bản hiện tạm lúc chưa có detail
  const { publication, detail } = useGetPublication({ publicationId: fallbackJob.publicationId })
  const job = publication ?? fallbackJob
  const errors = detail?.attempts.filter((attempt) => attempt.errorCode) ?? []

  return (
    <div className='space-y-3 rounded-xl border bg-muted/10 p-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline' className={cn('font-normal', publicationStatusBadgeClasses[job.status])}>
            {t(`marketingPosts.publication.status.${job.status}`)}
          </Badge>
        </div>
        <span className='text-xs text-muted-foreground tabular-nums'>
          {formatDateTime(job.updatedAt, 'dateTimeShort')}
        </span>
      </div>

      {/* `scheduledAt` của job đã kết thúc là giờ lịch sử, phải nói rõ kẻo tưởng còn lịch chờ */}
      {job.scheduledAt && (
        <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <CalendarClockIcon className='size-3.5' />
          {t(
            job.status === PublicationStatus.Scheduled
              ? 'marketingPosts.publication.scheduledFor'
              : 'marketingPosts.publication.scheduledHistory',
            { time: formatDateTime(job.scheduledAt, 'dateTimeShort') }
          )}
        </p>
      )}

      {job.status === PublicationStatus.Succeeded && (
        <div className='space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'>
          {job.externalPostId && <p className='font-mono break-all'>{job.externalPostId}</p>}
          {job.externalPostUrl ? (
            <a
              href={job.externalPostUrl}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-1 font-medium underline'
            >
              <ExternalLinkIcon className='size-3.5' />
              {t('marketingPosts.publication.action.openPost')}
            </a>
          ) : (
            // Đọc permalink lỗi không làm mất kết quả đã đăng - tuyệt đối không gợi ý đăng lại
            <p>{t('marketingPosts.publication.hint.missingPermalink')}</p>
          )}
        </div>
      )}

      {job.errorCode && <MarketingPublicationErrorNotice errorCode={job.errorCode} />}

      {errors.length > 0 && (
        <details className='rounded-lg border p-3 text-xs'>
          <summary className='cursor-pointer font-medium'>{t('marketingPosts.publication.errorHistory')}</summary>
          <ol className='mt-3 max-h-64 space-y-3 overflow-y-auto'>
            {errors.map((attempt) => (
              <li key={attempt.number} className='space-y-1'>
                <p className='text-muted-foreground'>
                  #{attempt.number} · {formatDateTime(attempt.startedAt, 'dateTimeShort')}
                </p>
                <p className='font-mono break-all'>{attempt.errorCode}</p>
                {attempt.providerCode && (
                  <p>
                    {t('marketingPosts.publication.providerCode')}:{' '}
                    <span className='font-mono'>{attempt.providerCode}</span>
                  </p>
                )}
              </li>
            ))}
          </ol>
        </details>
      )}

      {/* Đã gửi lệnh đăng mà chưa rõ kết quả: cảnh báo nặng nhất trong màn này */}
      {job.publishMayHaveOccurred && job.status !== PublicationStatus.Succeeded && (
        <p className='flex items-start gap-1.5 rounded-lg border border-amber-300/60 bg-amber-50 p-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'>
          <TriangleAlertIcon className='mt-0.5 size-3.5 shrink-0' />
          {t('marketingPosts.publication.hint.mayHavePublished')}
        </p>
      )}

      <JobActions job={job} actions={actions} onReview={() => setIsReviewOpen(true)} />

      <MarketingPublicationReviewDialog
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        isBusy={actions.isResolving}
        onSubmit={(values) => {
          actions.resolvePublication({
            publicationId: job.publicationId,
            expectedRevision: job.revision,
            action: values.action,
            note: values.note,
            externalPostId: values.externalPostId
          })
          setIsReviewOpen(false)
        }}
      />
    </div>
  )
}

export default MarketingPublicationJobCard
