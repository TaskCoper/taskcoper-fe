import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDateFormat } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { EyeIcon, HeartIcon, MousePointerClickIcon, RefreshCwIcon, UsersIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { marketingPostChannels } from '../features/marketing-posts/mock-data'
import MarketingReportBreakdownChart from '../features/marketing-posts/reports/components/marketing-report-breakdown-chart'
import MarketingReportStatTile from '../features/marketing-posts/reports/components/marketing-report-stat-tile'
import MarketingReportTimelineChart from '../features/marketing-posts/reports/components/marketing-report-timeline-chart'
import { useGetMarketingReport } from '../features/marketing-posts/reports/hooks/use-get-marketing-report'
import { MarketingReportRange, marketingReportRanges } from '../features/marketing-posts/reports/types'

const ALL_CHANNELS = 'all'
const POSTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`

export default function MarketingReportsPage() {
  const { t } = useTenantTranslation()
  const { formatDateTime, formatDate } = useDateFormat()
  const [rangeParam, setRangeParam] = useQueryState('range', parseAsString)
  const [channelParam, setChannelParam] = useQueryState('channel', parseAsString)

  const range = marketingReportRanges.find((item) => item === rangeParam) ?? MarketingReportRange.Month
  const channel = marketingPostChannels.find((item) => item === channelParam)

  const { marketingReport, isGettingMarketingReport } = useGetMarketingReport({ range, channel })

  return (
    <div className='h-full overflow-auto'>
      <div className='mx-auto w-full max-w-6xl space-y-5 px-6 py-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold'>{t('marketingReports.title')}</h1>
            <p className='mt-0.5 text-sm text-muted-foreground'>{t('marketingReports.description')}</p>
          </div>

          {/* Bộ lọc gom một hàng ngay trên phần số liệu, đổi là mọi biểu đồ bên dưới đổi theo */}
          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex rounded-lg border p-0.5'>
              {marketingReportRanges.map((item) => (
                <button
                  key={item}
                  type='button'
                  aria-pressed={range === item}
                  onClick={() => setRangeParam(item === MarketingReportRange.Month ? null : item)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs transition-colors hover:bg-muted',
                    range === item && 'bg-primary/10 text-primary hover:bg-primary/10'
                  )}
                >
                  {t(`marketingReports.range.${item}`)}
                </button>
              ))}
            </div>

            <Select
              value={channel ?? ALL_CHANNELS}
              onValueChange={(value) => setChannelParam(value === ALL_CHANNELS ? null : value)}
            >
              <SelectTrigger className='h-8 w-40 text-xs data-size:h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CHANNELS} className='text-xs'>
                  {t('marketingReports.allChannels')}
                </SelectItem>
                {marketingPostChannels.map((item) => (
                  <SelectItem key={item} value={item} className='text-xs'>
                    {t(`marketingPosts.channel.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isGettingMarketingReport || !marketingReport ? (
          <div className='space-y-5'>
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className='h-24 rounded-xl' />
              ))}
            </div>
            <Skeleton className='h-80 rounded-xl' />
          </div>
        ) : (
          <>
            {/* Số liệu do nền tảng trả về theo mẻ, không phải thời gian thực - phải nói rõ mốc lấy về */}
            <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <RefreshCwIcon className='size-3' />
              {t('marketingReports.syncedAt', {
                time: formatDateTime(marketingReport.syncedAt, 'dateTimeShort'),
                count: marketingReport.totals.posts
              })}
            </p>

            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              <MarketingReportStatTile
                label={t('marketingReports.tile.reach')}
                value={marketingReport.totals.reach}
                icon={UsersIcon}
              />
              <MarketingReportStatTile
                label={t('marketingReports.tile.impressions')}
                value={marketingReport.totals.impressions}
                icon={EyeIcon}
              />
              <MarketingReportStatTile
                label={t('marketingReports.tile.engagements')}
                value={marketingReport.totals.engagements}
                icon={HeartIcon}
                accentClassName='text-rose-500'
                footnote={t('marketingReports.tile.engagementRate', { rate: marketingReport.totals.engagementRate })}
              />
              <MarketingReportStatTile
                label={t('marketingReports.tile.clicks')}
                value={marketingReport.totals.clicks}
                icon={MousePointerClickIcon}
                accentClassName='text-sky-600'
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>{t('marketingReports.chart.timelineTitle')}</CardTitle>
                <CardDescription>{t('marketingReports.chart.timelineDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <MarketingReportTimelineChart data={marketingReport.daily} />
              </CardContent>
            </Card>

            <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>{t('marketingReports.chart.channelTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarketingReportBreakdownChart
                    emptyLabel={t('marketingReports.empty')}
                    rows={marketingReport.byChannel.map((row) => ({
                      key: row.channel,
                      label: t(`marketingPosts.channel.${row.channel}`),
                      total: row.reach
                    }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>{t('marketingReports.table.channelTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('marketingPosts.column.channel')}</TableHead>
                        <TableHead className='text-right'>{t('marketingReports.table.posts')}</TableHead>
                        <TableHead className='text-right'>{t('marketingReports.tile.reach')}</TableHead>
                        <TableHead className='text-right'>{t('marketingReports.tile.engagements')}</TableHead>
                        <TableHead className='text-right'>{t('marketingReports.table.rate')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketingReport.byChannel.map((row) => (
                        <TableRow key={row.channel}>
                          <TableCell className='font-medium'>{t(`marketingPosts.channel.${row.channel}`)}</TableCell>
                          <TableCell className='text-right tabular-nums'>{row.posts}</TableCell>
                          <TableCell className='text-right tabular-nums'>{row.reach.toLocaleString()}</TableCell>
                          <TableCell className='text-right tabular-nums'>{row.engagements.toLocaleString()}</TableCell>
                          <TableCell className='text-right tabular-nums'>{row.engagementRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>{t('marketingReports.table.topTitle')}</CardTitle>
                <CardDescription>{t('marketingReports.table.topDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {marketingReport.topPosts.length === 0 ? (
                  <p className='rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground'>
                    {t('marketingReports.empty')}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('marketingPosts.column.title')}</TableHead>
                        <TableHead>{t('marketingPosts.column.publishedAt')}</TableHead>
                        <TableHead className='text-right'>{t('marketingReports.tile.reach')}</TableHead>
                        <TableHead className='text-right'>{t('marketingReports.tile.impressions')}</TableHead>
                        <TableHead className='text-right'>{t('marketingReports.tile.engagements')}</TableHead>
                        <TableHead className='text-right'>{t('marketingReports.tile.clicks')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketingReport.topPosts.map((post) => (
                        <TableRow key={post.postId}>
                          <TableCell>
                            <Link
                              to={`${POSTS_PATH}/${post.postId}`}
                              className='font-medium hover:text-primary hover:underline'
                            >
                              {post.title}
                            </Link>
                            <Badge variant='secondary' className='ml-2 font-normal'>
                              {t(`marketingPosts.channel.${post.channel}`)}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {formatDate(post.publishedAt, 'dateShort')}
                          </TableCell>
                          <TableCell className='text-right tabular-nums'>{post.reach.toLocaleString()}</TableCell>
                          <TableCell className='text-right tabular-nums'>{post.impressions.toLocaleString()}</TableCell>
                          <TableCell className='text-right tabular-nums'>{post.engagements.toLocaleString()}</TableCell>
                          <TableCell className='text-right tabular-nums'>{post.clicks.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
