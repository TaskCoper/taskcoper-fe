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
import type { UpdateProjectFormValues } from '../validations'
import UpdateProjectInfoForm from './update-project-info-form'

interface UpdateProjectInfoDialogProps {
  children: React.ReactNode
  isPending: boolean
}

export default function UpdateProjectInfoDialog({ children, isPending }: UpdateProjectInfoDialogProps) {
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
      <DialogContent className='min-w-2xl p-0' position='top-center' onInteractOutside={onClose}>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('project.updateProjectInfo.title')}</DialogTitle>
          <DialogDescription>{t('project.updateProjectInfo.description')}</DialogDescription>
        </DialogHeader>

        <div className='px-6 pb-2 space-y-4'>
          <UpdateProjectInfoForm />
        </div>

        <div className='flex items-center justify-end gap-2 px-6 pb-6'>
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
