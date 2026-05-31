import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useDateFormat } from '@/lib/date'
import { addDays } from 'date-fns'
import { XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SubtaskDeadlinePopoverProps {
  children: React.ReactNode
  deadline: string | null
  onSubmit: (deadline: string | null) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  triggerTooltip?: React.ReactNode
}

const minDate = new Date('1900-01-01')
const maxDate = new Date(new Date().getFullYear() + 10, 11, 31)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/

const parseIsoDate = (dateValue: string | null) => {
  if (!dateValue) return null
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export default function SubtaskDeadlinePopover({
  children,
  deadline,
  onSubmit,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  triggerTooltip
}: SubtaskDeadlinePopoverProps) {
  const { t } = useTranslation()
  const { formatDate, formatTime } = useDateFormat()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const [localDeadline, setLocalDeadline] = useState<string | null>(deadline)
  const [localEndTime, setLocalEndTime] = useState('')
  const [initialDeadline, setInitialDeadline] = useState<string | null>(deadline)
  const [initialEndTime, setInitialEndTime] = useState('')
  const [endTimeInvalid, setEndTimeInvalid] = useState(false)

  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  const { endDate, endTime } = useMemo(() => {
    const date = parseIsoDate(localDeadline)

    if (!date) {
      return { endDate: null, endTime: null }
    }

    return {
      endDate: formatDate(date, 'dateShort'),
      endTime: formatTime(date, 'HH:mm')
    }
  }, [localDeadline, formatDate, formatTime])

  const canSave = localDeadline !== initialDeadline || !!(localDeadline && localEndTime !== initialEndTime)
  const selectedDate = parseIsoDate(localDeadline) || undefined

  const validateTimeFormat = (time: string): boolean => {
    if (!time) {
      return true
    }
    return timeRegex.test(time)
  }

  const applyTimeToDate = (dateValue: string, timeValue: string): string => {
    const [hours, minutes] = timeValue.split(':').map(Number)
    const newDate = new Date(dateValue)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)
    return newDate.toISOString()
  }

  const createDateWithCurrentTime = (date: Date) => {
    const now = new Date()
    const nextDate = new Date(date)
    nextDate.setHours(now.getHours())
    nextDate.setMinutes(now.getMinutes())
    return nextDate.toISOString()
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return

    const previousDate = parseIsoDate(localDeadline)
    if (previousDate) {
      const newDate = new Date(date)
      newDate.setHours(previousDate.getHours())
      newDate.setMinutes(previousDate.getMinutes())
      setLocalDeadline(newDate.toISOString())
      return
    }

    setLocalDeadline(createDateWithCurrentTime(date))
  }

  const toggleEndDate = () => {
    if (localDeadline) {
      setLocalDeadline(null)
      return
    }

    setLocalDeadline(createDateWithCurrentTime(addDays(new Date(), 1)))
  }

  const handleSave = () => {
    setEndTimeInvalid(false)

    if (localDeadline && localEndTime && !validateTimeFormat(localEndTime)) {
      setEndTimeInvalid(true)
      return
    }

    setOpen(false)

    if (localDeadline && localEndTime && localEndTime !== endTime) {
      const nextDeadline = applyTimeToDate(localDeadline, localEndTime)
      const parsedDeadline = parseIsoDate(nextDeadline)
      const nextEndTime = parsedDeadline ? formatTime(parsedDeadline, 'HH:mm') : ''

      onSubmit(nextDeadline)
      setInitialDeadline(nextDeadline)
      setInitialEndTime(nextEndTime)
      setLocalDeadline(nextDeadline)
      setLocalEndTime(nextEndTime)
      return
    }

    const parsedDeadline = parseIsoDate(localDeadline)
    const nextEndTime = parsedDeadline ? formatTime(parsedDeadline, 'HH:mm') : ''

    onSubmit(localDeadline)
    setInitialDeadline(localDeadline)
    setInitialEndTime(nextEndTime)
    setLocalDeadline(localDeadline)
    setLocalEndTime(nextEndTime)
  }

  const handleRemove = () => {
    setLocalDeadline(null)
    onSubmit(null)
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)

    if (newOpen) {
      const parsedDeadline = parseIsoDate(deadline)
      const nextEndTime = parsedDeadline ? formatTime(parsedDeadline, 'HH:mm') : ''
      setInitialDeadline(deadline)
      setInitialEndTime(nextEndTime)
      setLocalDeadline(deadline)
      setLocalEndTime(nextEndTime)
      setEndTimeInvalid(false)
    }
  }

  return (
    <Popover modal open={open} onOpenChange={handleOpenChange}>
      {triggerTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild disabled={disabled}>
              {children}
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>{triggerTooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <PopoverTrigger asChild disabled={disabled}>
          {children}
        </PopoverTrigger>
      )}
      <PopoverContent
        side='bottom'
        align='start'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
        sideOffset={8}
      >
        <div className='p-4'>
          <div className='flex items-center justify-center relative mb-4'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('common.field.date')}</p>
            <XIcon
              className='size-4 absolute right-0 cursor-pointer'
              onClick={() => {
                setOpen(false)
              }}
            />
          </div>

          <Calendar
            mode='single'
            defaultMonth={selectedDate}
            selected={selectedDate}
            onSelect={(date) => handleCalendarSelect(date)}
            startMonth={minDate}
            endMonth={maxDate}
            captionLayout='dropdown'
            className='w-full p-0'
          />

          <div className='space-y-4 mt-2'>
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
                  value={localEndTime}
                  placeholder={t('common.ui.timeFormatPlaceholder')}
                  disabled={!endDate}
                  aria-invalid={endTimeInvalid}
                  onChange={(e) => {
                    setLocalEndTime(e.target.value)
                    setEndTimeInvalid(false)
                  }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Button className='w-full' onClick={handleSave} disabled={!canSave}>
                {t('common.button.save')}
              </Button>

              {deadline ? (
                <Button className='w-full' variant='outline' onClick={handleRemove}>
                  {t('common.button.remove')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
