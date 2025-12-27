import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { AddMilestoneFormValues } from '../validations'

interface AddMilestoneFormProps {
  onBlur: () => void
}

export default function AddMilestoneForm({ onBlur }: AddMilestoneFormProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<AddMilestoneFormValues>()

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Controller
        name='milestoneName'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('milestone.addMilestone.field.milestoneName.placeholder')}
              autoComplete='off'
              spellCheck={false}
              autoFocus={true}
              onBlur={() => {
                if (field.value) return
                onBlur()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (field.value) return
                  onBlur()
                }
              }}
            />
          </Field>
        )}
      />
    </div>
  )
}
