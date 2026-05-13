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
import { formatCurrency, getFirstParagraphTextFromHtml } from '@/shared/utils'
import { CalendarDaysIcon, Clock3Icon, Layers3Icon, TicketPercentIcon } from 'lucide-react'
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
      <DialogContent
        position='top-center'
        className='min-w-xl overflow-hidden p-0 sm:min-w-4xl border-none gap-0'
        onInteractOutside={onClose}
        showCloseButton={false}
      >
        <DialogHeader className='bg-primary p-6 text-left'>
          <DialogTitle className='text-xl text-background'>{t('packageBooking.bookPackage.title')}</DialogTitle>
          <DialogDescription className='text-background/90'>
            {getFirstParagraphTextFromHtml(mentorPackage.description) || t('packageBooking.bookPackage.description')}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 p-4 lg:grid-cols-5'>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4 lg:col-span-2'>
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
                      <span className='font-semibold text-destructive'>*</span>
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

              <Button
                className='w-full'
                disabled={isBookingPackage || (!!voucherCode && (!!voucherError || isLoadingVoucher))}
              >
                {isBookingPackage ? <Spinner /> : null}
                {t('packageBooking.bookPackage.proceed')}
              </Button>
            </form>
          </FormProvider>

          <Card className='gap-3 rounded-xl p-1 shadow-sm lg:col-span-3'>
            {mentorPackage.coverImageUrl ? (
              <img
                src={mentorPackage.coverImageUrl}
                alt={mentorPackage.name}
                className='h-40 w-full rounded-md object-cover'
              />
            ) : (
              <div className='h-40 rounded-md border border-dashed border-border bg-linear-to-br from-primary/20 via-primary/10 to-background' />
            )}

            <div className='space-y-4 px-3 pb-3'>
              <div className='space-y-1.5'>
                <p className='text-xs font-mono tracking-wide text-muted-foreground'>
                  {t('packageBooking.bookPackage.receipt')}
                </p>
                <p className='line-clamp-2 text-base font-semibold leading-snug'>{mentorPackage.name}</p>
                <p className='line-clamp-2 text-xs text-muted-foreground'>
                  {getFirstParagraphTextFromHtml(mentorPackage.description)}
                </p>
              </div>

              <div className='space-y-2 rounded-md border bg-muted/35 p-3'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Layers3Icon className='size-3.5' />
                    <p>{t('packageBooking.bookPackage.sessions')}</p>
                  </div>
                  <p className='text-xs font-semibold'>{mentorPackage.totalSessions}</p>
                </div>

                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Clock3Icon className='size-3.5' />
                    <p>{t('packageBooking.bookPackage.durationPerSession')}</p>
                  </div>
                  <p className='text-xs font-semibold'>
                    {mentorPackage.durationInMinutes} {t('packageBooking.bookPackage.min')}
                  </p>
                </div>

                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <CalendarDaysIcon className='size-3.5' />
                    <p>{t('mentorPackage.form.price')}</p>
                  </div>
                  <p className='text-sm font-bold text-primary'>
                    {formatCurrency(mentorPackage.price, mentorPackage.currency)}
                  </p>
                </div>
              </div>

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
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
