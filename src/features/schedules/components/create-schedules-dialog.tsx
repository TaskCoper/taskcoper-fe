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
import { useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCreateSchedules } from '../hooks/use-create-schedules'
import type { CreateSchedulesFormValues } from '../validations'
import CreateScheduleForm from './create-schedules-form'

interface CreateSchedulesDialog {
  children: React.ReactNode
}

export default function CreateSchedulesDialog({ children }: CreateSchedulesDialog) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { methods, createSchedules, isCreatingSchedules } = useCreateSchedules()

  const onSubmit: SubmitHandler<CreateSchedulesFormValues> = (body) => {
    const formattedBody = {
      ...body,
      startTime: body.startTime.split(':').length === 2 ? `${body.startTime}:00` : body.startTime,
      endTime: body.endTime.split(':').length === 2 ? `${body.endTime}:00` : body.endTime
    }
    createSchedules(
      { body: formattedBody },
      {
        onSuccess: () => {
          setOpen(false)
        }
      }
    )
  }

  const onClose = () => {
    setOpen(false)
    methods.reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          methods.reset()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent position='top-center' className='min-w-xl' onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>{t('schedule.createAvailability.title')}</DialogTitle>
          <DialogDescription>{t('schedule.createAvailability.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <CreateScheduleForm />

            <div className='flex items-center justify-end gap-2'>
              <Button variant='ghost' type='button' onClick={onClose}>
                {t('common.button.cancel')}
              </Button>
              <Button disabled={isCreatingSchedules}>
                {isCreatingSchedules ? <Spinner /> : null}
                {t('common.button.create')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
