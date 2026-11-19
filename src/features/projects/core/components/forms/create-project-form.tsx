import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { CreateProjectFormValues } from '../../validations'

// NOTE: The project domain selection is temporarily removed from the create flow
// (single-version cleanup). To restore it, re-add the `domainIds` Controller with
// InfiniteMultiSelect + useGetDomainsInfinite, and restore the `.min(1)` rule on
// domainIds in createProjectSchema (validations.ts). The edit/update flow still keeps domains.
export default function CreateProjectForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<CreateProjectFormValues>()

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('project.createProject.field.name.label')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.createProject.field.name.placeholder')}
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
    </div>
  )
}
