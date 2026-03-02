import CalendarEvent from '@/features/tasks/components/calendar/calendar-event'
import { layoutDayEvents } from '@/features/tasks/components/calendar/calendar-layout'
import { cn } from '@/shared/utils'
import type { TaskPreview } from '@/types/task.type'
import { format, isSameDay, isToday, setHours } from 'date-fns'
import { useEffect, useRef } from 'react'

interface DayViewProps {
  date: Date
  tasks: TaskPreview[]
  onTaskClick?: (task: TaskPreview) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 60
const TIME_GUTTER_WIDTH = 64

export default function DayView({ date, tasks, onTaskClick }: DayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const isCurrentDay = isToday(date)

  const dayTasks = tasks.filter((task) => {
    if (!task.startDate) return false
    return isSameDay(new Date(task.startDate), date)
  })

  const layouted = layoutDayEvents(dayTasks, date)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT
    }
  }, [])

  const currentTimeTop = isCurrentDay ? ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT : null

  return (
    <div ref={scrollRef} className='flex-1 overflow-y-auto'>
      <div className='flex border-b sticky top-0 bg-background z-10'>
        <div className='shrink-0' style={{ width: TIME_GUTTER_WIDTH }} />
        <div className='flex-1 text-center py-2'>
          <p className='text-xs text-muted-foreground uppercase'>{format(date, 'EEE')}</p>
          <div
            className={cn(
              'mx-auto mt-0.5 size-10 flex items-center justify-center rounded-full text-lg font-medium',
              isCurrentDay && 'bg-primary text-primary-foreground'
            )}
          >
            {format(date, 'd')}
          </div>
        </div>
      </div>

      <div className='relative' style={{ height: 24 * HOUR_HEIGHT + 40 }}>
        {HOURS.map((hour) => (
          <div key={hour} className='absolute w-full flex' style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}>
            <div
              className='shrink-0 text-[11px] text-muted-foreground text-right pr-2 -translate-y-2.5 select-none'
              style={{ width: TIME_GUTTER_WIDTH }}
            >
              {hour === 0 ? '' : format(setHours(new Date(), hour), 'h a')}
            </div>
            {hour !== 0 && <div className='flex-1 border-t border-border/60' />}
          </div>
        ))}

        <div className='absolute inset-y-0 right-0' style={{ left: TIME_GUTTER_WIDTH }}>
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
                  width: `calc(${widthPercent}% - 6px)`
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
      </div>
    </div>
  )
}
