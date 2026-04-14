import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useGetProjectRoleTemplates } from '../../hooks/use-get-project-role-templates'
import type { AddProjectRoleFormValues } from '../../validations'

type AddProjectRolePermission = AddProjectRoleFormValues['permissions'][number]
type AddProjectRolePermissionExtensions = AddProjectRolePermission['extensions']

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
  const { control, setValue, watch } = useFormContext<AddProjectRoleFormValues>()

  const projectIdentifier = watch('projectIdentifier')
  const { projectRoleTemplates, isLoadingProjectRoleTemplates } = useGetProjectRoleTemplates({ projectIdentifier })
  const templateItems = projectRoleTemplates?.value.items ?? []

  const handleTemplateChange = (templateIndex: string) => {
    const selectedTemplate = templateItems[Number(templateIndex)]
    if (!selectedTemplate) return

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
      { shouldDirty: true, shouldValidate: true }
    )
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

      <Field className='gap-1'>
        <FieldLabel htmlFor='projectRoleTemplate'>{t('project.addProjectRole.field.template.label')}</FieldLabel>
        <Select
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
      </Field>
    </div>
  )
}
