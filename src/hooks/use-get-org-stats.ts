import { queryKeys } from '@/lib/query-keys'
import orgService from '@/services/org.service'
import { useQuery } from '@tanstack/react-query'

export const useGetOrgStats = () => {
  const { data: orgStats = [], isLoading: isLoadingOrgStats } = useQuery({
    queryKey: queryKeys.organizations.stats(),
    queryFn: () => orgService.getOrgStats()
  })

  return { orgStats, isLoadingOrgStats }
}
