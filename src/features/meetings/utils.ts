import type { ScheduleSlot } from '@/features/schedules/types'
import { primaryControlShadowClasses, primaryOverlayAfterClasses, primaryOverlayBeforeClasses } from '@/shared/effects'
import { addDays } from 'date-fns'
import { MeetingStatus } from './types'

export interface DaySchedule {
  date: Date
  slots: ScheduleSlot[]
}

export const formatTime = (time: string) => {
  return time.slice(0, 5)
}

export const formatTimeRange = (slot: ScheduleSlot) => {
  return `${formatTime(slot.startTimeUtc)} - ${formatTime(slot.endTimeUtc)}`
}

export const parseMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export const toTimeString = (minutes: number) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}:00`
}

export const splitIntoHourSlots = (slot: ScheduleSlot): ScheduleSlot[] => {
  const startMin = parseMinutes(slot.startTimeUtc)
  const endMin = parseMinutes(slot.endTimeUtc)
  const hourSlots: ScheduleSlot[] = []

  for (let t = startMin; t + 60 <= endMin; t += 60) {
    hourSlots.push({
      dayOfWeek: slot.dayOfWeek,
      startTimeUtc: toTimeString(t),
      endTimeUtc: toTimeString(t + 60)
    })
  }

  return hourSlots
}

export const groupSlotsByDay = (slots: ScheduleSlot[], weekStart: Date): DaySchedule[] => {
  const days: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
    date: addDays(weekStart, i),
    slots: [] as ScheduleSlot[]
  }))

  for (const slot of slots) {
    const gridIndex = slot.dayOfWeek === 0 ? 6 : slot.dayOfWeek - 1
    days[gridIndex]?.slots.push(...splitIntoHourSlots(slot))
  }

  for (const day of days) {
    day.slots.sort((a, b) => a.startTimeUtc.localeCompare(b.startTimeUtc))
  }

  return days
}

export const combineDateTimeToUtc = (date: Date, time: string) => {
  const [hours, minutes, seconds] = time.split(':').map(Number)
  const combinedDate = new Date(date)
  combinedDate.setHours(hours, minutes, seconds || 0, 0)
  return combinedDate.toISOString()
}

const getMeetingStatusBadgeClasses = (colorClasses: string) =>
  [
    'group relative isolate overflow-hidden border-transparent text-white ring-0 transition duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] hover:before:opacity-100',
    primaryControlShadowClasses,
    primaryOverlayBeforeClasses,
    'before:opacity-50',
    primaryOverlayAfterClasses,
    colorClasses
  ].join(' ')

export const getMeetingStatusTheme = (status?: string) => {
  switch (status) {
    case MeetingStatus.COMPLETED:
      return {
        dot: 'bg-emerald-500',
        leftBorder: 'border-l-emerald-500',
        block: 'border-emerald-400 bg-emerald-600 hover:bg-emerald-700 text-white',
        avatar: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        badge: getMeetingStatusBadgeClasses('bg-emerald-600')
      }
    // case MeetingStatus.RESCHEDULE:
    //   return {
    //     dot: 'bg-amber-500',
    //     leftBorder: 'border-l-amber-500',
    //     block: 'border-amber-400 bg-amber-600 hover:bg-amber-700 text-white',
    //     avatar: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    //     badge: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-500/20 dark:text-amber-400'
    //   }
    case MeetingStatus.CANCELLED:
      // case MeetingStatus.SUSPENDED:
      return {
        dot: 'bg-rose-500',
        leftBorder: 'border-l-rose-500',
        block: 'border-rose-400 bg-rose-600 hover:bg-rose-700 text-white',
        avatar: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
        badge: getMeetingStatusBadgeClasses('bg-rose-600')
      }
    // case MeetingStatus.FREE:
    //   return {
    //     dot: 'bg-slate-400',
    //     leftBorder: 'border-l-slate-400',
    //     block: 'border-slate-400 bg-slate-600 hover:bg-slate-700 text-white',
    //     avatar: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
    //     badge: 'bg-slate-500/10 text-slate-700 border-slate-200 dark:border-slate-500/20 dark:text-slate-400'
    //   }
    case MeetingStatus.BOOKED:
    default:
      return {
        dot: 'bg-blue-500',
        leftBorder: 'border-l-blue-500',
        block: 'border-blue-400 bg-blue-600 hover:bg-blue-700 text-white',
        avatar: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        badge: getMeetingStatusBadgeClasses('bg-blue-600')
      }
  }
}

export const getStatusCheckboxClassName = (status: MeetingStatus) => {
  switch (status) {
    case MeetingStatus.COMPLETED:
      return 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 data-[state=checked]:text-white border-emerald-600'
    case MeetingStatus.CANCELLED:
      return 'data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 data-[state=checked]:text-white border-rose-600'
    case MeetingStatus.BOOKED:
    default:
      return 'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white border-blue-600'
  }
}
