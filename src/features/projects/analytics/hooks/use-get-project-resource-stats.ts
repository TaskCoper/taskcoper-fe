import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'

export const useGetProjectResourceStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: projectResourceStats, isLoading: isLoadingProjectResourceStats } = useQuery({
    queryKey: queryKeys.projects.resourceStats(projectIdentifier),
    queryFn: () => projectAnalyticService.getProjectResourceStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectResourceStats, isLoadingProjectResourceStats }
}
