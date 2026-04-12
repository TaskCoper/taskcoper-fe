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

export interface ProjectRole {
  id: string
  name: string
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
