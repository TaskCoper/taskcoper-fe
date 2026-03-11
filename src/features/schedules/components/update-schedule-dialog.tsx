import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import type { MeetingRule } from '@/types/schedule.type'
import { useEffect, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useUpdateSchedule } from '../hooks/use-update-schedule'
import type { UpdateScheduleFormValues } from '../validations'
import UpdateScheduleForm from './update-schedule-form'

interface UpdateScheduleDialogProps {
  children: React.ReactNode
  schedule: MeetingRule
}

export default function UpdateScheduleDialog({ children, schedule }: UpdateScheduleDialogProps) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { methods, updateSchedule, isUpdatingSchedule } = useUpdateSchedule()

  const {
    reset,
    handleSubmit,
    formState: { isDirty }
  } = methods

  const onClose = () => {
    setOpen(false)
    reset()
  }

  const onSubmit: SubmitHandler<UpdateScheduleFormValues> = (body) => {
    const formattedBody = {
      ...body,
      startTimeUtc: body.startTimeUtc.split(':').length === 2 ? `${body.startTimeUtc}:00` : body.startTimeUtc,
      endTimeUtc: body.endTimeUtc.split(':').length === 2 ? `${body.endTimeUtc}:00` : body.endTimeUtc
    }

    updateSchedule(
      { id: schedule.id, body: formattedBody },
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  useEffect(() => {
    if (open) {
      reset({
        dayOfWeek: schedule.dayOfWeek,
        startTimeUtc: schedule.startTimeUtc,
        endTimeUtc: schedule.endTimeUtc,
        isActive: schedule.isActive,
        activeFrom: schedule.activeFrom,
        activeTo: schedule.activeTo
      })
    }
  }, [open, reset, schedule])

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          reset()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent position='top-center' className='min-w-xl' onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>{t('schedule.button.update')}</DialogTitle>
          <DialogDescription>{t('schedule.update.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <UpdateScheduleForm />

            <div className='flex items-center justify-end gap-2'>
              <Button variant='ghost' type='button' onClick={onClose} disabled={isUpdatingSchedule}>
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' disabled={!isDirty || isUpdatingSchedule}>
                {isUpdatingSchedule ? <Spinner /> : null}
                {t('common.button.save')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
