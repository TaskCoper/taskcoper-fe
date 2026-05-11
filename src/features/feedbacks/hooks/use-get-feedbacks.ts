import type { Feedback } from '@/features/feedbacks/types'
import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import feedbackService from '../services'

export interface GetFeedbacksParams {
  targetType: string
  targetId?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: string
  searchTerm?: string
}

export const useGetFeedbacks = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  targetId,
  targetType,
  sortBy,
  searchTerm
}: GetFeedbacksParams) => {
  const { data: feedbacks = getDefaultPaginationResponse<Feedback>(), isLoading: isLoadingFeedbacks } = useQuery({
    queryKey: queryKeys.feedbacks.list({ targetId, targetType, pageIndex, pageSize, sortBy, searchTerm }),
    queryFn: () => feedbackService.getFeedbacks({ targetId, targetType, pageIndex, pageSize, sortBy, searchTerm }),
    enabled: !!targetId
  })

  return { feedbacks, isLoadingFeedbacks }
}
