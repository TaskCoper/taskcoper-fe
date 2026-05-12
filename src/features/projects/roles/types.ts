import type {
  CalendarSectionExtensionsFormValues,
  StorageSectionExtensionsFormValues,
  TaskSectionExtensionsFormValues
} from './validations'

export const SectionKey = {
  OVERVIEW: 'OVERVIEW',
  TASKS: 'TASKS',
  PERFORMANCE: 'PERFORMANCE',
  CALENDAR: 'CALENDAR',
  CHAT: 'CHAT',
  NOTE: 'NOTE',
  STORAGE: 'STORAGE',
  REVENUE: 'REVENUE',
  SETTINGS: 'SETTINGS'
} as const

export type SectionKey = (typeof SectionKey)[keyof typeof SectionKey]

export const SectionKeyLabel: Record<SectionKey, string> = {
  [SectionKey.OVERVIEW]: 'project.sidebar.aboutProject',
  [SectionKey.TASKS]: 'project.sidebar.tasks',
  [SectionKey.PERFORMANCE]: 'project.sidebar.performance',
  [SectionKey.CALENDAR]: 'project.sidebar.calendar',
  [SectionKey.CHAT]: 'project.sidebar.chat',
  [SectionKey.NOTE]: 'project.sidebar.note',
  [SectionKey.STORAGE]: 'project.sidebar.storage',
  [SectionKey.REVENUE]: 'project.sidebar.revenue',
  [SectionKey.SETTINGS]: 'project.sidebar.settings'
} as const

export type SectionKeyLabel = (typeof SectionKeyLabel)[keyof typeof SectionKeyLabel]

export const ActionKey = {
  canRead: 'canRead',
  canWrite: 'canWrite',
  canUpdate: 'canUpdate',
  canDelete: 'canDelete'
} as const

export type ActionKey = (typeof ActionKey)[keyof typeof ActionKey]

export const ActionKeyLabel: Record<ActionKey, string> = {
  [ActionKey.canRead]: 'project.permissions.action.canRead',
  [ActionKey.canWrite]: 'project.permissions.action.canWrite',
  [ActionKey.canUpdate]: 'project.permissions.action.canUpdate',
  [ActionKey.canDelete]: 'project.permissions.action.canDelete'
} as const

export type ActionKeyLabel = (typeof ActionKeyLabel)[keyof typeof ActionKeyLabel]

export const ProjectRoleName = {
  Owner: 'Owner',
  Admin: 'Admin',
  Editor: 'Editor',
  Viewer: 'Viewer'
} as const

export type ProjectRoleName = (typeof ProjectRoleName)[keyof typeof ProjectRoleName]

export const ProjectRoleNameLabel: Record<ProjectRoleName, string> = {
  [ProjectRoleName.Owner]: 'project.updateProjectMembers.role.owner',
  [ProjectRoleName.Admin]: 'project.updateProjectMembers.role.admin',
  [ProjectRoleName.Editor]: 'project.updateProjectMembers.role.editor',
  [ProjectRoleName.Viewer]: 'project.updateProjectMembers.role.viewer'
} as const

export type ProjectRoleNameLabel = (typeof ProjectRoleNameLabel)[keyof typeof ProjectRoleNameLabel]

export interface ProjectRole {
  id: string
  name: ProjectRoleName
  isSystem: boolean
  isDefault: boolean
}

export interface SectionExtensionsMap {
  TASKS: TaskSectionExtensionsFormValues
  STORAGE: StorageSectionExtensionsFormValues
  CALENDAR: CalendarSectionExtensionsFormValues
}

export type SectionExtensionType<K extends SectionKey> = K extends keyof SectionExtensionsMap
  ? SectionExtensionsMap[K]
  : undefined

export type SectionPermission = {
  [K in SectionKey]: {
    sectionKey: K
    canRead: boolean
    canWrite: boolean
    canUpdate: boolean
    canDelete: boolean
    extensions?: SectionExtensionType<K> | string
  }
}[SectionKey]

export interface ProjectPermission {
  projectId: string
  ownerId: string
  effectiveRoleNames: string[]
  roles: ProjectRole[]
  sections: SectionPermission[]
}

export interface ProjectRoleItem extends ProjectRole {
  description: string
  memberCount: number
  permissions: SectionPermission[]
}

export type ProjectRoleTemplate = Omit<ProjectRoleItem, 'id' | 'memberCount'>

export interface ProjectRoleDetail {
  id: string
  name: ProjectRoleName
  description: string
  isDefault: boolean
  isSystem: boolean
  permissions: SectionPermission[]
}
