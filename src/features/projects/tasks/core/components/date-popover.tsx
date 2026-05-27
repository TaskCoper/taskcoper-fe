import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDateFormat } from '@/lib/date'
import { cn } from '@/shared/utils'
import { addDays } from 'date-fns'
import { XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useGetMyProjectPermissions } from '../../../roles/hooks/use-get-my-project-permissions'
import { minutesToReminder, reminderToMinutes, TaskReminder } from '../constants'

interface DatePopoverProps {
  children: React.ReactNode
  onSubmit: () => void
  onRemove: () => void
  disabled?: boolean
}

interface DateUpdates {
  startDate?: string | null
  endDate?: string | null
  announceBeforeMinutes?: number | null
}

const minDate = new Date('1900-01-01')
const maxDate = new Date(new Date().getFullYear() + 10, 11, 31)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/

export default function DatePopover({ children, onSubmit, onRemove, disabled = false }: DatePopoverProps) {
  const { t } = useTranslation()
  const { formatDate, formatTime } = useDateFormat()
  const [open, setOpen] = useState(false)
  const { identifier } = useParams<{ identifier: string }>()

  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canDelete = check('TASKS', 'canDelete')

  const [localStartTime, setLocalStartTime] = useState('')
  const [localEndTime, setLocalEndTime] = useState('')
  const [startTimeInvalid, setStartTimeInvalid] = useState(false)
  const [endTimeInvalid, setEndTimeInvalid] = useState(false)

  const { watch, getValues, setValue } = useFormContext()
  const startDateValue = watch('startDate')
  const endDateValue = watch('endDate')
  const announceBeforeMinutes = watch('announceBeforeMinutes')

  const reminderType = useMemo(() => {
    if (announceBeforeMinutes == null) {
      return 'NONE'
    }
    if (announceBeforeMinutes === 0) {
      return 'EXPIRED_DATE'
    }
    return minutesToReminder(announceBeforeMinutes)
  }, [announceBeforeMinutes])

  const { startDate, startTime, endDate, endTime } = useMemo(() => {
    let startDate = null
    let startTime = null
    let endDate = null
    let endTime = null

    if (startDateValue) {
      const date = new Date(startDateValue)
      startDate = formatDate(date, 'dateShort')
      startTime = formatTime(date, 'HH:mm')
    }

    if (endDateValue) {
      const date = new Date(endDateValue)
      endDate = formatDate(date, 'dateShort')
      endTime = formatTime(date, 'HH:mm')
    }

    return { startDate, startTime, endDate, endTime }
  }, [startDateValue, endDateValue, formatDate, formatTime])

  const dateRange = useMemo(() => {
    return {
      from: startDateValue ? new Date(startDateValue) : undefined,
      to: endDateValue ? new Date(endDateValue) : undefined
    }
  }, [startDateValue, endDateValue])

  const isDateRange = !!(startDate && endDate && startTime && endTime)
  const hasStartTimeChange = !!(startDate && localStartTime.trim() !== (startTime || ''))
  const hasEndTimeChange = !!(endDate && localEndTime.trim() !== (endTime || ''))
  const canSave = hasStartTimeChange || hasEndTimeChange

  const getDateMs = (value?: string | null) => {
    if (!value) {
      return null
    }

    const ms = new Date(value).getTime()
    return Number.isNaN(ms) ? null : ms
  }

  const handleUpdateDates = (updates: DateUpdates) => {
    const normalizedUpdates: DateUpdates = { ...updates }
    const currentStartDate = (getValues('startDate') as string | null) || null
    const currentEndDate = (getValues('endDate') as string | null) || null
    const nextStartDate = ('startDate' in normalizedUpdates ? normalizedUpdates.startDate : currentStartDate) || null
    const nextEndDate = ('endDate' in normalizedUpdates ? normalizedUpdates.endDate : currentEndDate) || null

    if (nextStartDate && nextEndDate) {
      const startMs = getDateMs(nextStartDate)
      const endMs = getDateMs(nextEndDate)

      if (startMs != null && endMs != null && startMs > endMs) {
        if ('startDate' in normalizedUpdates && !('endDate' in normalizedUpdates)) {
          normalizedUpdates.startDate = nextEndDate
        } else if ('endDate' in normalizedUpdates && !('startDate' in normalizedUpdates)) {
          normalizedUpdates.endDate = nextStartDate
        } else {
          normalizedUpdates.endDate = nextStartDate
        }
      }
    }

    if ('startDate' in normalizedUpdates) {
      setValue('startDate', normalizedUpdates.startDate, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      })
    }
    if ('endDate' in normalizedUpdates) {
      setValue('endDate', normalizedUpdates.endDate, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      })
    }
    if ('announceBeforeMinutes' in normalizedUpdates) {
      setValue('announceBeforeMinutes', normalizedUpdates.announceBeforeMinutes, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      })
    }
  }

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | Date | undefined) => {
    if (!range) return

    if (range instanceof Date) {
      // Single date mode selection
      if (startDateValue) {
        const newDate = new Date(range)
        newDate.setHours(new Date().getHours())
        newDate.setMinutes(new Date().getMinutes())
        handleUpdateDates({ startDate: newDate.toISOString(), endDate: null })
      } else {
        const newDate = new Date(range)
        newDate.setHours(new Date().getHours())
        newDate.setMinutes(new Date().getMinutes())
        handleUpdateDates({ endDate: newDate.toISOString() })
      }
      return
    }

    // Range mode selection
    const start = range.from
    const end = range.to

    const updates: DateUpdates = {}
    if (start) {
      const newStart = new Date(start)
      newStart.setHours(new Date().getHours())
      newStart.setMinutes(new Date().getMinutes())
      updates.startDate = newStart.toISOString()
    } else {
      updates.startDate = null
    }

    if (end) {
      const newEnd = new Date(end)
      newEnd.setHours(new Date().getHours())
      newEnd.setMinutes(new Date().getMinutes())
      updates.endDate = newEnd.toISOString()
    } else {
      updates.endDate = null
    }

    handleUpdateDates(updates)
  }

  const toggleStartDate = () => {
    if (startDateValue) {
      handleUpdateDates({ startDate: null })
    } else {
      const now = new Date()
      const endDateMs = getDateMs(endDateValue)
      const date = endDateMs != null && now.getTime() > endDateMs ? new Date(endDateMs) : now
      handleUpdateDates({ startDate: date.toISOString() })
    }
  }

  const toggleEndDate = () => {
    if (endDateValue) {
      handleUpdateDates({ endDate: null })
    } else {
      const tomorrow = addDays(new Date(), 1)
      const startDateMs = getDateMs(startDateValue)
      const date = startDateMs != null && tomorrow.getTime() < startDateMs ? new Date(startDateMs) : tomorrow
      handleUpdateDates({ endDate: date.toISOString() })
    }
  }

  const validateTimeFormat = (time: string): boolean => {
    const normalizedTime = time.trim()
    if (!normalizedTime) {
      return true
    }
    return timeRegex.test(normalizedTime)
  }

  const applyTimeToDate = (dateValue: string, timeValue: string): string => {
    const [hours, minutes] = timeValue.trim().split(':').map(Number)
    const newDate = new Date(dateValue)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)
    return newDate.toISOString()
  }

  const resolveTimeInput = (timeValue: string): string => {
    const normalizedTime = timeValue.trim()
    if (normalizedTime) {
      return normalizedTime
    }
    return formatTime(new Date(), 'HH:mm')
  }

  const handleRemove = () => {
    setValue('startDate', null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    setValue('endDate', null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    setValue('announceBeforeMinutes', null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    onRemove()
    setOpen(false)
  }

  const handleSave = () => {
    setStartTimeInvalid(false)
    setEndTimeInvalid(false)

    if (startDate && localStartTime && !validateTimeFormat(localStartTime)) {
      setStartTimeInvalid(true)
      return
    }

    if (endDate && localEndTime && !validateTimeFormat(localEndTime)) {
      setEndTimeInvalid(true)
      return
    }

    const updates: DateUpdates = {}
    let nextStartDate: string | null = startDateValue || null
    let nextEndDate: string | null = endDateValue || null
    const nextStartTime = startDate ? resolveTimeInput(localStartTime) : null
    const nextEndTime = endDate ? resolveTimeInput(localEndTime) : null

    if (startDate && nextStartTime && !localStartTime.trim()) {
      setLocalStartTime(nextStartTime)
    }

    if (endDate && nextEndTime && !localEndTime.trim()) {
      setLocalEndTime(nextEndTime)
    }

    if (startDate && startDateValue && nextStartTime) {
      if (nextStartTime !== startTime) {
        const updatedStartDate = applyTimeToDate(startDateValue, nextStartTime)
        updates.startDate = updatedStartDate
        nextStartDate = updatedStartDate
      }
    }

    if (endDate && endDateValue && nextEndTime) {
      if (nextEndTime !== endTime) {
        const updatedEndDate = applyTimeToDate(endDateValue, nextEndTime)
        updates.endDate = updatedEndDate
        nextEndDate = updatedEndDate
      }
    }

    if (nextStartDate && nextEndDate) {
      const startMs = getDateMs(nextStartDate)
      const endMs = getDateMs(nextEndDate)

      if (startMs != null && endMs != null && startMs > endMs) {
        setStartTimeInvalid(true)
        setEndTimeInvalid(true)
        return
      }
    }

    if ('startDate' in updates || 'endDate' in updates) {
      handleUpdateDates(updates)
    }

    onSubmit()
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setLocalStartTime(startTime || '')
      setLocalEndTime(endTime || '')
      setStartTimeInvalid(false)
      setEndTimeInvalid(false)
    }
  }

  return (
    <Popover modal open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side='bottom'
        align='start'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
        sideOffset={8}
      >
        <div className='p-4'>
          <div className='flex items-center justify-center relative mb-4'>
            <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('common.field.date')}</p>
            <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={() => setOpen(false)} />
          </div>

          {isDateRange ? (
            <Calendar
              mode='range'
              defaultMonth={dateRange?.to || dateRange?.from}
              selected={dateRange}
              onSelect={(range) => handleCalendarSelect(range)}
              startMonth={minDate}
              endMonth={maxDate}
              captionLayout='dropdown'
              className='w-full p-0'
            />
          ) : (
            <Calendar
              mode='single'
              defaultMonth={dateRange?.to || dateRange?.from}
              selected={dateRange?.from || dateRange?.to}
              onSelect={(date) => handleCalendarSelect(date)}
              startMonth={minDate}
              endMonth={maxDate}
              captionLayout='dropdown'
              className='w-full p-0'
            />
          )}

          <div className='space-y-2'>
            <div>
              <p className='font-semibold text-xs py-1'>{t('common.field.startDate')}</p>
              <div className='flex items-center gap-2'>
                <Checkbox checked={!!(startDate && startTime)} onClick={toggleStartDate} />
                <Input
                  className='w-28'
                  value={startDate || t('task.date.notSetDate')}
                  disabled={!startDate}
                  readOnly={!!startDate}
                />
                <Input
                  className='w-28'
                  value={localStartTime}
                  placeholder={t('common.ui.timeFormatPlaceholder')}
                  disabled={!startDate}
                  aria-invalid={startTimeInvalid}
                  onChange={(e) => {
                    setLocalStartTime(e.target.value)
                    setStartTimeInvalid(false)
                  }}
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

            <div>
              <p className='font-semibold text-xs py-1'>{t('task.date.reminderSetting')}</p>
              <Select
                onValueChange={(value) => {
                  const reminder = value as keyof typeof TaskReminder
                  if (reminder === 'NONE') {
                    handleUpdateDates({ announceBeforeMinutes: null })
                    return
                  }

                  const minutes = reminderToMinutes(reminder)
                  handleUpdateDates({ announceBeforeMinutes: minutes })
                }}
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

            <Button className='w-full' onClick={handleSave} disabled={!canSave}>
              {t('common.button.save')}
            </Button>
            {canDelete ? (
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
