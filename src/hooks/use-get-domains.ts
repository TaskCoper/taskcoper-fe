import domainService from '@/services/domain.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { DomainEntity } from '@/types/domain.type'
import { useQuery } from '@tanstack/react-query'

export const useGetDomains = () => {
  const {
    data: domains = {
      ...getDefaultPaginationResponse<DomainEntity>()
    },
    isLoading: isLoadingDomains
  } = useQuery({
    queryKey: ['domains'],
    queryFn: domainService.getDomains
  })

  return { domains, isLoadingDomains }
}
