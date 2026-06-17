import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { type DateRange } from 'react-day-picker'
import type { configs } from '../config/config.system'

type Props = {
  config: (typeof configs)[number]
}

function fmt(date?: Date) {
  if (!date) return '...'
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function DateRangePicker({ config }: Props) {
  const meta = config.value as Extract<(typeof configs)[number]['value'], { inputType: 'dateRange' }>
  const [range, setRange] = useState<DateRange | undefined>(meta.value as DateRange)

  const label = range?.from
    ? range.to
      ? `${fmt(range.from)} - ${fmt(range.to)}`
      : `${fmt(range.from)} - ...`
    : 'Chọn khoảng thời gian'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='w-72 justify-start font-normal'>
          <CalendarIcon className='size-4' />
          <span className={range?.from ? '' : 'text-muted-foreground'}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='end'>
        <Calendar mode='range' selected={range} onSelect={setRange} numberOfMonths={2} defaultMonth={range?.from} />
      </PopoverContent>
      {range?.from && <input type='hidden' name={`${config.key}.from`} value={range.from.toISOString()} />}
      {range?.to && <input type='hidden' name={`${config.key}.to`} value={range.to.toISOString()} />}
    </Popover>
  )
}

export function ConfigRenderer({ config }: Props) {
  const meta = config.value

  switch (meta.inputType) {
    case 'text':
      return (
        <Input
          name={config.key}
          className='w-64'
          defaultValue={meta.value}
          placeholder={'placeholder' in meta ? (meta.placeholder as string) : undefined}
        />
      )

    case 'number':
    case 'currency':
    case 'percentage': {
      const unit = 'unit' in meta ? (meta.unit as string) : undefined
      const min = meta.validations?.min
      const max = meta.validations?.max
      if (unit) {
        return (
          <InputGroup className='w-64 border-border transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20'>
            <InputGroupInput name={config.key} type='number' defaultValue={meta.value} min={min} max={max} />
            <InputGroupAddon align='inline-end' className='flex items-center justify-center'>
              <InputGroupText className='px-1.5 py-0.5 font-semibold'>{unit}</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        )
      }
      return <Input name={config.key} type='number' className='w-64' defaultValue={meta.value} min={min} max={max} />
    }

    case 'select':
      return (
        <Select name={config.key} defaultValue={String(meta.value)}>
          <SelectTrigger className='w-64'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {meta.options?.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'address':
      return (
        <div className='flex w-64 flex-col gap-2'>
          <Input name={`${config.key}.city`} defaultValue={meta.value?.city} placeholder='Thành phố' />
          <Input name={`${config.key}.ward`} defaultValue={meta.value?.ward} placeholder='Phường/Xã' />
          <Input name={`${config.key}.street`} defaultValue={meta.value?.street} placeholder='Địa chỉ' />
        </div>
      )

    case 'checkbox':
      return (
        <div className='flex items-center gap-8'>
          {meta.options?.map((option) => (
            <div key={option.value} className='flex items-center gap-2'>
              <Checkbox
                name={config.key}
                value={String(option.value)}
                id={`${config.key}-${option.value}`}
                defaultChecked={meta.items?.includes(option.value?.toString())}
              />
              <label htmlFor={`${config.key}-${option.value}`} className='cursor-pointer'>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )

    case 'switch-group':
      return (
        <div className='space-y-4'>
          {meta.items?.map((item) => (
            <div key={item.key} className='flex items-center justify-between'>
              <div>
                <div className='font-medium'>{item.label}</div>
                <div className='text-muted-foreground text-sm'>{item.description}</div>
              </div>
              <Switch defaultChecked={item.value} />
            </div>
          ))}
        </div>
      )

    case 'date':
      return <Input name={config.key} type='date' className='w-48' defaultValue={meta.value} />

    case 'dateRange':
      return <DateRangePicker config={config} />

    default:
      return null
  }
}
