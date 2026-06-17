import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDateFormat } from '@/lib/date'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import { CalendarIcon, XCircleIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange, Matcher } from 'react-day-picker'
import { type Control, Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'

interface DateConstraints {
  minDate?: Date
  maxDate?: Date
  disabled?: Matcher | Matcher[]
}

export type IsoDateRangeValue = {
  from?: string | null
  to?: string | null
} | null

interface DateRangePickerFieldProps<T extends FieldValues> extends DateConstraints {
  name: Path<T>
  label: I18nKey
  control?: Control<T>
  placeholder?: I18nKey
  isRequired?: boolean
  isDisabled?: boolean
  className?: string
  displayError?: boolean
  closeOnComplete?: boolean
}

function parseAsDate(value: unknown): Date | undefined {
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toSelectedRange(value: unknown): DateRange {
  if (!value || typeof value !== 'object') return { from: undefined, to: undefined }

  const v = value as { from?: unknown; to?: unknown }
  return {
    from: parseAsDate(v.from),
    to: parseAsDate(v.to)
  }
}

function formatRangeLabel(range: DateRange, formatDate: (input: Date | string, preset?: string) => string) {
  const fromText = range.from ? formatDate(range.from, 'dateLong') : ''
  const toText = range.to ? formatDate(range.to, 'dateLong') : ''
  if (fromText && toText) return `${fromText} - ${toText}`
  return fromText || toText
}

export function DateRangePickerField<T extends FieldValues>({
  name,
  label,
  control: propsControl,
  placeholder = 'dataTable.filter.selectDateRange',
  isRequired = false,
  isDisabled = false,
  className,
  displayError = true,
  closeOnComplete = false,
  minDate = new Date('1900-01-01'),
  maxDate = new Date(new Date().getFullYear() + 10, 11, 31),
  disabled
}: DateRangePickerFieldProps<T>) {
  const { t } = useTenantTranslation()
  const { formatDate } = useDateFormat()
  const [open, setOpen] = useState(false)

  const context = useFormContext<T>()
  const control = propsControl || context?.control

  if (!control) {
    throw new Error('DateRangePickerField must be used within a FormProvider or passed a control prop')
  }

  const disabledDays: Matcher[] = useMemo(() => {
    return [
      ...(Array.isArray(disabled) ? disabled : disabled ? [disabled] : []),
      { before: minDate },
      { after: maxDate }
    ]
  }, [disabled, minDate, maxDate])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedRange = toSelectedRange(field.value)
        const hasValue = !!selectedRange.from || !!selectedRange.to

        return (
          <Field data-invalid={fieldState.invalid} className={cn('gap-1', className)}>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t(label)}
              {isRequired ? (
                <span className='text-destructive font-semibold'>*</span>
              ) : (
                <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
              )}
            </FieldLabel>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={field.name}
                  variant='outline'
                  role='combobox'
                  aria-expanded={open}
                  aria-invalid={fieldState.invalid}
                  disabled={isDisabled}
                  className={cn(
                    'w-full justify-between px-3 text-left font-normal',
                    !hasValue && 'text-muted-foreground',
                    fieldState.invalid && 'border-destructive focus-visible:ring-destructive'
                  )}
                >
                  <span className='flex items-center gap-2 truncate'>
                    <CalendarIcon className='opacity-50 size-4' />
                    {hasValue ? formatRangeLabel(selectedRange, formatDate) : <span>{t(placeholder)}</span>}
                  </span>

                  {hasValue && !isDisabled && (
                    <div
                      role='button'
                      tabIndex={0}
                      className='hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation()
                        field.onChange(null)
                      }}
                    >
                      <XCircleIcon className='size-4 opacity-50 hover:opacity-100' />
                      <span className='sr-only'>{t('common.button.clear')}</span>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                sideOffset={8}
                className='w-auto p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
                align='start'
              >
                <Calendar
                  mode='range'
                  selected={selectedRange}
                  onSelect={(range) => {
                    if (!range || (!range.from && !range.to)) {
                      field.onChange(null)
                      return
                    }

                    field.onChange({
                      from: range.from ? range.from.toISOString() : null,
                      to: range.to ? range.to.toISOString() : null
                    } satisfies NonNullable<IsoDateRangeValue>)

                    if (closeOnComplete && range.from && range.to) setOpen(false)
                  }}
                  disabled={disabledDays}
                  startMonth={minDate}
                  endMonth={maxDate}
                  captionLayout='dropdown'
                  defaultMonth={selectedRange.from ?? selectedRange.to ?? new Date()}
                />
              </PopoverContent>
            </Popover>

            {displayError && (
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            )}
          </Field>
        )
      }}
    />
  )
}
