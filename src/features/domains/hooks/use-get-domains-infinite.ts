import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useInfiniteQuery } from '@tanstack/react-query'
import domainService from '../services'
import type { Domain } from '../types'

export interface GetDomainsInfiniteParams {
  searchTerm?: string
  pageSize?: number
  enabled?: boolean
}

export const useGetDomainsInfinite = ({
  searchTerm,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true
}: GetDomainsInfiniteParams = {}) => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.domains.listInfinite(searchTerm, pageSize),
    queryFn: ({ pageParam = DEFAULT_PAGE_INDEX }) =>
      domainService.getDomains({ searchTerm, pageIndex: pageParam, pageSize }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage) => {
      const { pageIndex, totalCount, pageSize: currentPageSize } = lastPage.value
      const totalPages = Math.ceil(totalCount / currentPageSize)
      return pageIndex < totalPages ? pageIndex + 1 : undefined
    },
    enabled
  })

  const domains: Domain[] = query.data?.pages.flatMap((p) => p.value.items) ?? []
  const totalCount = query.data?.pages[0]?.value.totalCount ?? 0

  return {
    domains,
    totalCount,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage
  }
}
