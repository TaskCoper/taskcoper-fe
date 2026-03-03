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
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateProjectFormValues } from '../../validations'
import UpdateProjectTimelineForm from '../forms/update-project-timeline-form'

interface UpdateProjectTimelineDialogProps {
  children: React.ReactNode
  isPending: boolean
}

export default function UpdateProjectTimelineDialog({ children, isPending }: UpdateProjectTimelineDialogProps) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const {
    reset,
    formState: { isDirty }
  } = useFormContext<UpdateProjectFormValues>()

  const onClose = () => {
    setOpen(false)
    reset()
  }

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
      <DialogContent className='min-w-md' position='top-center'>
        <DialogHeader>
          <DialogTitle>{t('project.updateProjectTimeline.title')}</DialogTitle>
          <DialogDescription>{t('project.updateProjectTimeline.description')}</DialogDescription>
        </DialogHeader>

        <UpdateProjectTimelineForm />

        <div className='flex items-center justify-end gap-2'>
          <Button variant='ghost' type='button' onClick={onClose} disabled={isPending}>
            {t('common.button.cancel')}
          </Button>
          <Button type='submit' form='update-project-info-form' disabled={!isDirty || isPending}>
            {isPending ? <Spinner /> : null}
            {t('common.button.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
