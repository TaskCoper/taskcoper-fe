import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'

export const useGetProjectRevenueStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: revenueStats, isLoading: isLoadingRevenueStats } = useQuery({
    queryKey: queryKeys.projectRevenues.stats(projectIdentifier),
    queryFn: () => projectAnalyticService.getProjectRevenueStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { revenueStats, isLoadingRevenueStats }
}
