import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { DAY_OF_WEEKS } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { type Control, Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface DayOfWeekFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  control?: Control<T>
  isRequired?: boolean
  isDisabled?: boolean
  isMulti?: boolean
  className?: string
  displayError?: boolean
}

export function DayOfWeekField<T extends FieldValues>({
  name,
  label,
  control: propsControl,
  isRequired = false,
  isDisabled = false,
  isMulti = true,
  className,
  displayError = true
}: DayOfWeekFieldProps<T>) {
  const { t } = useTranslation()

  const context = useFormContext<T>()
  const control = propsControl || context?.control

  if (!control) {
    throw new Error('DayOfWeekField must be used within a FormProvider or passed a control prop')
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={cn('gap-2', className)}>
          <FieldLabel htmlFor={field.name} className='gap-0.5 mb-1'>
            {t(label)}
            {isRequired ? (
              <span className='text-destructive font-semibold'>*</span>
            ) : (
              <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
            )}
          </FieldLabel>

          <div id={field.name} className='flex flex-wrap justify-center gap-3'>
            {DAY_OF_WEEKS.map((day) => {
              const currentValues = (
                Array.isArray(field.value) ? field.value : [field.value].filter((v) => v !== undefined && v !== null)
              ) as number[]
              const isSelected = currentValues.includes(day.value)
              const localizedLabel = t(`dayOfWeek.${day.label.toLowerCase()}`)

              return (
                <button
                  type='button'
                  key={day.id}
                  disabled={isDisabled}
                  title={localizedLabel}
                  onClick={() => {
                    if (isMulti) {
                      const newValue = isSelected
                        ? currentValues.filter((v: number) => v !== day.value)
                        : [...currentValues, day.value]
                      field.onChange(newValue)
                    } else {
                      field.onChange(isSelected ? null : day.value)
                    }
                  }}
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer',
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary border-dashed border-2'
                      : 'bg-muted border-border text-muted-foreground border-dashed border-2 hover:bg-muted/80',
                    isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <p className='text-sm tracking-wide font-semibold'>{localizedLabel.toUpperCase()}</p>
                </button>
              )
            })}
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
