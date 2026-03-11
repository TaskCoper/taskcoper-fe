import CalendarEvent from '@/features/tasks/components/calendar/calendar-event'
import { layoutDayEvents } from '@/features/tasks/components/calendar/calendar-layout'
import { cn } from '@/shared/utils'
import type { TaskPreview } from '@/types/task.type'
import { addDays, format, isSameDay, isToday, setHours, startOfWeek } from 'date-fns'
import { useEffect, useRef } from 'react'

interface WeekViewProps {
  date: Date
  tasks: TaskPreview[]
  onTaskClick?: (task: TaskPreview) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 60
const TIME_GUTTER_WIDTH = 64

function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export default function WeekView({ date, tasks, onTaskClick }: WeekViewProps) {
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

      <div className='flex relative' style={{ height: 24 * HOUR_HEIGHT }}>
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
          const dayTasks = tasks.filter((task) => {
            if (!task.startDate) return false
            return isSameDay(new Date(task.startDate), day)
          })

          const layouted = layoutDayEvents(dayTasks, day)
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
                    key={ev.task.id}
                    task={ev.task}
                    onClick={onTaskClick}
                    style={{
                      top: ev.top,
                      height: ev.height,
                      left: `calc(${leftPercent}% + 2px)`,
                      width: `calc(${widthPercent}% - 4px)`
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
