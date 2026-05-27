import {
  CALENDAR_HOUR_HEIGHT as HOUR_HEIGHT,
  CALENDAR_TIME_GUTTER_WIDTH as TIME_GUTTER_WIDTH
} from '@/features/projects/tasks/core/constants'
import type { MeetingRule } from '@/features/schedules/types'
import { useDateFormat } from '@/lib/date'
import { cn, getTimezoneOffsetString } from '@/shared/utils'
import { addDays, isAfter, isBefore, isSameDay, isToday, setHours, startOfDay, startOfWeek } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MeetingBooking } from '../../types'
import CalendarEvent from './calendar-event'
import { layoutDayEvents } from './calendar-layout'

interface WeekViewProps {
  date: Date
  meetings: MeetingBooking[]
  onMeetingClick?: (meeting: MeetingBooking) => void
  schedules?: MeetingRule[]
  showSchedulesOverlay?: boolean
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export default function WeekView({ date, meetings, onMeetingClick, schedules, showSchedulesOverlay }: WeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [timezone] = useState(getTimezoneOffsetString())
  const days = getWeekDays(date)
  const now = new Date()
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
            <span className='text-[10px] text-muted-foreground'>{timezone}</span>
          </div>
        </div>

        {days.map((day) => {
          const today = isToday(day)
          return (
            <div key={day.toISOString()} className='flex-1 text-center py-2 border-l'>
              <p className={cn('text-xs uppercase', today ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                {weekdayNames[day.getDay()]}
              </p>
              <div
                className={cn(
                  'mx-auto mt-0.5 size-10 flex items-center justify-center rounded-full text-lg font-medium',
                  today && 'bg-primary text-primary-foreground'
                )}
              >
                {formatDate(day, 'dayOfMonth')}
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
              {hour === 0 ? '' : formatDate(setHours(new Date(), hour), 'hourShort')}
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

          const dayOfWeek = day.getDay()
          const startOfCurrentDay = startOfDay(day)

          const daySchedules = schedules?.filter((s) => {
            if (s.dayOfWeek !== dayOfWeek) return false

            if (s.activeFrom) {
              const fromDate = startOfDay(new Date(s.activeFrom))
              if (isBefore(startOfCurrentDay, fromDate)) return false
            }

            if (s.activeTo) {
              const toDate = startOfDay(new Date(s.activeTo))
              if (isAfter(startOfCurrentDay, toDate)) return false
            }

            return true
          })

          return (
            <div key={day.toISOString()} className='flex-1 relative border-l'>
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className={cn('absolute w-full', hour !== 0 && 'border-t border-border/60')}
                  style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                />
              ))}

              {showSchedulesOverlay &&
                daySchedules?.map((rule) => {
                  if (!rule.startTimeUtc || !rule.endTimeUtc) return null
                  const [startHour, startMin] = rule.startTimeUtc.split(':').map(Number)
                  const [endHour, endMin] = rule.endTimeUtc.split(':').map(Number)

                  const top = (startHour + startMin / 60) * HOUR_HEIGHT
                  const height = (endHour + endMin / 60) * HOUR_HEIGHT - top - 4

                  let bgClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-900 dark:text-emerald-400' // permanent
                  let labelText: string = t('schedule.timeline.legend.permanent')

                  if (rule.activeFrom && rule.activeTo) {
                    bgClass = 'bg-purple-500/15 border-purple-500/30 text-purple-900 dark:text-purple-400' // range
                    labelText = `${formatDate(rule.activeFrom, 'dateShort2y')} - ${formatDate(rule.activeTo, 'dateShort2y')}`
                  } else if (rule.activeFrom) {
                    bgClass = 'bg-blue-500/15 border-blue-500/30 text-blue-900 dark:text-blue-400' // fromOnly
                    labelText = `${t('schedule.timeline.activeFrom')} ${formatDate(rule.activeFrom, 'dateShort2y')}`
                  } else if (rule.activeTo) {
                    bgClass = 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-400' // toOnly
                    labelText = `${t('schedule.timeline.activeTo')} ${formatDate(rule.activeTo, 'dateShort2y')}`
                  }

                  return (
                    <div
                      key={rule.id}
                      className={cn(
                        'absolute w-[calc(100%-6px)] left-0.5 z-0 border border-dashed rounded-md pointer-events-none flex flex-col p-2 overflow-hidden',
                        bgClass
                      )}
                      style={{ top, height }}
                    >
                      <p className='text-xs font-semibold opacity-80 truncate leading-tight'>{labelText}</p>
                    </div>
                  )
                })}

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
                      width: `calc(${widthPercent}% - 12px)`
                    }}
                  />
                )
              })}

              {currentTimeTop !== null && (
                <div
                  className='absolute left-0 right-0 flex items-center pointer-events-none'
                  style={{ top: currentTimeTop }}
                >
                  <div className='size-2.5 rounded-full bg-destructive -ml-1.25' />
                  <div className='flex-1 h-0.5 bg-destructive' />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
