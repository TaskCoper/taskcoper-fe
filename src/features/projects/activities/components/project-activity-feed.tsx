import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDateFormat } from '@/lib/date'
import { cn, getAvatarFallback } from '@/shared/utils'
import { Activity as ActivityIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGetProjectActivities } from '../hooks/use-get-project-activities'

interface ProjectActivityFeedProps {
  projectIdentifier?: string
  className?: string
}

export default function ProjectActivityFeed({ projectIdentifier, className }: ProjectActivityFeedProps) {
  const { t } = useTranslation()
  const { formatRelative } = useDateFormat()
  const { projectActivities, isLoadingProjectActivities } = useGetProjectActivities({ projectIdentifier })
  const items = projectActivities?.value.items ?? []

  return (
    <Card className={cn('p-3 gap-3 rounded-lg shadow-none', className)}>
      <div className='flex items-center gap-2'>
        <ActivityIcon className='size-4' />
        <p className='font-semibold'>{t('project.activity.title')}</p>
      </div>

      {isLoadingProjectActivities ? (
        <div className='space-y-3'>
          <Skeleton className='h-10' />
          <Skeleton className='h-10' />
          <Skeleton className='h-10' />
        </div>
      ) : items.length === 0 ? (
        <p className='text-xs text-muted-foreground'>{t('project.activity.empty')}</p>
      ) : (
        <div className='space-y-4 max-h-96 overflow-y-auto pr-1'>
          {items.map((activity) => (
            <div key={activity.id} className='flex items-start gap-2'>
              <Avatar className='size-7'>
                <AvatarImage src={activity.actor.avatar || ''} />
                <AvatarFallback>
                  {getAvatarFallback(`${activity.actor.firstName} ${activity.actor.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <div className='w-full min-w-0'>
                <p className='text-sm text-foreground/70'>
                  <span className='font-semibold text-foreground'>
                    {activity.actor.firstName} {activity.actor.lastName}
                  </span>{' '}
                  {t(`activities.${activity.verb}`, { defaultValue: activity.verb })}
                </p>
                <p className='text-[11px] text-muted-foreground font-normal truncate'>
                  {formatRelative(activity.occurredOnUtc)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
