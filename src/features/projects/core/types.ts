import type { TaskPriority } from '@/features/projects/tasks/core/types'
import type { TaskLabel } from '@/features/projects/tasks/labels/types'
import type { TaskMember } from '@/features/projects/tasks/members/types'
import type { Milestone } from '@/types/milestone.type'
import type { ProjectPositionTitle } from '../position-titles/types'
import type { ProjectRoleName } from '../roles/types'

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

export interface ProjectDomain {
  id: string
  domainId: string
  name: string
}

export interface ProjectMember {
  userId: string
  fullName: string
  email: string
  avatar: string | null
  role: number
  slug: string
  phoneNumber: string | null
  positionTitles: Array<Pick<ProjectPositionTitle, 'id' | 'name' | 'color'>>
  roles: Array<{
    id: string
    name: ProjectRoleName
    isSystem: boolean
    isDefault: boolean
  }>
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
  members: Array<ProjectMember>
}

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

export interface TaskPreview {
  id: string
  name: string
  milestoneId: string
  slug: string
  position: number
  startDate: string | null
  endDate: string | null
  priority: TaskPriority | null
  parentMilestoneName: string
  parentMilestoneSlug: string
  members: TaskMember[]
  totalSubtasks: number
  hasDescription: boolean
  completedSubtasks: number
  totalComments: number
  totalResources: number
  progressPercentage: number
  taskLabels: TaskLabel[]
  isCompleted: boolean
  estimatedPoints: number | null
  backgroundImage: string | null
}

export interface ParentMilestone {
  id: string
  name: string
  position: number
  slug: string
}

export interface MilestoneWithTasks {
  parentId: string
  milestones: Milestone[]
  tasks: TaskPreview[]
}
