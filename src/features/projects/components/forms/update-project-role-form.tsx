import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { ActionKey, ActionKeyLabel, SectionKey, SectionKeyLabel } from '@/types/project-permission.type'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateProjectRoleFormValues } from '../../validations'

const ACTIONS = Object.values(ActionKey)

export default function UpdateProjectRoleForm() {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<UpdateProjectRoleFormValues>()

  const permissions = watch('permissions') ?? []

  return (
    <div className='space-y-3'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('project.updateProjectRole.field.name.label')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.updateProjectRole.field.name.placeholder')}
              autoComplete='off'
              spellCheck={false}
              autoFocus
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
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('project.updateProjectRole.field.description.label')}</FieldLabel>

            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                placeholder={t('project.updateProjectRole.field.description.placeholder')}
                rows={3}
                className='min-h-20 resize-none wrap-break-word'
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align='block-end'>
                <InputGroupText className='tabular-nums text-xs'>
                  {String(field.value ?? '').length}/255 {t('common.ui.characters')}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <div className='rounded-md border overflow-hidden'>
        <div className='grid grid-cols-[1fr_repeat(4,56px)] border-b bg-muted/40 px-3 py-2'>
          <span className='text-xs font-medium text-muted-foreground'>{t('project.settings.tabs.permissions')}</span>
          {ACTIONS.map((action) => (
            <span
              key={action}
              className='text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'
            >
              {t(ActionKeyLabel[action])[0]}
            </span>
          ))}
        </div>

        {permissions.map((permission, idx) => {
          const isLast = idx === permissions.length - 1
          const isTaskSection = permission.sectionKey === SectionKey.TASKS
          const isStorageSection = permission.sectionKey === SectionKey.STORAGE

          return (
            <div key={permission.sectionKey} className={!isLast ? 'border-b border-border/50' : ''}>
              <div className='grid grid-cols-[1fr_repeat(4,56px)] items-center px-3 py-2.5'>
                <span className='text-xs font-medium'>{t(SectionKeyLabel[permission.sectionKey])}</span>

                {ACTIONS.map((action) => (
                  <Controller
                    key={action}
                    name={`permissions.${idx}.${action}`}
                    control={control}
                    render={({ field }) => (
                      <div className='flex justify-center'>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      </div>
                    )}
                  />
                ))}
              </div>

              {isTaskSection ? (
                <div className='mb-2 p-2 space-y-2'>
                  <p className='text-xs font-semibold text-muted-foreground'>
                    {t('project.updateProjectRole.extensions.taskUpdateTitle')}
                  </p>

                  <div className='flex flex-wrap items-center gap-4'>
                    <Controller
                      name={`permissions.${idx}.extensions.canUpdate.canMoveTask` as never}
                      control={control}
                      render={({ field }) => (
                        <label className='inline-flex items-center gap-2 text-xs'>
                          <Checkbox
                            checked={field.value === true}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            disabled={!permission.canUpdate}
                          />
                          {t('project.updateProjectRole.extensions.moveTask')}
                        </label>
                      )}
                    />

                    <Controller
                      name={`permissions.${idx}.extensions.canUpdate.canMoveMilestone` as never}
                      control={control}
                      render={({ field }) => (
                        <label className='inline-flex items-center gap-2 text-xs'>
                          <Checkbox
                            checked={field.value === true}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            disabled={!permission.canUpdate}
                          />
                          {t('project.updateProjectRole.extensions.moveMilestone')}
                        </label>
                      )}
                    />

                    <Controller
                      name={`permissions.${idx}.extensions.canUpdate.canToggleTaskStatus` as never}
                      control={control}
                      render={({ field }) => (
                        <label className='inline-flex items-center gap-2 text-xs'>
                          <Checkbox
                            checked={field.value === true}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            disabled={!permission.canUpdate}
                          />
                          {t('project.updateProjectRole.extensions.toggleTaskStatus')}
                        </label>
                      )}
                    />
                  </div>
                </div>
              ) : null}

              {isStorageSection ? (
                <div className='mb-2 p-2 space-y-2'>
                  <p className='text-xs font-semibold text-muted-foreground'>
                    {t('project.updateProjectRole.extensions.storageReadTitle')}
                  </p>

                  <div className='mt-1 flex items-center gap-4'>
                    <Controller
                      name={`permissions.${idx}.extensions.canRead.canDownload` as never}
                      control={control}
                      render={({ field }) => (
                        <label className='inline-flex items-center gap-2 text-xs'>
                          <Checkbox
                            checked={field.value === true}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            disabled={!permission.canRead}
                          />
                          {t('project.updateProjectRole.extensions.downloadFiles')}
                        </label>
                      )}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
