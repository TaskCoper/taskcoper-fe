import { useGetMySchedules } from '@/features/schedules/hooks/use-get-my-schedules'
import CalendarHeader, { type CalendarViewMode } from '@/features/tasks/components/calendar/calendar-header'
import DayView from '@/features/tasks/components/calendar/day-view'
import MiniCalendarSidebar from '@/features/tasks/components/calendar/mini-calendar-sidebar'
import MonthView from '@/features/tasks/components/calendar/month-view'
import WeekView from '@/features/tasks/components/calendar/week-view'
import type { MeetingBooking } from '@/types/meeting.type'
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from 'date-fns'
import { parseAsIsoDateTime, parseAsStringEnum, useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router'

interface CalendarViewContainerProps {
  meetings: MeetingBooking[]
  onMeetingClick: (meeting: MeetingBooking) => void
  onDateRangeChange: (range: { activeFrom: string; activeTo: string }) => void
  sidebarContent?: React.ReactNode
  sidebarHeader?: React.ReactNode
  showSchedulesOverlay?: boolean
  displayConfigButton?: boolean
}

export default function CalendarViewContainer({
  meetings,
  onMeetingClick,
  onDateRangeChange,
  sidebarContent,
  sidebarHeader,
  showSchedulesOverlay: showSchedulesOverlayProp,
  displayConfigButton = false
}: CalendarViewContainerProps) {
  const [currentDate, setCurrentDate] = useQueryState('date', parseAsIsoDateTime.withDefault(new Date()))
  const [viewMode, setViewMode] = useQueryState(
    'view',
    parseAsStringEnum<CalendarViewMode>(['day', 'week', 'month'] as const).withDefault('week')
  )

  const [internalShowSchedulesOverlay] = useState(false)
  const showSchedulesOverlay = showSchedulesOverlayProp ?? internalShowSchedulesOverlay

  const { schedules } = useGetMySchedules({ isActive: true })

  // Compute dynamic date range based on view mode
  const { activeFrom, activeTo } = useMemo(() => {
    if (viewMode === 'day') {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)
      return { activeFrom: dayStart.toISOString(), activeTo: dayEnd.toISOString() }
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
      return { activeFrom: weekStart.toISOString(), activeTo: weekEnd.toISOString() }
    }
    // month — extend to cover full calendar grid (prev/next month days)
    const monthStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    return { activeFrom: monthStart.toISOString(), activeTo: monthEnd.toISOString() }
  }, [currentDate, viewMode])

  useEffect(() => {
    onDateRangeChange({ activeFrom, activeTo })
  }, [activeFrom, activeTo, onDateRangeChange])

  const handlePrev = useCallback(() => {
    if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1))
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate(subMonths(currentDate, 1))
  }, [viewMode, currentDate, setCurrentDate])

  const handleNext = useCallback(() => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1))
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addMonths(currentDate, 1))
  }, [viewMode, currentDate, setCurrentDate])

  const handleToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [setCurrentDate])

  const handleDateSelect = useCallback(
    (date: Date) => {
      setCurrentDate(date)
    },
    [setCurrentDate]
  )

  const headerTitle = (() => {
    if (viewMode === 'day') {
      return format(currentDate, 'MMMM d, yyyy')
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      return format(weekStart, 'MMMM yyyy')
    }
    return format(currentDate, 'MMMM yyyy')
  })()

  return (
    <div className='h-screen flex flex-col'>
      <div className='flex flex-1 min-h-0 w-full max-h-[calc(100vh-3.5rem)]'>
        <div className='flex w-72 shrink-0 flex-col gap-2 border-r overflow-auto'>
          {sidebarHeader}
          <div className='px-4 pt-4'>
            <MiniCalendarSidebar selectedDate={currentDate} onDateSelect={handleDateSelect} />
          </div>

          {sidebarContent}
        </div>

        <div className='flex-1 flex flex-col min-h-0'>
          <CalendarHeader
            title={headerTitle}
            viewMode={viewMode}
            displayConfigButton={displayConfigButton}
            onViewModeChange={setViewMode}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
          />

          {viewMode === 'day' && (
            <DayView
              date={currentDate}
              meetings={meetings}
              onMeetingClick={onMeetingClick}
              schedules={schedules?.value?.items}
              showSchedulesOverlay={showSchedulesOverlay}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              date={currentDate}
              meetings={meetings}
              onMeetingClick={onMeetingClick}
              schedules={schedules?.value?.items}
              showSchedulesOverlay={showSchedulesOverlay}
            />
          )}
          {viewMode === 'month' && <MonthView date={currentDate} meetings={meetings} onMeetingClick={onMeetingClick} />}
        </div>
      </div>

      <Outlet />
    </div>
  )
}
