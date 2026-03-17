import InfiniteSelect from '@/components/infinite-select'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { DAY_OF_WEEKS } from '@/shared/constants'
import { cn } from '@/shared/utils'
import type { ScheduleSlot } from '@/types/schedule.type'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { DaySchedule } from '../utils'
import { formatTimeRange } from '../utils'
import type { BookMeetingFormValues } from '../validations'

interface BookMeetingFormProps {
  schedule: DaySchedule[]
  bookedSchedule: DaySchedule[]
  initialDate?: Date
  initialSlot?: ScheduleSlot
  projectOptions: Array<{ value: string; label: string }>
  isLoadingProjects: boolean
  isFetchingNextProjects: boolean
  hasNextProjects: boolean
  fetchNextProjects: () => void
  onSearchProjects: (term: string) => void
}

export default function BookMeetingForm({
  schedule,
  bookedSchedule,
  initialDate,
  initialSlot,
  projectOptions,
  isLoadingProjects,
  isFetchingNextProjects,
  hasNextProjects,
  fetchNextProjects,
  onSearchProjects
}: BookMeetingFormProps) {
  const { user } = useAuthStore()
  const { clearErrors, control, setValue } = useFormContext<BookMeetingFormValues>()

  const { t } = useTranslation()
  const [isBookingForProject, setIsBookingForProject] = useState(false)

  const [activeDay, setActiveDay] = useState<DaySchedule | null>(() => {
    if (!initialDate) return schedule[0] ?? null
    return (
      schedule.find((d) => format(d.date, 'yyyy-MM-dd') === format(initialDate, 'yyyy-MM-dd')) ?? schedule[0] ?? null
    )
  })

  const [activeSlot, setActiveSlot] = useState<ScheduleSlot | null>(initialSlot ?? null)

  useEffect(() => {
    const bookingTimeSlots =
      activeDay && activeSlot
        ? [
            {
              startTimeUtc: `${format(activeDay.date, 'yyyy-MM-dd')}T${activeSlot.startTimeUtc}Z`,
              endTimeUtc: `${format(activeDay.date, 'yyyy-MM-dd')}T${activeSlot.endTimeUtc}Z`
            }
          ]
        : []

    setValue('bookingTimeSlots', bookingTimeSlots, {
      shouldDirty: bookingTimeSlots.length > 0,
      shouldValidate: true
    })
  }, [activeDay, activeSlot, setValue])

  useEffect(() => {
    if (user?.UserId) {
      setValue('bookByUserId', user.UserId, {
        shouldDirty: false,
        shouldValidate: true
      })
    }
  }, [setValue, user?.UserId])

  const isSlotBooked = (dayIndex: number, slot: ScheduleSlot) =>
    bookedSchedule[dayIndex]?.slots.some((b) => b.startTimeUtc === slot.startTimeUtc) ?? false

  const activeDayIndex = activeDay
    ? schedule.findIndex((d) => format(d.date, 'yyyy-MM-dd') === format(activeDay.date, 'yyyy-MM-dd'))
    : -1

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-7 gap-2'>
        {schedule.map((day, index) => {
          const availableCount = day.slots.filter((s) => !isSlotBooked(index, s)).length
          const isActive = activeDay ? format(activeDay.date, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd') : false
          const hasSlots = availableCount > 0

          return (
            <button
              key={index}
              type='button'
              disabled={!hasSlots}
              onClick={() => {
                setActiveDay(day)
                const stillValid = day.slots.find((s) => s.startTimeUtc === activeSlot?.startTimeUtc)
                if (!stillValid) setActiveSlot(null)
              }}
              className={cn(
                'shrink-0 flex flex-col items-center px-2 py-1 rounded-lg border text-xs transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : hasSlots
                    ? 'bg-background border-border hover:bg-muted cursor-pointer'
                    : 'bg-muted/30 border-muted text-muted-foreground cursor-not-allowed opacity-50'
              )}
            >
              <p className='font-semibold'>{t(`dayOfWeek.${DAY_OF_WEEKS[index].key}`)}</p>
              <p className={cn('text-[10px]', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                {format(day.date, 'dd/MM')}
              </p>
            </button>
          )
        })}
      </div>

      {activeDay && (
        <ScrollArea className='max-h-44'>
          <div className='grid grid-cols-3 gap-1.5 pr-2'>
            {activeDay.slots.map((slot, i) => {
              const booked = isSlotBooked(activeDayIndex, slot)
              const selected = activeSlot?.startTimeUtc === slot.startTimeUtc

              return (
                <button
                  key={i}
                  type='button'
                  disabled={booked}
                  onClick={() => setActiveSlot(slot)}
                  className={cn(
                    'rounded-md border px-2 py-2 transition-all',
                    booked
                      ? 'bg-muted/50 border-muted text-muted-foreground cursor-not-allowed opacity-60'
                      : selected
                        ? 'bg-primary/10 text-primary border-primary border-dashed'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer'
                  )}
                >
                  <p className='font-semibold text-xs'>{formatTimeRange(slot)}</p>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {isBookingForProject && (
        <Controller
          control={control}
          name='bookByProjectId'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>{t('meeting.form.projectLabel')}</FieldLabel>

              <InfiniteSelect
                value={field.value ?? ''}
                options={projectOptions}
                onChangeValue={(value) => {
                  field.onChange(value || null)
                }}
                placeholder={t('meeting.form.projectPlaceholder')}
                searchPlaceholder={t('meeting.form.projectSearchPlaceholder')}
                onSearch={onSearchProjects}
                fetchNextPage={fetchNextProjects}
                hasNextPage={hasNextProjects}
                isFetchingNextPage={isFetchingNextProjects}
                isLoading={isLoadingProjects}
                aria-invalid={fieldState.invalid}
                className={cn('w-full', fieldState.invalid && 'border-destructive focus-visible:ring-destructive')}
              />

              <div className='min-h-4'>
                <FieldError className='text-xs' errors={[fieldState.error]} />
              </div>
            </Field>
          )}
        />
      )}

      <Field orientation='horizontal' className='items-center rounded-md border border-dashed bg-muted/50 p-4'>
        <div className='flex-1'>
          <FieldLabel htmlFor='book-for-project-switch'>{t('meeting.form.bookForProject')}</FieldLabel>
          <p className='text-xs text-muted-foreground'>
            {isBookingForProject
              ? t('meeting.form.bookForProjectDescription')
              : t('meeting.form.bookForSelfDescription')}
          </p>
        </div>

        <Switch
          id='book-for-project-switch'
          checked={isBookingForProject}
          onCheckedChange={(checked) => {
            setIsBookingForProject(checked)
            clearErrors('bookByProjectId')

            if (!checked) {
              setValue('bookByProjectId', null, {
                shouldDirty: true,
                shouldValidate: false
              })
            }
          }}
        />
      </Field>
    </div>
  )
}
