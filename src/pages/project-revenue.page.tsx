import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import CreateRevenueDialog from '@/features/projects/components/dialogs/create-revenue-dialog'
import ProjectRevenueTable from '@/features/projects/components/project-revenue-table'
import { formatCurrency } from '@/features/projects/utils'
import { ArrowDownCircleIcon, ArrowUpCircleIcon, TrendingUpIcon, WalletIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useParams } from 'react-router'

export default function ProjectRevenuePage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const [openDialog, setOpenDialog] = useState(false)

  // TODO: thay bằng real hook sau
  // const { projectRevenueStats, isLoadingProjectRevenueStats } = useGetProjectRevenueStats({ projectId })
  const isLoadingProjectRevenueStats = false
  const projectRevenueStats = {
    totalIncome: 32000000,
    totalExpense: 5000000,
    currentBalance: 57000000,
    totalTransactions: 5
  }

  return (
    <>
      <div className='mx-auto p-6 space-y-6'>
        <div className='flex justify-between items-start gap-4'>
          <div>
            <p className='text-2xl font-bold tracking-tight'>{t('project.sidebar.revenuePage.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('project.sidebar.revenuePage.description')}</p>
          </div>

          <div className='flex items-center gap-2'>
            <Card className='px-2 py-1 gap-0 min-w-32 rounded-lg'>
              <p className='text-xs text-muted-foreground font-medium'>
                {t('project.projectRevenue.stats.totalIncome')}
              </p>
              {isLoadingProjectRevenueStats ? (
                <Skeleton className='h-7 w-16 mt-1' />
              ) : (
                <div className='flex items-center gap-1'>
                  <ArrowUpCircleIcon className='size-4 text-emerald-500' />
                  <p className='font-bold tracking-tight text-emerald-600'>
                    {formatCurrency(projectRevenueStats.totalIncome)}
                  </p>
                </div>
              )}
            </Card>

            <Card className='px-2 py-1 gap-0 min-w-32 rounded-lg'>
              <p className='text-xs text-muted-foreground font-medium'>
                {t('project.projectRevenue.stats.totalExpense')}
              </p>
              {isLoadingProjectRevenueStats ? (
                <Skeleton className='h-7 w-16 mt-1' />
              ) : (
                <div className='flex items-center gap-1'>
                  <ArrowDownCircleIcon className='size-4 text-rose-500' />
                  <p className='font-bold tracking-tight text-rose-500'>
                    {formatCurrency(projectRevenueStats.totalExpense)}
                  </p>
                </div>
              )}
            </Card>

            <Card className='px-2 py-1 gap-0 min-w-32 rounded-lg'>
              <p className='text-xs text-muted-foreground font-medium'>
                {t('project.projectRevenue.stats.currentBalance')}
              </p>
              {isLoadingProjectRevenueStats ? (
                <Skeleton className='h-7 w-16 mt-1' />
              ) : (
                <div className='flex items-center gap-1'>
                  <WalletIcon className='size-4 text-primary' />
                  <p className='font-bold tracking-tight'>{formatCurrency(projectRevenueStats.currentBalance)}</p>
                </div>
              )}
            </Card>

            <Card className='px-2 py-1 gap-0 min-w-32 rounded-lg'>
              <p className='text-xs text-muted-foreground font-medium'>
                {t('project.projectRevenue.stats.totalTransactions')}
              </p>
              {isLoadingProjectRevenueStats ? (
                <Skeleton className='h-7 w-16 mt-1' />
              ) : (
                <div className='flex items-center gap-1'>
                  <TrendingUpIcon className='size-4 text-primary' />
                  <p className='font-bold tracking-tight'>{projectRevenueStats.totalTransactions}</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {projectId ? <ProjectRevenueTable projectId={projectId} onAddRevenue={() => setOpenDialog(true)} /> : null}
      </div>

      <CreateRevenueDialog open={openDialog} onClose={() => setOpenDialog(false)} />
      <Outlet />
    </>
  )
}
