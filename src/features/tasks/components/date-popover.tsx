import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/shared/utils'
import { addDays, format, parse } from 'date-fns'
import { XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TaskReminder } from '../constants'

interface DatePopoverProps {
  children: React.ReactNode
}

const dateFormat = 'MM/dd/yyyy'
const defaultStartDate = format(new Date(), dateFormat)
const defaultEndDate = format(addDays(new Date(), 1), dateFormat)
const defaultEndTime = format(new Date(), 'H:mm')

export default function DatePopover({ children }: DatePopoverProps) {
  const { t } = useTranslation()
  const [reminderType, setReminderType] = useState<keyof typeof TaskReminder>('NONE')
  const [startDate, setStartDate] = useState<string | null>(defaultStartDate)
  const [endDate, setEndDate] = useState<string | null>(defaultEndDate)
  const [endTime, setEndTime] = useState<string | null>(defaultEndTime)
  const [open, setOpen] = useState(false)

  const dateRange = useMemo(() => {
    if (startDate && endDate)
      return { from: parse(startDate, dateFormat, new Date()), to: parse(endDate, dateFormat, new Date()) }
    if (endDate) return { from: undefined, to: parse(endDate, dateFormat, new Date()) }
    if (startDate) return { from: parse(startDate, dateFormat, new Date()), to: undefined }

    return { from: undefined, to: undefined }
  }, [startDate, endDate])

  const isDateRange = !!(startDate && endDate && endTime)

  const toggleStartDate = () => {
    setStartDate(startDate ? null : defaultStartDate)
  }

  const toggleEndDate = () => {
    setEndDate(endDate ? null : defaultEndDate)
    setEndTime(endTime ? null : defaultEndTime)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side='bottom' align='start' className='p-0' onInteractOutside={handleClose} sideOffset={8}>
        <div className='p-4'>
          <div className='flex items-center justify-center relative mb-4'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('common.field.date')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={handleClose} />
          </div>

          {isDateRange ? (
            <Calendar
              mode='range'
              defaultMonth={dateRange?.to || dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                setStartDate(range?.from ? format(range.from, dateFormat) : null)
                setEndDate(range?.to ? format(range.to, dateFormat) : null)
                setEndTime(format(new Date(), 'H:mm'))
              }}
              captionLayout='dropdown'
              className='w-full p-0'
            />
          ) : (
            <Calendar
              mode='single'
              defaultMonth={dateRange?.to || dateRange?.from}
              selected={dateRange?.from || dateRange?.to}
              onSelect={(date) => {
                if (dateRange?.from) {
                  setStartDate(date ? format(date, dateFormat) : null)
                  setEndDate(null)
                  setEndTime(null)
                } else {
                  setStartDate(null)
                  setEndDate(date ? format(date, dateFormat) : null)
                  setEndTime(format(new Date(), 'H:mm'))
                }
              }}
              captionLayout='dropdown'
              className='w-full p-0'
            />
          )}

          <div className='space-y-2'>
            <div>
              <p className='font-semibold text-xs py-1'>{t('common.field.startDate')}</p>
              <div className='flex items-center gap-2'>
                <Checkbox checked={!!startDate} onClick={toggleStartDate} />
                <Input
                  className='w-28'
                  value={startDate || t('task.date.notSetDate')}
                  disabled={!startDate}
                  readOnly={!!startDate}
                />
              </div>
            </div>

            <div>
              <p className='font-semibold text-xs py-1'>{t('common.field.endDate')}</p>
              <div className='flex items-center gap-2'>
                <Checkbox checked={!!(endDate && endTime)} onClick={toggleEndDate} />
                <Input
                  className='w-28'
                  value={endDate || t('task.date.notSetDate')}
                  disabled={!endDate}
                  readOnly={!!endDate}
                />
                <Input
                  className='w-28'
                  value={endTime || t('task.date.notSetTime')}
                  disabled={!endTime}
                  readOnly={!!endTime}
                />
              </div>
            </div>

            <div>
              <p className='font-semibold text-xs py-1'>{t('task.date.reminderSetting')}</p>
              <Select
                onValueChange={(value) => setReminderType(value as keyof typeof TaskReminder)}
                value={reminderType}
              >
                <SelectTrigger className={cn('w-full')}>
                  <SelectValue placeholder={t('task.date.selectReminderTime')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TaskReminder).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {t(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className='text-xs text-muted-foreground my-2'>{t('task.date.reminderDescription')}</p>
            </div>

            <Button className='w-full'>{t('common.button.save')}</Button>
            <Button className='w-full' variant='secondary'>
              {t('common.button.remove')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
