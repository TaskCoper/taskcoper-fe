import { queryKeys } from '@/lib/query-keys'
import feedbackService from '@/services/feedback.service'
import type { FeedbackTargetType } from '@/types/feedback.type'
import { useQuery } from '@tanstack/react-query'

export interface GetFeedbacksParams {
  targetType: FeedbackTargetType
  targetId?: string
}

export const useGetFeedbacks = ({ targetId, targetType }: GetFeedbacksParams) => {
  const { data: feedbacks, isLoading: isLoadingFeedbacks } = useQuery({
    queryKey: queryKeys.feedbacks.list({ targetId, targetType }),
    queryFn: () => feedbackService.getFeedbacks({ targetId, targetType }),
    enabled: !!targetId
  })

  return { feedbacks, isLoadingFeedbacks }
}
