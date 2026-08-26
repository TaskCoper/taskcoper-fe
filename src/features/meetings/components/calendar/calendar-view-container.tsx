import { useGetMySchedules } from '@/features/schedules/hooks/use-get-my-schedules'
import { useDateFormat } from '@/lib/date'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from 'date-fns'
import { parseAsIsoDateTime, parseAsStringEnum, useQueryState } from 'nuqs'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'
import { MeetingStatus, type MeetingBooking } from '../../types'
import { getMeetingStatusTheme } from '../../utils'
import CalendarHeader, { type CalendarViewMode } from './calendar-header'
import DayView from './day-view'
import MiniCalendarSidebar from './mini-calendar-sidebar'
import MonthView from './month-view'
import WeekView from './week-view'

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
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const { schedules } = useGetMySchedules({ isActive: true })
  const statusLegend = [MeetingStatus.BOOKED, MeetingStatus.COMPLETED, MeetingStatus.CANCELLED]

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
    // month - extend to cover full calendar grid (prev/next month days)
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
      return formatDate(currentDate, 'dateLong')
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      return formatDate(weekStart, 'monthYear')
    }
    return formatDate(currentDate, 'monthYear')
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

          <div className='flex min-h-0 flex-1 flex-col'>
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
            {viewMode === 'month' && (
              <MonthView date={currentDate} meetings={meetings} onMeetingClick={onMeetingClick} />
            )}

            <div className='shrink-0 p-3'>
              <div className='flex justify-center items-center gap-6 font-medium text-muted-foreground'>
                {statusLegend.map((status) => {
                  const theme = getMeetingStatusTheme(status)

                  return (
                    <div key={status} className='flex items-center gap-1.5'>
                      <p className={cn('size-2 rounded-full', theme.dot)} />
                      <p className='text-[13px]'>{t(`meeting.status.${status.toLowerCase()}` as I18nKey)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  )
}
