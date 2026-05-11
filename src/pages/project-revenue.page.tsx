import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetProjectRevenueStats } from '@/features/projects/analytics/hooks/use-get-project-revenue-stats'
import ProjectRevenueTable from '@/features/projects/revenue/components/project-revenue-table'
import { ArrowUpDownIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

export default function ProjectRevenuePage() {
  const { t, i18n } = useTranslation()
  const { identifier } = useParams<{ identifier: string }>()
  const { revenueStats, isLoadingRevenueStats } = useGetProjectRevenueStats({ projectIdentifier: identifier })

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center gap-4'>
        <div>
          <p className='text-2xl font-bold'>{t('project.sidebar.revenuePage.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('project.sidebar.revenuePage.description')}</p>
        </div>

        <div className='flex items-center gap-2'>
          <Card className='px-2 py-1 gap-0 min-w-32 rounded-lg'>
            <p className='text-xs text-muted-foreground font-medium'>{t('projectRevenue.stats.totalRevenue')}</p>
            {isLoadingRevenueStats ? (
              <Skeleton className='h-7 w-full' />
            ) : (
              <div className='flex items-center gap-1.5'>
                <TrendingUpIcon className='size-4 text-emerald-500' />
                <p className='font-bold tracking-tight'>
                  {new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(revenueStats?.totalRevenue ?? 0)}
                </p>
              </div>
            )}
          </Card>

          <Card className='px-2 py-1 gap-0 min-w-32 rounded-lg'>
            <p className='text-xs text-muted-foreground font-medium'>{t('projectRevenue.stats.totalExpense')}</p>
            {isLoadingRevenueStats ? (
              <Skeleton className='h-7 w-full' />
            ) : (
              <div className='flex items-center gap-1.5'>
                <TrendingDownIcon className='size-4 text-rose-500' />
                <p className='font-bold tracking-tight'>
                  {new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(revenueStats?.totalExpense ?? 0)}
                </p>
              </div>
            )}
          </Card>

          <Card className='px-2 py-1 gap-0 min-w-32 rounded-lg'>
            <p className='text-xs text-muted-foreground font-medium'>{t('projectRevenue.stats.netRevenue')}</p>
            {isLoadingRevenueStats ? (
              <Skeleton className='h-7 w-full' />
            ) : (
              <div className='flex items-center gap-1.5'>
                <ArrowUpDownIcon className='size-4 text-primary' />
                <p className='font-bold tracking-tight'>
                  {new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(revenueStats?.netRevenue ?? 0)}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {identifier ? <ProjectRevenueTable projectIdentifier={identifier} /> : null}
    </div>
  )
}
