import { MeetingStatus } from '@/types/meeting.type'
import type { ScheduleSlot } from '@/types/schedule.type'
import { addDays } from 'date-fns'

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

export const getMeetingStatusTheme = (status?: string) => {
  switch (status) {
    case MeetingStatus.COMPLETED:
      return {
        dot: 'bg-emerald-500',
        block: 'border-emerald-500 bg-emerald-600 hover:bg-emerald-700 text-white',
        avatar: 'bg-emerald-600 text-white',
        badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:border-emerald-500/20 dark:text-emerald-400'
      }
    case MeetingStatus.RESCHEDULE:
      return {
        dot: 'bg-amber-500',
        block: 'border-amber-500 bg-amber-600 hover:bg-amber-700 text-white',
        avatar: 'bg-amber-600 text-white',
        badge: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-500/20 dark:text-amber-400'
      }
    case MeetingStatus.CANCELLED:
    case MeetingStatus.SUSPENDED:
      return {
        dot: 'bg-rose-500',
        block: 'border-rose-500 bg-rose-600 hover:bg-rose-700 text-white',
        avatar: 'bg-rose-600 text-white',
        badge: 'bg-rose-500/10 text-rose-700 border-rose-200 dark:border-rose-500/20 dark:text-rose-400'
      }
    case MeetingStatus.FREE:
      return {
        dot: 'bg-slate-400',
        block: 'border-slate-400 bg-slate-600 hover:bg-slate-700 text-white',
        avatar: 'bg-slate-600 text-white',
        badge: 'bg-slate-500/10 text-slate-700 border-slate-200 dark:border-slate-500/20 dark:text-slate-400'
      }
    case MeetingStatus.BOOKED:
    default:
      return {
        dot: 'bg-blue-500',
        block: 'border-blue-500 bg-blue-600 hover:bg-blue-700 text-white',
        avatar: 'bg-blue-600 text-white',
        badge: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-500/20 dark:text-blue-400'
      }
  }
}
