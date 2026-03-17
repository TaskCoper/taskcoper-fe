export interface MentorPackage {
  id: string
  mentorId: string
  name: string
  description: string
  durationInMinutes: number
  totalSessions: number
  price: number
  currency: 'Vnd' | 'Usd'
  isActive: boolean
  sortOrder: number
  createdOnUtc: string
  modifiedOnUtc: string | null
}
