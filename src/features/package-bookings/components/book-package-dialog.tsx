import SingleSelectField from '@/components/single-select-field'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { useGetProjectsForPackage } from '@/features/projects/core/hooks/use-get-projects-for-package'
import { useGetVoucherByCode } from '@/features/vouchers/hooks/use-get-voucher-by-code'
import { DiscountType } from '@/features/vouchers/types'
import { formatCurrency } from '@/shared/utils'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useBookPackage } from '../hooks/use-book-package'
import type { BookPackageFormValues } from '../validations'

interface BookPackageDialogProps {
  children: React.ReactNode
  mentorPackage: MentorPackage
}

export default function BookPackageDialog({ children, mentorPackage }: BookPackageDialogProps) {
  const { t } = useTranslation()
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

  const { projects: bookableProjects, isLoadingProjects: isLoadingBookableProjects } = useGetProjectsForPackage(open)

  const projectOptions = useMemo(
    () => bookableProjects.value.items.map((project) => ({ value: project.id, label: project.name })),
    [bookableProjects.value.items]
  )

  useEffect(() => {
    const values = methods.getValues()

    methods.reset({
      ...values,
      mentorPackageId: mentorPackage.id
    })
  }, [mentorPackage, methods])

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
      <DialogContent position='top-center' className='min-w-xl' onInteractOutside={onClose} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('packageBooking.bookPackage.title')}</DialogTitle>
          <DialogDescription>{t('packageBooking.bookPackage.description')}</DialogDescription>
        </DialogHeader>

        <Card className='gap-2 p-4'>
          <div>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <p className='font-mono text-xs text-muted-foreground tracking-wide'>
                  {t('packageBooking.bookPackage.receipt')}
                </p>
                <p className='mt-2 font-semibold leading-snug line-clamp-1'>{mentorPackage.name}</p>
              </div>

              <div className='shrink-0 text-right'>
                <p className='font-mono text-xs text-muted-foreground'>{t('mentorPackage.form.price')}</p>
                <p className='text-lg text-primary font-extrabold'>
                  {formatCurrency(mentorPackage.price, mentorPackage.currency)}
                </p>
              </div>
            </div>

            <p className='text-xs text-muted-foreground mt-0.5 line-clamp-2'>{mentorPackage.description}</p>
          </div>

          <div className='my-3 border-t border-dashed border-border' />

          <div className='space-y-2 font-mono text-xs'>
            <div className='flex items-center justify-between gap-3'>
              <p className='text-muted-foreground'>{t('packageBooking.bookPackage.sessions')}</p>
              <p className='font-semibold'>{mentorPackage.totalSessions}</p>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <p className='text-muted-foreground'>{t('packageBooking.bookPackage.durationPerSession')}</p>
              <p className='font-semibold'>
                {mentorPackage.durationInMinutes} {t('packageBooking.bookPackage.min')}
              </p>
            </div>
          </div>

          <div className='my-3 border-t border-dashed border-border' />

          <div className='space-y-1.5'>
            {isLoadingVoucher ? (
              <div className='flex items-center justify-between gap-3 font-mono'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-3 w-20' />
              </div>
            ) : discountAmount > 0 ? (
              <div className='flex items-center justify-between gap-3 font-mono'>
                <p className='text-xs text-muted-foreground'>{t('packageBooking.bookPackage.discount')}</p>
                <p className='text-sm text-destructive font-semibold'>
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
        </Card>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <SingleSelectField
              control={methods.control}
              name='bookedByProjectId'
              label='meeting.form.projectLabel'
              options={projectOptions}
              placeholder='meeting.form.projectPlaceholder'
              searchPlaceholder='meeting.form.projectSearchPlaceholder'
              disabled={isLoadingBookableProjects}
            />

            <Controller
              name='voucherCode'
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name} className='gap-0.5'>
                    {t('packageBooking.bookPackage.voucherCode')}
                    <span className='text-destructive font-semibold'>*</span>
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
                      <p className='text-xs text-destructive font-medium'>{voucherError}</p>
                    )}
                    {!fieldState.invalid && !voucherError && isVoucherLow && (
                      <p className='text-xs text-primary font-medium tracking-tight'>
                        {t('packageBooking.bookPackage.voucherLowUsage')}
                      </p>
                    )}
                  </div>
                </Field>
              )}
            />

            <Button
              className='w-full'
              disabled={isBookingPackage || (!!voucherCode && (!!voucherError || isLoadingVoucher))}
            >
              {isBookingPackage ? <Spinner /> : null}
              {t('packageBooking.bookPackage.proceed')}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
