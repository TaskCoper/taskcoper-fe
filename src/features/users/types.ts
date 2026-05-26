import type { Domain } from '@/features/domains/types'

export const Role = {
  User: 'User',
  Mentor: 'Mentor',
  Lecturer: 'Lecturer',
  Admin: 'Admin'
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const RoleLabel: Record<Role, string> = {
  [Role.User]: 'User',
  [Role.Mentor]: 'Mentor',
  [Role.Lecturer]: 'Lecturer',
  [Role.Admin]: 'Admin'
} as const

export type RoleLabel = (typeof RoleLabel)[keyof typeof RoleLabel]

export interface Me {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  avatar: string | null
  organizationId: string | null
  slug: string
  isEmailVerified: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  avatar: string | null
  coverImageUrl: string | null
  role: Role
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
  isGrantGoogleCalendarAccess: boolean
  slug: string
  isEmailVerified: boolean
}

export interface MentionUser {
  id: string
  userId: string
  firstName: string
  lastName: string
  avatar: string | null
}

export interface UserDetail {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  timeZone: string | null
  avatar: string | null
  coverImageUrl: string | null
  role: Role
  address: string | null
  city: string | null
  originalCity: string | null
  state: string | null
  originalState: string | null
  projectCreatedCount: number
  organizationId: string | null
  createdOnUtc: string
  isGrantGoogleCalendarAccess: boolean
  mentor: {
    shortBio: string
    description: string
    rating: number
  } | null
  domains: {
    id: string
    name: string
  }[]
}
