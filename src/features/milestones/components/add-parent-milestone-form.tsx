import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { AddParentMilestoneFormValues } from '../validations'

export default function AddParentMilestoneForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<AddParentMilestoneFormValues>()

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Controller
        name='milestoneName'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('milestone.addParentMilestone.field.milestoneName.label')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('milestone.addParentMilestone.field.milestoneName.placeholder')}
              autoComplete='off'
              spellCheck={false}
              autoFocus={true}
            />
          </Field>
        )}
      />
    </div>
  )
}
