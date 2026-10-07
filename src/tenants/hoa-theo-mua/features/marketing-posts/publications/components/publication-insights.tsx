import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import {
  BookmarkIcon,
  CircleAlertIcon,
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  Share2Icon,
  SparklesIcon,
  UsersIcon
} from 'lucide-react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import MarketingReportStatTile from '../../reports/components/marketing-report-stat-tile'
import { getPublicationErrorKey, needsAccountReauth } from '../error-codes'
import { useGetPublicationInsights } from '../hooks/use-get-publication-insights'

const ACCOUNTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/accounts`

// Chỉ số của một lần đăng đã thành công, đọc thẳng từ Meta
const MarketingPublicationInsights = ({ publicationId }: { publicationId: string }) => {
  const { t } = useTenantTranslation()
  const { insights, insightsError, isGettingInsights, isRefreshingInsights, refetchInsights } =
    useGetPublicationInsights({ publicationId })

  if (isGettingInsights) {
    return (
      <div className='grid grid-cols-2 gap-3'>
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className='h-22 rounded-xl' />
        ))}
      </div>
    )
  }

  if (insightsError || !insights) {
    const messageCode = insightsError?.response?.data?.messageCode ?? null
    const detail = insightsError?.response?.data?.detail
    const errorKey = messageCode ? getPublicationErrorKey(messageCode) : null
    // Token hết hạn hay thiếu quyền đọc chỉ số thì thử lại vô ích, phải sang trang tài khoản kết nối lại
    const needsReconnect = needsAccountReauth(messageCode)

    return (
      <div className='flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'>
        <div className='flex min-w-0 items-start gap-2'>
          <CircleAlertIcon className='mt-0.5 size-4 shrink-0' />
          <div className='min-w-0'>
            <p className='font-medium'>{t('marketingPosts.insights.error')}</p>
            <p className='mt-0.5 text-xs'>
              {errorKey ? t(`marketingPosts.publication.error.${errorKey}`) : (detail ?? t('error.somethingWentWrong'))}
            </p>
            {/* Mỗi nền tảng đòi một bộ quyền khác nhau và backend liệt kê đúng tên quyền, nên giữ câu gốc */}
            {errorKey === 'insightsPermissionRequired' && detail && (
              <p className='mt-0.5 text-xs opacity-80'>{detail}</p>
            )}
          </div>
        </div>

        {needsReconnect ? (
          <Button size='sm' variant='outline' asChild>
            <Link to={ACCOUNTS_PATH}>{t('marketingPosts.publication.action.manageAccounts')}</Link>
          </Button>
        ) : (
          <Button size='sm' variant='outline' disabled={isRefreshingInsights} onClick={() => refetchInsights()}>
            <RefreshCwIcon />
            {t('marketingPosts.insights.reload')}
          </Button>
        )}
      </div>
    )
  }

  const { metrics } = insights

  return (
    <div className='space-y-3'>
      {/* Khối nằm ở cột phải hẹp, hai thẻ một hàng là vừa đọc */}
      <div className='grid grid-cols-2 gap-3'>
        <MarketingReportStatTile label={t('marketingPosts.insights.views')} value={metrics.views} icon={EyeIcon} />
        <MarketingReportStatTile label={t('marketingPosts.insights.reach')} value={metrics.reach} icon={UsersIcon} />
        <MarketingReportStatTile
          label={t('marketingPosts.insights.totalInteractions')}
          value={metrics.total_interactions}
          icon={SparklesIcon}
          accentClassName='text-primary'
        />
        <MarketingReportStatTile
          label={t('marketingPosts.insights.likes')}
          value={metrics.likes}
          icon={HeartIcon}
          accentClassName='text-rose-500'
        />
        <MarketingReportStatTile
          label={t('marketingPosts.insights.comments')}
          value={metrics.comments}
          icon={MessageCircleIcon}
          accentClassName='text-sky-600'
        />
        <MarketingReportStatTile
          label={t('marketingPosts.insights.shares')}
          value={metrics.shares}
          icon={Share2Icon}
          accentClassName='text-emerald-600'
        />
        <MarketingReportStatTile
          label={t('marketingPosts.insights.saved')}
          value={metrics.saved}
          icon={BookmarkIcon}
          accentClassName='text-amber-600'
        />
      </div>

      <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground'>
        <span>{t('marketingPosts.insights.hint')}</span>
        <Button
          size='sm'
          variant='ghost'
          className='h-7 text-xs'
          disabled={isRefreshingInsights}
          onClick={() => refetchInsights()}
        >
          <RefreshCwIcon className={isRefreshingInsights ? 'animate-spin' : undefined} />
          {t('marketingPosts.insights.reload')}
        </Button>
      </div>
    </div>
  )
}

export default MarketingPublicationInsights
