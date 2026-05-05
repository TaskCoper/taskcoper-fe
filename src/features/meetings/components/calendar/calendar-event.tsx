import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { getMeetingStatusTheme } from '@/features/meetings/utils'
import { CALENDAR_HOUR_HEIGHT, CALENDAR_EVENT_MIN_HEIGHT as MIN_HEIGHT_FOR_TIME } from '@/features/tasks/constants'
import { cn, getAvatarFallback } from '@/shared/utils'
import { MeetingStatus, type MeetingBooking } from '@/types/meeting.type'
import { format } from 'date-fns'
import { MicIcon } from 'lucide-react'
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
  const theme = getMeetingStatusTheme(meeting.status)

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

  // month view chip
  if (variant === 'chip') {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-sm p-1 text-xs truncate cursor-pointer',
          'border border-l-3',
          theme.block,
          'hover:scale-[1.01] transition-all',
          className
        )}
        title={`${title}\n${timeString}\nw/ ${displayName}`}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(meeting)
        }}
      >
        {startTime && <p className='font-medium shrink-0 text-white/80'>{startTime}</p>}
        <p
          className={cn(
            'truncate font-medium text-white/95',
            meeting.status === MeetingStatus.CANCELLED ? 'line-through text-white/70' : ''
          )}
        >
          {title}
        </p>
        {isMentor && <MicIcon className='ml-auto shrink-0 size-3 text-white/90' />}
      </div>
    )
  }

  const height = typeof style?.height === 'number' ? style.height : CALENDAR_HOUR_HEIGHT
  const isCompact = height < MIN_HEIGHT_FOR_TIME

  return (
    <div
      className={cn(
        'absolute rounded-md overflow-hidden cursor-pointer group transition-all',
        'border border-l-4 shadow-sm',
        theme.block,
        'hover:shadow-md hover:scale-[1.01]',
        isCompact ? 'flex items-center px-1.5 gap-1.5' : 'flex flex-col p-1.5',
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
          <p className='text-[11px] font-medium text-white/80 shrink-0'>{timeString}</p>
          <p
            className={cn(
              'text-xs font-semibold truncate leading-none text-white/95',
              meeting.status === MeetingStatus.CANCELLED ? 'line-through text-white/70' : ''
            )}
          >
            {title}
          </p>
          {isMentor && <MicIcon className='size-3 shrink-0 ml-auto text-white/90' />}
        </>
      ) : (
        <>
          <p
            className={cn(
              'text-xs font-semibold truncate leading-tight text-white/95',
              meeting.status === MeetingStatus.CANCELLED && 'line-through text-white/70'
            )}
          >
            {title}
          </p>

          {timeString && (
            <p className='text-[11px] font-medium truncate mt-0.5 leading-tight text-white/80'>{timeString}</p>
          )}

          {height >= CALENDAR_HOUR_HEIGHT - 30 && !isMentor && (
            <div className='flex items-center gap-1.5 mt-auto pt-1 overflow-hidden'>
              <Avatar className='size-4 shadow-sm shrink-0'>
                <AvatarImage src={meeting.mentor.avatarUrl ?? ''} />
                <AvatarFallback className={cn('text-[8px] font-bold', theme.avatar)}>
                  {getAvatarFallback(displayName)}
                </AvatarFallback>
              </Avatar>
              <p className='text-[11px] truncate text-white/90'>{displayName}</p>
            </div>
          )}

          {isMentor && (
            <>
              <div className='flex-1' />
              <div className='p-1 rounded-full bg-white/30 ml-auto'>
                <MicIcon className='size-3.5' />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
