import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMentorMeetings } from '@/features/meetings/hooks/use-get-mentor-meetings'
import { formatTimeRange, groupSlotsByDay } from '@/features/meetings/utils'
import { useDateFormat } from '@/lib/date'
import { DAY_OF_WEEKS } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { addWeeks, endOfWeek, getISOWeek, getYear, startOfWeek, subWeeks } from 'date-fns'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetSchedule } from '../hooks/use-get-schedule'

interface MentorScheduleProps {
  userId: string
}

export default function MentorSchedule({ userId }: MentorScheduleProps) {
  const { formatDate } = useDateFormat()
  const today = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(getYear(today))
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(today, { weekStartsOn: 1 }))

  const currentYear = getYear(today)

  const yearOptions = useMemo(() => {
    return [currentYear - 1, currentYear, currentYear + 1]
  }, [currentYear])

  const weekOptions = useMemo(() => {
    const weeks: { value: string; label: string; start: Date }[] = []
    let weekStart = startOfWeek(new Date(selectedYear, 0, 4), { weekStartsOn: 1 })

    while (getYear(weekStart) <= selectedYear) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      if (getYear(weekStart) === selectedYear || getYear(weekEnd) === selectedYear) {
        weeks.push({
          value: weekStart.toISOString(),
          label: `${formatDate(weekStart, 'dayMonth')} - ${formatDate(weekEnd, 'dayMonth')}`,
          start: weekStart
        })
      }
      weekStart = addWeeks(weekStart, 1)
      if (weeks.length > 53) break
    }
    return weeks
  }, [selectedYear, formatDate])

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

  const { schedule: scheduleData, isLoadingSchedule } = useGetSchedule({
    userId,
    activeFrom: currentWeekStart.toISOString(),
    activeTo: weekEnd.toISOString()
  })

  const { mentorMeetings, isLoadingMentorMeetings } = useGetMentorMeetings({
    mentorId: userId,
    activeFrom: currentWeekStart.toISOString(),
    activeTo: weekEnd.toISOString()
  })

  const schedule = useMemo(
    () => groupSlotsByDay(scheduleData.value.items, currentWeekStart),
    [scheduleData, currentWeekStart]
  )

  const bookedSchedule = useMemo(
    () => groupSlotsByDay(mentorMeetings.value.items, currentWeekStart),
    [mentorMeetings, currentWeekStart]
  )

  const currentWeekLabel = useMemo(
    () => `${formatDate(currentWeekStart, 'dayMonth')} - ${formatDate(weekEnd, 'dayMonth')}`,
    [currentWeekStart, weekEnd, formatDate]
  )

  // const [dialogOpen, setDialogOpen] = useState(false)
  // const [initialSlot, setInitialSlot] = useState<ScheduleSlot | undefined>()
  // const [initialDate, setInitialDate] = useState<Date | undefined>()

  // const handleOpenDialog = (slot: ScheduleSlot, date: Date) => {
  //   setInitialSlot(slot)
  //   setInitialDate(date)
  //   setDialogOpen(true)
  // }

  const { t } = useTranslation()

  const handlePrevWeek = () => {
    const prev = subWeeks(currentWeekStart, 1)
    setCurrentWeekStart(prev)
    setSelectedYear(getYear(prev))
  }

  const handleNextWeek = () => {
    const next = addWeeks(currentWeekStart, 1)
    setCurrentWeekStart(next)
    setSelectedYear(getYear(next))
  }

  const handleYearChange = (year: string) => {
    const y = parseInt(year)
    setSelectedYear(y)
    const newStart = startOfWeek(new Date(y, 0, 4), { weekStartsOn: 1 })
    setCurrentWeekStart(newStart)
  }

  const handleWeekChange = (isoString: string) => {
    const newStart = new Date(isoString)
    setCurrentWeekStart(newStart)
  }

  const isToday = (date: Date) => {
    const t = new Date()
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear()
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 1 }))
    setSelectedYear(getYear(now))
  }

  return (
    <Card
      className={cn('p-4 shadow-none rounded-lg bg-muted/20', scheduleData.value.totalCount === 0 ? 'gap-4' : 'gap-6')}
    >
      {scheduleData?.value?.totalCount > 0 ? (
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <CalendarDaysIcon className='size-4' />
              <p className='text-sm font-medium'>{t('meeting.mentorSchedule.title')}</p>
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('meeting.mentorSchedule.weekLabel', {
                week: getISOWeek(currentWeekStart),
                month: formatDate(currentWeekStart, 'monthYear')
              })}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button size='sm' variant='outline' onClick={handleToday}>
              {t('schedule.timeline.today')}
            </Button>

            <div className='flex items-center gap-1'>
              <Button size='icon-sm' variant='outline' onClick={handlePrevWeek}>
                <ChevronLeftIcon />
              </Button>

              <Select value={currentWeekStart.toISOString()} onValueChange={handleWeekChange}>
                <SelectTrigger size='sm' className='w-35 text-sm font-medium bg-background'>
                  <SelectValue>{currentWeekLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent
                  side='bottom'
                  sideOffset={8}
                  className='max-h-[calc(var(--radix-select-content-available-height)-8px)]'
                >
                  {weekOptions.map((w) => (
                    <SelectItem key={w.value} value={w.value}>
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button size='icon-sm' variant='outline' onClick={handleNextWeek}>
                <ChevronRightIcon />
              </Button>
            </div>

            <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger size='sm' className='w-22.5 text-sm bg-background'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent side='bottom' sideOffset={8}>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      {isLoadingSchedule || isLoadingMentorMeetings ? (
        <div className='grid grid-cols-7 gap-2'>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className='flex flex-col gap-2'>
              <Skeleton className='h-10 rounded-lg' />
              <Skeleton className='h-20 rounded-md' />
            </div>
          ))}
        </div>
      ) : scheduleData?.value?.totalCount === 0 ? (
        <div className='flex flex-col items-center justify-center py-10 px-4 text-center'>
          <CalendarDaysIcon className='size-10 text-muted-foreground mb-4 opacity-50' />
          <p className='text-sm font-medium'>{t('meeting.mentorSchedule.empty')}</p>
          <p className='text-xs text-muted-foreground'>{t('meeting.mentorSchedule.emptyDescription')}</p>
        </div>
      ) : (
        <div className='grid grid-cols-7 gap-2'>
          {schedule.map((day, index) => {
            const dayIsToday = isToday(day.date)
            const isPastDay = day.date.getTime() < new Date().setHours(0, 0, 0, 0)

            return (
              <div key={index} className='flex flex-col gap-2'>
                <div
                  className={cn(
                    'text-center rounded-lg py-1 transition-colors border border-border',
                    dayIsToday ? 'bg-primary text-primary-foreground' : 'bg-background/60'
                  )}
                >
                  <p className='text-xs font-medium'>{t(`schedule.timeline.${DAY_OF_WEEKS[index].key}`)}</p>
                  <p className={cn('text-[10px] font-medium', dayIsToday ? 'text-white' : 'text-muted-foreground')}>
                    ({formatDate(day.date, 'dayMonth')})
                  </p>
                </div>

                <div className='space-y-2 min-h-20'>
                  {day.slots.map((slot) => {
                    const isBooked = bookedSchedule[index].slots.some(
                      (b) => b.startTimeUtc === slot.startTimeUtc && b.endTimeUtc === slot.endTimeUtc
                    )

                    const now = new Date()
                    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`
                    const isPassedTime = dayIsToday && slot.startTimeUtc < currentTimeStr

                    const isDisabled = isBooked || isPastDay || isPassedTime

                    return (
                      <button
                        key={`${slot.dayOfWeek}-${slot.startTimeUtc}`}
                        type='button'
                        disabled={isDisabled}
                        // onClick={() => !isDisabled && handleOpenDialog(slot, day.date)}
                        className={cn(
                          'w-full p-2 rounded-md text-center transition-all duration-200 border',
                          isDisabled
                            ? 'bg-muted/50 border-muted text-muted-foreground cursor-not-allowed shadow-none'
                            : 'border-dashed cursor-pointer hover:scale-[1.02] hover:shadow-sm bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                        )}
                      >
                        <p className='text-xs font-semibold leading-tight'>{formatTimeRange(slot)}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {scheduleData?.value?.totalCount > 0 && (
        <div className='flex justify-center items-center gap-4 text-xs mt-2'>
          <div className='flex items-center gap-1.5'>
            <div className='size-2.5 rounded-full bg-emerald-500' />
            <span className='text-muted-foreground'>{t('meeting.mentorSchedule.available')}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='size-2.5 rounded-full bg-muted-foreground/30' />
            <span className='text-muted-foreground'>{t('meeting.mentorSchedule.booked')}</span>
          </div>
        </div>
      )}

      {/* <BookMeetingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mentorId={userId}
        schedule={schedule}
        bookedSchedule={bookedSchedule}
        initialDate={initialDate}
        initialSlot={initialSlot}
      /> */}
    </Card>
  )
}
