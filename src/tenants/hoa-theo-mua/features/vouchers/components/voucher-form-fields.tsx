import { DatePickerField } from '@/components/date-picker-field'
import { TimeInputField } from '@/components/time-input-field'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { SaveIcon } from 'lucide-react'
import type { ChangeEvent, ComponentProps, ReactNode } from 'react'
import { type Control, Controller, type FieldValues, type Path, useWatch } from 'react-hook-form'

export type VoucherValidityValues = {
  startDate: string | null
  startTime: string
  endDate: string | null
  endTime: string
}

interface VoucherFieldFrameProps {
  label: string
  htmlFor?: string
  isRequired?: boolean
  invalid?: boolean
  error?: string
  className?: string
  children: ReactNode
}

function VoucherFieldFrame({
  label,
  htmlFor,
  isRequired = false,
  invalid = false,
  error,
  className,
  children
}: VoucherFieldFrameProps) {
  const { t } = useTenantTranslation()

  return (
    <Field data-invalid={invalid} className={cn('gap-1', className)}>
      <FieldLabel htmlFor={htmlFor} className='gap-0.5'>
        {label}
        {isRequired ? (
          <span className='font-semibold text-destructive'>*</span>
        ) : (
          <span className='text-xs text-muted-foreground'>({t('common.ui.optional')})</span>
        )}
      </FieldLabel>
      {children}
      <div className='min-h-4'>
        {invalid && error && <FieldError className='text-xs' errors={[{ message: error }]} />}
      </div>
    </Field>
  )
}

interface VoucherControlledFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label: string
  isRequired?: boolean
  disabled?: boolean
  className?: string
}

export function VoucherInputWithSuffix({
  suffix,
  className,
  ...props
}: ComponentProps<typeof Input> & { suffix: string }) {
  return (
    <div className='relative'>
      <Input {...props} className={className ? `pr-10 ${className}` : 'pr-10'} />
      <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center border-l px-3 text-sm text-muted-foreground'>
        {suffix}
      </span>
    </div>
  )
}

export function VoucherStaticSelectField({
  id,
  label,
  value,
  options,
  isRequired,
  className,
  onValueChange
}: {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  isRequired?: boolean
  className?: string
  onValueChange: (value: string) => void
}) {
  return (
    <VoucherFieldFrame label={label} htmlFor={id} isRequired={isRequired} className={className}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className='w-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </VoucherFieldFrame>
  )
}

export function VoucherTextField<T extends FieldValues>({
  name,
  control,
  label,
  isRequired,
  disabled,
  className,
  placeholder,
  autoFocus,
  toUpperCase
}: VoucherControlledFieldProps<T> & { placeholder?: string; autoFocus?: boolean; toUpperCase?: boolean }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <VoucherFieldFrame
          label={label}
          htmlFor={field.name}
          isRequired={isRequired}
          invalid={fieldState.invalid}
          error={fieldState.error?.message}
          className={className}
        >
          <Input
            {...field}
            id={field.name}
            value={field.value ?? ''}
            aria-invalid={fieldState.invalid}
            autoComplete='off'
            autoFocus={autoFocus}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(event) => field.onChange(toUpperCase ? event.target.value.toUpperCase() : event.target.value)}
          />
        </VoucherFieldFrame>
      )}
    />
  )
}

export function VoucherTextareaField<T extends FieldValues>({
  name,
  control,
  label,
  isRequired,
  disabled,
  className,
  placeholder
}: VoucherControlledFieldProps<T> & { placeholder?: string }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <VoucherFieldFrame
          label={label}
          htmlFor={field.name}
          isRequired={isRequired}
          invalid={fieldState.invalid}
          error={fieldState.error?.message}
          className={className}
        >
          <Textarea
            {...field}
            id={field.name}
            value={field.value ?? ''}
            aria-invalid={fieldState.invalid}
            disabled={disabled}
            placeholder={placeholder}
            rows={3}
          />
        </VoucherFieldFrame>
      )}
    />
  )
}

export function VoucherNumberField<T extends FieldValues>({
  name,
  control,
  label,
  isRequired,
  disabled,
  className,
  placeholder,
  suffix,
  min,
  max,
  step,
  nullable
}: VoucherControlledFieldProps<T> & {
  placeholder?: string
  suffix?: string
  min?: number
  max?: number
  step?: number | 'any'
  nullable?: boolean
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = field.value as number | null | undefined
        const inputProps = {
          ...field,
          id: field.name,
          type: 'number',
          min,
          max,
          step,
          value: value === null || value === undefined || Number.isNaN(value) ? '' : value,
          'aria-invalid': fieldState.invalid,
          disabled,
          placeholder,
          onChange: (event: ChangeEvent<HTMLInputElement>) => {
            const raw = event.target.value
            field.onChange(raw === '' ? (nullable ? null : Number.NaN) : Number(raw))
          }
        }

        return (
          <VoucherFieldFrame
            label={label}
            htmlFor={field.name}
            isRequired={isRequired}
            invalid={fieldState.invalid}
            error={fieldState.error?.message}
            className={className}
          >
            {suffix ? <VoucherInputWithSuffix {...inputProps} suffix={suffix} /> : <Input {...inputProps} />}
          </VoucherFieldFrame>
        )
      }}
    />
  )
}

export function VoucherSelectField<T extends FieldValues>({
  name,
  control,
  label,
  isRequired,
  disabled,
  className,
  options,
  onValueChange
}: VoucherControlledFieldProps<T> & {
  options: { value: string; label: string }[]
  onValueChange?: (value: string) => void
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <VoucherFieldFrame
          label={label}
          htmlFor={field.name}
          isRequired={isRequired}
          invalid={fieldState.invalid}
          error={fieldState.error?.message}
          className={className}
        >
          <Select
            value={field.value}
            disabled={disabled}
            onValueChange={(value) => {
              field.onChange(value)
              onValueChange?.(value)
            }}
          >
            <SelectTrigger id={field.name} className='w-full' aria-invalid={fieldState.invalid} onBlur={field.onBlur}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </VoucherFieldFrame>
      )}
    />
  )
}

export function VoucherValidityFields<T extends VoucherValidityValues>({ control }: { control: Control<T> }) {
  const endDate = useWatch({ control, name: 'endDate' as Path<T> }) as string | null

  return (
    <div className='grid grid-cols-2 gap-3 sm:col-span-2'>
      <DatePickerField
        control={control}
        name={'startDate' as Path<T>}
        label={'configsPage.vouchers.startsAt' as I18nKey}
        isRequired
      />
      <TimeInputField
        control={control}
        name={'startTime' as Path<T>}
        label={'configsPage.vouchers.startTime' as I18nKey}
        isRequired
      />
      <DatePickerField
        control={control}
        name={'endDate' as Path<T>}
        label={'configsPage.vouchers.expiresAt' as I18nKey}
      />
      <TimeInputField
        control={control}
        name={'endTime' as Path<T>}
        label={'configsPage.vouchers.endTime' as I18nKey}
        isDisabled={!endDate}
      />
    </div>
  )
}

export function VoucherFormFooter({
  label,
  pending,
  disabled,
  onCancel
}: {
  label: string
  pending: boolean
  disabled?: boolean
  onCancel: () => void
}) {
  const { t } = useTenantTranslation()

  return (
    <DialogFooter className='sm:col-span-2'>
      <Button type='button' variant='outline' disabled={pending} onClick={onCancel}>
        {t('common.button.cancel')}
      </Button>
      <Button type='submit' disabled={pending || disabled}>
        {pending ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
        {pending ? t('configsPage.dialog.saving') : label}
      </Button>
    </DialogFooter>
  )
}
