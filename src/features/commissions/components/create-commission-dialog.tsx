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
import { useCreateCommission } from '../hooks/use-create-commission'
import type { CreateCommissionFormValues } from '../validations'
import CreateCommissionForm from './create-commission-form'

interface CreateCommissionDialogProps {
  children: React.ReactNode
}

export default function CreateCommissionDialog({ children }: CreateCommissionDialogProps) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { methods, createCommission, isCreatingCommission } = useCreateCommission()

  const onSubmit: SubmitHandler<CreateCommissionFormValues> = (body) => {
    createCommission(
      { body },
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
          onClose()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent position='top-center' className='min-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('commission.dialog.title')}</DialogTitle>
          <DialogDescription>{t('commission.dialog.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <CreateCommissionForm />

            <div className='ml-auto'>
              <Button type='submit' disabled={isCreatingCommission}>
                {isCreatingCommission ? <Spinner /> : null}
                {t('common.button.save')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
