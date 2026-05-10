import { useInfiniteQuery } from '@tanstack/react-query'
import domainService from '../services'
import type { Domain } from '../types'

export interface GetDomainsInfiniteParams {
  searchTerm?: string
  pageSize?: number
  enabled?: boolean
}

export const useGetDomainsInfinite = ({ searchTerm, pageSize = 20, enabled = true }: GetDomainsInfiniteParams = {}) => {
  const query = useInfiniteQuery({
    queryKey: ['domains-infinite', searchTerm, pageSize] as const,
    queryFn: ({ pageParam }) => domainService.getDomains({ searchTerm, pageIndex: pageParam as number, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pageIndex, totalCount } = lastPage.value
      const totalPages = Math.ceil(totalCount / pageSize)
      return pageIndex < totalPages ? pageIndex + 1 : undefined
    },
    enabled
  })

  const domains: Domain[] = query.data?.pages.flatMap((p) => p.value.items) ?? []

  return {
    domains,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage
  }
}
