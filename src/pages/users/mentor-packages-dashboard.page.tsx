import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMentorPackagesStatistics } from '@/features/mentor-packages/hooks/use-get-mentor-packages-statistics'
import BarChartHorizontal from '@/features/projects/charts/components/bar-chart-horizontal'
import PieChartLabel from '@/features/projects/charts/components/pie-chart'
import StatCard from '@/features/projects/core/components/stat-card'
import { formatCurrency } from '@/shared/utils'
import { endOfYear, format, getYear, startOfYear } from 'date-fns'
import {
  BanknoteIcon,
  HandCoinsIcon,
  LandmarkIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  TicketPercentIcon
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const currentYear = getYear(new Date())
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i)
const pieChartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function MentorPackagesDashboardPage() {
  const { t } = useTranslation()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const dateRange = useMemo(
    () => ({
      startTime: startOfYear(new Date(selectedYear, 0, 1)).toISOString(),
      endTime: endOfYear(new Date(selectedYear, 0, 1)).toISOString()
    }),
    [selectedYear]
  )

  const { mentorPackagesStatistics, isLoadingMentorPackagesStatistics } = useGetMentorPackagesStatistics(dateRange)

  const summary = mentorPackagesStatistics?.summary
  const packageBreakdown = useMemo(
    () => mentorPackagesStatistics?.packageBreakdown ?? [],
    [mentorPackagesStatistics?.packageBreakdown]
  )

  const summaryCurrency = useMemo(() => {
    const currencies = new Set(packageBreakdown.map((item) => item.currency))
    return currencies.size === 1 ? packageBreakdown[0]?.currency : undefined
  }, [packageBreakdown])

  const monthlyRevenueData = useMemo(() => {
    return (mentorPackagesStatistics?.monthlyBreakdown ?? []).map((item) => ({
      period: format(new Date(item.year, item.month - 1, 1), 'MMM'),
      grossRevenue: item.grossRevenueAtListPrice,
      netRevenue: item.netRevenueAfterVoucher,
      mentorPayout: item.mentorPayoutAfterCommission
    }))
  }, [mentorPackagesStatistics?.monthlyBreakdown])

  const topPackagesByBookingsData = useMemo(() => {
    return [...packageBreakdown]
      .sort((a, b) => b.totalPaidBookings - a.totalPaidBookings)
      .slice(0, 5)
      .map((item) => ({
        id: item.mentorPackageId,
        name: item.packageName,
        bookings: item.totalPaidBookings
      }))
  }, [packageBreakdown])

  const totalNetRevenue = useMemo(
    () => packageBreakdown.reduce((sum, item) => sum + item.netRevenueAfterVoucher, 0),
    [packageBreakdown]
  )

  const packageRevenueShareData = useMemo(() => {
    return [...packageBreakdown]
      .sort((a, b) => b.netRevenueAfterVoucher - a.netRevenueAfterVoucher)
      .slice(0, 5)
      .map((item, index) => ({
        id: item.mentorPackageId,
        name: item.packageName,
        completed: totalNetRevenue > 0 ? Number(((item.netRevenueAfterVoucher / totalNetRevenue) * 100).toFixed(2)) : 0,
        fill: pieChartColors[index]
      }))
  }, [packageBreakdown, totalNetRevenue])

  const monthlyRevenueConfig = useMemo(
    () =>
      ({
        grossRevenue: {
          label: t('mentorPackageStatistics.grossRevenue'),
          color: '#3B82F6'
        },
        netRevenue: {
          label: t('mentorPackageStatistics.netRevenue'),
          color: '#10B981'
        },
        mentorPayout: {
          label: t('mentorPackageStatistics.mentorPayout'),
          color: '#8B5CF6'
        }
      }) satisfies ChartConfig,
    [t]
  )

  const topPackagesByBookingsConfig = useMemo(
    () =>
      ({
        bookings: {
          label: t('mentorPackageStatistics.topPackagesByBookingsTooltip'),
          color: '#3B82F6'
        }
      }) satisfies ChartConfig,
    [t]
  )

  const packageRevenueShareConfig = useMemo(() => {
    const config: ChartConfig = {
      completed: {
        label: t('mentorPackageStatistics.packageRevenueShareTooltip')
      }
    }

    packageRevenueShareData.forEach((item, index) => {
      config[item.id] = {
        label: item.name,
        color: pieChartColors[index]
      }
    })

    return config
  }, [packageRevenueShareData, t])

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='mx-auto max-w-7xl space-y-4 p-4 pb-20 sm:space-y-6 sm:p-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          <div>
            <p className='text-xl font-bold sm:text-2xl'>{t('mentorPackageStatistics.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('mentorPackageStatistics.description')}</p>
          </div>

          <div className='flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0'>
            {YEAR_OPTIONS.map((year) => (
              <Button
                key={year}
                variant={year === selectedYear ? 'default' : 'outline'}
                size='sm'
                className='shrink-0'
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          {isLoadingMentorPackagesStatistics ? (
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className='h-28 w-full rounded-xl' />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6'>
              <StatCard
                title={t('mentorPackageStatistics.totalBookings')}
                value={summary?.totalPaidBookings ?? 0}
                icon={<ShoppingCartIcon className='size-4.5 text-white' />}
                color='slate'
              />
              <StatCard
                title={t('mentorPackageStatistics.bookingsWithVoucher')}
                value={summary?.bookingsWithVoucher ?? 0}
                icon={<TicketPercentIcon className='size-4.5 text-white' />}
                color='orange'
              />
              <StatCard
                title={t('mentorPackageStatistics.bookingsWithoutVoucher')}
                value={summary?.bookingsWithoutVoucher ?? 0}
                icon={<ReceiptIcon className='size-4.5 text-white' />}
                color='blue'
              />
              <StatCard
                title={t('mentorPackageStatistics.grossRevenue')}
                value={formatCurrency(summary?.grossRevenueAtListPrice ?? 0, summaryCurrency)}
                icon={<BanknoteIcon className='size-4.5 text-white' />}
                color='emerald'
              />
              <StatCard
                title={t('mentorPackageStatistics.netRevenue')}
                value={formatCurrency(summary?.netRevenueAfterVoucher ?? 0, summaryCurrency)}
                icon={<HandCoinsIcon className='size-4.5 text-white' />}
                color='green'
              />
              <StatCard
                title={t('mentorPackageStatistics.mentorPayout')}
                value={formatCurrency(summary?.mentorPayoutAfterCommission ?? 0, summaryCurrency)}
                icon={<LandmarkIcon className='size-4.5 text-white' />}
                color='purple'
              />
            </div>
          )}

          <div className='grid grid-cols-1 gap-2 xl:grid-cols-6'>
            <div className='xl:col-span-4'>
              <Card className='p-4 shadow-none gap-4'>
                <div>
                  <p className='font-semibold'>{t('mentorPackageStatistics.revenueOverview')}</p>
                  <p className='text-xs text-muted-foreground'>
                    {t('mentorPackageStatistics.revenueOverviewDescription', { year: selectedYear })}
                  </p>
                </div>

                {isLoadingMentorPackagesStatistics ? (
                  <Skeleton className='h-64 w-full rounded-xl' />
                ) : monthlyRevenueData.length > 0 ? (
                  <ChartContainer config={monthlyRevenueConfig} className='max-h-64 w-full'>
                    <BarChart accessibilityLayer data={monthlyRevenueData} barCategoryGap={18} barGap={6}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey='period' tickLine={false} tickMargin={10} axisLine={false} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator='line' className='min-w-60' />}
                      />
                      <Bar dataKey='grossRevenue' fill='var(--color-grossRevenue)' radius={4} barSize={14} />
                      <Bar dataKey='netRevenue' fill='var(--color-netRevenue)' radius={4} barSize={14} />
                      <Bar dataKey='mentorPayout' fill='var(--color-mentorPayout)' radius={4} barSize={14} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className='text-sm text-muted-foreground text-center py-10'>{t('common.ui.noDataAvailable')}</p>
                )}
              </Card>
            </div>

            <div className='xl:col-span-2'>
              <PieChartLabel
                data={packageRevenueShareData}
                config={packageRevenueShareConfig}
                dataKey='completed'
                nameKey='name'
                title={t('mentorPackageStatistics.packageRevenueShare')}
                description={t('mentorPackageStatistics.packageRevenueShareDescription')}
              />
            </div>
          </div>

          <BarChartHorizontal
            data={topPackagesByBookingsData}
            config={topPackagesByBookingsConfig}
            dataKey='bookings'
            xAxisKey='name'
            title={t('mentorPackageStatistics.topPackagesByBookings')}
            description={t('mentorPackageStatistics.topPackagesByBookingsDescription')}
            color='var(--color-bookings)'
          />
        </div>
      </div>
    </div>
  )
}
