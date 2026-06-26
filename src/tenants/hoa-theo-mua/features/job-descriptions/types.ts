export const EmploymentType = {
  fullTime: 'fullTime',
  partTime: 'partTime'
} as const

export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType]

export const EmploymentTypeLabel: Record<EmploymentType, string> = {
  [EmploymentType.fullTime]: 'recruitment.jobs.employmentType.fullTime',
  [EmploymentType.partTime]: 'recruitment.jobs.employmentType.partTime'
}

export type EmploymentTypeLabel = (typeof EmploymentTypeLabel)[EmploymentType]

export const JobDescriptionStatus = {
  open: 'open',
  closed: 'closed'
} as const

export type JobDescriptionStatus = (typeof JobDescriptionStatus)[keyof typeof JobDescriptionStatus]

export const JobDescriptionStatusLabel: Record<JobDescriptionStatus, string> = {
  [JobDescriptionStatus.open]: 'recruitment.jobs.status.open',
  [JobDescriptionStatus.closed]: 'recruitment.jobs.status.closed'
}

export type JobDescriptionStatusLabel = (typeof JobDescriptionStatusLabel)[JobDescriptionStatus]

export interface JobDescription {
  id: string
  slug: string
  title: string
  avatarUrl: string | null
  location: string
  employmentType: EmploymentType
  salaryMin: number
  salaryMax: number
  salaryNegotiable: boolean
  openings: number
  status: JobDescriptionStatus
}

export interface JobDescriptionDetail extends JobDescription {
  coverImageUrl: string | null
  minExperienceYears: number
  maxExperienceYears: number
  description: string
  createdAt: string
  updatedAt: string
}
