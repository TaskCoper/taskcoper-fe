import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useInfiniteQuery } from '@tanstack/react-query'
import mentorService from '../services'
import type { Mentor } from '../types'
import type { GetMentorsParams } from './use-get-mentors'

export const useGetMentorsInfinite = ({
  pageSize = DEFAULT_PAGE_SIZE,
  pageIndex = DEFAULT_PAGE_INDEX,
  domainIds,
  searchTerm,
  rating,
  sortBy
}: GetMentorsParams = {}) => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.mentors.listInfinite({ pageIndex, pageSize, domainIds, searchTerm, rating, sortBy }),
    queryFn: ({ pageParam = pageIndex }) =>
      mentorService.getMentors({
        pageIndex: pageParam,
        pageSize,
        domainIds,
        searchTerm,
        rating,
        sortBy
      }),
    initialPageParam: pageIndex,
    getNextPageParam: (lastPage) => {
      const { pageIndex, totalCount } = lastPage.value
      const totalPages = Math.ceil(totalCount / pageSize)
      return pageIndex < totalPages ? pageIndex + 1 : undefined
    }
  })

  const mentors: Mentor[] = query.data?.pages.flatMap((p) => p.value.items) ?? []
  const totalCount = query.data?.pages[0]?.value.totalCount ?? 0

  return {
    mentors,
    totalCount,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage
  }
}
