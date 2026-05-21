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

export const PackageBookingStatusLabel: Record<PackageBookingStatus, string> = {
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
  Consumed: 'Consumed'
} as const

export type PackageRequestStatus = (typeof PackageRequestStatus)[keyof typeof PackageRequestStatus]

export const PackageRequestStatusLabel: Record<PackageRequestStatus, string> = {
  [PackageRequestStatus.Pending]: 'packageBooking.requestStatus.pending',
  [PackageRequestStatus.Approved]: 'packageBooking.requestStatus.approved',
  [PackageRequestStatus.Rejected]: 'packageBooking.requestStatus.rejected',
  [PackageRequestStatus.Consumed]: 'packageBooking.requestStatus.consumed'
}

export type PackageRequestStatusLabel = (typeof PackageRequestStatusLabel)[PackageRequestStatus]

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

export interface PackageRequestDetail extends PackageIncomingRequest {
  mentorPackageDescription: string | null
  problemStatement: string
  mentorResponseNote: string | null
  reviewedByUserId: string | null
  reviewedOnUtc: string | null
}
