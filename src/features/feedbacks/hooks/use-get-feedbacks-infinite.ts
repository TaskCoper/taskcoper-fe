import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useInfiniteQuery } from '@tanstack/react-query'
import feedbackService from '../services'
import type { Feedback } from '../types'
import type { GetFeedbacksParams } from './use-get-feedbacks'

type GetFeedbacksInfiniteParams = Omit<GetFeedbacksParams, 'pageIndex'> & {
  enabled?: boolean
}

export const useGetFeedbacksInfinite = ({
  pageSize = DEFAULT_PAGE_SIZE,
  targetId,
  targetType,
  sortBy,
  searchTerm,
  enabled = true
}: GetFeedbacksInfiniteParams) => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.feedbacks.listInfinite({ targetId, targetType, pageSize, sortBy, searchTerm }),
    queryFn: ({ pageParam = DEFAULT_PAGE_INDEX }) =>
      feedbackService.getFeedbacks({
        targetId,
        targetType,
        pageIndex: pageParam,
        pageSize,
        sortBy,
        searchTerm
      }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage) => {
      const { pageIndex, totalCount, pageSize: currentPageSize } = lastPage.value
      const totalPages = Math.ceil(totalCount / currentPageSize)
      return pageIndex < totalPages ? pageIndex + 1 : undefined
    },
    enabled: !!targetId && enabled
  })

  const feedbacks: Feedback[] = query.data?.pages.flatMap((p) => p.value.items) ?? []
  const totalCount = query.data?.pages[0]?.value.totalCount ?? 0

  return {
    feedbacks,
    totalCount,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage
  }
}
