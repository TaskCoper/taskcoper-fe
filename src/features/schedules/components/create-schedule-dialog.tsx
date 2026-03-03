import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCreateSchedule } from '../hooks/use-create-schedule'
import type { CreateScheduleFormValues } from '../validations'
import CreateScheduleForm from './create-schedule-form'

interface CreateScheduleDialog {
  children: React.ReactNode
}

export default function CreateScheduleDialog({ children }: CreateScheduleDialog) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { methods } = useCreateSchedule()

  const onSubmit: SubmitHandler<CreateScheduleFormValues> = (body) => {
    console.log(body)
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
      <DialogContent position='top-center' className='min-w-xl'>
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
              <Button>{t('common.button.create')}</Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
