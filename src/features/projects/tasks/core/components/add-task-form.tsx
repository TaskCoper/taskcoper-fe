import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { AddTaskFormValues } from '../validations'

interface AddTaskFormProps {
  onBlur: () => void
}

export default function AddTaskForm({ onBlur }: AddTaskFormProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<AddTaskFormValues>()

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('task.addTask.field.name.placeholder')}
              autoComplete='off'
              spellCheck={false}
              autoFocus={true}
              onBlur={() => {
                if (field.value) return
                onBlur()
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter') {
                  if (field.value) return
                  onBlur()
                }
              }}
            />
            {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  )
}
