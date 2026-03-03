import type { Domain } from './domain.type'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  avatar: string | null
  role: string
  address: string | null
  city: string | null
  originalCity: string | null
  timeZone: string | null
  state: string | null
  originalState: string | null
  projectCreatedCount: number
  projectJoinCount: number
  organizationId: string | null
  organizationName: string | null
  organizationAvatar: string | null
  domains: Domain[]
  createdOnUtc: string
}

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
}
