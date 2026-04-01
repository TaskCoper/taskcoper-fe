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
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCreateVoucher } from '../hooks/use-create-voucher'
import type { CreateVoucherFormValues } from '../validations'
import CreateVoucherForm from './create-voucher-form'

interface CreateVoucherDialogProps {
  children: React.ReactNode
}

export default function CreateVoucherDialog({ children }: CreateVoucherDialogProps) {
  const { t } = useTranslation()
  const { methods, createVoucher, isCreatingVoucher, open, setOpen } = useCreateVoucher()

  const onSubmit: SubmitHandler<CreateVoucherFormValues> = (body) => {
    createVoucher({ body })
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
      <DialogContent position='top-center' className='min-w-2xl' onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>{t('voucher.dialog.title')}</DialogTitle>
          <DialogDescription>{t('voucher.dialog.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <CreateVoucherForm />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='ghost' onClick={onClose} disabled={isCreatingVoucher}>
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' disabled={isCreatingVoucher}>
                {isCreatingVoucher ? <Spinner className='mr-2' /> : null}
                {t('common.button.save')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
