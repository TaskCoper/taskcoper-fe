import CalendarEvent from '@/features/tasks/components/calendar/calendar-event'
import { layoutDayEvents } from '@/features/tasks/components/calendar/calendar-layout'
import {
  CALENDAR_HOUR_HEIGHT as HOUR_HEIGHT,
  CALENDAR_TIME_GUTTER_WIDTH as TIME_GUTTER_WIDTH
} from '@/features/tasks/constants'
import { cn } from '@/shared/utils'
import type { MeetingBooking } from '@/types/meeting.type'
import { addDays, format, isSameDay, isToday, setHours, startOfWeek } from 'date-fns'
import { useEffect, useRef } from 'react'

interface WeekViewProps {
  date: Date
  meetings: MeetingBooking[]
  onMeetingClick?: (meeting: MeetingBooking) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export default function WeekView({ date, meetings, onMeetingClick }: WeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const days = getWeekDays(date)
  const now = new Date()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT
    }
  }, [])

  return (
    <div ref={scrollRef} className='flex-1 overflow-y-auto'>
      <div className='flex border-b sticky top-0 bg-background z-10'>
        <div className='shrink-0' style={{ width: TIME_GUTTER_WIDTH }}>
          <div className='h-full flex items-end justify-end pr-2 pb-1'>
            <span className='text-[10px] text-muted-foreground'>GMT+07</span>
          </div>
        </div>

        {days.map((day) => {
          const today = isToday(day)
          return (
            <div key={day.toISOString()} className='flex-1 text-center py-2 border-l'>
              <p className={cn('text-xs uppercase', today ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                {format(day, 'EEE')}
              </p>
              <div
                className={cn(
                  'mx-auto mt-0.5 size-10 flex items-center justify-center rounded-full text-lg font-medium',
                  today && 'bg-primary text-primary-foreground'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      <div className='flex relative' style={{ height: 24 * HOUR_HEIGHT + 16 }}>
        <div className='shrink-0 relative' style={{ width: TIME_GUTTER_WIDTH }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className='absolute w-full text-[11px] text-muted-foreground text-right pr-2 -translate-y-2.5 select-none'
              style={{ top: hour * HOUR_HEIGHT }}
            >
              {hour === 0 ? '' : format(setHours(new Date(), hour), 'h a')}
            </div>
          ))}
        </div>

        {days.map((day) => {
          const today = isToday(day)
          const dayMeetings = meetings.filter((meeting) => {
            if (!meeting.startTimeUtc) return false
            return isSameDay(new Date(meeting.startTimeUtc), day)
          })

          const layouted = layoutDayEvents(dayMeetings, day)
          const currentTimeTop = today ? ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT : null

          return (
            <div key={day.toISOString()} className='flex-1 relative border-l'>
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className={cn('absolute w-full', hour !== 0 && 'border-t border-border/60')}
                  style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                />
              ))}

              {layouted.map((ev) => {
                const widthPercent = 100 / ev.totalColumns
                const leftPercent = ev.column * widthPercent
                return (
                  <CalendarEvent
                    key={ev.meeting.id}
                    meeting={ev.meeting}
                    onClick={onMeetingClick}
                    style={{
                      top: ev.top + 1,
                      height: ev.height - 2,
                      left: `calc(${leftPercent}% + 2px)`,
                      width: `calc(${widthPercent}% - 14px)`
                    }}
                  />
                )
              })}

              {currentTimeTop !== null && (
                <div
                  className='absolute left-0 right-0 z-20 flex items-center pointer-events-none'
                  style={{ top: currentTimeTop }}
                >
                  <div className='size-2.5 rounded-full bg-destructive -ml-[5px]' />
                  <div className='flex-1 h-[2px] bg-destructive' />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
