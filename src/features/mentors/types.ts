export interface Mentor {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  email: string
  shortBio: string
  rating: number
  createdOnUtc: string
  domains: { id: string; name: string }[]
  slug: string
}
