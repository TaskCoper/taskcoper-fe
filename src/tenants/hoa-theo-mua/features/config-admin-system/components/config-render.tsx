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
import type { ConfigSystemItem } from '../types'

type Props = {
  config: ConfigSystemItem
}

type AddressMeta = { value: { city?: string; ward?: string; street?: string } }
type NumericMeta = { value: number; unit?: string; validations?: { min?: number; max?: number } }
type SelectMeta = { value: string | number; options?: Array<{ label: string; value: string | number }> }
type CheckboxMeta = { items?: string[]; options?: Array<{ label: string; value: string | number }> }
type SwitchMeta = { items?: Array<{ key: string; label: string; description?: string; value: boolean }> }
type DateMeta = { value: string }
type DateRangeMeta = { value: DateRange }
type TextMeta = { value: string; placeholder?: string }

function parseAsDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function fmt(date?: Date) {
  if (!date) return '...'
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function DateRangePicker({ config }: Props) {
  const meta = config.value as DateRangeMeta
  const raw = meta.value as { from?: unknown; to?: unknown }
  const [range, setRange] = useState<DateRange | undefined>({
    from: parseAsDate(raw?.from),
    to: parseAsDate(raw?.to)
  })

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
    case 'text': {
      const m = meta as TextMeta
      return <Input name={config.key} className='w-64' defaultValue={m.value} placeholder={m.placeholder} />
    }

    case 'number':
    case 'currency':
    case 'percentage': {
      const m = meta as NumericMeta
      if (m.unit) {
        return (
          <InputGroup className='w-64 border-border transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20'>
            <InputGroupInput
              name={config.key}
              type='number'
              defaultValue={m.value}
              min={m.validations?.min}
              max={m.validations?.max}
            />
            <InputGroupAddon align='inline-end' className='flex items-center justify-center'>
              <InputGroupText className='px-1.5 py-0.5 font-semibold'>{m.unit}</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        )
      }
      return (
        <Input
          name={config.key}
          type='number'
          className='w-64'
          defaultValue={m.value}
          min={m.validations?.min}
          max={m.validations?.max}
        />
      )
    }

    case 'select': {
      const m = meta as SelectMeta
      return (
        <Select name={config.key} defaultValue={String(m.value)}>
          <SelectTrigger className='w-64'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {m.options?.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    case 'address': {
      const m = meta as AddressMeta
      return (
        <div className='flex w-64 flex-col gap-2'>
          <Input name={`${config.key}.city`} defaultValue={m.value?.city} placeholder='Thành phố' />
          <Input name={`${config.key}.ward`} defaultValue={m.value?.ward} placeholder='Phường/Xã' />
          <Input name={`${config.key}.street`} defaultValue={m.value?.street} placeholder='Địa chỉ' />
        </div>
      )
    }

    case 'checkbox': {
      const m = meta as CheckboxMeta
      return (
        <div className='flex items-center gap-8'>
          {m.options?.map((option) => (
            <div key={option.value} className='flex items-center gap-2'>
              <Checkbox
                name={config.key}
                value={String(option.value)}
                id={`${config.key}-${option.value}`}
                defaultChecked={m.items?.includes(String(option.value))}
              />
              <label htmlFor={`${config.key}-${option.value}`} className='cursor-pointer'>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )
    }

    case 'switch-group': {
      const m = meta as SwitchMeta
      return (
        <div className='space-y-4'>
          {m.items?.map((item) => (
            <div key={item.key} className='flex items-center justify-between'>
              <div>
                <div className='font-medium'>{item.label}</div>
                {item.description && <div className='text-muted-foreground text-sm'>{item.description}</div>}
              </div>
              <Switch defaultChecked={item.value} />
            </div>
          ))}
        </div>
      )
    }

    case 'date': {
      const m = meta as DateMeta
      return <Input name={config.key} type='date' className='w-48' defaultValue={m.value} />
    }

    case 'dateRange':
      return <DateRangePicker config={config} />

    default:
      return null
  }
}
