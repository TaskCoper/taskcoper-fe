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

export interface ProjectMemberDetail extends ProjectMember {
  firstName: string
  lastName: string
  joinedOnUtc: string
  domains: ProjectDomain[]
  activeTaskCount: number
  status: MemberStatus
}

export interface InviteMembersPayload {
  projectIdentifier: string
  inviteMembers: {
    email: string
    roleIds: string[]
    inviteExpireDate: string | null
  }[]
}
