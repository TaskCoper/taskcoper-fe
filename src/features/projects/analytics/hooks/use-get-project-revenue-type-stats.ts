import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'

export const useGetProjectRevenueTypeStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: revenueTypeStats = [], isLoading: isLoadingRevenueTypeStats } = useQuery({
    queryKey: queryKeys.projects.revenues.typeStats(projectIdentifier),
    queryFn: () => projectAnalyticService.getProjectRevenueTypeStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { revenueTypeStats, isLoadingRevenueTypeStats }
}
