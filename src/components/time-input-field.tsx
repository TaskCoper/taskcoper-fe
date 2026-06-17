import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ClockIcon } from 'lucide-react'
import { type Control, Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form'

interface TimeInputFieldProps<T extends FieldValues> {
  name: Path<T>
  label: I18nKey
  control?: Control<T>
  placeholder?: string
  isRequired?: boolean
  isDisabled?: boolean
  className?: string
  displayError?: boolean
}

export function TimeInputField<T extends FieldValues>({
  name,
  label,
  control: propsControl,
  placeholder = 'HH:mm',
  isRequired = false,
  isDisabled = false,
  className,
  displayError = true
}: TimeInputFieldProps<T>) {
  const { t } = useTenantTranslation()

  const context = useFormContext<T>()
  const control = propsControl || context?.control

  if (!control) {
    throw new Error('TimePickerField must be used within a FormProvider or passed a control prop')
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={cn('gap-1', className)}>
          <FieldLabel htmlFor={field.name} className='gap-0.5'>
            {t(label)}
            {isRequired ? (
              <span className='text-destructive font-semibold'>*</span>
            ) : (
              <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
            )}
          </FieldLabel>

          <div className='relative flex items-center w-full'>
            <ClockIcon className='absolute left-3 size-4 text-muted-foreground z-10' />
            <Input
              id={field.name}
              type='time'
              placeholder={placeholder}
              disabled={isDisabled}
              aria-invalid={fieldState.invalid}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              className={cn(
                'pl-9 w-full appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
                !field.value && 'text-muted-foreground',
                fieldState.invalid && 'border-destructive focus-visible:ring-destructive'
              )}
            />
          </div>

          {displayError && (
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          )}
        </Field>
      )}
    />
  )
}
