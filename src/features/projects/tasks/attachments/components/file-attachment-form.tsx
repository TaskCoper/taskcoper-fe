import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateTaskAttachmentFormValues } from '../validations'

export default function FileAttachmentForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<UpdateTaskAttachmentFormValues>()

  return (
    <div className='mt-4'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
            <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
              {t('task.attachment.fileName')}
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('task.attachment.attachmentDisplayPlaceholder')}
              autoComplete='off'
              spellCheck={false}
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
