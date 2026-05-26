import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useBookMeeting } from '@/features/meetings/hooks/use-book-meeting'
import { useGetMeeting } from '@/features/meetings/hooks/use-get-meeting'
import { useGetMentorMeetings } from '@/features/meetings/hooks/use-get-mentor-meetings'
import { useUpdateMeeting } from '@/features/meetings/hooks/use-update-meeting'
import { combineDateTimeToUtc, formatTimeRange, groupSlotsByDay } from '@/features/meetings/utils'
import type { PurchasedMentorPackageRule } from '@/features/mentor-packages/types'
import type { SelectedTimeSlot } from '@/pages/users/purchased-package.page'
import { DAY_OF_WEEKS } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { addWeeks, endOfWeek, format, getISOWeek, getYear, startOfWeek, subWeeks } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import { AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetSchedule } from '../hooks/use-get-schedule'

export interface MentorScheduleContentProps {
  open: boolean
  selectedTimeSlots: SelectedTimeSlot[]
  onSelectedTimeSlotsChange: (selectedTimeSlots: SelectedTimeSlot[]) => void
  limitSlots?: number
  mentorUserId: string
  projectIdentifier?: string
  bookByProjectId: string | null
  packageBookingId: string | null
  packageSessionNumber: number | null
  meetingId?: string
  onSuccess: () => void
}

