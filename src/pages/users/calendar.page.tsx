import { Button } from '@/components/ui/button'
import { useGetMyMeetings } from '@/features/meetings/hooks/use-get-my-meetings'
import CalendarHeader, { type CalendarViewMode } from '@/features/tasks/components/calendar/calendar-header'
import DayView from '@/features/tasks/components/calendar/day-view'
import MiniCalendarSidebar from '@/features/tasks/components/calendar/mini-calendar-sidebar'
import MonthView from '@/features/tasks/components/calendar/month-view'
import WeekView from '@/features/tasks/components/calendar/week-view'
import { useAuthStore } from '@/lib/zustand/auth.store'
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
import { CalendarIcon } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useNavigate } from 'react-router'

export default function CalendarPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useQueryState(
    'view',
    parseAsStringEnum<CalendarViewMode>(['day', 'week', 'month']).withDefault('week')
  )

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

  const { myMeetings } = useGetMyMeetings({ activeFrom, activeTo })

  const handlePrev = useCallback(() => {
    setCurrentDate((d) => {
      if (viewMode === 'day') return subDays(d, 1)
      if (viewMode === 'week') return subWeeks(d, 1)
      return subMonths(d, 1)
    })
  }, [viewMode])

  const handleNext = useCallback(() => {
    setCurrentDate((d) => {
      if (viewMode === 'day') return addDays(d, 1)
      if (viewMode === 'week') return addWeeks(d, 1)
      return addMonths(d, 1)
    })
  }, [viewMode])

  const handleToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  const handleMeetingClick = useCallback(
    (meeting: MeetingBooking) => {
      navigate(`/users/purchased-packages/${meeting.id}`)
    },
    [navigate]
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
        <div className='flex flex-col gap-2 border-r p-4'>
          <MiniCalendarSidebar selectedDate={currentDate} onDateSelect={handleDateSelect} />

          <div className='flex-1' />

          {user?.Role === 'Mentor' && (
            <Link to='schedules'>
              <Button size='sm' className='w-full'>
                <CalendarIcon />
                {t('schedule.button.viewSchedules')}
              </Button>
            </Link>
          )}
        </div>

        <div className='flex-1 flex flex-col min-h-0'>
          <CalendarHeader
            title={headerTitle}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
          />

          {viewMode === 'day' && (
            <DayView date={currentDate} meetings={myMeetings} onMeetingClick={handleMeetingClick} />
          )}
          {viewMode === 'week' && (
            <WeekView date={currentDate} meetings={myMeetings} onMeetingClick={handleMeetingClick} />
          )}
          {viewMode === 'month' && (
            <MonthView date={currentDate} meetings={myMeetings} onMeetingClick={handleMeetingClick} />
          )}
        </div>
      </div>

      <Outlet />
    </div>
  )
}
