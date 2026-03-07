export const ApplicationStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
} as const

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export const ApplicationStatusLabel = {
  [ApplicationStatus.PENDING]: 'application.status.pending',
  [ApplicationStatus.APPROVED]: 'application.status.approved',
  [ApplicationStatus.REJECTED]: 'application.status.rejected'
} as const

export type ApplicationStatusLabel = (typeof ApplicationStatusLabel)[keyof typeof ApplicationStatusLabel]

export interface Application {
  applicationId: string
  userId: string
  shortBio: string
  description: string
  portfolioUrls: string[]
  status: ApplicationStatus
  adminNote: string | null
  createdOnUtc: string
  reviewedAt: string | null
}

export interface SubmitMentorApplicationBody {
  shortBio: string
  description: string
  portfolioUrls: string[]
}
