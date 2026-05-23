import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { addDays, format } from 'date-fns'
import { XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SubtaskDeadlinePopoverProps {
  children: React.ReactNode
  deadline: string | null
  onSubmit: (deadline: string | null) => void
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  triggerTooltip?: React.ReactNode
}

const dateFormat = 'MM/dd/yyyy'
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
  onOpenChange,
  disabled = false,
  triggerTooltip
}: SubtaskDeadlinePopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [localDeadline, setLocalDeadline] = useState<string | null>(deadline)
  const [localEndTime, setLocalEndTime] = useState('')
  const [endTimeInvalid, setEndTimeInvalid] = useState(false)

  const { endDate, endTime } = useMemo(() => {
    const date = parseIsoDate(localDeadline)

    if (!date) {
      return { endDate: null, endTime: null }
    }

    return {
      endDate: format(date, dateFormat),
      endTime: format(date, 'HH:mm')
    }
  }, [localDeadline])

  const canSave = localDeadline !== deadline || !!(localDeadline && localEndTime && localEndTime !== endTime)
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

    if (localDeadline && localEndTime && localEndTime !== endTime) {
      onSubmit(applyTimeToDate(localDeadline, localEndTime))
      setOpen(false)
      onOpenChange?.(false)
      return
    }

    onSubmit(localDeadline)
    setOpen(false)
    onOpenChange?.(false)
  }

  const handleRemove = () => {
    setLocalDeadline(null)
    onSubmit(null)
    setOpen(false)
    onOpenChange?.(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)

    if (newOpen) {
      const parsedDeadline = parseIsoDate(deadline)
      setLocalDeadline(deadline)
      setLocalEndTime(parsedDeadline ? format(parsedDeadline, 'HH:mm') : '')
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
                onOpenChange?.(false)
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

            <Button className='w-full' onClick={handleSave} disabled={!canSave}>
              {t('common.button.save')}
            </Button>

            {deadline ? (
              <Button className='w-full' variant='secondary' onClick={handleRemove}>
                {t('common.button.remove')}
              </Button>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
