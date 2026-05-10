import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateAttachmentFormValues } from '../../../shared/validations'

export default function LinkAttachmentForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<UpdateAttachmentFormValues>()

  return (
    <div className='mt-4'>
      <Controller
        name='url'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('task.attachment.attachmentValue')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('task.attachment.attachmentValuePlaceholder')}
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
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
            <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
              {t('task.attachment.attachmentDisplay')}
              <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
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
