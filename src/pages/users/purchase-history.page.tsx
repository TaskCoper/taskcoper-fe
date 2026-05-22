import { Skeleton } from '@/components/ui/skeleton'
import PurchasedMentorPackageCard from '@/features/mentor-packages/components/purchased-mentor-package-card'
import { useGetPurchasedMentorPackages } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-packages'
import OutgoingRequestCard from '@/features/package-bookings/components/outgoing-request-card'
import { useGetMyOutgoingRequests } from '@/features/package-bookings/hooks/use-get-my-outgoing-requests'
import { PackageRequestStatus } from '@/features/package-bookings/types'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const responsiveColSpan = 'col-span-12 sm:col-span-6 md:col-span-4'

export default function PurchaseHistoryPage() {
  const { t } = useTranslation()
  const { purchasedMentorPackages, isLoadingPurchasedMentorPackages } = useGetPurchasedMentorPackages()
  const { myOutgoingRequests, isMyOutgoingRequestsLoading } = useGetMyOutgoingRequests({
    status: [PackageRequestStatus.Pending, PackageRequestStatus.Approved]
  })

  if (isLoadingPurchasedMentorPackages || isMyOutgoingRequestsLoading) {
    return (
      <div className='max-w-7xl w-full mx-auto p-4'>
        <div className='space-y-4'>
          <div>
            <Skeleton className='h-7 w-48 mb-2' />
            <Skeleton className='h-4 w-72' />
          </div>
          <div className='grid grid-cols-12 gap-8'>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className={`rounded-xl h-44 ${responsiveColSpan}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='max-w-7xl w-full mx-auto p-4 pb-20'>
        <div className='space-y-16'>
          <div className='space-y-4'>
            <div>
              <p className='text-xl font-bold'>{t('purchaseHistory.title')}</p>
              <p className='text-sm text-muted-foreground'>{t('purchaseHistory.description')}</p>
            </div>

            {purchasedMentorPackages.value.totalCount ? (
              <div className='grid grid-cols-12 gap-6'>
                {purchasedMentorPackages.value.items.map((pkg) => (
                  <div key={pkg.packageBookingId} className={responsiveColSpan}>
                    <Link to={`${pkg.packageBookingId}`}>
                      <PurchasedMentorPackageCard mentorPackage={pkg} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>{t('common.ui.noDataAvailable')}</p>
              </div>
            )}
          </div>

          <div className='space-y-4'>
            <div>
              <p className='text-xl font-bold'>{t('packageBooking.outgoingRequests.title')}</p>
              <p className='text-sm text-muted-foreground'>{t('packageBooking.outgoingRequests.description')}</p>
            </div>

            {myOutgoingRequests?.value.totalCount ? (
              <div className='grid grid-cols-12 gap-6'>
                {myOutgoingRequests.value.items.map((request) => (
                  <div key={request.id} className={responsiveColSpan}>
                    <Link to={`/requests/${request.id}`}>
                      <OutgoingRequestCard request={request} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>{t('common.ui.noDataAvailable')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
