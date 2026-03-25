import type { Meeting } from './meeting.type'
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
  coverImageUrl: string | null
}

export interface MentorPackageRule {
  id: string
  no: number
  totalTimeSlots: number
}

export interface MentorPackageDetail extends MentorPackage {
  rules: MentorPackageRule[]
}

export interface PurchasedMentorPackageRule {
  packageSequence: number
  totalTimeSlots: number
}

export interface PurchasedMentorPackage extends MentorPackage {
  packageBookingId: string
  mentorUserId: string
  meetings: Meeting[]
  mentor: {
    email: string
    firstName: string
    lastName: string
    avatarUrl: string | null
  }
  projectId: string | null
  project: {
    name: string
    avatarUrl: string | null
    coverUrl: string | null
  } | null
  rules: PurchasedMentorPackageRule[]
}
