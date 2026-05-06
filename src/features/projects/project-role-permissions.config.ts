import type { SectionExtensionType } from '@/types/project-permission.type'
import { ActionKey, SectionKey } from '@/types/project-permission.type'
import {
  CalendarDaysIcon,
  GaugeIcon,
  HardDriveIcon,
  InfoIcon,
  ListTodoIcon,
  MessageCircleIcon,
  NotebookPenIcon,
  SettingsIcon,
  WalletIcon
} from 'lucide-react'

export const ACTIONS = Object.values(ActionKey)

type ExtensionVariant = 'switch' | 'checkbox'

type ExtensionsBySectionAction<K extends SectionKey, A extends ActionKey> =
  NonNullable<SectionExtensionType<K>> extends infer SectionExtensions
    ? SectionExtensions extends Record<string, unknown>
      ? A extends keyof SectionExtensions
        ? SectionExtensions[A] extends Record<string, unknown>
          ? keyof SectionExtensions[A] & string
          : never
        : never
      : never
    : never

type ParentControlledExtensionConfig = {
  id: number
  name: string
  affectedByParent: true
  type?: never
  variant: ExtensionVariant
}

type CustomExtensionConfig<K extends SectionKey, A extends ActionKey> =
  ExtensionsBySectionAction<K, A> extends never
    ? never
    : {
        id: number
        name: string
        affectedByParent: false
        type: ExtensionsBySectionAction<K, A>
        variant: ExtensionVariant
      }

type ExtensionConfig<K extends SectionKey, A extends ActionKey> =
  | ParentControlledExtensionConfig
  | CustomExtensionConfig<K, A>

type PermissionConfig<K extends SectionKey, A extends ActionKey> = {
  id: number
  name: string
  extensions?: Array<ExtensionConfig<K, A>>
}

type RuleConfig<K extends SectionKey, A extends ActionKey> = {
  permissions: Array<PermissionConfig<K, A>>
}

type SectionPermissionConfig<K extends SectionKey> = {
  sectionKey: K
} & Partial<{
  [A in ActionKey]: RuleConfig<K, A>
}>

type AnySectionPermissionConfig = {
  [K in SectionKey]: SectionPermissionConfig<K>
}[SectionKey]

const defineSectionPermissionConfig = <const T extends readonly AnySectionPermissionConfig[]>(config: T) => config

