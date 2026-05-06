export const FeedbackTargetType = {
  MentorPackageBooking: 'MentorPackageBooking'
} as const

export type FeedbackTargetType = (typeof FeedbackTargetType)[keyof typeof FeedbackTargetType]

export interface Feedback {
  id: string
  targetType: FeedbackTargetType
  targetId: string
  rating: number
  comment: string
  createdOnUtc: string
  modifiedOnUtc: string
  author: {
    userId: string
    firstName: string
    lastName: string
    avatarUrl: string | null
  }
  metaData: string
}
