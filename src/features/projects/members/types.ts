import type { Role } from '@/features/users/types'
import type { ProjectDomain, ProjectMember } from '../core/types'

export const MemberStatus = {
  Free: 'Free',
  Busy: 'Busy'
} as const

export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus]

export const MemberStatusLabel: Record<MemberStatus, string> = {
  [MemberStatus.Free]: 'project.memberStatus.free',
  [MemberStatus.Busy]: 'project.memberStatus.busy'
}

export type MemberStatusLabel = (typeof MemberStatusLabel)[keyof typeof MemberStatusLabel]

export const ProjectMemberRequestStatus = {
  Request: 'Request',
  Approved: 'Approved',
  Rejected: 'Rejected'
} as const

export type ProjectMemberRequestStatus = (typeof ProjectMemberRequestStatus)[keyof typeof ProjectMemberRequestStatus]

export const ProjectMemberRequestStatusLabel: Record<ProjectMemberRequestStatus, string> = {
  [ProjectMemberRequestStatus.Request]: 'project.memberRequestStatus.request',
  [ProjectMemberRequestStatus.Approved]: 'project.memberRequestStatus.approved',
  [ProjectMemberRequestStatus.Rejected]: 'project.memberRequestStatus.rejected'
}

export type ProjectMemberRequestStatusLabel =
  (typeof ProjectMemberRequestStatusLabel)[keyof typeof ProjectMemberRequestStatusLabel]

export interface ProjectMemberDetail extends ProjectMember {
  firstName: string
  lastName: string
  joinedOnUtc: string
  domains: ProjectDomain[]
  activeTaskCount: number
  status: MemberStatus
}

export interface ProjectMemberRequest {
  projectManagementId: string
  userId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  slug: string
  avatar: string | null
  isInviteUser: boolean
  status: ProjectMemberRequestStatus
  invitedSendDate: string | null
  inviteExpireDate: string | null
  createdOnUtc: string
  roles: Array<{
    id: string
    name: Role
    isSystem: boolean
    isDefault: boolean
  }>
}

export interface InviteMembersPayload {
  projectIdentifier: string
  inviteMembers: {
    email: string
    roleIds: string[]
    inviteExpireDate: string | null
  }[]
}
