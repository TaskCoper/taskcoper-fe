export type SectionKey =
  | 'OVERVIEW'
  | 'TASKS'
  | 'PERFORMANCE'
  | 'CALENDAR'
  | 'CHAT'
  | 'NOTE'
  | 'STORAGE'
  | 'REVENUE'
  | 'SETTINGS'

export type ActionKey = 'canRead' | 'canWrite' | 'canUpdate' | 'canDelete'

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
  TASKS: TaskSectionExtensions
  STORAGE: StorageSectionExtensions
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

export interface TaskSectionExtensions {
  canUpdate: {
    canMoveTask: boolean
    canMoveMilestone: boolean
    canToggleTaskStatus: boolean
  }
}

export interface StorageSectionExtensions {
  canRead: {
    canDownload: boolean
  }
}
