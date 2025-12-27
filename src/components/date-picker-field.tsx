import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/shared/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { type Control, Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface DatePickerFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  control?: Control<T>
  placeholder?: string
  isRequired?: boolean
  disabled?: boolean
  className?: string
}

export function DatePickerField<T extends FieldValues>({
  name,
  label,
  control: propsControl,
  placeholder = 'datePickerField.placeholder',
  isRequired = false,
  disabled = false,
  className
}: DatePickerFieldProps<T>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const context = useFormContext<T>()
  const control = propsControl || context?.control

  if (!control) {
    throw new Error('DatePickerField must be used within a FormProvider or passed a control prop')
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={cn('gap-1', className)}>
          <FieldLabel htmlFor={field.name} className='gap-0.5'>
            {t(label)}
            {isRequired && <span className='text-destructive font-semibold'>*</span>}
          </FieldLabel>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id={field.name}
                variant='outline'
                role='combobox'
                aria-expanded={open}
                aria-invalid={fieldState.invalid}
                disabled={disabled}
                className={cn(
                  'w-full justify-between px-3 text-left font-normal',
                  !field.value && 'text-muted-foreground',
                  fieldState.invalid && 'border-destructive focus-visible:ring-destructive'
                )}
              >
                {field.value ? format(field.value, 'PPP') : <span>{t(placeholder)}</span>}
                <CalendarIcon className='ml-2 h-4 w-4 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={field.value}
                onSelect={(date) => {
                  field.onChange(date?.toISOString())
                  setOpen(false)
                }}
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                captionLayout='dropdown'
              />
            </PopoverContent>
          </Popover>

          <div className='min-h-4'>
            {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
          </div>
        </Field>
      )}
    />
  )
}
