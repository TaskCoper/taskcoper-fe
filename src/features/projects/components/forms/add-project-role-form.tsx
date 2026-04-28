import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ActionKeyLabel, SectionKey, SectionKeyLabel } from '@/types/project-permission.type'
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
import { Fragment, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useGetProjectRoleTemplates } from '../../hooks/use-get-project-role-templates'
import type { AddProjectRoleFormValues } from '../../validations'

type AddProjectRolePermission = AddProjectRoleFormValues['permissions'][number]
type AddProjectRolePermissionExtensions = AddProjectRolePermission['extensions']
type PermissionAction = 'canRead' | 'canWrite' | 'canUpdate' | 'canDelete'
type BooleanLeaf = {
  path: string[]
  value: boolean
}

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

const EMPTY_PERMISSIONS: AddProjectRolePermission[] = []
const PERMISSION_COLUMNS: PermissionAction[] = ['canRead', 'canWrite', 'canUpdate', 'canDelete']

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const collectBooleanLeaves = (value: unknown, parentPath: string[] = []): BooleanLeaf[] => {
  if (!isRecord(value)) {
    return []
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const nextPath = [...parentPath, key]

    if (typeof nestedValue === 'boolean') {
      return [{ path: nextPath, value: nestedValue }]
    }

    return collectBooleanLeaves(nestedValue, nextPath)
  })
}

const humanizeKey = (text: string) =>
  text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (s) => s.toUpperCase())

const normalizePermissionExtensions = (extensions: unknown): AddProjectRolePermissionExtensions => {
  if (!extensions) return null

  if (typeof extensions === 'string') {
    try {
      const parsedExtensions = JSON.parse(extensions)
      if (parsedExtensions && typeof parsedExtensions === 'object') {
        return parsedExtensions as AddProjectRolePermissionExtensions
      }
    } catch {
      return null
    }
    return null
  }

  if (typeof extensions === 'object') {
    return extensions as AddProjectRolePermissionExtensions
  }

  return null
}

