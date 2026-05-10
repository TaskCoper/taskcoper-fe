import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useGetMyProjectsInfinite } from '@/features/projects/core/hooks/use-get-my-projects-infinite'
import type { ScheduleSlot } from '@/types/schedule.type'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useBookMeeting } from '../hooks/use-book-meeting'
import type { DaySchedule } from '../utils'
import type { BookMeetingFormValues } from '../validations'
import BookMeetingForm from './book-meeting-form'

interface BookMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mentorId: string
  schedule: DaySchedule[]
  bookedSchedule: DaySchedule[]
  initialDate?: Date
  initialSlot?: ScheduleSlot
}

export default function BookMeetingDialog({
  open,
  onOpenChange,
  mentorId,
  schedule,
  bookedSchedule,
  initialDate,
  initialSlot
}: BookMeetingDialogProps) {
  const { t } = useTranslation()
  const { methods, bookMeeting, isBookingMeeting } = useBookMeeting()
  const [projectSearch, setProjectSearch] = useState('')

  const {
    projects: leaderProjects,
    isLoading: isLoadingLeaderProjects,
    isFetchingNextPage: isFetchingNextLeaderProjects,
    hasNextPage: hasNextLeaderProjects,
    fetchNextPage: fetchNextLeaderProjects
  } = useGetMyProjectsInfinite({
    status: ['leader'],
    searchTerm: projectSearch,
    enabled: open
  })

  const projectOptions = useMemo(
    () => leaderProjects.map((project) => ({ value: project.id, label: project.name })),
    [leaderProjects]
  )

  useEffect(() => {
    if (!open) return

    methods.reset({
      ...methods.getValues(),
      mentorId,
      bookingTimeSlots: []
    })
  }, [initialSlot, mentorId, methods, open])

  const onClose = () => {
    onOpenChange(false)
    methods.reset()
  }

  const onSubmit: SubmitHandler<BookMeetingFormValues> = (body) => {
    bookMeeting(
      { body },
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          methods.reset()
          setProjectSearch('')
        }

        onOpenChange(nextOpen)
      }}
    >
      <DialogContent position='top-center' className='min-w-2xl gap-4' onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>{t('meeting.dialog.title')}</DialogTitle>
          <DialogDescription>{t('meeting.dialog.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <BookMeetingForm
              key={`${initialDate?.toISOString()}-${initialSlot?.startTimeUtc}`}
              schedule={schedule}
              bookedSchedule={bookedSchedule}
              initialDate={initialDate}
              initialSlot={initialSlot}
              projectOptions={projectOptions}
              isLoadingProjects={isLoadingLeaderProjects}
              isFetchingNextProjects={isFetchingNextLeaderProjects}
              hasNextProjects={hasNextLeaderProjects}
              fetchNextProjects={fetchNextLeaderProjects}
              onSearchProjects={setProjectSearch}
            />

            <div className='flex items-center gap-2 justify-end'>
              <Button variant='ghost' onClick={onClose}>
                {t('common.button.cancel')}
              </Button>
              <Button disabled={isBookingMeeting} type='submit'>
                {isBookingMeeting ? <Spinner /> : null}
                {t('meeting.button.book')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
