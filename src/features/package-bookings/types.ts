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
  [PackageBookingStatus.Pending]: 'Pending',
  [PackageBookingStatus.Active]: 'Active',
  [PackageBookingStatus.Completed]: 'Completed',
  [PackageBookingStatus.Cancelled]: 'Cancelled',
  [PackageBookingStatus.ExpiredUnused]: 'Expired Unused',
  [PackageBookingStatus.ExpiredUnfinished]: 'Expired Unfinished'
}

export type PackageBookingStatusLabel = (typeof PackageBookingStatusLabel)[PackageBookingStatus]