export default function AddProjectRoleForm() {
  const { t } = useTranslation()
  const { control, setValue, watch, formState } = useFormContext<AddProjectRoleFormValues>()
  const [isTemplateSelectOpen, setIsTemplateSelectOpen] = useState(false)
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<string | undefined>()

  const projectIdentifier = watch('projectIdentifier')
  const permissions = watch('permissions') ?? EMPTY_PERMISSIONS
  const permissionsError = (formState.errors.permissions as { message?: string } | undefined)?.message
  const { projectRoleTemplates, isLoadingProjectRoleTemplates } = useGetProjectRoleTemplates({ projectIdentifier })
  const templateItems = projectRoleTemplates?.value.items ?? []

  const applyTemplate = (templateIndex: string) => {
    const selectedTemplate = templateItems[Number(templateIndex)]
    if (!selectedTemplate) return

    setSelectedTemplateIndex(templateIndex)

    setValue(
      'permissions',
      selectedTemplate.permissions.map((permission) => ({
        sectionKey: permission.sectionKey,
        canRead: permission.canRead,
        canWrite: permission.canWrite,
        canUpdate: permission.canUpdate,
        canDelete: permission.canDelete,
        extensions: normalizePermissionExtensions(permission.extensions)
      })),
      UPDATE_FIELD_OPTIONS
    )
  }

  const handleTemplateChange = (templateIndex: string) => {
    applyTemplate(templateIndex)
  }

  const handleActionToggle = (permissionIndex: number, action: PermissionAction, checked: boolean) => {
    if (permissionIndex < 0) return

    setValue(`permissions.${permissionIndex}.${action}`, checked, UPDATE_FIELD_OPTIONS)

    const permission = permissions[permissionIndex]
    if (!permission || checked) return

    if (!permission.extensions || typeof permission.extensions === 'string') {
      return
    }

    const extensionsRecord = permission.extensions as Record<string, unknown>
    const actionExtensions = extensionsRecord[action]
    const leaves = collectBooleanLeaves(actionExtensions)

    leaves.forEach((leaf) => {
      setValue(
        `permissions.${permissionIndex}.extensions.${action}.${leaf.path.join('.')}` as never,
        false as never,
        UPDATE_FIELD_OPTIONS
      )
    })
  }

  return (
    <div className='space-y-1'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('project.addProjectRole.field.name.label')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.addProjectRole.field.name.placeholder')}
              autoComplete='off'
              spellCheck={false}
              autoFocus={true}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='description'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1 mb-4'>
            <FieldLabel htmlFor={field.name}>{t('project.addProjectRole.field.description.label')}</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                placeholder={t('project.addProjectRole.field.description.placeholder')}
                rows={6}
                className='min-h-24 resize-none wrap-break-word'
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align='block-end'>
                <InputGroupText className='tabular-nums text-xs'>
                  {field.value.length}/255 {t('common.ui.characters')}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />

      <Field data-invalid={Boolean(permissionsError)} className='gap-1'>
        <FieldLabel htmlFor='projectRoleTemplate' className='gap-0.5'>
          {t('project.addProjectRole.field.template.label')}
          <span className='text-destructive font-semibold'>*</span>
        </FieldLabel>
        <Select
          open={isTemplateSelectOpen}
          onOpenChange={setIsTemplateSelectOpen}
          value={selectedTemplateIndex}
          onValueChange={handleTemplateChange}
          disabled={!projectIdentifier || isLoadingProjectRoleTemplates || templateItems.length === 0}
        >
          <SelectTrigger id='projectRoleTemplate'>
            <SelectValue
              placeholder={
                isLoadingProjectRoleTemplates
                  ? t('common.ui.loading')
                  : t('project.addProjectRole.field.template.placeholder')
              }
            />
          </SelectTrigger>
          <SelectContent className='min-w-(--radix-select-trigger-width)'>
            {templateItems.map((template, index) => (
              <SelectItem key={`${template.name}-${index}`} value={String(index)}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className='min-h-4'>
          {permissionsError ? <FieldError className='text-xs' errors={[{ message: permissionsError }]} /> : null}
        </div>
      </Field>

      {permissions.length > 0 ? (
        <div className='space-y-3 mt-2'>
          <div className='rounded-md border overflow-x-auto shadow-xs'>
            <Table className='min-w-120 bg-card'>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='w-80 border-r bg-muted/10'>{t('project.settings.tabs.permissions')}</TableHead>
                  <TableHead className='w-30 text-center'>{t(ActionKeyLabel.canRead)}</TableHead>
                  <TableHead className='w-30 text-center'>{t(ActionKeyLabel.canWrite)}</TableHead>
                  <TableHead className='w-30 text-center'>{t(ActionKeyLabel.canUpdate)}</TableHead>
                  <TableHead className='w-30 text-center'>{t(ActionKeyLabel.canDelete)}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Object.values(SectionKey).map((sectionKey) => {
                  const permissionIndex = permissions.findIndex((permission) => permission.sectionKey === sectionKey)
                  const permission = permissionIndex >= 0 ? permissions[permissionIndex] : undefined
                  const SectionIcon = SECTION_ICONS[sectionKey]
                  const extensionRows = permission
                    ? PERMISSION_COLUMNS.flatMap((action) => {
                        if (!permission[action]) {
                          return []
                        }

                        if (!permission.extensions || typeof permission.extensions === 'string') {
                          return []
                        }

                        const extensionsRecord = permission.extensions as Record<string, unknown>
                        const actionExtensions = extensionsRecord[action]
                        const leaves = collectBooleanLeaves(actionExtensions)

                        return leaves.map((leaf) => ({ action, leaf }))
                      })
                    : []

                  return (
                    <Fragment key={sectionKey}>
                      <TableRow key={sectionKey} className='hover:bg-muted/10'>
                        <TableCell className='border-r bg-muted/5 py-2 pl-4 text-xs font-medium'>
                          <span className='inline-flex items-center gap-2'>
                            <SectionIcon className='size-4 text-primary' />
                            {t(SectionKeyLabel[sectionKey])}
                          </span>
                        </TableCell>

                        {PERMISSION_COLUMNS.map((column) => (
                          <TableCell key={`${sectionKey}-${column}`} className='py-2.5'>
                            <div className='flex justify-center'>
                              <Checkbox
                                checked={permission?.[column] === true}
                                disabled={permissionIndex < 0}
                                onCheckedChange={(isChecked) =>
                                  handleActionToggle(permissionIndex, column, isChecked === true)
                                }
                              />
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                      {extensionRows.map(({ action, leaf }) => {
                        const extensionLabel = t(
                          `project.updateProjectRole.extensions.${leaf.path[leaf.path.length - 1]}`,
                          {
                            defaultValue: humanizeKey(leaf.path[leaf.path.length - 1])
                          }
                        )

                        return (
                          <TableRow key={`${sectionKey}-${action}-${leaf.path.join('.')}`} className='hover:bg-muted/5'>
                            <TableCell className='border-r py-2 pl-10 text-xs text-muted-foreground'>
                              {extensionLabel}
                            </TableCell>

                            {PERMISSION_COLUMNS.map((column) => (
                              <TableCell
                                key={`${sectionKey}-${action}-${column}-${leaf.path.join('.')}`}
                                className='py-2'
                              >
                                <div className='flex justify-center'>
                                  {column === action && permissionIndex >= 0 ? (
                                    <Checkbox
                                      checked={leaf.value}
                                      onCheckedChange={(isChecked) =>
                                        setValue(
                                          `permissions.${permissionIndex}.extensions.${action}.${leaf.path.join('.')}` as never,
                                          (isChecked === true) as never,
                                          UPDATE_FIELD_OPTIONS
                                        )
                                      }
                                    />
                                  ) : null}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      })}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
