import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectRevenueStats = ({ projectId }: { projectId?: string }) => {
  const { data: revenueStats, isLoading: isLoadingRevenueStats } = useQuery({
    queryKey: queryKeys.projectRevenues.stats(projectId),
    queryFn: () => projectService.getProjectRevenueStats({ projectId }),
    enabled: !!projectId
  })

  return { revenueStats, isLoadingRevenueStats }
}
