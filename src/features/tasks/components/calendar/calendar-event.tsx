import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getMeetingStatusTheme } from '@/features/meetings/utils'
import { CALENDAR_HOUR_HEIGHT, CALENDAR_EVENT_MIN_HEIGHT as MIN_HEIGHT_FOR_TIME } from '@/features/tasks/constants'
import { cn, getAvatarFallback } from '@/shared/utils'
import { type MeetingBooking } from '@/types/meeting.type'
import { format } from 'date-fns'

interface CalendarEventProps {
  meeting: MeetingBooking & { status?: string }
  variant?: 'block' | 'chip'
  style?: React.CSSProperties
  className?: string
  onClick?: (meeting: MeetingBooking) => void
}

export default function CalendarEvent({ meeting, variant = 'block', style, className, onClick }: CalendarEventProps) {
  const theme = getMeetingStatusTheme(meeting.status)

  const mentorFullName = `${meeting.mentor.firstName} ${meeting.mentor.lastName}`
  const projectText = meeting.project?.name ? `[${meeting.project.name}] ` : ''
  const title = `${projectText}${meeting.packageName}`

  const startTime = meeting.startTimeUtc ? format(new Date(meeting.startTimeUtc), 'h:mm a') : ''
  const endTime = meeting.endTimeUtc ? format(new Date(meeting.endTimeUtc), 'h:mm a') : ''
  const timeString = startTime && endTime ? `${startTime} - ${endTime}` : ''

  // month view
  if (variant === 'chip') {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-xs truncate cursor-pointer',
          'hover:bg-accent/80 hover:scale-101 transition-colors',
          className
        )}
        title={`${title}\n${timeString}\nw/ ${mentorFullName}`}
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
        'border-l-4 hover:scale-101',
        theme.block,
        isCompact ? 'flex items-center px-1.5 gap-1.5' : 'flex flex-col px-2 py-1.5',
        className
      )}
      style={{
        minHeight: 22,
        ...style
      }}
      title={`${title}\n${timeString}\nw/ ${mentorFullName}`}
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
          <p className='text-xs font-semibold truncate leading-tight'>{title}</p>
          {timeString && <p className='text-[11px] font-medium truncate mt-0.5 leading-tight'>{timeString}</p>}

          {height >= CALENDAR_HOUR_HEIGHT - 2 && (
            <div className='flex items-center gap-1.5 mt-auto pt-1'>
              <Avatar className='size-4'>
                <AvatarImage src={meeting.mentor.avatarUrl ?? ''} />
                <AvatarFallback className={cn('text-[8px]', theme.avatar)}>
                  {getAvatarFallback(mentorFullName)}
                </AvatarFallback>
              </Avatar>
              <p className='text-[11px] font-medium truncate opacity-90'>{mentorFullName}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
