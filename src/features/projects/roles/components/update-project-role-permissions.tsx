import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import type { I18nKey } from '@/lib/i18n/types'
import type { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ACTIONS, SECTION_ICONS, SECTION_PERMISSION_CONFIG_MAP } from '../project-role-permissions.config'
import { ActionKey, ActionKeyLabel, SectionKeyLabel } from '../types'
import type { UpdateProjectRoleFormValues } from '../validations'

const UPDATE_FIELD_OPTIONS = {
  shouldDirty: true,
  shouldValidate: true,
  shouldTouch: true
} as const

type ParentLinkedExtension = {
  name: I18nKey
  affectedByParent: boolean
  type?: string
  variant: 'switch' | 'checkbox'
}

type ProjectPermissionItem = UpdateProjectRoleFormValues['permissions'][number]

type ProjectPermissionsAccordionProps = {
  permissions: ProjectPermissionItem[]
  setValue: UseFormSetValue<UpdateProjectRoleFormValues>
  disabled?: boolean
}

const getExtensionValue = (permission: ProjectPermissionItem, action: ActionKey, extensionType?: string) => {
  if (!extensionType || !permission.extensions || typeof permission.extensions === 'string') {
    return false
  }

  const actionExtensions = (permission.extensions as Record<string, unknown>)[action]
  if (!actionExtensions || typeof actionExtensions !== 'object') {
    return false
  }

  return (actionExtensions as Record<string, unknown>)[extensionType] === true
}

const PermissionExtensions = ({
  permission,
  action,
  allExtensions,
  parentChecked,
  permissionIndex,
  setValue,
  disabled = false
}: {
  permission: ProjectPermissionItem
  action: ActionKey
  allExtensions: ParentLinkedExtension[]
  parentChecked: boolean
  permissionIndex: number
  setValue: ProjectPermissionsAccordionProps['setValue']
  disabled?: boolean
}) => {
  const { t } = useTranslation()

  if (!allExtensions.length) {
    return <p className='text-muted-foreground'>{t('project.updateProjectRole.extensions.empty')}</p>
  }

  return (
    <div className='space-y-2'>
      {allExtensions.map((extension) => {
        const isChecked = extension.affectedByParent
          ? parentChecked
          : getExtensionValue(permission, action, extension.type)
        const isDisabled = disabled || extension.affectedByParent || !parentChecked || !extension.type

        return (
          <label
            key={`${permission.sectionKey}-${String(action)}-${extension.name}`}
            className='inline-flex w-full items-center justify-between gap-3 pl-4'
          >
            <p>{t(extension.name)}</p>

            {extension.variant === 'checkbox' ? (
              <Checkbox
                checked={isChecked}
                disabled={isDisabled}
                onCheckedChange={(checked) => {
                  if (!extension.type) {
                    return
                  }

                  setValue(
                    `permissions.${permissionIndex}.extensions.${String(action)}.${extension.type}` as never,
                    (checked === true) as never,
                    UPDATE_FIELD_OPTIONS
                  )
                }}
              />
            ) : (
              <Switch
                checked={isChecked}
                disabled={isDisabled}
                onCheckedChange={(checked) => {
                  if (!extension.type) {
                    return
                  }

                  setValue(
                    `permissions.${permissionIndex}.extensions.${String(action)}.${extension.type}` as never,
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
  )
}

const PermissionActionRow = ({
  permission,
  action,
  permissionIndex,
  setValue,
  disabled = false
}: {
  permission: ProjectPermissionItem
  action: ActionKey
  permissionIndex: number
  setValue: ProjectPermissionsAccordionProps['setValue']
  disabled?: boolean
}) => {
  const { t } = useTranslation()
  const rule = SECTION_PERMISSION_CONFIG_MAP.get(permission.sectionKey)?.[action]
  const parentChecked = permission[action] === true
  const allExtensions = (rule?.permissions.flatMap((item) => item.extensions ?? []) ?? []) as ParentLinkedExtension[]

  const handleActionToggle = (checked: boolean, extensions: ParentLinkedExtension[]) => {
    setValue(`permissions.${permissionIndex}.${String(action)}` as never, checked as never, UPDATE_FIELD_OPTIONS)

    extensions.forEach((extension) => {
      if (!extension.affectedByParent || !extension.type) {
        return
      }

      setValue(
        `permissions.${permissionIndex}.extensions.${String(action)}.${extension.type}` as never,
        checked as never,
        UPDATE_FIELD_OPTIONS
      )
    })
  }

  return (
    <AccordionItem value={`${permission.sectionKey}-${String(action)}`} className='px-3 last:border-b-0'>
      <div className='flex items-center justify-between gap-3 w-full'>
        <AccordionTrigger className='py-2.5 flex-1' displayIcon={false}>
          <p className='text-sm'>{t(ActionKeyLabel[action])}</p>
        </AccordionTrigger>

        <Switch
          checked={parentChecked}
          disabled={disabled}
          onCheckedChange={(checked) => handleActionToggle(checked === true, allExtensions)}
          onClick={(event) => event.stopPropagation()}
        />
      </div>

      <AccordionContent className='pb-3'>
        <PermissionExtensions
          permission={permission}
          action={action}
          allExtensions={allExtensions}
          parentChecked={parentChecked}
          permissionIndex={permissionIndex}
          setValue={setValue}
          disabled={disabled}
        />
      </AccordionContent>
    </AccordionItem>
  )
}

export default function ProjectPermissionsAccordion({
  permissions,
  setValue,
  disabled = false
}: ProjectPermissionsAccordionProps) {
  const { t } = useTranslation()

  return (
    <div className='rounded-2xl border overflow-hidden'>
      <Accordion type='multiple' className='w-full'>
        {permissions.map((permission, idx) => {
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
                <Accordion type='multiple' className='rounded-xl border'>
                  {ACTIONS.map((action) => (
                    <PermissionActionRow
                      key={`${permission.sectionKey}-${String(action)}`}
                      permission={permission}
                      action={action}
                      permissionIndex={idx}
                      setValue={setValue}
                      disabled={disabled}
                    />
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
