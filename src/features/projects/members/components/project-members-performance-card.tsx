import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getAvatarFallback } from '@/shared/utils'
import { endOfMonth, startOfMonth } from 'date-fns'
import { GaugeIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useGetProjectMembersPerformance } from '../hooks/use-get-project-members-performance'

interface ProjectMembersPerformanceCardProps {
  projectIdentifier?: string
}

const toPercent = (rate: number) => `${Math.round(rate * 100)}%`

export default function ProjectMembersPerformanceCard({ projectIdentifier }: ProjectMembersPerformanceCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const from = useMemo(() => startOfMonth(new Date()).toISOString(), [])
  const to = useMemo(() => endOfMonth(new Date()).toISOString(), [])

  const { membersPerformance, isLoadingMembersPerformance } = useGetProjectMembersPerformance({
    projectIdentifier,
    from,
    to
  })

  return (
    <Card className='gap-4 p-4 shadow-none'>
      <div className='flex items-center gap-2'>
        <GaugeIcon className='size-4' />
        <p className='font-semibold'>{t('projectPerformance.memberScore.teamTitle')}</p>
      </div>

      {isLoadingMembersPerformance ? (
        <div className='space-y-2'>
          <Skeleton className='h-10' />
          <Skeleton className='h-10' />
          <Skeleton className='h-10' />
        </div>
      ) : membersPerformance.length === 0 ? (
        <p className='text-sm text-muted-foreground'>{t('projectPerformance.memberScore.empty')}</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b text-left text-muted-foreground'>
                <th className='py-2 font-medium'>{t('projectPerformance.memberScore.member')}</th>
                <th className='py-2 text-right font-medium'>{t('projectPerformance.memberScore.title')}</th>
                <th className='py-2 text-right font-medium'>{t('projectPerformance.memberScore.completion')}</th>
                <th className='py-2 text-right font-medium'>{t('projectPerformance.memberScore.onTime')}</th>
              </tr>
            </thead>
            <tbody>
              {membersPerformance.map((member) => (
                <tr
                  key={member.userId}
                  className='cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50'
                  onClick={() => navigate(`/projects/${projectIdentifier}/members/${member.slug}`)}
                >
                  <td className='py-2'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='size-7'>
                        <AvatarImage src={member.avatar || ''} />
                        <AvatarFallback>{getAvatarFallback(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
                      </Avatar>
                      <span className='font-medium'>
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                  </td>
                  <td className='py-2 text-right font-semibold'>
                    {member.hasEnoughData ? (
                      member.score
                    ) : (
                      <span className='font-normal text-muted-foreground'>
                        {t('projectPerformance.memberScore.noScore')}
                      </span>
                    )}
                  </td>
                  <td className='py-2 text-right'>
                    {toPercent(member.completionRate)}{' '}
                    <span className='text-muted-foreground'>
                      ({member.completedTasks}/{member.assignedTasks})
                    </span>
                  </td>
                  <td className='py-2 text-right'>
                    {toPercent(member.onTimeRate)}{' '}
                    <span className='text-muted-foreground'>
                      ({member.onTimeCompletedTasks}/{member.completedTasks})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
