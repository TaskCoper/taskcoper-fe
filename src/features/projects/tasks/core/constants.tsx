import { cn } from '@/shared/utils'
import { ChevronDownIcon, ChevronsDownIcon, ChevronsUpIcon, ChevronUpIcon, EqualIcon } from 'lucide-react'
import { TaskPriority } from './types'

export const TaskReminder = {
  NONE: 'common.ui.none',
  EXPIRED_DATE: 'task.date.expiredDate',
  FIVE_MINUTES_BEFORE: 'task.date.fiveMinutesBefore',
  TEN_MINUTES_BEFORE: 'task.date.tenMinutesBefore',
  FIFTEEN_MINUTES_BEFORE: 'task.date.fifteenMinutesBefore',
  ONE_HOUR_BEFORE: 'task.date.oneHourBefore',
  TWO_HOURS_BEFORE: 'task.date.twoHoursBefore',
  ONE_DAY_BEFORE: 'task.date.oneDayBefore',
  TWO_DAYS_BEFORE: 'task.date.twoDaysBefore'
} as const

export type TaskReminderType = (typeof TaskReminder)[keyof typeof TaskReminder]

export const reminderToMinutes = (reminderType: keyof typeof TaskReminder): number => {
  const mapping: Record<keyof typeof TaskReminder, number> = {
    NONE: 0,
    EXPIRED_DATE: 0,
    FIVE_MINUTES_BEFORE: 5,
    TEN_MINUTES_BEFORE: 10,
    FIFTEEN_MINUTES_BEFORE: 15,
    ONE_HOUR_BEFORE: 60,
    TWO_HOURS_BEFORE: 120,
    ONE_DAY_BEFORE: 1440, // 24 * 60
    TWO_DAYS_BEFORE: 2880 // 48 * 60
  }

  return mapping[reminderType]
}

export const minutesToReminder = (minutes: number): keyof typeof TaskReminder => {
  const mapping: Record<number, keyof typeof TaskReminder> = {
    0: 'NONE',
    5: 'FIVE_MINUTES_BEFORE',
    10: 'TEN_MINUTES_BEFORE',
    15: 'FIFTEEN_MINUTES_BEFORE',
    60: 'ONE_HOUR_BEFORE',
    120: 'TWO_HOURS_BEFORE',
    1440: 'ONE_DAY_BEFORE',
    2880: 'TWO_DAYS_BEFORE'
  }

  return mapping[minutes] || 'NONE'
}

export const getTaskPriorityIcon = (className?: string): Record<TaskPriority, React.ReactNode> => {
  return {
    [TaskPriority.LOWEST]: <ChevronsDownIcon className={cn('size-4 text-blue-500', className)} />,
    [TaskPriority.LOW]: <ChevronDownIcon className={cn('size-4 text-blue-500', className)} />,
    [TaskPriority.MEDIUM]: <EqualIcon className={cn('size-4 text-orange-500', className)} />,
    [TaskPriority.HIGH]: <ChevronUpIcon className={cn('size-4 text-rose-500', className)} />,
    [TaskPriority.HIGHEST]: <ChevronsUpIcon className={cn('size-4 text-rose-500', className)} />
  }
}

// Calendar Layout Constants
export const CALENDAR_HOUR_HEIGHT = 74
export const CALENDAR_TIME_GUTTER_WIDTH = 64
export const CALENDAR_EVENT_MIN_HEIGHT = 50
