import SanitizedHtml from '@/components/sanitized-html'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { PACKAGE_REQUEST_STATUS_THEME } from '@/features/package-bookings/constants'
import { useGetIncomingRequest } from '@/features/package-bookings/hooks/use-get-incoming-request'
import { useGetOutgoingRequest } from '@/features/package-bookings/hooks/use-get-outgoing-request'
import { PackageRequestStatusLabel } from '@/features/package-bookings/types'
import { useDateFormat } from '@/lib/date'
import { cn, formatCurrency, getFirstParagraphTextFromHtml, getPlainTextFromHtml } from '@/shared/utils'
import {
  ActivityIcon,
  BoxIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CoinsIcon,
  FolderOpenIcon,
  GraduationCapIcon,
  LayersIcon,
  PackageCheckIcon,
  UserRoundIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

interface PurchaseRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  isMentorView: boolean
}

const RequestDialogSkeleton = () => (
  <div className='grid grid-cols-5 gap-6'>
    <div className='col-span-3 space-y-4'>
      <Skeleton className='w-full h-40 rounded-lg' />
      <div className='space-y-1.5'>
        <Skeleton className='h-3 w-full' />
        <Skeleton className='h-3 w-4/5' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-40' />
        <div className='p-3 border border-dashed rounded-lg space-y-1.5'>
          <Skeleton className='h-3 w-full' />
          <Skeleton className='h-3 w-5/6' />
          <Skeleton className='h-3 w-3/4' />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-36' />
        <div className='px-4 py-3 rounded-md bg-primary/10 space-y-1.5'>
          <Skeleton className='h-3 w-full' />
          <Skeleton className='h-3 w-2/3' />
        </div>
      </div>
    </div>
    <div className='col-span-2 space-y-3 pt-1'>
      <Skeleton className='h-4 w-24' />
      <div className='space-y-2'>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Skeleton className='size-4' />
              <Skeleton className='h-3 w-20' />
            </div>
            <Skeleton className='h-3 w-16' />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default function PurchaseRequestDialog({
  open,
  onOpenChange,
  requestId,
  isMentorView
}: PurchaseRequestDialogProps) {
  const { t } = useTranslation()
  const { formatDateTime } = useDateFormat()

  const { outgoingRequest, isOutgoingRequestLoading } = useGetOutgoingRequest({
    requestId: isMentorView ? undefined : requestId
  })
  const { request: incomingRequest, isLoadingRequest } = useGetIncomingRequest({
    requestId,
    enabled: isMentorView
  })

  const isLoading = isMentorView ? isLoadingRequest : isOutgoingRequestLoading
  const request = isMentorView ? incomingRequest : outgoingRequest

  const StatusIcon = request ? PACKAGE_REQUEST_STATUS_THEME[request.status].icon : null
  const statusClass = request ? PACKAGE_REQUEST_STATUS_THEME[request.status].className : ''
  const problemText = request ? getPlainTextFromHtml(request.problemStatement ?? '').trim() : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-5xl' position='top-center' showCloseButton={false}>
        {isLoading ? (
          <RequestDialogSkeleton />
        ) : !request ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('purchasedPackage.viewPurchaseRequest')}</DialogTitle>
            </DialogHeader>
            <div className='flex flex-col items-center gap-2 py-8'>
              <BoxIcon className='size-6 text-muted-foreground' />
              <p className='text-sm text-muted-foreground'>{t('common.ui.noDataAvailable')}</p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{request.mentorPackageName}</DialogTitle>
            </DialogHeader>

            <div className='grid grid-cols-5 gap-6'>
              <div className='col-span-3 space-y-4'>
                <img
                  src={request.mentorPackageCoverImageUrl ?? undefined}
                  alt={request.mentorPackageName}
                  className='w-full h-40 object-cover rounded-lg'
                />

                {request.mentorPackageDescription ? (
                  <p className='text-sm text-muted-foreground'>
                    {getFirstParagraphTextFromHtml(request.mentorPackageDescription)}
                  </p>
                ) : null}

                <div className='space-y-2'>
                  <p className='text-sm font-semibold'>{t('packageBooking.requestDetail.problemStatement')}</p>
                  {problemText ? (
                    <div className='p-3 bg-muted rounded-lg border border-dashed'>
                      <SanitizedHtml html={request.problemStatement} className='!prose-sm text-sm' />
                    </div>
                  ) : (
                    <div className='flex flex-col items-center gap-2 p-6 bg-muted rounded-md'>
                      <BoxIcon className='size-5 text-muted-foreground' />
                      <p className='text-xs text-muted-foreground'>
                        {t('packageBooking.requestDetail.noProblemStatement')}
                      </p>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-semibold'>{t('packageBooking.requestDetail.mentorResponse')}</p>
                  {request.mentorResponseNote ? (
                    <div className='bg-primary/10 px-4 py-3 rounded-md'>
                      <p className='text-sm text-primary whitespace-pre-wrap'>{request.mentorResponseNote}</p>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center gap-2 p-6 bg-muted rounded-md'>
                      <BoxIcon className='size-5 text-muted-foreground' />
                      <p className='text-xs text-muted-foreground'>{t('packageBooking.requestDetail.noResponseYet')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className='col-span-2 space-y-3 pt-1'>
                <p className='text-sm font-semibold'>{t('packageBooking.requestDetail.information')}</p>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <LayersIcon className='size-4' />
                      <p className='text-xs font-medium'>{t('packageBooking.requestDetail.sessions')}</p>
                    </div>
                    <p className='text-xs font-semibold'>{request.mentorPackageTotalSessions}</p>
                  </div>

                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <CoinsIcon className='size-4' />
                      <p className='text-xs font-medium'>{t('packageBooking.requestDetail.price')}</p>
                    </div>
                    <p className='text-xs font-semibold'>
                      {formatCurrency(request.mentorPackagePrice, request.mentorPackageCurrency)}
                    </p>
                  </div>

                  {!isMentorView && outgoingRequest?.projectName ? (
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <FolderOpenIcon className='size-4' />
                        <p className='text-xs font-medium'>{t('packageBooking.requestDetail.belongsToProject')}</p>
                      </div>
                      <Link
                        to={`/projects/${outgoingRequest.bookedByProjectId}/info`}
                        className='hover:text-primary hover:underline'
                      >
                        <p className='text-xs font-semibold'>{outgoingRequest.projectName}</p>
                      </Link>
                    </div>
                  ) : null}

                  {!isMentorView && outgoingRequest ? (
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <GraduationCapIcon className='size-4' />
                        <p className='text-xs font-medium'>{t('packageBooking.requestDetail.mentor')}</p>
                      </div>
                      <Link to={`/users/${outgoingRequest.mentorId}`} className='hover:text-primary hover:underline'>
                        <p className='text-xs font-semibold'>
                          {outgoingRequest.mentorFirstName} {outgoingRequest.mentorLastName}
                        </p>
                      </Link>
                    </div>
                  ) : null}

                  {isMentorView && incomingRequest ? (
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <UserRoundIcon className='size-4' />
                        <p className='text-xs font-medium'>{t('packageBooking.requestDetail.requester')}</p>
                      </div>
                      <Link
                        to={`/users/${incomingRequest.requestedByUserId}`}
                        className='hover:text-primary hover:underline'
                      >
                        <p className='text-xs font-semibold'>
                          {incomingRequest.requestedByFirstName} {incomingRequest.requestedByLastName}
                        </p>
                      </Link>
                    </div>
                  ) : null}

                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <CalendarDaysIcon className='size-4' />
                      <p className='text-xs font-medium'>{t('packageBooking.requestDetail.requestedOn')}</p>
                    </div>
                    <p className='text-xs font-semibold'>{formatDateTime(request.createdOnUtc, 'dateTimeMedium')}</p>
                  </div>

                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <ActivityIcon className='size-4' />
                      <p className='text-xs font-medium'>{t('common.ui.status')}</p>
                    </div>
                    {StatusIcon ? (
                      <p
                        className={cn(
                          'text-xs font-semibold px-1 py-0.5 flex items-center gap-1 border border-dashed rounded-md',
                          statusClass
                        )}
                      >
                        <StatusIcon className='size-3.5' />
                        {t(PackageRequestStatusLabel[request.status])}
                      </p>
                    ) : null}
                  </div>

                  {request.reviewedOnUtc ? (
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <CheckCircle2Icon className='size-4' />
                        <p className='text-xs font-medium'>{t('packageBooking.requestDetail.reviewedOn')}</p>
                      </div>
                      <p className='text-xs font-semibold'>{formatDateTime(request.reviewedOnUtc, 'dateTimeMedium')}</p>
                    </div>
                  ) : null}

                  {request.consumedOnUtc ? (
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <PackageCheckIcon className='size-4' />
                        <p className='text-xs font-medium'>{t('packageBooking.requestDetail.consumedOn')}</p>
                      </div>
                      <p className='text-xs font-semibold'>{formatDateTime(request.consumedOnUtc, 'dateTimeMedium')}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
