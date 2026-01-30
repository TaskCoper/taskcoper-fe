import { queryKeys } from '@/lib/query-keys'
import domainService from '@/services/domain.service'
import { useQuery } from '@tanstack/react-query'

export const useGetDomainStats = () => {
  const { data: domainStats = [], isLoading: isLoadingDomainStats } = useQuery({
    queryKey: queryKeys.domains.stats(),
    queryFn: () => domainService.getDomainStats()
  })

  return { domainStats, isLoadingDomainStats }
}
