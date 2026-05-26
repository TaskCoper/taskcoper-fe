import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import type { MentorPackage } from '@/features/mentor-packages/types'
import { useGetVoucherByCode } from '@/features/vouchers/hooks/use-get-voucher-by-code'
import { DiscountType } from '@/features/vouchers/types'
import { formatCurrency } from '@/shared/utils'
import { TicketPercentIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useBookPackage } from '../hooks/use-book-package'
import type { BookPackageFormValues } from '../validations'

interface BookPackageDialogProps {
  children: React.ReactNode
  projectId: string | null
  mentorPackage: Pick<MentorPackage, 'id' | 'name' | 'price' | 'currency'>
}

export default function BookPackageDialog({ children, mentorPackage, projectId }: BookPackageDialogProps) {
  const { t } = useTranslation()
  const { requestId } = useParams<{ requestId: string }>()

  const { methods, bookPackage, isBookingPackage } = useBookPackage()

  const [open, setOpen] = useState(false)

  const voucherCode = methods.watch('voucherCode')
  const { voucher, isLoadingVoucher } = useGetVoucherByCode({ voucherCode: voucherCode ?? undefined })

  const discountAmount = useMemo(() => {
    if (!voucher) return 0
    if (voucher.discountType === DiscountType.Percentage) {
      return (mentorPackage.price * voucher.discountValue) / 100
    }
    return voucher.discountValue
  }, [voucher, mentorPackage.price])

  const totalAmount = useMemo(
    () => Math.max(0, mentorPackage.price - discountAmount),
    [mentorPackage.price, discountAmount]
  )

  const voucherError = useMemo(() => {
    if (!voucherCode || isLoadingVoucher) return null
    if (!voucher) return t('packageBooking.bookPackage.voucherNotFound')

    const now = new Date()
    const start = new Date(voucher.startsAtUtc)
    const end = new Date(voucher.endsAtUtc)

    if (now < start) return t('packageBooking.bookPackage.voucherNotStarted')
    if (now > end) return t('packageBooking.bookPackage.voucherExpired')

    return null
  }, [voucherCode, voucher, isLoadingVoucher, t])

  const isVoucherLow = useMemo(() => {
    return voucher?.usedStatus === 'Low'
  }, [voucher])

  const onClose = () => {
    setOpen(false)
    methods.reset()
  }

  const onSubmit: SubmitHandler<BookPackageFormValues> = (body) => {
    const updatedBody = {
      ...body,
      voucherIdempotencyKey: body.voucherCode ? crypto.randomUUID() : null
    }

    bookPackage({ body: updatedBody })
  }

  useEffect(() => {
    const values = methods.getValues()

    methods.reset({
      ...values,
      bookedByProjectId: projectId,
      mentorPackageId: mentorPackage.id,
      purchaseRequestId: requestId
    })
  }, [mentorPackage, methods, requestId, projectId])

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
      <DialogContent position='top-center' className='min-w-lg' onInteractOutside={onClose} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('packageBooking.bookPackage.title')}</DialogTitle>
          <DialogDescription>{mentorPackage.name}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
              <Controller
                name='voucherCode'
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name} className='gap-1 items-baseline'>
                      {t('packageBooking.bookPackage.voucherCode')}
                      <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      aria-invalid={fieldState.invalid}
                      placeholder={t('packageBooking.bookPackage.voucherCodePlaceholder')}
                      autoComplete='off'
                      spellCheck={false}
                    />

                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                      {!fieldState.invalid && voucherError && (
                        <p className='text-xs font-medium text-destructive'>{voucherError}</p>
                      )}
                      {!fieldState.invalid && !voucherError && isVoucherLow && (
                        <p className='text-xs font-medium tracking-tight text-primary'>
                          {t('packageBooking.bookPackage.voucherLowUsage')}
                        </p>
                      )}
                    </div>
                  </Field>
                )}
              />

              <div className='space-y-1.5 rounded-md border border-dashed p-3'>
                {isLoadingVoucher ? (
                  <div className='flex items-center justify-between gap-3 font-mono'>
                    <Skeleton className='h-3 w-16' />
                    <Skeleton className='h-3 w-20' />
                  </div>
                ) : discountAmount > 0 ? (
                  <div className='flex items-center justify-between gap-3 font-mono'>
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <TicketPercentIcon className='size-3.5' />
                      <p>{t('packageBooking.bookPackage.discount')}</p>
                    </div>
                    <p className='text-sm font-semibold text-destructive'>
                      -{formatCurrency(discountAmount, mentorPackage.currency)}
                    </p>
                  </div>
                ) : null}

                <div className='flex items-center justify-between gap-3 font-mono'>
                  <p className='text-xs text-muted-foreground'>{t('packageBooking.bookPackage.total')}</p>
                  {isLoadingVoucher ? (
                    <Skeleton className='h-4 w-24' />
                  ) : (
                    <p className='text-sm font-extrabold'>{formatCurrency(totalAmount, mentorPackage.currency)}</p>
                  )}
                </div>
              </div>

              <Button
                className='w-full'
                disabled={isBookingPackage || (!!voucherCode && (!!voucherError || isLoadingVoucher))}
              >
                {isBookingPackage ? <Spinner /> : null}
                {t('packageBooking.bookPackage.proceed')}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
