import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import ProjectRevenueTable from '@/features/projects/components/project-revenue-table'
import { formatCurrency } from '@/features/projects/utils'
import { ArrowDownCircleIcon, ArrowUpCircleIcon, PlusIcon, TrendingUpIcon, WalletIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useParams } from 'react-router'

// Popup add revenue
function AddRevenueDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <PlusIcon className='size-4' />
            {t('project.projectRevenue.addRevenue')}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-1.5'>
            <Label>
              {t('project.projectRevenue.form.name')}
              <span className='text-destructive ml-0.5'>*</span>
            </Label>
            <Input placeholder={t('project.projectRevenue.form.namePlaceholder')} />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>
                {t('project.projectRevenue.form.type')}
                <span className='text-destructive ml-0.5'>*</span>
              </Label>
              <Select defaultValue='income'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='income'>
                    <span className='flex items-center gap-1.5 text-emerald-600'>
                      <ArrowUpCircleIcon className='size-3.5' />
                      {t('project.projectRevenue.type.income')}
                    </span>
                  </SelectItem>
                  <SelectItem value='expense'>
                    <span className='flex items-center gap-1.5 text-rose-500'>
                      <ArrowDownCircleIcon className='size-3.5' />
                      {t('project.projectRevenue.type.expense')}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label>
                {t('project.projectRevenue.form.amount')}
                <span className='text-destructive ml-0.5'>*</span>
              </Label>
              <Input type='number' placeholder='0' min={0} />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label>{t('project.projectRevenue.form.note')}</Label>
            <Textarea placeholder={t('project.projectRevenue.form.notePlaceholder')} rows={3} className='resize-none' />
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onClose}>
            {t('common.button.cancel')}
          </Button>
          <Button>{t('common.button.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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

      <AddRevenueDialog open={openDialog} onClose={() => setOpenDialog(false)} />
      <Outlet />
    </>
  )
}
