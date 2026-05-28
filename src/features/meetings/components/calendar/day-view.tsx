import {
  CALENDAR_HOUR_HEIGHT as HOUR_HEIGHT,
  CALENDAR_TIME_GUTTER_WIDTH as TIME_GUTTER_WIDTH
} from '@/features/projects/tasks/core/constants'
import type { MeetingRule } from '@/features/schedules/types'
import { useDateFormat } from '@/lib/date'
import { cn, getTimezoneOffsetString } from '@/shared/utils'
import { isAfter, isBefore, isSameDay, isToday, setHours, startOfDay } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MeetingBooking } from '../../types'
import CalendarEvent from './calendar-event'
import { layoutDayEvents } from './calendar-layout'

interface DayViewProps {
  date: Date
  meetings: MeetingBooking[]
  onMeetingClick?: (meeting: MeetingBooking) => void
  schedules?: MeetingRule[]
  showSchedulesOverlay?: boolean
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function DayView({ date, meetings, onMeetingClick, schedules, showSchedulesOverlay }: DayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [timezone] = useState(getTimezoneOffsetString())
  const now = new Date()
  const isCurrentDay = isToday(date)
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
  const dayName = weekdayNames[date.getDay()]

  const dayMeetings = meetings.filter((meeting) => {
    if (!meeting.startTimeUtc) return false
    return isSameDay(new Date(meeting.startTimeUtc), date)
  })

  const layouted = layoutDayEvents(dayMeetings, date)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT
    }
  }, [])

  const currentTimeTop = isCurrentDay ? ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT : null

  const dayOfWeek = date.getDay()
  const startOfCurrentDay = startOfDay(date)

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
    <div ref={scrollRef} className='flex-1 overflow-y-auto'>
      <div className='flex border-b sticky top-0 bg-background z-10'>
        <div className='shrink-0 relative' style={{ width: TIME_GUTTER_WIDTH }}>
          <div className='absolute bottom-1 right-2'>
            <span className='text-[10px] text-muted-foreground'>{timezone}</span>
          </div>
        </div>
        <div className='flex-1 text-center py-2'>
          <p className='text-xs text-muted-foreground uppercase'>{dayName}</p>
          <div
            className={cn(
              'mx-auto mt-0.5 size-10 flex items-center justify-center rounded-full text-lg font-medium',
              isCurrentDay && 'bg-primary text-primary-foreground'
            )}
          >
            {formatDate(date, 'dayOfMonth')}
          </div>
        </div>
      </div>

      <div className='relative' style={{ height: 24 * HOUR_HEIGHT + 16 }}>
        {HOURS.map((hour) => (
          <div key={hour} className='absolute w-full flex' style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}>
            <div
              className='shrink-0 text-[11px] text-muted-foreground text-right pr-2 -translate-y-2.5 select-none'
              style={{ width: TIME_GUTTER_WIDTH }}
            >
              {hour === 0 ? '' : formatDate(setHours(new Date(), hour), 'hourShort')}
            </div>
            {hour !== 0 && <div className='flex-1 border-t border-border/60' />}
          </div>
        ))}

        <div className='absolute inset-y-0 right-0' style={{ left: TIME_GUTTER_WIDTH }}>
          {showSchedulesOverlay &&
            daySchedules?.map((rule) => {
              if (!rule.startTimeUtc || !rule.endTimeUtc) return null
              const [startHour, startMin] = rule.startTimeUtc.split(':').map(Number)
              const [endHour, endMin] = rule.endTimeUtc.split(':').map(Number)

              const top = (startHour + startMin / 60) * HOUR_HEIGHT
              const height = (endHour + endMin / 60) * HOUR_HEIGHT - top

              let bgClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' // permanent
              let labelText: string = t('schedule.timeline.legend.permanent')

              if (rule.activeFrom && rule.activeTo) {
                bgClass = 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400' // range
                labelText = `${formatDate(rule.activeFrom, 'dateShort2y')} - ${formatDate(rule.activeTo, 'dateShort2y')}`
              } else if (rule.activeFrom) {
                bgClass = 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400' // fromOnly
                labelText = `${t('schedule.timeline.activeFrom')} ${formatDate(rule.activeFrom, 'dateShort2y')}`
              } else if (rule.activeTo) {
                bgClass = 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400' // toOnly
                labelText = `${t('schedule.timeline.activeTo')} ${formatDate(rule.activeTo, 'dateShort2y')}`
              }

              return (
                <div
                  key={rule.id}
                  className={cn(
                    'absolute w-[calc(100%-8px)] left-1 z-0 border border-dashed rounded-md pointer-events-none flex flex-col p-1 overflow-hidden',
                    bgClass
                  )}
                  style={{ top, height }}
                >
                  <span className='text-[10px] font-semibold opacity-90 truncate leading-tight'>
                    {t('meeting.mentorSchedule.available')}
                  </span>
                  <span className='text-[9px] font-medium opacity-70 truncate leading-tight'>{labelText}</span>
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
                  width: `calc(${widthPercent}% - 14px)`,
                  zIndex: 10
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
      </div>
    </div>
  )
}
