import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateProjectFormValues } from '../validations'

export default function UpdateProjectGeneralForm() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const { control } = useFormContext<UpdateProjectFormValues>()

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Controller
        name='teamSize'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('project.updateProjectGeneral.field.teamSize.label')}</FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.updateProjectGeneral.field.teamSize.placeholder')}
              autoComplete='off'
              spellCheck={false}
              value={field.value ?? ''}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='teamContact'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('project.updateProjectGeneral.field.teamContact.label')}</FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.updateProjectGeneral.field.teamContact.placeholder')}
              value={field.value ?? ''}
              autoComplete='off'
              spellCheck={false}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='teamEmail'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('project.updateProjectGeneral.field.teamEmail.label')}</FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.updateProjectGeneral.field.teamEmail.placeholder')}
              autoComplete='off'
              spellCheck={false}
              value={field.value ?? ''}
            />

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      {user?.OrganizationId ? (
        <Controller
          name='schoolSubject'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>
                {t('project.updateProjectGeneral.field.schoolSubject.label')}
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t('project.updateProjectGeneral.field.schoolSubject.placeholder')}
                autoComplete='off'
                spellCheck={false}
                value={field.value ?? ''}
              />

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      ) : null}
    </div>
  )
}
