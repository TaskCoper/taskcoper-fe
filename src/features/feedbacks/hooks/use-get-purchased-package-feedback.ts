import { queryKeys } from '@/lib/query-keys'
import feedbackService from '@/services/feedback.service'
import { useQuery } from '@tanstack/react-query'

export const useGetPurchasedPackageFeedbacks = ({
  packageBookingId,
  enabled = true
}: {
  packageBookingId?: string
  enabled?: boolean
}) => {
  const { data: feedbacks, isLoading: isLoadingFeedbacks } = useQuery({
    queryKey: queryKeys.feedbacks.byPackage(packageBookingId),
    queryFn: () => feedbackService.getPurchasedPackageFeedbacks({ packageBookingId }),
    enabled: !!packageBookingId && enabled
  })

  return { feedbacks, isLoadingFeedbacks }
}