export function MentorScheduleContent({
  open,
  mentorUserId,
  selectedTimeSlots,
  onSelectedTimeSlotsChange,
  limitSlots = 1,
  bookByProjectId,
  packageBookingId,
  packageSessionNumber,
  meetingId,
  projectIdentifier,
  onSuccess
}: MentorScheduleContentProps) {
  const { me: user } = useGetMe()
  const { methods, bookMeeting, isBookingMeeting } = useBookMeeting({
    packageId: packageBookingId ?? undefined,
    projectIdentifier
  })

  const { updateMeeting, isUpdatingMeeting } = useUpdateMeeting({
    packageId: packageBookingId ?? undefined,
    mentorId: mentorUserId
  })

  const { meeting } = useGetMeeting({ meetingId, enabled: open })

  const { t } = useTranslation()

  const today = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(getYear(today))
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(today, { weekStartsOn: 1 }))
  const [reason, setReason] = useState('')

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
          label: `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`,
          start: weekStart
        })
      }
      weekStart = addWeeks(weekStart, 1)
      if (weeks.length > 53) break
    }
    return weeks
  }, [selectedYear])

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

  const { schedule: scheduleData, isLoadingSchedule } = useGetSchedule({
    userId: mentorUserId,
    activeFrom: currentWeekStart.toISOString(),
    activeTo: weekEnd.toISOString(),
    enabled: open
  })

  const { mentorMeetings, isLoadingMentorMeetings } = useGetMentorMeetings({
    mentorId: mentorUserId,
    activeFrom: currentWeekStart.toISOString(),
    activeTo: weekEnd.toISOString(),
    enabled: open
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
    () => `${format(currentWeekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`,
    [currentWeekStart, weekEnd]
  )

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
    const now = new Date()
    return (
      date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    )
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 1 }))
    setSelectedYear(getYear(now))
  }

  useEffect(() => {
    methods.reset({
      mentorId: mentorUserId,
      bookByProjectId,
      packageBookingId,
      packageSessionNumber,
      bookByUserId: user?.id,
      bookingTimeSlots: selectedTimeSlots.map((slot) => ({
        startTimeUtc: slot.startTimeUtc,
        endTimeUtc: slot.endTimeUtc
      }))
    })
  }, [methods, mentorUserId, bookByProjectId, packageBookingId, packageSessionNumber, user?.id, selectedTimeSlots])

  const handleSubmit = () => {
    if (meetingId) {
      const sortedSlots = [...selectedTimeSlots].sort(
        (a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime()
      )

      updateMeeting(
        {
          body: {
            meetingId,
            startTimeUtc: sortedSlots[0].startTimeUtc,
            endTimeUtc: sortedSlots[sortedSlots.length - 1].endTimeUtc,
            reason,
            meetingLink: meeting?.meetingLink ?? null,
            note: meeting?.note ?? null
          }
        },
        {
          onSuccess: () => {
            onSelectedTimeSlotsChange([])
            onSuccess()
          }
        }
      )
      return
    }

    bookMeeting(
      { body: methods.getValues() },
      {
        onSuccess: () => {
          onSelectedTimeSlotsChange([])
          onSuccess()
        }
      }
    )
  }

  const isPending = isBookingMeeting || isUpdatingMeeting
  const isSelectionFull = selectedTimeSlots.length === limitSlots
  const isSelectionStarted = selectedTimeSlots.length > 0

  const isAdjacent = (slot: { dayOfWeek: number; startTime: string; endTime: string }) => {
    if (selectedTimeSlots.length === 0) return true
    if (selectedTimeSlots[0].dayOfWeek !== slot.dayOfWeek) return false

    const startTimes = selectedTimeSlots.map((s) => s.startTime).sort()
    const endTimes = selectedTimeSlots.map((s) => s.endTime).sort()

    const firstStart = startTimes[0]
    const lastEnd = endTimes[endTimes.length - 1]

    return slot.endTime === firstStart || slot.startTime === lastEnd
  }

  return (
    <>
      <div className='flex flex-col gap-4 bg-muted/40 rounded-lg p-4'>
        <div className='flex items-center justify-end gap-3 flex-wrap'>
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

        {isLoadingSchedule || isLoadingMentorMeetings ? (
          <div className='grid grid-cols-7 gap-2'>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className='flex flex-col gap-2'>
                <Skeleton className='h-10 rounded-lg' />
                <Skeleton className='h-20 rounded-md' />
              </div>
            ))}
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
                      ({format(day.date, 'dd/MM')})
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

                      const isSelected = selectedTimeSlots.some(
                        (s) =>
                          s.startTime === slot.startTimeUtc &&
                          s.endTime === slot.endTimeUtc &&
                          s.dayOfWeek === slot.dayOfWeek
                      )

                      const isAdjacentSlot = isAdjacent({
                        dayOfWeek: slot.dayOfWeek,
                        startTime: slot.startTimeUtc,
                        endTime: slot.endTimeUtc
                      })

                      const isDisabled =
                        isBooked ||
                        isPastDay ||
                        isPassedTime ||
                        (isSelectionStarted && selectedTimeSlots[0].dayOfWeek !== slot.dayOfWeek) ||
                        (isSelectionFull && !isSelected) ||
                        (!isSelected && isSelectionStarted && !isAdjacentSlot)

                      return (
                        <button
                          key={`${slot.dayOfWeek}-${slot.startTimeUtc}`}
                          type='button'
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return

                            if (isSelected) {
                              const startTimes = selectedTimeSlots.map((s) => s.startTime).sort()
                              const endTimes = selectedTimeSlots.map((s) => s.endTime).sort()
                              const isEnd =
                                slot.startTimeUtc === startTimes[0] || slot.endTimeUtc === endTimes[endTimes.length - 1]

                              if (!isEnd && selectedTimeSlots.length > 2) {
                                return
                              }

                              onSelectedTimeSlotsChange(
                                selectedTimeSlots.filter(
                                  (s) =>
                                    s.startTime !== slot.startTimeUtc ||
                                    s.endTime !== slot.endTimeUtc ||
                                    s.dayOfWeek !== slot.dayOfWeek
                                )
                              )
                              return
                            }
                            onSelectedTimeSlotsChange([
                              ...selectedTimeSlots,
                              {
                                dayOfWeek: slot.dayOfWeek,
                                startTime: slot.startTimeUtc,
                                endTime: slot.endTimeUtc,
                                startTimeUtc: combineDateTimeToUtc(day.date, slot.startTimeUtc),
                                endTimeUtc: combineDateTimeToUtc(day.date, slot.endTimeUtc)
                              }
                            ])
                          }}
                          className={cn(
                            'w-full p-2 rounded-md text-center transition-all duration-200 border',
                            isDisabled
                              ? 'bg-muted/50 border-muted text-muted-foreground cursor-not-allowed shadow-none'
                              : 'border-dashed cursor-pointer hover:scale-[1.02] hover:shadow-sm bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
                            isSelected && 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400'
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

        <div className='flex justify-center items-center gap-4 text-xs'>
          <div className='flex items-center gap-1.5'>
            <div className='size-2.5 rounded-full bg-emerald-500' />
            <span className='text-muted-foreground'>{t('meeting.mentorSchedule.available')}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='size-2.5 rounded-full bg-muted-foreground/30' />
            <span className='text-muted-foreground'>{t('meeting.mentorSchedule.booked')}</span>
          </div>
          <div className='flex items-center gap-1.5 text-blue-500'>
            <div className='size-2.5 rounded-full bg-blue-500' />
            <span className='font-medium'>{t('meeting.mentorSchedule.selected')}</span>
          </div>
        </div>
      </div>

      <div className='bg-primary/5 p-4 border border-primary border-dashed rounded-md flex items-center gap-2'>
        <AlertCircleIcon className='size-5 text-primary' />
        <p className='text-sm text-primary'>
          <span className='font-bold'>{t('purchasedPackage.note')}</span>{' '}
          {t('purchasedPackage.bookingNote', { slots: limitSlots })}
        </p>
      </div>

      {meetingId && (
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>{t('meeting.detail.cancelReasonLabel')}</Label>
          <Textarea
            placeholder={t('meeting.detail.rescheduleReasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className='min-h-25'
          />
        </div>
      )}

      <div className='flex items-center gap-2 justify-end mt-4'>
        <Button
          variant='outline'
          onClick={() => onSelectedTimeSlotsChange([])}
          disabled={selectedTimeSlots.length === 0}
        >
          {t('dataTable.toolbar.reset')}
        </Button>

        <Button disabled={!isSelectionFull || isPending} onClick={handleSubmit}>
          {isPending ? <Spinner /> : null}
          {t('purchasedPackage.confirmBooking')}
        </Button>
      </div>
    </>
  )
}

interface MentorScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTimeSlots: SelectedTimeSlot[]
  onSelectedTimeSlotsChange: (selectedTimeSlots: SelectedTimeSlot[]) => void
  limitSlots?: number
  mentorUserId: string
  bookByProjectId: string | null
  packageBookingId: string | null
  packageSessionNumber: number | null
  nextRule: PurchasedMentorPackageRule
  meetingId?: string
}

export default function MentorScheduleDialog({
  open,
  onOpenChange,
  mentorUserId,
  selectedTimeSlots,
  onSelectedTimeSlotsChange,
  limitSlots = 1,
  bookByProjectId,
  packageBookingId,
  packageSessionNumber,
  nextRule,
  meetingId
}: MentorScheduleDialogProps) {
  const { t, i18n } = useTranslation()
  const dateLocale = i18n.language.startsWith('vi') ? vi : enUS
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent position='top-center' className='min-w-4xl gap-4'>
        <DialogHeader>
          <DialogTitle>
            {t('purchasedPackage.bookMeetingSession', {
              sequence: nextRule.packageSequence,
              slots: nextRule.totalTimeSlots
            })}
          </DialogTitle>
          <DialogDescription>
            {t('meeting.mentorSchedule.weekLabel', {
              week: getISOWeek(currentWeekStart),
              month: format(currentWeekStart, 'MMMM yyyy', { locale: dateLocale })
            })}
          </DialogDescription>
        </DialogHeader>

        <MentorScheduleContent
          open={open}
          mentorUserId={mentorUserId}
          selectedTimeSlots={selectedTimeSlots}
          onSelectedTimeSlotsChange={onSelectedTimeSlotsChange}
          limitSlots={limitSlots}
          bookByProjectId={bookByProjectId}
          packageBookingId={packageBookingId}
          packageSessionNumber={packageSessionNumber}
          meetingId={meetingId}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
