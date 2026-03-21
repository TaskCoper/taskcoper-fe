import type { Currency } from './transaction.type'

export interface MentorPackage {
  id: string
  mentorId: string
  name: string
  description: string
  durationInMinutes: number
  totalSessions: number
  price: number
  currency: Currency
  isActive: boolean
  sortOrder: number
  createdOnUtc: string
  modifiedOnUtc: string | null
}

export interface MentorPackageRule {
  id: string
  no: number
  totalTimeSlots: number
}

export interface MentorPackageDetail extends MentorPackage {
  rules: MentorPackageRule[]
}