export const SECTION_PERMISSION_CONFIG = defineSectionPermissionConfig([
  { sectionKey: SectionKey.OVERVIEW },
  {
    sectionKey: SectionKey.TASKS,
    canRead: {
      permissions: [
        {
          id: 50,
          name: 'project.updateProjectRole.permissionsConfig.tasks.canRead.permission.readTasks',
          extensions: [
            {
              id: 100,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canRead.extensions.viewTasksInKanbanOrTable',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canWrite: {
      permissions: [
        {
          id: 150,
          name: 'project.updateProjectRole.permissionsConfig.tasks.canWrite.permission.writeTasks',
          extensions: [
            {
              id: 200,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canWrite.extensions.createParentMilestonesMilestonesAndTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 250,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canWrite.extensions.addAttachmentsSubtasksAndCommentsOnTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 300,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canWrite.extensions.assignMembersToTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 350,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canWrite.extensions.createOrAssignLabelsToTasks',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canDelete: {
      permissions: [
        {
          id: 400,
          name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.permission.deleteTasks',
          extensions: [
            {
              id: 450,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.extensions.deleteParentMilestonesMilestonesAndTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 500,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.extensions.deleteAttachmentsSubtasksAndCommentsOnTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 550,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.extensions.unassignMembersFromTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 600,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.extensions.unassignLabelsFromTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 650,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.extensions.deleteLabelsFromProject',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canUpdate: {
      permissions: [
        {
          id: 700,
          name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.permission.updateTasks',
          extensions: [
            {
              id: 750,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.updateTaskNameDescriptionPriorityTaskPointsBackgroundImageAndDueDate',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 800,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.watchOrUnwatchTask',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 850,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.updateMilestoneName',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 900,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.moveMilestone',
              affectedByParent: false,
              type: 'canMoveMilestone',
              variant: 'switch'
            },
            {
              id: 950,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.moveTaskBetweenMilestones',
              affectedByParent: false,
              type: 'canMoveTask',
              variant: 'switch'
            },
            {
              id: 1000,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.toggleTaskStatus',
              affectedByParent: false,
              type: 'canToggleTaskStatus',
              variant: 'switch'
            }
          ]
        }
      ]
    }
  },
  {
    sectionKey: SectionKey.PERFORMANCE,
    canRead: {
      permissions: [
        {
          id: 1050,
          name: 'project.updateProjectRole.permissionsConfig.performance.canRead.permission.readTaskPerformance',
          extensions: [
            {
              id: 1100,
              name: 'project.updateProjectRole.permissionsConfig.performance.canRead.extensions.viewTaskPerformanceMetrics',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    }
  },
  {
    sectionKey: SectionKey.CALENDAR,
    canRead: {
      permissions: [
        {
          id: 1150,
          name: 'project.updateProjectRole.permissionsConfig.calendar.canRead.permission.readCalendar',
          extensions: [
            {
              id: 1200,
              name: 'project.updateProjectRole.permissionsConfig.calendar.canRead.extensions.viewProjectCalendar',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1225,
              name: 'project.updateProjectRole.permissionsConfig.calendar.canRead.extensions.viewMeetingDetails',
              affectedByParent: false,
              type: 'canViewMeetingDetails',
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canWrite: {
      permissions: [
        {
          id: 1250,
          name: 'project.updateProjectRole.permissionsConfig.calendar.canWrite.permission.writeCalendar',
          extensions: [
            {
              id: 1300,
              name: 'project.updateProjectRole.permissionsConfig.calendar.canWrite.extensions.purchaseMeetingPackage',
              affectedByParent: false,
              type: 'canPurchasePackage',
              variant: 'switch'
            },
            {
              id: 1350,
              name: 'project.updateProjectRole.permissionsConfig.calendar.canWrite.extensions.bookMeeting',
              affectedByParent: false,
              type: 'canBookMeeting',
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canUpdate: {
      permissions: [
        {
          id: 1400,
          name: 'project.updateProjectRole.permissionsConfig.calendar.canUpdate.permission.updateCalendar',
          extensions: [
            {
              id: 1450,
              name: 'project.updateProjectRole.permissionsConfig.calendar.canUpdate.extensions.rescheduleMeeting',
              affectedByParent: false,
              type: 'canRescheduleMeeting',
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canDelete: {
      permissions: [
        {
          id: 1500,
          name: 'project.updateProjectRole.permissionsConfig.calendar.canDelete.permission.deleteCalendar',
          extensions: [
            {
              id: 1550,
              name: 'project.updateProjectRole.permissionsConfig.calendar.canDelete.extensions.cancelMeeting',
              affectedByParent: false,
              type: 'canCancelMeeting',
              variant: 'switch'
            }
          ]
        }
      ]
    }
  },
  {
    sectionKey: SectionKey.STORAGE,
    canRead: {
      permissions: [
        {
          id: 1600,
          name: 'project.updateProjectRole.permissionsConfig.storage.canRead.permission.readProjectStorage',
          extensions: [
            {
              id: 1650,
              name: 'project.updateProjectRole.permissionsConfig.storage.canRead.extensions.viewProjectStorage',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1700,
              name: 'project.updateProjectRole.permissionsConfig.storage.canRead.extensions.downloadFiles',
              affectedByParent: false,
              type: 'canDownload',
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canWrite: {
      permissions: [
        {
          id: 1750,
          name: 'project.updateProjectRole.permissionsConfig.storage.canWrite.permission.writeProjectStorage',
          extensions: [
            {
              id: 1800,
              name: 'project.updateProjectRole.permissionsConfig.storage.canWrite.extensions.uploadFilesToProjectStorage',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canDelete: {
      permissions: [
        {
          id: 1850,
          name: 'project.updateProjectRole.permissionsConfig.storage.canDelete.permission.deleteProjectStorage',
          extensions: [
            {
              id: 1900,
              name: 'project.updateProjectRole.permissionsConfig.storage.canDelete.extensions.deleteFilesFromProjectStorage',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    }
  },
  {
    sectionKey: SectionKey.REVENUE,
    canRead: {
      permissions: [
        {
          id: 1950,
          name: 'project.updateProjectRole.permissionsConfig.revenue.canRead.permission.readProjectRevenue',
          extensions: [
            {
              id: 2000,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canRead.extensions.viewRevenueMetrics',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canWrite: {
      permissions: [
        {
          id: 2050,
          name: 'project.updateProjectRole.permissionsConfig.revenue.canWrite.permission.writeProjectRevenue',
          extensions: [
            {
              id: 2100,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canWrite.extensions.addIncomeExpenseRecords',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 2150,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canWrite.extensions.addRevenueLabels',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canUpdate: {
      permissions: [
        {
          id: 2200,
          name: 'project.updateProjectRole.permissionsConfig.revenue.canUpdate.permission.updateProjectRevenue',
          extensions: [
            {
              id: 2250,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canUpdate.extensions.updateIncomeExpenseRecords',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 2300,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canUpdate.extensions.assignRevenueLabels',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canDelete: {
      permissions: [
        {
          id: 2350,
          name: 'project.updateProjectRole.permissionsConfig.revenue.canDelete.permission.deleteProjectRevenue',
          extensions: [
            {
              id: 2400,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canDelete.extensions.deleteIncomeExpenseRecords',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 2450,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canDelete.extensions.unassignRevenueLabels',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 2500,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canDelete.extensions.deleteRevenueLabelsFromProject',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    }
  },
  {
    sectionKey: SectionKey.SETTINGS,
    canRead: {
      permissions: [
        {
          id: 2550,
          name: 'project.updateProjectRole.permissionsConfig.settings.canRead.permission.readProjectSettings',
          extensions: [
            {
              id: 2600,
              name: 'project.updateProjectRole.permissionsConfig.settings.canRead.extensions.viewProjectInfoMembersAndRoles',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canWrite: {
      permissions: [
        {
          id: 2650,
          name: 'project.updateProjectRole.permissionsConfig.settings.canWrite.permission.writeProjectSettings',
          extensions: [
            {
              id: 2700,
              name: 'project.updateProjectRole.permissionsConfig.settings.canWrite.extensions.inviteMembers',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 2750,
              name: 'project.updateProjectRole.permissionsConfig.settings.canWrite.extensions.createProjectRoles',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canUpdate: {
      permissions: [
        {
          id: 2800,
          name: 'project.updateProjectRole.permissionsConfig.settings.canUpdate.permission.updateProjectSettings',
          extensions: [
            {
              id: 2850,
              name: 'project.updateProjectRole.permissionsConfig.settings.canUpdate.extensions.updateProjectRoles',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 2900,
              name: 'project.updateProjectRole.permissionsConfig.settings.canUpdate.extensions.assignOrUnassignMemberRoles',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    },
    canDelete: {
      permissions: [
        {
          id: 2950,
          name: 'project.updateProjectRole.permissionsConfig.settings.canDelete.permission.deleteProjectSettings',
          extensions: [
            {
              id: 3000,
              name: 'project.updateProjectRole.permissionsConfig.settings.canDelete.extensions.removeMembers',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 3050,
              name: 'project.updateProjectRole.permissionsConfig.settings.canDelete.extensions.deleteProjectRoles',
              affectedByParent: true,
              variant: 'switch'
            }
          ]
        }
      ]
    }
  }
])

export const SECTION_PERMISSION_CONFIG_MAP = new Map<SectionKey, AnySectionPermissionConfig>(
  SECTION_PERMISSION_CONFIG.map((item) => [item.sectionKey, item])
)

export const SECTION_ICONS = {
  [SectionKey.OVERVIEW]: InfoIcon,
  [SectionKey.TASKS]: ListTodoIcon,
  [SectionKey.PERFORMANCE]: GaugeIcon,
  [SectionKey.CALENDAR]: CalendarDaysIcon,
  [SectionKey.CHAT]: MessageCircleIcon,
  [SectionKey.NOTE]: NotebookPenIcon,
  [SectionKey.STORAGE]: HardDriveIcon,
  [SectionKey.REVENUE]: WalletIcon,
  [SectionKey.SETTINGS]: SettingsIcon
} as const
