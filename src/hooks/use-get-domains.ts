import { queryKeys } from '@/lib/query-keys'
import domainService from '@/services/domain.service'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { Domain } from '@/types/domain.type'
import { useQuery } from '@tanstack/react-query'

export interface GetDomainsParams {
  searchTerm?: string
  pageIndex?: number
  pageSize?: number
  enabled?: boolean
}

// TODO: use useInfiniteQuery
export const useGetDomains = ({
  searchTerm,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = 50,
  enabled = true
}: GetDomainsParams) => {
  const {
    data: domains = {
      ...getDefaultPaginationResponse<Domain>()
    },
    isLoading: isLoadingDomains
  } = useQuery({
    queryKey: queryKeys.domains.list(searchTerm, pageIndex, pageSize),
    queryFn: () => domainService.getDomains({ searchTerm, pageIndex, pageSize }),
    enabled
  })

  return { domains, isLoadingDomains }
}
