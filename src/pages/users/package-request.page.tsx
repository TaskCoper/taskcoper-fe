import SanitizedHtml from '@/components/sanitized-html'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import BookPackageDialog from '@/features/package-bookings/components/book-package-dialog'
import { PACKAGE_REQUEST_STATUS_THEME } from '@/features/package-bookings/constants'
import { useCancelRequest } from '@/features/package-bookings/hooks/use-cancel-request'
import { useGetOutgoingRequest } from '@/features/package-bookings/hooks/use-get-outgoing-request'
import { PackageRequestStatus, PackageRequestStatusLabel } from '@/features/package-bookings/types'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { cn, formatCurrency, getFirstParagraphTextFromHtml, getPlainTextFromHtml } from '@/shared/utils'
import { format } from 'date-fns'
import {
  ActivityIcon,
  BoxIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CoinsIcon,
  FolderOpenIcon,
  GraduationCapIcon,
  LayersIcon,
  PackageCheckIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

const PackageRequestSkeleton = () => (
  <div className='absolute inset-0 overflow-y-auto'>
    <div className='max-w-5xl mx-auto p-4 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8'>
      <div className='space-y-5 lg:col-span-8'>
        <Skeleton className='h-60 w-full rounded-xl' />

        <div className='space-y-3'>
          <Skeleton className='h-8 w-3/4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-11/12' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-5 w-40' />
          <div className='space-y-2 rounded-lg border border-dashed p-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-10/12' />
            <Skeleton className='h-4 w-8/12' />
          </div>
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-5 w-40' />
          <div className='space-y-2 rounded-md bg-muted/40 px-4 py-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-11/12' />
            <Skeleton className='h-4 w-9/12' />
          </div>
        </div>
      </div>

      <div className='space-y-8 lg:col-span-4'>
        <div className='space-y-3'>
          <Skeleton className='h-6 w-44' />
          <div className='space-y-2'>
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className='flex items-center justify-between gap-2'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-4 w-24' />
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-3'>
          <Skeleton className='h-6 w-44' />
          <div className='space-y-2'>
            {[1, 2, 3].map((row) => (
              <div key={row} className='flex items-center justify-between gap-2'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-4 w-24' />
              </div>
            ))}
          </div>

          <Skeleton className='h-10 w-full rounded-md' />
          <Skeleton className='h-10 w-full rounded-md' />
        </div>

        <div className='space-y-2.5'>
          <Skeleton className='h-4 w-24' />
          <div className='flex items-center gap-2'>
            <Skeleton className='size-9 rounded-full' />
            <div className='space-y-1'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-3 w-36' />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function PackageRequestPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const { outgoingRequest, isOutgoingRequestLoading } = useGetOutgoingRequest({ requestId })
  const { cancelRequest, isCancellingRequest } = useCancelRequest()

  const handleCancelRequest = async () => {
    if (!outgoingRequest?.id) return

    const ok = await confirm({
      title: t('packageBooking.requestDetail.cancelConfirmTitle'),
      description: t('packageBooking.requestDetail.cancelConfirmDescription'),
      confirmText: t('packageBooking.requestDetail.cancelConfirmText'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (!ok) return

    cancelRequest({ requestId: outgoingRequest.id })
  }

  if (isOutgoingRequestLoading) {
    return <PackageRequestSkeleton />
  }

  if (!outgoingRequest) {
    return (
      <div className='absolute inset-0 flex flex-col justify-center items-center gap-2'>
        <BoxIcon className='size-6 text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>{t('common.ui.noDataAvailable')}</p>
      </div>
    )
  }

  const mentorFullName = `${outgoingRequest.mentorFirstName} ${outgoingRequest.mentorLastName}`
  const StatusIcon = PACKAGE_REQUEST_STATUS_THEME[outgoingRequest.status].icon
  const statusClass = PACKAGE_REQUEST_STATUS_THEME[outgoingRequest.status].className
  const problemStatementText = getPlainTextFromHtml(outgoingRequest.problemStatement ?? '').trim()

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='max-w-5xl mx-auto space-y-10 p-4 pb-10 grid grid-cols-12 gap-6'>
        <div className='col-span-8 space-y-4'>
          <img
            src={outgoingRequest.mentorPackageCoverImageUrl ?? undefined}
            alt={outgoingRequest.mentorPackageName}
            className='w-full h-60 object-cover rounded-xl'
          />

          <div>
            <Link
              to={`/packages/${outgoingRequest.mentorPackageId}/book`}
              className='hover:underline hover:text-primary'
            >
              <p className='text-2xl font-bold'>{outgoingRequest.mentorPackageName}</p>
            </Link>
            <p className='text-muted-foreground text-sm'>
              {getFirstParagraphTextFromHtml(outgoingRequest.mentorPackageDescription)}
            </p>
          </div>

          <div className='space-y-2'>
            <p className='font-semibold'>{t('packageBooking.requestDetail.problemStatement')}</p>

            {problemStatementText ? (
              <div className='p-3 bg-muted rounded-lg border border-dashed'>
                <SanitizedHtml html={outgoingRequest.problemStatement} className='!prose-sm text-sm' />
              </div>
            ) : (
              <div className='flex flex-col justify-center items-center gap-2 p-8 bg-muted rounded-md'>
                <BoxIcon className='size-6 text-muted-foreground' />
                <p className='text-xs text-muted-foreground'>{t('packageBooking.requestDetail.noProblemStatement')}</p>
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <p className='font-semibold'>{t('packageBooking.requestDetail.mentorResponse')}</p>

            {outgoingRequest.mentorResponseNote ? (
              <div className='flex items-start gap-2 bg-primary/10 px-4 py-3 rounded-md'>
                <p className='text-sm text-primary whitespace-pre-wrap'>{outgoingRequest.mentorResponseNote}</p>
              </div>
            ) : (
              <div className='flex flex-col justify-center items-center gap-2 p-8 bg-muted rounded-md'>
                <BoxIcon className='size-6 text-muted-foreground' />
                <p className='text-xs text-muted-foreground'>{t('packageBooking.requestDetail.noResponseYet')}</p>
              </div>
            )}
          </div>
        </div>

        <div className='col-span-4 space-y-10'>
          <div className='space-y-3'>
            <p className='font-semibold'>{t('purchasedPackage.packageInformation')}</p>

            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <LayersIcon className='size-4' />
                  <p className='text-xs font-medium'>{t('packageBooking.requestDetail.sessions')}</p>
                </div>
                <p className='text-xs font-semibold'>{outgoingRequest.mentorPackageTotalSessions}</p>
              </div>

              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <CoinsIcon className='size-4' />
                  <p className='text-xs font-medium'>{t('packageBooking.requestDetail.price')}</p>
                </div>
                <p className='text-xs font-semibold'>
                  {formatCurrency(outgoingRequest.mentorPackagePrice, outgoingRequest.mentorPackageCurrency)}
                </p>
              </div>

              {outgoingRequest.projectName ? (
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

              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <GraduationCapIcon className='size-4' />
                  <p className='text-xs font-medium'>{t('packageBooking.requestDetail.mentor')}</p>
                </div>

                <Link to={`/users/${outgoingRequest.mentorId}`} className='hover:text-primary hover:underline'>
                  <p className='text-xs font-semibold'>{mentorFullName}</p>
                </Link>
              </div>

              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <CalendarDaysIcon className='size-4' />
                  <p className='text-xs font-medium'>{t('packageBooking.requestDetail.requestedOn')}</p>
                </div>

                <p className='text-xs font-semibold'>
                  {format(new Date(outgoingRequest.createdOnUtc), t('packageBooking.requestDetail.dateFormat'))}
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <p className='font-semibold'>{t('packageBooking.requestDetail.requestInformation')}</p>

            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <ActivityIcon className='size-4' />
                  <p className='text-xs font-medium'>{t('common.ui.status')}</p>
                </div>

                <p
                  className={cn(
                    'text-xs font-semibold px-1 py-0.5 flex items-center gap-1 border border-dashed rounded-md',
                    statusClass
                  )}
                >
                  <StatusIcon className='size-3.5' />
                  {t(PackageRequestStatusLabel[outgoingRequest.status])}
                </p>
              </div>

              {outgoingRequest.reviewedOnUtc ? (
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <CheckCircle2Icon className='size-4' />
                    <p className='text-xs font-medium'>{t('packageBooking.requestDetail.reviewedOn')}</p>
                  </div>
                  <p className='text-xs font-semibold'>
                    {format(new Date(outgoingRequest.reviewedOnUtc), t('packageBooking.requestDetail.dateFormat'))}
                  </p>
                </div>
              ) : null}

              {outgoingRequest.consumedOnUtc ? (
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <PackageCheckIcon className='size-4' />
                    <p className='text-xs font-medium'>{t('packageBooking.requestDetail.consumedOn')}</p>
                  </div>
                  <p className='text-xs font-semibold'>
                    {format(new Date(outgoingRequest.consumedOnUtc), t('packageBooking.requestDetail.dateFormat'))}
                  </p>
                </div>
              ) : null}
            </div>
            {outgoingRequest.status === PackageRequestStatus.Approved ? (
              <BookPackageDialog
                mentorPackage={{
                  id: outgoingRequest.mentorPackageId,
                  name: outgoingRequest.mentorPackageName,
                  price: outgoingRequest.mentorPackagePrice,
                  currency: outgoingRequest.mentorPackageCurrency
                }}
                projectId={outgoingRequest.bookedByProjectId}
              >
                <Button className='w-full'>{t('packageBooking.requestDetail.payNow')}</Button>
              </BookPackageDialog>
            ) : null}

            {outgoingRequest.status === PackageRequestStatus.Pending ? (
              <Button
                className='w-full'
                variant='destructive'
                onClick={handleCancelRequest}
                disabled={isCancellingRequest}
              >
                {t('packageBooking.requestDetail.cancelRequest')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
