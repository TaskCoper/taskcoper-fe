import InfiniteSelect from '@/components/infinite-select'
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
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useGetMyProjectsInfinite } from '@/features/projects/hooks/use-get-my-projects-infinite'
import { cn } from '@/shared/utils'
import type { MentorPackage } from '@/types/mentor-package.type'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useBookPackage } from '../hooks/use-book-package'
import type { BookPackageFormValues } from '../validations'

const formatCurrency = (price: number, currency: MentorPackage['currency']) => {
  const currencyCode = currency === 'Usd' ? 'USD' : 'VND'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(price)
  } catch {
    return `${price.toLocaleString()} ${currency}`
  }
}

interface BookPackageDialogProps {
  children: React.ReactNode
  mentorPackage: MentorPackage
}

export default function BookPackageDialog({ children, mentorPackage }: BookPackageDialogProps) {
  const { t } = useTranslation()
  const { methods, bookPackage, isBookingPackage } = useBookPackage()

  const [open, setOpen] = useState(false)
  const [projectSearch, setProjectSearch] = useState('')

  const onClose = () => {
    setOpen(false)
    methods.reset()
  }

  const onSubmit: SubmitHandler<BookPackageFormValues> = (body) => {
    bookPackage({ body })
  }

  const {
    projects: leaderProjects,
    isLoading: isLoadingLeaderProjects,
    isFetchingNextPage: isFetchingNextLeaderProjects,
    hasNextPage: hasNextLeaderProjects,
    fetchNextPage: fetchNextLeaderProjects
  } = useGetMyProjectsInfinite({
    status: ['leader'],
    searchTerm: projectSearch,
    enabled: open
  })

  const projectOptions = useMemo(
    () => leaderProjects.map((project) => ({ value: project.id, label: project.name })),
    [leaderProjects]
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
      <DialogContent position='top-center' className='min-w-2xl' onInteractOutside={onClose} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('packageBooking.bookPackage.title')}</DialogTitle>
          <DialogDescription>{t('packageBooking.bookPackage.description')}</DialogDescription>
        </DialogHeader>

        <Card className='gap-2 p-4'>
          <div>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <p className='font-mono text-xs text-muted-foreground tracking-wide'>TASKCOPER • RECEIPT</p>
                <p className='mt-2 font-semibold leading-snug truncate'>{mentorPackage.name}</p>
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
              <p className='text-muted-foreground'>Sessions</p>
              <p className='font-semibold'>{mentorPackage.totalSessions}</p>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <p className='text-muted-foreground'>Duration / session</p>
              <p className='font-semibold'>{mentorPackage.durationInMinutes} min</p>
            </div>
          </div>

          <div className='my-3 border-t border-dashed border-border' />

          <div className='flex items-center justify-between gap-3 font-mono'>
            <p className='text-xs text-muted-foreground'>TOTAL</p>
            <p className='text-sm font-extrabold'>{formatCurrency(mentorPackage.price, mentorPackage.currency)}</p>
          </div>
        </Card>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <Controller
              control={methods.control}
              name='mentorPackageId'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name}>{t('meeting.form.projectLabel')}</FieldLabel>

                  <InfiniteSelect
                    value={field.value ?? ''}
                    options={projectOptions}
                    onChangeValue={(value) => {
                      field.onChange(value || null)
                    }}
                    placeholder={t('meeting.form.projectPlaceholder')}
                    searchPlaceholder={t('meeting.form.projectSearchPlaceholder')}
                    onSearch={setProjectSearch}
                    fetchNextPage={fetchNextLeaderProjects}
                    hasNextPage={hasNextLeaderProjects}
                    isFetchingNextPage={isFetchingNextLeaderProjects}
                    isLoading={isLoadingLeaderProjects}
                    aria-invalid={fieldState.invalid}
                    className={cn('w-full', fieldState.invalid && 'border-destructive focus-visible:ring-destructive')}
                  />
                </Field>
              )}
            />

            <Button className='w-full' disabled={isBookingPackage}>
              {isBookingPackage ? <Spinner /> : null}
              Quất liền!
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
