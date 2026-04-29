import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { CALENDAR_HOUR_HEIGHT, CALENDAR_EVENT_MIN_HEIGHT as MIN_HEIGHT_FOR_TIME } from '@/features/tasks/constants'
import { cn, getAvatarFallback } from '@/shared/utils'
import { MeetingStatus, type MeetingBooking } from '@/types/meeting.type'
import { format } from 'date-fns'
import { PresentationIcon, UsersRoundIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface CalendarEventProps {
  meeting: MeetingBooking & { status?: string }
  variant?: 'block' | 'chip'
  style?: React.CSSProperties
  className?: string
  onClick?: (meeting: MeetingBooking) => void
}

export default function CalendarEvent({ meeting, variant = 'block', style, className, onClick }: CalendarEventProps) {
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const isMentor = meeting.mentorUserId === user?.id
  const theme = {
    dot: 'bg-blue-500',
    block: 'border-blue-500 bg-blue-600 hover:bg-blue-700 text-white',
    avatar: 'bg-blue-600 text-white'
  }

  if (isMentor && (!meeting.status || meeting.status === MeetingStatus.BOOKED)) {
    theme.block =
      'border-orange-300 bg-gradient-to-br from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-md shadow-orange-400/15'
    theme.dot = 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]'
    theme.avatar = 'bg-orange-700 text-orange-100'
  }

  const mentorFullName = `${meeting.mentor.firstName} ${meeting.mentor.lastName}`

  const displayName = isMentor ? '' : mentorFullName

  const projectText = meeting.projectId && meeting.project ? `[${meeting.project.name}] - ` : ''
  const titleText = meeting.packageBookingId
    ? `${t('meeting.detail.session', { sequence: meeting.packageSequence })} - ${meeting.packageName}`
    : isMentor
      ? t('meeting.detail.mentoringSession')
      : `${t('meeting.detail.meetingWith')} ${mentorFullName}`

  const title = `${projectText}${titleText}`

  const startTime = meeting.startTimeUtc ? format(new Date(meeting.startTimeUtc), 'h:mm a') : ''
  const endTime = meeting.endTimeUtc ? format(new Date(meeting.endTimeUtc), 'h:mm a') : ''
  const timeString = startTime && endTime ? `${startTime} - ${endTime}` : ''

  // month view
  if (variant === 'chip') {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-xs truncate cursor-pointer',
          'hover:bg-accent/80 hover:scale-[1.01] transition-colors',
          className
        )}
        title={`${title}\n${timeString}\nw/ ${displayName}`}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(meeting)
        }}
      >
        <div className={cn('size-2.5 rounded-full shrink-0', theme.dot)} />
        {startTime && <p className='font-medium shrink-0'>{startTime}</p>}
        <p className='truncate font-medium text-foreground'>{title}</p>
      </div>
    )
  }

  const height = typeof style?.height === 'number' ? style.height : CALENDAR_HOUR_HEIGHT
  const isCompact = height < MIN_HEIGHT_FOR_TIME

  return (
    <div
      className={cn(
        'absolute rounded-md overflow-hidden cursor-pointer group transition-all',
        'border-l-4 hover:scale-[1.01] hover:z-10',
        theme.block,
        isCompact ? 'flex items-center px-1.5 gap-1.5' : 'flex flex-col px-2 py-1.5',
        className
      )}
      style={{
        minHeight: 22,
        ...style
      }}
      title={`${title}\n${timeString}\nw/ ${displayName}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(meeting)
      }}
    >
      {isCompact ? (
        <>
          <p className='text-[11px] font-medium opacity-75 shrink-0'>{timeString}</p>
          <p className='text-xs font-semibold truncate leading-none'>{title}</p>
        </>
      ) : (
        <>
          <p className='text-xs font-semibold truncate leading-tight drop-shadow-sm'>{title}</p>
          {timeString && (
            <p className='text-[11px] font-medium truncate mt-0.5 leading-tight opacity-90'>{timeString}</p>
          )}

          {height >= CALENDAR_HOUR_HEIGHT - 2 && (
            <div className='flex items-center justify-between mt-auto pt-1'>
              <div className='flex items-center gap-1.5 overflow-hidden'>
                {!isMentor && (
                  <Avatar className='size-4 shadow-sm ring-1 ring-white/20'>
                    <AvatarImage src={meeting.mentor.avatarUrl ?? ''} />
                    <AvatarFallback className={cn('text-[8px] font-bold', theme.avatar)}>
                      {getAvatarFallback(displayName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <p className='text-[11px] truncate opacity-95'>{displayName}</p>
              </div>
              {isMentor ? (
                <PresentationIcon className='size-3.5 shrink-0 ml-1 drop-shadow-sm' />
              ) : (
                <UsersRoundIcon className='size-3.5 shrink-0 ml-1 drop-shadow-sm' />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
