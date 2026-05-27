import type { I18nKey } from '@/lib/i18n/types'
import type { Currency } from '../transactions/types'

export const PackageBookingStatus = {
  Pending: 'Pending',
  Active: 'Active',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  ExpiredUnused: 'ExpiredUnused',
  ExpiredUnfinished: 'ExpiredUnfinished'
} as const

export type PackageBookingStatus = (typeof PackageBookingStatus)[keyof typeof PackageBookingStatus]

export const PackageBookingStatusLabel: Record<PackageBookingStatus, I18nKey> = {
  [PackageBookingStatus.Pending]: 'packageBooking.status.pending',
  [PackageBookingStatus.Active]: 'packageBooking.status.active',
  [PackageBookingStatus.Completed]: 'packageBooking.status.completed',
  [PackageBookingStatus.Cancelled]: 'packageBooking.status.cancelled',
  [PackageBookingStatus.ExpiredUnused]: 'packageBooking.status.expiredUnused',
  [PackageBookingStatus.ExpiredUnfinished]: 'packageBooking.status.expiredUnfinished'
}

export type PackageBookingStatusLabel = (typeof PackageBookingStatusLabel)[PackageBookingStatus]

export const PackageRequestStatus = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Consumed: 'Consumed',
  Cancelled: 'Cancelled'
} as const

export type PackageRequestStatus = (typeof PackageRequestStatus)[keyof typeof PackageRequestStatus]

export const PackageRequestStatusLabel: Record<PackageRequestStatus, I18nKey> = {
  [PackageRequestStatus.Pending]: 'packageBooking.requestStatus.pending',
  [PackageRequestStatus.Approved]: 'packageBooking.requestStatus.approved',
  [PackageRequestStatus.Rejected]: 'packageBooking.requestStatus.rejected',
  [PackageRequestStatus.Consumed]: 'packageBooking.requestStatus.consumed',
  [PackageRequestStatus.Cancelled]: 'packageBooking.requestStatus.cancelled'
}

export type PackageRequestStatusLabel = (typeof PackageRequestStatusLabel)[PackageRequestStatus]

// for mentors
export interface PackageIncomingRequest {
  id: string
  mentorPackageId: string
  mentorPackageName: string
  mentorPackageCoverImageUrl: string | null
  mentorPackageTotalSessions: number
  mentorPackagePrice: number
  mentorPackageCurrency: Currency
  mentorId: string
  requestedByUserId: string
  bookedByProjectId: string | null
  requestedByEmail: string
  requestedByFirstName: string
  requestedByLastName: string
  status: PackageRequestStatus
  consumedByPackageBookingId: string | null
  consumedOnUtc: string | null
  createdOnUtc: string
  modifiedOnUtc: string | null
}

// for students
export interface PackageOutgoingRequest {
  id: string
  mentorPackageId: string
  mentorPackageName: string
  mentorPackageCoverImageUrl: string | null
  mentorPackageTotalSessions: number
  mentorPackagePrice: number
  mentorPackageCurrency: Currency
  mentorId: string
  mentorFirstName: string
  mentorLastName: string
  requestedByUserId: string
  bookedByProjectId: string | null
  projectName: string | null
  requestedByEmail: string
  requestedByFirstName: string
  requestedByLastName: string
  status: PackageRequestStatus
  consumedByPackageBookingId: string | null
  consumedOnUtc: string | null
  createdOnUtc: string
  modifiedOnUtc: string | null
}

export interface PackageIncomingRequestDetail extends PackageIncomingRequest {
  mentorPackageDescription: string | null
  problemStatement: string
  mentorResponseNote: string | null
  reviewedByUserId: string | null
  reviewedOnUtc: string | null
}

export interface PackageOutgoingRequestDetail extends PackageOutgoingRequest {
  mentorPackageDescription: string
  mentorSlug: string
  mentorAvatarUrl: string | null
  problemStatement: string
  mentorResponseNote: string | null
  reviewedByUserId: string | null
  reviewedOnUtc: string | null
}
