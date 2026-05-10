import RichTextEditor from '@/components/rich-text-editor'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type UpdateProjectFormValues } from '../../validations'

export default function UpdateProjectInfoForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<UpdateProjectFormValues>()

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('project.updateProjectInfo.field.name.label')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.updateProjectInfo.field.name.placeholder')}
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
        name='description'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('project.updateProjectInfo.field.description.label')}
            </FieldLabel>

            <RichTextEditor content={field.value ?? ''} onChange={field.onChange} />
          </Field>
        )}
      />
    </div>
  )
}
