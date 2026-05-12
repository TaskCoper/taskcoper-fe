import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { KeySquareIcon } from 'lucide-react'
import { useId } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateProjectRoleFormValues } from '../validations'
import ProjectPermissionsAccordion from './update-project-role-permissions'

const UPDATE_FIELD_OPTIONS = {
  shouldDirty: true,
  shouldValidate: true,
  shouldTouch: true
} as const

type UpdateProjectRoleFormProps = {
  disabled?: boolean
}

export default function UpdateProjectRoleForm({ disabled = false }: UpdateProjectRoleFormProps) {
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
              disabled={disabled}
            />
          ) : (
            <>
              {disabled ? (
                <div className='w-full rounded-sm text-left text-2xl font-bold cursor-not-allowed text-muted-foreground flex items-center gap-2'>
                  <KeySquareIcon className='text-muted-foreground' />
                  {roleName || t('project.updateProjectRole.field.name.placeholder')}
                </div>
              ) : (
                <button
                  type='button'
                  className='w-full rounded-sm text-left text-2xl font-bold hover:bg-muted cursor-text flex items-center gap-2'
                  {...nameTriggerProps}
                >
                  <KeySquareIcon className='text-primary' />
                  {roleName || t('project.updateProjectRole.field.name.placeholder')}
                </button>
              )}
            </>
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
              disabled={disabled}
            />
          ) : (
            <>
              {disabled ? (
                <div className='w-full rounded-sm text-left text-sm text-muted-foreground cursor-not-allowed'>
                  {roleDescription ? roleDescription : t('project.updateProjectRole.field.description.placeholder')}
                </div>
              ) : (
                <button
                  type='button'
                  className='w-full rounded-sm text-left text-sm hover:bg-muted cursor-text text-muted-foreground'
                  {...descriptionTriggerProps}
                >
                  {roleDescription ? roleDescription : t('project.updateProjectRole.field.description.placeholder')}
                </button>
              )}
            </>
          )}

          {isEditingDescription ? (
            <p className='text-[11px] tabular-nums text-muted-foreground'>
              {(isEditingDescription ? descriptionEditValue : roleDescription).length}/255 {t('common.ui.characters')}
            </p>
          ) : null}
        </div>
      </div>

      <ProjectPermissionsAccordion permissions={permissions} setValue={setValue} disabled={disabled} />
    </div>
  )
}
