import SanitizedHtml from '@/components/sanitized-html'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { PACKAGE_REQUEST_STATUS_THEME } from '@/features/package-bookings/constants'
import {
  PackageRequestStatus,
  PackageRequestStatusLabel,
  type PackageRequestDetail
} from '@/features/package-bookings/types'
import { formatDate, getAvatarFallback, getPlainTextFromHtml } from '@/shared/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2Icon, PackageCheckIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useGetIncomingRequest } from '../hooks/use-get-incoming-request'
import { useReviewRequest } from '../hooks/use-review-request'
import type { ReviewPackageFormValues } from '../validations'

interface IncomingRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId?: string
}

function LoadingState() {
  return (
    <div className='p-4 space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-6 w-1/2 rounded-md' />
        <Skeleton className='h-4 w-1/3 rounded-md' />
      </div>
      <Skeleton className='h-16 w-full rounded-md' />
      <Skeleton className='h-32 w-full rounded-md' />
      <Skeleton className='h-24 w-full rounded-md' />
    </div>
  )
}

interface IncomingRequestDialogContentProps {
  request: PackageRequestDetail
  noteValue: string
  isReviewingRequest: boolean
  onApprove: () => void
  onReject: () => void
}

function RequestInfoContent({
  request,
  noteValue,
  isReviewingRequest,
  onApprove,
  onReject
}: IncomingRequestDialogContentProps) {
  const { t } = useTranslation()

  const theme = PACKAGE_REQUEST_STATUS_THEME[request.status]
  const StatusIcon = theme.icon

  const fullName = `${request.requestedByFirstName} ${request.requestedByLastName}`
  const problemStatementText = getPlainTextFromHtml(request.problemStatement).trim()
  const isReviewable = request.status === PackageRequestStatus.Pending && !request.mentorResponseNote

  return (
    <>
      <VisuallyHidden>
        <DialogHeader>
          <DialogTitle>{request.mentorPackageName}</DialogTitle>
          <DialogDescription>{fullName}</DialogDescription>
        </DialogHeader>
      </VisuallyHidden>

      <div className='flex items-start justify-between gap-2 p-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='ring-2 ring-primary ring-offset-2'>
            <AvatarImage src={request.mentorPackageCoverImageUrl ?? undefined} />
            <AvatarFallback>{getAvatarFallback(fullName)}</AvatarFallback>
          </Avatar>

          <div className='-space-y-0.5'>
            <p className='text-sm font-medium'>{fullName}</p>
            <p className='text-xs text-muted-foreground'>
              {formatDistanceToNow(request.createdOnUtc, { addSuffix: true })}
            </p>
          </div>
        </div>

        <p
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${theme.className}`}
        >
          <StatusIcon className='size-3.5' />
          {t(PackageRequestStatusLabel[request.status])}
        </p>
      </div>

      {request.mentorResponseNote ? (
        <div className='flex items-start gap-2 bg-primary/10 px-4 py-2 mb-4'>
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-primary'>{t('packageBooking.requestInfo.yourResponse')}</p>
            <p className='text-sm text-primary/90 whitespace-pre-wrap'>{request.mentorResponseNote}</p>
          </div>
        </div>
      ) : null}

      <div className='flex-1 px-4 pb-4 space-y-4'>
        {problemStatementText ? (
          <div className='p-3 bg-muted rounded-lg border border-dashed'>
            <SanitizedHtml html={request.problemStatement} className='!prose-sm text-sm' />
          </div>
        ) : (
          <div className='text-center text-xs text-muted-foreground'>{t('common.ui.emptyValue')}</div>
        )}

        {request.reviewedOnUtc || request.consumedOnUtc ? (
          <div className='flex items-center gap-x-4 gap-y-1 text-xs'>
            {request.reviewedOnUtc && (
              <span className='flex items-center gap-1.5 text-primary font-medium'>
                <CheckCircle2Icon className='size-3.5' />
                {t('packageBooking.requestInfo.reviewedOn', { date: formatDate(request.reviewedOnUtc) })}
              </span>
            )}

            {request.consumedOnUtc && (
              <span className='flex items-center gap-1.5 text-primary font-medium'>
                <PackageCheckIcon className='size-3.5' />
                {t('packageBooking.requestInfo.consumedOn', { date: formatDate(request.consumedOnUtc) })}
              </span>
            )}
          </div>
        ) : null}
      </div>

      {isReviewable ? (
        <div className='px-4 pb-4 space-y-4'>
          <Controller
            name='mentorResponseNote'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    rows={3}
                    className='min-h-20 wrap-break-word'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('packageBooking.requestInfo.responsePlaceholder')}
                  />
                  <InputGroupAddon align='block-end'>
                    <InputGroupText className='tabular-nums text-xs'>
                      {noteValue.length}/255 {t('common.ui.characters')}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            )}
          />

          <div className='flex justify-end items-center gap-2'>
            <Button type='button' variant='ghost' onClick={onReject} disabled={isReviewingRequest}>
              {isReviewingRequest ? <Spinner /> : null}
              {t('packageBooking.requestInfo.reject')}
            </Button>

            <Button type='button' onClick={onApprove} disabled={isReviewingRequest}>
              {isReviewingRequest ? <Spinner /> : null}
              {t('packageBooking.requestInfo.approve')}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default function IncomingRequestDialog({ open, onOpenChange, requestId }: IncomingRequestDialogProps) {
  const { t } = useTranslation()
  const { request, isLoadingRequest } = useGetIncomingRequest({ requestId, enabled: open })
  const { methods, reviewRequest, isReviewingRequest } = useReviewRequest()

  const noteValue = methods.watch('mentorResponseNote') ?? ''

  useEffect(() => {
    if (!open || !requestId) {
      methods.reset({
        requestId: requestId ?? '',
        status: PackageRequestStatus.Approved,
        mentorResponseNote: null
      })
      return
    }

    if (request) {
      methods.reset({
        requestId: request.id,
        status: PackageRequestStatus.Approved,
        mentorResponseNote: request.mentorResponseNote
      })
    }
  }, [open, requestId, request, methods])

  const submitReview = (status: ReviewPackageFormValues['status']) => {
    if (!request) return

    methods.setValue('requestId', request.id, { shouldValidate: true })
    methods.setValue('status', status, { shouldValidate: true })

    methods.handleSubmit((body) => {
      reviewRequest(
        {
          body: {
            ...body,
            status,
            mentorResponseNote: body.mentorResponseNote?.trim() ? body.mentorResponseNote.trim() : null
          }
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          }
        }
      )
    })()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        position='top-center'
        className='min-w-3xl flex flex-col p-0 gap-0 border-none'
        showCloseButton={false}
      >
        {isLoadingRequest || !request ? (
          <>
            <VisuallyHidden>
              <DialogHeader>
                <DialogTitle>{t('transactions.column.viewDetails')}</DialogTitle>
                <DialogDescription>{t('common.ui.loading')}</DialogDescription>
              </DialogHeader>
            </VisuallyHidden>
            {isLoadingRequest ? (
              <LoadingState />
            ) : (
              <div className='p-6 text-center text-sm text-muted-foreground'>{t('common.ui.noDataAvailable')}</div>
            )}
          </>
        ) : (
          <FormProvider {...methods}>
            <RequestInfoContent
              request={request}
              noteValue={noteValue}
              isReviewingRequest={isReviewingRequest}
              onApprove={() => submitReview(PackageRequestStatus.Approved)}
              onReject={() => submitReview(PackageRequestStatus.Rejected)}
            />
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
