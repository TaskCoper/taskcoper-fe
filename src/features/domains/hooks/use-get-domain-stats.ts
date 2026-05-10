import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import domainService from '../services'

export const useGetDomainStats = () => {
  const { data: domainStats = [], isLoading: isLoadingDomainStats } = useQuery({
    queryKey: queryKeys.domains.stats(),
    queryFn: () => domainService.getDomainStats()
  })

  return { domainStats, isLoadingDomainStats }
}
