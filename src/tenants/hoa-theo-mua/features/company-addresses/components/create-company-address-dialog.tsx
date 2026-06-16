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
import { useCreateCompanyAddress } from '../hooks/use-create-company-address'
import type { CreateCompanyAddressFormValues } from '../validations'
import CreateCompanyAddressForm from './create-company-address-form'

interface CreateCompanyAddressDialogProps {
  children: React.ReactNode
}

export default function CreateCompanyAddressDialog({ children }: CreateCompanyAddressDialogProps) {
  const [open, setOpen] = useState(false)

  const { methods, createCompanyAddress, isCreatingCompanyAddress } = useCreateCompanyAddress()

  const onSubmit: SubmitHandler<CreateCompanyAddressFormValues> = (body) => {
    createCompanyAddress(
      { body },
      {
        onSuccess: () => {
          onClose()
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
      <DialogContent position='top-center' className='min-w-2xl' showCloseButton={false} onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>Địa chỉ công ty</DialogTitle>
          <DialogDescription>
            Thêm điạ chỉ công ty để hiển thị trên trang thông tin công ty và sử dụng cho các mục đích khác như định vị,
            bản đồ, v.v.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='flex flex-col'>
            <CreateCompanyAddressForm />

            <div className='self-end'>
              <Button type='submit' disabled={isCreatingCompanyAddress}>
                {isCreatingCompanyAddress ? <Spinner /> : null}
                Thêm địa chỉ
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
