import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import type { MentorPackage } from '@/types/mentor-package.type'
import { useInfiniteQuery } from '@tanstack/react-query'

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
