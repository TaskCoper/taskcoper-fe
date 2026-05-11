import type { Meeting } from '../meetings/types'
import type { PackageBookingStatus } from '../package-bookings/types'
import type { Currency } from '../transactions/types'

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
  position: number
  createdOnUtc: string
  modifiedOnUtc: string | null
  coverImageUrl: string | null
  isNeedFeedback: boolean
  isFeedbackSubmitted: boolean
  isPin: boolean
  pinOnUtc: string | null
  activationDeadlineDays: number
  usageDeadlineDays: number
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
  projectOwnerId: string
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

export interface MentorPackageStatistics {
  mentorPackageId: string
  packageName: string
  currency: Currency
  startTime: string | null
  endTime: string | null
  summary: {
    totalPaidBookings: number
    bookingsWithoutVoucher: number
    bookingsWithVoucher: number
    grossRevenueAtListPrice: number
    netRevenueAfterVoucher: number
    mentorPayoutAfterCommission: number
    totalPlatformCommission: number
  }
  monthlyBreakdown: Array<{
    year: number
    month: number
    totalPaidBookings: number
    bookingsWithoutVoucher: number
    bookingsWithVoucher: number
    grossRevenueAtListPrice: number
    netRevenueAfterVoucher: number
    mentorPayoutAfterCommission: number
    totalPlatformCommission: number
  }>
}

export interface MentorPackagesStatistics {
  mentorId: string
  startTime: string | null
  endTime: string | null
  summary: {
    totalPaidBookings: number
    bookingsWithoutVoucher: number
    bookingsWithVoucher: number
    grossRevenueAtListPrice: number
    netRevenueAfterVoucher: number
    mentorPayoutAfterCommission: number
    totalPlatformCommission: number
  }
  monthlyBreakdown: Array<{
    year: number
    month: number
    totalPaidBookings: number
    bookingsWithoutVoucher: number
    bookingsWithVoucher: number
    grossRevenueAtListPrice: number
    netRevenueAfterVoucher: number
    mentorPayoutAfterCommission: number
    totalPlatformCommission: number
  }>
  packageBreakdown: Array<{
    mentorPackageId: string
    packageName: string
    currency: Currency
    totalPaidBookings: number
    bookingsWithoutVoucher: number
    bookingsWithVoucher: number
    grossRevenueAtListPrice: number
    netRevenueAfterVoucher: number
    mentorPayoutAfterCommission: number
    totalPlatformCommission: number
  }>
}

export interface MentorPackagePinStatistic {
  isPin: boolean
  count: number
}

export interface MentorPackageBooking {
  packageBookingId: string
  mentorPackageId: string
  packageName: string
  packageCoverImageUrl: string | null
  packageDescription: string
  status: PackageBookingStatus
  priceAtBooking: number
  currencyAtBooking: Currency
  totalSessions: number
  completedSessions: number
  activationDeadlineUtc: string | null
  activatedOnUtc: string | null
  usageDeadlineUtc: string | null
  bookedByUser: {
    userId: string
    email: string
    firstName: string
    lastName: string
    slug: string
    avatarUrl: string | null
  }
  bookedByProjectId: null
  bookedByProject: {
    name: string
    avatarUrl: string | null
    coverUrl: string | null
    slug: string
  } | null
  isFeedbackFromUserSubmitted: boolean
  createdOnUtc: string
  modifiedOnUtc: string
  rules: Array<{
    packageSequence: number
    totalTimeSlots: number
  }>
  meetings: Array<Meeting>
}
