import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useDateFormat } from '@/lib/date'
import { getAvatarFallback } from '@/shared/utils'
import { useTranslation } from 'react-i18next'
import type { ProjectActivity } from '../types'

interface ProjectActivityRowProps {
  activity: ProjectActivity
}

export default function ProjectActivityRow({ activity }: ProjectActivityRowProps) {
  const { t } = useTranslation()
  const { formatRelative } = useDateFormat()

  return (
    <div className='flex items-start gap-2'>
      <Avatar className='size-7'>
        <AvatarImage src={activity.actor.avatar || ''} />
        <AvatarFallback>{getAvatarFallback(`${activity.actor.firstName} ${activity.actor.lastName}`)}</AvatarFallback>
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
  )
}
