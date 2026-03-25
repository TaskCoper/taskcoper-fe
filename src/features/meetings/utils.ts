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
