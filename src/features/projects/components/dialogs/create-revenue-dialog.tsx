/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCreateRevenue } from '../../hooks/use-create-revenue'
import type { CreateRevenueFormValues } from '../../validations'
import CreateRevenueForm from '../forms/create-revenue-form'

interface CreateRevenueDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
}

export default function CreateRevenueDialog({ open, onClose, projectId }: CreateRevenueDialogProps) {
  const { t } = useTranslation()
  const { methods, createRevenue, isCreatingRevenue } = useCreateRevenue()

  const onSubmit: SubmitHandler<CreateRevenueFormValues> = async (data) => {
    await createRevenue(data)
    handleClose()
  }

  const handleClose = () => {
    methods.reset()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>{t('project.projectRevenue.addRevenue')}</DialogTitle>
          <DialogDescription>{t('project.projectRevenue.addRevenueDescription')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit as SubmitHandler<any>)} className='space-y-4 py-2'>
            <CreateRevenueForm projectId={projectId} />

            <DialogFooter className='gap-2'>
              <Button type='button' variant='outline' onClick={handleClose} disabled={isCreatingRevenue}>
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' disabled={isCreatingRevenue}>
                {isCreatingRevenue ? <Spinner /> : null}
                {t('common.button.save')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
