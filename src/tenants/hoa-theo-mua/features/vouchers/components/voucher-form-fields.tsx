import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TimeInputField } from '@/components/time-input-field'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import { CalendarDays } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { isValid, parseISO } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { displayDate, displayDateTime } from './voucher-date-utils'

export function VoucherField({
  label,
  error,
  className,
  children
}: {
  label: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={cn('grid gap-1.5 text-sm', className)}>
      <span className='text-xs font-medium'>{label}</span>
      {children}
      {error && <span className='text-xs text-destructive'>{error}</span>}
    </label>
  )
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

export function VoucherDateField({
  value,
  selected,
  onSelect
}: {
  value: string
  selected?: DateRange
  onSelect: (range: DateRange | undefined) => void
}) {
  const { t } = useTenantTranslation()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' className='justify-start font-normal'>
          <CalendarDays className='mr-2 size-4' />
          {value ? displayDate(value) : t('configsPage.vouchers.datePlaceholder')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar mode='range' selected={selected} onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  )
}

export function VoucherDateRangeField({
  startAt,
  endAt,
  onSelect,
  startTime,
  endTime,
  onTimeChange
}: {
  startAt: string
  endAt: string
  onSelect: (range: DateRange | undefined) => void
  startTime: string
  endTime: string
  onTimeChange: (field: 'start' | 'end', value: string) => void
}) {
  const { t } = useTenantTranslation()
  const methods = useForm({ defaultValues: { startTime, endTime } })
  const currentStartTime = useWatch({ control: methods.control, name: 'startTime' })
  const currentEndTime = useWatch({ control: methods.control, name: 'endTime' })

  useEffect(() => {
    if (currentStartTime !== startTime) onTimeChange('start', currentStartTime)
  }, [currentStartTime, onTimeChange, startTime])

  useEffect(() => {
    if (currentEndTime !== endTime) onTimeChange('end', currentEndTime)
  }, [currentEndTime, endTime, onTimeChange])

  const startDate = parseISO(startAt)
  const endDate = parseISO(endAt)

  const renderPicker = (field: 'start' | 'end') => {
    const isStart = field === 'start'
    const value = isStart ? startAt : endAt
    const date = isStart ? startDate : endDate
    const label = isStart ? t('configsPage.vouchers.startsAt') : t('configsPage.vouchers.expiresAt')

    return (
      <div className='grid gap-1.5'>
        <span className='text-xs font-medium'>{label}</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button type='button' variant='outline' className='justify-start font-normal'>
              <CalendarDays className='mr-2 size-4' />
              {value ? displayDateTime(value) : t('configsPage.vouchers.datePlaceholder')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto space-y-3 p-3'>
            <Calendar
              mode='single'
              selected={isValid(date) ? date : undefined}
              onSelect={(next) =>
                onSelect({
                  from: isStart ? next : isValid(startDate) ? startDate : undefined,
                  to: isStart ? (isValid(endDate) ? endDate : undefined) : next
                })
              }
            />
            <div className='border-t pt-3'>
              <TimeInputField
                name={isStart ? 'startTime' : 'endTime'}
                label={(isStart ? 'configsPage.vouchers.startTime' : 'configsPage.vouchers.endTime') as I18nKey}
                control={methods.control}
                isRequired
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className='grid gap-3 sm:grid-cols-2'>
      {renderPicker('start')}
      {renderPicker('end')}
    </div>
  )
}
