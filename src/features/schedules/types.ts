export interface MeetingRule {
  id: string
  userId: string
  userName: string
  userEmail: string
  dayOfWeek: number
  startTimeUtc: string
  endTimeUtc: string
  isActive: boolean
  activeFrom: string | null
  activeTo: string | null
  createdOnUtc: string
  modifiedOnUtc: string | null
}

export interface ScheduleSlot {
  dayOfWeek: number
  startTimeUtc: string
  endTimeUtc: string
}
