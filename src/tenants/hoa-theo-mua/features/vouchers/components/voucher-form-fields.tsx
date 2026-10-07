import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { CalendarDays } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import type { DateRange } from 'react-day-picker'
import { displayDate } from './voucher-date-utils'

export function VoucherField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className='grid gap-1.5 text-sm'>
      <span className='text-xs font-medium'>{label}</span>
      {children}
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
  selected,
  onSelect
}: {
  startAt: string
  endAt: string
  selected?: DateRange
  onSelect: (range: DateRange | undefined) => void
}) {
  const { t } = useTenantTranslation()
  const label =
    startAt && endAt ? `${displayDate(startAt)} - ${displayDate(endAt)}` : t('configsPage.vouchers.datePlaceholder')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' className='justify-start font-normal'>
          <CalendarDays className='mr-2 size-4' />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar mode='range' selected={selected} onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  )
}
