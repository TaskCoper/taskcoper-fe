import { useDateFormat } from '@/lib/date'
import { cn } from '@/shared/utils'
import { addDays, endOfMonth, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { MeetingBooking } from '../../types'
import CalendarEvent from './calendar-event'

interface MonthViewProps {
  date: Date
  meetings: MeetingBooking[]
  onMeetingClick?: (meeting: MeetingBooking) => void
}

const MAX_VISIBLE_TASKS = 3

function getMonthGrid(date: Date) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })

  const days: Date[] = []
  let current = calendarStart

  while (days.length < 42) {
    days.push(current)
    current = addDays(current, 1)
  }

  const lastRowStart = days[35]
  if (!isSameMonth(lastRowStart, date) && lastRowStart > monthEnd) {
    days.splice(35, 7)
  }

  return days
}

export default function MonthView({ date, meetings, onMeetingClick }: MonthViewProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const weekdayNames = [
    t('dayOfWeek.sunday'),
    t('dayOfWeek.monday'),
    t('dayOfWeek.tuesday'),
    t('dayOfWeek.wednesday'),
    t('dayOfWeek.thursday'),
    t('dayOfWeek.friday'),
    t('dayOfWeek.saturday')
  ]
  const days = getMonthGrid(date)
  const weeks = Math.ceil(days.length / 7)

  function getMeetingsForDay(day: Date) {
    return meetings.filter((meeting) => {
      if (!meeting.startTimeUtc) return false
      return isSameDay(new Date(meeting.startTimeUtc), day)
    })
  }

  return (
    <div className='flex-1 flex flex-col max-h-[calc(100vh-6.75rem)]'>
      <div className='grid grid-cols-7 border-b sticky top-0 bg-background z-10'>
        {weekdayNames.map((name) => (
          <div
            key={name}
            className='py-2 text-center text-xs font-medium text-muted-foreground uppercase border-l first:border-l-0'
          >
            {name}
          </div>
        ))}
      </div>

      <div className='flex-1 grid grid-cols-7' style={{ gridTemplateRows: `repeat(${weeks}, minmax(100px, 1fr))` }}>
        {days.map((day) => {
          const today = isToday(day)
          const inMonth = isSameMonth(day, date)
          const dayMeetings = getMeetingsForDay(day)
          const visibleMeetings = dayMeetings.slice(0, MAX_VISIBLE_TASKS)
          const overflow = dayMeetings.length - MAX_VISIBLE_TASKS

          return (
            <div key={day.toISOString()} className={cn('border-l border-b p-1', !inMonth && 'bg-muted/30')}>
              <div className='flex items-start justify-center'>
                <span
                  className={cn(
                    'inline-flex items-center justify-center size-7 rounded-full text-sm select-none',
                    today && 'bg-primary text-primary-foreground font-semibold',
                    !today && inMonth && 'text-foreground',
                    !today && !inMonth && 'text-muted-foreground'
                  )}
                >
                  {formatDate(day, 'dayOfMonth')}
                </span>
              </div>

              <div className='mt-1 space-y-1'>
                {visibleMeetings.map((meeting) => (
                  <CalendarEvent key={meeting.id} meeting={meeting} variant='chip' onClick={onMeetingClick} />
                ))}
                {overflow > 0 && (
                  <p className='text-[10px] text-muted-foreground pl-1.5 cursor-pointer hover:text-foreground'>
                    {t('common.ui.more', { count: overflow })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
