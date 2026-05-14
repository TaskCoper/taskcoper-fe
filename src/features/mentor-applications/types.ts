export const ApplicationStatus = {
  PENDING: 'Pending',
  IN_REVIEW: 'InReview',
  IN_OFFERS: 'InOffers',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
} as const

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export const ApplicationStatusLabel = {
  [ApplicationStatus.PENDING]: 'mentorApplication.status.pending',
  [ApplicationStatus.IN_REVIEW]: 'mentorApplication.status.inReview',
  [ApplicationStatus.IN_OFFERS]: 'mentorApplication.status.inOffers',
  [ApplicationStatus.APPROVED]: 'mentorApplication.status.approved',
  [ApplicationStatus.REJECTED]: 'mentorApplication.status.rejected'
} as const

export type ApplicationStatusLabel = (typeof ApplicationStatusLabel)[keyof typeof ApplicationStatusLabel]

export const MentorTitle = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum'
  // DIAMOND: 'Diamond',
  // MASTER: 'Master',
  // GRANDMASTER: 'GrandMaster',
  // LEGENDARY: 'Legendary',
  // MYTHIC: 'Mythic'
} as const

export type MentorTitle = (typeof MentorTitle)[keyof typeof MentorTitle]

export const MentorTitleLabel = {
  [MentorTitle.BRONZE]: 'mentorTitle.bronze',
  [MentorTitle.SILVER]: 'mentorTitle.silver',
  [MentorTitle.GOLD]: 'mentorTitle.gold',
  [MentorTitle.PLATINUM]: 'mentorTitle.platinum'
  // [MentorTitle.DIAMOND]: 'mentorTitle.diamond',
  // [MentorTitle.MASTER]: 'mentorTitle.master',
  // [MentorTitle.GRANDMASTER]: 'mentorTitle.grandMaster',
  // [MentorTitle.LEGENDARY]: 'mentorTitle.legendary',
  // [MentorTitle.MYTHIC]: 'mentorTitle.mythic'
} as const

export type MentorTitleLabel = (typeof MentorTitleLabel)[keyof typeof MentorTitleLabel]

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
