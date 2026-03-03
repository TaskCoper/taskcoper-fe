import { Button } from '@/components/ui/button'
import CreateScheduleDialog from '@/features/schedules/components/create-schedule-dialog'
import CalendarHeader, { type CalendarViewMode } from '@/features/tasks/components/calendar/calendar-header'
import DayView from '@/features/tasks/components/calendar/day-view'
import MiniCalendarSidebar from '@/features/tasks/components/calendar/mini-calendar-sidebar'
import MonthView from '@/features/tasks/components/calendar/month-view'
import WeekView from '@/features/tasks/components/calendar/week-view'
import { useAuthStore } from '@/lib/zustand/auth.store'
import type { TaskPreview } from '@/types/task.type'
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  setHours,
  setMinutes,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from 'date-fns'
import { CalendarPlusIcon } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router'

function generateSampleTasks(): TaskPreview[] {
  const today = new Date()
  const makeDate = (dayOffset: number, hour: number, minute = 0) =>
    setMinutes(setHours(addDays(today, dayOffset), hour), minute).toISOString()

  return [
    {
      id: 'sample-1',
      name: 'Team standup meeting',
      milestoneId: 'ms-1',
      position: 1,
      startDate: makeDate(-2, 4, 0),
      endDate: makeDate(0, 9, 30),
      priority: 'MEDIUM',
      members: [],
      totalSubtasks: 0,
      completedSubtasks: 0,
      totalComments: 0,
      totalResources: 0,
      progressPercentage: 0,
      taskLabels: [],
      isCompleted: false,
      estimatedPoints: 1,
      backgroundImage: null
    },
    {
      id: 'sample-2',
      name: 'Design review — landing page',
      milestoneId: 'ms-1',
      position: 2,
      startDate: makeDate(1, 9, 0),
      endDate: makeDate(1, 10, 30),
      priority: 'HIGH',
      members: [],
      totalSubtasks: 3,
      completedSubtasks: 1,
      totalComments: 2,
      totalResources: 0,
      progressPercentage: 33,
      taskLabels: [],
      isCompleted: false,
      estimatedPoints: 3,
      backgroundImage: null
    },
    {
      id: 'sample-3',
      name: 'Write API documentation',
      milestoneId: 'ms-2',
      position: 3,
      startDate: makeDate(-1, 13, 30),
      endDate: makeDate(-1, 15, 30),
      priority: 'LOW',
      members: [],
      totalSubtasks: 5,
      completedSubtasks: 2,
      totalComments: 0,
      totalResources: 1,
      progressPercentage: 40,
      taskLabels: [],
      isCompleted: false,
      estimatedPoints: 5,
      backgroundImage: null
    },
    {
      id: 'sample-4',
      name: 'Sprint planning',
      milestoneId: 'ms-1',
      position: 4,
      startDate: makeDate(0, 10, 45),
      endDate: makeDate(0, 12, 55),
      priority: 'HIGHEST',
      members: [],
      totalSubtasks: 0,
      completedSubtasks: 0,
      totalComments: 5,
      totalResources: 0,
      progressPercentage: 0,
      taskLabels: [],
      isCompleted: true,
      estimatedPoints: 2,
      backgroundImage: null
    },
    {
      id: 'sample-5',
      name: 'Fix login bug #342',
      milestoneId: 'ms-2',
      position: 5,
      startDate: makeDate(2, 8, 0),
      endDate: makeDate(2, 10, 0),
      priority: 'HIGHEST',
      members: [],
      totalSubtasks: 2,
      completedSubtasks: 0,
      totalComments: 3,
      totalResources: 0,
      progressPercentage: 0,
      taskLabels: [],
      isCompleted: false,
      estimatedPoints: 3,
      backgroundImage: null
    },
    {
      id: 'sample-6',
      name: 'Deploy staging build',
      milestoneId: 'ms-1',
      position: 6,
      startDate: makeDate(3, 16, 0),
      endDate: makeDate(3, 17, 0),
      priority: 'MEDIUM',
      members: [],
      totalSubtasks: 0,
      completedSubtasks: 0,
      totalComments: 0,
      totalResources: 0,
      progressPercentage: 0,
      taskLabels: [],
      isCompleted: false,
      estimatedPoints: 1,
      backgroundImage: null
    },
    {
      id: 'sample-7',
      name: 'Weekly retrospective',
      milestoneId: 'ms-1',
      position: 7,
      startDate: makeDate(4, 15, 0),
      endDate: makeDate(4, 16, 0),
      priority: null,
      members: [],
      totalSubtasks: 0,
      completedSubtasks: 0,
      totalComments: 1,
      totalResources: 0,
      progressPercentage: 0,
      taskLabels: [],
      isCompleted: false,
      estimatedPoints: null,
      backgroundImage: null
    },
    {
      id: 'sample-8',
      name: 'Database migration prep',
      milestoneId: 'ms-2',
      position: 8,
      startDate: makeDate(1, 11, 0),
      endDate: makeDate(1, 12, 30),
      priority: 'HIGH',
      members: [],
      totalSubtasks: 4,
      completedSubtasks: 4,
      totalComments: 0,
      totalResources: 2,
      progressPercentage: 100,
      taskLabels: [],
      isCompleted: true,
      estimatedPoints: 5,
      backgroundImage: null
    }
  ]
}

export default function CalendarPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useQueryState(
    'view',
    parseAsStringEnum<CalendarViewMode>(['day', 'week', 'month']).withDefault('week')
  )

  const sampleTasks = useMemo(() => generateSampleTasks(), [])

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

  const handleTaskClick = useCallback(
    (task: TaskPreview) => {
      navigate(`${location.pathname}/${task.milestoneId}/tasks/${task.id}${location.search}`)
    },
    [navigate, location.pathname, location.search]
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

          {user?.Role === 'Mentor' ? (
            <CreateScheduleDialog>
              <Button variant='outline' size='sm'>
                <CalendarPlusIcon />
                {t('schedule.button.create')}
              </Button>
            </CreateScheduleDialog>
          ) : null}
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

          {viewMode === 'day' && <DayView date={currentDate} tasks={sampleTasks} onTaskClick={handleTaskClick} />}
          {viewMode === 'week' && <WeekView date={currentDate} tasks={sampleTasks} onTaskClick={handleTaskClick} />}
          {viewMode === 'month' && <MonthView date={currentDate} tasks={sampleTasks} onTaskClick={handleTaskClick} />}
        </div>
      </div>

      <Outlet />
    </div>
  )
}
