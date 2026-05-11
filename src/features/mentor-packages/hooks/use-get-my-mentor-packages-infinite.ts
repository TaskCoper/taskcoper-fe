import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useInfiniteQuery } from '@tanstack/react-query'
import mentorPackageService from '../services'
import type { MentorPackage } from '../types'

export const useGetMyMentorPackagesInfinite = ({
  pageSize = DEFAULT_PAGE_SIZE,
  pageIndex = DEFAULT_PAGE_INDEX,
  enabled
}: {
  pageSize?: number
  pageIndex?: number
  enabled?: boolean
} = {}) => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.mentorPackages.listInfinite({ pageIndex, pageSize }),
    queryFn: ({ pageParam = pageIndex }) =>
      mentorPackageService.getMyMentorPackages({
        pageIndex: pageParam,
        pageSize
      }),
    initialPageParam: pageIndex,
    enabled,
    getNextPageParam: (lastPage) => {
      const { pageIndex, totalCount, pageSize: limit } = lastPage.value
      const totalPages = Math.ceil(totalCount / limit)
      return pageIndex < totalPages ? pageIndex + 1 : undefined
    }
  })

  const mentorPackages: MentorPackage[] = query.data?.pages.flatMap((p) => p.value.items) ?? []
  const totalCount = query.data?.pages[0]?.value.totalCount ?? 0

  return {
    mentorPackages,
    totalCount,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage
  }
}
