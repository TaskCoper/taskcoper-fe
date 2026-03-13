import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRevenueTypeStats = ({ projectId }: { projectId?: string }) => {
  const { data: revenueTypeStats = [], isLoading: isLoadingRevenueTypeStats } = useQuery({
    queryKey: queryKeys.projectRevenues.typeStats(projectId),
    queryFn: () => projectService.getProjectRevenueTypeStats({ projectId }),
    enabled: !!projectId
  })

  return { revenueTypeStats, isLoadingRevenueTypeStats }
}
