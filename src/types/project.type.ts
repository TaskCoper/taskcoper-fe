import type { ProjectRole, SectionPermission } from './project-permission.type'
import type { TaskPriority } from './task.type'

export interface ProjectPreview {
  id: string
  name: string
  startDate: string
  endDate: string
  coverImage: string | null
  logoImage: string | null
  teamSize: string | null
  schoolSubject: string | null
  slug: string
}

export interface ProjectMember {
  userId: string
  fullName: string
  email: string
  avatar: string | null
  role: number
  isMain: boolean
  isEditor: boolean
}

export interface Project {
  id: string
  name: string
  description: string | null
  slug: string
  startDate: string | null
  endDate: string | null
  coverImage: string | null
  logoImage: string | null
  teamSize: string | null
  teamContact: string | null
  teamEmail: string | null
  progress: number
  schoolSubject: string | null
  organizationId: string | null
  organizationName: string | null
  organizationLogo: string | null
  domains: ProjectDomain[]
}

export interface SystemProject {
  projectId: string
  projectName: string
  description: string | null
  projectStartDate: string | null
  projectEndDate: string | null
  coverImage: string | null
  projectTeamSize: string | null
  projectSchoolSubject: string | null
  organizationId: string
  organizationName: string
  organizationAvatar: string | null
  members: SystemProjectMember[]
  domains: ProjectDomain[]
  createBy: SystemProjectCreateBy
}

export interface SystemProjectMember {
  userId: string
  fullName: string
  email: string
  avatar: string | null
  role: number
  isMain: boolean
  isEditor: boolean
}

export interface SystemProjectDomain {
  id: string
  domainId: string
  name: string
}

export interface SystemProjectCreateBy {
  userId: string
  fullName: string
  email: string
  avatar: string | null
  role: number
  isMain: boolean
  isEditor: boolean
}

export interface ProjectDomain {
  id: string
  domainId: string
  name: string
}

export interface ProjectResource {
  id: string
  name: string
  url: string
  isUpload: boolean
  thumbnailUrl: string | null
  mimeType: string
  bytes: number
  task: {
    id: string
    name: string
    isCompleted: boolean
    startDate: string
    endDate: string
    milestoneId: string
    milestoneName: string
    parentMilestoneId: string
    parentMilestoneName: string
    projectId: string
  } | null
  uploadBy: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  createdOnUtc: string
  modifiedOnUtc: string | null
}

export interface ProjectMemberStats {
  userId: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  totalTasks: number
}

export interface ProjectResourceStats {
  totalResources: number
  totalBytes: number
}

export interface ProjectMimeTypeStats {
  mimeType: string
  totalResources: number
}

export interface ProjectResourceMemberStats {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  totalResources: number
}

export interface ProjectPriorityStats {
  priority: TaskPriority | null
  totalTasks: number
}

export const RevenueType = {
  CashIn: 'CashIn',
  CashOut: 'CashOut'
} as const

export type RevenueType = (typeof RevenueType)[keyof typeof RevenueType]

export const RevenueTypeLabel = {
  [RevenueType.CashIn]: 'project.addProjectRevenue.type.cashIn',
  [RevenueType.CashOut]: 'project.addProjectRevenue.type.cashOut'
}

export type RevenueTypeLabel = (typeof RevenueTypeLabel)[keyof typeof RevenueTypeLabel]

export interface Revenue {
  id: string
  name: string
  amount: number
  balanceAfter: number
  type: RevenueType
  note: string
  createdOnUtc: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  labels: {
    id: string
    name: string
    color: string
  }[]
}

export interface RevenueLabelStats {
  id: string
  name: string
  color: string
  transactionCount: number
}

export interface RevenueTypeStats {
  name: RevenueType
  transactionCount: number
}

export interface RevenueStats {
  totalRevenue: number
  totalExpense: number
  netRevenue: number
}

export interface ProjectPermission {
  projectId: string
  effectiveRoleNames: string[]
  roles: ProjectRole[]
  sections: SectionPermission[]
}

// APIs
export interface InviteMembersPayload {
  projectIdentifier: string
  inviteMembers: {
    email: string
    isEditor: boolean
    inviteExpireDate: string | null
  }[]
}
