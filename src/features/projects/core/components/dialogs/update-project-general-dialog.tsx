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
import UpdateProjectGeneralForm from '../forms/update-project-general-form'

interface UpdateProjectGeneralDialogProps {
  children: React.ReactNode
  isPending: boolean
}

export default function UpdateProjectGeneralDialog({ children, isPending }: UpdateProjectGeneralDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const {
    reset,
    formState: { isDirty }
  } = useFormContext<UpdateProjectFormValues>()

  const onClose = () => {
    reset()
    setOpen(false)
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
          <DialogTitle>{t('project.updateProjectGeneral.title')}</DialogTitle>
          <DialogDescription>{t('project.updateProjectGeneral.description')}</DialogDescription>
        </DialogHeader>

        <UpdateProjectGeneralForm />

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
