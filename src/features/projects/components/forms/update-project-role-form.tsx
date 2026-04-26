import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import type { SectionExtensionType } from '@/types/project-permission.type'
import { ActionKey, ActionKeyLabel, SectionKey, SectionKeyLabel } from '@/types/project-permission.type'
import {
  CalendarDaysIcon,
  GaugeIcon,
  HardDriveIcon,
  InfoIcon,
  KeySquareIcon,
  ListTodoIcon,
  MessageCircleIcon,
  NotebookPenIcon,
  SettingsIcon,
  WalletIcon
} from 'lucide-react'
import { useId } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateProjectRoleFormValues } from '../../validations'

const ACTIONS = Object.values(ActionKey)

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

const SECTION_PERMISSION_CONFIG = defineSectionPermissionConfig([
  { sectionKey: SectionKey.OVERVIEW },
  {
    sectionKey: SectionKey.TASKS,
    canRead: {
      permissions: [
        {
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.tasks.canRead.permission.readTasks',
          extensions: [
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.tasks.canWrite.permission.writeTasks',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canWrite.extensions.createParentMilestonesMilestonesAndTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canWrite.extensions.addAttachmentsSubtasksAndCommentsOnTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canWrite.extensions.assignMembersToTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.permission.deleteTasks',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.extensions.deleteParentMilestonesMilestonesAndTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.extensions.deleteAttachmentsSubtasksAndCommentsOnTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.extensions.unassignMembersFromTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canDelete.extensions.unassignLabelsFromTasks',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
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
          id: 2,
          name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.permission.updateTasks',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.updateTaskNameDescriptionPriorityTaskPointsBackgroundImageAndDueDate',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.watchOrUnwatchTask',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 2,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.updateMilestoneName',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 2,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.moveMilestone',
              affectedByParent: false,
              type: 'canMoveMilestone',
              variant: 'switch'
            },
            {
              id: 3,
              name: 'project.updateProjectRole.permissionsConfig.tasks.canUpdate.extensions.moveTaskBetweenMilestones',
              affectedByParent: false,
              type: 'canMoveTask',
              variant: 'switch'
            },
            {
              id: 4,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.performance.canRead.permission.readTaskPerformance',
          extensions: [
            {
              id: 1,
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
    sectionKey: SectionKey.STORAGE,
    canRead: {
      permissions: [
        {
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.storage.canRead.permission.readProjectStorage',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.storage.canRead.extensions.viewProjectStorage',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.storage.canWrite.permission.writeProjectStorage',
          extensions: [
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.storage.canDelete.permission.deleteProjectStorage',
          extensions: [
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.revenue.canRead.permission.readProjectRevenue',
          extensions: [
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.revenue.canWrite.permission.writeProjectRevenue',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canWrite.extensions.addIncomeExpenseRecords',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.revenue.canUpdate.permission.updateProjectRevenue',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canUpdate.extensions.updateIncomeExpenseRecords',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.revenue.canDelete.permission.deleteProjectRevenue',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canDelete.extensions.deleteIncomeExpenseRecords',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.revenue.canDelete.extensions.unassignRevenueLabels',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.settings.canRead.permission.readProjectSettings',
          extensions: [
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.settings.canWrite.permission.writeProjectSettings',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.settings.canWrite.extensions.inviteMembers',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.settings.canUpdate.permission.updateProjectSettings',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.settings.canUpdate.extensions.updateProjectRoles',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
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
          id: 1,
          name: 'project.updateProjectRole.permissionsConfig.settings.canDelete.permission.deleteProjectSettings',
          extensions: [
            {
              id: 1,
              name: 'project.updateProjectRole.permissionsConfig.settings.canDelete.extensions.removeMembers',
              affectedByParent: true,
              variant: 'switch'
            },
            {
              id: 1,
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

const SECTION_PERMISSION_CONFIG_MAP = new Map<SectionKey, AnySectionPermissionConfig>(
  SECTION_PERMISSION_CONFIG.map((item) => [item.sectionKey, item])
)

const SECTION_ICONS = {
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

const UPDATE_FIELD_OPTIONS = {
  shouldDirty: true,
  shouldValidate: true,
  shouldTouch: true
} as const

type ParentLinkedExtension = {
  affectedByParent: boolean
  type?: string
}

const getExtensionValue = (
  permission: UpdateProjectRoleFormValues['permissions'][number],
  action: ActionKey,
  extensionType?: string
) => {
  if (!extensionType || !permission.extensions || typeof permission.extensions === 'string') {
    return false
  }

  const actionExtensions = (permission.extensions as Record<string, unknown>)[action]
  if (!actionExtensions || typeof actionExtensions !== 'object') {
    return false
  }

  return (actionExtensions as Record<string, unknown>)[extensionType] === true
}

export default function UpdateProjectRoleForm() {
  const uniqueId = useId()
  const nameFieldId = `${uniqueId}-role-name`
  const descriptionFieldId = `${uniqueId}-role-description`

  const { t } = useTranslation()
  const { watch, setValue, formState } = useFormContext<UpdateProjectRoleFormValues>()

  const roleName = watch('name') ?? ''
  const roleDescription = watch('description') ?? ''
  const permissions = watch('permissions') ?? []

  const {
    isEditing: isEditingName,
    inputProps: nameInputProps,
    triggerProps: nameTriggerProps
  } = useInlineEdit({
    initialValue: roleName,
    onSave: (value) => {
      setValue('name', value, UPDATE_FIELD_OPTIONS)
    }
  })

  const {
    isEditing: isEditingDescription,
    inputProps: descriptionInputProps,
    triggerProps: descriptionTriggerProps,
    editValue: descriptionEditValue
  } = useInlineEdit({
    initialValue: roleDescription,
    allowEmpty: true,
    onSave: (value) => {
      setValue('description', value, UPDATE_FIELD_OPTIONS)
    }
  })

  const nameError = formState.errors.name?.message
  const descriptionError = formState.errors.description?.message

  const handleActionToggle = (
    permissionIndex: number,
    action: ActionKey,
    checked: boolean,
    extensions: ParentLinkedExtension[] = []
  ) => {
    setValue(`permissions.${permissionIndex}.${action}` as never, checked as never, UPDATE_FIELD_OPTIONS)

    extensions.forEach((extension) => {
      if (!extension.affectedByParent || !extension.type) {
        return
      }

      setValue(
        `permissions.${permissionIndex}.extensions.${action}.${extension.type}` as never,
        checked as never,
        UPDATE_FIELD_OPTIONS
      )
    })
  }

  return (
    <div className='space-y-6'>
      <div>
        <div className='space-y-1'>
          {isEditingName ? (
            <Input
              {...nameInputProps}
              id={nameFieldId}
              maxLength={255}
              className='h-9 font-semibold'
              aria-invalid={!!nameError}
              placeholder={t('project.updateProjectRole.field.name.placeholder')}
              autoComplete='off'
              spellCheck={false}
            />
          ) : (
            <button
              type='button'
              className='w-full rounded-sm text-left text-2xl font-bold tracking-tight hover:bg-muted cursor-text flex items-center gap-2'
              {...nameTriggerProps}
            >
              <KeySquareIcon className='text-primary' />
              {roleName || t('project.updateProjectRole.field.name.placeholder')}
            </button>
          )}

          {nameError ? <p className='text-xs text-destructive'>{String(nameError)}</p> : null}
        </div>

        <div className='space-y-1'>
          {isEditingDescription ? (
            <Textarea
              {...descriptionInputProps}
              id={descriptionFieldId}
              rows={3}
              maxLength={255}
              className='min-h-20 resize-none'
              aria-invalid={!!descriptionError}
              placeholder={t('project.updateProjectRole.field.description.placeholder')}
              spellCheck={false}
            />
          ) : (
            <button
              type='button'
              className='w-full rounded-sm text-left text-sm hover:bg-muted cursor-text text-muted-foreground'
              {...descriptionTriggerProps}
            >
              {roleDescription ? roleDescription : t('project.updateProjectRole.field.description.placeholder')}
            </button>
          )}

          {isEditingDescription ? (
            <p className='text-[11px] tabular-nums text-muted-foreground'>
              {(isEditingDescription ? descriptionEditValue : roleDescription).length}/255 {t('common.ui.characters')}
            </p>
          ) : null}
        </div>
      </div>

      <div className='rounded-md border overflow-hidden'>
        <Accordion type='multiple' className='w-full'>
          {permissions.map((permission, idx) => {
            const sectionConfig = SECTION_PERMISSION_CONFIG_MAP.get(permission.sectionKey)
            const SectionIcon = SECTION_ICONS[permission.sectionKey]

            return (
              <AccordionItem key={permission.sectionKey} value={`section-${permission.sectionKey}`} className='px-3'>
                <AccordionTrigger className='py-3'>
                  <span className='inline-flex items-center gap-2 font-medium'>
                    <SectionIcon className='size-4 text-primary' />
                    {t(SectionKeyLabel[permission.sectionKey])}
                  </span>
                </AccordionTrigger>

                <AccordionContent className='pb-3'>
                  <Accordion type='multiple' className='rounded-md border'>
                    {ACTIONS.map((action) => {
                      const rule = sectionConfig?.[action]
                      const parentChecked = permission[action] === true
                      const allExtensions = rule?.permissions.flatMap((item) => item.extensions ?? []) ?? []

                      return (
                        <AccordionItem
                          key={`${permission.sectionKey}-${action}`}
                          value={`${permission.sectionKey}-${action}`}
                          className='px-3 last:border-b-0'
                        >
                          <div className='flex items-center justify-between gap-3 w-full'>
                            <AccordionTrigger className='py-2.5 flex-1' displayIcon={false}>
                              <p className='text-sm'>{t(ActionKeyLabel[action])}</p>
                            </AccordionTrigger>

                            <Switch
                              checked={parentChecked}
                              onCheckedChange={(checked) =>
                                handleActionToggle(idx, action, checked === true, allExtensions)
                              }
                              onClick={(event) => event.stopPropagation()}
                            />
                          </div>

                          <AccordionContent className='pb-3'>
                            {allExtensions.length ? (
                              <div className='space-y-2'>
                                {allExtensions.map((extension) => {
                                  const isChecked = extension.affectedByParent
                                    ? parentChecked
                                    : getExtensionValue(permission, action, extension.type)
                                  const isDisabled = extension.affectedByParent || !parentChecked || !extension.type

                                  return (
                                    <label
                                      key={`${permission.sectionKey}-${action}-${extension.name}`}
                                      className='inline-flex w-full items-center justify-between gap-3 pl-4'
                                    >
                                      <p>{t(extension.name)}</p>

                                      {extension.variant === 'switch' ? (
                                        <Switch
                                          checked={isChecked}
                                          disabled={isDisabled}
                                          onCheckedChange={(checked) => {
                                            if (!extension.type) {
                                              return
                                            }

                                            setValue(
                                              `permissions.${idx}.extensions.${action}.${extension.type}` as never,
                                              (checked === true) as never,
                                              UPDATE_FIELD_OPTIONS
                                            )
                                          }}
                                        />
                                      ) : (
                                        <Checkbox
                                          checked={isChecked}
                                          disabled={isDisabled}
                                          onCheckedChange={(checked) => {
                                            if (!extension.type) {
                                              return
                                            }

                                            setValue(
                                              `permissions.${idx}.extensions.${action}.${extension.type}` as never,
                                              (checked === true) as never,
                                              UPDATE_FIELD_OPTIONS
                                            )
                                          }}
                                        />
                                      )}
                                    </label>
                                  )
                                })}
                              </div>
                            ) : (
                              <p className='text-muted-foreground'>No detailed permissions configured.</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}
