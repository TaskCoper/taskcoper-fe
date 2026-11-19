import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { GaugeIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGetProjectMemberPerformance } from '../hooks/use-get-project-member-performance'

interface MemberPerformanceScoreCardProps {
  projectIdentifier?: string
  userId?: string
  from?: string
  to?: string
}

const toPercent = (rate: number) => `${Math.round(rate * 100)}%`

export default function MemberPerformanceScoreCard({
  projectIdentifier,
  userId,
  from,
  to
}: MemberPerformanceScoreCardProps) {
  const { t } = useTranslation()
  const { memberPerformance, isLoadingMemberPerformance } = useGetProjectMemberPerformance({
    projectIdentifier,
    userId,
    from,
    to
  })

  return (
    <Card className='gap-3 rounded-lg p-4 shadow-none'>
      <div className='flex items-center gap-2'>
        <GaugeIcon className='size-4' />
        <p className='font-semibold'>{t('projectPerformance.memberScore.title')}</p>
      </div>

      {isLoadingMemberPerformance ? (
        <Skeleton className='h-24' />
      ) : !memberPerformance?.hasEnoughData ? (
        <p className='text-sm text-muted-foreground'>{t('projectPerformance.memberScore.insufficient')}</p>
      ) : (
        <div className='space-y-4'>
          <div className='flex items-end gap-1'>
            <span className='text-4xl font-bold leading-none'>{memberPerformance.score}</span>
            <span className='mb-1 text-sm text-muted-foreground'>{t('projectPerformance.memberScore.outOf100')}</span>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>{t('projectPerformance.memberScore.completion')}</span>
              <span className='font-medium'>
                {toPercent(memberPerformance.completionRate)}
                <span className='font-normal text-muted-foreground'>
                  {' '}
                  ({memberPerformance.completedTasks}/{memberPerformance.assignedTasks})
                </span>
              </span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>{t('projectPerformance.memberScore.onTime')}</span>
              <span className='font-medium'>
                {toPercent(memberPerformance.onTimeRate)}
                <span className='font-normal text-muted-foreground'>
                  {' '}
                  ({memberPerformance.onTimeCompletedTasks}/{memberPerformance.completedTasks})
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
