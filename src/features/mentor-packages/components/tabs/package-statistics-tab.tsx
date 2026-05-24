import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import StatCard from '@/features/projects/core/components/stat-card'
import { useDateFormat } from '@/lib/date'
import { formatCurrency } from '@/shared/utils'
import { endOfYear, getYear, startOfYear } from 'date-fns'
import {
  BanknoteIcon,
  HandCoinsIcon,
  LandmarkIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  TicketPercentIcon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { useGetMentorPackageStatistics } from '../../hooks/use-get-mentor-package-statistics'

const currentYear = getYear(new Date())
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i)

export default function PackageStatisticsTab() {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const { packageId } = useParams<{ packageId: string }>()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const dateRange = {
    startTime: startOfYear(new Date(selectedYear, 0, 1)).toISOString(),
    endTime: endOfYear(new Date(selectedYear, 0, 1)).toISOString()
  }

  const { packageStatistics, isFetchingPackageStatistics } = useGetMentorPackageStatistics({
    mentorPackageId: packageId,
    ...dateRange
  })

  const summary = packageStatistics?.summary

  const chartData = packageStatistics?.monthlyBreakdown
    ? packageStatistics.monthlyBreakdown.map((item) => ({
        period: formatDate(new Date(item.year, item.month - 1, 1), 'monthShort'),
        grossRevenue: item.grossRevenueAtListPrice,
        netRevenue: item.netRevenueAfterVoucher,
        mentorPayout: item.mentorPayoutAfterCommission,
        totalBookings: item.totalPaidBookings
      }))
    : []

  const chartConfig: ChartConfig = {
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
  }

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-xl font-bold'>{t('mentorPackageStatistics.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('mentorPackageStatistics.description')}</p>
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        {YEAR_OPTIONS.map((year) => (
          <Button
            key={year}
            variant={year === selectedYear ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </Button>
        ))}
      </div>

      {isFetchingPackageStatistics ? (
        <div className='grid grid-cols-6 gap-2'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-28 w-full rounded-xl' />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-6 gap-2'>
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
            value={formatCurrency(summary?.grossRevenueAtListPrice ?? 0, packageStatistics?.currency)}
            icon={<BanknoteIcon className='size-4.5 text-white' />}
            color='emerald'
          />
          <StatCard
            title={t('mentorPackageStatistics.netRevenue')}
            value={formatCurrency(summary?.netRevenueAfterVoucher ?? 0, packageStatistics?.currency)}
            icon={<HandCoinsIcon className='size-4.5 text-white' />}
            color='green'
          />
          <StatCard
            title={t('mentorPackageStatistics.mentorPayout')}
            value={formatCurrency(summary?.mentorPayoutAfterCommission ?? 0, packageStatistics?.currency)}
            icon={<LandmarkIcon className='size-4.5 text-white' />}
            color='purple'
          />
        </div>
      )}

      <Card className='p-4 shadow-none gap-4'>
        <div>
          <p className='font-semibold'>{t('mentorPackageStatistics.revenueOverview')}</p>
          <p className='text-xs text-muted-foreground'>
            {t('mentorPackageStatistics.revenueOverviewDescription', { year: selectedYear })}
          </p>
        </div>

        {isFetchingPackageStatistics ? (
          <Skeleton className='h-64 w-full rounded-xl' />
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className='max-h-64 w-full'>
            <BarChart accessibilityLayer data={chartData} barCategoryGap={18} barGap={6}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='period' tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='line' className='min-w-60' />} />
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
  )
}
